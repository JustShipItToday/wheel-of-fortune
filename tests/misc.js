module.exports = async function (t) {
  // puzzles 1..5 quickly via import
  await t.eval('App.show(40)');
  await t.click('XImportPuzzles', 40);
  await t.eval(`document.querySelector('#dlg textarea').value = 'THING | apple pie\\nPLACE | new york city\\nPERSON | a good friend\\nPHRASE | time flies\\nEVENT | the big game'`);
  await t.answer('Import'); await t.answer(true);
  // wheel items on
  await t.eval('App.show(10)');
  await t.click('WildCard', 10); await t.click('GiftTag', 10); await t.click('5000Sliver', 10); await t.click('5Wedge', 10); await t.click('FreePlayWedge', 10); await t.click('WheelValues', 10); await t.click('Slide3Bankrupts', 10);
  await t.shot('wheelsettings');
  await t.eval('App.show(3)'); await t.wait(100); await t.shot('wheel-items');
  for (const r of [3375, 2325, 2275, 2625, 1275, 75, 2925]) { // wildcard($500 b22), sliver mid, sliver side, $5, free play, $600 purple, $300 classic
    await t.eval(`Math.random = () => ${r}/3600 + 1e-9`);
    await t.click('TransparentWheelOverlay', 3); await t.wait(3700);
    t.log(r, '->', await t.text('WheelValue', 3));
  }
  // claim wild card
  await t.eval('App.show(2)');
  await t.click('Player1WildCard', 2);
  t.log('wild on wheel after claim', await t.eval("PPT.sh(3,'TheWheel').item('WildCard').FillTransparency"), 'restore btn', await t.eval("PPT.sh(3,'RestoreWheelItems').Visible"));
  await t.click('Player2GiftTag', 2);
  await t.shot('tokens');
  await t.eval('App.show(3)'); await t.click('RestoreWheelItems', 3);
  t.log('wild back', await t.eval("PPT.sh(3,'TheWheel').item('WildCard').FillTransparency"));
  // triple toss-up
  await t.eval('App.show(2)');
  await t.click('LeftTab', 2); await t.answer('1TTT'); await t.answer('2000');
  t.log('title', await t.text('TossUpTitle', 2));
  await t.click('RevealTossUpLetter', 2); await t.click('RevealTossUpLetter', 2);
  await t.click('Player3RoundScoreCompatibility', 2);
  t.log('tab', await t.text('LeftTab', 2), 'P3', await t.text('Player3RoundScore', 2));
  await t.click('LeftTab', 2);  // load next
  t.log('title', await t.text('TossUpTitle', 2));
  await t.click('Player3RoundScoreCompatibility', 2);
  await t.click('LeftTab', 2);
  t.log('title', await t.text('TossUpTitle', 2));
  await t.eval("PPT.sh(9,'SpecialScoreBonuses').Text='on'");
  await t.click('Player3RoundScoreCompatibility', 2);
  t.log('P3 after 3', await t.text('Player3RoundScore', 2), 'tab', await t.text('LeftTab', 2));
  await t.click('Player3TransferTotalsButton', 2);
  t.log('P3 totals', await t.text('Player3TotalsScore', 2));
  // shot clock
  await t.eval('App.show(9)');
  await t.click('ShotClock', 9); await t.answer('5');
  await t.eval('App.show(2)');
  await t.click('ShotClockOverlay', 2); await t.wait(2200);
  await t.shot('shotclock');
  await t.wait(3500);
  t.log('active after timeout', await t.text('XActivePlayer', 2));
  // verify solve
  await t.click('SolveButton', 9);
  await t.click('LeftTab', 2); await t.answer('4');
  await t.click('LeftTab', 2); await t.answer('time sky');
  await t.answer(true);
  t.log('active after wrong solve', await t.text('XActivePlayer', 2));
  await t.click('LeftTab', 2); await t.answer('Time Flies');
  t.log('tab after right solve', await t.text('LeftTab', 2));
  // swap + delete all
  await t.eval('App.show(12)');
  await t.click('Swap1', 12); await t.answer('2');
  t.log('cat1 now', await t.text('PuzzleCategory1', 12));
  await t.eval('App.show(9)');
  await t.click('TextBox 164', 9); await t.answer(true); await t.answer(true);
  t.log('exists after delete', await t.eval('VBA.puzzleExists(1)'));
  // players
  await t.click('RemovePlayers', 2); await t.shot('two-players');
  await t.click('AddPlayers', 2); await t.click('AddPlayers', 2); await t.shot('four-players');
  // end screen wipe
  await t.eval('App.show(18)'); await t.click('WipeScores', 18);
  t.log('after wipe slide', await t.eval('App.current'), 'np', await t.text('NumPlayers', 2));
};
