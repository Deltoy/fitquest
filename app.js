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
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', chev: '<path d="m9 18 6-6-6-6"/>', chevL: '<path d="m15 18-6-6 6-6"/>',
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
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  dumbbell: '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/>',
  scale: '<circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>'
};
/* 동그라미 진행 (오늘 3칸 · 레벨 · 업적): p 0–1 */
const ringSvg = (p, cls = '') => `<svg class="rg3 ${cls}" viewBox="0 0 36 36" aria-hidden="true"><circle class="t" cx="18" cy="18" r="15"/><circle class="f${p > 0 ? '' : ' zero'}" cx="18" cy="18" r="15" pathLength="100" stroke-dasharray="100" style="--off:${(100 - Math.max(0, Math.min(1, p)) * 100).toFixed(1)}"/></svg>`;
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
  return { v: 1, profile: null, inbody: [], weights: {}, foods: [], sessions: [], prog: {}, xp: 0, xpDay: {}, done: {}, overrides: {}, flags: { ppFix: 1 },
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
function save() { try { try { if (W && W.q && !W.end) DB.live = W; } catch (e0) {} localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { toast('<span>저장 공간이 부족해요. 설정에서 백업을 내보내 주세요.</span>', 5000); } }

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
/* 끼니별 목표: 지난 끼니는 원래 배분, 지금부터의 끼니는 "지금부터 먹을 양"(목표 − 지난 끼니에 먹은 양)을 다시 나눔.
   지금·다음 끼니에 기록해도 목표가 바뀌지 않음 → 거품·식단·토스트가 늘 같은 숫자 (B1).
   한 끼에 몰아 먹을 수 있는 양은 가장 큰 끼니 목표까지 — 넘치면 capped ("다 못 채워도 괜찮아요") */
function mealTargets(T = targets()) {
  const split = mealSplit(T.p), now = slotAt(), li = lunchOut() ? lunchIdx() : -1, cap = Math.max(...split);
  let pool = T.p; for (let i = 0; i < now; i++) pool -= slotSum(i);
  const ahead = split.map((_, i) => i).filter(i => i >= now), rest = ahead.filter(i => i !== li), lunchAhead = ahead.includes(li) ? LUNCH_P : 0;
  const share = rest.length ? Math.max(0, Math.ceil((pool - lunchAhead) / rest.length / 5) * 5) : 0;
  const out = split.map((tg, i) => i < now ? tg : i === li ? LUNCH_P : Math.max(tg, Math.min(share, cap)));
  out.capped = share > cap; return out;
}
/* 다음 끼니: 지금 끼니부터 아직 못 채운 첫 끼니 (채운 끼니는 건너뜀). 다 채웠으면 none → "오늘 {left}g 남음" */
function nextTarget() {
  const T = targets(), left = Math.max(0, T.p - daySum().p), tgs = mealTargets(T), n = tgs.length, li = lunchOut() ? lunchIdx() : -1;
  let cur = slotAt(); while (cur < n && slotSum(cur) >= tgs[cur] - 10) cur++;
  if (cur >= n) return { left, nt: left, cur: n, none: true, name: null, capped: false };
  return { left, nt: Math.min(Math.max(0, tgs[cur] - slotSum(cur)), left), cur, name: mealNames()[cur], lunch: cur === li && !slotSum(li), capped: tgs.capped };
}
const nextMealName = () => nextTarget().name;
/* 거품·식단·토스트가 같이 쓰는 한 줄 */
const nextLab = n => n.none ? '오늘 남은 단백질' : `다음 끼니는 <b>${n.name}</b>`;
const nextShort = n => n.left <= 0 ? '오늘 목표 끝' : n.none ? `오늘 ${n.left}g 남음` : `다음 끼니 ${n.name} ${n.nt}g`;
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
/* 그날 계획 루틴 — 이번 주 줄·홈 오늘·달력·기록·주간 루틴 미리보기가 모두 이것 하나를 쓴다 */
function tplFor(k) { return weekPlan(mondayOf(k))[(dow(k) + 6) % 7]; }
function rawPlan(k) {   // [루틴, 고정?] — 미루기·바꾸기(overrides)·요일 고정(pins)은 고정, 나머지는 로테이션/주간 루틴
  const ok = t => t && TPL[t] ? t : null, o = DB.overrides[k], d = dow(k);
  if (o === 'rest') return [null, 1]; if (ok(o)) return [o, 1];
  if (DB.pins && ok(DB.pins[d])) return [DB.pins[d], 1];
  return [DB.rot && DB.rot.on ? ok(rotFor(k)) : ok(DB.schedule[d]), 0];
}
/* 한 주(월~일) 최종 계획: 고정 안 된 날이 어제·(고정된) 내일과 같은 부위거나 그 주 하체 3번째면 다른 부위로
   (그 요일 기본 루틴 → 등·가슴·어깨·팔·하체 순). 고정된 날끼리 겹치면 그대로 두고 주간 루틴 시트에서 알려 줌.
   ponytail: 지난주는 한 단계만 거슬러 계산 — 지난 일요일이 연쇄로 바뀌는 드문 경우엔 월요일 판단이 어긋날 수 있음 */
function weekPlan(mon, depth = 1) {
  const P = t => t && partOf(t), raw = [0, 1, 2, 3, 4, 5, 6, 7].map(i => rawPlan(addDays(mon, i)));
  let prev = depth ? weekPlan(addDays(mon, -7), 0)[6] : rawPlan(addDays(mon, -1))[0];
  let legs = raw.slice(0, 7).filter(([t, f]) => f && P(t) === 'legs').length;
  return raw.slice(0, 7).map(([t, f], i) => {
    if (t && !f) {
      const k = addDays(mon, i), pp = P(prev), [n, nf] = raw[i + 1], np = P(n), bad = q => q === pp || (nf && q === np) || (q === 'legs' && legs >= 2);
      if (bad(P(t))) t = [DB.schedule[dow(k)], ...['back', 'chest', 'shoulder', 'arms', 'legs'].map(q => { const c = rotCands(q); return c[(DB.rot ? rotWeek(k) : 0) % c.length]; })]
        .find(x => x && TPL[x] && !bad(P(x)) && P(x) !== np) || null;
      if (P(t) === 'legs') legs++;
    }
    return prev = t;
  });
}
/* 미루기: k 의 운동 t 를 다음 운동일로, 그 뒤 운동도 그 주 일요일까지 한 칸씩 밀고 마지막 하나는 이번 주 쉼 (요일 고정한 날은 건너뜀).
   다음 운동일이 없으면 내일(쉬는 날)로 */
function shiftPlan(k, t) {
  const end = addDays(mondayOf(addDays(k, 1)), 6), ds = [];
  for (let d = addDays(k, 1); d <= end; d = addDays(d, 1)) if (tplFor(d) && !(DB.pins && TPL[DB.pins[dow(d)]])) ds.push(d);
  if (!ds.length) ds.push(addDays(k, 1));
  const seq = [t, ...ds.map(d => tplFor(d))];
  DB.overrides[k] = 'rest'; ds.forEach((d, i) => { DB.overrides[d] = seq[i]; });
  return { ds, seq };
}
/* 한 번만: 옛 미루기(다음 날에 그대로 얹기)로 같은 부위가 이어지거나 하체가 주 3번이 된 날은 그 덮어쓰기를 지워 원래 계획으로 (요일 고정은 안 건드림).
   새로 시작한 사용자는 fresh() 에 표시가 있어 안 돎 */
function fixOldPostpone() {
  if (DB.flags.ppFix) return; DB.flags.ppFix = 1;
  const today = dayKey(), P = t => t && partOf(t); let n = 0;
  Object.keys(DB.overrides).sort().forEach(d => {
    const t = DB.overrides[d]; if (d < today || !TPL[t] || DB.overrides[addDays(d, -1)] !== 'rest') return;
    delete DB.overrides[d];
    const mon = mondayOf(d), legs = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(mon, i)).filter(x => x !== d && P(rawPlan(x)[0]) === 'legs').length;
    if (P(rawPlan(addDays(d, 1))[0]) === P(t) || (P(t) === 'legs' && legs >= 2)) n++; else DB.overrides[d] = t;
  });
  if (n) save();
}
/* 요일 고정 루틴이 옆 요일(고정·요일 부위)과 같은 부위인지 — 주간 루틴 시트·고정 토스트 경고용 */
function pinClash(d) {
  const pt = t => t && TPL[t] ? partOf(t) : null, at = n => pt(DB.pins && DB.pins[n]) || (DB.rot && DB.rot.on ? DB.rot.slots[n] : pt(DB.schedule[n])), p = pt(DB.pins && DB.pins[d]);
  return !!p && (at((d + 1) % 7) === p || at((d + 6) % 7) === p);
}
function rotCands(part) {
  const picks = (DB.profile.creators || []).flatMap(id => (CREATORS.find(c => c.id === id) || {}).tpls || []);
  // 첫 부위(partOf)가 그 요일 부위인 루틴만 — 로테이션은 루틴만 바꾸고 부위는 절대 안 바꾼다
  const base = ROT[part].concat(Object.keys((DB.custom && DB.custom.tpls) || {}).filter(k => TPL[k] && !TPL[k].off)).filter(t => TPL[t] && partOf(t) === part);
  const mine = base.filter(t => picks.includes(t)), rest = base.filter(t => !picks.includes(t));
  if (!mine.length) return base;
  return mine.length >= 2 ? mine.concat(rest.filter(t => !TPL[t].pro).slice(0, 1)) : [mine[0], rest[0], mine[0]].filter(Boolean);
}
function rotWeek(k) { return Math.max(0, Math.floor(daysBetween(DB.rot.start, mondayOf(k)) / 7)); }
function rotFor(k) {
  const d = dow(k), part = DB.rot.slots[d]; if (!part) return null;
  const c = rotCands(part), base = DB.schedule[d]; if (!c.length) return base;
  const mon = mondayOf(k), w = rotWeek(k), j = [1, 2, 3, 4, 5, 6, 0].filter(x => DB.rot.slots[x] === part).indexOf(d);
  const fresh = c.filter(t => TPL[t].day && mondayOf(addDays(TPL[t].day, 7)) === mon).sort((a, b) => TPL[b].at - TPL[a].at)[0];   // 새로 자동 추가된 루틴은 다음 주 그 부위 첫날에 꼭 들어감
  const used = [];   // 같은 주 같은 부위 둘째 날부터는 앞에서 쓴 루틴을 건너뜀 (새 루틴 중복 방지)
  for (let i = 0; i <= j; i++) { const r = c.map((_, n) => c[(w + i + n) % c.length]); used.push((!i && fresh) || r.find(x => !used.includes(x)) || r[0]); }
  return used[j];
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
  if (st.q) return st.last === 'up' ? [EX[id].kind === 'as' ? `지난번 보조 −${st.dW}kg` : `지난번 +${st.dW}kg`, '지난번에 올린 무게 그대로', 1] : ['유지', ''];   // 0928 빠른 기록: 올린 건 내가
  return { first: ['첫 기록', '10회 할 수 있는 무게로 가볍게 시작해요'], up: [EX[id].kind === 'as' ? `보조 −${inc}kg` : `+${inc}kg`, '지난번 모든 세트 윗끝 달성 → 증량', 1], prog: ['+1회', '총반복 기준 통과 → 세트마다 +1회', 1],
    hold: ['유지', '"한계"였어서 같은 무게로 한 번 더'], fail: ['유지', '같은 무게로 다시 도전'], deload: ['무게 −10%', '잠깐 물러서서 더 멀리 — 반복은 끝까지'] }[st.last] || ['유지', ''];
}
function applyProgress(id, done, planned, feel, range) {
  const E = EX[id], st = prog(id), [lo, hi] = range || E.range, inc = incOf(id);
  if (!done.length) return;
  const reps = done.map(s => s.r), w = done[0].w, total = reps.reduce((a, b) => a + b, 0), N = planned;
  delete st.q;
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
const BP_FOCUS = ['delt-side', 'lats', 'chest-upper'];
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
  const g = (m, t, polys) => `<g data-muscle="${m}" data-level="${L[m] || 0}" ${BP_FOCUS.includes(m) ? 'data-focus' : ''} ${gain.includes(m) ? 'data-gain' : ''}><title>${t}</title>${polys.map(p => poly('fq-muscle', p)).join('')}</g>`;
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
const GYM_TABS = ['logger', 'shoot']; // 헬스장 모드가 자동으로 켜지는 운동 화면 (클리어 화면은 밝게 축하)
function go(tab) {
  if (TAB === 'shoot' && tab !== 'shoot') stopCam();
  if (tab !== 'cam' && tab !== 'diet') SLOT_PICK = null;   // 식단·카메라 사이에서는 고른 끼니 유지
  if (tab !== 'cam') FR = null;
  clearTimeout(toast.t); $('#toast').innerHTML = '';   // 토스트는 화면을 넘어가지 않음 (B2) — 넘어간 뒤 띄우는 토스트는 그대로
  TAB = tab;
  ['onb', 'home', 'diet', 'cam', 'work', 'grow', 'set', 'logger', 'sum', 'shoot', 'cmp'].forEach(s => { $('#scr-' + s).hidden = s !== tab; });
  $('#tabbar').hidden = tab === 'onb' || tab === 'logger' || tab === 'shoot';
  document.querySelectorAll('.tabbar button').forEach(b => b.dataset.go === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  applyTheme();
  R[tab] && R[tab]();
  window.scrollTo(0, 0);
}
/* 넓은 화면(≥700px) 두 줄: 카드 높이를 재서 두 줄 길이 차가 가장 작게 나눔 (카드 10개 이하 → 모든 경우를 다 봄).
   차이가 80px 안이면 원래 자리(data-c="r" = 오른쪽)와 읽는 순서를 지킴 · data-stick 은 앞 카드와 같은 줄 · .hero 는 두 줄을 가로지름.
   폰에서는 한 줄로 되돌리고 --o 순서를 따름 */
function flow() {
  const box = document.querySelector(`#scr-${TAB} .cols--flow`); if (!box) return;
  let [c1, c2] = box.querySelectorAll(':scope > .col');
  if (!c2) { c2 = document.createElement('div'); c2.className = 'col'; box.append(c2); }
  const items = [...box.querySelectorAll(':scope > .hero, :scope > .col > *')];
  if (items.some(e => e.dataset.i == null)) items.forEach((e, i) => { e.dataset.i = i; });
  items.sort((a, b) => a.dataset.i - b.dataset.i);
  // 순서가 이미 맞으면 건드리지 않음 (옮기면 등장 애니메이션이 다시 돎)
  const place = (col, list) => { if (col.children.length !== list.length || list.some((e, i) => col.children[i] !== e)) list.forEach(e => col.append(e)); };
  if (innerWidth < 700) { place(c2, []); place(c1, items); return; }
  items.filter(e => e.classList.contains('hero') && e.parentNode !== box).forEach(e => box.insertBefore(e, c1));
  const rest = items.filter(e => !e.classList.contains('hero')), list = rest.filter(e => e.getBoundingClientRect().height), h = list.map(e => e.getBoundingClientRect().height), n = list.length;
  let best = { s: Infinity, m: 0 };
  for (let m = 0; m < 1 << n; m += 2) {   // 첫 카드는 왼쪽
    let L = -16, R = -16, miss = 0, turn = 0, bad = false;
    for (let i = 0; i < n; i++) { const r = m >> i & 1;
      if (i && r !== (m >> (i - 1) & 1)) { turn++; if (list[i].dataset.stick != null) bad = true; }
      if (r) R += h[i] + 16; else L += h[i] + 16; if ((list[i].dataset.c === 'r') !== !!r) miss++; }
    if (bad) continue;
    const gap = Math.abs(Math.max(0, L) - Math.max(0, R)), sc = Math.max(0, gap - 80) * 100 + miss * 20 + turn * 5 + gap / 10;
    if (sc < best.s) best = { s: sc, m };
  }
  const right = e => list.includes(e) ? best.m >> list.indexOf(e) & 1 : e.dataset.c === 'r';   // 높이 0(빈 결과 칸)은 원래 자리
  place(c2, rest.filter(right)); place(c1, rest.filter(e => !right(e)));
}
let flowT; addEventListener('resize', () => { cancelAnimationFrame(flowT); flowT = requestAnimationFrame(flow); });
if (document.fonts) document.fonts.ready.then(() => flow());
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
/* 1004 사용자: 목표는 2g/kg 넘게지만, 최소 1.6g/kg 은 꼭 — 그래프에 최소선 */
const minP = () => r5(curWeight() * 1.6);
function minMark(T, split) {   // 끼니 칸들 위에 '최소' 세로선: 누적 단백질이 최소에 닿는 곳
  const mn = minP(); if (!(mn > 0) || mn >= T.p) return '';
  const tot = split.reduce((a, b) => a + b, 0), n = split.length, got = daySum().p >= mn;
  let acc = 0, i = 0; while (i < n - 1 && acc + split[i] < mn) acc += split[i++];
  const frac = Math.min(1, mn / tot);
  return `<span class="min-mk${got ? ' ok' : ''}" style="left:calc(${(frac * 100).toFixed(2)}% - ${((frac * (n - 1) - i) * 6).toFixed(1)}px)" aria-hidden="true"><em>최소 ${mn}g</em></span>`;
}
function mealMeter(T) {
  const names = mealNames(), split = mealSplit(T.p), tgs = mealTargets(T), { cur } = nextTarget(), aria = [];
  const cells = names.map((n, i) => {
    const got = Math.round(slotSum(i)), tg = tgs[i];
    const hit = got >= tg - 10 && got > 0; aria.push(`${n} ${got} / ${tg}g`);
    return `<span class="${hit ? 'hit' : i === cur ? 'next' : ''}"><i style="--w:${Math.min(100, got / Math.max(1, tg) * 100).toFixed(0)}"></i><b>${hit ? ico('check', 'ico--12') : ''}${n}</b></span>`;
  }).join('');
  return `<div class="meter-w"><div class="meter" style="grid-template-columns:${split.map(v => `minmax(40px,${v}fr)`).join(' ')}" role="img" aria-label="끼니별 단백질: ${aria.join(', ')} · 최소 ${minP()}g(몸무게 1kg당 1.6g)">${cells}</div>${minMark(T, split)}</div>`;
}

/* ================= ONBOARDING ================= */
/* 롤모델 카드: 몸 실루엣 + 스타일, 고르면 하늘색 테두리 */
const crButton = (c, act, on) => `<button class="cr" data-act="${act}" data-v="${c.id}" aria-pressed="${on}">${avatar(c, 'av av--lg')}<span class="cr-t"><b class="cr-n">${esc(c.name)}${c.ch ? ` <small>${esc(c.ch)}</small>` : ''}</b><span class="chip">${esc(c.tag)}</span><span class="cr-b">${esc(c.body)}</span></span><span class="on" aria-hidden="true">${ico('check', 'ico--16')}</span></button>`;
const OB = { sex: 'M', steps: 1, meals: 4, min: 60, level: 'beginner', days: [1, 2, 4, 5, 6], lunch: 1, cr: ['idohwang'] };
R.onb = () => {
  const ch = (k, v, label) => `<button class="fq-chip" aria-pressed="${OB[k] === v}" data-act="ob" data-k="${k}" data-v="${v}">${label}</button>`;
  const inp = (id, label, ph, extra = '') => `<label class="stack" for="${id}" style="gap:6px"><span class="fq-t-label">${label}</span><input id="${id}" class="inp" inputmode="decimal" placeholder="${ph}" ${extra}></label>`;
  // 고정 두 줄: 왼쪽 = 기본 정보 → 인바디, 오른쪽 = 되고 싶은 몸, 아래 전체 폭 = 생활 + 운동 요일
  $('#scr-onb').innerHTML = `
    <header class="onb-head pop">${coach('happy', 56)}<div><p class="brand">FITQUEST</p><h1 class="fq-t-title">넓은 프레임을 같이 만들어요</h1><p class="onb-lead">인바디 숫자를 넣으면 끼니마다 먹을 양과 오늘 할 운동을 정해 드려요.</p></div></header>
    <button class="fq-btn fq-btn--secondary fq-btn--block onb-bk" data-act="bkSetup">${ico('cdown')}예전 기록 드라이브에서 불러오기</button>
    <div class="cols onb-cols"><div class="col">
    <section class="fq-card stack" style="gap:12px"><h2 class="fq-t-heading">기본 정보</h2>
      <div class="chips">${ch('sex', 'M', '남성')}${ch('sex', 'F', '여성')}</div>
      <div class="grid2">${inp('obAge', '나이', '예: 32', 'inputmode="numeric"')}${inp('obH', '키 (cm)', '예: 175')}</div></section>
    <section class="fq-card stack" style="gap:12px"><h2 class="fq-t-heading">인바디 <span class="fq-t-caption">결과지 맨 위 "체성분 분석" 숫자</span></h2>
      <div class="grid2">${inp('obW', '체중 (kg)', '예: 75.0')}${inp('obSmm', '골격근량 (kg)', '예: 34.0')}${inp('obPbf', '체지방률 (%)', '예: 20.0')}${inp('obBmr', '기초대사량 (선택)', '예: 1650', 'inputmode="numeric"')}</div>
      <label class="stack" for="obDate" style="gap:6px"><span class="fq-t-label">측정일</span><input id="obDate" class="inp" type="date" value="${new Date().toISOString().slice(0, 10)}"></label></section>
    </div><div class="col">
    <section class="fq-card stack role-pick" style="gap:12px"><h2 class="fq-t-heading">되고 싶은 몸</h2>
      <p class="note" style="margin:0">고른 유튜버의 루틴이 더 자주 들어와요. 여러 명 골라도 돼요.</p>
      <div class="cards">${CREATORS.map(c => crButton(c, 'obCr', OB.cr.includes(c.id))).join('')}</div></section>
    </div>
    <section class="fq-card onb-life" aria-label="생활과 운동 요일">
      <div class="stack"><span class="fq-t-label">하루 걸음 수</span><div class="chips">${STEPS.map((s, i) => ch('steps', i, s[0])).join('')}</div></div>
      <div class="stack"><span class="fq-t-label">하루 끼니 수</span><div class="chips">${[3, 4, 5].map(n => ch('meals', n, n + '끼')).join('')}</div></div>
      <div class="stack"><span class="fq-t-label">점심</span><div class="chips">${ch('lunch', 1, '회사·식당 일반식')}${ch('lunch', 0, '도시락, 직접 조절')}</div></div>
      <div class="stack"><span class="fq-t-label">한 번 운동 시간</span><div class="chips">${[45, 60, 75, 90].map(n => ch('min', n, n + '분')).join('')}</div></div>
      <div class="stack"><span class="fq-t-label">웨이트 경력</span><div class="chips">${ch('level', 'beginner', '6개월 미만, 쉬었다 복귀')}${ch('level', 'intermediate', '6개월 이상 꾸준히')}</div></div>
      <div class="stack"><span class="fq-t-label">운동 요일 <span class="fq-t-caption">주 5회 추천</span></span><div class="days7">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="fq-chip" aria-pressed="${OB.days.includes(d)}" data-act="obDay" data-v="${d}">${DOW[d]}</button>`).join('')}</div></div>
    </section>
    </div>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="obCalc">목표 계산하기</button>
    <div id="obResult"></div>
    <p class="note center">기록은 이 폰에만 저장돼요</p>`;
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
  const order = [1, 2, 3, 4, 5, 6, 0].filter(x => days.includes(x)), seq = { 3: ['A', 'B', 'C'], 4: ['A', 'B', 'C', 'D'], 5: ['A', 'B', 'C', 'D', 'E'], 6: ['A', 'B', 'C', 'D', 'E', 'B'], 7: ['A', 'B', 'C', 'D', 'E', 'B', 'D'] }[order.length] || ['A', 'C'];
  const s = {}; order.forEach((d, i) => s[d] = seq[i % seq.length]); return s;
}

/* ================= HOME ================= */
/* 오늘 3칸: 운동(쉬는 날은 체중) · 단백질 · 완전 기록 — checkDaily3 과 같은 기준, 모두 닫히면 +30 XP */
function daily3(k = dayKey()) {
  const T = targets(), S = daySum(), train = isTrainDay(k), all = !!DB.flags['all_' + k];
  return [
    train ? { n: '운동', ic: 'dumbbell', p: DB.done[k] ? 1 : 0, v: DB.done[k] ? '완료' : '오늘 할 일' } : { n: '체중', ic: 'scale', p: DB.weights[k] ? 1 : 0, v: DB.weights[k] ? `${DB.weights[k]}kg` : '아직' },
    { n: '단백질', ic: 'utensils', p: Math.min(1, S.p / (T.p * .9)), v: `${Math.round(S.p)}/${T.p}g${S.p < minP() ? ` · 최소 ${minP()}` : ''}` },
    { n: '기록', ic: 'check', p: all ? 1 : 0, v: all ? '다 적음' : '아직' }
  ];
}
function d3Strip(k) {
  const d = daily3(k), key = 'd3_' + k, was = String(DB.flags[key] || '000'), now = d.map(x => x.p >= 1 ? 1 : 0).join(''), fresh = now !== was;
  if (fresh) { DB.flags[key] = now; save(); }
  const allNow = now === '111', allNew = allNow && was !== '111';
  return `<button class="d3${allNow ? ' all' : ''}${allNew ? ' just' : ''}" data-act="d3" aria-label="오늘 3칸: ${d.map(x => `${x.n} ${x.p >= 1 ? '완료' : x.v}`).join(', ')}. 자세히">
    ${d.map((x, i) => `<span class="d3-i${x.p >= 1 ? ' on' : ''}${x.p >= 1 && was[i] !== '1' ? ' closing' : ''}"><span class="d3-r">${ringSvg(x.p)}${ico(x.ic, 'ico--14')}</span><span class="d3-t"><b>${x.n}</b><small class="num">${x.v}</small></span></span>`).join('')}
    ${allNew ? '<span class="xp-pop num" aria-hidden="true">+30 XP</span>' : ''}</button>`;
}
function d3Sheet() {
  const k = dayKey(), d = daily3(k), train = isTrainDay(k), done = d.every(x => x.p >= 1);
  const act = [train ? (DB.done[k] ? '' : `<button class="fq-btn fq-btn--secondary fq-btn--sm" data-act="startQuest">운동 시작</button>`) : (DB.weights[k] ? '' : `<button class="fq-btn fq-btn--secondary fq-btn--sm" data-go="grow">체중 재기</button>`),
    d[1].p >= 1 ? '' : `<button class="fq-btn fq-btn--secondary fq-btn--sm" data-go="diet">식단</button>`, d[2].p >= 1 ? '' : `<button class="fq-btn fq-btn--secondary fq-btn--sm" data-go="diet">다 적기</button>`];
  sheet(`<div class="row row--between"><h2 class="fq-t-title">오늘 3칸</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-body" style="margin:-6px 0 0">셋 다 닫으면 <b class="gold-t">+30 XP</b>${done ? ', 오늘은 받았어요' : ''}</p>
    <div class="d3-list">${d.map((x, i) => `<div class="d3-row${x.p >= 1 ? ' on' : ''}"><span class="d3-r d3-r--lg">${ringSvg(x.p)}${ico(x.ic, 'ico--16')}</span><span><b>${x.n}</b><small class="num">${x.p >= 1 ? '닫았어요' : x.v}</small></span>${act[i]}</div>`).join('')}</div>`);
}
/* 오늘 루틴이 채우는 우선 부위 세트 (보상 미리보기) */
function tplPrio(t) {
  const c = {}; TPL[t].ex.forEach(([id, n]) => [...new Set(EX[id].mus)].forEach(m => { if (BP_FOCUS.includes(m)) c[m] = (c[m] || 0) + n; }));
  const m = BP_FOCUS.filter(x => c[x]).sort((a, b) => c[b] - c[a])[0]; return m ? `${PRIO.find(p => p[1] === m)[0]} +${c[m]}세트` : '';
}
/* 코치 한 줄: 지난 운동과 오늘을 이어서 */
function heroLine(k, t) {
  const s = DB.sessions[DB.sessions.length - 1], part = PART_NAME[partOf(t)];
  if (!s) return `첫 퀘스트예요. 오늘은 ${part}, 가볍게 시작해요`;
  const g = daysBetween(s.day, k), sp = PART_NAME[partOf(s.tpl, s.ex)], when = g <= 1 ? (g ? '어제' : '오늘') : `${g}일 전`;
  return sp === part ? `${when}도 ${part}였어요. 무게는 알아서 맞춰 뒀어요` : `${when} ${sp} ${setsOf(s)}세트, 오늘은 ${part} 차례예요`;
}
/* 홈 영상: 썸네일 3개까지 (전체 카드는 운동 탭) */
function tvStrip(k) {
  const v = todayVideos(k); if (!v || !v.list.length) return '';
  return `<div class="tv-strip" aria-label="${v.next ? '다음 운동 미리보기 영상' : '오늘 보고 가면 좋은 영상'}">${v.list.map(x => `<a class="vs" href="${esc(x.u)}" target="_blank" rel="noopener" data-part="${v.part}" aria-label="${esc(x.title)}, ${x.t}부터 재생">${vThumb(x)}<span class="vt">${ico('play', 'fill ico--12')}${x.t === '00:00' ? '처음' : x.t}</span></a>`).join('')}</div>`;
}
R.home = () => {
  const k = dayKey(), T = targets(), S = daySum(), nx = nextTarget(), { left, nt, capped } = nx, P = DB.profile;
  const tpl = tplFor(k), done = !!DB.done[k], m = hm(), gap = comebackGap(), T0 = tpl && TPL[tpl], lv = lvInfo();
  const lunch = lunchCard('style="--o:3"'), comebackOn = gap >= 7 && tpl && !done, short = S.p < T.p * .9, showRescue = m >= 1200 && m < 1380 && left >= 20 && short;
  // "지금 할 것"은 하나만: 점심 → 복귀/오늘 운동 → 단백질 구조대 → 다음 끼니
  const now = lunch ? 'lunch' : comebackOn ? 'comeback' : tpl && !done ? 'quest' : showRescue ? 'rescue' : left > 0 ? 'protein' : '';
  const rs = RESCUE.find(r => nt <= r[0]);   // 거품의 다음 끼니 숫자(nt)와 같은 기준으로 고름
  const img = T0 && T0.ex.map(e => EX[e[0]] && EX[e[0]].img).find(Boolean), cr = creatorOf(T0), nSets = T0 ? T0.ex.reduce((a, e) => a + e[1], 0) : 0;
  let nxd = null; if (!tpl) for (let i = 1; i <= 7 && !nxd; i++) { const d = addDays(k, i); if (tplFor(d)) nxd = d; }
  const hero = comebackOn ? `<section class="tile card-pad hero cb sel" style="--o:1" aria-label="복귀">
      <div class="l-head">${coach('happy', 44)}<p>다시 왔네요, 반가워요. 오늘은 가볍게 15분.<small>무게는 쉰 기간만큼 낮춰 뒀어요. 최고 기록 ${DB.streak.best}일은 그대로예요.</small></p></div>
      <span class="chip gd cb-xp">${ico('zap', '')}첫 운동 XP 2배</span>
      <ol class="cb-steps"><li data-on><b class="num">1</b>오늘 단백질 + 15분</li><li><b class="num">2</b>정규 운동 1회</li><li><b class="num">3</b>이번 주 계획 절반</li></ol>
      <button class="fq-btn fq-btn--lg fq-btn--block" data-act="cond" data-c="short">${ico('play', 'fill')}15분 운동 시작</button><button class="fq-btn fq-btn--secondary fq-btn--block" data-act="startQuest">평소 루틴으로</button></section>`
    : !tpl ? `<section class="tile card-pad hero hero--row" style="--o:1" aria-label="오늘">
      <div class="l-head">${coach('idle', 44)}<p>근육은 쉬는 날 자라요.<small>단백질 ${T.p}g과 걷기면 충분해요</small></p></div>
      <button class="fq-btn fq-btn--secondary" data-act="pickTpl">그래도 운동할래요</button>
      ${nxd ? `<p class="fq-t-caption strip-cap">${DOW[dow(nxd)]}요일 ${PART_NAME[partOf(tplFor(nxd))]} 미리보기</p>${tvStrip(k)}` : ''}</section>`
    : done ? `<section class="tile card-pad hero hero--row" style="--o:1" aria-label="오늘 운동"><div class="done-row"><span class="ck">${ico('check', '')}</span><div><p class="lab">오늘 운동 완료</p><h2 class="fq-t-heading">${esc(T0.ko)}</h2></div></div>
      <p class="fq-t-caption">${left > 0 ? `남은 할 일은 단백질 ${left}g이에요.` : '단백질까지 끝! 푹 쉬어요.'}</p></section>`
    : `<section class="tile quest hero ${now === 'quest' ? 'sel' : ''}" style="--o:1" aria-label="오늘 운동">
      ${img ? `<img src="media/${img}_0.jpg" alt="" loading="lazy">` : ''}
      <div class="q-body">
        <div class="q-coach">${coach(m >= 1200 ? 'think' : 'happy', 32)}<p>${esc(heroLine(k, tpl))}</p></div>
        <h2>${esc(T0.code)} <span>${esc(T0.by ? T0.ko.replace(T0.by + ' · ', '') : T0.ko)}</span></h2>
        <p class="by">${avatar(cr)}${T0.by ? esc(T0.by) + ' 루틴' : '기본 V자 루틴'} · ${nSets}세트 약 ${P.sessionMin}분</p>
        <p class="reward"><span class="chip gd num">${ico('zap', '')}+${100 + nSets * 3} XP</span>${tplPrio(tpl) ? `<span class="gold-t">${tplPrio(tpl)}</span>` : ''}</p>
        <button class="fq-btn fq-btn--lg fq-btn--block" data-act="startQuest">${ico('play', 'fill')}운동 시작</button>
        ${tvStrip(k)}
      </div></section>`;
  checkDaily3();
  const risk = m >= 1200 && !daily3(k).every(x => x.p >= 1);
  const wCard = m >= 240 && m < 660 && !DB.weights[k] ? `<section class="tile card-pad wcard" style="--o:1" aria-label="아침 체중"><label class="fq-t-heading" for="wInH">아침 체중</label><input id="wInH" class="inp" inputmode="decimal" placeholder="${curWeight().toFixed(1)}" aria-label="오늘 체중 kg"><button class="fq-btn fq-btn--secondary" data-act="weigh">기록</button></section>` : '';
  $('#scr-home').innerHTML = `
    <header class="top">
      ${d3Strip(k)}
      <span class="streak${risk ? ' risk' : ''}" aria-label="연속 기록 ${streakNow()}일">${ico('flame', '')}<span><b class="num">${streakNow()}</b>일</span></span>
      <button class="lv" data-go="grow" aria-label="레벨 ${lv.L}, 다음 레벨까지 ${lv.p}%. 성장 탭 열기"><span class="lv-r">${ringSvg(lv.p / 100, 'gold')}<b class="num">${lv.L}</b></span><span class="lv-t"><b>레벨 ${lv.L}</b><small>${titleOf(lv.L)}</small></span></button>
      <button class="round" data-go="set" aria-label="설정">${ico('gear')}</button>
    </header>
    <div class="cols cols--flow"><div class="col">
    ${hero}
    ${wCard}
    ${reportCard('head')}
    <section class="tile bubble ${now === 'protein' || now === 'rescue' ? 'sel' : ''}" style="--o:3" aria-label="다음 끼니 단백질">
      ${short ? `<p class="lab">${nextLab(nx)}</p>
      <p class="big"><span class="num">${nt}</span><span class="u">g</span><span class="what">단백질</span></p>`
      : `<p class="lab">오늘 단백질</p><p class="big"><span class="what done">다 채웠어요</span><span class="chip gd">+50 XP</span></p>`}
      ${mealMeter(T)}
      <p class="meta"><span>${capped ? `오늘 <b class="num">${left}</b>g 남음 · 다 못 채워도 괜찮아요` : `오늘 <b class="num" data-count="p">${Math.round(S.p)}</b> / ${T.p}g`}</span>${left > 0 && !showRescue ? `<button class="linkbtn" data-act="wte">${ico('utensils', 'ico--16')}뭐 먹지?</button>` : ''}</p>
      ${showRescue ? `<div class="bub-foot"><p class="fq-t-label">${esc(rs[1])}면 11시 전에 끝나요<small class="fq-t-caption">단백질 ${rs[2]}g ${rs[3]}kcal · 가볍고 단백질 많은 조합</small></p>
        <button class="fq-btn ${now === 'rescue' ? '' : 'fq-btn--secondary'} fq-btn--block" data-act="rescue">이걸로 기록 +20 XP</button></div>` : ''}
    </section>
    ${lunch}
    ${reportCard('body')}
    ${P.chapter === 0 ? ch0Card(ch0Status()) : ''}
    ${photoHomeCard()}
    </div></div>`;
};

/* ---------- 내 운동 성적표 (홈) ---------- */
const PRIO = [['측면 삼각근', 'delt-side'], ['광배근', 'lats'], ['윗가슴', 'chest-upper']];
const iga = s => (s.charCodeAt(s.length - 1) - 0xAC00) % 28 ? '이' : '가';   // 받침 있으면 "이"
const spark = (v, w = 96, h = 28, fluid) => { if (v.length < 2) return ''; const lo = Math.min(...v), r = Math.max(...v) - lo || 1;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" ${fluid ? 'preserveAspectRatio="none"' : `width="${w}" height="${h}"`} aria-hidden="true"><polyline points="${v.map((x, i) => `${(2 + i / (v.length - 1) * (w - 4)).toFixed(1)},${(h - 3 - (x - lo) / r * (h - 6)).toFixed(1)}`).join(' ')}"/></svg>`; };
/* 꾸준함: 최근 28일(첫 운동·챕터 시작 이후만) 운동한 날 ÷ 루틴이 잡힌 날. 오늘은 끝냈을 때만 셈.
   ponytail: 지난 날의 계획도 지금 주간 루틴(tplFor)으로 다시 계산 — 요일을 바꾸면 과거 %도 바뀜. 정확히 하려면 그날 계획을 저장해야 함 */
function consistency(k = dayKey()) {
  const first = [DB.sessions[0] && DB.sessions[0].day, DB.profile.chapterStart].filter(Boolean).sort()[0] || k;
  let d = addDays(k, -27) > first ? addDays(k, -27) : first, plan = 0, done = 0;
  for (; d <= k; d = addDays(d, 1)) { if (DB.done[d]) done++; if (tplFor(d) && (d < k || DB.done[d])) plan++; }
  return { plan, done, pct: plan ? Math.min(100, Math.round(done / plan * 100)) : null };
}
/* 근력 추세: 최근 28일에 2번 이상 한 운동 최대 3개(우선 부위 먼저), 그날 최고 e1RM 처음 → 마지막. 보조 머신은 보조 무게가 적을수록 좋음 */
function liftTrend(k = dayKey()) {
  const from = addDays(k, -27), by = {};
  DB.sessions.filter(s => s.day >= from && s.day <= k).forEach(s => s.ex.forEach(e => { const E = EX[e.id]; if (!E || !e.sets.length) return;
    (by[e.id] = by[e.id] || []).push(E.kind === 'as' ? -Math.min(...e.sets.map(z => z.w)) : Math.max(...e.sets.map(z => z.w))); }));   // 0928 최고 무게 기준 (빠른 기록과 같은 잣대)
  const pri = id => EX[id].mus.some(m => BP_FOCUS.includes(m)) ? 0 : 1;
  return Object.entries(by).filter(([, v]) => v.length >= 2).sort(([a, va], [b, vb]) => pri(a) - pri(b) || vb.length - va.length)
    .slice(0, 3).map(([id, v]) => ({ id, v, as: EX[id].kind === 'as', d: Math.round((v[v.length - 1] - v[0]) * 2) / 2 }));
}
/* ===== 1004 라이즈에서 가져온 것 (사용자: 좋은 점은 다 적용) =====
   ① 운동별 성장 그래프 ② 원판 계산·웜업 ③ 운동 끝 공유 카드 ④ 내 헬스장 기구 → 없는 기구 운동은 같은 부위 대체 */
const MUS_KO = { 'delt-side': '측면 어깨', lats: '광배근', 'chest-upper': '윗가슴', chest: '가슴', 'delt-front': '앞 어깨', traps: '승모근', biceps: '이두', triceps: '삼두', forearm: '전완', abs: '복근', obliques: '옆구리', quads: '허벅지', hams: '햄스트링', glutes: '엉덩이', calves: '종아리' };
function liftHist(id) {   // 그 운동을 한 날마다 최고 무게(보조 머신은 가장 가벼운 보조) — 최근 12번
  const as = EX[id] && EX[id].kind === 'as';
  return DB.sessions.filter(s => s.ex.some(e => e.id === id && e.sets.length)).map(s => { const e = s.ex.find(x => x.id === id && x.sets.length), ws = e.sets.map(z => z.w); return { day: s.day, w: as ? Math.min(...ws) : Math.max(...ws) }; }).slice(-12);
}
function liftIds() { const c = {}; DB.sessions.forEach(s => s.ex.forEach(e => { if (EX[e.id] && e.sets.length) c[e.id] = (c[e.id] || 0) + 1; })); return Object.keys(c).filter(id => c[id] >= 2).sort((a, b) => c[b] - c[a]); }
function liftChart(id) {
  const h = liftHist(id), as = EX[id].kind === 'as'; if (h.length < 2) return '<p class="fq-t-caption">2번 이상 하면 그래프가 그려져요.</p>';
  const W0 = 320, H0 = 150, pl = 34, pr = 10, pt = 16, pb = 24, ws = h.map(x => x.w), lo = Math.min(...ws), hi = Math.max(...ws), sp = hi - lo || 1;
  const X = i => pl + i * (W0 - pl - pr) / (h.length - 1), Y = w => pt + (H0 - pt - pb) * (as ? (w - lo) / sp : 1 - (w - lo) / sp);
  let best = null; const pts = h.map((x, i) => { const pr0 = best == null || (as ? x.w < best : x.w > best); if (pr0) best = x.w; return { ...x, i, pr: pr0 && i > 0 }; });
  const md = d => `${+d.slice(5, 7)}/${+d.slice(8)}`, d0 = h[0].w, d1 = h[h.length - 1].w, dv = Math.round((as ? d0 - d1 : d1 - d0) * 10) / 10;
  return `<p class="lf-sum"><b class="num">${wLabel(id, d0)}kg → ${wLabel(id, d1)}kg</b> <span class="lf-d${dv > 0 ? ' up' : dv < 0 ? ' dn' : ''}">${dv > 0 ? '+' : dv < 0 ? '−' : '±'}${Math.abs(dv)}kg</span><small>${h.length}번 · ${md(h[0].day)}부터</small></p>
    <svg class="lf-svg" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="${esc(EX[id].n)} 최고 무게 ${h.map(x => md(x.day) + ' ' + x.w + 'kg').join(', ')}">
      ${[hi, lo].map(w => `<line x1="${pl}" x2="${W0 - pr}" y1="${Y(w)}" y2="${Y(w)}" class="lf-g"/><text x="${pl - 6}" y="${Y(w) + 4}" class="lf-ax" text-anchor="end">${w}</text>`).join('')}
      <polyline class="lf-ln" points="${pts.map(p => `${X(p.i).toFixed(1)},${Y(p.w).toFixed(1)}`).join(' ')}"/>
      ${pts.map(p => `<circle class="lf-pt${p.pr ? ' pr' : ''}" cx="${X(p.i).toFixed(1)}" cy="${Y(p.w).toFixed(1)}" r="${p.pr ? 5 : 3.5}"/>`).join('')}
      <text x="${pl}" y="${H0 - 6}" class="lf-ax">${md(h[0].day)}</text><text x="${W0 - pr}" y="${H0 - 6}" class="lf-ax" text-anchor="end">${md(h[h.length - 1].day)}</text>
    </svg><p class="fq-t-caption"><span class="lf-key"></span>금색 점 = 새 기록${as ? ' · 보조 머신은 아래로 갈수록 좋아요' : ''}</p>`;
}
function liftSheet(id) {
  const ids = liftIds(); if (!ids.length) return toast('<span>같은 운동을 2번 하면 그래프가 생겨요.</span>');
  id = ids.includes(id) ? id : ids[0];
  sheet(`<div class="row row--between"><h2 class="fq-t-title">운동별 성장</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <div class="lf-chips" role="group" aria-label="운동 고르기">${ids.map(x => `<button class="fq-chip" aria-pressed="${x === id}" data-act="liftOpen" data-id="${x}">${esc(EX[x].n)}</button>`).join('')}</div>
    <div class="lf-box">${liftChart(id)}</div>`);
}
/* ② 원판: 봉 20kg, 한쪽에 25·20·15·10·5·2.5·1.25 큰 것부터 */
const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25], isBar = id => EX[id] && (EX[id].kind === 'bb' || EX[id].kind === 'bbl') && !/스미스/.test(EX[id].n);   // 스미스 머신은 봉 무게가 달라 뺌
function plateText(w) {
  w = +w; if (!(w > 0)) return ''; if (w < 20) return '봉 20kg보다 가벼워요';
  let side = (w - 20) / 2; if (side < .01) return '봉만 (20kg)';
  const out = []; PLATES.forEach(p => { while (side >= p - 1e-9) { out.push(p); side = Math.round((side - p) * 100) / 100; } });
  const grp = []; out.forEach(p => { const g = grp.find(x => x[0] === p); g ? g[1]++ : grp.push([p, 1]); });
  return `한쪽 ${grp.map(([p, n]) => n > 1 ? `${p}×${n}` : p).join(' + ')}${side > .01 ? ` (+${side} 안 맞음)` : ''} · 봉 20`;
}
function warmText(w) { w = +w; if (!(w >= 50)) return ''; const r = x => Math.max(20, Math.round(x / 2.5) * 2.5), st = [[20, 10], [r(w * .5), 8], [r(w * .7), 4]].filter((x, i, A) => !i || x[0] > A[i - 1][0]); return `웜업 먼저: ${st.map(([v, n], i) => (i ? v : '봉 20') + '×' + n).join(' → ')} → 본 세트`; }
/* ④ 내 헬스장 기구: 꺼 둔 기구를 쓰는 운동은 같은 주 근육을 쓰는 다른 기구 운동으로 */
const GYM = [['bb', '바벨'], ['db', '덤벨'], ['cb', '케이블'], ['mc', '머신'], ['as', '어시스트 머신']], kGrp = k => k === 'bbl' ? 'bb' : k;
const gymOff = () => (DB.settings.gymOff || []);
function exSub(id) {
  const E = EX[id], off = gymOff(); if (!E || !off.length || !off.includes(kGrp(E.kind))) return id;
  const ok = Object.keys(EX).filter(x => x !== id && EX[x].mus && EX[x].range && !off.includes(kGrp(EX[x].kind)) && EX[x].mus[0] === E.mus[0]);
  const sc = x => EX[x].mus.filter(m => E.mus.includes(m)).length; ok.sort((a, b) => sc(b) - sc(a));
  return ok[0] || id;
}
/* 몸 추세: 최근 7일 평균 vs 14–20일 전 평균(각 3번 이상 잰 날) + 인바디 체지방 변화. 좋은 방향은 챕터마다 다름 */
function bodyTrend(k = dayKey()) {
  const avg = (a, b) => { const v = []; for (let i = a; i <= b; i++) { const x = DB.weights[addDays(k, -i)]; if (x) v.push(x); } return v.length >= 3 ? v.reduce((s, x) => s + x, 0) / v.length : null; };
  const a = avg(0, 6), b = avg(14, 20), w = a != null && b != null ? Math.round((a - b) * 10) / 10 : null, L = DB.inbody.length;
  const pbf = L >= 2 ? Math.round((DB.inbody[L - 1].pbf - DB.inbody[L - 2].pbf) * 10) / 10 : null, ch = DB.profile.chapter, wk = w / 2;
  const good = w == null ? null : ch === 1 ? w < 0 : ch === 3 ? wk >= .2 && wk <= .5 : ch === 2 ? Math.abs(wk) <= .3 : null;
  const wrong = w != null && (ch === 1 ? w > .2 : ch === 3 ? w < -.2 : false);
  return { w, now: a, pbf, good, wrong };
}
/* 최근 3주 7일 평균 체중 (몸 추세 · 성장 탭 선) */
function wTrend(k = dayKey()) {
  const avg = i => { const v = []; for (let j = i; j < i + 7; j++) { const x = DB.weights[addDays(k, -j)]; if (x) v.push(x); } return v.length ? v.reduce((q, x) => q + x, 0) / v.length : null; };
  return Array.from({ length: 22 }, (_, i) => avg(21 - i)).filter(x => x != null);
}
/* 코치 한 줄: 위에서부터 처음 맞는 것 하나 */
function verdict(k, c, lifts, body) {
  if (!DB.sessions.some(s => s.day <= k && daysBetween(s.day, k) < 28)) return ['think', '첫 운동부터, 오늘 15분이면 돼요'];
  if (c.pct != null && c.pct < 60) return ['think', `빈도가 먼저예요 · 이번 주 ${Math.max(0, trainDaysPerWeek() - weekDone())}번 남았어요`];
  if ([4, 5, 6, 0].includes(dow(k))) {
    const ws = weekSets(), lack = PRIO.find(([, m]) => (ws[m] || 0) / BP_T[m] < .5);
    if (lack) for (let i = DB.done[k] ? 1 : 0; i <= 7; i++) { const d = addDays(k, i), t = tplFor(d);
      if (t && TPL[t].ex.some(([id]) => EX[id].mus.includes(lack[1]))) return ['think', `${lack[0]}${iga(lack[0])} 모자라요 · ${i ? DOW[dow(d)] + '요일' : '오늘'} ${PART_NAME[partOf(t)]}날에 채워요`]; }
  }
  if (body.wrong) return ['think', `체중이 ${body.w > 0 ? '늘고' : '줄고'} 있어요 · 식단부터 봐요`, 'diet'];
  if (lifts.filter(x => x.d < 0).length >= 2) return ['think', '힘이 떨어져요 · 잠·단백질 확인'];
  return ['happy', '잘하고 있어요, 이대로'];
}
function calMini(ym) {
  const today = dayKey(), by = sessByDay();
  const dots = Array.from({ length: ymDays(ym) }, (_, i) => { const k = `${ym}-${pad(i + 1)}`, s = by[k]; return `<i${s ? ' data-on' : !s && k > today && tplFor(k) ? ' data-plan' : ''}${k === today ? ' data-today' : ''}></i>`; }).join('');
  return `<span class="cal-mini cal-mini--md" aria-hidden="true">${'<i class="x"></i>'.repeat((dow(ym + '-01') + 6) % 7)}${dots}</span>`;
}
const kg = x => `${x > 0 ? '▲' : x < 0 ? '▼' : '±'}${Math.abs(x)}`;
/* 주간 등급: 꾸준함 + 코치 판정 (S 는 꾸준함 90% 이상이고 지적할 게 없을 때) */
const gradeOf = (c, face) => c.pct == null ? null : c.pct >= 90 && face === 'happy' ? 'S' : c.pct >= 75 ? 'A' : c.pct >= 60 ? 'B' : 'C';
const GRADE_T = { S: '최고예요', A: '좋아요', B: '보통', C: '다시 시작' };
/* 성적표: head = 등급 + 판정 한 줄 + 이번 주 (홈 첫 화면), body = 달력 · 우선 부위 · 꾸준함 · 추세. 인자 없으면 둘 다 */
function reportCard(part) {
  const k = dayKey(), ym = k.slice(0, 7), wd = weekDone(), pl = Math.max(trainDaysPerWeek(), wd), ws = weekSets(), c = consistency(k), best = Math.max(DB.streak.best, streakNow());
  const empty = DB.sessions.length < 3, lifts = empty ? [] : liftTrend(k), body = empty ? {} : bodyTrend(k), [face, say, go] = verdict(k, c, lifts, body), g = empty ? null : gradeOf(c, face);
  const monthDays = Object.keys(sessByDay()).filter(d => d.startsWith(ym)).length;
  const lt = lifts[0], sign = x => x > 0 ? 'good' : x < 0 ? 'warn' : '';
  const head = `<section class="tile card-pad rc rc-head" style="--o:2" aria-label="이번 주 판정">
    <div class="rc-say">${g ? `<span class="grade" data-g="${g}" role="img" aria-label="이번 주 등급 ${g}, ${GRADE_T[g]}"><b>${g}</b></span>` : `<span class="grade" data-g="" role="img" aria-label="등급은 운동 3번 뒤부터"><b>${ico('star', 'ico--20')}</b></span>`}
      <p><b>${empty ? '운동 3번이면 성적표가 채워져요' : esc(say)}</b><small>${empty ? `지금 ${DB.sessions.length}번 했어요` : g ? `이번 주 등급 ${GRADE_T[g]}` : ''}</small></p>${go ? `<button class="linkbtn ink" data-go="${go}">식단 보기${ico('chev', 'ico--16')}</button>` : ''}</div>
    <div class="rc-wk"><span class="fq-t-label">이번 주 <b class="num">${wd}/${pl}</b>회</span><span class="pips rc-pips" style="grid-template-columns:repeat(${pl},1fr)" aria-hidden="true">${'<i class="d"></i>'.repeat(wd)}${'<i></i>'.repeat(pl - wd)}</span></div>
  </section>`;
  const bodyC = `<section class="tile card-pad rc rc-body" style="--o:4" aria-labelledby="rcH">
    <div class="card-h"><h2 class="fq-t-heading" id="rcH">내 운동 성적표</h2><span class="fq-t-caption">최근 4주</span></div>
    <button class="rc-top" data-act="calOpen" aria-label="운동 달력 열기. ${+ym.slice(5)}월 운동 ${monthDays}일">
      ${calMini(ym)}
      <span class="rc-mo"><span class="fq-eyebrow">${+ym.slice(5)}월 운동</span><span><span class="fq-t-num-md">${monthDays}</span><span class="fq-unit">일</span></span>
        <span class="fq-t-caption row" style="gap:2px">달력 보기${ico('chev', 'ico--16')}</span></span></button>
    <div class="rc-bars">${PRIO.map(([n, m]) => { const v = ws[m] || 0, ok = v >= BP_T[m], sc = Math.max(BP_T[m] * 1.25, v); return `<div class="rc-bar"><span class="fq-t-label">${n}</span><span class="bar2" data-ok="${ok}"><i class="tr"></i><i class="fl" style="width:${(v / sc * 100).toFixed(1)}%"></i><i class="tk" style="left:${(BP_T[m] / sc * 100).toFixed(1)}%"></i></span><span class="fq-t-caption num" data-ok="${ok}">${ok ? ico('check', 'ico--12') : ''}${v}/${BP_T[m]}</span></div>`; }).join('')}</div>
    <div class="grid2 rc-stats"><div class="rc-trend"><span class="fq-eyebrow">꾸준함 4주</span><span class="fq-t-num-md" data-v="pct">${c.pct == null ? '—' : c.pct}<small>%</small></span><span class="fq-t-caption">운동 ${c.done}일 / 계획 ${c.plan}일</span></div>
      <div class="rc-trend"><span class="fq-eyebrow">연속 기록</span><span class="fq-t-num-md" data-v="streak">${streakNow()}<small>일</small></span><span class="fq-t-caption">최고 ${best}일</span></div></div>
    ${empty ? '' : `<div class="grid2 rc-trends">
      <div class="rc-trend" data-v="lift"><span class="fq-eyebrow">근력 추세</span>${lt ? `<button class="linkbtn ink rc-lf" data-act="liftOpen" data-id="${lt.id}">운동별 그래프${ico('chev', 'ico--16')}</button>` : ''}${lt ? `<span class="fq-t-num-md rc-d" data-s="${sign(lt.d)}">${kg(lt.d)}<small>kg</small></span><span class="fq-t-caption rc-n">${esc(EX[lt.id].n)}${lt.as ? ' 보조' : ''}</span>${spark(lt.v)}
        ${lifts.slice(1).map(x => `<span class="fq-t-caption rc-li"><span>${esc(EX[x.id].n)}</span><b class="num rc-d" data-s="${sign(x.d)}">${kg(x.d)}</b></span>`).join('')}` : '<span class="fq-t-caption">같은 운동을 2번 하면 보여요</span>'}</div>
      <div class="rc-trend" data-v="body"><span class="fq-eyebrow">몸 추세 2주</span>${body.w != null ? `<span class="fq-t-num-md rc-d" data-s="${body.good ? 'good' : body.wrong ? 'warn' : ''}">${body.w > 0 ? '+' : body.w < 0 ? '−' : '±'}${Math.abs(body.w)}<small>kg</small></span><span class="fq-t-caption">7일 평균 ${body.now.toFixed(1)}kg</span>${spark(wTrend(k))}` : '<span class="fq-t-caption">체중을 3번씩 재면 보여요</span>'}
        ${body.pbf != null ? `<span class="fq-t-caption rc-li"><span>체지방률</span><b class="num rc-d" data-s="${body.pbf < 0 ? 'good' : body.pbf > 0 ? 'warn' : ''}">${body.pbf > 0 ? '+' : body.pbf < 0 ? '−' : '±'}${Math.abs(body.pbf)}%p</b></span>` : ''}</div></div>`}
  </section>`;
  return part === 'head' ? head : part === 'body' ? bodyC : head + bodyC;
}

/* ---------- 오늘 보고 가면 좋은 영상 (홈 · 운동 탭) ---------- */
const tSec = u => +((String(u).match(/[?&]t=(\d+)/) || [])[1] || 0);
/* 같은 부위 다른 루틴: 롤모델 루틴 먼저, 그다음 오래 안 한 순 */
function partCands(part, excl) {
  const mine = DB.profile.creators || [], last = {}; DB.sessions.forEach(s => { last[s.tpl] = s.day; });
  return [...new Set(ROT[part].concat(Object.keys((DB.custom && DB.custom.tpls) || {})))].filter(t => t !== excl && TPL[t] && !TPL[t].off && partOf(t) === part)
    .sort((a, b) => { const ma = mine.includes((creatorOf(TPL[a]) || {}).id || TPL[a].cr), mb = mine.includes((creatorOf(TPL[b]) || {}).id || TPL[b].cr); return mb - ma || String(last[a] || '').localeCompare(String(last[b] || '')); });
}
/* 운동 하나의 장면: 루틴에 적힌 시각(o.t) → 없으면 그 운동이 나오는 다른 루틴 → 운동 기본 영상. 시작 시각 없는 링크는 버림 */
function exScene(id, o) {
  const hit = [o && o.t].concat(Object.values(TPL).flatMap(t => t.ex.filter(e => e[0] === id && e[2] && e[2].t).map(e => e[2].t)), EX[id].v).find(v => v && tSec(v.u));
  return hit ? { u: hit.u, t: hit.t, who: hit.who, label: hit.label, id } : null;
}
function todayVideos(k) {
  let t = tplFor(k), day = k;
  for (let i = 1; !t && i <= 7; i++) { day = addDays(k, i); t = tplFor(day); }
  if (!t) return null;
  const T = TPL[t], part = partOf(t), ws = weekSets(), out = [], seen = new Set();
  const fill = id => Math.min(1, ...EX[id].mus.filter(m => BP_FOCUS.includes(m)).map(m => (ws[m] || 0) / BP_T[m]));   // 덜 채운 우선 부위 먼저
  const add = x => { const v = ytId(x.u); if (!v || seen.has(v) || out.length >= 3) return; seen.add(v); out.push({ ...x, vid: v, part }); };
  if (T.video) {
    const chips = T.ex.map(([id, , o]) => o && o.t && tSec(o.t.u) ? { u: o.t.u, t: o.t.t, id } : null).filter(Boolean).sort((a, b) => fill(a.id) - fill(b.id)).slice(0, 3);
    if (chips.length) add({ u: chips[0].u, t: chips[0].t, title: T.ko, who: T.by, cr: creatorOf(T), tpl: t, chips });
  } else T.ex.forEach(([id, , o]) => { const s = exScene(id, o); if (s) add({ u: s.u, t: s.t, title: `${EX[id].n}${s.label ? ` · ${String(s.label).replace(/^.*? · /, '')}` : ''}`, who: s.who, cr: CREATORS.find(c => c.name === s.who), ex: id }); });
  partCands(part, t).forEach(c => { const C = TPL[c]; if (!C.video) return;
    const shared = C.ex.find(([id, , o]) => o && o.t && tSec(o.t.u) && T.ex.some(e => e[0] === id)), first = C.ex.find(([, , o]) => o && o.t && tSec(o.t.u)), s = (shared || first || [])[2];
    if (s) add({ u: s.t.u, t: s.t.t, title: C.ko, who: C.by, cr: creatorOf(C), tpl: c }); });
  // 봐볼 영상에서 "영상에 저장"한 참고 영상 (키 없이) — 그 부위 날에 두 번째 자리부터
  const rf = ((DB.follow || {}).refs || []).filter(r => r.part === part && !seen.has(r.vid)).slice(-2).reverse().map(r => ({ u: `https://youtu.be/${r.vid}?t=0`, t: '00:00', title: r.title, who: r.name, cr: CREATORS.find(c => c.id === r.cr), vid: r.vid, part, ref: 1 }));
  out.splice(1, 0, ...rf); out.length = Math.min(out.length, 3);
  return { t, day, next: day !== k, part, list: out };
}
const vThumb = (x, cls = 'vthumb') => `<span class="${cls}">${avatar(x.cr, 'av')}<img src="https://i.ytimg.com/vi/${x.vid}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"></span>`;
function tvCard(k, attrs, hid) {
  const v = todayVideos(k); if (!v || !v.list.length) return '';
  const [h, ...rest] = v.list;
  return `<section class="tile card-pad tv" ${attrs} aria-labelledby="${hid}">
    <div class="card-h"><h2 class="fq-t-heading" id="${hid}">${v.next ? '다음 운동 미리보기' : '오늘 보고 가면 좋은 영상'}</h2><span class="chip">${v.next ? DOW[dow(v.day)] + '요일 · ' : ''}${PART_NAME[v.part]}</span></div>
    <a class="tv-hero" href="${esc(h.u)}" target="_blank" rel="noopener" data-part="${v.part}" aria-label="${esc(h.title)}, ${h.t}부터 재생">${vThumb(h)}<span class="vt">${ico('play', 'fill ico--14')}${h.t}부터</span></a>
    <p class="tv-t"><b>${esc(h.title)}</b><span class="fq-t-caption">${esc(h.who || '')}${h.chips ? ` · 오늘 할 운동 장면 ${h.chips.length}개` : ''}</span></p>
    ${h.chips && h.chips.length > 1 ? `<div class="chips tv-chips">${h.chips.map(c => `<a class="fq-chip" href="${esc(c.u)}" target="_blank" rel="noopener" data-part="${v.part}">${esc(EX[c.id].n.replace(/ \(.*\)$/, ''))} <span class="num">${c.t}</span></a>`).join('')}</div>` : ''}
    ${rest.map(x => `<a class="vrow" href="${esc(x.u)}" target="_blank" rel="noopener" data-part="${v.part}">${vThumb(x, 'vthumb vthumb--sm')}<span class="vrow-t"><b>${esc(x.title)}</b><span class="fq-t-caption">${esc(x.who || '')} · ${x.ref ? '저장한 영상' : `<span class="num">${x.t}</span>부터`}</span></span></a>`).join('')}
  </section>`;
}
function lunchCard(attrs = '') {
  if (!lunchOut() || slotAt() !== lunchIdx() || slotSum(lunchIdx())) return '';
  return `<section class="tile lunch sel" ${attrs} aria-label="점심 일반식">
    <div class="l-head"><span class="ph-ic">${ico('utensils')}</span><p>점심은 일반식이죠? 드신 메뉴를 눌러 주세요.<small>점심 목표 ${LUNCH_P}g · ${riceTip()}</small></p></div>
    <div class="menu">${LUNCH.slice(0, 4).map((x, i) => `<button class="m" data-act="lunch" data-n="${esc(x.n)}"><span class="n">${i === 0 ? `<svg class="ico ico--14 star" viewBox="0 0 24 24" role="img" aria-label="단백질 최고">${I.star}</svg>` : ''}${esc(x.n)}</span><span class="p num">${x.p}g<small>${x.k}kcal</small></span></button>`).join('')}</div>
    <button class="more" data-act="lunchAll">${ico('search', 'ico--16')}백반, 국밥, 구내식당 등 다른 메뉴</button></section>`;
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
    <div class="list">${LUNCH.map(x => `<div><button class="linkbtn ink" data-act="lunch" data-n="${esc(x.n)}">${esc(x.n)}</button><span class="fq-t-caption">단백질 ${x.p}g · ${x.k}kcal</span></div>`).join('')}</div>`);
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

/* 챕터 0 — 정직한 2주 (4-9) · 계산 대기 음식이 있는 날은 칼로리가 모자라니 빼고 셈 */
const fullDay = d => { const fs = dayFoods(d); return fs.length >= 2 && !fs.some(f => f.est === 'w'); };
function ch0Status() {
  const P = DB.profile, start = P.chapterStart, today = dayKey(), n = Math.min(14, daysBetween(start, today) + 1);
  const days = Array.from({ length: n }, (_, i) => addDays(start, i));
  const wDays = days.filter(d => DB.weights[d]).length, fDays = days.filter(fullDay).length;
  let tdee = null;
  if (daysBetween(start, today) >= 14 && wDays >= 8 && fDays >= 10) {
    const pts = days.filter(d => DB.weights[d]).map(d => [daysBetween(start, d), DB.weights[d]]);
    const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const slope = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / Math.max(1e-9, pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0));
    const fd = days.filter(fullDay), intake = fd.reduce((a, d) => a + daySum(d).k, 0) / fd.length;
    tdee = Math.round(intake - slope * 7700);
  }
  return { n, wDays, fDays, tdee, ready: tdee != null };
}
function ch0Card(s) {
  const rec = recChapter(DB.profile.sex, ib().pbf);
  return `<section class="tile card-pad ${s.ready ? 'sel' : ''}" style="--o:5" aria-label="정직한 2주"><div class="q-row"><p class="lab">정직한 2주</p><span class="chip num">D+${s.n}/14</span></div>
    ${s.ready ? `<h2 class="fq-t-title">진실의 거울</h2><p class="fq-t-body">내 진짜 유지 칼로리는 <b class="num">${fmt(s.tdee)}</b>kcal예요. 이제 이 숫자로 가요.</p><button class="fq-btn fq-btn--lg fq-btn--block" data-act="ch0Done" data-t="${s.tdee}">챕터 ${rec} ${CH[rec].name} 시작 · +500 XP</button>`
      : `<p class="fq-t-body">평소처럼 먹고 <b>전부</b> 기록해요. 억지로 줄이지 않기. 14일 뒤 내 몸의 진짜 유지 칼로리가 나와요.</p>
      <div class="grid2 nums2"><div><span class="fq-t-caption">체중 기록</span><span class="fq-t-num-md">${s.wDays}<small>/8일+</small></span></div><div><span class="fq-t-caption">식단 기록</span><span class="fq-t-num-md">${s.fDays}<small>/10일+</small></span></div></div>`}
  </section>`;
}

/* ================= DIET ================= */
R.diet = () => {
  const T = targets(), S = daySum(), k = dayKey(), lunch = lunchCard('style="--o:3"'), nx = nextTarget(), { left } = nx;
  const mon = mondayOf(k), dayN = daysBetween(mon, k) + 1, wk = Array.from({ length: dayN }, (_, i) => addDays(mon, i)), hitDay = d => daySum(d).p >= targets(d).p * .9, hits = wk.filter(hitDay).length;
  const stat = (l, a, b, u) => `<div class="st"><span class="fq-eyebrow">${l}</span><b class="num">${fmt(a)}</b><span class="fq-unit">/ ${fmt(b)}${u}</span></div>`;
  $('#scr-diet').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">오늘 식단</h1><span class="fq-t-caption">${kDate(k).getMonth() + 1}월 ${kDate(k).getDate()}일 ${DOW[dow(k)]}요일 · ${T.train ? '운동일' : '휴식일'}</span></header>
    <div class="cols">
    ${quickCard(T, S)}
    <div class="col">
    <section class="tile card-pad sum" style="--o:2" aria-label="오늘 합계">
      <div class="stats3">${stat('칼로리', S.k, T.kcal, 'kcal')}${stat('탄수', S.c, T.c, 'g')}${stat('지방', S.f, T.f, 'g')}</div>
      ${left > 0 ? `<p class="next-l" data-v="next">${nextLab(nx)}<b class="num">${nx.nt}g</b></p>` : '<p class="next-l">오늘 단백질 목표를 채웠어요</p>'}
      ${dayN >= 2 ? `<div class="wk-hit"><span class="fq-t-label">이번 주 단백질 <b class="num" data-v="hit">${hits}/${dayN}</b>일</span><span class="wk-dots" role="img" aria-label="이번 주 단백질 목표 ${dayN}일 중 ${hits}일 달성">${wk.map(d => `<i${hitDay(d) ? ' data-on' : ''}${d === k ? ' data-today' : ''}></i>`).join('')}</span></div>` : ''}
    </section>
    ${planCard('style="--o:3"')}
    <section class="tile card-pad wte-in" style="--o:4" aria-labelledby="wteH"><div class="card-h"><h2 class="fq-t-heading" id="wteH">뭐 먹지?</h2><span class="fq-t-caption">남은 ${left}g에 맞춰서</span></div>
      ${left > 0 ? wtePicks().map(x => `<div class="wte-row"><span class="wte-n"><b>${esc(x.n)}</b><small>${x.cat}</small></span><i class="lead"></i><span class="fi-v num">${x.p}g<small>${x.k}kcal</small></span><button class="addb" data-act="${x.cat === '회사 점심' ? 'lunch' : 'logWte'}" data-n="${esc(x.n)}" aria-label="${esc(x.n)} 기록">${ico('plus', 'ico--20')}</button></div>`).join('')
        + `<button class="linkbtn ink" data-act="wte">${ico('utensils', 'ico--16')}편의점, 배달, 집밥 더 보기</button>` : `<p class="fq-t-label">오늘 단백질은 다 채웠어요<small class="fq-t-caption"> 더 먹는다면 채소나 과일로</small></p>`}
    </section>
    </div><div class="col">
    ${lunch}
    ${mealsCard('style="--o:3"')}
    <label class="tile check-row" style="--o:5"><input type="checkbox" id="allLogged" data-act="allLogged" ${DB.flags['all_' + k] ? 'checked' : ''}><span><b>오늘 먹은 거 다 적었어요</b> <span class="gold-t">+20 XP</span></span></label>
    </div></div>`;
};
/* 끼니별 기록 (식단 · 기록 탭): 빈 끼니는 "+" 하나 → 사진·글로·단골 시트 (그 끼니로) */
function mealsCard(attrs = '') {
  const names = mealNames(), tgs = mealTargets();
  return `<section class="tile card-pad meals" ${attrs} aria-label="끼니별 기록">
    ${names.map((n, i) => { const items = dayFoods().filter(f => f.slot === i), got = items.reduce((a, f) => a + f.p, 0);
      return `<div class="meal" aria-label="${n}"><div class="meal-h"><h3 class="fq-t-heading">${n}</h3><i class="lead"></i><span class="fq-t-label num"><b>${Math.round(got)}</b> / ${tgs[i]}g</span>
        <button class="addb" data-act="mealAdd" data-slot="${i}" aria-label="${n} 기록">${ico('plus', 'ico--20')}</button></div>
        ${items.map(f => `<div class="fi">${f.est ? `<button class="fi-n fi-e" data-act="foodEdit" data-id="${f.id}" aria-label="${esc(f.n)} ${estTag(f)}, 숫자 고치기"><span>${esc(f.n)}</span><span class="chip ${f.est === 'w' ? 'rd' : 'cy'}">${estTag(f)}</span></button>` : `<span class="fi-n">${esc(f.n)}</span>`}<i class="lead"></i>${f.est === 'w' ? '' : `<span class="fi-v num">${f.p}g<small>${f.k}kcal</small></span>`}<button class="xbtn" data-act="delFood" data-id="${f.id}" aria-label="${esc(f.n)} 삭제">${ico('x', 'ico--16')}</button></div>`).join('')}</div>`; }).join('')}
  </section>`;
}
/* 식단 맨 위 "기록하기": 단백질 숫자 + 끼니 막대 + 사진(주 버튼)·글로·단골 (+ 점심 메뉴) */
const QUICK = [['snap', 'camera', '사진'], ['textIn', 'text', '글로'], ['favs', 'star', '단골'], ['lunchAll', 'utensils', '점심 메뉴']];
const quickActs = slot => QUICK.filter(q => q[0] !== 'lunchAll' || (lunchOut() && (slot == null ? slotAt() === lunchIdx() || !slotSum(lunchIdx()) : slot === lunchIdx())));
function quickCard(T, S) {
  const qs = quickActs();
  return `<section class="tile card-pad quick hero" aria-labelledby="qH">
    <div class="q-top"><h2 class="fq-sr" id="qH">기록하기</h2><p class="q-p"><span class="fq-eyebrow">단백질</span><b class="num" data-count="p">${Math.round(S.p)}</b><span class="of num">/ ${T.p}g</span></p>${slotChip()}</div>
    <p class="min-l${S.p >= minP() ? ' ok' : ''}">${S.p >= minP() ? `${ico('check', 'ico--12')}최소 ${minP()}g 채움 · 목표까지 ${Math.max(0, T.p - Math.round(S.p))}g` : `최소 <b class="num">${minP()}g</b>까지 ${minP() - Math.round(S.p)}g 남음`}<small>(몸무게 1kg당 최소 1.6g · 목표 ${(T.p / curWeight()).toFixed(1)}g)</small></p>
    ${mealMeter(T)}
    ${DB.foods.length < 5 ? `<p class="fq-t-caption">사진, 글, 단골 중 편한 걸로 기록해요</p>` : ''}
    <div class="qbar" style="grid-template-columns:repeat(${qs.length},minmax(0,1fr))">${qs.map(([act, ic, l], i) => `<button class="qb${i ? '' : ' qb--main'}" data-act="${act}">${ico(ic, '')}<span>${l}</span></button>`).join('')}</div></section>`;
}
function mealAddSheet(slot) {
  SLOT_PICK = slot; const qs = quickActs(slot);
  sheet(`<div class="row row--between"><h2 class="fq-t-title">${mealNames()[slot]} 기록</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <div class="qbar" style="grid-template-columns:repeat(${qs.length},minmax(0,1fr))">${qs.map(([act, ic, l], i) => `<button class="qb${i ? '' : ' qb--main'}" data-act="${act}" data-slot="${slot}">${ico(ic, '')}<span>${l}</span></button>`).join('')}</div>`);
}
function favList() {
  const cutoff = addDays(dayKey(), -30), cnt = {};
  DB.foods.filter(f => f.est !== 'w' && daysBetween(cutoff, f.day) >= 0).forEach(f => { const c = cnt[f.n] = cnt[f.n] || { ...f, count: 0 }; c.count++; });
  const mine = Object.values(cnt).filter(c => c.count >= 3).sort((a, b) => b.count - a.count).map(c => ({ n: c.n, p: c.p, k: c.k, c: c.c, f: c.f, mine: 1 }));
  return mine.concat(BASE_FAVS.filter(b => !mine.some(m => m.n === b.n))).slice(0, 10);
}
const favRow = (n = 6) => `<div class="menu">${favList().slice(0, n).map((f, i) => `<button class="m" data-act="fav" data-i="${i}"><span class="n">${f.mine ? `${ico('star', 'ico--14 star')}` : ''}${esc(f.n)}</span><span class="p num">${f.p}g<small>${f.k}kcal</small></span></button>`).join('')}</div>`;
let countFrom = null;   // 기록 직후 단백질 숫자가 올라가는 애니메이션 시작값
function addFood(x, bonusKind, slot = curSlot()) {
  SLOT_PICK = null;
  const k = dayKey(), T = targets(), before = daySum().p, slotBefore = slotSum(slot), tg = mealTargets(T)[slot] || 0, nt0 = nextTarget().nt;
  const id = uid(); DB.foods.push({ id, day: k, t: Date.now(), slot, n: x.n, p: Math.round(x.p), k: Math.round(x.k), c: Math.round(x.c || 0), f: Math.round(x.f || 0), ...(x.est ? { est: x.est, g: Math.round(x.g || 0) } : {}) });
  let xp = addXP('meal', 10);
  if (slotBefore < tg - 10 && slotBefore + x.p >= tg - 10) xp += addXP('mealhit', 10);
  const cleared = before < T.p * .9 && before + x.p >= T.p * .9;
  if (cleared) xp += addXP('protein', 50);
  if (bonusKind) xp += addXP(bonusKind, 20);
  checkDaily3(); save();
  SFX.food(); buzz(12);
  countFrom = { p: Math.round(before), nt: nt0 };
  if (TAB === 'cam' || TAB === 'home') go('home'); else R[TAB] && R[TAB]();
  countUp(); countFrom = null;
  const n2 = nextTarget();
  const nm = esc(String(x.n).length > 14 ? String(x.n).slice(0, 13) + '…' : x.n), XP = xp ? ` <em>+${xp} XP</em>` : '';
  toast(x.est === 'w' ? `<span class="t2">${nm} 기록 · 계산 대기${XP}</span><span class="sub">${DB.settings.gkey ? '온라인이 되면 채워요' : '숫자는 나중에'}</span>`
    : x.est ? `<span class="t2">${nm} 단백질 ${Math.round(x.p)}g · ${fmt(x.k)}kcal ${x.est === 'ai' ? 'AI 추정' : '추정'}${cleared ? ' 단백질 클리어' : ''}${XP}</span><button data-act="foodEdit" data-id="${id}">수정</button>`
    : `<span>${nm} +${Math.round(x.p)}g${cleared ? ' 단백질 클리어' : ''}${XP}</span><span class="sub" data-v="next">${nextShort(n2)}</span>`, x.est ? 5000 : 3500);
  showLevelUp();
}
/* 숫자 올라가기 (300ms) — 줄인 동작 설정이면 바로 최종값 */
function countUp() {
  if (!countFrom || RM()) return;
  document.querySelectorAll(`#scr-${TAB} [data-count]`).forEach(el => {
    const to = +el.textContent, from = countFrom[el.dataset.count]; if (from == null || from === to || isNaN(to)) return;
    const t0 = performance.now(), step = t => { const q = Math.min(1, (t - t0) / 300); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - q, 3))); if (q < 1) requestAnimationFrame(step); };
    el.textContent = from; requestAnimationFrame(step);
  });
}

/* ================= CAMERA / FOOD INPUT ================= */
/* FR = 사진 한 장의 기록 상태 { photo, mode: 'wait'|'ai'|'portion', items, asked, pick, msg } — 결과가 있으면 기록 탭 맨 위에 */
let FR = null;
let SLOT_PICK = null; // 식단·카메라에서 직접 고른 끼니 (기록하거나 두 탭을 떠나면 다시 자동)
const curSlot = () => SLOT_PICK ?? slotAt();
const slotChip = () => { const names = mealNames(), n = names[Math.min(curSlot(), names.length - 1)]; return `<button class="fq-chip slot-chip" data-act="slotPick" aria-label="기록할 끼니 ${n}, 바꾸기">${n}${SLOT_PICK == null ? ' 자동' : ' · 직접 고름'}${ico('chev', 'ico--16')}</button>`; };
/* 키 없이 사진 기록: 단백질 양만 고름 (손바닥 크기 기준, 칼로리는 대략) */
const PORTIONS = [[15, '조금', 250], [30, '손바닥 1개', 450], [45, '손바닥 1.5개', 650], [60, '손바닥 2개', 850]];
const portionFor = nt => PORTIONS.reduce((b, p) => Math.abs(p[0] - nt) < Math.abs(b[0] - nt) ? p : b)[0];
R.cam = () => {
  const has = !!DB.settings.gkey;
  $('#scr-cam').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">음식 기록</h1>${slotChip()}</header>
    <div class="cols">
    ${FR ? frCard() : `<section class="tile shutter-area hero" aria-label="사진으로 기록">
      <label class="shutter" aria-label="카메라로 음식 찍기">${ico('camera', 'ico--32')}<input type="file" id="foodPhoto" accept="image/*" capture="environment"></label>
      <p class="sh-t"><b>사진 1장이면 끝나요</b><small>${has ? 'AI가 음식과 단백질을 읽어요' : '찍고 나서 양만 고르면 기록돼요'}</small></p>
      <div class="cam-alt"><label class="fq-btn fq-btn--secondary file-btn">${ico('image')}사진첩에서<input type="file" id="foodGallery" accept="image/*"></label><button class="fq-btn fq-btn--secondary" data-act="textIn">${ico('text')}글로 입력</button></div>
    </section>`}
    <div class="col"><section class="tile card-pad" style="--o:2" aria-labelledby="favH"><div class="card-h"><h2 class="fq-t-heading" id="favH">단골 1탭 기록</h2><span class="fq-t-caption">3번 먹으면 자동 등록</span></div>
    ${favRow(8)}</section></div>
    <div class="col">${mealsCard('style="--o:3"')}</div>
    </div>`;
  ['#foodPhoto', '#foodGallery', '#foodPhoto2'].forEach(id => { const el = $(id); if (el) el.addEventListener('change', onPhoto); });   // 카메라 바로 열기 · 사진첩 — 같은 흐름
};
function frCard() {
  const T = targets(), S = daySum(), slot = curSlot(), names = mealNames(), sn = names[Math.min(slot, names.length - 1)];
  const photo = `<div class="photo"><img src="${FR.photo}" alt="올린 음식 사진"></div>`, again = `<label class="linkbtn ink file-btn">${ico('camera', 'ico--16')}다시 찍기<input type="file" id="foodPhoto2" accept="image/*" capture="environment"></label>`;
  if (FR.mode === 'wait') return `<section class="tile card-pad fr hero" aria-label="사진 읽는 중">${photo}<div class="fr-p"><p class="fq-t-heading">AI가 사진을 읽는 중…</p><p class="fq-t-caption">보통 5초 안에 끝나요</p></div></section>`;
  if (FR.mode === 'portion') {
    const p = PORTIONS.find(x => x[0] === FR.pick) || PORTIONS[1];
    return `<section class="tile card-pad fr hero" aria-label="사진 기록">${photo}<div class="fr-p">
      <div class="card-h"><h2 class="fq-t-heading">단백질 얼마나?</h2><span class="fq-t-caption">${FR.msg ? esc(FR.msg) : `${sn}에 기록돼요`}</span></div>
      <div class="por" role="group" aria-label="단백질 양">${PORTIONS.map(([g, l]) => `<button class="m" data-act="portion" data-g="${g}" aria-pressed="${g === p[0]}"><span class="p num">${g}g</span><span class="n">${l}</span></button>`).join('')}</div>
      <input id="frName" class="inp" placeholder="무엇이었나요 (선택)" value="${esc(FR.name || '')}" aria-label="음식 이름 (선택)">
      <button class="fq-btn fq-btn--lg fq-btn--block" data-act="savePortion">${sn}에 ${p[0]}g 기록</button>
      <p class="fr-foot"><span class="fq-t-caption">단백질 ${Math.round(S.p)} → ${Math.round(S.p + p[0])} / ${T.p}g</span>${again}</p></div></section>`;
  }
  const items = FR.items, P = items.reduce((s, x) => s + x.p * x.q, 0), K = items.reduce((s, x) => s + x.k * x.q, 0), low = items.findIndex(x => x.conf <= 1), slotGot = slotSum(slot), tg = mealTargets(T)[slot] || 0;
  return `<section class="tile card-pad fr hero" aria-label="AI 추정 결과">${photo}<div class="fr-p">
    <div class="card-h"><h2 class="fq-t-heading">AI 추정 ${items.length}개</h2><span class="fq-t-caption">틀리면 양만 고쳐요</span></div>
    ${!FR.asked && low >= 0 ? `<div class="preview ask"><b>${esc(items[low].n)} 양이 맞나요?</b><div class="qty">${[['적게', .5], ['사진대로', 1], ['더 많이', 1.5]].map(o => `<button class="fq-chip" data-act="ask" data-i="${low}" data-q="${o[1]}">${o[0]}</button>`).join('')}</div></div>` : ''}
    <div>${items.map((x, i) => `<div class="fitem"><div class="fitem-top"><span><b>${esc(x.n)}</b><br><span class="conf">${[1, 2, 3].map(n => `<i ${n <= x.conf ? 'data-on' : ''}></i>`).join('')} 신뢰도 ${['', '낮음', '보통', '높음'][x.conf] || '보통'} ${Math.round(x.g * x.q)}g</span></span><span class="p num">${Math.round(x.p * x.q)}<small>g</small></span><span class="k">${x.conf < 3 ? `${Math.round(x.k * x.q * .9)}–${Math.round(x.k * x.q * 1.1)}` : Math.round(x.k * x.q)}<small>kcal</small></span></div>
      <div class="qty" role="group" aria-label="${esc(x.n)} 양">${[['0', 0], ['½', .5], ['⅔', .67], ['1', 1], ['1.5', 1.5], ['2', 2]].map(q => `<button class="fq-chip" aria-pressed="${x.q === q[1]}" data-act="qty" data-i="${i}" data-q="${q[1]}">${q[0]}</button>`).join('')}</div></div>`).join('')}</div>
    <div class="preview"><span>단백질 <b>+${Math.round(P)}g</b> → ${Math.round(S.p + P)} / ${T.p}g</span><span class="fq-t-caption">${sn} ${Math.round(slotGot + P)} / ${tg}g${slotGot + P >= tg - 10 ? ' 끼니 달성 +10 XP' : ''}</span><span class="fq-t-caption">칼로리 ${fmt(S.k)} → ${fmt(S.k + K)} / ${fmt(T.kcal)}</span></div>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="saveFood">기록하기</button>
    <p class="fr-foot"><span class="fq-t-caption">AI 추정치예요</span>${again}</p></div></section>`;
}
async function onPhoto(e) {
  const file = e.target.files && e.target.files[0]; if (!file) return;
  const url = URL.createObjectURL(file), pick = portionFor(nextTarget().nt || 30);
  if (!DB.settings.gkey) { FR = { photo: url, mode: 'portion', pick }; R.cam(); window.scrollTo(0, 0); return; }
  FR = { photo: url, mode: 'wait', pick }; R.cam(); window.scrollTo(0, 0);
  try {
    const items = await geminiFood(file);
    if (!items.length) throw new Error('음식을 찾지 못했어요');
    FR = { photo: url, mode: 'ai', items: items.map(x => ({ ...x, q: 1 })), asked: false, pick };
  } catch (err) { FR = { photo: url, mode: 'portion', pick, msg: `AI가 못 읽었어요 (${String(err.message).slice(0, 40)}). 양만 골라 주세요` }; }
  if (TAB === 'cam') R.cam();
}
const drawResult = () => R.cam();

function downscale(file, max = 1024) {
  return new Promise((res, rej) => {
    const img = new Image(); img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', .82).split(',')[1]);
    }; img.onerror = () => rej(new Error('사진을 열 수 없어요')); img.src = URL.createObjectURL(file);
  });
}
/* 0928 제미나이 모델: 기본 gemini-3.8-flash (0927 까지 3.5) → 안 되면 내 키로 쓸 수 있는 더 낮은 flash 로 차례로 (모델 목록을 물어봐 7일 기억, 되는 모델은 다음에 먼저) */
const GEM_PREF = 'gemini-3.8-flash';
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
  return [...new Set([DB.settings.gmodel, GEM_PREF, ok, ...found, 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'].filter(Boolean))];
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
  return gemItems(await gemCall(key, [{ inline_data: { mime_type: 'image/jpeg', data: b64 } }, { text: prompt }], '키를 확인해 주세요'));
}
function gemItems(data) {   // 사진·글 공통: 최대 8개, 값 범위 제한
  const num = (v, a, b) => Math.min(b, Math.max(a, +v || 0));
  return (data.items || []).slice(0, 8).map(x => ({ n: String(x.n || '음식').slice(0, 30), g: num(x.g, 0, 2000), k: num(x.k, 0, 3000), p: num(x.p, 0, 250), c: num(x.c, 0, 400), f: num(x.f, 0, 200), conf: Math.round(num(x.conf, 1, 3)) || 2 }));
}

/* ================= 글로 기록: 이름만 → 단백질·칼로리 =================
   1) 앱 안 음식표(FOOD_DB)로 바로 (오프라인) 2) 키가 있으면 제미나이 3) 둘 다 안 되면 "계산 대기"로 저장 → 다음에 온라인+키면 채움 */
const Q_UNIT = '개|팩|공기|그릇|컵|스쿱|인분|병|줄|잔|모|조각|토막|마리|봉지|장|알|큰술|판|캔|볼';
const Q_RE = new RegExp(`(\\d+(?:\\.\\d+)?\\s*/\\s*\\d+|\\d+(?:\\.\\d+)?)\\s*(g|그램|ml|㎖|${Q_UNIT})?|(한|두|세|석|네|넉|다섯)\\s*(?:${Q_UNIT})|반\\s*(?:${Q_UNIT})|(?<=^|\\s)반(?=\\s|$)`, 'gi');
const K_NUM = { 한: 1, 두: 2, 세: 3, 석: 3, 네: 4, 넉: 4, 다섯: 5 };
const fNorm = s => s.toLowerCase().replace(/정도|쯤|[\s·.,()~\-]/g, '');
let FOOD_IDX = null;
function foodFind(nm) {   // 이름이 같으면 그것, 아니면 글 안에 든 가장 긴 이름 (글의 60% 이상일 때만)
  FOOD_IDX = FOOD_IDX || FOOD_DB.flatMap(x => x.names.map(n => [fNorm(n), x]));
  let best = null, bl = 0;
  for (const [k, x] of FOOD_IDX) { if (k === nm) return x; if (k.length > bl && k.length >= nm.length * .6 && nm.includes(k)) { best = x; bl = k.length; } }
  return best;
}
function foodParse(t) {   // "현미밥 반 공기" → { x: 현미밥, q: .5 }
  const m = [...t.matchAll(Q_RE)][0], x = foodFind(fNorm(t.replace(Q_RE, ' ')));
  if (!x) return null;
  let q = 1;
  if (m && m[1]) { const [a, b] = m[1].split('/').map(Number), v = b ? a / b : a; q = /^(g|그램|ml|㎖)$/i.test(m[2] || '') ? (x.g ? v / x.g : 1) : v; }
  else if (m && m[3]) q = K_NUM[m[3]]; else if (m) q = .5;
  return { x, q: q > 0 && q < 50 ? q : 1 };
}
const foodSplit = t => t.split(/\s*(?:[,，、+&\n]|\band\b|그리고|및)\s*/i).filter(Boolean);
function localFood(t) {   // 모든 항목이 표에 있을 때만 합계, 하나라도 없으면 null
  const its = foodSplit(t).map(foodParse); if (!its.length || its.some(i => !i)) return null;
  const s = kk => its.reduce((a, { x, q }) => a + x[kk] * q, 0);
  return { g: s('g'), k: s('k'), p: s('p'), c: s('c'), f: s('f') };
}
async function aiText(t) {
  const prompt = `한 사람이 먹은 음식을 글로 적었어: "${t.slice(0, 200).replace(/"/g, "'")}". 쉼표·and 로 나뉜 항목마다 한국 음식 기준으로 추정해 줘. 양이 적혀 있으면 그 양, 없으면 한국에서 흔한 1인분. 부풀리지 말고 현실적인 값. JSON만 출력: {"items":[{"n":"음식 이름(한국어)","g":그램,"k":kcal,"p":단백질g,"c":탄수화물g,"f":지방g,"conf":1~3}]} conf 3=확실 2=보통 1=불확실. 음식이 아니면 {"items":[]}.`;
  const its = gemItems(await gemCall(DB.settings.gkey.trim(), [{ text: prompt }], '키를 확인해 주세요'));
  if (!its.length) throw new Error('음식을 찾지 못했어요');
  const s = kk => its.reduce((a, x) => a + x[kk], 0);
  return { g: s('g'), k: s('k'), p: s('p'), c: s('c'), f: s('f') };
}
const estTag = f => f.est === 'w' ? (DB.settings.gkey ? '계산 대기' : '숫자 넣기') : f.est === 'ai' ? 'AI 추정' : '추정';
async function textSave(btn) {
  const t = ($('#tiName').value || '').trim().slice(0, 60), mp = $('#tiP').value.trim(), mk = $('#tiK').value.trim(), slot = curSlot();
  if (mp || mk) { const p = Math.max(0, +mp || 0); closeSheet(); return addFood({ n: t || '직접 입력', p, k: +mk || Math.round(p * 4 + 150) }, null, slot); }
  if (!t) { $('#tiName').focus(); return toast('<span>무엇을 먹었는지 적어 주세요.</span>'); }
  const loc = localFood(t);
  if (loc) { closeSheet(); return addFood({ ...loc, n: t, est: 'l' }, null, slot); }
  let why = '';
  if (DB.settings.gkey && navigator.onLine) {
    btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.innerHTML = `${ico('refresh', 'ico--20 spin')}AI가 계산하는 중`;
    try { const r = await aiText(t); closeSheet(); return addFood({ ...r, n: t, est: 'ai' }, null, slot); } catch (e) { why = String(e.message || e); }
  }
  closeSheet(); addFood({ n: t, p: 0, k: 0, est: 'w' }, null, slot);
  if (why) setTimeout(() => toast(`<span class="t2">AI가 못 읽었어요 (${esc(why.slice(0, 30))}). 계산 대기로 저장했어요</span>`, 4500), 1200);
}
/* 숫자 바꾸기 (추정 고치기 · 계산 대기 채우기): 오늘이면 단백질 클리어 XP·오늘 3칸도 다시 봄 */
function setFood(it, v) {
  const today = it.day === dayKey(), T = targets(), b = daySum().p - (today ? it.p : 0);
  Object.assign(it, v);
  if (today && b < T.p * .9 && b + it.p >= T.p * .9) addXP('protein', 50);
  if (today) checkDaily3(); save();
}
let fillBusy = false;
async function fillPending() {   // 계산 대기 → 표 또는 제미나이로 채움 (앱 열 때 · 온라인 될 때 · 키 저장할 때)
  if (fillBusy || !DB.settings.gkey || !navigator.onLine || !DB.foods.some(f => f.est === 'w')) return;
  fillBusy = true;
  try {
    for (const it of DB.foods.filter(f => f.est === 'w')) {
      let r = localFood(it.n), est = 'l';
      if (!r) { r = await aiText(it.n); est = 'ai'; }
      if (!DB.foods.includes(it) || it.est !== 'w') continue;   // 그사이 지웠거나 직접 넣음
      setFood(it, { p: Math.round(r.p), k: Math.round(r.k), c: Math.round(r.c), f: Math.round(r.f), g: Math.round(r.g), est });
      if (TAB !== 'logger' && R[TAB]) R[TAB]();
      toast(`<span class="t2">${esc(it.n.slice(0, 14))} 단백질 ${it.p}g · ${fmt(it.k)}kcal 채웠어요</span><button data-act="foodEdit" data-id="${it.id}">수정</button>`, 4500);
    }
  } catch (e) {} finally { fillBusy = false; }
}
addEventListener('online', () => fillPending());
function foodEditSheet(id) {
  const f = DB.foods.find(x => x.id === id); if (!f) return;
  const w = f.est === 'w', F = [['feG', '양 g', f.g || ''], ['feP', '단백질 g', w ? '' : f.p], ['feK', '칼로리', w ? '' : f.k]];
  sheet(`<div class="row row--between"><h2 class="fq-t-title">${w ? '숫자 넣기' : '숫자 고치기'}</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-caption" style="margin:-6px 0 0"><b class="ink">${esc(f.n)}</b> · ${w ? (DB.settings.gkey ? '온라인이 되면 AI가 채워요. 알면 지금 넣어도 돼요.' : '아는 숫자만 넣어요. 설정에서 제미나이 키를 넣으면 자동으로 채워요.') : `${f.est === 'ai' ? 'AI' : '앱 음식표'} 추정값이에요. 양을 바꾸면 단백질·칼로리도 같이 바뀌어요.`}</p>
    <div class="grid3">${F.map(([i, l, v]) => `<label class="stack" for="${i}" style="gap:6px"><span class="fq-t-label">${l}</span><input id="${i}" class="inp" inputmode="numeric" value="${v}"></label>`).join('')}</div>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="foodSave" data-id="${id}">저장</button>`);
  if (f.g) $('#feG').addEventListener('input', e => { const r = (+e.target.value || 0) / f.g; $('#feP').value = Math.round(f.p * r); $('#feK').value = Math.round(f.k * r); });
  if (w) $('#feP').focus();
}
function foodSave(id) {
  const f = DB.foods.find(x => x.id === id); if (!f) return closeSheet();
  const g = +$('#feG').value || 0, ps = $('#feP').value.trim(), ks = $('#feK').value.trim();
  if (!ps && !ks) return toast('<span>단백질이나 칼로리 중 하나는 적어 주세요.</span>');
  const p = Math.max(0, +ps || 0), k = Math.max(0, +ks || Math.round(p * 4 + 150)), r = f.k ? k / f.k : 0;
  setFood(f, { g, p, k, c: Math.round(f.c * r), f: Math.round(f.f * r), est: f.est === 'w' ? 'm' : f.est });
  closeSheet(); R[TAB] && R[TAB](); toast(`<span>${esc(f.n.slice(0, 14))} 단백질 ${p}g · ${fmt(k)}kcal 로 고쳤어요</span>`);
}

/* ================= WORKOUT TAB ================= */
R.work = () => {
  const k = dayKey(), tpl = tplFor(k), mon = mondayOf(k), done = !!DB.done[k], by = sessByDay(), wd = weekDone(), pl = Math.max(trainDaysPerWeek(), wd);
  let nx = null; if (!tpl) for (let i = 1; i <= 7 && !nx; i++) { const d = addDays(k, i); if (tplFor(d)) nx = d; }
  const show = tpl || (nx && tplFor(nx)), T = show && TPL[show], cr = creatorOf(T), nSets = T ? T.ex.reduce((a, e) => a + e[1], 0) : 0;
  const week = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = addDays(mon, i), t = tplFor(d), s = by[d] && by[d][0], p = s && PART_NAME[partOf(s.tpl, s.ex)];
    return { d, lab: DB.done[d] && p ? p : t ? TPL[t].code : '', aria: DB.done[d] && p ? `${p} 완료` : t ? TPL[t].code : '휴식', st: DB.done[d] ? 'done' : d === k ? 'today' : t ? '' : 'rest' }; });
  const ek = tpl ? !done && k : nx, nLib = ROUTINES.length + Object.keys((DB.custom && DB.custom.tpls) || {}).length;
  const foot = `<div class="ex-foot">${ek ? `<button class="linkbtn ink" data-act="dayEdit" data-k="${ek}" aria-haspopup="dialog">${ico('swap', 'ico--16')}<span>바꾸기 <b>다른 부위·루틴</b></span></button>` : ''}<button class="linkbtn ink" data-act="lib">${ico('search', 'ico--16')}루틴 도감 <span class="num">${nLib}</span></button></div>`;
  $('#scr-work').innerHTML = `
    <header class="topbar work-top"><h1 class="fq-t-title">운동</h1>
      <ol class="week" aria-label="이번 주 루틴, ${wd}/${pl}회 완료">${week.map(w => { const inner = `<span class="pill"><small>${DOW[dow(w.d)]}</small>${w.lab ? `<b>${esc(w.lab.split('·')[0])}</b>` : ico('moon', 'ico--14')}</span>`, lab = `${DOW[dow(w.d)]}요일, ${w.aria}`;
        return w.d >= k && !DB.done[w.d] ? `<li><button class="day" data-act="dayEdit" data-k="${w.d}" data-s="${w.st}" aria-haspopup="dialog" aria-label="${lab}">${inner}</button></li>` : `<li class="day" data-s="${w.st}" aria-label="${lab}">${inner}</li>`; }).join('')}</ol>
      <button class="linkbtn" data-act="schedule">${ico('repeat', 'ico--16')}${DB.rot && DB.rot.on ? `로테이션 ${rotWeek(k) + 1}주차 · 요일 바꾸기` : '요일 바꾸기'}</button></header>
    <div class="cols cols--flow"><div class="col">
    ${tpl ? `<section class="tile card-pad today" aria-label="오늘 운동">
      <p class="lab">오늘 ${esc(T.code)}</p>
      <h2 class="fq-t-title">${esc(T.by ? T.ko.replace(T.by + ' · ', '') : T.ko)}</h2>
      <p class="by">${avatar(cr)}${T.by ? esc(T.by) + ' 루틴' : '기본 V자 루틴'} · ${nSets}세트 약 ${DB.profile.sessionMin}분</p>
      ${done ? `<p class="chip rd">${ico('check', '')}오늘 완료</p>` : `<button class="fq-btn fq-btn--lg fq-btn--block sel" data-act="startQuest">${ico('play', 'fill')}운동 시작</button>`}
      <div class="today-links">${!done && !DB.flags['pp_' + mon] ? '<button class="linkbtn" data-act="postpone">다음 운동일로 미루기 (주 1회)</button>' : ''}${T.by ? `<a class="src" href="${esc(T.video)}" target="_blank" rel="noopener">${ico('ext', 'ico--16')}<span>${esc(T.by)} 원본 영상</span></a>` : ''}</div></section>`
    : `<section class="tile card-pad hero--row" aria-label="휴식일"><div class="l-head">${coach('idle', 32)}<p>오늘은 휴식일이에요.<small>걷기 7천 보면 충분해요</small></p></div><button class="fq-btn fq-btn--secondary" data-act="pickTpl">그래도 운동할래요</button></section>`}
    ${T ? exList(show, tpl ? '' : `${DOW[dow(nx)]}요일 ${T.code} 미리보기`, foot) : ''}
    ${tvCard(k, 'data-c="r" style="--o:1"', 'tvWork')}
    ${fwCard(T ? partOf(show) : '', 'data-c="r" style="--o:1"')}
    </div></div>`;
};
/* 오늘(또는 다음) 루틴의 운동 목록 — 한 줄에 사진 · 이름 · 오늘 무게. 누르면 동작·팁. foot = 바꾸기 · 도감 한 줄 */
function exList(tk, title, foot = '') {
  const T = TPL[tk], rows = T.ex.map(([id0, n, o = {}]) => { const id = exSub(id0), sub = id !== id0; const E = EX[id], rg = o.r || E.range, pl = plannedFor(id, n, rg), st = prog(id), [bt, , up] = badgeFor(id); return { id, id0, sub, n, o, E, rg, pl, st, bt, up }; });
  const gap = Math.max(0, ...rows.map(r => r.pl.gap));
  return `<section class="tile card-pad exlist" aria-labelledby="exH"><div class="card-h"><h2 class="fq-t-heading" id="exH">${title ? esc(title) : `운동 ${T.ex.length}가지`}</h2><span class="fq-t-caption">누르면 동작과 팁</span></div>
    ${rows.some(r => !r.st.n) ? '<p class="fq-t-caption">첫 기록은 10회 할 수 있는 무게로 가볍게</p>' : ''}${gap > 10 ? `<p class="fq-t-caption">${gap}일 쉬어서 무게를 낮췄어요</p>` : ''}
    <ol class="exl">${rows.map(r => `<li><button class="exrow" data-act="howtoId" data-id="${r.id}" data-t="${esc(tk)}" aria-label="${esc(r.E.n)} 동작·팁 보기">
      <span class="exthumb">${r.E.img ? `<img src="media/${r.E.img}_0.jpg" alt="" loading="lazy">` : ico('cplay')}</span>
      <span class="exrow-t"><span class="exrow-n"><b>${esc(r.E.n)}</b>${r.sub ? `<span class="chip">${esc(EX[r.id0].n)} 대신</span>` : ''}${r.up ? `<span class="chip gd">${r.bt}</span>` : ''}</span><span class="exrow-l"><span class="exrow-w num">${wLabel(r.id, r.pl.w)}<small>kg</small></span><span class="fq-t-caption">${r.n}세트 ${r.rg[0]}–${r.rg[1]}회${r.o.d ? ' · 처음 무게' : ''}</span></span></span></button></li>`).join('')}</ol>${foot}</section>`;
}
/* 루틴 도감: 부위별 공략서(proSheet) · 내가 배운 루틴 · 롤모델 · 내 유튜버 추가 */
function libSheet() {
  const pc = (r, i) => `<button class="pro-card" data-act="pro" data-i="${i}"><span class="who"><span class="chip">${esc(r.creator)}</span><span class="fq-t-caption">${esc(r.meta || '')}</span></span><h4>${esc(r.title)}</h4><span class="fq-t-caption">${esc(r.sub || '')}</span></button>`;
  const mine = Object.entries((DB.custom && DB.custom.tpls) || {}).filter(([k]) => TPL[k]);
  sheet(`<div class="row row--between"><h2 class="fq-t-title">루틴 도감</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    ${Object.entries(PART_NAME).map(([p, n]) => { const rs = ROUTINES.map((r, i) => [r, i]).filter(([r]) => (r.parts || [])[0] === p); return rs.length ? `<h3 class="fq-t-heading">${n}</h3><div class="pro">${rs.map(([r, i]) => pc(r, i)).join('')}</div>` : ''; }).join('')}
    ${mine.length ? `<h3 class="fq-t-heading">내가 배운 루틴</h3><div class="pro">${mine.map(([k, t]) => `<button class="pro-card" data-act="fwView" data-t="${k}"><span class="who"><span class="chip">${esc(t.by)}</span><span class="fq-t-caption">${esc(t.code)}${t.off ? ' · 쉬는 중' : ''}</span></span><h4>${esc(t.ko.replace(t.by + ' · ', ''))}</h4></button>`).join('')}</div>` : ''}
    <h3 class="fq-t-heading">롤모델</h3><div class="role-row">${CREATORS.map(c => `<button class="rm" data-act="crCard" data-v="${c.id}">${avatar(c, 'av av--md')}<span><b>${esc(c.name)}</b><small>${esc(c.tag)}</small></span></button>`).join('')}</div>
    <button class="add" data-act="crAdd"><span class="pl">${ico('plus')}</span><span><b>내 유튜버 추가</b><span>영상 링크를 붙여 넣으면 루틴을 배워서 로테이션에 넣어요.</span></span></button>`);
}
/* ---------- 운동 달력: DB.sessions 를 날짜별로 모아 월 달력으로 (새 저장 형식 없음) ---------- */
let CAL = null; // 보고 있는 달 'YYYY-MM'
const MUS_PART = { lats: 'back', traps: 'back', chest: 'chest', 'chest-upper': 'chest', 'delt-side': 'shoulder', 'delt-front': 'shoulder', biceps: 'arms', forearm: 'arms', quads: 'legs', calves: 'legs' };
function partOf(tpl, ex = []) {   // 루틴의 첫 부위 · 루틴이 지워졌으면 세트가 가장 많은 부위
  const t = TPL[tpl]; if (t) return t.code === '전신' ? 'full' : (TPL_PARTS[tpl] || [])[0] || 'full';
  const c = {}; ex.forEach(e => { const p = EX[e.id] && MUS_PART[EX[e.id].mus[0]]; if (p) c[p] = (c[p] || 0) + e.sets.length; });
  return Object.keys(c).sort((a, b) => c[b] - c[a])[0] || 'full';
}
const ymAdd = (ym, n) => { const d = new Date(+ym.slice(0, 4), +ym.slice(5) - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const ymDays = ym => new Date(+ym.slice(0, 4), +ym.slice(5), 0).getDate();
function sessByDay() { const m = {}; DB.sessions.forEach(s => (m[s.day] = m[s.day] || []).push(s)); return m; }
const setsOf = s => s.ex.reduce((a, e) => a + e.sets.length, 0);
function calStats(ym, by) {
  const days = Object.keys(by).filter(k => k.startsWith(ym + '-')).sort(), ss = days.flatMap(k => by[k]), cnt = {};
  ss.forEach(s => { const p = partOf(s.tpl, s.ex); cnt[p] = (cnt[p] || 0) + 1; });
  const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];   // 연속 기록은 홈의 한 가지 정의(쉬는 날 포함)만 씀 (B3)
  return { days: days.length, sets: ss.reduce((a, s) => a + setsOf(s), 0), top, topN: top ? cnt[top] : 0, prs: ss.reduce((a, s) => a + (s.prs || []).length, 0) };
}
const calChip = (p, cls = '') => `<i class="cal-c ${cls}" style="--pc:var(--p-${p})">${PART_NAME[p]}</i>`;
const calDelta = (a, b) => !b && a ? '이번 달 첫 기록' : a === b ? '지난달과 같아요' : `지난달보다 <b class="cal-dt" data-up="${a > b}">${a > b ? '▲' : '▼'}<span class="num">${Math.abs(a - b)}</span></b>`;
function calSheet(keep) {
  const ym = CAL, by = sessByDay(), today = dayKey(), m = +ym.slice(5), S = calStats(ym, by), P = calStats(ymAdd(ym, -1), by);
  const future = ym > today.slice(0, 7), cells = Array.from({ length: ymDays(ym) }, (_, i) => {
    const k = `${ym}-${pad(i + 1)}`, ss = by[k] || [], plan = !ss.length && daysBetween(today, k) >= 0 && tplFor(k), parts = ss.map(s => partOf(s.tpl, s.ex));
    const lab = `${m}월 ${i + 1}일 ${DOW[dow(k)]}요일${k === today ? ' 오늘' : ''}, ${ss.length ? parts.map(p => PART_NAME[p]).join('·') + ' 운동' : plan ? TPL[plan].code + ' 예정' : '기록 없음'}`;
    return `<button class="cal-d" data-act="calDay" data-k="${k}"${k === today ? ' aria-current="date"' : ''}${ss.length || plan ? '' : ' data-e'} aria-label="${esc(lab)}"><span class="num">${i + 1}</span>${parts.map(p => calChip(p)).join('')}${plan ? calChip(partOf(plan), 'plan') : ''}</button>`;
  }).join('');
  const html = `<div class="row row--between"><h2 class="fq-t-title">운동 달력</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <div class="cal-nav"><button class="fq-btn fq-btn--icon" data-act="calNav" data-n="-1" aria-label="지난달">${ico('chevL')}</button><p class="fq-t-heading" id="calTitle" aria-live="polite">${ym.slice(0, 4)}년 ${m}월</p><button class="fq-btn fq-btn--icon" data-act="calNav" data-n="1" aria-label="다음 달">${ico('chev')}</button></div>
    ${S.days ? `<div class="cal-sum" id="calSum">
      <div class="fq-card"><span class="fq-eyebrow">운동</span><span class="fq-t-num-md" data-v="days">${S.days}<small>일</small></span><span class="fq-t-caption">${calDelta(S.days, P.days)}</span></div>
      <div class="fq-card"><span class="fq-eyebrow">총 세트</span><span class="fq-t-num-md" data-v="sets">${S.sets}<small>세트</small></span><span class="fq-t-caption">${calDelta(S.sets, P.sets)}</span></div>
      <div class="fq-card"><span class="fq-eyebrow">가장 많이 한 부위</span><span class="cal-big" data-v="top">${calChip(S.top)}</span><span class="fq-t-caption"><span class="num">${S.topN}</span>번</span></div>
      <div class="fq-card"><span class="fq-eyebrow">새 기록</span><span class="fq-t-num-md" data-v="prs">${S.prs}<small>개</small></span><span class="fq-t-caption">${calDelta(S.prs, P.prs)}</span></div></div>`
    : `<section class="tile card-pad" id="calEmpty"><div class="l-head">${coach('idle', 40)}<p>${future ? '아직 오지 않은 달이에요.' : '이 달엔 운동 기록이 없어요.'}<small>${future ? '점선은 주간 루틴에 잡혀 있는 계획이에요.' : '운동을 끝내면 날짜마다 부위 색으로 쌓여요.'}</small></p></div></section>`}
    <div class="cal-h" aria-hidden="true">${[1, 2, 3, 4, 5, 6, 0].map(d => `<span>${DOW[d]}</span>`).join('')}</div>
    <div class="cal-g" id="calGrid">${'<span></span>'.repeat((dow(ym + '-01') + 6) % 7)}${cells}</div>
    <p class="fq-t-caption center" style="margin:0">날짜를 누르면 그날 한 운동이 나와요 · 점선은 계획</p>`;
  const el = $('.sheet'); if (keep && el) { el.innerHTML = html; el.scrollTop = 0; } else sheet(html);
}
function calSess(s, i) {
  const t = TPL[s.tpl], mins = s.t0 && s.t1 ? Math.max(1, Math.round((s.t1 - s.t0) / 6e4)) : 0;
  const name = t ? (t.by ? `${t.by} · ${t.ko.replace(t.by + ' · ', '')}` : `기본 V자 · ${t.ko}`) : '지금은 없는 루틴';
  const vol = s.ex.reduce((a, e) => a + (EX[e.id] && EX[e.id].kind === 'as' ? 0 : e.sets.reduce((x, z) => x + z.w * z.r, 0)), 0);   // 어시스트는 보조 무게라 볼륨에서 뺌
  return `<section class="tile card-pad cal-s" aria-label="${esc(name)}">
    <div class="card-h">${calChip(partOf(s.tpl, s.ex), 'cal-big')}${s.cond === 'short' ? '<span class="chip">15분 퀘스트</span>' : ''}${s.complete === false ? '<span class="chip">일부만</span>' : ''}<span class="chip gd num">+${fmt(s.xp || 0)} XP</span></div>
    <h3 class="fq-t-heading">${esc(name)}</h3>
    <p class="fq-t-caption">${s.ex.length}가지 <span class="num">${setsOf(s)}</span>세트${mins ? ` · <span class="num">${mins}</span>분` : ''} · 총 볼륨 <span class="num">${fmt(vol)}</span>kg${(s.prs || []).length ? ` · 새 기록 <span class="num">${s.prs.length}</span>개` : ''}</p>
    <div class="cal-ex">${s.ex.map(e => `<div><b>${esc(EX[e.id] ? EX[e.id].n : e.id)}</b><span class="cal-sets">${e.q ? `<span class="num${e.sets.some(z => z.pr) ? ' pr' : ''}">${e.sets.some(z => z.pr) ? `${ico('trophy', 'ico--14')}<span class="fq-sr">새 기록</span>` : ''}${EX[e.id] ? qW(e.id, EX[e.id].kind === 'as' ? Math.min(...e.sets.map(z => z.w)) : Math.max(...e.sets.map(z => z.w))) : ''} · ${e.sets.length}세트</span>` : e.sets.map(z => `<span class="num${z.pr ? ' pr' : ''}">${z.pr ? `${ico('trophy', 'ico--14')}<span class="fq-sr">새 기록</span>` : ''}${EX[e.id] ? wLabel(e.id, z.w) : z.w}×${z.r}</span>`).join('')}</span></div>`).join('')}</div>
    ${t ? `<button class="fq-btn ${i ? 'fq-btn--secondary ' : ''}fq-btn--block" data-act="pickGo" data-t="${esc(s.tpl)}">${ico('repeat')}이 루틴 다시 하기</button>` : ''}</section>`;
}
function calDaySheet(k) {
  const ss = DB.sessions.filter(s => s.day === k), d = kDate(k), today = dayKey(), plan = !ss.length && daysBetween(today, k) >= 0 && tplFor(k);
  const body = ss.length ? ss.map(calSess).join('')
    : plan ? `<section class="tile card-pad"><div class="l-head">${coach('think', 40)}<p>${esc(TPL[plan].ko)} 하는 날이에요.<small>아직 기록 전이에요. 끝내면 여기에 쌓여요.</small></p></div>${k === today ? `<button class="fq-btn fq-btn--lg fq-btn--block" data-act="startQuest">${ico('play', 'fill')}운동 시작</button>` : ''}</section>`
    : `<section class="tile card-pad" id="calDayEmpty"><div class="l-head">${coach('rest', 40)}<p>${daysBetween(today, k) > 0 ? '아직 계획이 없는 날이에요.' : '쉬어 간 날이에요.'}<small>근육은 쉬는 날 자라요. 이날은 운동 기록이 없어요.</small></p></div></section>`;
  $('.sheet').innerHTML = `<div class="cal-dh"><button class="fq-btn fq-btn--icon" data-act="calBack" aria-label="달력으로">${ico('chevL')}</button><h2 class="fq-t-title">${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>${body}`;
  $('.sheet').scrollTop = 0;
}
function crCard(id) {
  const c = CREATORS.find(x => x.id === id);
  sheet(`<div class="row row--between"><span class="chip">${c.tag}</span><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
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
  // 키가 없으면 링크 칸·꺼진 버튼 대신 키 넣는 칸 하나 (넣으면 바로 이 화면이 열림)
  if (!has) return sheet(`<div class="row row--between"><h2 class="fq-t-title">내 유튜버 추가</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-body" style="margin:-6px 0 0">영상을 루틴으로 배우려면 제미나이 무료 키가 필요해요.</p>
    <label class="stack" for="gkeyS" style="gap:6px"><span class="fq-t-label">제미나이 키 (aistudio.google.com/apikey)</span><input id="gkeyS" class="inp" type="password" autocomplete="off" placeholder="AIza…"></label>
    ${msg ? `<p class="fq-t-body err">${esc(msg)}</p>` : ''}
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="crKey">키 저장하고 계속</button>`);
  sheet(`<div class="row row--between"><h2 class="fq-t-title">내 유튜버 추가</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-caption" style="margin:-6px 0 0">루틴 영상 링크를 넣으면 앱이 배워서 로테이션에 넣어요. 영상은 내려받지 않아요.</p>
    <label class="stack" for="crName" style="gap:6px"><span class="fq-t-label">유튜버 이름</span><input id="crName" class="inp" placeholder="예: 김계란" value="${esc(P.name || '')}"></label>
    <label class="stack" for="crUrls" style="gap:6px"><span class="fq-t-label">루틴 영상 링크 (한 줄에 하나, 최대 5개)</span><textarea id="crUrls" class="inp" rows="4" style="padding:12px;min-height:110px" placeholder="https://youtu.be/…">${esc(P.url || '')}</textarea></label>
    ${msg ? `<p class="fq-t-body err">${esc(msg)}</p>` : ''}
    <button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="crLearn">학습 시작</button>
    <p class="note" style="margin:0">영상 1개에 30초~1분 걸려요. 영상에 없는 세트·횟수는 앱 기본값으로 채워요.</p>`);
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
    ${out.map(({ d, url }) => `<section class="fq-card stack" style="gap:6px"><div class="card-h"><b>${esc(d.title || '루틴')}</b><span class="chip">${PART_NAME[d.part] || '맞춤'}</span></div>
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
  const { name, out, cr } = CR_DRAFT, tpls = [], styles = [], diets = [], keyOf = {};
  out.forEach(({ d, url }) => {
    const key = crTpl(name, d, url, cr ? { cr, from: ytId(url), at: Date.now(), day: dayKey() } : {}); if (!key) return;
    tpls.push(key); keyOf[url] = key; (d.style || []).slice(0, 3).forEach(x => styles.push(String(x).slice(0, 60))); (d.diet || []).slice(0, 2).forEach(x => diets.push(String(x).slice(0, 60)));
  });
  if (!tpls.length) return crAddSheet('영상에서 운동을 찾지 못했어요. 루틴 영상 링크인지 확인해 주세요.');
  const c = DB.custom;
  if (cr) out.forEach(({ url }) => fwDone(ytId(url), keyOf[url]));   // 기존 유튜버에 붙임 (봐볼 영상에서 넣기)
  else { const cid = 'u_' + uid(); c.creators.push({ id: cid, name, ch: '', tag: '내가 추가', body: `영상 ${out.length}개로 학습한 ${name} 스타일`, mark: name, style: [...new Set(styles)].slice(0, 4), diet: [...new Set(diets)].slice(0, 3), tpls, videos: out.length, user: 1 }); DB.profile.creators = (DB.profile.creators || []).concat(cid); }
  DB.flags['cradd_' + dayKey()] = (DB.flags['cradd_' + dayKey()] || 0) + 1;
  mergeCustom(); save(); CR_DRAFT = null; CR_PRE = null; closeSheet(); SFX.pr(); R[TAB] && R[TAB]();
  toast(cr ? `<span>내 루틴에 넣었어요 · 다음 주 ${PART_NAME[partOf(tpls[0])]}날에 들어가요</span>` : `<span>${esc(name)} 루틴 ${tpls.length}개를 로테이션에 넣었어요</span>`, 4000);
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
function qStart(t) { buildSession('normal', t || null); SFX.start(); go('logger'); }   // 0928 빠른 기록: 컨디션 묻지 않고 바로 (세트 수를 신경 쓰지 않으니)
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
  let ex = TPL[t].ex.map(([id0, n, o = {}]) => { const id = exSub(id0); const range = o.r || EX[id].range, pl = plannedFor(id, n, range); return { id, n, range, rest: EX[id].rest, tip: o.tip ? { who: by, t: o.tip } : null, v: o.t || null, d: !!o.d, sets: pl.reps.map(r => ({ w: pl.w, r, done: false })) }; });
  if (c === 'tired') ex = ex.slice(0, Math.max(2, ex.length - 1)).map(e => ({ ...e, sets: e.sets.slice(0, Math.max(2, e.sets.length - 1)) }));
  if (c === 'short') { const side = ex.find(e => EX[e.id].mus.includes('delt-side')) || (() => { const pl = plannedFor('slr', 3); return { id: 'slr', n: 3, rest: 75, sets: pl.reps.map(r => ({ w: pl.w, r, done: false })) }; })(); ex = [ex[0], side].filter((e, i, a) => a.indexOf(e) === i).map(e => ({ ...e, rest: 75, sets: e.sets.slice(0, 3) })); }
  if (c === 'good') { const s = ex.find(e => EX[e.id].mus.includes('delt-side')); if (s) { const l = s.sets[s.sets.length - 1]; s.sets.push({ w: l.w, r: l.r, done: false, bonus: true }); } }
  const best = {}; ex.forEach(e => best[e.id] = prog(e.id).best || 0);
  ex.forEach(e => { const w0 = (e.sets.find(x => !x.bonus) || e.sets[0]).w; e.q = { w: w0, w0, n: e.sets.length, done: false, pr: false, ed: false }; });   // 0928 빠른 기록: 운동마다 '오늘 최고 무게' 하나 + 세트 수
  W = { q: true, day: k, c, tpl: t, ex, i: 0, combo: 0, xp: 0, prs: 0, prList: [], t0: Date.now(), rest: null, feel: false, best, log: [], feels: {}, comeback: comebackGap() >= 7 };
  addXP('cond', 5); save();
}
function curSet() { const e = W.ex[W.i]; return { e, k: e.sets.findIndex(s => !s.done) }; }
document.addEventListener('focusin', ev => { if (ev.target.matches && ev.target.matches('.qwi')) ev.target.select(); });
document.addEventListener('change', ev => { const t = ev.target; if (!t.matches || !t.matches('.qwi') || !W || !W.q) return; const e = W.ex[+t.dataset.i]; qSetW(e, t.value); t.value = e.q.w; save(); });
document.addEventListener('input', ev => { const t = ev.target; if (!t.matches || !t.matches('.qwi') || !W || !W.q) return; const e = W.ex[+t.dataset.i], p = document.querySelector(`.qr-pl[data-pl="${t.dataset.i}"]`); if (e && p && isBar(e.id)) p.textContent = plateText(parseFloat(String(t.value).replace(',', '.')));   /* 1004 치는 대로 원판 */ });
document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches && ev.target.matches('.qwi')) ev.target.blur(); });
R.logger = () => {
  if (W.q) return qView();
  if (W.rest) return restView();
  const { e, k } = curSet(), E = EX[e.id], inc = incOf(e.id);
  const s = k >= 0 ? e.sets[k] : null, tip = e.tip || TIPS[e.id], st = prog(e.id), last = st.n ? lastStr(e.id) : null, rg = e.range || E.range, vv = e.v || E.v;
  const setName = (x, j) => x.bonus ? '보너스' : `${j + 1}세트`;
  $('#scr-logger').innerHTML = `
    ${wkTop(`<b>${esc(TPL[W.tpl].code)}</b>`)}
    <div class="lg-grid"><div class="lg-main">
      <p class="lab">${esc(E.eq)}${E.mus.some(m => BP_FOCUS.includes(m)) ? ' · V자 우선 부위' : ''}</p>
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
/* ================= 빠른 기록 (0928) — 세트마다 누르지 않고, 운동이 끝나면 최고 무게만 ================= */
function bestMax(id) {   // 지금까지 이 운동의 최고 무게 (어시스트는 쓰지 않음)
  const st = prog(id);
  if (st.bestW == null) st.bestW = DB.sessions.reduce((m, s) => Math.max(m, ...s.ex.filter(e => e.id === id).map(e => Math.max(0, ...e.sets.map(z => z.w)))), 0);
  return st.bestW;
}
function lastMax(id) { const ss = lastSets(id); return ss ? (EX[id].kind === 'as' ? Math.min(...ss.map(z => z.w)) : Math.max(...ss.map(z => z.w))) : null; }
const qW = (id, w) => EX[id].kind === 'as' ? `보조 ${w}kg` : `최고 ${w}kg`;
function qRow(e, i, cur) {
  const E = EX[e.id], rg = e.range || E.range, lm = lastMax(e.id), as = E.kind === 'as';
  const thumb = `<button class="qr-th" data-act="howtoEx" data-i="${i}" aria-label="${esc(E.n)} 동작 보기">${E.img ? `<img src="media/${E.img}_0.jpg" alt="" loading="lazy">` : ''}<span class="pl">${ico('cplay', 'ico--16')}</span></button>`;
  if (e.q.done) return `<li class="qr done${e.q.pr ? ' pr' : ''}" data-i="${i}">${thumb}<div class="qr-t"><b>${esc(E.n)}</b><span class="qr-m">${e.q.pr ? `<span class="chip gd">${ico('trophy', 'ico--14')}새 기록</span>` : `<span class="ck">${ico('check', 'ico--16')}</span>`}<span><b class="num">${qW(e.id, e.q.w)}</b> · ${e.q.n}세트</span></span></div>
    <button class="qr-fix" data-act="qUndo" data-i="${i}" aria-label="${esc(E.n)} 기록 고치기">고치기</button></li>`;
  const inc = incOf(e.id), up = lm != null && (as ? e.q.w0 < lm : e.q.w0 > lm) ? +Math.abs(e.q.w0 - lm).toFixed(2) : 0;
  return `<li class="qr${cur ? ' cur' : ''}" data-i="${i}" ${cur ? 'aria-current="step"' : ''}>${thumb}<div class="qr-t"><b>${esc(E.n)}</b>
      <span class="qr-m">${e.q.ed ? `<span class="qs" role="group" aria-label="세트 수"><button data-act="qs-" data-i="${i}" aria-label="세트 1개 줄이기">${ico('minus', 'ico--16')}</button><b class="num">${e.q.n}세트</b><button data-act="qs+" data-i="${i}" aria-label="세트 1개 늘리기">${ico('plus', 'ico--16')}</button></span>`
        : `<button class="qs-chip" data-act="qsEd" data-i="${i}" aria-label="세트 수 ${e.q.n}개 · 바꾸기">${e.q.n}세트</button>`}<span>${rg[0]}–${rg[1]}회</span>${!cur ? `<button class="qs-chip q-pick" data-act="qPick" data-i="${i}" aria-label="${esc(E.n)} 지금 하기">지금 할래요</button>` : ''}${lm != null ? `<span>지난번 <b class="num">${wLabel(e.id, lm)}kg</b></span>` : '<span>첫 기록</span>'}${up ? `<span class="chip gd">${as ? '보조 −' : '+'}${up}kg 도전</span>` : ''}</span></div>
    <div class="qr-in"><div class="qw" role="group" aria-label="${as ? '보조 무게' : '오늘 최고 무게'}"><button data-act="qw-" data-i="${i}" aria-label="${inc}kg 줄이기">${ico('minus')}</button>
      <label class="v"><small>${as ? '보조' : '최고'}</small><input class="num qwi" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" value="${e.q.w}" data-i="${i}" aria-label="${esc(E.n)} ${as ? '보조 무게' : '오늘 최고 무게'} kg"><small>kg</small></label>
      <button data-act="qw+" data-i="${i}" aria-label="${inc}kg 늘리기">${ico('plus')}</button></div>
      <button class="qr-ok" data-act="qDone" data-i="${i}">${ico('check')}<span>완료</span></button></div>
    ${isBar(e.id) ? `<p class="qr-pl num" data-pl="${i}">${plateText(e.q.w)}</p>${cur && warmText(e.q.w) ? `<p class="qr-wu">${ico('flame', 'ico--14')}${warmText(e.q.w)}</p>` : ''}` : ''}
    <button class="qr-alt" data-act="qAltOpen" data-i="${i}">${ico('swap', 'ico--14')}${e.alt ? `${esc(EX[e.alt].n)} 대신 하는 중 · 다시 바꾸기` : '기구 사용 중? 대체 운동'}</button></li>`;
}
/* 1004 사용자: 기본 루틴 끝나고 더 할 수 있으면 — 이번 주 덜 채운 부위(바디 설계도 목표) + 오늘 부위 위주로 2~3개 추천, [+ 추가]면 오늘 목록 끝에 붙음 */
function moreEx() {
  if (!W) return [];
  const ws = weekSets(), have = new Set(W.ex.map(e => e.id)), off = gymOff(), today = new Set(W.ex.map(e => EX[e.id].mus[0]));
  W.ex.forEach(e => { if (e.q && e.q.done) [...new Set(EX[e.id].mus)].forEach(m => ws[m] = (ws[m] || 0) + e.q.n); });
  const need = m => BP_T[m] ? Math.max(0, BP_T[m] - (ws[m] || 0)) / BP_T[m] : 0;
  const cand = Object.keys(EX).filter(id => !id.startsWith('X') && !have.has(id) && EX[id].range && EX[id].mus && !off.includes(kGrp(EX[id].kind)) && EX[id].kind !== 'as');
  const sc = id => { const ms = [...new Set(EX[id].mus)]; return ms.reduce((a, m) => a + need(m) * (BP_FOCUS.includes(m) ? 2 : 1), 0) + (today.has(EX[id].mus[0]) ? .6 : 0) + (EX[id].img ? .1 : 0); };
  const out = [], used = new Set();
  cand.map(id => [id, sc(id)]).sort((a, b) => b[1] - a[1]).forEach(([id, v]) => { const m = EX[id].mus[0]; if (out.length < 3 && v > .3 && !used.has(m)) { used.add(m); out.push(id); } });
  return out.map(id => { const m = EX[id].mus.find(x => need(x) > 0) || EX[id].mus[0], tg = BP_T[m];
    return { id, why: tg ? `${MUS_KO[m] || m} 이번 주 ${ws[m] || 0}/${tg}세트` : `오늘 ${MUS_KO[m] || m} 마무리` }; });
}
function qAddEx(id) {
  if (!W || !EX[id] || W.ex.some(e => e.id === id)) return;
  const range = EX[id].range, pl = plannedFor(id, 3, range);
  const e = { id, n: 3, range, rest: EX[id].rest, tip: null, v: null, d: false, add: true, sets: pl.reps.map(r => ({ w: pl.w, r, done: false })) };
  e.q = { w: pl.w, w0: pl.w, n: 3, done: false, pr: false, ed: false }; W.ex.push(e); W.autoEnd = false; save(); qView();
  toast(`<span>${esc(EX[id].n)} 추가했어요 · 3세트</span>`);
  setTimeout(() => { const li = document.querySelector(`.qr[data-i="${W.ex.length - 1}"]`); if (li) li.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 50);
}
/* 1004 사용자: 사람 많아 기구를 못 쓸 때 — 같은 근육을 쓰는 다른 기구 운동 3개, 고르면 그 자리 교체(세트 수 그대로) */
function altsFor(id) {
  const E = EX[id], off = gymOff(), have = new Set(W ? W.ex.map(e => e.id) : []);
  const c = Object.keys(EX).filter(x => x !== id && !x.startsWith('X') && !have.has(x) && EX[x].range && EX[x].mus && !off.includes(kGrp(EX[x].kind)) && EX[x].mus[0] === E.mus[0]);
  const sc = x => EX[x].mus.filter(m => E.mus.includes(m)).length + (kGrp(EX[x].kind) !== kGrp(E.kind) ? 1 : 0) + (EX[x].img ? .2 : 0);
  return c.sort((a, b) => sc(b) - sc(a)).slice(0, 3);
}
function altSheet(i) {
  const e = W && W.ex[i]; if (!e) return; const L = altsFor(e.id);
  if (!L.length) return toast('<span>같은 부위 다른 운동이 없어요. 잠깐 뒤로 미뤄 두세요.</span>');
  sheet(`<div class="row row--between"><h2 class="fq-t-title">${esc(EX[e.id].n)} 대신</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-caption">기구가 사용 중일 때 · 같은 근육(${esc(MUS_KO[EX[e.id].mus[0]] || EX[e.id].mus[0])})을 쓰는 운동이에요. 세트 수는 그대로.</p>
    <div class="alt-l">${L.map(x => `<button class="alt-r" data-act="qAlt" data-i="${i}" data-id="${x}">${EX[x].img ? `<img src="media/${EX[x].img}_0.jpg" alt="" loading="lazy">` : `<span class="alt-ph">${ico('cplay', 'ico--16')}</span>`}<span class="alt-t"><b>${esc(EX[x].n)}</b><small>${esc(EX[x].eq || '')} · ${EX[x].range[0]}–${EX[x].range[1]}회${lastMax(x) != null ? ` · 지난번 ${wLabel(x, lastMax(x))}kg` : ' · 첫 기록'}</small></span>${ico('chev', 'ico--16')}</button>`).join('')}</div>`);
}
function qAlt(i, id) {
  const e = W && W.ex[i]; if (!e || !EX[id]) return; const from = EX[e.id].n, n = e.q.n, range = EX[id].range, pl = plannedFor(id, n, range);
  W.ex[i] = { id, n, range, rest: EX[id].rest, tip: null, v: null, d: false, add: e.add, alt: e.id, sets: pl.reps.map(r => ({ w: pl.w, r, done: false })), q: { w: pl.w, w0: pl.w, n, done: false, pr: false, ed: false } };
  closeSheet(); save(); qView(); toast(`<span>${esc(from)} → ${esc(EX[id].n)}</span>`);
}
function moreHtml() {
  const list = moreEx(); if (!list.length) return '';
  return `<section class="qm" aria-labelledby="qmH"><p class="qm-h" id="qmH">${ico('plus', 'ico--16')}더 할 수 있으면 <small>이번 주 덜 채운 부위부터</small></p>
    ${list.map(x => `<div class="qm-r"><button class="qm-th" data-act="howtoId" data-id="${x.id}" aria-label="${esc(EX[x.id].n)} 동작 보기">${EX[x.id].img ? `<img src="media/${EX[x.id].img}_0.jpg" alt="" loading="lazy">` : ico('cplay', 'ico--16')}</button>
      <span class="qm-t"><b>${esc(EX[x.id].n)}</b><small>${esc(x.why)} · ${EX[x.id].range[0]}–${EX[x.id].range[1]}회</small></span>
      <button class="qm-add" data-act="qAdd" data-id="${x.id}" aria-label="${esc(EX[x.id].n)} 오늘 목록에 추가">${ico('plus', 'ico--16')}추가</button></div>`).join('')}</section>`;
}
function qCurIdx() { return W.pick != null && W.ex[W.pick] && !W.ex[W.pick].q.done ? W.pick : W.ex.findIndex(e => !e.q.done); }   // 1010 MJ '할 수 있는 운동을 먼저 골라서'
function qView() {
  const cur = qCurIdx(), n = W.ex.filter(e => e.q.done).length, all = n === W.ex.length;
  const first = !DB.sessions.some(s => s.ex.some(e => e.q));
  const sum = all ? `<div class="tile ql-sum" style="--o:2"><span><b class="num">${W.ex.length}</b>운동</span><span><b class="num">${W.ex.reduce((a, e) => a + e.q.n, 0)}</b>세트</span>${W.prs ? `<span class="gold-t"><b class="num">${W.prs}</b>새 기록</span>` : ''}<span><b class="num">+${fmt(W.xp)}</b>XP</span></div>` : '';
  clearInterval(qView.cd);
  $('#scr-logger').innerHTML = `${wkTop(`<b>${esc(TPL[W.tpl].code)}</b>`)}
    <div class="lg-grid ql-grid${all ? ' all' : ''}"><div class="lg-main">
      ${first && !all ? `<p class="ql-h">${coach('focus', 32)}<span>무게만 맞추고 <b>완료</b> · 그대로면 바로 완료</span></p>` : ''}
      ${all ? `<p class="ql-h">${coach('proud', 32)}<span><b>다 했어요!</b> 틀린 게 있으면 고치기 (결과 전에)</span></p>` : ''}
      <ol class="ql-list">${W.ex.map((e, i) => [e, i]).sort((a, b) => (a[1] === cur ? -1 : b[1] === cur ? 1 : 0) || (a[0].q.done - b[0].q.done) || a[1] - b[1]).map(([e, i]) => qRow(e, i, i === cur)).join('')}</ol>
      ${moreHtml()}
      ${n && !all ? '<button class="ql-end" data-act="endAsk">여기서 끝내기</button>' : ''}
    </div><div class="lg-side">
      ${cur >= 0 ? `<div class="lg-photo ql-photo">${howto(W.ex[cur].id)}<button class="watch" data-act="howtoEx" data-i="${cur}">${ico('cplay')}동작 보기</button></div>` : ''}
      ${sum}
      ${all ? `<div class="dock ql-dock" style="--o:3"><div class="dock-toast" id="dockToast"></div><button class="fq-btn fq-btn--xl fq-btn--block btn-done sel" data-act="finish">${ico('check')}<span>운동 완료<small class="ql-cd" id="qlCd"> · 3초 뒤 결과</small></span></button></div>` : '<div class="dock-toast" id="dockToast"></div>'}
    </div></div>`;
  tickClock();
  if (all && W.autoEnd) { let left = 3; qView.cd = setInterval(() => { if (!W || TAB !== 'logger') return clearInterval(qView.cd); left--; const c = $('#qlCd'); if (c) c.textContent = ` · ${left}초 뒤 결과`; if (left <= 0) { clearInterval(qView.cd); finish(); } }, 1000); }
}
function qDone(i) {
  const e = W.ex[i], E = EX[e.id]; if (!e || e.q.done) return;
  e.q.done = true; e.q.ed = false; if (W.pick === i) W.pick = null; W.autoEnd = W.ex.every(x => x.q.done);   // 마지막 완료 → 3초 뒤 결과 (고치기로 멈춤)
  const inp = document.querySelector(`.qwi[data-i="${i}"]`); if (inp) qSetW(e, inp.value);   // 입력 중이던 숫자 먼저 반영
  let gain = 0, cnt = 0; for (let j = 0; j < e.q.n; j++) { const g = addXP('set', 3); gain += g; if (g) cnt++; }
  const bm = E.kind === 'as' ? 0 : bestMax(e.id);
  if (bm > 0 && e.q.w > bm && W.prs < 3) { e.q.pr = true; W.prs++; W.prList.push(`${E.n} ${e.q.w}kg`); gain += 50; DB.xp += 50; }
  W.xp += gain; W.log.push({ i, j: 0, gain, pr: e.q.pr, combo: false, n: cnt, prName: e.q.pr ? W.prList[W.prList.length - 1] : '' });
  e.q.pr ? SFX.pr() : SFX.set(); buzz(e.q.pr ? [20, 40, 20] : 12);
  save(); qView(); if (gain) floatXP(`+${gain} XP`, document.querySelector(`.qr[data-i="${i}"]`));
  const nx = document.querySelector('.qr.cur'); if (nx) nx.scrollIntoView({ block: 'center', behavior: RM() ? 'auto' : 'smooth' });
  say(`${E.n} 완료, 최고 ${e.q.w}킬로그램`);
}
function qStep(i, d) {   // 제자리에서 숫자만 바꿈 (목록을 다시 그리지 않음)
  const e = W.ex[i], inp = document.querySelector(`.qwi[data-i="${i}"]`); if (inp) qSetW(e, inp.value);
  e.q.w = Math.max(0, +(e.q.w + d * incOf(e.id)).toFixed(2)); if (inp) inp.value = e.q.w; SFX.tap && SFX.tap(); save();
  const p = document.querySelector(`.qr-pl[data-pl="${i}"]`); if (p) p.textContent = plateText(e.q.w);   /* 1004 */
}
function qUndo(i) {
  const e = W.ex[i]; if (!e || !e.q.done) return;
  const li = W.log.map((l, n) => l.i === i ? n : -1).filter(n => n >= 0).pop(), l = W.log[li];
  if (l) { W.xp -= l.gain; DB.xp = Math.max(0, DB.xp - l.gain); const dd = DB.xpDay[dayKey()]; if (dd && dd.set) dd.set = Math.max(0, dd.set - (l.n || 0)); if (l.pr) { W.prs--; const k = W.prList.indexOf(l.prName); if (k >= 0) W.prList.splice(k, 1); } W.log.splice(li, 1); }
  e.q.done = false; e.q.pr = false; W.autoEnd = false; SFX.undo(); save(); qView();
}
function qSetW(e, raw) { const v = parseFloat(String(raw).replace(',', '.')); if (isFinite(v) && v >= 0 && v < 1000) e.q.w = Math.round(v * 4) / 4; }
function qToSets() {   // 끝낼 때: 빠른 기록 → 예전 세트 형식 (달력 · 설계도 · 추세가 그대로 읽게). 반복은 계획값으로 채움
  W.ex.forEach(e => { if (!e.q) return; const r0 = (e.sets.find(x => !x.bonus) || e.sets[0]).r;
    e.sets = e.q.done ? Array.from({ length: e.q.n }, (_, j) => ({ w: e.q.w, r: r0, done: true, pr: j === 0 && e.q.pr })) : e.sets.map(x => ({ ...x, done: false })); });
}
function qProgress(e) {   // 다음 계획 무게 = 오늘 최고 무게 (올렸으면 'up', 낮췄으면 'fail', 같으면 'hold')
  const st = prog(e.id), w = e.q.w;
  st.last = st.n === 0 ? 'first' : (EX[e.id].kind === 'as' ? w < e.q.w0 : w > e.q.w0) ? 'up' : w === e.q.w0 ? 'hold' : 'fail';
  if (st.n === 0) st.last = 'hold';
  st.w = w; st.reps = null; st.f = 0; st.n++; st.lastDay = dayKey(); st.q = 1; st.dW = +Math.abs(w - e.q.w0).toFixed(2);
  if (EX[e.id].kind !== 'as') st.bestW = Math.max(bestMax(e.id), w);
}
function wkTop(title) {
  const gym = document.documentElement.classList.contains('gym');
  return `<div class="wk-top">
    <button class="round" data-act="endAsk" aria-label="운동 끝내기">${ico('x')}</button>
    <div class="prog"><p>${title} · <span class="num">${W.q ? W.ex.filter(x => x.q.done).length : W.i + 1} / ${W.ex.length}</span> ${W.q ? '완료' : '운동'} · <span class="num" id="clock">00:00</span></p>
      <div class="dots" style="grid-template-columns:repeat(${W.ex.length},1fr)" aria-hidden="true">${W.ex.map((x, i) => `<i class="${(W.q ? x.q.done : x.sets.every(y => y.done)) ? 'd' : (W.q ? i === W.ex.findIndex(y => !y.q.done) : i === W.i) ? 'c' : ''}"></i>`).join('')}</div></div>
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
      <div class="lg-photo rs-photo">${howto(e.id)}<button class="watch" data-act="howtoEx" data-i="${W.i}">${ico('cplay')}동작 보기</button></div>
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
function floatXP(txt, at) { const d = at || $('.dock'); if (!d) return; const x = document.createElement('span'); x.className = 'xpf num'; x.textContent = txt; d.append(x); setTimeout(() => x.remove(), 1200); }
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
  const prevS = lastSets(e.id), up = prevS && EX[e.id].kind !== 'as' && j === 0 && s.w > prevS[0].w ? +(s.w - prevS[0].w).toFixed(2) : 0;   // 지난번보다 무게가 오르면 첫 세트에 금색 +kg
  save(); R.logger();
  floatXP(`+${gain} XP`); if (up) setTimeout(() => floatXP(`+${up}kg`), 380);
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
let SHARE = null;
function shareCard() {   // 1080×1350 이미지: 루틴 · 운동 수 · 세트 · 시간 · 새 기록 · 쓴 근육 · 오늘 단백질 (체중은 넣지 않음)
  const S0 = SHARE; if (!S0) return;
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d'), F = (w, px) => `${w} ${px}px Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif`;
  g.fillStyle = '#0F1115'; g.fillRect(0, 0, 1080, 1350);
  g.fillStyle = '#E0202C'; g.fillRect(0, 0, 1080, 14);
  g.fillStyle = '#9AA3B2'; g.font = F(700, 34); g.fillText('FITQUEST · ' + S0.day.replace(/-/g, '.'), 80, 120);
  g.fillStyle = '#FFFFFF'; g.font = F(900, 84); g.fillText(S0.code, 80, 240);
  g.font = F(700, 44); g.fillStyle = '#D0D5DD'; g.fillText((S0.by ? S0.by + ' · ' : '') + S0.title, 80, 310, 920);
  const box = (x, y, n, l) => { g.fillStyle = '#1B1E25'; g.beginPath(); g.roundRect(x, y, 290, 200, 28); g.fill(); g.fillStyle = '#FFFFFF'; g.font = F(900, 88); g.fillText(n, x + 36, y + 120); g.fillStyle = '#9AA3B2'; g.font = F(700, 34); g.fillText(l, x + 36, y + 170); };
  box(80, 380, String(S0.nEx), '가지 운동'); box(395, 380, String(S0.done), '세트'); box(710, 380, String(S0.mins), '분');
  let y = 680;
  if (S0.prs.length) { g.fillStyle = '#F5C542'; g.font = F(900, 40); g.fillText('🏆 새 기록', 80, y); y += 60; g.font = F(700, 36); g.fillStyle = '#FFFFFF'; S0.prs.forEach(p => { g.fillText(String(p).slice(0, 34), 80, y); y += 52; }); y += 20; }
  if (S0.mus.length) { g.fillStyle = '#9AA3B2'; g.font = F(700, 34); g.fillText('오늘 쓴 근육', 80, y); y += 30; let x = 80; g.font = F(800, 34);
    S0.mus.forEach(m => { const w = g.measureText(m).width + 56; if (x + w > 1000) { x = 80; y += 80; } g.fillStyle = '#1F3A44'; g.beginPath(); g.roundRect(x, y, w, 64, 32); g.fill(); g.fillStyle = '#5CD5F5'; g.fillText(m, x + 28, y + 44); x += w + 16; }); y += 120; }
  g.fillStyle = '#9AA3B2'; g.font = F(700, 34); g.fillText('오늘 단백질', 80, 1150); g.fillStyle = '#FFFFFF'; g.font = F(900, 64); g.fillText(`${S0.p} / ${S0.tp}g`, 80, 1225);
  g.fillStyle = '#E0202C'; g.beginPath(); g.roundRect(80, 1250, 920 * Math.min(1, S0.p / Math.max(1, S0.tp)), 18, 9); g.fill();
  g.textAlign = 'right'; g.fillStyle = '#F5C542'; g.font = F(900, 48); g.fillText(`Lv.${S0.L}`, 1000, 1150); g.fillStyle = '#9AA3B2'; g.font = F(700, 32); g.fillText(`연속 ${S0.streak}일`, 1000, 1200);
  c.toBlob(async b => {
    const f = new File([b], `fitquest-${S0.day}.png`, { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: '오늘 운동' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast('<span>사진을 저장했어요.</span>');
  }, 'image/png');
}
function finish() {
  if (!W) return;
  if (W.q) qToSets();
  W.end = true; delete DB.live;   // 끝내는 중: 백업 · 저장에 진행 중 운동이 섞이지 않게
  const k = dayKey(), done = W.ex.reduce((s, x) => s + x.sets.filter(y => y.done).length, 0), total = W.ex.reduce((s, x) => s + x.sets.length, 0);
  const base = W.ex.filter(e => !e.add || e.q.done);   // 1004 추가 운동은 안 해도 완료 판정에 안 들어감
  const completed = W.q ? base.filter(e => e.q.done).length / Math.max(1, base.length) >= .8 : done > 0 && done / total >= .8, L0 = levelOf(DB.xp - W.xp);
  const short = W.c === 'short', tired = W.c === 'tired', comboN = W.log.filter(l => l.combo).length, prN = W.prList.length, logSum = W.log.reduce((a, l) => a + l.gain, 0);
  let wb = 0, cb = 0;
  if (completed) wb = addXP('workout', short ? 60 : 100);
  if (completed && W.comeback) { cb = W.xp; DB.xp += W.xp; } // 복귀 첫 운동: 세트 XP 2배
  const rows = [[`세트 ${done}개`, logSum - comboN * 10 - prN * 50], comboN && [`콤보 보너스 ${comboN}번`, comboN * 10], prN && [`새 기록 ${prN}개`, prN * 50],
    wb && [short ? '15분 퀘스트 클리어' : '퀘스트 클리어', wb], cb && ['복귀 첫 운동 2배', cb], W.xp - logSum > 0 && ['통증 알려 주기', W.xp - logSum]].filter(Boolean);
  W.xp += wb + cb;
  W.ex.forEach(e => { const d = e.sets.filter(s => s.done); if (d.length && e.q) { qProgress(e); return; } if (d.length) { applyProgress(e.id, d.map(s => ({ w: s.w, r: s.r })), e.sets.filter(s => !s.bonus).length, W.feels[e.id], e.range); const st = prog(e.id); st.best = Math.max(st.best || 0, ...d.map(s => EX[e.id].kind === 'as' ? 0 : e1(s.w, s.r))); } });
  if (done) DB.sessions.push({ id: uid(), day: k, tpl: W.tpl, cond: W.c, t0: W.t0, t1: Date.now(), xp: W.xp, prs: W.prList, complete: completed, ex: W.ex.map(e => ({ id: e.id, ...(e.q ? { q: 1 } : {}), sets: e.sets.filter(s => s.done).map(s => ({ w: s.w, r: s.r, pr: !!s.pr })) })).filter(e => e.sets.length) });
  if (completed) DB.done[k] = true;
  checkDaily3(); save(); bkAuto();
  const L1 = levelOf(DB.xp), gain = [...new Set(W.ex.filter(e => e.sets.some(s => s.done)).flatMap(e => EX[e.id].mus))];
  const mins = Math.max(1, Math.round((Date.now() - W.t0) / 60000)), { left, nt, cur } = nextTarget(), prs = W.prList, xp = W.xp, T0 = TPL[W.tpl], nEx = W.ex.filter(e => e.sets.some(s => s.done)).length;
  SHARE = { code: T0.code, title: T0.by ? T0.ko.replace(T0.by + ' · ', '') : T0.ko, by: T0.by || '', nEx, done, mins, prs: prs.slice(0, 4), mus: gain.map(m => MUS_KO[m] || m).filter((x, i, a) => a.indexOf(x) === i).slice(0, 6), p: Math.round(daySum().p), tp: targets().p, L: L1, streak: streakNow(), day: k };
  clearInterval(clockT); keepAwake(false); W = null; delete DB.live; save();
  go('sum');
  const next = (() => { for (let i = 1; i <= 7; i++) { const d = addDays(k, i), t = tplFor(d); if (t) return `${DOW[dow(d)]}요일 ${TPL[t].code}: ${TPL[t].ex.map(([id]) => EX[id].n).join(', ')}`; } return '다음 운동 계획 없음'; })();
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
      ${prs.map(p => `<p class="rec"><span class="ic">${ico('trophy', 'ico--16')}</span>새 기록 ${esc(p)}</p>`).join('')}
    </div>
    <button class="fq-btn fq-btn--secondary fq-btn--block sh-btn" data-act="shareCard">${ico('camera')}오늘 운동 카드 저장·공유</button>
    <section class="tile card-pad" style="--o:3"><p class="fq-eyebrow">다음 운동</p><p class="fq-t-body">${next}</p></section>
    </div><div class="col">
    <section class="tile card-pad bp" data-c="r" aria-label="바디 설계도"><div class="card-h"><h2 class="fq-t-heading">바디 설계도</h2><span class="chip num">이번 주 ${bpPct(Lb)}%</span></div>
      <div class="bp-fig">${blueprintSVG(Lb, gain)}</div><p class="fq-t-caption center">오늘 운동한 부위가 반짝여요</p></section>
    ${left > 0 ? `<section class="tile card-pad sum-p" data-c="r"><div><p class="fq-t-caption">운동 끝. 이제 단백질</p><p><b class="fq-t-num-lg">${left}</b><span class="fq-unit"> g 남음</span></p></div><button class="fq-btn fq-btn--secondary" data-act="wte">뭐 먹지?</button></section>` : ''}
    <div class="stack sum-go" data-c="r">${left > 0 ? `<button class="fq-btn fq-btn--lg fq-btn--block" data-go="diet">${ico('utensils')}${meal ? `${meal} ${nt}g` : `단백질 ${left}g`} 채우러 가기</button><button class="fq-btn fq-btn--secondary fq-btn--block" data-go="home">홈으로</button>` : '<button class="fq-btn fq-btn--lg fq-btn--block" data-go="home">홈으로</button>'}</div>
    </div></div>`;
  flow();
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
  const foot = '<p class="fq-t-caption">굵은 윤곽이 우선 부위, 이번 주 세트만큼 채워져요</p>';
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
</div>
      ${done ? '' : `<div class="bp-plan"><p class="fq-t-label">목표 ${G.toFixed(2)}이 되려면</p>
        <p class="bp-plan__row"><span>어깨 <b class="num">${cm(t.sh)} → ${cm(t.sh * k)}</b>cm <small class="num">${dl(t.sh, t.sh * k)}</small></span><span>허리 <b class="num">${cm(t.wa)} → ${cm(t.wa / k)}</b>cm <small class="num">${dl(t.wa, t.wa / k)}</small></span></p>
        <p class="fq-t-caption">허리만 줄이면 <b class="num">${cm(t.sh / G)}</b>cm, 어깨만 키우면 <b class="num">${cm(t.wa * G)}</b>cm</p></div>`}
      <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="tape">줄자 다시 재기</button>
      <p class="fq-t-caption">굵은 윤곽이 우선 부위, 점선이 목표 어깨선</p>`;
}
const ACH_DESC = { '첫 음식 기록': '음식을 한 번 기록해요', '첫 운동': '운동을 한 번 끝내요', '첫 신기록': '세트에서 새 기록을 세워요', '진실의 거울': '정직한 2주로 내 유지 칼로리를 찾아요', '일주일 개근': '연속 기록 7일', '한 달의 약속': '연속 기록 30일', '어깨 공사 착공': '측면 삼각근 누적 100세트', '날개 펴기': '광배근 누적 100세트', '백일': '연속 기록 100일', '첫 몸 기록': '몸 사진을 한 장 찍어요', '12주 타임랩스': '12주 동안 매주 몸 사진' };
function achList() {
  const cumSets = m => DB.sessions.reduce((a, s) => a + s.ex.filter(e => EX[e.id] && EX[e.id].mus.includes(m)).reduce((x, e) => x + e.sets.length, 0), 0), st = Math.max(DB.streak.best, streakNow());
  return [['첫 음식 기록', DB.foods.length >= 1], ['첫 운동', DB.sessions.length >= 1], ['첫 신기록', DB.sessions.some(s => (s.prs || []).length)],
    ['진실의 거울', !!DB.flags.tdee, 'epic'], ['일주일 개근', st >= 7, 'rare'], ['한 달의 약속', [st, 30]],
    ['어깨 공사 착공', [cumSets('delt-side'), 100]], ['날개 펴기', [cumSets('lats'), 100]], ['백일', [st, 100]], ['첫 몸 기록', PHOTOS.length > 0], ['12주 타임랩스', [new Set(PHOTOS.map(p => weekOf(p.date))).size, 12]]]
    .map(([n, s, r]) => ({ n, got: s === true || (Array.isArray(s) && s[0] >= s[1]), p: Array.isArray(s) ? Math.min(1, s[0] / s[1]) : s ? 1 : 0, s: Array.isArray(s) ? s : null, r }));
}
function achSheet(i) {
  const a = achList()[i];
  sheet(`<div class="row row--between"><h2 class="fq-t-title">${a.n}</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <div class="ach-big${a.got ? ' got' : ''}"><span class="badge3">${ringSvg(a.p, 'gold')}${ico(a.got ? (a.r === 'epic' ? 'trophy' : 'star') : 'lock', '')}</span><p class="fq-t-body"><b>${a.got ? '받았어요' : '아직이에요'}</b><br><span class="fq-t-caption">${ACH_DESC[a.n] || ''}${a.s ? `, 지금 ${a.s[0]} / ${a.s[1]}` : ''}</span></p></div>`);
}
R.grow = () => {
  const P = DB.profile, lv = lvInfo(), L = lv.L, b = ib(), first = DB.inbody[0], Lb = bpLevels(), v = vRatio(), v0 = DB.tape[0] ? DB.tape[0].sh / DB.tape[0].wa : null, k = dayKey();
  const goalBF = P.sex === 'F' ? 23 : 15, hp = first.pbf > goalBF ? Math.max(0, Math.min(100, Math.round((b.pbf - goalBF) / (first.pbf - goalBF) * 100))) : 0;
  const d = (a, c, good) => { const x = +(a - c).toFixed(1); return x === 0 ? '<span class="delta">변화 없음</span>' : `<span class="delta" ${good(x) ? 'data-good' : ''}>${x > 0 ? '+' : '−'}${Math.abs(x)}</span>`; };
  const prevIb = DB.inbody[DB.inbody.length - 2], ach = achList(), got = ach.filter(a => a.got).length, d3 = daily3(k).every(x => x.p >= 1);
  const wLine = wTrend(k), wNow = wLine[wLine.length - 1], w2 = bodyTrend(k);
  // 고정 두 줄: 왼쪽 = 챕터 → 체중 → 인바디, 오른쪽 = 바디 설계도 → 바디 기록. 위 = 플레이어 카드, 아래 = 업적 선반
  $('#scr-grow').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">성장</h1><button class="round" data-go="set" aria-label="설정">${ico('gear')}</button></header>
    <div class="cols">
    <section class="tile card-pad player hero" aria-label="레벨">
      ${coach(d3 ? 'proud' : 'happy', 56)}
      <span class="lv-big">${ringSvg(lv.p / 100, 'gold')}<b class="num">${L}</b></span>
      <div class="pl-t"><p class="fq-t-heading">레벨 ${L} <span class="gold-t">${titleOf(L)}</span></p>
        <div class="xbar" role="progressbar" aria-label="다음 레벨까지" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${lv.p}"><i style="width:${lv.p}%"></i></div>
        <p class="fq-t-caption">다음 레벨까지 <b class="num">${fmt(lv.b - DB.xp)}</b> XP</p></div>
      <span class="pl-sh" aria-label="보호권 ${DB.streak.shields}개">${ico('shield', 'ico--20')}<b class="num">${DB.streak.shields}/2</b></span>
    </section>
    <div class="col">
    <section class="tile card-pad" aria-label="챕터"><div class="card-h"><h2 class="fq-t-heading">챕터 ${P.chapter} ${CH[P.chapter].name}</h2><span class="chip num">${chapterWeek()}</span><button class="linkbtn" data-act="chapter">바꾸기${ico('chev', 'ico--16')}</button></div>
      <div class="chmap">${CH.map((c, i) => `<div class="ch" data-s="${i < P.chapter || (i === 0 && DB.flags.tdee) ? 'done' : i === P.chapter ? 'now' : ''}"><span class="node num">${i < P.chapter || (i === 0 && DB.flags.tdee) ? ico('check', 'ico--16') : i}</span><b>${c.name}</b><small>${c.sub.replace(' ', '<br>')}</small></div>`).join('')}</div>
      ${P.chapter === 1 ? `<div class="boss"><span class="fq-t-label">${CH[1].boss} 걷어내기 <span class="fq-t-caption">목표 체지방 ${goalBF}%</span></span><div class="hp" role="meter" aria-label="남은 지방 안개" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${hp}"><i style="--p:${hp}"></i></div><span class="fq-t-caption">체지방 ${first.pbf}% → ${b.pbf}%, 4주마다 인바디로 판정</span></div>` : ''}</section>
    <section class="tile card-pad" aria-label="체중 기록"><div class="card-h"><h2 class="fq-t-heading">체중</h2><span class="fq-t-caption">7일 평균 <b class="num">${(wNow || curWeight()).toFixed(1)}</b>kg${w2.w != null ? `, 2주 전보다 <b class="num">${w2.w > 0 ? '+' : w2.w < 0 ? '−' : '±'}${Math.abs(w2.w)}</b>kg` : ''}</span></div>
      ${wLine.length > 1 ? `<div class="wline">${spark(wLine, 320, 56, 1)}</div>` : ''}
      <div class="row"><input id="wIn" class="inp" inputmode="decimal" placeholder="${DB.weights[k] || curWeight().toFixed(1)}" aria-label="오늘 체중 kg" style="flex:1"><button class="fq-btn ${DB.weights[k] ? 'fq-btn--secondary' : ''}" data-act="weigh">기록 +5 XP</button></div>
      <p class="fq-t-caption">${DB.weights[k] ? `오늘 ${DB.weights[k]}kg 기록했어요` : '아침 공복에 한 번, 7일 평균을 봐요'}</p></section>
    <section class="tile card-pad stack" style="gap:12px" aria-label="인바디"><div class="card-h"><h2 class="fq-t-heading">인바디 <span class="num fq-t-caption">${b.date}</span></h2><button class="linkbtn" data-act="inbody">${ico('plus', 'ico--16')}새 측정</button></div>
      <div class="inb"><div><span class="fq-t-caption">체중</span><span class="fq-t-num-lg">${b.w}</span>${prevIb ? d(b.w, prevIb.w, () => false) : ''}</div><div><span class="fq-t-caption">골격근량</span><span class="fq-t-num-lg">${b.smm}</span>${prevIb ? d(b.smm, prevIb.smm, x => x > 0) : ''}</div><div><span class="fq-t-caption">체지방률</span><span class="fq-t-num-lg">${b.pbf}</span>${prevIb ? d(b.pbf, prevIb.pbf, x => x < 0) : ''}</div></div>
      <p class="note">공복, 운동 전에 재야 비교가 정확해요</p></section>
    </div><div class="col">
    <section class="tile card-pad stack bp" style="gap:12px" aria-label="바디 설계도"><div class="card-h"><h2 class="fq-t-heading">바디 설계도</h2><span class="chip num">이번 주 ${bpPct(Lb)}%</span></div>
      ${vBlueprint(Lb, v, v0)}</section>
    ${photoSection()}
    </div>
    <section class="tile card-pad ach-card" aria-labelledby="achH"><div class="card-h"><h2 class="fq-t-heading" id="achH">업적</h2><span class="fq-t-caption num">${got} / ${ach.length}</span></div>
      <div class="ach">${ach.map((a, i) => `<button class="badge2${a.got ? ' got' : ''}" data-act="ach" data-i="${i}" data-r="${a.r || ''}" aria-label="${a.n}, ${a.got ? '받음' : a.s ? `${a.s[0]} / ${a.s[1]}` : '아직'}"><span class="badge3">${ringSvg(a.got ? 1 : a.p, 'gold')}${ico(a.got ? (a.r === 'epic' ? 'trophy' : 'star') : 'lock', '')}</span><b>${a.n}</b></button>`).join('')}</div></section>
    </div>`;
  loadPhotos().then(() => { const el = $('#bodyLog'); if (el && TAB === 'grow') { const i = el.dataset.i; el.outerHTML = photoSection(); if (i != null) $('#bodyLog').dataset.i = i; } });
};

/* ================= SETTINGS ================= */
R.set = () => {
  const P = DB.profile, S = DB.settings, T = targets();
  const chips = (k, list) => `<div class="chips">${list.map(([v, l]) => `<button class="fq-chip" aria-pressed="${P[k] === v}" data-act="prof" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
  // 고정 두 줄 (읽는 순서 그대로, 위→아래 왼쪽 먼저): 오늘 목표 → 생활·운동 → 사진 AI | 새 영상 알림 → 효과음 → 백업, 맨 아래 전체 폭 = 초기화
  $('#scr-set').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">설정</h1><button class="round" data-go="home" aria-label="닫기">${ico('x')}</button></header>
    <div class="cols set-cols"><div class="col">
    <section class="fq-card stack" aria-labelledby="tgH"><span class="fq-t-heading" id="tgH">오늘 목표 <span class="fq-t-caption">${T.train ? '운동일' : '휴식일'}</span></span>
      <div class="stats4">${[['칼로리', fmt(T.kcal), 'kcal'], ['단백질', T.p, 'g'], ['탄수', T.c, 'g'], ['지방', T.f, 'g']].map(([l, v, u]) => `<div class="st"><span class="fq-eyebrow">${l}</span><span><b class="num">${v}</b><span class="fq-unit">${u}</span></span></div>`).join('')}</div>
      <span class="fq-t-caption">끼니당 단백질 ${mealSplit(T.p).join(', ')}g${DB.flags.tdee ? `, 실측 유지 ${fmt(DB.flags.tdee)}kcal` : `, 기초대사량 ${T.bmr}kcal`}</span></section>
    <section class="fq-card stack" style="gap:10px" aria-labelledby="lfH"><span class="fq-t-heading" id="lfH">생활과 운동</span>
      <span class="fq-t-label">하루 걸음 수</span>${chips('steps', STEPS.map((s, i) => [i, s[0]]))}
      <span class="fq-t-label">하루 끼니 수</span>${chips('meals', [[3, '3끼'], [4, '4끼'], [5, '5끼']])}
      <span class="fq-t-label">점심</span><div class="chips"><button class="fq-chip" aria-pressed="${lunchOut()}" data-act="prof" data-k="lunchOut" data-v="true">회사·식당 일반식</button><button class="fq-chip" aria-pressed="${!lunchOut()}" data-act="prof" data-k="lunchOut" data-v="false">직접 조절</button></div>
      <span class="fq-t-label">운동 시간</span>${chips('sessionMin', [45, 60, 75, 90].map(n => [n, n + '분']))}
      <span class="fq-t-label">경력</span>${chips('level', [['beginner', '초보, 복귀'], ['intermediate', '중급']])}
      <div class="grid2"><button class="fq-btn fq-btn--secondary" data-act="schedule">${ico('repeat')}요일별 루틴</button><button class="fq-btn fq-btn--secondary" data-act="crPick">${ico('star')}롤모델 바꾸기</button></div></section>
    <section class="fq-card stack" style="gap:10px" aria-labelledby="gymH"><span class="fq-t-heading" id="gymH">내 헬스장 기구</span>
      <span class="fq-t-caption">없는 기구를 끄면 루틴 속 그 운동을 같은 부위의 다른 운동으로 바꿔 드려요</span>
      <div class="chips">${GYM.map(([k, l]) => `<button class="fq-chip" aria-pressed="${!gymOff().includes(k)}" data-act="gymTog" data-k="${k}">${l}</button>`).join('')}</div></section>
    <section class="fq-card stack" style="gap:10px" aria-labelledby="aiH"><span class="fq-t-heading" id="aiH">사진·영상 AI (제미나이)</span>
      <p class="note" style="margin:0">무료 키로 음식 사진과 루틴 영상을 읽어요. 이 폰에만 저장돼요.</p>
      <div class="key-row"><input id="gkey" class="inp" type="password" autocomplete="off" placeholder="AIza…" value="${esc(S.gkey)}" aria-label="제미나이 API 키"><button class="fq-btn fq-btn--secondary" data-act="saveKey">저장</button></div>
      <details class="bk-more"><summary class="fq-t-caption">모델 직접 고르기</summary><input id="gmodel" class="inp" placeholder="비우면 gemini-3.8-flash부터" value="${esc(S.gmodel)}" aria-label="제미나이 모델" style="margin-top:8px"></details></section>
    </div><div class="col">
    ${fwSection()}
    <section class="fq-card stack" style="gap:10px" aria-labelledby="sfH"><span class="fq-t-heading" id="sfH">효과음과 화면</span>
      <div class="chips"><button class="fq-chip" aria-pressed="${S.sound}" data-act="sound" data-v="1">소리 켜기</button><button class="fq-chip" aria-pressed="${!S.sound}" data-act="sound" data-v="0">끄기</button><button class="fq-chip" data-act="sfxTest">들어보기</button></div>
      <div class="chips">${[['auto', '운동 중만 어둡게'], ['light', '항상 밝게'], ['dark', '항상 어둡게']].map(t => `<button class="fq-chip" aria-pressed="${S.theme === t[0]}" data-act="theme" data-v="${t[0]}">${ico(t[0] === 'light' ? 'sun' : 'moon', 'ico--16')}${t[1]}</button>`).join('')}</div></section>
    ${bkSection(`<div class="grid2"><button class="fq-btn fq-btn--secondary" data-act="export">파일로 내보내기</button><label class="fq-btn fq-btn--secondary" style="position:relative">파일 불러오기<input type="file" id="importFile" accept="application/json,.json" style="position:absolute;inset:0;opacity:0"></label></div>
      <button class="linkbtn ink" data-act="phExport">${ico('image', 'ico--16')}몸 사진 jpg로 내보내기</button>`)}
    </div>
    <section class="fq-card danger" aria-labelledby="rsH"><span><span class="fq-t-heading" id="rsH">초기화</span><span class="fq-t-caption">모든 기록, 레벨, 몸 사진을 지워요. 먼저 백업하세요.</span></span><button class="fq-btn fq-btn--ghost" data-act="resetAsk" style="--_fg:var(--red-ink)">전체 초기화</button></section>
    </div>
    <p class="note center">FITQUEST v0.2 · 운동 사진 free-exercise-db(퍼블릭 도메인)</p>`;
  $('#importFile').addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try { const d = JSON.parse(await f.text()); if (!d || d.v !== 1 || !d.profile) throw 0; DB = d; save(); toast('<span>불러왔어요.</span>'); go('home'); } catch (err) { toast('<span>FITQUEST 백업 파일이 아니에요.</span>'); }
  });
};
/* 하루 운동 바꾸기: 이번 주 줄 요일 · 운동 목록 "바꾸기" 에서 열림. 고르면 그날 overrides → tplFor 한 길 (줄·홈·달력·기록 모두 같음).
   규칙을 깨도 막지 않음 — 고정 안 된 옆 날은 weekPlan 이 알아서 바꾸고, 그걸 한 줄로 알려 줌 */
const dayName = d => d === dayKey() ? '오늘' : `${DOW[dow(d)]}요일`;
const shortKo = t => TPL[t].by ? TPL[t].ko.replace(TPL[t].by + ' · ', '') : TPL[t].ko;
function defPick(k, part) {   // 그 부위에서 로테이션(없으면 주간 루틴)이 고를 루틴
  const d = dow(k), s = DB.schedule[d], c = rotCands(part);
  if (DB.rot && DB.rot.on && DB.rot.slots[d] === part) return rotFor(k);
  return TPL[s] && partOf(s) === part ? s : c[(DB.rot ? rotWeek(k) : 0) % c.length];
}
function dayImpact(k, t) {   // k 를 t('rest' 포함)로 바꾸면: 자동으로 바뀌는 날 · 그래도 남는 겹침 — 한 줄
  const mon = mondayOf(k), days = Array.from({ length: 9 }, (_, i) => addDays(mon, i - 1)).filter(d => d !== k), P = x => x ? PART_NAME[partOf(x)] : '휴식';
  const was = DB.overrides[k], before = days.map(d => tplFor(d)); DB.overrides[k] = t;
  const today = dayKey(), did = d => DB.sessions.find(s => s.day === d), pt = d => d < today ? did(d) && partOf(did(d).tpl, did(d).ex) : tplFor(d) && partOf(tplFor(d));   // 지난 날은 실제로 한 운동
  const after = days.map(d => tplFor(d)), p = t !== 'rest' && partOf(t), same = [addDays(k, -1), addDays(k, 1)].filter(d => p && pt(d) === p);
  const legs = [0, 1, 2, 3, 4, 5, 6].filter(i => { const x = tplFor(addDays(mon, i)); return x && partOf(x) === 'legs'; }).length;
  if (was === undefined) delete DB.overrides[k]; else DB.overrides[k] = was;
  const moved = days.map((d, i) => d >= today && P(before[i]) !== P(after[i]) ? `${dayName(d)} ${P(before[i])} → ${P(after[i])}` : '').filter(Boolean);
  return [moved.length ? `자동 조정: ${moved.join(', ')}` : '', same.length ? `${same.map(dayName).join('·')}도 ${PART_NAME[p]}예요 (고정했거나 이미 한 날이라 그대로)` : '', legs > 2 ? `이번 주 하체 ${legs}번이에요` : ''].filter(Boolean).join('. ');
}
function dayEditSheet(k, part) {
  const today = dayKey(), cur = tplFor(k), q = part || (cur ? partOf(cur) : DB.rot && DB.rot.slots[dow(k)] || 'back'), def = defPick(k, q);
  const list = [def, ...partCands(q, def)].filter(t => t && TPL[t]), imp = def ? dayImpact(k, def) : '', ov = k in DB.overrides;
  const row = (d, t) => `<div><span class="fq-t-label">${d === today ? '오늘' : `${+d.slice(5, 7)}/${+d.slice(8)} ${DOW[dow(d)]}요일`}</span><span class="fq-t-caption">${t ? `${PART_NAME[partOf(t)]} · ${esc(shortKo(t))}` : '휴식'}</span></div>`;
  sheet(`<div class="row row--between"><h2 class="fq-t-title">${dayName(k)} 운동 바꾸기</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <div class="list">${k !== today ? row(today, tplFor(today)) : ''}${row(k, cur)}</div>
    <div class="chips day-parts" role="group" aria-label="부위">${['back', 'chest', 'shoulder', 'legs', 'arms', 'full'].map(p => `<button class="fq-chip" aria-pressed="${p === q}" data-act="dayPart" data-k="${k}" data-v="${p}">${PART_NAME[p]}</button>`).join('')}</div>
    ${imp ? `<p class="note day-imp" style="margin:0">${imp}</p>` : ''}
    ${list.map((t, i) => `<button class="pro-card" data-act="daySet" data-k="${k}" data-t="${t}"><div class="who"><span class="chip${i ? '' : ' rd'}">${i ? esc(TPL[t].code) : '추천'}</span>${t === cur ? '<span class="chip">지금</span>' : ''}<span class="fq-t-caption">${esc(TPL[t].by || '기본 V자 루틴')}</span></div><h4>${esc(shortKo(t))}</h4></button>`).join('')}
    <div class="${ov ? 'grid2' : 'stack'}"><button class="fq-btn fq-btn--secondary" data-act="daySet" data-k="${k}" data-t="rest">${ico('moon')}쉬기</button>${ov ? `<button class="fq-btn fq-btn--secondary" data-act="dayClear" data-k="${k}">${ico('repeat')}되돌리기</button>` : ''}</div>`);
}
function scheduleSheet() {
  const on = DB.rot && DB.rot.on, k = dayKey(), mon = mondayOf(k);
  if (!DB.rot) DB.rot = rotFromDays(Object.keys(DB.schedule).map(Number));
  const partChip = (d, v, l) => `<button class="fq-chip" style="padding:0 12px" aria-pressed="${(DB.rot.slots[d] || '') === v}" data-act="slot" data-d="${d}" data-v="${v}">${l}</button>`;
  const preview = w => [1, 2, 3, 4, 5, 6, 0].map(d => { const day = addDays(mon, ((d + 6) % 7) + w * 7), t = tplFor(day), y = tplFor(addDays(day, -1)); return `<div><span class="fq-t-label">${DOW[d]}</span><span class="fq-t-caption" style="text-align:right">${t ? esc(TPL[t].ko) : '휴식'}${DB.pins && DB.pins[d] ? ' · 고정' : ''}${t && y && partOf(t) === partOf(y) ? ' · 어제와 같은 부위' : ''}</span></div>`; }).join('');
  const clash = [1, 2, 3, 4, 5, 6, 0].filter(pinClash).map(d => DOW[d]);
  sheet(`<div class="row row--between"><h2 class="fq-t-title">주간 루틴</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <div class="chips"><button class="fq-chip" aria-pressed="${!!on}" data-act="rotOn" data-v="1">매주 바뀌는 로테이션</button><button class="fq-chip" aria-pressed="${!on}" data-act="rotOn" data-v="0">고정 루틴</button></div>
    ${on ? `<p class="note" style="margin:0">요일마다 부위만 정하면, 매주 기본 V자 루틴과 이도황·제로범·조정현 루틴을 돌아가며 넣어요. 같은 부위는 3주에 한 번꼴로 같은 루틴이 돌아와요.</p>
      ${[1, 2, 3, 4, 5, 6, 0].map(d => `<div class="stack" style="gap:6px"><span class="fq-t-label">${DOW[d]}요일</span><div class="chips">${partChip(d, '', '휴식')}${Object.entries(PART_NAME).map(([v, l]) => partChip(d, v, l)).join('')}</div></div>`).join('')}
      <span class="fq-t-heading">이번 주</span><div class="list">${preview(0)}</div><span class="fq-t-heading">다음 주</span><div class="list">${preview(1)}</div>`
    : `${[1, 2, 3, 4, 5, 6, 0].map(d => `<div class="stack" style="gap:6px"><span class="fq-t-label">${DOW[d]}요일 · 지금 ${DB.schedule[d] ? esc(TPL[DB.schedule[d]].ko) : '휴식'}</span><div class="chips">${[['', '휴식'], ...Object.entries(TPL).map(([kk, t]) => [kk, t.by ? `${t.by.split('·')[0]} ${t.code}` : t.code])].map(([kk, l]) => `<button class="fq-chip" style="padding:0 12px" aria-pressed="${(DB.schedule[d] || '') === kk}" data-act="sched" data-d="${d}" data-v="${kk}">${l}</button>`).join('')}</div></div>`).join('')}`}
    ${clash.length ? `<p class="note" style="margin:0">${clash.join('·')}요일 고정 루틴이 옆 요일과 같은 부위예요. 같은 부위를 이틀 연속 하면 회복이 모자라서, 고정 안 한 옆 날은 다른 부위로 바꿔 넣어요.</p>` : ''}
    ${DB.pins && Object.keys(DB.pins).length ? `<button class="fq-btn fq-btn--ghost fq-btn--block" data-act="unpin">요일 고정 ${Object.keys(DB.pins).length}개 풀기</button>` : ''}`);
}
function pickTplSheet() {
  sheet(`<div class="row row--between"><h2 class="fq-t-title">어떤 루틴을 할까요?</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    ${Object.entries(TPL).map(([k, t]) => `<button class="pro-card" data-act="pickGo" data-t="${k}"><div class="who"><span class="chip">${t.code}</span>${t.by ? `<span class="fq-t-caption">${esc(t.by)}</span>` : ''}</div><h4>${t.ko}</h4><span class="fq-t-caption">${t.ex.map(([id]) => EX[id].n).join(' · ')}</span></button>`).join('')}`);
}
/* 뭐 먹지 추천: 남은 목표(다음 끼니 nt · 남은 칼로리)에 가까운 순 */
function wtePicks(cat) {
  const T = targets(), S = daySum(), { left, nt } = nextTarget();
  const remK = T.kcal - S.k, share = Math.max(.35, Math.min(1, nt / Math.max(1, left)));
  const mP = nt || left || 20, mK = Math.max(150, remK * share);
  const score = x => 2 * Math.min(1, x.p / mP) + Math.min(1, x.k / mK) - 3 * Math.max(0, (x.k - mK) / mK);
  const late = hm() >= 1260 && remK < 800, pool = WTE.filter(x => !late || x.k <= 600);
  if (!cat && lunchOut() && slotAt() === lunchIdx() && !slotSum(lunchIdx())) return LUNCH.slice(0, 3).map(x => ({ ...x, cat: '회사 점심' }));
  return (cat ? [cat] : WTE_CATS).flatMap(c => pool.filter(x => x.cat === c).sort((a, b) => score(b) - score(a)).slice(0, cat ? 3 : 1));
}
const WTE_CATS = ['편의점', '배달', '집밥'];
/* 1004 사용자: 아침·점심·저녁을 어떻게 먹어야 다 채우는지 — 최근 2주 내 기록을 끼니별로 분석해서
   ① 끼니별 평소 단백질 vs 목표(어디가 모자란지) ② 오늘 끼니마다: 평소 먹는 것 + 모자란 만큼 더할 음식(내가 먹어 본 것 먼저) */
let PLAN = [];
function planHist() {
  const k = dayKey(), n = mealNames().length, days = Array.from({ length: 14 }, (_, i) => addDays(k, -(i + 1))).filter(d => dayFoods(d).length);
  const avg = Array(n).fill(0), cnt = Array(n).fill(0), usual = Array.from({ length: n }, () => ({})), mine = {};
  days.forEach(d => { for (let i = 0; i < n; i++) { const fs = dayFoods(d).filter(f => f.slot === i); if (!fs.length) continue; avg[i] += fs.reduce((a, f) => a + f.p, 0); cnt[i]++; fs.forEach(f => { const u = usual[i][f.n] = usual[i][f.n] || { n: f.n, p: 0, k: 0, cnt: 0 }; u.p += f.p; u.k += f.k; u.cnt++; }); } });
  DB.foods.filter(f => f.est !== 'w' && f.p > 0).forEach(f => { const m = mine[f.n] = mine[f.n] || { n: f.n, p: 0, k: 0, cnt: 0, own: 1 }; m.p += f.p; m.k += f.k; m.cnt++; });
  const avgOf = o => ({ n: o.n, p: Math.round(o.p / o.cnt), k: Math.round(o.k / o.cnt), cnt: o.cnt, own: o.own });
  return { days: days.length, avg: avg.map((v, i) => cnt[i] ? Math.round(v / cnt[i]) : null),
    usual: usual.map((u, i) => Object.values(u).filter(x => x.cnt >= 2 && x.cnt >= cnt[i] * .5).map(avgOf).sort((a, b) => b.cnt - a.cnt).slice(0, 3)),   // 그 끼니에 절반 넘는 날 먹은 것 = 습관
    mine: Object.values(mine).map(avgOf).filter(x => x.p >= 6) };
}
function planAddOns(need, H, used) {   // 모자란 g 에 가장 잘 맞는 음식 1~2개: 내가 먹어 본 것 우선, 단백질 많고 칼로리 적은 것
  const pool = H.mine.concat(BASE_FAVS, WTE.filter(w => w.cat !== '배달')).filter(x => x.p >= 6 && !used.has(x.n));
  const seen = new Set(), uniq = pool.filter(x => !seen.has(x.n) && seen.add(x.n));
  const score = (x, r) => -Math.abs(r - x.p) / Math.max(10, r) + (x.own ? .35 : 0) + Math.min(.4, x.p / Math.max(60, x.k) * 1.5) - (x.p > r + 15 ? .4 : 0);
  const out = []; let r = need;
  for (let t = 0; t < 2 && r >= 6; t++) { const best = uniq.filter(x => !out.includes(x)).sort((a, b) => score(b, r) - score(a, r))[0]; if (!best) break; out.push(best); r -= best.p; }
  return out;
}
function planCard(attrs = '') {
  const T = targets(), tgs = mealTargets(T), names = mealNames(), H = planHist(), now = slotAt(), li = lunchOut() ? lunchIdx() : -1;
  PLAN = [];
  const gapI = H.avg.map((v, i) => v == null ? null : tgs[i] - v), worst = gapI.reduce((m, g, i) => g != null && g > 8 && (m < 0 || g > gapI[m]) ? i : m, -1);
  const ana = H.days >= 3 ? `<div class="mp-ana" role="img" aria-label="최근 2주 끼니별 평균 단백질">${names.map((nm, i) => { const v = H.avg[i], tg = tgs[i], w = v == null ? 0 : Math.min(100, v / Math.max(1, tg) * 100);
      return `<span class="mp-a${v != null && v >= tg - 8 ? ' ok' : ''}"><b>${nm}</b><i style="--w:${w.toFixed(0)}"></i><small class="num">${v == null ? '기록 없음' : `${v}/${tg}g`}</small></span>`; }).join('')}</div>
      <p class="fq-t-caption mp-sum">최근 ${H.days}일 평균${worst >= 0 ? ` · <b>${names[worst]}</b>이 평소 ${gapI[worst]}g 모자라요` : ' · 끼니별로 잘 채우고 있어요'}</p>`
    : `<p class="fq-t-caption">3일 이상 기록하면 끼니별로 어디가 모자란지 분석해 드려요.</p>`;
  const rows = names.map((nm, i) => {
    const got = Math.round(slotSum(i)), tg = tgs[i], need = tg - got, past = i < now;
    if (need <= 5) return `<div class="mp-row ok"><span class="mp-h"><b>${nm}</b><small class="num">${got}/${tg}g</small></span><p class="mp-t">${ico('check', 'ico--14')}채웠어요</p></div>`;
    if (past && got > 0) return `<div class="mp-row past"><span class="mp-h"><b>${nm}</b><small class="num">${got}/${tg}g</small></span><p class="mp-t">지나간 끼니 · 모자란 ${need}g은 다음 끼니로 넘겼어요</p></div>`;
    const used = new Set(), base = [];
    if (i === li) { const l = LUNCH[0]; return `<div class="mp-row"><span class="mp-h"><b>${nm}</b><small class="num">${got}/${tg}g</small></span><p class="mp-t">회사 점심 · ${riceTip()}</p><div class="mp-c"><button class="mp-f" data-act="lunch" data-n="${esc(l.n)}"><span>${esc(l.n)}</span><b class="num">${l.p}g</b></button></div></div>`; }
    let sum = got; H.usual[i].forEach(u => { if (sum + u.p <= tg + 10 && !dayFoods().some(f => f.slot === i && f.n === u.n)) { base.push(u); used.add(u.n); sum += u.p; } });
    const adds = planAddOns(tg - sum, H, used), item = (x, tag) => { PLAN.push({ ...x, slot: i }); return `<button class="mp-f${tag ? ' more' : ''}" data-act="planAdd" data-i="${PLAN.length - 1}" aria-label="${esc(x.n)} ${x.p}g ${nm}에 기록"><span>${tag ? '+ ' : ''}${esc(x.n)}</span><b class="num">${x.p}g</b></button>`; };
    const tot = sum + adds.reduce((a, x) => a + x.p, 0);
    return `<div class="mp-row${i === now ? ' now' : ''}"><span class="mp-h"><b>${nm}</b><small class="num">${got ? `${got}g 먹음 · ` : ''}목표 ${tg}g</small></span>
      <p class="mp-t">${[got ? `지금 ${got}g` : '', base.length ? '평소 메뉴' : ''].filter(Boolean).join(' + ')}${adds.length ? `${got || base.length ? ' + ' : ''}<b>${adds.map(x => x.n).join(' + ')}</b>` : ''} → <b class="num">${Math.round(tot)}g</b>${tot >= tg - 5 ? ' 채워요' : ` (${Math.round(tg - tot)}g 모자람)`}</p>
      <div class="mp-c">${base.map(x => item(x, 0)).join('')}${adds.map(x => item(x, 1)).join('')}</div></div>`;
  }).join('');
  return `<section class="tile card-pad plan" ${attrs} aria-labelledby="plH"><div class="card-h"><h2 class="fq-t-heading" id="plH">끼니별로 이렇게 채워요</h2><span class="fq-t-caption">내 기록 분석</span></div>${ana}<div class="mp-rows">${rows}</div><p class="fq-t-caption">누르면 그 끼니에 바로 기록돼요 · 파란 칸 = 더 먹으면 좋은 것</p></section>`;
}
function wteSheet(cat) {
  const T = targets(), S = daySum(), { left, nt } = nextTarget(), remK = T.kcal - S.k, picks = wtePicks(cat), cats = WTE_CATS;
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
  sheet(`<div class="row row--between"><span class="chip">${esc(r.creator)}</span><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <h2 class="fq-t-title">${esc(r.title)}</h2><p class="fq-t-caption" style="margin:-6px 0 0">${esc(r.sub || '')}</p>
    ${r.tips && r.tips.length ? `<section class="fq-card stack"><span class="fq-eyebrow">크리에이터 핵심 팁</span>${r.tips.map(t => `<span class="fq-t-body" style="font-size:15px">· ${esc(t)}</span>`).join('')}</section>` : ''}
    <div class="pro-ex">${r.ex.map((e, j) => `<div><span class="num muted">${j + 1}</span><span><b>${esc(e.n)}</b><small>${esc(e.how || '')}</small></span><span class="fq-t-label">${esc(e.sr || '')}</span></div>`).join('')}</div>
    <div class="src">${ico('ext', 'ico--16')}<span>출처: ${r.videos.map(v => `<a href="${v.u}" target="_blank" rel="noopener">${esc(v.t)}</a>`).join(', ')}</span></div>
    ${r.tpl ? `<button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="proGo" data-t="${r.tpl}">이 루틴으로 지금 운동하기</button><button class="fq-btn fq-btn--secondary fq-btn--block" data-act="proDay" data-t="${r.tpl}">요일에 고정하기</button>` : '<p class="note" style="margin:0">이 공략서는 요일마다 조금씩 섞어 쓰는 계획이에요. 로테이션의 어깨날에 이도황 20분 어깨 루틴이 들어가요.</p>'}
    <p class="note" style="margin:0">영상 자막과 화면을 보고 정리했어요. 영상에서 말하지 않은 세트·횟수는 앱 기본값으로 채워요. 로테이션을 켜 두면 이 루틴도 몇 주에 한 번씩 자동으로 들어와요.</p>`);
}

/* ================= events ================= */
document.addEventListener('click', ev => {
  const g = ev.target.closest('[data-go]'); if (g) { closeSheet(); SFX.tap(); if (g.dataset.go === 'cam' && g.closest('.tabbar')) { FR = null; go('cam'); const f = $('#foodPhoto'); if (f) f.click(); return; } go(g.dataset.go); return; }   // 가운데 기록 버튼 = 카메라 바로 열기 (1탭)
  const a = ev.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act, k = dayKey(), pickSlot = () => { if (a.dataset.slot) SLOT_PICK = +a.dataset.slot; };   // 식단 빈 끼니의 버튼은 그 끼니로
  const H = {
    close: closeSheet,
    slotPick: () => sheet(`<div class="row row--between"><h2 class="fq-t-title">어느 끼니예요?</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
      <div class="chips">${mealNames().map((n, i) => `<button class="fq-chip" aria-pressed="${i === curSlot()}" data-act="slotSet" data-i="${i}">${n}</button>`).join('')}<button class="fq-chip" aria-pressed="${SLOT_PICK == null}" data-act="slotSet" data-i="">시간으로 자동</button></div>`),
    slotSet: () => { SLOT_PICK = a.dataset.i === '' ? null : +a.dataset.i; closeSheet(); document.querySelectorAll('.slot-chip').forEach(c => { c.outerHTML = slotChip(); }); if (FR) drawResult(); },
    calOpen: () => { CAL = dayKey().slice(0, 7); calSheet(); }, calDay: () => calDaySheet(a.dataset.k), calBack: () => calSheet(true),
    calNav: () => { CAL = ymAdd(CAL, +a.dataset.n); calSheet(true); $(`.sheet [data-act=calNav][data-n="${a.dataset.n}"]`).focus(); },
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
      $('#obResult').scrollIntoView({ behavior: RM() ? 'auto' : 'smooth', block: 'start' });
    },
    obStart: () => { DB.profile.chapter = +a.dataset.c; DB.profile.chapterStart = dayKey(); delete DB.flags.obDraft; DB.streak.last = addDays(dayKey(), -1); DB.weights[dayKey()] = DB.inbody[0].w; save(); SFX.start(); go('home'); toast('<span>시작했어요! 첫 할 일은 단백질이에요.</span>'); },
    wte: () => wteSheet(), wteCat: () => wteSheet(a.dataset.c === '전체' ? null : a.dataset.c),
    logWte: () => { closeSheet(); addFood(WTE.find(w => w.n === a.dataset.n)); },
    planAdd: () => { const x = PLAN[+a.dataset.i]; if (x) addFood({ n: x.n, p: x.p, k: x.k, c: x.own ? 0 : x.c || 0, f: x.own ? 0 : x.f || 0 }, null, x.slot); },
    rescue: () => { const { nt } = nextTarget(), r = RESCUE.find(q => nt <= q[0]); addFood({ n: r[1], p: r[2], k: r[3], c: 12, f: 4 }, 'rescue'); },
    fav: () => { closeSheet(); addFood(favList()[+a.dataset.i]); },
    snap: () => { pickSlot(); closeSheet(); FR = null; go('cam'); $('#foodPhoto').click(); },   // 식단 "사진" → 카메라 탭 + 카메라 바로 열기
    mealAdd: () => mealAddSheet(+a.dataset.slot), d3: () => d3Sheet(),
    portion: () => { const nm = $('#frName'); FR.name = nm ? nm.value : ''; FR.pick = +a.dataset.g; R.cam(); },
    savePortion: () => { const p = PORTIONS.find(x => x[0] === FR.pick) || PORTIONS[1], nm = ($('#frName').value || '').trim() || '사진 기록'; FR = null; addFood({ n: nm, p: p[0], k: p[2] }); },
    ach: () => achSheet(+a.dataset.i),
    favs: () => { pickSlot(); sheet(`<div class="row row--between"><h2 class="fq-t-title">단골 · 1탭 기록</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
      <p class="fq-t-caption" style="margin:-6px 0 0">${mealNames()[curSlot()]}에 기록돼요 · 3번 먹으면 자동으로 단골이 돼요</p>${favRow()}`); },
    delFood: () => { DB.foods = DB.foods.filter(f => f.id !== a.dataset.id); save(); R[TAB](); },
    allLogged: () => { const key = 'all_' + k; if (a.checked && !DB.flags[key]) { DB.flags[key] = true; addXP('all', 20); toast('<span>완전 기록일 +20 XP · 정체기 진단이 정확해져요</span>'); } else if (!a.checked) delete DB.flags[key]; checkDaily3(); save(); showLevelUp(); },
    weigh: () => { const v = parseFloat((a.parentElement.querySelector('input').value || '').replace(',', '.')); if (!(v >= 30 && v <= 250)) return toast('<span>체중을 kg으로 넣어 주세요.</span>'); const first = !DB.weights[k]; DB.weights[k] = v; if (first) addXP('weight', 5); checkDaily3(); save(); SFX.food(); R[TAB] && R[TAB](); toast(`<span>${v}kg 기록${first ? ' <em>+5 XP</em>' : ''}</span>`); showLevelUp(); },
    textIn: () => { pickSlot(); sheet(`<h2 class="fq-t-title">글로 기록</h2><p class="fq-t-caption" style="margin:-6px 0 0">${mealNames()[curSlot()]}에 기록돼요. 이름만 적으면 단백질·칼로리는 알아서 채워요.</p>
      <label class="stack" for="tiName" style="gap:6px"><span class="fq-t-label">무엇을 먹었나요</span><input id="tiName" class="inp" placeholder="예: 닭가슴살 1팩, 현미밥 반 공기" enterkeyhint="done" autocomplete="off"></label>
      <details class="ti-more"><summary>${ico('chev', 'ico--16')}<span class="fq-t-label">직접 입력 (선택)</span></summary><div class="grid2"><label class="stack" for="tiP" style="gap:6px"><span class="fq-t-label">단백질 g</span><input id="tiP" class="inp" inputmode="numeric" placeholder="30"></label><label class="stack" for="tiK" style="gap:6px"><span class="fq-t-label">칼로리</span><input id="tiK" class="inp" inputmode="numeric" placeholder="모르면 비워요"></label></div></details>
      <button class="fq-btn fq-btn--lg fq-btn--block" data-act="textSave">기록하기</button>`); $('#tiName').focus(); },
    textSave: () => { if (!a.disabled) textSave(a); },
    foodEdit: () => foodEditSheet(a.dataset.id), foodSave: () => foodSave(a.dataset.id),
    ask: () => { FR.items[+a.dataset.i].q = +a.dataset.q; FR.asked = true; drawResult(); },
    qty: () => { FR.items[+a.dataset.i].q = +a.dataset.q; drawResult(); },
    saveFood: () => { const it = FR.items.filter(x => x.q > 0); const P = it.reduce((s, x) => s + x.p * x.q, 0), K = it.reduce((s, x) => s + x.k * x.q, 0), C = it.reduce((s, x) => s + x.c * x.q, 0), F = it.reduce((s, x) => s + x.f * x.q, 0); FR = null; addFood({ n: it.map(x => x.n).join(' · ').slice(0, 40) || '사진 기록', p: P, k: K, c: C, f: F }); },
    startQuest: () => qStart(), pickTpl: () => pickTplSheet(), pickGo: () => { closeSheet(); qStart(a.dataset.t); },
    cond: () => { buildSession(a.dataset.c, a.dataset.t || null); closeSheet(); SFX.start(); keepAwake(true); go('logger'); },
    postpone: () => { const t = tplFor(k), { ds, seq } = shiftPlan(k, t), N = (d, x) => `${DOW[dow(d)]}요일 ${PART_NAME[partOf(x)]} 운동은`, last = seq[ds.length];
      DB.flags['pp_' + mondayOf(k)] = true; save(); R.work();
      toast(`<span>오늘 ${PART_NAME[partOf(t)]} 운동은 ${DOW[dow(ds[0])]}요일로${ds[1] ? `, ${N(ds[0], seq[1])} ${DOW[dow(ds[1])]}요일로` : ''} 밀렸어요.${last ? ` ${N(ds[ds.length - 1], last)} 이번 주 쉬어요.` : ''}</span>`, 6000); },
    setDone: () => setDone(+a.dataset.j), undoSet: () => undoSet(+a.dataset.j),
    qDone: () => qDone(+a.dataset.i), qUndo: () => qUndo(+a.dataset.i), qPick: () => { W.pick = +a.dataset.i; save(); qView(); const c = document.querySelector('.qr.cur'); if (c) c.scrollIntoView({ block: 'start', behavior: RM() ? 'auto' : 'smooth' }); },
    'qw+': () => qStep(+a.dataset.i, 1), 'qw-': () => qStep(+a.dataset.i, -1),
    qsEd: () => { W.ex[+a.dataset.i].q.ed = true; qView(); },
    'qs+': () => { const q = W.ex[+a.dataset.i].q; q.n = Math.min(8, q.n + 1); qView(); }, 'qs-': () => { const q = W.ex[+a.dataset.i].q; q.n = Math.max(1, q.n - 1); qView(); },
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
    lunchSave: () => { const x = LUNCH.find(l => l.n === a.dataset.n), r = RICE[+a.dataset.r]; closeSheet(); addFood({ n: `${x.n}${+a.dataset.r === 1 ? '' : ' (' + r[0] + ')'}`, p: x.p + r[3], k: x.k + r[1], c: x.c + r[2], f: x.f }, null, lunchIdx()); },   // 점심 메뉴는 언제 눌러도 점심 칸
    crPick: () => crPickSheet(), crCard: () => crCard(a.dataset.v),
    crAdd: () => crAddSheet('', null), crLearn: () => crLearn(), crSave: () => crSave(),
    crKey: () => { const v = ($('#gkeyS').value || '').trim(); if (!/^AIza[\w-]{20,}$/.test(v)) return crAddSheet('키는 AIza 로 시작하는 긴 글자예요.'); DB.settings.gkey = v; save(); crAddSheet(); },
    crDel: () => { const id = a.dataset.v, c = DB.custom, cr = c.creators.find(x => x.id === id); (cr.tpls || []).forEach(k => { delete c.tpls[k]; delete TPL[k]; delete TPL_PARTS[k]; Object.keys(DB.pins || {}).forEach(d => { if (DB.pins[d] === k) delete DB.pins[d]; }); }); c.creators = c.creators.filter(x => x.id !== id); const i = CREATORS.findIndex(x => x.id === id); if (i >= 0) CREATORS.splice(i, 1); DB.profile.creators = (DB.profile.creators || []).filter(x => x !== id); save(); closeSheet(); R[TAB] && R[TAB](); toast('<span>지웠어요.</span>'); },
    crToggle: () => { const v = a.dataset.v, cur = DB.profile.creators || []; DB.profile.creators = cur.includes(v) ? cur.filter(x => x !== v) : cur.concat(v); save(); crPickSheet(); R[TAB] && R[TAB](); },
    proGo: () => { closeSheet(); qStart(a.dataset.t); },
    proDay: () => sheet(`<h2 class="fq-t-title">어느 요일에 고정할까요?</h2><p class="fq-t-caption" style="margin:-6px 0 0">${esc(TPL[a.dataset.t].ko)} · 로테이션과 상관없이 매주 이 요일은 이 루틴</p><div class="chips">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="fq-chip" style="min-width:52px;justify-content:center" data-act="proDaySet" data-d="${d}" data-t="${a.dataset.t}">${DOW[d]}</button>`).join('')}</div>`),
    proDaySet: () => { DB.pins = DB.pins || {}; DB.pins[+a.dataset.d] = a.dataset.t; save(); closeSheet(); R[TAB] && R[TAB](); toast(`<span>${DOW[+a.dataset.d]}요일은 ${esc(TPL[a.dataset.t].ko)}로 고정했어요${pinClash(+a.dataset.d) ? '. 옆 요일과 같은 부위라 옆 날은 다른 부위로 바꿔 넣어요' : ''}</span>`, 5000); },
    unpin: () => { DB.pins = {}; save(); scheduleSheet(); R[TAB] && R[TAB](); },
    rotOn: () => { if (!DB.rot) DB.rot = rotFromDays(Object.keys(DB.schedule).map(Number)); DB.rot.on = a.dataset.v === '1'; save(); scheduleSheet(); R[TAB] && R[TAB](); },
    slot: () => { const d = +a.dataset.d; if (a.dataset.v) DB.rot.slots[d] = a.dataset.v; else delete DB.rot.slots[d]; save(); scheduleSheet(); R[TAB] && R[TAB](); },
    pro: () => proSheet(+a.dataset.i), lib: () => libSheet(),
    howtoId: () => { const t = a.dataset.t && TPL[a.dataset.t], row = t && t.ex.find(x => x[0] === a.dataset.id), o = row && row[2] || {}; howSheet(a.dataset.id, { v: o.t, range: o.r, tip: o.tip ? { who: t.by, t: o.tip } : null }); },
    howtoEx: () => { const e = W.ex[+a.dataset.i]; howSheet(e.id, { v: e.v, range: e.range, tip: e.tip }); },
    dayEdit: () => dayEditSheet(a.dataset.k), dayPart: () => dayEditSheet(a.dataset.k, a.dataset.v),
    daySet: () => { const d = a.dataset.k, t = a.dataset.t, imp = dayImpact(d, t); DB.overrides[d] = t; save(); closeSheet(); R[TAB] && R[TAB]();
      toast(`<span>${dayName(d)}은 ${t === 'rest' ? '쉬어요' : esc(shortKo(t)) + '로 바꿨어요'}${imp ? `. ${imp}` : ''}</span>`, 5000); },
    dayClear: () => { delete DB.overrides[a.dataset.k]; save(); closeSheet(); R[TAB] && R[TAB](); toast(`<span>${dayName(a.dataset.k)}은 원래 계획으로 돌렸어요</span>`); },
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
    liftOpen: () => liftSheet(a.dataset.id),
    qAdd: () => qAddEx(a.dataset.id),
    qAltOpen: () => altSheet(+a.dataset.i), qAlt: () => qAlt(+a.dataset.i, a.dataset.id),
    shareCard: () => shareCard(),
    gymTog: () => { const k = a.dataset.k, off = gymOff().slice(), i = off.indexOf(k); if (i >= 0) off.splice(i, 1); else if (off.length < GYM.length - 1) off.push(k); else return toast('<span>기구를 하나는 남겨 주세요.</span>'); DB.settings.gymOff = off; save(); R.set(); },
    prof: () => { const kk = a.dataset.k, v = a.dataset.v; DB.profile[kk] = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v; save(); R.set(); },
    saveKey: () => { DB.settings.gkey = $('#gkey').value.trim(); DB.settings.gmodel = $('#gmodel').value.trim(); save(); toast('<span>저장했어요. 음식 기록에서 사진을 올려 보세요.</span>'); fillPending(); },
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
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'tiName' && !e.isComposing) $('[data-act=textSave]').click(); });   // 글로 기록: 엔터 = 기록하기
$('#lvl').addEventListener('click', e => { if (e.target === $('#lvl')) $('#lvl').close(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && DB.profile && !DB.flags.obDraft && TAB !== 'logger') { settleStreak(); R[TAB] && R[TAB](); bkAuto(); fwAuto(); fillPending(); } if (document.visibilityState === 'visible' && TAB === 'logger') keepAwake(true); });

/* ================= boot ================= */
Object.keys(R).forEach(k => { const f = R[k]; R[k] = (...a) => { const r = f(...a); flow(); return r; }; });   // 그릴 때마다 두 줄 다시 나눔
$('#lvl-coach').innerHTML = COACH_SVG;
applyTheme();
if (!DB.profile || DB.flags.obDraft) { DB.flags.obDraft = false; go('onb'); }
else { if (!DB.profile.creators) { DB.profile.creators = ['idohwang']; save(); } if (!DB.rot) { DB.rot = rotFromDays(Object.keys(DB.schedule).map(Number)); save(); } fixOldPostpone(); settleStreak();
  if (DB.live && DB.live.q && DB.live.day === dayKey()) { W = DB.live; go('logger'); toast('<span>하던 운동을 이어서 해요</span>'); } else { delete DB.live; go('home'); } loadPhotos().then(() => { if (TAB === 'home') R.home(); bkAuto(); fwAuto(); fillPending(); }); }
