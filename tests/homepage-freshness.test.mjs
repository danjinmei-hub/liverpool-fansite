import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assertHomepageSnapshot } from "./helpers/football-render-assertions.mjs";

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
  assert.equal(response.status, 200);
  assert.ok(liverpool);
  assertHomepageSnapshot(textHtml, snapshot);
  const count = liverpool.playedGames;
  const expected = count === 0 ? "赛季样本尚未形成" : count <= 4 ? `前 ${count} 轮仍是早期样本`
    : count <= 10 ? `${count} 轮比赛开始形成轮廓` : count <= 19 ? `${count} 轮之后`
    : `${count} 轮比赛已经提供足够样本`;
  assert.ok(textHtml.includes(expected));
  assert.ok(textHtml.includes("TACTICAL REVIEW · THROUGH MD 02"));
  assert.ok(!textHtml.includes("红军主场 2–2 战平森林"));
});
