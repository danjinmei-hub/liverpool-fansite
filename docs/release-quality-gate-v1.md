# RED CHORUS — Release Quality Gate v1

## 审计基线与边界

基于 `main` 提交 `3c5583491a5f34c1f09518fd4ac5b34162d27577`，比赛快照时间 `2026-10-11T21:54:56.640Z`。审计时最近的生产工作流 [38178312878](https://github.com/danjinmei-hub/liverpool-fansite/actions/runs/38178312878) 成功，但绿色状态只代表其实际运行的测试。

本次只增加质量检查并修复经回归测试证明的缺失比分 metadata 问题。保留设计、内容架构、数据来源和发布流程；不填补尚未核验的 FotMob 链接，不生成比赛或人物内容。

## 原有覆盖、遗漏和重复执行

| 原有入口 / 检查 | 实际覆盖 | 审计发现 |
| --- | --- | --- |
| `npm test` | Vinext build + `tests/*.test.mjs` | 不运行 `tests/unit`、静态产物、发布检查；不是完整门禁 |
| `test:football` | 快照契约、生命周期 SSR、远端降级、更新器离线请求及原子写入 | 复用；这些不是浏览器测试 |
| `test:fotmob` + `audit:fotmob` | 映射格式、赛事 / 日期 / 对阵一致性、重复 URL、缺失覆盖报告 | 测试审计规则与审计当前数据目的不同；保留两者，不测外站可达性 |
| match-editorial 单元测试 | 编辑内容契约、缺项隐藏、赛季上一场 / 下一场 | 复用 |
| `test:static` | 文件服务器上的 50 条路由、95 个内部链接 / 资产、全部 38 个 PL 比赛 ID、SEO、JSON、404 | 无 JavaScript 执行、hydration 或手机布局验证 |
| `test:release` | 临时产物上的 manifest、篡改页面 / JSON / sitemap、旧版本和重试 | 复用；原发布前未用真实 `out/` 跑同一校验器 |
| 生产 workflow 的 Sites job | 构建 + archive、homepage-freshness、SEO 三个文件 | 漏掉 rendered-html、UI component、Van Dijk source contract；没有 PR 触发器 |
| 更新 workflow | 两次 API 请求、脚本内数据 guard、成功后提交 | 不依赖站点发布密钥；不在 PR 中请求真实足球 API |

没有发现原生产 workflow 同一目标构建两次的情况。静态 HTML 和 Sites Worker 的部分断言重叠，但检查的是不同构建产物，必须保留。手动先运行 `npm run build` 再运行旧 `npm test` 会重复构建；统一入口每个目标只构建一次，全部单元测试只运行一次。现有细分命令保留用于定位问题，不应在完整门禁后再逐项重复执行。

完整运行旧 Sites 测试可复现两项失败，均为测试契约过时：生产 Worker 不含开发预览 marker；Tailwind 按使用情况裁剪 CSS，固定 vendor 也没有旧 catalog 的 scrollbar-thin / scrollbar-gutter 定义。测试改为验证生产 HTML、站点实际 CSS 和仍存在的动画工具；保留其他组件语义断言。首页 Worker 测试改用提交内快照的 fetch mock，消除对持续更新的远端 `main` 的依赖。

lint 曾扫描静态构建的临时副本，产生重复报告与生成类型错误。现在忽略构建目录、工具运行目录及浏览器报告，不放宽应用源码规则。源码仍保留 4 条现有 `<img>` 性能建议，0 错误。

## 统一入口与 CI

Linux、Node.js 22（`>=22.13.0`），首次执行：

```bash
npm ci
npx playwright install --with-deps chromium
npm run verify
```

Chromium 安装需网络；之后浏览器测试只访问本地 `out/`，外部请求被拦截。受限云环境可将浏览器缓存指向可写目录：

```bash
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npm run verify
```

门禁依次执行 lint → 全部 `tests/unit/*.test.mjs` → 当前 FotMob 离线审计 → Next 静态 build / TypeScript → 现有静态 HTTP smoke → Playwright → 写入 `out/release.json` 并用现有 `verifyPublishedRelease` 校验本地实际产物 → Vinext build → 全部 `tests/*.test.mjs`。失败立即返回非零状态。manifest 的 Git SHA 默认来自 `git rev-parse HEAD`，生产 CI 用其解析的精确 `RELEASE_SHA`。本地未提交修改的 manifest 不能作为已发布版本证明。

分阶段定位：

```bash
npm run verify:static  # lint、全部单元测试、数据 / 链接、静态构建、HTTP、浏览器、release
npm run verify:sites   # Vinext 构建 + 全部现有顶层渲染 / 组件测试
npm run test:e2e       # 需先有成功生成的 out/；不自动重复构建
```

新的 `quality-gate.yml` 在每个面向 main 的 PR 上运行完整门禁；只读仓库权限、无发布密钥、无部署步骤。生产 workflow 调用同一入口的 static / sites 两部分；共用检查只在 static job 运行。任何检查失败都阻止上传已验证静态产物，既有 publish job 仍依赖这两个 job。

Playwright 使用 Chromium 桌面和 iPhone SE 的 375×667 视口（Chromium 模拟，非真机 Safari），不自动重试掩盖失败。报告位于 `playwright-report/`；失败截图、trace 位于 `test-results/`，CI 保存 7 天。

main 当前没有分支保护。本 PR 增加可见检查，但未更改仓库设置；若需要强制禁止绕过，应将 `RED CHORUS — Release Quality Gate v1` 设为必需检查。

## 浏览器与降级范围

- 首页真实图片、比赛与快照时间；首页 → 比赛列表 → 单场 → 列表 → 首页。
- 已结束 / 未开始比赛直达与刷新、对阵内容、FotMob 精确映射或未核验提示。
- 列表 → 轮换阵容 → 首页 → 首页核心球员卡 → Van Dijk → 首页；手机通过列表返回首页后使用“查看轮换与替补”入口（紧凑页头隐藏桌面导航）。三个球员页面直达、真实图片和刷新。
- 不存在的全站路径与比赛路径返回 HTTP 404 且显示 404 页面。
- 上述页面在桌面和手机视口均无横向溢出，主要标题、内容及首张图片可见；检测 JS exception、React hydration error 和资产 HTTP 错误。
- HTTP 503、网络中断、损坏 JSON、无效 schema、旧快照刷新均保留内嵌数据及其真实时间戳。
- 更新的合法快照缺少最近赛果 / 下一场赛程 / 积分榜时，现有空状态正确显示，且没有 undefined 链接。测试响应从真实快照复制并改变字段，只存在于测试中。
- 现有离线单元测试继续覆盖赛季初 / 中 / 末、未知状态、缺少可选字段、过滤和去重、远端服务降级及更新器失败保留旧文件。

比分缺失回归先在原代码失败：已完赛的 nullable score 在页面正文有占位符，metadata 却写成 `null—null`。唯一产品修复是 metadata 同样使用现有 `—` 占位符；测试同时验证缺少场地和未核验 FotMob 链接的原有提示。

若提交快照确实没有已赛或未赛比赛，对应浏览器用例明确 skip 并显示原因，不能据此声明该状态已验证；本次快照两种状态均存在。

## 结果与无法验证项

2026-10-12 本地从重新执行 `npm ci` 后运行完整 `npm run verify`，退出码 0。运行环境：Node.js `v24.19.0`、npm `11.9.0`；GitHub PR 门禁使用 Node.js 22。日志为执行环境的 `outputs/quality-gate.log`，浏览器报告为 `playwright-report/index.html`。

| 项目 | 最终结果 |
| --- | --- |
| lint | 通过；0 错误、4 条既有图片性能建议 |
| 核心单元 / 数据 / FotMob / 发布校验器 | 77/77 通过，0 跳过 |
| 当前 FotMob 离线审计 | 通过；0 映射错误，1 场已完赛缺链警告 |
| Next 静态构建与 TypeScript | 通过 |
| 静态 HTTP | 通过；50 路由、95 内部链接 / 资产、38 比赛 ID |
| 浏览器冒烟与客户端降级 | 28/28 通过（桌面 14 + 手机 14），0 跳过、0 重试 |
| 真实 out/ 的 release manifest + 字节 / JSON / SEO / 404 校验 | 通过 |
| Sites / Vinext 构建 | 通过 |
| 全部既有 Sites 渲染 / 组件 / 内容契约 | 11/11 通过，0 跳过 |
| 最终失败项 | 无 |

基线通过 76 个单元测试及静态 HTTP 检查；旧 Sites suite 为 9 通过 / 2 失败，已按上面的契约修正。缺失比分回归在修复前失败、修复后通过。新增冒烟测试调试期间的失败来自定位不存在的 DOM、轮换页面没有核心球员卡以及手机隐藏桌面导航，已调整为现有用户路径，无对应产品变更。完整门禁最终复跑通过。

当前 FotMob 审计：5/38 条映射，已结束覆盖 5/6，0 格式 / 一致性错误；`560598`（2026-10-11 Liverpool vs Man City）缺少已核验链接，按既有规则警告而非阻断。缺失映射保持未核验提示。

无法由本次离线质量门禁证明的项目：真实 football-data.org API 当前健康与数据事实准确性、FotMob 外站当前可达性 / 页面内容、真实 OSS / CDN / TLS / DNS 配置、真机 Safari / Firefox、性能及完整无障碍合规。未执行发布，因此也未把线上内容与本 PR 的新产物做版本一致性声明。现有 `scripts/verify-production.mjs` 仍负责经授权发布后的只读线上字节与 404 校验；本次用同一校验器验证本地实际产物和既有故障单元测试。
