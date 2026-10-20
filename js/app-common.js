/* tw-listing-page 共用畫面：頁首、頁尾、主題色、物件卡片。計算都在 core.js。 */
(function () {
  'use strict';
  const L = window.ListingCore;
  const SITE = window.SITE || null;
  const esc = L.esc;
  const $ = id => document.getElementById(id);
  const on = (SITE && SITE.sections) || {};
  /** 區塊開關：沒寫就當作開 */
  const enabled = key => on[key] !== false;
  const agent = (SITE && SITE.agent) || {};

  function applyTheme() {
    const t = (SITE && SITE.theme) || {};
    const r = document.documentElement.style;
    r.setProperty('--primary', L.safeColor(t.primary, '#1f6f5c'));
    r.setProperty('--accent', L.safeColor(t.accent, '#d9822b'));
  }

  function header(active) {
    const el = $('siteHeader');
    if (!el) return;
    const link = (href, key, text) => '<a href="' + href + '"' + (active === key ? ' aria-current="page"' : '') + '>' + esc(text) + '</a>';
    el.innerHTML =
      '<div class="wrap bar">' +
        '<a class="brand" href="index.html"><b>' + esc(agent.name || '') + '</b><span>' + esc(agent.store || '') + '</span></a>' +
        '<nav class="nav no-print">' +
          link('index.html#listings', 'listings', '物件') +
          (enabled('entrust') ? link('index.html#entrust', 'entrust', '委託') : '') +
          (enabled('contact') ? link('index.html#contact', 'contact', '聯絡') : '') +
        '</nav>' +
      '</div>';
  }

  function footer(extra) {
    const el = $('siteFooter');
    if (!el) return;
    el.innerHTML =
      '<div class="wrap">' +
        (extra || '') +
        '<p><b>' + esc(agent.company || agent.store || '') + '</b>' +
          (agent.store && agent.company ? '｜' + esc(agent.store) : '') +
          (agent.license ? '｜' + esc(agent.license) : '') + '</p>' +
        '<p>經紀人：' + esc(agent.name || '') + (agent.phone ? '｜電話 ' + esc(agent.phone) : '') + '</p>' +
        '<p class="muted">本網站物件資訊原則上以現況及不動產說明書為準；價格、坪數與試算僅供參考，不構成要約或投資建議。</p>' +
      '</div>';
  }

  function contactButtons(cls) {
    const b = [];
    if (agent.line) b.push('<a class="btn btn-line" href="' + esc(L.safeUrl(agent.line)) + '" target="_blank" rel="noopener">加 LINE 詢問</a>');
    if (agent.phone) b.push('<a class="btn btn-ghost" href="' + esc(L.telUrl(agent.phone)) + '">撥打 ' + esc(agent.phone) + '</a>');
    return '<div class="btns ' + (cls || '') + '">' + b.join('') + '</div>';
  }

  function cover(l) {
    const p = (l.photos || [])[0];
    return p ? L.safeUrl(p.src) : 'images/placeholder-house.svg';
  }

  /** 物件卡片（首頁用） */
  function listingCard(l, big) {
    const basis = L.unitBasis(l);
    const up = L.listingUnitPrice(l, basis);
    const area = basis === 'land' ? l.landPing : l.buildPing;
    return '<a class="lcard' + (big ? ' lcard-big' : '') + '" href="listing.html?id=' + encodeURIComponent(l.id) + '">' +
      '<div class="lcard-img"><img src="' + esc(cover(l)) + '" alt="' + esc(l.title) + '" loading="lazy">' +
        (l.status ? '<span class="tag">' + esc(l.status) + '</span>' : '') + '</div>' +
      '<div class="lcard-body">' +
        '<div class="meta">' + esc(l.type) + (l.area ? '・' + esc(l.area) : '') + '</div>' +
        '<h3>' + esc(l.title) + '</h3>' +
        '<div class="price">' + esc(L.formatWan(l.price)) + '</div>' +
        '<div class="meta">' + (area ? esc(L.fmtNum(area, 2)) + ' 坪（' + (basis === 'land' ? '地' : '建') + '）' : '') +
          (up ? '・單價 ' + esc(L.fmtNum(up, 2)) + ' 萬/坪' : '') + (l.layout ? '・' + esc(l.layout) : '') + '</div>' +
      '</div></a>';
  }

  function missing(msg) {
    const m = $('main');
    if (m) m.innerHTML = '<section class="card wrap"><h2>找不到資料</h2><p>' + esc(msg) + '</p><p><a class="btn" href="index.html">回首頁</a></p></section>';
  }

  /** 開發時在 console 列出欄位問題，方便改 data/site.js */
  function devCheck() {
    if (!SITE || !window.console) return;
    for (const r of L.validateSite(SITE)) {
      for (const e of r.errors) console.error('[site.js] ' + r.id + '：' + e);
      for (const w of r.warnings) console.warn('[site.js] ' + r.id + '：' + w);
    }
  }

  applyTheme();
  window.ListingApp = { L, SITE, esc, $, enabled, agent, header, footer, contactButtons, listingCard, cover, missing, devCheck };
})();
