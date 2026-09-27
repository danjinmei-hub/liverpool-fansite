import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "../matches.module.css";

export default function MatchNotFound() {
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
