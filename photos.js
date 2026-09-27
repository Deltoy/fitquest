"use strict";
/* 바디 기록 (docs/05-body-photos.md) — 사진은 IndexedDB(이 폰)에만 저장. 서버·AI 전송 없음. */
const POSES = [ /* 사용자 요청(0927): 너무 많으면 안 하게 됨 → 정면 1장만 */
  { id: 'front_relax', n: '정면', cue: '발은 어깨너비, 팔은 몸에서 주먹 하나 띄우고 힘 빼기. 매주 같은 자리·같은 거리' }
];
const REQ = POSES.filter(p => !p.opt).map(p => p.id);
const PH = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('fq-photos', 1);
      r.onupgradeneeded = () => { const s = r.result.createObjectStore('photos', { keyPath: 'id' }); s.createIndex('date', 'date'); s.createIndex('pose', 'pose'); };
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async run(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => { const t = db.transaction('photos', mode), req = fn(t.objectStore('photos')); t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('abort')); });
  },
  put(rec) { return this.run('readwrite', s => s.put(rec)); },
  del(id) { return this.run('readwrite', s => s.delete(id)); },
  clear() { return this.run('readwrite', s => s.clear()); },
  async all() { const r = await this.run('readonly', s => s.getAll()); return (r || []).sort((a, b) => a.createdAt - b.createdAt); }
};
let PHOTOS = []; // cache
const urls = new Map();
const pURL = r => { if (!urls.has(r.id + r.createdAt)) urls.set(r.id + r.createdAt, URL.createObjectURL(r.blob)); return urls.get(r.id + r.createdAt); };
async function loadPhotos() { try { PHOTOS = await PH.all(); } catch (e) { PHOTOS = []; } return PHOTOS; }
const weekOf = date => mondayOf(date);
const byPose = pose => PHOTOS.filter(p => p.pose === pose);
function photoWeeks() {
  const w = {}; PHOTOS.forEach(p => { const k = weekOf(p.date); (w[k] = w[k] || {})[p.pose] = p; });
  return Object.entries(w).sort((a, b) => a[0] < b[0] ? -1 : 1);
}
function thisWeekDone() { const k = weekOf(dayKey()); return PHOTOS.filter(p => weekOf(p.date) === k).map(p => p.pose); }

function toJpeg(src, w, h, mirror) {
  const s = Math.min(1, 1280 / Math.max(w, h)), c = document.createElement('canvas');
  c.width = Math.round(w * s); c.height = Math.round(h * s);
  const g = c.getContext('2d'); if (mirror) { g.translate(c.width, 0); g.scale(-1, 1); }
  g.drawImage(src, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(b => res({ blob: b, w: c.width, h: c.height }), 'image/jpeg', .8));
}
function fileToJpeg(file) {
  return new Promise((res, rej) => { const img = new Image(); img.onload = () => toJpeg(img, img.naturalWidth, img.naturalHeight, false).then(res); img.onerror = () => rej(new Error('사진을 열 수 없어요')); img.src = URL.createObjectURL(file); });
}
function snapMetrics() {
  const t = DB.tape[DB.tape.length - 1];
  return { weight: +curWeight().toFixed(1), pbf: ib().pbf, smm: ib().smm, vRatio: vRatio() ? +vRatio().toFixed(2) : null, waist: t ? t.wa : null, chapter: DB.profile.chapter, chapterWeek: chapterWeek() };
}
const metricsLine = m => m ? `${m.weight}kg · 체지방 ${m.pbf}% · 골격근 ${m.smm}kg${m.vRatio ? ` · V ${m.vRatio}` : ''}${m.waist ? ` · 허리 ${m.waist}cm` : ''}` : '';

/* ---------- 성장 탭 섹션 & 홈 카드 ---------- */
function photoSection() {
  const weeks = photoWeeks(), blur = DB.settings.blurPhotos !== false;
  const cover = set => set.front_lat || set.front_relax || set.side || set.back_lat;
  return `<section class="fq-card stack" style="gap:12px" aria-label="바디 기록" id="bodyLog">
    <div class="row row--between"><span class="fq-t-heading">바디 기록</span><button class="fq-chip" style="min-height:40px" aria-pressed="${blur}" data-act="phBlur">${blur ? '가리기 켜짐' : '가리기'}</button></div>
    ${weeks.length ? `<div class="ph-strip ${blur ? 'is-blur' : ''}">${weeks.map(([wk, set]) => { const c = cover(set); return `<button class="ph-cell" data-act="phCmp" data-w="${wk}" aria-label="${wk} 주 사진"><img src="${pURL(c)}" alt=""><span>${kDate(wk).getMonth() + 1}/${kDate(wk).getDate()}</span><small>${c.metrics ? c.metrics.weight + 'kg · ' + c.metrics.pbf + '%' : ''}</small></button>`; }).join('')}</div>`
      : `<p class="fq-t-caption" style="margin:0">매주 일요일 아침, 정면 1장이면 끝. 느린 변화도 사진은 기억해요.</p>`}
    <div class="grid2"><button class="fq-btn fq-btn--secondary" data-act="phShoot">촬영하기</button><button class="fq-btn fq-btn--secondary" data-act="phCmp">비교하기</button></div>
    <p class="fq-t-caption" style="margin:0">사진은 이 폰에만 저장돼요. 어디에도 올라가지 않아요.</p></section>`;
}
function photoHomeCard() {
  const k = dayKey(), done = thisWeekDone(), left = REQ.filter(p => !done.includes(p));
  if (!left.length || (dow(k) !== 0 && !(dow(k) === 1 && done.length === 0 && PHOTOS.length))) return '';
  return `<section class="fq-card row row--between" aria-label="이번 주 몸 기록"><div class="stack" style="gap:4px"><span class="fq-t-heading">이번 주 몸 기록</span><span class="fq-t-caption">아침 공복에 정면 1장 · +30 XP</span></div><button class="fq-btn fq-btn--secondary" data-act="phShoot">촬영</button></section>`;
}

/* ---------- 촬영 화면 ---------- */
const SH = { pose: 'front_relax', facing: 'environment', stream: null, shot: null, timer: 0, neck: true };
async function renderShoot() {
  await loadPhotos();
  const done = thisWeekDone();
  if (!POSES.some(p => p.id === SH.pose) || (done.includes(SH.pose) && !SH.keep)) SH.pose = (POSES.find(p => !done.includes(p.id)) || POSES[0]).id;
  SH.keep = false;
  const pose = POSES.find(p => p.id === SH.pose), prev = byPose(SH.pose).filter(p => p.date !== dayKey()).pop();
  const firstThisWeek = !done.length;
  $('#scr-shoot').innerHTML = `
    <div class="shoot">
      <div class="shoot-top">
        <button class="fq-btn fq-btn--icon" data-act="phClose" aria-label="닫기" style="--_bg:rgba(0,0,0,.5);--_fg:#fff">${ico('x')}</button>
        <div class="shoot-poses" role="tablist" ${POSES.length < 2 ? 'hidden' : ''}>${POSES.map(p => `<button class="fq-chip ph-pose" role="tab" aria-selected="${p.id === SH.pose}" data-act="phPose" data-p="${p.id}">${done.includes(p.id) ? '✓ ' : ''}${p.n}</button>`).join('')}</div>
      </div>
      ${firstThisWeek && !SH.shot ? `<div class="shoot-check">정면 1장 · 같은 자리 · 같은 조명 · 아침 공복</div>` : ''}
      <div class="shoot-stage" id="stage">
        ${SH.shot ? `<img class="shoot-shot" src="${URL.createObjectURL(SH.shot.blob)}" alt="방금 찍은 사진">`
          : `<video id="camv" playsinline muted autoplay ${SH.facing === 'user' ? 'class="mirror"' : ''}></video>
             ${prev ? `<img class="shoot-ghost ${SH.facing === 'user' ? 'mirror' : ''}" src="${pURL(prev)}" alt="">` : ''}
             <svg class="shoot-guide" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true"><path d="M50 4V156" stroke-dasharray="2 3"/><path d="M14 46H86"/><path d="M8 152H92"/>${SH.neck ? '<path d="M20 30H80" stroke-dasharray="4 2"/>' : ''}</svg>
             <div class="shoot-count" id="count" hidden></div>
             <p class="shoot-cam-msg" id="camMsg" hidden></p>`}
      </div>
      <p class="shoot-cue">${SH.shot ? metricsLine(snapMetrics()) : prev ? '반투명한 지난 사진에 맞춰 서 보세요' : '첫 기록이에요. 다음 주부터 비교가 열려요'} <br><span>${pose.cue}</span></p>
      ${SH.shot ? '' : `<div class="shoot-tools"><button class="fq-chip ph-mini" aria-pressed="${SH.timer === 3}" data-act="phTimer">${SH.timer ? '타이머 3초' : '타이머 끔'}</button><button class="fq-chip ph-mini" aria-pressed="${SH.neck}" data-act="phNeck">목 아래만</button><span class="fq-t-caption" style="color:#C8C8CC">${SH.facing === 'user' ? '전면' : '후면'} 카메라</span></div>`}
      <div class="shoot-dock">
        ${SH.shot ? `<button class="fq-btn fq-btn--secondary" data-act="phRetake">다시 찍기</button><button class="fq-btn fq-btn--signal fq-btn--lg" data-act="phSave">저장</button>`
          : `<label class="fq-btn fq-btn--icon" style="position:relative;--_bg:rgba(255,255,255,.12);--_fg:#fff" aria-label="갤러리에서 고르기">${ico('image')}<input type="file" accept="image/*" id="phFile" style="position:absolute;inset:0;opacity:0"></label>
             <button class="shutter-btn" data-act="phSnap" aria-label="촬영"></button>
             <button class="fq-btn fq-btn--icon" data-act="phFlip" aria-label="${SH.facing === 'user' ? '후면' : '전면'} 카메라로 바꾸기" style="--_bg:rgba(255,255,255,.12);--_fg:#fff">${ico('swap')}</button>`}
      </div>
    </div>`;
  const f = $('#phFile'); if (f) f.addEventListener('change', async e => { const file = e.target.files && e.target.files[0]; if (!file) return; stopCam(); SH.shot = await fileToJpeg(file); renderShoot(); });
  if (!SH.shot) startCam();
}
async function startCam() {
  const v = $('#camv'); if (!v) return;
  const msg = t => { const m = $('#camMsg'); if (m) { m.hidden = false; m.textContent = t; } };
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return msg('이 브라우저는 카메라를 못 열어요. 왼쪽 아래 갤러리에서 사진을 골라도 돼요');
  try {
    stopCam();
    SH.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: SH.facing, width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false });
    v.srcObject = SH.stream; await v.play().catch(() => {});
  } catch (e) { msg('카메라 권한이 꺼져 있어요. 갤러리에서 사진을 골라도 돼요'); }
}
function stopCam() { if (SH.stream) { SH.stream.getTracks().forEach(t => t.stop()); SH.stream = null; } }
async function snap() {
  const v = $('#camv'); if (!v || !v.videoWidth) return toast('<span>카메라가 아직 준비 중이에요.</span>');
  if (SH.timer) {
    const c = $('#count'); c.hidden = false;
    for (let n = SH.timer; n > 0; n--) { c.textContent = n; SFX.tap(); buzz(20); await new Promise(r => setTimeout(r, 1000)); if (!$('#camv')) return; }
    c.hidden = true;
  }
  SH.shot = await toJpeg(v, v.videoWidth, v.videoHeight, SH.facing === 'user');
  tone([[1568, .03], [0, .02], [1175, .05]], 'square', .05); buzz(30);
  stopCam(); renderShoot();
}
async function savePhoto() {
  const date = dayKey(), rec = { id: `${date}_${SH.pose}`, date, pose: SH.pose, blob: SH.shot.blob, w: SH.shot.w, h: SH.shot.h, sizeKB: Math.round(SH.shot.blob.size / 1024), createdAt: Date.now(), metrics: snapMetrics() };
  try { await PH.put(rec); } catch (e) { return toast(e && e.name === 'QuotaExceededError' ? '<span>사진 저장 공간이 가득 찼어요. 오래된 사진을 내보내거나 지워 주세요</span>' : '<span>사진을 저장하지 못했어요. 다시 시도해 주세요</span>', 5000); }
  SH.shot = null; await loadPhotos();
  const wk = weekOf(date), done = thisWeekDone();
  let xp = 0;
  if (REQ.every(p => done.includes(p)) && !DB.flags['ph_' + wk]) { DB.flags['ph_' + wk] = 1; DB.xp += 30; xp += 30; }
  const L = levelOf(DB.xp); if (xp && L > levelOf(DB.xp - xp)) pendingLevel = L;
  save(); SFX.food();
  const next = POSES.find(p => !done.includes(p.id) && !p.opt);
  if (next) { SH.pose = next.id; toast(`<span>저장했어요 · 다음은 ${next.n}</span>`); renderShoot(); }
  else { stopCam(); go('grow'); toast(`<span>이번 주 사진 저장${xp ? ` · +${xp} XP` : ''}</span>`); setTimeout(() => { const s = $('#bodyLog'); s && s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200); showLevelUp(); }
}

/* ---------- 비교 화면 ---------- */
const CM = { mode: 'side', pose: 'front_relax', a: null, b: null, play: null, speed: 1, i: 0 };
async function renderCmp() {
  await loadPhotos(); clearInterval(CM.play); CM.play = null;
  if (!byPose(CM.pose).length) CM.pose = (POSES.find(p => byPose(p.id).length) || POSES[1]).id;
  const list = byPose(CM.pose), blur = DB.settings.blurPhotos !== false && CM.reveal !== true;
  if (!CM.a || !list.some(p => p.id === CM.a)) CM.a = list[0] && list[0].id;
  if (!CM.b || !list.some(p => p.id === CM.b)) CM.b = list[list.length - 1] && list[list.length - 1].id;
  const A = list.find(p => p.id === CM.a), B = list.find(p => p.id === CM.b);
  const dSel = (k, cur) => `<select class="inp" data-sel="${k}" aria-label="${k === 'a' ? '이전' : '이후'} 날짜">${list.map(p => `<option value="${p.id}" ${p.id === cur ? 'selected' : ''}>${p.date}</option>`).join('')}</select>`;
  const mTable = (x, label) => x ? `<div class="stack" style="gap:2px"><span class="fq-eyebrow">${label} · ${x.date}</span><span class="fq-t-caption">${metricsLine(x.metrics)}</span></div>` : '';
  const delta = (A && B && A.metrics && B.metrics) ? [['체중', 'weight', 'kg', 0], ['체지방', 'pbf', '%p', -1], ['골격근', 'smm', 'kg', 1], ['V 비율', 'vRatio', '', 1], ['허리', 'waist', 'cm', -1]].filter(([, k]) => A.metrics[k] != null && B.metrics[k] != null).map(([n, k, u, good]) => { const d = +(B.metrics[k] - A.metrics[k]).toFixed(2); return `<div><span class="fq-t-caption">${n}</span><b ${good && d * good > 0 ? 'style="color:var(--fq-success)"' : ''}>${d > 0 ? '+' : ''}${d}${u}</b></div>`; }).join('') : '';
  let body = '';
  if (list.length < 2) body = `<p class="fq-card fq-t-body" style="margin:0">아직 비교할 사진이 2주 이상 없어요. 다음 주에 한 번 더 찍으면 열려요.</p><button class="fq-btn fq-btn--lg fq-btn--signal fq-btn--block" data-act="phShoot">촬영하기</button>`;
  else if (CM.mode === 'side') body = `<div class="grid2">${dSel('a', CM.a)}${dSel('b', CM.b)}</div>
    <div class="ph-pair ${blur ? 'is-blur' : ''}"><figure><img src="${pURL(A)}" alt="${A.date} 사진"><figcaption>${A.date}</figcaption></figure><figure><img src="${pURL(B)}" alt="${B.date} 사진"><figcaption>${B.date}</figcaption></figure></div>
    ${delta ? `<div class="ph-delta">${delta}</div>` : ''}${mTable(A, '이전')}${mTable(B, '이후')}
    <div class="grid2"><button class="linkbtn" data-act="phDel" data-id="${A.id}">이전 사진 지우기</button><button class="linkbtn" data-act="phDel" data-id="${B.id}">이후 사진 지우기</button></div>`;
  else if (CM.mode === 'wipe') body = `<div class="grid2">${dSel('a', CM.a)}${dSel('b', CM.b)}</div>
    <div class="ph-wipe ${blur ? 'is-blur' : ''}" id="wipe" style="--x:50%"><img src="${pURL(A)}" alt="${A.date}"><img class="top" src="${pURL(B)}" alt="${B.date}"><span class="bar"></span><span class="lab l">${A.date}</span><span class="lab r">${B.date}</span></div>
    <input type="range" id="wipeR" min="0" max="100" value="50" aria-label="이전·이후 경계 옮기기" class="fq-slider">
    ${delta ? `<div class="ph-delta">${delta}</div>` : ''}`;
  else body = `<div class="ph-lapse ${blur ? 'is-blur' : ''}"><img id="lapseImg" src="${pURL(list[Math.min(CM.i, list.length - 1)])}" alt="타임랩스"><span class="lab r" id="lapseDate">${list[Math.min(CM.i, list.length - 1)].date}</span></div>
    <input type="range" id="lapseR" min="0" max="${list.length - 1}" value="${Math.min(CM.i, list.length - 1)}" aria-label="날짜 이동" class="fq-slider">
    <div class="chips"><button class="fq-chip" data-act="phPlay">${'재생 / 멈춤'}</button>${[.5, 1, 2].map(s => `<button class="fq-chip" aria-pressed="${CM.speed === s}" data-act="phSpeed" data-s="${s}">${s}×</button>`).join('')}</div>
    <p class="fq-t-caption" id="lapseM" style="margin:0">${metricsLine(list[Math.min(CM.i, list.length - 1)].metrics)}</p>
    ${list.length < 12 ? '<p class="note" style="margin:0">12주부터 부드러워져요.</p>' : ''}`;
  $('#scr-cmp').innerHTML = `
    <header class="topbar"><h1 class="fq-t-title">몸 비교</h1><button class="fq-btn fq-btn--icon" data-go="grow" aria-label="닫기">${ico('x')}</button></header>
    <div class="chips" role="tablist">${[['side', '나란히'], ['wipe', '슬라이더'], ['lapse', '타임랩스']].map(([m, n]) => `<button class="fq-chip" role="tab" aria-selected="${CM.mode === m}" data-act="phMode" data-m="${m}">${n}</button>`).join('')}</div>
    <div class="chips" ${POSES.length < 2 ? 'hidden' : ''}>${POSES.map(p => `<button class="fq-chip ph-mini" aria-pressed="${CM.pose === p.id}" data-act="phCPose" data-p="${p.id}" ${byPose(p.id).length ? '' : 'disabled'}>${p.n} ${byPose(p.id).length}</button>`).join('')}</div>
    ${blur && list.length ? '<button class="fq-btn fq-btn--ghost fq-btn--block" data-act="phReveal">가리기 잠깐 풀기</button>' : ''}
    ${body}`;
  document.querySelectorAll('#scr-cmp [data-sel]').forEach(s => s.addEventListener('change', () => { CM[s.dataset.sel] = s.value; renderCmp(); }));
  const wr = $('#wipeR'); if (wr) wr.addEventListener('input', () => $('#wipe').style.setProperty('--x', wr.value + '%'));
  const w = $('#wipe'); if (w) { const mv = e => { const r = w.getBoundingClientRect(), x = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); w.style.setProperty('--x', x + '%'); if (wr) wr.value = x; }; w.addEventListener('pointerdown', e => { w.setPointerCapture(e.pointerId); mv(e); }); w.addEventListener('pointermove', e => { if (e.buttons) mv(e); }); }
  const lr = $('#lapseR'); if (lr) lr.addEventListener('input', () => showLapse(+lr.value));
}
function showLapse(i) { const list = byPose(CM.pose); CM.i = i; const x = list[i]; if (!x) return; $('#lapseImg').src = pURL(x); $('#lapseDate').textContent = x.date; $('#lapseM').textContent = metricsLine(x.metrics); const r = $('#lapseR'); if (r) r.value = i; }

/* ---------- 액션 ---------- */
const PH_ACTS = {
  phShoot: () => { closeSheet(); SH.shot = null; go('shoot'); },
  phClose: () => { stopCam(); SH.shot = null; go('grow'); },
  phPose: a => { SH.pose = a.dataset.p; SH.keep = true; SH.shot = null; renderShoot(); },
  phSnap: () => snap(), phRetake: () => { SH.shot = null; SH.keep = true; renderShoot(); }, phSave: () => savePhoto(),
  phTimer: () => { SH.timer = SH.timer ? 0 : 3; SH.keep = true; renderShoot(); },
  phFlip: () => { SH.facing = SH.facing === 'user' ? 'environment' : 'user'; SH.keep = true; renderShoot(); },
  phNeck: () => { SH.neck = !SH.neck; SH.keep = true; renderShoot(); },
  phBlur: () => { DB.settings.blurPhotos = DB.settings.blurPhotos === false; save(); R.grow(); },
  phReveal: () => { CM.reveal = true; renderCmp(); setTimeout(() => { CM.reveal = false; if (TAB === 'cmp') renderCmp(); }, 15000); },
  phCmp: a => { CM.reveal = false; if (a.dataset.w) { const set = PHOTOS.filter(p => weekOf(p.date) === a.dataset.w); const c = set.find(p => p.pose === CM.pose) || set[0]; if (c) { CM.pose = c.pose; CM.b = c.id; } } go('cmp'); },
  phMode: a => { CM.mode = a.dataset.m; renderCmp(); }, phCPose: a => { CM.pose = a.dataset.p; CM.a = CM.b = null; CM.i = 0; renderCmp(); },
  phPlay: () => { const list = byPose(CM.pose); if (CM.play) { clearInterval(CM.play); CM.play = null; return; } CM.play = setInterval(() => { if (TAB !== 'cmp' || !$('#lapseImg')) { clearInterval(CM.play); CM.play = null; return; } showLapse((CM.i + 1) % list.length); }, 700 / CM.speed); },
  phSpeed: a => { CM.speed = +a.dataset.s; const was = !!CM.play; renderCmp(); if (was) PH_ACTS.phPlay(); },
  phDel: a => sheet(`<h2 class="fq-t-title">이 사진을 지울까요?</h2><p class="fq-t-body" style="margin:-6px 0 0">되돌릴 수 없어요.</p><button class="fq-btn fq-btn--lg fq-btn--block" style="--_bg:var(--fq-danger-fill);--_fg:#fff" data-act="phDelGo" data-id="${a.dataset.id}">지우기</button><button class="fq-btn fq-btn--ghost fq-btn--block" data-act="close">취소</button>`),
  phDelGo: async a => { await PH.del(a.dataset.id); closeSheet(); await loadPhotos(); renderCmp(); toast('<span>지웠어요.</span>'); },
  phExport: async () => { await loadPhotos(); if (!PHOTOS.length) return toast('<span>내보낼 사진이 없어요.</span>'); toast(`<span>사진 ${PHOTOS.length}장을 차례로 저장해요.</span>`); for (const p of PHOTOS) { const l = document.createElement('a'); l.href = pURL(p); l.download = `fitquest_${p.date}_${p.pose}.jpg`; document.body.appendChild(l); l.click(); l.remove(); await new Promise(r => setTimeout(r, 350)); } }
};
