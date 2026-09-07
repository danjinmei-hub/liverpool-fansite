import {
  createPlayerProfileMetadata,
  PlayerProfile,
  type PlayerProfileData,
} from "../player-profile";

const vanDijkProfile = {
  slug: "virgil-van-dijk",
  archiveNumber: "003",
  seo: {
    title: "Virgil van Dijk｜球员故事",
    description:
      "范戴克的利物浦人物特写：冷静、尺度、职业纪律，以及队长身份带来的持续责任。",
  },
  hero: {
    kicker: "DEFENDER · CAPTAIN · LIVERPOOL",
    name: ["VIRGIL", "VAN DIJK"],
    statementNumber: "04",
    statement: "他让利物浦的标准，有了可以看见的样子。",
    footerStatement: "冷静让他看清危险。纪律让这种判断，一场接一场地出现。",
    image: {
      src: "/players/van-dijk.jpg",
      alt: "抵达 Craven Cottage 的 Liverpool 队长 Virgil van Dijk",
      credit: "PHOTO · TIMMY96 · CC0",
      creditHref:
        "https://commons.wikimedia.org/wiki/File:Virgil_van_Dijk_06042025_(2).jpg",
      position: "50% 18%",
      mobilePosition: "51% 18%",
    },
  },
  portrait: {
    overline: "一分钟认识他",
    title: ["比赛可以很快，", "他的判断先到一步。"],
    introduction: [
      "传球还没离脚，范戴克已经看向跑动者身后的空间。他后退半步，收窄线路，把对手留在自己能够处理的方向。许多危险，到最后一铲之前已经结束。",
      "2018 年，他从 Southampton 来到 Liverpool。速度和对抗让高位防线站得住，判断与出球让球队继续向前。2023 年接过队长袖标后，他还要让身边的人站在同一条线上。",
    ],
    facts: [
      { label: "出生", value: "1991.07.08" },
      { label: "国籍", value: "荷兰" },
      { label: "加盟", value: "2018" },
      { label: "来自", value: "Southampton" },
      { label: "号码", value: "04" },
      { label: "位置", value: "中卫" },
    ],
  },
  performance: {
    sectionLabel: "THE STANDARD",
    overline: "球场上的他",
    title: ["他让防守，", "发生在对手起脚之前。"],
    introduction:
      "范戴克很少追着比赛跑。他先确定空间，再决定距离。一次移动让对手改线，一句提醒让队友补位，球权回到脚下后，球队又从他的判断里重新展开。",
    motif: "04",
    points: [
      {
        number: "01",
        label: "READ",
        title: "危险出现之前，先占住答案",
        text: "他观察持球者的身体方向，也留意下一名跑动者。站位提前半步，传球线路便少一条。许多防守因此停在判断与距离里，最后一铲只在必要时出现。",
      },
      {
        number: "02",
        label: "COMMAND",
        title: "让整条防线保持同一尺度",
        text: "他的工作延伸到身边：提醒边后卫收窄，示意中场回到线路，带着队友一起前移。防线的高度、距离和朝向，在持续沟通中重新排列。",
      },
      {
        number: "03",
        label: "RELEASE",
        title: "防守结束，下一段比赛从他脚下开始",
        text: "抢回球权后，他会判断短传是否足够，也会把斜长传送到远端。持球向前、穿过第一道压力，再选择传球。防守结束得干净，进攻才能开始得从容。",
      },
    ],
  },
  editorialImages: [
    {
      src: "/players/van-dijk-action.jpg",
      alt: "Virgil van Dijk 在 Liverpool 对 Fulham 的比赛中防守 Raúl Jiménez",
      caption: "距离由他控制，进攻者只剩下被允许的方向。",
      credit: "TIMMY96 · CC0",
      creditHref:
        "https://commons.wikimedia.org/wiki/File:Ra%C3%BAl_Jim%C3%A9nez_and_Virgil_van_Dijk_04012026_(1).jpg",
      position: "50% 48%",
    },
    {
      src: "/players/van-dijk-parade.jpg",
      alt: "Virgil van Dijk 在 2025 Liverpool 冠军巡游中举起 Premier League 奖杯",
      caption: "2025 年，队长把联赛奖杯带回支持者面前。",
      credit: "SHAUNPG · CC BY 2.0 · CROPPED",
      creditHref:
        "https://commons.wikimedia.org/wiki/File:VVD_-_2025_Liverpool_Trophy_Parade_(crop).jpg",
      position: "50% 32%",
    },
  ],
  story: {
    overline: "红军故事",
    title: ["标准先落在自己身上。", "然后传向整支球队。"],
    thesisLabel: "THE STANDARD",
    thesis:
      "范戴克给 Liverpool 的标准，先从每天如何准备开始，再落到每一次站位、每一句提醒和每个三四天后的比赛夜。",
    context:
      "恢复、饮食、训练与身体管理，让判断长期保持清晰。队长袖标又把这份要求推向更衣室：困难时让人靠近，年轻球员需要方向时先给出尺度。",
    arguments: [
      {
        number: "01",
        label: "CALM",
        title: "比赛越快，他越需要看得慢",
        text: "范戴克把防守看成一连串选择。先留在脚下，先读对手，再决定何时靠近。The Guardian 曾借 Federer 的从容描述这种观感：高难度动作被处理得安静，压力藏在距离和时机里。",
      },
      {
        number: "02",
        label: "STANDARD",
        title: "标准首先落在自己身上",
        text: "谈到长期稳定，他的答案很短：“Discipline, discipline and discipline!” 恢复、饮食、生活方式、理疗和瑜伽，组成每周重复的准备。2025/26 赛季，他踢满 Liverpool 的每一分钟联赛；持续出场，让标准从一句要求变成日常可见的样子。",
      },
      {
        number: "03",
        label: "RESPONSIBILITY",
        title: "让所有人留在同一条线上",
        text: "他理解的队长工作包括俱乐部价值、城市连接与球迷每三四天一次的期待。顺利时保持尺度，困难时让队伍靠拢。2025 年，他以队长身份举起 Premier League 奖杯，也成为 Liverpool 第十一位顶级联赛冠军队长。",
      },
    ],
    coda: {
      lead: "2025 年，他在安菲尔德举起联赛奖杯。",
      emphasis: "那一刻，标准有了人人看得见的形状。",
    },
    voice: {
      quote: "“I really enjoy the fact of feeling that responsibility.”",
      attribution: "VIRGIL VAN DIJK · 2026",
      href: "https://www.liverpoolfc.com/news/virgil-van-dijk-liverpool-captaincy-incredible-i-never-take-it-granted",
      ariaLabel: "查看范戴克 2026 年关于 Liverpool 队长责任的采访",
    },
  },
  definingMoment: {
    topline: "DEFINING MOMENT",
    context: "WEMBLEY · 25 FEB 2024",
    score: {
      home: "CHE",
      result: "0—1",
      away: "LIV",
      ariaLabel: "切尔西零比一利物浦",
    },
    minute: "118’",
    overline: "奖杯停在最后两分钟",
    title: ["第一粒头球被划掉。", "第二次，他把奖杯留下。"],
    text: "第 60 分钟，他的头球因越位判罚被取消。加时赛第 118 分钟，Tsimikas 开出角球，范戴克再次来到落点。皮球越过 Petrovic，Liverpool 赢下 League Cup。这是他成为正式队长后举起的第一座奖杯。",
    sourceLabel: "查看 Liverpool FC 官方比赛报告",
    sourceHref:
      "https://www.liverpoolfc.com/news/virgil-van-dijk-scores-extra-time-give-liverpool-victory-over-chelsea-carabao-cup-final",
  },
  beyondShirt: {
    overline: "球衣之外",
    title: ["标准也会回到，", "一切开始的地方。"],
    quote: "“Willem II 在我的人生与成长中扮演了重要角色。”",
    quoteAttribution: "— VIRGIL VAN DIJK · 2025",
    body: [
      "2025 年，Willem II 将青训基地的主看台命名为 Virgil van Dijk Tribune。那是他少年时期接受训练、学习如何成为职业球员的地方。",
      "同一项目还设立了面向青年球员的 Virgil’s Legacy Trophy。荣誉回到起点，也给下一代留下一个清楚的方向：职业生涯的高度，建立在每天如何对待自己。",
    ],
  },
  fanMemory: {
    overline: "球迷档案",
    title: ["我们记住他的，", "是比赛里的尺度。"],
    text: "边路出现一对一时，他侧身站住；防线需要前移时，声音从中路传来；远端空间打开，他把斜长传送到队友脚下。还有 Wembley 的第 118 分钟，以及队长手中的联赛奖杯。安静、判断和责任，在 4 号球衣上成为同一种尺度。",
    words: ["冷静", "尺度", "责任"],
  },
  sources: {
    snapshot: "2026.09.06",
    items: [
      {
        label: "球员资料、加盟信息与主要荣誉",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/team/mens/player/virgil-van-dijk",
      },
      {
        label: "职业纪律、恢复与长期稳定",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/its-combination-secrets-virgil-van-dijks-longevity",
      },
      {
        label: "队长身份、责任与俱乐部价值",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/virgil-van-dijk-liverpool-captaincy-incredible-i-never-take-it-granted",
      },
      {
        label: "Peter Krawietz 谈防守组织与出球",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/first-team/457660-five-years-of-virgil-van-dijk-the-perfect-fit-for-liverpool",
      },
      {
        label: "防守阅读、站位与处理压力的方法",
        publisher: "The Guardian",
        href: "https://www.theguardian.com/football/2021/may/14/virgil-van-dijk-liverpool-art-of-defending",
      },
      {
        label: "2024 League Cup 决赛官方报告",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/virgil-van-dijk-scores-extra-time-give-liverpool-victory-over-chelsea-carabao-cup-final",
      },
      {
        label: "2025 Premier League 冠军队长记录",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/liverpools-title-winning-captains-virgil-van-dijk-follows-footsteps-10-men",
      },
      {
        label: "Willem II 青训看台与 Legacy Trophy",
        publisher: "Liverpool FC",
        href: "https://www.liverpoolfc.com/news/virgil-van-dijk-receives-special-honour-willem-ii",
      },
    ],
  },
} satisfies PlayerProfileData;

export const metadata = createPlayerProfileMetadata(vanDijkProfile);

export default function VirgilVanDijkProfilePage() {
  return <PlayerProfile data={vanDijkProfile} />;
}
