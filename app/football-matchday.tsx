"use client";

import { CalendarDays } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import {
  LIVERPOOL_TEAM_ID,
  isFootballSnapshot,
  type FootballMatch,
  type FootballSnapshot,
} from "./football-data";

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "Asia/Shanghai",
});

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  timeZone: "Asia/Shanghai",
});

const kickoffFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

const updatedFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

function roundLabel(match: FootballMatch | null) {
  return match?.matchday ? `英超第 ${match.matchday} 轮` : "Premier League";
}

function Team({ match, side }: { match: FootballMatch; side: "home" | "away" }) {
  const team = side === "home" ? match.homeTeam : match.awayTeam;
  const className = side === "away" ? "away-team" : undefined;

  return (
    <div className={className}>
      <span className={`team-code${team.id === LIVERPOOL_TEAM_ID ? " active" : ""}`}>
        {team.tla}
      </span>
      <small>{team.name}</small>
    </div>
  );
}

function validFotmobUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "www.fotmob.com" &&
      url.pathname.startsWith("/matches/")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function MatchCard({
  match,
  className,
  ariaLabel,
  children,
}: {
  match: FootballMatch;
  className: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  const fotmobUrl = validFotmobUrl(match.fotmobUrl);

  if (!fotmobUrl) {
    return <article className={`match-card ${className}`}>{children}</article>;
  }

  return (
    <a
      className={`match-card match-card-link ${className}`}
      href={fotmobUrl}
      aria-label={`${ariaLabel}，在 FotMob 查看比赛详情`}
    >
      {children}
    </a>
  );
}

function LastResult({ match }: { match: FootballMatch | null }) {
  if (!match) {
    return <article className="match-card data-unavailable">暂时没有可显示的已结束比赛。</article>;
  }

  return (
    <MatchCard
      match={match}
      className="last-match"
      ariaLabel={`${match.homeTeam.name} ${match.score.home ?? "—"} 比 ${match.score.away ?? "—"} ${match.awayTeam.name}`}
    >
      <div className="card-topline">
        <span>上一场 · {roundLabel(match)}</span>
        <span>FT</span>
      </div>
      <div className="score-row">
        <Team match={match} side="home" />
        <strong>{match.score.home ?? "—"}<span>—</span>{match.score.away ?? "—"}</strong>
        <Team match={match} side="away" />
      </div>
      <div className="match-meta">
        <span>{kickoffFormatter.format(new Date(match.utcDate))} · 北京时间</span>
        {match.venue && <span>{match.venue}</span>}
        {validFotmobUrl(match.fotmobUrl) && <span className="match-centre">比赛详情 ↗</span>}
      </div>
    </MatchCard>
  );
}

function NextFixture({ match }: { match: FootballMatch | null }) {
  if (!match) {
    return <article className="match-card data-unavailable">下一场比赛时间仍待确认。</article>;
  }

  const kickoff = new Date(match.utcDate);

  return (
    <MatchCard
      match={match}
      className="next-match"
      ariaLabel={`${match.homeTeam.name} 对 ${match.awayTeam.name}`}
    >
      <div className="card-topline">
        <span>下一场 · {roundLabel(match)}</span>
        <CalendarDays aria-hidden="true" size={17} />
      </div>
      <div className="fixture-row">
        <div>
          <strong className={match.homeTeam.id === LIVERPOOL_TEAM_ID ? "active" : undefined}>
            {match.homeTeam.tla}
          </strong>
          <span>{match.homeTeam.name}</span>
        </div>
        <p><b>{dayFormatter.format(kickoff)}</b><span>{monthFormatter.format(kickoff).toUpperCase()}</span></p>
        <div className="right">
          <strong className={match.awayTeam.id === LIVERPOOL_TEAM_ID ? "active" : undefined}>
            {match.awayTeam.tla}
          </strong>
          <span>{match.awayTeam.name}</span>
        </div>
      </div>
      <div className="match-meta">
        <span>{kickoffFormatter.format(kickoff)} · 北京时间</span>
        {match.venue && <span>{match.venue}</span>}
        {validFotmobUrl(match.fotmobUrl) && <span className="match-centre">比赛详情 ↗</span>}
      </div>
    </MatchCard>
  );
}

function Standings({ snapshot }: { snapshot: FootballSnapshot }) {
  return (
    <article className="season-card standings-card">
      <div className="card-topline">
        <span>Premier League · 积分榜</span>
        <span className="live-dot">快照</span>
      </div>
      <div className="standings-table" role="table" aria-label="英超积分榜快照">
        <div className="standings-row standings-head" role="row">
          <span>#</span><span>球队</span><span>赛</span><span>净胜</span><span>分</span>
        </div>
        {snapshot.standings.map((row) => (
          <div
            className={`standings-row${row.team.id === LIVERPOOL_TEAM_ID ? " is-liverpool" : ""}`}
            role="row"
            key={row.team.id}
          >
            <span>{row.position ?? "—"}</span>
            <strong>{row.team.tla}</strong>
            <span>{row.playedGames}</span>
            <span>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</span>
            <b>{row.points}</b>
          </div>
        ))}
      </div>
      <p className="football-data-status">
        {snapshot.source.mode === "fallback" ? "正在使用备用快照" : "自动快照"}
        {" · "}更新于 {updatedFormatter.format(new Date(snapshot.lastUpdated))}（北京时间）
        {" · "}football-data.org
      </p>
    </article>
  );
}

export function FootballMatchday({ initialData }: { initialData: FootballSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialData);

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const result = await fetch("/api/football", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const value: unknown = await result.json();
        if (result.ok && isFootballSnapshot(value)) setSnapshot(value);
      } catch {
        // The rendered fallback remains visible when the snapshot endpoint is unavailable.
      }
    }

    void refresh();
    return () => controller.abort();
  }, []);

  return (
    <section className="matchday" id="matchday" aria-label="比赛日概览">
      <LastResult match={snapshot.lastResult} />
      <NextFixture match={snapshot.nextFixture} />
      <Standings snapshot={snapshot} />
    </section>
  );
}
