// letter rules: which letters may be called, following the show's rules. usage: node tools/play.js <outdir> tests/letter-rules.js
// Prints PASS/FAIL lines and a summary; a FAIL means a rule did not behave as the show's rules require.
module.exports = async function (t) {
  let pass = 0, fail = 0;
  const ok = (cond, label) => { if (cond) { pass++; t.log('PASS', label); } else { fail++; t.log('FAIL', label); } };
  const code = (l) => l.charCodeAt(0) - 64;
  const used = async (l) => (await t.text('Letter' + code(l), 2)) === '';   // a called letter disappears from the selector
  // call a letter; returns the blocking dialog's text, or '' if the letter went through
  async function call(l, answer) {
    await t.click('Letter' + code(l), 2); await t.wait(80);
    const d = await t.dialog();
    if (!d) return '';
    const txt = d.text;
    await t.answer(answer != null ? answer : true);
    return txt;
  }
  async function buy(i) {
    await t.click('Player' + i + 'BuyVowelButton', 2); await t.wait(80);
    const d = await t.dialog(); if (!d) return '';
    await t.answer(true); return d.text;
  }
  async function spin(slide, r) {
    await t.eval(`App.show(${slide}); Math.random = () => ${r}/3600 + 1e-9`);
    await t.click('TransparentWheelOverlay', slide); await t.wait(3800);
    const v = await t.text('WheelValue', slide);
    await t.eval('App.show(2)'); await t.wait(80);
    return v;
  }
  const active = () => t.text('XActivePlayer', 2);
  const setScore = (i, v) => t.eval(`PPT.sh(2,'Player${i}RoundScore').Text='${v}'`);
  async function load(n) { await t.click('LeftTab', 2); await t.answer(String(n)); await t.wait(100); }
  async function solve() { await t.click('LeftTab', 2); await t.wait(200); }

  // puzzles
  await t.eval('App.show(40)');
  await t.click('XImportPuzzles', 40);
  await t.eval(`document.querySelector('#dlg textarea').value = 'THING | birthday cake\\nPLACE | grand canyon\\nPHRASE | piece of cake\\nTHING | new car\\nTHING | birthday cake'`);
  await t.answer('Import'); await t.answer(true);
  await t.eval('App.show(2)');

  // ---------- Normal round ----------
  await load(1);
  ok((await active()) === '1', 'player 1 starts');
  let m = await call('T');
  ok(/Spin first/.test(m) && !(await used('T')), 'consonant before any spin is blocked');
  m = await call('A');
  ok(/Buy the vowel first/.test(m) && !(await used('A')), 'vowel without buying is blocked');
  await setScore(1, '1,000');
  ok((await spin(3, 375)) === '$500', 'spin lands on $500');
  m = await buy(1);
  ok(/just spun/.test(m) && (await t.text('Player1RoundScore', 2)) === '1,000', 'buying a vowel right after a spin is blocked and charges nothing');
  m = await call('A');
  ok(/just spun/.test(m) && !(await used('A')), 'vowel right after a spin is blocked');
  m = await call('T');
  ok(m === '' && (await used('T')), 'one consonant after the spin goes through');
  m = await call('R');
  ok(/Spin first/.test(m) && !(await used('R')), 'a second consonant without spinning again is blocked');
  m = await buy(1);
  ok(m === '' && (await t.text('Player1RoundScore', 2)) === '750', 'buying a vowel after the consonant works ($250 charged)');
  m = await buy(1);
  ok(/already bought/.test(m) && (await t.text('Player1RoundScore', 2)) === '750', 'a second purchase before calling the first vowel is blocked');
  m = await call('R');
  ok(/call a vowel now/.test(m) && !(await used('R')), 'consonant after buying a vowel is blocked');
  m = await call('A');
  ok(m === '' && (await used('A')), 'the bought vowel goes through');
  m = await call('E');
  ok(/Buy the vowel first/.test(m), 'one purchase buys only one vowel');
  // reload mid-turn: the rule state survives a page refresh
  await spin(3, 375);
  await t.wait(600);
  await t.page.reload(); await t.wait(900);
  await t.eval('App.show(2)');
  m = await call('I');
  ok(/just spun/.test(m) && !(await used('I')), 'after a page refresh, an unused spin still blocks vowels');
  m = await call('R');
  ok(m === '' && (await used('R')), 'after a page refresh, the unused spin still allows a consonant');
  // a miss ends the turn
  await spin(3, 375);
  m = await call('Z');
  ok(m === '' && (await active()) === '2', 'a letter not in the puzzle passes the turn');
  m = await call('H');
  ok(/Spin first/.test(m), 'the next player must spin before calling a consonant');
  m = await buy(1);
  ok(/Player 2.s turn/.test(m), 'a player can only buy a vowel on their own turn');
  // Bankrupt and Lose a Turn give no letters
  ok((await spin(3, 1575)) === 'Bankrupt', 'spin lands on Bankrupt');
  ok((await active()) === '3', 'Bankrupt passes the turn');
  m = await call('H');
  ok(/Spin first/.test(m), 'no consonant after a Bankrupt');
  ok((await spin(3, 975)) === 'Lose a Turn', 'spin lands on Lose a Turn');
  m = await call('H');
  ok(/Spin first/.test(m) && (await active()) === '1', 'no consonant after Lose a Turn');
  // Wild Card: one more consonant at the same value, and the card is used up
  await t.eval("PPT.sh(2,'Player1WildCard').FillTransparency = 0");
  await spin(3, 375);
  ok((await call('H')) === '', 'consonant after the spin goes through');
  await t.click('Letter' + code('D'), 2); await t.wait(80);
  let d = await t.dialog();
  ok(d && d.buttons.includes('Use Player 1’s Wild Card'), 'a second consonant offers the Wild Card to the player holding it');
  await t.answer('Use Player 1’s Wild Card'); await t.wait(80);
  ok((await used('D')) && (await t.eval("PPT.sh(2,'Player1WildCard').FillTransparency")) === 1, 'using the Wild Card calls the consonant and uses up the card');
  m = await call('Y');
  ok(/Spin first/.test(m) && !/Wild Card/.test(m), 'with the card used up, another consonant is blocked again');
  // Manual value (a real wheel) counts as a spin
  await t.click('ValuePanel', 2); await t.wait(80); await t.answer('600');
  ok((await call('Y')) === '', 'a manually set wheel value allows one consonant');
  // a solve starts the next puzzle fresh
  await solve();

  // ---------- Free Play ----------
  await t.eval('App.show(10)'); await t.click('FreePlayWedge', 10); await t.eval('App.show(2)');
  await load(3);
  ok((await spin(3, 1275)) === 'Free Play', 'spin lands on Free Play');
  const before = await t.text('Player1RoundScore', 2), turn = await active();
  ok((await call('E')) === '' && (await t.text('Player1RoundScore', 2)) === before, 'Free Play allows a free vowel (no charge)');
  ok((await active()) === turn, 'Free Play keeps the turn');
  m = await call('P');
  ok(/Spin first/.test(m), 'Free Play gives only one letter');
  await t.eval('App.show(10)'); await t.click('FreePlayWedge', 10); await t.eval('App.show(2)');
  await solve();

  // ---------- Express round ----------
  await t.click('Normal Round', 2); await t.click('Mystery Round', 2);
  await load(2);
  const p = await active();
  await setScore(p, '2,000');
  ok((await spin(5, 3075)) === 'Express', 'spin lands on Express');
  m = await call('A');
  ok(/just spun/.test(m), 'on Express, a consonant comes first');
  ok((await call('N')) === '', 'Express consonant goes through');
  ok((await call('R')) === '', 'on the Express: another consonant without spinning');
  ok((await buy(p)) === '', 'on the Express: vowels can still be bought');
  ok((await call('A')) === '', 'on the Express: the bought vowel goes through');
  ok((await call('D')) === '', 'on the Express: still calling consonants after a vowel');
  await call('Z');
  m = await call('Y');
  ok(/Spin first/.test(m), 'a miss ends the Express ride');
  await solve();

  // ---------- Final Spin ----------
  await t.click('Express Round', 2);
  await load(3);
  await t.click('FinalSpinButton', 2);
  m = await call('P');
  ok(/Final Spin/.test(m), 'Final Spin: consonants wait for the spin');
  m = await buy(Number(await active()));
  ok(/free during the Final Spin/.test(m), 'Final Spin: there is nothing to buy');
  await t.click('ManualFinalSpin', 2); await t.wait(80); await t.answer('700');
  ok((await call('E')) === '', 'Final Spin: vowels are free without buying');
  ok((await call('P')) === '' && (await call('C')) === '', 'Final Spin: consonants back to back after the one spin');
  await solve();

  // ---------- Bonus Round ----------
  await t.click('Fourth Round', 2);
  await t.click('LeftTab', 2); await t.answer(''); await t.wait(100);
  if (await t.dialog()) await t.answer('4');
  await t.click('RSTLNE', 2);
  for (const l of ['C', 'M', 'P']) await call(l);
  m = await call('O');
  ok(m === '' && (await t.text('BonusLetters', 2)) === 'CMPO', 'Bonus: three consonants and a vowel are accepted');
  m = await call('A');
  ok(/one vowel/.test(m), 'Bonus: a second vowel is blocked');
  m = await call('W');
  ok(/three consonants/.test(m), 'Bonus: a fourth consonant without the Wild Card is blocked');
  await t.eval("PPT.sh(2,'Player2WildCard').FillTransparency = 0");
  ok((await call('W')) === '' && (await t.text('BonusLetters', 2)) === 'CMPOW', 'Bonus: the Wild Card allows a fourth consonant');

  t.log(`\nLETTER RULES: ${pass} passed, ${fail} failed`);
};
