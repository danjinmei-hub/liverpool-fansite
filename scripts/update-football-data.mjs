import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const API_BASE = "https://api.football-data.org/v4";
const LIVERPOOL_TEAM_ID = 64;
const OUTPUT_PATH = join(process.cwd(), "public/data/football.json");
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

const TEAM_NAMES_ZH = new Map([
  [57, "阿森纳"],
  [58, "阿斯顿维拉"],
  [61, "切尔西"],
  [62, "埃弗顿"],
  [63, "富勒姆"],
  [64, "利物浦"],
  [65, "曼城"],
  [66, "曼联"],
  [67, "纽卡斯尔联"],
  [73, "热刺"],
  [76, "狼队"],
  [328, "伯恩利"],
  [338, "莱斯特城"],
  [340, "南安普顿"],
  [346, "沃特福德"],
  [349, "伊普斯维奇"],
  [351, "诺丁汉森林"],
  [354, "水晶宫"],
  [397, "布莱顿"],
  [402, "布伦特福德"],
  [563, "西汉姆联"],
  [1044, "伯恩茅斯"],
  [1076, "利兹联"],
]);

if (!API_KEY) {
  throw new Error(
    "FOOTBALL_DATA_API_KEY is missing. Add it as a GitHub Actions repository secret.",
  );
}

async function fetchResource(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      "X-Auth-Token": API_KEY,
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`${path} failed with HTTP ${response.status}`);
  }

  return response.json();
}

function team(teamData) {
  return {
    id: teamData.id,
    name: TEAM_NAMES_ZH.get(teamData.id) ?? teamData.shortName ?? teamData.name,
    shortName: teamData.shortName ?? teamData.name,
    tla: teamData.tla ?? teamData.shortName?.slice(0, 3).toUpperCase() ?? "—",
  };
}

function match(matchData) {
  return {
    id: matchData.id,
    utcDate: matchData.utcDate,
    status: matchData.status,
    matchday: matchData.matchday ?? null,
    venue: matchData.venue ?? null,
    homeTeam: team(matchData.homeTeam),
    awayTeam: team(matchData.awayTeam),
    score: {
      home: matchData.score?.fullTime?.home ?? null,
      away: matchData.score?.fullTime?.away ?? null,
    },
  };
}

function standing(row) {
  return {
    position: row.position ?? null,
    team: team(row.team),
    playedGames: row.playedGames ?? 0,
    won: row.won ?? 0,
    draw: row.draw ?? 0,
    lost: row.lost ?? 0,
    points: row.points ?? 0,
    goalsFor: row.goalsFor ?? 0,
    goalsAgainst: row.goalsAgainst ?? 0,
    goalDifference: row.goalDifference ?? 0,
  };
}

function selectStandings(rows) {
  const topFive = rows.slice(0, 5);
  const liverpool = rows.find((row) => row.team.id === LIVERPOOL_TEAM_ID);
  return liverpool && !topFive.some((row) => row.team.id === LIVERPOOL_TEAM_ID)
    ? [...topFive, liverpool]
    : topFive;
}

const [matchesPayload, standingsPayload] = await Promise.all([
  fetchResource("/competitions/PL/matches"),
  fetchResource("/competitions/PL/standings"),
]);

const liverpoolMatches = matchesPayload.matches
  .filter(
    (item) =>
      item.homeTeam?.id === LIVERPOOL_TEAM_ID || item.awayTeam?.id === LIVERPOOL_TEAM_ID,
  )
  .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

const now = Date.now();
const finished = liverpoolMatches.filter(
  (item) => ["FINISHED", "AWARDED"].includes(item.status) && new Date(item.utcDate).getTime() <= now,
);
const upcoming = liverpoolMatches.filter(
  (item) => ["SCHEDULED", "TIMED"].includes(item.status) && new Date(item.utcDate).getTime() > now,
);

const totalTable = standingsPayload.standings?.find((table) => table.type === "TOTAL");
if (!totalTable?.table?.length) throw new Error("Premier League standings are empty");

const allStandings = totalTable.table.map(standing);
const snapshot = {
  schemaVersion: 1,
  lastUpdated: new Date().toISOString(),
  competition: {
    code: "PL",
    name: standingsPayload.competition?.name ?? "Premier League",
    season: Number(standingsPayload.season?.startDate?.slice(0, 4)) || new Date().getUTCFullYear(),
    currentMatchday: standingsPayload.season?.currentMatchday ?? null,
  },
  source: {
    name: "football-data.org",
    url: "https://www.football-data.org/",
    mode: "api",
  },
  lastResult: finished.length ? match(finished.at(-1)) : null,
  nextFixture: upcoming.length ? match(upcoming[0]) : null,
  standings: selectStandings(allStandings),
};

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
const temporaryPath = `${OUTPUT_PATH}.tmp`;
await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
await rename(temporaryPath, OUTPUT_PATH);

console.log(
  `Updated football snapshot: ${snapshot.lastResult?.id ?? "no result"}, ${snapshot.nextFixture?.id ?? "no fixture"}, ${snapshot.standings.length} table rows`,
);
