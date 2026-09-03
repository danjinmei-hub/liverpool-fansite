import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Alisson Becker｜RED ERA 球员档案",
  description:
    "阿利松·贝克尔的利物浦人物档案：技术画像、红军时间线、决定性瞬间与可核验来源。",
};

const facts = [
  { label: "出生", value: "1992.10.02" },
  { label: "国籍", value: "巴西" },
  { label: "加盟", value: "2018" },
  { label: "来自", value: "AS Roma" },
  { label: "号码", value: "01" },
  { label: "位置", value: "门将" },
];

const keeperPrinciples = [
  {
    number: "01",
    label: "POSITIONING",
    title: "先站对，再扑救",
    text: "他的许多扑救并不显得夸张，因为在射门发生之前，他已经用站位缩小了球门。稳定首先来自判断，而不是飞身。",
  },
  {
    number: "02",
    label: "ONE-ON-ONE",
    title: "把单刀变成选择题",
    text: "面对持球者时，他很少过早倒地。等待、逼近、封住角度，让前锋必须在越来越少的空间里作出决定。",
  },
  {
    number: "03",
    label: "FIRST PASS",
    title: "扑救之后，进攻开始",
    text: "一次稳妥的接球、迅速的手抛球或穿越压迫的长传，都可能让防守瞬间变成利物浦的下一次进攻。",
  },
];

const timeline = [
  {
    date: "2018.07",
    title: "来到安菲尔德",
    text: "从罗马加盟，并立即成为首发门将。利物浦寻找多年的稳定感，从这里开始有了具体的名字。",
  },
  {
    date: "2018.12",
    title: "那次像进球一样的扑救",
    text: "欧冠小组赛最后时刻封出米利克的近距离射门，守住对那不勒斯的 1–0，也守住了后来通往马德里的道路。",
  },
  {
    date: "2019.06",
    title: "马德里，零封与第六冠",
    text: "欧冠决赛面对托特纳姆热刺完成八次扑救。一个赛季建立的信任，最终落在了最重的一座奖杯上。",
  },
  {
    date: "2020",
    title: "三十年的等待结束",
    text: "利物浦成为英格兰顶级联赛冠军。门前的镇定，是那支冠军球队最牢固的结构之一。",
  },
  {
    date: "2021.05",
    title: "他跑向了另一端的禁区",
    text: "第 95 分钟头球绝杀西布朗，成为利物浦队史第一位取得进球的门将，并帮助球队守住欧冠资格的希望。",
  },
  {
    date: "2025",
    title: "再次成为英超冠军",
    text: "第二座英超冠军写入履历。时间改变了身前的阵容，却没有改变球迷看见他时的那份笃定。",
  },
];

const sources = [
  {
    label: "球员资料与主要荣誉",
    publisher: "Liverpool FC",
    href: "https://www.liverpoolfc.com/team/mens/player/alisson-becker",
  },
  {
    label: "2018 年对那不勒斯的关键扑救",
    publisher: "Liverpool FC",
    href: "https://www.liverpoolfc.com/news/first-team/330340-alisson-becker-liverpool-napoli-save",
  },
  {
    label: "2021 年对西布朗的第 95 分钟进球",
    publisher: "Liverpool FC",
    href: "https://www.liverpoolfc.com/news/first-team/434274-alisson-becker-west-brom-premier-league-match-report",
  },
  {
    label: "英超出场与零封数据",
    publisher: "Premier League",
    href: "https://www.premierleague.com/en/players/116535/alisson-becker/overview",
  },
];

export default function AlissonProfilePage() {
  return (
    <main className="player-profile alisson-profile" id="top">
      <header className="profile-header">
        <Link className="brand profile-brand" href="/" aria-label="返回 RED ERA 首页">
          <span className="brand-mark" aria-hidden="true">R/26</span>
          <span className="brand-copy">
            <strong>RED ERA</strong>
            <small>独立中文球迷档案</small>
          </span>
        </Link>

        <Link className="profile-back" href="/#squad">
          <ArrowLeft aria-hidden="true" size={16} />
          返回阵容
        </Link>

        <span className="profile-edition">PLAYER ARCHIVE · 001</span>
      </header>

      <section className="profile-hero" aria-labelledby="profile-title">
        <div className="profile-hero-copy">
          <span className="profile-kicker">GOALKEEPER · LIVERPOOL</span>
          <h1 id="profile-title">
            <span>ALISSON</span>
            <span>BECKER</span>
          </h1>
          <div className="profile-hero-statement">
            <span aria-hidden="true">01</span>
            <p>他最著名的一次破门，来自一个本不该进球的人。</p>
          </div>
        </div>

        <figure className="profile-hero-figure">
          <img
            src="/players/alisson.jpg"
            alt="身穿利物浦训练服抵达球场的 Alisson Becker"
          />
          <div className="profile-hero-wash" aria-hidden="true" />
          <figcaption>
            <a
              href="https://commons.wikimedia.org/wiki/File:Alisson_Becker_04012026_(1).jpg"
              target="_blank"
              rel="noreferrer"
            >
              PHOTO · TIMMY96 · CC0
              <ArrowUpRight aria-hidden="true" size={13} />
            </a>
          </figcaption>
        </figure>

        <div className="profile-hero-footer">
          <p>但他真正给予利物浦的，是身后有人守着的安全感。</p>
          <a href="#portrait">开始阅读 <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className="profile-portrait profile-shell" id="portrait">
        <div className="profile-section-mark">
          <span>01</span>
          <p>PORTRAIT</p>
        </div>

        <div className="profile-portrait-copy">
          <p className="profile-overline">一分钟认识他</p>
          <h2>门前的最后一人，<br />也是进攻的第一人。</h2>
          <div className="profile-intro-text">
            <p>
              阿利松的伟大很少依靠喧闹证明。更多时候，他只是站在那里：提前半步，
              等待射门，然后用一个看似简单的动作结束危险。
            </p>
            <p>
              2018 年加盟以来，他将门线技术、禁区控制和现代门将的出球能力带进同一个身体。
              对利物浦而言，他不只是最后一道防线，更是一种可以传递给整支球队的镇定。
            </p>
          </div>
        </div>

        <dl className="profile-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="keeper-section" aria-labelledby="keeper-title">
        <div className="profile-shell">
          <div className="keeper-heading">
            <div className="profile-section-mark is-light">
              <span>02</span>
              <p>THE KEEPER</p>
            </div>
            <div>
              <p className="profile-overline">球场上的他</p>
              <h2 id="keeper-title">最好的扑救，<br />往往开始于射门之前。</h2>
            </div>
            <p>
              阿利松不是依靠高频表演制造存在感的门将。他的比赛建立在空间、时间和选择之上：
              先把危险变小，再把球权送回球队。
            </p>
          </div>

          <div className="keeper-principles">
            {keeperPrinciples.map((principle) => (
              <article key={principle.number}>
                <div>
                  <span>{principle.number}</span>
                  <small>{principle.label}</small>
                </div>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>

          <div className="keeper-line" aria-hidden="true">
            <span />
            <i />
            <b />
          </div>
        </div>
      </section>

      <section className="profile-story profile-shell" aria-labelledby="story-title">
        <div className="story-heading">
          <div className="profile-section-mark">
            <span>03</span>
            <p>RED STORY</p>
          </div>
          <div>
            <p className="profile-overline">红军故事</p>
            <h2 id="story-title">信任不是一场比赛建立的。</h2>
          </div>
        </div>

        <ol className="profile-timeline">
          {timeline.map((item, index) => (
            <li key={item.date}>
              <time>{item.date}</time>
              <span className="timeline-index">0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="defining-moment" aria-labelledby="moment-title">
        <div className="moment-topline">
          <span>04 / DEFINING MOMENT</span>
          <span>THE HAWTHORNS · 16 MAY 2021</span>
        </div>

        <div className="moment-score" aria-label="西布朗一比二利物浦">
          <span>WBA</span>
          <strong>1—2</strong>
          <span>LIV</span>
        </div>

        <div className="moment-copy">
          <p className="moment-minute">90+5</p>
          <div>
            <p className="profile-overline">最后一次角球</p>
            <h2 id="moment-title">门将跑过整个球场，<br />然后像一名前锋那样起跳。</h2>
            <p>
              特伦特·亚历山大-阿诺德开出角球，阿利松在远离自己球门的一端甩头破门。
              那是利物浦队史第一粒由门将打进的进球，也是一个艰难赛季里最不可思议的三分。
            </p>
            <a
              href="https://www.liverpoolfc.com/news/first-team/434274-alisson-becker-west-brom-premier-league-match-report"
              target="_blank"
              rel="noreferrer"
            >
              查看官方比赛记录 <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="profile-human profile-shell" aria-labelledby="human-title">
        <div className="profile-section-mark">
          <span>05</span>
          <p>BEYOND THE SHIRT</p>
        </div>

        <div className="human-heading">
          <p className="profile-overline">球衣之外</p>
          <h2 id="human-title">冷静，并不意味着没有情绪。</h2>
        </div>

        <div className="human-grid">
          <blockquote>
            <p>“那次扑救，感觉就像在最后时刻打进制胜球。”</p>
            <cite>— 阿利松回忆 2018 年对那不勒斯的关键扑救</cite>
          </blockquote>
          <div>
            <p>
              2021 年的头球之后，他首先谈到的不是个人纪录，而是家人与队友。
              这也解释了为什么许多球迷对他的感情超出了技术评价：可靠之外，还有真诚。
            </p>
            <p>
              关于家庭、信仰、训练和生活的第一手材料，会继续沿着可靠采访逐步补入；
              这份档案只记录能够找到原始出处的故事。
            </p>
          </div>
        </div>
      </section>

      <section className="fan-memory" aria-labelledby="memory-title">
        <div className="profile-shell fan-memory-layout">
          <div className="profile-section-mark is-light">
            <span>06</span>
            <p>THE KOP REMEMBERS</p>
          </div>
          <div>
            <p className="profile-overline">球迷档案</p>
            <h2 id="memory-title">我们记住的，<br />不只是那些扑救。</h2>
          </div>
          <p>
            是欧冠生死线上的那一挡，是助攻萨拉赫后冲向看台的庆祝，
            也是第 95 分钟出现在对方禁区里的那件灰色门将球衣。
          </p>
          <div className="memory-words" aria-label="球迷印象">
            <span>安全感</span>
            <span>门神</span>
            <span>门锋</span>
          </div>
        </div>
      </section>

      <section className="profile-sources profile-shell" aria-labelledby="sources-title">
        <div>
          <p className="profile-overline">资料索引</p>
          <h2 id="sources-title">每段故事，都能回到出处。</h2>
          <p>资料快照 · 2026.09.03</p>
        </div>
        <div className="source-list">
          {sources.map((source, index) => (
            <a href={source.href} target="_blank" rel="noreferrer" key={source.href}>
              <span>0{index + 1}</span>
              <div>
                <strong>{source.label}</strong>
                <small>{source.publisher}</small>
              </div>
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
          ))}
        </div>
      </section>

      <footer className="profile-footer">
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">R/26</span>
          <span className="brand-copy"><strong>RED ERA</strong><small>PLAYER ARCHIVE · 001</small></span>
        </Link>
        <p>非官方、非商业的独立球迷项目，与 Liverpool FC 无隶属或授权关系。</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </main>
  );
}
