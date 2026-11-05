# xq-cf-xinban（x.696919.xyz 部署包）

https://xq.chaf.eu.org/，完整独立部署包。部署见 DEPLOY.md。

## 站点与账户对应（铁律，勿改）

x.696919.xyz 是**两层架构**：

| 层 | 值 |
|---|---|
| 线上站点 | https://x.696919.xyz |
| **代理层** | Worker `xq-hao`（本仓库 `xq-hao/index.js`，386 B 纯转发） |
| 代理层账户 | f.andianhuai@googlemail.com（`b675680cf61b31dd9e84c11f089e2ed4`），路由 `x.696919.xyz/*` |
| 代理转发目标 | https://x.meaigo.eu.org |
| **本尊层** | Worker `cf-chess`（直接带 assets，域 `x.meaigo.eu.org`） |
| 本尊层账户 | hao@chaf.pp.ua（`b4f91f8d3615084dd564a435f401b718`） |
| 本仓库角色 | 代理源码（xq-hao/）+ 本尊站点源码（dist/）+ worker 源码（index.js / cf-chess-swap/） |

## 一、部署清单（dist/ 全树 12 项，旧版变体——**没有 admin/buy/二维码/index_bak，这是原始状态不是缺失**）

| 文件 | 大小 | 说明 |
|---|---|---|
| index.html | 260,640 B | 主页面（末尾含棋盘箭头标注层 `_xqArrows`） |
| sw.js | 3,077 B | ServiceWorker |
| js/pikafish-engine.js | 7,767 B | 引擎加载器（**与 xq 站 8,575B 版本不同，禁止互串**） |
| js/pikafish-worker.js | 14,235 B | 引擎 Worker（**与 xq 站 14,721B 不同**） |
| js/pikafish.js | 76,457 B | 引擎核心 |
| js/pikafish.wasm.part0/1/2 | 256,413 / 256,413 / 256,411 B | wasm 分片 |
| js/socket-client.js | 8,703 B | 对局 WebSocket 客户端（与 xq 站 9,997B 不同） |
| pikafish.nnue.part0/1/2 | 17,737,647 B ×3 | NNUE 权重分片 |
| _headers / .assetsignore | 126 / 15 B | 配置辅助，非站点资产 |

## 二、Cloudflare 安装步骤

### 本尊层 cf-chess（hao@chaf.pp.ua 账户）
1. 该账户建 D1（`CHESS_DB`）+ 两个 DO 命名空间（`ChessRoom`/`MatchQueue`，sqlite）。
2. Workers & Pages → Create Worker `cf-chess` → Upload assets 拖入 `dist/` 全部文件。
3. 绑定五件套（见下表）；域 `x.meaigo.eu.org`（zone meaigo.eu.org）。
4. 代码 = 仓库根 `index.js` → Deploy。
5. **该 worker 走声明式 exports 流程**（见注意事项第 1 条）。

### 代理层 xq-hao（f.andianhuai 账户）
1. Workers & Pages → Create Worker `xq-hao` → 粘贴 `xq-hao/index.js`（386 B，纯转发）→ Deploy。
2. Settings → Domains & Routes → Route `x.696919.xyz/*`（zone 696919.xyz）。
3. **无任何绑定**。

## 三、绑定值（本尊层当前线上值）

| 绑定 | 类型 | 值 |
|---|---|---|
| AI_SERVER_URL | plain_text | `https://x.696919.xyz`（**自指，独立铁律**） |
| ASSETS | assets | — |
| CHESS_DB | d1 | `ecc99edf-7373-4565-a750-cbe71ff97b6b` |
| CHESS_ROOM | durable_object_namespace | `62dacfef60294cf089120063d009b0a8` |
| MATCH_QUEUE | durable_object_namespace | `2737996eca0d48d5adf937d3d2d0ca4a` |
| compatibility_date | — | `2024-01-01` |

## 四、注意事项（血泪铁律）

1. **cf-chess 是声明式 exports 流程 worker**：API 改绑定必须走**完整 PUT** 且 metadata 带 `exports: { ChessRoom: {type:"durable-object",storage:"sqlite"}, MatchQueue: {...} }`；`PATCH settings` 会报 100402（DO 校验失败）；带 `migrations` 会报 100403（禁止回退）。
2. **代理 xq-hao 永远是纯转发**（386 B），不加任何注入——箭头已经在本尊 index.html 里，代理改动会破坏透传。
3. **CF assets = 全量替换制**：manifest 缺文件=站上丢文件。manifest 必须逐文件来自本仓库 dist/ 全树。
4. 引擎文件版本是本站专属（engine 7,767B / worker 14,235B / socket 8,703B），**与 xq 站（8,575/14,721/9,997B）不同，禁止互串**。
5. 本站**没有 admin 后台**（/admin 返回 0B）——旧版变体原始状态，不是故障，不要"修"它。
6. worker 响应会注入 CF RUM beacon（~358B）；存储页=响应页剥离 beacon；/cdn-cgi/rum 404 无碍。
7. AI_SERVER_URL 自指（独立铁律）；三站完全独立。
8. 大文件探测顺序+120s 超时+重试；并行短超时会静默漏文件。
9. 部署后五查：棋盘人机对弈、箭头、/js/socket-client.js、代理透传（非 HTML 响应原样）、上游与代理两侧。
