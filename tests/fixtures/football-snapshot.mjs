export function makeMatch(id = 101, status = "FINISHED") {
  return {
    id, utcDate: "2026-08-15T14:00:00Z", status, matchday: 1,
    venue: null, fotmobUrl: null, competition: { code: "PL", name: "Premier League" }, stage: null,
    homeTeam: { id: 64, name: "Liverpool", shortName: "Liverpool", tla: "LIV" },
    awayTeam: { id: 57, name: "Arsenal", shortName: "Arsenal", tla: "ARS" },
    score: { home: status === "FINISHED" ? 2 : null, away: status === "FINISHED" ? 1 : null },
  };
}

export function makeSnapshot(phase = "normal") {
  const lastResult = makeMatch();
  const nextFixture = { ...makeMatch(102, "TIMED"), utcDate: "2026-10-03T14:00:00Z", matchday: 2 };
  return {
    schemaVersion: 1, lastUpdated: "2026-09-26T04:00:00.000Z",
    competition: { code: "PL", name: "Premier League", season: 2026, currentMatchday: 2 },
    source: { name: "football-data.org", url: "https://www.football-data.org/", mode: "api" },
    lastResult: phase === "start" ? null : lastResult,
    nextFixture: phase === "end" ? null : nextFixture,
    matches: phase === "start" ? [nextFixture] : phase === "end" ? [lastResult] : [lastResult, nextFixture],
    standings: [{
      position: 1, team: lastResult.homeTeam, playedGames: phase === "start" ? 0 : 1,
      won: phase === "start" ? 0 : 1, draw: 0, lost: 0, points: phase === "start" ? 0 : 3,
      goalsFor: phase === "start" ? 0 : 2, goalsAgainst: phase === "start" ? 0 : 1,
      goalDifference: phase === "start" ? 0 : 1,
    }],
  };
}
