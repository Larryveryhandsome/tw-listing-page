/* 首頁（經紀人入口）。 */
(function () {
  'use strict';
  const A = window.ListingApp;
  const { L, SITE, esc, $, enabled, agent } = A;

  A.header('home');
  A.footer();
  if (!SITE) { A.missing('沒有讀到 data/site.js，請確認檔案存在。'); return; }
  A.devCheck();
  document.title = SITE.siteTitle || ((agent.name || '') + '｜' + (agent.store || ''));

  const listings = SITE.listings || [];
  const html = [];

  // 認識我
  if (enabled('about')) {
    html.push(
      '<section class="hero" id="about"><div class="wrap hero-in">' +
        (agent.photo ? '<img class="avatar" src="' + esc(L.safeUrl(agent.photo)) + '" alt="' + esc(agent.name) + '">' : '') +
        '<div class="hero-text">' +
          '<div class="eyebrow">認識我</div>' +
          '<h1>' + esc(agent.name) + ' <small>' + esc(agent.title || '') + '</small></h1>' +
          '<p class="sub">' + esc(agent.store || '') + (agent.area ? '｜服務區域：' + esc(agent.area) : '') + '</p>' +
          (agent.intro ? '<p>' + esc(agent.intro) + '</p>' : '') +
          ((agent.skills || []).length ? '<ul class="chips">' + agent.skills.map(s => '<li>' + esc(s) + '</li>').join('') + '</ul>' : '') +
          (enabled('contact') ? A.contactButtons() : '') +
        '</div>' +
      '</div></section>');
  }

  // 強打物件
  const featured = listings.filter(l => l.featured);
  if (enabled('featured') && featured.length) {
    html.push('<section class="wrap block" id="featured"><h2>強打物件</h2><div class="grid grid-big">' +
      featured.map(l => A.listingCard(l, true)).join('') + '</div></section>');
  }

  // 精選物件＋篩選
  if (enabled('listings')) {
    const types = L.uniq(listings.map(l => l.type));
    const areas = L.uniq(listings.map(l => l.area || '其他'));
    const ranges = SITE.priceRanges || [];
    const opt = (v, t) => '<option value="' + esc(v) + '">' + esc(t) + '</option>';
    html.push(
      '<section class="wrap block" id="listings"><h2>精選物件</h2>' +
        '<form class="filters no-print" id="filters" onsubmit="return false">' +
          '<label>類型<select id="fType">' + opt('', '全部') + types.map(t => opt(t, t)).join('') + '</select></label>' +
          '<label>區域<select id="fArea">' + opt('', '全部') + areas.map(t => opt(t, t)).join('') + '</select></label>' +
          '<label>總價<select id="fPrice">' + opt('', '不限') + ranges.map((r, i) => opt(i, r.label)).join('') + '</select></label>' +
        '</form>' +
        '<p class="muted" id="count"></p>' +
        '<div class="grid" id="grid"></div>' +
      '</section>');
  }

  // 委託服務
  const en = SITE.entrust;
  if (enabled('entrust') && en) {
    html.push(
      '<section class="wrap block" id="entrust"><h2>委託服務</h2>' +
        '<h3>' + esc(en.title || '') + '</h3>' + (en.intro ? '<p>' + esc(en.intro) + '</p>' : '') +
        '<ol class="steps">' + (en.steps || []).map(s => '<li><b>' + esc(s.title) + '</b><span>' + esc(s.desc || '') + '</span></li>').join('') + '</ol>' +
      '</section>');
  }

  // 招募
  const rc = SITE.recruit;
  if (enabled('recruit') && rc) {
    html.push(
      '<section class="wrap block" id="recruit"><div class="card recruit"><h2>' + esc(rc.title || '招募專區') + '</h2>' +
        (rc.intro ? '<p>' + esc(rc.intro) + '</p>' : '') +
        '<ul class="ticks">' + (rc.points || []).map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' +
        (agent.line ? '<a class="btn" href="' + esc(L.safeUrl(agent.line)) + '" target="_blank" rel="noopener">' + esc(rc.cta || '用 LINE 詢問') + '</a>' : '') +
      '</div></section>');
  }

  // 聯絡
  if (enabled('contact')) {
    html.push(
      '<section class="wrap block" id="contact"><div class="card contact"><h2>聯絡我</h2>' +
        '<p>' + esc(agent.name) + '｜' + esc(agent.store || '') + '</p>' +
        (agent.hours ? '<p class="muted">' + esc(agent.hours) + '</p>' : '') +
        A.contactButtons('btns-big') +
      '</div></section>');
  }

  $('main').innerHTML = html.join('');

  // 篩選
  const grid = $('grid');
  if (grid) {
    const ranges = SITE.priceRanges || [];
    const render = () => {
      const r = ranges[$('fPrice').value];
      const list = L.filterListings(listings, {
        type: $('fType').value, area: $('fArea').value,
        priceMin: r ? r.min : null, priceMax: r ? r.max : null,
      });
      grid.innerHTML = list.length ? list.map(l => A.listingCard(l)).join('') : '<p class="empty">沒有符合條件的物件，換個條件試試。</p>';
      $('count').textContent = '共 ' + list.length + ' 間';
    };
    $('filters').addEventListener('change', render);
    render();
  }
})();
