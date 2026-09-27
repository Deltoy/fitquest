"use strict";
/* 팔로우한 유튜버 새 루틴 영상 → 운동 탭 "봐볼 영상" 추천 (넣을지는 사용자가 고름 · 자동 학습 없음).
   하루 1번 앱을 열 때, 백업 서버(ytNew, backup.js 의 bkCall)가 유튜브 공개 RSS 로 새 영상을 알려 준다 — 백업 암호가 있어야 동작.
   "내 루틴에 넣기"를 누르면 기존 학습 흐름(crAddSheet → crLearn → crReview → crSave)으로 그 유튜버 루틴에 붙고, 다음 주 그 부위 첫날 로테이션에 들어간다 (app.js rotFor).
   상태 DB.follow (백업에 같이 들어감): { at 마지막 확인, tried, ids {유튜버id: UC…}, seen [영상id], queue [{vid,title,cr,name,pub}], added [{key,cr,name,at,vid,title,seen?}] } */
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

/* 새 영상 확인 → 루틴 같은 것만 queue 에. 새로 찾은 개수를 돌려준다. */
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
    return found;
  })().catch(e => { if (manual) throw e; return -1; }).finally(() => { fwBusy = null; fwStat(); if (TAB === 'work') R.work(); });
  return fwBusy;
}
const fwAuto = () => { if (fwOn()) fwCheck(false).catch(() => {}); };
/* 직접 배운 영상은 추천에서 빼고 "넣었어요"로 남긴다 (app.js crSave) */
function fwDone(vid, key) {
  const F = FW(), v = F.queue.find(x => x.vid === vid); F.queue = F.queue.filter(x => x.vid !== vid);
  const t = key && DB.custom.tpls[key];   // crSave 에서 mergeCustom 전에 부름 → TPL 말고 DB.custom 에서 읽음
  if (t) { F.added.push({ key, cr: t.cr, name: t.by, at: Date.now(), vid, title: v ? v.title : t.ko }); F.added = F.added.slice(-20); }
}

/* ---------- 운동 탭 "봐볼 영상" ---------- */
const FW_PART = [['back', /등|광배|풀업|로우|턱걸이/], ['chest', /가슴|벤치|체스트|푸시업/], ['shoulder', /어깨|삼각|숄더|레이즈/], ['arms', /팔|이두|삼두|암/], ['legs', /하체|스쿼트|다리|레그|런지/]];
const fwPart = t => (FW_PART.find(([, re]) => re.test(t || '')) || [])[0];
const ago = iso => { const d = Math.floor((Date.now() - Date.parse(iso)) / 864e5); return !iso || isNaN(d) ? '' : d < 1 ? '오늘' : `${d}일 전`; };
let fwMore = false, fwHid = null;
function fwCard(part, attrs = '') {
  const F = DB.follow; if (!F) return '';
  const add = F.added.filter(x => x.vid && !x.seen && TPL[x.key]), q = F.queue.slice().sort((a, b) => (fwPart(b.title) === part) - (fwPart(a.title) === part));
  const all = add.map(x => ({ x, added: 1 })).concat(q.map(x => ({ x }))); if (!all.length) return '';
  return `<section class="tile card-pad fw2" ${attrs} aria-labelledby="fwH2"><div class="card-h"><h2 class="fq-t-heading" id="fwH2">봐볼 영상</h2><span class="fq-t-caption">롤모델 새 영상</span></div>
    <ul class="fw-list">${all.slice(0, fwMore ? 10 : 3).map(({ x, added }) => `<li class="fwi">
      <a class="fwi-v" href="${ytWatch(x.vid)}" target="_blank" rel="noopener">${`<span class="vthumb vthumb--fw">${avatar(CREATORS.find(c => c.id === x.cr), 'av')}<img src="https://i.ytimg.com/vi/${esc(x.vid)}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"></span>`}<span class="fwi-t"><b>${esc(x.title)}</b><small>${esc(x.name)}${x.pub ? ' · ' + ago(x.pub) : ''}</small></span></a>
      <div class="fwi-a">${added ? `<span class="chip cy">${ico('check', '')}다음 주 ${PART_NAME[partOf(x.key)]} 첫날에 넣었어요</span><button class="linkbtn ink" data-act="fwView" data-t="${x.key}">보기</button>`
        : `${x.ref ? `<span class="chip cy">${ico('check', '')}${PART_NAME[x.ref]}날 영상에 저장</span>` : ''}${DB.settings.gkey ? `<button class="fq-btn fq-btn--secondary fq-btn--sm" data-act="fwLearnOne" data-v="${esc(x.vid)}">${ico('plus', 'ico--16')}내 루틴에 넣기</button>`
          : x.ref ? '' : `<button class="fq-btn fq-btn--secondary fq-btn--sm" data-act="fwRef" data-v="${esc(x.vid)}" data-p="${fwPart(x.title) || part || 'full'}">${ico('bookmark', 'ico--16')}${PART_NAME[fwPart(x.title) || part || 'full']}날 영상에 저장</button>`}<button class="linkbtn" data-act="fwHide" data-v="${esc(x.vid)}">관심 없음</button>`}</div></li>`).join('')}</ul>
    ${all.length > 3 ? `<button class="linkbtn ink" data-act="fwMore">${fwMore ? '접기' : `더 보기 (${all.length - 3})`}</button>` : ''}</section>`;
}
/* 자동으로 배운 루틴 보기 · 로테이션에서 빼기 · 지우기 */
function fwView(key) {
  const t = TPL[key]; if (!t) return closeSheet();
  const x = ((DB.follow && DB.follow.added) || []).find(a => a.key === key); if (x && !x.seen) { x.seen = 1; save(); if (TAB === 'work') R.work(); }
  const from = t.day ? kDate(addDays(mondayOf(t.day), 7)) : null;
  sheet(`<div class="row row--between"><span class="chip">${esc(t.code)}</span><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <h2 class="fq-t-title">${esc(t.ko)}</h2>
    <p class="fq-t-caption" style="margin:-6px 0 0">${t.off ? '로테이션에서 빼 둔 루틴이에요.' : `새 영상에서 배운 루틴${from ? ` · ${from.getMonth() + 1}월 ${from.getDate()}일 주부터 로테이션에 들어가요` : ''}`}</p>
    <section class="fq-card"><div class="pro-ex">${t.ex.map(([id, n, o = {}], j) => `<div><span class="num muted">${j + 1}</span><span><b>${esc(EX[id].n)}</b><small>${EX[id].img ? '앱 운동과 연결됨' : '새 운동 · 원본 영상으로 동작 보기'}${o.tip ? ' · ' + esc(o.tip) : ''}</small></span><span class="fq-t-label">${n}세트${o.r ? ' · ' + o.r.join('–') + '회' : ''}</span></div>`).join('')}</div></section>
    <a class="src" href="${esc(t.video)}" target="_blank" rel="noopener">${ico('ext', 'ico--16')}<span>${esc(t.by)} 원본 영상</span></a>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="proGo" data-t="${key}">${ico('play', 'fill')}지금 하기</button>
    <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="fwOff" data-t="${key}">${t.off ? '로테이션에 다시 넣기' : '로테이션에서 빼기'}</button>
    <button class="fq-btn fq-btn--ghost fq-btn--block" data-act="fwDel" data-t="${key}" style="--_fg:var(--red-ink)">이 루틴 지우기</button>`);
}

/* ---------- 설정 섹션 ---------- */
const fwStatText = () => {
  if (!bkOn()) return '아래 백업 암호를 정하면 켜져요';
  const F = DB.follow || {}; if (!F.at) return fwOn() ? '아직 확인하지 않았어요' : '꺼져 있어요';
  const d = new Date(F.at); return `마지막 확인 ${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())} · 유튜버 ${fwChannels().length}명${fwOn() ? '' : ' (꺼짐)'}`;
};
function fwStat() { const s = $('#fwStat'); if (s) s.textContent = fwStatText(); }
function fwSection() {
  const on = fwOn();
  return `<section class="fq-card stack" style="gap:12px" aria-labelledby="fwH"><span class="fq-t-heading" id="fwH">새 영상 알림</span>
    <p class="note" style="margin:0">하루 한 번 롤모델 새 영상을 운동 탭에 추천해요.</p>
    <div class="chips" role="group" aria-label="새 영상 알림"><button class="fq-chip" aria-pressed="${on}" data-act="fwOn" data-v="1">알림 켜기</button><button class="fq-chip" aria-pressed="${!on}" data-act="fwOn" data-v="0">끄기</button></div>
    <p class="fw-st"><span class="fq-t-caption" id="fwStat" role="status">${fwStatText()}</span><button class="linkbtn ink" data-act="fwNow">${ico('refresh', 'ico--16')}지금 확인</button></p></section>`;
}

const FW_ACTS = {
  fwOn: a => { DB.settings.follow = a.dataset.v === '1'; save(); R.set(); },
  fwNow: async () => {
    if (!bkRead()) return;
    toast('<span>새 영상을 확인하는 중…</span>', 20000);
    try { const n = await fwCheck(true); toast(`<span>${n > 0 ? `새 루틴 영상 ${n}개 · 운동 탭 "봐볼 영상"에 있어요` : '새 루틴 영상이 없어요'}</span>`, 4000); }
    catch (e) { toast(`<span>${e && e.message === 'kind' ? '백업 서버를 새 버전으로 바꿔야 해요' : bkErr(e)}</span>`, 4500); }
  },
  fwView: a => fwView(a.dataset.t),
  /* 키 없이 "넣기": 그 부위 날 "오늘 볼 영상"에 참고 영상으로 저장 (학습 없음) */
  fwRef: a => { const F = FW(), v = F.queue.find(x => x.vid === a.dataset.v); if (!v) return; const part = a.dataset.p;
    v.ref = part; F.refs = (F.refs || []).filter(r => r.vid !== v.vid).concat({ vid: v.vid, title: v.title, cr: v.cr, name: v.name, part, at: Date.now() }).slice(-12); save(); R.work();
    toast(`<span>${PART_NAME[part]}날 "오늘 볼 영상"에 넣었어요</span>`, 4000); },
  fwLearnOne: a => { const v = FW().queue.find(x => x.vid === a.dataset.v); if (v) crAddSheet('', { name: v.name, url: ytWatch(v.vid), cr: v.cr }); },
  fwHide: a => { const F = FW(), i = F.queue.findIndex(v => v.vid === a.dataset.v); if (i < 0) return; fwHid = { i, v: F.queue[i] }; F.queue.splice(i, 1); save(); R.work();   // 이미 seen 에 있어서 다시 안 옴
    toast('<span>숨겼어요</span><button data-act="fwUndo">되돌리기</button>', 5000); },
  fwUndo: () => { if (!fwHid) return; const F = FW(); F.queue.splice(fwHid.i, 0, fwHid.v); fwHid = null; save(); $('#toast').innerHTML = ''; if (TAB === 'work') R.work(); },
  fwMore: () => { fwMore = !fwMore; R.work(); },
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
