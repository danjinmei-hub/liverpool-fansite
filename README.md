# RED ERA｜利物浦中文球迷站

一个以“安菲尔德比赛日手册 × 现代数据室”为视觉方向的中文利物浦球迷网站。

当前版本包含：

- 最新赛果与下一场比赛
- 2026/27 赛季开局数据
- 一线队核心球员与技术特点
- 主教练 Andoni Iraola 的战术观察
- 经官方来源核验的球队动态
- 历史球员档案入口设计

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm run install:ci
npm run dev
```

生产构建：

```bash
npm run build
```

## 自动比赛数据

赛程、赛果与 Premier League 积分榜来自 [football-data.org](https://www.football-data.org/)。GitHub Actions 每 6 小时调用两次 API，并将结果写入 `public/data/football.json`。页面访问只读取缓存快照，不会直接调用足球数据 API；远端快照不可用时会继续显示随站点发布的备用数据。

在仓库 `Settings → Secrets and variables → Actions` 中添加名为 `FOOTBALL_DATA_API_KEY` 的 Repository secret，然后手动运行一次 `Update football data` 工作流。密钥只进入任务环境，不写入代码或生成的 JSON。

## 数据与图片

比赛、阵容和新闻信息优先引用 Liverpool FC 官方来源。首页安菲尔德照片来自 Wikimedia Commons，作者 Ambitious Creative Co. / Rick Barrett，采用 CC0 许可。

## 说明

本项目是非官方球迷作品，与 Liverpool Football Club 无隶属或商业合作关系。队徽、球员肖像及俱乐部商标的权利归各自权利人所有。
