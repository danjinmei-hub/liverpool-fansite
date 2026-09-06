import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const snapshot = JSON.parse(
  await readFile(new URL("../public/data/football.json", import.meta.url), "utf8"),
);

async function worker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("match-archive-test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

test("renders the current-season archive from the shared football snapshot", async () => {
  const app = await worker();
  const response = await app.fetch(new Request("http://localhost/matches"), env, ctx);
  const html = (await response.text()).replaceAll("<!-- -->", "");

  assert.equal(response.status, 200);
  assert.match(html, /CURRENT SEASON · MATCH ARCHIVE/);
  assert.match(html, new RegExp(`/matches/${snapshot.lastResult.id}`));
  assert.match(html, new RegExp(`/matches/${snapshot.nextFixture.id}`));
});

test("renders a stable internal page for a known match", async () => {
  const app = await worker();
  const match = snapshot.lastResult;
  const response = await app.fetch(
    new Request(`http://localhost/matches/${match.id}`),
    env,
    ctx,
  );
  const html = (await response.text()).replaceAll("<!-- -->", "");

  assert.equal(response.status, 200);
  assert.match(html, new RegExp(match.homeTeam.name));
  assert.match(html, new RegExp(match.awayTeam.name));
  assert.match(html, new RegExp(`${match.score.home}.*${match.score.away}`, "s"));
});
