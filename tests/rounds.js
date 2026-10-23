// puzzles via import, final spin, bonus round with pick-a-category + bonus wheel, prize puzzle, MDW, mystery, express
module.exports = async function (t) {
  await t.eval('App.show(40)');
  await t.click('XImportPuzzles', 40);
  await t.eval(`document.querySelector('#dlg textarea').value = 'PHRASE | happy \\\\ birthday \\\\ to you\\nTHING | birthday cake\\nPLACE | the grand canyon\\nFOOD & DRINK | chocolate chip cookies\\nPHRASE | piece of cake\\nPERSON | my favorite teacher\\nEVENT | first day of school'`);
  await t.answer('Import');
  await t.answer(true);
  t.log('exists 1..7', await t.eval('[1,2,3,4,5,6,7,8].map(VBA.puzzleExists).join()'));
  await t.shot('import');
  // turn tracker + MDW
  await t.click('XMillionWedge', 40);
  t.log('MDW on wheel3', await t.eval("PPT.sh(3,'TheWheel').item('MDWedge').FillTransparency"));
  await t.eval('App.show(3)'); await t.shot('mdw-wheel');
  await t.eval('Math.random = () => 1875/3600');
  await t.click('TransparentWheelOverlay', 3); await t.wait(3800);
  t.log('landed', await t.text('WheelValue', 3), 'spun', await t.text('SpunWheelValue', 2));
  await t.eval('Math.random = () => 1825/3600');
  await t.click('TransparentWheelOverlay', 3); await t.wait(3800);
  t.log('landed', await t.text('WheelValue', 3), 'active', await t.text('XActivePlayer', 2));
  // prize puzzle
  await t.eval('App.show(2)');
  await t.click('LeftTab', 2); await t.answer('2P');
  await t.shot('prize-loaded');
  await t.click('LeftTab', 2); await t.wait(500);
  await t.answer('Player 2');
  t.log('P2 round after prize', await t.text('Player2RoundScore', 2));
  // mystery wheel
  await t.click('Normal Round', 2);
  t.log('mystery round visible', await t.eval("PPT.sh(2,'Mystery Round').Visible"));
  await t.click('LeftTab', 2); await t.answer('3');
  await t.eval('App.show(4); Math.random = () => 1125/3600');
  await t.click('TransparentWheelOverlay', 4); await t.wait(3800);
  t.log('mystery landed', await t.text('WheelValue', 4), 'spun', await t.text('SpunWheelValue', 2));
  await t.eval('Math.random = () => 0.75');
  await t.click('Oval 39', 4); await t.wait(300);
  t.log('mystery result', await t.text('MysteryIndicator', 4), 'spun', await t.text('SpunWheelValue', 2));
  await t.shot('mystery');
  // express
  await t.eval('App.show(2)');
  await t.click('Mystery Round', 2);
  await t.eval('App.show(5); Math.random = () => 3075/3600');
  await t.click('TransparentWheelOverlay', 5); await t.wait(3800);
  t.log('express landed', await t.text('WheelValue', 5));
  await t.shot('express');
  // fourth round + final spin
  await t.eval('App.show(2)');
  await t.click('Express Round', 2);
  t.log('final spin btn', await t.eval("PPT.sh(2,'FinalSpinButton').Visible"));
  await t.click('LeftTab', 2); await t.click('LeftTab', 2); await t.answer('4');
  await t.click('FinalSpinButton', 2);
  await t.shot('finalspin-banner');
  await t.eval('Math.random = () => 75/3600');   // bankrupt first -> respin with same random... use sequence
  await t.eval('(function(){ var seq=[75/3600, 1425/3600]; var i=0; Math.random=function(){ return seq[Math.min(i++,seq.length-1)]; }; })()');
  await t.click('FinalSpinBanner', 2); await t.wait(3900);
  t.log('final landed', await t.text('WheelValue', 6), 'panel', await t.text('ValuePanel', 2));
  await t.click('BackText', 6); await t.wait(100);
  await t.click('Letter3', 2);
  t.log('after C panel', await t.text('ValuePanel', 2));
  await t.shot('finalspin-letter');
  // bonus round
  await t.click('LeftTab', 2);
  await t.click('Fourth Round', 2);
  t.log('bonus visible', await t.eval("PPT.sh(2,'Bonus Round').Visible"), 'bwlink', await t.eval("PPT.sh(2,'XBonusWheelLink').Visible"));
  await t.click('LeftTab', 2);
  await t.answer('5, 6, 7');
  await t.wait(100);
  await t.shot('pick-category');
  await t.eval("document.querySelectorAll('.x-card')[1].click()");
  await t.wait(200);
  t.log('bonus cat', await t.text('CategoryBox', 2));
  await t.click('RSTLNE', 2);
  await t.click('Letter13', 2); await t.click('Letter25', 2); await t.click('Letter6', 2); await t.click('Letter15', 2);
  t.log('bonus letters', await t.text('BonusLetters', 2));
  await t.click('BonusLetters', 2);
  await t.shot('bonus-letters');
  await t.click('BonusTimerOverlay', 2); await t.wait(1500);
  await t.shot('bonus-timer');
  await t.click('BonusTimerOverlay', 2);
  // bonus wheel with million
  await t.eval("PPT.sh(2,'Player1MDW').FillTransparency = 0");
  await t.click('XBonusWheelLink', 2);
  t.log('slide', await t.eval('App.current'));
  await t.eval('Math.random = () => (23-12)*150/3600 + 0.0001');
  await t.click('TransparentWheelOverlay', 41); await t.wait(3800);
  t.log('bw', await t.text('WheelValue', 41));
  await t.click('XRevealPrize', 41);
  t.log('prize', await t.text('WheelValue', 41));
  await t.shot('bonus-wheel');
};
