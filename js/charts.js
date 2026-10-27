/*
 * tw-listing-page 圖表：用純字串產生 inline SVG（不用任何外部套件，方便測試）
 * 顏色交給 css/style.css 的 .ch-* class，深色模式自動跟著換。
 * 瀏覽器：window.ListingCharts；Node：require('./charts.js')
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ListingCharts = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const f = (v, d) => Number(v).toFixed(d == null ? 1 : d).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  const isNum = v => typeof v === 'number' && Number.isFinite(v);

  /** 漂亮的刻度：niceTicks(13.2, 47.9) → [10, 20, 30, 40, 50] */
  function niceTicks(min, max, count) {
    let lo = Number(min), hi = Number(max);
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [0, 1];
    if (lo === hi) { lo -= 1; hi += 1; }
    if (lo > hi) { const t = lo; lo = hi; hi = t; }
    const raw = (hi - lo) / Math.max(1, count || 5);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) || 10 * mag;
    const start = Math.floor(lo / step) * step, end = Math.ceil(hi / step) * step;
    const out = [];
    for (let v = start; v <= end + step / 2; v += step) out.push(Math.round(v / step) * step);
    return out.map(v => Number(v.toPrecision(12)));
  }

  /**
   * 橫條圖。items: [{ label, value, kind: 'subject'|'normal'|'special'|'stat' }]
   * opts: { unit, title, refLines: [{ value, label }], width, decimals }
   */
  function barChart(items, opts) {
    const o = Object.assign({ unit: '', title: '', refLines: [], width: 640, decimals: 1 }, opts || {});
    const rows = (items || []).filter(it => isNum(it.value));
    const W = o.width, labelW = 150, padR = 70, rowH = 26, top = 16, bottom = 28;
    const H = top + rows.length * rowH + bottom;
    if (!rows.length) return '<svg class="chart" viewBox="0 0 ' + W + ' 60" role="img" aria-label="沒有資料"><text class="ch-label" x="' + W / 2 + '" y="34" text-anchor="middle">沒有可畫的資料</text></svg>';
    const maxV = Math.max(...rows.map(r => r.value), ...(o.refLines || []).filter(r => isNum(r.value)).map(r => r.value));
    const ticks = niceTicks(0, maxV, 4);
    const scaleMax = ticks[ticks.length - 1] || 1;
    const x = v => labelW + (W - labelW - padR) * (v / scaleMax);
    let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || '長條圖') + '">';
    if (o.title) s += '<title>' + esc(o.title) + '</title>';
    for (const t of ticks) {
      s += '<line class="ch-grid" x1="' + f(x(t)) + '" x2="' + f(x(t)) + '" y1="' + top + '" y2="' + (H - bottom) + '"/>';
      s += '<text class="ch-tick" x="' + f(x(t)) + '" y="' + (H - bottom + 16) + '" text-anchor="middle">' + esc(f(t, 2)) + '</text>';
    }
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      const kind = ['subject', 'special', 'stat'].includes(r.kind) ? r.kind : 'normal';
      s += '<text class="ch-label' + (kind === 'subject' ? ' ch-strong' : '') + '" x="' + (labelW - 8) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end">' + esc(r.label) + '</text>';
      s += '<rect class="ch-bar ch-bar-' + kind + '" x="' + labelW + '" y="' + (y + 4) + '" width="' + f(Math.max(1, x(r.value) - labelW)) + '" height="' + (rowH - 8) + '" rx="3">';
      s += '<title>' + esc(r.label + '：' + f(r.value, o.decimals) + ' ' + o.unit) + '</title></rect>';
      s += '<text class="ch-value" x="' + f(x(r.value) + 6) + '" y="' + (y + rowH / 2 + 4) + '">' + esc(f(r.value, o.decimals)) + '</text>';
    });
    for (const ref of o.refLines || []) {
      if (!isNum(ref.value)) continue;
      s += '<line class="ch-ref" x1="' + f(x(ref.value)) + '" x2="' + f(x(ref.value)) + '" y1="' + (top - 6) + '" y2="' + (H - bottom) + '"/>';
      s += '<text class="ch-ref-label" x="' + f(x(ref.value) + 4) + '" y="' + (top + 2) + '">' + esc(ref.label) + '</text>';
    }
    return s + '</svg>';
  }

  /**
   * 散佈圖。points: [{ x, y, kind: 'subject'|'normal'|'special', label }]
   * opts: { xLabel, yLabel, title, width, height, xFormat(v) }
   */
  function scatterChart(points, opts) {
    const o = Object.assign({ xLabel: '', yLabel: '', title: '', width: 640, height: 360 }, opts || {});
    const pts = (points || []).filter(p => isNum(p.x) && isNum(p.y));
    const W = o.width, H = o.height, L = 56, R = 16, T = 20, B = 46;
    if (!pts.length) return '<svg class="chart" viewBox="0 0 ' + W + ' 60" role="img" aria-label="沒有資料"><text class="ch-label" x="' + W / 2 + '" y="34" text-anchor="middle">沒有可畫的資料</text></svg>';
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const xt = niceTicks(Math.min(...xs), Math.max(...xs), 5), yt = niceTicks(Math.min(...ys), Math.max(...ys), 5);
    const x0 = xt[0], x1 = xt[xt.length - 1], y0 = yt[0], y1 = yt[yt.length - 1];
    const sx = v => L + (W - L - R) * ((v - x0) / ((x1 - x0) || 1));
    const sy = v => H - B - (H - T - B) * ((v - y0) / ((y1 - y0) || 1));
    const xf = typeof o.xFormat === 'function' ? o.xFormat : v => f(v, 2);
    let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || '散佈圖') + '">';
    if (o.title) s += '<title>' + esc(o.title) + '</title>';
    for (const t of yt) {
      s += '<line class="ch-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + f(sy(t)) + '" y2="' + f(sy(t)) + '"/>';
      s += '<text class="ch-tick" x="' + (L - 6) + '" y="' + f(sy(t) + 4) + '" text-anchor="end">' + esc(f(t, 2)) + '</text>';
    }
    for (const t of xt) {
      s += '<line class="ch-grid" x1="' + f(sx(t)) + '" x2="' + f(sx(t)) + '" y1="' + T + '" y2="' + (H - B) + '"/>';
      s += '<text class="ch-tick" x="' + f(sx(t)) + '" y="' + (H - B + 16) + '" text-anchor="middle">' + esc(xf(t)) + '</text>';
    }
    s += '<line class="ch-axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>';
    s += '<line class="ch-axis" x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + (H - B) + '"/>';
    if (o.xLabel) s += '<text class="ch-label" x="' + ((L + W - R) / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(o.xLabel) + '</text>';
    if (o.yLabel) s += '<text class="ch-label" x="14" y="' + ((T + H - B) / 2) + '" text-anchor="middle" transform="rotate(-90 14 ' + ((T + H - B) / 2) + ')">' + esc(o.yLabel) + '</text>';
    // 本案畫在最上層
    const order = pts.slice().sort((a, b) => (a.kind === 'subject') - (b.kind === 'subject'));
    for (const p of order) {
      const cx = f(sx(p.x)), cy = f(sy(p.y));
      const tip = '<title>' + esc((p.label ? p.label + '：' : '') + xf(p.x) + '，' + f(p.y, 2)) + '</title>';
      if (p.kind === 'subject') {
        const X = sx(p.x), Y = sy(p.y), r = 9;
        s += '<path class="ch-pt ch-pt-subject" d="M' + f(X) + ' ' + f(Y - r) + 'L' + f(X + r) + ' ' + f(Y) + 'L' + f(X) + ' ' + f(Y + r) + 'L' + f(X - r) + ' ' + f(Y) + 'Z">' + tip + '</path>';
        s += '<text class="ch-label ch-strong" x="' + f(X + 12) + '" y="' + f(Y - 8) + '">' + esc(p.label || '本案') + '</text>';
      } else {
        s += '<circle class="ch-pt ch-pt-' + (p.kind === 'special' ? 'special' : 'normal') + '" cx="' + cx + '" cy="' + cy + '" r="5">' + tip + '</circle>';
      }
    }
    return s + '</svg>';
  }

  /** 圖例（HTML 字串） */
  function legend(entries) {
    return '<div class="ch-legend">' + (entries || []).map(e =>
      '<span><i class="sw sw-' + esc(e.kind) + '"></i>' + esc(e.label) + '</span>').join('') + '</div>';
  }

  return { niceTicks, barChart, scatterChart, legend, esc };
});
