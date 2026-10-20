// 執行：npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/charts.js');

const count = (s, re) => (s.match(re) || []).length;

test('刻度：涵蓋資料範圍、間距一致', () => {
  const t = C.niceTicks(13.2, 47.9, 4);
  assert.ok(t[0] <= 13.2 && t[t.length - 1] >= 47.9, t.join(','));
  const steps = t.slice(1).map((v, i) => +(v - t[i]).toFixed(9));
  assert.ok(steps.every(s => s === steps[0]), steps.join(','));
  assert.deepEqual(C.niceTicks(0, 100, 5), [0, 20, 40, 60, 80, 100]);
  assert.ok(C.niceTicks(5, 5).length >= 2);
});

test('長條圖：每筆一條、本案有 subject 樣式、中位數參考線', () => {
  const svg = C.barChart([
    { label: '本案開價', value: 24.5, kind: 'subject' },
    { label: 'A', value: 22 }, { label: 'B', value: 20, kind: 'special' },
  ], { unit: '萬/坪', refLines: [{ value: 21, label: '中位數' }] });
  assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
  assert.equal(count(svg, /<rect class="ch-bar /g), 3);
  assert.equal(count(svg, /ch-bar-subject/g), 1);
  assert.equal(count(svg, /ch-bar-special/g), 1);
  assert.equal(count(svg, /class="ch-ref"/g), 1);
  assert.ok(!/NaN|undefined/.test(svg));
});

test('長條圖：長度和數值成正比', () => {
  const svg = C.barChart([{ label: 'a', value: 10 }, { label: 'b', value: 20 }]);
  const w = [...svg.matchAll(/<rect class="ch-bar[^"]*"[^>]* width="([\d.]+)"/g)].map(m => +m[1]);
  assert.equal(w.length, 2);
  assert.ok(Math.abs(w[1] / w[0] - 2) < 0.01, w.join(','));
});

test('散佈圖：本案用菱形、特殊交易不同 class、跳過無效點', () => {
  const svg = C.scatterChart([
    { x: 10, y: 20 }, { x: 15, y: 18 }, { x: 12, y: 14, kind: 'special', label: '親友交易' },
    { x: 13, y: 24.5, kind: 'subject', label: '本案' }, { x: null, y: 3 }, { x: 'a', y: 3 },
  ], { xLabel: '屋齡（年）', yLabel: '單價（萬/坪）' });
  assert.equal(count(svg, /<circle /g), 3);
  assert.equal(count(svg, /ch-pt-special/g), 1);
  assert.equal(count(svg, /<path class="ch-pt ch-pt-subject"/g), 1);
  assert.ok(svg.includes('屋齡（年）'));
  assert.ok(!/NaN|undefined/.test(svg));
});

test('圖表文字一律跳脫，不能注入 HTML', () => {
  const evil = '<script>alert(1)</script>';
  const a = C.barChart([{ label: evil, value: 1 }], { title: evil });
  const b = C.scatterChart([{ x: 1, y: 1, label: evil }], { xLabel: evil });
  for (const s of [a, b, C.legend([{ kind: 'x"', label: evil }])]) {
    assert.ok(!s.includes('<script>'), s);
    assert.ok(s.includes('&lt;script&gt;'));
  }
});

test('沒有資料時回傳提示，不會壞掉', () => {
  assert.ok(C.barChart([]).includes('沒有可畫的資料'));
  assert.ok(C.scatterChart([{ x: null, y: null }]).includes('沒有可畫的資料'));
});
