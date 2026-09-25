import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { HistoryAnimation } from "./history-animation";
import { milestones } from "./milestones";
import styles from "./history.module.css";

export const metadata: Metadata = {
  title: "40 秒红军史",
  description: "用一段 40 秒的 Canvas 动画，走过利物浦从 1892 年建队到第 20 座联赛冠军的十个节点。",
};

export default function HistoryPage() {
  return (
    <main className="roster-page" id="top">
      <header className="site-header roster-header">
        <Link className="brand" href="/" aria-label="返回 RED CHORUS 首页">
          <span className="brand-mark" aria-hidden="true">R/26</span>
          <span className="brand-copy">
            <strong>RED CHORUS</strong>
            <small className="brand-zh">红潮同行</small>
            <small className="brand-tagline">For those who never walk alone.</small>
          </span>
        </Link>
        <Link className="back-link" href="/">
          <ArrowLeft aria-hidden="true" size={16} />
          返回首页
        </Link>
        <a className="source-link" href="https://www.liverpoolfc.com/history" target="_blank" rel="noreferrer">
          官方历史页
          <ArrowUpRight aria-hidden="true" size={15} />
        </a>
      </header>

      <section className={`section-shell ${styles.hero}`}>
        <div>
          <span className={styles.overline}>HISTORY IN 40 SECONDS · 1892–2025</span>
          <h1>一百三十三年，<br />四十秒走完。</h1>
        </div>
        <p>
          从安菲尔德的第一座看台，到伊斯坦布尔的六分钟，再到第 20 座联赛冠军。
          这段动画完全由 JavaScript 在 Canvas 上实时绘制，点击年份可以直接跳转。
        </p>
      </section>

      <section className="section-shell" aria-label="利物浦历史动画">
        <HistoryAnimation />
      </section>

      <section className={`section-shell ${styles.chronicle}`} aria-labelledby="chronicle-title">
        <span className={styles.overline}>TEN MOMENTS</span>
        <h2 id="chronicle-title">十个节点</h2>
        <ol>
          {milestones.map((milestone) => (
            <li key={milestone.year}>
              <span>{milestone.year}</span>
              <div>
                <h3>{milestone.title}</h3>
                <p>{milestone.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
