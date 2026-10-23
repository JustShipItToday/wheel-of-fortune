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
console.log('core tests passed');
