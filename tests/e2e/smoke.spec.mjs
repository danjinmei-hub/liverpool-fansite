import { readFile } from "node:fs/promises";
import { test as base, expect } from "@playwright/test";
import { selectSeasonMatches } from "../../lib/football-snapshot.mjs";

const snapshot = JSON.parse(await readFile(new URL("../../public/data/football.json", import.meta.url), "utf8"));
const mappings = JSON.parse(await readFile(new URL("../../data/football-match-links.json", import.meta.url), "utf8"));
const matches = selectSeasonMatches(snapshot);
const finished = matches.find(({ status }) => ["FINISHED", "AWARDED"].includes(status));
const upcoming = matches.find(({ status }) => !["FINISHED", "AWARDED"].includes(status));

const test = base.extend({
  browserHealth: [async ({ page, context }, use) => {
    const errors = [];
    // Smoke tests require only the built artifact; never contact data providers.
    await context.route("**/*", (route) => new URL(route.request().url()).origin === "http://127.0.0.1:4173"
      ? route.continue() : route.abort());
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|hydrating|Minified React error/i.test(message.text())) {
        errors.push(message.text());
      }
    });
    page.on("response", (response) => {
      if (response.status() >= 400 && /\.(js|css|jpg|png|svg|webp|woff2)(\?|$)/.test(response.url())) {
        errors.push(`Asset HTTP ${response.status()}: ${response.url()}`);
      }
    });
    await use();
    expect(errors, "runtime, hydration and asset errors").toEqual([]);
  }, { auto: true }],
});

async function visiblePage(page) {
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("h1").first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    { message: "page must fit the viewport without horizontal scrolling" }).toBe(true);
  const image = page.locator("main img").first();
  if (await image.count()) {
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
}

async function homepageSnapshot(page, expected) {
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Shanghai",
  }).format(new Date(expected.lastUpdated)).toUpperCase();
  await expect(page.locator("span").filter({ hasText: /^LAST DATA UPDATE/ })).toContainText(date);
  if (expected.lastResult) {
    const m = expected.lastResult;
    await expect(page.locator(".latest-match-update")).toContainText(
      `${m.homeTeam.name} ${m.score.home ?? "—"}—${m.score.away ?? "—"} ${m.awayTeam.name}`);
    await expect(page.locator(".latest-match-update")).toHaveAttribute("href", new RegExp(`^/matches/${m.id}/?$`));
  } else {
    await expect(page.locator(".latest-match-update")).toContainText("最近一场比赛数据暂时不可用");
    await expect(page.locator(".matchday")).toContainText("暂时没有可显示的已结束比赛");
  }
  if (expected.nextFixture) {
    await expect(page.locator(".next-match")).toContainText(expected.nextFixture.homeTeam.name);
    await expect(page.locator(".next-match")).toContainText(expected.nextFixture.awayTeam.name);
  } else {
    await expect(page.locator(".matchday")).toContainText("下一场比赛时间仍待确认");
  }
  await expect(page.locator("main")).not.toContainText(/undefined|NaN|Invalid Date/);
  await expect(page.locator('a[href*="undefined"]')).toHaveCount(0);
}

test("homepage → archive → match → archive → homepage", async ({ page }) => {
  expect(matches.length, "committed snapshot must expose real archive routes").toBeGreaterThan(0);
  expect((await page.goto("/")).status()).toBe(200);
  await visiblePage(page);
  await homepageSnapshot(page, snapshot);
  await page.getByRole("link", { name: "查看本赛季全部比赛" }).click();
  await expect(page).toHaveURL(/\/matches\/$/);
  await visiblePage(page);
  const archiveLinks = page.locator('a[href^="/matches/"]');
  await expect(archiveLinks).toHaveCount(matches.length);
  await page.locator(`a[href="/matches/${matches[0].id}/"]`).click();
  await expect(page).toHaveURL(new RegExp(`/matches/${matches[0].id}/$`));
  await visiblePage(page);
  await page.getByRole("navigation", { name: "赛季比赛导航" }).getByRole("link", { name: "全部比赛", exact: true }).click();
  await expect(page).toHaveURL(/\/matches\/$/);
  await page.getByRole("link", { name: "返回 RED CHORUS 首页", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await homepageSnapshot(page, snapshot);
});

for (const [label, match] of [["finished", finished], ["upcoming", upcoming]]) {
  test(`direct ${label} match survives reload and preserves verified link policy`, async ({ page }) => {
    test.skip(!match, `No ${label} match in the committed season snapshot`);
    expect((await page.goto(`/matches/${match.id}/`)).status()).toBe(200);
    await visiblePage(page);
    await expect(page.getByRole("heading", { name: match.homeTeam.name, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: match.awayTeam.name, exact: true })).toBeVisible();
    const link = page.getByRole("link", { name: /在 FotMob 查看比赛详情/ });
    if (mappings[match.id]) await expect(link).toHaveAttribute("href", mappings[match.id].fotmobUrl);
    else {
      await expect(link).toHaveCount(0);
      await expect(page.getByText("详细比赛中心链接尚未核验", { exact: true })).toBeVisible();
    }
    expect((await page.reload()).status()).toBe(200);
    await visiblePage(page);
  });
}

test("squad returns home, where the core player card opens its profile", async ({ page, isMobile }) => {
  await page.goto("/matches/");
  if (isMobile) {
    // The compact header hides desktop navigation; use the existing homepage entry.
    await page.getByRole("link", { name: "返回 RED CHORUS 首页", exact: true }).click();
    await page.getByRole("link", { name: "查看轮换与替补" }).click();
  } else {
    await page.getByRole("navigation", { name: "比赛档案导航" }).getByRole("link", { name: "阵容", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/squad\/$/);
  await visiblePage(page);
  // /squad contains rotation players; core profiles are linked from the homepage.
  await page.getByRole("link", { name: "返回 RED CHORUS 首页", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await page.getByRole("link", { name: "阅读 Virgil van Dijk 个人档案", exact: true }).first().click();
  await expect(page).toHaveURL(/\/players\/virgil-van-dijk\/$/);
  await visiblePage(page);
  await expect(page.locator("h1")).toContainText("VAN DIJK");
  await page.getByRole("link", { name: "返回 RED CHORUS 首页", exact: true }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
});

for (const [slug, name] of [["alisson-becker", "ALISSON"], ["dominik-szoboszlai", "SZOBOSZLAI"], ["virgil-van-dijk", "VAN DIJK"]]) {
  test(`direct player profile ${slug}`, async ({ page }) => {
    expect((await page.goto(`/players/${slug}/`)).status()).toBe(200);
    await visiblePage(page);
    await expect(page.locator("h1")).toContainText(name);
    expect((await page.reload()).status()).toBe(200);
  });
}

test("unknown route and match return real 404 pages", async ({ page }) => {
  for (const path of ["/quality-gate-unknown/", "/matches/unknown-match/"]) {
    expect((await page.goto(path)).status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
    await expect(page.locator(".matchday")).toHaveCount(0);
  }
});

// Test-only responses mutate the real snapshot; no synthetic fixture is published.
for (const scenario of ["http-error", "network-error", "invalid-json", "invalid-schema", "stale"]) {
  test(`homepage retains embedded data on ${scenario} refresh`, async ({ page }) => {
    await page.route("**/data/football.json", async (route) => {
      if (scenario === "network-error") return route.abort("failed");
      const value = structuredClone(snapshot);
      if (scenario === "invalid-schema") delete value.lastUpdated;
      if (scenario === "stale") {
        value.lastUpdated = new Date(Date.parse(snapshot.lastUpdated) - 86_400_000).toISOString();
        value.lastResult = null;
      }
      await route.fulfill({ status: scenario === "http-error" ? 503 : 200, contentType: "application/json",
        body: scenario === "invalid-json" ? "{broken" : JSON.stringify(value) });
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await homepageSnapshot(page, snapshot);
  });
}

test("newer valid data with no result, fixture or standings renders existing empty states", async ({ page }) => {
  const value = structuredClone(snapshot);
  value.lastUpdated = new Date(Date.parse(snapshot.lastUpdated) + 86_400_000).toISOString();
  value.lastResult = null;
  value.nextFixture = null;
  value.standings = [];
  await page.route("**/data/football.json", (route) => route.fulfill({ json: value }));
  await page.goto("/");
  await homepageSnapshot(page, value);
  await expect(page.locator(".standings-table [role=row]")).toHaveCount(1);
  await visiblePage(page);
});
