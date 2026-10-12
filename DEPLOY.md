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
