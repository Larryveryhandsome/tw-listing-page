/* 物件頁：listing.html?id=xxx */
(function () {
  'use strict';
  const A = window.ListingApp;
  const { L, SITE, esc, $, enabled, agent } = A;

  A.header('listings');
  A.footer();
  if (!SITE) { A.missing('沒有讀到 data/site.js，請確認檔案存在。'); return; }
  A.devCheck();

  const id = L.getQueryParam(location.search, 'id') || ((SITE.listings || [])[0] || {}).id;
  const l = L.findListing(SITE, id);
  if (!l) { A.missing('找不到物件「' + (id || '') + '」，請確認網址的 id 和 data/site.js 一致。'); return; }
  document.title = l.title + '｜' + (agent.name || '') + ' ' + (agent.store || '');

  const basis = L.unitBasis(l);
  const up = L.listingUnitPrice(l, basis);
  const hidden = L.isAddressHidden(l, SITE);
  const addr = L.displayAddress(l, SITE);
  const comps = (SITE.comps || {})[l.id] || [];
  const html = [];

  // 標題
  html.push(
    '<section class="wrap block lhead">' +
      '<p class="crumb no-print"><a href="index.html#listings">← 回物件列表</a></p>' +
      '<div class="meta">' + esc(l.type) + (l.area ? '・' + esc(l.area) : '') + (l.status ? ' <span class="tag tag-inline">' + esc(l.status) + '</span>' : '') + '</div>' +
      '<h1>' + esc(l.title) + '</h1>' +
      '<div class="price big">' + esc(L.formatWan(l.price)) + (up ? '<small>單價約 ' + esc(L.fmtNum(up, 2)) + ' 萬/坪（以' + (basis === 'land' ? '地坪' : '建坪') + '計）</small>' : '') + '</div>' +
    '</section>');

  // 相簿
  const photos = (l.photos || []).filter(p => p && p.src);
  if (photos.length) {
    html.push(
      '<section class="wrap gallery">' +
        '<figure class="g-main"><img id="gMain" src="' + esc(L.safeUrl(photos[0].src)) + '" alt="' + esc(photos[0].caption || l.title) + '">' +
          '<figcaption id="gCap">' + esc(photos[0].caption || '') + '</figcaption></figure>' +
        (photos.length > 1 ? '<div class="g-thumbs no-print">' + photos.map((p, i) =>
          '<button type="button" data-i="' + i + '"' + (i === 0 ? ' aria-current="true"' : '') + ' aria-label="看第 ' + (i + 1) + ' 張"><img src="' + esc(L.safeUrl(p.src)) + '" alt=""></button>').join('') + '</div>' : '') +
      '</section>');
  }

  // 基本資訊
  const rows = [
    ['總價', L.formatWan(l.price)],
    ['單價', up ? L.fmtNum(up, 2) + ' 萬/坪（以' + (basis === 'land' ? '地坪' : '建坪') + '計）' : null],
    ['建坪', L.num(l.buildPing) ? L.formatArea(l.buildPing) : null],
    ['地坪', L.num(l.landPing) ? L.formatArea(l.landPing) : null],
    ['型態', l.type],
    ['格局', l.layout],
    ['屋齡', L.num(l.age) != null ? L.fmtNum(l.age, 1) + ' 年' : null],
    ['樓層', l.floor],
    ['車位', l.parking],
    ['使用分區', l.zoning],
    ['面臨路寬', L.num(l.roadWidth) != null ? L.fmtNum(l.roadWidth, 1) + ' 米' : null],
  ].filter(r => r[1] != null && r[1] !== '');
  html.push(
    '<section class="wrap block two">' +
      '<div class="card"><h2>基本資訊</h2><table class="info">' +
        rows.map(r => '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>').join('') +
      '</table>' +
      '<div class="conv no-print"><label>坪 <input id="cvPing" type="number" step="any" inputmode="decimal"></label>' +
        '<span>⇄</span><label>㎡ <input id="cvSqm" type="number" step="any" inputmode="decimal"></label></div>' +
      '</div>' +
      '<div class="card"><h2>物件特色</h2>' +
        ((l.highlights || []).length ? '<ul class="ticks">' + l.highlights.map(h => '<li>' + esc(h) + '</li>').join('') + '</ul>' : '') +
        (l.description ? '<p>' + esc(l.description) + '</p>' : '') +
        A.contactButtons() +
      '</div>' +
    '</section>');

  // 位置
  const mapUrl = L.listingMapsUrl(l, SITE, 'search');
  const dirUrl = L.listingMapsUrl(l, SITE, 'dir');
  const osm = enabled('osmMap') ? L.osmEmbedUrl(l) : '';
  html.push(
    '<section class="wrap block"><div class="card"><h2>位置</h2>' +
      '<p class="addr">' + esc(addr || '詳細位置請洽經紀人') + '</p>' +
      (hidden ? '<p class="muted">為保護屋主隱私，地址只顯示到路段；詳細門牌與看屋時間請洽經紀人。</p>' : '') +
      (mapUrl ? '<div class="btns no-print"><a class="btn" href="' + esc(mapUrl) + '" target="_blank" rel="noopener">在 Google 地圖查看</a>' +
        '<a class="btn btn-ghost" href="' + esc(dirUrl) + '" target="_blank" rel="noopener">Google 地圖導航</a></div>' : '') +
      (osm ? '<iframe class="osm" title="位置地圖" loading="lazy" referrerpolicy="no-referrer" src="' + esc(osm) + '"></iframe>' +
        '<p class="muted small">地圖資料 © OpenStreetMap contributors</p>' : '') +
    '</div></section>');

  // 周邊
  if (enabled('nearby') && (l.nearby || []).length) {
    html.push('<section class="wrap block"><div class="card"><h2>周邊生活機能</h2><ul class="nearby">' +
      l.nearby.map(n => '<li><span class="tag tag-inline">' + esc(n.type || '') + '</span><b>' + esc(n.name || '') + '</b><span class="muted">' + esc(n.distance || '') + '</span></li>').join('') +
      '</ul><p class="muted small">距離為概略值，原則上以實際路程為準。</p></div></section>');
  }

  // 規劃與說明
  for (const s of l.sections || []) {
    html.push('<section class="wrap block"><div class="card"><h2>' + esc(s.title || '') + '</h2>' +
      String(s.body || '').split(/\n+/).filter(Boolean).map(p => '<p>' + esc(p) + '</p>').join('') + '</div></section>');
  }

  // 投資試算
  if (enabled('invest') && l.invest) html.push(investBlock(l.invest));

  // 行情報告
  if (enabled('report') && comps.length) {
    html.push('<section class="wrap block"><div class="card cta-report"><h2>行情報告</h2>' +
      '<p>整理了 ' + comps.length + ' 筆附近的實價登錄成交紀錄，看看本案開價落在哪裡。</p>' +
      '<a class="btn" href="report.html?id=' + encodeURIComponent(l.id) + '">看行情報告</a></div></section>');
  }

  // 文件下載
  const docs = (l.documents || []).filter(d => d && d.url);
  if (enabled('documents') && docs.length) {
    html.push('<section class="wrap block"><div class="card"><h2>文件下載</h2><ul class="docs">' +
      docs.map(d => '<li><a href="' + esc(L.safeUrl(d.url)) + '" target="_blank" rel="noopener">' + esc(d.name || d.url) + '</a>' +
        (d.note ? ' <span class="muted">' + esc(d.note) + '</span>' : '') + '</li>').join('') +
      '</ul></div></section>');
  }

  // 聯絡經紀人
  html.push(
    '<section class="wrap block"><div class="card contact"><h2>想看屋？</h2>' +
      '<p>' + esc(agent.title || '') + ' ' + esc(agent.name || '') + '｜' + esc(agent.store || '') + '</p>' +
      A.contactButtons('btns-big') + '</div></section>');

  // 說明與法規
  html.push(
    '<section class="wrap block"><div class="card disclaimer"><h2>說明</h2><ul>' +
      '<li>本頁為廣告資訊，經紀業：' + esc(agent.company || agent.store || '') + (agent.license ? '（' + esc(agent.license) + '）' : '') + '。</li>' +
      '<li>坪數、屋齡、使用分區等資料原則上以權狀、謄本及不動產說明書記載為準；如有出入，以不動產說明書為準。</li>' +
      '<li>照片可能為示意圖，實際屋況以現場為準。</li>' +
      '<li>試算與行情資料僅供參考，不構成投資建議。</li>' +
    '</ul></div></section>');

  $('main').innerHTML = html.join('');

  // 相簿切換
  document.querySelectorAll('.g-thumbs button').forEach(b => b.addEventListener('click', () => {
    const p = photos[+b.dataset.i];
    $('gMain').src = L.safeUrl(p.src);
    $('gMain').alt = p.caption || l.title;
    $('gCap').textContent = p.caption || '';
    document.querySelectorAll('.g-thumbs button').forEach(x => x.removeAttribute('aria-current'));
    b.setAttribute('aria-current', 'true');
  }));

  // 坪⇄㎡ 換算
  const cvP = $('cvPing'), cvS = $('cvSqm');
  cvP.addEventListener('input', () => { const v = L.pingToSqm(cvP.value); cvS.value = v == null ? '' : L.round(v, 2); });
  cvS.addEventListener('input', () => { const v = L.sqmToPing(cvS.value); cvP.value = v == null ? '' : L.round(v, 2); });

  if (enabled('invest') && l.invest) wireInvest();

  // ---------- 投資試算 ----------
  function investBlock(inv) {
    const f = (key, label, unit, val, step) =>
      '<label><span>' + esc(label) + '</span><span class="in"><input type="number" step="' + (step || 'any') + '" inputmode="decimal" data-k="' + key + '" value="' + esc(val == null ? '' : val) + '"><i>' + esc(unit) + '</i></span></label>';
    const pct = v => (L.num(v) == null ? '' : L.round(v * 100, 4));
    return '<section class="wrap block" id="invest"><div class="card invest">' +
      '<h2>投資試算' + (inv.label ? '<small>' + esc(inv.label) + '</small>' : '') + '</h2>' +
      '<p class="warn">試算僅供參考：數字是依您輸入的假設計算，實際稅費、利率、售價與租金以實際情況為準，不構成投資建議。</p>' +
      '<div class="inv-grid">' +
        '<fieldset><legend>購入</legend>' +
          f('purchase', '購入總價', '萬', inv.purchase) + f('taxFees', '稅費規費', '萬', inv.taxFees) + f('renovation', '裝修', '萬', inv.renovation) +
        '</fieldset>' +
        '<fieldset><legend>持有</legend>' +
          f('holdingMonthly', '每月持有成本', '元/月', inv.holdingMonthly) + f('holdingMonths', '持有月數', '月', inv.holdingMonths, '1') +
        '</fieldset>' +
        '<fieldset><legend>貸款</legend>' +
          f('loanRatio', '貸款成數', '%', pct(inv.loanRatio)) + f('rate', '年利率', '%', pct(inv.rate)) + f('years', '年期', '年', inv.years, '1') +
        '</fieldset>' +
        '<fieldset><legend>出場</legend>' +
          f('salePrice', '預估售價', '萬', inv.salePrice) + f('sellCost', '出售成本', '萬', inv.sellCost) + f('monthlyRent', '預估月租金', '元/月', inv.monthlyRent) +
        '</fieldset>' +
      '</div>' +
      '<div class="inv-out" id="invOut" aria-live="polite"></div>' +
      '<p class="muted small">月付為本息平均攤還；總成本含持有期間的貸款利息；報酬率＝毛利 ÷ 自有資金（自備款＋稅費＋裝修＋持有成本＋持有期間所繳房貸）；年化報酬＝(1＋報酬率)^(12 ÷ 持有月數) − 1。</p>' +
    '</div></section>';
  }

  function wireInvest() {
    const box = $('invest');
    const read = () => {
      const o = {};
      box.querySelectorAll('input[data-k]').forEach(i => { o[i.dataset.k] = i.value === '' ? null : Number(i.value); });
      if (o.loanRatio != null) o.loanRatio /= 100;
      if (o.rate != null) o.rate /= 100;
      return o;
    };
    const card = (label, val, cls) => '<div class="kpi ' + (cls || '') + '"><span>' + esc(label) + '</span><b>' + esc(val) + '</b></div>';
    const draw = () => {
      const r = L.investCalc(read());
      const sign = v => (v == null ? '' : v >= 0 ? 'pos' : 'neg');
      $('invOut').innerHTML =
        card('自備款', L.formatWan(r.downPayment, 1)) +
        card('貸款金額', L.formatWan(r.loan, 1)) +
        card('月付（本息平均攤還）', L.fmtNum(Math.round(r.monthlyPayment), 0) + ' 元') +
        card('持有成本合計', L.formatWan(r.holdingTotal, 1)) +
        card('持有期間利息', L.formatWan(r.interestDuringHold, 1)) +
        card('總成本', L.formatWan(r.totalCost, 1)) +
        card('自有資金投入', L.formatWan(r.cashInvested, 1)) +
        (r.profit != null ? card('毛利', L.formatWan(r.profit, 1), sign(r.profit)) +
          card('報酬率（自有資金）', L.formatPct(r.roi), sign(r.roi)) +
          card('年化報酬', L.formatPct(r.annualized), sign(r.annualized)) : '') +
        (r.grossYield != null ? card('租金毛投報率', L.formatPct(r.grossYield, 2)) +
          card('租金淨投報率（扣持有成本）', L.formatPct(r.netYield, 2)) : '');
    };
    box.addEventListener('input', draw);
    draw();
  }
})();
