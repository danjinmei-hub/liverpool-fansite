import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getSeasonMatches, type FootballMatch, type FootballSnapshot } from "../football-data";
import { getLatestFootballSnapshot } from "../football-source";
import {
  completedStatuses,
  matchCompetition,
  matchDate,
  matchStatus,
  seasonLabel,
  updateDate,
} from "./match-display";
import styles from "./matches.module.css";

export const metadata = {
  title: "本赛季比赛",
  description: "RED CHORUS 的 Liverpool 当前赛季比赛档案。",
};

export const revalidate = 900;

function MatchRow({ match, snapshot }: { match: FootballMatch; snapshot: FootballSnapshot }) {
  const completed = completedStatuses.has(match.status);
  const score = completed
    ? `${match.score.home ?? "—"}—${match.score.away ?? "—"}`
    : "VS";

  return (
    <Link
      className={styles.matchRow}
      href={`/matches/${match.id}`}
      aria-label={`${match.homeTeam.name} ${score} ${match.awayTeam.name}，查看比赛页面`}
    >
      <div className={styles.matchMeta}>
        <span>{matchStatus(match.status)}</span>
        <time dateTime={match.utcDate}>{matchDate(match)}</time>
        <small>{matchCompetition(match, snapshot)}</small>
      </div>
      <div className={styles.teams}>
        <span>{match.homeTeam.name}</span>
        <strong>{score}</strong>
        <span>{match.awayTeam.name}</span>
      </div>
      <ArrowUpRight aria-hidden="true" size={18} />
    </Link>
  );
}

function MatchGroup({
  title,
  label,
  matches,
  snapshot,
}: {
  title: string;
  label: string;
  matches: FootballMatch[];
  snapshot: FootballSnapshot;
}) {
  return (
    <section className={styles.matchGroup} aria-labelledby={`${label}-title`}>
      <div className={styles.groupHeading}>
        <span>{label}</span>
        <h2 id={`${label}-title`}>{title}</h2>
        <strong>{String(matches.length).padStart(2, "0")}</strong>
      </div>
      {matches.length ? (
        <div className={styles.matchList}>
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} snapshot={snapshot} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>当前快照中还没有这一类比赛。</p>
      )}
    </section>
  );
}

export default async function MatchesPage() {
  const snapshot = await getLatestFootballSnapshot();
  const matches = getSeasonMatches(snapshot);
  const completed = matches.filter((match) => completedStatuses.has(match.status)).reverse();
  const scheduled = matches.filter((match) => !completedStatuses.has(match.status));

  return (
    <main className={styles.page}>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="返回 RED CHORUS 首页">
          <span className="brand-mark" aria-hidden="true">R/26</span>
          <span className="brand-copy">
            <strong>RED CHORUS</strong>
            <small className="brand-zh">红潮同行</small>
            <small className="brand-tagline">For those who never walk alone.</small>
          </span>
        </Link>
        <nav aria-label="比赛档案导航">
          <Link href="/">首页</Link>
          <Link href="/squad">阵容</Link>
        </nav>
        <Link className="source-link" href="/">
          <ArrowLeft aria-hidden="true" size={15} /> 返回首页
        </Link>
      </header>

      <section className={styles.hero}>
        <div>
          <span>CURRENT SEASON · MATCH ARCHIVE</span>
          <h1>这一季，<br />每一场都留下来。</h1>
        </div>
        <div className={styles.seasonSummary}>
          <strong>{seasonLabel(snapshot.competition.season)}</strong>
          <p>当前赛季的已赛与已排定比赛，由同一份足球数据快照持续更新。</p>
          <small>LAST DATA UPDATE · {updateDate(snapshot)}</small>
        </div>
      </section>

      <div className={styles.archiveBody}>
        <MatchGroup
          title="已经发生"
          label="RESULTS"
          matches={completed}
          snapshot={snapshot}
        />
        <MatchGroup
          title="接下来"
          label="FIXTURES"
          matches={scheduled}
          snapshot={snapshot}
        />
      </div>

      <footer className={styles.footer}>
        <p>数据来自 football-data.org。比赛页只记录快照中已经确认的基础信息。</p>
        <Link href="/">RED CHORUS · 红潮同行</Link>
      </footer>
    </main>
  );
}
