import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { selectSeasonMatches } from "../lib/football-snapshot.mjs";

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

test("renders the current-season archive from the shared football snapshot", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(String(url), "https://raw.githubusercontent.com/danjinmei-hub/liverpool-fansite/main/public/data/football.json");
    return Response.json(snapshot);
  });
  const app = await worker();
  const response = await app.fetch(new Request("http://localhost/matches"), env, ctx);
  const html = (await response.text()).replaceAll("<!-- -->", "");

  assert.equal(response.status, 200);
  assert.match(html, /CURRENT SEASON · MATCH ARCHIVE/);
  for (const match of selectSeasonMatches(snapshot)) {
    assert.ok(html.includes(`/matches/${match.id}`));
  }
});

test("renders a stable internal page for a known match", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(String(url), "https://raw.githubusercontent.com/danjinmei-hub/liverpool-fansite/main/public/data/football.json");
    return Response.json(snapshot);
  });
  const app = await worker();
  const match = selectSeasonMatches(snapshot)[0];
  if (!match) {
    const response = await app.fetch(new Request("http://localhost/matches"), env, ctx);
    assert.equal(response.status, 200);
    return;
  }
  const response = await app.fetch(
    new Request(`http://localhost/matches/${match.id}`),
    env,
    ctx,
  );
  const html = (await response.text()).replaceAll("<!-- -->", "");

  assert.equal(response.status, 200);
  assert.match(html, new RegExp(match.homeTeam.name));
  assert.match(html, new RegExp(match.awayTeam.name));
  if (["FINISHED", "AWARDED"].includes(match.status)) {
    assert.match(html, new RegExp(`${match.score.home ?? "—"}.*${match.score.away ?? "—"}`, "s"));
  } else {
    assert.match(html, /VS/);
  }
});
