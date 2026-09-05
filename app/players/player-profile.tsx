import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

type ProfileFact = {
  label: string;
  value: string;
};

type NumberedProfilePoint = {
  number: string;
  label: string;
  title: string;
  text: string;
};

type ProfileSource = {
  label: string;
  publisher: string;
  href: string;
};

type EditorialProfileImage = {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  creditHref: string;
  position?: string;
};

export type PlayerProfileData = {
  slug: string;
  archiveNumber: string;
  seo: {
    title: string;
    description: string;
  };
  hero: {
    kicker: string;
    name: readonly string[];
    statementNumber: string;
    statement: string;
    footerStatement: string;
    image: {
      src: string;
      alt: string;
      credit: string;
      creditHref: string;
      position?: string;
      mobilePosition?: string;
    };
  };
  portrait: {
    overline: string;
    title: readonly string[];
    introduction: readonly string[];
    facts: readonly ProfileFact[];
  };
  performance: {
    sectionLabel: string;
    overline: string;
    title: readonly string[];
    introduction: string;
    motif: string;
    points: readonly NumberedProfilePoint[];
  };
  editorialImages?: readonly EditorialProfileImage[];
  story: {
    overline: string;
    title: readonly string[];
    thesisLabel: string;
    thesis: string;
    context: string;
    arguments: readonly NumberedProfilePoint[];
    coda: {
      lead: string;
      emphasis: string;
    };
    voice: {
      quote: string;
      attribution: string;
      href: string;
      ariaLabel: string;
    };
  };
  definingMoment: {
    topline: string;
    context: string;
    score: {
      home: string;
      result: string;
      away: string;
      ariaLabel: string;
    };
    minute: string;
    overline: string;
    title: readonly string[];
    text: string;
    sourceLabel: string;
    sourceHref: string;
  };
  beyondShirt: {
    overline: string;
    title: readonly string[];
    quote: string;
    quoteAttribution: string;
    body: readonly string[];
  };
  fanMemory: {
    overline: string;
    title: readonly string[];
    text: string;
    words: readonly string[];
  };
  sources: {
    snapshot: string;
    items: readonly ProfileSource[];
  };
};

type PlayerProfileProps = {
  data: PlayerProfileData;
};

type SectionMarkProps = {
  number: string;
  label: string;
  light?: boolean;
};

function SectionMark({ number, label, light = false }: SectionMarkProps) {
  return (
    <div className={`profile-section-mark${light ? " is-light" : ""}`}>
      <span>{number}</span>
      <p>{label}</p>
    </div>
  );
}

function LineBreakTitle({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

export function createPlayerProfileMetadata(data: PlayerProfileData): Metadata {
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

export function PlayerProfile({ data }: PlayerProfileProps) {
  const longestHeroName = Math.max(
    ...data.hero.name.map((name) => name.replaceAll(" ", "").length),
  );
  const nameFit = longestHeroName > 11
    ? "compact"
    : longestHeroName > 8
      ? "narrow"
      : "standard";
  const heroPosition = {
    "--profile-hero-position": data.hero.image.position ?? "50% 32%",
    "--profile-hero-position-mobile":
      data.hero.image.mobilePosition ?? data.hero.image.position ?? "51% 30%",
  } as CSSProperties;

  const archiveLabel = `PLAYER ARCHIVE · ${data.archiveNumber}`;

  return (
    <main
      className={`player-profile ${data.slug}-profile`}
      data-name-fit={nameFit}
      id="top"
      style={heroPosition}
    >
      <header className="profile-header">
        <Link className="brand profile-brand" href="/" aria-label="返回 RED CHORUS 首页">
          <span className="brand-mark" aria-hidden="true">R/26</span>
          <span className="brand-copy">
            <strong>RED CHORUS</strong>
            <small className="brand-zh">红潮同行</small>
            <small className="brand-tagline">For those who never walk alone.</small>
          </span>
        </Link>

        <Link className="profile-back" href="/#squad">
          <ArrowLeft aria-hidden="true" size={16} />
          返回阵容
        </Link>

        <span className="profile-edition">{archiveLabel}</span>
      </header>

      <section className="profile-hero" aria-labelledby="profile-title">
        <div className="profile-hero-copy">
          <span className="profile-kicker">{data.hero.kicker}</span>
          <h1 id="profile-title">
            {data.hero.name.map((name) => <span key={name}>{name}</span>)}
          </h1>
          <div className="profile-hero-statement">
            <span aria-hidden="true">{data.hero.statementNumber}</span>
            <p>{data.hero.statement}</p>
          </div>
        </div>

        <figure className="profile-hero-figure">
          <img src={data.hero.image.src} alt={data.hero.image.alt} />
          <div className="profile-hero-wash" aria-hidden="true" />
          <figcaption>
            <a href={data.hero.image.creditHref} target="_blank" rel="noreferrer">
              {data.hero.image.credit}
              <ArrowUpRight aria-hidden="true" size={13} />
            </a>
          </figcaption>
        </figure>

        <div className="profile-hero-footer">
          <p>{data.hero.footerStatement}</p>
          <a href="#portrait">开始阅读 <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className="profile-portrait profile-shell" id="portrait">
        <SectionMark number="01" label="PORTRAIT" />

        <div className="profile-portrait-copy">
          <p className="profile-overline">{data.portrait.overline}</p>
          <h2><LineBreakTitle lines={data.portrait.title} /></h2>
          <div className="profile-intro-text">
            {data.portrait.introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <dl className="profile-facts">
          {data.portrait.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className="profile-performance"
        aria-labelledby="performance-title"
        data-motif={data.performance.motif}
      >
        <div className="profile-shell">
          <div className="performance-heading">
            <SectionMark number="02" label={data.performance.sectionLabel} light />
            <div>
              <p className="profile-overline">{data.performance.overline}</p>
              <h2 id="performance-title">
                <LineBreakTitle lines={data.performance.title} />
              </h2>
            </div>
            <p>{data.performance.introduction}</p>
          </div>

          <div className="performance-principles">
            {data.performance.points.map((point) => (
              <article key={point.number}>
                <div>
                  <span>{point.number}</span>
                  <small>{point.label}</small>
                </div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </article>
            ))}
          </div>

          <div className="performance-line" aria-hidden="true">
            <span />
            <i />
            <b />
          </div>
        </div>
      </section>

      {data.editorialImages?.length ? (
        <section className="profile-editorial-images profile-shell" aria-label="人物影像">
          {data.editorialImages.map((image) => (
            <figure
              key={image.src}
              style={{
                "--profile-editorial-position": image.position ?? "50% 50%",
              } as CSSProperties}
            >
              <img src={image.src} alt={image.alt} />
              <figcaption>
                <span>{image.caption}</span>
                <a href={image.creditHref} target="_blank" rel="noreferrer">
                  {image.credit}
                  <ArrowUpRight aria-hidden="true" size={13} />
                </a>
              </figcaption>
            </figure>
          ))}
        </section>
      ) : null}

      <section className="profile-story profile-shell" aria-labelledby="story-title">
        <div className="story-heading">
          <SectionMark number="03" label="RED STORY" />
          <div>
            <p className="profile-overline">{data.story.overline}</p>
            <h2 id="story-title"><LineBreakTitle lines={data.story.title} /></h2>
          </div>
        </div>

        <div className="red-story-thesis">
          <div>
            <p className="red-story-label">{data.story.thesisLabel}</p>
            <p className="red-story-lead">{data.story.thesis}</p>
          </div>
          <p className="red-story-context">{data.story.context}</p>
        </div>

        <div className="red-story-arguments">
          {data.story.arguments.map((item) => (
            <article key={item.number}>
              <div className="red-story-index">
                <span>{item.number}</span>
                <small>{item.label}</small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="red-story-coda">
          <p>
            {data.story.coda.lead}<br />
            <em>{data.story.coda.emphasis}</em>
          </p>
          <a
            className="red-story-voice"
            href={data.story.voice.href}
            target="_blank"
            rel="noreferrer"
            aria-label={data.story.voice.ariaLabel}
          >
            <strong>{data.story.voice.quote}</strong>
            <span>{data.story.voice.attribution}</span>
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </div>
      </section>

      <section className="defining-moment" aria-labelledby="moment-title">
        <div className="moment-topline">
          <span>04 / {data.definingMoment.topline}</span>
          <span>{data.definingMoment.context}</span>
        </div>

        <div className="moment-score" aria-label={data.definingMoment.score.ariaLabel}>
          <span>{data.definingMoment.score.home}</span>
          <strong>{data.definingMoment.score.result}</strong>
          <span>{data.definingMoment.score.away}</span>
        </div>

        <div className="moment-copy">
          <p className="moment-minute">{data.definingMoment.minute}</p>
          <div>
            <p className="profile-overline">{data.definingMoment.overline}</p>
            <h2 id="moment-title">
              <LineBreakTitle lines={data.definingMoment.title} />
            </h2>
            <p>{data.definingMoment.text}</p>
            <a href={data.definingMoment.sourceHref} target="_blank" rel="noreferrer">
              {data.definingMoment.sourceLabel}
              <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="profile-human profile-shell" aria-labelledby="human-title">
        <SectionMark number="05" label="BEYOND THE SHIRT" />

        <div className="human-heading">
          <p className="profile-overline">{data.beyondShirt.overline}</p>
          <h2 id="human-title"><LineBreakTitle lines={data.beyondShirt.title} /></h2>
        </div>

        <div className="human-grid">
          <blockquote>
            <p>{data.beyondShirt.quote}</p>
            <cite>{data.beyondShirt.quoteAttribution}</cite>
          </blockquote>
          <div>
            {data.beyondShirt.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="fan-memory" aria-labelledby="memory-title">
        <div className="profile-shell fan-memory-layout">
          <SectionMark number="06" label="THE KOP REMEMBERS" light />
          <div>
            <p className="profile-overline">{data.fanMemory.overline}</p>
            <h2 id="memory-title"><LineBreakTitle lines={data.fanMemory.title} /></h2>
          </div>
          <p>{data.fanMemory.text}</p>
          <div className="memory-words" aria-label="球迷印象">
            {data.fanMemory.words.map((word) => <span key={word}>{word}</span>)}
          </div>
        </div>
      </section>

      <section className="profile-sources profile-shell" aria-labelledby="sources-title">
        <div>
          <p className="profile-overline">资料索引</p>
          <h2 id="sources-title">每段故事，都能回到出处。</h2>
          <p>资料快照 · {data.sources.snapshot}</p>
        </div>
        <div className="source-list">
          {data.sources.items.map((source, index) => (
            <a href={source.href} target="_blank" rel="noreferrer" key={source.href}>
              <span>{String(index + 1).padStart(2, "0")}</span>
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
          <span className="brand-copy">
            <strong>RED CHORUS</strong>
            <small className="brand-zh">红潮同行</small>
            <small className="brand-tagline">For those who never walk alone.</small>
          </span>
        </Link>
        <p>非官方、非商业的独立球迷项目，与 Liverpool FC 无隶属或授权关系。</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </main>
  );
}
