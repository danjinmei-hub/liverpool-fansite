import {
  createPlayerProfileMetadata,
  PlayerProfile,
  type PlayerProfileData,
} from "../player-profile";

const szoboszlaiProfile = {
  slug: "dominik-szoboszlai",
  archiveNumber: "002",
  seo: {
    title: "Dominik Szoboszlai｜球员故事",
    description:
      "索博斯洛伊的利物浦人物特写：强度、向前的比赛语言，以及正在形成的责任感。",
  },
  hero: {
    kicker: "MIDFIELDER · LIVERPOOL",
    name: ["DOMINIK", "SZOBOSZLAI"],
    statementNumber: "08",
    statement: "他很少允许比赛慢下来。",
    footerStatement: "天赋让他决定瞬间。强度让他留在每一分钟里。",
    image: {
      src: "/players/szoboszlai.jpg",
      alt: "身穿利物浦训练服抵达球场的 Dominik Szoboszlai",
      credit: "PHOTO · TIMMY96 · CC0",
      creditHref:
        "https://commons.wikimedia.org/wiki/File:Dominik_Szoboszlai_04012026_(1).jpg",
      position: "50% 20%",
      mobilePosition: "51% 19%",
    },
  },
  portrait: {
    overline: "一分钟认识他",
    title: ["速度写在动作里，", "野心写在下一步。"],
    introduction: [
      "接球、转身、抬头。索博斯洛伊的第一眼常常越过身前的人，去找更靠近球门的空间。球权丢失，他又沿着同一条路线追回去。下一步，总比停留更有吸引力。",
      "2023 年，他从 RB Leipzig 来到 Liverpool。球队让他站过不同的中场区域，也按比赛需要把他放得更宽或更深。角色会变，他给比赛的方向始终清楚：提高速度，把行动推向前方。",
    ],
    facts: [
      { label: "出生", value: "2000.10.25" },
      { label: "国籍", value: "匈牙利" },
      { label: "加盟", value: "2023" },
      { label: "来自", value: "RB Leipzig" },
      { label: "号码", value: "08" },
      { label: "位置", value: "中场" },
    ],
  },
  performance: {
    sectionLabel: "THE PULSE",
    overline: "球场上的他",
    title: ["他把强度，", "变成一种比赛语言。"],
    introduction:
      "索博斯洛伊让比赛保持脉搏。一次前压接着一次回追，接球后的转身连着下一次推进。即使脚下感觉平常，他仍能靠工作量留在比赛中心。",
    motif: "08",
    points: [
      {
        number: "01",
        label: "PRESS",
        title: "跑动从来不是装饰",
        text: "他向持球者压上，也在球被绕过后折返。丢失球权后的第一程、第二程，常由同一个人完成。进攻状态有起伏，这份强度一直在场。",
      },
      {
        number: "02",
        label: "DRIVE",
        title: "第一眼，总在寻找前方",
        text: "接球时，他先看纵向空间。转身摆脱第一道压力，再用带球或传球把防线向后推。动作选择各有不同，目标都是让比赛继续前进。",
      },
      {
        number: "03",
        label: "STRIKE",
        title: "三十码之外，也是一种进攻空间",
        text: "远射和任意球需要技术，也需要起脚的胆量。René Marić 记得，年轻的他会在休息日回到训练场，训练结束后继续练定位球。那些弧线来自长期重复。",
      },
    ],
  },
  editorialImages: [
    {
      src: "/players/szoboszlai-action.jpg",
      alt: "Dominik Szoboszlai 与 Ryan Gravenberch 在比赛前有球训练",
      caption: "球在脚下时，他的身体已经朝向下一段空间。",
      credit: "TIMMY96 · CC0",
      creditHref:
        "https://commons.wikimedia.org/wiki/File:Ryan_Gravenberch_and_Dominik_Szoboszlai_04012026_(1).jpg",
      position: "50% 52%",
    },
    {
      src: "/players/szoboszlai-team.jpg",
      alt: "Dominik Szoboszlai 与 Ryan Gravenberch、Conor Bradley 一同训练",
      caption: "强度属于个人，也在队友之间传递。",
      credit: "TIMMY96 · CC0",
      creditHref:
        "https://commons.wikimedia.org/wiki/File:Ryan_Gravenberch,_Dominik_Szoboszlai_and_Conor_Bradley_04012026_(1).jpg",
      position: "51% 48%",
    },
  ],
  story: {
    overline: "红军故事",
    title: ["他来到 Liverpool 时带着锋芒。", "留下来以后，开始承担重量。"],
    thesisLabel: "WHAT HE IS BECOMING",
    thesis:
      "索博斯洛伊最初带给 Liverpool 的是能量。三年以后，球队开始向他索取另一种东西：标准。",
    context:
      "那套标准藏在重复动作里：前压之后继续跑，丢球之后先回身，队友需要方向时主动站出来。锋芒仍在，责任让它有了更清楚的去处。",
    arguments: [
      {
        number: "01",
        label: "EDGE",
        title: "锋芒从来不是装饰",
        text: "在 Salzburg 共事时，René Marić 看见的是出色的运动能力，也看见一种带分寸的自信。他称之为“positive arrogance”：索博斯洛伊相信自己能抵达更高处，也愿意支付训练、回追和防守的成本。休息日的任意球加练，让自信有了落点。",
      },
      {
        number: "02",
        label: "STANDARD",
        title: "先做到，再要求别人",
        text: "Arne Slot 谈他的领导力，先提无球时的样子：压迫、折返、一次次覆盖前后空间。索博斯洛伊用身体力行设定要求。跑动于是有了第二层意义——它既服务比赛，也告诉身边的人这场比赛需要什么。",
      },
      {
        number: "03",
        label: "RESPONSIBILITY",
        title: "从新援，到需要站出来的人",
        text: "2026 年续约后，他谈到更衣室责任的变化：有人离开，就需要有人向前一步；若轮到自己，他已经准备好。他希望给年轻球员做榜样。个人认可带来确认，童年起那句“never enough”仍推着他往前。",
      },
    ],
    coda: {
      lead: "他曾经只是 Liverpool 中场重建的一部分。",
      emphasis: "现在，新 Liverpool 开始需要他的标准。",
    },
    voice: {
      quote: "“I want to set the example.”",
      attribution: "DOMINIK SZOBOSZLAI · 2026",
      href: "https://www.liverpoolfc.com/news/full-dominik-szoboszlai-new-lfc-contract-responsibility-and-ambitions",
      ariaLabel: "查看索博斯洛伊 2026 年续约完整采访",
    },
  },
  definingMoment: {
    topline: "DEFINING MOMENT",
    context: "ANFIELD · 31 AUG 2025",
    score: {
      home: "LIV",
      result: "1—0",
      away: "ARS",
      ariaLabel: "利物浦一比零阿森纳",
    },
    minute: "83’",
    overline: "三十二码之外",
    title: ["他踢了一整场右后卫，", "然后用一脚任意球决定比赛。"],
    text: "那晚，他在右后卫位置完成压迫、回追和对抗。第 83 分钟，球停在距离球门 32.3 码的位置。他承担风险，皮球绕过人墙击中立柱内侧。九十分钟的工作量与一秒钟的胆量，落在同一场比赛里。这粒进球后来被选为 Liverpool 2025/26 赛季男子队最佳进球。",
    sourceLabel: "查看官方赛季最佳进球记录",
    sourceHref:
      "https://www.liverpoolfc.com/news/dominik-szoboszlais-arsenal-free-kick-voted-liverpools-mens-goal-season",
  },
  beyondShirt: {
    overline: "球衣之外",
    title: ["锋芒之外，", "他已经在这里安家。"],
    quote: "“But it was always Liverpool.”",
    quoteAttribution: "— 2026 年续约采访",
    body: [
      "2026 年谈起新合同时，他把 Liverpool 称作一个大家庭。最初的一次职业选择，经过三个赛季，慢慢变成生活的归属。面对其他可能性，他的答案落回了已经熟悉的城市、球队与更衣室。",
      "这几年里，他成为丈夫，也成为父亲。他说，家让自己在球场上准备得更充分。责任从生活进入比赛：照顾身边的人，承担更多工作，也让年轻队友看见标准如何建立。",
    ],
  },
  fanMemory: {
    overline: "球迷档案",
    title: ["我们记住他的，", "从来不只是一脚重炮。"],
    text: "三十码外抬腿时的安静，丢球后穿过半场的回追，8 号球衣一再出现在比赛最需要强度的位置。球迷喜欢那份锋芒，也开始期待它承担更多。他已经证明自己能够成为 Liverpool 最重要的球员之一。接下来要看的，是他能否成为决定这支球队是什么样子的那批人之一。",
    words: ["强度", "重炮", "担当"],
  },
  sources: {
    snapshot: "2026.09.05",
    items: [
      {
        label: "球员资料、加盟信息与主要荣誉",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/team/mens/player/dominik-szoboszlai",
      },
      {
        label: "2026 年新合同完整采访",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/full-dominik-szoboszlai-new-lfc-contract-responsibility-and-ambitions",
      },
      {
        label: "René Marić 谈天赋、训练与 positive arrogance",
        publisher: "Sky Sports",
        href: "https://www.skysports.com/football/news/11095/12936996/dominik-szoboszlai-at-liverpool-unbelievably-athletic-midfielder-with-positive-arrogance-key-for-jurgen-klopp",
      },
      {
        label: "Arne Slot 谈以行动领导球队",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/how-incredible-dominik-szoboszlai-has-improved-season",
      },
      {
        label: "Arne Slot 谈下一阶段的领导责任",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/arne-slot-press-conference-brighton-win-salah-szoboszlai-jones-and-more",
      },
      {
        label: "对 Arsenal 的任意球与比赛角色",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/i-took-risk-dominik-szoboszlai-analyses-free-kick-winner-against-arsenal",
      },
      {
        label: "2025/26 男子队赛季最佳进球",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/dominik-szoboszlais-arsenal-free-kick-voted-liverpools-mens-goal-season",
      },
      {
        label: "中场里的 dirty job",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/why-dominik-szoboszlai-relishing-doing-dirty-job-arne-slots-liverpool",
      },
    ],
  },
} satisfies PlayerProfileData;

export const metadata = createPlayerProfileMetadata(szoboszlaiProfile);

export default function DominikSzoboszlaiProfilePage() {
  return <PlayerProfile data={szoboszlaiProfile} />;
}
