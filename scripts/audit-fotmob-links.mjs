import { appendFile, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { footballSnapshotError, selectSeasonMatches } from "../lib/football-snapshot.mjs";
import { isCanonicalFotmobUrl } from "../lib/fotmob-url.mjs";

const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value) => typeof value === "string" && value.trim().length > 0;
const id = (value) => Number.isSafeInteger(value) && value > 0;
const day = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

// Offline consistency only: the official page must still be checked by an editor.
export function auditFotmobLinks(snapshot, mappings) {
  const error = footballSnapshotError(snapshot);
  if (error) throw new Error(`Cannot audit FotMob coverage: ${error}`);
  const matches = selectSeasonMatches(snapshot);
  const byId = new Map(matches.map((match) => [String(match.id), match]));
  const entries = object(mappings) ? Object.entries(mappings) : [];
  const issues = [];
  const rejected = new Set();
  const targets = new Map();
  const add = (kind, matchId, detail) => {
    issues.push({ kind, matchId, detail }); rejected.add(matchId);
  };
  if (!object(mappings)) add("invalid_mapping", "mapping", "Expected a JSON object keyed by football-data match ID");
  for (const [key, entry] of entries) {
    if (!/^[1-9]\d*$/.test(key) || !id(Number(key)) || !object(entry)
      || !isCanonicalFotmobUrl(entry.fotmobUrl) || !text(entry.matchLabel)
      || !day(entry.matchDate) || !day(entry.verifiedAt)
      || !id(entry.homeTeamId) || !id(entry.awayTeamId)
      || entry.homeTeamId === entry.awayTeamId
      || entry.verificationSource !== entry.fotmobUrl) {
      add("invalid_mapping", key, "Invalid URL, identity, UTC date or official match-page verification record");
      continue;
    }
    const target = new URL(entry.fotmobUrl).href;
    if (targets.has(target)) {
      const other = targets.get(target);
      add("invalid_mapping", key, `Same FotMob destination is assigned to ${other}`);
      if (!rejected.has(other)) add("invalid_mapping", other, `Same FotMob destination is assigned to ${key}`);
    } else targets.set(target, key);
    const match = byId.get(key);
    if (!match) {
      add("orphan_mapping", key, "No corresponding current-season Liverpool PL match in the snapshot");
      continue;
    }
    const actualDate = new Date(match.utcDate).toISOString().slice(0, 10);
    if (entry.matchDate !== actualDate) {
      add("date_mismatch", key, `Verified ${entry.matchDate}; snapshot ${actualDate} (UTC)`);
    }
    if (entry.homeTeamId !== match.homeTeam.id || entry.awayTeamId !== match.awayTeam.id) {
      add("team_mismatch", key, `Verified home/away ${entry.homeTeamId}/${entry.awayTeamId}; snapshot ${match.homeTeam.id}/${match.awayTeam.id}`);
    }
  }
  const covered = new Set(entries.filter(([key]) => byId.has(key) && !rejected.has(key)).map(([key]) => key));
  const finished = matches.filter((match) => match.status === "FINISHED" || match.status === "AWARDED");
  const missingFinished = finished.filter((match) => !covered.has(String(match.id)))
    .map((match) => ({ id: match.id, date: new Date(match.utcDate).toISOString().slice(0, 10),
      label: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}` }));
  return { season: snapshot.competition.season, lastUpdated: snapshot.lastUpdated,
    totalMatches: matches.length, mappingEntries: entries.length, verifiedMappings: covered.size,
    finishedMatches: finished.length, finishedCovered: finished.length - missingFinished.length,
    unmappedUpcoming: matches.filter((match) => !finished.includes(match) && !covered.has(String(match.id))).length,
    issues, missingFinished };
}

export function formatFotmobAudit(report) {
  const lines = ["## FotMob Match Link Coverage", "",
    `Season: ${report.season}/${String(report.season + 1).slice(-2)} · Snapshot: ${report.lastUpdated}`,
    `Liverpool PL: ${report.totalMatches} · Verified mappings: ${report.verifiedMappings}/${report.totalMatches}`,
    `Finished coverage: ${report.finishedCovered}/${report.finishedMatches} · Unmapped future/other: ${report.unmappedUpcoming}`,
    "", `Mapping issues: ${report.issues.length}`];
  for (const issue of report.issues) lines.push(`- ${issue.kind} · ${issue.matchId}: ${issue.detail}`);
  lines.push("", `Finished matches missing a verified link: ${report.missingFinished.length}`);
  for (const match of report.missingFinished) lines.push(`- ${match.id} · ${match.date} UTC · ${match.label}`);
  lines.push("", "Offline consistency check, not a live FotMob page check. Missing links warn only; no URL is generated.");
  return lines.join("\n") + "\n";
}

// Malformed or mismatched mappings fail; absence alone must never block a release.
export function fotmobAuditExitCode(report) { return report.issues.length ? 1 : 0; }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const snapshot = JSON.parse(await readFile(new URL("../public/data/football.json", import.meta.url), "utf8"));
  const mappings = JSON.parse(await readFile(new URL("../data/football-match-links.json", import.meta.url), "utf8"));
  const report = auditFotmobLinks(snapshot, mappings);
  const summary = formatFotmobAudit(report);
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  if (process.env.GITHUB_ACTIONS === "true") {
    const escape = (value) => String(value).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
    for (const issue of report.issues) console.log(`::error title=FotMob mapping audit::${escape(`${issue.kind} ${issue.matchId}: ${issue.detail}`)}`);
    for (const match of report.missingFinished) console.log(`::warning title=Finished match missing FotMob link::${escape(`${match.id} ${match.date} UTC ${match.label}`)}`);
  }
  process.exitCode = fotmobAuditExitCode(report);
}
