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
      <p className={styles.eyebrow}>MATCH CENTRE · FOTMOB</p>
      <h1>{match.matchLabel}</h1>
      <p className={styles.date}><time dateTime={match.matchDate}>{match.matchDate}</time></p>
      <section className={styles.details} aria-label="FotMob 网页入口">
        <p>完整比赛数据，请前往 FotMob 查看。</p>
        <a className={styles.destination} href={match.fotmobUrl}>在 FotMob 网页查看比赛详情 ↗</a>
        <p className={styles.hint}>如果点击后打开了 App，请复制下方链接，粘贴到 Safari 地址栏并前往。直接在地址栏打开，可使用网页查看。</p>
        <CopyLink url={match.fotmobUrl} />
      </section>
    </main>
  );
}
