module.exports = async function (t) {
  await t.click('Set Up Puzzles', 1);
  await t.wait(100);
  t.log('slide', await t.eval('App.current'));
  await t.click('LinkTo1', 7);
  t.log('slide', await t.eval('App.current'));
  await t.click('PencilClickable', 8);
  await t.answer('happy \\ birthday \\ to you');
  await t.click('SetUpPuzzleCategory', 8);
  await t.answer('phrase');
  await t.shot('setup1');
  await t.click('BarGraphClickable', 8);
  await t.answer(true);
  await t.click('LinkTo2', 8);           // save 1, open 2
  await t.click('PencilClickable', 8);
  await t.answer('the quick brown fox \\ jumps');
  await t.answer('a b c');               // row too long -> retry
  await t.click('SetUpPuzzleCategory', 8);
  await t.answer('thing');
  await t.click('NextPuzzleRow', 8);     // page 2 -> puzzle 13
  t.log('row', await t.text('CurrentPuzzleRowIndex', 7), 'link13 exists', await t.eval("!!App.slide(8).byName.LinkTo13"));
  await t.click('PencilClickable', 8);
  await t.answer('thirteen');
  await t.click('TextBox 105', 8);       // Puzzle Board (save)
  await t.click('LeftTab', 2);
  await t.answer('13');
  t.log('cat', await t.text('CategoryBox', 2), 'cache', await t.eval("[...Array(52)].map((_,i)=>PPT.sh(2,'PuzzleCache'+(i+1)).Text||'.').join('')"));
  await t.click('LeftTab', 2);            // solve
  await t.click('LeftTab', 2);
  await t.answer('1T');
  await t.answer('2000');
  await t.shot('tossup');
  await t.click('PuzzleBoard21', 2);       // reveal letter in toss-up
  await t.click('RevealTossUpLetter', 2);
  await t.shot('tossup2');
  await t.click('Player2RoundScoreCompatibility', 2);
  t.log('P2 round', await t.text('Player2RoundScore', 2));
  await t.eval('App.show(12)');
  await t.shot('allpuzzles');
  await t.click('NextAllPuzzles', 12);
  t.log('now', await t.eval('App.current'));
  await t.shot('allpuzzles2');
  await t.eval('Persist.save()');
};
