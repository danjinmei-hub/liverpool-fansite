import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fallbackFootballSnapshot, getSeasonMatches } from "../../football-data";
import { pageMetadata } from "../../seo";
import { getLatestFootballSnapshot } from "../../football-source";
import { getFotmobLink } from "../../fotmob-links";
import editorialData from "../../../data/match-editorial.json";
import { getEditorialSections, getMatchEditorial, getMatchThread, matchEditorialError } from "../../../lib/match-editorial.mjs";
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

const editorialError = matchEditorialError(editorialData);
if (editorialError) throw new Error(`Invalid match editorial: ${editorialError}`);

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
  const seasonMatches = getSeasonMatches(snapshot);
  const match = seasonMatches.find((item) => String(item.id) === id);

  if (!match) notFound();

  const completed = completedStatuses.has(match.status);
  const fotmob = getFotmobLink(match.id);
  const editorial = getMatchEditorial(editorialData, match.id);
  const sections = getEditorialSections(editorial);
  const thread = getMatchThread(seasonMatches, match.id);

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

      {sections.length > 0 && (
        <article className={styles.journal} aria-label="RED CHORUS 比赛笔记">
          <header className={styles.journalHeader}>
            <span>RED CHORUS · SEASON JOURNAL</span>
            {editorial?.headline && <h2>{editorial.headline}</h2>}
          </header>
          {sections.map((section) => (
            <section className={styles.journalSection} key={section.kind}>
              <div><span>{section.label}</span><h3>{section.title}</h3></div>
              {section.kind === "sources" ? (
                <ul className={styles.journalSources}>
                  {section.sources.map((source: { label: string; url: string }) => (
                    <li key={source.url}><a href={source.url} rel="noopener noreferrer" target="_blank">
                      {source.label} <ArrowUpRight aria-hidden="true" size={15} />
                    </a></li>
                  ))}
                </ul>
              ) : <p>{section.text}</p>}
            </section>
          ))}
        </article>
      )}

      <nav className={styles.thread} aria-label="赛季比赛导航">
        <div className={styles.threadHeading}><span>THE THREAD</span><h2>赛季脉络</h2></div>
        <div className={styles.threadLinks}>
          {thread?.previous && (
            <Link className={styles.threadPrevious} href={`/matches/${thread.previous.id}`}
              aria-label={`上一场：${thread.previous.homeTeam.name} 对 ${thread.previous.awayTeam.name}`}>
              <ArrowLeft aria-hidden="true" size={18} /><span><small>上一场比赛</small>
                {thread.previous.homeTeam.name} · {thread.previous.awayTeam.name}</span>
            </Link>
          )}
          <Link className={styles.threadAll} href="/matches">全部比赛</Link>
          {thread?.next && (
            <Link className={styles.threadNext} href={`/matches/${thread.next.id}`}
              aria-label={`下一场：${thread.next.homeTeam.name} 对 ${thread.next.awayTeam.name}`}>
              <span><small>下一场比赛</small>
                {thread.next.homeTeam.name} · {thread.next.awayTeam.name}</span>
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}
