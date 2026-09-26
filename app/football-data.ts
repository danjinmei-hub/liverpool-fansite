import fallbackSnapshot from "../public/data/football.json";
import { footballSnapshotError, selectSeasonMatches } from "../lib/football-snapshot.mjs";

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

export function isFootballSnapshot(value: unknown): value is FootballSnapshot {
  return footballSnapshotError(value) === null;
}

// Fail the build for a broken committed fallback; remote failures keep this valid copy.
const fallbackError = footballSnapshotError(fallbackSnapshot);
if (fallbackError) throw new Error(`Invalid committed football snapshot: ${fallbackError}`);
export const fallbackFootballSnapshot = fallbackSnapshot as FootballSnapshot;

export function getSeasonMatches(snapshot: FootballSnapshot): FootballMatch[] {
  return selectSeasonMatches(snapshot);
}
