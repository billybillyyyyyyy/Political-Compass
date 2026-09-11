const test = require('node:test');
const assert = require('node:assert/strict');
const { FIGURES } = require('../figures.js');

test('figures have unique ids and names, four in-range positions, a reason and a wiki title', () => {
  assert.ok(FIGURES.length >= 50);
  const ids = new Set(), names = new Set();
  for (const f of FIGURES) {
    assert.ok(!ids.has(f.id), f.id); ids.add(f.id);
    assert.ok(!names.has(f.name), f.name); names.add(f.name);
    assert.ok(/^[a-z0-9]+$/.test(f.id), f.id);
    assert.equal(f.pos.length, 4, f.name);
    f.pos.forEach(v => assert.ok(Number.isInteger(v) && v >= -100 && v <= 100, f.name));
    assert.ok(f.why.length > 20, f.name);
    assert.ok(f.role.length > 3, f.name);
    assert.ok(/^[A-Za-z0-9_.%()\-]+$/.test(f.wiki), f.name + ' wiki title');
  }
});

test('figures spread across all four quadrants of the classic compass', () => {
  const q = { ll: 0, lr: 0, al: 0, ar: 0 };
  for (const f of FIGURES) {
    const k = (f.pos[1] < 0 ? 'l' : 'a') + (f.pos[0] < 0 ? 'l' : 'r');
    q[k]++;
  }
  for (const k of Object.keys(q)) assert.ok(q[k] >= 5, k + ' quadrant has only ' + q[k]);
});
