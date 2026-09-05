"use client";

import { ArrowUpRight } from "lucide-react";
import { getFotmobLink } from "./fotmob-links";
import { LIVERPOOL_TEAM_ID, type FootballMatch, type FootballSnapshot } from "./football-data";
import { useFootballSnapshot } from "./football-snapshot-provider";

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Shanghai",
});

const updateDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Shanghai",
});

function completedMatchCount(snapshot: FootballSnapshot) {
  return snapshot.standings.find((row) => row.team.id === LIVERPOOL_TEAM_ID)?.playedGames ?? 0;
}

function sampleDescription(matches: number) {
  if (matches === 0) {
    return "赛季样本尚未形成。这里记录原则，也等待比赛提供证据。";
  }
  if (matches <= 4) {
    return `前 ${matches} 轮仍是早期样本。这里记录趋势，不把猜测伪装成结论。`;
  }
  if (matches <= 10) {
    return `${matches} 轮比赛开始形成轮廓。这里记录趋势，也保留修正的空间。`;
  }
  if (matches <= 19) {
    return `${matches} 轮之后，一些原则已经反复出现。这里关注趋势，也记录变化。`;
  }
  return `${matches} 轮比赛已经提供足够样本。这里关注哪些原则留下来，哪些已经改变。`;
}

function matchTitle(match: FootballMatch) {
  return `${match.homeTeam.name} ${match.score.home ?? "—"}—${match.score.away ?? "—"} ${match.awayTeam.name}`;
}

function matchDate(date: Date) {
  const parts = Object.fromEntries(
    shortDateFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.month}.${parts.day}`;
}

export function TacticalFreshness({ reviewedThroughMatchday }: { reviewedThroughMatchday: number }) {
  const snapshot = useFootballSnapshot();
  const matches = completedMatchCount(snapshot);

  return (
    <div className="tactical-freshness">
      <span>TACTICAL REVIEW · THROUGH MD {String(reviewedThroughMatchday).padStart(2, "0")}</span>
      <p>{sampleDescription(matches)}</p>
    </div>
  );
}

export function LatestMatchCard() {
  const { lastResult } = useFootballSnapshot();

  if (!lastResult) {
    return (
      <article className="news-card news-card-static latest-match-update">
        <div className="news-meta"><span>LATEST MATCH</span><time>待更新</time></div>
        <h3>最近一场比赛数据暂时不可用</h3>
        <p>本站将继续显示备用快照，等待下一次自动更新。</p>
        <div className="read-more">football-data.org</div>
      </article>
    );
  }

  const link = getFotmobLink(lastResult.id);
  const date = matchDate(new Date(lastResult.utcDate));
  const summary = [
    "Premier League",
    lastResult.matchday ? `Matchday ${lastResult.matchday}` : null,
    "已完赛",
  ].filter(Boolean).join(" · ");
  const contents = (
    <>
      <div className="news-meta">
        <span>LATEST MATCH</span>
        <time dateTime={lastResult.utcDate}>{date}</time>
      </div>
      <h3>{matchTitle(lastResult)}</h3>
      <p>{summary}</p>
      <div className="read-more">
        {link ? "查看比赛详情" : "比赛数据"}
        {link && <ArrowUpRight aria-hidden="true" size={16} />}
      </div>
    </>
  );

  if (!link) {
    return <article className="news-card news-card-static latest-match-update">{contents}</article>;
  }

  return (
    <a
      className="news-card latest-match-update"
      href={link.fotmobUrl}
      aria-label={`${matchTitle(lastResult)}，查看比赛详情`}
    >
      {contents}
    </a>
  );
}

export function LastDataUpdate() {
  const snapshot = useFootballSnapshot();
  const date = updateDateFormatter.format(new Date(snapshot.lastUpdated)).toUpperCase();

  return <span>LAST DATA UPDATE<br /><b>{date}</b></span>;
}
