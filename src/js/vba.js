/* vba.js — a line-by-line port of Games by Tim's Module1.bas / Module2.bas (Wheel of Fortune for PowerPoint v6.4)
   to JavaScript. Every Sub keeps its original name and logic; InputBox / MsgBox become in-page dialogs, so subs
   that ask questions are async. Slide numbers are the original ones; "12 + PuzzleIndex" becomes pg(PuzzleIndex). */
(function () {
  'use strict';
  var S = function (n, name) { return PPT.sh(n, name); };
  var RGB = PPT.RGB, C = WOFCore;
  var GREEN = RGB(24, 154, 80), WHITE = RGB(255, 255, 255), BLUE = RGB(0, 0, 255);
  var M = App.M;

  /* ---------- VBA runtime helpers ---------- */
  function pg(k) { return App.pageId(k); }
  function SlidesCount4() { return App.pageCount(); }
  function cur(name) { return S(App.current, name); }
  function IsNumeric(s) { return C.parseNum(s) != null; }
  function CLng(s) { var n = C.parseNum(s); if (n == null) throw new Error('Type mismatch: ' + s); return n; }
  function CInt(s) { return CLng(s); }
  function FormatNumber(n) { return C.fmt(n); }
  function Trim(s) { return String(s).replace(/^ +| +$/g, ''); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function InputBox(prompt, title, def) { var r = await Dlg.input(prompt, title, def == null ? '' : String(def)); return r == null ? '' : r; }
  async function MsgBox(text, title) { await Dlg.msg(text, title); }
  async function YesNo(text, title, defaultNo) { return await Dlg.confirm(text, title, { defaultNo: !!defaultNo }); }
  async function OkCancel(text, title) { return await Dlg.confirm(text, title, { yes: 'OK', no: 'Cancel' }); }
  function Play(name) { if (window.WOFAudio) WOFAudio.play(name); }
  function GotoSlide(n) { App.show(n); }
  function GameName() { return S(9, 'GameName').Text; }
  window.VBA = { S: S, sleep: sleep };

  /* ---------- Module1 ---------- */
  M.goToHowToUse = async function () { await savePuzzleAndShadeOccupiedPuzzles(); GotoSlide(19); };
  M.goToSetUp = async function () { await savePuzzleAndShadeOccupiedPuzzles(); GotoSlide(7); };
  M.goToPuzzleBoard = async function () { await savePuzzleAndShadeOccupiedPuzzles(); GotoSlide(2); };

  var BACKDROPS = {
    studio: { next: 'stadium', pb: [[2, 127, 190], [94, 189, 208], [2, 127, 190]], fe: [0, 51, 0], fm: [0, 153, 0], fl: [38, 100, 38], wh: [[44, 87, 17], [34, 138, 46], [44, 87, 17]], help: [44, 64, 58] },
    stadium: { next: 'red velvet', pb: [[144, 22, 59], [142, 42, 66], [144, 22, 59]], fe: [51, 29, 29], fm: [152, 36, 61], fl: [99, 37, 35], wh: [[144, 22, 59], [142, 42, 66], [144, 22, 59]], help: [217, 217, 217] },
    'red velvet': { next: 'gold haven', pb: [[78, 60, 10], [175, 164, 97], [78, 60, 10]], fe: [37, 35, 25], fm: [197, 176, 87], fl: [112, 104, 64], wh: [[78, 60, 10], [175, 164, 97], [78, 60, 10]], help: [119, 69, 69] },
    'gold haven': { next: 'winter', pb: [[41, 14, 158], [60, 67, 212], [120, 114, 200]], fe: [163, 163, 163], fm: [207, 207, 207], fl: [29, 36, 141], wh: [[146, 148, 180], [169, 169, 191], [146, 148, 180]], help: [81, 77, 133] },
    winter: { next: 'blackout', pb: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], fe: [38, 38, 38], fm: [87, 68, 35], fl: [38, 38, 38], wh: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], help: [179, 162, 199] },
    blackout: { next: 'studio', fe: [41, 38, 35], fm: [125, 73, 126], fl: [16, 37, 63], help: [179, 162, 199] }
  };
  function rgbA(a) { return RGB(a[0], a[1], a[2]); }
  M.BGChange = function () {
    var themeNumber = S(9, 'Backdrop');
    var t = BACKDROPS[themeNumber.Text] || BACKDROPS.blackout;
    // the VBA picks the colours of the *next* backdrop, then writes its name
    var nextName = t.next, d = BACKDROPS[themeNumber.Text] ? t : BACKDROPS.blackout;
    themeNumber.Text = nextName;
    var bd = S(2, 'BackDrop');
    if (nextName === 'studio') bd.FillTransparency = 1;
    else { bd.FillTransparency = 0; bd.Gradient = [[0, rgbA(d.pb[0]), 1], [0.5, rgbA(d.pb[1]), 1], [1, rgbA(d.pb[2]), 1]]; }
    var fl = S(2, 'SetFloor');
    fl.Gradient = [[0, rgbA(d.fe), 1], [0.5, rgbA(d.fm), 1], [1, rgbA(d.fe), 1]];
    fl.LineRGB = rgbA(d.fl);
    for (var i = 3; i <= 6; i++) {
      S(i, 'Help').FillRGB = rgbA(d.help);
      var w = S(i, 'BackDrop');
      if (nextName === 'studio') w.FillTransparency = 1;
      else { w.FillTransparency = 0; w.Gradient = [[0, rgbA(d.wh[0]), 1], [0.5, rgbA(d.wh[1]), 1], [1, rgbA(d.wh[2]), 1]]; }
    }
  };

  function ClearBoardButton() {
    var i, j;
    for (i = 1; i <= 52; i++) {
      S(2, 'PuzzleBoard' + i).Text = '';
      S(2, 'PuzzleCache' + i).Text = '';
      S(2, 'PuzzleBoard' + i).FillRGB = GREEN;
    }
    for (j = 1; j <= 27; j++) { S(2, 'Letter' + j).Visible = false; bringLetterBack(j); }
    S(2, 'TossUpBanner').item('TossUpTitle').Text = 'Toss-Up Puzzle';
    S(2, 'TossUpBanner').Visible = false;
    S(2, 'CategoryBox').Text = '';
    S(2, 'LeftTab').FillRGB = RGB(41, 183, 233);
    S(2, 'LeftTab').Text = 'Load Puzzle';
    S(2, 'LetterCounter').Text = '';
    S(2, 'ScoreAugment').Text = '';
    S(2, 'SpunWheelValue').Text = '';
    S(2, 'LetterSelectionOverlay2').Visible = false;
    S(2, 'NoMoreVowels').Visible = false;
    S(2, 'NoMoreConsonants').Visible = false;
    S(2, 'FirstPuzzleTileWithLetter').Text = '';
    S(2, 'ValuePanel').Text = GameName();
    resetBonusRound();
    disableFinalSpin();
    if (window.Extras) Extras.onClearBoard();
  }
  M.ClearBoardButton = function () { ClearBoardButton(); };

  function playerIndex(el, suffix) {
    var m = /^Player(\d)(.+)$/.exec(el.dataset.name);
    return m && (suffix.indexOf(m[2]) >= 0) ? +m[1] : 0;
  }

  M.editPlayerName = async function (el) {
    var i = playerIndex(el, ['Name']); if (!i) return;
    var oSh = PPT.wrap(el);
    var sText = await InputBox('Edit ' + S(2, 'Player' + i + 'Name').Text + "'s name:", 'Edit Player Name', oSh.Text);
    if (sText !== '') oSh.Text = sText;
  };

  async function editScore(el, kind) {
    var i = playerIndex(el, kind === 'Round' ? ['RoundDollarSign'] : ['TotalsDollarSign', 'TotalsScore']); if (!i) return;
    var box = S(2, 'Player' + i + kind + 'Score');
    var title = kind === 'Round' ? 'Manually Edit Round Score' : 'Manually Edit Totals Score';
    var sText = await InputBox('Add or subtract the amount entered from ' + S(2, 'Player' + i + 'Name').Text + "'s " + kind.toLowerCase() + ' score.\n\n' +
      'To set the exact score, append = to the amount.', title, '=' + CLng(box.Text));
    while (!IsNumeric(sText.replace(/=/g, '')) && sText !== '') sText = await InputBox('You can only enter numbers here. Try again:', title, sText);
    if (sText === '') return;
    if (sText.indexOf('=') >= 0) box.Text = FormatNumber(CLng(sText.replace(/=/g, '')));
    else box.Text = FormatNumber(CLng(box.Text) + CLng(sText));
  }
  M.PlayerRoundDollarSign = function (el) { return editScore(el, 'Round'); };
  M.PlayerTotalsDollarSign = function (el) { return editScore(el, 'Totals'); };

  M.PlayerAddFromValuePanel = async function (el) {
    var i = playerIndex(el, ['RoundScoreCompatibility']); if (!i) return;
    var nm = S(2, 'Player' + i + 'Name').Text;
    if (S(2, 'ValuePanel').Text === GameName()) {
      await MsgBox('During a game, click here to add the amount shown on the value panel\n(currently reads ' + GameName() + ') to ' + nm + "'s round score.", 'Add to ' + nm + "'s Round Score");
      return;
    }
    if (S(2, 'SpunWheelValue').Text === '') {
      await MsgBox("There's nothing to add because the value panel is empty.\nSpin the wheel or manually set the spun wheel value on the Value Panel first.", 'Add to ' + nm + "'s Round Score");
      return;
    }
    var title = S(2, 'TossUpTitle').Text, tuVisible = S(2, 'TossUpBanner').Visible;
    if (tuVisible && (title === 'Toss-Up Puzzle' || title === 'Triple Toss-Up Puzzle 3')) {
      if (S(9, 'SolveButton').Text === 'verify') { if (!(await verifyPuzzle(true))) return; }
      else solvePuzzle(true);
    } else if (tuVisible && (title === 'Triple Toss-Up Puzzle 1' || title === 'Triple Toss-Up Puzzle 2')) {
      if (S(9, 'SolveButton').Text === 'verify') { if (!(await verifyPuzzle(false))) return; }
      else solvePuzzle(false);
    }
    var effectiveWheelValue;
    if (S(2, 'FinalSpinButton').FillRGB === RGB(225, 129, 75)) effectiveWheelValue = CLng(S(2, 'SpunWheelValue').Text) + 1000;
    else effectiveWheelValue = CLng(S(2, 'SpunWheelValue').Text);
    var rs = S(2, 'Player' + i + 'RoundScore'), lc = S(2, 'LetterCounter').Text, aug = S(2, 'ScoreAugment').Text;
    var before = CLng(rs.Text);
    if (S(2, 'TossUpTitle').Text.indexOf('Triple') >= 0 && before / 2 === CLng(S(2, 'SpunWheelValue').Text) && S(9, 'SpecialScoreBonuses').Text === 'on') {
      rs.Text = FormatNumber(before + effectiveWheelValue * 3);
    } else if (lc === '') {
      rs.Text = FormatNumber(before + effectiveWheelValue);
    } else if (aug !== '') {
      rs.Text = FormatNumber(before + CLng(lc) * effectiveWheelValue + CLng(aug));
    } else {
      rs.Text = FormatNumber(before + CLng(lc) * effectiveWheelValue);
    }
    if (window.Extras) Extras.onScoreAdded(i, CLng(rs.Text) - before);
    if (S(2, 'LeftTab').Text === 'Load Puzzle') {
      S(2, 'LetterCounter').Text = '';
      S(2, 'ValuePanel').Text = GameName();
      return;
    }
    S(2, 'LetterCounter').Text = '';
    setValuePanelDisplay();
  };

  M.PlayerBuyaVowel = async function (el) {
    var VOWELCOST = CLng(S(9, 'VowelPrice').Text.replace('$', ''));
    var i = playerIndex(el, ['BuyVowelButton']); if (!i) return;
    var RoundDollarAmount = S(2, 'Player' + i + 'RoundScore'), playerName = S(2, 'Player' + i + 'Name').Text;
    if (!IsNumeric(RoundDollarAmount.Text)) await MsgBox('Please remove non-numeric characters from ' + playerName + "'s score before buying a vowel.", playerName + ' Buy Vowel');
    else if (CLng(RoundDollarAmount.Text) < VOWELCOST) await MsgBox(playerName + ' cannot buy a vowel. Vowels cost $' + FormatNumber(VOWELCOST) + '.', playerName + ' Buy Vowel');
    else RoundDollarAmount.Text = FormatNumber(CLng(RoundDollarAmount.Text) - VOWELCOST);
  };

  M.PlayerTransferTotals = async function (el) {
    var HOUSEMINIMUM = CLng(S(9, 'HouseMinimum').Text.replace('$', ''));
    if (S(2, 'LeftTab').Text === 'Load Next' || (S(2, 'TossUpBanner').Visible && S(2, 'TossUpTitle').Text.indexOf('Triple') >= 0)) {
      await MsgBox('Cannot transfer totals until every Triple Toss-Up puzzle is solved.', 'Transfer Totals Triple Toss-Up Error');
      return;
    }
    var i = playerIndex(el, ['TransferTotalsButton']); if (!i) return;
    var RoundDollarAmount = S(2, 'Player' + i + 'RoundScore'), TotalsDollarAmount = S(2, 'Player' + i + 'TotalsScore');
    if (IsNumeric(TotalsDollarAmount.Text) && IsNumeric(RoundDollarAmount.Text)) {
      if (CLng(RoundDollarAmount.Text) < HOUSEMINIMUM && S(2, 'TripleTossUpNumber').Text === '') {
        var ok = await OkCancel('The house minimum of $' + FormatNumber(HOUSEMINIMUM) + ' will be transferred.', 'Confirm House Minimum Transfer');
        if (ok) { TotalsDollarAmount.Text = FormatNumber(CLng(TotalsDollarAmount.Text) + HOUSEMINIMUM); wipeRoundScores(); }
        else return;
      } else {
        TotalsDollarAmount.Text = FormatNumber(CLng(TotalsDollarAmount.Text) + CLng(RoundDollarAmount.Text));
        if (S(2, 'TripleTossUpNumber').Text === '') wipeRoundScores();
        else S(2, 'Player' + i + 'RoundScore').Text = '0';
      }
    }
  };

  M.PlayerXButton = function (el) {
    var i = playerIndex(el, ['XButtonCompatibility']); if (!i) return;
    S(2, 'Player' + i + 'RoundScore').Text = '0';
  };

  M.TogglePlayerItem = function (el) {
    var oSh = PPT.wrap(el);
    if (oSh.FillTransparency === 1) {
      oSh.FillTransparency = 0;
      if (S(10, 'WheelItems').Text === 'once') {
        if (/WildCard$/.test(oSh.Name)) { if (S(3, 'TheWheel').item('WildCard').FillTransparency === 0) toggleWildCard(); }
        else if (/GiftTag$/.test(oSh.Name)) { if (S(3, 'TheWheel').item('GiftTag').FillTransparency === 0) toggleGiftTag(); }
      }
    } else oSh.FillTransparency = 1;
  };

  M.DetermineMystery = async function () {
    var wv = S(4, 'WheelValue').Text;
    if (wv === 'Mystery 1') S(4, 'TheWheel').item('MysteryWedge1').FillTransparency = 1;
    else if (wv === 'Mystery 2') S(4, 'TheWheel').item('MysteryWedge2').FillTransparency = 1;
    else {
      var yes = await YesNo("The wheel is not on a Mystery wedge. This feature is intended to 'flip' the Mystery wedge landed on.\n\nDo you still want to use this feature for another purpose?", 'Flip Mystery Wedge Warning', true);
      if (!yes) return;
    }
    S(4, 'MysteryIndicator').Text = '';
    await sleep(100);
    var randomNumber = Math.floor(2 * Math.random()) + 1;
    if (randomNumber === 2) {
      S(4, 'MysteryIndicator').Text = '$' + FormatNumber(10000);
      S(2, 'SpunWheelValue').Text = '10000';
      S(2, 'LetterCounter').Text = '';
      setValuePanelDisplay();
    } else {
      S(4, 'MysteryIndicator').Text = 'Bankrupt';
      S(2, 'SpunWheelValue').Text = '';
      S(2, 'LetterCounter').Text = '';
      setValuePanelDisplay();
    }
  };

  function ClearMysteryIndicator() {
    S(4, 'MysteryIndicator').Text = '';
    S(4, 'TheWheel').item('MysteryWedge1').FillTransparency = 0;
    S(4, 'TheWheel').item('MysteryWedge2').FillTransparency = 0;
  }
  M.ClearMysteryIndicator = function () { ClearMysteryIndicator(); };

  M.ErasePuzzleRow = function (el) {
    var n = el.dataset.name, r = { Eraser1: [1, 12], Eraser2: [13, 26], Eraser3: [27, 40], Eraser4: [41, 52] }[n];
    if (!r) return;
    for (var i = r[0]; i <= r[1]; i++) { cur('SetUpPuzzle' + i).Text = ''; cur('SetUpPuzzle' + i).FillRGB = GREEN; }
  };

  M.EraseEntirePuzzle = async function () {
    if (await YesNo('Are you sure you want to delete the entire puzzle?', 'Confirm Puzzle Delete', true)) {
      for (var i = 1; i <= 52; i++) { cur('SetUpPuzzle' + i).Text = ''; cur('SetUpPuzzle' + i).FillRGB = GREEN; }
      cur('SetUpPuzzleCategory').Text = '';
    }
  };

  M.puzzleSetupFromOtherSlide = function (el) {
    var n = CInt(PPT.wrap(el).Text);
    placePuzzleToSetUp(n); highlightCurrentPuzzle(n); GotoSlide(8);
  };
  M.puzzleSetup = function (el) {
    var n = CInt(PPT.wrap(el).Text);
    savePuzzleAndShadeOccupiedPuzzles(); placePuzzleToSetUp(n); highlightCurrentPuzzle(n);
  };
  function puzzleSetupJump(num) { placePuzzleToSetUp(num); shadeOccupiedPuzzlesFull(); highlightCurrentPuzzle(num); GotoSlide(8); }
  M.PuzzleSetupFromAllPuzzles = function (el) {
    var n = CInt(PPT.wrap(el).Text);
    exactPuzzleRow(Math.floor((n - 1) / 12));
    puzzleSetupJump(n);
  };

  async function editMoney(el, what, def) {
    var oSh = PPT.wrap(el), title = 'Edit ' + what;
    var sText = await InputBox('Edit the ' + what.toLowerCase() + '. The default ' + (what === 'Vowel Price' ? 'price is $250.' : 'minimum is $1000.'), title, CLng(oSh.Text.replace('$', '')));
    while (!IsNumeric(sText) && sText !== '') sText = await InputBox('You can only enter numbers here. Try again:', title, sText);
    if (sText === '') return;
    var v = CLng(sText);
    if (Math.abs(v) > 2147483647) { await MsgBox('The ' + what.toLowerCase() + ' cannot exceed $2147483647.', title + ' Error'); return; }
    oSh.Text = '$' + v;
  }
  M.EditVowelPrice = function (el) { return editMoney(el, 'Vowel Price'); };
  M.EditHouseMinimum = function (el) { return editMoney(el, 'House Minimum'); };

  M.confirmDeleteAllPuzzles = async function () {
    if (await YesNo('Are you ABSOLUTELY sure you want to delete all puzzles?', 'Confirm Delete All Puzzles', true)) {
      deleteAllPuzzles();
      await MsgBox('Successfully deleted all puzzles.', 'Confirm Delete All Puzzles');
    }
  };

  function highlightCurrentPuzzle(i) {
    var s = S(8, 'LinkTo' + i);
    s.bringToFront(); s.FillRGB = RGB(250, 192, 144); s.LineRGB = RGB(228, 108, 10);
  }
  function currentRow() { return CInt(S(7, 'CurrentPuzzleRowIndex').Text); }
  function copyTile(from, to) { to.Text = from.Text; to.FillRGB = from.FillRGB; }

  function savePuzzle() {
    var PuzzleIndex = currentRow(), i, found = false;
    for (i = 1; i <= 12; i++) if (S(8, 'LinkTo' + (i + 12 * PuzzleIndex)).FillRGB === RGB(250, 192, 144)) { found = true; break; }
    if (!found) return;
    var n = i + 12 * PuzzleIndex;
    for (var j = 1; j <= 52; j++) copyTile(S(8, 'SetUpPuzzle' + j), S(pg(PuzzleIndex), 'PuzzleSolution' + n + '-' + j));
    S(pg(PuzzleIndex), 'PuzzleCategory' + n).Text = S(8, 'SetUpPuzzleCategory').Text;
  }
  function placePuzzleToSetUp(i) {
    var PuzzleIndex = currentRow();
    for (var n = 1; n <= 52; n++) copyTile(S(pg(PuzzleIndex), 'PuzzleSolution' + i + '-' + n), S(8, 'SetUpPuzzle' + n));
    S(8, 'SetUpPuzzleCategory').Text = S(pg(PuzzleIndex), 'PuzzleCategory' + i).Text;
  }
  function deleteAllPuzzles() {
    var s = SlidesCount4() - 1;
    while (s > 0) { App.drop(pg(s)); s--; }
    S(12, 'NextAllPuzzles').Visible = false;
    for (var i = 1; i <= 12; i++) {
      for (var j = 1; j <= 52; j++) { var t = S(12, 'PuzzleSolution' + i + '-' + j); t.Text = ''; t.FillRGB = GREEN; }
      S(12, 'PuzzleCategory' + i).Text = '';
    }
    for (var k = 1; k <= 52; k++) { S(8, 'SetUpPuzzle' + k).Text = ''; S(8, 'SetUpPuzzle' + k).FillRGB = GREEN; }
    S(8, 'SetUpPuzzleCategory').Text = '';
    exactPuzzleRow(0);
    shadeOccupiedPuzzlesFull();
  }
  function shadeLink(n, blank) {
    for (var r = 7; r <= 9; r++) {
      var s = S(r, 'LinkTo' + n);
      s.FillRGB = blank ? RGB(149, 179, 215) : RGB(146, 224, 204);
      s.LineRGB = RGB(55, 96, 146);
    }
  }
  function savePuzzleAndShadeOccupiedPuzzles() {
    var PuzzleIndex = currentRow(), i, found = false, blankPuzzle = true;
    for (i = 1; i <= 12; i++) if (S(8, 'LinkTo' + (i + 12 * PuzzleIndex)).FillRGB === RGB(250, 192, 144)) { found = true; break; }
    if (!found) return;
    var n = i + 12 * PuzzleIndex;
    for (var j = 1; j <= 52; j++) {
      var dst = S(pg(PuzzleIndex), 'PuzzleSolution' + n + '-' + j);
      copyTile(S(8, 'SetUpPuzzle' + j), dst);
      if (dst.Text !== '') blankPuzzle = false;
    }
    S(pg(PuzzleIndex), 'PuzzleCategory' + n).Text = S(8, 'SetUpPuzzleCategory').Text;
    if (S(pg(PuzzleIndex), 'PuzzleCategory' + n).Text !== '') blankPuzzle = false;
    shadeLink(n, blankPuzzle);
  }
  function shadeOccupiedPuzzlesFull() {
    var PuzzleIndex = currentRow();
    for (var p = 1; p <= 12; p++) {
      var n = p + 12 * PuzzleIndex, blankPuzzle = true;
      for (var q = 1; q <= 52; q++) if (S(pg(PuzzleIndex), 'PuzzleSolution' + n + '-' + q).Text !== '') { blankPuzzle = false; break; }
      if (S(pg(PuzzleIndex), 'PuzzleCategory' + n).Text !== '') blankPuzzle = false;
      shadeLink(n, blankPuzzle);
    }
  }

  M.goToHowToUseFromSetUpPuzzles = function () { savePuzzleAndShadeOccupiedPuzzles(); GotoSlide(19); };
  M.goToPuzzleBoardFromSetUpPuzzles = function () { savePuzzleAndShadeOccupiedPuzzles(); GotoSlide(2); };
  M.goToSettingsFromSetUpPuzzles = function () { savePuzzleAndShadeOccupiedPuzzles(); GotoSlide(9); };
  M.goToSettingsFromAllPuzzles = function () { savePuzzle(); shadeOccupiedPuzzlesFull(); GotoSlide(9); };

  function puzzleExists(i) {
    var idx = Math.floor((i - 1) / 12);
    if (idx + 1 > SlidesCount4() || idx < 0 || i < 1) return false;
    for (var m = 1; m <= 52; m++) if (S(pg(idx), 'PuzzleSolution' + i + '-' + m).FillRGB === WHITE) return true;
    return S(pg(idx), 'PuzzleCategory' + i).Text !== '';
  }
  window.VBA.puzzleExists = puzzleExists;

  async function LoadPuzzleOrSolve() {
    var tab = S(2, 'LeftTab').Text;
    if (tab === 'Load Puzzle') {
      var noPuzzlesExist = true;
      if (SlidesCount4() === 1) { for (var j = 1; j <= 12; j++) if (puzzleExists(j)) { noPuzzlesExist = false; break; } }
      else noPuzzlesExist = false;
      if (noPuzzlesExist) {
        if (await YesNo('No puzzles were found in Set Up Puzzles. Would you like to load the example puzzle?\n\n(To set up puzzles, go to Settings on the top right of this slide and click the above puzzle numbers to edit.)', 'Load Puzzle')) await loadPuzzle(0, 0);
        return;
      }
      if (window.Extras && Extras.beforeLoadPrompt) { var handled = await Extras.beforeLoadPrompt(); if (handled) return; }
      var numberToLoad = await InputBox('Enter the puzzle number to load (1, 2 etc).\n\nAppend T to to load the puzzle as a Toss-Up (1T, 2T, etc), TTT to start a Triple Toss-Up sequence (1TTT, 2TTT, etc), or P for a Prize Puzzle (1P, 2P, etc).', 'Load Puzzle', S(2, 'NextPuzzleToLoad').Text);
      while (!IsNumeric(numberToLoad.toUpperCase().replace(/T/g, '').replace(/P$/, ''))) {
        if (numberToLoad === '') return;
        numberToLoad = await InputBox('Please enter a number, a number with a T (Toss-Up), a number with a TTT (Triple Toss-Up), or a number with a P (Prize Puzzle):', 'Load Puzzle', numberToLoad);
      }
      var up = numberToLoad.toUpperCase().trim();
      if (/P$/.test(up) && up.indexOf('T') < 0) { await loadPuzzle(CInt(up.replace(/P$/, '')), 0, { prize: true }); return; }
      up = up.replace(/P$/, '');
      if (up.indexOf('TTT') >= 0) await loadPuzzle(CInt(up.replace(/T/g, '')), 3);
      else if (up.indexOf('T') >= 0) await loadPuzzle(CInt(up.replace(/T/g, '')), 1);
      else await loadPuzzle(CInt(up), 0);
    } else if (tab === 'Load Next') {
      await loadPuzzle(CInt(S(2, 'NextPuzzleToLoad').Text), 4);
    } else {
      var reset = !S(2, 'TossUpBanner').Visible;
      if (S(9, 'SolveButton').Text === 'verify') await verifyPuzzle(reset);
      else solvePuzzle(reset);
    }
  }
  M.LoadPuzzleOrSolve = LoadPuzzleOrSolve;

  async function askTossUpValue(prompt, title, def, errText, errTitle) {
    var sText = await InputBox(prompt, title, def);
    while (sText !== '') {
      if (IsNumeric(sText) && CLng(sText) >= 1) break;
      sText = await InputBox(errText, errTitle, sText);
    }
    return sText;
  }

  async function loadPuzzle(i, isTossUp, opts) {
    opts = opts || {};
    var SpanishNError = false, sText = '';
    if (!puzzleExists(i) && i !== 0) { await MsgBox('No puzzle found for number ' + i + '.', 'Load Puzzle Error'); return false; }
    if (isTossUp === 1) {
      sText = await askTossUpValue('How much is the Toss-Up worth in dollars?', 'Set Toss-Up Value', '1000', 'The Toss-Up value must be greater than 0.', 'Set Toss-Up Value');
      if (sText === '') return false;
    }
    if (isTossUp === 3) {
      if (!puzzleExists(i + 1) || !puzzleExists(i + 2)) {
        await MsgBox('Cannot start a Triple Toss-Up from puzzle ' + i + ' because puzzle ' + (i + 1) + ' and/or ' + (i + 2) + ' cannot be found.', 'Triple Toss-Up Error');
        return false;
      }
      sText = await askTossUpValue('How much is each puzzle in the Triple Toss-Up worth in dollars?', 'Set Triple Toss-Up Value', '2000', 'The Triple Toss-Up value must be greater than 0.', 'Set Toss-Up Value');
      if (sText === '') return false;
    }
    if (isTossUp === 4) sText = String(CLng(S(2, 'SpunWheelValue').Text));
    ClearBoardButton();
    var m, j;
    if (i === 0) {
      var ex = C.EXAMPLE;
      for (m = 1; m <= 52; m++) {
        if (ex.charAt(m - 1) !== ' ') { S(2, 'PuzzleBoard' + m).FillRGB = WHITE; S(2, 'PuzzleCache' + m).Text = ex.charAt(m - 1); }
      }
      S(2, 'FirstPuzzleTileWithLetter').Text = '16';
      S(2, 'CategoryBox').Text = 'FUN & GAMES';
    } else {
      var idx = Math.floor((i - 1) / 12);
      for (j = 1; j <= 52; j++) {
        var src = S(pg(idx), 'PuzzleSolution' + i + '-' + j);
        S(2, 'PuzzleBoard' + j).FillRGB = src.FillRGB;
        if (src.Text !== '') {
          S(2, 'PuzzleCache' + j).Text = src.Text;
          if (!C.isLetter(src.Text)) S(2, 'PuzzleBoard' + j).Text = src.Text;
          else if (S(2, 'FirstPuzzleTileWithLetter').Text === '') S(2, 'FirstPuzzleTileWithLetter').Text = String(j);
          if (src.Text === S(9, 'SpanN').Text && S(9, 'SpanishN').Text === 'off') { SpanishNError = true; toggleSpanishN(); }
        }
      }
      S(2, 'CategoryBox').Text = S(pg(idx), 'PuzzleCategory' + i).Text;
    }
    if (isTossUp === 0) {
      for (var k = 1; k <= 27; k++) if (k < 27 || (k === 27 && S(9, 'SpanishN').Text === 'on')) S(2, 'Letter' + k).Visible = true;
      S(2, 'ValuePanel').Text = '';
      S(2, 'SpunWheelValue').Text = '';
      S(2, 'TripleTossUpNumber').Text = '';
    } else {
      if (isTossUp === 3) {
        S(2, 'TossUpBanner').item('TossUpTitle').Text = 'Triple Toss-Up Puzzle 1';
        S(2, 'TripleTossUpNumber').Text = '1';
      } else if (isTossUp === 4) {
        S(2, 'TossUpBanner').item('TossUpTitle').Text = 'Triple Toss-Up Puzzle ' + S(2, 'TripleTossUpNumber').Text;
      } else S(2, 'TripleTossUpNumber').Text = '0';
      S(2, 'TossUpBanner').Visible = true;
      S(2, 'SpunWheelValue').Text = String(CLng(sText));
      setValuePanelDisplay();
    }
    S(2, 'LeftTab').FillRGB = RGB(198, 159, 48);
    S(2, 'LeftTab').Text = 'Solve';
    S(2, 'LetterCounter').Text = '';
    S(2, 'NextPuzzleToLoad').Text = String(i + 1);
    if (window.Extras) Extras.onPuzzleLoaded(i, isTossUp, opts);
    if (SpanishNError) {
      var N = S(9, 'SpanN').Text;
      await MsgBox('This puzzle uses the letter ' + N + ', but the Spanish ' + N + ' setting was disabled. This setting has automatically been enabled.\n\nYou can re-disable the Spanish ' + N + ' in the Settings slide.', 'Spanish ' + N + ' Note');
    }
    Play('LoadPuzzleChime');
    return true;
  }
  window.VBA.loadPuzzle = loadPuzzle;

  function solvePuzzle(resetValuePanel) {
    var i, j;
    for (i = 1; i <= 52; i++) {
      S(2, 'PuzzleBoard' + i).Text = S(2, 'PuzzleCache' + i).Text;
      if (S(2, 'PuzzleBoard' + i).FillRGB === BLUE) S(2, 'PuzzleBoard' + i).FillRGB = WHITE;
    }
    for (j = 1; j <= 27; j++) S(2, 'Letter' + j).Visible = false;
    S(2, 'TossUpBanner').Visible = false;
    S(2, 'LeftTab').FillRGB = RGB(41, 183, 233);
    S(2, 'LeftTab').Text = 'Load Puzzle';
    S(2, 'LetterSelectionOverlay2').Visible = false;
    if (resetValuePanel) S(2, 'ValuePanel').Text = GameName();
    S(2, 'NoMoreVowels').Visible = false;
    S(2, 'NoMoreConsonants').Visible = false;
    if (window.Extras) Extras.onSolved();
    var t = S(2, 'TossUpTitle').Text;
    if (t === 'Triple Toss-Up Puzzle 1' || t === 'Triple Toss-Up Puzzle 2') {
      S(2, 'LeftTab').Text = 'Load Next';
      S(2, 'TripleTossUpNumber').Text = String(CInt(S(2, 'TripleTossUpNumber').Text) + 1);
      Play('TripleTossUpSolve');
    } else if (S(2, 'RSTLNE').Visible && S(2, 'TripleTossUpNumber').Text === '') {
      return; // no sound effect when solving the Bonus Round
    } else Play('SolvePuzzleChime');
  }

  M.guessLetter = function (el) {
    var m = /^Letter(\d+)$/.exec(el.dataset.name); if (!m) return;
    var i = +m[1];
    var L = S(2, 'Letter' + i);
    if (L.Text === '') return;
    var letterCount = 0, vowelsRemaining = false, consonantsRemaining = false, gotSameLetter = false;
    var theLetter = L.Text;
    if (S(2, 'BonusOutline').LineTransparency === 0) {
      if (S(2, 'BonusLetters').Text.length >= 5) {
        return MsgBox('The contestant can only choose four letters (or five if they have a Wild Card). Use the spiral arrow button to remove letters if necessary.', 'Add Bonus Round Letter Error');
      }
      S(2, 'BonusLetters').Text = S(2, 'BonusLetters').Text + theLetter;
      L.Text = '';
      return;
    }
    var blueTilesOff = S(9, 'BlueTiles').Text === 'off', firstTile = S(2, 'FirstPuzzleTileWithLetter').Text;
    for (var k = 1; k <= 52; k++) {
      var tile = S(2, 'PuzzleBoard' + k);
      if (tile.FillRGB === WHITE && tile.Text === '') {
        var cache = S(2, 'PuzzleCache' + k).Text;
        if (C.lettersMatch(cache, theLetter)) {
          if (blueTilesOff) tile.Text = cache; else tile.FillRGB = BLUE;
          if (firstTile !== '' && k === CLng(firstTile)) {
            if (Trim(S(2, 'CategoryBox').Text.toUpperCase()) === 'SAME LETTER' && S(9, 'SpecialScoreBonuses').Text === 'on') gotSameLetter = true;
          }
          letterCount++;
        } else if (C.isVowel(cache)) vowelsRemaining = true;
        else consonantsRemaining = true;
      }
    }
    var finalSpinOn = S(2, 'FinalSpinButton').LineTransparency === 0;
    if (letterCount === 0) {
      if (!finalSpinOn) S(2, 'SpunWheelValue').Text = '';
      S(2, 'LetterSelectionOverlay2').Visible = true;
      S(2, 'LetterCounter').Text = '';
      L.Text = '';
      setValuePanelDisplay();
      if (!finalSpinOn) Play('GuessLetterWrong');
      if (window.Extras) Extras.onLetter(theLetter, 0);
      return;
    }
    if (C.isVowel(theLetter)) {
      S(2, 'LetterCounter').Text = '';
      if (!vowelsRemaining && consonantsRemaining && S(9, 'NoMoreVowels').Text === 'on') {
        S(2, 'NoMoreVowels').Visible = true;
        C.VOWEL_SEL.forEach(function (v) { S(2, 'Letter' + v).Text = ''; });
      }
    } else {
      S(2, 'LetterCounter').Text = String(letterCount);
      S(2, 'ScoreAugment').Text = gotSameLetter ? '1000' : '';
      if (vowelsRemaining && !consonantsRemaining && S(9, 'NoMoreVowels').Text === 'on') {
        S(2, 'NoMoreConsonants').Visible = true;
        C.CONS_SEL.forEach(function (v) { S(2, 'Letter' + v).Text = ''; });
      }
    }
    L.Text = '';
    S(2, 'LetterSelectionOverlay2').Visible = false;
    setValuePanelDisplay();
    if (!finalSpinOn) Play('GuessLetterCorrect');
    if (window.Extras) Extras.onLetter(theLetter, letterCount);
  };

  M.revealLetter = async function (el) {
    var tab = S(2, 'LeftTab').Text;
    if (tab === 'Load Puzzle' || tab === 'Load Next') { await LoadPuzzleOrSolve(); return; }
    var m = /^PuzzleBoard(\d+)$/.exec(el.dataset.name); if (!m) return;
    var i = +m[1], tile = S(2, 'PuzzleBoard' + i);
    if (tile.FillRGB === BLUE) { tile.Text = S(2, 'PuzzleCache' + i).Text; tile.FillRGB = WHITE; return; }
    if (tile.FillRGB === GREEN) return;
    for (var k = 1; k <= 27; k++) if (S(2, 'Letter' + k).Text === '') return;   // a letter was already called: do nothing
    if (S(2, 'SpunWheelValue').Text === '') {
      var sText = await askTossUpValue('How much is the Toss-Up worth in dollars?', 'Set Toss-Up Value', '1000', 'The toss-up value must be greater than 0.', 'Set Toss-Up Value');
      if (sText === '') return;
      S(2, 'SpunWheelValue').Text = String(CLng(sText));
      setValuePanelDisplay();
    }
    if (!S(2, 'TossUpBanner').Visible) {
      for (var q = 1; q <= 27; q++) { S(2, 'Letter' + q).Visible = false; S(2, 'TossUpBanner').Visible = true; }
    }
    var isFirstReveal = true, lettersLeft = 0;
    for (var n = 1; n <= 52; n++) {
      var t = S(2, 'PuzzleBoard' + n);
      if (t.FillRGB === WHITE) {
        if (C.isLetter(t.Text)) isFirstReveal = false;
        else if (t.Text === '') lettersLeft++;
      }
    }
    if (tile.Text !== '') return;   // already showing (the slideshow would just re-write the same letter)
    tile.Text = S(2, 'PuzzleCache' + i).Text;
    if (lettersLeft <= 1) { solvePuzzle(false); Play('GuessLetterWrong'); return; }
    if (isFirstReveal) {
      if (S(2, 'TossUpTitle').Text === 'Toss-Up Puzzle') S(2, 'TripleTossUpNumber').Text = '0';
      Play('TossUpMusic');
    }
  };

  function bringLetterBack(i) { S(2, 'Letter' + i).Text = i === 27 ? S(9, 'SpanN').Text : String.fromCharCode(i + 64); }

  M.EditSetUpPuzzle = async function (el) {
    var oSh = PPT.wrap(el);
    var sText = await InputBox('Type the letter for this puzzle board tile:', 'Set Up Puzzle', oSh.Text);
    while (Trim(sText).length > 1) sText = await InputBox('Only one letter per tile. Try again.\n\nProtip: Use Puzzle Scribe (the pencil button) to type an entire puzzle at once.', 'Set Up Puzzle', sText);
    if (Trim(sText).length === 1 && sText !== ' ') { oSh.Text = Trim(sText.toUpperCase()); oSh.FillRGB = WHITE; }
    else { oSh.Text = ''; oSh.FillRGB = GREEN; }
  };
  M.EditSetUpCategory = async function (el) {
    var oSh = PPT.wrap(el);
    var sText = await InputBox('Type the category:', 'Set Up Category', oSh.Text);
    oSh.Text = Trim(sText.toUpperCase());
  };

  M.wipeScores = function () { return wipeOnClose(false); };
  M.wipeAllWarning = async function () {
    if (await YesNo('This will reset the template to a clean slate, preserving only your settings. Are you ABSOLUTELY sure you want this?', 'Confirm Wipe All Puzzles/Scores', true)) await wipeOnClose(true);
  };
  async function wipeOnClose(wipeAll) {
    if (wipeAll) deleteAllPuzzles();
    ClearBoardButton();
    ClearMysteryIndicator();
    wipeRoundScores();
    for (var i = 1; i <= 4; i++) {
      S(2, 'Player' + i + 'Name').Text = 'Player ' + i;
      S(2, 'Player' + i + 'TotalsScore').Text = '0';
      if (S(2, 'Player' + i + 'WildCard').FillTransparency === 0) S(2, 'Player' + i + 'WildCard').FillTransparency = 1;
      if (S(2, 'Player' + i + 'GiftTag').FillTransparency === 0) S(2, 'Player' + i + 'GiftTag').FillTransparency = 1;
    }
    restoreWheelItems();
    var np = S(2, 'NumPlayers').Text;
    if (np === '4 Players' || np === '2 Players') TogglePlayers(3);
    for (var j = 3; j <= 6; j++) S(j, 'WheelValue').Text = '';
    S(2, 'NextPuzzleToLoad').Text = '1';
    S(2, 'TripleTossUpNumber').Text = '';
    if (!S(2, 'Normal Round').Visible) {
      S(2, 'Normal Round').Visible = true; S(2, 'Wheel to Normal Round').Visible = true;
      S(2, 'Mystery Round').Visible = false; S(2, 'Wheel to Mystery Round').Visible = false;
      S(2, 'Express Round').Visible = false; S(2, 'Wheel to Express Round').Visible = false;
      S(2, 'Fourth Round').Visible = false; S(2, 'Wheel to Fourth Round').Visible = false;
      S(2, 'Bonus Round').Visible = false;
      toggleFourthRound(false);
      toggleBonusRound(false);
    }
    if (window.Extras) Extras.onWipe(wipeAll);
    // the slideshow ends here; the web version returns to the title screen
    GotoSlide(1);
    toast(wipeAll ? 'Everything wiped: puzzles, scores and names (settings kept).' : 'Scores, names and the board were wiped.');
  }
  function wipeRoundScores() { for (var i = 1; i <= 4; i++) S(2, 'Player' + i + 'RoundScore').Text = '0'; }

  function toggleWildCard() { for (var i = 3; i <= 5; i++) { S(i, 'TheWheel').item('WildCard').FillTransparency = 1; S(i, 'RestoreWheelItems').Visible = true; } }
  function toggleGiftTag() { for (var i = 3; i <= 5; i++) { S(i, 'TheWheel').item('GiftTag').FillTransparency = 1; S(i, 'RestoreWheelItems').Visible = true; } }

  function toggleOnOff(oSh) {
    if (oSh.Text === 'on') { oSh.Text = 'off'; oSh.FillRGB = RGB(217, 150, 148); }
    else { oSh.Text = 'on'; oSh.FillRGB = RGB(195, 214, 155); }
  }
  M.toggleOnOff = function (el) { toggleOnOff(PPT.wrap(el)); };

  function toggleSpanishN() {
    var sn = S(9, 'SpanishN');
    if (sn.Text === 'on') {
      sn.Text = 'off'; sn.FillRGB = RGB(217, 150, 148);
      S(2, 'Letter27').Visible = false;
      S(2, 'LetterSecondRowGroup').Left = 28.29772;
    } else {
      sn.Text = 'on'; sn.FillRGB = RGB(195, 214, 155);
      if (S(2, 'Letter1').Visible) S(2, 'Letter27').Visible = true;
      S(2, 'LetterSecondRowGroup').Left = 37.50764;
    }
  }
  M.toggleSpanishN = function () { toggleSpanishN(); };

  function restoreWheelItems() {
    for (var i = 3; i <= 5; i++) {
      if (S(10, 'WildCard').Text === 'on') S(i, 'TheWheel').item('WildCard').FillTransparency = 0;
      if (S(10, 'GiftTag').Text === 'on') S(i, 'TheWheel').item('GiftTag').FillTransparency = 0;
      S(i, 'RestoreWheelItems').Visible = false;
    }
  }
  M.restoreWheelItems = function () { restoreWheelItems(); };

  M.toggleWheelValues = function () {
    var wv = S(10, 'WheelValues'), i, j;
    if (wv.Text === '$500-$900') {
      wv.Text = '$300-$900';
      for (i = 3; i <= 6; i++) for (j = 1; j <= 7; j++) S(i, 'TheWheel').item('ClassicWedge' + j).FillTransparency = 0;
    } else {
      wv.Text = '$500-$900';
      for (i = 3; i <= 6; i++) for (j = 1; j <= 7; j++) S(i, 'TheWheel').item('ClassicWedge' + j).FillTransparency = 1;
    }
    WOFWheel.redrawAll();
  };
  M.toggleFreePlay = function (el) {
    toggleOnOff(PPT.wrap(el));
    var off = S(10, 'FreePlayWedge').Text === 'off';
    for (var i = 3; i <= 6; i++) S(i, 'TheWheel').item('Yellow850').FillTransparency = off ? 0 : 1;
  };
  M.toggleBankrupts = function (el) {
    var m = /^Slide(\d)Bankrupts$/.exec(el.dataset.name); if (!m) return;
    var i = +m[1], oSh = PPT.wrap(el);
    if (oSh.Text === '2') { oSh.Text = '1'; S(i, 'TheWheel').item('Purple600').FillTransparency = 0; }
    else { oSh.Text = '2'; S(i, 'TheWheel').item('Purple600').FillTransparency = 1; }
  };
  M.toggleNonStandardWedges = function (el) {
    var oSh = PPT.wrap(el); toggleOnOff(oSh);
    for (var i = 3; i <= 6; i++) S(i, 'TheWheel').item(oSh.Name).FillTransparency = oSh.Text === 'off' ? 1 : 0;
    WOFWheel.redrawAll();
  };
  M.toggleWheelItems = function (el) {
    var oSh = PPT.wrap(el); toggleOnOff(oSh);
    for (var i = 3; i <= 5; i++) S(i, 'TheWheel').item(oSh.Name).FillTransparency = oSh.Text === 'off' ? 1 : 0;
  };
  M.toggleClaimable = function () { var w = S(10, 'WheelItems'); w.Text = w.Text === 'once' ? 'multiple' : 'once'; };

  M.toggleShotClock = async function (el) {
    var oSh = PPT.wrap(el), current = oSh.Text === 'none' ? 0 : CInt(oSh.Text.replace(' seconds', ''));
    var sText = await InputBox('The shot clock helps you enforce time limits for player decisions.\n\nEnter a number from 1 to 30 to enable and set the shot clock\'s time limit in seconds, or 0 to disable the shot clock.', 'Configure Shot Clock', String(current));
    while (!IsNumeric(sText) && sText !== '') sText = await InputBox('You can only enter numbers here. Try again:', 'Configure Shot Clock', sText);
    if (sText === '') return;
    var t = CInt(sText), i;
    if (t === 0) {
      oSh.Text = 'none';
      S(2, 'ShotClockBaseNumber').Text = '';
      ['ShotClockBaseNumber', 'ShotClockBase', 'ShotClockOverlay'].forEach(function (n) { S(2, n).Visible = false; });
      for (i = 0; i <= 29; i++) S(2, 'ShotClock' + i).Visible = false;
    } else if (t > 30 || t < 0) {
      await MsgBox('The shot clock time limit cannot exceed 30 seconds.', 'Configure Shot Clock Error');
      return;
    } else {
      oSh.Text = t + ' seconds';
      S(2, 'ShotClockBaseNumber').Text = String(t);
      ['ShotClockBaseNumber', 'ShotClockBase', 'ShotClockOverlay'].forEach(function (n) { S(2, n).Visible = true; });
      for (i = 0; i <= 29; i++) S(2, 'ShotClock' + i).Visible = false;
      for (i = 0; i <= t - 1; i++) S(2, 'ShotClock' + i).Visible = true;
    }
    if (window.ShotClock) ShotClock.reset();
  };

  M.editGameName = async function (el) {
    var oSh = PPT.wrap(el);
    var sText = await InputBox('Edit the game name. The default name is WHEEL OF FORTUNE.', 'Edit Game Name', oSh.Text);
    while (sText.indexOf('$') >= 0 && sText !== '') sText = await InputBox('The game name cannot contain the $ sign to prevent confusion with wheel values. Try again:', 'Edit Game Name', sText);
    if (Trim(sText) === '') return;
    if (S(2, 'ValuePanel').Text === oSh.Text) S(2, 'ValuePanel').Text = Trim(sText.toUpperCase());
    oSh.Text = Trim(sText.toUpperCase());
    S(1, 'WheelofFortuneLogo').Visible = sText.toUpperCase() === 'WHEEL OF FORTUNE';
  };

  function shiftRow(el, dir) {
    var m = /(\d)$/.exec(el.dataset.name); if (!m) return;
    var r = [[1, 12], [13, 26], [27, 40], [41, 52]][+m[1] - 1], minim = r[0], maxim = r[1], i;
    var T = function (n) { return S(8, 'SetUpPuzzle' + n); };
    if (dir > 0) {
      if (T(maxim).Text !== '') return;
      for (i = maxim - 1; i >= minim; i--) copyTile(T(i), T(i + 1));
      T(minim).Text = ''; T(minim).FillRGB = GREEN;
    } else {
      if (T(minim).Text !== '') return;
      for (i = minim + 1; i <= maxim; i++) copyTile(T(i), T(i - 1));
      T(maxim).Text = ''; T(maxim).FillRGB = GREEN;
    }
  }
  M.shiftRight = function (el) { shiftRow(el, 1); };
  M.shiftLeft = function (el) { shiftRow(el, -1); };
  M.shiftUp = function () {
    var T = function (n) { return S(8, 'SetUpPuzzle' + n); }, j;
    var blockers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 26];
    for (j = 0; j < blockers.length; j++) if (T(blockers[j]).Text !== '') return;
    for (j = 14; j <= 25; j++) copyTile(T(j), T(j - 13));
    for (j = 27; j <= 40; j++) copyTile(T(j), T(j - 14));
    [27, 40].forEach(function (n) { T(n).Text = ''; T(n).FillRGB = GREEN; });
    for (j = 41; j <= 52; j++) { copyTile(T(j), T(j - 13)); T(j).Text = ''; T(j).FillRGB = GREEN; }
  };
  M.shiftDown = function () {
    var T = function (n) { return S(8, 'SetUpPuzzle' + n); }, j;
    var blockers = [27, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
    for (j = 0; j < blockers.length; j++) if (T(blockers[j]).Text !== '') return;
    for (j = 28; j <= 39; j++) copyTile(T(j), T(j + 13));
    for (j = 13; j <= 26; j++) copyTile(T(j), T(j + 14));
    [13, 26].forEach(function (n) { T(n).Text = ''; T(n).FillRGB = GREEN; });
    for (j = 1; j <= 12; j++) { copyTile(T(j), T(j + 13)); T(j).Text = ''; T(j).FillRGB = GREEN; }
  };

  M.puzzleScribe = async function () {
    var existing = '', inRow = false, t;
    for (t = 1; t <= 52; t++) {
      var tx = cur('SetUpPuzzle' + t).Text;
      if (inRow) existing += tx !== '' ? tx : ' ';
      else if (tx !== '') { inRow = true; existing += existing === '' ? tx : ' \\ ' + tx; }
      if (t === 12 || t === 26 || t === 40 || t === 52) { existing = existing.replace(/ +$/, ''); inRow = false; }
    }
    var base = "Type your puzzle here, and it'll automatically write onto the tiles. Separate rows with \\.\n\nExample\npuzzle scribe \\ saves me time";
    var sText = await InputBox(base, 'Puzzle Scribe', existing.toLowerCase()), res;
    while (sText !== '') {
      res = C.scribe(sText);
      if (!res.error) break;
      sText = await InputBox(res.error < 5 ? 'Row ' + res.error + ' is too long for the puzzle board. Try again.\n\n' + base : 'This puzzle has more than the allowed four rows. Try again.\n\n' + base, 'Puzzle Scribe', sText);
    }
    if (sText === '') return;
    for (var j = 1; j <= 52; j++) {
      var tile = cur('SetUpPuzzle' + j), ch = res.cells[j - 1];
      if (ch) { tile.Text = ch; tile.FillRGB = WHITE; }
      else if (existing !== '') { tile.Text = ''; tile.FillRGB = GREEN; }
    }
  };

  M.puzzleProperties = async function () {
    var cells = []; for (var i = 1; i <= 52; i++) cells.push(S(8, 'SetUpPuzzle' + i).Text);
    var p = C.properties(cells);
    await MsgBox('TOTAL LETTERS: ' + p.total + '\nConsonants: ' + p.consonants + '\nVowels: ' + p.vowels + '\n\nUNIQUE LETTERS: ' + p.uniqueTotal +
      '\nConsonants: ' + p.uniqueConsonants + '\nVowels: ' + p.uniqueVowels + '\n\nRSTLNE RATIO: ' + p.rstlneRatio + '%', 'Puzzle Properties');
  };

  M.RSTLNE = async function () {
    if (!S(2, 'Letter1').Visible) { await MsgBox('Please load a new puzzle before starting the bonus round.', 'Start Bonus Round Error'); return; }
    if (S(2, 'RSTLNEOutline').LineTransparency === 0) {
      [18, 19, 20, 12, 14, 5].forEach(guessLetterViaFunction);
      S(2, 'BonusBox').FillRGB = RGB(225, 129, 75);
      S(2, 'RSTLNEBox').FillRGB = RGB(166, 166, 166);
      S(2, 'RSTLNEOutline').LineTransparency = 1;
      S(2, 'BonusOutline').LineTransparency = 0;
      S(2, 'LetterSelectionOverlay2').Visible = false;
      S(2, 'LetterCounter').Text = '';
      S(2, 'SpunWheelValue').Text = '';
      setValuePanelDisplay();
    }
  };
  function revealMatches(theLetter) {
    var found = false, blueOff = S(9, 'BlueTiles').Text === 'off';
    for (var k = 1; k <= 52; k++) {
      var t = S(2, 'PuzzleBoard' + k);
      if (t.FillRGB === WHITE && t.Text === '') {
        var c = S(2, 'PuzzleCache' + k).Text;
        if (C.lettersMatch(c, theLetter)) { if (blueOff) t.Text = c; else t.FillRGB = BLUE; found = true; }
      }
    }
    return found;
  }
  function guessLetterViaFunction(i) {
    var theLetter = S(2, 'Letter' + i).Text;
    if (theLetter === '') return;
    revealMatches(theLetter);
    S(2, 'Letter' + i).Text = '';
  }
  function resetBonusRound() {
    if (S(2, 'BonusOutline').LineTransparency === 0) while (S(2, 'BonusLetters').Text.length > 0) removeBonusLetter();
    S(2, 'BonusBox').FillRGB = RGB(166, 166, 166);
    S(2, 'RSTLNEBox').FillRGB = RGB(225, 129, 75);
    S(2, 'RSTLNEOutline').LineTransparency = 0;
    S(2, 'BonusOutline').LineTransparency = 1;
    S(2, 'BonusLetters').Text = '';
  }
  function removeBonusLetter() {
    var bl = S(2, 'BonusLetters');
    if (bl.Text !== '' && S(2, 'BonusOutline').LineTransparency === 0) {
      var ch = bl.Text.slice(-1);
      bl.Text = bl.Text.slice(0, -1);
      var num = ch === S(9, 'SpanN').Text ? 27 : ch.charCodeAt(0) - 64;
      S(2, 'Letter' + num).Text = ch;
    }
  }
  M.removeBonusLetter = function () { removeBonusLetter(); };
  M.guessBonusLetters = async function () {
    if (S(2, 'BonusOutline').LineTransparency === 0 && S(2, 'Letter1').Visible) {
      var letters = S(2, 'BonusLetters').Text;
      if (letters === '') { await MsgBox('No letters found. Use the letter selector to input the letters the contestant chooses for the bonus round.', 'Guess Bonus Round Letters Error'); return; }
      var letterExist = false;
      for (var i = 0; i < letters.length; i++) if (revealMatches(letters.charAt(i))) letterExist = true;
      S(2, 'BonusBox').FillRGB = RGB(166, 166, 166);
      S(2, 'BonusOutline').LineTransparency = 1;
      if (!letterExist) S(2, 'LetterSelectionOverlay2').Visible = true;
      else Play('GuessLetterCorrect');
    }
  };

  function toggleFourthRound(on) { S(2, 'FinalSpinButton').Visible = on; if (!on) disableFinalSpin(); }
  M.toggleFinalSpin = async function () {
    if (S(2, 'ValuePanel').Text === GameName()) { await MsgBox('Load a puzzle first before starting the Final Spin.', 'Final Spin Error'); return; }
    var b = S(2, 'FinalSpinButton');
    if (b.Visible) {
      if (b.LineTransparency === 1) {
        b.FillRGB = RGB(225, 129, 75); b.FillTransparency = 0; b.LineTransparency = 0;
        S(2, 'FinalSpinBanner').Visible = true; S(2, 'BlackCover').Visible = true; S(2, 'ManualFinalSpin').Visible = true;
        Play('FinalSpinAlert');
      } else disableFinalSpin();
    }
  };
  function disableFinalSpin() {
    var b = S(2, 'FinalSpinButton');
    b.FillRGB = RGB(166, 166, 166); b.FillTransparency = 0.5; b.LineTransparency = 1;
    S(2, 'BlackCover').Visible = false; S(2, 'FinalSpinBanner').Visible = false; S(2, 'ManualFinalSpin').Visible = false;
    if (S(2, 'ValuePanel').Text !== GameName()) setValuePanelDisplay();
  }
  function toggleBonusRound(on) {
    ['BonusTimerCircle', 'BonusTimerOverlay', 'BonusBox', 'RSTLNEBox', 'BonusOutline', 'RSTLNEOutline', 'RSTLNE', 'HelpBonus', 'ResetBonus', 'BonusLetters', 'Bonus10']
      .forEach(function (n) { S(2, n).Visible = on; });
    S(2, 'BonusBox').Text = '';
    S(2, 'StartedSpecialMusic').Text = '';
    if (window.BonusTimer) BonusTimer.reset();
  }
  M.bonusRoundBlock = function () { return MsgBox('Please reset the bonus round timer before switching rounds.', 'Exit Bonus Round Error'); };

  /* ---------- the spin (Module1.randomSpin + Module2.youLandedOn) ---------- */
  function youLandedOn(r, wheelType) {
    var sl = wheelType, std = S(10, 'WheelValues').Text === '$500-$900', W = function (n) { return S(sl, 'TheWheel').item(n); };
    var b = Math.floor(r / 150);
    switch (b) {
      case 0: return S(10, 'Slide' + wheelType + 'Bankrupts').Text === '1' ? '$600' : 'Bankrupt';
      case 1: return std ? '$900' : '$300';
      case 2: return '$500';
      case 3: return std ? '$650' : '$450';
      case 4: return '$500';
      case 5: return '$800';
      case 6: return 'Lose a Turn';
      case 7: return wheelType === 4 ? (W('MysteryWedge1').FillTransparency === 1 ? '$700' : 'Mystery 1') : '$700';
      case 8: return S(10, 'FreePlayWedge').Text === 'on' ? 'Free Play' : '$850';
      case 9: return '$650';
      case 10: return 'Bankrupt';
      case 11: return std ? '$600' : '$900';
      case 12:
        // web edition extra: the Million Dollar Wedge sits on this $500 wedge (Bankrupt | ONE MILLION | Bankrupt)
        try { if (W('MDWedge').FillTransparency === 0) return (r >= 1850 && r <= 1899) ? 'Million Dollar Wedge' : 'Bankrupt'; } catch (e) { }
        return '$500';
      case 13: return std ? '$550' : '$350';
      case 14: return '$600';
      case 15:
        if (W('5000Sliver').FillTransparency === 1) return '$500';
        return (r >= 2300 && r <= 2349) ? '$' + FormatNumber(5000) : 'Bankrupt';
      case 16: return std ? '$700' : '$400';
      case 17: return S(10, '5Wedge').Text === 'on' ? '$5' : '$500';
      case 18: return std ? '$650' : '$800';
      case 19:
        if (wheelType === 4 && W('MysteryWedge2').FillTransparency !== 1) return 'Mystery 2';
        return std ? '$600' : '$300';
      case 20: return wheelType === 5 ? 'Express' : '$700';
      case 21: return '$900';
      case 22: return '$500';
      default: return wheelType === 3 ? '$' + FormatNumber(2500) : (wheelType === 4 || wheelType === 5) ? '$' + FormatNumber(3500) : '$' + FormatNumber(5000);
    }
  }
  window.VBA.youLandedOn = youLandedOn;

  M.randomSpin = async function () {
    var sl = App.current;
    S(2, 'LetterCounter').Text = '';
    S(2, 'LetterSelectionOverlay2').Visible = false;
    var rand, landed, isFinalSpin = S(2, 'FinalSpinButton').Visible && S(2, 'FinalSpinButton').LineTransparency === 0;
    if (window.Extras && Extras.forcedSpin) { var f = Extras.forcedSpin(); if (f != null) rand = f; }
    do {
      if (rand == null || landed != null) rand = Math.floor(3600 * Math.random());
      landed = youLandedOn(rand, sl);
      if (window.Extras && Extras.mapLanding) landed = Extras.mapLanding(landed, rand, sl);
    } while (isFinalSpin && !IsNumeric(landed.replace('$', '')));
    var wv = S(sl, 'WheelValue');
    wv.Text = landed;
    var spun;
    if (IsNumeric(landed.replace('$', ''))) spun = String(CLng(landed.replace('$', '')));
    else if (landed === 'Mystery 1' || landed === 'Mystery 2' || landed === 'Express') spun = '1000';
    else if (landed === 'Free Play' || landed === 'Million Dollar Wedge') spun = '500';
    else if (landed === 'Bankrupt' || landed === 'Lose a Turn') spun = '';
    if (spun != null) S(2, 'SpunWheelValue').Text = spun;
    if (window.Extras && Extras.onLanded) Extras.onLanded(landed, rand, sl);
    setValuePanelDisplay();
    Play('SpinWheel');
    // the slideshow's animation: wheel spins 1800 + rand/10 degrees over 3.6 s; the result box and Back button appear at the end
    var hide = ['WheelValue', 'BackText', 'BackOval'].map(function (n) { return S(sl, n); });
    hide.forEach(function (s) { s.el.style.visibility = 'hidden'; });
    await WOFWheel.spin(App.slide(sl).el, rand / 10, 3600);
    hide.forEach(function (s) { s.el.style.visibility = ''; });
    if (window.Extras && Extras.afterSpin) await Extras.afterSpin(landed, rand, sl);
  };

  M.manuallySetValuePanel = function () { return manuallySetValuePanel(); };
  async function manuallySetValuePanel() {
    if (S(2, 'ValuePanel').Text === GameName()) { await MsgBox('Load a puzzle first before manually setting the spun wheel value.', 'Manually Set Value Panel'); return; }
    var sText = await InputBox('Manually set the spun wheel value:', 'Manually Set Value Panel', S(2, 'SpunWheelValue').Text);
    while (!IsNumeric(sText) && sText !== '') sText = await InputBox('You can only enter numbers here. Try again:', 'Manually Set Value Panel', sText);
    if (sText === '') return;
    if (CLng(sText) < 1) { await MsgBox('The wheel value must be greater than 0.', 'Manually Set Value Panel'); return; }
    S(2, 'SpunWheelValue').Text = String(CLng(sText));
    S(2, 'LetterSelectionOverlay2').Visible = false;
    setValuePanelDisplay();
  }

  function setValuePanelDisplay() {
    var spun = S(2, 'SpunWheelValue').Text, lc = S(2, 'LetterCounter').Text, aug = S(2, 'ScoreAugment').Text, vp = S(2, 'ValuePanel'), eff;
    if (spun !== '') {
      eff = S(2, 'FinalSpinButton').LineTransparency === 1 ? CLng(spun) : CLng(spun) + 1000;
      vp.Text = '$' + FormatNumber(eff);
    } else { vp.Text = ''; return; }
    if (lc !== '' && IsNumeric(lc) && aug === '') vp.Text = vp.Text + ' * ' + lc + ' = $' + FormatNumber(eff * CLng(lc));
    else if (lc !== '' && IsNumeric(lc) && IsNumeric(aug)) vp.Text = vp.Text + ' * ' + lc + ' + ' + FormatNumber(CLng(aug)) + ' = $' + FormatNumber(eff * CLng(lc) + CLng(aug));
  }
  window.VBA.setValuePanelDisplay = setValuePanelDisplay;

  M.puzzleSwapChoose = async function (el) {
    var oSh = PPT.wrap(el);
    var n = await InputBox('Swap this puzzle with puzzle number:', 'Puzzle Swap', '');
    while (!IsNumeric(n)) { if (n === '') return; n = await InputBox('Please enter a number:', 'Puzzle Swap', n); }
    await puzzleSwap(CInt(oSh.Text), CInt(n));
  };
  async function puzzleSwap(i, j) {
    var ii = Math.floor((i - 1) / 12), jj = Math.floor((j - 1) / 12), l;
    if (j >= 1 && jj + 1 <= SlidesCount4()) {
      var tmp = [], cat;
      for (l = 1; l <= 52; l++) { var a = S(pg(ii), 'PuzzleSolution' + i + '-' + l); tmp.push([a.Text, a.FillRGB]); }
      cat = S(pg(ii), 'PuzzleCategory' + i).Text;
      for (l = 1; l <= 52; l++) copyTile(S(pg(jj), 'PuzzleSolution' + j + '-' + l), S(pg(ii), 'PuzzleSolution' + i + '-' + l));
      S(pg(ii), 'PuzzleCategory' + i).Text = S(pg(jj), 'PuzzleCategory' + j).Text;
      for (l = 1; l <= 52; l++) { var b = S(pg(jj), 'PuzzleSolution' + j + '-' + l); b.Text = tmp[l - 1][0]; b.FillRGB = tmp[l - 1][1]; }
      S(pg(jj), 'PuzzleCategory' + j).Text = cat;
    } else await MsgBox('The puzzle number you want to swap with does not exist. Generate more puzzle numbers with the right arrow next to the puzzle numbers in Set Up Puzzles.', 'Puzzle Swap');
  }

  function addPuzzleRow(num) {
    App.slide(pg(num));                                   // builds a fresh copy of slide 12 renumbered for this page
    if (num > 0) S(pg(num - 1), 'NextAllPuzzles').Visible = true;
  }
  window.VBA.addPuzzleRow = addPuzzleRow;
  function relabelLinks(fromRow, toRow) {
    for (var r = 7; r <= 9; r++) {
      for (var p = 1; p <= 12; p++) { var s = S(r, 'LinkTo' + (p + 12 * fromRow)); s.rename('LinkTo' + (p + 12 * toRow)); s.Text = String(p + 12 * toRow); }
      S(r, 'PrevPuzzleRow').Visible = toRow !== 0;
    }
  }
  window.VBA.relabelLinks = relabelLinks;
  M.nextPuzzleRow = function () {
    savePuzzle();
    var RowIndex = currentRow();
    S(7, 'CurrentPuzzleRowIndex').Text = String(RowIndex + 1);
    if (SlidesCount4() <= RowIndex + 1) addPuzzleRow(RowIndex + 1);
    relabelLinks(RowIndex, RowIndex + 1);
    puzzleSetupJump(1 + 12 * (RowIndex + 1));
  };
  M.prevPuzzleRow = function () {
    savePuzzle();
    var RowIndex = currentRow();
    S(7, 'CurrentPuzzleRowIndex').Text = String(RowIndex - 1);
    relabelLinks(RowIndex, RowIndex - 1);
    puzzleSetupJump(1 + 12 * (RowIndex - 1));
  };
  function exactPuzzleRow(num) {
    var RowIndex = currentRow();
    relabelLinks(RowIndex, num);
    S(7, 'CurrentPuzzleRowIndex').Text = String(num);
  }

  function TogglePlayers(numPlayers) {
    var parts = { BuyVowelButton: 0, TransferTotalsButton: 1, RoundDollarSign: 2, TotalsDollarSign: 2, RoundScore: 3, RoundScoreCompatibility: 3, TotalsScore: 4, Name: 5, XButton: 6, XButtonCompatibility: 6, WildCard: 7, GiftTag: 8 };
    var base4 = [85.61977, 85.65504, 103.5772, 121.5772, 117.9772, 92.63976, 197.8109, 218.6326, 215.8];
    var base3 = [118.98, 119.0153, 136.9374, 154.9374, 151.3376, 126, 231.1711, 251.9928, 249.1602];
    var base2 = [193.0415, 193.0768, 210.9989, 228.9989, 225.3991, 200.0615, 305.2326, 326.0543, 323.2217];
    function place(p, base, step, slot) { Object.keys(parts).forEach(function (k) { S(2, 'Player' + p + k).Left = base[parts[k]] + step * slot; }); }
    var p;
    if (numPlayers === 4) {
      for (p = 1; p <= 4; p++) place(p, base4, 157.4233, p - 1);
      S(2, 'RoundTotals').Left = 16.94433; S(2, 'NumPlayers').Left = 34.35677; S(2, 'RemovePlayers').Left = 19.42866;
      S(2, 'NumPlayers').Text = '4 Players'; S(2, 'AddPlayers').Visible = false; S(2, 'RemovePlayers').Visible = true;
    } else if (numPlayers === 3) {
      for (p = 1; p <= 3; p++) place(p, base3, 185.5516, p - 1);
      place(4, base3, 185.5516, 3.4);
      S(2, 'RoundTotals').Left = 32.13055; S(2, 'NumPlayers').Left = 42.07858; S(2, 'AddPlayers').Left = 88.9752; S(2, 'RemovePlayers').Left = 27.15047;
      S(2, 'NumPlayers').Text = '3 Players'; S(2, 'AddPlayers').Visible = true; S(2, 'RemovePlayers').Visible = true;
    } else {
      for (p = 1; p <= 2; p++) place(p, base2, 185.5516, p - 1);
      for (p = 3; p <= 4; p++) place(p, base2, 185.5516, 1.4 + p - 1);
      S(2, 'RoundTotals').Left = 32.13055; S(2, 'NumPlayers').Left = 34.57827; S(2, 'AddPlayers').Left = 81.47488;
      S(2, 'NumPlayers').Text = '2 Players'; S(2, 'AddPlayers').Visible = true; S(2, 'RemovePlayers').Visible = false;
    }
    S(2, 'StartedSpecialMusic').Text = '';
    if (window.Extras) Extras.onPlayersChanged();
  }
  M.TogglePlayersPlus = function () { var t = S(2, 'NumPlayers').Text; if (t === '2 Players') TogglePlayers(3); else if (t === '3 Players') TogglePlayers(4); };
  M.TogglePlayersMinus = function () { var t = S(2, 'NumPlayers').Text; if (t === '4 Players') TogglePlayers(3); else if (t === '3 Players') TogglePlayers(2); };

  /* ---------- the "?" explanations ---------- */
  var EXPLAIN = {
    ExplainVowelPrice: ['Choose how much it costs to buy a vowel.', 'Vowel Price Setting'],
    ExplainHouseMinimum: ['Choose how much the player wins if their round total is below the given amount.', 'House Minimum Setting'],
    ExplainShotClock: ['Add an optional in-game timer to the puzzle board with a given amount of seconds. Use it to enforce time limits on player decisions.', 'Shot Clock Setting'],
    ExplainBlueTiles: ['When a correct letter is called in the puzzle, choose whether the puzzle board tiles light up blue (requiring a click to reveal the letter) or if the letters show up instantly. The default is on.', 'Blue Tiles Setting'],
    ExplainNoMoreVowels: ['Choose whether to inform players when there are no more vowels or no more consonants in the puzzle. The default is on.', 'No More Vowels/Consonants Setting'],
    ExplainClaimable: ['When a player collects a wheel item, choose whether the game removes the item from the wheel (claimable once) or leaves it for others to earn (claimable multiple). The default is once.', 'Claimable Setting'],
    ExplainBaseValue: ["Choose the range of regular values on the wheel. The default is $500-$900, which represents the show's current wheel (as of this writing).", 'Values Range Setting'],
    ExplainBackdrop: ['Choose the background scenery of the puzzle board and wheel.\n\nProtip: You can also change the backdrop in the puzzle board by clicking the right light pillar.', 'Backdrop Setting'],
    ExplainGameName: ['Edit the name of the game that displays on the puzzle board.\n\nGame names other than WHEEL OF FORTUNE will also hide the Wheel of Fortune logo from the title slide.', 'Game Name Setting'],
    ExplainFreePlay: ['Choose whether to use the Free Play wedge on the wheel (retired in 2021 on the actual show). The default is off.\n\nLanding on Free Play lets the player call a consonant at $500 or a vowel for free. The player then gets another turn regardless if the letter they called is in the puzzle.', 'Free Play Wedge Setting'],
    ExplainNumberofBankrupts: ['Choose how many Bankrupt wedges are applied to each round. The default is 2 for all rounds.', 'Number of Bankrupts Setting'],
    ExplainWildCard: ['Choose whether to use the Wild Card item on the wheel. The default is off.\n\nThe Wild Card, when used by the player, lets them call another consonant worth the value of their prior spin. The player can also use it during the Bonus Round to call an extra consonant.', 'Wild Card Setting'],
    Explain5000Sliver: ['Choose whether to use the $5,000 Sliver on the wheel (does not exist in the actual show). The default is off.\n\nThe wedge is split into thirds: two Bankrupts on the side and $5,000 in the middle (similar to the actual show\'s Million Dollar Wedge).', '$5,000 Sliver Setting'],
    ExplainGiftTag: ['Choose whether to use the Gift Tag item on the wheel (retired in 2023 on the actual show). The default is off.\n\nThe Gift Tag is an auxiliary item that gives the player a prize of your choice.', 'Gift Tag Setting'],
    Explain5Wedge: ['Optionally place a $5 wedge on the wheel (does not exist in the actual show). The default is off.', '$5 Wedge Setting'],
    ExplainPuzzleBoardTrim: ['Choose the color scheme of puzzle board elements, like the puzzle board frame, wheel trim, and category box.\n\nProtip: You can also change the color scheme in the puzzle board by clicking the puzzle board frame.', 'Color Scheme Setting'],
    ExplainSpecialScoreBonuses: ['Choose whether to activate the following score bonuses from the actual show:\n\n- Calling the same letter in a Same Letter puzzle awards the player an additional $1,000.\n- Solving all three Triple Toss-Ups augments that player\'s Triple Toss-Up winnings to 5x the Triple Toss-Up value (ex: $10,000 if each Toss-Up is worth $2,000).\n\nTo reduce confusion for new hosts, the default is off.', 'Special Score Bonuses Setting'],
    ExplainSolveButton: ['Choose what happens when you press the Solve button:\n\n- reveal - Reveal the puzzle.\n- verify - An input box appears to verify the player\'s solution. Useful for games when the host does not know the puzzles.\n\nThe default is reveal.', 'Solve Button Setting']
  };
  Object.keys(EXPLAIN).forEach(function (k) { M[k] = function () { return MsgBox(EXPLAIN[k][0], EXPLAIN[k][1]); }; });
  M.ExplainSpanishN = function () { var N = S(9, 'SpanN').Text; return MsgBox('If your puzzles are in Spanish, enable this setting to make ' + N + ' a selectable letter.', 'Spanish ' + N + ' Setting'); };

  M.doFinalSpin = async function () {
    S(2, 'BlackCover').Visible = false; S(2, 'FinalSpinBanner').Visible = false; S(2, 'ManualFinalSpin').Visible = false;
    GotoSlide(6);
    await M.randomSpin();
  };
  M.manualFinalSpin = async function () {
    await manuallySetValuePanel();
    setValuePanelDisplay();
    S(2, 'BlackCover').Visible = false; S(2, 'FinalSpinBanner').Visible = false; S(2, 'ManualFinalSpin').Visible = false;
    Play('FinalSpinMusic');
  };
  M.goToPuzzleBoardFromFourthRound = function () {
    GotoSlide(2);
    if (S(2, 'FinalSpinButton').LineTransparency === 0) Play('FinalSpinMusic');
  };

  M.revealTossUpLetter = function () {
    var blank = [], isFirstReveal = true;
    for (var i = 1; i <= 52; i++) {
      var t = S(2, 'PuzzleBoard' + i);
      if (t.FillRGB === WHITE) {
        if (C.isLetter(t.Text)) isFirstReveal = false;
        if (t.Text === '') blank.push(i);
      }
    }
    if (blank.length <= 1) { solvePuzzle(false); Play('GuessLetterWrong'); return; }
    var r = blank[Math.floor(blank.length * Math.random())];
    S(2, 'PuzzleBoard' + r).Text = S(2, 'PuzzleCache' + r).Text;
    if (isFirstReveal) Play('TossUpMusic');
  };

  var TRIMS = {
    blue: { next: 'gold', wi: [224, 211, 164], wo: [56, 48, 20], bt: [221, 185, 121], bb: [215, 172, 95], cb: [113, 90, 33], ct: [150, 134, 64], so: [153, 124, 65], po: [154, 150, 60], pi: [174, 165, 52], sc: [151, 138, 67] },
    gold: { next: 'silver', wi: [169, 168, 178], wo: [53, 53, 63], bt: [172, 171, 177], bb: [153, 154, 165], cb: [79, 79, 93], ct: [111, 109, 129], so: [97, 96, 112], po: [135, 134, 150], pi: [153, 151, 167], sc: [135, 134, 150] },
    silver: { next: 'blue', wi: [182, 209, 248], wo: [27, 11, 123], bt: [11, 70, 203], bb: [37, 88, 231], cb: [23, 55, 94], ct: [162, 156, 178], so: [57, 57, 231], po: [86, 111, 182], pi: [21, 124, 187], sc: [79, 129, 189] }
  };
  M.PuzzleBoardTrimChange = function () {
    var tn = S(9, 'PuzzleBoardTrim'), t = TRIMS[tn.Text] || TRIMS.silver, nx = t.next;
    if (nx === 'gold') { S(2, 'CategoryOutlineGold').Visible = true; S(2, 'BoardFrameOuterGold').Visible = true; S(2, 'StartedSpecialMusic').Text = ''; }
    else if (nx === 'silver') { S(2, 'CategoryOutlineGold').Visible = false; S(2, 'BoardFrameOuterGold').Visible = false; S(2, 'CategoryOutlineSilver').Visible = true; S(2, 'BoardFrameOuterSilver').Visible = true; S(2, 'StartedSpecialMusic').Text = ''; }
    else { S(2, 'CategoryOutlineSilver').Visible = false; S(2, 'BoardFrameOuterSilver').Visible = false; }
    tn.Text = nx;
    S(2, 'BoardFrameInner').Gradient = [[0, rgbA(t.bt), 1], [1, rgbA(t.bb), 1]];
    S(2, 'CategoryBox').FillRGB = rgbA(t.cb);
    S(2, 'CategoryTrapezoidTop').FillRGB = rgbA(t.ct);
    S(2, 'CategoryTrapezoidBottom').FillRGB = rgbA(t.ct);
    S(2, 'ScoreBoard').LineRGB = rgbA(t.so);
    var panel = [[0, rgbA(t.po), 0.6], [0.5, rgbA(t.pi), 0.85], [1, rgbA(t.po), 0.6]];
    S(2, 'ValuePanel').Gradient = panel;
    S(2, 'LetterSelectionOverlay').Gradient = panel;
    for (var i = 3; i <= 6; i++) {
      S(i, 'WheelTrim').Gradient = [[0.66, rgbA(t.wi), 1], [0.73, rgbA(t.wo), 1]];
    }
    for (var j = 0; j <= 29; j++) S(2, 'ShotClock' + j).FillRGB = rgbA(t.sc);
    S(2, 'ShotClockBase').FillRGB = rgbA(t.sc);
    S(2, 'ShotClockBaseNumber').FillRGB = rgbA(t.sc);
  };

  /* the gray top-right box on the puzzle board uses the compact layout */
  var COMPACT_TOP_RIGHT = { TopRightBG: 536.4376, BonusLetters: 368.158, ResetBonus: 446.6068, HelpBonus: 448.1335, RSTLNE: 270.143, BonusOutline: 396, RSTLNEOutline: 295.2, BonusBox: 396, RSTLNEBox: 295.2 };
  function compactTopRight() {
    Object.keys(COMPACT_TOP_RIGHT).forEach(function (k) { S(2, k).Left = COMPACT_TOP_RIGHT[k]; });
    S(2, 'TopRightBG').Width = 171.0907;
  }
  window.VBA.compactTopRight = compactTopRight;

  M.startBonusCountdownMusic = function () {
    var s = S(2, 'StartedSpecialMusic');
    if (s.Text === '') { s.Text = '1'; Play('BonusCountdown'); if (window.BonusTimer) BonusTimer.start(); }
    else { s.Text = ''; if (window.BonusTimer) BonusTimer.reset(); }
  };
  M.boardTileBezel = async function () { var t = S(2, 'LeftTab').Text; if (t === 'Load Puzzle' || t === 'Load Next') await LoadPuzzleOrSolve(); };

  M.changeRounds = function (el) {
    var n = el.dataset.name, oSh = PPT.wrap(el);
    if (n === 'Normal Round') { oSh.Visible = false; S(2, 'Wheel to Normal Round').Visible = false; S(2, 'Mystery Round').Visible = true; S(2, 'Wheel to Mystery Round').Visible = true; }
    else if (n === 'Mystery Round') { oSh.Visible = false; S(2, 'Wheel to Mystery Round').Visible = false; S(2, 'Express Round').Visible = true; S(2, 'Wheel to Express Round').Visible = true; }
    else if (n === 'Express Round') { oSh.Visible = false; S(2, 'Wheel to Express Round').Visible = false; S(2, 'Fourth Round').Visible = true; S(2, 'Wheel to Fourth Round').Visible = true; toggleFourthRound(true); }
    else if (n === 'Fourth Round') { oSh.Visible = false; S(2, 'Wheel to Fourth Round').Visible = false; S(2, 'Bonus Round').Visible = true; toggleFourthRound(false); toggleBonusRound(true); }
    else if (n === 'Bonus Round') {
      oSh.Visible = false; S(2, 'Wheel to Normal Round').Visible = true; S(2, 'Normal Round').Visible = true; toggleBonusRound(false);
      if (S(2, 'BonusOutline').LineTransparency === 0) resetBonusRound();
    }
    if (window.Extras) Extras.onRoundChanged();
  };

  M.randomCategory = async function () {
    var c = C.CATEGORIES[Math.floor(Math.random() * C.CATEGORIES.length)];
    S(8, 'SetUpPuzzleCategory').Text = '';
    await sleep(100);
    S(8, 'SetUpPuzzleCategory').Text = c;
  };
  M.toggleSolveButton = function () { var s = S(9, 'SolveButton'); s.Text = s.Text === 'reveal' ? 'verify' : 'reveal'; };

  async function verifyPuzzle(resetValuePanel) {
    var current = '', answer = '', ch;
    for (var i = 1; i <= 52; i++) {
      ch = S(2, 'PuzzleCache' + i).Text;
      if (ch === '') { if (answer.slice(-1) !== ' ') { answer += ' '; current += ' '; } }
      else { answer += ch; current += S(2, 'PuzzleBoard' + i).Text === '' ? '_' : ch; }
      if (answer.slice(-1) === ' ' && (i === 12 || i === 26 || i === 40 || i === 52)) { answer = answer.replace(/ +$/, '') + ' '; current = current.replace(/ +$/, '') + ' '; }
    }
    answer = Trim(answer); current = Trim(current);
    if (answer === '' || answer === current) { solvePuzzle(resetValuePanel); return true; }
    var sText = await InputBox('Type the player\'s answer to check it. Double-check for typos!\n\nTo reveal without typing the answer, type "/reveal" (without quotes).', 'Verify Solve', current.toLowerCase());
    if (sText === '') return false;
    if (sText !== '/reveal' && answer.toLowerCase() !== Trim(sText).toLowerCase()) {
      await MsgBox('Incorrect solve, sorry!', 'Incorrect Solve');
      Play('GuessLetterWrong');
      if (window.Extras) Extras.onWrongSolve();
      return false;
    }
    solvePuzzle(resetValuePanel);
    return true;
  }

  /* exported for extras / tests */
  Object.assign(window.VBA, {
    solvePuzzle: solvePuzzle, ClearBoardButton: ClearBoardButton, TogglePlayers: TogglePlayers, toggleWildCard: toggleWildCard, toggleGiftTag: toggleGiftTag,
    savePuzzleAndShadeOccupiedPuzzles: savePuzzleAndShadeOccupiedPuzzles, shadeOccupiedPuzzlesFull: shadeOccupiedPuzzlesFull, exactPuzzleRow: exactPuzzleRow,
    currentRow: currentRow, guessLetter: M.guessLetter, InputBox: InputBox, MsgBox: MsgBox, YesNo: YesNo, Play: Play, GameName: GameName, pg: pg
  });
})();
