// xq-hao 原始代码备份(改动前, 2026-10-03 取自线上) — 回滚用
var UPSTREAM_HOST = "x.meaigo.eu.org";
var index_default = {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = UPSTREAM_HOST;
    const upstreamRequest = new Request(url.toString(), request);
    return fetch(upstreamRequest);
  }
};
export {
  index_default as default
};

