// 開源前的個資防線：專案裡不能出現 email、真實地名或店名關鍵字。執行：npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const SKIP = new Set(['.git', 'node_modules', 'LICENSE']);
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(js|html|css|svg|md|json|txt)$|^NOTICE$|^\.git/.test(e.name)) out.push(p);
  }
  return out;
}
const files = walk(root, []);

test('沒有任何 email 地址', () => {
  const re = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/;
  for (const f of files) {
    if (path.basename(f) === 'privacy.test.js') continue;
    const m = fs.readFileSync(f, 'utf8').match(re);
    assert.equal(m, null, path.relative(root, f) + '：' + (m && m[0]));
  }
});

test('示範資料只用「示範」地名與假電話', () => {
  const site = fs.readFileSync(path.join(root, 'data', 'site.js'), 'utf8');
  for (const m of site.matchAll(/address: '([^']+)'/g)) assert.ok(m[1].startsWith('示範市'), m[1]);
  const phones = site.match(/09\d{2}-?\d{3}-?\d{3}/g) || [];
  for (const p of phones) assert.equal(p, '0900-000-001');
});

test('沒有照片或 PDF 等二進位檔', () => {
  const bins = [];
  (function scan(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (/\.(jpe?g|png|gif|webp|heic|pdf|docx?|xlsx?)$/i.test(e.name)) bins.push(path.relative(root, p));
    }
  })(root);
  assert.deepEqual(bins, []);
});
