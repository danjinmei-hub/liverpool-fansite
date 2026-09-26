import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { footballSnapshotError, selectSeasonMatches } from "../../lib/football-snapshot.mjs";
import { assertSafeFootballUpdate } from "../../scripts/football-update-guard.mjs";
import { makeMatch, makeSnapshot } from "../fixtures/football-snapshot.mjs";

for (const phase of ["normal", "start", "end"]) {
  test(`${phase}: contract and update policy accept legal lifecycle states`, () => {
    const value = makeSnapshot(phase);
    assert.equal(footballSnapshotError(value), null);
    assert.doesNotThrow(() => assertSafeFootballUpdate(value));
  });
}

test("nullable optional fields, unknown future status and older snapshot shape remain safe", () => {
  const value = makeSnapshot();
  value.competition.currentMatchday = null;
  value.standings[0].position = null;
  value.standings[0].points = -1; // A points deduction is not structural corruption.
  value.lastResult.matchday = null;
  value.lastResult.status = "FUTURE_STATUS";
  delete value.lastResult.competition;
  delete value.lastResult.stage;
  delete value.matches;
  assert.equal(footballSnapshotError(value), null);
  assert.deepEqual(selectSeasonMatches(value).map((m) => m.id), [102]);
  value.lastResult = null; value.nextFixture = null; value.matches = []; value.standings = [];
  assert.equal(footballSnapshotError(value), null);
  assert.deepEqual(selectSeasonMatches(value), []);
});

const invalidCases = [
  ["schemaVersion", (s) => { s.schemaVersion = 2; }],
  ["lastUpdated", (s) => { s.lastUpdated = "yesterday"; }],
  ["lastUpdated", (s) => { s.lastUpdated = "2026-02-30T10:00:00Z"; }],
  ["competition.season", (s) => { s.competition.season = "2026"; }],
  ["competition.code", (s) => { s.competition.code = "CL"; }],
  ["source.mode", (s) => { s.source.mode = "unknown"; }],
  ["source.url", (s) => { s.source.url = "not a URL"; }],
  ["lastResult", (s) => { delete s.lastResult; }],
  ["nextFixture", (s) => { delete s.nextFixture; }],
  ["matches", (s) => { s.matches = {}; }],
  ["matches[0].homeTeam", (s) => { s.matches[0] = { ...s.matches[0], homeTeam: undefined }; }],
  ["nextFixture.awayTeam", (s) => { delete s.nextFixture.awayTeam; }],
  ["lastResult.id", (s) => { s.lastResult.id = "101"; }],
  ["lastResult.utcDate", (s) => { s.lastResult.utcDate = "2026-13-01T10:00:00Z"; }],
  ["lastResult.status", (s) => { s.lastResult.status = null; }],
  ["lastResult.homeTeam.tla", (s) => { s.lastResult.homeTeam.tla = {}; }],
  ["lastResult.score", (s) => { delete s.lastResult.score; }],
  ["lastResult.score.home", (s) => { s.lastResult.score.home = -1; }],
  ["standings", (s) => { s.standings = null; }],
  ["standings[0].playedGames", (s) => { s.standings[0].playedGames = "1"; }],
  ["standings[0].goalDifference", (s) => { s.standings[0].goalDifference = NaN; }],
];
for (const [path, mutate] of invalidCases) {
  test(`rejects malformed ${path}`, () => {
    const value = makeSnapshot(); mutate(value);
    assert.ok(footballSnapshotError(value)?.includes(path));
    assert.throws(() => assertSafeFootballUpdate(value), /Football update rejected/);
  });
}

test("archive filters season, competition and club before deduplication and sorting", () => {
  const value = makeSnapshot();
  value.matches.push(
    { ...makeMatch(103), competition: { code: "CL", name: "Champions League" } },
    { ...makeMatch(104), utcDate: "2025-08-01T14:00:00Z" },
    { ...makeMatch(105), utcDate: "2027-07-01T00:00:00Z" },
    { ...makeMatch(106), homeTeam: makeMatch().awayTeam },
    { ...makeMatch(107), competition: undefined },
    { ...makeMatch(108), utcDate: "2026-07-01T00:00:00Z" },
    structuredClone(value.matches[0]),
  );
  assert.equal(footballSnapshotError(value), null);
  assert.deepEqual(selectSeasonMatches(value).map((m) => m.id), [108, 101, 102]);
  // Structural safety and update policy deliberately have different responsibilities.
  assert.throws(() => assertSafeFootballUpdate(value), /duplicate match ID 101/);
});

test("update guard rejects missing, duplicate, inconsistent or regressed collections", () => {
  const previous = makeSnapshot();
  const empty = { ...makeSnapshot(), matches: [], lastResult: null, nextFixture: null };
  assert.equal(footballSnapshotError(empty), null);
  assert.throws(() => assertSafeFootballUpdate(empty, previous), /fixtures disappeared/);
  const other = { ...empty, matches: [{ ...makeMatch(), competition: { code: "CL", name: "Champions League" } }] };
  assert.throws(() => assertSafeFootballUpdate(other), /PL fixtures are missing/);
  const missingReference = makeSnapshot(); missingReference.matches = [missingReference.nextFixture];
  assert.throws(() => assertSafeFootballUpdate(missingReference), /lastResult does not match/);
  const noLiverpool = makeSnapshot(); noLiverpool.standings = [];
  assert.throws(() => assertSafeFootballUpdate(noLiverpool), /missing from standings/);
  const duplicateTeams = makeSnapshot(); duplicateTeams.standings.push(duplicateTeams.standings[0]);
  assert.throws(() => assertSafeFootballUpdate(duplicateTeams), /duplicate team IDs/);
  assert.throws(() => assertSafeFootballUpdate({ ...previous, lastUpdated: "2026-09-25T00:00:00Z" }, previous), /lastUpdated moved backwards/);
  assert.throws(() => assertSafeFootballUpdate({ ...empty, competition: { ...empty.competition, season: 2025 } }, previous), /season moved backwards/);
  // An empty newly opened season is legitimate; the same-season loss rule must not apply.
  assert.doesNotThrow(() => assertSafeFootballUpdate({ ...empty, competition: { ...empty.competition, season: 2027 } }, previous));
});

test("a complete season cannot silently shrink; legal start and end retain its fixtures", () => {
  const previous = makeSnapshot();
  previous.matches = Array.from({ length: 38 }, (_, i) => makeMatch(1000 + i));
  previous.lastResult = previous.matches[0]; previous.nextFixture = null;
  assert.doesNotThrow(() => assertSafeFootballUpdate(previous));
  const smaller = structuredClone(previous); smaller.matches.pop();
  assert.throws(() => assertSafeFootballUpdate(smaller, previous), /complete season shrank/);
  const larger = structuredClone(previous); larger.matches.push(makeMatch(2000));
  assert.throws(() => assertSafeFootballUpdate(larger), /at most 38/);
  const start = structuredClone(previous); start.lastResult = null;
  assert.doesNotThrow(() => assertSafeFootballUpdate(start, previous));
  assert.doesNotThrow(() => assertSafeFootballUpdate(previous, start));
});

test("the committed fallback satisfies the runtime contract", async () => {
  const value = JSON.parse(await readFile(new URL("../../public/data/football.json", import.meta.url), "utf8"));
  assert.equal(footballSnapshotError(value), null);
});
