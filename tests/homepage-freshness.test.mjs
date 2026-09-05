import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const snapshot = JSON.parse(
  await readFile(new URL("../public/data/football.json", import.meta.url), "utf8"),
);

test("renders homepage freshness fields from the football snapshot", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("freshness-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();
  const textHtml = html.replaceAll("<!-- -->", "");
  const liverpool = snapshot.standings.find((row) => row.team.id === 64);
  const result = snapshot.lastResult;
  const updateDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(new Date(snapshot.lastUpdated)).toUpperCase();

  assert.equal(response.status, 200);
  assert.ok(result);
  assert.ok(liverpool);
  assert.ok(textHtml.includes("LATEST MATCH"));
  assert.ok(textHtml.includes(`${result.homeTeam.name} ${result.score.home}—${result.score.away} ${result.awayTeam.name}`));
  assert.ok(textHtml.includes(`前 ${liverpool.playedGames} 轮仍是早期样本`));
  assert.ok(textHtml.includes("TACTICAL REVIEW · THROUGH MD 02"));
  assert.ok(textHtml.includes("LAST DATA UPDATE"));
  assert.ok(textHtml.includes(updateDate));
  assert.ok(!textHtml.includes("红军主场 2–2 战平森林"));
});
