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
  swap: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  cplay: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>',
  zap: '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
  trophy: '<path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/><path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/><path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  skip: '<polygon points="5 4 15 12 5 20 5 4"/><path d="M19 5v14"/>',
  cup: '<path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/>',
  cdown: '<path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>'
};
const ico = (n, c = 'ico--20') => `<svg class="ico ${c}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
/* 롤모델 몸 실루엣 (index.html 의 <symbol>): 프레임 · 두께 · 매스 */
const BODY_MARK = { 프레임: 'b-frame', 두께: 'b-thick', 매스: 'b-mass' };
const avatar = (cr, cls = 'av') => `<span class="${cls}" aria-hidden="true"><svg><use href="#${(cr && BODY_MARK[cr.mark]) || 'b-frame'}"/></svg></span>`;
const creatorOf = t => t && t.by ? CREATORS.find(c => t.by.includes(c.name)) : null;

/* ================= 코치: 몸통 하나 + 표정 7가지 (data-face 로 바꿈, 독자 도형) ================= */
const FACES = {
  idle: '<g class="blink w"><rect x="15" y="15" width="6" height="12" rx="3"/><rect x="27" y="15" width="6" height="12" rx="3"/></g>',
  happy: '<path class="arm wv" d="M44 26l5-8"/><path class="st" d="M14.5 22.5q3.5-5.5 7 0M26.5 22.5q3.5-5.5 7 0"/><ellipse class="blush" cx="11.5" cy="28" rx="3" ry="1.8"/><ellipse class="blush" cx="36.5" cy="28" rx="3" ry="1.8"/><path class="w" d="M20 30.5h8a4 4 0 0 1-8 0z"/>',
  focus: '<path class="w" d="M5.3 9H42.7L45.6 14.5H2.4z"/><path class="st tail" d="M45.5 11.5l4.5-3.5M45.5 12.5l5 1.5" style="stroke-width:2.4"/><g class="blink w"><rect x="15" y="18.5" width="6" height="8" rx="3"/><rect x="27" y="18.5" width="6" height="8" rx="3"/></g><path class="st" d="M21 33h6" style="stroke-width:2.6"/>',
  rest: '<path class="st" d="M14.5 20.5q3.5 4.5 7 0M26.5 20.5q3.5 4.5 7 0"/><circle class="w" cx="24" cy="31.5" r="2.2"/><path class="drop" d="M42 1c2.2 3.2 3.2 4.8 3.2 6.3a3.2 3.2 0 0 1-6.4 0c0-1.5 1-3.1 3.2-6.3z"/>',
  wow: '<path class="spark" d="M24 -1v-5M13 1l-3-4M35 1l3-4"/><circle class="w" cx="18" cy="20" r="5"/><circle class="w" cx="30" cy="20" r="5"/><circle cx="19" cy="18.6" r="1.7" fill="#E0202C"/><circle cx="31" cy="18.6" r="1.7" fill="#E0202C"/><ellipse class="w" cx="24" cy="32" rx="3" ry="3.6"/>',
  proud: '<path class="arm" d="M4 24l-5-9M44 24l5-9"/><path class="w" d="M18 14q.8 5.2 6 6-5.2.8-6 6-.8-5.2-6-6 5.2-.8 6-6zM30 14q.8 5.2 6 6-5.2.8-6 6-.8-5.2-6-6 5.2-.8 6-6z"/><path class="w" d="M17 29.5q7 8 14 0z"/><ellipse class="blush" cx="10.5" cy="27" rx="2.6" ry="1.6"/><ellipse class="blush" cx="37.5" cy="27" rx="2.6" ry="1.6"/>',
  think: '<g class="blink w"><rect x="18" y="12.5" width="6" height="11" rx="3"/><rect x="30" y="12.5" width="6" height="11" rx="3"/></g><path class="st" d="M24 33q2.5-2 5 0" style="stroke-width:2.6"/>'
};
const COACH_SVG = '<svg viewBox="0 0 48 48" focusable="false"><rect class="cl" x="2" y="4" width="44" height="42" rx="14"/><rect class="cb" x="2" y="4" width="44" height="38" rx="14"/><rect class="sh" x="9" y="8.5" width="9" height="3" rx="1.5"/>'
  + Object.entries(FACES).map(([k, v]) => `<g class="f f-${k}">${v}</g>`).join('') + '</svg>';
const coach = (face, s = 44, id = '') => `<span class="coach" data-face="${face}"${id ? ` id="${id}"` : ''} style="--s:${s}px" aria-hidden="true">${COACH_SVG}</span>`;
const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function setFace(el, f, backMs) {
  if (!el) return; clearTimeout(el._t);
  const prev = el.dataset.face;
  if (prev !== f) { el.dataset.face = f; if (!RM()) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); } }
  if (backMs) el._t = setTimeout(() => setFace(el, prev), backMs);
}
const bump = el => { if (!el || RM()) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };
/* 둥근 색종이 */
function burst(host, n) {
  if (!host || RM()) return;
  const col = ['var(--red)', 'var(--cyan)', 'var(--gold)', 'var(--ink)'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 90;
    s.className = 'cf c' + (i % 3 + 1);
    s.style.cssText = `--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d * .75 - 30}px;--r:${Math.random() * 540 - 270}deg;--c:${col[i % 4]};--dl:${Math.random() * 90}ms`;
    host.append(s); setTimeout(() => s.remove(), 1500);
  }
}

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
mergeCustom();
/* 사용자가 학습시킨 유튜버 루틴(BYO) 합치기 — 이 폰에만 저장 */
function mergeCustom() {
  const c = DB.custom; if (!c) return;
  Object.assign(EX, c.ex || {}); Object.assign(TPL, c.tpls || {});
  Object.entries(c.tpls || {}).forEach(([k, t]) => { TPL_PARTS[k] = t.parts; });
  (c.creators || []).forEach(cr => { if (!CREATORS.some(x => x.id === cr.id)) CREATORS.push(cr); else Object.assign(CREATORS.find(x => x.id === cr.id), cr); });
  Object.entries(c.tpls || {}).forEach(([k, t]) => { const cr = t.cr && CREATORS.find(x => x.id === t.cr); if (cr && !cr.tpls.includes(k)) cr.tpls.push(k); });   // 기존 유튜버에 붙는 새 루틴 (follow.js)
}
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

/* 지금 끼니를 이미 채웠으면 다음 끼니 이름 */
function nextMealName() {
  const names = mealNames(), { cur } = nextTarget(), got = slotSum(cur), tg = mealSplit(targets().p)[cur];
  return names[Math.min(got > 0 && got >= tg - 10 ? cur + 1 : cur, names.length - 1)];
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
  const ok = t => t && TPL[t] ? t : null;
  const o = DB.overrides[k]; if (o === 'rest') return null; if (ok(o)) return o;
  const d = dow(k);
  if (DB.pins && ok(DB.pins[d])) return DB.pins[d];
  if (DB.rot && DB.rot.on) return ok(rotFor(k));
  return ok(DB.schedule[d]);
}
function rotCands(part) {
  const picks = (DB.profile.creators || []).flatMap(id => (CREATORS.find(c => c.id === id) || {}).tpls || []);
  const base = ROT[part].concat(Object.keys((DB.custom && DB.custom.tpls) || {}).filter(k => { const t = TPL[k]; return t && !t.off && t.parts && t.parts.includes(part === 'full' ? 'legs' : part); }));
  const mine = base.filter(t => picks.includes(t)), rest = base.filter(t => !picks.includes(t));
  if (!mine.length) return base;
  return mine.length >= 2 ? mine.concat(rest.filter(t => !TPL[t].pro).slice(0, 1)) : [mine[0], rest[0], mine[0]].filter(Boolean);
}
function rotWeek(k) { return Math.max(0, Math.floor(daysBetween(DB.rot.start, mondayOf(k)) / 7)); }
function rotFor(k) {
  const d = dow(k), part = DB.rot.slots[d]; if (!part) return null;
  const mon = mondayOf(k), order = [1, 2, 3, 4, 5, 6, 0]; let j = 0;
  for (const x of order) { if (x === d) break; if (DB.rot.slots[x] === part) j++; }
  const c = rotCands(part), fresh = j ? null : c.filter(t => TPL[t].day && mondayOf(addDays(TPL[t].day, 7)) === mon).sort((a, b) => TPL[b].at - TPL[a].at)[0];
  return fresh || c[(rotWeek(k) + j) % c.length];   // 새로 자동 추가된 루틴은 다음 주 그 부위 첫날에 꼭 들어감
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
  return { first: ['첫 기록', '10회 할 수 있는 무게로 가볍게 시작해요'], up: [EX[id].kind === 'as' ? `보조 −${inc}kg` : `+${inc}kg`, '지난번 모든 세트 윗끝 달성 → 증량', 1], prog: ['+1회', '총반복 기준 통과 → 세트마다 +1회', 1],
    hold: ['유지', '"한계"였어서 같은 무게로 한 번 더'], fail: ['유지', '같은 무게로 다시 도전'], deload: ['무게 −10%', '잠깐 물러서서 더 멀리 — 반복은 끝까지'] }[st.last] || ['유지', ''];
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
/* V 비율(어깨 둘레÷허리 둘레) — 그림은 V_BASE 몸을 기준으로 어깨는 √(r/기준), 허리는 그 역수만큼 가로로 늘이고 줄여요 */
const V_BASE = 1.45, V_GOAL = 1.6, V_MIN = 1.2, V_MAX = 1.8;
const V_BANDS = [[V_MIN, '일반', '~1.3'], [1.35, '운동', '1.4'], [1.45, '운동선수', '1.5–1.6'], [1.618, '황금비', '1.62']]; // 남성 참고치(대략)
const V_NAMES = { 일반: '일반 체형', 운동: '꾸준히 운동한 체형', 운동선수: '운동선수 체형', 황금비: '황금비 체형' };
const vBand = r => V_BANDS.filter(b => r >= b[0]).pop() || V_BANDS[0];
function vWarp(pts, r) { // y 높이별로 어깨(y 82–130)·허리(y ~198) 배율을 섞어 x를 중심(120)에서 늘여요
  const kS = Math.sqrt(Math.min(V_MAX, Math.max(V_MIN, r)) / V_BASE), kW = 1 / kS, mix = (a, b, t) => a + (b - a) * t;
  const k = y => y < 58 ? 1 : y < 82 ? mix(1, kS, (y - 58) / 24) : y < 130 ? kS : y < 198 ? mix(kS, kW, (y - 130) / 68) : y < 232 ? mix(kW, 1, (y - 198) / 34) : 1;
  return pts.split(' ').map(p => { const [x, y] = p.split(',').map(Number); return `${+(120 + (x - 120) * k(y)).toFixed(1)},${y}`; }).join(' ');
}
function blueprintSVG(L, gain = [], r = V_BASE, goal = V_BASE, label = '바디 설계도: 이번 주 부위별 운동량') {
  const W = pts => vWarp(pts, r), poly = (c, p) => `<polygon class="${c}" points="${W(p)}"/>`;
  const g = (m, t, polys) => `<g data-muscle="${m}" data-level="${L[m] || 0}" ${['delt-side', 'lats', 'chest-upper'].includes(m) ? 'data-focus' : ''} ${gain.includes(m) ? 'data-gain' : ''}><title>${t}</title>${polys.map(p => poly('fq-muscle', p)).join('')}</g>`;
  const tgt = goal ? ['78,198 60,128 46,98 50,82 108,58', '132,58 190,82 194,98 180,128 162,198'].map(p => `<polyline class="fq-body__target" points="${vWarp(p, goal)}"/>`).join('') : '';
  return `<svg class="fq-body" viewBox="0 0 240 380" role="img" aria-label="${label}">
  ${tgt}
  <ellipse class="fq-body__head" cx="120" cy="34" rx="16" ry="20"/><path class="fq-body__part" d="M111 53h18l3 12h-24z"/>
  ${['51,211 65,213 63,230 49,226', '189,211 175,213 177,230 191,226', '81,202 119,205 119,240 97,248 78,226', '159,202 121,205 121,240 143,248 162,226', '90,364 108,364 110,372 86,372', '150,364 132,364 130,372 154,372'].map(p => poly('fq-body__part', p)).join('')}
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
const GYM_TABS = ['logger', 'sum', 'shoot']; // 헬스장 모드가 자동으로 켜지는 운동 화면
function go(tab) {
  if (TAB === 'shoot' && tab !== 'shoot') stopCam();
  if (tab === 'shoot') $('#toast').innerHTML = '';
  TAB = tab;
  ['onb', 'home', 'diet', 'cam', 'work', 'grow', 'set', 'logger', 'sum', 'shoot', 'cmp'].forEach(s => { $('#scr-' + s).hidden = s !== tab; });
  $('#tabbar').hidden = tab === 'onb' || tab === 'logger' || tab === 'shoot';
  document.querySelectorAll('.tabbar button').forEach(b => b.dataset.go === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  applyTheme();
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
  t.innerHTML = `<div class="fq-toast" role="status">${html}</div>`;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.innerHTML = ''; }, ms);
}
const say = s => { $('#live').textContent = s; };
const josa = n => [2, 4, 5, 9].includes(n % 10) ? '가' : '이'; // 레벨 8이 · 레벨 9가
/* 레벨업: 색종이 → 배지 숫자가 뒤집히며 물결 3겹 + "레벨 업" 리본, 코치 만세 점프 */
function showLevelUp() {
  if (!pendingLevel) return; const L = pendingLevel; pendingLevel = null;
  const d = $('#lvl'), num = $('#lvl-num'), badge = $('#lvl-badge'), stage = $('#lvl-stage'), newTitle = TITLES.find(t => t[0] === L);
  $('#lvl-title').textContent = `레벨 ${L}${josa(L)} 됐어요`;
  $('#lvl-sub').textContent = newTitle ? `새 칭호 · ${titleOf(L)}` : `${titleOf(L)} · 다음 레벨까지 ${fmt(cum(L + 1) - DB.xp)} XP`;
  const rw = []; if (L % 5 === 0) rw.push(['shield', '보호권 +1']); if (newTitle) rw.push(['trophy', '칭호 해금']);
  $('#lvl-rw').innerHTML = rw.map(r => `<span class="chip gd">${ico(r[0], '')}${r[1]}</span>`).join('');
  (showLevelUp.t || []).forEach(clearTimeout);
  stage.classList.remove('up'); badge.classList.remove('flip', 'boing'); num.textContent = L - 1;
  SFX.level(); buzz([30, 50, 30, 50, 120]);
  try { d.showModal(); } catch (e) { d.setAttribute('open', ''); }
  if (RM()) { num.textContent = L; stage.classList.add('up'); return; }
  showLevelUp.t = [setTimeout(() => burst($('#lvl-burst'), 28), 120), setTimeout(() => badge.classList.add('flip'), 450),
    setTimeout(() => { num.textContent = L; badge.classList.add('boing'); stage.classList.add('up'); burst($('#lvl-burst'), 22); }, 680)];
}
function lvInfo() { const L = levelOf(DB.xp), a = cum(L), b = cum(L + 1); return { L, a, b, p: Math.round((DB.xp - a) / (b - a) * 100) }; }
function chapterWeek() { const d = daysBetween(DB.profile.chapterStart, dayKey()); return DB.profile.chapter === 0 ? `D+${d + 1}/14` : `${Math.floor(d / 7) + 1}주차`; }
/* 끼니 막대: 칸 너비 = 끼니 목표(mealSplit), 채운 만큼 빨강, 지금 끼니는 하늘색 테두리 */
function mealMeter(T, withTg) {
  const names = mealNames(), split = mealSplit(T.p), { nt, cur } = nextTarget(), aria = [];
  const cells = names.map((n, i) => {
    const got = Math.round(slotSum(i)); let tg = split[i]; if (i >= cur && !got) tg = Math.max(tg, nt);
    const hit = got >= tg - 10 && got > 0; aria.push(`${n} ${got} / ${tg}g`);
    return `<span class="${hit ? 'hit' : i === cur ? 'next' : ''}"><i style="--w:${Math.min(100, got / Math.max(1, tg) * 100).toFixed(0)}"></i><b>${hit ? ico('check', 'ico--12') : ''}${n}${withTg ? ` <span class="num">${tg}</span>` : ''}</b></span>`;
  }).join('');
  return `<div class="meter" style="grid-template-columns:${split.map(v => `minmax(40px,${v}fr)`).join(' ')}" role="img" aria-label="끼니별 단백질: ${aria.join(', ')}">${cells}</div>`;
}

/* ================= ONBOARDING ================= */
/* 롤모델 카드: 몸 실루엣 + 스타일, 고르면 하늘색 테두리 */
const crButton = (c, act, on) => `<button class="cr" data-act="${act}" data-v="${c.id}" aria-pressed="${on}">${avatar(c, 'av av--lg')}<span class="cr-t"><b class="cr-n">${esc(c.name)}${c.ch ? ` <small>${esc(c.ch)}</small>` : ''}</b><span class="chip">${esc(c.tag)}</span><span class="cr-b">${esc(c.body)}</span></span><span class="on" aria-hidden="true">${ico('check', 'ico--16')}</span></button>`;
const OB = { sex: 'M', steps: 1, meals: 4, min: 60, level: 'beginner', days: [1, 2, 4, 5, 6], lunch: 1, cr: ['idohwang'] };
R.onb = () => {
  const ch = (k, v, label) => `<button class="fq-chip" aria-pressed="${OB[k] === v}" data-act="ob" data-k="${k}" data-v="${v}">${label}</button>`;
  const inp = (id, label, ph, extra = '') => `<label class="stack" for="${id}" style="gap:6px"><span class="fq-t-label">${label}</span><input id="${id}" class="inp" inputmode="decimal" placeholder="${ph}" ${extra}></label>`;
  $('#scr-onb').innerHTML = `
    <header class="onb-head pop">${coach('happy', 56)}<div><p class="brand">FITQUEST</p><h1 class="fq-t-title">넓은 프레임을 같이 만들어요</h1></div></header>
    <p class="fq-t-body onb-lead">어깨·등은 넓게, 허리는 얇게. 인바디 숫자를 넣으면 끼니마다 먹을 양과 오늘 할 운동을 제가 정해 드릴게요.</p>
    <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="bkSetup">${ico('cdown')}예전 기록 드라이브에서 불러오기</button>
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
      <div class="cards">${CREATORS.map(c => crButton(c, 'obCr', OB.cr.includes(c.id))).join('')}</div></section>
    <section class="fq-card stack" style="gap:14px"><h2 class="fq-t-heading">운동 요일</h2>
      <div class="chips">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="fq-chip" aria-pressed="${OB.days.includes(d)}" data-act="obDay" data-v="${d}" style="min-width:48px;justify-content:center">${DOW[d]}</button>`).join('')}</div>
      <p class="note" style="margin:0">매일 하던 분은 주 5회를 추천해요(나머지 이틀은 걷기). 요일별 루틴은 나중에 바꿀 수 있어요.</p></section>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="obCalc">목표 계산하기</button>
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
  const tpl = tplFor(k), done = !!DB.done[k], m = hm(), gap = comebackGap(), T0 = tpl && TPL[tpl], lv = lvInfo();
  const lunch = lunchCard(), comebackOn = gap >= 7 && tpl && !done, showRescue = m >= 1200 && m < 1380 && left >= 20;
  // "지금 할 것"은 하나만: 점심 → 복귀/오늘 운동 → 단백질 구조대 → 다음 끼니
  const now = lunch ? 'lunch' : comebackOn ? 'comeback' : tpl && !done ? 'quest' : showRescue ? 'rescue' : left > 0 ? 'protein' : '';
  const hr = Math.floor(m / 60), hello = hr < 4 ? '늦은 밤이에요.' : hr < 11 ? '좋은 아침이에요.' : hr < 17 ? '좋은 오후예요.' : '좋은 저녁이에요.';
  const plan = comebackOn ? '다시 와서 반가워요.' : done ? '오늘 운동 끝! 이제 단백질만 챙겨요.' : tpl ? `오늘은 ${esc(T0.code)} 하는 날이에요.` : '오늘은 쉬는 날이에요.';
  const rescueRow = RESCUE.find(r => left <= r[0]);
  const rescue = showRescue ? `<section class="tile card-pad ${now === 'rescue' ? 'sel' : ''}" aria-label="단백질 구조대">
      <div class="l-head">${coach('think', 36)}<p>오늘 ${left}g 모자라요. ${esc(rescueRow[1])}면 11시 전에 끝나요.<small>단백질 ${rescueRow[2]}g · ${rescueRow[3]}kcal · 늦은 시간이라 가볍고 단백질 많은 조합만 골랐어요</small></p></div>
      <button class="fq-btn ${now === 'rescue' ? '' : 'fq-btn--secondary'} fq-btn--block" data-act="rescue">이걸로 기록 · +20 XP</button></section>` : '';
  const comeback = comebackOn ? `<section class="tile card-pad sel" aria-label="복귀">
      <div class="l-head">${coach('happy', 44)}<p>다시 왔네요, 반가워요. 오늘은 가볍게 15분.<small>무게는 쉰 기간만큼 자동으로 낮춰 뒀어요. 최고 연속 기록 ${DB.streak.best}일은 그대로예요.</small></p></div>
      <span class="chip gd cb-xp">${ico('zap', '')}첫 운동 XP 2배</span>
      <ol class="cb-steps"><li data-on><b class="num">1</b>오늘 · 단백질 + 15분</li><li><b class="num">2</b>정규 운동 1회</li><li><b class="num">3</b>이번 주 계획 절반</li></ol>
      <button class="fq-btn fq-btn--lg fq-btn--block" data-act="cond" data-c="short">${ico('play', 'fill')}15분 운동 시작</button><button class="fq-btn fq-btn--secondary fq-btn--block" data-act="startQuest">평소 루틴으로</button></section>` : '';
  const img = T0 && T0.ex.map(e => EX[e[0]] && EX[e[0]].img).find(Boolean), cr = creatorOf(T0), nSets = T0 ? T0.ex.reduce((a, e) => a + e[1], 0) : 0;
  const quest = comeback ? '' : !tpl ? `<section class="tile card-pad" aria-label="오늘">
      <div class="l-head">${coach('idle', 44)}<p>근육은 쉬는 날 자라요.<small>오늘 할 일은 단백질 ${T.p}g과 걷기예요. 연속 기록은 이어져요.</small></p></div>
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="pickTpl">그래도 운동할래요</button></section>`
    : done ? `<section class="tile card-pad" aria-label="오늘 운동"><div class="done-row"><span class="ck">${ico('check', '')}</span><div><p class="lab">오늘 운동 완료</p><h2 class="fq-t-heading">${esc(T0.ko)}</h2></div></div>
      <p class="fq-t-caption">${left > 0 ? `남은 할 일은 단백질 ${left}g이에요.` : '단백질까지 끝! 푹 쉬어요.'}</p></section>`
    : `<section class="tile quest ${now === 'quest' ? 'sel' : ''}" aria-label="오늘 운동">
      ${img ? `<img src="media/${img}_0.jpg" alt="" loading="lazy">` : ''}
      <div class="q-body">
        <div class="q-row"><p class="lab">오늘 운동 · 이번 주 <span class="num">${weekDone()}/${trainDaysPerWeek()}</span></p>${DB.rot && DB.rot.on ? `<span class="chip">${ico('repeat', '')}로테이션 ${rotWeek(k) + 1}주차</span>` : ''}</div>
        <h2>${esc(T0.code)} <span>${esc(T0.by ? T0.ko.replace(T0.by + ' · ', '') : T0.ko)}</span></h2>
        <p class="by">${avatar(cr)}${T0.by ? esc(T0.by) + ' 루틴' : '기본 V자 루틴'} · ${T0.ex.length}가지 ${nSets}세트 · 약 ${P.sessionMin}분</p>
        <button class="fq-btn fq-btn--lg fq-btn--block" data-act="startQuest">${ico('play', 'fill')}운동 시작</button>
        ${DB.settings.theme === 'auto' ? `<p class="hint">${ico('moon', 'ico--16')}시작하면 헬스장 모드로 어두워져요</p>` : ''}
      </div></section>`;
  checkDaily3(); // 일일 퀘스트 XP는 그대로 (목록은 홈에서 뺌)
  $('#scr-home').innerHTML = `
    <header class="top">
      <button class="lv" data-go="grow" aria-label="레벨 ${lv.L}, 다음 레벨까지 ${lv.p}%. 성장 탭 열기"><b class="num">${lv.L}</b><span>레벨</span><span class="xp" aria-hidden="true"><i style="width:${lv.p}%"></i></span></button>
      <span class="streak">${ico('flame', '')}<span><b class="num">${streakNow()}</b>일 연속</span></span>
      <button class="round" data-go="set" aria-label="설정">${ico('gear')}</button>
    </header>
    <div class="cols"><div class="col">
    <div class="greet pop">${coach(now === 'protein' || now === 'rescue' ? 'think' : 'happy', 48)}<p>${hello}<br>${plan}</p></div>
    <section class="tile bubble pop ${now === 'protein' ? 'sel' : ''}" style="--d:1" aria-label="다음 끼니 단백질">
      ${S.p < T.p * .9 ? `<p class="lab">다음 끼니는 <b>${nextMealName()}</b></p>
      <p class="big"><span class="num">${nt}</span><span class="u">g</span><span class="what">단백질</span></p>`
      : `<p class="lab">오늘 단백질</p><p class="big"><span class="what done">다 채웠어요</span><span class="chip gd">+50 XP</span></p>`}
      ${mealMeter(T)}
      <p class="meta"><span>오늘 <b class="num">${Math.round(S.p)}</b> / ${T.p}g</span>${left > 0 ? `<button class="linkbtn" data-act="wte">${ico('utensils', 'ico--16')}뭐 먹지?</button>` : ''}</p>
    </section>
    ${lunch}
    </div><div class="col">
    ${comeback}
    ${quest}
    ${rescue}
    ${fwHomeCards()}
    ${P.chapter === 0 ? ch0Card(ch0Status()) : ''}
    ${photoHomeCard()}
    </div></div>`;
};
function lunchCard() {
  if (!lunchOut() || slotAt() !== lunchIdx() || slotSum(lunchIdx())) return '';
  return `<section class="tile lunch sel" aria-label="점심 일반식">
    <div class="l-head">${coach('think', 36)}<p>점심은 일반식이죠? 드신 메뉴를 한 번만 눌러 주세요.<small>점심 목표 ${LUNCH_P}g · ${riceTip()}</small></p></div>
    <div class="menu">${LUNCH.slice(0, 4).map((x, i) => `<button class="m" data-act="lunch" data-n="${esc(x.n)}"><span class="n">${i === 0 ? `<svg class="ico ico--14 star" viewBox="0 0 24 24" role="img" aria-label="단백질 최고">${I.star}</svg>` : ''}${esc(x.n)}</span><span class="p num">${x.p}g<small>${x.k}kcal</small></span></button>`).join('')}</div>
    <button class="more" data-act="lunchAll">${ico('search', 'ico--16')}백반·국밥·구내식당 등 다른 메뉴</button></section>`;
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
    <div class="list">${LUNCH.map(x => `<div><button class="linkbtn ink" style="flex:1" data-act="lunch" data-n="${esc(x.n)}">${esc(x.n)}</button><span class="fq-t-caption">단백질 ${x.p}g · ${x.k}kcal</span></div>`).join('')}</div>`);
}
function weekDone() { const mon = mondayOf(dayKey()); return Object.keys(DB.done).filter(k => daysBetween(mon, k) >= 0).length; }
const wLabel = (id, w) => EX[id].kind === 'as' ? `보조 ${w}` : `${w}`;
const TAPE_SVG = `<svg class="tape-svg" viewBox="0 0 240 284" role="img" aria-label="어깨 둘레는 삼각근 가장 튀어나온 곳, 허리 둘레는 배꼽 높이에서 잰다는 그림">
  <g class="body"><ellipse cx="120" cy="34" rx="17" ry="21"/><path d="M111 54h18v12h-18z"/>
    <path d="M110 64 72 76Q54 82 51 102L45 168 42 222 55 224 63 170 69 128 76 150 82 198 86 252H154L158 198 164 150 171 128 177 170 185 224 198 222 195 168 189 102Q186 82 168 76L130 64Z"/></g>
  <path class="faint" d="M69 128Q120 150 171 128"/>
  <path class="sh back" d="M46 100A74 11 0 0 1 194 100"/><path class="sh" d="M46 100A74 11 0 0 0 194 100"/>
  <path class="wa back" d="M82 190A38 7 0 0 1 158 190"/><path class="wa" d="M82 190A38 7 0 0 0 158 190"/>
  <circle class="dot" cx="120" cy="196" r="2.4"/>
  <path class="sh lead" d="M186 95 176 48"/><text class="t-sh" x="146" y="28">① 어깨</text><text class="t-sub" x="146" y="42">삼각근 가장 넓은 곳</text>
  <path class="wa lead" d="M156 194 166 250"/><text class="t-wa" x="160" y="264">② 허리</text><text class="t-sub" x="160" y="277">배꼽 높이</text>
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
  return `<section class="tile card-pad ${s.ready ? 'sel' : ''}" aria-label="정직한 2주"><div class="q-row"><p class="lab">정직한 2주</p><span class="chip num">D+${s.n}/14</span></div>
    ${s.ready ? `<h2 class="fq-t-title">진실의 거울</h2><p class="fq-t-body">내 진짜 유지 칼로리는 <b class="num">${fmt(s.tdee)}</b>kcal예요. 이제 이 숫자로 가요.</p><button class="fq-btn fq-btn--lg fq-btn--block" data-act="ch0Done" data-t="${s.tdee}">챕터 ${rec} ${CH[rec].name} 시작 · +500 XP</button>`
      : `<p class="fq-t-body">평소처럼 먹고 <b>전부</b> 기록해요. 억지로 줄이지 않기. 14일 뒤 내 몸의 진짜 유지 칼로리가 나와요.</p>
      <div class="grid2 nums2"><div><span class="fq-t-caption">체중 기록</span><span class="fq-t-num-md">${s.wDays}<small>/8일+</small></span></div><div><span class="fq-t-caption">식단 기록</span><span class="fq-t-num-md">${s.fDays}<small>/10일+</small></span></div></div>`}
  </section>`;
}

/* ================= DIET ================= */
R.diet = () => {
  const T = targets(), S = daySum(), names = mealNames(), split = mealSplit(T.p), k = dayKey(), lunch = lunchCard(), { nt, cur, left } = nextTarget();
  $('#scr-diet').innerHTML = `
    <header class="topbar"><div><h1 class="fq-t-title">오늘 식단</h1><p class="fq-t-caption">${kDate(k).getMonth() + 1}월 ${kDate(k).getDate()}일 ${DOW[dow(k)]}요일</p></div><span class="chip on-surface">${T.train ? '운동일' : '휴식일'}</span></header>
    <div class="cols"><div class="col">
    <section class="tile sum pop" aria-label="오늘 합계">
      <div class="sum-row"><span class="lab">단백질</span><span><span class="num b">${Math.round(S.p)}</span><span class="of num"> / ${T.p}g</span></span></div>
      ${mealMeter(T, true)}
      <p class="kcal">칼로리 <b class="num">${fmt(S.k)}</b> / ${fmt(T.kcal)}kcal · 탄수 ${Math.round(S.c)}/${T.c}g · 지방 ${Math.round(S.f)}/${T.f}g</p>
      ${left > 0 && !lunch ? `<p class="kcal">다음 끼니는 <b>${nextMealName()}</b> · 단백질 <b class="num">${nt}</b>g</p>` : ''}
    </section>
    ${names.map((n, i) => { const items = dayFoods().filter(f => f.slot === i), got = items.reduce((a, f) => a + f.p, 0), kc = items.reduce((a, f) => a + f.k, 0);
      return `<section class="tile card-pad mealcard" style="--o:2" aria-label="${n}"><div class="row row--between"><h2 class="fq-t-heading">${n}</h2><span class="fq-t-label"><b class="num">${Math.round(got)}</b> / ${split[i]}g · ${fmt(kc)}kcal</span></div>
        ${!items.length && i === lunchIdx() && lunchOut() && !lunch ? `<button class="fq-btn fq-btn--secondary" style="justify-self:start" data-act="lunchAll">점심 일반식 고르기 · 목표 ${LUNCH_P}g</button>` : ''}
        ${items.length ? `<div class="items">${items.map(f => `<div><span>${esc(f.n)}</span><span class="row" style="gap:4px"><span class="muted num">${f.p}g · ${f.k}kcal</span><button class="xbtn" data-act="delFood" data-id="${f.id}" aria-label="${esc(f.n)} 삭제">${ico('x', 'ico--16')}</button></span></div>`).join('')}</div>` : `<p class="fq-t-caption">아직 기록 없음 · 목표 단백질 ${split[i]}g</p>`}</section>`; }).join('')}
    </div><div class="col">
    ${lunch.replace('<section class="tile lunch', '<section style="--o:1" class="tile lunch')}
    <div class="stack" style="--o:3;gap:12px"><div class="sec-title"><h2 class="fq-t-heading">내 단골 · 1탭 기록</h2><span class="fq-t-caption">3번 먹으면 자동 등록</span></div>
    ${favRow()}</div>
    <button class="fq-btn fq-btn--secondary fq-btn--block fq-btn--lg" style="--o:3" data-act="wte">${ico('utensils')}뭐 먹지? · 남은 목표에 맞는 3가지</button>
    <label class="tile card-pad check-row" style="--o:3"><input type="checkbox" id="allLogged" data-act="allLogged" ${DB.flags['all_' + k] ? 'checked' : ''}><span><b>오늘 먹은 거 다 적었어요</b><br><span class="fq-t-caption">완전 기록일 +20 XP · 정체기 원인을 찾는 데 쓰여요</span></span></label>
    </div></div>`;
};
function favList() {
  const cutoff = addDays(dayKey(), -30), cnt = {};
  DB.foods.filter(f => daysBetween(cutoff, f.day) >= 0).forEach(f => { const c = cnt[f.n] = cnt[f.n] || { ...f, count: 0 }; c.count++; });
  const mine = Object.values(cnt).filter(c => c.count >= 3).sort((a, b) => b.count - a.count).map(c => ({ n: c.n, p: c.p, k: c.k, c: c.c, f: c.f, mine: 1 }));
  return mine.concat(BASE_FAVS.filter(b => !mine.some(m => m.n === b.n))).slice(0, 10);
}
const favRow = () => `<div class="menu">${favList().slice(0, 6).map((f, i) => `<button class="m" data-act="fav" data-i="${i}"><span class="n">${esc(f.n)}</span><span class="p num">${f.p}g<small>${f.mine ? '단골 · ' : ''}${f.k}kcal</small></span></button>`).join('')}</div>`;
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
  toast(`<span>${esc(String(x.n).slice(0, 14))} +${Math.round(x.p)}g${cleared ? ' · 단백질 클리어' : ''}${xp ? ` <em>+${xp} XP</em>` : ''}</span><span class="sub">${n2.left > 0 ? `다음 끼니 ${n2.nt}g` : '오늘 목표 끝'}</span>`);
  showLevelUp();
}

/* ================= CAMERA / FOOD INPUT ================= */
let FR = null; // food result {photo, items:[{n,g,k,p,c,f,conf,q}], asked}
R.cam = () => {
  const names = mealNames();
  $('#scr-cam').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">음식 기록</h1><span class="chip on-surface">${names[Math.min(slotAt(), names.length - 1)]} · 자동</span></header>
    <div class="cols"><div class="col">
    <section class="tile shutter-area">
      <div class="l-head">${coach('think', 36)}<p>사진 1장이면 끝나요.<small>${DB.settings.gkey ? 'AI가 음식·양·단백질을 추정해요. 틀리면 양만 고치면 돼요.' : '사진 AI를 쓰려면 설정에서 제미나이 키를 넣어 주세요. 지금은 글로 기록할 수 있어요.'}</small></p></div>
      <label class="shutter" aria-label="사진 찍기 또는 고르기">${ico('camera', 'ico--32')}<input type="file" id="foodPhoto" accept="image/*"></label>
      <button class="fq-btn fq-btn--secondary" data-act="textIn">${ico('text')}글로 입력</button>
    </section>
    </div><div class="col">
    <div class="sec-title"><h2 class="fq-t-heading">내 단골 · 1탭 기록</h2></div>
    ${favRow()}
    <div id="foodResult"></div>
    </div></div>`;
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
    ${!FR.asked && low >= 0 ? `<div class="preview ask"><span class="fq-eyebrow">확인 1개만</span><b>${esc(items[low].n)} 양이 맞나요?</b><div class="qty">${[['적게', .5], ['사진대로', 1], ['더 많이', 1.5]].map(o => `<button class="fq-chip" data-act="ask" data-i="${low}" data-q="${o[1]}">${o[0]}</button>`).join('')}</div></div>` : ''}
    <div>${items.map((x, i) => `<div class="fitem"><div class="fitem-top"><span><b>${esc(x.n)}</b><br><span class="conf">${[1, 2, 3].map(n => `<i ${n <= x.conf ? 'data-on' : ''}></i>`).join('')} 신뢰도 ${['', '낮음', '보통', '높음'][x.conf] || '보통'} · ${Math.round(x.g * x.q)}g</span></span><span class="p num">${Math.round(x.p * x.q)}<small>g</small></span><span class="k">${x.conf < 3 ? `${Math.round(x.k * x.q * .9)}–${Math.round(x.k * x.q * 1.1)}` : Math.round(x.k * x.q)}<small>kcal</small></span></div>
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
/* 0927 제미나이 모델: 기본 gemini-3.5-flash → 안 되면 내 키로 쓸 수 있는 더 낮은 flash 로 차례로 (모델 목록을 물어봐 7일 기억, 되는 모델은 다음에 먼저) */
const GEM_PREF = 'gemini-3.5-flash';
async function gemModels(key) {
  let found = [];
  try {
    const c = JSON.parse(localStorage.getItem('fq.gmodels') || 'null');
    if (c && Date.now() - c.at < 7 * 864e5) found = c.list;
    else {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${encodeURIComponent(key)}`), j = await r.json().catch(() => ({}));
      const ver = n => (n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1] * 1;
      found = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => String(m.name).replace(/^models\//, ''))
        .filter(n => /^gemini-\d+(\.\d+)?-flash(-lite)?$/.test(n)).sort((a, b) => (/lite/.test(a) - /lite/.test(b)) || ver(b) - ver(a));
      if (found.length) localStorage.setItem('fq.gmodels', JSON.stringify({ at: Date.now(), list: found }));
    }
  } catch (e) {}
  const ok = localStorage.getItem('fq.gmodelOK');
  return [...new Set([DB.settings.gmodel, ok, GEM_PREF, ...found, 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'].filter(Boolean))];
}
async function gemCall(key, parts, errMsg) {
  let lastErr = '쓸 수 있는 제미나이 모델을 찾지 못했어요';
  for (const m of await gemModels(key)) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { response_mime_type: 'application/json', temperature: .2 } }) });
    const j = await r.json().catch(() => ({})), em = (j.error && j.error.message) || '';
    if (r.status === 404 || (r.status === 400 && /not (found|supported)|is not available|unsupported model/i.test(em))) { lastErr = `${m} 없음`; continue; }   // 이 키로 없는 모델 → 다음(낮은) 모델
    if (!r.ok) throw new Error(r.status === 400 || r.status === 403 ? (em || errMsg).slice(0, 120) : r.status === 429 ? '무료 사용량을 넘었어요. 잠시 후 다시' : em || r.status);
    try { localStorage.setItem('fq.gmodelOK', m); } catch (e) {}
    const txt = ((j.candidates || [])[0]?.content?.parts || []).map(p => p.text || '').join('');
    return JSON.parse(txt.replace(/^```json|```$/g, ''));
  }
  throw new Error(lastErr);
}
async function geminiFood(file) {
  const b64 = await downscale(file), key = DB.settings.gkey.trim();
  const prompt = '이 음식 사진을 한국 음식 기준으로 항목별로 추정해 줘. 보이는 양 그대로(1인분이라고 가정하지 말 것). JSON만 출력: {"items":[{"n":"음식 이름(한국어)","g":그램,"k":kcal,"p":단백질g,"c":탄수화물g,"f":지방g,"conf":1~3}]} conf 3=확실 2=보통 1=불확실. 음식이 아니면 {"items":[]}.';
  const data = await gemCall(key, [{ inline_data: { mime_type: 'image/jpeg', data: b64 } }, { text: prompt }], '키를 확인해 주세요');
  const num = (v, a, b) => Math.min(b, Math.max(a, +v || 0));
  return (data.items || []).slice(0, 8).map(x => ({ n: String(x.n || '음식').slice(0, 30), g: num(x.g, 0, 2000), k: num(x.k, 0, 3000), p: num(x.p, 0, 250), c: num(x.c, 0, 400), f: num(x.f, 0, 200), conf: Math.round(num(x.conf, 1, 3)) || 2 }));
}

/* ================= WORKOUT TAB ================= */
R.work = () => {
  const k = dayKey(), tpl = tplFor(k), mon = mondayOf(k);
  const week = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = addDays(mon, i), t = tplFor(d); return { d, t, s: DB.done[d] ? 'done' : d === k ? 'today' : t ? '' : 'rest' }; });
  const ws = weekSets();
  $('#scr-work').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">운동</h1><button class="linkbtn" data-act="schedule">${ico('repeat', 'ico--16')}${DB.rot && DB.rot.on ? `로테이션 ${rotWeek(k) + 1}주차 · 바꾸기` : '요일 바꾸기'}</button></header>
    <div class="cols"><div class="col">
    ${roleStrip()}
    <ol class="week" aria-label="이번 주 루틴">${week.map(w => `<li class="day" data-s="${w.s}" aria-label="${DOW[dow(w.d)]}요일, ${w.t ? TPL[w.t].code : '휴식'}"><small>${DOW[dow(w.d)]}</small>${w.t ? `<b>${TPL[w.t].code.replace('·', '<br>')}</b>` : ico('moon', 'ico--16')}</li>`).join('')}</ol>
    <section class="fq-card stack" style="gap:10px"><div class="row row--between"><h2 class="fq-t-heading">이번 주 우선 부위</h2><span class="fq-t-caption">완료 / 목표 세트</span></div>
      ${[['측면 삼각근', 'delt-side'], ['광배근', 'lats'], ['윗가슴', 'chest-upper']].map(p => `<div class="stack" style="gap:6px"><div class="row row--between"><span class="fq-t-label">${p[0]}</span><span class="fq-t-caption num">${ws[p[1]] || 0}/${BP_T[p[1]]}</span></div><div class="bar" style="--p:${Math.min(100, (ws[p[1]] || 0) / BP_T[p[1]] * 100)}"><i></i></div></div>`).join('')}</section>
    <div class="stack pro-sec" style="--o:5">${proSection(tpl)}</div>
    </div><div class="col">
    ${tpl ? `<div class="stack today-sec" style="--o:3"><div class="sec-title"><h2 class="fq-t-heading">오늘 · ${TPL[tpl].ko}</h2><span class="fq-t-caption">약 ${DB.profile.sessionMin}분</span></div>
      ${DB.done[k] ? `<p class="chip rd" style="justify-self:start">${ico('check', '')}오늘 완료</p>` : `<button class="fq-btn fq-btn--lg fq-btn--block sel" data-act="startQuest">${ico('play', 'fill')}운동 시작</button>${DB.flags['pp_' + mon] ? '' : '<button class="linkbtn" data-act="postpone" style="justify-self:center;margin-top:-8px">내일로 미루기 (주 1회)</button>'}`}
      ${TPL[tpl].by ? `<a class="src" href="${TPL[tpl].video}" target="_blank" rel="noopener">${ico('ext', 'ico--16')}<span>${esc(TPL[tpl].by)} 원본 영상 · 운동별 팁도 이 영상에서 가져왔어요</span></a>` : ''}
      ${TPL[tpl].ex.map(([id, n, o]) => exCard(id, n, o, tpl)).join('')}</div>`
    : `<section class="tile card-pad" style="--o:3"><div class="l-head">${coach('idle', 40)}<p>오늘은 휴식일이에요.<small>걷기 7천 보면 충분해요. 그래도 하고 싶으면 루틴을 골라요.</small></p></div><button class="fq-btn fq-btn--secondary fq-btn--block" data-act="pickTpl">루틴 골라서 운동하기</button></section>`}
    </div></div>`;
};
const PART_KO = { back: '등', chest: '가슴', shoulder: '어깨', arms: '팔', legs: '하체' };
let proAll = false;
function roleStrip() {
  const mine = (DB.profile.creators || []).map(id => CREATORS.find(c => c.id === id)).filter(Boolean);
  return `<section class="fq-card stack" style="gap:10px" aria-label="롤모델"><div class="row row--between"><h2 class="fq-t-heading">내 롤모델</h2><button class="linkbtn" data-act="crPick">바꾸기</button></div>
    <div class="role-row">${mine.map(c => `<button class="rm" data-act="crCard" data-v="${c.id}">${avatar(c, 'av av--md')}<span><b>${esc(c.name)}</b><small>${esc(c.tag)}</small></span></button>`).join('')}<button class="rm rm--add" data-act="crAdd"><span class="pl">${ico('plus')}</span><span><b>내 유튜버 추가</b><small>영상 링크로 학습</small></span></button></div></section>`;
}
function crCard(id) {
  const c = CREATORS.find(x => x.id === id);
  sheet(`<div class="row row--between"><span class="fq-badge">${c.tag}</span><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <h2 class="fq-t-title">${c.name} 스타일</h2><p class="fq-t-caption" style="margin:-6px 0 0">${c.body} · 영상 ${c.videos}개 분석</p>
    <section class="fq-card stack"><span class="fq-eyebrow">운동 방식</span>${c.style.map(t => `<span class="fq-t-body" style="font-size:15px">· ${esc(t)}</span>`).join('')}</section>
    <section class="fq-card stack"><span class="fq-eyebrow">식단 방식</span>${c.diet.map(t => `<span class="fq-t-body" style="font-size:15px">· ${esc(t)}</span>`).join('')}<span class="fq-t-caption">숫자 목표는 내 인바디 기준으로 앱이 계산해요.</span></section>
    <section class="fq-card stack"><span class="fq-eyebrow">내 로테이션에 들어가는 루틴</span>${c.tpls.filter(t => TPL[t]).map(t => TPL[t].cr ? `<button class="linkbtn ink" data-act="fwView" data-t="${t}">${esc(TPL[t].ko)} · 새 루틴${TPL[t].off ? ' · 쉬는 중' : ''}</button>` : `<button class="linkbtn ink" data-act="proGo" data-t="${t}">${esc(TPL[t].ko)} · 지금 하기</button>`).join('')}</section>
    ${c.ch ? `<a class="src" href="https://www.youtube.com/${c.ch}" target="_blank" rel="noopener">${ico('ext', 'ico--16')}<span>${c.name} 채널 · 루틴 출처</span></a>` : ''}
    ${c.user ? `<button class="fq-btn fq-btn--ghost fq-btn--block" data-act="crDel" data-v="${c.id}" style="--_fg:var(--red-ink)">${esc(c.name)} 학습 데이터 지우기</button>` : ''}`);
}
function crPickSheet() {
  const cur = DB.profile.creators || [];
  sheet(`<div class="row row--between"><h2 class="fq-t-title">되고 싶은 몸</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-caption" style="margin:-6px 0 0">고른 사람의 루틴이 매주 로테이션에 더 자주 들어와요.</p>
    <div class="cards">${CREATORS.map(c => crButton(c, 'crToggle', cur.includes(c.id))).join('')}</div>
    <button class="add" data-act="crAdd"><span class="pl">${ico('plus')}</span><span><b>내 유튜버 추가</b><span>영상 링크를 붙여 넣으면 루틴을 배워서 로테이션에 넣어요.</span></span></button>`);
}
/* ---------- 유튜버 추가 (BYO): 제미나이가 유튜브 링크를 직접 보고 루틴으로 정리 — 영상은 내려받지 않음 ---------- */
let CR_PRE = null; // { name, url, cr } — 새 영상 카드에서 열면 채워 둠
function crAddSheet(msg = '', pre) {
  const has = !!DB.settings.gkey; if (pre !== undefined) CR_PRE = pre;
  const P = CR_PRE || {};
  sheet(`<div class="row row--between"><h2 class="fq-t-title">내 유튜버 추가</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-caption" style="margin:-6px 0 0">좋아하는 유튜버의 루틴 영상 링크를 넣으면 앱이 학습해서 내 로테이션에 넣어요. 영상은 내려받지 않고, 운동 중 "동작 보기"는 원본 영상으로 재생돼요.</p>
    ${has ? '' : '<p class="fq-card" style="margin:0">먼저 설정 → 사진 AI에 제미나이 무료 키를 넣어 주세요 (aistudio.google.com/apikey).</p>'}
    <label class="stack" for="crName" style="gap:6px"><span class="fq-t-label">유튜버 이름</span><input id="crName" class="inp" placeholder="예: 김계란" value="${esc(P.name || '')}"></label>
    <label class="stack" for="crUrls" style="gap:6px"><span class="fq-t-label">루틴 영상 링크 (한 줄에 하나, 최대 5개)</span><textarea id="crUrls" class="inp" rows="4" style="padding:12px;min-height:110px" placeholder="https://youtu.be/…">${esc(P.url || '')}</textarea></label>
    ${msg ? `<p class="fq-t-body err">${esc(msg)}</p>` : ''}
    <button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="crLearn" ${has ? '' : 'disabled'}>학습 시작</button>
    <p class="note" style="margin:0">영상 1개에 30초~1분 걸려요. 영상에서 말하지 않은 세트·횟수는 비워 두고 앱 기본값으로 채워요. 학습한 루틴은 이 폰에만 저장돼요.</p>`);
}
const ytId = u => { const m = String(u).match(/(?:youtu\.be\/|v=|shorts\/|live\/)([\w-]{11})/); return m ? m[1] : null; };
async function geminiVideo(url) {
  const key = DB.settings.gkey.trim(), cat = Object.entries(EX).filter(([k]) => !k.startsWith('X')).map(([k, e]) => `${k}=${e.n}`).join(', ');
  const prompt = `이 유튜브 운동 영상을 보고 영상 속 운동 루틴을 정리해 줘. 영상에서 실제로 말하거나 화면에 보인 것만 쓰고, 없으면 null. JSON만 출력:
{"title":"짧은 루틴 이름(한국어, 20자 이내)","part":"back|chest|shoulder|arms|legs|full 중 하나","exercises":[{"exId":"아래 목록의 id 중 같은 운동이면 그 id, 없으면 null","name":"운동 이름(한국어)","sets":정수|null,"reps":[최소,최대]|null,"rest":초|null,"tip":"영상에서 강조한 자세 팁 한 문장(한국어, 60자 이내)|null","t":"그 운동이 처음 나오는 시각 MM:SS|null","conf":"high|med|low"}],"style":["이 사람 운동 방식 특징 3개(한국어 짧게)"],"diet":["식단 관련 조언이 있으면 최대 2개, 없으면 빈 배열"]}
운동 목록(id=이름): ${cat}`;
  return gemCall(key, [{ file_data: { file_uri: url } }, { text: prompt }], '키나 링크를 확인해 주세요');
}
const PART_OK = ['back', 'chest', 'shoulder', 'arms', 'legs', 'full'];
const PART_MUS = { back: ['lats'], chest: ['chest'], shoulder: ['delt-side'], arms: ['biceps'], legs: ['quads'], full: ['quads'] };
let CR_DRAFT = null;
async function crLearn() {
  const name = ($('#crName').value || '').trim().slice(0, 20), urls = [...new Map(($('#crUrls').value || '').split(/\s+/).filter(ytId).map(u => [ytId(u), u])).values()].slice(0, 5);
  if (!name) return crAddSheet('유튜버 이름을 넣어 주세요.');
  if (!urls.length) return crAddSheet('유튜브 링크를 한 개 이상 넣어 주세요.');
  const today = dayKey(), used = (DB.flags['cradd_' + today] || 0);
  if (used >= 3) return crAddSheet('오늘은 유튜버를 3명까지 추가했어요. 내일 다시 해 주세요.');
  sheet(`<h2 class="fq-t-title">${esc(name)} 학습 중…</h2><p class="fq-t-body" id="crProg" style="margin:0">영상 0 / ${urls.length}</p><p class="note" style="margin:0">화면을 켜 둔 채로 기다려 주세요.</p>`);
  const out = [], errs = [];
  for (let i = 0; i < urls.length; i++) {
    try { const d = await geminiVideo(urls[i]); out.push({ url: urls[i], d }); } catch (e) { errs.push(`${i + 1}번 영상: ${e.message}`); }
    const pg = $('#crProg'); if (pg) pg.textContent = `영상 ${i + 1} / ${urls.length}`;
  }
  if (!out.length) return crAddSheet(errs.join(' / ') || '학습하지 못했어요.');
  CR_DRAFT = { name, out, errs, cr: CR_PRE && CR_PRE.name === name && CREATORS.some(c => c.id === CR_PRE.cr) ? CR_PRE.cr : null };
  crReview();
}
function crReview() {
  const { name, out, errs } = CR_DRAFT;
  sheet(`<div class="row row--between"><h2 class="fq-t-title">${esc(name)} 루틴 확인</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    ${out.map(({ d, url }) => `<section class="fq-card stack" style="gap:6px"><div class="row row--between"><b>${esc(d.title || '루틴')}</b><span class="fq-badge">${PART_NAME[d.part] || '맞춤'}</span></div>
      <div class="pro-ex">${(d.exercises || []).slice(0, 10).map((e, j) => `<div><span class="num muted">${j + 1}</span><span><b>${esc(e.name)}</b><small>${e.exId && EX[e.exId] ? '앱 운동과 연결됨' : '새 운동 · 사진 없음'}${e.conf === 'low' ? ' · 확인 필요' : ''}${e.tip ? ' · ' + esc(e.tip) : ''}</small></span><span class="fq-t-label">${e.sets ? e.sets + '세트' : '기본값'}${e.reps ? ' · ' + e.reps.join('–') + '회' : ''}</span></div>`).join('')}</div>
      <a class="src" href="${esc(url)}" target="_blank" rel="noopener">${ico('ext', 'ico--16')}<span>원본 영상</span></a></section>`).join('')}
    ${errs.length ? `<p class="note" style="margin:0">못 읽은 영상: ${esc(errs.join(' / '))}</p>` : ''}
    <button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="crSave">내 로테이션에 추가</button>
    <p class="note" style="margin:0">"새 운동"은 사진 대신 원본 영상으로 동작을 보여 줘요.</p>`);
}
/* 제미나이 결과 하나 → DB.custom.tpls 에 루틴 저장, 키 반환 (운동 못 찾으면 null). extra 는 auto·cr 등 표시 */
function crTpl(name, d, url, extra = {}) {
  const c = DB.custom = DB.custom || { ex: {}, tpls: {}, creators: [] };
  const part = PART_OK.includes(d.part) ? d.part : 'full', vid = ytId(url), key = 'U' + uid();
  const ex = (d.exercises || []).slice(0, 10).map(e => {
    let id = e.exId && EX[e.exId] && !String(e.exId).startsWith('X') ? e.exId : null;
    const reps = Array.isArray(e.reps) && e.reps.length === 2 && e.reps[0] > 0 && e.reps[1] >= e.reps[0] && e.reps[1] <= 50 ? e.reps.map(Math.round) : null;
    if (!id) { id = 'X' + uid(); c.ex[id] = { n: String(e.name || '운동').slice(0, 24), img: null, eq: '영상 참고', kind: 'mc', inc: 2.5, rest: Math.min(180, Math.max(45, +e.rest || 90)), range: reps || [8, 12], mus: PART_MUS[part], def: 10, v: null }; EX[id] = c.ex[id]; }
    const t = /^\d{1,2}:\d{2}$/.test(e.t || '') ? e.t.padStart(5, '0') : null, sec = t ? +t.slice(0, 2) * 60 + +t.slice(3) : 0;
    const o = { t: { u: `https://youtu.be/${vid}${sec ? '?t=' + sec : ''}`, t: t || '00:00', who: name, label: d.title || '' } };
    if (e.tip) o.tip = String(e.tip).slice(0, 80); if (reps) o.r = reps; if (!e.sets || !reps) o.d = 1;
    return [id, Math.min(6, Math.max(1, Math.round(+e.sets || 3))), o];
  }).filter(Boolean);
  if (!ex.length) return null;
  c.tpls[key] = { code: PART_NAME[part] || '맞춤', ko: `${name} · ${String(d.title || '루틴').slice(0, 20)}`, by: name, video: url, pro: 1, user: 1, parts: [part === 'full' ? 'legs' : part], ex, ...extra };
  return key;
}
function crSave() {
  const { name, out, cr } = CR_DRAFT, tpls = [], styles = [], diets = [];
  out.forEach(({ d, url }) => {
    const key = crTpl(name, d, url, cr ? { cr, from: ytId(url), at: Date.now(), day: dayKey() } : {}); if (!key) return;
    tpls.push(key); (d.style || []).slice(0, 3).forEach(x => styles.push(String(x).slice(0, 60))); (d.diet || []).slice(0, 2).forEach(x => diets.push(String(x).slice(0, 60)));
  });
  if (!tpls.length) return crAddSheet('영상에서 운동을 찾지 못했어요. 루틴 영상 링크인지 확인해 주세요.');
  const c = DB.custom;
  if (cr) out.forEach(({ url }) => fwDone(ytId(url)));   // 기존 유튜버에 붙임 (새 영상 카드에서 배우기)
  else { const cid = 'u_' + uid(); c.creators.push({ id: cid, name, ch: '', tag: '내가 추가', body: `영상 ${out.length}개로 학습한 ${name} 스타일`, mark: name, style: [...new Set(styles)].slice(0, 4), diet: [...new Set(diets)].slice(0, 3), tpls, videos: out.length, user: 1 }); DB.profile.creators = (DB.profile.creators || []).concat(cid); }
  DB.flags['cradd_' + dayKey()] = (DB.flags['cradd_' + dayKey()] || 0) + 1;
  mergeCustom(); save(); CR_DRAFT = null; CR_PRE = null; closeSheet(); SFX.pr(); R[TAB] && R[TAB]();
  toast(`<span>${esc(name)} 루틴 ${tpls.length}개를 로테이션에 넣었어요</span>`, 4000);
}
function proSection(tpl) {
  const want = tpl ? TPL_PARTS[tpl] : null, card = (r, i) => `<button class="pro-card" data-act="pro" data-i="${i}"><div class="who"><span class="fq-badge">${esc(r.creator)}</span><span class="fq-t-caption">${esc(r.meta || '')}</span></div><h4>${esc(r.title)}</h4><span class="fq-t-caption">${esc(r.sub || '')}</span></button>`;
  const idx = ROUTINES.map((r, i) => i), mine = want ? idx.filter(i => ROUTINES[i].parts.some(p => want.includes(p))) : [], rest = idx.filter(i => !mine.includes(i));
  return `<div class="sec-title"><h2 class="fq-t-heading">프로 루틴 공략서</h2><span class="fq-t-caption">${want ? `오늘 부위 · ${want.map(p => PART_KO[p]).join('·')}` : '부위별'}</span></div>
    ${mine.length ? `<div class="pro">${mine.map(i => card(ROUTINES[i], i)).join('')}</div>` : want ? '<p class="note" style="margin:0">오늘 부위에 맞는 공략서가 아직 없어요.</p>' : ''}
    ${proAll || !want ? `<div class="pro">${(want ? rest : idx).map(i => card(ROUTINES[i], i)).join('')}</div>${want ? '<button class="linkbtn" data-act="proAll" style="justify-self:center">접기</button>' : ''}` : `<button class="linkbtn" data-act="proAll" style="justify-self:center">다른 부위 공략서 보기 (${rest.length})</button>`}`;
}
function exCard(id, n, o = {}, tk = '') {
  const E = EX[id], st = prog(id), rg = o.r || E.range, pl = plannedFor(id, n, rg), [bt, why, up] = badgeFor(id);
  return `<article class="fq-card ex">
    <div class="ex-head"><button class="ex-thumb" data-act="howtoId" data-id="${id}" data-t="${tk}" aria-label="${E.n} 동작 보기">${howto(id)}</button><div style="flex:1;min-width:0"><h3 class="fq-t-heading">${E.n}</h3><span class="fq-t-caption">${E.eq} · ${n}세트 · ${rg[0]}–${rg[1]}회${o.d ? ' (앱 기본값)' : ''}</span></div><span class="chip ${up ? 'rd' : ''}">${bt}</span></div>
    <div class="ex-cmp"><div class="last"><span class="fq-eyebrow">지난번</span><span class="num">${st.n ? lastStr(id) : '—'}</span></div>
    <div class="today"><span class="fq-eyebrow">오늘</span><span class="v"><span class="num wbig">${wLabel(id, pl.w)}</span><span class="fq-unit">kg</span><span class="num">× ${pl.reps.join('/')}</span></span></div></div>
    <span class="fq-t-caption">${pl.gap > 10 ? `${pl.gap}일 쉬어서 무게를 낮췄어요` : why}</span>${o.tip && tk ? `<span class="fq-t-caption ink"><b>${esc(TPL[tk].by)}</b> · ${esc(o.tip)}</span>` : ''}</article>`;
}
function lastSets(id) { for (let i = DB.sessions.length - 1; i >= 0; i--) { const e = DB.sessions[i].ex.find(x => x.id === id); if (e && e.sets.length) return e.sets; } return null; }
function lastStr(id) { const ss = lastSets(id); return ss ? `${wLabel(id, ss[0].w)}kg × ${ss.map(s => s.r).join('/')}` : '—'; }
const howto = id => EX[id].img ? `<div class="howto" role="img" aria-label="${esc(EX[id].n)} 시작 자세와 끝 자세"><img src="media/${EX[id].img}_0.jpg" alt="" loading="lazy"><img src="media/${EX[id].img}_1.jpg" alt="" loading="lazy"><span class="lbl"></span></div>` : `<div class="howto howto--none"><span>사진 없음<br>영상에서 보기</span></div>`;
function howSheet(id, o = {}) {
  const E = { ...EX[id], v: o.v || EX[id].v, range: o.range || EX[id].range }, tip = o.tip || TIPS[id];
  sheet(`<div class="row row--between"><h2 class="fq-t-title">${E.n}</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    ${howto(id)}<p class="fq-t-caption" style="margin:-4px 0 0">시작 ↔ 끝 자세 · 사진 free-exercise-db (퍼블릭 도메인)</p>
    <section class="fq-card stack"><span class="fq-eyebrow">세팅</span><span class="fq-t-body" style="font-size:15px">${E.eq} · 목표 ${E.range[0]}–${E.range[1]}회 · 휴식 ${E.rest}초</span>${tip ? `<div class="l-head" style="margin-top:6px">${coach('focus', 32)}<p>${esc(tip.t)}<small>${esc(tip.who)} 팁</small></p></div>` : ''}</section>
    ${E.v ? `<a class="fq-btn fq-btn--lg fq-btn--block" href="${E.v.u}" target="_blank" rel="noopener">${ico('cplay')}원본 영상 보기 · ${esc(E.v.who)} ${E.v.t !== '00:00' ? E.v.t : ''}</a><p class="fq-t-caption center" style="margin:-6px 0 0">${esc(E.v.label)}${E.v.t !== '00:00' ? ' · 그 운동 장면부터 재생돼요' : ''}</p>` : ''}`);
}

/* ================= LOGGER ================= */
let W = null;
function condSheet(tplKey) {
  sheet(`<div class="l-head">${coach('think', 44)}<div><h2 class="fq-t-title">오늘 컨디션은요?</h2><p class="fq-t-caption">고르면 바로 첫 세트예요. 줄여도 끝까지 하면 똑같이 완료예요.</p></div></div>
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
  if (W.rest) return restView();
  const { e, k } = curSet(), E = EX[e.id], inc = incOf(e.id);
  const s = k >= 0 ? e.sets[k] : null, tip = e.tip || TIPS[e.id], st = prog(e.id), last = st.n ? lastStr(e.id) : null, rg = e.range || E.range, vv = e.v || E.v;
  const setName = (x, j) => x.bonus ? '보너스' : `${j + 1}세트`;
  $('#scr-logger').innerHTML = `
    ${wkTop(`<b>${esc(TPL[W.tpl].code)}</b>`)}
    <div class="lg-grid"><div class="lg-main">
      <p class="lab">${esc(E.eq)}${E.mus.some(m => ['delt-side', 'lats', 'chest-upper'].includes(m)) ? ' · V자 우선 부위' : ''}</p>
      <h1 class="lg-name">${E.n}</h1>
      <div class="lg-photo">${howto(e.id)}<button class="watch" data-act="howtoEx" data-i="${W.i}">${ico('cplay')}동작 보기${vv ? ` <small>${esc(vv.who)}${vv.t !== '00:00' ? ` ${vv.t}부터` : ''}</small>` : ''}</button></div>
      ${W.feel ? `<div class="tile feel sel">${coach('wow', 40, 'feelCoach')}<div><p class="fq-t-heading">${E.n} 끝! 어땠어요?</p><p class="fq-t-caption">다음 무게를 정하는 데 써요.</p></div>
        <div class="chips">${['쉬웠다', '딱 좋다', '한계'].map(f => `<button class="fq-chip" data-act="feel" data-f="${f}">${f}</button>`).join('')}</div></div>`
      : `<div class="tip">${coach('focus', 40, 'lgCoach')}<p>${tip ? esc(tip.t) : s ? `${setName(s, k)}, 목표 ${rg[0]}–${rg[1]}회예요.` : '이 운동은 끝났어요.'}<small>${tip ? `${esc(tip.who)} 팁` : '마지막 1~2회가 힘들면 딱 맞는 무게예요'}</small></p></div>`}
      <div class="sets" role="list" aria-label="세트 진행">${e.sets.map((x, j) => x.done
        ? `<div class="set done${x.pr ? ' pr' : ''}" role="listitem">${x.pr ? '새 기록' : setName(x, j)}<b>${ico('check', 'ico--16')}${wLabel(e.id, x.w)} × ${x.r}</b></div>`
        : `<div class="set${j === k && !W.feel ? ' cur sel' : ''}" role="listitem" ${j === k ? 'aria-current="step"' : ''}>${setName(x, j)}<b class="num">${j === k ? '지금' : `${wLabel(e.id, x.w)} × ${x.r}`}</b></div>`).join('')}</div>
      <p class="last">${last ? `지난번 <b>${last}</b> · ` : ''}목표 ${rg[0]}–${rg[1]}회${e.d ? ' (앱 기본값)' : ''} · 휴식 ${e.rest}초</p>
      <div class="lg-tools" style="--o:2"><button class="fq-chip" data-act="pain">${ico('alert', 'ico--16')}통증</button><button class="fq-chip" data-act="skip">${ico('skip', 'ico--16')}건너뛰기</button></div>
    </div><div class="lg-side">
      ${s ? `<div class="steppers" style="--o:1">
        <div class="tile stp" role="group" aria-label="무게"><span class="lab">${E.kind === 'as' ? '보조 무게' : '무게'}</span><span class="v"><span class="num" id="wV">${s.w}</span><small>kg</small></span>
          <span class="pm"><button data-act="w-" aria-label="무게 ${inc}kg 줄이기">${ico('minus')}</button><button data-act="w+" aria-label="무게 ${inc}kg 늘리기">${ico('plus')}</button></span></div>
        <div class="tile stp" role="group" aria-label="횟수"><span class="lab">횟수</span><span class="v"><span class="num" id="rV">${s.r}</span><small>회</small></span>
          <span class="pm"><button data-act="r-" aria-label="횟수 1회 줄이기">${ico('minus')}</button><button data-act="r+" aria-label="횟수 1회 늘리기">${ico('plus')}</button></span></div></div>` : ''}
    <div class="dock" style="--o:3"><div class="dock-toast" id="dockToast"></div>${undoRow()}
      ${s ? `<button class="fq-btn fq-btn--xl fq-btn--block btn-done" data-act="setDone" data-j="${k}">${ico('check')}<span>${k === e.sets.length - 1 && W.i === W.ex.length - 1 ? '마지막 세트 완료' : `${setName(s, k)} 완료`}</span></button>`
      : `<button class="fq-btn fq-btn--xl fq-btn--block btn-done${W.feel ? '' : ' sel'}" data-act="${W.i < W.ex.length - 1 ? 'nextEx' : 'finish'}">${W.i < W.ex.length - 1 ? '다음 운동 · ' + EX[W.ex[W.i + 1].id].n : '운동 완료'}</button>`}
    </div></div></div>`;
  tickClock();
};
function wkTop(title) {
  const gym = document.documentElement.classList.contains('gym');
  return `<div class="wk-top">
    <button class="round" data-act="endAsk" aria-label="운동 끝내기">${ico('x')}</button>
    <div class="prog"><p>${title} · <span class="num">${W.i + 1} / ${W.ex.length}</span> 운동 · <span class="num" id="clock">00:00</span></p>
      <div class="dots" style="grid-template-columns:repeat(${W.ex.length},1fr)" aria-hidden="true">${W.ex.map((x, i) => `<i class="${x.sets.every(y => y.done) ? 'd' : i === W.i ? 'c' : ''}"></i>`).join('')}</div></div>
    <button class="round" data-act="gym" aria-pressed="${gym}" aria-label="헬스장 모드">${ico(gym ? 'sun' : 'moon')}</button>
  </div>`;
}
function undoRow() {
  const l = W.log[W.log.length - 1]; if (!l || l.i !== W.i) return '';
  const e = W.ex[W.i], x = e.sets[l.j]; if (!x || !x.done) return '';
  return `<div class="undo"><span>${x.bonus ? '보너스' : `${l.j + 1}세트`} ${wLabel(e.id, x.w)}kg × ${x.r} 저장 <em>+${l.gain} XP</em></span><button data-act="undoSet" data-j="${l.j}">${ico('undo', 'ico--16')}되돌리기</button></div>`;
}
const mmss = s => `${Math.floor(s / 60)}:${pad(s % 60)}`;
const RING_C = 628.3;
const restLeft = () => Math.max(0, Math.ceil(W.rest.len - (Date.now() - W.rest.t0) / 1000));
/* 휴식: 방금 한 세트 → 숨 고르는 코치가 든 둥근 타이머 → 끝나면 시작 버튼으로 테두리 이동 */
function restView() {
  const { e, k } = curSet(), E = EX[e.id], l = W.log[W.log.length - 1], x = W.ex[l.i].sets[l.j], nx = e.sets[k] || x;
  const left = restLeft(), ready = left === 0, [, hi] = e.range || E.range, inc = incOf(e.id);
  const prev = lastSets(e.id), pj = prev && (prev[l.j] || prev[prev.length - 1]);
  const cmp = !pj ? '' : pj.w === x.w ? (x.r !== pj.r ? ` · 지난번 ${x.r > pj.r ? '+' : '−'}${Math.abs(x.r - pj.r)}회` : ' · 지난번과 같아요') : ` · 지난번 ${wLabel(e.id, pj.w)}kg × ${pj.r}`;
  const done = W.ex.reduce((a, y) => a + y.sets.filter(z => z.done).length, 0), total = W.ex.reduce((a, y) => a + y.sets.length, 0);
  $('#scr-logger').innerHTML = `
    ${wkTop(`<b>${esc(E.n)}</b>`)}
    <div class="lg-grid rs"><div class="lg-main">
      <section class="tile fb${W.rest.wow ? ' pop' : ''}" aria-label="방금 한 세트">
        <div class="fb-row"><span class="ck">${ico('check', '')}</span><div><h2>${x.bonus ? '보너스' : `${l.j + 1}세트`} 완료</h2><p><b class="num">${wLabel(e.id, x.w)}kg × ${x.r}회</b>${cmp}</p></div><span class="chip gd num" id="rsXp">+${l.gain} XP</span></div>
        ${x.pr ? `<p class="rec"><span class="ic">${ico('trophy', 'ico--16')}</span>새 기록 · ${esc(E.n)} ${x.w}kg × ${x.r}</p>` : ''}
        <div class="combo"><span class="z">${ico('zap', '')}</span><div style="flex:1;min-width:0"><p><b>${W.combo}콤보</b> ${W.combo % 5 === 0 ? '콤보 보너스 +10 받았어요' : `${5 - W.combo % 5}세트 더 하면 보너스 +10`}</p>
          <div class="pips" style="grid-template-columns:repeat(${total},1fr)" role="img" aria-label="오늘 ${total}세트 중 ${done}세트 완료">${'<i class="d"></i>'.repeat(done)}${'<i></i>'.repeat(total - done)}</div></div></div>
      </section>
      <div class="tile say" style="--o:3">${coach('think', 32)}<p>다음은 ${nx.bonus ? '보너스 세트' : `${k + 1}세트`} · ${wLabel(e.id, nx.w)}kg × ${nx.r}회<small>${E.kind === 'as' ? `모든 세트 ${hi}회를 채우면 다음엔 보조를 ${inc}kg 줄여 드려요` : `모든 세트 ${hi}회를 채우면 다음엔 ${+(nx.w + inc).toFixed(2)}kg로 올려 드려요`}</small></p></div>
    </div><div class="lg-side">
      <div class="ring${ready ? ' over' : ''}" style="--o:1" id="ring">
        <svg class="rg" viewBox="0 0 228 228" aria-hidden="true"><circle class="bg" cx="114" cy="114" r="100"/><circle class="fg" id="ringFg" cx="114" cy="114" r="100" stroke-dasharray="${RING_C}" stroke-dashoffset="${ready ? 0 : (RING_C * (1 - left / W.rest.len)).toFixed(1)}"/></svg>
        <div class="ring-in">${coach(ready ? 'happy' : W.rest.wow ? 'wow' : 'rest', 64, 'rsCoach')}<span class="t num" id="restT" role="timer" aria-label="남은 휴식">${mmss(left)}</span><span class="l" id="restL">${ready ? '휴식 끝' : '숨 고르는 중'}</span></div>
      </div>
      <div class="adj" style="--o:2"><button data-act="rest-" aria-label="휴식 15초 줄이기">−15초</button><button data-act="rest+" aria-label="휴식 15초 늘리기">+15초</button></div>
    <div class="dock" style="--o:4"><div class="dock-toast" id="dockToast"></div>${undoRow()}
      <button class="fq-btn fq-btn--xl fq-btn--block btn-done${ready ? ' sel' : ''}" id="goB" data-act="restSkip">${ico('play', 'fill')}<span id="goT">${nx.bonus ? '보너스 세트' : `${k + 1}세트`} ${ready ? '시작' : '바로 시작'}</span></button></div>
    </div></div>`;
  if (W.rest.wow) { W.rest.wow = false; clearTimeout(restView.t); restView.t = setTimeout(() => { if (W && W.rest && restLeft() > 0) setFace($('#rsCoach'), 'rest'); }, 1600); }
  tickClock();
}
let clockT = null, wakeLock = null;
async function keepAwake(on) { try { if (on && 'wakeLock' in navigator && !wakeLock) wakeLock = await navigator.wakeLock.request('screen'); if (!on && wakeLock) { wakeLock.release(); wakeLock = null; } } catch (e) {} }
function tickClock() {
  clearInterval(clockT);
  const tick = () => {
    if (TAB !== 'logger' || !W) return clearInterval(clockT);
    const s = Math.floor((Date.now() - W.t0) / 1000), c = $('#clock'); if (c) c.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
    const ring = $('#ring'); if (!W.rest || !ring) return;
    const left = restLeft();
    $('#restT').textContent = mmss(left);
    $('#ringFg').style.strokeDashoffset = left ? (RING_C * (1 - left / W.rest.len)).toFixed(1) : 0;
    if (left === 0 && !ring.classList.contains('over')) {
      ring.classList.add('over'); $('#restL').textContent = '휴식 끝'; $('#goB').classList.add('sel'); $('#goT').textContent = $('#goT').textContent.replace('바로 시작', '시작');
      setFace($('#rsCoach'), 'happy'); say('휴식 끝. 다음 세트를 시작하세요'); buzz([30, 60, 30]); SFX.ready();
    }
    if (left === 10 && !W.rest.warned) { W.rest.warned = true; buzz(15); }
  };
  tick(); clockT = setInterval(tick, 250);
}
function floatXP(txt) { const d = $('.dock'); if (!d || RM()) return; const x = document.createElement('span'); x.className = 'xpf num'; x.textContent = txt; d.append(x); setTimeout(() => x.remove(), 1200); }
function setDone(j) {
  const e = W.ex[W.i], s = e.sets[j]; if (!s || s.done) return;
  s.done = true; W.combo++;
  let gain = addXP('set', 3) ; const prevBest = W.best[e.id], v = e1(s.w, s.r);
  if (EX[e.id].kind !== 'as' && prevBest > 0 && v > prevBest + .01 && !s.bonus && W.prs < 3) { s.pr = true; W.best[e.id] = v; W.prs++; W.prList.push(`${EX[e.id].n} ${s.w}kg × ${s.r}`); gain += 50; DB.xp += 50; }
  else if (EX[e.id].kind !== 'as' && v > (W.best[e.id] || 0)) W.best[e.id] = v;
  const comboBonus = W.combo % 5 === 0; if (comboBonus) { gain += 10; DB.xp += 10; }
  W.xp += gain; W.log.push({ i: W.i, j, gain, pr: !!s.pr, combo: comboBonus, prevBest });
  if (s.pr) SFX.pr(); else if (comboBonus) SFX.combo(); else SFX.set();
  buzz(s.pr ? [20, 40, 20] : 12);
  const allDone = e.sets.every(x => x.done);
  W.rest = allDone ? null : { t0: Date.now(), len: e.rest, wow: true }; if (allDone) W.feel = true;
  save(); R.logger();
  floatXP(`+${gain} XP`);
  if (allDone) setTimeout(() => setFace($('#feelCoach'), 'think'), 1300);
  say(`${j + 1}세트 완료, 플러스 ${gain} XP, 콤보 ${W.combo}`);
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
  const short = W.c === 'short', tired = W.c === 'tired', comboN = W.log.filter(l => l.combo).length, prN = W.prList.length, logSum = W.log.reduce((a, l) => a + l.gain, 0);
  let wb = 0, cb = 0;
  if (completed) wb = addXP('workout', short ? 60 : 100);
  if (completed && W.comeback) { cb = W.xp; DB.xp += W.xp; } // 복귀 첫 운동: 세트 XP 2배
  const rows = [[`세트 ${done}개`, logSum - comboN * 10 - prN * 50], comboN && [`콤보 보너스 ${comboN}번`, comboN * 10], prN && [`새 기록 ${prN}개`, prN * 50],
    wb && [short ? '15분 퀘스트 클리어' : '퀘스트 클리어', wb], cb && ['복귀 첫 운동 2배', cb], W.xp - logSum > 0 && ['통증 알려 주기', W.xp - logSum]].filter(Boolean);
  W.xp += wb + cb;
  W.ex.forEach(e => { const d = e.sets.filter(s => s.done); if (d.length) { applyProgress(e.id, d.map(s => ({ w: s.w, r: s.r })), e.sets.filter(s => !s.bonus).length, W.feels[e.id], e.range); const st = prog(e.id); st.best = Math.max(st.best || 0, ...d.map(s => EX[e.id].kind === 'as' ? 0 : e1(s.w, s.r))); } });
  if (done) DB.sessions.push({ id: uid(), day: k, tpl: W.tpl, cond: W.c, t0: W.t0, t1: Date.now(), xp: W.xp, prs: W.prList, complete: completed, ex: W.ex.map(e => ({ id: e.id, sets: e.sets.filter(s => s.done).map(s => ({ w: s.w, r: s.r, pr: !!s.pr })) })).filter(e => e.sets.length) });
  if (completed) DB.done[k] = true;
  checkDaily3(); save(); bkAuto();
  const L1 = levelOf(DB.xp), gain = [...new Set(W.ex.filter(e => e.sets.some(s => s.done)).flatMap(e => EX[e.id].mus))];
  const mins = Math.max(1, Math.round((Date.now() - W.t0) / 60000)), { left, nt, cur } = nextTarget(), prs = W.prList, xp = W.xp, T0 = TPL[W.tpl], nEx = W.ex.filter(e => e.sets.some(s => s.done)).length;
  clearInterval(clockT); keepAwake(false); W = null;
  go('sum');
  const next = (() => { for (let i = 1; i <= 7; i++) { const d = addDays(k, i), t = tplFor(d); if (t) return `${DOW[dow(d)]}요일 ${TPL[t].code} · ${TPL[t].ex.map(([id]) => EX[id].n).join(' · ')}`; } return '다음 운동 계획 없음'; })();
  const Lb = bpLevels(), meal = nextMealName(), pct = L => Math.round((DB.xp - cum(L)) / (cum(L + 1) - cum(L)) * 100);
  const p0 = Math.max(0, Math.round((DB.xp - xp - cum(L0)) / (cum(L0 + 1) - cum(L0)) * 100));
  $('#scr-sum').innerHTML = `
    <div class="cols"><div class="col">
    <div class="cl-body">
      <span class="chip rd pop">${ico('check', '')}${completed ? (short ? '15분 퀘스트 클리어' : '퀘스트 클리어') : '저장했어요'}</span>
      <h1 class="pop" style="--d:1">${esc(T0.code)} · ${esc(T0.by ? T0.ko.replace(T0.by + ' · ', '') : T0.ko)}</h1>
      <p class="sub pop" style="--d:2">${T0.by ? esc(T0.by) + ' 루틴 ' : ''}${nEx}가지 ${done}세트 · ${mins}분</p>
      <div class="stage" id="sumStage"><i class="wave"></i><i class="wave"></i><i class="wave"></i><div class="burst" id="sumBurst"></div>
        <div class="badge" id="sumBadge" role="img" aria-label="레벨 ${L0}"><span class="num" id="sumLv">${L0}</span></div>${coach(completed ? 'proud' : 'happy', 74)}</div>
      <p class="lvline">${tired && completed ? '줄인 계획을 끝냈어요. 똑같이 완료예요.' : completed ? '오늘 할 운동을 다 했어요.' : done ? '기록한 만큼 저장했어요.' : '기록한 세트가 없어요.'}</p>
      <p class="lvsub" id="sumSub" aria-live="polite">받은 XP를 모으는 중</p>
      <section class="tile xpt" aria-label="받은 XP">
        <div class="xbar" role="progressbar" aria-label="다음 레벨까지" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct(L1)}"><i id="sumBar" style="width:${p0}%"></i></div>
        ${rows.map((r, i) => `<p class="xl" style="--d:${i}">${r[0]} <b class="num">+${fmt(r[1])}</b></p>`).join('')}
        <p class="xl tot" style="--d:${rows.length}">합계 <b class="num"><span id="sumxp">+0</span> XP</b></p>
      </section>
      ${prs.map(p => `<p class="rec"><span class="ic">${ico('trophy', 'ico--16')}</span>새 기록 · ${esc(p)}</p>`).join('')}
    </div>
    </div><div class="col">
    <section class="tile card-pad bp" aria-label="바디 설계도"><div class="row row--between"><h2 class="fq-t-heading">바디 설계도</h2><span class="chip num">이번 주 ${bpPct(Lb)}%</span></div>
      <div class="bp-fig">${blueprintSVG(Lb, gain)}</div><p class="fq-t-caption center">오늘 운동한 부위가 반짝여요</p></section>
    ${left > 0 ? `<section class="tile card-pad row row--between"><div><p class="fq-t-caption">운동 끝. 이제 단백질</p><p><b class="fq-t-num-lg">${left}</b><span class="fq-unit"> g 남음</span></p></div><button class="fq-btn fq-btn--secondary" data-act="wte">뭐 먹지?</button></section>` : ''}
    <section class="tile card-pad"><p class="fq-eyebrow">다음 운동</p><p class="fq-t-body">${next}</p></section>
    ${left > 0 ? `<button class="fq-btn fq-btn--lg fq-btn--block" data-go="diet">${ico('utensils')}${meal} ${nt}g 채우러 가기</button><button class="fq-btn fq-btn--secondary fq-btn--block" data-go="home">홈으로</button>` : '<button class="fq-btn fq-btn--lg fq-btn--block" data-go="home">홈으로</button>'}
    </div></div>`;
  const reduce = RM(), rowsEl = [...document.querySelectorAll('#scr-sum .xl')], el = $('#sumxp');
  rowsEl.forEach((r, i) => reduce ? r.classList.add('in') : setTimeout(() => r.classList.add('in'), 200 + i * 110));
  if (completed) { SFX.start(); setTimeout(() => burst($('#sumBurst'), 26), 150); }
  const t0 = performance.now() + (reduce ? 0 : 350);
  const step = t => { const q = reduce ? 1 : Math.max(0, Math.min(1, (t - t0) / 700)); el.textContent = '+' + fmt(xp * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(step); else after(); };
  requestAnimationFrame(step);
  function after() {
    const bar = $('#sumBar'); if (!bar) return;
    const sub = () => { $('#sumSub').textContent = `레벨 ${L1} · 다음 레벨까지 ${fmt(cum(L1 + 1) - DB.xp)} XP`; };
    if (L1 > L0) {
      bar.style.width = '100%'; if (!pendingLevel) pendingLevel = L1;
      setTimeout(() => {
        const b = $('#sumBadge'); if (!b) return;
        b.classList.add('flip'); $('#sumStage').classList.add('up'); setTimeout(() => { $('#sumLv').textContent = L1; b.setAttribute('aria-label', `레벨 ${L1}`); }, 230);
        bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth; bar.style.transition = ''; bar.style.width = pct(L1) + '%'; sub(); showLevelUp();
      }, 350);
    } else { bar.style.width = pct(L1) + '%'; sub(); }
  }
}

/* ================= GROWTH ================= */
function vBlueprint(Lb, v, v0) {
  const foot = '<p class="fq-t-caption">굵은 윤곽 = 우선 부위(측면 삼각근 · 광배 · 윗가슴). 이번 주 목표 세트만큼 빨갛게 채워지고 월요일에 새로 시작해요.</p>';
  if (!v) return `<div class="bp-fig">${blueprintSVG(Lb)}</div><button class="fq-btn fq-btn--secondary fq-btn--block" data-act="tape">어깨·허리 둘레 재고 V 비율 열기</button>${foot}`;
  const t = DB.tape[DB.tape.length - 1], G = V_GOAL, now = vBand(v), goal = vBand(G), done = v >= G;
  const k = Math.sqrt(G / v), cm = x => Math.round(x), dl = (a, b) => { const x = cm(b) - cm(a); return `${x > 0 ? '+' : x < 0 ? '−' : '±'}${Math.abs(x)}`; };
  const pos = x => (Math.min(V_MAX, Math.max(V_MIN, x)) - V_MIN) / (V_MAX - V_MIN) * 100;
  const bands = V_BANDS.map((b, i) => [b, pos((V_BANDS[i + 1] || [V_MAX])[0]) - pos(b[0])]);
  return `<div class="bp-duo">
      <figure class="bp-fig"><figcaption><span class="fq-eyebrow">지금</span> <span class="fq-t-num-md">${v.toFixed(2)}</span></figcaption>${blueprintSVG(Lb, [], v, done ? 0 : G, `지금 몸: V 비율 ${v.toFixed(2)}, 점선은 목표 어깨선. 이번 주 부위별 운동량`)}</figure>
      <figure class="bp-fig"><figcaption><span class="chip gd">목표 ${G.toFixed(2)}</span></figcaption>${blueprintSVG({}, [], G, 0, `목표 몸: V 비율 ${G.toFixed(2)}일 때 어깨와 허리 폭`)}</figure></div>
      <p class="fq-t-label">지금 <b class="vb-now">${V_NAMES[now[1]]}</b>${done ? ' · 목표를 넘었어요!' : ` → 목표 <b>${V_NAMES[goal[1]]}</b>`}</p>
      <div class="fq-vgauge" style="--v:${v.toFixed(2)};--start:${(v0 || v).toFixed(2)};--goal:${G}">
        <div class="fq-vgauge__scale" role="meter" aria-valuemin="${V_MIN}" aria-valuemax="${V_MAX}" aria-valuenow="${v.toFixed(2)}" aria-valuetext="V 비율 ${v.toFixed(2)}, ${V_NAMES[now[1]]}, 목표 ${G.toFixed(2)}">${bands.map(([, w]) => `<i style="flex:${w}"></i>`).join('')}<span class="fq-vgauge__run"></span><span class="fq-vgauge__goal"></span><span class="fq-vgauge__now"></span></div>
        <div class="fq-vgauge__bands" aria-hidden="true">${bands.map(([b, w]) => `<span style="flex:${w}" ${b === now ? 'data-now' : ''}><b>${b[1]}</b><small class="num">${b[2]}</small></span>`).join('')}</div>
        <p class="fq-t-caption" style="margin-top:8px">남성 어깨÷허리 둘레의 흔한 참고치예요. 대략적인 기준으로만 봐 주세요.</p></div>
      ${done ? '' : `<div class="bp-plan"><p class="fq-t-label">목표 ${G.toFixed(2)}이 되려면</p>
        <p class="bp-plan__row"><span>어깨 <b class="num">${cm(t.sh)} → ${cm(t.sh * k)}</b>cm <small class="num">${dl(t.sh, t.sh * k)}</small></span><span>허리 <b class="num">${cm(t.wa)} → ${cm(t.wa / k)}</b>cm <small class="num">${dl(t.wa, t.wa / k)}</small></span></p>
        <p class="fq-t-caption">둘 다 조금씩 바꾸는 계산이에요. 허리만 줄이면 <b class="num">${cm(t.sh / G)}</b>cm, 어깨만 키우면 <b class="num">${cm(t.wa * G)}</b>cm가 돼야 해요.</p></div>`}
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="tape">줄자 다시 재기</button>
      <p class="fq-t-caption">굵은 윤곽 = 우선 부위. 이번 주 목표 세트만큼 빨갛게 채워져요(월요일 새로 시작). 점선 = 목표 어깨선.</p>`;
}
R.grow = () => {
  const P = DB.profile, lv = lvInfo(), L = lv.L, b = ib(), first = DB.inbody[0], Lb = bpLevels(), v = vRatio(), v0 = DB.tape[0] ? DB.tape[0].sh / DB.tape[0].wa : null, k = dayKey();
  const goalBF = P.sex === 'F' ? 23 : 15, hp = first.pbf > goalBF ? Math.max(0, Math.min(100, Math.round((b.pbf - goalBF) / (first.pbf - goalBF) * 100))) : 0;
  const d = (a, c, good) => { const x = +(a - c).toFixed(1); return x === 0 ? '<span class="delta">변화 없음</span>' : `<span class="delta" ${good(x) ? 'data-good' : ''}>${x > 0 ? '+' : '−'}${Math.abs(x)}</span>`; };
  const prevIb = DB.inbody[DB.inbody.length - 2];
  const cumSets = m => DB.sessions.reduce((a, s) => a + s.ex.filter(e => EX[e.id].mus.includes(m)).reduce((x, e) => x + e.sets.length, 0), 0);
  const ach = [
    ['첫 음식 기록', DB.foods.length >= 1], ['첫 운동', DB.sessions.length >= 1], ['첫 신기록', DB.sessions.some(s => s.prs.length)],
    ['진실의 거울', !!DB.flags.tdee, 'epic'], ['일주일 개근', DB.streak.best >= 7 || streakNow() >= 7, 'rare'], ['한 달의 약속', [Math.max(DB.streak.best, streakNow()), 30]],
    ['어깨 공사 착공', [cumSets('delt-side'), 100]], ['날개 펴기', [cumSets('lats'), 100]], ['백일', [Math.max(DB.streak.best, streakNow()), 100]], ['첫 몸 기록', PHOTOS.length > 0], ['12주 타임랩스', [new Set(PHOTOS.map(p => weekOf(p.date))).size, 12]]
  ];
  $('#scr-grow').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">성장</h1><button class="round" data-go="set" aria-label="설정">${ico('gear')}</button></header>
    <div class="cols"><div class="col">
    <section class="tile card-pad lvcard" aria-label="레벨"><div class="lv-row"><span class="lvb num">${L}</span><div style="flex:1;min-width:0"><p class="fq-t-heading">레벨 ${L} · ${titleOf(L)}</p>
      <div class="xbar" role="progressbar" aria-label="다음 레벨까지" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${lv.p}"><i style="width:${lv.p}%"></i></div>
      <p class="fq-t-caption"><span class="num">${fmt(DB.xp - lv.a)} / ${fmt(lv.b - lv.a)}</span> XP · 다음 레벨까지 ${fmt(lv.b - DB.xp)} XP</p></div></div></section>
    <section class="tile card-pad" style="--o:1" aria-label="챕터"><div class="q-row"><h2 class="fq-t-heading">챕터 ${P.chapter} · ${CH[P.chapter].name}</h2><span class="chip num">${chapterWeek()}</span></div>
      <div class="chmap">${CH.map((c, i) => `<div class="ch" data-s="${i < P.chapter || (i === 0 && DB.flags.tdee) ? 'done' : i === P.chapter ? 'now' : ''}"><span class="node num">${i < P.chapter || (i === 0 && DB.flags.tdee) ? ico('check', 'ico--16') : i}</span><b>${c.name}</b><small>${c.sub.replace(' ', '<br>')}</small></div>`).join('')}</div>
      ${P.chapter === 1 ? `<div class="boss"><div class="row row--between"><span class="fq-t-label">${CH[1].boss} 걷어내기</span><span class="fq-t-caption">목표 체지방 ${goalBF}%</span></div><div class="hp" role="meter" aria-label="남은 지방 안개" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${hp}"><i style="--p:${hp}"></i></div><span class="fq-t-caption">체지방 ${first.pbf}% → ${b.pbf}% · 4주마다 인바디로 판정</span></div>` : ''}
      <button class="fq-btn fq-btn--secondary fq-btn--block" style="margin-top:14px" data-act="chapter">챕터 바꾸기</button></section>
    <section class="tile card-pad stack bp" style="--o:4;gap:12px" aria-label="바디 설계도"><div class="row row--between"><h2 class="fq-t-heading">바디 설계도</h2><span class="chip num">이번 주 ${bpPct(Lb)}%</span></div>
      ${vBlueprint(Lb, v, v0)}</section>
    </div><div class="col">
    <section class="tile card-pad stack" style="--o:2" aria-label="체중 기록"><div class="row row--between"><h2 class="fq-t-heading">오늘 체중</h2><span class="fq-t-caption">7일 평균 <b class="num">${curWeight().toFixed(1)}</b>kg</span></div>
      <div class="row"><input id="wIn" class="inp" inputmode="decimal" placeholder="${DB.weights[k] || curWeight().toFixed(1)}" aria-label="오늘 체중 kg" style="flex:1"><button class="fq-btn ${DB.weights[k] ? 'fq-btn--secondary' : ''}" data-act="weigh">기록 · +5 XP</button></div>
      <p class="fq-t-caption">${DB.weights[k] ? `오늘 ${DB.weights[k]}kg 기록했어요.` : '아침 공복에 한 번. 하루 오르내림보다 7일 평균을 봐요.'}</p></section>
    <section class="tile card-pad stack" style="--o:3;gap:12px" aria-label="인바디"><div class="row row--between"><h2 class="fq-t-heading">인바디 · <span class="num">${b.date}</span></h2><button class="linkbtn" data-act="inbody">${ico('plus', 'ico--16')}새 측정</button></div>
      <div class="inb"><div><span class="fq-t-caption">체중</span><span class="fq-t-num-lg">${b.w}</span>${prevIb ? d(b.w, prevIb.w, () => false) : ''}</div><div><span class="fq-t-caption">골격근량</span><span class="fq-t-num-lg">${b.smm}</span>${prevIb ? d(b.smm, prevIb.smm, x => x > 0) : ''}</div><div><span class="fq-t-caption">체지방률</span><span class="fq-t-num-lg">${b.pbf}</span>${prevIb ? d(b.pbf, prevIb.pbf, x => x < 0) : ''}</div></div>
      <p class="note">측정은 공복·화장실 후·운동 전에. 조건이 매번 같아야 비교가 정확해요 (±1%는 오차).</p></section>

    ${photoSection()}
    <div class="stats" style="--o:6">
      <div class="fq-card"><span class="fq-eyebrow">연속</span><span class="fq-t-num-lg">${streakNow()}<small>일</small></span><span class="fq-t-caption">최장 ${Math.max(DB.streak.best, streakNow())}일 · 휴식일 포함</span></div>
      <div class="fq-card"><span class="fq-eyebrow">총 운동일</span><span class="fq-t-num-lg">${Object.keys(DB.done).length}<small>일</small></span><span class="fq-t-caption">영원히 남아요</span></div>
      <div class="fq-card"><span class="fq-eyebrow">운동 기록</span><span class="fq-t-num-lg">${DB.sessions.length}<small>회</small></span><span class="fq-t-caption">기록한 운동</span></div>
      <div class="fq-card"><span class="fq-eyebrow">보호권</span><span class="fq-t-num-lg">${DB.streak.shields}<small>/2</small></span><span class="fq-t-caption">빠진 날 자동 사용</span></div></div>
    </div></div>
    <div class="sec-title"><h2 class="fq-t-heading">업적</h2><span class="fq-t-caption num">${ach.filter(a => a[1] === true).length} / ${ach.length}</span></div>
    <div class="ach">${ach.map(([n, s, r]) => s === true ? `<div class="fq-card got" data-r="${r || ''}"><span class="ic">${ico(r === 'epic' ? 'trophy' : 'star', '')}</span><b>${n}</b></div>`
      : `<div class="fq-card locked"><span class="ic">${ico('lock', '')}</span><div class="stack" style="gap:6px"><b>${n}</b>${Array.isArray(s) ? `<div class="bar" style="--p:${Math.min(100, s[0] / s[1] * 100)}"><i></i></div><span class="fq-t-caption num">${s[0]} / ${s[1]}</span>` : ''}</div></div>`).join('')}</div>`;
  loadPhotos().then(() => { const el = $('#bodyLog'); if (el && TAB === 'grow') el.outerHTML = photoSection(); });
};

/* ================= SETTINGS ================= */
R.set = () => {
  const P = DB.profile, S = DB.settings, T = targets();
  $('#scr-set').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">설정</h1><button class="round" data-go="home" aria-label="닫기">${ico('x')}</button></header>
    <section class="fq-card stack"><span class="fq-t-heading">오늘 목표</span><span class="fq-t-body">${T.train ? '운동일' : '휴식일'} ${fmt(T.kcal)}kcal · 단백질 ${T.p}g · 탄수 ${T.c}g · 지방 ${T.f}g</span><span class="fq-t-caption">끼니당 단백질 ${mealSplit(T.p).join(' · ')}g · 기초대사량 ${T.bmr}kcal${DB.flags.tdee ? ` · 실측 유지 ${fmt(DB.flags.tdee)}kcal` : ''}</span></section>
    <section class="fq-card stack" style="gap:12px"><span class="fq-t-heading">효과음 · 화면 밝기</span>
      <div class="chips"><button class="fq-chip" aria-pressed="${S.sound}" data-act="sound" data-v="1">소리 켜기</button><button class="fq-chip" aria-pressed="${!S.sound}" data-act="sound" data-v="0">끄기</button><button class="fq-chip" data-act="sfxTest">들어보기</button></div>
      <div class="chips">${[['auto', '운동 중만 헬스장 모드'], ['light', '항상 밝게'], ['dark', '항상 헬스장 모드']].map(t => `<button class="fq-chip" aria-pressed="${S.theme === t[0]}" data-act="theme" data-v="${t[0]}">${ico(t[0] === 'light' ? 'sun' : 'moon', 'ico--16')}${t[1]}</button>`).join('')}</div>
      <p class="note">헬스장 모드는 같은 화면을 어둡게 바꿔 눈부심을 줄여요. 운동 화면 오른쪽 위 버튼으로도 바꿀 수 있어요.</p></section>
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
      <input id="gmodel" class="inp" placeholder="모델 (비우면 gemini-3.5-flash → 안 되면 낮은 버전)" value="${esc(S.gmodel)}" aria-label="제미나이 모델">
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="saveKey">저장</button></section>
    ${bkSection()}
    ${fwSection()}
    <section class="fq-card stack" style="gap:10px"><span class="fq-t-heading">파일로 백업</span>
      <p class="note" style="margin:0">기록은 이 폰 브라우저에만 있어요. 가끔 내보내 두세요 (카톡 나에게 보내기 등).</p>
      <div class="grid2"><button class="fq-btn fq-btn--secondary" data-act="export">내보내기</button><label class="fq-btn fq-btn--secondary" style="position:relative">불러오기<input type="file" id="importFile" accept="application/json,.json" style="position:absolute;inset:0;opacity:0"></label></div>
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="phExport">몸 사진 내보내기 (jpg 파일로)</button>
      <button class="fq-btn fq-btn--ghost fq-btn--block" data-act="resetAsk" style="--_fg:var(--red-ink)">전체 초기화</button></section>
    <p class="note center">FITQUEST v0.2 · 운동 사진 free-exercise-db(퍼블릭 도메인) · 루틴 출처는 각 영상 링크</p>`;
  $('#importFile').addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try { const d = JSON.parse(await f.text()); if (!d || d.v !== 1 || !d.profile) throw 0; DB = d; save(); toast('<span>불러왔어요.</span>'); go('home'); } catch (err) { toast('<span>FITQUEST 백업 파일이 아니에요.</span>'); }
  });
};
function scheduleSheet() {
  const on = DB.rot && DB.rot.on, k = dayKey(), mon = mondayOf(k);
  if (!DB.rot) DB.rot = rotFromDays(Object.keys(DB.schedule).map(Number));
  const partChip = (d, v, l) => `<button class="fq-chip" style="padding:0 12px" aria-pressed="${(DB.rot.slots[d] || '') === v}" data-act="slot" data-d="${d}" data-v="${v}">${l}</button>`;
  const preview = w => [1, 2, 3, 4, 5, 6, 0].map(d => { const day = addDays(mon, ((d + 6) % 7) + w * 7), t = tplFor(day); return `<div><span class="fq-t-label">${DOW[d]}</span><span class="fq-t-caption" style="text-align:right">${t ? esc(TPL[t].ko) : '휴식'}${DB.pins && DB.pins[d] ? ' · 고정' : ''}</span></div>`; }).join('');
  sheet(`<div class="row row--between"><h2 class="fq-t-title">주간 루틴</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <div class="chips"><button class="fq-chip" aria-pressed="${!!on}" data-act="rotOn" data-v="1">매주 바뀌는 로테이션</button><button class="fq-chip" aria-pressed="${!on}" data-act="rotOn" data-v="0">고정 루틴</button></div>
    ${on ? `<p class="note" style="margin:0">요일마다 부위만 정하면, 매주 기본 V자 루틴과 이도황·제로범·조정현 루틴을 돌아가며 넣어요. 같은 부위는 3주에 한 번꼴로 같은 루틴이 돌아와요.</p>
      ${[1, 2, 3, 4, 5, 6, 0].map(d => `<div class="stack" style="gap:6px"><span class="fq-t-label">${DOW[d]}요일</span><div class="chips">${partChip(d, '', '휴식')}${Object.entries(PART_NAME).map(([v, l]) => partChip(d, v, l)).join('')}</div></div>`).join('')}
      <span class="fq-t-heading">이번 주</span><div class="list">${preview(0)}</div><span class="fq-t-heading">다음 주</span><div class="list">${preview(1)}</div>`
    : `${[1, 2, 3, 4, 5, 6, 0].map(d => `<div class="stack" style="gap:6px"><span class="fq-t-label">${DOW[d]}요일 · 지금 ${DB.schedule[d] ? esc(TPL[DB.schedule[d]].ko) : '휴식'}</span><div class="chips">${[['', '휴식'], ...Object.entries(TPL).map(([kk, t]) => [kk, t.by ? `${t.by.split('·')[0]} ${t.code}` : t.code])].map(([kk, l]) => `<button class="fq-chip" style="padding:0 12px" aria-pressed="${(DB.schedule[d] || '') === kk}" data-act="sched" data-d="${d}" data-v="${kk}">${l}</button>`).join('')}</div></div>`).join('')}`}
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
    <p class="fq-t-body" style="margin:-8px 0 0">남은 단백질 <b class="num">${left}g</b> · 칼로리 <b>${fmt(Math.max(0, remK))}kcal</b>. 다음 끼니 ${nt}g에 맞춘 추천이에요.</p>
    <div class="chips" role="group" aria-label="장소">${['전체', ...cats].map(c => `<button class="fq-chip" aria-pressed="${(cat || '전체') === c}" data-act="wteCat" data-c="${c}">${c}</button>`).join('')}</div>
    <div class="wte">${picks.map(x => `<div class="wte-card"><span class="chip" style="justify-self:start">${x.cat}</span><b style="font-size:17px">${x.n}</b>
      <div class="nums"><span><b class="num">${x.p}</b><span class="fq-unit">g 단백질</span></span><span><b class="num">${x.k}</b><span class="fq-unit">kcal</span></span></div>
      <span class="fq-t-caption">먹으면: 단백질 ${Math.round(S.p)} → ${Math.round(S.p + x.p)} / ${T.p}g · 칼로리 ${fmt(S.k)} → ${fmt(S.k + x.k)} / ${fmt(T.kcal)}</span>
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="${x.cat === '회사 점심' ? 'lunch' : 'logWte'}" data-n="${esc(x.n)}">이걸로 기록</button></div>`).join('')}</div>
    <p class="note" style="margin:0">값은 대략이에요. 배달 음식은 가게마다 ±30% 달라요.</p>`);
}
function proSheet(i) {
  const r = ROUTINES[i];
  sheet(`<div class="row row--between"><span class="fq-badge">${esc(r.creator)}</span><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <h2 class="fq-t-title">${esc(r.title)}</h2><p class="fq-t-caption" style="margin:-6px 0 0">${esc(r.sub || '')}</p>
    ${r.tips && r.tips.length ? `<section class="fq-card stack"><span class="fq-eyebrow">크리에이터 핵심 팁</span>${r.tips.map(t => `<span class="fq-t-body" style="font-size:15px">· ${esc(t)}</span>`).join('')}</section>` : ''}
    <div class="pro-ex">${r.ex.map((e, j) => `<div><span class="num muted">${j + 1}</span><span><b>${esc(e.n)}</b><small>${esc(e.how || '')}</small></span><span class="fq-t-label">${esc(e.sr || '')}</span></div>`).join('')}</div>
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
      if (bad.length) { $('#obResult').innerHTML = `<p class="fq-card err">${bad.join(', ')} 값을 확인해 주세요.</p>`; return; }
      if (OB.days.length < 2) { $('#obResult').innerHTML = `<p class="fq-card" style="margin:0">운동 요일을 2일 이상 골라 주세요.</p>`; return; }
      const rec = recChapter(OB.sex, d.pbf);
      DB.profile = { sex: OB.sex, age: d.age, height: d.h, steps: OB.steps, meals: OB.meals, sessionMin: OB.min, level: OB.level, lunchOut: OB.lunch === 1, creators: OB.cr.slice(), chapter: 0, chapterStart: dayKey(), rec };
      DB.inbody = [{ date: d.date, w: d.w, smm: d.smm, pbf: d.pbf, bmr: d.bmr }]; DB.schedule = assignDays(OB.days); DB.rot = rotFromDays(OB.days);
      DB.flags.obDraft = true;
      const t0 = targets(); const save0 = DB.profile.chapter; DB.profile.chapter = rec; const tr = targets(); DB.profile.chapter = save0;
      $('#obResult').innerHTML = `<section class="tile card-pad stack sel" style="gap:12px"><div class="q-row"><p class="lab">내 계획</p><span class="chip">체지방 ${d.pbf}%</span></div>
        <h2 class="fq-t-title">추천: 챕터 ${rec} ${CH[rec].name}</h2>
        <p class="fq-t-body" style="margin:0">${rec === 1 ? 'V자는 마를수록 넓어 보여요. 체지방 20%에서 벌크를 시작하면 허리가 어깨보다 먼저 커져요. 먼저 15%대까지 지방 안개를 걷어내고, 그다음 프레임을 키워요. 근육을 지키려고 단백질은 오히려 더 먹어요.' : rec === 2 ? '유지 칼로리로 근육은 늘리고 지방은 줄여요. 더 선명한 V자를 빨리 원하면 미니컷도 좋아요.' : '충분히 말랐어요. 이제 조금 더 먹으며 프레임을 넓혀요.'}</p>
        <div class="grid2"><div class="stack" style="gap:4px"><span class="fq-t-caption">운동일 칼로리</span><span class="fq-t-num-md">${fmt(tr.train ? tr.kcal : tr.kcal + 300)}</span></div><div class="stack" style="gap:4px"><span class="fq-t-caption">단백질 (하루)</span><span class="fq-t-num-md">${tr.p}<small>g</small></span></div></div>
        <span class="fq-t-caption">끼니당 단백질 ${mealSplit(tr.p).join(' · ')}g${DB.profile.lunchOut ? ` · 점심은 일반식이라 ${LUNCH_P}g, 나머지 끼니에 더 배분` : ''}</span>
        <button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="obStart" data-c="0">정직한 2주부터 시작 (추천)</button>
        <p class="fq-t-caption" style="margin:-4px 0 0">2주 동안 평소대로 먹고 다 기록하면, 공식이 아닌 내 몸의 진짜 유지 칼로리를 찾아요. 그동안 단백질 목표는 ${t0.p}g.</p>
        <button class="fq-btn fq-btn--ghost fq-btn--block" data-act="obStart" data-c="${rec}">바로 챕터 ${rec} ${CH[rec].name} 시작</button></section>`;
      $('#obResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    obStart: () => { DB.profile.chapter = +a.dataset.c; DB.profile.chapterStart = dayKey(); delete DB.flags.obDraft; DB.streak.last = addDays(dayKey(), -1); DB.weights[dayKey()] = DB.inbody[0].w; save(); SFX.start(); go('home'); toast('<span>시작했어요! 첫 할 일은 단백질이에요.</span>'); },
    wte: () => wteSheet(), wteCat: () => wteSheet(a.dataset.c === '전체' ? null : a.dataset.c),
    logWte: () => { closeSheet(); addFood(WTE.find(w => w.n === a.dataset.n)); },
    rescue: () => { const { left } = nextTarget(), r = RESCUE.find(q => left <= q[0]); addFood({ n: r[1], p: r[2], k: r[3], c: 12, f: 4 }, 'rescue'); },
    fav: () => addFood(favList()[+a.dataset.i]),
    delFood: () => { DB.foods = DB.foods.filter(f => f.id !== a.dataset.id); save(); R[TAB](); },
    allLogged: () => { const key = 'all_' + k; if (a.checked && !DB.flags[key]) { DB.flags[key] = true; addXP('all', 20); toast('<span>완전 기록일 +20 XP · 정체기 진단이 정확해져요</span>'); } else if (!a.checked) delete DB.flags[key]; checkDaily3(); save(); showLevelUp(); },
    weigh: () => { const v = parseFloat(($('#wIn').value || '').replace(',', '.')); if (!(v >= 30 && v <= 250)) return toast('<span>체중을 kg으로 넣어 주세요.</span>'); const first = !DB.weights[k]; DB.weights[k] = v; if (first) addXP('weight', 5); checkDaily3(); save(); SFX.food(); R[TAB] && R[TAB](); toast(`<span>${v}kg 기록${first ? ' <em>+5 XP</em>' : ''}</span>`); showLevelUp(); },
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
    'rest+': () => { if (W.rest) { W.rest.len += 15; R.logger(); bump($('#restT')); } }, 'rest-': () => { if (W.rest) { W.rest.len = Math.max(15, W.rest.len - 15); R.logger(); bump($('#restT')); } },
    restSkip: () => { W.rest = null; SFX.tap(); R.logger(); },
    gym: () => { DB.settings.theme = document.documentElement.classList.contains('gym') ? 'light' : 'auto'; save(); applyTheme(); R.logger(); },
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
    crAdd: () => crAddSheet('', null), crLearn: () => crLearn(), crSave: () => crSave(),
    crDel: () => { const id = a.dataset.v, c = DB.custom, cr = c.creators.find(x => x.id === id); (cr.tpls || []).forEach(k => { delete c.tpls[k]; delete TPL[k]; delete TPL_PARTS[k]; Object.keys(DB.pins || {}).forEach(d => { if (DB.pins[d] === k) delete DB.pins[d]; }); }); c.creators = c.creators.filter(x => x.id !== id); const i = CREATORS.findIndex(x => x.id === id); if (i >= 0) CREATORS.splice(i, 1); DB.profile.creators = (DB.profile.creators || []).filter(x => x !== id); save(); closeSheet(); R[TAB] && R[TAB](); toast('<span>지웠어요.</span>'); },
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
    chapter: () => sheet(`<div class="row row--between"><h2 class="fq-t-title">챕터 바꾸기</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>${CH.map((c, i) => `<button class="pro-card" data-act="setCh" data-c="${i}"><div class="who"><span class="chip">챕터 ${i}</span>${i === DB.profile.rec ? '<span class="chip rd">추천</span>' : ''}</div><h4>${c.name} · ${c.sub}</h4><span class="fq-t-caption">칼로리 ${c.off > 0 ? '+' : ''}${c.off} · 단백질 ${c.pkg}g/kg</span></button>`).join('')}`),
    setCh: () => { DB.profile.chapter = +a.dataset.c; DB.profile.chapterStart = dayKey(); save(); closeSheet(); R[TAB](); toast(`<span>챕터 ${a.dataset.c} ${CH[+a.dataset.c].name} 시작!</span>`); },
    ch0Done: () => { DB.flags.tdee = +a.dataset.t; const rec = recChapter(DB.profile.sex, ib().pbf); DB.profile.chapter = rec; DB.profile.chapterStart = dayKey(); DB.xp += 500; const L = levelOf(DB.xp); if (L > levelOf(DB.xp - 500)) pendingLevel = L; save(); SFX.pr(); R.home(); showLevelUp(); },
    inbody: () => sheet(`<h2 class="fq-t-title">새 인바디</h2><div class="grid2">${[['ibW', '체중 kg'], ['ibS', '골격근량 kg'], ['ibP', '체지방률 %'], ['ibB', '기초대사량 (선택)']].map(([id, l]) => `<label class="stack" for="${id}" style="gap:6px"><span class="fq-t-label">${l}</span><input id="${id}" class="inp" inputmode="decimal"></label>`).join('')}</div><label class="stack" for="ibD" style="gap:6px"><span class="fq-t-label">측정일</span><input id="ibD" class="inp" type="date" value="${new Date().toISOString().slice(0, 10)}"></label><button class="fq-btn fq-btn--lg fq-btn--block" data-act="ibSave">저장</button>`),
    ibSave: () => { const v = id => parseFloat(($('#' + id).value || '').replace(',', '.')); const e = { date: $('#ibD').value, w: v('ibW'), smm: v('ibS'), pbf: v('ibP'), bmr: v('ibB') || null }; if (!(e.w > 30 && e.pbf > 2 && e.smm > 5)) return toast('<span>체중·골격근량·체지방률을 넣어 주세요.</span>'); DB.inbody.push(e); DB.inbody.sort((x, y) => x.date < y.date ? -1 : 1); DB.xp += 20; save(); closeSheet(); R.grow(); toast('<span>인바디 저장 · 목표가 새로 계산됐어요 · +20 XP</span>'); },
    tape: () => sheet(`<div class="row row--between"><h2 class="fq-t-title">줄자로 V 비율</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
      <div class="fq-card">${TAPE_SVG}</div>
      <ol class="tape-steps"><li><b>① 어깨 둘레</b> 팔을 몸 옆에 편하게 내리고, 양쪽 어깨(삼각근)의 <b>가장 튀어나온 곳</b>을 지나게 한 바퀴. 가슴 위쪽을 지나요.</li><li><b>② 허리 둘레</b> <b>배꼽 높이</b>에서 한 바퀴. 숨을 편하게 내쉰 상태, 배에 힘 주지 않기.</li><li>줄자는 바닥과 <b>수평</b>, 살에 닿되 조이지 않게. 거울을 보거나 다른 사람이 재 주면 정확해요. 2번 재서 평균.</li></ol><div class="grid2"><label class="stack" for="tSh" style="gap:6px"><span class="fq-t-label">어깨 둘레 cm</span><input id="tSh" class="inp" inputmode="decimal"></label><label class="stack" for="tWa" style="gap:6px"><span class="fq-t-label">허리 둘레 cm</span><input id="tWa" class="inp" inputmode="decimal"></label></div><button class="fq-btn fq-btn--lg fq-btn--block" data-act="tapeSave">저장</button>`),
    tapeSave: () => { const sh = parseFloat($('#tSh').value), wa = parseFloat($('#tWa').value); if (!(sh > 60 && wa > 40)) return toast('<span>둘레를 cm로 넣어 주세요.</span>'); DB.tape.push({ date: dayKey(), sh, wa }); save(); closeSheet(); R.grow(); },
    sound: () => { DB.settings.sound = a.dataset.v === '1'; save(); R.set(); if (DB.settings.sound) SFX.set(); },
    sfxTest: () => { const seq = ['start', 'set', 'combo', 'ready', 'pr', 'food']; seq.forEach((s, i) => setTimeout(() => SFX[s](), i * 650)); },
    theme: () => { DB.settings.theme = a.dataset.v; applyTheme(); save(); R.set(); },
    prof: () => { const kk = a.dataset.k, v = a.dataset.v; DB.profile[kk] = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v; save(); R.set(); },
    saveKey: () => { DB.settings.gkey = $('#gkey').value.trim(); DB.settings.gmodel = $('#gmodel').value.trim(); save(); toast('<span>저장했어요. 음식 기록에서 사진을 올려 보세요.</span>'); },
    export: () => { const blob = new Blob([JSON.stringify(DB)], { type: 'application/json' }), u = URL.createObjectURL(blob), l = document.createElement('a'); l.href = u; l.download = `fitquest-backup-${dayKey()}.json`; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); },
    resetAsk: () => sheet(`<h2 class="fq-t-title">전체 초기화할까요?</h2><p class="fq-t-body" style="margin:-6px 0 0">모든 기록·레벨·몸 사진이 지워지고 되돌릴 수 없어요. 먼저 내보내기를 권해요.</p><button class="fq-btn fq-btn--lg fq-btn--block"  data-act="reset">초기화</button><button class="fq-btn fq-btn--ghost fq-btn--block" data-act="close">취소</button>`),
    reset: () => { DB = fresh(); save(); PH.clear().catch(() => {}); PHOTOS = []; closeSheet(); go('onb'); }
  };
  if (H[act]) H[act](); else if (PH_ACTS[act]) PH_ACTS[act](a); else if (BK_ACTS[act]) BK_ACTS[act](a); else if (FW_ACTS[act]) FW_ACTS[act](a);
});
function adj(kk, d) { const { e, k } = curSet(); if (k < 0) return; const s = e.sets[k], inc = incOf(e.id); if (kk === 'w') { const nw = Math.max(0, +(s.w + d * inc).toFixed(2)); e.sets.forEach((x, i) => { if (!x.done && i >= k) x.w = nw; }); } else s.r = Math.max(1, s.r + d); SFX.tap(); buzz(6); R.logger(); bump($(kk === 'w' ? '#wV' : '#rV')); }
/* 화면 밝기: auto = 운동 화면(세트·휴식·클리어·촬영)만 헬스장 모드, light = 항상 밝게, dark = 항상 헬스장 모드 */
function applyTheme() {
  const t = DB.settings.theme, on = t === 'dark' || (t !== 'light' && GYM_TABS.includes(TAB)), h = document.documentElement;
  h.classList.toggle('gym', on); delete h.dataset.theme;
  const m = $('#themeColor'); if (m) m.content = on ? '#121317' : '#ECEDF1';
}
$('#lvl').addEventListener('click', e => { if (e.target === $('#lvl')) $('#lvl').close(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && DB.profile && !DB.flags.obDraft && TAB !== 'logger') { settleStreak(); R[TAB] && R[TAB](); bkAuto(); fwAuto(); } if (document.visibilityState === 'visible' && TAB === 'logger') keepAwake(true); });

/* ================= boot ================= */
$('#lvl-coach').innerHTML = COACH_SVG;
applyTheme();
if (!DB.profile || DB.flags.obDraft) { DB.flags.obDraft = false; go('onb'); }
else { if (!DB.profile.creators) { DB.profile.creators = ['idohwang']; save(); } if (!DB.rot) { DB.rot = rotFromDays(Object.keys(DB.schedule).map(Number)); save(); } settleStreak(); go('home'); loadPhotos().then(() => { if (TAB === 'home') R.home(); bkAuto(); fwAuto(); }); }
