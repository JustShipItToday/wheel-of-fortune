// basic round: example puzzle, spin, letters, scoring, vowel, solve
module.exports = async function (t) {
  await t.click('Puzzle Board', 1);
  await t.wait(200);
  await t.click('LeftTab');                 // Load Puzzle -> no puzzles -> example?
  await t.answer(true);
  await t.shot('loaded');
  await t.eval('App.show(3)');
  await t.click('TransparentWheelOverlay', 3);
  await t.wait(3900);
  t.log('landed:', await t.text('WheelValue', 3), 'spun:', await t.text('SpunWheelValue', 2), 'panel:', await t.text('ValuePanel', 2));
  await t.shot('spun');
  await t.eval('App.show(2)');
  await t.eval("PPT.sh(2,'SpunWheelValue').Text='600'; VBA.setValuePanelDisplay()");
  await t.click('Letter6');                 // F -> 1 (FORTUNE)
  t.log('after F panel:', await t.text('ValuePanel', 2), 'counter', await t.text('LetterCounter', 2));
  await t.click('Player1RoundScoreCompatibility');
  t.log('P1 round:', await t.text('Player1RoundScore', 2));
  await t.eval('App.show(3); Math.random = () => 375/3600'); await t.click('TransparentWheelOverlay', 3); await t.wait(3900); await t.eval('App.show(2)');   // the rules need a spin before each consonant
  await t.eval("PPT.sh(2,'SpunWheelValue').Text='600'; VBA.setValuePanelDisplay()");
  await t.click('Letter18');                // R -> 1
  await t.click('Player1RoundScoreCompatibility');
  t.log('P1 round after R:', await t.text('Player1RoundScore', 2));
  await t.click('Player1BuyVowelButton');
  await t.click('Letter5');                 // E
  t.log('P1 after vowel:', await t.text('Player1RoundScore', 2));
  await t.eval('App.show(3); Math.random = () => 375/3600'); await t.click('TransparentWheelOverlay', 3); await t.wait(3900); await t.eval('App.show(2)');   // the rules need a spin before each consonant
  await t.eval("PPT.sh(2,'SpunWheelValue').Text='600'; VBA.setValuePanelDisplay()");
  await t.click('Letter26');                // Z wrong
  t.log('overlay2 visible:', await t.eval("PPT.sh(2,'LetterSelectionOverlay2').Visible"));
  await t.shot('letters');
  await t.click('PuzzleBoard16');           // reveal blue tile
  await t.shot('reveal1');
  await t.click('LeftTab');                 // Solve
  await t.shot('solved');
  await t.click('Player1TransferTotalsButton');
  await t.answer(true);                      // house minimum confirm
  t.log('P1 totals:', await t.text('Player1TotalsScore', 2), 'round', await t.text('Player1RoundScore', 2));
  await t.shot('after-transfer');
};
