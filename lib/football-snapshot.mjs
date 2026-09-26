// Runtime contract shared by Node, Next and Vinext. No I/O or framework imports.
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value) => typeof value === "string" && value.trim().length > 0;
const integer = (value) => Number.isSafeInteger(value);
const nonnegative = (value) => integer(value) && value >= 0;
const positive = (value) => integer(value) && value > 0;
const nullable = (check) => (value) => value === null || check(value);

function timestamp(value) {
  if (typeof value !== "string") return false;
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!parts || !Number.isFinite(Date.parse(value))) return false;
  const [, year, month, day, hour, minute, second] = parts.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day && hour < 24 && minute < 60 && second < 60;
}

function httpUrl(value) {
  if (!text(value)) return false;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}

function fields(value, path, checks) {
  if (!object(value)) return `${path}: expected an object`;
  for (const [key, check] of Object.entries(checks)) {
    if (!check(value[key])) return `${path}.${key}: invalid or missing value`;
  }
  return null;
}

function teamError(value, path) {
  return fields(value, path, { id: positive, name: text, shortName: text, tla: text });
}

function matchError(value, path) {
  const error = fields(value, path, {
    id: positive, utcDate: timestamp, status: text,
    matchday: nullable(positive), venue: nullable(text), fotmobUrl: nullable(text),
  });
  if (error) return error;
  if (value.competition !== undefined) {
    const competitionError = fields(value.competition, `${path}.competition`, { code: nullable(text), name: text });
    if (competitionError) return competitionError;
  }
  if (value.stage !== undefined && !nullable(text)(value.stage)) return `${path}.stage: invalid value`;
  return teamError(value.homeTeam, `${path}.homeTeam`)
    ?? teamError(value.awayTeam, `${path}.awayTeam`)
    ?? fields(value.score, `${path}.score`, { home: nullable(nonnegative), away: nullable(nonnegative) });
}

/** First actionable error, or null. Empty lifecycle states are structurally valid. */
export function footballSnapshotError(value) {
  const error = fields(value, "snapshot", {
    schemaVersion: (version) => version === 1,
    lastUpdated: timestamp,
  });
  if (error) return error;
  const competitionError = fields(value.competition, "competition", {
    code: (code) => code === "PL", name: text,
    season: (year) => integer(year) && year >= 1900 && year <= 9998,
    currentMatchday: nullable(positive),
  });
  if (competitionError) return competitionError;
  const sourceError = fields(value.source, "source", {
    name: (name) => name === "football-data.org", url: httpUrl,
    mode: (mode) => mode === "api" || mode === "fallback",
  });
  if (sourceError) return sourceError;
  for (const key of ["lastResult", "nextFixture"]) {
    if (value[key] !== null) {
      const error = matchError(value[key], key);
      if (error) return error;
    }
  }
  // Keep compatibility with snapshots from before Match Archive existed.
  if (value.matches !== undefined) {
    if (!Array.isArray(value.matches)) return "matches: expected an array";
    for (const [index, match] of value.matches.entries()) {
      const error = matchError(match, `matches[${index}]`);
      if (error) return error;
    }
  }
  if (!Array.isArray(value.standings)) return "standings: expected an array";
  for (const [index, row] of value.standings.entries()) {
    const path = `standings[${index}]`;
    const error = fields(row, path, {
      position: nullable(positive), playedGames: nonnegative,
      won: nonnegative, draw: nonnegative, lost: nonnegative, points: integer,
      goalsFor: nonnegative, goalsAgainst: nonnegative, goalDifference: integer,
    });
    if (error) return error;
    const team = teamError(row.team, `${path}.team`);
    if (team) return team;
  }
  return null;
}

/** @param {import('../app/football-data').FootballSnapshot} snapshot */
export function selectSeasonMatches(snapshot) {
  const matches = snapshot.matches?.length ? snapshot.matches
    : [snapshot.lastResult, snapshot.nextFixture].filter((match) => match !== null);
  const start = Date.UTC(snapshot.competition.season, 6, 1);
  const end = Date.UTC(snapshot.competition.season + 1, 6, 1);
  const selected = matches.filter((match) => {
    const date = Date.parse(match.utcDate);
    return match.competition?.code === "PL"
      && (match.homeTeam.id === 64 || match.awayTeam.id === 64)
      && date >= start && date < end;
  });
  return [...new Map(selected.map((match) => [match.id, match])).values()]
    .sort((a, b) => Date.parse(a.utcDate) - Date.parse(b.utcDate));
}
