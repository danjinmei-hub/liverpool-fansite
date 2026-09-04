import {
  createPlayerProfileMetadata,
  PlayerProfile,
  type PlayerProfileData,
} from "../player-profile";

const alissonProfile = {
  slug: "alisson-becker",
  archiveNumber: "001",
  seo: {
    title: "Alisson Becker｜RED ERA 球员档案",
    description:
      "阿利松·贝克尔的利物浦人物档案：技术画像、红军意义、决定性瞬间与可核验来源。",
  },
  hero: {
    kicker: "GOALKEEPER · LIVERPOOL",
    name: ["ALISSON", "BECKER"],
    statementNumber: "01",
    statement: "他最著名的一次破门，来自一个本不该进球的人。",
    footerStatement: "但他真正给予利物浦的，是身后有人守着的安全感。",
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
      "阿利松的伟大很少依靠喧闹证明。更多时候，他只是站在那里：提前半步，等待射门，然后用一个看似简单的动作结束危险。",
      "2018 年加盟以来，他将门线技术、禁区控制和现代门将的出球能力带进同一个身体。对利物浦而言，他不只是最后一道防线，更是一种可以传递给整支球队的镇定。",
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
      "阿利松不是依靠高频表演制造存在感的门将。他的比赛建立在空间、时间和选择之上：先把危险变小，再把球权送回球队。",
    motif: "01",
    points: [
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
    ],
  },
  story: {
    overline: "红军故事",
    title: ["传奇，不只是因为他扑出了什么。"],
    thesisLabel: "WHAT HE CHANGED",
    thesis:
      "阿利松改变的，不只是利物浦能扑出多少球，而是整支球队敢于承担多大的风险。",
    context:
      "传奇门将常被一连串高光定义。但他之于利物浦，首先是一种结构性的改变：门将不再只是防线最后的补丁，而成为整套足球能够向前展开的根基。",
    arguments: [
      {
        number: "01",
        label: "TRUST",
        title: "从不安，到信任",
        text: "他没有让危险消失，却改变了所有人面对危险时的反应。中卫可以把注意力放在下一次压迫，安菲尔德在单刀出现时也不会立刻认定结局。那种近乎日常的可靠，才是最难复制的能力。",
      },
      {
        number: "02",
        label: "COURAGE",
        title: "让利物浦敢于冒险",
        text: "高位防线意味着身后必须有人管理大片空间。阿利松的出击、单刀判断和第一脚传球，让十名队友可以作为一个整体向前。他守住的不只是球门，也是利物浦进攻性的边界。",
      },
      {
        number: "03",
        label: "LEGACY",
        title: "当可靠成为传奇",
        text: "如果只有稳定，他仍会是一位伟大门将；那不勒斯的封堵、西布朗的头球，以及大赛中一次次不动声色的处理，则让这种伟大进入了共同记忆。传奇不是集锦的总和，而是球队最需要答案时，球迷总会想到同一个人。",
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
    text: "特伦特·亚历山大-阿诺德开出角球，阿利松在远离自己球门的一端甩头破门。那是利物浦队史第一粒由门将打进的进球，也是一个艰难赛季里最不可思议的三分。",
    sourceLabel: "查看官方比赛记录",
    sourceHref:
      "https://www.liverpoolfc.com/news/first-team/434274-alisson-becker-west-brom-premier-league-match-report",
  },
  beyondShirt: {
    overline: "球衣之外",
    title: ["冷静，并不意味着没有情绪。"],
    quote: "“那次扑救，感觉就像在最后时刻打进制胜球。”",
    quoteAttribution: "— 阿利松回忆 2018 年对那不勒斯的关键扑救",
    body: [
      "2021 年的头球之后，他首先谈到的不是个人纪录，而是家人与队友。这也解释了为什么许多球迷对他的感情超出了技术评价：可靠之外，还有真诚。",
      "关于家庭、信仰、训练和生活的第一手材料，会继续沿着可靠采访逐步补入；这份档案只记录能够找到原始出处的故事。",
    ],
  },
  fanMemory: {
    overline: "球迷档案",
    title: ["我们记住的，", "不只是那些扑救。"],
    text: "是欧冠生死线上的那一挡，是助攻萨拉赫后冲向看台的庆祝，也是第 95 分钟出现在对方禁区里的那件灰色门将球衣。",
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
