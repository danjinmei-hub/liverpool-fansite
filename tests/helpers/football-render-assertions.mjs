import assert from "node:assert/strict";

// Shared by file-server smoke tests and offline lifecycle rendering tests.
export function assertHomepageSnapshot(html, snapshot) {
  assert.match(html, /LATEST MATCH/);
  assert.match(html, /TACTICAL REVIEW/);
  assert.match(html, /LAST DATA UPDATE/);
  if (snapshot.lastResult) {
    const result = snapshot.lastResult;
    assert.ok(html.includes(`/matches/${result.id}`));
    assert.ok(html.includes(`${result.homeTeam.name} ${result.score.home ?? "—"}—${result.score.away ?? "—"} ${result.awayTeam.name}`));
  } else {
    assert.match(html, /最近一场比赛数据暂时不可用/);
    assert.match(html, /暂时没有可显示的已结束比赛/);
  }
  if (snapshot.nextFixture) {
    assert.ok(html.includes(snapshot.nextFixture.homeTeam.name));
    assert.ok(html.includes(snapshot.nextFixture.awayTeam.name));
  } else {
    assert.match(html, /下一场比赛时间仍待确认/);
  }
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Shanghai",
  }).format(new Date(snapshot.lastUpdated)).toUpperCase();
  assert.ok(html.includes(date));
}
