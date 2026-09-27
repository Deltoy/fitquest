"use strict";
/* 구글 드라이브 자동 백업 — 내 Apps Script 웹앱(백업 서버)에 기록·주간 몸 사진을 보낸다.
   주소·토큰·백업 상태는 DB 밖 별도 키에 둔다 (내보내기·드라이브 백업 파일에 들어가지 않음). */
const BK_KEY = 'fitquest.backup';
const BK = (() => { try { return JSON.parse(localStorage.getItem(BK_KEY)) || {}; } catch (e) { return {}; } })(); // { url, token, at, hash, weeks: { '2026-W39': createdAt } }
const bkStore = () => { try { localStorage.setItem(BK_KEY, JSON.stringify(BK)); } catch (e) {} };
const BK_DEFAULT = 'https://script.google.com/macros/s/AKfycbzV6NiDcEOG_4cGorp0d-aGrl5e_ibqvzII33rQZVSqbcf8NG6SPtvC0V4tyL01ovcJdg/exec';   // 0927 기본은 트렌드랩 서버가 같이 받아 준다 (따로 설치 없음)
const bkUrl = () => BK.url || BK_DEFAULT;
const bkOn = () => !!BK.token;
const BK_URL = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/;
const hashOf = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) | 0; return h; };
/* ISO 주차: 그 주 목요일이 속한 해 기준 */
const isoWeek = k => { const th = addDays(mondayOf(k), 3), y = +th.slice(0, 4); return `${y}-W${pad(Math.floor(Math.round((kDate(th) - kDate(y + '-01-01')) / 864e5) / 7) + 1)}`; };
const isoMonday = w => addDays(mondayOf(w.slice(0, 4) + '-01-04'), (+w.slice(6) - 1) * 7);

async function bkCall(body) {
  const r = await fetch(bkUrl(), { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fq: 1, token: BK.token, ...body }) });
  const j = await r.json().catch(() => null);
  if (!j || !j.ok) throw new Error((j && j.err) || 'http_' + r.status);
  return j;
}
const bkErr = e => e && e.message === 'token' ? '백업 암호가 처음 정한 것과 달라요. 설정에서 확인해 주세요' : '드라이브에 연결하지 못했어요. 다음에 다시 시도할게요';
const toDataURL = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
async function jpegURL(blob) { const bmp = await createImageBitmap(blob); const j = await toJpeg(bmp, bmp.width, bmp.height, false); bmp.close && bmp.close(); return toDataURL(j.blob); }

/* 기록(12시간 지났거나 바뀌었으면) → 아직 안 올린 주간 사진. 한 번에 하나만 돈다. */
let bkBusy = null;
function bkRun(manual) {
  if (!bkOn() || !DB.profile) return Promise.resolve(false);
  if (bkBusy) return bkBusy;
  bkBusy = (async () => {
    const h = hashOf(JSON.stringify(DB));
    if (manual || Date.now() - (BK.at || 0) > 12 * 36e5 || h !== BK.hash) {
      await bkCall({ kind: 'data', day: dayKey(), data: DB });
      BK.at = Date.now(); BK.hash = h; bkStore();
    }
    await loadPhotos(); BK.weeks = BK.weeks || {};
    for (const [wk, set] of photoWeeks()) {
      const p = set.front_relax || Object.values(set)[0], w = isoWeek(wk);
      if (BK.weeks[w] === p.createdAt) continue;
      await bkCall({ kind: 'photo', week: w, dataUrl: await jpegURL(p.blob), meta: { date: p.date, pose: p.pose, createdAt: p.createdAt, metrics: p.metrics || null } });
      BK.weeks[w] = p.createdAt; bkStore();
    }
    return true;
  })().catch(e => { if (!manual) toast(`<span>${bkErr(e)}</span>`, 4500); throw e; })
    .finally(() => { bkBusy = null; bkStat(); });
  return bkBusy;
}
const bkAuto = () => { bkRun(false).catch(() => {}); };

/* ---------- 설정 섹션 ---------- */
const bkStatText = () => { if (!BK.at) return bkOn() ? '아직 백업하지 않았어요' : '백업 암호를 정하면 자동으로 백업해요'; const d = new Date(BK.at); return `마지막 백업 ${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())} · 사진 ${Object.keys(BK.weeks || {}).length}장`; };
function bkStat() { const s = $('#bkStat'); if (s) s.textContent = bkStatText(); }
const bkFields = () => `<label class="stack" for="bkTok" style="gap:6px"><span class="fq-t-label">백업 암호 (직접 정해요 · 4자 이상)</span><input id="bkTok" class="inp" type="password" autocomplete="new-password" autocapitalize="off" spellcheck="false" value="${esc(BK.token || '')}"></label>
  <details><summary class="fq-t-caption">다른 백업 서버 쓰기 (보통은 비워 두세요)</summary><input id="bkUrl" class="inp" type="url" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(BK.url || '')}" style="margin-top:8px"></details>`;
function bkSection() {
  return `<section class="fq-card stack" style="gap:12px" aria-labelledby="bkH"><span class="fq-t-heading" id="bkH">구글 드라이브 자동 백업</span>
    <p class="note" style="margin:0">앱을 열 때와 운동을 마칠 때 기록과 주간 몸 사진을 내 드라이브 "FITQUEST 백업" 폴더에 저장해요. 처음 넣은 암호로 백업이 잠겨요. 다시 설치하면 같은 암호로 불러와요 — 잊지 않게 적어 두세요.</p>
    ${bkFields()}
    <p class="fq-t-caption" id="bkStat" role="status" style="margin:0">${bkStatText()}</p>
    <button class="fq-btn fq-btn--secondary fq-btn--block" data-act="bkNow">${ico('cup')}지금 백업</button><button class="fq-btn fq-btn--secondary fq-btn--block" data-act="bkLoad">${ico('cdown')}드라이브에서 불러오기</button></section>`;
}
/* 입력칸 → BK. 잘못된 주소면 false */
function bkRead() {
  const u = $('#bkUrl'), t = $('#bkTok'); if (!t) return bkOn();
  const url = u ? u.value.trim() : '', token = t.value.trim();
  if (!token && BK.token) { delete BK.url; delete BK.token; bkStore(); bkStat(); toast('<span>자동 백업을 껐어요</span>'); return false; }
  if (token.length < 4) { toast('<span>백업 암호를 4자 이상 넣어 주세요</span>'); return false; }
  if (url && !BK_URL.test(url)) { toast('<span>주소는 https://script.google.com/macros/s/…/exec 모양이에요</span>', 5000); return false; }
  if ((url || '') !== (BK.url || '') || token !== BK.token) { if (url) BK.url = url; else delete BK.url; BK.token = token; BK.at = 0; BK.hash = 0; BK.weeks = {}; bkStore(); }   // 다른 서버·암호면 처음부터 다시 올림
  return true;
}

/* ---------- 불러오기 ---------- */
let bkLatest = null;
async function bkRestore() {
  if (!bkRead()) return;
  toast('<span>드라이브에서 찾는 중…</span>', 8000);
  try { bkLatest = await bkCall({ kind: 'latest' }); } catch (e) { return toast(`<span>${bkErr(e)}</span>`, 4500); }
  $('#toast').innerHTML = '';
  const d = bkLatest.data, n = bkLatest.photos.length;
  if (!d || d.v !== 1 || !d.profile) return sheet(`<h2 class="fq-t-title">드라이브에 백업이 아직 없어요</h2><p class="fq-t-body" style="margin:-6px 0 0">${n ? `몸 사진 ${n}장만 있어요.` : '연결은 잘 됐어요. 기록이 생기면 알아서 백업해요.'}</p><button class="fq-btn fq-btn--block" data-act="close">확인</button>`);
  const at = new Date(bkLatest.savedAt), when = `${at.getMonth() + 1}월 ${at.getDate()}일 ${pad(at.getHours())}:${pad(at.getMinutes())}`;
  sheet(`<h2 class="fq-t-title">드라이브 기록을 불러올까요?</h2>
    <div class="fq-card stack" style="gap:4px"><span class="fq-t-label">${when} 백업</span><span class="fq-t-caption">레벨 ${levelOf(d.xp || 0)} · 운동 ${(d.sessions || []).length}회${n ? ` · 몸 사진 ${n}장` : ''}</span></div>
    <p class="fq-t-body" style="margin:0">${DB.profile ? '지금 이 폰의 기록은 이 백업으로 바뀌어요.' : '이 백업으로 바로 시작해요.'}</p>
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="bkRestoreGo">불러오기</button><button class="fq-btn fq-btn--ghost fq-btn--block" data-act="close">취소</button>`);
}
async function bkPhotos() {
  const list = bkLatest.photos; let got = 0;
  sheet(`<h2 class="fq-t-title">몸 사진 불러오는 중</h2><p class="fq-t-body num" id="bkProg" role="status" style="margin:-6px 0 0">0 / ${list.length}</p>`);
  for (const x of list) {
    try {
      const j = await bkCall({ kind: 'photoGet', week: x.week }), m = j.meta || {}, blob = await (await fetch(j.dataUrl)).blob(), bmp = await createImageBitmap(blob);
      const date = m.date || isoMonday(x.week), pose = m.pose || 'front_relax', createdAt = m.createdAt || kDate(date).getTime();
      await PH.put({ id: `${date}_${pose}`, date, pose, blob, w: bmp.width, h: bmp.height, sizeKB: Math.round(blob.size / 1024), createdAt, metrics: m.metrics || null });
      BK.weeks = BK.weeks || {}; BK.weeks[isoWeek(date)] = createdAt; bkStore(); got++;
    } catch (e) { /* 한 장 실패해도 나머지는 계속 */ }
    const p = $('#bkProg'); if (p) p.textContent = `${got} / ${list.length}`;
  }
  closeSheet(); await loadPhotos(); R[TAB] && R[TAB]();
  toast(`<span>몸 사진 ${got}장을 불러왔어요${got < list.length ? ` · ${list.length - got}장 실패` : ''}</span>`, 4500);
}
const BK_ACTS = {
  bkNow: async () => { if (!bkRead()) return; if (!DB.profile) return toast('<span>기록을 시작한 뒤에 백업할 수 있어요</span>'); toast('<span>백업하는 중…</span>', 20000); try { await bkRun(true); toast('<span>드라이브에 백업했어요</span>'); } catch (e) { toast(`<span>${bkErr(e)}</span>`, 4500); } },
  bkLoad: () => bkRestore(),
  bkSetup: () => sheet(`<div class="row row--between"><h2 class="fq-t-title">드라이브에서 불러오기</h2><button class="fq-btn fq-btn--icon" data-act="close" aria-label="닫기">${ico('x')}</button></div>
    <p class="fq-t-body" style="margin:-6px 0 0">백업할 때 쓰던 주소와 토큰을 넣어 주세요.</p>${bkFields()}
    <button class="fq-btn fq-btn--lg fq-btn--block" data-act="bkLoad">${ico('cdown')}불러오기</button>`),
  bkRestoreGo: () => {
    const d = bkLatest && bkLatest.data; if (!d) return closeSheet();
    DB = d; DB.flags = DB.flags || {}; DB.flags.obDraft = false; mergeCustom(); save();
    BK.at = Date.now(); BK.hash = hashOf(JSON.stringify(DB)); bkStore(); // 방금 받은 것과 같으니 다시 올리지 않음
    settleStreak(); go('home');
    const n = bkLatest.photos.length;
    if (!n) { closeSheet(); return toast('<span>드라이브 기록을 불러왔어요</span>'); }
    sheet(`<h2 class="fq-t-title">기록을 불러왔어요</h2><p class="fq-t-body" style="margin:-6px 0 0">몸 사진 ${n}장도 이 폰으로 불러올까요?</p>
      <button class="fq-btn fq-btn--lg fq-btn--block" data-act="bkPhotosGo">${ico('image')}사진도 불러오기</button><button class="fq-btn fq-btn--ghost fq-btn--block" data-act="close">나중에</button>`);
  },
  bkPhotosGo: () => bkPhotos()
};
