const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../questions.js');
const S = require('../scoring.js');
const Q = B.QUESTIONS, AX = S.AXIS_KEYS;

function answersWhere(fn) {
  const a = {};
  for (const q of Q) { const v = fn(q); if (v !== undefined) a[q.id] = v; }
  return a;
}

test('agreeing with everything scores 0 on every axis (yes-saying cancels out)', () => {
  const r = S.score(answersWhere(() => ({ value: 2, important: false })));
  for (const ax of AX) assert.equal(r.axes[ax].score, 0, ax);
  assert.equal(r.acquiescence, 2);
});

test('disagreeing with everything scores 0 on every axis', () => {
  const r = S.score(answersWhere(() => ({ value: -2, important: false })));
  for (const ax of AX) assert.equal(r.axes[ax].score, 0, ax);
  assert.equal(r.acquiescence, -2);
});

test('a perfectly consistent respondent hits +100 or -100 and acquiescence 0', () => {
  const r = S.score(answersWhere(q => ({ value: 2 * q.dir, important: false })));
  for (const ax of AX) assert.equal(r.axes[ax].score, 100, ax);
  assert.equal(r.acquiescence, 0);
  const l = S.score(answersWhere(q => ({ value: -2 * q.dir, important: false })));
  for (const ax of AX) assert.equal(l.axes[ax].score, -100, ax);
});

test('mixed profile lands on the expected sides', () => {
  // left, libertarian, progressive, global: agree with minus-keyed, disagree with plus-keyed
  const r = S.score(answersWhere(q => ({ value: -1 * q.dir, important: false })));
  for (const ax of AX) assert.equal(r.axes[ax].score, -50, ax);
  assert.equal(S.quadrant(r.axes.econ.score, r.axes.auth.score), 'Libertarian Left');
  const labels = S.closestLabels(r, 3);
  assert.ok(['Social Democrat', 'Left-Libertarian / Green', 'Democratic Socialist'].includes(labels[0].name), labels[0].name);
});

test('skips are excluded, neutrals count toward the centre', () => {
  const skipped = S.score(answersWhere(q => q.axis === 'econ' ? { value: q.dir === 1 ? 2 : null, important: false } : undefined));
  assert.equal(skipped.axes.econ.score, 100);          // only plus-keyed answered, all agree
  assert.equal(skipped.skipped, 10);
  const neutral = S.score(answersWhere(q => q.axis === 'econ' ? { value: q.dir === 1 ? 2 : 0, important: false } : undefined));
  assert.equal(neutral.axes.econ.score, 50);           // 10 strong agrees + 10 neutrals
  assert.equal(neutral.axes.auth.score, null);
  assert.equal(neutral.axes.auth.enough, false);
});

test('fewer than three answers on an axis is flagged as not enough', () => {
  const two = Q.filter(q => q.axis === 'auth').slice(0, 2);
  const r = S.score({ [two[0].id]: { value: 1 }, [two[1].id]: { value: 1 } });
  assert.equal(r.axes.auth.enough, false);
  assert.ok(r.axes.auth.score !== null);
});

test('important flag weights the item 1.5x', () => {
  const items = Q.filter(q => q.axis === 'glob' && q.tier === 1); // 3 plus, 3 minus
  const a = {};
  items.forEach(q => { a[q.id] = { value: 2 * q.dir, important: false }; });
  // flip one minus-keyed item to strongly disagree its own pole... i.e. push plus
  const flip = items.find(q => q.dir === -1);
  a[flip.id] = { value: 2, important: false };   // agrees with a minus-keyed statement -> pushes minus
  const base = S.score(a).axes.glob.score;       // (5*2 - 2) / 12 = 66.7
  assert.equal(base, 66.7);
  a[flip.id].important = true;
  const weighted = S.score(a).axes.glob.score;   // (10 - 3) / (10 + 3) = 53.8
  assert.equal(weighted, 53.8);
});

test('band thresholds', () => {
  assert.equal(S.band('econ', 0).label, 'Centre');
  assert.equal(S.band('econ', -9.9).label, 'Centre');
  assert.equal(S.band('econ', -10).label, 'Leans Left');
  assert.equal(S.band('econ', 30).label, 'Right');
  assert.equal(S.band('auth', 60).label, 'Strongly Authoritarian');
  assert.equal(S.band('cult', -75).label, 'Strongly Progressive');
  assert.equal(S.band('glob', null).label, 'Not enough answers');
});

test('share link encode/decode round-trips for every length', () => {
  for (const len of ['quick', 'standard', 'full']) {
    const items = S.itemsForLength(len);
    const a = {};
    items.forEach((q, i) => {
      a[q.id] = i % 7 === 0 ? { value: null, important: false } : { value: (i % 5) - 2, important: i % 3 === 0 };
    });
    const enc = S.encode(len, a);
    assert.equal(enc.length, 80);
    const dec = S.decode(enc);
    assert.deepEqual(dec, a);
    assert.deepEqual(S.score(dec), S.score(a));
  }
  assert.equal(S.decode('x'.repeat(80)), null);
  assert.equal(S.decode('0'.repeat(79)), null);
});

test('label coordinates are within range and names unique', () => {
  const names = new Set();
  for (const l of S.LABELS) {
    assert.equal(l.pos.length, 4);
    l.pos.forEach(v => assert.ok(v >= -100 && v <= 100));
    assert.ok(!names.has(l.name)); names.add(l.name);
  }
});
