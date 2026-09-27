"use strict";
/* FITQUEST v0.1 — local-first PWA. Data lives in this phone's localStorage (백업: 설정 → 내보내기).
   Rules: docs/01-product.md (영양 4장 · 이중 진행 5-5 · XP 6장) + docs/00-decisions.md */

/* ================= tiny helpers ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = n => Math.round(n).toLocaleString('ko-KR');
const r5 = x => Math.round(x / 5) * 5, r50 = x => Math.round(x / 50) * 50;
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const I = {
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', chev: '<path d="m9 18 6-6-6-6"/>',
  undo: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  text: '<path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/>',
  swap: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>'
};
const ico = (n, c = 'ico--20') => `<svg class="ico ${c}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
const PX = {
  bolt: 'M6 0h4v1H6zM5 1h4v1H5zM4 2h4v1H4zM3 3h4v1H3zM2 4h8v1H2zM2 5h7v1H2zM5 6h3v1H5zM4 7h3v1H4zM4 8h2v1H4zM3 9h2v1H3zM3 10h1v1H3zM2 11h1v1H2z',
  flame: 'M5 0h1v1H5zM5 1h2v1H5zM4 2h3v1H4zM4 3h4v1H4zM3 4h5v1H3zM3 5h6v1H3zM2 6h3v1H2zM6 6h3v1H6zM2 7h3v1H2zM6 7h4v1H6zM2 8h2v1H2zM5 8h1v1H5zM7 8h3v1H7zM2 9h8v1H2zM3 10h6v1H3zM4 11h4v1H4z',
  shield: 'M2 1h8v1H2zM1 2h10v4H1zM2 6h8v2H2zM3 8h6v1H3zM4 9h4v1H4zM5 10h2v1H5z',
  star: 'M5 0h2v2H5zM4 2h4v2H4zM0 4h12v1H0zM1 5h10v1H1zM2 6h8v1H2zM3 7h6v1H3zM2 8h8v1H2zM2 9h3v1H2zM7 9h3v1H7zM1 10h3v1H1zM8 10h3v1H8zM1 11h2v1H1zM9 11h2v1H9z',
  lock: 'M4 0h4v1H4zM3 1h1v4H3zM8 1h1v4H8zM1 5h10v7H1z'
};
const px = (n, big) => `<svg class="px${big ? ' px--24' : ''}" viewBox="0 0 12 12" aria-hidden="true"><path d="${PX[n]}"/></svg>`;

/* ================= dates (하루 경계 = 새벽 4시) ================= */
const pad = n => String(n).padStart(2, '0');
function dayKey(d = new Date()) { const x = new Date(d.getTime() - 4 * 3600e3); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; }
const kDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (k, n) => { const d = kDate(k); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const dow = k => kDate(k).getDay();
const daysBetween = (a, b) => Math.round((kDate(b) - kDate(a)) / 864e5);
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const hm = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const mondayOf = k => addDays(k, -((dow(k) + 6) % 7));

/* ================= store ================= */
const KEY = 'fitquest.v1';
function fresh() {
  return { v: 1, profile: null, inbody: [], weights: {}, foods: [], sessions: [], prog: {}, xp: 0, xpDay: {}, done: {}, overrides: {}, flags: {},
    streak: { cur: 0, best: 0, last: null, shields: 0 }, tape: [], schedule: { 1: 'A', 2: 'B', 4: 'C', 5: 'E', 6: 'D' },
    settings: { sound: true, theme: 'auto', gkey: '', gmodel: '' } };
}
let DB;
try { DB = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { DB = fresh(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { toast('<span>저장 공간이 부족해요. 설정에서 백업을 내보내 주세요.</span>', 5000); } }

/* ================= sound (8-bit style, Web Audio 합성 — 외부 음원 없음) ================= */
let AC = null;
function tone(seq, type = 'square', vol = .07) {
  if (!DB.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    let t = AC.currentTime + .01;
    seq.forEach(([f, d]) => {
      if (f) {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + d * .95);
        o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d);
      }
      t += d;
    });
  } catch (e) {}
}
const SFX = {
  start: () => tone([[523, .07], [659, .07], [784, .07], [1047, .16]]),
  set: () => tone([[988, .06], [1319, .14]]),
  combo: () => tone([[659, .05], [784, .05], [988, .05], [1319, .12]]),
  ready: () => tone([[1047, .08], [0, .05], [1047, .14]], 'triangle', .1),
  pr: () => tone([[784, .05], [1047, .05], [1319, .05], [1568, .05], [2093, .14]]),
  level: () => tone([[523, .08], [659, .08], [784, .08], [1047, .18], [784, .08], [1047, .3]]),
  food: () => tone([[880, .05], [1760, .09]], 'sine', .09),
  undo: () => tone([[440, .06], [330, .09]], 'triangle', .08),
  tap: () => tone([[1200, .025]], 'square', .03)
};

/* ================= nutrition engine (docs/01-product 4-2 ~ 4-5) ================= */
const STEPS = [['5천 미만', 1.25], ['5천~8천', 1.35], ['8천~1만2천', 1.45], ['1만2천 이상', 1.55]];
const CH = [
  { name: '정직한 2주', sub: '진짜 유지 칼로리 찾기', off: 0, pkg: 2.2, fkg: .8, boss: '진실의 거울' },
  { name: '미니컷', sub: '지방 안개 걷기', off: -400, pkg: 2.3, fkg: .7, boss: '지방 안개' },
  { name: '리컴프', sub: '골조 다지기', off: 0, pkg: 2.2, fkg: .8, boss: '흐릿한 윤곽' },
  { name: '린벌크', sub: '프레임 확장', off: 250, pkg: 2.0, fkg: .9, boss: '좁은 프레임' }
];
const ib = () => DB.inbody[DB.inbody.length - 1];
function curWeight() {
  const t = dayKey(), ws = Object.entries(DB.weights).filter(([k]) => daysBetween(k, t) <= 7 && daysBetween(k, t) >= 0).map(([, v]) => v);
  return ws.length ? ws.reduce((a, b) => a + b, 0) / ws.length : ib().w;
}
function recChapter(sex, pbf) { const k = sex === 'F' ? 8 : 0; return pbf >= 20 + k ? 1 : pbf > 15 + k ? 2 : 3; }
const isTrainDay = k => !!tplFor(k);
function trainDaysPerWeek() { return (DB.rot && DB.rot.on ? Object.keys(DB.rot.slots).length : Object.keys(DB.schedule).length) || 4; }
function targets(k = dayKey()) {
  const P = DB.profile, b = ib(), w = curWeight(), ch = CH[P.chapter];
  const pbf = b.pbf, lbm = w * (1 - pbf / 100), bmr = b.bmr || Math.round(370 + 21.6 * lbm);
  const exKcal = w * 4 * (P.sessionMin / 60);
  let rest = bmr * STEPS[P.steps][1];
  if (DB.flags.tdee) rest = DB.flags.tdee - exKcal * trainDaysPerWeek() / 7;
  const train = isTrainDay(k);
  const tdee = rest + (train ? exKcal : 0);
  let kcal = tdee + ch.off + (DB.flags.adj || 0);
  const floor = Math.max(bmr, P.sex === 'F' ? 1200 : 1500);
  if (kcal < floor) kcal = floor;
  kcal = r50(kcal);
  const refW = pbf > (P.sex === 'F' ? 32 : 25) ? lbm / .85 : w;
  const p = r5(refW * ch.pkg);
  const f = r5(Math.max(w * ch.fkg, w * .6, kcal * .2 / 9));
  const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));
  return { kcal, p, f, c, train, bmr, tdee: Math.round(tdee) };
}
function mealNames() { return { 3: ['아침', '점심', '저녁'], 4: ['아침', '점심', '간식', '저녁'], 5: ['아침', '간식1', '점심', '간식2', '저녁'] }[DB.profile.meals] || ['아침', '점심', '간식', '저녁']; }
const lunchIdx = () => DB.profile.meals === 5 ? 2 : 1;
const lunchOut = () => DB.profile.lunchOut !== false;
function mealSplit(p) {
  const n = DB.profile.meals, li = lunchOut() ? lunchIdx() : -1, others = li >= 0 ? n - 1 : n, rest = li >= 0 ? p - LUNCH_P : p;
  const base = Math.floor(rest / others / 5) * 5; let rem = rest - base * others;
  return Array.from({ length: n }, (_, i) => { if (i === li) return LUNCH_P; const add = rem >= 5 ? 5 : 0; rem -= add; return base + add; });
}
function riceTip() { const c = DB.profile.chapter; return c === 1 ? '밥은 반 공기, 고기·생선 반찬은 다 드세요' : c === 3 ? '밥 1공기 다 드시고, 식후 단백질 음료 하나 추가' : '밥 1공기, 고기 반찬 먼저'; }
function slotAt(min = hm()) {
  const n = DB.profile.meals, cut = { 3: [630, 960], 4: [630, 900, 1110], 5: [570, 720, 900, 1110] }[n] || [630, 900, 1110];
  const m = min < 240 ? min + 1440 : min;
  let i = 0; while (i < cut.length && m >= cut[i]) i++; return i;
}
function dayFoods(k = dayKey()) { return DB.foods.filter(f => f.day === k); }
function daySum(k = dayKey()) { const fs = dayFoods(k); const s = x => fs.reduce((a, f) => a + (+f[x] || 0), 0); return { p: s('p'), k: s('k'), c: s('c'), f: s('f'), n: fs.length }; }
function slotSum(slot, k = dayKey()) { return dayFoods(k).filter(f => f.slot === slot).reduce((a, f) => a + f.p, 0); }
function nextTarget() {
  const T = targets(), S = daySum(), left = Math.max(0, T.p - S.p), cur = slotAt(), n = DB.profile.meals, li = lunchOut() ? lunchIdx() : -1;
  if (cur === li && !slotSum(li)) return { left, nt: LUNCH_P, cur, lunch: true };
  const lunchAhead = li > cur ? LUNCH_P : 0, slots = Math.max(1, n - cur - (lunchAhead ? 1 : 0));
  return { left, nt: Math.max(0, Math.ceil((left - lunchAhead) / slots / 5) * 5), cur };
}

/* ================= game engine (6장) ================= */
const cum = L => L <= 1 ? 0 : Math.round(150 * Math.pow(L - 1, 1.8) / 10) * 10;
const levelOf = xp => { let L = 1; while (cum(L + 1) <= xp) L++; return L; };
const TITLES = [[50, '마스터 빌더'], [45, '살아 있는 조각상'], [40, '걸작'], [35, '랜드마크'], [30, '마천루'], [25, '강철 프레임'], [20, 'V라인 건축가'], [15, '넓은 어깨 견습생'], [10, '골조 세우기'], [5, '기초 공사'], [1, '설계도 초안']];
const titleOf = L => TITLES.find(t => L >= t[0])[1];
const CAPS = { meal: 5, mealhit: 4, set: 30, protein: 1, all: 1, weight: 1, workout: 1, rescue: 1, daily3: 1, pain: 1, cond: 1 };
let pendingLevel = null;
function addXP(kind, n, day = dayKey()) {
  const d = DB.xpDay[day] = DB.xpDay[day] || {};
  if (CAPS[kind] && (d[kind] || 0) >= CAPS[kind]) return 0;
  d[kind] = (d[kind] || 0) + 1;
  const L0 = levelOf(DB.xp); DB.xp += n; const L1 = levelOf(DB.xp);
  if (L1 > L0) { pendingLevel = L1; if (L1 % 5 === 0) DB.streak.shields = Math.min(2, DB.streak.shields + 1); }
  return n;
}
function checkDaily3() {
  const k = dayKey(), T = targets(), S = daySum();
  const q = [S.p >= T.p * .9, isTrainDay(k) ? !!DB.done[k] : !!DB.weights[k], !!DB.flags['all_' + k]];
  if (q.every(Boolean)) addXP('daily3', 30);
  return q;
}
function tplFor(k) {
  const o = DB.overrides[k]; if (o === 'rest') return null; if (o) return o;
  const d = dow(k);
  if (DB.pins && DB.pins[d]) return DB.pins[d];
  if (DB.rot && DB.rot.on) return rotFor(k);
  return DB.schedule[d] || null;
}
function rotCands(part) {
  const picks = (DB.profile.creators || []).flatMap(id => (CREATORS.find(c => c.id === id) || {}).tpls || []), base = ROT[part];
  const mine = base.filter(t => picks.includes(t)), rest = base.filter(t => !picks.includes(t));
  if (!mine.length) return base;
  return mine.length >= 2 ? mine.concat(rest.filter(t => !TPL[t].pro).slice(0, 1)) : [mine[0], rest[0], mine[0]].filter(Boolean);
}
function rotWeek(k) { return Math.max(0, Math.floor(daysBetween(DB.rot.start, mondayOf(k)) / 7)); }
function rotFor(k) {
  const d = dow(k), part = DB.rot.slots[d]; if (!part) return null;
  const mon = mondayOf(k), order = [1, 2, 3, 4, 5, 6, 0]; let j = 0;
  for (const x of order) { if (x === d) break; if (DB.rot.slots[x] === part) j++; }
  const c = rotCands(part); return c[(rotWeek(k) + j) % c.length];
}
function settleStreak() {
  const S = DB.streak, today = dayKey();
  if (!S.last) { S.last = addDays(today, -1); return; }
  let k = addDays(S.last, 1);
  const used = [];
  while (daysBetween(k, today) > 0) {
    if (!isTrainDay(k) || DB.done[k]) { S.cur++; if (S.cur % 7 === 0) S.shields = Math.min(2, S.shields + 1); }
    else if (S.shields > 0) { S.shields--; S.cur++; used.push(k); }
    else S.cur = 0;
    S.best = Math.max(S.best, S.cur); S.last = k; k = addDays(k, 1);
  }
  if (used.length) setTimeout(() => toast(`<span>보호권으로 연속 기록을 지켰어요 (${used.map(u => DOW[dow(u)]).join('·')}요일)</span>`, 4000), 800);
  save();
}
const streakNow = () => DB.streak.cur + (DB.done[dayKey()] ? 1 : 0);
const lastSessionDay = () => DB.sessions.length ? DB.sessions[DB.sessions.length - 1].day : null;
function comebackGap() { const l = lastSessionDay(); return l ? daysBetween(l, dayKey()) : 0; }

/* ================= progression engine (5-5 이중 진행) ================= */
const isLower = id => EX[id].mus.includes('quads') || EX[id].mus.includes('calves');
function incOf(id) { const E = EX[id]; if (E.kind === 'bbl') return DB.profile.level === 'beginner' ? 5 : 2.5; return E.inc; }
function prog(id) { return DB.prog[id] = DB.prog[id] || { w: EX[id].def, reps: null, f: 0, prev: 0, n: 0, best: 0, last: 'first', lastDay: null }; }
function plannedFor(id, sets, range) {
  const E = EX[id], st = prog(id), [lo] = range || E.range;
  let w = st.w; const gap = st.lastDay ? daysBetween(st.lastDay, dayKey()) : 0;
  const k = gap > 42 ? .7 : gap > 20 ? .8 : gap > 10 ? .9 : 1;
  if (k < 1) w = E.kind === 'as' ? w + Math.ceil(w * (1 - k) / incOf(id)) * incOf(id) : Math.floor(w * k / incOf(id)) * incOf(id);
  const reps = Array.from({ length: sets }, (_, i) => (st.reps && st.reps[i]) || (st.reps && st.reps[st.reps.length - 1]) || lo);
  return { w, reps, gap };
}
function badgeFor(id) {
  const st = prog(id), inc = incOf(id);
  return { first: ['첫 기록', '10회 할 수 있는 무게로 가볍게 시작해요'], up: [EX[id].kind === 'as' ? `보조 −${inc}KG` : `+${inc}KG`, '지난번 모든 세트 윗끝 달성 → 증량'], prog: ['+1회', '총반복 기준 통과 → 세트마다 +1회'],
    hold: ['유지', '"한계"였어서 같은 무게로 한 번 더'], fail: ['유지', '같은 무게로 다시 도전'], deload: ['DELOAD −10%', '잠깐 물러서서 더 멀리 — 반복은 끝까지'] }[st.last] || ['유지', ''];
}
function applyProgress(id, done, planned, feel, range) {
  const E = EX[id], st = prog(id), [lo, hi] = range || E.range, inc = incOf(id);
  if (!done.length) return;
  const reps = done.map(s => s.r), w = done[0].w, total = reps.reduce((a, b) => a + b, 0), N = planned;
  const first = st.n === 0, up = x => E.kind === 'as' ? Math.max(0, x - inc) : x + inc;
  st.w = w;
  if (done.length < N) st.reps = reps.concat(Array(N - done.length).fill(lo));
  else if (reps.every(r => r >= hi)) {
    if (feel === '한계') { st.reps = Array(N).fill(hi); st.last = 'hold'; }
    else { st.w = up(w); if (first && feel === '쉬웠다' && E.kind !== 'as') st.w = up(st.w); st.reps = Array(N).fill(lo); st.last = 'up'; }
    st.f = 0;
  } else if (total >= N * lo) { st.reps = reps.map(r => Math.min(hi, r + 1)); st.f = 0; st.last = 'prog'; }
  else if (first) { st.reps = Array(N).fill(lo); st.last = 'fail'; }
  else {
    st.f++;
    if ((st.f >= 2 && total <= st.prev) || st.f >= 3) {
      st.w = E.kind === 'as' ? w + Math.ceil(w * .1 / inc) * inc : Math.max(0, Math.floor(w * .9 / inc) * inc);
      st.reps = Array(N).fill(hi); st.f = 0; st.last = 'deload';
    } else { st.reps = Array(N).fill(lo); st.last = 'fail'; }
    st.prev = total;
  }
  st.n++; st.lastDay = dayKey();
}
const e1 = (w, r) => w * (1 + r / 30);

/* ================= blueprint (주간 부위별 세트) ================= */
const BP_T = { 'delt-side': 10, lats: 10, 'chest-upper': 6, chest: 3, 'delt-front': 4, traps: 6, biceps: 8, forearm: 8, abs: 3, obliques: 1, quads: 12, calves: 3 };
function weekSets() {
  const mon = mondayOf(dayKey()), c = {};
  DB.sessions.filter(s => daysBetween(mon, s.day) >= 0).forEach(s => s.ex.forEach(e => { const n = e.sets.length; [...new Set(EX[e.id].mus)].forEach(m => c[m] = (c[m] || 0) + n); }));
  return c;
}
function bpLevels() { const c = weekSets(), L = {}; Object.keys(BP_T).forEach(m => L[m] = Math.min(4, Math.floor((c[m] || 0) / BP_T[m] * 4))); return L; }
const bpPct = L => Math.round(Object.values(L).reduce((a, b) => a + b, 0) / (Object.keys(L).length * 4) * 100);
function blueprintSVG(L, gain = []) {
  const g = (m, t, polys) => `<g data-muscle="${m}" data-level="${L[m] || 0}" ${['delt-side', 'lats', 'chest-upper'].includes(m) ? 'data-focus' : ''} ${gain.includes(m) ? 'data-gain' : ''}><title>${t}</title>${polys.map(p => `<polygon class="fq-muscle" points="${p}"/>`).join('')}</g>`;
  return `<svg class="fq-body" viewBox="0 0 240 380" role="img" aria-label="바디 설계도: 이번 주 부위별 운동량">
  <path class="fq-body__target" d="M78 198 60 128 46 98 50 82 108 58M132 58l58 24 4 16-14 30-18 70"/>
  <ellipse class="fq-body__head" cx="120" cy="34" rx="16" ry="20"/><path class="fq-body__part" d="M111 53h18l3 12h-24z"/>
  <polygon class="fq-body__part" points="51,211 65,213 63,230 49,226"/><polygon class="fq-body__part" points="189,211 175,213 177,230 191,226"/>
  <polygon class="fq-body__part" points="81,202 119,205 119,240 97,248 78,226"/><polygon class="fq-body__part" points="159,202 121,205 121,240 143,248 162,226"/>
  <polygon class="fq-body__part" points="90,364 108,364 110,372 86,372"/><polygon class="fq-body__part" points="150,364 132,364 130,372 154,372"/>
  ${g('traps', '승모·후면 어깨', ['108,58 119,66 90,81 64,81', '132,58 121,66 150,81 176,81'])}
  ${g('delt-side', '측면 삼각근', ['64,83 71,84 61,124 56,125 51,108 53,92', '176,83 169,84 179,124 184,125 189,108 187,92'])}
  ${g('delt-front', '전면 삼각근', ['73,84 89,83 84,100 74,121 63,123', '167,84 151,83 156,100 166,121 177,123'])}
  ${g('chest-upper', '윗가슴', ['90,85 119,88 119,104 79,108 85,99', '150,85 121,88 121,104 161,108 155,99'])}
  ${g('chest', '가슴', ['79,110 119,106 119,134 100,140 84,134 76,121', '161,110 121,106 121,134 140,140 156,134 164,121'])}
  ${g('lats', '광배근', ['74,124 83,136 89,151 84,177 79,192 76,158', '166,124 157,136 151,151 156,177 161,192 164,158'])}
  ${g('abs', '복근', ['97,142 119,139 119,202 97,202', '143,142 121,139 121,202 143,202'])}
  ${g('obliques', '복사근', ['90,153 95,150 95,202 81,198 85,178', '150,153 145,150 145,202 159,198 155,178'])}
  ${g('biceps', '이두', ['56,128 71,125 69,160 53,160', '184,128 169,125 171,160 187,160'])}
  ${g('forearm', '삼두·전완', ['53,164 69,164 65,208 51,206', '187,164 171,164 175,208 189,206'])}
  ${g('quads', '하체', ['78,230 96,250 116,253 112,306 86,308 76,270', '162,230 144,250 124,253 128,306 154,308 164,270'])}
  ${g('calves', '종아리', ['86,314 112,312 108,358 90,360', '154,314 128,312 132,358 150,360'])}
</svg>`;
}

/* ================= router & shared UI ================= */
const R = { shoot: () => renderShoot(), cmp: () => renderCmp() };
let TAB = 'home';
function go(tab) {
  if (TAB === 'shoot' && tab !== 'shoot') stopCam();
  if (tab === 'shoot') $('#toast').innerHTML = '';
  TAB = tab;
  ['onb', 'home', 'diet', 'cam', 'work', 'grow', 'set', 'logger', 'sum', 'shoot', 'cmp'].forEach(s => { $('#scr-' + s).hidden = s !== tab; });
  $('#tabbar').hidden = tab === 'onb' || tab === 'logger' || tab === 'shoot';
  document.querySelectorAll('.tabbar button').forEach(b => b.dataset.go === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  R[tab] && R[tab]();
  window.scrollTo(0, 0);
}
function sheet(html) {
  $('#overlay').innerHTML = `<div class="sheet-back" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
}
const closeSheet = () => { $('#overlay').innerHTML = ''; };
function toast(html, ms = 3500) {
  const t = TAB === 'logger' && $('#dockToast') || $('#toast');
  t.style.bottom = TAB === 'shoot' ? 'calc(150px + env(safe-area-inset-bottom, 0px))' : '';
  t.innerHTML = `<div class="fq-toast">${html}</div>`;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.innerHTML = ''; }, ms);
}
const say = s => { $('#live').textContent = s; };
function showLevelUp() {
  if (!pendingLevel) return; const L = pendingLevel; pendingLevel = null;
  $('#lvl-num').textContent = L;
  const newTitle = TITLES.find(t => t[0] === L);
  $('#lvl-sub').textContent = newTitle ? `새 칭호 · ${titleOf(L)}` : `LV ${L} 달성 · ${titleOf(L)}`;
  const rw = []; if (L % 5 === 0) rw.push('보호권 +1'); if (newTitle) rw.push('칭호 해금');
  $('#lvl-rw').innerHTML = rw.map(r => `<span class="fq-badge fq-badge--xp">${r}</span>`).join('');
  SFX.level(); buzz([30, 50, 30, 50, 120]);
  try { $('#lvl').showModal(); } catch (e) { $('#lvl').setAttribute('open', ''); }
}
function hud() {
  const L = levelOf(DB.xp), a = cum(L), b = cum(L + 1), p = Math.round((DB.xp - a) / (b - a) * 100), P = DB.profile;
  return `<section class="fq-plate" aria-label="플레이어 상태">
    <div class="fq-plate__head"><span class="fq-hud">PLAYER · ${titleOf(L)}</span><span class="fq-hud" style="color:var(--fq-xp-text);display:inline-flex;gap:4px;align-items:center">${px('bolt')}${fmt(DB.xp - a)} / ${fmt(b - a)} XP</span></div>
    <div class="hud-body"><div class="fq-level" aria-label="레벨 ${L}"><span class="fq-level__lv">LV</span><span class="fq-level__num">${L}</span></div>
      <div class="hud-xp"><div class="fq-xp" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="다음 레벨까지" style="--p:${p}"><div class="fq-xp__fill"></div></div><span class="fq-t-caption">다음 레벨까지 ${fmt(b - DB.xp)} XP</span></div></div>
    <div class="hud-meta"><span class="fq-badge fq-badge--xp">${px('flame')} 연속 ${streakNow()}일</span><span class="fq-badge fq-badge--xp">${px('shield')} 보호권 ${DB.streak.shields}</span><span class="fq-badge">CH.${P.chapter} ${CH[P.chapter].name} · ${chapterWeek()}</span></div>
  </section>`;
}
function chapterWeek() { const d = daysBetween(DB.profile.chapterStart, dayKey()); return DB.profile.chapter === 0 ? `D+${d + 1}/14` : `${Math.floor(d / 7) + 1}주차`; }

function proteinRing(T, S, size) {
  const pct = Math.min(100, S.p / T.p * 100), kp = Math.min(100, S.k / T.kcal * 100), split = mealSplit(T.p);
  let acc = 0; const ticks = split.slice(0, -1).map(m => { acc += m; const a = acc / T.p * 2 * Math.PI; return `<line class="ring-tick" x1="${18 + 14.2 * Math.cos(a)}" y1="${18 + 14.2 * Math.sin(a)}" x2="${18 + 17.6 * Math.cos(a)}" y2="${18 + 17.6 * Math.sin(a)}"/>`; }).join('');
  return `<div class="ring-box" style="${size ? 'width:' + size : ''}">
    <svg class="fq-ring fq-ring--protein" viewBox="0 0 36 36" style="--p:${pct.toFixed(1)};--w:3" aria-hidden="true"><circle class="fq-ring__track" cx="18" cy="18" r="15.9"/><circle class="fq-ring__arc" cx="18" cy="18" r="15.9" pathLength="100"/>${ticks}</svg>
    <svg class="fq-ring fq-ring--kcal" viewBox="0 0 36 36" style="--p:${kp.toFixed(1)};--w:1.6" ${S.k > T.kcal * 1.1 ? 'data-over' : ''} aria-hidden="true"><circle class="fq-ring__track" cx="18" cy="18" r="15.9"/><circle class="fq-ring__arc" cx="18" cy="18" r="15.9" pathLength="100"/></svg>
    <div class="ring-center"><span class="fq-eyebrow">Protein 남음</span><span class="big">${Math.max(0, Math.round(T.p - S.p))}</span><span class="fq-unit">G · ${Math.round(S.p)}/${T.p}</span></div>
  </div>`;
}
function mealCells(T) {
  const names = mealNames(), split = mealSplit(T.p), { nt, cur } = nextTarget();
  return `<div class="meals" style="grid-template-columns:repeat(${names.length},1fr)">${names.map((n, i) => {
    const got = slotSum(i); let tg = split[i]; if (i >= cur && !got) tg = Math.max(tg, nt);
    const hit = got >= tg - 10 && got > 0;
    return `<div class="meal" ${hit ? 'data-hit' : ''} ${i === cur ? 'data-now' : ''}><span class="fq-t-caption" style="color:var(--fq-text-2)">${n}${hit ? ' ✓' : ''}</span><b>${Math.round(got)}<small class="fq-unit" style="font-size:11px">/${tg}</small></b></div>`;
  }).join('')}</div>`;
}

/* ================= ONBOARDING ================= */
const OB = { sex: 'M', steps: 1, meals: 4, min: 60, level: 'beginner', days: [1, 2, 4, 5, 6], lunch: 1, cr: ['idohwang'] };
R.onb = () => {
  const ch = (k, v, label) => `<button class="fq-chip" aria-pressed="${OB[k] === v}" data-act="ob" data-k="${k}" data-v="${v}">${label}</button>`;
  const inp = (id, label, ph, extra = '') => `<label class="stack" for="${id}" style="gap:6px"><span class="fq-t-label">${label}</span><input id="${id}" class="inp" inputmode="decimal" placeholder="${ph}" ${extra}></label>`;
  $('#scr-onb').innerHTML = `
    <header class="topbar"><span class="brand">FIT<b>QUEST</b></span></header>
    <section class="fq-plate"><div class="fq-plate__head"><span class="fq-hud">NEW GAME</span><span class="fq-hud">1/1</span></div>
      <h1 class="fq-t-title">넓은 프레임을 설계해요</h1><p class="fq-t-body" style="margin:8px 0 0">어깨·등은 넓게, 허리는 얇게. 인바디 숫자를 넣으면 끼니마다 먹을 양과 오늘 할 운동을 앱이 정해 줘요.</p></section>
    <section class="fq-card stack" style="gap:14px"><h2 class="fq-t-heading">기본 정보</h2>
      <div class="chips">${ch('sex', 'M', '남성')}${ch('sex', 'F', '여성')}</div>
      <div class="grid2">${inp('obAge', '나이', '예: 32', 'inputmode="numeric"')}${inp('obH', '키 (cm)', '예: 175')}</div></section>
    <section class="fq-card stack" style="gap:14px"><h2 class="fq-t-heading">인바디</h2>
      <div class="grid2">${inp('obW', '체중 (kg)', '예: 75.0')}${inp('obSmm', '골격근량 (kg)', '예: 34.0')}${inp('obPbf', '체지방률 (%)', '예: 20.0')}${inp('obBmr', '기초대사량 (선택)', '예: 1650', 'inputmode="numeric"')}</div>
      <label class="stack" for="obDate" style="gap:6px"><span class="fq-t-label">측정일</span><input id="obDate" class="inp" type="date" value="${new Date().toISOString().slice(0, 10)}"></label>
      <p class="note" style="margin:0">인바디 결과지 맨 위 "체성분 분석"과 "골격근·지방 분석"에 있는 숫자예요.</p></section>
    <section class="fq-card stack" style="gap:14px"><h2 class="fq-t-heading">생활</h2>
      <span class="fq-t-label">하루 걸음 수</span><div class="chips">${STEPS.map((s, i) => ch('steps', i, s[0])).join('')}</div>
      <span class="fq-t-label">하루 끼니 수</span><div class="chips">${[3, 4, 5].map(n => ch('meals', n, n + '끼')).join('')}</div>
      <span class="fq-t-label">점심</span><div class="chips">${ch('lunch', 1, '회사·식당 일반식')}${ch('lunch', 0, '도시락·직접 조절')}</div>
      <span class="fq-t-label">한 번 운동 시간</span><div class="chips">${[45, 60, 75, 90].map(n => ch('min', n, n + '분')).join('')}</div>
      <span class="fq-t-label">웨이트 경력</span><div class="chips">${ch('level', 'beginner', '6개월 미만 · 쉬었다 복귀')}${ch('level', 'intermediate', '6개월 이상 꾸준히')}</div></section>
    <section class="fq-card stack" style="gap:14px"><h2 class="fq-t-heading">되고 싶은 몸 (롤모델)</h2>
      <p class="note" style="margin:0">고른 유튜버의 루틴과 방식이 내 무게에 맞춰 더 자주 들어와요. 여러 명 골라도 돼요.</p>
      <div class="stack">${CREATORS.map(c => `<button class="pro-card" data-act="obCr" data-v="${c.id}" aria-pressed="${OB.cr.includes(c.id)}" style="${OB.cr.includes(c.id) ? 'box-shadow:inset 0 0 0 2px var(--fq-text)' : ''}"><div class="who"><span class="fq-badge">${c.name}</span><span class="fq-t-caption">${c.tag}</span></div><span class="fq-t-body" style="font-size:15px">${c.body}</span></button>`).join('')}</div></section>
    <section class="fq-card stack" style="gap:14px"><h2 class="fq-t-heading">운동 요일</h2>
      <div class="chips">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="fq-chip" aria-pressed="${OB.days.includes(d)}" data-act="obDay" data-v="${d}" style="min-width:48px;justify-content:center">${DOW[d]}</button>`).join('')}</div>
      <p class="note" style="margin:0">매일 하던 분은 주 5회를 추천해요(나머지 이틀은 걷기). 요일별 루틴은 나중에 바꿀 수 있어요.</p></section>
    <button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="obCalc">목표 계산하기</button>
    <div id="obResult"></div>
    <p class="note center">기록은 이 폰에만 저장돼요. 설정에서 백업 파일을 내보낼 수 있어요.</p>`;
};
function obRead() {
  const v = id => parseFloat(($('#' + id).value || '').replace(',', '.'));
  const d = { age: v('obAge'), h: v('obH'), w: v('obW'), smm: v('obSmm'), pbf: v('obPbf'), bmr: v('obBmr') || null, date: $('#obDate').value || new Date().toISOString().slice(0, 10) };
  const bad = [];
  if (!(d.w >= 35 && d.w <= 200)) bad.push('체중'); if (!(d.pbf >= 3 && d.pbf <= 60)) bad.push('체지방률');
  if (!(d.smm >= 10 && d.smm <= 70)) bad.push('골격근량'); if (d.bmr && !(d.bmr >= 800 && d.bmr <= 3500)) bad.push('기초대사량');
  if (!(d.age >= 14 && d.age <= 90)) bad.push('나이');
  return { d, bad };
}
function rotFromDays(days) {
  const order = [1, 2, 3, 4, 5, 6, 0].filter(x => days.includes(x)), seq = SLOT_SEQ[Math.max(2, Math.min(7, order.length))], slots = {};
  order.forEach((d, i) => slots[d] = seq[i % seq.length]);
  return { on: true, start: mondayOf(dayKey()), slots };
}
function assignDays(days) {
  const order = [1, 2, 3, 4, 5, 6, 0].filter(x => days.includes(x)), seq = { 3: ['A', 'B', 'C'], 4: ['A', 'B', 'C', 'D'], 5: ['A', 'B', 'C', 'E', 'D'], 6: ['A', 'B', 'C', 'D', 'E', 'B'], 7: ['A', 'B', 'C', 'D', 'E', 'B', 'A'] }[order.length] || ['A', 'C'];
  const s = {}; order.forEach((d, i) => s[d] = seq[i % seq.length]); return s;
}

/* ================= HOME ================= */
R.home = () => {
  const k = dayKey(), T = targets(), S = daySum(), { left, nt, cur } = nextTarget(), P = DB.profile, names = mealNames();
  const tpl = tplFor(k), done = !!DB.done[k], m = hm(), gap = comebackGap();
  const rescueRow = RESCUE.find(r => left <= r[0]);
  const rescue = m >= 1200 && m < 1380 && left >= 20 ? `<section class="fq-card rescue stack" aria-label="단백질 구조대">
      <div class="row row--between"><span class="fq-hud" style="color:var(--fq-protein)">PROTEIN RESCUE</span><span class="fq-t-caption">23:00 전까지</span></div>
      <p class="fq-t-heading">오늘 ${left}g 모자라요. ${esc(rescueRow[1])}면 11시 전에 끝나요.</p>
      <p class="fq-t-caption">단백질 ${rescueRow[2]}g · ${rescueRow[3]}kcal · 늦은 시간이라 가볍고 단백질 밀도 높은 조합만 골랐어요.</p>
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="rescue">이걸로 기록 · +20 XP</button></section>` : '';
  const ch0 = P.chapter === 0 ? ch0Status() : null;
  const comeback = gap >= 7 && tpl && !done ? `<section class="fq-plate fq-plate--warm" aria-label="복귀">
      <div class="fq-plate__head"><span class="fq-hud">COMEBACK</span><span class="fq-badge fq-badge--xp">첫 운동 XP ×2</span></div>
      <h2 class="fq-t-title">다시 왔네요, 반가워요.<br>오늘은 가볍게 15분.</h2>
      <p class="fq-t-body" style="margin:8px 0 12px">무게는 쉰 기간만큼 자동으로 낮춰 뒀어요. 최고 연속 기록 ${DB.streak.best}일은 그대로예요.</p>
      <ol class="cb-steps"><li data-on><span class="fq-hud">1</span>오늘 · 단백질 + 15분</li><li><span class="fq-hud">2</span>정규 운동 1회</li><li><span class="fq-hud">3</span>이번 주 계획 절반</li></ol>
      <div class="stack"><button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="cond" data-c="short">15분 퀘스트 시작</button><button class="fq-btn fq-btn--ghost fq-btn--block" data-act="startQuest">평소 루틴으로</button></div></section>` : '';
  const T0 = tpl && TPL[tpl];
  const quest = comeback ? '' : !tpl ? `<section class="fq-plate" aria-label="오늘">
      <div class="fq-plate__head"><span class="fq-hud">REST DAY</span><span class="fq-hud">${DOW[dow(k)]}</span></div>
      <p class="fq-t-display" style="font-size:44px">REST</p><p class="fq-t-body" style="margin:8px 0 12px">근육은 쉬는 날 자라요. 오늘 할 일은 단백질 ${T.p}g과 걷기예요. 연속 기록은 이어져요.</p>
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="pickTpl">그래도 운동할래요</button></section>`
    : done ? `<section class="fq-plate" aria-label="오늘의 퀘스트"><div class="fq-plate__head"><span class="fq-hud">TODAY'S QUEST</span><span class="fq-hud" style="color:var(--fq-success)">CLEAR</span></div>
      <p class="fq-t-title">${T0.ko}</p><p class="fq-t-body" style="margin:8px 0 0">오늘 운동 완료. ${left > 0 ? `남은 할 일은 단백질 ${left}g이에요.` : '단백질까지 끝! 푹 쉬어요.'}</p></section>`
    : `<section class="fq-plate" aria-label="오늘의 퀘스트"><div class="fq-plate__head"><span class="fq-hud">TODAY'S QUEST</span><span class="fq-hud">${DOW[dow(k)]} · ${weekDone()}/${trainDaysPerWeek()}</span></div>
      <p class="fq-t-title" style="font-size:28px">${T0.ko}</p><p class="fq-t-caption" style="margin-top:6px">${T0.by ? `${T0.by} 루틴 · ` : '기본 V자 루틴 · '}약 ${P.sessionMin}분 · ${T0.ex.length}개 운동${DB.rot && DB.rot.on ? ` · 로테이션 ${rotWeek(k) + 1}주차` : ''}</p>
      <div class="q-list">${T0.ex.slice(0, 3).map(([id, n, o]) => { const pl = plannedFor(id, n, o && o.r); return `<div class="q-item"><span>${EX[id].n}</span><span class="fq-num">${wLabel(id, pl.w)} × ${pl.reps[0]}</span></div>`; }).join('')}<div class="q-item muted"><span>외 ${T0.ex.length - 3}개 운동</span><span></span></div></div>
      <button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="startQuest">퀘스트 시작</button></section>`;
  const q = checkDaily3();
  const dq = [['단백질 퀘스트 ' + T.p + 'g', `${Math.round(S.p)}/${T.p}`, q[0], 50],
    tpl ? ['오늘의 운동 완료 (또는 15분)', done ? '완료' : '대기', q[1], 100] : ['체중 기록', DB.weights[k] ? DB.weights[k] + 'kg' : '아침 공복에 1번', q[1], 5],
    ['완전 기록 · 먹은 것 다 적기', DB.flags['all_' + k] ? '완료' : `${new Set(dayFoods().map(f => f.slot)).size}끼 기록`, q[2], 20]];
  const L = bpLevels();
  $('#scr-home').innerHTML = `
    <header class="topbar"><span class="brand">FIT<b>QUEST</b></span><div class="row"><span class="fq-t-caption">${DOW[dow(k)]} · ${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}</span><button class="fq-btn fq-btn--icon" data-go="set" aria-label="설정">${ico('gear')}</button></div></header>
    ${hud()}
    ${ch0 ? ch0Card(ch0) : ''}
    ${comeback}
    <section class="fq-card nut" aria-label="오늘의 영양">
      <div class="row row--between"><span class="fq-eyebrow">Today · ${T.train ? '운동일' : '휴식일'} · ${CH[P.chapter].name}</span><button class="linkbtn" data-go="diet" style="min-height:0;padding:0">식단 보기</button></div>
      <div class="nut-top">${proteinRing(T, S)}</div>
      ${mealCells(T)}
      <div class="macro">
        <div class="stack"><div class="row row--between"><span class="fq-eyebrow">Kcal</span><span class="fq-t-caption">${fmt(S.k)}/${fmt(T.kcal)}</span></div><div class="bar" style="--p:${Math.min(100, S.k / T.kcal * 100)}"><i></i></div></div>
        <div class="stack"><div class="row row--between"><span class="fq-eyebrow">Carb</span><span class="fq-t-caption">${Math.round(S.c)}/${T.c}g</span></div><div class="bar" style="--p:${Math.min(100, S.c / Math.max(1, T.c) * 100)};--_c:var(--fq-text-2)"><i></i></div></div>
        <div class="stack"><div class="row row--between"><span class="fq-eyebrow">Fat</span><span class="fq-t-caption">${Math.round(S.f)}/${T.f}g</span></div><div class="bar" style="--p:${Math.min(100, S.f / T.f * 100)};--_c:var(--fq-text-2)"><i></i></div></div>
      </div>
      ${S.p < T.p * .9 ? `<div class="next"><div class="stack" style="gap:4px"><span class="fq-t-caption">다음 끼니 (${names[Math.min(cur, names.length - 1)]}) 단백질</span><span><strong>${nt}</strong> <span class="fq-unit">G</span></span></div><button class="fq-btn fq-btn--secondary" data-act="wte">뭐 먹지?</button></div>`
        : `<div class="next"><div class="stack" style="gap:4px"><span class="fq-hud" style="color:var(--fq-success)">PROTEIN CLEAR</span><span class="fq-t-caption">오늘 지은 근육에 재료가 도착했어요.</span></div><span class="fq-badge fq-badge--success">+50 XP</span></div>`}
    </section>
    ${lunchCard()}
    ${rescue}
    ${quest}
    <section class="fq-card daily" aria-label="일일 퀘스트"><div class="row row--between"><span class="fq-t-heading">일일 퀘스트</span><span class="fq-t-caption">3개 모두 +30 XP</span></div>
      <ul>${dq.map(x => `<li><span class="tick" ${x[2] ? 'data-on' : ''}>${ico('check', 'ico--16')}</span><span>${x[0]}<br><span class="fq-t-caption">${x[1]}</span></span><span class="fq-badge fq-badge--xp">+${x[3]}</span></li>`).join('')}</ul></section>
    ${photoHomeCard()}
    <section class="fq-card stack" aria-label="체중 기록"><div class="row row--between"><span class="fq-t-heading">오늘 체중</span><span class="fq-t-caption">7일 평균 ${curWeight().toFixed(1)}kg</span></div>
      <div class="row"><input id="wIn" class="inp" inputmode="decimal" placeholder="${DB.weights[k] || curWeight().toFixed(1)}" aria-label="오늘 체중 kg" style="flex:1"><button class="fq-btn fq-btn--secondary" data-act="weigh">기록 +5 XP</button></div></section>
    <section class="fq-blueprint bp-mini" aria-label="바디 설계도 요약">${blueprintSVG(L)}
      <div class="stack"><span class="fq-hud" style="color:#9FBEE7">BODY BLUEPRINT</span><span class="fq-hud" style="color:var(--fq-signal)">이번 주 설계 ${bpPct(L)}%</span>
        ${vRatio() ? `<span><span class="fq-t-display" style="font-size:44px">${vRatio().toFixed(2)}</span> <span class="fq-eyebrow" style="color:#9FBEE7">V RATIO</span></span>` : `<span class="fq-t-caption" style="color:var(--fq-ondark-2)">어깨·허리 둘레를 재면 V 비율이 열려요</span>`}
        <button class="fq-btn fq-btn--secondary" style="--_bg:#1F2547;--_fg:#F5F5F5;justify-self:start;min-height:44px" data-go="grow">설계도 열기</button></div></section>`;
};
function lunchCard() {
  if (!lunchOut() || slotAt() !== lunchIdx() || slotSum(lunchIdx())) return '';
  const top = LUNCH.slice(0, 3);
  return `<section class="fq-card stack" aria-label="점심 일반식"><div class="row row--between"><span class="fq-t-heading">점심은 일반식이죠?</span><span class="fq-t-caption">단백질 ${LUNCH_P}g 목표</span></div>
    <p class="fq-t-caption" style="margin:0">${riceTip()}. 단백질 많은 메뉴부터 골라 봤어요.</p>
    <div class="fav-row">${top.map(x => `<button class="fav" data-act="lunch" data-n="${esc(x.n)}"><b>${esc(x.n)}</b><span>단백질 ${x.p}g · ${x.k}kcal</span></button>`).join('')}<button class="fav" data-act="lunchAll"><b>다른 메뉴</b><span>백반·국밥·찌개…</span></button></div></section>`;
}
function lunchSheet(name) {
  const x = LUNCH.find(l => l.n === name), ri = LUNCH_RICE_DEFAULT();
  sheet(`<div class="row row--between"><h2 class="fq-t-title">${esc(x.n)}</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-caption" style="margin:-6px 0 0">${riceTip()}</p>
    <div class="chips" role="group" aria-label="밥 양">${RICE.map((r, i) => `<button class="fq-chip" aria-pressed="${i === ri}" data-act="lunchRice" data-n="${esc(x.n)}" data-r="${i}">${r[0]}</button>`).join('')}</div>
    <div id="lunchPrev"></div>`);
  lunchPrev(x.n, ri);
}
const LUNCH_RICE_DEFAULT = () => DB.profile.chapter === 1 ? 0 : 1;
function lunchPrev(name, ri) {
  const x = LUNCH.find(l => l.n === name), r = RICE[ri], v = { n: `${x.n}${ri === 1 ? '' : ' (' + r[0] + ')'}`, p: x.p + r[3], k: x.k + r[1], c: x.c + r[2], f: x.f }, S = daySum(), T = targets();
  $('#lunchPrev').innerHTML = `<div class="preview"><span class="fq-eyebrow">기록하면</span><span>단백질 <b>+${v.p}g</b> → ${Math.round(S.p + v.p)} / ${T.p}g</span><span class="fq-t-caption">칼로리 ${fmt(S.k)} → ${fmt(S.k + v.k)} / ${fmt(T.kcal)} · 식당마다 ±25%</span></div>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="lunchSave" data-n="${esc(name)}" data-r="${ri}">점심 기록</button>`;
  document.querySelectorAll('[data-act=lunchRice]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.r === ri));
}
function lunchAllSheet() {
  sheet(`<div class="row row--between"><h2 class="fq-t-title">오늘 점심 메뉴</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-caption" style="margin:-6px 0 0">단백질 많은 순이에요. 비슷한 메뉴를 고르면 돼요.</p>
    <div class="list">${LUNCH.map(x => `<div><button class="linkbtn" style="color:var(--fq-text);text-align:left;flex:1" data-act="lunch" data-n="${esc(x.n)}">${esc(x.n)}</button><span class="fq-t-caption">단백질 ${x.p}g · ${x.k}kcal</span></div>`).join('')}</div>`);
}
function weekDone() { const mon = mondayOf(dayKey()); return Object.keys(DB.done).filter(k => daysBetween(mon, k) >= 0).length; }
const wLabel = (id, w) => EX[id].kind === 'as' ? `보조 ${w}` : `${w}`;
const TAPE_SVG = `<svg viewBox="0 0 240 284" role="img" aria-label="어깨 둘레는 삼각근 가장 튀어나온 곳, 허리 둘레는 배꼽 높이에서 잰다는 그림" style="display:block;width:100%;max-width:260px;margin:0 auto">
  <g fill="rgba(159,190,231,.06)" stroke="rgba(159,190,231,.6)" stroke-width="1.2" stroke-linejoin="round">
    <ellipse cx="120" cy="34" rx="17" ry="21"/><path d="M111 54h18v12h-18z"/>
    <path d="M110 64 72 76Q54 82 51 102L45 168 42 222 55 224 63 170 69 128 76 150 82 198 86 252H154L158 198 164 150 171 128 177 170 185 224 198 222 195 168 189 102Q186 82 168 76L130 64Z"/>
  </g>
  <path d="M69 128Q120 150 171 128" fill="none" stroke="rgba(159,190,231,.35)"/>
  <path d="M46 100A74 11 0 0 1 194 100" fill="none" stroke="#F68D1F" stroke-width="2.5" stroke-dasharray="4 4" opacity=".7"/>
  <path d="M46 100A74 11 0 0 0 194 100" fill="none" stroke="#F68D1F" stroke-width="3.5"/>
  <path d="M82 190A38 7 0 0 1 158 190" fill="none" stroke="#9FBEE7" stroke-width="2.5" stroke-dasharray="4 4" opacity=".7"/>
  <path d="M82 190A38 7 0 0 0 158 190" fill="none" stroke="#9FBEE7" stroke-width="3.5"/>
  <circle cx="120" cy="196" r="2.4" fill="#F5F5F5"/>
  <g font-family="Pretendard Variable, sans-serif" font-size="12" font-weight="700">
    <path d="M186 95 176 48" stroke="#F68D1F"/><text x="146" y="28" fill="#F68D1F">① 어깨</text><text x="146" y="42" fill="#C8C8CC" font-weight="500" font-size="10.5">삼각근 가장 넓은 곳</text>
    <path d="M156 194 166 250" stroke="#9FBEE7"/><text x="160" y="264" fill="#9FBEE7">② 허리</text><text x="160" y="277" fill="#C8C8CC" font-weight="500" font-size="10.5">배꼽 높이</text>
  </g>
</svg>`;
const vRatio = () => { const t = DB.tape[DB.tape.length - 1]; return t ? t.sh / t.wa : null; };

/* 챕터 0 — 정직한 2주 (4-9) */
function ch0Status() {
  const P = DB.profile, start = P.chapterStart, today = dayKey(), n = Math.min(14, daysBetween(start, today) + 1);
  const days = Array.from({ length: n }, (_, i) => addDays(start, i));
  const wDays = days.filter(d => DB.weights[d]).length, fDays = days.filter(d => dayFoods(d).length >= 2).length;
  let tdee = null;
  if (daysBetween(start, today) >= 14 && wDays >= 8 && fDays >= 10) {
    const pts = days.filter(d => DB.weights[d]).map(d => [daysBetween(start, d), DB.weights[d]]);
    const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const slope = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / Math.max(1e-9, pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0));
    const fd = days.filter(d => dayFoods(d).length >= 2), intake = fd.reduce((a, d) => a + daySum(d).k, 0) / fd.length;
    tdee = Math.round(intake - slope * 7700);
  }
  return { n, wDays, fDays, tdee, ready: tdee != null };
}
function ch0Card(s) {
  const rec = recChapter(DB.profile.sex, ib().pbf);
  return `<section class="fq-plate" aria-label="정직한 2주"><div class="fq-plate__head"><span class="fq-hud">CH.0 정직한 2주</span><span class="fq-hud">D+${s.n}/14</span></div>
    ${s.ready ? `<h2 class="fq-t-title">진실의 거울</h2><p class="fq-t-body" style="margin:6px 0 12px">당신의 진짜 유지 칼로리는 <b>${fmt(s.tdee)}kcal</b>. 이제 이 숫자로 갑니다.</p><button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="ch0Done" data-t="${s.tdee}">챕터 ${rec} ${CH[rec].name} 시작 · +500 XP</button>`
      : `<p class="fq-t-body" style="margin:0 0 10px">평소처럼 먹고 <b>전부</b> 기록해요. 억지로 줄이지 않기. 14일 뒤 내 몸의 진짜 유지 칼로리가 나와요.</p>
      <div class="grid2"><div class="stack" style="gap:4px"><span class="fq-t-caption">체중 기록</span><span class="fq-t-num-md">${s.wDays}<span class="fq-unit">/8일+</span></span></div><div class="stack" style="gap:4px"><span class="fq-t-caption">식단 기록</span><span class="fq-t-num-md">${s.fDays}<span class="fq-unit">/10일+</span></span></div></div>`}
  </section>`;
}

/* ================= DIET ================= */
R.diet = () => {
  const T = targets(), S = daySum(), names = mealNames(), split = mealSplit(T.p), k = dayKey();
  $('#scr-diet').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">오늘 식단</h1><span class="fq-t-caption">${kDate(k).getMonth() + 1}월 ${kDate(k).getDate()}일 ${DOW[dow(k)]} · ${T.train ? '운동일' : '휴식일'}</span></header>
    <section class="fq-card row" style="gap:16px">${proteinRing(T, S, '120px')}
      <div class="stack" style="gap:6px"><span class="fq-t-caption">남은 단백질</span><span><span class="fq-t-num-lg" style="color:var(--fq-protein)">${Math.max(0, Math.round(T.p - S.p))}</span> <span class="fq-unit">G</span></span><span class="fq-t-caption">칼로리 ${fmt(S.k)} / ${fmt(T.kcal)}</span></div></section>
    ${names.map((n, i) => { const items = dayFoods().filter(f => f.slot === i), got = items.reduce((a, f) => a + f.p, 0), kc = items.reduce((a, f) => a + f.k, 0);
      return `<section class="fq-card mealcard" aria-label="${n}"><div class="row row--between"><span class="fq-t-heading">${n}</span><span class="fq-t-label"><span style="color:var(--fq-protein)">${Math.round(got)}</span> / ${split[i]}g · ${fmt(kc)}kcal</span></div>
        ${!items.length && i === lunchIdx() && lunchOut() ? `<button class="fq-btn fq-btn--secondary" style="justify-self:start;min-height:44px" data-act="lunchAll">점심 일반식 고르기 · 목표 ${LUNCH_P}g</button>` : ''}
        ${items.length ? `<div class="items">${items.map(f => `<div><span>${esc(f.n)}</span><span class="row" style="gap:6px"><span class="muted">${f.p}g · ${f.k}kcal</span><button class="fq-btn fq-btn--icon" style="width:36px;min-height:36px" data-act="delFood" data-id="${f.id}" aria-label="${esc(f.n)} 삭제">${ico('x', 'ico--16')}</button></span></div>`).join('')}</div>` : `<p class="fq-t-caption" style="margin:0">아직 기록 없음 · 목표 단백질 ${split[i]}g</p>`}</section>`; }).join('')}
    <div class="sec-title"><h2 class="fq-t-heading">내 단골 · 1탭 기록</h2><span class="fq-t-caption">3번 먹으면 자동 등록</span></div>
    ${favRow()}
    <button class="fq-btn fq-btn--secondary fq-btn--block fq-btn--lg" data-act="wte">뭐 먹지? · 남은 목표에 맞는 3가지</button>
    <label class="fq-card row" style="gap:12px;min-height:56px"><input type="checkbox" id="allLogged" data-act="allLogged" ${DB.flags['all_' + k] ? 'checked' : ''} style="width:24px;height:24px;accent-color:var(--fq-success)"><span><b>오늘 먹은 거 다 적었어요</b><br><span class="fq-t-caption">완전 기록일 +20 XP · 정체기 원인을 찾는 데 쓰여요</span></span></label>`;
};
function favList() {
  const cutoff = addDays(dayKey(), -30), cnt = {};
  DB.foods.filter(f => daysBetween(cutoff, f.day) >= 0).forEach(f => { const c = cnt[f.n] = cnt[f.n] || { ...f, count: 0 }; c.count++; });
  const mine = Object.values(cnt).filter(c => c.count >= 3).sort((a, b) => b.count - a.count).map(c => ({ n: c.n, p: c.p, k: c.k, c: c.c, f: c.f, mine: 1 }));
  return mine.concat(BASE_FAVS.filter(b => !mine.some(m => m.n === b.n))).slice(0, 10);
}
const favRow = () => `<div class="fav-row">${favList().map((f, i) => `<button class="fav" data-act="fav" data-i="${i}"><b>${esc(f.n)}</b><span>${f.mine ? '단골 · ' : ''}단백질 ${f.p}g · ${f.k}kcal</span></button>`).join('')}</div>`;
function addFood(x, bonusKind) {
  const k = dayKey(), slot = slotAt(), T = targets(), before = daySum().p, slotBefore = slotSum(slot), tg = Math.max(mealSplit(T.p)[slot] || 0, nextTarget().nt);
  DB.foods.push({ id: uid(), day: k, t: Date.now(), slot, n: x.n, p: Math.round(x.p), k: Math.round(x.k), c: Math.round(x.c || 0), f: Math.round(x.f || 0) });
  let xp = addXP('meal', 10);
  if (slotBefore < tg - 10 && slotBefore + x.p >= tg - 10) xp += addXP('mealhit', 10);
  const cleared = before < T.p * .9 && before + x.p >= T.p * .9;
  if (cleared) xp += addXP('protein', 50);
  if (bonusKind) xp += addXP(bonusKind, 20);
  checkDaily3(); save();
  SFX.food(); buzz(12);
  if (TAB === 'cam' || TAB === 'home') go('home'); else R[TAB] && R[TAB]();
  const n2 = nextTarget();
  toast(`<span>자재 반입 +${Math.round(x.p)}g${cleared ? ' · 단백질 클리어!' : ''}${xp ? ` · +${xp} XP` : ''}</span><span class="fq-t-caption" style="color:var(--fq-ondark-2);padding-right:12px">${n2.left > 0 ? `다음 끼니 ${n2.nt}g` : '오늘 목표 끝'}</span>`);
  showLevelUp();
}

/* ================= CAMERA / FOOD INPUT ================= */
let FR = null; // food result {photo, items:[{n,g,k,p,c,f,conf,q}], asked}
R.cam = () => {
  const names = mealNames();
  $('#scr-cam').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">음식 기록</h1><span class="fq-badge">${names[Math.min(slotAt(), names.length - 1)]} · 자동</span></header>
    <section class="shutter-area">
      <p class="fq-t-heading">사진 1장이면 끝나요</p>
      <label class="shutter" aria-label="사진 찍기 또는 고르기">${ico('camera', 'ico')}<input type="file" id="foodPhoto" accept="image/*"></label>
      <p class="fq-t-caption">${DB.settings.gkey ? 'AI가 음식·양·단백질을 추정해요. 틀리면 양만 고치면 돼요.' : '사진 AI를 쓰려면 설정에서 제미나이 키를 넣어 주세요. 지금은 글로 기록할 수 있어요.'}</p>
      <button class="fq-btn fq-btn--secondary" data-act="textIn">${ico('text')}글로 입력</button>
    </section>
    <div class="sec-title"><h2 class="fq-t-heading">내 단골 · 1탭 기록</h2></div>
    ${favRow()}
    <div id="foodResult"></div>`;
  $('#foodPhoto').addEventListener('change', onPhoto);
};
async function onPhoto(e) {
  const file = e.target.files && e.target.files[0]; if (!file) return;
  const url = URL.createObjectURL(file);
  if (!DB.settings.gkey) { FR = null; $('#foodResult').innerHTML = `<section class="fq-card stack"><div class="photo"><img src="${url}" alt="올린 음식 사진"></div><p class="note" style="margin:0">사진 AI가 꺼져 있어요. 설정 → 사진 AI에 제미나이 키를 넣으면 자동으로 읽어요.</p><button class="fq-btn fq-btn--lg fq-btn--block" data-act="textIn">글로 기록하기</button></section>`; return; }
  $('#foodResult').innerHTML = `<section class="fq-card stack"><div class="photo"><img src="${url}" alt="올린 음식 사진"></div><p class="fq-t-heading center">AI가 사진을 읽는 중…</p></section>`;
  $('#foodResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  try {
    const items = await geminiFood(file);
    if (!items.length) throw new Error('음식을 찾지 못했어요');
    FR = { photo: url, items: items.map(x => ({ ...x, q: 1 })), asked: false }; drawResult();
  } catch (err) {
    $('#foodResult').innerHTML = `<section class="fq-card stack"><div class="photo"><img src="${url}" alt="올린 음식 사진"></div><p class="note" style="margin:0">사진을 읽지 못했어요: ${esc(err.message)}. 글로 기록해 주세요.</p><button class="fq-btn fq-btn--lg fq-btn--block" data-act="textIn">글로 기록하기</button></section>`;
  }
}
function drawResult() {
  const T = targets(), S = daySum(), slot = slotAt(), names = mealNames(), slotGot = slotSum(slot), tg = Math.max(mealSplit(T.p)[slot] || 0, nextTarget().nt);
  const items = FR.items, P = items.reduce((s, x) => s + x.p * x.q, 0), K = items.reduce((s, x) => s + x.k * x.q, 0);
  const low = items.findIndex(x => x.conf <= 1);
  $('#foodResult').innerHTML = `<section class="fq-card stack" style="gap:12px" aria-label="AI 추정 결과">
    <div class="photo"><img src="${FR.photo}" alt="올린 음식 사진"></div>
    <div class="row row--between"><span class="fq-t-heading">AI 추정 · ${items.length}개 항목</span></div>
    ${!FR.asked && low >= 0 ? `<div class="preview" style="background:var(--fq-surface-2)"><span class="fq-eyebrow">확인 1개만</span><b style="color:var(--fq-text)">${esc(items[low].n)} 양이 맞나요?</b><div class="qty">${[['적게', .5], ['사진대로', 1], ['더 많이', 1.5]].map(o => `<button class="fq-chip" data-act="ask" data-i="${low}" data-q="${o[1]}">${o[0]}</button>`).join('')}</div></div>` : ''}
    <div>${items.map((x, i) => `<div class="fitem"><div class="fitem-top"><span><b>${esc(x.n)}</b><br><span class="conf">${[1, 2, 3].map(n => `<i ${n <= x.conf ? 'data-on' : ''}></i>`).join('')} 신뢰도 ${['', '낮음', '보통', '높음'][x.conf] || '보통'} · ${Math.round(x.g * x.q)}g</span></span><span class="p">${Math.round(x.p * x.q)}<span class="fq-unit" style="font-size:11px">G</span></span><span class="k">${x.conf < 3 ? `${Math.round(x.k * x.q * .9)}–${Math.round(x.k * x.q * 1.1)}` : Math.round(x.k * x.q)}<span class="fq-unit" style="font-size:11px">KCAL</span></span></div>
      <div class="qty" role="group" aria-label="${esc(x.n)} 양">${[['0', 0], ['½', .5], ['⅔', .67], ['1', 1], ['1.5', 1.5], ['2', 2]].map(q => `<button class="fq-chip" aria-pressed="${x.q === q[1]}" data-act="qty" data-i="${i}" data-q="${q[1]}">${q[0]}</button>`).join('')}</div></div>`).join('')}</div>
    <div class="preview"><span class="fq-eyebrow">저장하면</span><span>단백질 <b>+${Math.round(P)}g</b> → ${Math.round(S.p + P)} / ${T.p}g</span><span>이번 끼니 (${names[Math.min(slot, names.length - 1)]}) ${Math.round(slotGot + P)} / ${tg}g ${slotGot + P >= tg - 10 ? '· 끼니 달성 +10 XP' : ''}</span><span class="fq-t-caption">칼로리 ${fmt(S.k)} → ${fmt(S.k + K)} / ${fmt(T.kcal)}</span></div>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="saveFood">기록하기</button>
    <p class="fq-t-caption" style="margin:0">AI 추정치예요. 실제와 다를 수 있어요.</p></section>`;
}
function downscale(file, max = 1024) {
  return new Promise((res, rej) => {
    const img = new Image(); img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', .82).split(',')[1]);
    }; img.onerror = () => rej(new Error('사진을 열 수 없어요')); img.src = URL.createObjectURL(file);
  });
}
async function geminiFood(file) {
  const b64 = await downscale(file), key = DB.settings.gkey.trim();
  const prompt = '이 음식 사진을 한국 음식 기준으로 항목별로 추정해 줘. 보이는 양 그대로(1인분이라고 가정하지 말 것). JSON만 출력: {"items":[{"n":"음식 이름(한국어)","g":그램,"k":kcal,"p":단백질g,"c":탄수화물g,"f":지방g,"conf":1~3}]} conf 3=확실 2=보통 1=불확실. 음식이 아니면 {"items":[]}.';
  const models = [DB.settings.gmodel, 'gemini-2.5-flash', 'gemini-2.0-flash'].filter(Boolean);
  let lastErr = '모델을 찾지 못했어요';
  for (const m of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: 'image/jpeg', data: b64 } }, { text: prompt }] }], generationConfig: { response_mime_type: 'application/json', temperature: .2 } })
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 404) { lastErr = `${m} 없음`; continue; }
    if (!r.ok) throw new Error(r.status === 400 || r.status === 403 ? '키를 확인해 주세요' : r.status === 429 ? '무료 사용량을 넘었어요. 잠시 후 다시' : (j.error && j.error.message) || r.status);
    const txt = ((j.candidates || [])[0]?.content?.parts || []).map(p => p.text || '').join('');
    const data = JSON.parse(txt.replace(/^```json|```$/g, ''));
    const num = (v, a, b) => Math.min(b, Math.max(a, +v || 0));
    return (data.items || []).slice(0, 8).map(x => ({ n: String(x.n || '음식').slice(0, 30), g: num(x.g, 0, 2000), k: num(x.k, 0, 3000), p: num(x.p, 0, 250), c: num(x.c, 0, 400), f: num(x.f, 0, 200), conf: Math.round(num(x.conf, 1, 3)) || 2 }));
  }
  throw new Error(lastErr);
}

/* ================= WORKOUT TAB ================= */
R.work = () => {
  const k = dayKey(), tpl = tplFor(k), mon = mondayOf(k);
  const week = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = addDays(mon, i), t = tplFor(d); return { d, t, s: DB.done[d] ? 'done' : d === k ? 'today' : t ? '' : 'rest' }; });
  const ws = weekSets();
  $('#scr-work').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">운동</h1><button class="linkbtn" data-act="schedule">${DB.rot && DB.rot.on ? `로테이션 ${rotWeek(k) + 1}주차 · 바꾸기` : '요일 바꾸기'}</button></header>
    ${roleStrip()}
    <ol class="week" aria-label="이번 주 루틴">${week.map(w => `<li class="day" data-s="${w.s}" aria-label="${DOW[dow(w.d)]}요일, ${w.t ? TPL[w.t].code : '휴식'}"><small>${DOW[dow(w.d)]}</small>${w.t ? `<b>${TPL[w.t].code.replace('·', '<br>')}</b>` : ico('moon', 'ico--16')}</li>`).join('')}</ol>
    <section class="fq-card stack" style="gap:6px"><div class="row row--between"><span class="fq-t-heading">이번 주 우선 부위</span><span class="fq-t-caption">완료 / 목표 세트</span></div>
      ${[['측면 삼각근', 'delt-side'], ['광배근', 'lats'], ['윗가슴', 'chest-upper']].map(p => `<div class="stack" style="gap:4px"><div class="row row--between"><span class="fq-t-label">${p[0]}</span><span class="fq-t-caption">${ws[p[1]] || 0}/${BP_T[p[1]]}</span></div><div class="bar" style="--p:${Math.min(100, (ws[p[1]] || 0) / BP_T[p[1]] * 100)};--_c:var(--fq-sky)"><i></i></div></div>`).join('')}</section>
    ${tpl ? `<div class="sec-title"><h2 class="fq-t-heading">오늘 · ${TPL[tpl].ko}</h2><span class="fq-t-caption">약 ${DB.profile.sessionMin}분</span></div>
      ${DB.done[k] ? '<p class="fq-badge fq-badge--success" style="justify-self:start">오늘 완료</p>' : `<button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="startQuest">퀘스트 시작</button>${DB.flags['pp_' + mon] ? '' : '<button class="linkbtn" data-act="postpone" style="justify-self:center;margin-top:-8px">내일로 미루기 (주 1회)</button>'}`}
      ${TPL[tpl].by ? `<a class="src" href="${TPL[tpl].video}" target="_blank" rel="noopener">${ico('ext', 'ico--16')}<span>${esc(TPL[tpl].by)} 원본 영상 · 운동별 팁도 이 영상에서 가져왔어요</span></a>` : ''}
      ${TPL[tpl].ex.map(([id, n, o]) => exCard(id, n, o, tpl)).join('')}`
    : `<section class="fq-card stack"><span class="fq-t-heading">오늘은 휴식일</span><span class="fq-t-caption">걷기 7천 보면 충분해요. 그래도 하고 싶으면 루틴을 골라요.</span><button class="fq-btn fq-btn--secondary fq-btn--block" data-act="pickTpl">루틴 골라서 운동하기</button></section>`}
    ${proSection(tpl)}`;
};
const PART_KO = { back: '등', chest: '가슴', shoulder: '어깨', arms: '팔', legs: '하체' };
let proAll = false;
function roleStrip() {
  const mine = (DB.profile.creators || []).map(id => CREATORS.find(c => c.id === id)).filter(Boolean);
  return `<section class="fq-card stack" style="gap:8px" aria-label="롤모델"><div class="row row--between"><span class="fq-t-heading">내 롤모델</span><button class="linkbtn" style="min-height:0;padding:0" data-act="crPick">바꾸기</button></div>
    ${mine.length ? `<div class="fav-row">${mine.map(c => `<button class="fav" data-act="crCard" data-v="${c.id}"><b>${c.name}</b><span>${c.tag} · 스타일 보기</span></button>`).join('')}</div>` : '<p class="note" style="margin:0">되고 싶은 몸의 유튜버를 고르면 그 사람 루틴이 더 자주 들어와요.</p>'}</section>`;
}
function crCard(id) {
  const c = CREATORS.find(x => x.id === id);
  sheet(`<div class="row row--between"><span class="fq-badge">${c.tag}</span><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <h2 class="fq-t-title">${c.name} 스타일</h2><p class="fq-t-caption" style="margin:-6px 0 0">${c.body} · 영상 ${c.videos}개 분석</p>
    <section class="fq-card stack"><span class="fq-eyebrow">운동 방식</span>${c.style.map(t => `<span class="fq-t-body" style="font-size:15px">· ${esc(t)}</span>`).join('')}</section>
    <section class="fq-card stack"><span class="fq-eyebrow">식단 방식</span>${c.diet.map(t => `<span class="fq-t-body" style="font-size:15px">· ${esc(t)}</span>`).join('')}<span class="fq-t-caption">숫자 목표는 내 인바디 기준으로 앱이 계산해요.</span></section>
    <section class="fq-card stack"><span class="fq-eyebrow">내 로테이션에 들어가는 루틴</span>${c.tpls.map(t => `<button class="linkbtn" style="color:var(--fq-text);text-align:left;min-height:44px" data-act="proGo" data-t="${t}">${esc(TPL[t].ko)} · 지금 하기</button>`).join('')}</section>
    <a class="src" href="https://www.youtube.com/${c.ch}" target="_blank" rel="noopener">${ico('ext', 'ico--16')}<span>${c.name} 채널 · 루틴 출처</span></a>`);
}
function crPickSheet() {
  const cur = DB.profile.creators || [];
  sheet(`<div class="row row--between"><h2 class="fq-t-title">되고 싶은 몸</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-caption" style="margin:-6px 0 0">고른 사람의 루틴이 매주 로테이션에 더 자주 들어와요.</p>
    ${CREATORS.map(c => `<button class="pro-card" data-act="crToggle" data-v="${c.id}" aria-pressed="${cur.includes(c.id)}" style="${cur.includes(c.id) ? 'box-shadow:inset 0 0 0 2px var(--fq-text)' : ''}"><div class="who"><span class="fq-badge">${c.name}</span><span class="fq-t-caption">${cur.includes(c.id) ? '선택됨' : c.tag}</span></div><span class="fq-t-body" style="font-size:15px">${c.body}</span></button>`).join('')}
    <p class="note" style="margin:0">새 유튜버 추가(영상 링크로 학습)는 곧 열려요.</p>`);
}
function proSection(tpl) {
  const want = tpl ? TPL_PARTS[tpl] : null, card = (r, i) => `<button class="pro-card" data-act="pro" data-i="${i}"><div class="who"><span class="fq-badge">${esc(r.creator)}</span><span class="fq-t-caption">${esc(r.meta || '')}</span></div><h4>${esc(r.title)}</h4><span class="fq-t-caption">${esc(r.sub || '')}</span></button>`;
  const idx = ROUTINES.map((r, i) => i), mine = want ? idx.filter(i => ROUTINES[i].parts.some(p => want.includes(p))) : [], rest = idx.filter(i => !mine.includes(i));
  return `<div class="sec-title"><h2 class="fq-t-heading">프로 루틴 공략서</h2><span class="fq-t-caption">${want ? `오늘 부위 · ${want.map(p => PART_KO[p]).join('·')}` : '부위별'}</span></div>
    ${mine.length ? `<div class="pro">${mine.map(i => card(ROUTINES[i], i)).join('')}</div>` : want ? '<p class="note" style="margin:0">오늘 부위에 맞는 공략서가 아직 없어요.</p>' : ''}
    ${proAll || !want ? `<div class="pro">${(want ? rest : idx).map(i => card(ROUTINES[i], i)).join('')}</div>${want ? '<button class="linkbtn" data-act="proAll" style="justify-self:center">접기</button>' : ''}` : `<button class="linkbtn" data-act="proAll" style="justify-self:center">다른 부위 공략서 보기 (${rest.length})</button>`}`;
}
function exCard(id, n, o = {}, tk = '') {
  const E = EX[id], st = prog(id), rg = o.r || E.range, pl = plannedFor(id, n, rg), [bt, why] = badgeFor(id);
  const bcls = /KG/.test(bt) && !/DELOAD/.test(bt) ? 'fq-badge--signal' : '';
  return `<article class="fq-card ex">
    <div class="ex-head"><button class="ex-thumb" data-act="howtoId" data-id="${id}" data-t="${tk}" aria-label="${E.n} 동작 보기">${howto(id)}</button><div style="flex:1;min-width:0"><h3 class="fq-t-heading">${E.n}</h3><span class="fq-t-caption">${E.eq} · ${n}세트 · ${rg[0]}–${rg[1]}회${o.d ? ' (앱 기본값)' : ''}</span></div><span class="fq-badge ${bcls}">${bt}</span></div>
    <div class="ex-cmp"><div class="last"><span class="fq-eyebrow">Last</span><span class="fq-t-num-md">${st.n ? lastStr(id) : '—'}</span></div>
    <div class="today"><span class="fq-eyebrow">Today</span><span class="v"><span class="fq-t-num-lg" style="font-size:48px">${wLabel(id, pl.w)}</span><span class="fq-unit">KG</span><span class="fq-t-num-md">× ${pl.reps.join('/')}</span></span></div></div>
    <span class="fq-t-caption">${pl.gap > 10 ? `${pl.gap}일 쉬어서 무게를 낮췄어요` : why}</span>${o.tip && tk ? `<span class="fq-t-caption" style="color:var(--fq-text)"><b>${esc(TPL[tk].by)}</b> · ${esc(o.tip)}</span>` : ''}</article>`;
}
function lastStr(id) {
  for (let i = DB.sessions.length - 1; i >= 0; i--) { const e = DB.sessions[i].ex.find(x => x.id === id); if (e && e.sets.length) return `${wLabel(id, e.sets[0].w)} × ${e.sets.map(s => s.r).join('/')}`; }
  return '—';
}
const howto = id => `<div class="howto" role="img" aria-label="${esc(EX[id].n)} 시작 자세와 끝 자세"><img src="media/${EX[id].img}_0.jpg" alt="" loading="lazy"><img src="media/${EX[id].img}_1.jpg" alt="" loading="lazy"><span class="lbl"></span></div>`;
function howSheet(id, o = {}) {
  const E = { ...EX[id], v: o.v || EX[id].v, range: o.range || EX[id].range }, tip = o.tip || TIPS[id];
  sheet(`<div class="row row--between"><h2 class="fq-t-title">${E.n}</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    ${howto(id)}<p class="fq-t-caption" style="margin:-4px 0 0">시작 ↔ 끝 자세 · 사진 free-exercise-db (퍼블릭 도메인)</p>
    <section class="fq-card stack"><span class="fq-eyebrow">세팅</span><span class="fq-t-body" style="font-size:15px">${E.eq} · 목표 ${E.range[0]}–${E.range[1]}회 · 휴식 ${E.rest}초</span>${tip ? `<span class="fq-eyebrow" style="margin-top:6px">${esc(tip.who)} 팁</span><span class="fq-t-body" style="font-size:15px">${esc(tip.t)}</span>` : ''}</section>
    ${E.v ? `<a class="vlink" href="${E.v.u}" target="_blank" rel="noopener">${ico('ext', 'ico--16')}프로 영상에서 보기 · ${esc(E.v.who)} ${E.v.t !== '00:00' ? E.v.t : ''}</a><p class="fq-t-caption center" style="margin:-6px 0 0">${esc(E.v.label)}${E.v.t !== '00:00' ? ' · 그 운동 장면부터 재생돼요' : ''}</p>` : ''}`);
}

/* ================= LOGGER ================= */
let W = null;
function condSheet(tplKey) {
  sheet(`<h2 class="fq-t-title">오늘 컨디션은요?</h2><p class="fq-t-caption" style="margin:-6px 0 0">고르면 바로 첫 세트예요. 줄여도 끝까지 하면 똑같이 완료예요.</p>
  <div class="cond">
    <button data-act="cond" data-c="good" data-t="${tplKey || ''}"><b>쌩쌩</b><span>계획 그대로 + 어깨 보너스 1세트</span></button>
    <button data-act="cond" data-c="normal" data-t="${tplKey || ''}"><b>보통</b><span>계획 그대로</span></button>
    <button data-act="cond" data-c="tired" data-t="${tplKey || ''}"><b>지침</b><span>운동마다 1세트 줄임 · 무게는 유지</span></button>
    <button data-act="cond" data-c="short" data-t="${tplKey || ''}"><b>15분만</b><span>메인 1개 + 사이드 레이즈 · 연속 기록 인정</span></button>
  </div>`);
}
function buildSession(c, tplKey) {
  const k = dayKey(), t = tplKey || tplFor(k) || 'A';
  const by = TPL[t].by;
  let ex = TPL[t].ex.map(([id, n, o = {}]) => { const range = o.r || EX[id].range, pl = plannedFor(id, n, range); return { id, n, range, rest: EX[id].rest, tip: o.tip ? { who: by, t: o.tip } : null, v: o.t || null, d: !!o.d, sets: pl.reps.map(r => ({ w: pl.w, r, done: false })) }; });
  if (c === 'tired') ex = ex.slice(0, Math.max(2, ex.length - 1)).map(e => ({ ...e, sets: e.sets.slice(0, Math.max(2, e.sets.length - 1)) }));
  if (c === 'short') { const side = ex.find(e => EX[e.id].mus.includes('delt-side')) || (() => { const pl = plannedFor('slr', 3); return { id: 'slr', n: 3, rest: 75, sets: pl.reps.map(r => ({ w: pl.w, r, done: false })) }; })(); ex = [ex[0], side].filter((e, i, a) => a.indexOf(e) === i).map(e => ({ ...e, rest: 75, sets: e.sets.slice(0, 3) })); }
  if (c === 'good') { const s = ex.find(e => EX[e.id].mus.includes('delt-side')); if (s) { const l = s.sets[s.sets.length - 1]; s.sets.push({ w: l.w, r: l.r, done: false, bonus: true }); } }
  const best = {}; ex.forEach(e => best[e.id] = prog(e.id).best || 0);
  W = { c, tpl: t, ex, i: 0, combo: 0, xp: 0, prs: 0, prList: [], t0: Date.now(), rest: null, feel: false, best, log: [], feels: {}, comeback: comebackGap() >= 7 };
  addXP('cond', 5); save();
}
function curSet() { const e = W.ex[W.i]; return { e, k: e.sets.findIndex(s => !s.done) }; }
R.logger = () => {
  const { e, k } = curSet(), E = EX[e.id];
  const done = W.ex.reduce((s, x) => s + x.sets.filter(y => y.done).length, 0), total = W.ex.reduce((s, x) => s + x.sets.length, 0);
  const s = k >= 0 ? e.sets[k] : null, tip = e.tip || TIPS[e.id], st = prog(e.id), last = st.n ? lastStr(e.id) : null, rg = e.range || E.range, vv = e.v || E.v;
  $('#scr-logger').innerHTML = `
    <div>
      <div class="lg-top">
        <div class="row row--between"><button class="fq-btn fq-btn--icon" data-act="endAsk" aria-label="운동 끝내기">${ico('x')}</button><span class="fq-hud muted">EX ${W.i + 1}/${W.ex.length} · ${done}/${total} SETS · <span id="clock">00:00</span></span><span class="fq-combo" id="combo" ${W.combo >= 5 ? 'data-hot' : ''}>COMBO <b>×${W.combo}</b></span></div>
        <h1 class="lg-name">${E.n}</h1>
        <div class="lg-meta">${E.mus.some(m => ['delt-side', 'lats', 'chest-upper'].includes(m)) ? `<span class="fq-badge fq-badge--signal">V자 우선</span>` : ''}<span class="fq-t-caption">${E.eq} · 목표 ${rg[0]}–${rg[1]}회${e.d ? ' (앱 기본값)' : ''} · 휴식 ${e.rest}초${last ? ` · 지난번 ${last}` : ''}</span></div>
        <button class="demo-row" data-act="howtoEx" data-i="${W.i}">${howto(e.id)}<span class="stack" style="gap:2px"><b style="font-size:15px">동작 보기</b><span class="fq-t-caption">사진${vv ? ` · ${esc(vv.who)} 영상 ${vv.t !== '00:00' ? vv.t : ''}` : ''}</span></span>${ico('chev')}</button>
      </div>
      <div class="lg-sets" role="list">${e.sets.map((x, j) => { const stt = x.done ? 'done' : j === k ? 'active' : 'wait';
        return `<div class="fq-set-row" role="listitem" data-state="${stt}" ${x.pr ? 'data-pr' : ''}><span class="fq-set-row__idx">${x.bonus ? 'B' : 'S' + (j + 1)}</span><span class="set-load"><span class="fq-set-row__load">${wLabel(e.id, x.w)} × ${x.r}</span>${x.pr ? '<span class="fq-badge fq-badge--pr fq-pr-stamp">PR</span>' : ''}</span>
        <button class="fq-set-row__check" aria-pressed="${x.done}" aria-label="${j + 1}세트 ${x.done ? '완료됨, 되돌리기' : '완료'}, ${x.w}킬로그램 ${x.r}회" data-act="${x.done ? 'undoSet' : 'setDone'}" data-j="${j}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button></div>`; }).join('')}</div>
      ${W.feel ? `<div class="feel fq-card"><span class="fq-t-heading">${E.n} 끝! 어땠어요?</span><span class="fq-t-caption">다음 무게를 정하는 데 써요.</span><div class="chips">${['쉬웠다', '딱 좋다', '한계'].map(f => `<button class="fq-chip" data-act="feel" data-f="${f}">${f}</button>`).join('')}</div></div>` : ''}
      ${tip ? `<div class="tip"><span class="fq-eyebrow">${esc(tip.who)} 팁</span><span>${esc(tip.t)}</span></div>` : ''}
      <div class="row" style="margin:12px 16px 0;gap:8px;flex-wrap:wrap"><button class="fq-chip" data-act="pain">${ico('alert', 'ico--16')}통증</button><button class="fq-chip" data-act="skip">건너뛰기</button></div>
      <div style="height:16px"></div>
    </div><div></div>
    <div class="dock"><div class="dock-toast" id="dockToast"></div>
      ${W.rest ? restPanel() : ''}
      ${s ? `<div class="steppers">
        <div class="stp" aria-label="무게"><button data-act="w-" aria-label="무게 줄이기">${ico('minus')}</button><output><b>${s.w}</b><span class="fq-unit">${E.kind === 'as' ? '보조 KG' : 'KG'}</span></output><button data-act="w+" aria-label="무게 늘리기">${ico('plus')}</button></div>
        <div class="stp" aria-label="횟수"><button data-act="r-" aria-label="1회 줄이기">${ico('minus')}</button><output><b>${s.r}</b><span class="fq-unit">REPS</span></output><button data-act="r+" aria-label="1회 늘리기">${ico('plus')}</button></div></div>
      <button class="fq-btn fq-btn--xl fq-btn--signal fq-btn--block btn-done" data-act="setDone" data-j="${k}"><span>${k === e.sets.length - 1 && W.i === W.ex.length - 1 ? 'FINAL SET · ' : ''}SET ${k + 1} 완료</span><span class="pop-layer" id="popl"></span></button>`
      : `<button class="fq-btn fq-btn--xl fq-btn--signal fq-btn--block btn-done" data-act="${W.i < W.ex.length - 1 ? 'nextEx' : 'finish'}">${W.i < W.ex.length - 1 ? '다음 운동 · ' + EX[W.ex[W.i + 1].id].n : '운동 완료'}</button>`}
    </div>`;
  tickClock();
};
function restPanel() {
  const el = (Date.now() - W.rest.t0) / 1000, left = Math.max(0, Math.ceil(W.rest.len - el)), p = Math.min(100, el / W.rest.len * 100), ready = left === 0, nx = curSet();
  return `<div class="rest fq-halftone" id="rest" ${ready ? 'data-ready' : ''}>
    <div class="rest-top"><span class="fq-hud" style="color:#9FBEE7" id="restL">${ready ? 'READY' : `REST · CHARGING ${Math.round(p)}%`}</span><span class="t" id="restT">${pad(Math.floor(left / 60))}:${pad(left % 60)}</span></div>
    <div class="fq-xp fq-charge" id="charge" ${ready ? 'data-ready' : ''} role="progressbar" aria-label="휴식 충전" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(p)}" style="--p:${p}"><div class="fq-xp__fill"></div></div>
    <div class="rest-ctl"><button class="fq-chip" data-act="rest-">−15초</button><button class="fq-chip" data-act="rest+">+15초</button><span class="fq-t-caption" style="color:var(--fq-ondark-2);margin-left:auto">다음 · ${nx.k >= 0 ? `${nx.e.sets[nx.k].w}KG × ${nx.e.sets[nx.k].r}` : '다음 운동'}</span></div></div>`;
}
let clockT = null, wakeLock = null;
async function keepAwake(on) { try { if (on && 'wakeLock' in navigator && !wakeLock) wakeLock = await navigator.wakeLock.request('screen'); if (!on && wakeLock) { wakeLock.release(); wakeLock = null; } } catch (e) {} }
function tickClock() {
  clearInterval(clockT);
  clockT = setInterval(() => {
    if (TAB !== 'logger' || !W) return clearInterval(clockT);
    const s = Math.floor((Date.now() - W.t0) / 1000), c = $('#clock'); if (c) c.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
    if (W.rest) {
      const el = (Date.now() - W.rest.t0) / 1000, left = Math.max(0, Math.ceil(W.rest.len - el)), t = $('#restT'), ch = $('#charge'), box = $('#rest');
      if (t) t.textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)}`;
      if (ch) ch.style.setProperty('--p', Math.min(100, el / W.rest.len * 100));
      const rl = $('#restL'); if (rl && left > 0) rl.textContent = `REST · CHARGING ${Math.round(Math.min(100, el / W.rest.len * 100))}%`;
      if (left === 0 && box && !box.hasAttribute('data-ready')) { box.setAttribute('data-ready', ''); ch.setAttribute('data-ready', ''); rl.textContent = 'READY'; buzz([30, 60, 30]); SFX.ready(); }
      if (left === 10 && !W.rest.warned) { W.rest.warned = true; buzz(15); }
    }
  }, 250);
}
function setDone(j) {
  const e = W.ex[W.i], s = e.sets[j]; if (!s || s.done) return;
  s.done = true; W.combo++;
  let gain = addXP('set', 3) ; const prevBest = W.best[e.id], v = e1(s.w, s.r);
  if (EX[e.id].kind !== 'as' && prevBest > 0 && v > prevBest + .01 && !s.bonus && W.prs < 3) { s.pr = true; W.best[e.id] = v; W.prs++; W.prList.push(`${EX[e.id].n} ${s.w}KG × ${s.r}`); gain += 50; DB.xp += 50; }
  else if (EX[e.id].kind !== 'as' && v > (W.best[e.id] || 0)) W.best[e.id] = v;
  const comboBonus = W.combo % 5 === 0; if (comboBonus) { gain += 10; DB.xp += 10; }
  W.xp += gain; W.log.push({ i: W.i, j, gain, pr: !!s.pr, prevBest });
  if (s.pr) SFX.pr(); else if (comboBonus) SFX.combo(); else SFX.set();
  buzz(s.pr ? [20, 40, 20] : 12);
  const allDone = e.sets.every(x => x.done);
  W.rest = allDone ? null : { t0: Date.now(), len: e.rest }; if (allDone) W.feel = true;
  save(); R.logger();
  const c = $('#combo'); c && c.setAttribute('data-bump', '');
  const pl = $('#popl') || $('.dock'); if (pl) { const d = document.createElement('span'); d.className = 'xpfly'; d.textContent = `+${gain} XP${comboBonus ? ' · COMBO' : ''}`; pl.appendChild(d); setTimeout(() => d.remove(), 900); }
  say(`${j + 1}세트 완료, 플러스 ${gain} XP, 콤보 ${W.combo}`);
  toast(`<span>${s.pr ? '새 기록 · ' : ''}SET ${j + 1} · ${s.w}KG × ${s.r}</span><button data-act="undoSet" data-j="${j}">${ico('undo', 'ico--16')} 되돌리기</button>`, 5000);
}
function undoSet(j) {
  const e = W.ex[W.i], s = e.sets[j]; if (!s || !s.done) return;
  const li = W.log.map((l, n) => l.i === W.i && l.j === j ? n : -1).filter(n => n >= 0).pop(), last = W.log[li];
  s.done = false; s.pr = false; W.combo = Math.max(0, W.combo - 1);
  if (last) { W.xp -= last.gain; DB.xp = Math.max(0, DB.xp - last.gain); const dd = DB.xpDay[dayKey()]; if (dd && dd.set) dd.set--; if (last.pr) { W.best[e.id] = last.prevBest; W.prs--; W.prList.pop(); } W.log.splice(li, 1); }
  W.rest = null; W.feel = false; SFX.undo(); save(); R.logger();
}
function finish() {
  if (!W) return;
  const k = dayKey(), done = W.ex.reduce((s, x) => s + x.sets.filter(y => y.done).length, 0), total = W.ex.reduce((s, x) => s + x.sets.length, 0);
  const completed = done > 0 && done / total >= .8, L0 = levelOf(DB.xp - W.xp);
  let bonus = 0;
  if (completed) bonus += addXP('workout', W.c === 'short' ? 60 : 100);
  if (completed && W.comeback) { bonus += W.xp + bonus; DB.xp += W.xp; }
  W.xp += bonus;
  W.ex.forEach(e => { const d = e.sets.filter(s => s.done); if (d.length) { applyProgress(e.id, d.map(s => ({ w: s.w, r: s.r })), e.sets.filter(s => !s.bonus).length, W.feels[e.id], e.range); const st = prog(e.id); st.best = Math.max(st.best || 0, ...d.map(s => EX[e.id].kind === 'as' ? 0 : e1(s.w, s.r))); } });
  if (done) DB.sessions.push({ id: uid(), day: k, tpl: W.tpl, cond: W.c, t0: W.t0, t1: Date.now(), xp: W.xp, prs: W.prList, complete: completed, ex: W.ex.map(e => ({ id: e.id, sets: e.sets.filter(s => s.done).map(s => ({ w: s.w, r: s.r, pr: !!s.pr })) })).filter(e => e.sets.length) });
  if (completed) DB.done[k] = true;
  checkDaily3(); save();
  const L1 = levelOf(DB.xp), gain = [...new Set(W.ex.filter(e => e.sets.some(s => s.done)).flatMap(e => EX[e.id].mus))];
  const mins = Math.max(1, Math.round((Date.now() - W.t0) / 60000)), { left } = nextTarget(), prs = W.prList, xp = W.xp, short = W.c === 'short', tired = W.c === 'tired';
  clearInterval(clockT); keepAwake(false); W = null;
  go('sum');
  const next = (() => { for (let i = 1; i <= 7; i++) { const d = addDays(k, i), t = tplFor(d); if (t) return `${DOW[dow(d)]}요일 ${TPL[t].code} · ${TPL[t].ex.map(([id]) => EX[id].n).join(' · ')}`; } return '다음 운동 계획 없음'; })();
  const Lb = bpLevels();
  $('#scr-sum').innerHTML = `
    <section class="sum-hero fq-halftone"><span class="fq-hud" style="color:#9FBEE7">${completed ? (short ? '15 MIN QUEST CLEAR' : 'QUEST CLEAR') : 'SAVED'}</span>
      <span class="sum-xp" id="sumxp">+0</span><span class="fq-hud" style="color:#ECAB37">XP</span>
      <div style="width:min(80%,280px)" class="stack"><div class="fq-xp" id="sumbar" style="--p:0"><div class="fq-xp__fill"></div></div><span class="fq-hud" style="color:var(--fq-ondark-2)" id="sumlv">LV ${L0}</span></div>
      <p style="margin:0;color:#F5F5F5;font-weight:700">${tired && completed ? '줄인 계획을 끝냈어요. 똑같이 완료예요.' : completed ? '오늘의 벽돌을 다 쌓았어요.' : done ? '기록한 만큼 저장했어요.' : '기록한 세트가 없어요.'}</p></section>
    <div class="sum-grid"><div class="fq-card"><span class="fq-eyebrow">Sets</span><span class="fq-t-num-lg">${done}</span></div><div class="fq-card"><span class="fq-eyebrow">Time</span><span class="fq-t-num-lg">${mins}<span class="fq-unit">분</span></span></div><div class="fq-card"><span class="fq-eyebrow">PR</span><span class="fq-t-num-lg" style="color:var(--fq-pr-text)">${prs.length}</span></div></div>
    ${prs.length ? `<section class="fq-card list">${prs.map(p => `<div><span>${esc(p)}</span><span class="fq-badge fq-badge--pr">PR</span></div>`).join('')}</section>` : ''}
    <section class="fq-blueprint stack" style="gap:10px"><div class="row row--between"><span class="fq-hud" style="color:#9FBEE7">BODY BLUEPRINT</span><span class="fq-hud" style="color:var(--fq-signal)">이번 주 ${bpPct(Lb)}%</span></div>
      <div style="max-width:220px;margin:0 auto;width:100%">${blueprintSVG(Lb, gain)}</div><p class="fq-t-caption center" style="color:var(--fq-ondark-2);margin:0">오늘 운동한 부위가 반짝여요</p></section>
    ${left > 0 ? `<section class="fq-card row row--between"><div class="stack" style="gap:4px"><span class="fq-t-caption">운동 끝. 이제 단백질</span><span><span class="fq-t-num-lg" style="color:var(--fq-protein)">${left}</span> <span class="fq-unit">G 남음</span></span></div><button class="fq-btn fq-btn--secondary" data-act="wte">뭐 먹지?</button></section>` : ''}
    <section class="fq-card stack"><span class="fq-eyebrow">Next</span><span class="fq-t-body">${next}</span></section>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-go="home">홈으로</button>`;
  const el = $('#sumxp'), t0 = performance.now(), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = t => { const q = reduce ? 1 : Math.min(1, (t - t0) / 900); el.textContent = '+' + fmt(xp * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(step); else after(); };
  requestAnimationFrame(step);
  if (completed) SFX.start();
  function after() {
    const bar = $('#sumbar'); if (!bar) return;
    const P = () => Math.round((DB.xp - cum(L1)) / (cum(L1 + 1) - cum(L1)) * 100);
    if (L1 > L0) { bar.style.setProperty('--p', 100); if (!pendingLevel) pendingLevel = L1; setTimeout(() => { showLevelUp(); $('#sumlv').textContent = 'LV ' + L1; bar.style.setProperty('--p', P()); }, 450); }
    else bar.style.setProperty('--p', P());
  }
}

/* ================= GROWTH ================= */
R.grow = () => {
  const P = DB.profile, L = levelOf(DB.xp), b = ib(), first = DB.inbody[0], Lb = bpLevels(), v = vRatio(), v0 = DB.tape[0] ? DB.tape[0].sh / DB.tape[0].wa : null;
  const goalBF = P.sex === 'F' ? 23 : 15, hp = first.pbf > goalBF ? Math.max(0, Math.min(100, Math.round((b.pbf - goalBF) / (first.pbf - goalBF) * 100))) : 0;
  const d = (a, c, good) => { const x = +(a - c).toFixed(1); return x === 0 ? '<span class="delta">변화 없음</span>' : `<span class="delta" ${good(x) ? 'data-good' : ''}>${x > 0 ? '▲' : '▼'} ${Math.abs(x)}</span>`; };
  const prevIb = DB.inbody[DB.inbody.length - 2];
  const cumSets = m => DB.sessions.reduce((a, s) => a + s.ex.filter(e => EX[e.id].mus.includes(m)).reduce((x, e) => x + e.sets.length, 0), 0);
  const ach = [
    ['첫 자재 반입', DB.foods.length >= 1], ['첫 벽돌', DB.sessions.length >= 1], ['첫 신기록', DB.sessions.some(s => s.prs.length)],
    ['진실의 거울', !!DB.flags.tdee, 'epic'], ['일주일 개근', DB.streak.best >= 7 || streakNow() >= 7, 'rare'], ['한 달의 약속', [Math.max(DB.streak.best, streakNow()), 30]],
    ['어깨 공사 착공', [cumSets('delt-side'), 100]], ['날개 펴기', [cumSets('lats'), 100]], ['백일', [Math.max(DB.streak.best, streakNow()), 100]], ['첫 몸 기록', PHOTOS.length > 0], ['12주 타임랩스', [new Set(PHOTOS.map(p => weekOf(p.date))).size, 12]]
  ];
  $('#scr-grow').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">성장</h1><span class="fq-badge">LV ${L} · ${titleOf(L)}</span></header>
    <section class="fq-plate" aria-label="챕터 지도"><div class="fq-plate__head"><span class="fq-hud">WORLD MAP</span><span class="fq-hud">CH.${P.chapter} · ${chapterWeek()}</span></div>
      <div class="chmap">${CH.map((c, i) => `<div class="ch" data-s="${i < P.chapter || (i === 0 && DB.flags.tdee) ? 'done' : i === P.chapter ? 'now' : ''}"><span class="node">${i}</span><b>${c.name}</b><small>${c.sub.replace(' ', '<br>')}</small></div>`).join('')}</div>
      ${P.chapter === 1 ? `<div class="boss"><div class="row row--between"><span class="fq-hud">BOSS · ${CH[1].boss}</span><span class="fq-hud" style="color:var(--fq-levelup-text)">목표 ${goalBF}%</span></div><div class="hp" role="meter" aria-label="보스 체력" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${hp}"><i style="--p:${hp}"></i></div><span class="fq-t-caption">체지방 ${first.pbf}% → ${b.pbf}% · 4주마다 인바디로 판정</span></div>` : ''}
      <button class="fq-btn fq-btn--secondary fq-btn--block" style="margin-top:12px" data-act="chapter">챕터 바꾸기</button></section>
    <section class="fq-card stack" style="gap:12px" aria-label="인바디"><div class="row row--between"><span class="fq-t-heading">인바디 · ${b.date}</span><button class="linkbtn" data-act="inbody" style="min-height:0;padding:0">+ 새 측정</button></div>
      <div class="inb"><div><span class="fq-t-caption">체중</span><span class="fq-t-num-lg">${b.w}</span>${prevIb ? d(b.w, prevIb.w, () => false) : ''}</div><div><span class="fq-t-caption">골격근량</span><span class="fq-t-num-lg">${b.smm}</span>${prevIb ? d(b.smm, prevIb.smm, x => x > 0) : ''}</div><div><span class="fq-t-caption">체지방률</span><span class="fq-t-num-lg">${b.pbf}</span>${prevIb ? d(b.pbf, prevIb.pbf, x => x < 0) : ''}</div></div>
      <p class="note" style="margin:0">측정은 공복·화장실 후·운동 전에. 조건이 매번 같아야 비교가 정확해요 (±1%는 오차).</p></section>
    <section class="fq-blueprint stack" style="gap:12px" aria-label="바디 설계도"><div class="row row--between"><span class="fq-hud" style="color:#9FBEE7">BODY BLUEPRINT</span><span class="fq-hud" style="color:var(--fq-signal)">이번 주 ${bpPct(Lb)}%</span></div>
      <div style="max-width:260px;margin:0 auto;width:100%">${blueprintSVG(Lb)}</div>
      ${v ? `${DB.tape.length ? `<div class="fq-dim">어깨 ${DB.tape[DB.tape.length - 1].sh}CM</div>` : ''}<div class="fq-vgauge" style="--v:${v.toFixed(2)};--start:${(v0 || v).toFixed(2)};--goal:1.6"><div class="row row--between" style="align-items:flex-end"><span><span class="fq-t-display" style="font-size:56px">${v.toFixed(2)}</span> <span class="fq-eyebrow" style="color:#9FBEE7">V RATIO</span></span><span class="fq-hud" style="color:var(--fq-signal)">GOAL 1.60</span></div>
        <div class="fq-vgauge__scale" role="meter" aria-valuemin="1.2" aria-valuemax="1.8" aria-valuenow="${v.toFixed(2)}" aria-valuetext="V 비율 ${v.toFixed(2)}, 목표 1.60" style="margin-top:12px"><span class="fq-vgauge__run"></span><span class="fq-vgauge__now"></span><span class="fq-vgauge__goal"></span></div><div class="fq-vgauge__labels" style="color:#9E9EA0"><span>1.2</span><span>1.4</span><span>1.6</span><span>1.8</span></div></div>` : ''}
      <button class="fq-btn fq-btn--secondary" style="--_bg:#1F2547;--_fg:#F5F5F5" data-act="tape">${v ? '줄자 다시 재기' : '어깨·허리 둘레 재고 V 비율 열기'}</button>
      <p class="fq-t-caption" style="color:var(--fq-ondark-2);margin:0">주황 윤곽 = 우선 부위(측면 삼각근 · 광배 · 윗가슴). 이번 주 목표 세트만큼 면이 채워지고 월요일에 새로 시작해요.</p></section>
    ${photoSection()}
    <div class="stats">
      <div class="fq-card"><span class="fq-eyebrow">Streak</span><span class="fq-t-num-lg">${streakNow()}<span class="fq-unit">일</span></span><span class="fq-t-caption">최장 ${Math.max(DB.streak.best, streakNow())}일 · 휴식일 포함</span></div>
      <div class="fq-card"><span class="fq-eyebrow">Total days</span><span class="fq-t-num-lg">${Object.keys(DB.done).length}<span class="fq-unit">일</span></span><span class="fq-t-caption">총 운동일, 영원히 남아요</span></div>
      <div class="fq-card"><span class="fq-eyebrow">Sessions</span><span class="fq-t-num-lg">${DB.sessions.length}</span><span class="fq-t-caption">기록한 운동</span></div>
      <div class="fq-card"><span class="fq-eyebrow">Shields</span><span class="fq-t-num-lg">${DB.streak.shields}<span class="fq-unit">/2</span></span><span class="fq-t-caption">빠진 날 자동 사용</span></div></div>
    <div class="sec-title"><h2 class="fq-t-heading">업적</h2><span class="fq-t-caption">${ach.filter(a => a[1] === true).length} / ${ach.length}</span></div>
    <div class="ach">${ach.map(([n, s, r]) => s === true ? `<div class="fq-plate" data-r="${r || ''}"><span style="color:${r === 'epic' ? 'var(--fq-levelup-text)' : r === 'rare' ? 'var(--fq-xp-text)' : 'var(--fq-plate-label)'}">${px('star', 1)}</span><b style="font-size:14px">${n}</b></div>`
      : `<div class="fq-halftone locked"><span style="color:#9E9EA0">${px('lock', 1)}</span><div class="stack" style="gap:6px"><b style="font-size:14px">${n}</b>${Array.isArray(s) ? `<div class="fq-xp" style="--p:${Math.min(100, s[0] / s[1] * 100)};--cells:10;height:10px"><div class="fq-xp__fill"></div></div><span class="fq-t-caption" style="color:var(--fq-ondark-2)">${s[0]} / ${s[1]}</span>` : ''}</div></div>`).join('')}</div>`;
  loadPhotos().then(() => { const el = $('#bodyLog'); if (el && TAB === 'grow') el.outerHTML = photoSection(); });
};

/* ================= SETTINGS ================= */
R.set = () => {
  const P = DB.profile, S = DB.settings, T = targets();
  $('#scr-set').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">설정</h1><button class="fq-btn fq-btn--icon" data-go="home" aria-label="닫기">${ico('x')}</button></header>
    <section class="fq-card stack"><span class="fq-t-heading">오늘 목표</span><span class="fq-t-body">${T.train ? '운동일' : '휴식일'} ${fmt(T.kcal)}kcal · 단백질 ${T.p}g · 탄수 ${T.c}g · 지방 ${T.f}g</span><span class="fq-t-caption">끼니당 단백질 ${mealSplit(T.p).join(' · ')}g · 기초대사량 ${T.bmr}kcal${DB.flags.tdee ? ` · 실측 유지 ${fmt(DB.flags.tdee)}kcal` : ''}</span></section>
    <section class="fq-card stack" style="gap:12px"><span class="fq-t-heading">효과음 · 화면</span>
      <div class="chips"><button class="fq-chip" aria-pressed="${S.sound}" data-act="sound" data-v="1">소리 켜기</button><button class="fq-chip" aria-pressed="${!S.sound}" data-act="sound" data-v="0">끄기</button><button class="fq-chip" data-act="sfxTest">들어보기</button></div>
      <div class="chips">${[['auto', '자동'], ['dark', '다크'], ['light', '라이트']].map(t => `<button class="fq-chip" aria-pressed="${S.theme === t[0]}" data-act="theme" data-v="${t[0]}">${t[1]}</button>`).join('')}</div></section>
    <section class="fq-card stack" style="gap:12px"><span class="fq-t-heading">생활 · 운동</span>
      <span class="fq-t-label">하루 걸음 수</span><div class="chips">${STEPS.map((s, i) => `<button class="fq-chip" aria-pressed="${P.steps === i}" data-act="prof" data-k="steps" data-v="${i}">${s[0]}</button>`).join('')}</div>
      <span class="fq-t-label">하루 끼니 수</span><div class="chips">${[3, 4, 5].map(n => `<button class="fq-chip" aria-pressed="${P.meals === n}" data-act="prof" data-k="meals" data-v="${n}">${n}끼</button>`).join('')}</div>
      <span class="fq-t-label">점심</span><div class="chips"><button class="fq-chip" aria-pressed="${lunchOut()}" data-act="prof" data-k="lunchOut" data-v="true">회사·식당 일반식</button><button class="fq-chip" aria-pressed="${!lunchOut()}" data-act="prof" data-k="lunchOut" data-v="false">직접 조절</button></div>
      <span class="fq-t-label">운동 시간</span><div class="chips">${[45, 60, 75, 90].map(n => `<button class="fq-chip" aria-pressed="${P.sessionMin === n}" data-act="prof" data-k="sessionMin" data-v="${n}">${n}분</button>`).join('')}</div>
      <span class="fq-t-label">경력</span><div class="chips"><button class="fq-chip" aria-pressed="${P.level === 'beginner'}" data-act="prof" data-k="level" data-v="beginner">초보·복귀</button><button class="fq-chip" aria-pressed="${P.level === 'intermediate'}" data-act="prof" data-k="level" data-v="intermediate">중급</button></div>
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="schedule">요일별 루틴 바꾸기</button></section>
    <section class="fq-card stack" style="gap:10px"><span class="fq-t-heading">사진 AI (제미나이)</span>
      <p class="note" style="margin:0">aistudio.google.com/apikey 에서 무료 키를 받아 붙여 넣으면 음식 사진을 읽어요. 키는 이 폰에만 저장돼요.</p>
      <input id="gkey" class="inp" type="password" autocomplete="off" placeholder="AIza…" value="${esc(S.gkey)}" aria-label="제미나이 API 키">
      <input id="gmodel" class="inp" placeholder="모델 (비우면 gemini-2.5-flash)" value="${esc(S.gmodel)}" aria-label="제미나이 모델">
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="saveKey">저장</button></section>
    <section class="fq-card stack" style="gap:10px"><span class="fq-t-heading">백업</span>
      <p class="note" style="margin:0">기록은 이 폰 브라우저에만 있어요. 가끔 내보내 두세요 (카톡 나에게 보내기 등).</p>
      <div class="grid2"><button class="fq-btn fq-btn--secondary" data-act="export">내보내기</button><label class="fq-btn fq-btn--secondary" style="position:relative">불러오기<input type="file" id="importFile" accept="application/json,.json" style="position:absolute;inset:0;opacity:0"></label></div>
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="phExport">몸 사진 내보내기 (jpg 파일로)</button>
      <button class="fq-btn fq-btn--ghost fq-btn--block" data-act="resetAsk" style="color:var(--fq-danger)">전체 초기화</button></section>
    <p class="note center">FITQUEST v0.1 · 운동 사진 free-exercise-db(퍼블릭 도메인) · 루틴 출처는 각 영상 링크</p>`;
  $('#importFile').addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try { const d = JSON.parse(await f.text()); if (!d || d.v !== 1 || !d.profile) throw 0; DB = d; save(); toast('<span>불러왔어요.</span>'); go('home'); } catch (err) { toast('<span>FITQUEST 백업 파일이 아니에요.</span>'); }
  });
};
function scheduleSheet() {
  const on = DB.rot && DB.rot.on, k = dayKey(), mon = mondayOf(k);
  if (!DB.rot) DB.rot = rotFromDays(Object.keys(DB.schedule).map(Number));
  const partChip = (d, v, l) => `<button class="fq-chip" style="min-height:40px;padding:0 12px" aria-pressed="${(DB.rot.slots[d] || '') === v}" data-act="slot" data-d="${d}" data-v="${v}">${l}</button>`;
  const preview = w => [1, 2, 3, 4, 5, 6, 0].map(d => { const day = addDays(mon, ((d + 6) % 7) + w * 7), t = tplFor(day); return `<div><span class="fq-t-label">${DOW[d]}</span><span class="fq-t-caption" style="text-align:right">${t ? esc(TPL[t].ko) : '휴식'}${DB.pins && DB.pins[d] ? ' · 고정' : ''}</span></div>`; }).join('');
  sheet(`<div class="row row--between"><h2 class="fq-t-title">주간 루틴</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <div class="chips"><button class="fq-chip" aria-pressed="${!!on}" data-act="rotOn" data-v="1">매주 바뀌는 로테이션</button><button class="fq-chip" aria-pressed="${!on}" data-act="rotOn" data-v="0">고정 루틴</button></div>
    ${on ? `<p class="note" style="margin:0">요일마다 부위만 정하면, 매주 기본 V자 루틴과 이도황·제로범·조정현 루틴을 돌아가며 넣어요. 같은 부위는 3주에 한 번꼴로 같은 루틴이 돌아와요.</p>
      ${[1, 2, 3, 4, 5, 6, 0].map(d => `<div class="stack" style="gap:6px"><span class="fq-t-label">${DOW[d]}요일</span><div class="chips">${partChip(d, '', '휴식')}${Object.entries(PART_NAME).map(([v, l]) => partChip(d, v, l)).join('')}</div></div>`).join('')}
      <span class="fq-t-heading">이번 주</span><div class="list">${preview(0)}</div><span class="fq-t-heading">다음 주</span><div class="list">${preview(1)}</div>`
    : `${[1, 2, 3, 4, 5, 6, 0].map(d => `<div class="stack" style="gap:6px"><span class="fq-t-label">${DOW[d]}요일 · 지금 ${DB.schedule[d] ? esc(TPL[DB.schedule[d]].ko) : '휴식'}</span><div class="chips">${[['', '휴식'], ...Object.entries(TPL).map(([kk, t]) => [kk, t.by ? `${t.by.split('·')[0]} ${t.code}` : t.code])].map(([kk, l]) => `<button class="fq-chip" style="min-height:40px;padding:0 12px" aria-pressed="${(DB.schedule[d] || '') === kk}" data-act="sched" data-d="${d}" data-v="${kk}">${l}</button>`).join('')}</div></div>`).join('')}`}
    ${DB.pins && Object.keys(DB.pins).length ? `<button class="fq-btn fq-btn--ghost fq-btn--block" data-act="unpin">요일 고정 ${Object.keys(DB.pins).length}개 풀기</button>` : ''}`);
}
function pickTplSheet() {
  sheet(`<div class="row row--between"><h2 class="fq-t-title">어떤 루틴을 할까요?</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    ${Object.entries(TPL).map(([k, t]) => `<button class="pro-card" data-act="pickGo" data-t="${k}"><div class="who"><span class="fq-badge">${t.code}</span>${t.by ? `<span class="fq-t-caption">${esc(t.by)}</span>` : ''}</div><h4>${t.ko}</h4><span class="fq-t-caption">${t.ex.map(([id]) => EX[id].n).join(' · ')}</span></button>`).join('')}`);
}
function wteSheet(cat) {
  const T = targets(), S = daySum(), { left, nt } = nextTarget();
  const remK = T.kcal - S.k, share = Math.max(.35, Math.min(1, nt / Math.max(1, left)));
  const mP = nt || left || 20, mK = Math.max(150, remK * share);
  const score = x => 2 * Math.min(1, x.p / mP) + Math.min(1, x.k / mK) - 3 * Math.max(0, (x.k - mK) / mK);
  const late = hm() >= 1260 && remK < 800, pool = WTE.filter(x => !late || x.k <= 600);
  const cats = ['편의점', '배달', '집밥'];
  let picks = (cat ? [cat] : cats).flatMap(c => pool.filter(x => x.cat === c).sort((a, b) => score(b) - score(a)).slice(0, cat ? 3 : 1));
  if (!cat && lunchOut() && slotAt() === lunchIdx() && !slotSum(lunchIdx())) picks = LUNCH.slice(0, 3).map(x => ({ ...x, cat: '회사 점심' }));
  sheet(`<div class="row row--between"><h2 class="fq-t-title">뭐 먹지?</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-body" style="margin:-8px 0 0">남은 단백질 <b style="color:var(--fq-protein)">${left}g</b> · 칼로리 <b>${fmt(Math.max(0, remK))}kcal</b>. 다음 끼니 ${nt}g에 맞춘 추천이에요.</p>
    <div class="chips" role="group" aria-label="장소">${['전체', ...cats].map(c => `<button class="fq-chip" aria-pressed="${(cat || '전체') === c}" data-act="wteCat" data-c="${c}">${c}</button>`).join('')}</div>
    <div class="wte">${picks.map(x => `<div class="wte-card"><span class="fq-badge" style="justify-self:start">${x.cat}</span><b style="font-size:17px">${x.n}</b>
      <div class="nums"><span><b style="color:var(--fq-protein)">${x.p}</b><span class="fq-unit">G 단백질</span></span><span><b>${x.k}</b><span class="fq-unit">KCAL</span></span></div>
      <span class="fq-t-caption">먹으면: 단백질 ${Math.round(S.p)} → ${Math.round(S.p + x.p)} / ${T.p}g · 칼로리 ${fmt(S.k)} → ${fmt(S.k + x.k)} / ${fmt(T.kcal)}</span>
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="${x.cat === '회사 점심' ? 'lunch' : 'logWte'}" data-n="${esc(x.n)}">이걸로 기록</button></div>`).join('')}</div>
    <p class="note" style="margin:0">값은 대략이에요. 배달 음식은 가게마다 ±30% 달라요.</p>`);
}
function proSheet(i) {
  const r = ROUTINES[i];
  sheet(`<div class="row row--between"><span class="fq-badge">${esc(r.creator)}</span><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <h2 class="fq-t-title">${esc(r.title)}</h2><p class="fq-t-caption" style="margin:-6px 0 0">${esc(r.sub || '')}</p>
    ${r.tips && r.tips.length ? `<section class="fq-card stack"><span class="fq-eyebrow">크리에이터 핵심 팁</span>${r.tips.map(t => `<span class="fq-t-body" style="font-size:15px">· ${esc(t)}</span>`).join('')}</section>` : ''}
    <div class="pro-ex">${r.ex.map((e, j) => `<div><span class="fq-hud muted">${j + 1}</span><span><b>${esc(e.n)}</b><small>${esc(e.how || '')}</small></span><span class="fq-t-label">${esc(e.sr || '')}</span></div>`).join('')}</div>
    <div class="src">${ico('ext', 'ico--16')}<span>출처: ${r.videos.map(v => `<a href="${v.u}" target="_blank" rel="noopener">${esc(v.t)}</a>`).join(', ')}</span></div>
    ${r.tpl ? `<button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="proGo" data-t="${r.tpl}">이 루틴으로 지금 운동하기</button><button class="fq-btn fq-btn--secondary fq-btn--block" data-act="proDay" data-t="${r.tpl}">요일에 고정하기</button>` : '<p class="note" style="margin:0">이 공략서는 요일마다 조금씩 섞어 쓰는 계획이에요. 로테이션의 어깨날에 이도황 20분 어깨 루틴이 들어가요.</p>'}
    <p class="note" style="margin:0">영상 자막과 화면을 보고 정리했어요. 영상에서 말하지 않은 세트·횟수는 앱 기본값으로 채워요. 로테이션을 켜 두면 이 루틴도 몇 주에 한 번씩 자동으로 들어와요.</p>`);
}

/* ================= events ================= */
document.addEventListener('click', ev => {
  const g = ev.target.closest('[data-go]'); if (g) { closeSheet(); SFX.tap(); go(g.dataset.go); return; }
  const a = ev.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act, k = dayKey();
  const H = {
    close: closeSheet,
    ob: () => { OB[a.dataset.k] = isNaN(+a.dataset.v) ? a.dataset.v : +a.dataset.v; a.parentElement.querySelectorAll('.fq-chip').forEach(c => c.setAttribute('aria-pressed', c === a)); },
    obCr: () => { const v = a.dataset.v; OB.cr = OB.cr.includes(v) ? OB.cr.filter(x => x !== v) : OB.cr.concat(v); const y = scrollY; R.onb(); scrollTo(0, y); },
    obDay: () => { const d = +a.dataset.v; OB.days = OB.days.includes(d) ? OB.days.filter(x => x !== d) : OB.days.concat(d); a.setAttribute('aria-pressed', OB.days.includes(d)); },
    obCalc: () => {
      const { d, bad } = obRead();
      if (bad.length) { $('#obResult').innerHTML = `<p class="fq-card" style="color:var(--fq-danger);margin:0">${bad.join(', ')} 값을 확인해 주세요.</p>`; return; }
      if (OB.days.length < 2) { $('#obResult').innerHTML = `<p class="fq-card" style="margin:0">운동 요일을 2일 이상 골라 주세요.</p>`; return; }
      const rec = recChapter(OB.sex, d.pbf);
      DB.profile = { sex: OB.sex, age: d.age, height: d.h, steps: OB.steps, meals: OB.meals, sessionMin: OB.min, level: OB.level, lunchOut: OB.lunch === 1, creators: OB.cr.slice(), chapter: 0, chapterStart: dayKey(), rec };
      DB.inbody = [{ date: d.date, w: d.w, smm: d.smm, pbf: d.pbf, bmr: d.bmr }]; DB.schedule = assignDays(OB.days); DB.rot = rotFromDays(OB.days);
      DB.flags.obDraft = true;
      const t0 = targets(); const save0 = DB.profile.chapter; DB.profile.chapter = rec; const tr = targets(); DB.profile.chapter = save0;
      $('#obResult').innerHTML = `<section class="fq-plate stack" style="gap:10px"><div class="fq-plate__head"><span class="fq-hud">YOUR PLAN</span><span class="fq-hud">체지방 ${d.pbf}%</span></div>
        <h2 class="fq-t-title">추천: 챕터 ${rec} ${CH[rec].name}</h2>
        <p class="fq-t-body" style="margin:0">${rec === 1 ? 'V자는 마를수록 넓어 보여요. 체지방 20%에서 벌크를 시작하면 허리가 어깨보다 먼저 커져요. 먼저 15%대까지 지방 안개를 걷어내고, 그다음 프레임을 키워요. 근육을 지키려고 단백질은 오히려 더 먹어요.' : rec === 2 ? '유지 칼로리로 근육은 늘리고 지방은 줄여요. 더 선명한 V자를 빨리 원하면 미니컷도 좋아요.' : '충분히 말랐어요. 이제 조금 더 먹으며 프레임을 넓혀요.'}</p>
        <div class="grid2"><div class="stack" style="gap:4px"><span class="fq-t-caption">운동일 칼로리</span><span class="fq-t-num-md">${fmt(tr.train ? tr.kcal : tr.kcal + 300)}</span></div><div class="stack" style="gap:4px"><span class="fq-t-caption">단백질 (하루)</span><span class="fq-t-num-md" style="color:var(--fq-protein)">${tr.p}g</span></div></div>
        <span class="fq-t-caption">끼니당 단백질 ${mealSplit(tr.p).join(' · ')}g${DB.profile.lunchOut ? ` · 점심은 일반식이라 ${LUNCH_P}g, 나머지 끼니에 더 배분` : ''}</span>
        <button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="obStart" data-c="0">정직한 2주부터 시작 (추천)</button>
        <p class="fq-t-caption" style="margin:-4px 0 0">2주 동안 평소대로 먹고 다 기록하면, 공식이 아닌 내 몸의 진짜 유지 칼로리를 찾아요. 그동안 단백질 목표는 ${t0.p}g.</p>
        <button class="fq-btn fq-btn--ghost fq-btn--block" data-act="obStart" data-c="${rec}">바로 챕터 ${rec} ${CH[rec].name} 시작</button></section>`;
      $('#obResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    obStart: () => { DB.profile.chapter = +a.dataset.c; DB.profile.chapterStart = dayKey(); delete DB.flags.obDraft; DB.streak.last = addDays(dayKey(), -1); DB.weights[dayKey()] = DB.inbody[0].w; save(); SFX.start(); go('home'); toast('<span>게임 시작! 첫 퀘스트는 단백질이에요.</span>'); },
    wte: () => wteSheet(), wteCat: () => wteSheet(a.dataset.c === '전체' ? null : a.dataset.c),
    logWte: () => { closeSheet(); addFood(WTE.find(w => w.n === a.dataset.n)); },
    rescue: () => { const { left } = nextTarget(), r = RESCUE.find(q => left <= q[0]); addFood({ n: r[1], p: r[2], k: r[3], c: 12, f: 4 }, 'rescue'); },
    fav: () => addFood(favList()[+a.dataset.i]),
    delFood: () => { DB.foods = DB.foods.filter(f => f.id !== a.dataset.id); save(); R[TAB](); },
    allLogged: () => { const key = 'all_' + k; if (a.checked && !DB.flags[key]) { DB.flags[key] = true; addXP('all', 20); toast('<span>완전 기록일 +20 XP · 정체기 진단이 정확해져요</span>'); } else if (!a.checked) delete DB.flags[key]; checkDaily3(); save(); showLevelUp(); },
    weigh: () => { const v = parseFloat(($('#wIn').value || '').replace(',', '.')); if (!(v >= 30 && v <= 250)) return toast('<span>체중을 kg으로 넣어 주세요.</span>'); const first = !DB.weights[k]; DB.weights[k] = v; if (first) addXP('weight', 5); checkDaily3(); save(); SFX.food(); R.home(); toast(`<span>${v}kg 기록${first ? ' · +5 XP' : ''}</span>`); showLevelUp(); },
    textIn: () => sheet(`<h2 class="fq-t-title">글로 기록</h2><p class="fq-t-caption" style="margin:-6px 0 0">모르면 단백질만 적어도 돼요. 칼로리를 비우면 대략 추정해요.</p>
      <label class="stack" for="tiName" style="gap:6px"><span class="fq-t-label">무엇을 먹었나요</span><input id="tiName" class="inp" placeholder="예: 닭가슴살 200g, 밥 반 공기"></label>
      <div class="grid2"><label class="stack" for="tiP" style="gap:6px"><span class="fq-t-label">단백질 g</span><input id="tiP" class="inp" inputmode="numeric" placeholder="30"></label><label class="stack" for="tiK" style="gap:6px"><span class="fq-t-label">칼로리</span><input id="tiK" class="inp" inputmode="numeric" placeholder="모르면 비워요"></label></div>
      <button class="fq-btn fq-btn--lg fq-btn--block" data-act="textSave">기록하기</button>`),
    textSave: () => { const n = $('#tiName').value.trim() || '직접 입력', p = Math.max(0, +$('#tiP').value || 0), kc = +$('#tiK').value || Math.round(p * 4 + 150); if (!p && !+$('#tiK').value) return toast('<span>단백질이나 칼로리 중 하나는 적어 주세요.</span>'); closeSheet(); addFood({ n, p, k: kc }); },
    ask: () => { FR.items[+a.dataset.i].q = +a.dataset.q; FR.asked = true; drawResult(); },
    qty: () => { FR.items[+a.dataset.i].q = +a.dataset.q; drawResult(); },
    saveFood: () => { const it = FR.items.filter(x => x.q > 0); const P = it.reduce((s, x) => s + x.p * x.q, 0), K = it.reduce((s, x) => s + x.k * x.q, 0), C = it.reduce((s, x) => s + x.c * x.q, 0), F = it.reduce((s, x) => s + x.f * x.q, 0); FR = null; addFood({ n: it.map(x => x.n).join(' · ').slice(0, 40) || '사진 기록', p: P, k: K, c: C, f: F }); },
    startQuest: () => condSheet(), pickTpl: () => pickTplSheet(), pickGo: () => condSheet(a.dataset.t),
    cond: () => { buildSession(a.dataset.c, a.dataset.t || null); closeSheet(); SFX.start(); keepAwake(true); go('logger'); },
    postpone: () => { const mon = mondayOf(k), t = tplFor(k), tm = addDays(k, 1); DB.overrides[k] = 'rest'; DB.overrides[tm] = t; DB.flags['pp_' + mon] = true; save(); R.work(); toast('<span>내일로 미뤘어요. 오늘은 휴식일, 연속 기록은 그대로예요.</span>'); },
    setDone: () => setDone(+a.dataset.j), undoSet: () => undoSet(+a.dataset.j),
    'w+': () => adj('w', 1), 'w-': () => adj('w', -1), 'r+': () => adj('r', 1), 'r-': () => adj('r', -1),
    'rest+': () => { if (W.rest) { W.rest.len += 15; R.logger(); } }, 'rest-': () => { if (W.rest) { W.rest.len = Math.max(15, W.rest.len - 15); R.logger(); } },
    feel: () => { W.feels[W.ex[W.i].id] = a.dataset.f; W.feel = false; if (W.i < W.ex.length - 1) { W.i++; W.rest = null; } SFX.tap(); R.logger(); },
    nextEx: () => { W.feel = false; W.i++; W.rest = null; R.logger(); },
    skip: () => { W.feel = false; if (W.i < W.ex.length - 1) { W.i++; W.rest = null; R.logger(); } else finish(); },
    pain: () => sheet(`<h2 class="fq-t-title">얼마나 아파요?</h2><p class="fq-t-caption" style="margin:-6px 0 0">알려 주면 +10 XP. 오늘 루틴을 바로 조정해요.</p><div class="cond"><button data-act="painLv" data-v="1"><b>1–3 불편감</b><span>계속하되 증량 금지</span></button><button data-act="painLv" data-v="2"><b>4–6 통증</b><span>이 운동 중단, 다음 운동으로</span></button><button data-act="painLv" data-v="3"><b>7–10 · 날카로움</b><span>오늘 운동 종료 권고</span></button></div>`),
    painLv: () => { closeSheet(); const got = addXP('pain', 10); W.xp += got; const id = W.ex[W.i].id; if (a.dataset.v !== '1') { const st = prog(id); st.w = Math.floor(st.w * .8 / incOf(id)) * incOf(id) || st.w; }
      if (a.dataset.v === '3') { toast('<span>오늘은 여기까지 해요. 의료진 상담을 권해요.</span>'); finish(); return; }
      toast(a.dataset.v === '1' ? '<span>알려 줘서 고마워요. 무게 유지로 가요.</span>' : '<span>이 운동은 멈추고 다음으로 넘어가요. 다음엔 80% 무게로 시작해요.</span>');
      if (a.dataset.v === '2') { if (W.i < W.ex.length - 1) { W.i++; W.rest = null; R.logger(); } else finish(); } },
    endAsk: () => sheet(`<h2 class="fq-t-title">운동을 끝낼까요?</h2><p class="fq-t-body" style="margin:-6px 0 0">계획의 80% 이상이면 완료로 쳐요. 모자라도 기록한 세트는 저장돼요.</p><button class="fq-btn fq-btn--lg fq-btn--block" data-act="finishNow">끝내고 저장</button><button class="fq-btn fq-btn--ghost fq-btn--block" data-act="close">계속하기</button>`),
    finishNow: () => { closeSheet(); finish(); }, finish: () => finish(),
    lunch: () => lunchSheet(a.dataset.n), lunchAll: () => lunchAllSheet(),
    lunchRice: () => lunchPrev(a.dataset.n, +a.dataset.r),
    lunchSave: () => { const x = LUNCH.find(l => l.n === a.dataset.n), r = RICE[+a.dataset.r]; closeSheet(); addFood({ n: `${x.n}${+a.dataset.r === 1 ? '' : ' (' + r[0] + ')'}`, p: x.p + r[3], k: x.k + r[1], c: x.c + r[2], f: x.f }); },
    crPick: () => crPickSheet(), crCard: () => crCard(a.dataset.v),
    crToggle: () => { const v = a.dataset.v, cur = DB.profile.creators || []; DB.profile.creators = cur.includes(v) ? cur.filter(x => x !== v) : cur.concat(v); save(); crPickSheet(); R[TAB] && R[TAB](); },
    proGo: () => condSheet(a.dataset.t),
    proDay: () => sheet(`<h2 class="fq-t-title">어느 요일에 고정할까요?</h2><p class="fq-t-caption" style="margin:-6px 0 0">${esc(TPL[a.dataset.t].ko)} · 로테이션과 상관없이 매주 이 요일은 이 루틴</p><div class="chips">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="fq-chip" style="min-width:52px;justify-content:center" data-act="proDaySet" data-d="${d}" data-t="${a.dataset.t}">${DOW[d]}</button>`).join('')}</div>`),
    proDaySet: () => { DB.pins = DB.pins || {}; DB.pins[+a.dataset.d] = a.dataset.t; save(); closeSheet(); R[TAB] && R[TAB](); toast(`<span>${DOW[+a.dataset.d]}요일은 ${esc(TPL[a.dataset.t].ko)}로 고정했어요</span>`); },
    unpin: () => { DB.pins = {}; save(); scheduleSheet(); R[TAB] && R[TAB](); },
    rotOn: () => { if (!DB.rot) DB.rot = rotFromDays(Object.keys(DB.schedule).map(Number)); DB.rot.on = a.dataset.v === '1'; save(); scheduleSheet(); R[TAB] && R[TAB](); },
    slot: () => { const d = +a.dataset.d; if (a.dataset.v) DB.rot.slots[d] = a.dataset.v; else delete DB.rot.slots[d]; save(); scheduleSheet(); R[TAB] && R[TAB](); },
    pro: () => proSheet(+a.dataset.i), proAll: () => { proAll = !proAll; R.work(); }, howtoId: () => { const t = a.dataset.t && TPL[a.dataset.t], row = t && t.ex.find(x => x[0] === a.dataset.id), o = row && row[2] || {}; howSheet(a.dataset.id, { v: o.t, range: o.r, tip: o.tip ? { who: t.by, t: o.tip } : null }); },
    howtoEx: () => { const e = W.ex[+a.dataset.i]; howSheet(e.id, { v: e.v, range: e.range, tip: e.tip }); },
    schedule: () => scheduleSheet(), sched: () => { const d = +a.dataset.d; if (a.dataset.v) DB.schedule[d] = a.dataset.v; else delete DB.schedule[d]; save(); scheduleSheet(); R[TAB] && R[TAB](); },
    chapter: () => sheet(`<div class="row row--between"><h2 class="fq-t-title">챕터 바꾸기</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>${CH.map((c, i) => `<button class="pro-card" data-act="setCh" data-c="${i}"><div class="who"><span class="fq-badge">CH.${i}</span>${i === DB.profile.rec ? '<span class="fq-badge fq-badge--signal">추천</span>' : ''}</div><h4>${c.name} · ${c.sub}</h4><span class="fq-t-caption">칼로리 ${c.off > 0 ? '+' : ''}${c.off} · 단백질 ${c.pkg}g/kg</span></button>`).join('')}`),
    setCh: () => { DB.profile.chapter = +a.dataset.c; DB.profile.chapterStart = dayKey(); save(); closeSheet(); R[TAB](); toast(`<span>챕터 ${a.dataset.c} ${CH[+a.dataset.c].name} 시작!</span>`); },
    ch0Done: () => { DB.flags.tdee = +a.dataset.t; const rec = recChapter(DB.profile.sex, ib().pbf); DB.profile.chapter = rec; DB.profile.chapterStart = dayKey(); DB.xp += 500; const L = levelOf(DB.xp); if (L > levelOf(DB.xp - 500)) pendingLevel = L; save(); SFX.pr(); R.home(); showLevelUp(); },
    inbody: () => sheet(`<h2 class="fq-t-title">새 인바디</h2><div class="grid2">${[['ibW', '체중 kg'], ['ibS', '골격근량 kg'], ['ibP', '체지방률 %'], ['ibB', '기초대사량 (선택)']].map(([id, l]) => `<label class="stack" for="${id}" style="gap:6px"><span class="fq-t-label">${l}</span><input id="${id}" class="inp" inputmode="decimal"></label>`).join('')}</div><label class="stack" for="ibD" style="gap:6px"><span class="fq-t-label">측정일</span><input id="ibD" class="inp" type="date" value="${new Date().toISOString().slice(0, 10)}"></label><button class="fq-btn fq-btn--lg fq-btn--block" data-act="ibSave">저장</button>`),
    ibSave: () => { const v = id => parseFloat(($('#' + id).value || '').replace(',', '.')); const e = { date: $('#ibD').value, w: v('ibW'), smm: v('ibS'), pbf: v('ibP'), bmr: v('ibB') || null }; if (!(e.w > 30 && e.pbf > 2 && e.smm > 5)) return toast('<span>체중·골격근량·체지방률을 넣어 주세요.</span>'); DB.inbody.push(e); DB.inbody.sort((x, y) => x.date < y.date ? -1 : 1); DB.xp += 20; save(); closeSheet(); R.grow(); toast('<span>인바디 저장 · 목표가 새로 계산됐어요 · +20 XP</span>'); },
    tape: () => sheet(`<div class="row row--between"><h2 class="fq-t-title">줄자로 V 비율</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
      <div class="fq-blueprint" style="padding:12px">${TAPE_SVG}</div>
      <ol class="tape-steps"><li><b>① 어깨 둘레</b> 팔을 몸 옆에 편하게 내리고, 양쪽 어깨(삼각근)의 <b>가장 튀어나온 곳</b>을 지나게 한 바퀴. 가슴 위쪽을 지나요.</li><li><b>② 허리 둘레</b> <b>배꼽 높이</b>에서 한 바퀴. 숨을 편하게 내쉰 상태, 배에 힘 주지 않기.</li><li>줄자는 바닥과 <b>수평</b>, 살에 닿되 조이지 않게. 거울을 보거나 다른 사람이 재 주면 정확해요. 2번 재서 평균.</li></ol><div class="grid2"><label class="stack" for="tSh" style="gap:6px"><span class="fq-t-label">어깨 둘레 cm</span><input id="tSh" class="inp" inputmode="decimal"></label><label class="stack" for="tWa" style="gap:6px"><span class="fq-t-label">허리 둘레 cm</span><input id="tWa" class="inp" inputmode="decimal"></label></div><button class="fq-btn fq-btn--lg fq-btn--block" data-act="tapeSave">저장</button>`),
    tapeSave: () => { const sh = parseFloat($('#tSh').value), wa = parseFloat($('#tWa').value); if (!(sh > 60 && wa > 40)) return toast('<span>둘레를 cm로 넣어 주세요.</span>'); DB.tape.push({ date: dayKey(), sh, wa }); save(); closeSheet(); R.grow(); },
    sound: () => { DB.settings.sound = a.dataset.v === '1'; save(); R.set(); if (DB.settings.sound) SFX.set(); },
    sfxTest: () => { const seq = ['start', 'set', 'combo', 'ready', 'pr', 'food']; seq.forEach((s, i) => setTimeout(() => SFX[s](), i * 650)); },
    theme: () => { DB.settings.theme = a.dataset.v; applyTheme(); save(); R.set(); },
    prof: () => { const kk = a.dataset.k, v = a.dataset.v; DB.profile[kk] = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v; save(); R.set(); },
    saveKey: () => { DB.settings.gkey = $('#gkey').value.trim(); DB.settings.gmodel = $('#gmodel').value.trim(); save(); toast('<span>저장했어요. 음식 기록에서 사진을 올려 보세요.</span>'); },
    export: () => { const blob = new Blob([JSON.stringify(DB)], { type: 'application/json' }), u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = `fitquest-backup-${dayKey()}.json`; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); },
    resetAsk: () => sheet(`<h2 class="fq-t-title">전체 초기화할까요?</h2><p class="fq-t-body" style="margin:-6px 0 0">모든 기록·레벨·몸 사진이 지워지고 되돌릴 수 없어요. 먼저 내보내기를 권해요.</p><button class="fq-btn fq-btn--lg fq-btn--block" style="--_bg:var(--fq-danger-fill);--_fg:#fff" data-act="reset">초기화</button><button class="fq-btn fq-btn--ghost fq-btn--block" data-act="close">취소</button>`),
    reset: () => { DB = fresh(); save(); PH.clear().catch(() => {}); PHOTOS = []; closeSheet(); go('onb'); }
  };
  if (H[act]) H[act](); else if (PH_ACTS[act]) PH_ACTS[act](a);
});
function adj(kk, d) { const { e, k } = curSet(); if (k < 0) return; const s = e.sets[k], inc = incOf(e.id); if (kk === 'w') { const nw = Math.max(0, +(s.w + d * inc).toFixed(2)); e.sets.forEach((x, i) => { if (!x.done && i >= k) x.w = nw; }); } else s.r = Math.max(1, s.r + d); SFX.tap(); buzz(6); R.logger(); }
function applyTheme() { const t = DB.settings.theme, h = document.documentElement; if (t === 'auto') delete h.dataset.theme; else h.dataset.theme = t; }
$('#lvl').addEventListener('click', e => { if (e.target === $('#lvl')) $('#lvl').close(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && DB.profile && !DB.flags.obDraft && TAB !== 'logger') { settleStreak(); R[TAB] && R[TAB](); } if (document.visibilityState === 'visible' && TAB === 'logger') keepAwake(true); });

/* ================= boot ================= */
applyTheme();
if (!DB.profile || DB.flags.obDraft) { DB.flags.obDraft = false; go('onb'); }
else { if (!DB.profile.creators) { DB.profile.creators = ['idohwang']; save(); } if (!DB.rot) { DB.rot = rotFromDays(Object.keys(DB.schedule).map(Number)); save(); } settleStreak(); go('home'); loadPhotos().then(() => { if (TAB === 'home') R.home(); }); }
