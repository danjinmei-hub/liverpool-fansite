import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getSeasonMatches } from "../../football-data";
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

export const metadata = {
  title: "比赛详情",
  description: "Liverpool 当前赛季比赛基础信息。",
};

export const revalidate = 900;

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await getLatestFootballSnapshot();
  const match = getSeasonMatches(snapshot).find((item) => String(item.id) === id);

  if (!match) {
    return (
      <main className={`${styles.page} ${styles.detailPage}`}>
        <div className={styles.missing}>
          <span>MATCH ARCHIVE</span>
          <h1>这场比赛暂未进入当前数据快照。</h1>
          <p>数据源短暂不可用时，本站会保留现有快照，不生成未经确认的比赛信息。</p>
          <Link href="/matches"><ArrowLeft aria-hidden="true" size={16} /> 返回本赛季比赛</Link>
        </div>
      </main>
    );
  }

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
