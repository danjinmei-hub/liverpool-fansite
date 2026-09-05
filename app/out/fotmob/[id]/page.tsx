import { notFound } from "next/navigation";
import { getFotmobLink } from "../../../fotmob-links";
import CopyLink from "./copy-link";
import styles from "./page.module.css";

export const metadata = {
  title: "比赛详情 · Liverpool Fan Site",
  robots: { index: false, follow: false },
};

export default async function FotmobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getFotmobLink(id);
  if (!match) notFound();

  return (
    <main className={styles.page}>
      <a className={styles.back} href="/">← 返回 Liverpool Fan Site</a>
      <h1>{match.matchLabel}</h1>
      <section className={styles.details} aria-label="FotMob 网页入口">
        <a className={styles.destination} href={match.fotmobUrl}>在 FotMob 网页查看比赛详情 ↗</a>
        <p className={styles.hint}>如跳入 App，请复制链接到 Safari 地址栏打开。</p>
        <CopyLink url={match.fotmobUrl} />
      </section>
    </main>
  );
}
