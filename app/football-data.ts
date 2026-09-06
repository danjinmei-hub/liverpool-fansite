import fallbackSnapshot from "../public/data/football.json";

export const LIVERPOOL_TEAM_ID = 64;

export type FootballTeam = {
  id: number;
  name: string;
  shortName: string;
  tla: string;
};

export type FootballMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  venue: string | null;
  fotmobUrl: string | null;
  competition?: {
    code: string | null;
    name: string;
  };
  stage?: string | null;
  homeTeam: FootballTeam;
  awayTeam: FootballTeam;
  score: {
    home: number | null;
    away: number | null;
  };
};

export type StandingRow = {
  position: number | null;
  team: FootballTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

export type FootballSnapshot = {
  schemaVersion: 1;
  lastUpdated: string;
  competition: {
    code: "PL";
    name: string;
    season: number;
    currentMatchday: number | null;
  };
  source: {
    name: "football-data.org";
    url: string;
    mode: "api" | "fallback";
  };
  lastResult: FootballMatch | null;
  nextFixture: FootballMatch | null;
  matches?: FootballMatch[];
  standings: StandingRow[];
};

export const fallbackFootballSnapshot = fallbackSnapshot as FootballSnapshot;

export function isFootballSnapshot(value: unknown): value is FootballSnapshot {
  if (!value || typeof value !== "object") return false;

  const snapshot = value as Partial<FootballSnapshot>;
  return (
    snapshot.schemaVersion === 1 &&
    typeof snapshot.lastUpdated === "string" &&
    snapshot.competition?.code === "PL" &&
    snapshot.source?.name === "football-data.org" &&
    (snapshot.matches === undefined || Array.isArray(snapshot.matches)) &&
    Array.isArray(snapshot.standings)
  );
}

export function getSeasonMatches(snapshot: FootballSnapshot) {
  const matches = snapshot.matches?.length
    ? snapshot.matches
    : [snapshot.lastResult, snapshot.nextFixture].filter(
        (match): match is FootballMatch => match !== null,
      );

  return [...new Map(matches.map((match) => [match.id, match])).values()].sort(
    (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime(),
  );
}
