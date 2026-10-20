/* 行情報告頁：report.html?id=xxx */
(function () {
  'use strict';
  const A = window.ListingApp;
  const C = window.ListingCharts;
  const { L, SITE, esc, $, agent } = A;

  A.header('listings');
  A.footer();
  if (!SITE) { A.missing('沒有讀到 data/site.js，請確認檔案存在。'); return; }
  A.devCheck();

  const allComps = SITE.comps || {};
  const id = L.getQueryParam(location.search, 'id');
  const l = id ? L.findListing(SITE, id) : null;
  const comps = l ? allComps[l.id] || [] : [];

  if (!l || !comps.length) {
    const withComps = (SITE.listings || []).filter(x => (allComps[x.id] || []).length);
    $('main').innerHTML = '<section class="wrap block"><div class="card"><h1>行情報告</h1>' +
      (id ? '<p>物件「' + esc(id) + '」沒有比較案例資料。</p>' : '<p>選一個物件：</p>') +
      '<ul class="docs">' + withComps.map(x => '<li><a href="report.html?id=' + encodeURIComponent(x.id) + '">' + esc(x.title) + '</a></li>').join('') + '</ul>' +
      '</div></section>';
    return;
  }
  document.title = '行情報告｜' + l.title;

  const basisText = L.unitBasis(l) === 'land' ? '地坪' : '建坪';
  const toX = d => { const m = String(d || '').match(/^(\d{4})[-/.](\d{1,2})/); return m ? +m[1] + (+m[2] - 1) / 12 : null; };
  const fmtX = v => { const y = Math.floor(v + 1e-9); const m = Math.round((v - y) * 12) + 1; return y + '/' + String(m).padStart(2, '0'); };

  $('main').innerHTML =
    '<section class="wrap block lhead">' +
      '<p class="crumb no-print"><a href="listing.html?id=' + encodeURIComponent(l.id) + '">← 回物件頁</a></p>' +
      '<div class="eyebrow">行情報告</div>' +
      '<h1>' + esc(l.title) + '</h1>' +
      '<p class="sub">' + esc(L.displayAddress(l, SITE)) + '｜開價 ' + esc(L.formatWan(l.price)) + '｜單價以' + basisText + '計（萬/坪）</p>' +
      '<label class="toggle no-print"><input type="checkbox" id="exSpecial" checked> 排除特殊交易（親友交易、含增建、瑕疵…）</label>' +
    '</section>' +
    '<section class="wrap block"><div class="kpis" id="kpis"></div></section>' +
    '<section class="wrap block two">' +
      '<div class="card"><h2>本案開價單價 vs 近期成交</h2><div id="bar"></div></div>' +
      '<div class="card"><h2 id="scTitle"></h2><div id="scatter"></div><div id="scLegend"></div></div>' +
    '</section>' +
    '<section class="wrap block"><div class="card"><h2>實價登錄明細</h2><div class="table-wrap"><table class="tbl" id="tbl"></table></div>' +
      '<p class="muted small">資料來源：內政部不動產交易實價查詢服務網（實價登錄），由經紀人自行查詢後整理填入；地址僅顯示至路段。</p></div></section>' +
    '<section class="wrap block"><div class="card disclaimer"><h2>怎麼算</h2><ul>' +
      '<li>單價＝總價 ÷ ' + basisText + '（萬/坪）。</li>' +
      '<li>中位數、四分位採線性內插（同 Excel QUARTILE.INC）。</li>' +
      '<li>本案落點百分位：成交單價低於本案開價單價的比例（相同的算一半）。</li>' +
      '<li>議價空間＝(開價單價 − 成交中位數) ÷ 開價單價；負數代表開價低於成交中位數。</li>' +
      '<li>行情分析原則上僅供參考，個案條件（屋況、樓層、面寬、臨路）差異大，不構成投資建議。</li>' +
      '<li>製表：' + esc(agent.company || agent.store || '') + '　' + esc(agent.name || '') + '</li>' +
    '</ul></div></section>';

  function draw() {
    const ex = $('exSpecial').checked;
    const R = L.marketReport(l, comps, { excludeSpecial: ex });
    const s = R.stats;
    const kpi = (label, val, cls) => '<div class="kpi ' + (cls || '') + '"><span>' + esc(label) + '</span><b>' + esc(val) + '</b></div>';
    const u = v => (v == null ? '—' : L.fmtNum(v, 2) + ' 萬/坪');
    $('kpis').innerHTML =
      kpi('本案開價單價', u(R.ask), 'hl') +
      kpi('成交中位數', u(s.median)) +
      kpi('平均', u(s.mean)) +
      kpi('第 1 四分位', u(s.q1)) +
      kpi('第 3 四分位', u(s.q3)) +
      kpi('最低／最高', s.n ? L.fmtNum(s.min, 2) + '／' + L.fmtNum(s.max, 2) : '—') +
      kpi('列入筆數', s.n + ' 筆') +
      kpi('本案落點百分位', R.percentile == null ? '—' : '第 ' + L.fmtNum(R.percentile, 0) + ' 百分位') +
      kpi('議價空間（估）', L.formatPct(R.bargaining), 'hl');

    // 長條圖：本案＋列入統計的成交，依單價排序
    const bars = [{ label: '本案開價', value: R.ask, kind: 'subject' }].concat(
      R.used.slice().sort((a, b) => b.unitPriceCalc - a.unitPriceCalc).map(c => ({
        label: c.date + ' ' + L.maskAddress(c.address).replace(/^示範市/, ''), value: c.unitPriceCalc, kind: c.special ? 'special' : 'normal',
      })));
    $('bar').innerHTML = C.barChart(bars, { unit: '萬/坪', title: '開價單價與成交單價', refLines: s.median != null ? [{ value: s.median, label: '中位數 ' + L.fmtNum(s.median, 1) }] : [] });

    // 散佈圖：有屋齡用屋齡，土地用成交年月；特殊交易一律畫出來但用不同顏色
    const useAge = L.num(l.age) != null && R.all.filter(c => L.num(c.age) != null).length >= R.all.length / 2;
    const pts = R.all.filter(c => c.unitPriceCalc != null).map(c => ({
      x: useAge ? L.num(c.age) : toX(c.date), y: c.unitPriceCalc, kind: c.special ? 'special' : 'normal',
      label: c.date + ' ' + L.maskAddress(c.address) + (c.special ? '（' + (c.note || '特殊交易') + '）' : ''),
    }));
    const nowX = toX(new Date().toISOString().slice(0, 7));
    pts.push({ x: useAge ? L.num(l.age) : nowX, y: R.ask, kind: 'subject', label: '本案' });
    $('scTitle').textContent = useAge ? '屋齡 × 單價' : '成交時間 × 單價';
    $('scatter').innerHTML = C.scatterChart(pts, { xLabel: useAge ? '屋齡（年）' : '成交年月', yLabel: '單價（萬/坪）', title: $('scTitle').textContent, xFormat: useAge ? undefined : fmtX });
    $('scLegend').innerHTML = C.legend([{ kind: 'subject', label: '本案（開價）' }, { kind: 'normal', label: '一般成交' }, { kind: 'special', label: '特殊交易' }]);

    // 明細表
    const rows = R.all.filter(c => !(ex && c.special)).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const n = (v, d) => (L.num(v) == null ? '' : L.fmtNum(v, d));
    $('tbl').innerHTML =
      '<thead><tr><th>成交年月</th><th>路段</th><th>型態</th><th>屋齡</th><th>建坪</th><th>地坪</th><th>總價（萬）</th><th>單價（萬/坪）</th><th>備註</th></tr></thead><tbody>' +
      rows.map(c => '<tr' + (c.special ? ' class="special"' : '') + '><td>' + esc(c.date) + '</td><td>' + esc(L.maskAddress(c.address)) + '</td><td>' + esc(c.type || '') +
        '</td><td>' + n(c.age, 1) + '</td><td>' + n(c.buildPing, 2) + '</td><td>' + n(c.landPing, 2) + '</td><td>' + n(c.price, 1) +
        '</td><td><b>' + n(c.unitPriceCalc, 2) + '</b></td><td>' + (c.special ? '<span class="tag tag-inline tag-warn">特殊交易</span> ' : '') + esc(c.note || '') + '</td></tr>').join('') +
      '</tbody>';
  }
  $('exSpecial').addEventListener('change', draw);
  draw();
})();
