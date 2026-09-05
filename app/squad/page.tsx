import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, Camera, Heart, Sparkles } from "lucide-react";
import { PhotoCredits } from "../photo-credits";
import { PlayerCard } from "../player-card";
import { rotationGroups, rotationSquad } from "../squad-data";

export const metadata: Metadata = {
  title: "阵容地图",
  description: "利物浦 2026/27 赛季主要轮换与替补池：真实照片、风格速写与可核验来源。",
};

const profileModules = [
  { icon: Sparkles, title: "生涯高光", text: "关键比赛、决定性瞬间，以及真正改变球员轨迹的节点。" },
  { icon: Heart, title: "红军渊源", text: "他如何来到俱乐部，俱乐部又如何陪他走过低谷与困难。" },
  { icon: BookOpen, title: "第一人称", text: "球员自述、专访、饮食与训练故事，保留原始出处。" },
  { icon: Camera, title: "球迷二创", text: "梗、意象、同人文字与视觉作品，由球迷共同补全人物。" },
];

export default function SquadPage() {
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
        <a className="source-link" href="https://www.liverpoolfc.com/team/mens" target="_blank" rel="noreferrer">
          官方一线队名单
          <ArrowUpRight aria-hidden="true" size={15} />
        </a>
      </header>

      <section className="roster-hero section-shell">
        <div>
          <span className="section-index">SQUAD MAP · 2026 / 27</span>
          <h1>轮换不是配角，<br />它决定赛季能走多远。</h1>
        </div>
        <div className="roster-intro">
          <p>
            这里收录当前主要轮换与替补池。比赛日名单会随对手、伤病与状态变化，
            所以我们不把任何一场的九人替补误写成固定答案。
          </p>
          <div className="snapshot-line"><span /> 名单快照 · 2026.09.02</div>
        </div>
      </section>

      <section className="photo-method section-shell" aria-labelledby="photo-method-title">
        <div>
          <span>PHOTO STANDARD</span>
          <h2 id="photo-method-title">照片怎么选</h2>
        </div>
        <ol>
          <li><b>01</b><span>脸部清晰、人物可辨认</span></li>
          <li><b>02</b><span>优先利物浦比赛、训练或正式到场</span></li>
          <li><b>03</b><span>旧队服只作过渡图，并在卡片上明示</span></li>
          <li><b>04</b><span>原图、作者与授权全部可点击核验</span></li>
        </ol>
      </section>

      <section className="section-shell rotation-shell" aria-label="轮换与替补球员">
        {rotationGroups.map((group, index) => {
          const players = rotationSquad.filter((player) => player.group === group);

          return (
            <section className="rotation-group" key={group} aria-labelledby={`group-${index}`}>
              <div className="rotation-group-heading">
                <span>0{index + 1}</span>
                <h2 id={`group-${index}`}>{group}</h2>
                <p>{players.length} 名观察对象</p>
              </div>
              <div className="rotation-grid">
                {players.map((player) => (
                  <PlayerCard key={player.slug} player={player} profileHint />
                ))}
              </div>
            </section>
          );
        })}

        <PhotoCredits players={rotationSquad} />
      </section>

      <section className="profile-blueprint">
        <div className="section-shell">
          <div className="section-heading light">
            <div>
              <span className="section-index">NEXT / PLAYER ARCHIVES</span>
              <h2>每个人，都值得一页。</h2>
            </div>
            <p>这一版已经为个人页预留统一入口；下一阶段逐个补上故事与球迷创作。</p>
          </div>
          <div className="profile-module-grid">
            {profileModules.map(({ icon: Icon, title, text }, index) => (
              <article key={title}>
                <div><Icon aria-hidden="true" size={20} /><span>0{index + 1}</span></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">R/26</span>
          <span className="brand-copy">
            <strong>RED CHORUS</strong>
            <small className="brand-zh">红潮同行</small>
            <small className="brand-tagline">For those who never walk alone.</small>
          </span>
        </div>
        <p>非官方、非商业的独立球迷项目，与 Liverpool FC 无隶属或授权关系。</p>
        <p className="image-credit"><a href="#top">回到顶部</a></p>
      </footer>
    </main>
  );
}
