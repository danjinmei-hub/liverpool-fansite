import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { footballSnapshotError } from "../../lib/football-snapshot.mjs";
import { makeSnapshot } from "../fixtures/football-snapshot.mjs";
import { assertHomepageSnapshot } from "../helpers/football-render-assertions.mjs";

const require = createRequire(import.meta.url);
function loadAppModule(file, mocks, globals = {}) {
  const source = readFileSync(new URL(`../../app/${file}`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => name in mocks ? mocks[name] : require(name),
    AbortSignal, ...globals }, { filename: file });
  return exports;
}

for (const phase of ["start", "normal", "end"]) {
  test(`homepage components render ${phase} using the same smoke assertions`, () => {
    const snapshot = makeSnapshot(phase);
    const mocks = {
      "./football-data": { LIVERPOOL_TEAM_ID: 64 },
      "./football-snapshot-provider": { useFootballSnapshot: () => snapshot },
      "./fotmob-links": { getFotmobLink: () => null },
      "next/link": { default: (props) => React.createElement("a", props) },
    };
    const freshness = loadAppModule("homepage-freshness.tsx", mocks);
    const { FootballMatchday } = loadAppModule("football-matchday.tsx", mocks);
    const html = renderToStaticMarkup(React.createElement(React.Fragment, null,
      React.createElement(FootballMatchday), React.createElement(freshness.LatestMatchCard),
      React.createElement(freshness.LastDataUpdate),
      React.createElement(freshness.TacticalFreshness, { reviewedThroughMatchday: 2 })));
    assertHomepageSnapshot(html, snapshot);
    assert.ok(!html.includes("/matches/undefined"));
  });
}

for (const [games, expected] of [[0, "赛季样本尚未形成"], [1, "前 1 轮仍是早期样本"],
  [4, "前 4 轮仍是早期样本"], [5, "5 轮比赛开始形成轮廓"], [10, "10 轮比赛开始形成轮廓"],
  [11, "11 轮之后"], [19, "19 轮之后"], [20, "20 轮比赛已经提供足够样本"], [38, "38 轮比赛已经提供足够样本"]]) {
  test(`tactical sample text at ${games} completed games`, () => {
    const snapshot = makeSnapshot(); snapshot.standings[0].playedGames = games;
    const { TacticalFreshness } = loadAppModule("homepage-freshness.tsx", {
      "./football-data": { LIVERPOOL_TEAM_ID: 64 },
      "./football-snapshot-provider": { useFootballSnapshot: () => snapshot },
      "next/link": {},
    });
    const html = renderToStaticMarkup(React.createElement(TacticalFreshness, { reviewedThroughMatchday: 2 }));
    assert.ok(html.includes(expected));
    assert.ok(html.includes("TACTICAL REVIEW · THROUGH MD 02"));
  });
}

for (const scenario of ["valid", "malformed", "stale", "http-error", "network-error", "static"]) {
  test(`snapshot source ${scenario}: safe fallback without football API calls`, async () => {
    const fallback = makeSnapshot();
    const remote = makeSnapshot(); remote.lastUpdated = "2026-09-27T04:00:00Z";
    if (scenario === "malformed") delete remote.lastResult.homeTeam;
    if (scenario === "stale") remote.lastUpdated = "2026-09-25T04:00:00Z";
    let calls = 0;
    const { getLatestFootballSnapshot } = loadAppModule("football-source.ts", {
      "./football-data": { fallbackFootballSnapshot: fallback,
        isFootballSnapshot: (value) => footballSnapshotError(value) === null },
    }, {
      process: { env: { NEXT_PUBLIC_STATIC_PRODUCTION: scenario === "static" ? "1" : undefined } },
      fetch: async (url, options) => {
        calls++;
        assert.equal(url, "https://raw.githubusercontent.com/danjinmei-hub/liverpool-fansite/main/public/data/football.json");
        assert.ok(options.signal instanceof AbortSignal);
        if (scenario === "network-error") throw new Error("offline");
        return scenario === "http-error" ? new Response("", { status: 503 }) : Response.json(remote);
      },
    });
    const result = await getLatestFootballSnapshot();
    assert.equal(result.lastUpdated, scenario === "valid" ? remote.lastUpdated : fallback.lastUpdated);
    assert.equal(calls, scenario === "static" ? 0 : 1);
  });
}
