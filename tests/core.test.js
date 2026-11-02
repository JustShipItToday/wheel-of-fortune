// node tests/core.test.js
const C = require('../src/js/core.js'); const assert = require('assert');
const cfg = { bankrupts: { 3: 2, 4: 2, 5: 2, 6: 2 }, values: '$500-$900', freePlay: 'off', sliver: false, five: false };
assert.strictEqual(C.landing(0, 3, cfg), 'Bankrupt');
assert.strictEqual(C.landing(3599, 3, cfg), '$2,500');
assert.strictEqual(C.landing(3599, 4, cfg), '$3,500');
assert.strictEqual(C.landing(3599, 6, cfg), '$5,000');
assert.strictEqual(C.landing(1125, 4, cfg), 'Mystery 1');
assert.strictEqual(C.landing(3075, 5, cfg), 'Express');
assert.strictEqual(C.landing(2325, 3, Object.assign({}, cfg, { sliver: true })), '$5,000');
assert.strictEqual(C.landing(2251, 3, Object.assign({}, cfg, { sliver: true })), 'Bankrupt');
assert.deepStrictEqual(C.scribe('wheel of \\ fortune').cells.join('') , 'WHEELOFFORTUNE');
const ex = C.scribe('wheel of \\ fortune').cells; assert.strictEqual(ex[15], 'W'); assert.strictEqual(ex[29], 'F');
assert.strictEqual(C.scribe('a \\ b \\ c \\ d \\ e').error, 5);
assert.strictEqual(C.scribe('abcdefghijklmno').error, 1);
assert.strictEqual(C.fmt(1234567), '1,234,567'); assert.strictEqual(C.parseNum('$1,000'), 1000); assert.strictEqual(C.parseNum('abc'), null);
const p = C.properties(C.scribe('happy \\ birthday \\ to you').cells); assert.strictEqual(p.total, 18); assert.strictEqual(p.rstlneRatio, 17);
assert.ok(C.lettersMatch('É', 'E')); assert.ok(!C.lettersMatch('É', 'A'));
// spin length
const SP = C.SPIN, base = { base: 3.6, tension: true, over: {} };
assert.deepStrictEqual(SP.KEYS.map(k => C.spinSeconds(k, base)), [3.6, 4.1, 4.1, 4.5, 6.3, 7.2]);                       // the defaults
assert.deepStrictEqual(SP.KEYS.map(k => C.spinSeconds(k, { base: 3.6, tension: false, over: {} })), [3.6, 3.6, 3.6, 3.6, 3.6, 3.6]);   // tension off: all the base
assert.strictEqual(C.spinSeconds('bonus', { base: 3.6, tension: true, over: { bonus: 5 } }), 5);                          // an override wins
assert.strictEqual(C.spinSeconds('bonus', { base: 3.6, tension: false, over: { bonus: 5 } }), 5);
assert.strictEqual(C.spinSeconds('bonus', { base: 15, tension: true, over: {} }), 30);                                    // capped
assert.strictEqual(C.spinSeconds('normal', { base: 0, tension: true, over: {} }), 3.6);                                   // junk base -> default
assert.ok(SP.KEYS.every(k => C.spinSeconds(k, { base: 1.5, tension: false, over: {} }) >= SP.MIN));
assert.deepStrictEqual([[3, false], [4, false], [5, false], [6, false], [6, true], [41, false], [3, true], [1, false]].map(a => C.spinKey(a[0], a[1])), ['normal', 'mystery', 'express', 'fourth', 'final', 'bonus', 'final', 'normal']);
assert.deepStrictEqual(['4', '4.5', '4,5', ' 4.5s ', '4 seconds', '4.04', '1.5'].map(x => C.parseSeconds(x, 1.5, 30)), [4, 4.5, 4.5, 4.5, 4, 4, 1.5]);
assert.deepStrictEqual(['', 'abc', '-3', '1.4', '31', '1e2', '4.5.1'].map(x => C.parseSeconds(x, 1.5, 30)), [null, null, null, null, null, null, null]);
assert.strictEqual(C.spinPower('final', true), 2.3); assert.strictEqual(C.spinPower('final', false), 2); assert.strictEqual(C.spinPower('normal', true), 2);
assert.strictEqual(C.spinPresetName(3.6), 'Classic'); assert.strictEqual(C.spinPresetName(4), ''); assert.strictEqual(C.fmtSeconds(8), '8s'); assert.strictEqual(C.fmtSeconds(6.3), '6.3s');
console.log('core tests passed');
