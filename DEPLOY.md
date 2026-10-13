# x.meaigo.eu.org 部署文档（Cloudflare Worker cf-chess · 新式 Assets）

## 站点信息
- 域名: https://x.meaigo.eu.org
- Worker 名: `cf-chess`（hao 账号 `b4f91f8d3615084dd564a435f401b718`）
- API Token: `cfut_<REDACTED-见本地cf-token.txt>`
- 绑定: ASSETS(new-style assets.directory=dist) + CHESS_ROOM DO + CHESS_DB(D1 cf-chess-db, id ecc99edf-7373-4565-a750-cbe71ff97b6b) + vars.AI_SERVER_URL=https://xq.xqz.kdns.fr
- 参考版本: 9211c03c-f751-496b-81b2-c9cbc6b5e271（全功能 E2E 通过版）

## 本目录即部署包
```
wrangler.jsonc   # 配置（⚠️ jsonc 优先级高于 toml；toml 带 BOM 会被静默忽略）
index.js         # Worker 入口（DO ChessRoom + assets fallback + /api/*）
dist/
  index.html     # 改造后前端（Pikafish深度AI按钮 + 云库优先人机对弈 + 权重继承）
  js/socket-client.js, pikafish-engine.js, pikafish-worker.js, pikafish.js(=76,457B _deploy胶水),
  js/pikafish.wasm.part0/1/2, pikafish.nnue.part0/1/2
```

## 部署步骤
```powershell
cd sites\x-meaigo
$env:CLOUDFLARE_API_TOKEN="cfut_<REDACTED-见本地cf-token.txt>"
npx wrangler deploy     # 成功标志: Total Upload ≈35.62 KiB 且列出全部绑定
```
⚠️ 教训：配置必须无 BOM；若出现 "No bindings found" 或上传只有 0.36KiB，检查 jsonc/toml。

## 部署后验证
1. `GET /` 含 `startPikafishGame`、`_wMerged`，cloudai=0
2. `HEAD /pikafish.nnue.part0` = 17,737,647B（sha256 前缀 `fd3def42d27f9c82`，完整文件 sha256 `c4026370…d5f77`）；`/js/pikafish.js`=76,457B
3. `/api/train/status`、`/api/online` 200；`/ws` 可升级
4. 浏览器：Pikafish 对局出现 `bestmove g3g4` 类日志；在线对战创建房间正常
5. (v169) 首页含 `pikafish_nnue_v11` / `pikafish_wasm_v3` / `NNUE_EXPECT_SHA256`；`/sw.js` 为 `xq-sw-v3`（引擎分片不进 SW Cache，页面侧 IndexedDB+SHA256 校验）

> v169 (2026-10) 修复记录：部分浏览器 IndexedDB 中残留同尺寸(53212941B)但内容不同/损坏的 NNUE，
> 引擎报 "Network evaluation parameters compatible..." 自杀退出并回退本地AI。
> 修复 = NNUE 缓存键 v10→v11 + WASM 键 v2→v3 + 页面 SHA-256 完整性校验（坏缓存自动弃用重下）。
> 本地验证：Node 跑 wasm+当前网络 → readyok 且 `bestmove h9g7`（tmp-pika/harness.cjs）。
> 注意：x.696919.xyz 经 F 账号 xq-hao 代理回源本 Worker；x.meaigo.eu.org 与 xb.meaigo.eu.org 直连本 Worker，三站同步生效。

## 回滚
仪表板 → cf-chess → Deployments → 回退；或重新 deploy 本目录（git 版本 xq-cloudflare-pikafish 有完整镜像）。

## 2026-10-13 晚 热修: 断线判负生命周期补齐(客户端部分) + 阈值对齐60s
- 现状: X线此前缺客户端60s倒计时(player_disconnected被截断为仅hideOverlay)与结束态文案,服务端阈值180s/183s
- 修复: player_disconnected恢复完整60s倒计时; room_state gameOver分支 等待对手加入→棋局已结束; 服务端 18e4→60e3 + 183e3→63e3 (对齐xq线与客户端提示); sw v3→v4
- 取证: GitHub历史(10-09/10-10/10-11/10-12)从无60e3/63e3, 客户端倒计时从未在此仓库存在; dcbef82c(10-11)明确写明X线断线宽限180s保留不变
- 验证: 线上index.html含倒计时+棋局已结束; WS冒烟13/13; 版本 2b214a27

## 2026-10-13 深夜 重大修复: index.js整体回退到dcbef82c好版+仅叠阈值60s/63s
- 根因(已证实): 10-12 NNUE部署误将陈旧index.js覆盖上线, 冲掉dcbef82c的 _roomId/_roomReady 异步初始化修复(刷新后reconnect_room读this.room.id在null上抛异常被吞→重连静默失败→对方卡死退出)、静态资源CORS、在线人数上报结构
- 修复: index.js逐字节还原dcbef82c(10-11好版), 仅叠两处阈值 18e4→60e3 / 183e3→63e3; 与好版差异自证恰2行; NNUE改动全在dist(客户端)不受影响
- 教训: 部署前必须先diff线上源与本地源; 任何部署不得携带未经确认的文件回退
- 验证: 语法OK; WS冒烟13/13; 部署版本见CF仪表板
