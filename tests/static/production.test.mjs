import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { once } from "node:events";
import { resolve } from "node:path";
import test from "node:test";
import { footballSnapshotError, selectSeasonMatches } from "../../lib/football-snapshot.mjs";
import { getMatchThread } from "../../lib/match-editorial.mjs";
import { assertHomepageSnapshot } from "../helpers/football-render-assertions.mjs";
import { staticServer } from "../../scripts/serve-static.mjs";

const root = new URL("../../", import.meta.url);
const snapshot = JSON.parse(await readFile(new URL("public/data/football.json", root), "utf8"));
const links = JSON.parse(await readFile(new URL("data/football-match-links.json", root), "utf8"));

test("production export serves complete routes and assets from files only", async (t) => {
  const server = staticServer(new URL("out/", root).pathname).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal(footballSnapshotError(snapshot), null);
  const matches = (snapshot.matches ?? []).filter((match) => match.competition?.code === "PL"
    && (match.homeTeam.id === 64 || match.awayTeam.id === 64)
    && match.utcDate >= `${snapshot.competition.season}-07-01`
    && match.utcDate < `${snapshot.competition.season + 1}-07-01`);
  assert.equal(new Set(matches.map((match) => match.id)).size, matches.length);
  assert.ok(matches.length <= 38);
  const generatedIds = (await readdir(new URL("out/matches/", root), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  assert.deepEqual(generatedIds, matches.map((match) => String(match.id)).sort());
  for (const match of (snapshot.matches ?? []).filter((item) => !matches.includes(item))) {
    assert.equal((await fetch(`${base}/matches/${match.id}/`)).status, 404);
  }
  const pages = ["/", "/squad", "/history", "/players/alisson-becker", "/players/dominik-szoboszlai",
    "/players/virgil-van-dijk", "/matches", ...matches.map((match) => `/matches/${match.id}`),
    ...Object.keys(links).map((id) => `/out/fotmob/${id}`)];
  const assetPaths = new Set();
  const pageTitles = new Set();
  for (const page of pages) {
    const response = await fetch(base + page);
    assert.equal(response.status, 200, page);
    const html = (await response.text()).replaceAll("<!-- -->", "");
    assert.match(html, /RED CHORUS/, page);
    assert.doesNotMatch(html, /chatgpt\.site|signin-with-chatgpt|Powered by (OpenAI|ChatGPT)/i);
    if (!page.startsWith("/out/fotmob/")) {
      const path = page === "/" ? "/" : `${page}/`;
      const canonical = `https://redchorus.com${path}`;
      assert.ok(html.includes(`<link rel="canonical" href="${canonical}"/>`), page);
      assert.ok(html.includes(`<meta property="og:url" content="${canonical}"/>`), page);
      assert.match(html, /<meta name="robots" content="index, follow"\/>/, page);
      assert.match(html, /<meta name="twitter:card" content="summary_large_image"\/>/, page);
      assert.match(html, /<meta property="og:image" content="https:\/\/redchorus.com\/anfield-cc0.jpg"\/>/, page);
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
      assert.ok(title && !pageTitles.has(title), `Missing or duplicate title: ${page}`);
      pageTitles.add(title);
    }
    // Re-opening a nested URL uses its own HTML, never the homepage fallback.
    assert.equal((await fetch(base + page)).status, 200);
    for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]*)(?:[^" ]*)?"/g)) {
      assetPaths.add(match[1].replaceAll("&amp;", "&"));
    }
    if (page === "/") {
      assertHomepageSnapshot(html, snapshot);
    }
    if (page === "/history") {
      assert.match(html, /伊斯坦布尔奇迹/);
      assert.match(html, /<canvas/);
      assert.match(html, /开启音乐/);
    }
    if (page === "/matches") {
      for (const match of matches) assert.ok(html.includes(`/matches/${match.id}`));
      for (const match of (snapshot.matches ?? []).filter((item) => !matches.includes(item))) {
        assert.ok(!html.includes(`/matches/${match.id}`));
      }
    }
    if (page.startsWith("/matches/")) {
      const id = page.split("/").at(-1);
      const match = snapshot.matches.find((item) => String(item.id) === id);
      assert.ok(html.includes(match.homeTeam.name) && html.includes(match.awayTeam.name));
      assert.ok(html.includes(`${match.homeTeam.name} vs ${match.awayTeam.name}`)
        || html.includes(`${match.homeTeam.name} ${match.score.home}—${match.score.away} ${match.awayTeam.name}`), page);
      if (links[id]) assert.ok(html.includes(links[id].fotmobUrl));
      const thread = getMatchThread(selectSeasonMatches(snapshot), id);
      assert.match(html, /THE THREAD/);
      assert.match(html, /href="\/matches\/"[^>]*>全部比赛<\/a>/);
      if (thread.previous) assert.ok(html.includes(`href="/matches/${thread.previous.id}/"`));
      else assert.ok(!html.includes("上一场比赛"));
      if (thread.next) assert.ok(html.includes(`href="/matches/${thread.next.id}/"`));
      else assert.ok(!html.includes("下一场比赛"));
      assert.doesNotMatch(html, /RED CHORUS · SEASON JOURNAL|MATCH NOTE|这场比赛的位置|资料来源/);
    }
  }
  for (const path of assetPaths) assert.equal((await fetch(base + path)).status, 200, path);
  const jsonResponse = await fetch(base + "/data/football.json");
  assert.match(jsonResponse.headers.get("content-type"), /application\/json/);
  assert.deepEqual(await jsonResponse.json(), snapshot);
  const robots = await fetch(base + "/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: https:\/\/redchorus.com\/sitemap.xml/);
  const sitemap = await fetch(base + "/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get("content-type"), /xml/);
  const sitemapXml = await sitemap.text();
  const foundUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedPaths = ["/", "/squad/", "/history/", "/matches/",
    "/players/alisson-becker/", "/players/dominik-szoboszlai/", "/players/virgil-van-dijk/",
    ...matches.map(({ id }) => `/matches/${id}/`)];
  assert.deepEqual(foundUrls.sort(), expectedPaths.map((path) => `https://redchorus.com${path}`).sort());
  assert.equal(foundUrls.length, new Set(foundUrls).size);
  assert.equal((await fetch(base + "/api/football")).status, 404);
  assert.equal((await fetch(base + "/matches/unknown-match/")).status, 404);
  const entries = await readdir(new URL("out/", root));
  assert.ok(!entries.includes("server") && !entries.includes(".openai") && !entries.includes("api"));
  const chunks = await readdir(new URL("out/_next/static/", root), { recursive: true });
  const js = (await Promise.all(chunks.filter((path) => path.endsWith(".js")).map((path) =>
    readFile(resolve(new URL("out/_next/static/", root).pathname, path), "utf8")))).join("\n");
  assert.ok(js.includes("/data/football.json"));
  assert.ok(!js.includes("/api/football") && !js.includes("raw.githubusercontent.com/danjinmei-hub"));
  console.log(`HTTP checked ${pages.length} routes, ${assetPaths.size} internal links/assets, ${matches.length} Liverpool PL match IDs.`);
});
