// 執行：npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const L = require('../js/core.js');

const root = path.join(__dirname, '..');
const loadSite = file => {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'data', file), 'utf8'), ctx);
  return ctx.window.SITE;
};
const SITE = loadSite('site.js');
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= (eps || 1e-9), msg || `${a} ≈ ${b}`);

test('坪 ⇄ 平方公尺：1 坪 = 3.305785 ㎡，來回換算不失真', () => {
  near(L.pingToSqm(1), 3.305785);
  near(L.sqmToPing(330.5785), 100);
  near(L.sqmToPing(L.pingToSqm(68.4)), 68.4);
  assert.equal(L.pingToSqm(''), null);
  assert.equal(L.pingToSqm('abc'), null);
});

test('價格格式：萬、億、千分位、空值', () => {
  assert.equal(L.formatWan(1680), '1,680 萬');
  assert.equal(L.formatWan(528.5), '528.5 萬');
  assert.equal(L.formatWan(12500), '1 億 2,500 萬');
  assert.equal(L.formatWan(20000), '2 億');
  assert.equal(L.formatWan(null), '—');
  assert.equal(L.formatArea(10), '10 坪（33.06 ㎡）');
  assert.equal(L.formatPct(0.12345), '12.3%');
});

test('單價：建物用建坪、土地用地坪、可強制 unitBasis', () => {
  near(L.unitPrice(1680, 68.4), 1680 / 68.4);
  assert.equal(L.unitPrice(1000, 0), null);
  assert.equal(L.unitBasis({ type: '透天', buildPing: 60, landPing: 30 }), 'build');
  assert.equal(L.unitBasis({ type: '建地', landPing: 60 }), 'land');
  assert.equal(L.unitBasis({ type: '工業地', buildPing: 200, landPing: 380 }), 'land');
  assert.equal(L.unitBasis({ type: '店面', buildPing: 70, landPing: 28, unitBasis: 'land' }), 'land');
  near(L.listingUnitPrice({ type: '農地', price: 1350, landPing: 450 }), 3);
});

test('房貸月付（本息平均攤還）：1,000 萬、2%、30 年 ≈ 36,962 元', () => {
  const m = L.mortgagePayment(10000000, 0.02, 30);
  assert.equal(Math.round(m), 36962);
  // 零利率＝本金平均攤
  near(L.mortgagePayment(3600000, 0, 30), 10000);
  assert.equal(L.mortgagePayment(0, 0.02, 30), 0);
});

test('攤還表：繳滿全期本金歸零，利息＝總繳 − 本金', () => {
  const a = L.amortize(10000000, 0.02, 30, 360);
  near(a.balance, 0, 1e-3);
  near(a.principal, 10000000, 1e-3);
  near(a.interest, a.payment * 360 - 10000000, 1e-3);
  const first = L.amortize(10000000, 0.02, 30, 1);
  near(first.interest, 10000000 * 0.02 / 12, 1e-6);
});

test('投資試算：沒有貸款時可手算驗證', () => {
  const r = L.investCalc({ purchase: 1000, taxFees: 30, renovation: 70, holdingMonthly: 10000, holdingMonths: 12,
    loanRatio: 0, salePrice: 1300, sellCost: 40, monthlyRent: 30000 });
  near(r.downPayment, 1000);
  near(r.holdingTotal, 12);           // 1 萬 × 12 月
  near(r.totalCost, 1112);            // 1000 + 30 + 70 + 12
  near(r.profit, 148);                // 1300 − 40 − 1112
  near(r.roi, 148 / 1112);
  near(r.annualized, 148 / 1112);     // 剛好 12 個月，年化＝報酬率
  near(r.grossYield, 36 / 1100);      // 年租 36 萬 ÷ (1000+30+70)
  near(r.netYield, 24 / 1100);
});

test('投資試算：有貸款時自備款、月付、持有利息合理', () => {
  const r = L.investCalc({ purchase: 1000, loanRatio: 0.8, rate: 0.02, years: 30, holdingMonths: 6, salePrice: 1100 });
  near(r.loan, 800);
  near(r.downPayment, 200);
  near(r.monthlyPayment, L.mortgagePayment(8000000, 0.02, 30));
  assert.ok(r.interestDuringHold > 0 && r.interestDuringHold < 800 * 0.02 * 0.5 + 1e-9);
  // 槓桿：自有資金報酬率高於總成本報酬率
  assert.ok(r.roi > r.roiOnTotal);
  // 沒填售價就不算毛利
  assert.equal(L.investCalc({ purchase: 500 }).profit, null);
});

test('統計：中位數、平均、四分位（同 Excel QUARTILE.INC）、百分位', () => {
  const a = [10, 20, 30, 40, 50];
  assert.equal(L.median(a), 30);
  assert.equal(L.median([4, 1, 3, 2]), 2.5);
  assert.equal(L.mean(a), 30);
  assert.equal(L.quantile(a, 0.25), 20);
  assert.equal(L.quantile([1, 2, 3, 4], 0.25), 1.75);
  assert.equal(L.percentileRank(30, a), 50);
  assert.equal(L.percentileRank(5, a), 0);
  assert.equal(L.percentileRank(99, a), 100);
  assert.equal(L.median([]), null);
  assert.deepEqual(L.stats([3, 1, 2]), { n: 3, min: 1, max: 3, mean: 2, median: 2, q1: 1.5, q3: 2.5 });
});

test('實價登錄：排除特殊交易、議價空間公式', () => {
  const comps = [
    { price: 1000, buildPing: 50 }, { price: 1100, buildPing: 50 }, { price: 1200, buildPing: 50 },
    { price: 500, buildPing: 50, special: true, note: '親友交易' },
  ];
  const listing = { type: '透天', price: 1250, buildPing: 50 };
  const all = L.marketReport(listing, comps, { excludeSpecial: false });
  const ex = L.marketReport(listing, comps, { excludeSpecial: true });
  assert.equal(all.used.length, 4);
  assert.equal(ex.used.length, 3);
  assert.equal(ex.stats.median, 22);
  near(ex.ask, 25);
  near(ex.bargaining, (25 - 22) / 25);
  assert.equal(ex.percentile, 100);
  assert.equal(L.bargainingRoom(0, 10), null);
  near(L.bargainingRoom(20, 22), -0.1); // 開價低於行情 → 負數
});

test('地址遮蔽到路段', () => {
  assert.equal(L.maskAddress('示範市中正路一段100巷5號3樓'), '示範市中正路一段');
  assert.equal(L.maskAddress('示範市民生路二段50號5樓'), '示範市民生路二段');
  assert.equal(L.maskAddress('示範市文化街12號'), '示範市文化街');
  assert.equal(L.maskAddress('示範市工業一路20號'), '示範市工業一路');
  assert.equal(L.maskAddress('示範市某某里88號'), '示範市某某里');
  assert.equal(L.maskAddress(''), '');
  const site = { privacy: { hideAddress: true } };
  assert.equal(L.displayAddress({ address: '示範市中山路三段8號' }, site), '示範市中山路三段');
  assert.equal(L.displayAddress({ address: '示範市中山路三段8號', hideAddress: false }, site), '示範市中山路三段8號');
});

test('Google 地圖連結：座標優先、沒有座標用遮蔽後地址、不外洩門牌', () => {
  assert.equal(L.mapsUrl({ lat: 24.148, lng: 120.674 }, 'dir'), 'https://www.google.com/maps/dir/?api=1&destination=24.148%2C120.674');
  assert.equal(L.mapsUrl({ query: '示範市中正路一段' }), 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('示範市中正路一段'));
  assert.equal(L.mapsUrl({}), '');
  const u = L.listingMapsUrl({ address: '示範市中正路一段100號' }, { privacy: { hideAddress: true } }, 'search');
  assert.ok(!decodeURIComponent(u).includes('100號'), u);
  assert.ok(L.osmEmbedUrl({ lat: 24.1, lng: 120.6 }).startsWith('https://www.openstreetmap.org/export/embed.html?bbox='));
  assert.equal(L.osmEmbedUrl({}), '');
});

test('HTML 跳脫與網址白名單', () => {
  assert.equal(L.esc('<img src=x onerror="a">&\''), '&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;');
  assert.equal(L.esc(null), '');
  assert.equal(L.safeUrl('javascript:alert(1)'), '#');
  assert.equal(L.safeUrl(' JavaScript:alert(1)'), '#');
  assert.equal(L.safeUrl('data:text/html,x'), '#');
  assert.equal(L.safeUrl('//evil.example'), '#');
  assert.equal(L.safeUrl('https://line.me/R/ti/p/@example'), 'https://line.me/R/ti/p/@example');
  assert.equal(L.safeUrl('images/a.svg'), 'images/a.svg');
  assert.equal(L.telUrl('0900-000-001'), 'tel:0900000001');
  assert.equal(L.safeColor('red;background:url(x)', '#000'), '#000');
  assert.equal(L.safeColor('#1f6f5c', '#000'), '#1f6f5c');
});

test('網址參數：getQueryParam', () => {
  assert.equal(L.getQueryParam('?id=demo-shop', 'id'), 'demo-shop');
  assert.equal(L.getQueryParam('?a=1&id=%E7%A4%BA', 'id'), '示');
  assert.equal(L.getQueryParam('?a=1', 'id'), null);
  assert.equal(L.getQueryParam('?id=%E0%A4%A', 'id'), '');
});

test('欄位檢查：缺必填、id 格式、個資文件、精確座標都會提醒', () => {
  const bad = L.validateListing({ id: 'a b', title: '', type: '透天' });
  assert.ok(bad.errors.some(e => e.includes('title')));
  assert.ok(bad.errors.some(e => e.includes('price')));
  assert.ok(bad.errors.some(e => e.includes('id 只能')));
  const w = L.validateListing({ id: 'x', title: 't', type: '透天', price: 100, buildPing: 30, area: 'A', photos: [{ src: 'a' }],
    lat: 24.123456, lng: 120.123456, hideAddress: true, documents: [{ name: '土地謄本', url: 'docs/a.pdf' }] });
  assert.equal(w.errors.length, 0);
  assert.ok(w.warnings.some(x => x.includes('座標')));
  assert.ok(w.warnings.some(x => x.includes('個資')));
  const dup = L.validateSite({ listings: [{ id: 'a', title: 't', type: 't', price: 1 }, { id: 'a', title: 't', type: 't', price: 1 }] });
  assert.ok(dup[1].errors.some(e => e.includes('重複')));
});

test('首頁篩選：類型、區域、總價區間（下限含、上限不含）', () => {
  const list = [{ type: '透天', area: 'A', price: 800 }, { type: '店面', area: 'B', price: 3000 }, { type: '透天', price: 500 }];
  assert.equal(L.filterListings(list, { type: '透天' }).length, 2);
  assert.equal(L.filterListings(list, { area: '其他' }).length, 1);
  assert.equal(L.filterListings(list, { priceMax: 800 }).length, 1);
  assert.equal(L.filterListings(list, { priceMin: 800, priceMax: 1500 }).length, 1);
  assert.equal(L.filterListings(list, {}).length, 3);
});

test('示範資料：每一間物件都通過檢查、沒有錯誤', () => {
  assert.ok(SITE && Array.isArray(SITE.listings));
  assert.ok(SITE.listings.length >= 5 && SITE.listings.length <= 6);
  for (const r of L.validateSite(SITE)) assert.deepEqual(r.errors, [], r.id + ' ' + r.errors.join('；'));
  for (const l of SITE.listings) {
    assert.ok(L.listingUnitPrice(l) > 0, l.id + ' 算不出單價');
    assert.ok(L.listingMapsUrl(l, SITE, 'dir').startsWith('https://www.google.com/maps/dir/'), l.id);
  }
});

test('示範資料：類型齊全、至少 1 間有投資試算、首頁區塊開關存在', () => {
  const types = new Set(SITE.listings.map(l => l.type));
  for (const t of ['透天', '華廈套房', '店面', '建地', '農地', '工業地']) assert.ok(types.has(t), t);
  assert.ok(SITE.listings.filter(l => l.invest).length >= 1);
  for (const k of ['about', 'featured', 'listings', 'entrust', 'recruit', 'contact']) assert.ok(k in SITE.sections, k);
  assert.equal(SITE.agent.phone, '0900-000-001');
  assert.equal(SITE.agent.line, 'https://line.me/R/ti/p/@example');
});

test('示範資料：至少 2 間有 15 筆以上成交、含特殊交易，議價空間算得出來', () => {
  const ids = Object.keys(SITE.comps).filter(id => SITE.comps[id].length >= 15);
  assert.ok(ids.length >= 2, ids.join(','));
  for (const id of ids) {
    const l = L.findListing(SITE, id);
    assert.ok(l, '比較案例對不到物件 ' + id);
    assert.ok(SITE.comps[id].some(c => c.special && c.note), id + ' 沒有特殊交易');
    const r = L.marketReport(l, SITE.comps[id], { excludeSpecial: true });
    assert.ok(r.stats.n >= 12);
    assert.ok(r.bargaining > -0.5 && r.bargaining < 0.5, String(r.bargaining));
    assert.ok(r.percentile >= 0 && r.percentile <= 100);
  }
});

test('示範投資試算：數字合理（報酬率在 -100%～+100% 之間）', () => {
  for (const l of SITE.listings.filter(x => x.invest)) {
    const r = L.investCalc(l.invest);
    assert.ok(r.monthlyPayment > 0, l.id);
    assert.ok(r.totalCost > l.invest.purchase, l.id);
    if (r.roi != null) assert.ok(r.roi > -1 && r.roi < 1, l.id + ' ' + r.roi);
  }
});

test('範本 site.example.js 可以載入、結構完整', () => {
  const ex = loadSite('site.example.js');
  assert.ok(ex.agent && ex.sections && ex.listings.length === 1);
  assert.deepEqual(L.validateListing(ex.listings[0], ex).errors, []);
  assert.ok(ex.listings[0].invest && ex.comps[ex.listings[0].id]);
});

test('網頁引用的圖片和腳本都存在', () => {
  const refs = new Set();
  for (const l of SITE.listings) {
    for (const p of l.photos || []) refs.add(p.src);
    for (const d of l.documents || []) refs.add(d.url);
  }
  refs.add(SITE.agent.photo);
  for (const f of ['index.html', 'listing.html', 'report.html']) {
    const html = fs.readFileSync(path.join(root, f), 'utf8');
    for (const m of html.matchAll(/(?:src|href)="([^"#:]+)"/g)) refs.add(m[1]);
    assert.ok(!/<script[^>]+src="https?:/i.test(html), f + ' 不應載入外部腳本');
  }
  for (const r of refs) assert.ok(fs.existsSync(path.join(root, r)), '找不到 ' + r);
});
