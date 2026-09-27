import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const snapshot = JSON.parse(await readFile(new URL("../public/data/football.json", import.meta.url), "utf8"));

test("Sites preview stays out of the index and keeps production canonicals", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(String(url), "https://raw.githubusercontent.com/danjinmei-hub/liverpool-fansite/main/public/data/football.json");
    return Response.json(snapshot);
  });
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("preview-seo-test", `${process.pid}-${Date.now()}`);
  const worker = (await import(workerUrl.href)).default;
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  const routes = ["/", "/squad", "/history", "/matches", "/players/alisson-becker",
    "/players/dominik-szoboszlai", "/players/virgil-van-dijk",
    ...snapshot.matches.slice(0, 1).map(({ id }) => `/matches/${id}`)];
  for (const path of routes) {
    const response = await worker.fetch(new Request(`http://localhost${path}`), env, ctx);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const canonical = `https://redchorus.com${path === "/" ? "/" : `${path}/`}`;
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}"/>`), path);
    assert.match(html, /<meta name="robots" content="noindex, nofollow"\/>/, path);
  }
  const invalid = await worker.fetch(new Request("http://localhost/matches/unknown-match"), env, ctx);
  assert.equal(invalid.status, 404);
  const robots = await worker.fetch(new Request("http://localhost/robots.txt"), env, ctx);
  assert.equal(robots.status, 200);
  assert.doesNotMatch(await robots.text(), /Sitemap:/);
  const sitemap = await worker.fetch(new Request("http://localhost/sitemap.xml"), env, ctx);
  assert.equal(sitemap.status, 200);
  assert.doesNotMatch(await sitemap.text(), /<loc>/);
});
