"use strict";
/* 팔로우한 유튜버 새 루틴 영상 자동 반영.
   하루 1번 앱을 열 때, 백업 서버(ytNew, backup.js 의 bkCall)가 유튜브 공개 RSS 로 새 영상을 알려 준다 — 백업 암호가 있어야 동작.
   제미나이 키가 있으면 하루 2개까지 기존 학습(geminiVideo → crTpl)으로 조용히 배워 그 유튜버 루틴에 붙이고,
   없으면 홈에 "새 루틴 영상이 올라왔어요" 카드. 새 루틴은 다음 주 그 부위 첫날 로테이션에 들어간다 (app.js rotFor).
   상태 DB.follow (백업에 같이 들어감): { at 마지막 확인, tried, ids {유튜버id: UC…}, seen [영상id], queue [{vid,title,cr,name,pub,fail?}], added [{key,cr,name,at,seen?}], day, n } */
const FW_DAY_MAX = 2;   // 하루 자동 학습 한도 (제미나이 무료 사용량 아끼기)
/* 루틴 영상 거르기: 제목에 운동 낱말이 있고, 쇼츠·브이로그·먹방이 아니면 통과.
   ponytail: 낱말 검사라 "등"이 들어간 딴 영상도 통과할 수 있음 — 제미나이가 운동을 못 찾으면 저장 안 하고 버린다 */
const FW_YES = /루틴|운동|가슴|등|어깨|하체|팔|복근|상체|분할|workout|routine|프로그램|따라하기/i, FW_NO = /#shorts?\b|쇼츠|브이로그|vlog|먹방|mukbang/i;
const fwLikely = v => !v.short && FW_YES.test(v.title || '') && !FW_NO.test(v.title || '');
const fwOn = () => DB.settings.follow !== false;
const FW = () => (DB.follow = DB.follow || { at: 0, ids: {}, seen: [], queue: [], added: [] });
const ytWatch = vid => 'https://www.youtube.com/watch?v=' + vid;

/* 팔로우 채널: 채널 주소(ch)가 있거나 학습한 영상이 있는 유튜버 전부, 롤모델 먼저, 최대 10명 */
function fwChannels() {
  const F = FW(), mine = (DB.profile && DB.profile.creators) || [];
  return CREATORS.slice().sort((a, b) => mine.includes(b.id) - mine.includes(a.id)).map(c => {
    const url = c.ch ? '' : (c.tpls || []).map(t => TPL[t] && TPL[t].video).find(Boolean);
    const q = F.ids[c.id] ? { id: F.ids[c.id] } : c.ch ? { handle: c.ch } : url ? { url } : null;
    return q && { c, q };
  }).filter(Boolean).slice(0, 10);
}

/* 새 영상 확인 → 루틴 같은 것만 queue 에. 새로 찾은 개수를 돌려준다. 학습은 뒤에서 따로 돈다. */
let fwBusy = null;
function fwCheck(manual) {
  if (!bkOn() || !DB.profile) return Promise.resolve(-1);
  const F = FW();
  if (!manual && (!fwOn() || Date.now() - (F.tried || 0) < 864e5)) return Promise.resolve(-1);
  if (fwBusy) return fwBusy;
  fwBusy = (async () => {
    F.tried = Date.now(); save();
    const list = fwChannels(); let found = 0;
    if (list.length) {
      const since = new Date((F.at || Date.now() - 7 * 864e5) - 864e5).toISOString();   // 하루 겹쳐서 받고 seen 으로 거름
      const j = await bkCall({ kind: 'ytNew', channels: list.map(x => x.q), since });
      const known = new Set(Object.values(TPL).map(t => t.video && ytId(t.video)).filter(Boolean));
      (j.channels || []).forEach((r, i) => {
        const x = list[i]; if (!x) return; if (r.id) F.ids[x.c.id] = r.id;
        (r.videos || []).forEach(v => {
          if (F.seen.includes(v.videoId) || known.has(v.videoId)) return;
          F.seen.push(v.videoId);
          if (fwLikely(v)) { F.queue.push({ vid: v.videoId, title: String(v.title || '').slice(0, 80), cr: x.c.id, name: x.c.name, pub: v.published }); found++; }
        });
      });
      F.seen = F.seen.slice(-300); F.queue = F.queue.slice(-10);
    }
    F.at = Date.now(); save();
    fwLearn();
    return found;
  })().catch(e => { if (manual) throw e; return -1; }).finally(() => { fwBusy = null; fwStat(); if (TAB === 'home') R.home(); });
  return fwBusy;
}

/* 제미나이 키가 있으면 queue 에서 하루 2개까지 학습 → 그 유튜버 루틴으로 저장 (검토 화면 없이) */
let fwLearning = null;
function fwLearn() {
  if (!DB.settings.gkey || !DB.follow) return Promise.resolve();
  if (fwLearning) return fwLearning;
  fwLearning = (async () => {
    const F = FW(), today = dayKey(); let v;
    if (F.day !== today) { F.day = today; F.n = 0; }
    while (F.n < FW_DAY_MAX && (v = F.queue.find(x => !x.fail))) {
      F.n++; save();   // 부르기 전에 세야 도중에 앱을 닫아도 한도가 지켜짐
      try {
        const d = await geminiVideo(ytWatch(v.vid)), at = Date.now();
        const key = crTpl(v.name, d, ytWatch(v.vid), { auto: true, cr: v.cr, from: v.vid, at, day: dayKey() });
        F.queue = F.queue.filter(x => x.vid !== v.vid);
        if (key) { F.added.push({ key, cr: v.cr, name: v.name, at }); F.added = F.added.slice(-20); mergeCustom(); }   // 운동을 못 찾으면 루틴 영상이 아니었던 것 — 버림
      } catch (e) {
        if (/사용량/.test(e.message)) { F.n = FW_DAY_MAX; save(); break; }   // 무료 한도 초과: 내일 다시
        v.fail = String(e.message || e).slice(0, 80);   // 홈 카드에서 직접 배우기
      }
      save();
    }
  })().catch(() => {}).finally(() => { fwLearning = null; if (TAB === 'home') R.home(); });
  return fwLearning;
}
const fwAuto = () => { if (fwOn()) fwCheck(false).then(() => fwLearn()).catch(() => {}); };
/* 직접 배운 영상은 알림에서 뺀다 (app.js crSave) */
function fwDone(vid) { if (DB.follow) DB.follow.queue = DB.follow.queue.filter(v => v.vid !== vid); }

/* ---------- 홈 카드 ---------- */
function fwHomeCards() {
  const F = DB.follow; if (!F) return '';
  const add = F.added.filter(x => !x.seen && TPL[x.key]), pend = F.queue.filter(v => !DB.settings.gkey || v.fail);
  const x = add[add.length - 1], who = [...new Set(add.map(a => a.name))].join('·');   // 여러 개면 한 칸에 묶고, 보기를 누를 때마다 다음 것
  return (x ? `<section class="tile card-pad ph-home" aria-label="새 루틴 추가됨"><span class="ph-ic">${ico('repeat')}</span>
      <div><h2 class="fq-t-heading">${esc(who)} 새 루틴${add.length > 1 ? ` ${add.length}개` : ''} 추가됨</h2><p class="fq-t-caption">${esc(TPL[x.key].ko.replace(x.name + ' · ', ''))} · 다음 주 로테이션에 들어가요</p></div>
      <button class="fq-btn fq-btn--secondary" data-act="fwView" data-t="${x.key}">보기</button></section>` : '')
    + (pend.length ? `<section class="tile card-pad" aria-labelledby="fwNewH">
      <div class="row row--between"><div class="fw-head"><span class="ph-ic">${ico('bell')}</span><h2 class="fq-t-heading" id="fwNewH">새 루틴 영상이 올라왔어요</h2></div><button class="fq-btn fq-btn--icon fw-x" data-act="fwDismiss" aria-label="알림 닫기">${ico('x')}</button></div>
      <ul class="fw-list">${pend.slice(0, 3).map(v => `<li><div><b>${esc(v.title)}</b><small>${esc(v.name)}${v.fail ? ' · 자동으로 배우지 못했어요' : ''}</small></div><button class="fq-btn fq-btn--secondary" data-act="fwLearnOne" data-v="${esc(v.vid)}">루틴으로 배우기</button></li>`).join('')}</ul>
      ${DB.settings.gkey ? '' : '<p class="note" style="margin:0">설정 → 사진 AI에 제미나이 키를 넣으면 다음부터 알아서 배워서 로테이션에 넣어요.</p>'}</section>` : '');
}
/* 자동으로 배운 루틴 보기 · 로테이션에서 빼기 · 지우기 */
function fwView(key) {
  const t = TPL[key]; if (!t) return closeSheet();
  const x = ((DB.follow && DB.follow.added) || []).find(a => a.key === key); if (x && !x.seen) { x.seen = 1; save(); if (TAB === 'home') R.home(); }
  const from = t.day ? kDate(addDays(mondayOf(t.day), 7)) : null;
  sheet(`<div class="row row--between"><span class="fq-badge">${esc(t.code)}</span><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <h2 class="fq-t-title">${esc(t.ko)}</h2>
    <p class="fq-t-caption" style="margin:-6px 0 0">${t.off ? '로테이션에서 빼 둔 루틴이에요.' : `${t.auto ? '새 영상에서 자동으로 배운 루틴' : '새 영상에서 배운 루틴'}${from ? ` · ${from.getMonth() + 1}월 ${from.getDate()}일 주부터 로테이션에 들어가요` : ''}`}</p>
    <section class="fq-card"><div class="pro-ex">${t.ex.map(([id, n, o = {}], j) => `<div><span class="num muted">${j + 1}</span><span><b>${esc(EX[id].n)}</b><small>${EX[id].img ? '앱 운동과 연결됨' : '새 운동 · 원본 영상으로 동작 보기'}${o.tip ? ' · ' + esc(o.tip) : ''}</small></span><span class="fq-t-label">${n}세트${o.r ? ' · ' + o.r.join('–') + '회' : ''}</span></div>`).join('')}</div></section>
    <a class="src" href="${esc(t.video)}" target="_blank" rel="noopener">${ico('ext', 'ico--16')}<span>${esc(t.by)} 원본 영상</span></a>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="proGo" data-t="${key}">${ico('play', 'fill')}지금 하기</button>
    <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="fwOff" data-t="${key}">${t.off ? '로테이션에 다시 넣기' : '로테이션에서 빼기'}</button>
    <button class="fq-btn fq-btn--ghost fq-btn--block" data-act="fwDel" data-t="${key}" style="--_fg:var(--red-ink)">이 루틴 지우기</button>`);
}

/* ---------- 설정 섹션 ---------- */
const fwStatText = () => {
  if (!bkOn()) return '위에서 백업 암호를 정하면 켜져요 (새 영상 확인에 백업 서버를 같이 써요)';
  const F = DB.follow || {}; if (!F.at) return fwOn() ? '아직 확인하지 않았어요' : '꺼져 있어요';
  const d = new Date(F.at); return `마지막 확인 ${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())} · 유튜버 ${fwChannels().length}명${fwOn() ? '' : ' · 꺼져 있어요'}`;
};
function fwStat() { const s = $('#fwStat'); if (s) s.textContent = fwStatText(); }
function fwSection() {
  const on = fwOn();
  return `<section class="fq-card stack" style="gap:12px" aria-labelledby="fwH"><span class="fq-t-heading" id="fwH">팔로우한 유튜버 새 영상 자동 반영</span>
    <p class="note" style="margin:0">하루 한 번 앱을 열 때 롤모델·내가 추가한 유튜버 채널에 새 루틴 영상이 있는지 봐요. 제미나이 키가 있으면 하루 2개까지 알아서 배워 다음 주 로테이션에 넣고, 없으면 홈에 알려 줘요.</p>
    <div class="chips" role="group" aria-label="자동 반영"><button class="fq-chip" aria-pressed="${on}" data-act="fwOn" data-v="1">켜기</button><button class="fq-chip" aria-pressed="${!on}" data-act="fwOn" data-v="0">끄기</button></div>
    <p class="fq-t-caption" id="fwStat" role="status" style="margin:0">${fwStatText()}</p>
    <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="fwNow">${ico('refresh')}지금 확인</button></section>`;
}

const FW_ACTS = {
  fwOn: a => { DB.settings.follow = a.dataset.v === '1'; save(); R.set(); },
  fwNow: async () => {
    if (!bkRead()) return;
    toast('<span>새 영상을 확인하는 중…</span>', 20000);
    try { const n = await fwCheck(true); toast(`<span>${n > 0 ? `새 루틴 영상 ${n}개를 찾았어요${DB.settings.gkey ? ' · 배우는 중' : ' · 홈에서 볼 수 있어요'}` : '새 루틴 영상이 없어요'}</span>`, 4000); }
    catch (e) { toast(`<span>${e && e.message === 'kind' ? '백업 서버를 새 버전으로 바꿔야 해요' : bkErr(e)}</span>`, 4500); }
  },
  fwView: a => fwView(a.dataset.t),
  fwLearnOne: a => { const v = FW().queue.find(x => x.vid === a.dataset.v); if (v) crAddSheet('', { name: v.name, url: ytWatch(v.vid), cr: v.cr }); },
  fwDismiss: () => { const F = FW(); F.queue = F.queue.filter(v => DB.settings.gkey && !v.fail); save(); R.home(); },
  fwOff: a => { const t = TPL[a.dataset.t]; if (!t) return; t.off = t.off ? 0 : 1; save(); fwView(a.dataset.t); R[TAB] && R[TAB](); },
  fwDel: a => {
    const k = a.dataset.t; if (!TPL[k] || !DB.custom || !DB.custom.tpls[k]) return closeSheet();
    delete DB.custom.tpls[k]; delete TPL[k]; delete TPL_PARTS[k];
    CREATORS.forEach(c => { if (c.tpls.includes(k)) c.tpls = c.tpls.filter(x => x !== k); });
    [DB.pins || {}, DB.overrides].forEach(m => Object.keys(m).forEach(d => { if (m[d] === k) delete m[d]; }));
    FW().added = FW().added.filter(x => x.key !== k);
    save(); closeSheet(); R[TAB] && R[TAB](); toast('<span>지웠어요</span>');
  }
};
