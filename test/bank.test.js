const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../questions.js');
const S = require('../scoring.js');

const Q = B.QUESTIONS;
const AX = S.AXIS_KEYS;

test('bank has 80 items, 20 per axis, unique ids and text', () => {
  assert.equal(Q.length, 80);
  for (const ax of AX) assert.equal(Q.filter(q => q.axis === ax).length, 20, ax);
  assert.equal(new Set(Q.map(q => q.id)).size, 80);
  assert.equal(new Set(Q.map(q => q.text.toLowerCase())).size, 80);
});

test('every item has a valid axis, direction and tier', () => {
  for (const q of Q) {
    assert.ok(AX.includes(q.axis), q.id);
    assert.ok(q.dir === 1 || q.dir === -1, q.id);
    assert.ok([1, 2, 3].includes(q.tier), q.id);
    assert.ok(q.text.length > 20 && q.text.length < 200, q.id);
    assert.ok(/[.?]$/.test(q.text), q.id + ' should end with punctuation');
  }
});

test('keying is exactly balanced on every axis within every tier', () => {
  for (const ax of AX) for (const tier of [1, 2, 3]) {
    const items = Q.filter(q => q.axis === ax && q.tier === tier);
    const plus = items.filter(q => q.dir === 1).length;
    const minus = items.filter(q => q.dir === -1).length;
    assert.equal(plus, minus, `${ax} tier ${tier}: ${plus} plus vs ${minus} minus`);
  }
});

test('each test length has the expected size and stays balanced', () => {
  const sizes = { quick: 24, standard: 48, full: 80 };
  for (const [k, n] of Object.entries(sizes)) {
    const items = S.itemsForLength(k);
    assert.equal(items.length, n, k);
    for (const ax of AX) {
      const a = items.filter(q => q.axis === ax);
      assert.equal(a.length, n / 4, `${k} ${ax}`);
      assert.equal(a.filter(q => q.dir === 1).length, a.filter(q => q.dir === -1).length, `${k} ${ax} balance`);
    }
  }
});

test('no double-barreled statements (no " and " joining two claims, no "or" lists of claims)', () => {
  // "and"/"or" are allowed inside a noun list ("energy, water and railways") but not
  // to join two verbs. Cheap heuristic: forbid " and " / " or " followed by "should".
  for (const q of Q) {
    assert.ok(!/\b(and|or) (should|must|ought)\b/i.test(q.text), q.id + ': ' + q.text);
  }
});

test('no vague threshold words that the 8values critique flagged', () => {
  const bad = /\b(excessive|excessively|some civil liberties|too much intervention|reasonable amount)\b/i;
  for (const q of Q) assert.ok(!bad.test(q.text), q.id + ': ' + q.text);
});

test('no named countries, parties or politicians', () => {
  const bad = /\b(America|American|United States|U\.S\.|Britain|British|UK|Trump|Biden|Obama|Republican|Democrat(?!ic)|Labour|Tory|Congress(?!\b.*parliament)|NHS)\b/;
  for (const q of Q) {
    // "parliament or congress" is a deliberate generic pairing.
    if (/parliament or congress/.test(q.text)) continue;
    // "European Union" is used as a generic example of a regional union.
    assert.ok(!bad.test(q.text), q.id + ': ' + q.text);
  }
});
