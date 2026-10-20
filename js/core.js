/*
 * tw-listing-page 核心（純函式，不碰畫面）
 * 瀏覽器：window.ListingCore；Node：require('./core.js')
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ListingCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- 安全 ----------
  /** 插入 HTML 前一律跑這個 */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  /** 只允許 http(s)、tel:、相對路徑；其他（javascript: 之類）一律變成 '#' */
  function safeUrl(u) {
    const s = String(u == null ? '' : u).trim();
    if (!s) return '#';
    if (/^(https?:|tel:)/i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('//') || s.startsWith('\\')) return '#';
    return s; // 相對路徑，例如 images/xxx.svg
  }
  /** 主題色只收 #RGB/#RRGGBB 或英文色名，避免塞奇怪的 CSS */
  function safeColor(c, fallback) {
    const s = String(c == null ? '' : c).trim();
    return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(s) || /^[a-z]{3,20}$/i.test(s) ? s : fallback;
  }
  /** 電話轉成 tel: 連結（只留數字和 +） */
  function telUrl(phone) {
    const d = String(phone == null ? '' : phone).replace(/[^\d+]/g, '');
    return d ? 'tel:' + d : '#';
  }

  // ---------- 數字與單位 ----------
  const SQM_PER_PING = 3.305785; // 1 坪 = 3.305785 平方公尺
  const num = v => (v === '' || v == null || typeof v === 'boolean' || !Number.isFinite(Number(v)) ? null : Number(v));
  const round = (v, d) => { const p = Math.pow(10, d || 0); return Math.round(v * p) / p; };
  function pingToSqm(ping) { const p = num(ping); return p == null ? null : p * SQM_PER_PING; }
  function sqmToPing(sqm) { const s = num(sqm); return s == null ? null : s / SQM_PER_PING; }

  /** 千分位，最多 d 位小數（尾巴的 0 不顯示） */
  function fmtNum(v, d) {
    const n = num(v);
    if (n == null) return '—';
    return n.toLocaleString('en-US', { maximumFractionDigits: d == null ? 2 : d });
  }
  /** 1680 → "1,680 萬"；12500 → "1 億 2,500 萬" */
  function formatWan(wan, d) {
    const n = num(wan);
    if (n == null) return '—';
    const dd = d == null ? 1 : d;
    const neg = n < 0 ? '-' : '';
    const a = Math.abs(n);
    if (a >= 10000) {
      const yi = Math.floor(a / 10000);
      const rest = round(a - yi * 10000, dd);
      return neg + yi + ' 億' + (rest ? ' ' + fmtNum(rest, dd) + ' 萬' : '');
    }
    return neg + fmtNum(a, dd) + ' 萬';
  }
  /** 35.2 → "35.2 坪（116.36 ㎡）" */
  function formatArea(ping) {
    const p = num(ping);
    if (p == null) return '—';
    return fmtNum(p, 2) + ' 坪（' + fmtNum(pingToSqm(p), 2) + ' ㎡）';
  }
  function formatPct(r, d) {
    const n = num(r);
    return n == null ? '—' : fmtNum(n * 100, d == null ? 1 : d) + '%';
  }

  // ---------- 單價 ----------
  const LAND_TYPES = ['建地', '農地', '工業地', '土地'];
  /** 單價用建坪還是地坪：土地類用地坪，其他用建坪；item.unitBasis 可強制 'build' / 'land' */
  function unitBasis(item) {
    if (!item) return 'build';
    if (item.unitBasis === 'land' || item.unitBasis === 'build') return item.unitBasis;
    if (LAND_TYPES.includes(item.type)) return 'land';
    return num(item.buildPing) ? 'build' : 'land';
  }
  /** 單價（萬/坪）；price 單位是萬 */
  function unitPrice(price, ping) {
    const p = num(price), a = num(ping);
    return p == null || !a ? null : p / a;
  }
  function listingUnitPrice(item, basis) {
    if (!item) return null;
    if (num(item.unitPrice) != null) return num(item.unitPrice);
    const b = basis || unitBasis(item);
    return unitPrice(item.price, b === 'land' ? item.landPing : item.buildPing);
  }

  // ---------- 貸款與投資試算 ----------
  /** 本息平均攤還每月付款（元）。principal 元、annualRate 例如 0.02、years 年 */
  function mortgagePayment(principal, annualRate, years) {
    const P = num(principal), y = num(years), rate = num(annualRate) || 0;
    if (!P || !y || P <= 0 || y <= 0) return 0;
    const n = Math.round(y * 12), r = rate / 12;
    if (r === 0) return P / n;
    return P * r / (1 - Math.pow(1 + r, -n));
  }
  /** 前 months 個月付掉的利息、本金，以及剩餘本金（元） */
  function amortize(principal, annualRate, years, months) {
    const pay = mortgagePayment(principal, annualRate, years);
    const r = (num(annualRate) || 0) / 12;
    let bal = num(principal) || 0, interest = 0, princ = 0;
    const m = Math.min(Math.max(0, Math.round(num(months) || 0)), Math.round((num(years) || 0) * 12));
    for (let i = 0; i < m; i++) {
      const it = bal * r;
      interest += it; princ += pay - it; bal -= pay - it;
    }
    return { payment: pay, months: m, interest, principal: princ, balance: Math.max(0, bal) };
  }

  /**
   * 投資試算。
   * 輸入金額單位：萬（purchase、taxFees、renovation、salePrice、sellCost）；
   * holdingMonthly、monthlyRent：元/月；loanRatio、rate 用小數（0.7 = 七成、0.0215 = 2.15%）。
   * 回傳金額單位：萬；monthlyPayment 是元/月。
   */
  function investCalc(input) {
    const i = Object.assign({ purchase: 0, taxFees: 0, renovation: 0, holdingMonthly: 0, holdingMonths: 0,
      loanRatio: 0, rate: 0, years: 30, salePrice: null, sellCost: 0, monthlyRent: null }, input || {});
    const v = k => num(i[k]) || 0;
    const purchase = v('purchase'), months = Math.max(0, Math.round(v('holdingMonths')));
    const loan = purchase * Math.min(Math.max(v('loanRatio'), 0), 1);
    const down = purchase - loan;
    const am = amortize(loan * 10000, v('rate'), v('years'), months);
    const holdingTotal = v('holdingMonthly') * months / 10000;
    const interestDuringHold = am.interest / 10000;
    // 總成本：買價＋稅費＋裝修＋持有成本＋持有期間貸款利息
    const totalCost = purchase + v('taxFees') + v('renovation') + holdingTotal + interestDuringHold;
    // 自有資金：自備款＋稅費＋裝修＋持有成本＋持有期間繳的房貸
    const cashInvested = down + v('taxFees') + v('renovation') + holdingTotal + am.payment * am.months / 10000;
    const out = {
      loan, downPayment: down, monthlyPayment: am.payment, holdingTotal, interestDuringHold,
      loanBalance: am.balance / 10000, totalCost, cashInvested,
      profit: null, roi: null, roiOnTotal: null, annualized: null, grossYield: null, netYield: null,
    };
    const sale = num(i.salePrice);
    if (sale != null) {
      out.profit = sale - v('sellCost') - totalCost;
      out.roiOnTotal = totalCost ? out.profit / totalCost : null;
      out.roi = cashInvested > 0 ? out.profit / cashInvested : null;
      if (out.roi != null && months > 0 && out.roi > -1) out.annualized = Math.pow(1 + out.roi, 12 / months) - 1;
    }
    const rent = num(i.monthlyRent);
    if (rent != null) {
      const base = purchase + v('taxFees') + v('renovation');
      if (base > 0) {
        out.grossYield = rent * 12 / 10000 / base;
        out.netYield = (rent - v('holdingMonthly')) * 12 / 10000 / base;
      }
    }
    return out;
  }

  // ---------- 統計 ----------
  const sorted = arr => (arr || []).filter(x => num(x) != null).map(Number).sort((a, b) => a - b);
  function mean(arr) { const a = sorted(arr); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; }
  /** 分位數（線性內插，和 Excel QUARTILE.INC / PERCENTILE.INC 相同） */
  function quantile(arr, q) {
    const a = sorted(arr);
    if (!a.length) return null;
    const pos = (a.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return a[lo] + (a[hi] - a[lo]) * (pos - lo);
  }
  function median(arr) { return quantile(arr, 0.5); }
  /** 百分位：比 value 低的比例（相同的算一半），0–100 */
  function percentileRank(value, arr) {
    const a = sorted(arr), v = num(value);
    if (!a.length || v == null) return null;
    const below = a.filter(x => x < v).length, same = a.filter(x => x === v).length;
    return (below + same / 2) / a.length * 100;
  }
  function stats(arr) {
    const a = sorted(arr);
    return { n: a.length, min: a.length ? a[0] : null, max: a.length ? a[a.length - 1] : null,
      mean: mean(a), median: median(a), q1: quantile(a, 0.25), q3: quantile(a, 0.75) };
  }

  // ---------- 實價登錄比較 ----------
  /** 每筆成交補上 unitPriceCalc（萬/坪），basis 與本案相同 */
  function prepareComps(comps, basis) {
    return (comps || []).map(c => Object.assign({}, c, {
      unitPriceCalc: num(c.unitPrice) != null ? num(c.unitPrice) : unitPrice(c.price, basis === 'land' ? c.landPing : c.buildPing),
      special: !!c.special,
    }));
  }
  function filterComps(comps, opts) {
    const o = opts || {};
    return (comps || []).filter(c => !(o.excludeSpecial && c.special));
  }
  /** 議價空間 = (開價單價 − 成交中位數) / 開價單價 */
  function bargainingRoom(askUnit, medianUnit) {
    const a = num(askUnit), m = num(medianUnit);
    if (!a || m == null) return null;
    return (a - m) / a;
  }
  /** 行情報告一次算好：本案單價、比較案例、統計、百分位、議價空間 */
  function marketReport(listing, comps, opts) {
    const basis = unitBasis(listing);
    const all = prepareComps(comps, basis);
    const used = filterComps(all, opts).filter(c => c.unitPriceCalc != null);
    const prices = used.map(c => c.unitPriceCalc);
    const ask = listingUnitPrice(listing, basis);
    const s = stats(prices);
    return { basis, ask, all, used, stats: s, percentile: percentileRank(ask, prices), bargaining: bargainingRoom(ask, s.median) };
  }

  // ---------- 地址與地圖 ----------
  /** 遮到路段：「示範市中正路一段100巷5號3樓」→「示範市中正路一段」 */
  function maskAddress(addr) {
    const s = String(addr == null ? '' : addr).trim();
    if (!s) return '';
    const m = s.match(/^.*?(?:路|街|大道)(?:[一二三四五六七八九十0-9０-９]+段)?/);
    if (m) return m[0];
    const d = s.search(/[0-9０-９]/);
    return d > 0 ? s.slice(0, d).trim() : s;
  }
  function isAddressHidden(listing, site) {
    if (listing && listing.hideAddress != null) return !!listing.hideAddress;
    return !!(site && site.privacy && site.privacy.hideAddress);
  }
  function displayAddress(listing, site) {
    return isAddressHidden(listing, site) ? maskAddress(listing.address) : String(listing.address || '');
  }
  function hasCoord(l) {
    const lat = num(l && l.lat), lng = num(l && l.lng);
    return lat != null && lng != null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  }
  /** Google 地圖連結（不需要金鑰）。mode: 'search' 看位置、'dir' 導航 */
  function mapsUrl(target, mode) {
    const q = hasCoord(target) ? Number(target.lat) + ',' + Number(target.lng) : String((target && target.query) || '').trim();
    if (!q) return '';
    return mode === 'dir'
      ? 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q)
      : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  }
  /** 物件的地圖連結：有座標用座標，沒有就用「顯示用地址」（隱藏時只送路段） */
  function listingMapsUrl(listing, site, mode) {
    return mapsUrl({ lat: listing.lat, lng: listing.lng, query: displayAddress(listing, site) }, mode);
  }
  /** OpenStreetMap 內嵌地圖網址（需座標） */
  function osmEmbedUrl(listing, delta) {
    if (!hasCoord(listing)) return '';
    const d = delta || 0.006, lat = Number(listing.lat), lng = Number(listing.lng);
    const bbox = [lng - d, lat - d * 0.7, lng + d, lat + d * 0.7].map(x => x.toFixed(5)).join(',');
    return 'https://www.openstreetmap.org/export/embed.html?bbox=' + encodeURIComponent(bbox) + '&layer=mapnik&marker=' + lat + '%2C' + lng;
  }

  // ---------- 物件 ----------
  function findListing(site, id) {
    const list = (site && site.listings) || [];
    return list.find(l => String(l.id) === String(id)) || null;
  }
  function getQueryParam(search, key) {
    const pairs = String(search || '').replace(/^\?/, '').split('&').filter(Boolean).map(p => p.split('='));
    const dec = s => { try { return decodeURIComponent(String(s || '').replace(/\+/g, ' ')); } catch (e) { return ''; } };
    const m = pairs.find(p => dec(p[0]) === key);
    return m ? dec(m.slice(1).join('=')) : null;
  }
  const REQUIRED = ['id', 'title', 'type', 'price'];
  const PRIVATE_DOC = /謄本|地籍|身分證|身份證|權狀|印鑑/;
  /** 檢查物件欄位：errors 是缺了頁面會壞的；warnings 是建議補上的 */
  function validateListing(l, site) {
    const errors = [], warnings = [];
    if (!l || typeof l !== 'object') return { errors: ['不是物件資料'], warnings };
    for (const k of REQUIRED) if (l[k] == null || l[k] === '') errors.push('缺少必填欄位 ' + k);
    if (l.id != null && l.id !== '' && !/^[A-Za-z0-9_-]+$/.test(String(l.id))) errors.push('id 只能用英數、-、_：' + l.id);
    if (l.price != null && l.price !== '' && num(l.price) == null) errors.push('price 必須是數字（單位：萬）');
    if (!num(l.buildPing) && !num(l.landPing)) warnings.push('建坪 buildPing／地坪 landPing 都沒填，無法算單價');
    if (!l.area) warnings.push('沒填區域 area，首頁篩選會歸到「其他」');
    if (!l.photos || !l.photos.length) warnings.push('沒有照片 photos');
    if (!hasCoord(l) && !l.address) warnings.push('座標和地址都沒填，無法產生導航連結');
    if (isAddressHidden(l, site) && hasCoord(l)) {
      const dec = s => (String(s).split('.')[1] || '').length;
      if (dec(l.lat) > 3 || dec(l.lng) > 3) warnings.push('地址設為隱藏，但座標很精確；建議座標只留小數 3 位（約 100 公尺）');
    }
    if (l.invest && num(l.invest.purchase) == null) warnings.push('invest.purchase（購入總價）沒填');
    for (const d of l.documents || []) {
      if (PRIVATE_DOC.test(String(d.name || '') + ' ' + String(d.url || ''))) warnings.push('文件「' + d.name + '」可能含個資，不建議放公開網站');
    }
    return { errors, warnings };
  }
  function validateSite(site) {
    const out = [];
    const seen = new Set();
    for (const l of (site && site.listings) || []) {
      const r = validateListing(l, site);
      if (l && seen.has(l.id)) r.errors.push('id 重複：' + l.id);
      if (l) seen.add(l.id);
      out.push(Object.assign({ id: l && l.id }, r));
    }
    return out;
  }

  /** 首頁篩選：type、area、priceMin（含）、priceMax（不含）；單位萬，null 代表不限 */
  function filterListings(list, f) {
    const o = f || {};
    return (list || []).filter(l => {
      if (o.type && l.type !== o.type) return false;
      if (o.area && (l.area || '其他') !== o.area) return false;
      const p = num(l.price);
      if (num(o.priceMin) != null && (p == null || p < num(o.priceMin))) return false;
      if (num(o.priceMax) != null && (p == null || p >= num(o.priceMax))) return false;
      return true;
    });
  }
  const uniq = arr => Array.from(new Set((arr || []).filter(x => x != null && x !== '')));

  return {
    SQM_PER_PING, LAND_TYPES, esc, safeUrl, safeColor, telUrl, num, round, pingToSqm, sqmToPing,
    fmtNum, formatWan, formatArea, formatPct,
    unitBasis, unitPrice, listingUnitPrice, mortgagePayment, amortize, investCalc,
    mean, median, quantile, percentileRank, stats, prepareComps, filterComps, bargainingRoom, marketReport,
    maskAddress, isAddressHidden, displayAddress, hasCoord, mapsUrl, listingMapsUrl, osmEmbedUrl,
    findListing, getQueryParam, validateListing, validateSite, filterListings, uniq,
  };
});
