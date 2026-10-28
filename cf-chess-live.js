var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
(function(g) {
  "use strict";
  var VAL = { K: 100, R: 9, N: 4, C: 4.5, P: 1, A: 2, B: 2 };
  var NO_CAPTURE_PLIES = 120;
  function opp(color) {
    return color === "red" ? "black" : "red";
  }
  __name(opp, "opp");
  function inBoard(r, c) {
    return r >= 0 && r < 10 && c >= 0 && c < 9;
  }
  __name(inBoard, "inBoard");
  function inPalace(r, c, color) {
    if (c < 3 || c > 5) return false;
    return color === "red" ? r >= 7 : r <= 2;
  }
  __name(inPalace, "inPalace");
  var _idSeq = 0;
  function initialBoard() {
    var b = [], r, c;
    for (r = 0; r < 10; r++) {
      b[r] = [];
      for (c = 0; c < 9; c++) b[r][c] = null;
    }
    var back = ["R", "N", "B", "A", "K", "A", "B", "N", "R"];
    function put(rr, cc, t, color) {
      b[rr][cc] = { t, c: color, id: color.charAt(0) + t + ++_idSeq };
    }
    __name(put, "put");
    for (c = 0; c < 9; c++) {
      put(0, c, back[c], "black");
      put(9, c, back[c], "red");
    }
    put(2, 1, "C", "black");
    put(2, 7, "C", "black");
    put(7, 1, "C", "red");
    put(7, 7, "C", "red");
    for (c = 0; c < 9; c += 2) {
      put(3, c, "P", "black");
      put(6, c, "P", "red");
    }
    return b;
  }
  __name(initialBoard, "initialBoard");
  function cloneBoard(b) {
    var out = [], r;
    for (r = 0; r < 10; r++) out[r] = b[r].slice();
    return out;
  }
  __name(cloneBoard, "cloneBoard");
  function mv(m) {
    return { fromRow: m.fromRow, fromCol: m.fromCol, toRow: m.toRow, toCol: m.toCol };
  }
  __name(mv, "mv");
  function applyMv(b, m) {
    var p = b[m.fromRow] ? b[m.fromRow][m.fromCol] : null;
    if (!p) return b;
    b[m.toRow][m.toCol] = p;
    b[m.fromRow][m.fromCol] = null;
    return b;
  }
  __name(applyMv, "applyMv");
  function boardFromAscii(rows) {
    var b = [], r, c;
    for (r = 0; r < 10; r++) {
      b[r] = [];
      for (c = 0; c < 9; c++) {
        var ch = rows[r] && rows[r].charAt(c) || ".", up = ch.toUpperCase();
        if ("RNBAKCP".indexOf(up) >= 0) {
          b[r][c] = { t: up, c: ch === up ? "red" : "black", id: (ch === up ? "r" : "b") + up + ++_idSeq };
        } else b[r][c] = null;
      }
    }
    return b;
  }
  __name(boardFromAscii, "boardFromAscii");
  function keyOf(b, side) {
    var s = [], r, c;
    for (r = 0; r < 10; r++) for (c = 0; c < 9; c++) {
      var p = b[r][c];
      s.push(p ? p.c === "red" ? p.t : p.t.toLowerCase() : ".");
    }
    return s.join("") + "|" + side;
  }
  __name(keyOf, "keyOf");
  function findKing(b, color) {
    var r, c;
    for (r = 0; r < 10; r++) for (c = 0; c < 9; c++) {
      var p = b[r][c];
      if (p && p.t === "K" && p.c === color) return [r, c];
    }
    return null;
  }
  __name(findKing, "findKing");
  function pseudoMoves(b, r, c) {
    var p = b[r][c];
    if (!p) return [];
    var out = [], i, rr, cc, color = p.c, t = p.t, d, dr, dc;
    function add(rr2, cc2) {
      if (inBoard(rr2, cc2) && !(b[rr2][cc2] && b[rr2][cc2].c === color)) out.push([rr2, cc2]);
    }
    __name(add, "add");
    if (t === "R") {
      for (d = 0; d < 4; d++) {
        dr = [1, -1, 0, 0][d];
        dc = [0, 0, 1, -1][d];
        rr = r + dr;
        cc = c + dc;
        while (inBoard(rr, cc)) {
          if (b[rr][cc]) {
            if (b[rr][cc].c !== color) out.push([rr, cc]);
            break;
          }
          out.push([rr, cc]);
          rr += dr;
          cc += dc;
        }
      }
    } else if (t === "C") {
      for (d = 0; d < 4; d++) {
        dr = [1, -1, 0, 0][d];
        dc = [0, 0, 1, -1][d];
        rr = r + dr;
        cc = c + dc;
        while (inBoard(rr, cc) && !b[rr][cc]) {
          out.push([rr, cc]);
          rr += dr;
          cc += dc;
        }
        rr += dr;
        cc += dc;
        while (inBoard(rr, cc)) {
          if (b[rr][cc]) {
            if (b[rr][cc].c !== color) out.push([rr, cc]);
            break;
          }
          rr += dr;
          cc += dc;
        }
      }
    } else if (t === "N") {
      var KN = [
        [-2, -1, -1, 0],
        [-2, 1, -1, 0],
        [2, -1, 1, 0],
        [2, 1, 1, 0],
        [-1, -2, 0, -1],
        [1, -2, 0, -1],
        [-1, 2, 0, 1],
        [1, 2, 0, 1]
      ];
      for (i = 0; i < 8; i++) {
        rr = r + KN[i][0];
        cc = c + KN[i][1];
        if (inBoard(rr, cc) && inBoard(r + KN[i][2], c + KN[i][3]) && !b[r + KN[i][2]][c + KN[i][3]]) add(rr, cc);
      }
    } else if (t === "B") {
      var BD = [[-2, -2, -1, -1], [-2, 2, -1, 1], [2, -2, 1, -1], [2, 2, 1, 1]];
      for (i = 0; i < 4; i++) {
        rr = r + BD[i][0];
        cc = c + BD[i][1];
        if (!inBoard(rr, cc)) continue;
        if (!inBoard(r + BD[i][2], c + BD[i][3]) || b[r + BD[i][2]][c + BD[i][3]]) continue;
        if (color === "red" && rr < 5) continue;
        if (color === "black" && rr > 4) continue;
        add(rr, cc);
      }
    } else if (t === "A") {
      var AD = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (i = 0; i < 4; i++) {
        rr = r + AD[i][0];
        cc = c + AD[i][1];
        if (inPalace(rr, cc, color)) add(rr, cc);
      }
    } else if (t === "K") {
      var KD = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (i = 0; i < 4; i++) {
        rr = r + KD[i][0];
        cc = c + KD[i][1];
        if (inPalace(rr, cc, color)) add(rr, cc);
      }
    } else if (t === "P") {
      var fwd = color === "red" ? -1 : 1;
      add(r + fwd, c);
      var crossed = color === "red" ? r <= 4 : r >= 5;
      if (crossed) {
        add(r, c - 1);
        add(r, c + 1);
      }
    }
    return out;
  }
  __name(pseudoMoves, "pseudoMoves");
  function flyingGeneral(b, color) {
    var k = findKing(b, color), e = findKing(b, opp(color));
    if (!k || !e || k[1] !== e[1]) return false;
    var r;
    for (r = Math.min(k[0], e[0]) + 1; r < Math.max(k[0], e[0]); r++) if (b[r][k[1]]) return false;
    return true;
  }
  __name(flyingGeneral, "flyingGeneral");
  function inCheck(b, color) {
    var k = findKing(b, color);
    if (!k) return true;
    var oppC = opp(color), r, c, i, ms;
    for (r = 0; r < 10; r++) for (c = 0; c < 9; c++) {
      var p = b[r][c];
      if (!p || p.c !== oppC || p.t === "K") continue;
      ms = pseudoMoves(b, r, c);
      for (i = 0; i < ms.length; i++) if (ms[i][0] === k[0] && ms[i][1] === k[1]) return true;
    }
    return flyingGeneral(b, color);
  }
  __name(inCheck, "inCheck");
  function legalMoves(b, color) {
    var out = [], r, c, i, ms, p;
    for (r = 0; r < 10; r++) for (c = 0; c < 9; c++) {
      p = b[r][c];
      if (!p || p.c !== color) continue;
      ms = pseudoMoves(b, r, c);
      for (i = 0; i < ms.length; i++) {
        var b2 = cloneBoard(b);
        applyMv(b2, { fromRow: r, fromCol: c, toRow: ms[i][0], toCol: ms[i][1] });
        if (!inCheck(b2, color)) out.push({ fromRow: r, fromCol: c, toRow: ms[i][0], toCol: ms[i][1] });
      }
    }
    return out;
  }
  __name(legalMoves, "legalMoves");
  function isCheckmate(b, color) {
    if (!inCheck(b, color)) return false;
    return legalMoves(b, color).length === 0;
  }
  __name(isCheckmate, "isCheckmate");
  function captureProfitable(b, fr, fc, tr, tc) {
    var atk = b[fr][fc], tgt = b[tr][tc];
    if (!atk || !tgt) return false;
    var b2 = cloneBoard(b);
    b2[tr][tc] = atk;
    b2[fr][fc] = null;
    var defC = tgt.c, recapture = false, r, c, i, ms;
    for (r = 0; r < 10 && !recapture; r++) for (c = 0; c < 9; c++) {
      var p = b2[r][c];
      if (!p || p.c !== defC) continue;
      ms = pseudoMoves(b2, r, c);
      for (i = 0; i < ms.length; i++) if (ms[i][0] === tr && ms[i][1] === tc) {
        recapture = true;
        break;
      }
      if (recapture) break;
    }
    if (!recapture) return true;
    return VAL[atk.t] < VAL[tgt.t];
  }
  __name(captureProfitable, "captureProfitable");
  function profitAttacks(b, byColor) {
    var set = {}, r, c, i, ms;
    for (r = 0; r < 10; r++) for (c = 0; c < 9; c++) {
      var p = b[r][c];
      if (!p || p.c !== byColor) continue;
      if (p.t === "P" || p.t === "K") continue;
      ms = pseudoMoves(b, r, c);
      for (i = 0; i < ms.length; i++) {
        var t = b[ms[i][0]][ms[i][1]];
        if (!t || t.c === byColor) continue;
        if (t.t === "K" || t.t === "P") continue;
        if (captureProfitable(b, r, c, ms[i][0], ms[i][1])) set[p.id + ">" + t.id] = t.id;
      }
    }
    return set;
  }
  __name(profitAttacks, "profitAttacks");
  function classifyMove(bBefore, m, moverColor) {
    var moved = bBefore[m.fromRow] ? bBefore[m.fromRow][m.fromCol] : null;
    var bAfter = cloneBoard(bBefore);
    applyMv(bAfter, m);
    var oppC = opp(moverColor), i;
    if (inCheck(bAfter, oppC)) return { cls: "check" };
    var lm = legalMoves(bAfter, moverColor);
    for (i = 0; i < lm.length; i++) {
      var b3 = cloneBoard(bAfter);
      applyMv(b3, lm[i]);
      if (isCheckmate(b3, oppC)) return { cls: "mate" };
    }
    var A0 = profitAttacks(bBefore, moverColor), A1 = profitAttacks(bAfter, moverColor);
    var k, targets = {}, found = false;
    for (k in A1) {
      var isNew = !A0[k];
      var attackerId = k.split(">")[0];
      if (isNew || moved && attackerId === moved.id) {
        found = true;
        targets[A1[k]] = 1;
      }
    }
    if (found) return { cls: "chase", targets };
    return { cls: "idle" };
  }
  __name(classifyMove, "classifyMove");
  function isMateThreat(b, byColor) {
    var oppC = opp(byColor), lm = legalMoves(b, byColor), i;
    for (i = 0; i < lm.length; i++) {
      var b2 = cloneBoard(b);
      applyMv(b2, lm[i]);
      if (isCheckmate(b2, oppC)) return true;
    }
    return false;
  }
  __name(isMateThreat, "isMateThreat");
  function aggregate(cats, tsets) {
    if (!cats.length) return { cls: "ok" };
    var all = /* @__PURE__ */ __name(function(x) {
      for (var i2 = 0; i2 < cats.length; i2++) if (cats[i2] !== x) return false;
      return true;
    }, "all");
    if (all("check")) return { cls: "bad", name: "\u957F\u5C06" };
    if (all("mate")) return { cls: "bad", name: "\u957F\u6740" };
    if (all("chase")) {
      var common = null, i, k;
      for (i = 0; i < tsets.length; i++) {
        var keys = Object.keys(tsets[i] || {});
        if (!common) {
          common = {};
          for (k = 0; k < keys.length; k++) common[keys[k]] = 1;
        } else {
          var nx = {};
          for (k = 0; k < keys.length; k++) if (common[keys[k]]) nx[keys[k]] = 1;
          common = nx;
        }
        if (!Object.keys(common).length) break;
      }
      if (common && Object.keys(common).length) return { cls: "bad", name: "\u957F\u6349" };
      return { cls: "ok" };
    }
    return { cls: "ok" };
  }
  __name(aggregate, "aggregate");
  function none() {
    return { type: "none" };
  }
  __name(none, "none");
  function replayAll(mh) {
    var b = initialBoard(), keys = [keyOf(b, "red")], noCap = 0, caps = [0], i;
    for (i = 0; i < mh.length; i++) {
      var tgt = b[mh[i].toRow] ? b[mh[i].toRow][mh[i].toCol] : null;
      applyMv(b, mv(mh[i]));
      noCap = tgt ? 0 : noCap + 1;
      keys.push(keyOf(b, (i + 1) % 2 === 0 ? "red" : "black"));
      caps.push(noCap);
    }
    return { board: b, keys, caps };
  }
  __name(replayAll, "replayAll");
  function adjudicate(mh, opts) {
    opts = opts || {};
    var limit = opts.noCaptureLimit || NO_CAPTURE_PLIES;
    var n = mh.length;
    if (n < 4) return none();
    var rep = replayAll(mh);
    if (rep.caps[n] >= limit) {
      return { type: "no_capture", verdict: "draw", endReason: "no_capture_draw", reason: "\u53CC\u65B960\u56DE\u5408\u65E0\u5403\u5B50\uFF0C\u5224\u548C" };
    }
    var cur = rep.keys[n], occ = [], j;
    for (j = 0; j <= n; j++) if (rep.keys[j] === cur) occ.push(j);
    if (occ.length < 3) return none();
    var p2 = occ[occ.length - 2], p3 = occ[occ.length - 1];
    var b = initialBoard();
    for (j = 0; j < p2; j++) applyMv(b, mv(mh[j]));
    var cats = { red: [], black: [] }, tsets = { red: [], black: [] }, idx;
    for (idx = p2; idx < p3; idx++) {
      var S = idx % 2 === 0 ? "red" : "black";
      var cm = classifyMove(b, mv(mh[idx]), S);
      cats[S].push(cm.cls);
      if (cm.targets) tsets[S].push(cm.targets);
      applyMv(b, mv(mh[idx]));
    }
    var ra = aggregate(cats.red, tsets.red), ba = aggregate(cats.black, tsets.black);
    var rp = ra.cls === "bad", bp = ba.cls === "bad";
    if (rp && !bp) return { type: "repetition", verdict: "black", endReason: "rule_loss", reason: "\u7EA2\u65B9" + ra.name + "\uFF08\u8FDD\u53CD\u68CB\u4F8B\uFF09\uFF0C\u5224\u8D1F" };
    if (bp && !rp) return { type: "repetition", verdict: "red", endReason: "rule_loss", reason: "\u9ED1\u65B9" + ba.name + "\uFF08\u8FDD\u53CD\u68CB\u4F8B\uFF09\uFF0C\u5224\u8D1F" };
    return { type: "repetition", verdict: "draw", endReason: "repetition_draw", reason: "\u53CC\u65B9\u4E0D\u53D8\u4F5C\u548C" };
  }
  __name(adjudicate, "adjudicate");
  function warn(mh) {
    var n = mh.length;
    if (n < 4) return null;
    var rep = replayAll(mh);
    var cur = rep.keys[n], occ = [], j;
    for (j = 0; j <= n; j++) if (rep.keys[j] === cur) occ.push(j);
    if (occ.length !== 2) return null;
    var p1 = occ[0], p2 = occ[1];
    var b = initialBoard();
    for (j = 0; j < p1; j++) applyMv(b, mv(mh[j]));
    var cats = { red: [], black: [] }, tsets = { red: [], black: [] }, idx;
    for (idx = p1; idx < p2; idx++) {
      var S = idx % 2 === 0 ? "red" : "black";
      var cm = classifyMove(b, mv(mh[idx]), S);
      cats[S].push(cm.cls);
      if (cm.targets) tsets[S].push(cm.targets);
      applyMv(b, mv(mh[idx]));
    }
    var ra = aggregate(cats.red, tsets.red), ba = aggregate(cats.black, tsets.black);
    var mover = n % 2 === 0 ? "red" : "black";
    if (ra.cls === "bad" || ba.cls === "bad") {
      var badSide = ra.cls === "bad" ? "red" : "black";
      var badName = ra.cls === "bad" ? ra.name : ba.name;
      return {
        level: "bad",
        side: badSide,
        name: badName,
        moverIsBad: mover === badSide,
        text: '\u8B66\u544A\uFF1A\u5F53\u524D\u5FAA\u73AF\u6784\u6210"' + badName + '"\uFF0C\u518D\u6B21\u91CD\u590D\u5C06\u88AB\u5224\u8D1F'
      };
    }
    return { level: "info", text: "\u63D0\u793A\uFF1A\u53CC\u65B9\u4E0D\u53D8\uFF0C\u4E09\u6B21\u91CD\u590D\u5C06\u4F5C\u548C" };
  }
  __name(warn, "warn");
  g.XiangQiLi = {
    adjudicate,
    warn,
    isCheckmate,
    isMateThreat,
    inCheck,
    legalMoves,
    classifyMove,
    initialBoard,
    boardFromAscii,
    applyMv,
    profitAttacks,
    pseudoMoves,
    captureProfitable,
    NO_CAPTURE_PLIES,
    VAL
  };
})(typeof globalThis !== "undefined" ? globalThis : void 0);
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var activeConnections = /* @__PURE__ */ new Set();
var onlineCount = 0;
var lastPresenceEnv = null;
var lastHbAt = 0;
var aiWeights = {
  attackKing: 70,
  limitKingMob: 35,
  approach: 30,
  mobility: 5,
  rookNotMoved: 5,
  rookCrossed: 110,
  rookDeveloped: 90,
  horseDeveloped: 25,
  cannonDeveloped: 15,
  pieceSafety: 80,
  hangingPenalty: 80,
  tradeAccuracy: 120,
  pawnPromotion: 50,
  checkBonus: 130,
  centerControl: 20,
  rookCoordination: 60,
  kingSafety: 40
};
var aiTotalStats = { games: 0, redWins: 0, blkWins: 0, draws: 0 };
var TIER_TABLE = [
  [-160, "\u5B661-1"],
  [-100, "\u5B661-2"],
  [-40, "\u5B661-3"],
  [20, "\u5B662-1"],
  [80, "\u5B662-2"],
  [140, "\u5B662-3"],
  [200, "\u5B663-1"],
  [260, "\u5B663-2"],
  [320, "\u5B663-3"],
  [400, "\u4E1A1-1"],
  [480, "\u4E1A1-2"],
  [560, "\u4E1A1-3"],
  [640, "\u4E1A2-1"],
  [720, "\u4E1A2-2"],
  [800, "\u4E1A2-3"],
  [880, "\u4E1A3-1"],
  [960, "\u4E1A3-2"],
  [1040, "\u4E1A3-3"],
  [1120, "\u4E1A4-1"],
  [1200, "\u4E1A4-2"],
  [1280, "\u4E1A4-3"],
  [1360, "\u4E1A5-1"],
  [1440, "\u4E1A5-2"],
  [1520, "\u4E1A5-3"],
  [1600, "\u4E1A6-1"],
  [1700, "\u4E1A6-2"],
  [1800, "\u4E1A6-3"],
  [1900, "\u4E1A7-1"],
  [2e3, "\u4E1A7-2"],
  [2100, "\u4E1A7-3"],
  [2200, "\u4E1A8-1"],
  [2350, "\u4E1A8-2"],
  [2500, "\u4E1A8-3"],
  [2700, "\u4E1A9-1"],
  [3e3, "\u4E1A9-2"],
  [3300, "\u4E1A9-3"],
  [3700, "\u4E131-1"],
  [4100, "\u4E131-2"],
  [4500, "\u4E131-3"],
  [5e3, "\u4E132-1"],
  [5500, "\u4E132-2"],
  [6e3, "\u4E132-3"],
  [6400, "\u4E133-1"],
  [6700, "\u4E133-2"],
  [7e3, "\u4E133-3"]
];
var TIER_SCORE_MIN = -250;
var TIER_SCORE_MAX = 7e3;
var TIER_SCORE_DEFAULT = -160;
function rankTitle(score) {
  let label = TIER_TABLE[0][1];
  for (const t of TIER_TABLE) {
    if (score >= t[0]) label = t[1];
  }
  return label;
}
__name(rankTitle, "rankTitle");
__name2(rankTitle, "rankTitle");
function tierIndex(score) {
  let i = 0;
  for (let k = 0; k < TIER_TABLE.length; k++) {
    if (score >= TIER_TABLE[k][0]) i = k;
  }
  return i;
}
__name(tierIndex, "tierIndex");
__name2(tierIndex, "tierIndex");
function tierDelta(myScore, oppScore, outcome) {
  if (outcome === 0.5) return 0;
  let d = tierIndex(myScore) - tierIndex(oppScore);
  if (d > 1) d = 1;
  else if (d < -1) d = -1;
  const win = outcome === 1;
  if (d === 0) return win ? 10 : -10;
  if (d > 0) return win ? 5 : -15;
  return win ? 15 : -5;
}
__name(tierDelta, "tierDelta");
__name2(tierDelta, "tierDelta");
async function ensureRatingTables(db) {
  if (!db) return;
  try {
    await db.exec("CREATE TABLE IF NOT EXISTS players (device_id TEXT PRIMARY KEY, name TEXT, elo INTEGER DEFAULT 1200, games INTEGER DEFAULT 0, wins INTEGER DEFAULT 0, losses INTEGER DEFAULT 0, draws INTEGER DEFAULT 0, created_at INTEGER, last_seen INTEGER)");
    await db.exec("CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, room_id TEXT, red_device TEXT, black_device TEXT, red_name TEXT, black_name TEXT, result TEXT, reason TEXT, moves INTEGER, red_elo_before INTEGER, black_elo_before INTEGER, red_elo_after INTEGER, black_elo_after INTEGER, end_ts INTEGER)");
  } catch (e) {
  }
}
__name(ensureRatingTables, "ensureRatingTables");
__name2(ensureRatingTables, "ensureRatingTables");
async function upsertPlayer(db, deviceId, name) {
  if (!db || !deviceId) return null;
  const now = Date.now();
  try {
    await db.prepare("INSERT INTO players (device_id, name, elo, games, wins, losses, draws, created_at, last_seen) VALUES (?, ?, -160, 0, 0, 0, 0, ?, ?) ON CONFLICT(device_id) DO UPDATE SET last_seen = excluded.last_seen").bind(deviceId, name || null, now, now).run();
    if (name) await db.prepare("UPDATE players SET name = ? WHERE device_id = ?").bind(name, deviceId).run();
    return await db.prepare("SELECT * FROM players WHERE device_id = ?").bind(deviceId).first();
  } catch (e) {
    return null;
  }
}
__name(upsertPlayer, "upsertPlayer");
__name2(upsertPlayer, "upsertPlayer");
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations: 1e5 }, key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
__name2(hashPassword, "hashPassword");
var _authSchemaReady = false;
async function ensureAuthSchema(db) {
  if (!db || _authSchemaReady) return;
  try {
    await db.prepare("CREATE TABLE IF NOT EXISTS user_auth (username TEXT PRIMARY KEY, pass_hash TEXT NOT NULL, pass_salt TEXT NOT NULL, created_at INTEGER)").run();
    _authSchemaReady = true;
  } catch (e) {
  }
}
__name(ensureAuthSchema, "ensureAuthSchema");
__name2(ensureAuthSchema, "ensureAuthSchema");
var _egSchemaReady = false;
async function ensureEndgameSchema(db) {
  if (!db || _egSchemaReady) return;
  try {
    await db.exec("CREATE TABLE IF NOT EXISTS endgame_puzzles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, difficulty INTEGER DEFAULT 1, side TEXT DEFAULT 'red', pieces TEXT NOT NULL, goal TEXT DEFAULT '', enabled INTEGER DEFAULT 1, created_at INTEGER)");
    await db.exec("CREATE TABLE IF NOT EXISTS endgame_records (id INTEGER PRIMARY KEY AUTOINCREMENT, puzzle_id INTEGER, uid TEXT, moves INTEGER, win INTEGER, created_at INTEGER)");
    try {
      await db.exec("ALTER TABLE endgame_puzzles ADD COLUMN solution TEXT DEFAULT '[]'");
    } catch (eS1) {
    }
    _egSchemaReady = true;
  } catch (e) {
  }
}
__name(ensureEndgameSchema, "ensureEndgameSchema");
__name2(ensureEndgameSchema, "ensureEndgameSchema");
function validatePieces(arr) {
  if (!Array.isArray(arr) || arr.length < 4 || arr.length > 32) return null;
  const okT = { rook: 1, horse: 1, elephant: 1, advisor: 1, king: 1, cannon: 1, pawn: 1 };
  const out = [];
  let rk = 0, bk = 0;
  const seen = /* @__PURE__ */ new Set();
  for (const p of arr) {
    if (!p || !okT[p.type] || p.color !== "red" && p.color !== "black") return null;
    const row = parseInt(p.row), col = parseInt(p.col);
    if (!(row >= 0 && row <= 9 && col >= 0 && col <= 8)) return null;
    const key = row + "," + col;
    if (seen.has(key)) return null;
    seen.add(key);
    if (p.type === "king") {
      if (p.color === "red") rk++;
      else bk++;
    }
    out.push({ type: p.type, color: p.color, row, col });
  }
  if (rk !== 1 || bk !== 1) return null;
  return out;
}
__name(validatePieces, "validatePieces");
function randomSalt() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
__name(randomSalt, "randomSalt");
__name2(randomSalt, "randomSalt");
async function applyEloResult(db, roomId, red, black, result, reason, moveCount) {
  if (!db || !red || !black || !red.dev || !black.dev || red.dev === black.dev) return null;
  if (!["red", "black", "draw"].includes(result)) return null;
  if (!/^U:/.test(String(red.dev)) || !/^U:/.test(String(black.dev))) return null;
  try {
    const now = Date.now();
    const insP = "INSERT INTO players (device_id, name, elo, games, wins, losses, draws, created_at, last_seen) VALUES (?, ?, -160, 0, 0, 0, 0, ?, ?)";
    const r0 = await db.prepare("SELECT elo, games FROM players WHERE device_id = ?").bind(red.dev).first();
    if (!r0) await db.prepare(insP).bind(red.dev, red.name || null, now, now).run();
    const b0 = await db.prepare("SELECT elo, games FROM players WHERE device_id = ?").bind(black.dev).first();
    if (!b0) await db.prepare(insP).bind(black.dev, black.name || null, now, now).run();
    const before = { red: r0 ? r0.elo : TIER_SCORE_DEFAULT, black: b0 ? b0.elo : TIER_SCORE_DEFAULT };
    const outcomeR = result === "red" ? 1 : result === "draw" ? 0.5 : 0;
    const outcomeB = result === "black" ? 1 : result === "draw" ? 0.5 : 0;
    const dR = tierDelta(before.red, before.black, outcomeR);
    const dB = tierDelta(before.black, before.red, outcomeB);
    const after = { red: Math.max(TIER_SCORE_MIN, Math.min(TIER_SCORE_MAX, before.red + dR)), black: Math.max(TIER_SCORE_MIN, Math.min(TIER_SCORE_MAX, before.black + dB)) };
    const wr = result === "red" ? 1 : 0;
    const br = result === "black" ? 1 : 0;
    const dr = result === "draw" ? 1 : 0;
    await db.batch([
      db.prepare("UPDATE players SET elo = ?, games = games + 1, wins = wins + ?, losses = losses + ?, draws = draws + ?, last_seen = ? WHERE device_id = ?").bind(after.red, wr, br, dr, now, red.dev),
      db.prepare("UPDATE players SET elo = ?, games = games + 1, wins = wins + ?, losses = losses + ?, draws = draws + ?, last_seen = ? WHERE device_id = ?").bind(after.black, br, wr, dr, now, black.dev),
      db.prepare("INSERT INTO games (room_id, red_device, black_device, red_name, black_name, result, reason, moves, red_elo_before, black_elo_before, red_elo_after, black_elo_after, end_ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(roomId || null, red.dev, black.dev, red.name || null, black.name || null, result, reason || null, moveCount || 0, before.red, before.black, after.red, after.black, now)
    ]);
    return { red: { before: before.red, after: after.red }, black: { before: before.black, after: after.black } };
  } catch (e) {
    return null;
  }
}
__name(applyEloResult, "applyEloResult");
__name2(applyEloResult, "applyEloResult");
function broadcastOnlineCount() {
  const msg = JSON.stringify({ event: "online_count", data: onlineCount });
  for (const ws of activeConnections) {
    try {
      ws.send(msg);
    } catch (e) {
    }
  }
}
__name(broadcastOnlineCount, "broadcastOnlineCount");
__name2(broadcastOnlineCount, "broadcastOnlineCount");
var ChessRoom = class {
  static {
    __name(this, "ChessRoom");
  }
  static {
    __name2(this, "ChessRoom");
  }
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.room = null;
    this.disconnected = {};
    this._cleanupTimer = null;
    try {
      this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"event":"ping"}', '{"event":"pong"}'));
    } catch (e) {
    }
  }
  async initRoom(roomId) {
    if (!this.room) {
      this.room = {
        id: roomId,
        players: /* @__PURE__ */ new Map(),
        spectators: /* @__PURE__ */ new Set(),
        currentTurn: "red",
        gameOver: false,
        winner: null,
        redTime: 900,
        blkTime: 900,
        moveHistory: [],
        capturedRed: [],
        capturedBlack: [],
        playerTokens: null,
        gameStarted: false,
        seatIdentity: {},
        _ratedRecorded: false,
        createdAt: Date.now()
      };
      try {
        await this.ctx.storage.delete("dead");
      } catch (e) {
      }
      try {
        await this.ctx.storage.put("roomId", roomId);
      } catch (e) {
      }
      try {
        if (this.env.CHESS_DB) {
          const saved = await this.env.CHESS_DB.prepare(
            "SELECT state FROM room_state WHERE room_id = ?"
          ).bind(roomId).first();
          if (saved && saved.state) {
            const s = JSON.parse(saved.state);
            if (s && s.createdAt && Date.now() - s.createdAt < 36e5) {
              this.room.currentTurn = s.currentTurn || "red";
              this.room.gameOver = s.gameOver || false;
              this.room.winner = s.winner || null;
              this.room.endReason = s.endReason || null;
              this.room.redTime = s.redTime != null ? s.redTime : 900;
              this.room.blkTime = s.blkTime != null ? s.blkTime : 900;
              this.room.moveHistory = s.moveHistory || [];
              this.room.capturedRed = s.capturedRed || [];
              this.room.capturedBlack = s.capturedBlack || [];
              this.room.createdAt = s.createdAt;
              this.room.playerTokens = s.playerTokens || null;
              this.room.gameStarted = !!s.gameStarted;
              this.room.seatIdentity = s.seatIdentity || {};
              this.room._ratedRecorded = !!s._ratedRecorded;
              this.room._restoredFromDb = true;
              if (!this.room.gameOver && s._turnDeadline) {
                this.room._turnDeadline = s._turnDeadline;
                const remS = Math.max(0, Math.round((s._turnDeadline - Date.now()) / 1e3));
                if (this.room.currentTurn === "red") this.room.redTime = Math.min(this.room.redTime, remS);
                else this.room.blkTime = Math.min(this.room.blkTime, remS);
              }
              this.ctx.waitUntil(this._enrichSeatNames().then((ch) => {
                if (ch) {
                  try {
                    this.broadcastRoomState();
                  } catch (e2) {
                  }
                }
              }));
            }
          }
        }
      } catch (e) {
      }
    }
  }
  async _saveRoomState() {
    if (!this.room || !this.env.CHESS_DB) return;
    try {
      await this.env.CHESS_DB.exec(
        "CREATE TABLE IF NOT EXISTS room_state (room_id TEXT PRIMARY KEY, state TEXT, updated_at INTEGER)"
      );
      const state = JSON.stringify({
        currentTurn: this.room.currentTurn,
        gameOver: this.room.gameOver,
        winner: this.room.winner,
        endReason: this.room.endReason || null,
        redTime: this.room.redTime,
        blkTime: this.room.blkTime,
        moveHistory: this.room.moveHistory.slice(-200),
        capturedRed: this.room.capturedRed || [],
        capturedBlack: this.room.capturedBlack || [],
        playerTokens: this.room.playerTokens || null,
        gameStarted: !!this.room.gameStarted,
        seatIdentity: this.room.seatIdentity || {},
        _ratedRecorded: !!this.room._ratedRecorded,
        _turnDeadline: this.room._turnDeadline || null,
        createdAt: this.room.createdAt
      });
      await this.env.CHESS_DB.prepare(
        "INSERT OR REPLACE INTO room_state (room_id, state, updated_at) VALUES (?, ?, ?)"
      ).bind(this.room.id, state, Date.now()).run();
    } catch (e) {
    }
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      const roomId2 = url.searchParams.get("roomId") || this.ctx.id.toString().split("-").pop();
      await this.initRoom(roomId2);
      try {
        await this.ctx.storage.put("roomId", roomId2);
      } catch (e) {
      }
      const sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      this.ctx.acceptWebSocket(server, [sid]);
      server.serializeAttachment({ sid, color: null, spectator: false, replaced: false, assignedAt: Date.now() });
      return new Response(null, { status: 101, webSocket: client });
    }
    const roomId = url.searchParams.get("roomId") || this.ctx.id.toString().split("-").pop();
    if (request.method === "POST") {
      try {
        const body = await request.json();
        if (body.action === "init-room") {
          await this.initRoom(roomId);
          return new Response(JSON.stringify({ success: true, roomId }), { headers: { "Content-Type": "application/json" } });
        }
      } catch (e) {
      }
    }
    if (request.method === "GET") {
      return new Response(JSON.stringify({
        roomId,
        playerCount: this.room ? this.room.players.size : 0,
        exists: !!this.room
      }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Not found", { status: 404 });
  }
  _att(ws) {
    try {
      return ws.deserializeAttachment() || { sid: "", color: null, spectator: false, replaced: false, assignedAt: 0 };
    } catch (e) {
      return { sid: "", color: null, spectator: false, replaced: false, assignedAt: 0 };
    }
  }
  _same(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    const sa = this._att(a).sid, sb = this._att(b).sid;
    return !!sa && sa === sb;
  }
  _liveSids() {
    const s = /* @__PURE__ */ new Set();
    try {
      for (const x of this.ctx.getWebSockets()) {
        const a = this._att(x);
        if (a && a.sid) s.add(a.sid);
      }
    } catch (e) {
    }
    return s;
  }
  _syncSockets() {
    if (!this.room) return;
    const live = /* @__PURE__ */ new Set();
    try {
      for (const x of this.ctx.getWebSockets()) {
        live.add(x);
        const a = this._att(x);
        if (a.spectator) {
          if (!this.room.spectators.has(x)) this.room.spectators.add(x);
        } else if (a.color && !a.replaced) {
          if (![...this.room.players.keys()].some((k) => this._same(k, x))) this.room.players.set(x, { id: a.sid, color: a.color, assignedAt: a.assignedAt || Date.now() });
        }
      }
    } catch (e) {
    }
    for (const pws of [...this.room.players.keys()]) {
      if (!live.has(pws)) this.room.players.delete(pws);
    }
    for (const sws of [...this.room.spectators]) {
      if (!live.has(sws)) this.room.spectators.delete(sws);
    }
  }
  async _ensureLive() {
    if (!this.room) {
      if (!this._roomReady) {
        this._roomReady = (async () => {
          let rid = null;
          try {
            rid = await this.ctx.storage.get("roomId");
          } catch (e) {
          }
          if (!rid) rid = this.ctx.id.toString().split("-").pop();
          await this.initRoom(rid);
          try {
            this.disconnected = await this.ctx.storage.get("disconnected") || {};
          } catch (e) {
            this.disconnected = {};
          }
        })();
      }
      try {
        await this._roomReady;
      } finally {
        this._roomReady = null;
      }
    }
    this._syncSockets();
  }
  async webSocketMessage(ws, message) {
    const socketData = this._att(ws);
    try {
      await this._ensureLive();
      const data = JSON.parse(message);
      const eventName = data.event || data[0];
      const payload = data.payload || data[1];
      await this._onMessage(ws, socketData, eventName, payload);
    } catch (e) {
      console.error("Room WebSocket message error:", e);
    }
    try {
      ws.serializeAttachment(socketData);
    } catch (e) {
    }
  }
  async _onMessage(ws, socketData, eventName, payload) {
    if (eventName === "pong") {
      if (heartbeatTimeout) {
        clearTimeout(heartbeatTimeout);
        heartbeatTimeout = null;
      }
    } else if (eventName === "ping") {
      try {
        ws.send(JSON.stringify({ event: "pong" }));
      } catch (e) {
      }
    } else if (eventName === "create_room") {
      if (this._cleanupTimer) {
        clearTimeout(this._cleanupTimer);
        this._cleanupTimer = null;
      }
      for (const [pws, p] of [...this.room.players]) {
        const rep = this._att(pws).replaced;
        const dead = !this._liveSids().has(this._att(pws).sid);
        if (dead || rep) this.room.players.delete(pws);
      }
      let anyLiveSeated = false;
      try {
        anyLiveSeated = [...this.room.players].some(([pws2]) => {
          const a2 = this._att(pws2);
          return !a2.replaced && this._liveSids().has(a2.sid);
        });
      } catch (eAL) {
      }
      if (!anyLiveSeated && (this.room.gameOver || this.room.gameStarted || this.room.moveHistory && this.room.moveHistory.length > 0)) {
        this.room.gameOver = false;
        this.room.winner = null;
        this.room.endReason = null;
        this.room._gameEndedAt = null;
        this.room._turnDeadline = null;
        this.room._ratedRecorded = false;
        this.room.currentTurn = "red";
        this.room.redTime = 900;
        this.room.blkTime = 900;
        this.room.moveHistory = [];
        this.room.capturedRed = [];
        this.room.capturedBlack = [];
        this.room.playerTokens = {};
        this.room.seatIdentity = {};
        this.room.gameStarted = false;
        this.disconnected = {};
        try {
          await this.ctx.storage.delete("teardownAt");
        } catch (e) {
        }
        try {
          await this.ctx.storage.put("disconnected", {});
        } catch (e) {
        }
      }
      let lastColor = null;
      if (payload && typeof payload === "object" && payload.lastColor) {
        lastColor = payload.lastColor;
      }
      if (this.room.players.size > 0) {
        let existingColor = [...this.room.players.values()][0].color;
        let myColor = existingColor === "red" ? "black" : "red";
        const takenByLive = [...this.room.players.entries()].some(([pws2, p2]) => p2.color === myColor && !this._same(pws2, ws) && !this._att(pws2).replaced);
        if (takenByLive) myColor = myColor === "red" ? "black" : "red";
        const stillTaken = [...this.room.players.values()].some((p2) => p2.color === myColor);
        if (stillTaken) {
          ws.send(JSON.stringify({ event: "error", data: "\u623F\u95F4\u5DF2\u6EE1" }));
          return;
        }
        const myPid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        if (!this.room.playerTokens) this.room.playerTokens = {};
        this.room.playerTokens[myColor] = myPid;
        this.room.players.set(ws, { id: Math.random().toString(36).slice(2), color: myColor, assignedAt: Date.now() });
        socketData.color = myColor;
        socketData.cv = payload && payload.cv || socketData.cv || null;
        await this._setSeatIdentity(myColor, payload);
        ws.send(JSON.stringify({ event: "room_created", data: { roomId: this.room.id, color: myColor, pid: myPid, seatInfo: this.getRoomState().seatInfo } }));
        this.ctx.waitUntil(this._enrichSeatNames().then(() => this._regUpdate(this.room.players.size >= 2 ? "playing" : "waiting")).catch(() => {
        }));
        this._regKeepAlive();
      } else {
        let myColor;
        if (lastColor === "red") {
          myColor = "black";
        } else if (lastColor === "black") {
          myColor = "red";
        } else {
          myColor = Math.random() < 0.5 ? "red" : "black";
        }
        const myPid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        if (!this.room.playerTokens) this.room.playerTokens = {};
        this.room.playerTokens[myColor] = myPid;
        this.room.players.set(ws, { id: Math.random().toString(36).slice(2), color: myColor, assignedAt: Date.now() });
        socketData.color = myColor;
        socketData.cv = payload && payload.cv || socketData.cv || null;
        await this._setSeatIdentity(myColor, payload);
        ws.send(JSON.stringify({ event: "room_created", data: { roomId: this.room.id, color: myColor, pid: myPid, seatInfo: this.getRoomState().seatInfo } }));
        this.ctx.waitUntil(this._enrichSeatNames().then(() => this._regUpdate(this.room.players.size >= 2 ? "playing" : "waiting")).catch(() => {
        }));
        this._regKeepAlive();
      }
    } else if (eventName === "join_room") {
      if (this._cleanupTimer) {
        clearTimeout(this._cleanupTimer);
        this._cleanupTimer = null;
      }
      for (const [pws, p] of [...this.room.players]) {
        const rep = this._att(pws).replaced;
        const dead = !this._liveSids().has(this._att(pws).sid);
        if (dead || rep) this.room.players.delete(pws);
      }
      if (this.room.players.size === 0) {
        if (!(payload && payload.via === "match")) {
          try {
            ws.send(JSON.stringify({ event: "room_error", data: { msg: "\u623F\u95F4\u4E0D\u5B58\u5728\u6216\u5DF2\u89E3\u6563" } }));
          } catch (eRoomErr) {
          }
          return;
        }
        const firstPid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        const firstColor = "red";
        if (!this.room.playerTokens) this.room.playerTokens = {};
        this.room.playerTokens[firstColor] = firstPid;
        this.room.players.set(ws, { id: Math.random().toString(36).slice(2), color: firstColor, assignedAt: Date.now() });
        socketData.color = firstColor;
        socketData.cv = payload && payload.cv || socketData.cv || null;
        await this._setSeatIdentity(firstColor, payload);
        try {
          ws.send(JSON.stringify({ event: "room_created", data: { roomId: this.room.id, color: firstColor, pid: firstPid, seatInfo: this.getRoomState().seatInfo } }));
        } catch (e) {
        }
        this.broadcastRoomState();
        this.ctx.waitUntil(this._enrichSeatNames().then(() => this._regUpdate("waiting")).catch(() => {
        }));
        this._regKeepAlive();
        return;
      }
      if (this.room.players.size >= 2) {
        this.room.spectators.add(ws);
        socketData.spectator = true;
        ws.send(JSON.stringify({ event: "spectator_joined", data: { roomId: this.room.id, moveHistory: this.room.moveHistory } }));
        this.ctx.waitUntil(this._regTouch());
        return;
      }
      let color = [...this.room.players.values()][0].color === "red" ? "black" : "red";
      const joinPid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      if (!this.room.playerTokens) this.room.playerTokens = {};
      this.room.playerTokens[color] = joinPid;
      this.room.players.set(ws, { id: Math.random().toString(36).slice(2), color, assignedAt: Date.now() });
      socketData.color = color;
      socketData.cv = payload && payload.cv || socketData.cv || null;
      await this._setSeatIdentity(color, payload);
      if (this.room.players.size >= 2 && !this.room.gameOver) this.room.gameStarted = true;
      this.ctx.waitUntil(this._enrichSeatNames().then((ch) => {
        if (ch) {
          try {
            this.broadcastRoomState();
          } catch (e2) {
          }
        }
      }));
      ws.send(JSON.stringify({ event: "room_joined", data: { roomId: this.room.id, color, pid: joinPid, seatInfo: this.getRoomState().seatInfo, moveHistory: this.room.moveHistory, currentTurn: this.room.currentTurn, gameOver: this.room.gameOver, gameStarted: this.room.gameStarted, redTime: this.room.redTime, blkTime: this.room.blkTime } }));
      this.broadcastRoomState();
      this.broadcastToPlayers(JSON.stringify({ event: "game_start", data: { currentTurn: this.room.currentTurn, seatInfo: this.getRoomState().seatInfo } }));
      this.startRoomTimer();
      this.ctx.waitUntil(this._enrichSeatNames().then(() => this._regUpdate("playing")).catch(() => {
      }));
    } else if (eventName === "make_move") {
      if (!this.room || this.room.gameOver) {
        ws.send(JSON.stringify({ event: "move_rejected", data: { reason: "invalid_state" } }));
        try {
          if (this.room) this.ctx.waitUntil(this.env.CHESS_DB.prepare("INSERT INTO rej_log (room_id, ts, reason, your_color, current_turn, hist_len) VALUES (?,?,?,?,?,?)").bind(String(this.room.id || ""), Date.now(), "invalid_state", socketData && socketData.color || null, this.room.currentTurn, this.room.moveHistory.length).run());
        } catch (e) {
        }
        return;
      }
      if (this.room.players.size < 2 && this.room.moveHistory.length === 0 && !this.room.gameStarted) {
        ws.send(JSON.stringify({ event: "move_rejected", data: { reason: "invalid_state" } }));
        try {
          this.ctx.waitUntil(this.env.CHESS_DB.prepare("INSERT INTO rej_log (room_id, ts, reason, your_color, current_turn, hist_len) VALUES (?,?,?,?,?,?)").bind(String(this.room.id || ""), Date.now(), "invalid_state_prestart", socketData && socketData.color || null, this.room.currentTurn, this.room.moveHistory.length).run());
        } catch (e) {
        }
        return;
      }
      const attColorBefore = socketData.color || null;
      let authColor = null;
      for (const [pws, player] of this.room.players) {
        if (this._same(pws, ws)) {
          authColor = player.color;
          break;
        }
      }
      if (!authColor) authColor = socketData.color || null;
      if (authColor && socketData.color !== authColor) {
        socketData.color = authColor;
        try {
          ws.serializeAttachment(socketData);
        } catch (e) {
        }
      }
      if (!authColor) {
        ws.send(JSON.stringify({ event: "move_rejected", data: { reason: "no_color" } }));
        return;
      }
      const histLen = this.room.moveHistory.length;
      const lastMv = this.room.moveHistory[histLen - 1];
      if (lastMv && payload && lastMv.fromRow === payload.fromRow && lastMv.fromCol === payload.fromCol && lastMv.toRow === payload.toRow && lastMv.toCol === payload.toCol) {
        try {
          ws.send(JSON.stringify({ event: "move_ack", data: { moveHistoryLen: this.room.moveHistory.length, lastMove: { fromRow: lastMv.fromRow, fromCol: lastMv.fromCol, toRow: lastMv.toRow, toCol: lastMv.toCol }, currentTurn: this.room.currentTurn, dedupe: true } }));
        } catch (e) {
        }
        return;
      }
      if (this.room.currentTurn !== socketData.color) {
        ws.send(JSON.stringify({ event: "move_rejected", data: { reason: "not_your_turn", yourColor: socketData.color || null, currentTurn: this.room.currentTurn, histLen: this.room.moveHistory.length } }));
        try {
          let _pcol = null;
          for (const [pws2, pl2] of this.room.players) {
            if (this._same(pws2, ws)) {
              _pcol = pl2.color;
              break;
            }
          }
          this.ctx.waitUntil(this.env.CHESS_DB.prepare("INSERT INTO rej_log (room_id, ts, reason, your_color, current_turn, hist_len, client_ver, players_color, att_color) VALUES (?,?,?,?,?,?,?,?,?)").bind(String(this.room.id || ""), Date.now(), "not_your_turn", socketData.color || null, this.room.currentTurn, this.room.moveHistory.length, socketData.cv || payload && payload.cv || null, _pcol, attColorBefore).run());
        } catch (e) {
        }
        return;
      }
      const move = { ...payload, timestamp: Date.now() };
      this.room.moveHistory.push(move);
      if (move.captured) {
        if (!this.room.capturedRed) this.room.capturedRed = [];
        if (!this.room.capturedBlack) this.room.capturedBlack = [];
        if (move.captured.color === "red") this.room.capturedRed.push(move.captured);
        else this.room.capturedBlack.push(move.captured);
      }
      this.room.currentTurn = socketData.color === "red" ? "black" : "red";
      if (move.redLeft !== void 0) this.room.redTime = move.redLeft;
      if (move.blkLeft !== void 0) this.room.blkTime = move.blkLeft;
      if (this.env.RULES_OFF !== "1" && globalThis.XiangQiLi && !move.gameOver) {
        try {
          const adjQ = globalThis.XiangQiLi.adjudicate(this.room.moveHistory);
          if (adjQ && adjQ.type !== "none") {
            this.room.gameOver = true;
            this.room._gameEndedAt = Date.now();
            this.room.winner = adjQ.verdict;
            this.room._endReason = adjQ.endReason;
            if (this.room._timer) {
              clearInterval(this.room._timer);
              this.room._timer = null;
            }
            this.room._turnDeadline = null;
            this._scheduleAlarm();
            const ackQ = { moveHistoryLen: this.room.moveHistory.length, lastMove: { fromRow: move.fromRow, fromCol: move.fromCol, toRow: move.toRow, toCol: move.toCol }, currentTurn: this.room.currentTurn, applied: true };
            try {
              ws.send(JSON.stringify({ event: "move_ack", data: ackQ }));
            } catch (e) {
            }
            this.broadcastToRoom(JSON.stringify({ event: "game_over", data: { winner: adjQ.verdict, reason: adjQ.endReason, reasonText: adjQ.reason } }));
            this.broadcastRoomStateToOpponent(ws);
            this.ctx.waitUntil(this._recordGameEnd(adjQ.endReason));
            try {
              await this._saveRoomState();
            } catch (e) {
            }
            this.ctx.waitUntil(this._regTouch());
            return;
          }
        } catch (eQili) {
        }
      }
      if (this.env.RULES_OFF !== "1" && globalThis.XiangQiLi && !this.room.gameOver) {
        try {
          const wq = globalThis.XiangQiLi.warn(this.room.moveHistory);
          if (wq && wq.text) this.broadcastToRoom(JSON.stringify({ event: "rule_warning", data: { level: wq.level, side: wq.side || null, name: wq.name || null, text: wq.text } }));
        } catch (eWarn) {
        }
      }
      if (move.gameOver) {
        this.room.gameOver = true;
        this.room._gameEndedAt = Date.now();
        this.room.winner = socketData.color;
        if (this.room._timer) {
          clearInterval(this.room._timer);
          this.room._timer = null;
        }
      }
      if (this.room.gameOver) {
        this.room._turnDeadline = null;
      } else {
        const remNext = this.room.currentTurn === "red" ? this.room.redTime : this.room.blkTime;
        this.room._turnDeadline = Date.now() + Math.max(1, remNext) * 1e3;
      }
      this._scheduleAlarm();
      const opponentMove = { ...move, redLeft: this.room.redTime, blkLeft: this.room.blkTime };
      if (move.gameOver) this.ctx.waitUntil(this._recordGameEnd("checkmate"));
      const ackData = { moveHistoryLen: this.room.moveHistory.length, lastMove: { fromRow: move.fromRow, fromCol: move.fromCol, toRow: move.toRow, toCol: move.toCol }, currentTurn: this.room.currentTurn, applied: true };
      try {
        ws.send(JSON.stringify({ event: "move_ack", data: ackData }));
      } catch (e) {
      }
      this.broadcastToOpponent(ws, JSON.stringify({ event: "opponent_move", data: opponentMove }));
      this.broadcastRoomStateToOpponent(ws);
      this.broadcastToSpectators(JSON.stringify({ event: "opponent_move", data: opponentMove }));
      try {
        await this._saveRoomState();
      } catch (e) {
      }
      this.ctx.waitUntil(this._regTouch());
    } else if (eventName === "resign") {
      if (!this.room) return;
      this.room.gameOver = true;
      this.room._gameEndedAt = Date.now();
      this.room.winner = socketData.color === "red" ? "black" : "red";
      if (this.room._timer) {
        clearInterval(this.room._timer);
        this.room._timer = null;
      }
      this.room._turnDeadline = null;
      this._scheduleAlarm();
      this.broadcastToRoom(JSON.stringify({ event: "game_over", data: { winner: this.room.winner, reason: "resign" } }));
      this.ctx.waitUntil(this._recordGameEnd("resign"));
      await this._saveRoomState();
    } else if (eventName === "request_draw") {
      if (!this.room) return;
      this.broadcastToOpponent(ws, JSON.stringify({ event: "draw_requested", data: { from: socketData.color } }));
    } else if (eventName === "accept_draw") {
      if (!this.room) return;
      this.room.gameOver = true;
      this.room._gameEndedAt = Date.now();
      this.room.winner = "draw";
      if (this.room._timer) {
        clearInterval(this.room._timer);
        this.room._timer = null;
      }
      this.room._turnDeadline = null;
      this._scheduleAlarm();
      this.broadcastToRoom(JSON.stringify({ event: "game_over", data: { winner: "draw", reason: "draw" } }));
      this.ctx.waitUntil(this._recordGameEnd("draw"));
      await this._saveRoomState();
    } else if (eventName === "reject_draw") {
      if (!this.room) return;
      this.broadcastToOpponent(ws, JSON.stringify({ event: "draw_rejected", data: {} }));
    } else if (eventName === "chat") {
      if (!this.room) return;
      let _cn = null;
      if (socketData.color === "red" || socketData.color === "black") {
        const _si = this.room.seatIdentity && this.room.seatIdentity[socketData.color];
        _cn = _si && _si.name || null;
      }
      const msg = { from: socketData.color || "spectator", color: socketData.color, name: _cn, message: payload, timestamp: Date.now() };
      this.broadcastToRoom(JSON.stringify({ event: "chat", data: msg }));
    } else if (eventName === "rematch_request") {
      if (!this.room || this.room.players.size < 2) return;
      this.broadcastToOpponent(ws, JSON.stringify({ event: "rematch_requested", data: {} }));
    } else if (eventName === "accept_rematch") {
      if (!this.room || this.room.players.size < 2) return;
      if (!this.room.gameOver) return;
      const playerEntries = [...this.room.players.entries()];
      if (playerEntries.length === 2) {
        const [wsA, dataA] = playerEntries[0];
        const [wsB, dataB] = playerEntries[1];
        if (dataA.color !== dataB.color) {
          const tmpColor = dataA.color;
          dataA.color = dataB.color;
          dataB.color = tmpColor;
          if (this._same(wsA, ws)) {
            socketData.color = dataA.color;
            const attB = this._att(wsB);
            attB.color = dataB.color;
            try {
              wsB.serializeAttachment(attB);
            } catch (e) {
            }
          } else {
            const attA = this._att(wsA);
            attA.color = dataA.color;
            try {
              wsA.serializeAttachment(attA);
            } catch (e) {
            }
            socketData.color = dataB.color;
          }
        }
      }
      if (this.room.playerTokens && this.room.playerTokens.red && this.room.playerTokens.black) {
        const tmpTok = this.room.playerTokens.red;
        this.room.playerTokens.red = this.room.playerTokens.black;
        this.room.playerTokens.black = tmpTok;
      }
      if (this.room.seatIdentity) {
        const tmpId = this.room.seatIdentity.red;
        this.room.seatIdentity.red = this.room.seatIdentity.black;
        this.room.seatIdentity.black = tmpId;
      }
      this.room._ratedRecorded = false;
      this.room.gameOver = false;
      this.room._gameEndedAt = null;
      this.room.winner = null;
      this.room.currentTurn = "red";
      this.room.redTime = 900;
      this.room.blkTime = 900;
      this.room.moveHistory = [];
      this.room.capturedRed = [];
      this.room.capturedBlack = [];
      this.room.createdAt = Date.now();
      try {
        await this.ctx.storage.delete("teardownAt");
      } catch (e) {
      }
      try {
        const live = this._liveSids();
        for (const c of ["red", "black"]) {
          const seat = [...this.room.players.entries()].find(([, p]) => p.color === c);
          if (seat && live.has(this._att(seat[0]).sid)) delete this.disconnected[c];
        }
        await this.ctx.storage.put("disconnected", this.disconnected || {});
      } catch (e) {
      }
      this.startRoomTimer();
      this.broadcastToRoom(JSON.stringify({ event: "rematch_start", data: {} }));
      this.broadcastRoomState();
      await this._saveRoomState();
    } else if (eventName === "request_undo") {
      if (!this.room || this.room.moveHistory.length === 0 || this.room.gameOver) return;
      this.broadcastToOpponent(ws, JSON.stringify({ event: "undo_requested", data: {} }));
    } else if (eventName === "accept_undo") {
      if (!this.room || this.room.moveHistory.length === 0) return;
      const lastMove = this.room.moveHistory.pop();
      this.room.gameOver = false;
      this.room.winner = null;
      this.room.currentTurn = lastMove.currentTurn === "red" ? "black" : "red";
      if (lastMove.captured) {
        if (lastMove.captured.color === "red" && this.room.capturedRed && this.room.capturedRed.length > 0) {
          this.room.capturedRed.pop();
        } else if (lastMove.captured.color === "black" && this.room.capturedBlack && this.room.capturedBlack.length > 0) {
          this.room.capturedBlack.pop();
        }
      }
      this.startRoomTimer();
      this.broadcastToOpponent(ws, JSON.stringify({ event: "undo_accepted", data: {} }));
      this.broadcastRoomState();
      await this._saveRoomState();
    } else if (eventName === "reject_undo") {
      if (!this.room) return;
      this.broadcastToOpponent(ws, JSON.stringify({ event: "undo_rejected", data: {} }));
    } else if (eventName === "reconnect_room") {
      if (!this.room) {
        try {
          await this.initRoom(this.room.id);
        } catch (e2) {
        }
      }
      if (!this.room) return;
      try {
        const enriched = await this._enrichSeatNames();
        if (enriched) this.broadcastRoomState();
      } catch (e2b) {
      }
      const otherEntries = [...this.room.players.entries()].filter(([pws]) => !this._same(pws, ws));
      const liveSids = this._liveSids();
      const isReplaceable = /* @__PURE__ */ __name2((c) => otherEntries.some(([pws, p]) => p.color === c && (!liveSids.has(this._att(pws).sid) || this._att(pws).replaced || this.disconnected && this.disconnected[c])), "isReplaceable");
      const isFree = /* @__PURE__ */ __name2((c) => !otherEntries.some(([, p]) => p.color === c), "isFree");
      if (payload && payload.pid && this.room.playerTokens) {
        const tokColor = this.room.playerTokens.red === payload.pid ? "red" : this.room.playerTokens.black === payload.pid ? "black" : null;
        if (tokColor) {
          payload.color = tokColor;
          try {
            await this._setSeatIdentity(tokColor, payload);
          } catch (e4) {
          }
        }
      } else if (payload && payload.deviceId && this.room.seatIdentity) {
        const dv = String(payload.deviceId);
        const devColor = this.room.seatIdentity.red && this.room.seatIdentity.red.dev === dv ? "red" : this.room.seatIdentity.black && this.room.seatIdentity.black.dev === dv ? "black" : null;
        if (devColor) {
          payload.color = devColor;
          try {
            await this._setSeatIdentity(devColor, payload);
          } catch (e4) {
          }
        }
      }
      let color = payload.color;
      if (color && payload && payload.deviceId && this.room.seatIdentity) {
        const claimedSeat = this.room.seatIdentity[color];
        if (claimedSeat && claimedSeat.dev != null && String(claimedSeat.dev) !== String(payload.deviceId)) {
          const ownRed = this.room.seatIdentity.red && this.room.seatIdentity.red.dev != null && String(this.room.seatIdentity.red.dev) === String(payload.deviceId);
          const ownBlack = this.room.seatIdentity.black && this.room.seatIdentity.black.dev != null && String(this.room.seatIdentity.black.dev) === String(payload.deviceId);
          if (ownRed && color !== "red") color = "red";
          else if (ownBlack && color !== "black") color = "black";
        }
      }
      if (color) {
        if (isFree(color)) {
        } else {
          const sameColorEntry = otherEntries.find(([, p]) => p.color === color);
          if (sameColorEntry) {
            const [hws, seat] = sameColorEntry;
            const pidMatches2 = !!(payload.pid && this.room.playerTokens && this.room.playerTokens[color] === payload.pid);
            const holderDead = !liveSids.has(this._att(hws).sid) || !!this._att(hws).replaced;
            const holderIdle = false;
            const preDiscSeat = !!(this.disconnected && this.disconnected[color] && seat.assignedAt && this.disconnected[color] > seat.assignedAt);
            const devPinned = !!(payload.deviceId && this.room.seatIdentity && this.room.seatIdentity[color] && this.room.seatIdentity[color].dev != null && String(this.room.seatIdentity[color].dev) === String(payload.deviceId));
            if (!pidMatches2 && !devPinned && !holderDead && !holderIdle && !preDiscSeat) {
              const alt2 = color === "red" ? "black" : "red";
              if (isFree(alt2) || isReplaceable(alt2)) {
                color = alt2;
              } else {
                ws.send(JSON.stringify({ event: "error", data: "\u623F\u95F4\u5DF2\u6EE1\uFF0C\u65E0\u6CD5\u91CD\u8FDE" }));
                try {
                  ws.close();
                } catch (e2) {
                }
                return;
              }
            }
          } else {
            const alt = color === "red" ? "black" : "red";
            if (isFree(alt) || isReplaceable(alt)) {
              color = alt;
            } else {
              ws.send(JSON.stringify({ event: "error", data: "\u623F\u95F4\u5DF2\u6EE1\uFF0C\u65E0\u6CD5\u91CD\u8FDE" }));
              try {
                ws.close();
              } catch (e) {
              }
              return;
            }
          }
        }
      }
      if (!color) {
        const existingColors = [...this.room.players.values()].map((p) => p.color);
        if (existingColors.includes("red")) color = "black";
        else if (existingColors.includes("black")) color = "red";
        else if (this.disconnected.red) color = "red";
        else if (this.disconnected.black) color = "black";
      }
      if (!color) {
        ws.send(JSON.stringify({ event: "error", data: "\u65E0\u6CD5\u91CD\u8FDE" }));
        return;
      }
      if (this.disconnected[color]) delete this.disconnected[color];
      try {
        await this.ctx.storage.put("disconnected", this.disconnected);
      } catch (e) {
      }
      if (this.room._disconnectTimer) {
        clearTimeout(this.room._disconnectTimer);
        this.room._disconnectTimer = null;
      }
      let rotatedPid = null;
      const pidMatches = !!(payload.pid && this.room.playerTokens && this.room.playerTokens[color] === payload.pid);
      if (!pidMatches) {
        const seatId = this.room.seatIdentity && this.room.seatIdentity[color];
        const claimDev = payload && payload.deviceId ? String(payload.deviceId) : null;
        if (seatId && seatId.dev && claimDev && seatId.dev !== claimDev) {
          const alt2 = color === "red" ? "black" : "red";
          if (isFree(alt2) || isReplaceable(alt2)) {
            color = alt2;
          } else {
            ws.send(JSON.stringify({ event: "error", data: "\u65E0\u6CD5\u91CD\u8FDE\uFF1A\u8EAB\u4EFD\u4E0D\u7B26" }));
            try {
              ws.close();
            } catch (e) {
            }
            return;
          }
        }
        rotatedPid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        if (!this.room.playerTokens) this.room.playerTokens = {};
        this.room.playerTokens[color] = rotatedPid;
      }
      for (const [pws, player] of this.room.players) {
        if (player.color === color && !this._same(pws, ws)) {
          const attP = this._att(pws);
          attP.replaced = true;
          try {
            pws.serializeAttachment(attP);
          } catch (e) {
          }
          try {
            pws.send(JSON.stringify({ event: "room_closed", data: { reason: "replaced" } }));
          } catch (e) {
          }
          this.room.players.delete(pws);
          break;
        }
      }
      this.room.players.set(ws, { id: Math.random().toString(36).slice(2), color, assignedAt: Date.now() });
      socketData.color = color;
      socketData.cv = payload && payload.cv || socketData.cv || null;
      await this._setSeatIdentity(color, payload);
      if (this.room.players.size >= 2 && !this.room.gameOver) this.room.gameStarted = true;
      this.ctx.waitUntil(this._enrichSeatNames().then((ch) => {
        if (ch) {
          try {
            this.broadcastRoomState();
          } catch (e2) {
          }
        }
      }));
      const gameInProgress = !this.room.gameOver && this.room.moveHistory.length > 0;
      try {
        ws.send(JSON.stringify({ event: "room_state", data: {
          roomId: this.room.id,
          color,
          moveHistory: this.room.moveHistory,
          currentTurn: this.room.currentTurn,
          gameOver: this.room.gameOver,
          winner: this.room.winner,
          redTime: this.room.redTime,
          blkTime: this.room.blkTime,
          capturedRed: this.room.capturedRed,
          capturedBlack: this.room.capturedBlack,
          gameStarted: this.room.gameStarted,
          pid: rotatedPid || payload.pid || void 0,
          seatInfo: this.getRoomState().seatInfo
        } }));
      } catch (e) {
      }
      if (this.room.gameOver) {
        try {
          ws.send(JSON.stringify({ event: "game_over", data: { winner: this.room.winner, reason: this.room.endReason || "finished" } }));
        } catch (e) {
        }
      }
      this.broadcastRoomState();
      if (!this.room.gameOver && this.room.players.size >= 2) {
        this.startRoomTimer();
      }
      this.broadcastToOpponent(ws, JSON.stringify({ event: "player_reconnected", data: { color } }));
    } else if (eventName === "leave_room") {
      if (!this.room) return;
      if (socketData.spectator) {
        this.room.spectators.delete(ws);
        return;
      }
      const roomLeaving = this.room;
      const initPosition = !roomLeaving.moveHistory || roomLeaving.moveHistory.length === 0;
      let judgedWinner = null;
      if (roomLeaving.gameStarted && !roomLeaving.gameOver && socketData.color && !roomLeaving._ratedRecorded && !initPosition) {
        roomLeaving.gameOver = true;
        roomLeaving._gameEndedAt = Date.now();
        roomLeaving.winner = socketData.color === "red" ? "black" : "red";
        judgedWinner = roomLeaving.winner;
        if (roomLeaving._timer) {
          clearInterval(roomLeaving._timer);
          roomLeaving._timer = null;
        }
        if (roomLeaving._disconnectTimer) {
          clearTimeout(roomLeaving._disconnectTimer);
          roomLeaving._disconnectTimer = null;
        }
        this.ctx.waitUntil(this._recordGameEnd("opponent_left"));
      }
      const room = roomLeaving;
      this.ctx.waitUntil(this._regUpdate(null));
      this.room = null;
      this.disconnected = {};
      try {
        this.ctx.storage.delete("regKAOn").catch(() => {
        });
      } catch (e) {
      }
      try {
        this.ctx.storage.delete("teardownAt").catch(() => {
        });
      } catch (e) {
      }
      try {
        this.ctx.storage.delete("disconnected").catch(() => {
        });
      } catch (e) {
      }
      try {
        await this.ctx.storage.deleteAlarm();
      } catch (e) {
      }
      try {
        await this.ctx.storage.put("dead", 1);
      } catch (e) {
      }
      if (room._timer) {
        clearInterval(room._timer);
        room._timer = null;
      }
      if (room._disconnectTimer) {
        clearTimeout(room._disconnectTimer);
        room._disconnectTimer = null;
      }
      if (this._cleanupTimer) {
        clearTimeout(this._cleanupTimer);
        this._cleanupTimer = null;
      }
      this.disconnected = {};
      room.players.delete(ws);
      for (const [pws] of room.players) {
        try {
          pws.send(JSON.stringify({ event: "opponent_left", data: {} }));
        } catch (e) {
        }
      }
      room.players.forEach((p, pws) => {
        try {
          pws.close();
        } catch (e) {
        }
      });
      room.spectators.forEach((s) => {
        try {
          s.send(JSON.stringify({ event: "room_closed", data: { reason: "opponent_left" } }));
        } catch (e) {
        }
      });
      room.spectators.forEach((s) => {
        try {
          s.close();
        } catch (e) {
        }
      });
      try {
        ws.close();
      } catch (e) {
      }
      try {
        if (this.env.CHESS_DB && !room.gameOver) this.env.CHESS_DB.prepare("DELETE FROM room_state WHERE room_id = ?").bind(room.id).run();
      } catch (e) {
      }
    }
  }
  async webSocketClose(ws, code, reason, wasClean) {
    let deadFlag = null;
    try {
      deadFlag = await this.ctx.storage.get("dead");
    } catch (e) {
    }
    if (deadFlag) return;
    const socketData = this._att(ws);
    try {
      await this._ensureLive();
    } catch (e) {
    }
    if (socketData.spectator) {
      if (this.room) this.room.spectators.delete(ws);
      return;
    }
    if (!this.room || !socketData.color) return;
    if (socketData.replaced) return;
    this._syncSockets();
    this.room.players.delete(ws);
    this.disconnected[socketData.color] = Date.now();
    try {
      await this.ctx.storage.put("disconnected", this.disconnected);
    } catch (e) {
    }
    this.broadcastToOpponent(ws, JSON.stringify({ event: "player_disconnected", data: { color: socketData.color } }));
    this.ctx.waitUntil(this._saveRoomState());
    try {
      await this._scheduleAlarm();
    } catch (e) {
    }
  }
  async _doForfeit(color, now) {
    this.room.gameOver = true;
    this.room._gameEndedAt = now;
    this.room.winner = color === "red" ? "black" : "red";
    this.room.endReason = "disconnect_timeout";
    this.broadcastToRoom(JSON.stringify({ event: "game_over", data: { winner: this.room.winner, reason: "disconnect_timeout" } }));
    this.broadcastToRoom(JSON.stringify({ event: "room_timeout", data: {} }));
    this.ctx.waitUntil(this._recordGameEnd("disconnect_timeout"));
    this._saveRoomState();
    this.ctx.waitUntil(this._regUpdate(null));
    try {
      await this.ctx.storage.put("teardownAt", now + 6e4);
    } catch (e) {
    }
  }
  async alarm() {
    let deadFlag = null;
    try {
      deadFlag = await this.ctx.storage.get("dead");
    } catch (e) {
    }
    if (deadFlag) {
      try {
        await this.ctx.storage.deleteAlarm();
      } catch (e) {
      }
      return;
    }
    try {
      await this._ensureLive();
    } catch (e) {
    }
    const now = Date.now();
    if (this.room) {
      if (!this.room.gameOver) {
        const zeroMoves = !this.room.moveHistory || this.room.moveHistory.length === 0;
        for (const color of ["red", "black"]) {
          if (this.disconnected[color] && now - this.disconnected[color] > 6e4) {
            if (zeroMoves) {
              let anyLive = false;
              try {
                anyLive = this.ctx.getWebSockets().some((x) => x.readyState === 1);
              } catch (eLv0) {
              }
              if (!anyLive) {
                try {
                  await this.ctx.storage.delete("regKAOn");
                } catch (eKA0) {
                }
                try {
                  await this.ctx.storage.put("teardownAt", now + 6e4);
                } catch (eTD0) {
                }
              }
              break;
            }
            await this._doForfeit(color, now);
            break;
          }
        }
      }
      if (!this.room.gameOver && this.room._turnDeadline && now >= this.room._turnDeadline) {
        const loser = this.room.currentTurn;
        const winner2 = loser === "red" ? "black" : "red";
        this.room.gameOver = true;
        this.room._gameEndedAt = now;
        this.room.winner = winner2;
        this.room.endReason = "timeout";
        this.broadcastToRoom(JSON.stringify({ event: "timeout", data: { winner: winner2 } }));
        this.broadcastToRoom(JSON.stringify({ event: "game_over", data: { winner: winner2, reason: "timeout" } }));
        this.ctx.waitUntil(this._recordGameEnd("timeout"));
        this._saveRoomState();
        try {
          await this.ctx.storage.put("teardownAt", now + 6e4);
        } catch (e) {
        }
      }
    }
    let td = null;
    try {
      td = await this.ctx.storage.get("teardownAt");
    } catch (e) {
    }
    if (td && now >= td) {
      let liveNow = false;
      try {
        liveNow = !!(this.room && !this.room.gameOver && this.ctx.getWebSockets().some((x) => x.readyState === 1));
      } catch (eLv) {
      }
      if (liveNow) {
        try {
          await this.ctx.storage.delete("teardownAt");
        } catch (e) {
        }
      } else {
        try {
          await this.ctx.storage.delete("regKAOn");
        } catch (e) {
        }
        try {
          await this.ctx.storage.delete("disconnected");
        } catch (e) {
        }
        try {
          await this.ctx.storage.put("dead", 1);
        } catch (e) {
        }
        const roomTeardown = this.room;
        this.room = null;
        this.disconnected = {};
        try {
          for (const x of this.ctx.getWebSockets()) {
            try {
              x.close();
            } catch (eTeardown) {
            }
          }
        } catch (e) {
        }
        if (roomTeardown) this.ctx.waitUntil(this._regUpdate(null));
        return;
      }
    }
    if (this.room && !this.room.gameOver) {
      let kaOn = null;
      try {
        kaOn = await this.ctx.storage.get("regKAOn");
      } catch (e) {
      }
      if (kaOn) {
        let anyLive = false;
        try {
          anyLive = this.ctx.getWebSockets().some((x) => x.readyState === 1);
        } catch (eKA1) {
        }
        if (anyLive) this.ctx.waitUntil(this._regTouch());
      }
    }
    try {
      await this._scheduleAlarm();
    } catch (e) {
    }
  }
  async _scheduleAlarm() {
    try {
      const now = Date.now();
      let next = Infinity;
      if (this.room && !this.room.gameOver && this.room._turnDeadline) next = Math.min(next, this.room._turnDeadline);
      for (const c of ["red", "black"]) if (this.disconnected[c]) next = Math.min(next, this.disconnected[c] + 63e3);
      let td = null;
      try {
        td = await this.ctx.storage.get("teardownAt");
      } catch (e) {
      }
      if (td) next = Math.min(next, td);
      if (this.room && !this.room.gameOver) {
        let kaOn = null;
        try {
          kaOn = await this.ctx.storage.get("regKAOn");
        } catch (e) {
        }
        if (kaOn) {
          let anyLive = false;
          try {
            anyLive = this.ctx.getWebSockets().some((x) => x.readyState === 1);
          } catch (eKA2) {
          }
          if (anyLive) next = Math.min(next, now + 6e4);
        }
      }
      if (next !== Infinity) {
        const at = Math.max(now + 1e3, next);
        try {
          await this.ctx.storage.setAlarm(at);
        } catch (e) {
        }
      } else {
        try {
          await this.ctx.storage.deleteAlarm();
        } catch (e) {
        }
      }
    } catch (e) {
    }
  }
  broadcastToRoom(msg) {
    if (!this.room) return;
    for (const ws of this.room.players.keys()) {
      try {
        ws.send(msg);
      } catch (e) {
      }
    }
    for (const ws of this.room.spectators) {
      try {
        ws.send(msg);
      } catch (e) {
      }
    }
  }
  broadcastRoomState() {
    if (!this.room) return;
    const baseState = this.getRoomState();
    for (const [ws, player] of this.room.players) {
      try {
        ws.send(JSON.stringify({ event: "room_state", data: { ...baseState, color: player.color } }));
      } catch (e) {
      }
    }
    for (const ws of this.room.spectators) {
      try {
        ws.send(JSON.stringify({ event: "room_state", data: baseState }));
      } catch (e) {
      }
    }
  }
  broadcastToPlayers(msg) {
    if (!this.room) return;
    for (const ws of this.room.players.keys()) {
      try {
        ws.send(msg);
      } catch (e) {
      }
    }
  }
  broadcastToSpectators(msg) {
    if (!this.room) return;
    for (const ws of this.room.spectators) {
      try {
        ws.send(msg);
      } catch (e) {
      }
    }
  }
  broadcastToOpponent(ws, msg) {
    if (!this.room) return;
    for (const [pws, player] of this.room.players) {
      if (!this._same(pws, ws)) {
        try {
          pws.send(msg);
        } catch (e) {
        }
      }
    }
  }
  broadcastRoomStateToOpponent(ws) {
    if (!this.room) return;
    const baseState = this.getRoomState();
    for (const [pws, player] of this.room.players) {
      if (!this._same(pws, ws)) {
        try {
          pws.send(JSON.stringify({ event: "room_state", data: { ...baseState, color: player.color } }));
        } catch (e) {
        }
      }
    }
  }
  getRoomState() {
    const si = this.room.seatIdentity || {};
    return {
      roomId: this.room.id,
      playerCount: this.room.players.size,
      currentTurn: this.room.currentTurn,
      gameOver: this.room.gameOver,
      winner: this.room.winner,
      moveHistory: this.room.moveHistory,
      redTime: this.room.redTime,
      blkTime: this.room.blkTime,
      capturedRed: this.room.capturedRed,
      capturedBlack: this.room.capturedBlack,
      gameStarted: this.room.gameStarted || this.room.players.size >= 2,
      seatInfo: {
        red: si.red ? { name: si.red.name || (si.red.dev ? "\u6E38\u5BA2" : null), elo: si.red.elo || null, title: si.red.elo ? rankTitle(si.red.elo) : null } : null,
        black: si.black ? { name: si.black.name || (si.black.dev ? "\u6E38\u5BA2" : null), elo: si.black.elo || null, title: si.black.elo ? rankTitle(si.black.elo) : null } : null
      }
    };
  }
  async _regUpdate(status) {
    if (!this.env || !this.env.CHESS_DB) return;
    const rid = this.room ? this.room.id : null;
    if (!rid) return;
    const si = this.room.seatIdentity || {};
    const fmt = /* @__PURE__ */ __name(function(s) {
      if (!s) return null;
      var n = s.name || "\u6E38\u5BA2";
      var t = typeof s.elo === "number" ? rankTitle(s.elo) : null;
      return t ? n + " " + t : n;
    }, "fmt");
    const rn = fmt(si.red), bn = fmt(si.black);
    const watchers = this.room.spectators ? this.room.spectators.size : 0;
    try {
      await this.env.CHESS_DB.exec("CREATE TABLE IF NOT EXISTS rooms_registry (id TEXT PRIMARY KEY, red TEXT, black TEXT, status TEXT, watchers INTEGER, updated_at INTEGER)");
      if (status === null) {
        await this.env.CHESS_DB.prepare("DELETE FROM rooms_registry WHERE id = ?").bind(rid).run();
      } else {
        await this.env.CHESS_DB.prepare("INSERT OR REPLACE INTO rooms_registry (id, red, black, status, watchers, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(rid, rn, bn, status, watchers, Date.now()).run();
      }
    } catch (e) {
    }
  }
  async _regTouch() {
    if (!this.env || !this.env.CHESS_DB || !this.room) return;
    try {
      await this.env.CHESS_DB.prepare("UPDATE rooms_registry SET watchers = ?, updated_at = ? WHERE id = ?").bind(this.room.spectators ? this.room.spectators.size : 0, Date.now(), this.room.id).run();
    } catch (e) {
    }
  }
  // 房间保活: 只要房间存在(哪怕还没人加入), 每分钟刷新 registry 的 updated_at, 避免被 /api/rooms 的120秒窗口过滤掉
  _regKeepAlive() {
    if (!this.env || !this.env.CHESS_DB) return;
    try {
      this.ctx.storage.put("regKAOn", 1).then(() => this._scheduleAlarm()).catch(() => {
      });
    } catch (e) {
    }
  }
  async _enrichSeatNames() {
    const si = this.room && this.room.seatIdentity;
    if (!si || !this.env || !this.env.CHESS_DB) return false;
    let changed = false;
    for (const color of ["red", "black"]) {
      const s = si[color];
      if (s && s.dev && (!s.name || !(typeof s.elo === "number" && s.elo > 0))) {
        try {
          const row = await this.env.CHESS_DB.prepare("SELECT name, elo FROM players WHERE device_id = ?").bind(s.dev).first();
          if (row) {
            if (!s.name && row.name) {
              s.name = String(row.name).slice(0, 24);
              changed = true;
            }
            if (typeof row.elo === "number" && row.elo > 0 && s.elo !== row.elo) {
              s.elo = row.elo;
              changed = true;
            }
          }
        } catch (e) {
        }
      }
    }
    return changed;
  }
  async _setSeatIdentity(color, payload) {
    if (!color || !payload || typeof payload !== "object") return;
    if (!this.room.seatIdentity) this.room.seatIdentity = {};
    const prev = this.room.seatIdentity[color] || {};
    const dev = payload.deviceId ? String(payload.deviceId).slice(0, 64) : prev.dev || null;
    let name = payload.playerName ? String(payload.playerName).slice(0, 24) : prev.name || null;
    if (!name && dev && this.env && this.env.CHESS_DB) {
      try {
        const row = await this.env.CHESS_DB.prepare("SELECT name FROM players WHERE device_id = ?").bind(dev).first();
        if (row && row.name) name = String(row.name).slice(0, 24);
      } catch (e) {
      }
    }
    this.room.seatIdentity[color] = {
      dev,
      name: name || null,
      elo: Number.isFinite(payload.elo) ? Math.round(payload.elo) : prev.elo || null
    };
  }
  async _recordGameEnd(reason) {
    if (!this.room || !this.env.CHESS_DB || this.room._ratedRecorded) return;
    const si = this.room.seatIdentity || {};
    const red = si.red;
    const black = si.black;
    if (!red || !black || !red.dev || !black.dev || red.dev === black.dev) return;
    if (!this.room.moveHistory || this.room.moveHistory.length < 2) return;
    const result = this.room.winner === "red" ? "red" : this.room.winner === "black" ? "black" : "draw";
    this.room._ratedRecorded = true;
    const res = await applyEloResult(this.env.CHESS_DB, this.room.id, red, black, result, reason, this.room.moveHistory.length);
    this.ctx.waitUntil(this._regTouch());
    if (res) {
      try {
        this.broadcastToRoom(JSON.stringify({ event: "rating_update", data: {
          red: { name: red.name || null, before: res.red.before, after: res.red.after, title: rankTitle(res.red.after) },
          black: { name: black.name || null, before: res.black.before, after: res.black.after, title: rankTitle(res.black.after) }
        } }));
      } catch (e) {
      }
      this.ctx.waitUntil(this._saveRoomState());
    } else {
      this.room._ratedRecorded = false;
    }
  }
  startRoomTimer() {
    if (!this.room || this.room.gameOver) return;
    const rem = this.room.currentTurn === "red" ? this.room.redTime : this.room.blkTime;
    this.room._turnDeadline = Date.now() + Math.max(1, rem) * 1e3;
    this._scheduleAlarm();
  }
};
async function initAiDb(db) {
  try {
    await db.exec(`CREATE TABLE IF NOT EXISTS ai_weights (id INTEGER PRIMARY KEY, weights TEXT, stats TEXT, updated_at INTEGER)`);
  } catch (e) {
    console.error("initAiDb error:", e.message);
  }
}
__name(initAiDb, "initAiDb");
__name2(initAiDb, "initAiDb");
async function loadAiFromDb(db) {
  try {
    const result = await db.prepare("SELECT weights, stats FROM ai_weights WHERE id = 1").first();
    if (result) {
      if (result.weights) {
        try {
          const w = JSON.parse(result.weights);
          for (const k in w) {
            if (aiWeights[k] !== void 0 && typeof w[k] === "number") aiWeights[k] = w[k];
          }
        } catch (e) {
        }
      }
      if (result.stats) {
        try {
          const s = JSON.parse(result.stats);
          if (s && typeof s === "object") {
            if (typeof s.games === "number") aiTotalStats.games = s.games;
            if (typeof s.redWins === "number") aiTotalStats.redWins = s.redWins;
            if (typeof s.blkWins === "number") aiTotalStats.blkWins = s.blkWins;
            if (typeof s.draws === "number") aiTotalStats.draws = s.draws;
          }
        } catch (e) {
        }
      }
    }
  } catch (e) {
    console.error("loadAiFromDb error:", e.message);
  }
}
__name(loadAiFromDb, "loadAiFromDb");
__name2(loadAiFromDb, "loadAiFromDb");
async function saveAiToDb(db) {
  try {
    await db.exec(`CREATE TABLE IF NOT EXISTS ai_weights (id INTEGER PRIMARY KEY, weights TEXT, stats TEXT, updated_at INTEGER)`);
    await db.prepare(`INSERT OR REPLACE INTO ai_weights (id, weights, stats, updated_at) VALUES (1, ?, ?, ?)`).bind(JSON.stringify(aiWeights), JSON.stringify(aiTotalStats), Date.now()).run();
    return true;
  } catch (e) {
    console.error("saveAiToDb error:", e.message);
    return false;
  }
}
__name(saveAiToDb, "saveAiToDb");
__name2(saveAiToDb, "saveAiToDb");
var MatchQueue = class {
  static {
    __name(this, "MatchQueue");
  }
  static {
    __name2(this, "MatchQueue");
  }
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.queue = [];
    this.pairings = /* @__PURE__ */ new Map();
    this._loaded = false;
    this.events = [];
    this.online = 0;
    this._pConn = /* @__PURE__ */ new Map();
    this._pTotal = 0;
  }
  _log(ev, detail) {
    try {
      this.events.push({ t: Date.now(), ev, d: detail || "" });
      if (this.events.length > 40) this.events = this.events.slice(-40);
    } catch (e) {
    }
  }
  async _ensureLoaded() {
    if (this._loaded) return;
    this._loaded = true;
    try {
      const q = await this.ctx.storage.get("queue");
      if (Array.isArray(q)) this.queue = q;
      const p = await this.ctx.storage.get("pairings");
      if (Array.isArray(p)) this.pairings = new Map(p);
    } catch (e) {
    }
  }
  async _persist() {
    try {
      await this.ctx.storage.put("queue", this.queue);
      await this.ctx.storage.put("pairings", [...this.pairings]);
    } catch (e) {
    }
  }
  async _tryPair() {
    const now = Date.now();
    this.queue = this.queue.filter((e) => now - (e.act || 0) < 4e4);
    if (this.queue.length < 2) return;
    const sorted = [...this.queue].sort((a, b) => a.elo - b.elo);
    const pairedTickets = /* @__PURE__ */ new Set();
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i];
      if (pairedTickets.has(a.ticket)) continue;
      for (let j = i + 1; j < sorted.length; j++) {
        const b = sorted[j];
        if (pairedTickets.has(b.ticket)) continue;
        const waitSec = Math.floor((now - Math.min(a.ts, b.ts)) / 1e3);
        const tol = Math.min(60 + waitSec * 12, 600);
        if (Math.abs(a.elo - b.elo) <= tol) {
          pairedTickets.add(a.ticket);
          pairedTickets.add(b.ticket);
          const roomId = await generateFreeRoomId(this.env.CHESS_DB);
          const redIsA = Math.random() < 0.5;
          this._log("pair", (a.name || "?") + " vs " + (b.name || "?") + " room=" + roomId);
          this.pairings.set(a.ticket, { data: { roomId, color: redIsA ? "red" : "black", oppName: b.name || null, oppElo: b.elo || null, rated: true }, ts: now });
          this.pairings.set(b.ticket, { data: { roomId, color: redIsA ? "black" : "red", oppName: a.name || null, oppElo: a.elo || null, rated: true }, ts: now });
          break;
        }
      }
    }
    if (pairedTickets.size) {
      this.queue = this.queue.filter((e) => !pairedTickets.has(e.ticket));
      if (this.pairings.size > 500) {
        const entries = [...this.pairings.entries()].sort((x, y) => x[1].ts - y[1].ts);
        for (let k = 0; k < 250; k++) this.pairings.delete(entries[k][0]);
      }
    }
  }
  async _scheduleSweep() {
    if (this.queue.length > 0) {
      try {
        await this.ctx.storage.setAlarm(Date.now() + 2e3);
      } catch (e) {
      }
    }
  }
  async alarm() {
    await this._ensureLoaded();
    await this._tryPair();
    await this._scheduleSweep();
    await this._persist();
  }
  async fetch(request) {
    await this._ensureLoaded();
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/join" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body || !body.deviceId) return Response.json({ ok: false, error: "deviceId required" });
        const ticket = Math.random().toString(36).slice(2) + Date.now().toString(36);
        const elo = Number.isFinite(body.elo) ? Math.round(body.elo) : 1200;
        const devCount = this.queue.filter((e) => e.deviceId === body.deviceId).length;
        if (devCount >= 3) this.queue = this.queue.filter((e) => e.deviceId !== body.deviceId);
        this.queue.push({ ticket, deviceId: String(body.deviceId).slice(0, 64), name: body.name ? String(body.name).slice(0, 24) : null, elo, ts: Date.now(), act: Date.now() });
        this._log("join", (body.name || body.deviceId) + " elo=" + elo + " queue=" + this.queue.length);
        await this._tryPair();
        await this._scheduleSweep();
        await this._persist();
        return Response.json({ ok: true, ticket });
      } catch (e) {
        return Response.json({ ok: false, error: "bad request" }, { status: 400 });
      }
    }
    if (path === "/status") {
      const ticket = url.searchParams.get("ticket");
      const p = ticket && this.pairings.get(ticket);
      if (p) {
        this.pairings.delete(ticket);
        await this._persist();
        return Response.json({ ok: true, state: "paired", roomId: p.data.roomId, color: p.data.color, oppName: p.data.oppName, oppElo: p.data.oppElo });
      }
      const still2 = ticket && this.queue.find((e) => e.ticket === ticket);
      if (still2) still2.act = Date.now();
      const still = !!still2;
      return Response.json({ ok: true, state: still ? "waiting" : "none", queueSize: this.queue.length });
    }
    if (path === "/cancel" && request.method === "POST") {
      try {
        const body = await request.json();
        this.queue = this.queue.filter((e) => e.ticket !== body.ticket);
        this._log("cancel", "left=" + this.queue.length);
        await this._persist();
        return Response.json({ ok: true });
      } catch (e) {
        return Response.json({ ok: false }, { status: 400 });
      }
    }
    if (path === "/online") {
      return Response.json({ ok: true, online: this.online || 0 });
    }
    if (path === "/presence" && request.method === "POST") {
      try {
        const body = await request.json();
        const now = Date.now();
        if (!this._pConn) this._pConn = /* @__PURE__ */ new Map();
        if (body && typeof body.join === "string") {
          const pex = this._pConn.get(body.join);
          this._pConn.set(body.join, { dev: pex ? pex.dev : null, seen: now });
        } else if (body && typeof body.leave === "string") {
          this._pConn.delete(body.leave);
        } else if (body && typeof body.set === "string" && body.deviceId) {
          const pex2 = this._pConn.get(body.set);
          if (pex2) pex2.dev = String(body.deviceId).slice(0, 64);
          else this._pConn.set(body.set, { dev: String(body.deviceId).slice(0, 64), seen: now });
        } else if (body && Array.isArray(body.heartbeat)) {
          for (const hit of body.heartbeat) {
            if (hit && typeof hit.id === "string") {
              const pc2 = this._pConn.get(hit.id);
              if (pc2) {
                pc2.seen = now;
                if (hit.dev && !pc2.dev) pc2.dev = String(hit.dev).slice(0, 64);
              } else this._pConn.set(hit.id, { dev: hit.dev ? String(hit.dev).slice(0, 64) : null, seen: now });
            }
          }
        }
        for (const [pid2, pc5] of [...this._pConn]) {
          if (now - pc5.seen > 7e4) this._pConn.delete(pid2);
        }
        const devs = /* @__PURE__ */ new Set();
        let anon = 0;
        for (const [, pc4] of this._pConn) {
          if (pc4.dev) devs.add(pc4.dev);
          else anon++;
        }
        this._pTotal = devs.size + anon;
        return Response.json({ ok: true, online: this._pTotal });
      } catch (e) {
        return Response.json({ ok: false, online: this._pTotal || 0 });
      }
    }
    if (path === "/debug") {
      const now = Date.now();
      const _pList = [];
      if (this._pConn) {
        for (const [k2, v2] of this._pConn) {
          _pList.push({ id: k2.slice(0, 6), dev: v2.dev ? v2.dev.slice(0, 8) : null, ageMs: Date.now() - v2.seen });
        }
      }
      return Response.json({ ok: true, queueSize: this.queue.length, pairings: this.pairings.size, presence: { total: this._pTotal || 0, conns: _pList }, queue: this.queue.map((e) => ({ dev: String(e.deviceId).slice(0, 6) + "***", name: e.name || null, elo: e.elo, ageSec: Math.floor((now - e.ts) / 1e3), ticket: String(e.ticket).slice(0, 6) })), events: this.events });
    }
    return Response.json({ ok: false, error: "unknown" }, { status: 404 });
  }
};
__name2(MatchQueue, "MatchQueue");
async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const json = /* @__PURE__ */ __name((obj, status) => new Response(JSON.stringify(obj), { status: status || 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }), "json");
  if (path === "/api/auth/register" && request.method === "POST") {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureAuthSchema(env.CHESS_DB);
    await ensureRatingTables(env.CHESS_DB);
    try {
      const body = await request.json();
      const username = body.username ? String(body.username).trim() : "";
      const password = body.password ? String(body.password) : "";
      if (!/^[A-Za-z0-9_\u4e00-\u9fa5]{2,12}$/.test(username)) return json({ ok: false, error: "\u7528\u6237\u540D\u97002-12\u4F4D\uFF08\u4E2D\u6587/\u5B57\u6BCD/\u6570\u5B57/\u4E0B\u5212\u7EBF\uFF09" }, 400);
      if (password.length < 6 || password.length > 64) return json({ ok: false, error: "\u5BC6\u7801\u97006-64\u4F4D" }, 400);
      const exists = await env.CHESS_DB.prepare("SELECT username FROM user_auth WHERE username = ?").bind(username).first();
      if (exists) return json({ ok: false, error: "\u7528\u6237\u540D\u5DF2\u88AB\u6CE8\u518C" }, 409);
      const salt = randomSalt();
      const hash = await hashPassword(password, salt);
      await env.CHESS_DB.prepare("INSERT INTO user_auth (username, pass_hash, pass_salt, created_at) VALUES (?, ?, ?, ?)").bind(username, hash, salt, Date.now()).run();
      const accId = "U:" + username;
      let seeded = null;
      if (body.deviceId && body.deviceId !== accId) {
        try {
          seeded = await env.CHESS_DB.prepare("SELECT elo, games, wins, losses, draws FROM players WHERE device_id = ?").bind(String(body.deviceId).slice(0, 64)).first();
        } catch (e2) {
          seeded = null;
        }
      }
      const now = Date.now();
      if (seeded && seeded.games > 0) {
        await env.CHESS_DB.prepare("INSERT INTO players (device_id, name, elo, games, wins, losses, draws, created_at, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(device_id) DO UPDATE SET name = excluded.name, last_seen = excluded.last_seen").bind(accId, username, seeded.elo, seeded.games, seeded.wins, seeded.losses, seeded.draws || 0, now, now).run();
      } else {
        await upsertPlayer(env.CHESS_DB, accId, username);
      }
      const p = await env.CHESS_DB.prepare("SELECT * FROM players WHERE device_id = ?").bind(accId).first();
      return json({ ok: true, username, player: p ? { deviceId: p.device_id, name: p.name, elo: p.elo, games: p.games, wins: p.wins, losses: p.losses, draws: p.draws, title: rankTitle(p.elo) } : null });
    } catch (e) {
      return json({ ok: false, error: "\u6CE8\u518C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" }, 500);
    }
  }
  if (path === "/api/auth/login" && request.method === "POST") {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureAuthSchema(env.CHESS_DB);
    await ensureRatingTables(env.CHESS_DB);
    try {
      const body = await request.json();
      const username = body.username ? String(body.username).trim() : "";
      const password = body.password ? String(body.password) : "";
      const row = await env.CHESS_DB.prepare("SELECT pass_hash, pass_salt FROM user_auth WHERE username = ?").bind(username).first();
      if (!row) return json({ ok: false, error: "\u7528\u6237\u540D\u4E0D\u5B58\u5728" }, 401);
      const hash = await hashPassword(password, row.pass_salt);
      if (hash !== row.pass_hash) return json({ ok: false, error: "\u5BC6\u7801\u9519\u8BEF" }, 401);
      const accId = "U:" + username;
      const p = await upsertPlayer(env.CHESS_DB, accId, username);
      return json({ ok: true, username, player: p ? { deviceId: p.device_id, name: p.name, elo: p.elo, games: p.games, wins: p.wins, losses: p.losses, draws: p.draws, title: rankTitle(p.elo) } : null });
    } catch (e) {
      return json({ ok: false, error: "\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" }, 500);
    }
  }
  if (path === "/api/player/register" && request.method === "POST") {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureRatingTables(env.CHESS_DB);
    try {
      const body = await request.json();
      if (!body.deviceId) return json({ error: "deviceId required" }, 400);
      const p = await upsertPlayer(env.CHESS_DB, String(body.deviceId).slice(0, 64), body.name ? String(body.name).slice(0, 24) : null);
      return json({ ok: true, player: p ? { deviceId: p.device_id, name: p.name, elo: p.elo, games: p.games, wins: p.wins, losses: p.losses, draws: p.draws, title: rankTitle(p.elo) } : null });
    } catch (e) {
      return json({ error: "bad request" }, 400);
    }
  }
  if (path === "/api/player/profile") {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureRatingTables(env.CHESS_DB);
    const devId = url.searchParams.get("deviceId");
    if (!devId) return json({ error: "deviceId required" }, 400);
    const p = await env.CHESS_DB.prepare("SELECT * FROM players WHERE device_id = ?").bind(String(devId).slice(0, 64)).first();
    return json({ ok: true, player: p ? { deviceId: p.device_id, name: p.name, elo: p.elo, games: p.games, wins: p.wins, losses: p.losses, draws: p.draws, title: rankTitle(p.elo) } : null });
  }
  if (path === "/api/endgame/list") {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureEndgameSchema(env.CHESS_DB);
    try {
      const rows = await env.CHESS_DB.prepare("SELECT id, name, difficulty, side, pieces, goal, solution FROM endgame_puzzles WHERE enabled = 1 ORDER BY difficulty ASC, id ASC LIMIT 100").all();
      const list = (rows.results || []).map(function(r) {
        let pc = [];
        try {
          pc = JSON.parse(r.pieces);
        } catch (e0) {
        }
        let sol = r.solution;
        if (sol == null || sol === "") sol = [];
        else if (typeof sol === "string") {
          try {
            const _p = JSON.parse(sol);
            if (Array.isArray(_p)) sol = _p;
          } catch (eS) {
          }
        } else if (!Array.isArray(sol)) sol = [];
        return { id: r.id, name: r.name, difficulty: r.difficulty, side: r.side, pieces: pc, goal: r.goal, solution: sol };
      }).filter(function(x) {
        return x.pieces && x.pieces.length > 3;
      });
      return json({ ok: true, list }, 200);
    } catch (e) {
      return json({ error: "list failed" }, 500);
    }
  }
  if (path === "/api/endgame/clear" && request.method === "POST") {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureEndgameSchema(env.CHESS_DB);
    try {
      const b = await request.json();
      const pid = parseInt(b && b.id);
      const uid = b && b.deviceId ? String(b.deviceId).slice(0, 64) : null;
      const mv = Math.max(0, Math.min(500, parseInt(b && b.moves) || 0));
      if (!pid || !uid) return json({ ok: false, error: "\u53C2\u6570\u9519\u8BEF" }, 400);
      await env.CHESS_DB.prepare("INSERT INTO endgame_records (puzzle_id, uid, moves, win, created_at) VALUES (?1, ?2, ?3, 1, ?4)").bind(pid, uid, mv, Date.now()).run();
      return json({ ok: true }, 200);
    } catch (e) {
      return json({ error: "clear failed" }, 500);
    }
  }
  if (path === "/api/leaderboard") {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureRatingTables(env.CHESS_DB);
    const rows = await env.CHESS_DB.prepare("SELECT device_id, name, elo, games, wins, losses, draws FROM players WHERE games > 0 AND device_id LIKE 'U:%' ORDER BY elo DESC LIMIT 500").all();
    return json({ ok: true, list: (rows.results || []).map((r, i) => ({ rank: i + 1, name: r.name || "\u6E38\u5BA2", games: r.games, wins: r.wins, losses: r.losses, draws: r.draws })) });
  }
  if (path === "/api/match/join" && request.method === "POST" && env.MATCH_QUEUE) {
    try {
      const body = await request.json();
      if (!body.deviceId) return json({ error: "deviceId required" }, 400);
      const id = env.MATCH_QUEUE.idFromName("global");
      const stub = env.MATCH_QUEUE.get(id);
      const resp = await stub.fetch("https://do/join", { method: "POST", body: JSON.stringify({ deviceId: body.deviceId, name: body.name, elo: body.elo }) });
      return json(await resp.json());
    } catch (e) {
      return json({ error: "match unavailable" }, 503);
    }
  }
  if (path === "/api/match/status" && env.MATCH_QUEUE) {
    try {
      const ticket = url.searchParams.get("ticket");
      if (!ticket) return json({ error: "ticket required" }, 400);
      const id = env.MATCH_QUEUE.idFromName("global");
      const stub = env.MATCH_QUEUE.get(id);
      const resp = await stub.fetch("https://do/status?ticket=" + encodeURIComponent(ticket));
      return json(await resp.json());
    } catch (e) {
      return json({ error: "match unavailable" }, 503);
    }
  }
  if (path === "/api/online") {
    const pT3 = await presenceSync(env, { get: true });
    if (typeof pT3 === "number") onlineCount = pT3;
    return json({ online: onlineCount, count: onlineCount });
  }
  if (path === "/api/history/save" && env.CHESS_DB) {
    try {
      const body = await request.json();
      const dev = body && body.deviceId ? String(body.deviceId).slice(0, 64) : "";
      const moves = body && Array.isArray(body.moves) ? body.moves : null;
      if (!dev || !moves || !moves.length) return json({ ok: false, error: "bad request" }, 400);
      const compact = moves.map((m) => [m.fromRow, m.fromCol, m.toRow, m.toCol]);
      await env.CHESS_DB.prepare(
        "INSERT INTO game_history (device_id, ts, gm, my_color, winner, moves, move_count) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(dev, Date.now(), String(body.gm || "").slice(0, 16), String(body.myColor || "").slice(0, 8), String(body.winner || "").slice(0, 8), JSON.stringify(compact), compact.length).run();
      await env.CHESS_DB.prepare(
        "DELETE FROM game_history WHERE device_id = ? AND id NOT IN (SELECT id FROM game_history WHERE device_id = ? ORDER BY ts DESC, id DESC LIMIT 10)"
      ).bind(dev, dev).run();
      return json({ ok: true });
    } catch (e) {
      return json({ ok: false }, 500);
    }
  }
  if (path === "/api/history/list" && env.CHESS_DB) {
    try {
      const dev = url.searchParams.get("deviceId");
      if (!dev) return json({ ok: false, error: "deviceId required" }, 400);
      const r = await env.CHESS_DB.prepare(
        "SELECT id, ts, gm, my_color, winner, move_count FROM game_history WHERE device_id = ? ORDER BY ts DESC, id DESC LIMIT 10"
      ).bind(dev.slice(0, 64)).all();
      return json({ ok: true, games: (r.results || []).slice().reverse() });
    } catch (e) {
      return json({ ok: false }, 500);
    }
  }
  if (path === "/api/history/get" && env.CHESS_DB) {
    try {
      const gid = parseInt(url.searchParams.get("id"), 10);
      const dev = url.searchParams.get("deviceId");
      if (!gid || !dev) return json({ ok: false, error: "bad request" }, 400);
      const r = await env.CHESS_DB.prepare(
        "SELECT id, ts, gm, my_color, winner, moves FROM game_history WHERE id = ? AND device_id = ?"
      ).bind(gid, dev.slice(0, 64)).first();
      if (!r) return json({ ok: false, error: "not found" }, 404);
      let mv = [];
      try {
        mv = JSON.parse(r.moves).map((a) => ({ fromRow: a[0], fromCol: a[1], toRow: a[2], toCol: a[3] }));
      } catch (e2) {
      }
      return json({ ok: true, game: { id: r.id, ts: r.ts, gm: r.gm, myCl: r.my_color, winner: r.winner, moves: mv } });
    } catch (e) {
      return json({ ok: false }, 500);
    }
  }
  const _admFail = /* @__PURE__ */ new Map();
  function adminLoginLimited(ip) {
    const now = Date.now();
    const arr = (_admFail.get(ip) || []).filter((t) => now - t < 6e4);
    const limited = arr.length >= 5;
    if (!limited) arr.push(now);
    _admFail.set(ip, arr);
    return limited;
  }
  __name(adminLoginLimited, "adminLoginLimited");
  __name2(adminLoginLimited, "adminLoginLimited");
  async function adminToken(dayKey) {
    const data = new TextEncoder().encode("xq-admin-Fdh_19681010-" + dayKey);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  __name(adminToken, "adminToken");
  const adminDayKey = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const urlToken = url.searchParams.get("token") || null;
  let bodyToken = null;
  if (request.method === "POST") {
    try {
      const b = await request.clone().json();
      if (b && typeof b.token === "string") bodyToken = b.token;
    } catch (e) {
    }
  }
  const token = bodyToken || urlToken;
  const isAdmin = !!token && token === await adminToken(adminDayKey);
  if (path === "/api/admin/login" && request.method === "POST") {
    try {
      const b = await request.json();
      const ip = request.headers.get("CF-Connecting-IP") || "x";
      if (adminLoginLimited(ip)) return json({ ok: false, error: "\u5C1D\u8BD5\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5" }, 429);
      if (b && b.username === "adminfan" && b.password === "Fdh_19681010") return json({ ok: true, token: await adminToken(adminDayKey) });
      return json({ ok: false, error: "\u8D26\u53F7\u6216\u5BC6\u7801\u9519\u8BEF" }, 401);
    } catch (e) {
      return json({ ok: false, error: "bad request" }, 400);
    }
  }
  if (path === "/api/admin/players" && isAdmin) {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureRatingTables(env.CHESS_DB);
    try {
      await env.CHESS_DB.exec("CREATE TABLE IF NOT EXISTS vip_members (id TEXT PRIMARY KEY, tier TEXT, expires_at INTEGER, created_at INTEGER, source TEXT)");
      const rows = await env.CHESS_DB.prepare("SELECT p.device_id, p.name, p.elo, p.games, p.wins, p.losses, p.draws, p.created_at, p.last_seen, v.tier AS vip_tier, v.expires_at AS vip_exp FROM players p LEFT JOIN vip_members v ON v.id = 'acc:' || substr(p.device_id, 3) WHERE p.device_id LIKE 'U:%' ORDER BY p.last_seen DESC LIMIT 1000").all();
      const _nowV = Date.now();
      return json({ ok: true, list: (rows.results || []).map((r) => ({ deviceId: r.device_id, name: r.name, elo: r.elo, games: r.games, wins: r.wins, losses: r.losses, draws: r.draws, title: rankTitle(r.elo), created_at: r.created_at, last_seen: r.last_seen, vip: r.vip_exp && r.vip_exp > _nowV ? { tier: r.vip_tier || "vip", expiresAt: r.vip_exp } : null })) });
    } catch (e) {
      return json({ ok: false, error: "\u67E5\u8BE2\u5931\u8D25" }, 500);
    }
  }
  if (path === "/api/admin/setScore" && request.method === "POST" && isAdmin) {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    try {
      const b = await request.json();
      const dev = b && b.deviceId ? String(b.deviceId).slice(0, 64) : null;
      const sc = b && Number.isFinite(Number(b.score)) ? Math.round(Number(b.score)) : null;
      if (!dev || sc === null) return json({ ok: false, error: "\u53C2\u6570\u9519\u8BEF" }, 400);
      const clamped = Math.max(-250, Math.min(7e3, sc));
      await env.CHESS_DB.prepare("UPDATE players SET elo = ? WHERE device_id = ?").bind(clamped, dev).run();
      const p = await env.CHESS_DB.prepare("SELECT device_id, name, elo, games, wins, losses, draws FROM players WHERE device_id = ?").bind(dev).first();
      return json({ ok: true, player: p ? { deviceId: p.device_id, name: p.name, elo: p.elo, games: p.games, wins: p.wins, losses: p.losses, draws: p.draws, title: rankTitle(p.elo) } : null });
    } catch (e) {
      return json({ ok: false, error: "\u4FEE\u6539\u5931\u8D25" }, 500);
    }
  }
  if (path === "/api/admin/deletePlayer" && request.method === "POST" && isAdmin) {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    try {
      const b = await request.json();
      const dev = b && b.deviceId ? String(b.deviceId).slice(0, 64) : null;
      if (!dev) return json({ ok: false, error: "\u53C2\u6570\u9519\u8BEF" }, 400);
      await env.CHESS_DB.prepare("DELETE FROM players WHERE device_id = ?").bind(dev).run();
      if (dev.startsWith("U:")) {
        try {
          await env.CHESS_DB.prepare("DELETE FROM user_auth WHERE username = ?").bind(dev.slice(2)).run();
        } catch (e2) {
        }
      }
      return json({ ok: true, deleted: dev });
    } catch (e) {
      return json({ ok: false, error: "\u5220\u9664\u5931\u8D25" }, 500);
    }
  }
  if (path === "/api/admin/resetPassword" && request.method === "POST" && isAdmin) {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureAuthSchema(env.CHESS_DB);
    try {
      const b = await request.json();
      const username = b && b.username ? String(b.username).slice(0, 12) : null;
      const np = b && typeof b.newPassword === "string" ? b.newPassword : null;
      if (!username || !np || np.length < 6 || np.length > 64) return json({ ok: false, error: "\u65B0\u5BC6\u7801\u97006~64\u4F4D" }, 400);
      const salt = randomSalt();
      const hash = await hashPassword(np, salt);
      const r = await env.CHESS_DB.prepare("UPDATE user_auth SET pass_hash = ?, pass_salt = ? WHERE username = ?").bind(hash, salt, username).run();
      if (!r.success || r.meta.changes === 0) return json({ ok: false, error: "\u8BE5\u73A9\u5BB6\u4E0D\u662F\u8D26\u53F7\uFF08\u6E38\u5BA2\u65E0\u5BC6\u7801\uFF09" }, 404);
      return json({ ok: true, username });
    } catch (e) {
      return json({ ok: false, error: "\u91CD\u7F6E\u5931\u8D25" }, 500);
    }
  }
  if (path === "/api/admin/players") return json({ ok: false, error: "\u672A\u767B\u5F55" }, 401);
  if (path === "/api/match/debug" && env.MATCH_QUEUE) {
    try {
      const id = env.MATCH_QUEUE.idFromName("global");
      const stub = env.MATCH_QUEUE.get(id);
      const resp = await stub.fetch("https://do/debug");
      return json(await resp.json());
    } catch (e) {
      return json({ error: "match unavailable" }, 503);
    }
  }
  if (path === "/api/match/cancel" && request.method === "POST" && env.MATCH_QUEUE) {
    try {
      const body = await request.json();
      const id = env.MATCH_QUEUE.idFromName("global");
      const stub = env.MATCH_QUEUE.get(id);
      const resp = await stub.fetch("https://do/cancel", { method: "POST", body: JSON.stringify({ ticket: body.ticket }) });
      return json(await resp.json());
    } catch (e) {
      return json({ error: "match unavailable" }, 503);
    }
  }
  if (env.CHESS_DB) {
    await initAiDb(env.CHESS_DB);
    await loadAiFromDb(env.CHESS_DB);
  }
  if (path === "/api/ai/db-check") {
    if (env.CHESS_DB) {
      const raw = await env.CHESS_DB.prepare("SELECT * FROM ai_weights WHERE id = 1").first();
      return new Response(JSON.stringify({ raw, aiTotalStats }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "no db" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (path === "/api/train/start") {
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (path === "/api/train/stop") {
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (path === "/api/train/status") {
    if (env.CHESS_DB) {
      await loadAiFromDb(env.CHESS_DB);
    }
    return new Response(JSON.stringify({
      training: false,
      session: { games: 0, redWins: 0, blkWins: 0, draws: 0 },
      total: aiTotalStats,
      weights: aiWeights
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (path === "/api/ai/data") {
    if (request.method === "GET") {
      if (env.CHESS_DB) {
        await loadAiFromDb(env.CHESS_DB);
      }
      return new Response(JSON.stringify({ weights: aiWeights, trainStats: aiTotalStats }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (request.method === "POST") {
      try {
        if (env.CHESS_DB) {
          await loadAiFromDb(env.CHESS_DB);
        }
        const data = await request.json();
        if (data.weights) {
          const mergeFactor = data.isDelta ? 0.3 : 0.5;
          for (const k in data.weights) {
            if (aiWeights[k] !== void 0) {
              const newValue = data.weights[k];
              aiWeights[k] = aiWeights[k] * (1 - mergeFactor) + newValue * mergeFactor;
            }
          }
        }
        if (data.stats) {
          for (const k in data.stats) {
            if (aiTotalStats[k] !== void 0) {
              aiTotalStats[k] += data.stats[k] || 0;
            }
          }
        }
        let saved = false;
        if (env.CHESS_DB) {
          saved = await saveAiToDb(env.CHESS_DB);
        }
        return new Response(JSON.stringify({ success: true, weights: aiWeights, total: aiTotalStats, saved }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
      }
    }
  }
  if (path === "/api/admin/vip/generate" && request.method === "POST" && isAdmin) {
    try {
      await env.CHESS_DB.exec("CREATE TABLE IF NOT EXISTS vip_codes (code TEXT PRIMARY KEY, tier TEXT, days INTEGER, used_by TEXT, used_at INTEGER, created_at INTEGER)");
      const b = await request.json();
      const count = Math.max(1, Math.min(50, parseInt(b && b.count) || 1));
      const days = Math.max(1, Math.min(36500, parseInt(b && b.days) || 30));
      const tier = String(b && b.tier || "vip").slice(0, 20);
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const codes = [];
      for (let i = 0; i < count; i++) {
        const bytes = new Uint8Array(10);
        crypto.getRandomValues(bytes);
        let code = "VIP-";
        for (let j = 0; j < 10; j++) code += alphabet[bytes[j] % alphabet.length];
        try {
          const ins = await env.CHESS_DB.prepare("INSERT OR IGNORE INTO vip_codes (code, tier, days, created_at) VALUES (?1, ?2, ?3, ?4)").bind(code, tier, days, Date.now()).run();
          if (ins && ins.meta && ins.meta.changes === 1) codes.push(code);
        } catch (e) {
        }
      }
      return new Response(JSON.stringify({ ok: true, codes }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: "generate failed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }
  }
  if (path === "/api/admin/endgame/list" && isAdmin) {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureEndgameSchema(env.CHESS_DB);
    try {
      const rows = await env.CHESS_DB.prepare("SELECT id, name, difficulty, side, pieces, goal, enabled, created_at, solution FROM endgame_puzzles ORDER BY id ASC LIMIT 500").all();
      const list = (rows.results || []).map(function(r) {
        let pc = [];
        try {
          pc = JSON.parse(r.pieces);
        } catch (e0) {
        }
        let sol = r.solution;
        if (sol == null || sol === "") sol = [];
        else if (typeof sol === "string") {
          try {
            const _p = JSON.parse(sol);
            if (Array.isArray(_p)) sol = _p;
          } catch (eS) {
          }
        } else if (!Array.isArray(sol)) sol = [];
        return { id: r.id, name: r.name, difficulty: r.difficulty, side: r.side, pieces: pc, goal: r.goal, enabled: r.enabled, created_at: r.created_at, count: (pc || []).length, solution: sol };
      });
      return json({ ok: true, list }, 200);
    } catch (e) {
      return json({ error: "list failed" }, 500);
    }
  }
  if (path === "/api/admin/endgame/save" && request.method === "POST" && isAdmin) {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    await ensureEndgameSchema(env.CHESS_DB);
    try {
      const b = await request.json();
      const name = b && b.name ? String(b.name).trim().slice(0, 30) : "";
      const difficulty = Math.max(1, Math.min(5, parseInt(b && b.difficulty) || 1));
      const side = b && b.side === "black" ? "black" : "red";
      const goal = b && b.goal ? String(b.goal).trim().slice(0, 120) : "";
      const pieces = validatePieces(b && b.pieces);
      if (!name || !pieces) return json({ ok: false, error: "\u540D\u79F0\u6216\u68CB\u5B50\u5E03\u5C40\u4E0D\u5408\u6CD5\uFF08\u53CC\u65B9\u5404\u9700\u4E00\u5C06\uFF09" }, 400);
      const pj = JSON.stringify(pieces);
      let solJson = "[]";
      if (b && typeof b.solutionText === "string" && b.solutionText.trim()) {
        solJson = String(b.solutionText).slice(0, 4e3);
      }
      if (b && typeof b.solutionText === "string" && b.solutionText.trim()) {
        solJson = String(b.solutionText).slice(0, 4e3);
      }
      if (b && Array.isArray(b.solution)) {
        const sol = [];
        for (const sm of b.solution) {
          if (sm && typeof sm === "object") {
            const fr = parseInt(sm.fromRow), fc = parseInt(sm.fromCol), tr = parseInt(sm.toRow), tc = parseInt(sm.toCol);
            if ([fr, fc, tr, tc].every(function(v) {
              return v >= 0 && v <= 9;
            })) sol.push({ fromRow: fr, fromCol: fc, toRow: tr, toCol: tc });
          }
        }
        solJson = JSON.stringify(sol.slice(0, 30));
      }
      if (b && b.id) {
        await env.CHESS_DB.prepare("UPDATE endgame_puzzles SET name=?1, difficulty=?2, side=?3, pieces=?4, goal=?5, enabled=?6, solution=?7 WHERE id=?8").bind(name, difficulty, side, pj, goal, b.enabled === 0 ? 0 : 1, solJson, parseInt(b.id)).run();
        return json({ ok: true, id: parseInt(b.id) }, 200);
      }
      const mxRow = await env.CHESS_DB.prepare("SELECT COALESCE(MAX(id), 0) + 1 AS nid FROM endgame_puzzles").first();
      const nid = mxRow && mxRow.nid || 1;
      const ins = await env.CHESS_DB.prepare("INSERT INTO endgame_puzzles (id, name, difficulty, side, pieces, goal, enabled, created_at, solution) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1, ?7, ?8)").bind(nid, name, difficulty, side, pj, goal, Date.now(), solJson).run();
      return json({ ok: true, id: nid }, 200);
    } catch (e) {
      return json({ error: "save failed" }, 500);
    }
  }
  if (path === "/api/admin/endgame/op" && request.method === "POST" && isAdmin) {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    try {
      const b = await request.json();
      const id = parseInt(b && b.id);
      if (!id) return json({ ok: false, error: "\u53C2\u6570\u9519\u8BEF" }, 400);
      if (b && b.op === "delete") {
        await env.CHESS_DB.prepare("DELETE FROM endgame_puzzles WHERE id = ?1").bind(id).run();
        return json({ ok: true }, 200);
      }
      if (b && b.op === "toggle") {
        await env.CHESS_DB.prepare("UPDATE endgame_puzzles SET enabled = CASE enabled WHEN 1 THEN 0 ELSE 1 END WHERE id = ?1").bind(id).run();
        return json({ ok: true }, 200);
      }
      return json({ ok: false, error: "\u672A\u77E5\u64CD\u4F5C" }, 400);
    } catch (e) {
      return json({ error: "op failed" }, 500);
    }
  }
  if (path === "/api/admin/vip/batch_delete" && request.method === "POST" && isAdmin) {
    try {
      const b = await request.json();
      const type = b && b.type === "members" ? "members" : "codes";
      const ids = Array.isArray(b && b.ids) ? b.ids.map(function(x) {
        return String(x).slice(0, 64);
      }).filter(Boolean).slice(0, 200) : [];
      if (!ids.length) return new Response(JSON.stringify({ ok: false, error: "\u672A\u9009\u62E9\u4EFB\u4F55\u9879" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
      const stmts = ids.map(function(k) {
        return type === "members" ? env.CHESS_DB.prepare("DELETE FROM vip_members WHERE id = ?1").bind(k) : env.CHESS_DB.prepare("DELETE FROM vip_codes WHERE code = ?1").bind(k);
      });
      const rs = await env.CHESS_DB.batch(stmts);
      const deleted = rs.reduce(function(acc, r) {
        return acc + (r && r.meta && r.meta.changes ? r.meta.changes : 0);
      }, 0);
      return new Response(JSON.stringify({ ok: true, deleted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: "batch delete failed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }
  }
  if (path === "/api/admin/vip/codes" && isAdmin) {
    try {
      const rs = await env.CHESS_DB.prepare("SELECT code, tier, days, used_by, used_at, created_at FROM vip_codes ORDER BY created_at DESC LIMIT 200").all();
      return new Response(JSON.stringify({ ok: true, codes: rs.results || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: "list failed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }
  }
  if (path === "/api/admin/vip/members" && isAdmin) {
    try {
      const rs = await env.CHESS_DB.prepare("SELECT id, tier, expires_at, created_at, source FROM vip_members ORDER BY expires_at DESC LIMIT 200").all();
      return new Response(JSON.stringify({ ok: true, members: rs.results || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: "list failed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }
  }
  if (path === "/api/admin/setVip" && request.method === "POST" && isAdmin) {
    if (!env.CHESS_DB) return json({ error: "no db" }, 500);
    try {
      await env.CHESS_DB.exec("CREATE TABLE IF NOT EXISTS vip_members (id TEXT PRIMARY KEY, tier TEXT, expires_at INTEGER, created_at INTEGER, source TEXT)");
      const b = await request.json();
      const dev = b && b.deviceId ? String(b.deviceId).slice(0, 64) : null;
      const days = b && Number.isFinite(Number(b.days)) ? Math.round(Number(b.days)) : null;
      if (!dev || days === null) return json({ ok: false, error: "\u53C2\u6570\u9519\u8BEF" }, 400);
      const vipId2 = dev.startsWith("U:") ? "acc:" + dev.slice(2) : dev;
      const nowV = Date.now();
      if (days <= 0) {
        await env.CHESS_DB.prepare("DELETE FROM vip_members WHERE id = ?").bind(vipId2).run();
        return json({ ok: true, vip: null });
      }
      const cur = await env.CHESS_DB.prepare("SELECT expires_at FROM vip_members WHERE id = ?").bind(vipId2).first();
      const base = cur && cur.expires_at > nowV ? cur.expires_at : nowV;
      const expiresAt = base + days * 864e5;
      await env.CHESS_DB.prepare("INSERT INTO vip_members (id, tier, expires_at, created_at, source) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT (id) DO UPDATE SET tier = excluded.tier, expires_at = excluded.expires_at").bind(vipId2, "vip", expiresAt, nowV, "admin").run();
      return json({ ok: true, vip: { tier: "vip", expiresAt } });
    } catch (e) {
      return json({ ok: false, error: "\u64CD\u4F5C\u5931\u8D25" }, 500);
    }
  }
  const PAY_TIERS = {
    t30: { label: "30\u5929\u4F1A\u5458", days: 30, yuan: 10 },
    t190: { label: "\u534A\u5E74190\u5929", days: 190, yuan: 30 },
    t365: { label: "\u4E00\u5E74365\u5929", days: 365, yuan: 50 },
    t99: { label: "\u6C38\u4E4599\u5E74", days: 36135, yuan: 99 }
  };
  const PAY_NOTIFY_KEY = "XqPay_aF8k2mQ9wZ4t_2026";
  if (path === "/api/pay/order" && request.method === "POST") {
    if (!env.CHESS_DB) return json({ ok: false, error: "no db" }, 500);
    try {
      const db = env.CHESS_DB;
      await db.exec("CREATE TABLE IF NOT EXISTS pay_orders (id TEXT PRIMARY KEY, tier TEXT, days INTEGER, amount_cents INTEGER, status TEXT DEFAULT 'pending', code TEXT, created_at INTEGER, paid_at INTEGER)");
      await db.exec("CREATE UNIQUE INDEX IF NOT EXISTS pay_orders_pending_amt ON pay_orders(amount_cents) WHERE status = 'pending'");
      const b = await request.json().catch(() => ({}));
      const tier = PAY_TIERS[b && b.tier];
      if (!tier) return json({ ok: false, error: "\u65E0\u6548\u6863\u4F4D" }, 400);
      const now = Date.now();
      await db.prepare("DELETE FROM pay_orders WHERE status='pending' AND created_at < ?1").bind(now - 35 * 6e4).run();
      const cnt = await db.prepare("SELECT COUNT(*) AS c FROM pay_orders WHERE status='pending'").first();
      if (cnt && cnt.c >= 20) return json({ ok: false, error: "\u5F53\u524D\u8BA2\u5355\u8F83\u591A\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5" }, 429);
      let id = null, cents = null, made = false;
      const start = Math.floor(Math.random() * 97) + 1;
      for (let i = 0; i < 100 && !made; i++) {
        const off = i === 0 ? 0 : (start + i - 2) % 99 + 1;
        const c2 = tier.yuan * 100 + off;
        const id2 = crypto.randomUUID();
        try {
          await db.prepare("INSERT INTO pay_orders (id, tier, days, amount_cents, status, created_at) VALUES (?1, ?2, ?3, ?4, 'pending', ?5)").bind(id2, b.tier, tier.days, c2, now).run();
          id = id2;
          cents = c2;
          made = true;
        } catch (e) {
        }
      }
      if (!made) return json({ ok: false, error: "\u8BA2\u5355\u521B\u5EFA\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5" }, 503);
      return json({ ok: true, id, amount: (cents / 100).toFixed(2), label: tier.label, minutes: 30 });
    } catch (e) {
      return json({ ok: false, error: "order failed" }, 500);
    }
  }
  if (path === "/api/pay/notify" && (request.method === "POST" || request.method === "GET")) {
    if (!env.CHESS_DB) return json({ ok: false, error: "no db" }, 500);
    try {
      const u2 = new URL(request.url);
      let key = u2.searchParams.get("key"), amount = u2.searchParams.get("amount"), text = u2.searchParams.get("text") || "";
      if (request.method === "POST") {
        const raw = await request.text();
        let pb = null;
        try {
          pb = JSON.parse(raw);
        } catch (e) {
        }
        if (pb) {
          key = key || pb.key;
          amount = amount || pb.amount;
          text = text || pb.text || "";
        } else if (!amount) text = text || raw;
      }
      if (!key || key !== PAY_NOTIFY_KEY) return json({ ok: false, error: "bad key" }, 403);
      let cents = 0;
      if (amount) {
        const m2 = String(amount).match(/(\d{1,4}(?:\.\d{1,2})?)/);
        if (m2) cents = Math.round(parseFloat(m2[1]) * 100);
      }
      if (!cents && text) {
        const m3 = text.match(/(\d{1,4}\.\d{2})/);
        if (m3) cents = Math.round(parseFloat(m3[1]) * 100);
      }
      if (!cents) return json({ ok: false, error: "no amount" }, 400);
      const db = env.CHESS_DB;
      const now = Date.now();
      const ord = await db.prepare("SELECT id, tier FROM pay_orders WHERE amount_cents = ?1 AND status='pending' AND created_at > ?2 ORDER BY created_at DESC LIMIT 1").bind(cents, now - 35 * 6e4).first();
      if (!ord) return json({ ok: true, matched: false, note: "no pending order for this amount" });
      const tier = PAY_TIERS[ord.tier] || { days: 30 };
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      await db.exec("CREATE TABLE IF NOT EXISTS vip_codes (code TEXT PRIMARY KEY, tier TEXT, days INTEGER, used_by TEXT, used_at INTEGER, created_at INTEGER)");
      let code = "", codeOk = false;
      for (let att = 0; att < 3 && !codeOk; att++) {
        const bytes = new Uint8Array(10);
        crypto.getRandomValues(bytes);
        code = "VIP-";
        for (let j = 0; j < 10; j++) code += alphabet[bytes[j] % alphabet.length];
        const ins = await db.prepare("INSERT OR IGNORE INTO vip_codes (code, tier, days, created_at) VALUES (?1, ?2, ?3, ?4)").bind(code, "vip", tier.days, now).run();
        codeOk = !!(ins && ins.meta && ins.meta.changes === 1);
      }
      if (!codeOk) return json({ ok: false, error: "\u53D1\u7801\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" }, 503);
      await db.prepare("UPDATE pay_orders SET status='paid', code=?1, paid_at=?2 WHERE id=?3").bind(code, now, ord.id).run();
      return json({ ok: true, matched: true, orderId: ord.id, days: tier.days });
    } catch (e) {
      return json({ ok: false, error: "notify failed" }, 500);
    }
  }
  if (path === "/api/pay/status" && request.method === "GET") {
    if (!env.CHESS_DB) return json({ ok: false, error: "no db" }, 500);
    try {
      const id = new URL(request.url).searchParams.get("id") || "";
      if (!id) return json({ ok: false, error: "bad id" }, 400);
      const r = await env.CHESS_DB.prepare("SELECT status, code FROM pay_orders WHERE id = ?1").bind(id).first();
      if (!r) return json({ ok: true, status: "gone" });
      if (r.status === "paid" && r.code) return json({ ok: true, status: "paid", code: r.code });
      return json({ ok: true, status: r.status });
    } catch (e) {
      return json({ ok: false, error: "status failed" }, 500);
    }
  }
  if (path === "/api/pay/heartbeat" && (request.method === "GET" || request.method === "POST")) {
    if (!env.CHESS_DB) return json({ ok: false }, 500);
    try {
      const u3 = new URL(request.url);
      const key = u3.searchParams.get("key") || "";
      if (key !== PAY_NOTIFY_KEY) return json({ ok: false, error: "bad key" }, 403);
      await env.CHESS_DB.exec("CREATE TABLE IF NOT EXISTS pay_hb (id INTEGER PRIMARY KEY, ts INTEGER)");
      await env.CHESS_DB.prepare("INSERT INTO pay_hb (id, ts) VALUES (1, ?1) ON CONFLICT (id) DO UPDATE SET ts = ?1").bind(Date.now()).run();
      return json({ ok: true });
    } catch (e) {
      return json({ ok: false }, 500);
    }
  }
  if (path === "/api/pay/monitor" && request.method === "GET") {
    if (!env.CHESS_DB) return json({ ok: false, error: "no db" }, 500);
    try {
      const u4 = new URL(request.url);
      if (u4.searchParams.get("token") !== await adminToken(adminDayKey)) return json({ ok: false, error: "unauthorized" }, 403);
      await env.CHESS_DB.exec("CREATE TABLE IF NOT EXISTS pay_hb (id INTEGER PRIMARY KEY, ts INTEGER)");
      const hb = await env.CHESS_DB.prepare("SELECT ts FROM pay_hb WHERE id = 1").first();
      const pc = await env.CHESS_DB.prepare("SELECT COUNT(*) AS c FROM pay_orders WHERE status='pending'").first();
      const last = hb && hb.ts ? Math.round((Date.now() - hb.ts) / 1e3) : -1;
      return json({ ok: true, hbSecondsAgo: last, phoneOnline: last >= 0 && last < 300, pendingOrders: pc ? pc.c : 0 });
    } catch (e) {
      return json({ ok: false, error: "monitor failed" }, 500);
    }
  }
  if (path === "/api/admin/pay/list" && request.method === "GET" && isAdmin) {
    if (!env.CHESS_DB) return json({ ok: false, error: "no db" }, 500);
    try {
      const rs = await env.CHESS_DB.prepare("SELECT id, tier, days, amount_cents, status, code, created_at, paid_at FROM pay_orders ORDER BY created_at DESC LIMIT 50").all();
      return json({ ok: true, orders: rs.results || [] });
    } catch (e) {
      return json({ ok: false, error: "list failed" }, 500);
    }
  }
  if (path === "/api/admin/pay/confirm" && request.method === "POST" && isAdmin) {
    if (!env.CHESS_DB) return json({ ok: false, error: "no db" }, 500);
    try {
      const b = await request.json();
      const oid = b && b.orderId ? String(b.orderId).slice(0, 64) : "";
      if (!oid) return json({ ok: false, error: "\u53C2\u6570\u9519\u8BEF" }, 400);
      const db = env.CHESS_DB;
      const ord = await db.prepare("SELECT id, tier, status, code FROM pay_orders WHERE id = ?1").bind(oid).first();
      if (!ord) return json({ ok: false, error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
      if (ord.status === "paid" && ord.code) return json({ ok: true, already: true, code: ord.code });
      const tier = PAY_TIERS[ord.tier] || { days: 30 };
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const now = Date.now();
      await db.exec("CREATE TABLE IF NOT EXISTS vip_codes (code TEXT PRIMARY KEY, tier TEXT, days INTEGER, used_by TEXT, used_at INTEGER, created_at INTEGER)");
      let code = "", codeOk = false;
      for (let att = 0; att < 3 && !codeOk; att++) {
        const bytes = new Uint8Array(10);
        crypto.getRandomValues(bytes);
        code = "VIP-";
        for (let j = 0; j < 10; j++) code += alphabet[bytes[j] % alphabet.length];
        const ins = await db.prepare("INSERT OR IGNORE INTO vip_codes (code, tier, days, created_at) VALUES (?1, ?2, ?3, ?4)").bind(code, "vip", tier.days, now).run();
        codeOk = !!(ins && ins.meta && ins.meta.changes === 1);
      }
      if (!codeOk) return json({ ok: false, error: "\u53D1\u7801\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" }, 503);
      await db.prepare("UPDATE pay_orders SET status='paid', code=?1, paid_at=?2 WHERE id=?3").bind(code, now, oid).run();
      return json({ ok: true, code, days: tier.days });
    } catch (e) {
      return json({ ok: false, error: "confirm failed" }, 500);
    }
  }
  const GAME_KINDS = { match: "\u68CB\u529B\u8BC4\u6D4B", aiadv: "\u4EBA\u673A\u5BF9\u5F08\u9AD8\u7EA7", endgame: "\u6B8B\u5C40\u6311\u6218" };
  const GAME_DAILY_LIMIT = 5;
  if (path === "/api/game/quota" && (request.method === "GET" || request.method === "POST")) {
    if (!env.CHESS_DB) return json({ ok: false, error: "no db" }, 500);
    try {
      const db = env.CHESS_DB;
      await db.exec("CREATE TABLE IF NOT EXISTS game_quota (id TEXT, day TEXT, kind TEXT, count INTEGER, PRIMARY KEY (id, day, kind))");
      await db.exec("CREATE TABLE IF NOT EXISTS vip_members (id TEXT PRIMARY KEY, tier TEXT, expires_at INTEGER, created_at INTEGER, source TEXT)");
      const u5 = new URL(request.url);
      let id = u5.searchParams.get("id") || "", kind = u5.searchParams.get("kind") || "", check = u5.searchParams.get("check") === "1";
      if (request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        id = b && b.id || id;
        kind = b && b.kind || kind;
        check = !!(b && b.check);
      }
      id = String(id).slice(0, 80);
      kind = String(kind).slice(0, 20);
      if (!id || !GAME_KINDS[kind]) return json({ ok: false, error: "\u53C2\u6570\u9519\u8BEF" }, 400);
      if (kind === "match") return json({ ok: true, member: true, kind, unlimited: true, remaining: -1 });
      const day = new Date(Date.now() + 288e5).toISOString().slice(0, 10);
      const m = await db.prepare("SELECT expires_at FROM vip_members WHERE id = ?1").bind(id).first();
      const member = !!(m && m.expires_at > Date.now());
      const row = await db.prepare("SELECT count FROM game_quota WHERE id = ?1 AND day = ?2 AND kind = ?3").bind(id, day, kind).first();
      const used = row ? row.count : 0;
      if (request.method === "GET") {
        return json({ ok: true, kind, member, used, limit: member ? 0 : GAME_DAILY_LIMIT, remaining: member ? -1 : Math.max(0, GAME_DAILY_LIMIT - used) });
      }
      if (member) return json({ ok: true, member: true, kind, remaining: -1 });
      if (used >= GAME_DAILY_LIMIT) return json({ ok: false, member: false, kind, used, limit: GAME_DAILY_LIMIT, error: "\u4ECA\u65E5" + GAME_KINDS[kind] + "\u514D\u8D395\u76D8\u5DF2\u7528\u5B8C\uFF0C\u5F00\u901A\u4F1A\u5458\u65E0\u9650\u7545\u73A9" });
      if (check) return json({ ok: true, member: false, kind, used, limit: GAME_DAILY_LIMIT, remaining: GAME_DAILY_LIMIT - used, check: true });
      await db.prepare("INSERT INTO game_quota (id, day, kind, count) VALUES (?1, ?2, ?3, 1) ON CONFLICT (id, day, kind) DO UPDATE SET count = count + 1").bind(id, day, kind).run();
      return json({ ok: true, member: false, kind, used: used + 1, limit: GAME_DAILY_LIMIT, remaining: GAME_DAILY_LIMIT - used - 1 });
    } catch (e) {
      return json({ ok: false, error: "quota failed" }, 500);
    }
  }
  if (path === "/api/announce" && request.method === "GET") {
    try {
      const adb = env.CHESS_DB;
      await adb.exec("CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, url TEXT, active INTEGER, created_at INTEGER)");
      const row = await adb.prepare("SELECT id, text, url, created_at FROM announcements WHERE active = 1 ORDER BY id DESC LIMIT 1").first();
      return new Response(JSON.stringify({ text: row ? row.text : null, url: row ? row.url : null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ text: null, url: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }
  if (path === "/api/admin/announce" && request.method === "POST" && isAdmin) {
    try {
      const adb = env.CHESS_DB;
      const b = await request.json();
      await adb.exec("CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, url TEXT, active INTEGER, created_at INTEGER)");
      if (b && b.clear) {
        await adb.prepare("UPDATE announcements SET active = 0 WHERE active = 1").run();
        return new Response(JSON.stringify({ ok: true, cleared: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = b && b.text ? String(b.text).slice(0, 500) : "";
      const aurl = b && b.url ? String(b.url).slice(0, 300) : "";
      if (!text) return new Response(JSON.stringify({ ok: false, error: "\u5185\u5BB9\u4E3A\u7A7A" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      await adb.prepare("UPDATE announcements SET active = 0 WHERE active = 1").run();
      await adb.prepare("INSERT INTO announcements (text, url, active, created_at) VALUES (?1, ?2, 1, ?3)").bind(text, aurl, Date.now()).run();
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: "\u53D1\u5E03\u5931\u8D25" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }
  }
  if (path.startsWith("/api/vip/")) {
    if (!env.CHESS_DB) return new Response(JSON.stringify({ error: "no db" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    const db = env.CHESS_DB;
    try {
      await db.exec("CREATE TABLE IF NOT EXISTS vip_members (id TEXT PRIMARY KEY, tier TEXT, expires_at INTEGER, created_at INTEGER, source TEXT)");
      await db.exec("CREATE TABLE IF NOT EXISTS vip_codes (code TEXT PRIMARY KEY, tier TEXT, days INTEGER, used_by TEXT, used_at INTEGER, created_at INTEGER)");
      await db.exec("CREATE TABLE IF NOT EXISTS vip_usage (id TEXT, day TEXT, count INTEGER, PRIMARY KEY (id, day))");
    } catch (e) {
    }
    const vipNow = Date.now();
    const vipDay = new Date(vipNow + 288e5).toISOString().slice(0, 10);
    const vipQuota = 3;
    const vipGetMember = /* @__PURE__ */ __name(async (id) => {
      try {
        const r = await db.prepare("SELECT tier, expires_at FROM vip_members WHERE id = ?").bind(id).first();
        if (r && r.expires_at > vipNow) return { member: true, tier: r.tier, expiresAt: r.expires_at };
      } catch (e) {
      }
      return { member: false };
    }, "vipGetMember");
    const vipUsedToday = /* @__PURE__ */ __name(async (id) => {
      try {
        const r = await db.prepare("SELECT count FROM vip_usage WHERE id = ? AND day = ?").bind(id, vipDay).first();
        return r ? r.count : 0;
      } catch (e) {
        return 0;
      }
    }, "vipUsedToday");
    if (path === "/api/vip/status" && request.method === "GET") {
      const id = (url.searchParams.get("id") || "").slice(0, 80);
      if (!id) return new Response(JSON.stringify({ error: "no id" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
      const m = await vipGetMember(id);
      const used = m.member ? 0 : await vipUsedToday(id);
      let gq = null;
      if (!m.member) {
        try {
          await db.exec("CREATE TABLE IF NOT EXISTS game_quota (id TEXT, day TEXT, kind TEXT, count INTEGER, PRIMARY KEY (id, day, kind))");
          const rows = await db.prepare("SELECT kind, count FROM game_quota WHERE id = ?1 AND day = ?2").bind(id, vipDay).all();
          gq = {};
          for (const K of ["match", "aiadv", "endgame"]) {
            const r2 = (rows.results || []).find(function(x) {
              return x.kind === K;
            });
            const c = r2 ? r2.count : 0;
            gq[K] = { used: c, remaining: Math.max(0, 5 - c) };
          }
        } catch (e) {
          gq = null;
        }
      }
      return new Response(JSON.stringify({ member: m.member, tier: m.tier || null, expiresAt: m.expiresAt || null, used, remaining: m.member ? null : Math.max(0, vipQuota - used), freeQuota: vipQuota, gq }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/api/vip/redeem" && request.method === "POST") {
      try {
        const b = await request.json();
        const id = String(b && b.id || "").slice(0, 80);
        const code = String(b && b.code || "").trim().toUpperCase();
        if (!id || !code) return new Response(JSON.stringify({ ok: false, error: "\u53C2\u6570\u7F3A\u5931" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const cr = await db.prepare("SELECT code, tier, days, used_by FROM vip_codes WHERE code = ?").bind(code).first();
        if (!cr) return new Response(JSON.stringify({ ok: false, error: "\u5151\u6362\u7801\u65E0\u6548" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (cr.used_by) return new Response(JSON.stringify({ ok: false, error: "\u5151\u6362\u7801\u5DF2\u88AB\u4F7F\u7528" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const cur = await db.prepare("SELECT expires_at FROM vip_members WHERE id = ?").bind(id).first();
        const base = cur && cur.expires_at > vipNow ? cur.expires_at : vipNow;
        const expiresAt = base + (cr.days || 30) * 864e5;
        await db.prepare("INSERT INTO vip_members (id, tier, expires_at, created_at, source) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT (id) DO UPDATE SET tier = excluded.tier, expires_at = excluded.expires_at").bind(id, cr.tier || "vip", expiresAt, vipNow, code).run();
        await db.prepare("UPDATE vip_codes SET used_by = ?1, used_at = ?2 WHERE code = ?3").bind(id, vipNow, code).run();
        return new Response(JSON.stringify({ ok: true, tier: cr.tier || "vip", expiresAt }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: "\u5151\u6362\u5931\u8D25,\u8BF7\u7A0D\u540E\u518D\u8BD5" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
      }
    }
    if (path === "/api/vip/consume" && request.method === "POST") {
      try {
        const b = await request.json();
        const id = String(b && b.id || "").slice(0, 80);
        if (!id) return new Response(JSON.stringify({ ok: false, error: "no id" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
        const m = await vipGetMember(id);
        if (m.member) return new Response(JSON.stringify({ ok: true, member: true, remaining: null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const used = await vipUsedToday(id);
        if (used >= vipQuota) return new Response(JSON.stringify({ ok: false, error: "quota", used, remaining: 0, freeQuota: vipQuota }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const nUsed = used + 1;
        await db.prepare("INSERT INTO vip_usage (id, day, count) VALUES (?1, ?2, ?3) ON CONFLICT (id, day) DO UPDATE SET count = vip_usage.count + 1").bind(id, vipDay, nUsed).run();
        return new Response(JSON.stringify({ ok: true, member: false, used: nUsed, remaining: vipQuota - nUsed, freeQuota: vipQuota }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: "consume failed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
      }
    }
    return new Response(JSON.stringify({ error: "Not found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 });
  }
  if (path === "/api/rooms") {
    try {
      const rdb = env.CHESS_DB;
      await rdb.exec("CREATE TABLE IF NOT EXISTS rooms_registry (id TEXT PRIMARY KEY, red TEXT, black TEXT, status TEXT, watchers INTEGER, updated_at INTEGER)");
      const rows = await rdb.prepare("SELECT id, red, black, status, watchers, updated_at FROM rooms_registry WHERE updated_at > ? ORDER BY updated_at DESC LIMIT 50").bind(Date.now() - 12e4).all();
      return new Response(JSON.stringify({ rooms: rows.results || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ rooms: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }
  if (path === "/api/online") {
    return new Response(JSON.stringify({ count: onlineCount }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (path === "/api/create-room") {
    const customId = url.searchParams.get("id");
    const roomId = customId || await generateFreeRoomId(env.CHESS_DB);
    return new Response(JSON.stringify({ roomId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ error: "Not found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 });
}
__name(handleApiRequest, "handleApiRequest");
__name2(handleApiRequest, "handleApiRequest");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if ((request.headers.get("x-forwarded-proto") || "https") === "http") {
      const httpsUrl = new URL(request.url);
      httpsUrl.protocol = "https:";
      return Response.redirect(httpsUrl.toString(), 301);
    }
    const path = url.pathname;
    if (path === "/api/race-report" && request.method === "POST") {
      try {
        const cf = request.cf || {};
        const b = await request.json().catch(() => ({}));
        if (b.kind === "ws-fail") {
          await env.CHESS_DB.batch([
            env.CHESS_DB.prepare("CREATE TABLE IF NOT EXISTS entry_fail (ts INTEGER, entry TEXT, kind TEXT, rip TEXT)"),
            env.CHESS_DB.prepare("INSERT INTO entry_fail (ts,entry,kind,rip) VALUES (?,?,?,?)").bind(Date.now(), String(b.entry || "").slice(0, 64), String(b.kind || "").slice(0, 16), request.headers.get("cf-connecting-ip") || "")
          ]);
        } else {
          await env.CHESS_DB.prepare(
            "INSERT INTO race_report (ts,asn,city,entry,t_self,t_alt,t_p1,t_p2,t_p3,t_p4,t_p5,t_p6,t_p7,t_p8,t_p9) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
          ).bind(Date.now(), cf.asn || 0, String(cf.city || cf.region || "").slice(0, 40), String(b.entry || "").slice(0, 64), b.t_self | 0, b.t_alt | 0, b.t_p1 | 0, b.t_p2 | 0, b.t_p3 | 0, b.t_p4 | 0, b.t_p5 | 0, b.t_p6 | 0, b.t_p7 | 0, b.t_p8 | 0, b.t_p9 | 0).run();
        }
      } catch (e) {
      }
      return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
    }
    if (path.startsWith("/api/")) {
      return await handleApiRequest(request, env);
    }
    if (path === "/admin" || path === "/admin/") {
      const adminReq = new Request(new URL("/admin.html", request.url).toString(), { method: "GET", headers: { "accept-encoding": "identity" } });
      const adminResp = await env.ASSETS.fetch(adminReq);
      const adminBody = await adminResp.text();
      return new Response(adminBody, { headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store, no-cache, must-revalidate" } });
    }
    if (request.headers.get("Upgrade") === "websocket") {
      const roomId = url.searchParams.get("roomId");
      if (!roomId) {
        const [client, server] = Object.values(new WebSocketPair());
        server.accept();
        handleWebSocket(server, env);
        return new Response(null, { status: 101, webSocket: client });
      }
      const roomDO = env.CHESS_ROOM.idFromName(roomId);
      const roomStub = env.CHESS_ROOM.get(roomDO);
      return roomStub.fetch(request);
    }
    if (env.ASSETS) {
      if (path === "/" || path.endsWith(".html")) {
        const assetUrl = new URL(path === "/" ? "/index.html" : path, request.url).toString();
        const assetResp = await env.ASSETS.fetch(new Request(assetUrl, { method: "GET", headers: { "accept-encoding": "identity" } }));
        const body = await assetResp.text();
        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        });
      }
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  }
};
async function generateFreeRoomId(db) {
  for (let i = 0; i < 24; i++) {
    const id = String(Math.floor(1e3 + Math.random() * 9e3));
    try {
      if (!db) return id;
      const row = await db.prepare("SELECT 1 FROM room_state WHERE room_id = ?").bind(id).first();
      if (!row) return id;
    } catch (e) {
      return id;
    }
  }
  return String(Date.now()).slice(-6);
}
__name(generateFreeRoomId, "generateFreeRoomId");
__name2(generateFreeRoomId, "generateFreeRoomId");
async function presenceDelta(env, delta) {
  try {
    const stub = env.MATCH_QUEUE.get(env.MATCH_QUEUE.idFromName("global"));
    const r = await stub.fetch("https://do/presence", { method: "POST", body: JSON.stringify({ delta }) });
    const d = await r.json();
    return d && typeof d.online === "number" ? d.online : null;
  } catch (e) {
    return null;
  }
}
__name(presenceDelta, "presenceDelta");
__name2(presenceDelta, "presenceDelta");
async function presenceSync(env, payload) {
  try {
    const stub = env.MATCH_QUEUE.get(env.MATCH_QUEUE.idFromName("global"));
    const r = await stub.fetch("https://do/presence", { method: "POST", body: JSON.stringify(payload) });
    const d = await r.json();
    return d && typeof d.online === "number" ? d.online : null;
  } catch (e) {
    return null;
  }
}
__name(presenceSync, "presenceSync");
__name2(presenceSync, "presenceSync");
async function handleWebSocket(ws, env) {
  activeConnections.add(ws);
  ws._connId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  ws._lastSeen = Date.now();
  ws._env = env;
  lastPresenceEnv = env;
  let socketData = { roomId: null, color: null, spectator: false };
  ws.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      const eventName = data.event || data[0];
      const payload = data.payload || data[1];
      if (eventName === "presence") {
        const dev = payload && typeof payload.deviceId === "string" ? payload.deviceId : null;
        if (dev && ws._connId && !ws._deviceId) {
          ws._deviceId = dev;
          const pT1 = await presenceSync(env, { set: ws._connId, deviceId: dev });
          if (typeof pT1 === "number") onlineCount = pT1;
          broadcastOnlineCount();
        }
      } else if (eventName === "create_room") {
        let lastColor = null;
        let requestedRoomId = null;
        if (payload && typeof payload === "object") {
          requestedRoomId = payload.roomId;
          lastColor = payload.lastColor;
        } else {
          requestedRoomId = payload;
        }
        {
          const roomId = requestedRoomId || await generateFreeRoomId(env.CHESS_DB);
          ws.send(JSON.stringify({ event: "redirect_room", data: { roomId, action: "create", lastColor } }));
        }
      } else if (eventName === "ping") {
        ws._lastSeen = Date.now();
        try {
          ws.send(JSON.stringify({ event: "pong" }));
        } catch (e) {
        }
        if (Date.now() - (lastHbAt || 0) > 3e4) {
          lastHbAt = Date.now();
          const hbIds = [];
          for (const w of activeConnections) {
            if (w._connId) hbIds.push({ id: w._connId, dev: w._deviceId || null });
          }
          if (hbIds.length) {
            presenceSync(ws._env || lastPresenceEnv, { heartbeat: hbIds }).then(function(pT4) {
              if (typeof pT4 === "number") {
                onlineCount = pT4;
                broadcastOnlineCount();
              }
            });
          }
        }
      } else if (eventName === "join_room") {
        const roomId = payload && typeof payload === "object" ? payload.roomId : payload;
        ws.send(JSON.stringify({ event: "redirect_room", data: { roomId, action: "join" } }));
      } else if (eventName === "reconnect_room") {
        const roomId = payload.roomId;
        if (!roomId) return;
        ws.send(JSON.stringify({ event: "redirect_room", data: { roomId, action: "reconnect", color: payload.color } }));
      }
    } catch (e) {
      console.error("WebSocket message error:", e);
    }
  };
  const lobbyDetach = /* @__PURE__ */ __name(() => {
    if (activeConnections.delete(ws)) {
      presenceSync(ws._env || lastPresenceEnv, { leave: ws._connId }).then(function(pT2) {
        if (typeof pT2 === "number") {
          onlineCount = pT2;
          broadcastOnlineCount();
        }
      });
    }
  }, "lobbyDetach");
  ws.onclose = lobbyDetach;
  ws.onerror = lobbyDetach;
  (async () => {
    const pT0 = await presenceSync(env, { join: ws._connId });
    if (typeof pT0 === "number") onlineCount = pT0;
    try {
      ws.send(JSON.stringify({ event: "online_count", data: onlineCount }));
    } catch (e) {
    }
    broadcastOnlineCount();
  })();
}
__name(handleWebSocket, "handleWebSocket");
__name2(handleWebSocket, "handleWebSocket");
export {
  ChessRoom,
  MatchQueue,
  index_default as default
};
//# sourceMappingURL=index.js.map
