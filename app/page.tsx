import {
  ArrowUpRight,
  CalendarDays,
  CircleDot,
  Clock3,
  Database,
  Gauge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { PhotoCredits } from "./photo-credits";
import { PlayerCard } from "./player-card";
import { coreSquad } from "./squad-data";

const news = [
  {
    status: "已确认",
    date: "09.01",
    title: "布拉德利·巴尔科拉加盟利物浦",
    summary: "法国边锋从巴黎圣日耳曼转会而来，成为今夏第四位新援。",
    href: "https://www.liverpoolfc.com/news/liverpool-sign-bradley-barcola-paris-saint-germain",
  },
  {
    status: "比赛报告",
    date: "08.29",
    title: "伊萨克、穆尼奥斯破门，红军主场 2–2 战平森林",
    summary: "连续第二轮两度落后、两度扳平；强度提升发生在下半场。",
    href: "https://www.liverpoolfc.com/news/isak-and-munoz-score-liverpool-draw-nottingham-forest",
  },
  {
    status: "已确认",
    date: "09.02",
    title: "哈维·埃利奥特租借加盟瓦伦西亚",
    summary: "租期覆盖整个 2026/27 赛季，球员继续寻求稳定比赛时间。",
    href: "https://www.liverpoolfc.com/news/harvey-elliott-joins-valencia-loan-2026-27",
  },
];

const principles = [
  {
    icon: Gauge,
    label: "无球阶段",
    title: "压迫先于控球",
    text: "缩短与对手的距离，赢下对抗后立即进入下一次进攻。",
    index: "01",
  },
  {
    icon: CircleDot,
    label: "有球阶段",
    title: "更快地向前",
    text: "减少无效传递，让中场接球后的第一选择更具纵向威胁。",
    index: "02",
  },
  {
    icon: Sparkles,
    label: "边路阶段",
    title: "换位制造错位",
    text: "边锋可以交换侧翼，根据对位决定内切、下底或回撤接应。",
    index: "03",
  },
];

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="source-link" href={href} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
    </a>
  );
}

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="回到首页顶部">
          <span className="brand-mark" aria-hidden="true">R/26</span>
          <span className="brand-copy">
            <strong>RED ERA</strong>
            <small>独立中文球迷档案</small>
          </span>
        </a>

        <nav aria-label="主要导航">
          <a href="#matchday">比赛</a>
          <Link href="/squad">阵容</Link>
          <a href="#tactics">战术</a>
          <a href="#updates">动态</a>
        </nav>

        <SourceLink href="https://www.liverpoolfc.com/">LFC 官方</SourceLink>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-image" aria-hidden="true">
          <img src="/anfield-cc0.jpg" alt="" />
          <div className="hero-shade" />
          <div className="hero-grid" />
        </div>

        <div className="hero-copy">
          <div className="eyebrow"><span /> 2026 / 27 · ANFIELD</div>
          <h1 id="hero-title">
            <span>THE</span>
            <span>NEW ERA</span>
          </h1>
          <p>
            一座为中文球迷建立的利物浦观察站：比赛、阵容、战术和历史，
            每条会变化的信息都留下日期与出处。
          </p>
          <div className="freshness">
            <Clock3 aria-hidden="true" size={16} />
            <span>数据快照</span>
            <strong>2026.09.02</strong>
            <i aria-hidden="true" />
            <span>来源已核验</span>
          </div>
        </div>

        <div className="hero-note">
          <span>ISSUE</span>
          <strong>001</strong>
          <small>THE FIRST LINE</small>
        </div>
      </section>

      <section className="matchday" id="matchday" aria-label="比赛日概览">
        <article className="match-card last-match">
          <div className="card-topline">
            <span>上一场 · 英超第 2 轮</span>
            <span>FT</span>
          </div>
          <div className="score-row">
            <div><span className="team-code active">LIV</span><small>利物浦</small></div>
            <strong>2<span>—</span>2</strong>
            <div className="away-team"><span className="team-code">NFO</span><small>诺丁汉森林</small></div>
          </div>
          <div className="match-meta">
            <span>伊萨克 60′</span>
            <span>穆尼奥斯 82′</span>
            <span>安菲尔德</span>
          </div>
        </article>

        <article className="match-card next-match">
          <div className="card-topline">
            <span>下一场 · 英超第 3 轮</span>
            <CalendarDays aria-hidden="true" size={17} />
          </div>
          <div className="fixture-row">
            <div>
              <strong>IPS</strong>
              <span>伊普斯维奇</span>
            </div>
            <p><b>05</b><span>SEP</span></p>
            <div className="right">
              <strong>LIV</strong>
              <span>利物浦</span>
            </div>
          </div>
          <div className="match-meta">
            <span>周六 22:00 · 北京时间</span>
            <span>Portman Road</span>
          </div>
        </article>

        <article className="season-card">
          <div className="card-topline">
            <span>赛季脉搏</span>
            <span className="live-dot">进行中</span>
          </div>
          <div className="season-numbers">
            <div><strong>02</strong><span>比赛</span></div>
            <div><strong>02</strong><span>积分</span></div>
            <div><strong>4:4</strong><span>进失球</span></div>
          </div>
          <p>两场平局，进攻韧性已经出现；如何更早进入强度，是当前最清楚的问题。</p>
        </article>
      </section>

      <section className="section-shell squad-section" id="squad">
        <div className="section-heading">
          <div>
            <span className="section-index">01 / SQUAD</span>
            <h2>新时代的骨架</h2>
          </div>
          <div className="squad-heading-action">
            <p>第一版最值得持续观察的十个战术节点。</p>
            <Link href="/squad">查看轮换与替补 <ArrowUpRight aria-hidden="true" size={16} /></Link>
          </div>
        </div>

        <div className="squad-grid">
          {coreSquad.map((player) => (
            <PlayerCard player={player} key={player.slug} />
          ))}
        </div>

        <PhotoCredits players={coreSquad} />

        <div className="captain-strip">
          <div className="captain-monogram">VVD</div>
          <div>
            <span>CAPTAIN · NO.04</span>
            <h3>Virgil van Dijk</h3>
          </div>
          <p>当阵容高速换代，队长仍是这支球队最重要的稳定坐标。</p>
        </div>
      </section>

      <section className="tactics-section" id="tactics">
        <div className="section-shell">
          <div className="section-heading light">
            <div>
              <span className="section-index">02 / TACTICS</span>
              <h2>伊劳拉的第一课</h2>
            </div>
            <p>两轮比赛只是早期样本。这里记录原则，不把猜测伪装成结论。</p>
          </div>

          <div className="tactics-layout">
            <div className="coach-panel">
              <span className="coach-label">HEAD COACH · 2026—</span>
              <div className="coach-name">
                <span>A</span>
                <h3>ANDONI<br />IRAOLA</h3>
              </div>
              <blockquote>
                “无球时的强度，会直接决定我们拿球后能否更快、更好地进攻。”
              </blockquote>
              <SourceLink href="https://www.liverpoolfc.com/news/andoni-iraola-press-conference-liverpool-2-2-nottingham-forest">
                查看发布会原文
              </SourceLink>
            </div>

            <div className="principles-grid">
              {principles.map(({ icon: Icon, label, title, text, index }) => (
                <article key={title}>
                  <div className="principle-top">
                    <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                    <span>{index}</span>
                  </div>
                  <small>{label}</small>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell updates-section" id="updates">
        <div className="section-heading">
          <div>
            <span className="section-index">03 / VERIFIED UPDATES</span>
            <h2>只把事实叫作事实</h2>
          </div>
          <div className="verified-badge"><ShieldCheck size={17} /> 官方来源优先</div>
        </div>

        <div className="news-grid">
          {news.map((item) => (
            <a href={item.href} target="_blank" rel="noreferrer" className="news-card" key={item.title}>
              <div className="news-meta">
                <span>{item.status}</span>
                <time dateTime={`2026-${item.date.replace(".", "-")}`}>{item.date}</time>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="read-more">查看来源 <ArrowUpRight size={16} /></div>
            </a>
          ))}
        </div>

        <div className="data-promise">
          <Database aria-hidden="true" size={22} />
          <div>
            <strong>这座网站的数据承诺</strong>
            <p>官宣、媒体报道与本站分析严格分层；过期内容保留时间戳，不悄悄改写历史。</p>
          </div>
          <span>LAST CHECKED<br /><b>02 SEP 2026</b></span>
        </div>
      </section>

      <section className="archive-section" aria-labelledby="archive-title">
        <div className="archive-number" aria-hidden="true">1892</div>
        <div className="archive-copy">
          <span>COMING NEXT · THE ARCHIVE</span>
          <h2 id="archive-title">历史不是背景，<br />它仍在解释今天。</h2>
          <p>从香克利到克洛普，从杰拉德到萨拉赫：下一阶段将建立可检索的教练、球员与经典比赛档案。</p>
          <SourceLink href="https://www.liverpoolfc.com/history">进入官方历史页</SourceLink>
        </div>
        <div className="archive-years" aria-label="重要年份">
          <span>1959</span><span>1977</span><span>2005</span><span>2019</span><span>2025</span>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">R/26</span>
          <span className="brand-copy"><strong>RED ERA</strong><small>Built from the first line.</small></span>
        </div>
        <p>非官方、非商业的独立球迷项目，与 Liverpool FC 无隶属或授权关系。</p>
        <p className="image-credit">
          首页图片：Ambitious Creative Co. / Rick Barrett，
          <a href="https://commons.wikimedia.org/wiki/File:Liverpool_football_stadium_(Unsplash).jpg" target="_blank" rel="noreferrer">CC0</a>
        </p>
      </footer>
    </main>
  );
}
