import { footballSnapshotError, selectSeasonMatches } from "../lib/football-snapshot.mjs";

// Update policy, separate from the structural contract. Throw before any write.
export function assertSafeFootballUpdate(next, previous = null) {
  const error = footballSnapshotError(next);
  if (error) throw new Error(`Football update rejected: ${error}`);
  const reject = (reason) => { throw new Error(`Football update rejected: ${reason}`); };
  if (!Array.isArray(next.matches)) reject("updater must provide matches[]");
  const ids = new Set();
  for (const match of next.matches) {
    if (ids.has(match.id)) reject(`duplicate match ID ${match.id}`);
    ids.add(match.id);
  }
  if (!next.standings.some((row) => row.team.id === 64)) reject("Liverpool is missing from standings");
  if (new Set(next.standings.map((row) => row.team.id)).size !== next.standings.length) {
    reject("duplicate team IDs in standings");
  }
  const current = selectSeasonMatches({ ...next, lastResult: null, nextFixture: null });
  if (current.length > 38) reject(`expected at most 38 Liverpool PL fixtures, received ${current.length}`);
  for (const key of ["lastResult", "nextFixture"]) {
    const match = next[key];
    if (match && !current.some((item) => item.id === match.id
      && item.utcDate === match.utcDate && item.status === match.status
      && item.homeTeam.id === match.homeTeam.id && item.awayTeam.id === match.awayTeam.id
      && item.score.home === match.score.home && item.score.away === match.score.away)) {
      reject(`${key} does not match a current-season Liverpool PL fixture`);
    }
  }
  if (next.matches.length > 0 && current.length === 0) reject("Liverpool current-season PL fixtures are missing");
  if (footballSnapshotError(previous) === null) {
    if (next.competition.season < previous.competition.season) reject("season moved backwards");
    if (Date.parse(next.lastUpdated) < Date.parse(previous.lastUpdated)) reject("lastUpdated moved backwards");
    if (next.competition.season === previous.competition.season) {
      const oldCount = selectSeasonMatches(previous).length;
      if (oldCount > 0 && current.length === 0) reject(`current-season fixtures disappeared (${oldCount} → 0)`);
      if (oldCount === 38 && current.length < 38) reject(`complete season shrank (38 → ${current.length})`);
    }
  }
}
