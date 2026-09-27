import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fallbackFootballSnapshot, getSeasonMatches } from "../../football-data";
import { pageMetadata } from "../../seo";
import { getLatestFootballSnapshot } from "../../football-source";
import { getFotmobLink } from "../../fotmob-links";
import {
  completedStatuses,
  matchCompetition,
  matchDate,
  matchStatus,
  matchTime,
  updateDate,
} from "../match-display";
import styles from "../matches.module.css";

export const revalidate = 900;

export function generateStaticParams() {
  return getSeasonMatches(fallbackFootballSnapshot).map((match) => ({ id: String(match.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const snapshot = await getLatestFootballSnapshot();
  const match = getSeasonMatches(snapshot).find((item) => String(item.id) === id);
  if (!match) notFound();

  const date = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Shanghai",
  }).format(new Date(match.utcDate));
  const completed = completedStatuses.has(match.status);
  const fixture = completed
    ? `${match.homeTeam.name} ${match.score.home}—${match.score.away} ${match.awayTeam.name}`
    : `${match.homeTeam.name} vs ${match.awayTeam.name}`;
  const round = match.matchday ? `第 ${match.matchday} 轮` : "";
  return pageMetadata({
    path: `/matches/${match.id}/`,
    title: `${fixture}｜${date}英超比赛`,
    description: `${snapshot.competition.season}/${String(snapshot.competition.season + 1).slice(-2)} 英超${round} · ${date} · ${fixture} · ${matchStatus(match.status)}。RED CHORUS 比赛档案。`,
  });
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await getLatestFootballSnapshot();
  const match = getSeasonMatches(snapshot).find((item) => String(item.id) === id);

  if (!match) notFound();

  const completed = completedStatuses.has(match.status);
  const fotmob = getFotmobLink(match.id);

  return (
    <main className={`${styles.page} ${styles.detailPage}`}>
      <header className={styles.detailHeader}>
        <Link href="/matches"><ArrowLeft aria-hidden="true" size={16} /> 本赛季比赛</Link>
        <Link href="/" aria-label="返回 RED CHORUS 首页">RED CHORUS</Link>
      </header>

      <article className={styles.scorecard}>
        <div className={styles.detailOverline}>
          <span>{matchCompetition(match, snapshot)}</span>
          <span>{matchStatus(match.status)}</span>
        </div>

        <div className={styles.detailTeams}>
          <div>
            <small>HOME</small>
            <strong>{match.homeTeam.tla}</strong>
            <h1>{match.homeTeam.name}</h1>
          </div>
          <p className={styles.score}>
            {completed ? (
              <><strong>{match.score.home ?? "—"}</strong><span>—</span><strong>{match.score.away ?? "—"}</strong></>
            ) : (
              <span>VS</span>
            )}
          </p>
          <div className={styles.awayTeam}>
            <small>AWAY</small>
            <strong>{match.awayTeam.tla}</strong>
            <h1>{match.awayTeam.name}</h1>
          </div>
        </div>

        <dl className={styles.facts}>
          <div><dt>日期</dt><dd>{matchDate(match)}</dd></div>
          <div><dt>开球</dt><dd>{matchTime(match)} · 北京时间</dd></div>
          <div><dt>场地</dt><dd>{match.venue ?? "数据源暂未提供"}</dd></div>
          <div><dt>数据更新</dt><dd>{updateDate(snapshot)}</dd></div>
        </dl>

        <div className={styles.detailActions}>
          {fotmob ? (
            <a href={fotmob.fotmobUrl} aria-label={`${fotmob.matchLabel}，在 FotMob 查看比赛详情`}>
              FotMob 比赛详情 <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          ) : (
            <span>详细比赛中心链接尚未核验</span>
          )}
          <small>本站仅展示数据快照中已有的信息。</small>
        </div>
      </article>
    </main>
  );
}
