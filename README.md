# xq-cf-xinban（x.696919.xyz 部署包）

https://x.696919.xyz（上游 x.meaigo.eu.org），完整独立部署包。部署见 DEPLOY.md。

## 站点与账户对应（铁律，勿改）

x.696919.xyz 是**两层架构**：

| 层 | 值 |
|---|---|
| 线上站点 | https://x.696919.xyz |
| **代理层** | Worker `xq-hao`（本仓库 `xq-hao/index.js`，386 B 纯转发） |
| 代理层账户 | f.andianhuai@googlemail.com（`b675680cf61b31dd9e84c11f089e2ed4`），路由 `x.696919.xyz/*` |
| 代理转发目标 | https://x.meaigo.eu.org |
| **本尊层** | Worker `cf-chess`（直接带 assets，域 meaigo.eu.org） |
| 本尊层账户 | hao@chaf.pp.ua（`b4f91f8d3615084dd564a435f401b718`） |
| 编译源 | `modules/cf-chess.js`（**权威源，与线上 worker bundle 逐字节一致**） |
| 本仓库角色 | 代理源码（xq-hao/）+ 站点源码（dist/）+ worker 权威源（modules/cf-chess.js） |

> ⚠ **根 `index.js` 是历史遗留副本，禁止部署。** 权威源是 `modules/cf-chess.js`。维护只改 modules/cf-chess.js。（原 `cf-chess-swap/` 遗留副本已删除）

## 一、部署清单（dist/ 全树 14 文件，旧版家族无 admin/buy/qr）

| 文件 | 大小 | 说明 |
|---|---|---|
| index.html | 267,076 B | 主页面（末尾含棋盘箭头标注层 `_xqArrows`） |
| sw.js | 3,077 B | ServiceWorker |
| js/pikafish-engine.js | 7,767 B | Pikafish 引擎加载器 |
| js/pikafish-worker.js | 14,235 B | 引擎 Worker |
| js/pikafish.js | 76,457 B | 引擎核心 |
| js/pikafish.wasm.part0/1/2 | 256,413 / 256,413 / 256,411 B | wasm 分片 |
| js/socket-client.js | 8,703 B | 对局 WebSocket 客户端 |
| pikafish.nnue.part0/1/2 | 17,737,647 B ×3 | NNUE 权重分片 |
| _headers / .assetsignore | 126 / 15 B | 配置辅助，非站点资产 |

> 注意：x 站引擎文件以本仓库 `dist/js/*` 为唯一正确版本（7,767B engine / 14,235B worker），与 xq 站（8,575B / 14,721B）不同，**禁止互串**。x 站的 `/admin` 0B 是原始状态，不是故障。

## 二、Cloudflare 安装步骤

### 本尊层 cf-chess（hao@chaf.pp.ua 账户）
1. 该账户建 D1（`CHESS_DB`）+ 两个 DO 命名空间（`ChessRoom`/`MatchQueue`，sqlite）。
2. Workers & Pages → Create Worker `cf-chess` → Upload assets 拖入 `dist/` 全部 14 个文件（保持 js/ 目录结构）。
3. 绑定五件套（见下表）；自定义域 `x.meaigo.eu.org`（zone meaigo.eu.org）。
4. 代码 = `modules/cf-chess.js` 编译后的 bundle（约 162KB）→ Deploy。
5. 兼容 `compatibility_date=2024-01-01`；assets config 按线上镜像（headers/serve_directly/base_path）。
6. **声明式 exports worker**：改绑定须走完整 PUT+exports，禁用 migrations（100403）。

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

1. **CF assets = 全量替换制**：部署 manifest 缺哪个文件，站上就丢哪个文件。**manifest 必须逐文件来自本仓库 dist/ 全树**。
2. `.html` 路径直探返回 307 = assets 规范化重定向（正常）；x 站无 admin/buy/qr 是原始状态，不是故障。
3. **代理 xq-hao 永远是纯转发**（386 B），不加任何注入。
4. 箭头标注层（`_xqArrows`，注入于 `</body>` 前）：纯附加，更新 index.html 必须保留；源码在部署工作区 `arrow-extract.js`。
5. AI_SERVER_URL 自指（独立铁律）；三站完全独立、互不影响。
6. hao 账户 worker 响应会注入 CF RUM beacon（~358B）；存储页=响应页剥离 beacon；/cdn-cgi/rum 404 无碍。
7. 大文件（nnue 17MB×3）探测顺序+120s 超时+重试；并行短超时会静默漏文件。
8. 部署后六查：棋盘人机对弈、箭头、`/js/socket-client.js`、JS 透传 200、指纹、上游与代理两侧。
9. **唯一事实源是线上**：前端逐字节对齐线上，worker 线上是 esbuild bundle、仓库是可读源码只做语义对齐；方向只有 线上 → 仓库，禁止直接部署仓库源码覆盖线上。
10. 上游 cf-chess@hao 的源码以本仓库 `modules/cf-chess.js` 为权威源；重部署上游前先确认 dist 全树与箭头层齐备。

## 五、关键修复记录（2026-11-15）

- 断线看门狗 + 恢复钩子（D/E 补丁）。
- 房间号残留：服务端 `_saveRoomState` gameOver→DELETE + leave_room 无条件删。
- 前端 cookie 兜底（从零新增 6 处）。
