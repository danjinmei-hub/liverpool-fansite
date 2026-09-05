import {
  createPlayerProfileMetadata,
  PlayerProfile,
  type PlayerProfileData,
} from "../player-profile";

const alissonProfile = {
  slug: "alisson-becker",
  archiveNumber: "001",
  seo: {
    title: "Alisson Becker｜球员故事",
    description:
      "阿利松·贝克尔的利物浦人物档案：技术画像、红军意义、决定性瞬间与可核验来源。",
  },
  hero: {
    kicker: "GOALKEEPER · LIVERPOOL",
    name: ["ALISSON", "BECKER"],
    statementNumber: "01",
    statement: "利物浦最需要进球的那一刻，门将跑进了对方禁区。",
    footerStatement: "那粒进球留在集锦里。身后有人守着的安心，陪伴了利物浦很多年。",
    image: {
      src: "/players/alisson.jpg",
      alt: "身穿利物浦训练服抵达球场的 Alisson Becker",
      credit: "PHOTO · TIMMY96 · CC0",
      creditHref:
        "https://commons.wikimedia.org/wiki/File:Alisson_Becker_04012026_(1).jpg",
      position: "50% 32%",
      mobilePosition: "51% 30%",
    },
  },
  portrait: {
    overline: "一分钟认识他",
    title: ["门前的最后一人，", "也是进攻的第一人。"],
    introduction: [
      "阿利松的许多扑救，真正的起点在射门之前。他提前半步站好位置；下一秒，一个干净的动作结束危险。",
      "2018 年加盟以来，他把门线技术、禁区控制和出球能力放进同一套比赛逻辑。中卫敢把防线推高，前场敢继续压迫。镇定从球门前传向整支球队。",
    ],
    facts: [
      { label: "出生", value: "1992.10.02" },
      { label: "国籍", value: "巴西" },
      { label: "加盟", value: "2018" },
      { label: "来自", value: "AS Roma" },
      { label: "号码", value: "01" },
      { label: "位置", value: "门将" },
    ],
  },
  performance: {
    sectionLabel: "THE KEEPER",
    overline: "球场上的他",
    title: ["最好的扑救，", "往往开始于射门之前。"],
    introduction:
      "阿利松的存在感来自选择：站在哪里，何时出击，接球后把第一脚送向何处。他先压缩危险，再把球权交还给利物浦。",
    motif: "01",
    points: [
      {
        number: "01",
        label: "POSITIONING",
        title: "先站对，再扑救",
        text: "许多扑救看起来简单，因为射门发生前，他已经用站位缩小了球门。飞身完成动作，判断决定结果。",
      },
      {
        number: "02",
        label: "ONE-ON-ONE",
        title: "把单刀变成选择题",
        text: "面对持球者，他常把重心留到最后一刻。等待、逼近、封住角度，前锋面前的球门越变越小，选择也越来越少。",
      },
      {
        number: "03",
        label: "FIRST PASS",
        title: "扑救之后，进攻开始",
        text: "接住球，抬头，手抛或长传越过压迫。一次扑救结束，利物浦的下一次进攻已经起步。",
      },
    ],
  },
  story: {
    overline: "红军故事",
    title: ["他的分量，藏在整支球队的站位里。"],
    thesisLabel: "WHAT HE CHANGED",
    thesis:
      "阿利松把利物浦能够承担的风险向前推了一步。身后有他，防线敢压得更高，队友敢把更多人留在进攻端。",
    context:
      "扑救集锦能让一位门将留下名字。阿利松把影响延伸到球门之外：他管理身后的空间、进攻的第一脚，以及全队面对反击时的底气。",
    arguments: [
      {
        number: "01",
        label: "TRUST",
        title: "信任，从身后传来",
        text: "单刀出现时，安菲尔德的第一反应逐渐从惊慌变成等待。中卫可以转身准备下一次压迫，因为身后站着阿利松。一次次化解之后，信任成了球队的日常。",
      },
      {
        number: "02",
        label: "COURAGE",
        title: "让利物浦敢于冒险",
        text: "高位防线把大片空间留在身后。阿利松用出击清理纵深，用单刀判断拖慢前锋，再用第一脚传球把球队送回前场。他替这套进攻足球守住了可以冒险的尺度。",
      },
      {
        number: "03",
        label: "LEGACY",
        title: "重压之下，答案出现",
        text: "那不勒斯的封堵守住欧冠之路，西布朗的头球托住一个艰难赛季。更多夜晚，他用接球、站位和一次平静的处理维持秩序。高光让人记住名字，长年的可靠让球迷把这个名字当成答案。",
      },
    ],
    coda: {
      lead: "他让一支本就勇敢的球队，",
      emphasis: "敢于离自己的球门更远。",
    },
    voice: {
      quote: "“Fantastic.”",
      attribution: "VIRGIL VAN DIJK · NAPOLI, 2018",
      href: "https://www.liverpoolfc.com/news/first-team/329884-van-dijk-alisson-save-liverpool-napoli-reaction",
      ariaLabel: "查看范戴克对阿利松扑救的评价",
    },
  },
  definingMoment: {
    topline: "DEFINING MOMENT",
    context: "THE HAWTHORNS · 16 MAY 2021",
    score: {
      home: "WBA",
      result: "1—2",
      away: "LIV",
      ariaLabel: "西布朗一比二利物浦",
    },
    minute: "90+5",
    overline: "最后一次角球",
    title: ["门将跑过整个球场，", "然后像一名前锋那样起跳。"],
    text: "特伦特·亚历山大-阿诺德开出角球，阿利松从远端起跳，甩头把球送进网窝。他成为利物浦队史首位进球的门将，也为一个艰难赛季抢回了关键的三分。",
    sourceLabel: "查看官方比赛记录",
    sourceHref:
      "https://www.liverpoolfc.com/news/first-team/434274-alisson-becker-west-brom-premier-league-match-report",
  },
  beyondShirt: {
    overline: "球衣之外",
    title: ["门前沉着，谈起家人时依然动情。"],
    quote: "“那次扑救，感觉就像在最后时刻打进制胜球。”",
    quoteAttribution: "— 阿利松回忆 2018 年对那不勒斯的关键扑救",
    body: [
      "2021 年的头球之后，他先谈家人与队友。那粒写进队史的进球，在他的讲述里属于许多人。球迷熟悉门前的镇定，也看见了球衣之下的真诚。",
      "家庭、信仰、训练与生活的故事，仍会沿着可靠采访补入。这份档案坚持一条边界：每个细节都能回到原始出处。",
    ],
  },
  fanMemory: {
    overline: "球迷档案",
    title: ["我们记住的，", "远比扑救更多。"],
    text: "欧冠生死线上的那一挡，助攻萨拉赫后奔向看台的庆祝，还有第 95 分钟出现在对方禁区的灰色身影。每一幕都属于同一个人：守门，也守住利物浦继续向前的可能。",
    words: ["安全感", "门神", "门锋"],
  },
  sources: {
    snapshot: "2026.09.03",
    items: [
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
    ],
  },
} satisfies PlayerProfileData;

export const metadata = createPlayerProfileMetadata(alissonProfile);

export default function AlissonProfilePage() {
  return <PlayerProfile data={alissonProfile} />;
}
