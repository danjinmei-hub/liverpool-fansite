import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { footballSnapshotError } from "../../lib/football-snapshot.mjs";
import { makeSnapshot } from "../fixtures/football-snapshot.mjs";

// Exercise the real updater, its two API requests and atomic file boundary offline.
for (const scenario of ["normal", "start", "end", "empty", "duplicate", "malformed", "missing-team", "http-error"]) {
  test(`updater ${scenario}: validates before replacing the previous file`, async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "football-update-test-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    await mkdir(join(directory, "public/data"), { recursive: true });
    await mkdir(join(directory, "data"));
    const previous = makeSnapshot();
    const original = JSON.stringify(previous);
    const output = join(directory, "public/data/football.json");
    await writeFile(output, original);
    await writeFile(join(directory, "data/football-match-links.json"), "{}");
    const candidate = makeSnapshot(["start", "end"].includes(scenario) ? scenario : "normal");
    if (scenario === "empty") candidate.matches = [];
    if (scenario === "duplicate") candidate.matches.push(candidate.matches[0]);
    if (scenario === "malformed") candidate.matches[0].score.home = "two";
    if (scenario === "missing-team") delete candidate.matches[0].awayTeam;
    const payloads = {
      standings: { season: { startDate: "2026-08-01", currentMatchday: 2 }, competition: candidate.competition,
        standings: [{ type: "TOTAL", table: candidate.standings }] },
      matches: { matches: candidate.matches.map((m) => ({ ...m, score: { fullTime: m.score } })) },
    };
    const preload = `const payloads = ${JSON.stringify(payloads)};
      const RealDate = Date;
      globalThis.Date = class extends RealDate {
        constructor(...args) { super(...(args.length ? args : ['2026-09-26T12:00:00Z'])); }
        static now() { return RealDate.parse('2026-09-26T12:00:00Z'); }
      };
      globalThis.fetch = async (url) => {
        console.log('MOCK_REQUEST', url);
        if (${JSON.stringify(scenario)} === 'http-error') return new Response('', {status: 503});
        if (url === 'https://api.football-data.org/v4/competitions/PL/standings') return Response.json(payloads.standings);
        if (url === 'https://api.football-data.org/v4/teams/64/matches?season=2026') return Response.json(payloads.matches);
        throw new Error('Unexpected network request: ' + url);
      };`;
    const run = spawnSync(process.execPath, ["--import", `data:text/javascript;base64,${Buffer.from(preload).toString("base64")}`,
      fileURLToPath(new URL("../../scripts/update-football-data.mjs", import.meta.url))], {
      cwd: directory, encoding: "utf8", env: { ...process.env, FOOTBALL_DATA_API_KEY: "offline-test-key" }, timeout: 10_000,
    });
    const bytes = await readFile(output, "utf8");
    const success = ["normal", "start", "end"].includes(scenario);
    assert.equal(run.status === 0, success, run.stderr);
    assert.equal((run.stdout.match(/MOCK_REQUEST/g) ?? []).length, scenario === "http-error" ? 1 : 2);
    if (success) {
      const value = JSON.parse(bytes);
      assert.equal(footballSnapshotError(value), null);
      assert.equal(value.lastResult === null, scenario === "start");
      assert.equal(value.nextFixture === null, scenario === "end");
    } else {
      assert.equal(bytes, original, "a rejected update must preserve the exact previous bytes");
      assert.match(run.stderr, /Football update rejected|HTTP 503/);
    }
    assert.deepEqual(await readdir(join(directory, "public/data")), ["football.json"]);
  });
}
