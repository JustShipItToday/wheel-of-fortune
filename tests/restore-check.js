module.exports = async function (t) {
  t.log('pages', await t.eval('App.pageCount()'), 'row', await t.text('CurrentPuzzleRowIndex', 7), 'P2', await t.text('Player2RoundScore', 2), 'link13', await t.eval("!!App.slide(7).byName.LinkTo13"));
  t.log('p1 exists', await t.eval('VBA.puzzleExists(1)'), await t.eval('VBA.puzzleExists(2)'), await t.eval('VBA.puzzleExists(13)'), await t.eval('VBA.puzzleExists(3)'));
  await t.eval('App.show(7)'); await t.shot('restored7');
  await t.eval('App.show(2)'); await t.shot('restored2');
};
