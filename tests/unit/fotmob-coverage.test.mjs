import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { auditFotmobLinks, formatFotmobAudit, fotmobAuditExitCode } from "../../scripts/audit-fotmob-links.mjs";
import { isCanonicalFotmobUrl } from "../../lib/fotmob-url.mjs";
import { makeSnapshot } from "../fixtures/football-snapshot.mjs";

const verified = (match) => ({
  fotmobUrl: "https://www.fotmob.com/matches/liverpool-vs-arsenal/test-pair",
  matchLabel: "Liverpool vs Arsenal", matchDate: match.utcDate.slice(0, 10),
  homeTeamId: match.homeTeam.id, awayTeamId: match.awayTeam.id,
  verificationSource: "https://www.fotmob.com/matches/liverpool-vs-arsenal/test-pair",
  verifiedAt: "2026-09-26",
}); // Synthetic URL for offline tests only; never published as a mapping.

test("counts only verified current-season links, ignoring snapshot fotmobUrl", (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("Audit must remain offline"); });
  const snapshot = makeSnapshot();
  snapshot.nextFixture.fotmobUrl = "https://www.fotmob.com/matches/not-editorially-verified/test";
  const report = auditFotmobLinks(snapshot, { 101: verified(snapshot.lastResult) });
  assert.equal(report.totalMatches, 2);
  assert.equal(report.verifiedMappings, 1);
  assert.equal(report.finishedCovered, 1);
  assert.equal(report.unmappedUpcoming, 1);
  assert.deepEqual(report.issues, []);
  assert.deepEqual(report.missingFinished, []);
});

test("missing finished links produce a named warning report but success exit code", () => {
  const report = auditFotmobLinks(makeSnapshot(), {});
  assert.equal(report.finishedCovered, 0);
  assert.equal(report.missingFinished[0].id, 101);
  assert.equal(fotmobAuditExitCode(report), 0);
  assert.match(formatFotmobAudit(report), /101 · 2026-08-15 UTC · Liverpool vs Arsenal/);
});

test("start, end and awarded matches have correct missing-link semantics", () => {
  assert.equal(auditFotmobLinks(makeSnapshot("start"), {}).missingFinished.length, 0);
  assert.equal(auditFotmobLinks(makeSnapshot("end"), {}).missingFinished.length, 1);
  const snapshot = makeSnapshot(); snapshot.lastResult.status = "AWARDED";
  assert.equal(auditFotmobLinks(snapshot, {}).missingFinished.length, 1);
});

for (const [label, mutate, kind] of [
  ["unofficial URL", (m) => { m.fotmobUrl = "https://example.com/matches/liverpool/test"; }, "invalid_mapping"],
  ["missing verification", (m) => { delete m.verifiedAt; }, "invalid_mapping"],
  ["team overview as evidence", (m) => { m.verificationSource = "https://www.fotmob.com/teams/8650/overview/liverpool"; }, "invalid_mapping"],
  ["invalid calendar date", (m) => { m.matchDate = "2026-02-30"; }, "invalid_mapping"],
  ["wrong date", (m) => { m.matchDate = "2026-08-16"; }, "date_mismatch"],
  ["swapped home/away", (m) => { [m.homeTeamId, m.awayTeamId] = [m.awayTeamId, m.homeTeamId]; }, "team_mismatch"],
  ["wrong opponent", (m) => { m.awayTeamId = 63; }, "team_mismatch"],
]) {
  test(`detects ${label} and does not count it as covered`, () => {
    const snapshot = makeSnapshot(); const entry = verified(snapshot.lastResult); mutate(entry);
    const report = auditFotmobLinks(snapshot, { 101: entry });
    assert.ok(report.issues.some((issue) => issue.kind === kind));
    assert.equal(report.verifiedMappings, 0);
    assert.equal(report.missingFinished.length, 1);
    assert.equal(fotmobAuditExitCode(report), 1);
  });
}

test("orphan mappings include absent IDs and matches outside the archive scope", () => {
  const snapshot = makeSnapshot();
  snapshot.matches.push({ ...structuredClone(snapshot.lastResult), id: 103, competition: { code: "CL", name: "Champions League" } });
  const report = auditFotmobLinks(snapshot, { 103: verified(snapshot.matches[2]) });
  assert.equal(report.totalMatches, 2);
  assert.equal(report.issues[0].kind, "orphan_mapping");
  const absent = auditFotmobLinks(snapshot, { 999: verified(snapshot.lastResult) });
  assert.equal(absent.issues[0].kind, "orphan_mapping");
});

test("duplicate destinations are rejected for both fixtures", () => {
  const snapshot = makeSnapshot();
  const report = auditFotmobLinks(snapshot, { 101: verified(snapshot.lastResult), 102: verified(snapshot.nextFixture) });
  assert.equal(report.verifiedMappings, 0);
  assert.equal(report.issues.filter((issue) => issue.kind === "invalid_mapping").length, 2);
});

test("UTC date avoids the midnight Beijing-time mismatch", () => {
  const snapshot = makeSnapshot(); snapshot.lastResult.utcDate = "2026-08-15T19:00:00Z";
  const report = auditFotmobLinks(snapshot, { 101: verified(snapshot.lastResult) });
  assert.equal(report.issues.length, 0);
});

test("malformed mapping containers and keys are reported; corrupt snapshots stop auditing", () => {
  const snapshot = makeSnapshot();
  for (const mappings of [null, [], { 101: null }, { "0101": verified(snapshot.lastResult) }]) {
    assert.equal(auditFotmobLinks(snapshot, mappings).issues[0].kind, "invalid_mapping");
  }
  assert.throws(() => auditFotmobLinks({}, {}), /Cannot audit FotMob coverage/);
});

test("the shared URL policy preserves canonical Web-only syntax", () => {
  assert.equal(isCanonicalFotmobUrl(verified(makeSnapshot().lastResult).fotmobUrl), true);
  for (const url of [null, "fotmob://matches/123", "https://www.fotmob.com/", "https://www.fotmob.com/teams/8650",
    "http://www.fotmob.com/matches/a/b", "https://www.fotmob.com.evil.test/matches/a/b",
    "https://user@www.fotmob.com/matches/a/b", "https://www.fotmob.com/matches/a/b#123",
    "https://www.fotmob.com/matches/a/b?x=1"]) assert.equal(isCanonicalFotmobUrl(url), false);
});

test("repository mappings remain consistent; missing coverage is not a test failure", async () => {
  const snapshot = JSON.parse(await readFile(new URL("../../public/data/football.json", import.meta.url), "utf8"));
  const mappings = JSON.parse(await readFile(new URL("../../data/football-match-links.json", import.meta.url), "utf8"));
  const report = auditFotmobLinks(snapshot, mappings);
  assert.deepEqual(report.issues, []);
  assert.equal(fotmobAuditExitCode(report), 0);
});
