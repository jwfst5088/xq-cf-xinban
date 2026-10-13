/* 中国象棋 SW: 主域挂时从备胎域名回源, 地址栏不变; 网络优先保证页面最新 */
// v4: 升版清缓存，确保断线判负倒计时+结束态结果面板修复到达所有客户端
const CACHE = 'xq-sw-v4'
const FALLBACK_ORIGINS = ['https://x.meaigo.eu.org', 'https://xb.meaigo.eu.org'];
const T_PRIMARY = 8000 // 手机WiFi首字节常超3.5s, 3500会误进备用流程;
const T_FALLBACK = 6000;

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

function fT(url, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, { signal: c.signal, redirect: 'follow' }).finally(() => clearTimeout(t));
}

async function cachePut(req, resp) {
  try {
    if (!resp || !resp.ok || req.method !== 'GET') return;
    const u = new URL(req.url);
    // v3: 引擎大分片不进 SW Cache（NNUE 17MB×3 太大且 NNUE 带 Date.now() 查询永不会命中；
    //     wasm 固定 URL 的旧条目会跨部署残留——内容一致性由页面侧 IndexedDB+SHA256 校验负责）
    if (u.pathname.startsWith('/pikafish.nnue.part') || u.pathname.startsWith('/js/pikafish.wasm.part')) return;
    const key = (u.pathname === '/' || u.pathname === '/index.html') ? self.location.origin + '/' : req.url;
    const c = await caches.open(CACHE);
    await c.put(key, resp);
  } catch (e) {}
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/ws')) return;

  e.respondWith((async () => {
    let primaryFailed = false;
    try {
      const r = await fT(req, T_PRIMARY);
      if (r && (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429))) {
        cachePut(req, r.clone());
        return r;
      }
      primaryFailed = true;
    } catch (err) { primaryFailed = true; }

    if (primaryFailed) {
      for (const o of FALLBACK_ORIGINS) {
        if (o === self.location.origin) continue;
        try {
          const r2 = await fT(o + url.pathname + url.search, T_FALLBACK);
          if (r2 && (r2.ok || (r2.status >= 400 && r2.status < 500))) {
            cachePut(req, r2.clone());
            return r2;
          }
        } catch (err) {}
      }
    }

    try {
      const c = await caches.open(CACHE);
      const u = new URL(req.url);
      const isPage = u.pathname === '/' || u.pathname === '/index.html' || u.pathname.endsWith('.html');
      const hit = await c.match(isPage ? self.location.origin + '/' : req.url);
      if (hit) return hit;
    } catch (err) {}
    return new Response('Service Unavailable', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
