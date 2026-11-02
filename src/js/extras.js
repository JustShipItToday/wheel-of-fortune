/* extras.js — features the slideshow doesn't have, modelled on today's show:
     • Turn tracker (who's up; passes on Bankrupt, Lose a Turn, a missed letter, a wrong solve, or shot-clock time-out)
     • Million Dollar Wedge (a wheel item for the Normal/Mystery/Express wheels; swaps the $100,000 bonus envelope for $1,000,000)
     • Bonus prize wheel (24 envelopes, prizes editable; defaults follow the show's $40,000 to $100,000 range plus cars)
     • Prize Puzzle (load a puzzle number with P, e.g. 4P; the solver wins the prize)
     • Pick-a-category Bonus Round (the contestant chooses one of three categories)
     • Spin Length screen (Wheel Settings): how long each wheel spins, with optional extra tension on the big wheels
     • Extra Features screen, puzzle import from text, game file save/load
   Like the rest of the port, extras keep their state in shapes, so autosave covers them. The new shapes are
   added to the slide layouts before anything is built, styled by cloning the slideshow's own shapes. */
(function () {
  'use strict';
  var L = window.WOF_LAYOUT;
  var DEFAULT_PRIZES = ['$40,000', '$45,000', '$40,000', '$50,000', 'A NEW CAR', '$40,000', '$55,000', '$45,000', '$40,000', '$60,000', '$45,000', '$50,000',
    '$100,000', '$40,000', '$45,000', '$55,000', '$50,000', 'A NEW CAR', '$40,000', '$75,000', '$45,000', '$50,000', '$60,000', '$55,000'];

  /* ---------- layout helpers ---------- */
  function find(slide, name, pred) { return L[slide].filter(function (o) { return o.n === name && (!pred || pred(o)); })[0]; }
  function clone(slide, name, over, pred) {
    var o = JSON.parse(JSON.stringify(find(slide, name, pred)));
    delete o.m; delete o.j; delete o.u; delete o.hid; delete o.gl;
    return Object.assign(o, over || {});
  }
  function txt(o, text, sz) {
    var p = o.t[0], r = Object.assign({}, p.r[0] || p.e || {});
    r.t = text; if (sz) r.sz = sz; o.t = [{ al: p.al, r: [r] }];
    return o;
  }
  function hiddenText(n, value) { return { k: 's', n: n, x: 0, y: 600, w: 40, h: 20, hid: 1, f: { n: 1 }, l: { n: 1 }, t: [{ al: 'ctr', r: [{ t: value, sz: 10 }] }] }; }
  function insertAfter(slide, afterName, objs) {
    var i = L[slide].findIndex(function (o) { return o.n === afterName; });
    L[slide].splice(i + 1, 0, ...objs);
  }

  /* button column on the Extra Features screen, top to bottom */
  var BTN_ORDER = ['XEditPrizes', 'XEditPrizePuzzle', 'XAddSamples', 'XImportPuzzles', 'XSaveFile', 'XLoadFile', 'XOpenHelp'];
  function btnY(name) { return 138 + BTN_ORDER.indexOf(name) * 38; }

  /* ---------- Extra Features screen (id 40) ---------- */
  function buildExtrasLayout() {
    var s = [];
    s.push(txt(clone(9, 'TextBox 44', { n: 'XTitle' }), 'Extra Features'));
    s.push(txt(clone(10, 'TextBox 125', { n: 'XIntro' }), "Extras that aren't in the original slideshow, based on today's show. Turn them on or off here."));
    var rows = [
      ['XTurnTracker', 'Turn Tracker:', 'on', 'XExplainTurn'],
      ['XMillionWedge', 'Million Dollar Wedge:', 'off', 'XExplainMDW'],
      ['XPickCategory', 'Pick-a-Category Bonus:', 'on', 'XExplainPick'],
      ['XBonusWheel', 'Bonus Prize Wheel:', 'on', 'XExplainBonusWheel']
    ];
    rows.forEach(function (r, i) {
      var y = 140 + i * 50;
      s.push(txt(clone(9, 'TextBox 152', { n: 'XLabel' + i, x: 150, y: y, w: 230, h: 30 }), r[1]));
      s.push(clone(9, 'Help', { n: 'XHelp' + i, x: 130, y: y + 6, m: r[3] }));
      var tg = txt(clone(9, r[2] === 'on' ? 'BlueTiles' : 'SpanishN', { n: r[0], x: 392, y: y + 2, m: r[0] === 'XMillionWedge' ? 'XToggleMDW' : 'toggleOnOff' }), r[2]);
      s.push(tg);
    });
    var btns = [['XEditPrizes', 'Edit Bonus Prizes'], ['XEditPrizePuzzle', 'Edit Prize Puzzle Prize'], ['XImportPuzzles', 'Import Puzzles from Text'], ['XSaveFile', 'Save Game File'], ['XLoadFile', 'Load Game File']];
    btns.forEach(function (b, i) {
      s.push(txt(clone(9, 'TextBox 173', { n: b[0], x: 560, y: btnY(b[0]), w: 240, h: 30, m: b[0] }), b[1]));
    });
    s.push(txt(clone(10, 'TextBox 125', { n: 'XHint', y: 410, h: 48 }), 'At Load Puzzle: add P for a Prize Puzzle (4P), or type S for a random sample puzzle (ST, SP and STTT work too). Click the dot next to a player to give them the turn.'));
    s.push(clone(10, 'GoBack', { n: 'XGoBack', j: 'back' }));
    s.push(hiddenText('XBonusPrizes', DEFAULT_PRIZES.join('|')));
    s.push(hiddenText('XPrizeName', 'A TRIP TO HAWAII'));
    s.push(hiddenText('XPrizeValue', '10000'));
    // added in the sample puzzles + help update (kept at the end of the list; see above)
    var y5 = 140 + 4 * 50;
    s.push(txt(clone(9, 'TextBox 152', { n: 'XLabel4', x: 150, y: y5, w: 230, h: 30 }), 'Sample Puzzles:'));
    s.push(clone(9, 'Help', { n: 'XHelp4', x: 130, y: y5 + 6, m: 'XExplainSamples' }));
    s.push(txt(clone(9, 'BlueTiles', { n: 'XSampleCount', x: 392, y: y5 + 2, m: 'XEditSampleCount' }), String(window.WOFSamples ? WOFSamples.MAX : 100)));
    s.push(txt(clone(9, 'TextBox 173', { n: 'XAddSamples', x: 560, y: btnY('XAddSamples'), w: 240, h: 30, m: 'XAddSamples', f: { c: '#F7D774', a: 0.85 } }), 'Add Sample Puzzles to My List'));
    s.push(txt(clone(9, 'TextBox 173', { n: 'XOpenHelp', x: 560, y: btnY('XOpenHelp'), w: 240, h: 30, m: 'XOpenHelp', f: { c: '#7FD6A8', a: 0.85 } }), 'Game Help'));
    s.push(hiddenText('XSampleUsed', ''));
    L['40'] = s;
  }

  /* ---------- Bonus Wheel screen (id 41) ---------- */
  function buildBonusWheelLayout() {
    var s = [];
    var colour = '#C9772F';
    s.push(clone(3, 'BackDrop', { n: 'BackDrop' }));
    s.push(txt(clone(3, 'TextBox 5', { n: 'XBWSpinText', f: { c: colour } }), 'Click the wheel to spin!'));
    s.push(txt(clone(3, 'TextBox 21', { n: 'XBWTitle', f: { c: colour } }), 'Bonus Wheel'));
    var g = clone(3, 'TheWheel');
    var gid = 'TheWheel#' + g.id;
    s.push(g);
    L['3'].filter(function (o) { return o.p === gid && (o.n === 'WheelTrim' || o.n === 'Oval 37' || o.art === 'pic'); }).forEach(function (o) { s.push(JSON.parse(JSON.stringify(o))); });
    s.push(clone(3, 'TransparentWheelOverlay', { n: 'TransparentWheelOverlay', m: 'XBonusSpin' }));
    s.push(clone(3, 'BackOval', { n: 'BackOval', j: 2, f: { c: colour } }));
    s.push(clone(3, 'BackText', { n: 'BackText', j: 2 }));
    s.push(clone(3, 'WheelArrow', { n: 'WheelArrow' }));
    s.push(clone(3, 'LandedOnBox', { n: 'LandedOnBox', f: { c: colour } }));
    s.push(clone(3, 'WheelValue', { n: 'WheelValue', f: { c: colour } }));
    s.push(txt(clone(3, 'YouLandedOn', { n: 'YouLandedOn' }), 'The envelope holds'));
    s.push(txt(clone(3, 'WheelSettings', { n: 'XRevealPrize', m: 'XRevealPrize', f: { c: '#F7D774' } }), 'Reveal Prize'));
    s.push(txt(clone(3, 'WheelSettings', { n: 'XEditPrizes2', y: 199, m: 'XEditPrizes' }), 'Edit Bonus Prizes'));
    s.push(txt(clone(3, 'TextBox 5', { n: 'XBWNote', x: 34, y: 300, w: 197, h: 120, f: { c: colour, a: 0.85 } }), 'Spin before the Bonus Round puzzle. Reveal the prize after the contestant solves (or time runs out).', 12));
    s.push(hiddenText('XChosen', ''));
    s.push(hiddenText('XMillion', ''));
    L['41'] = s;
  }

  /* ---------- Spin Length screen (id 42), opened from Wheel Settings ---------- */
  var SP = WOFCore.SPIN;
  function buildSpinLayout() {
    var s = [], i;
    s.push(txt(clone(9, 'TextBox 44', { n: 'XSpinTitle' }), 'Spin Length'));
    s.push(txt(clone(10, 'TextBox 125', { n: 'XSpinIntro' }), 'How long the wheel spins. With Build Tension on, the big moments (Final Spin, the Bonus Wheel) spin longer than a regular round, so the wait is part of the show.'));
    s.push(txt(clone(9, 'TextBox 152', { n: 'XSpinLabel0', x: 150, y: 130, w: 230, h: 30 }), 'Base Spin Length:'));
    s.push(clone(9, 'Help', { n: 'XSpinHelp0', x: 130, y: 136, m: 'XExplainSpinBase' }));
    s.push(txt(clone(9, 'BlueTiles', { n: 'XSpinBaseBox', x: 392, y: 132, w: 190, m: 'XEditSpinBase' }), 'Classic · 3.6s'));
    s.push(txt(clone(9, 'TextBox 152', { n: 'XSpinLabel1', x: 150, y: 180, w: 230, h: 30 }), 'Build Tension:'));
    s.push(clone(9, 'Help', { n: 'XSpinHelp1', x: 130, y: 186, m: 'XExplainSpinTension' }));
    s.push(txt(clone(9, 'BlueTiles', { n: 'XSpinTension', x: 392, y: 182, m: 'XToggleSpinTension' }), 'on'));
    s.push(txt(clone(10, 'TextBox 12', { n: 'XSpinHeader', x: 330, y: 232, w: 300 }), 'Spin Length by Wheel'));
    s.push(clone(9, 'Help', { n: 'XSpinHelp2', x: 645, y: 241, m: 'XExplainSpinWheels' }));
    SP.KEYS.forEach(function (k, n) {
      var col = n % 2, row = Math.floor(n / 2), y = 288 + row * 50, x = col ? 515 : 123;
      s.push(txt(clone(9, 'TextBox 152', { n: 'XSpinLabelW_' + k, x: x, y: y, w: 210, h: 30 }), SP.LABELS[k] + ':'));
      s.push(txt(clone(9, 'BlueTiles', { n: 'XSpinT_' + k, x: x + 222, y: y + 2, w: 100, m: 'XEditSpinWheel' }), '3.6s'));
      s.push(hiddenText('XSpinO_' + k, ''));
    });
    s.push(txt(clone(10, 'TextBox 125', { n: 'XSpinHint', y: 436, h: 44 }), 'Green times follow the base length. Gold times are ones you set yourself. Click any time to change it.'));
    s.push(clone(10, 'GoBack', { n: 'XSpinGoBack', j: 'back' }));
    s.push(txt(clone(9, 'TextBox 173', { n: 'XSpinReset', x: 600, y: 491, w: 200, h: 30, m: 'XSpinReset', f: { c: '#F7D774', a: 0.85 } }), 'Reset to Defaults'));
    s.push(hiddenText('XSpinBase', String(SP.DEFAULT_BASE)));
    L['42'] = s;
  }

  /* ---------- additions to the slideshow's own slides ---------- */
  function extendLayouts() {
    // Wheel Settings: a button to the Spin Length screen
    L['10'].push(txt(clone(9, 'TextBox 173', { n: 'XSpinButton', x: 600, y: 491, w: 200, h: 30, j: 42, f: { c: '#F7D774', a: 0.85 } }), 'Spin Length'));
    // Settings: a button to the Extra Features screen
    L['9'].push(txt(clone(9, 'TextBox 173', { n: 'XExtrasButton', x: 705, y: 112, w: 150, h: 30, j: 40, f: { c: '#F7D774', a: 0.85 } }), 'Extra Features'));
    L['9'].push(txt(clone(9, 'TextBox 173', { n: 'XShareButton', x: 705, y: 456, w: 150, h: 30, m: 'XShare', f: { c: '#7FD6A8', a: 0.85 } }), 'Share Game'));
    L['9'].push(txt(clone(9, 'TextBox 173', { n: 'XHelpButton', x: 110, y: 480, w: 150, h: 30, m: 'XOpenHelp', f: { c: '#7FD6A8', a: 0.85 } }), 'Game Help'));
    // title screen: a Game Help button under the credits
    L['1'].push(txt(clone(9, 'TextBox 173', { n: 'XHelpTitle', x: 655, y: 476, w: 170, h: 30, m: 'XOpenHelp', f: { c: '#7FD6A8', a: 0.9 } }), 'Game Help'));
    // Puzzle board: turn dots, Million Dollar Wedge tokens, prize ribbon, bonus wheel link, hidden state
    var add = [];
    for (var i = 1; i <= 4; i++) {
      var nm = find(2, 'Player' + i + 'Name');
      add.push({ k: 's', n: 'XTurnDot' + i, x: nm.x + 4, y: nm.y + 9, w: 13, h: 13, g: 'ellipse', f: { c: '#FFFFFF', a: 0.35 }, l: { w: 1.5, c: '#6B5B00' }, m: 'XSetTurn' });
      add.push({ k: 's', n: 'Player' + i + 'MDW', x: nm.x + 142, y: nm.y + 7, w: 26, h: 17, g: 'roundRect', art: 'blip', ba: 0, l: { w: 0.75, c: '#808080' }, m: 'TogglePlayerItem' });
    }
    add.push(txt(clone(2, 'CategoryBox', { n: 'XPrizeRibbon', x: 664, y: 389, w: 165, h: 29, hid: 1, f: { g: [[0, '#F9E27B', 1], [0.5, '#E2A92B', 1], [1, '#F9E27B', 1]], ang: 90, path: 0 }, l: { w: 1.5, c: '#7A4E00' } }), 'PRIZE PUZZLE', 14));
    add.push(txt(clone(9, 'TextBox 173', { n: 'XBonusWheelLink', x: 760, y: 52, w: 170, h: 30, j: 41, hid: 1, f: { c: '#E9A27B' }, gl: [5, '#FFD700', 0.4] }), 'Bonus Wheel'));
    add.push(hiddenText('XActivePlayer', '1'), hiddenText('XLastLanded', ''), hiddenText('XPrizeActive', ''));
    add.push(hiddenText('XLetterRule', ''), hiddenText('XVowelPaid', ''));   // letter rules state (see Rules below)
    L['2'] = L['2'].concat(add);
    // puzzle board: a ? button left of the top-right bar opens Help on the current round; queue for sample Triple Toss-Ups
    L['2'].push(clone(9, 'Help', { n: 'XBoardHelp', x: 688, y: 13, w: 20, h: 20, m: 'XOpenHelpBoard' }));
    L['2'].push(hiddenText('XSampleQueue', ''));
    // Million Dollar Wedge item on the Normal, Mystery and Express wheels (hidden until switched on)
    [3, 4, 5].forEach(function (n) {
      var wc = find(n, 'WildCard', function (o) { return o.p && /^TheWheel#/.test(o.p); });
      insertAfter(String(n), 'WildCard', [{ k: 's', n: 'MDWedge', p: wc.p, x: wc.x, y: wc.y, w: 10, h: 10, art: 'blip', ba: 0, f: { n: 1 }, l: { n: 1 } }]);
    });
  }

  buildExtrasLayout();
  buildBonusWheelLayout();
  buildSpinLayout();
  extendLayouts();

  /* ---------- helpers ---------- */
  var S = function (n, name) { return PPT.sh(n, name); };
  function on(name) { try { return S(40, name).Text === 'on'; } catch (e) { return false; } }
  function numPlayers() { return parseInt(S(2, 'NumPlayers').Text, 10) || 3; }
  function active() { return parseInt(S(2, 'XActivePlayer').Text, 10) || 1; }
  function name(i) { return S(2, 'Player' + i + 'Name').Text; }
  function money(n) { return '$' + WOFCore.fmt(n); }

  /* ---------- turn tracker ---------- */
  function paintTurn() {
    var tOn = on('XTurnTracker'), n = numPlayers(), a = Math.min(active(), n);
    for (var i = 1; i <= 4; i++) {
      var dot = S(2, 'XTurnDot' + i), nm = S(2, 'Player' + i + 'Name');
      dot.Visible = tOn && i <= n;
      dot.FillRGB = i === a ? '#FFD700' : '#FFFFFF';
      dot.FillTransparency = i === a ? 0 : 0.65;
      nm.el.classList.toggle('turn-active', tOn && i === a && i <= n);
      S(2, 'Player' + i + 'MDW').Visible = mdwOn();
    }
  }
  function setTurn(i) { if (String(i) !== S(2, 'XActivePlayer').Text) Rules.reset(); S(2, 'XActivePlayer').Text = String(i); paintTurn(); App.changed(); }
  function nextTurn(reason) {
    if (!on('XTurnTracker')) return;
    var n = numPlayers(), a = active() % n + 1;
    setTurn(a);
    toast((reason ? reason + ' — ' : '') + name(a) + "'s turn");
  }
  App.M.XSetTurn = function (el) { var m = /(\d)$/.exec(el.dataset.name); if (m) setTurn(+m[1]); };
  function inTossUp() { return S(2, 'TossUpBanner').Visible; }
  function finalSpinOn() { return S(2, 'FinalSpinButton').Visible && S(2, 'FinalSpinButton').LineTransparency === 0; }

  /* ---------- Million Dollar Wedge ---------- */
  function mdwOn() { return on('XMillionWedge'); }
  function setMDWOnWheels(show) {
    [3, 4, 5].forEach(function (n) { S(n, 'TheWheel').item('MDWedge').FillTransparency = show ? 0 : 1; });
    WOFWheel.redrawAll();
  }
  App.M.XToggleMDW = function (el) {
    App.M.toggleOnOff(el);
    setMDWOnWheels(mdwOn());
    if (!mdwOn()) for (var i = 1; i <= 4; i++) S(2, 'Player' + i + 'MDW').FillTransparency = 1;
  };
  // player tokens: the slideshow's TogglePlayerItem, extended to the Million Dollar Wedge token
  var origToggle = App.M.TogglePlayerItem;
  App.M.TogglePlayerItem = function (el) {
    if (!/MDW$/.test(el.dataset.name)) return origToggle(el);
    var sh = PPT.wrap(el);
    if (sh.FillTransparency === 1) {
      sh.FillTransparency = 0;
      if (S(10, 'WheelItems').Text === 'once' && S(3, 'TheWheel').item('MDWedge').FillTransparency === 0) {
        [3, 4, 5].forEach(function (n) { S(n, 'TheWheel').item('MDWedge').FillTransparency = 1; S(n, 'RestoreWheelItems').Visible = true; });
        WOFWheel.redrawAll();
      }
    } else sh.FillTransparency = 1;
  };
  var origRestore = App.M.restoreWheelItems;
  App.M.restoreWheelItems = function (el) { origRestore(el); if (mdwOn()) setMDWOnWheels(true); WOFWheel.redrawAll(); };
  function mdwHolder() { for (var i = 1; i <= 4; i++) if (S(2, 'Player' + i + 'MDW').FillTransparency === 0) return i; return 0; }

  /* ---------- Prize Puzzle ---------- */
  function prizeName() { return S(40, 'XPrizeName').Text; }
  function prizeValue() { return parseInt(S(40, 'XPrizeValue').Text, 10) || 0; }
  async function awardPrize() {
    var n = numPlayers(), labels = [];
    for (var i = 1; i <= n; i++) labels.push(name(i));
    labels.push('Nobody');
    var pick = await Dlg.choose('PRIZE PUZZLE solved!\n\nPrize: ' + prizeName() + (prizeValue() ? ' (worth ' + money(prizeValue()) + ')' : '') + '\n\nWho solved it? ' + (prizeValue() ? 'The prize value is added to their round score.' : ''), 'Prize Puzzle', labels);
    if (pick >= 0 && pick < n && prizeValue()) {
      var rs = S(2, 'Player' + (pick + 1) + 'RoundScore');
      rs.Text = WOFCore.fmt((WOFCore.parseNum(rs.Text) || 0) + prizeValue());
    }
    App.changed();
  }
  App.M.XEditPrizePuzzle = async function () {
    var nm = await Dlg.input('What is the Prize Puzzle prize? (Shown to the players when the Prize Puzzle is solved.)', 'Prize Puzzle Prize', prizeName());
    if (nm == null) return;
    if (nm.trim()) S(40, 'XPrizeName').Text = nm.trim().toUpperCase();
    var v = await Dlg.input('How much is it worth in dollars? It is added to the solver\'s round score. Enter 0 to award the prize without adding money.', 'Prize Puzzle Prize', String(prizeValue()));
    if (v == null) return;
    var n = WOFCore.parseNum(v);
    if (n != null && n >= 0) S(40, 'XPrizeValue').Text = String(n);
  };

  /* ---------- Pick-a-category Bonus Round ---------- */
  function bonusMode() { return S(2, 'Bonus Round').Visible; }
  async function pickCategoryFlow() {
    var next = parseInt(S(2, 'NextPuzzleToLoad').Text, 10) || 1;
    var haveOwn = VBA.puzzleExists(next) && VBA.puzzleExists(next + 1) && VBA.puzzleExists(next + 2);
    var def = !haveOwn && samplesOn() ? 'S' : [next, next + 1, next + 2].join(', ');
    var raw = await Dlg.input('Bonus Round: enter three puzzle numbers. The contestant picks one of their categories.' +
      (samplesOn() ? '\n\nType S for three random sample puzzles, or mix them in, like 10, S, S42.' : '') +
      '\n\n(Leave blank to load a single puzzle the usual way.)', 'Bonus Round Categories', def);
    if (raw == null) return true;              // cancelled
    if (!raw.trim()) return false;             // fall back to the slideshow's prompt
    var toks = raw.trim().split(/[\s,;]+/).filter(Boolean);
    if (toks.length === 1 && /^S$/i.test(toks[0]) && samplesOn()) toks = ['S', 'S', 'S'];
    if (toks.length !== 3) { await Dlg.msg('Please enter exactly three puzzle numbers, like 10, 11, 12' + (samplesOn() ? ' (or S for three random sample puzzles)' : '') + '.', 'Bonus Round Categories'); return true; }
    var picks = [], randomSlots = [], fixed = [];
    for (var i = 0; i < 3; i++) {
      var tk = toks[i].toUpperCase(), m;
      if (/^\d+$/.test(tk)) {
        var num = +tk;
        if (!VBA.puzzleExists(num)) { await Dlg.msg('No puzzle found for number ' + num + '.', 'Bonus Round Categories'); return true; }
        picks.push({ num: num, cat: S(App.pageId(Math.floor((num - 1) / 12)), 'PuzzleCategory' + num).Text || '(NO CATEGORY)' });
      } else if ((m = /^S(\d*)$/.exec(tk)) && samplesOn()) {
        if (m[1]) {
          var k = +m[1];
          if (k < 1 || k > sampleCount()) { await Dlg.msg('There is no sample puzzle ' + k + '. Sample puzzles go from 1 to ' + sampleCount() + '.', 'Bonus Round Categories'); return true; }
          fixed.push(k); picks.push({ sample: k });
        } else { randomSlots.push(i); picks.push(null); }
      } else { await Dlg.msg('"' + toks[i] + '" is not a puzzle number' + (samplesOn() ? ' or a sample code (S or S7)' : '') + '.', 'Bonus Round Categories'); return true; }
    }
    picks.forEach(function (p) { if (p && p.sample) p.cat = WOFSamples.get(p.sample).cat; });
    if (randomSlots.length) {
      // the contestant should see different categories, so random samples skip a category already on a card
      var takenCats = picks.filter(Boolean).map(function (p) { return p.cat; });
      var r = randomSamples(randomSlots.length, fixed, true);
      if (!r || r.length < randomSlots.length) { await Dlg.msg('There are not enough sample puzzles turned on for that. Raise the number in Extra Features, Sample Puzzles.', 'Bonus Round Categories'); return true; }
      var chosenIds = [];
      r.forEach(function (k) { if (chosenIds.length < randomSlots.length && takenCats.indexOf(WOFSamples.get(k).cat) < 0) { chosenIds.push(k); takenCats.push(WOFSamples.get(k).cat); } });
      r.forEach(function (k) { if (chosenIds.length < randomSlots.length && chosenIds.indexOf(k) < 0) chosenIds.push(k); });   // small pools: allow a repeat category
      randomSlots.forEach(function (slot, j) { picks[slot] = { sample: chosenIds[j], cat: WOFSamples.get(chosenIds[j]).cat }; });
    }
    var pick = await chooseCard(picks.map(function (p) { return p.cat; }));
    if (pick < 0) return true;
    var chosen = picks[pick];
    if (chosen.sample) { if (await VBA.loadPuzzle(-1, 0, { sample: WOFSamples.get(chosen.sample) })) markUsed(chosen.sample); }
    else await VBA.loadPuzzle(chosen.num, 0);
    return true;
  }
  function chooseCard(cats) {
    return new Promise(function (resolve) {
      var ov = document.createElement('div');
      ov.className = 'x-pick';
      ov.innerHTML = '<div class="x-pick-title">Bonus Round — pick a category</div><div class="x-pick-row"></div><button class="x-pick-cancel">Cancel</button>';
      var row = ov.querySelector('.x-pick-row');
      cats.forEach(function (c, i) {
        var b = document.createElement('button'); b.className = 'x-card'; b.textContent = c;
        b.onclick = function () { ov.remove(); resolve(i); };
        row.appendChild(b);
      });
      ov.querySelector('.x-pick-cancel').onclick = function () { ov.remove(); resolve(-1); };
      App.stage().appendChild(ov);
    });
  }

  /* ---------- Bonus prize wheel ---------- */
  function prizes() {
    var p = S(40, 'XBonusPrizes').Text.split('|').map(function (x) { return x.trim(); }).filter(Boolean);
    while (p.length < 24) p.push(p.length ? p[p.length % p.length] : '$40,000');
    return p.slice(0, 24);
  }
  App.M.XEditPrizes = async function () {
    var box = document.createElement('div');
    box.innerHTML = '<div style="margin-bottom:6px">One prize per envelope (24). Defaults follow the show: $40,000 to $100,000, plus cars. If a player holds the Million Dollar Wedge, the $100,000 envelope becomes $1,000,000.</div>';
    var ta = document.createElement('textarea');
    ta.className = 'x-ta'; ta.value = prizes().join('\n'); ta.rows = 12;
    box.appendChild(ta);
    var i = await Dlg.custom(box, 'Edit Bonus Prizes', ['Save', 'Restore defaults', 'Cancel']);
    if (i === 0) {
      var list = ta.value.split('\n').map(function (x) { return x.trim().toUpperCase(); }).filter(Boolean);
      if (!list.length) return;
      while (list.length < 24) list.push(list[list.length % list.length]);
      S(40, 'XBonusPrizes').Text = list.slice(0, 24).join('|');
    } else if (i === 1) S(40, 'XBonusPrizes').Text = DEFAULT_PRIZES.join('|');
    if (App.exists(41)) WOFWheel.redraw(App.slide(41).el);
  };
  App.M.XBonusSpin = async function () {
    var sl = 41, r = Math.floor(3600 * Math.random()), b = Math.floor(r / 150);
    var list = prizes(), holder = mdwHolder(), k = 23 - b;
    var million = holder && list.indexOf('$100,000') >= 0;
    var prize = list[k];
    if (million && prize === '$100,000') prize = '$1,000,000';
    S(sl, 'XChosen').Text = prize;
    S(sl, 'XMillion').Text = million ? String(holder) : '';
    S(sl, 'WheelValue').Text = 'Envelope ' + (k + 1);
    S(sl, 'XRevealPrize').Visible = false;
    var plan = spinPlan(sl, false);
    VBA.Play('SpinWheel', plan.ms);
    var hide = ['WheelValue', 'BackText', 'BackOval'].map(function (n) { return S(sl, n); });
    hide.forEach(function (s) { s.el.style.visibility = 'hidden'; });
    await WOFWheel.spin(App.slide(sl).el, r / 10, plan.ms, plan);
    hide.forEach(function (s) { s.el.style.visibility = ''; });
    S(sl, 'XRevealPrize').Visible = true;
  };
  App.M.XRevealPrize = async function () {
    var p = S(41, 'XChosen').Text;
    if (!p) { await Dlg.msg('Spin the wheel first.', 'Reveal Prize'); return; }
    S(41, 'WheelValue').Text = p;
    VBA.Play('SolvePuzzleChime');
  };

  /* ---------- spin length ----------
     State lives in shapes on screen 42 (so autosave, game files and share links carry it):
       XSpinBase       the base length in seconds (hidden)       XSpinTension   on/off toggle
       XSpinO_<wheel>  a length the host set for that wheel, or '' for automatic (hidden)
       XSpinBaseBox and XSpinT_<wheel> are only what is painted on screen (see paintSpin). */
  var SPIN_GOLD = '#F7D774';
  function spinState() {
    var base = WOFCore.parseSeconds(S(42, 'XSpinBase').Text, SP.MIN, SP.BASE_MAX) || SP.DEFAULT_BASE, over = {};
    SP.KEYS.forEach(function (k) { over[k] = WOFCore.parseSeconds(S(42, 'XSpinO_' + k).Text, SP.MIN, SP.MAX); });
    return { base: base, tension: S(42, 'XSpinTension').Text !== 'off', over: over };
  }
  function paintSpin() {
    var st = spinState(), nm = WOFCore.spinPresetName(st.base);
    S(42, 'XSpinBaseBox').Text = (nm || 'Custom') + ' · ' + WOFCore.fmtSeconds(st.base);
    SP.KEYS.forEach(function (k) {
      var box = S(42, 'XSpinT_' + k);
      box.Text = WOFCore.fmtSeconds(WOFCore.spinSeconds(k, st));
      box.FillRGB = st.over[k] ? SPIN_GOLD : SAMPLE_ON;
    });
  }
  /* what a spin of this wheel should do right now: {ms, power}; the wheel code turns ms into a number of full turns */
  function spinPlan(slide, finalSpin) {
    try {
      var st = spinState(), key = WOFCore.spinKey(slide, !!finalSpin);
      return { ms: Math.round(WOFCore.spinSeconds(key, st) * 1000), power: WOFCore.spinPower(key, st.tension), key: key };
    } catch (e) { return { ms: 3600, power: 2, key: 'normal' }; }
  }
  App.M.XEditSpinBase = async function () {
    var st = spinState(), names = SP.PRESETS.map(function (p) { return p[0]; });
    var list = SP.PRESETS.map(function (p) { return p[0] + ' (' + WOFCore.fmtSeconds(p[1]) + ')'; }).join(', ');
    var i = await Dlg.choose('How long should a regular spin of the wheel last?\n\n' + list + '. Classic is the original slideshow.\n\nNow: ' + WOFCore.fmtSeconds(st.base) + '. With Build Tension on, the bigger wheels spin longer than this.', 'Base Spin Length', names.concat(['Custom…', 'Cancel']));
    if (i < 0 || i === names.length + 1) return;
    var v;
    if (i < names.length) v = SP.PRESETS[i][1];
    else {
      var raw = await Dlg.input('Seconds for a regular spin (' + SP.MIN + ' to ' + SP.BASE_MAX + '):', 'Custom Spin Length', String(st.base));
      if (raw == null) return;
      v = WOFCore.parseSeconds(raw, SP.MIN, SP.BASE_MAX);
      if (v == null) { await Dlg.msg('Please enter a number of seconds from ' + SP.MIN + ' to ' + SP.BASE_MAX + ', like 4 or 6.5.', 'Base Spin Length'); return; }
    }
    S(42, 'XSpinBase').Text = String(v);
    paintSpin();
  };
  App.M.XToggleSpinTension = function (el) { App.M.toggleOnOff(el); paintSpin(); };
  App.M.XEditSpinWheel = async function (el) {
    var key = el.dataset.name.replace('XSpinT_', ''), st = spinState(), label = SP.LABELS[key];
    var auto = WOFCore.spinSeconds(key, { base: st.base, tension: st.tension, over: {} });
    var raw = await Dlg.input('How many seconds should the ' + label + ' spin? (' + SP.MIN + ' to ' + SP.MAX + ')\n\nAutomatic is ' + WOFCore.fmtSeconds(auto) + '. Type auto, or leave it blank, to go back to automatic.', label + ' Spin Length', st.over[key] ? String(st.over[key]) : 'auto');
    if (raw == null) return;
    if (!raw.trim() || /^auto/i.test(raw.trim())) S(42, 'XSpinO_' + key).Text = '';
    else {
      var v = WOFCore.parseSeconds(raw, SP.MIN, SP.MAX);
      if (v == null) { await Dlg.msg('Please enter a number of seconds from ' + SP.MIN + ' to ' + SP.MAX + ', like 5 or 7.5, or type auto.', label + ' Spin Length'); return; }
      S(42, 'XSpinO_' + key).Text = String(v);
    }
    paintSpin();
  };
  App.M.XSpinReset = async function () {
    if (!(await Dlg.confirm('Put every spin length back to the default? (Classic 3.6s, Build Tension on, no custom times.)', 'Reset Spin Length', { defaultNo: true }))) return;
    S(42, 'XSpinBase').Text = String(SP.DEFAULT_BASE);
    var t = S(42, 'XSpinTension'); t.Text = 'on'; t.FillRGB = SAMPLE_ON;
    SP.KEYS.forEach(function (k) { S(42, 'XSpinO_' + k).Text = ''; });
    paintSpin();
  };

  /* ---------- sample puzzles ----------
     Built-in puzzles (samples.js), separate from the host's own list. The Sample Puzzles box on Extra Features holds
     how many of them the game draws from (1-100, or off). XSampleUsed lists the ones already played this game, so a
     random pick doesn't repeat until every one in the pool has been used. At Load Puzzle:
       S     a random sample        S7    sample 7
       ST    random as a Toss-Up    SP    random as a Prize Puzzle
       STTT  three random samples as a Triple Toss-Up (S7TTT plays 7, 8 and 9) */
  var SAMPLE_ON = '#C3D69B', SAMPLE_OFF = '#D99694';   // the slideshow's own on/off colours
  function sampleCount() {
    var t = (S(40, 'XSampleCount').Text || '').trim().toLowerCase();
    if (t === 'off') return 0;
    var n = parseInt(t, 10);
    if (isNaN(n)) return WOFSamples.MAX;
    return Math.max(0, Math.min(WOFSamples.MAX, n));
  }
  function samplesOn() { return !!window.WOFSamples && sampleCount() > 0; }
  function usedSamples() { return S(40, 'XSampleUsed').Text.split(',').filter(Boolean).map(Number); }
  function markUsed(k) { var u = usedSamples(); if (u.indexOf(k) < 0) { u.push(k); S(40, 'XSampleUsed').Text = u.join(','); } }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* howMany different random samples from the pool, avoiding ones already played (and `avoid`); null if the pool is too small */
  /* (with whole = true: every fresh sample in random order, at least howMany long) */
  function randomSamples(howMany, avoid, whole) {
    var n = sampleCount(), all = [], used = usedSamples();
    avoid = avoid || [];
    for (var k = 1; k <= n; k++) if (avoid.indexOf(k) < 0) all.push(k);
    if (all.length < howMany) return null;
    var fresh = all.filter(function (k) { return used.indexOf(k) < 0; });
    if (fresh.length < howMany) {             // every sample in the pool has been played: start over
      S(40, 'XSampleUsed').Text = '';
      fresh = all;
      toast('Every sample puzzle has been played, so the list starts over');
    }
    var mixed = shuffle(fresh.slice());
    return whole ? mixed : mixed.slice(0, howMany);
  }
  function paintSampleBox() {
    var n = sampleCount(), box = S(40, 'XSampleCount');
    box.Text = n > 0 ? String(n) : 'off';
    box.FillRGB = n > 0 ? SAMPLE_ON : SAMPLE_OFF;
  }
  async function trySampleCode(raw) {
    var m = /^\s*S(?:AMPLE)?\s*(\d*)\s*(TTT|T|P)?\s*$/i.exec(String(raw || ''));
    if (!m || !window.WOFSamples) return false;
    if (!samplesOn()) { await Dlg.msg('Sample puzzles are turned off. Turn them on in Settings, then Extra Features, Sample Puzzles.', 'Sample Puzzles'); return true; }
    var mode = (m[2] || '').toUpperCase(), kind = mode === 'TTT' ? 3 : mode === 'T' ? 1 : 0, n = sampleCount(), ids;
    var need = kind === 3 ? 3 : 1;
    if (n < need) { await Dlg.msg('A Triple Toss-Up needs at least 3 sample puzzles, but only ' + n + ' ' + (n === 1 ? 'is' : 'are') + ' turned on. Raise the number in Extra Features, Sample Puzzles.', 'Sample Puzzles'); return true; }
    if (m[1]) {
      var k = +m[1];
      if (k < 1 || k > n) { await Dlg.msg('There is no sample puzzle ' + k + '. Sample puzzles go from 1 to ' + n + '.', 'Sample Puzzles'); return true; }
      ids = [k];
      for (var d = 1; d < need; d++) ids.push(((k - 1 + d) % n) + 1);
    } else ids = randomSamples(need);
    var ok = await VBA.loadPuzzle(-1, kind, { sample: WOFSamples.get(ids[0]), prize: mode === 'P' });
    if (ok) {
      ids.forEach(markUsed);
      if (kind === 3) S(2, 'XSampleQueue').Text = ids.slice(1).join(',');
      toast('Sample puzzle ' + ids[0] + ' loaded');
    }
    return true;
  }
  /* Load Next during a sample Triple Toss-Up */
  async function loadNextSample() {
    var q = S(2, 'XSampleQueue').Text.split(',').filter(Boolean).map(Number);
    if (!q.length) return false;
    var k = q.shift();
    S(2, 'XSampleQueue').Text = q.join(',');
    await VBA.loadPuzzle(-1, 4, { sample: WOFSamples.get(k) });
    return true;
  }
  function lastUsedPuzzle() {
    var last = 0, max = App.pageCount() * 12;
    for (var i = 1; i <= max; i++) if (VBA.puzzleExists(i)) last = i;
    return last;
  }
  App.M.XEditSampleCount = async function () {
    var v = await Dlg.input('How many sample puzzles should the game draw from? Enter a number from 1 to ' + WOFSamples.MAX + ' (' + WOFSamples.MAX + ' uses every one).\n\nEnter 0 or off to turn sample puzzles off.', 'Sample Puzzles', samplesOn() ? String(sampleCount()) : String(WOFSamples.MAX));
    if (v == null) return;
    v = v.trim().toLowerCase();
    var n = v === 'off' ? 0 : (/^\d+$/.test(v) ? parseInt(v, 10) : NaN);
    if (isNaN(n) || n < 0 || n > WOFSamples.MAX) { await Dlg.msg('Please enter a whole number from 1 to ' + WOFSamples.MAX + ', or 0 to turn sample puzzles off.', 'Sample Puzzles'); return; }
    S(40, 'XSampleCount').Text = n > 0 ? String(n) : 'off';
    paintSampleBox();
  };
  App.M.XAddSamples = async function () {
    if (!samplesOn()) { await Dlg.msg('Sample puzzles are turned off. Click the Sample Puzzles box and enter a number from 1 to ' + WOFSamples.MAX + ' first.', 'Add Sample Puzzles'); return; }
    var n = sampleCount();
    var v = await Dlg.input('How many sample puzzles should be added to your own puzzle list? (1 to ' + n + ')\n\nThey go after your last puzzle, so nothing you wrote is replaced, and they are picked in a random order. You can then edit them like any puzzle in Set Up Puzzles.', 'Add Sample Puzzles', String(n));
    if (v == null) return;
    var c = /^\s*\d+\s*$/.test(v) ? parseInt(v, 10) : NaN;
    if (!(c >= 1 && c <= n)) { await Dlg.msg('Please enter a whole number from 1 to ' + n + '.', 'Add Sample Puzzles'); return; }
    var start = lastUsedPuzzle() + 1, order = [];
    for (var k = 1; k <= n; k++) order.push(k);
    shuffle(order).slice(0, c).forEach(function (k, i) { var p = WOFSamples.get(k); writePuzzle(start + i, p.cells, p.cat); });
    VBA.shadeOccupiedPuzzlesFull();
    await Dlg.msg('Added ' + c + ' sample puzzle' + (c === 1 ? '' : 's') + ' to your list as number' + (c === 1 ? ' ' + start : 's ' + start + ' to ' + (start + c - 1)) + '.', 'Add Sample Puzzles');
  };

  /* ---------- help ---------- */
  function currentHelpTopic() {
    if (S(2, 'TossUpBanner').Visible) return S(2, 'TossUpTitle').Text.indexOf('Triple') >= 0 ? 'tripletossup' : 'tossup';
    if (S(2, 'XPrizeActive').Text === '1') return 'prize';
    var rounds = [['Bonus Round', 'bonus'], ['Fourth Round', 'finalspin'], ['Express Round', 'express'], ['Mystery Round', 'mystery']];
    for (var i = 0; i < rounds.length; i++) if (S(2, rounds[i][0]).Visible) return rounds[i][1];
    return 'normal';
  }
  App.M.XOpenHelp = function () { if (window.WOFHelp) WOFHelp.open(); };
  App.M.XOpenHelpBoard = function () { if (window.WOFHelp) WOFHelp.open(currentHelpTopic()); };

  /* ---------- puzzle import ---------- */
  App.M.XImportPuzzles = async function () {
    var box = document.createElement('div');
    box.innerHTML = '<div style="margin-bottom:6px">One puzzle per line: <b>CATEGORY | puzzle text</b>. Separate board rows with <b>\\</b> (or leave them out and rows are picked for you).<br>Example: <i>PHRASE | happy \\ birthday \\ to you</i></div>' +
      '<div style="margin:4px 0">Start at puzzle number: <input class="x-start" type="number" min="1" value="1" style="width:80px;display:inline-block;margin:0"></div>';
    var ta = document.createElement('textarea'); ta.className = 'x-ta'; ta.rows = 10; ta.placeholder = 'THING | birthday cake\nPLACE | grand canyon';
    box.appendChild(ta);
    var i = await Dlg.custom(box, 'Import Puzzles from Text', ['Import', 'Cancel']);
    if (i !== 0) return;
    var start = Math.max(1, parseInt(box.querySelector('.x-start').value, 10) || 1);
    var lines = ta.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    var done = 0, bad = [];
    for (var k = 0; k < lines.length; k++) {
      var parts = lines[k].split('|'), cat = parts.length > 1 ? parts[0].trim().toUpperCase() : '', text = (parts.length > 1 ? parts.slice(1).join('|') : parts[0]).trim();
      if (text.indexOf('\\') < 0) text = autoRows(text);
      var res = text ? WOFCore.scribe(text) : { error: 1 };
      if (res.error) { bad.push(lines[k]); continue; }
      writePuzzle(start + done, res.cells, cat);
      done++;
    }
    VBA.shadeOccupiedPuzzlesFull();
    await Dlg.msg('Imported ' + done + ' puzzle' + (done === 1 ? '' : 's') + ' (numbers ' + start + (done > 1 ? '–' + (start + done - 1) : '') + ').' + (bad.length ? '\n\nThese lines did not fit on the board:\n' + bad.join('\n') : ''), 'Import Puzzles');
  };
  /* break a puzzle into board rows (12/14/14/12 tiles) greedily, using the middle rows first */
  function autoRows(text) {
    var words = text.trim().split(/\s+/), rows = [], cur = '';
    var cap = function (n) { return n === 0 ? 14 : 14; };
    words.forEach(function (w) {
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= cap(rows.length)) cur += ' ' + w;
      else { rows.push(cur); cur = w; }
    });
    if (cur) rows.push(cur);
    if (rows.length === 4 && (rows[0].length > 12 || rows[3].length > 12)) return rows.join(' \\ ');
    return rows.join(' \\ ');
  }
  function writePuzzle(n, cells, cat) {
    var idx = Math.floor((n - 1) / 12);
    while (App.pageCount() <= idx) VBA.addPuzzleRow(App.pageCount());
    var pg = App.pageId(idx);
    for (var j = 1; j <= 52; j++) {
      var t = S(pg, 'PuzzleSolution' + n + '-' + j);
      t.Text = cells[j - 1] || '';
      t.FillRGB = cells[j - 1] ? '#FFFFFF' : '#189A50';
    }
    S(pg, 'PuzzleCategory' + n).Text = cat;
  }

  App.M.XSaveFile = function () { Persist.save(); Persist.exportFile(); };
  App.M.XLoadFile = async function () {
    if (await Dlg.confirm('Loading a game file replaces the puzzles, scores and settings in this browser. Continue?', 'Load Game File', { defaultNo: true })) {
      var ok = await Persist.importFile();
      if (ok) location.reload(); else await Dlg.msg("That file couldn't be loaded. Pick a .json game file saved from this game.", 'Load Game File');
    }
  };
  var EXPLAIN = {
    XExplainTurn: ['Shows whose turn it is with a gold dot and a highlighted name. The turn passes automatically on Bankrupt, Lose a Turn, a letter that is not in the puzzle, a wrong solve (with the verify Solve Button), or when the shot clock runs out. Click a dot to hand the turn to that player. The default is on.', 'Turn Tracker'],
    XExplainMDW: ['Puts the Million Dollar Wedge on the Normal, Mystery and Express wheels, as on the show: a sliver of ONE MILLION between two Bankrupts. Landing in the middle is worth $500; give the player the wedge with the green token next to their name.\n\nIf that player reaches the Bonus Round still holding it, the $100,000 envelope on the Bonus Wheel becomes $1,000,000. The default is off.', 'Million Dollar Wedge'],
    XExplainPick: ['Before the Bonus Round puzzle, enter three puzzle numbers. The contestant sees their three categories and picks one, like on the show. The default is on.', 'Pick-a-Category Bonus'],
    XExplainSamples: ['The game comes with 100 sample puzzles of its own, kept apart from yours. At Load Puzzle, type S for a random one that hasn\u2019t been played yet (ST for a Toss-Up, SP for a Prize Puzzle, STTT for a Triple Toss-Up), or S7 for sample puzzle 7. In the Bonus Round, type S for three random categories.\n\nThis number is how many of them the game draws from: 1 to 100 (the default, 100, uses all of them). Enter 0 to turn them off.\n\nAdd Sample Puzzles to My List copies some into your own puzzle list so you can edit them.', 'Sample Puzzles'],
    XExplainSpinBase: ['How long a regular spin of the wheel lasts. Pick Quick (2.5s) to keep a big class moving, Classic (3.6s) for the original slideshow, Dramatic (5.5s) or Nail-Biter (8s) to stretch the suspense, or Custom for any number from 1.5 to 15 seconds.\n\nThe spin sound stretches to fit. The default is Classic.', 'Base Spin Length'],
    XExplainSpinTension: ['When on, the wheels with the most at stake spin longer than the base length: Mystery and Express 15% longer, the Fourth Round 25% longer, the Final Spin 75% longer and the Bonus Wheel twice as long (and those last two slow down more gradually at the end). Turn it off to spin every wheel for the base length. The default is on.', 'Build Tension'],
    XExplainSpinWheels: ['The spin length each wheel ends up with, after Build Tension. Green times follow the base length. Click a time to set your own for that wheel (gold); type auto to go back to automatic.\n\nThe Fourth Round is the regular rounds on the fourth wheel. The Final Spin is the single spin each player takes once the Final Spin button on the board has been started.', 'Spin Length by Wheel'],
    XExplainBonusWheel: ['Adds a Bonus Wheel with 24 envelopes. In the Bonus Round, click the Bonus Wheel button at the top right of the puzzle board to spin it. Edit the prizes with Edit Bonus Prizes. The default is on.', 'Bonus Prize Wheel']
  };
  Object.keys(EXPLAIN).forEach(function (k) { App.M[k] = function () { return Dlg.msg(EXPLAIN[k][0], EXPLAIN[k][1]); }; });


  /* ---------- letter rules (the show's rules for calling letters) ----------
     XLetterRule holds what the player may do next in a regular round:
       ''            nothing pending: they must spin first, buy a vowel, or solve
       'spin'        landed on a value: call exactly one consonant (no vowel yet)
       'free'        landed on Free Play: one consonant, or one vowel for free
       'express'     landed on Express: call a consonant
       'expressRide' on the Express: keep calling consonants without spinning, buy vowels; ends on a miss
       'wild'        using the Wild Card: one more consonant at the last spin's value
     XVowelPaid is '1' after the orange buy-a-vowel circle was clicked and the vowel hasn't been called yet. */
  var Rules = (function () {
    function st() { return S(2, 'XLetterRule').Text; }
    function set(v) { S(2, 'XLetterRule').Text = v; }
    function paid() { return S(2, 'XVowelPaid').Text === '1'; }
    function setPaid(v) { S(2, 'XVowelPaid').Text = v ? '1' : ''; }
    function puzzleInPlay() { var t = S(2, 'LeftTab').Text; return t !== 'Load Puzzle' && t !== 'Load Next'; }
    function isVowel(l) { return WOFCore.isVowel(l); }
    function vowelPrice() { return S(9, 'VowelPrice').Text; }
    function spunValue() { return S(2, 'SpunWheelValue').Text; }
    function holdsWild(i) { try { return S(2, 'Player' + i + 'WildCard').FillTransparency === 0; } catch (e) { return false; } }
    function wildHolders() { var out = []; for (var i = 1; i <= numPlayers(); i++) if (holdsWild(i)) out.push(i); return out; }
    function bonusEntry() { return S(2, 'BonusOutline').LineTransparency === 0; }
    function exempt() { return !puzzleInPlay() || inTossUp(); }

    /* why a letter can't be called right now ('' = it can) */
    function blockReason(l) {
      if (exempt() || bonusEntry()) return '';
      var r = st();
      if (finalSpinOn()) {
        if (!isVowel(l) && spunValue() === '') return 'Spin the wheel for the Final Spin before calling a consonant.';
        return '';
      }
      if (isVowel(l)) {
        if (r === 'free') return '';
        if (r === 'spin' || r === 'express') return 'The wheel was just spun, so a consonant has to be called first. A vowel can be bought before spinning or after the consonant.';
        if (r === 'wild') return 'The Wild Card is being used, so call a consonant.';
        if (!paid()) return 'Buy the vowel first: click the orange circle next to the player’s round score (vowels cost ' + vowelPrice() + ').';
        return '';
      }
      if (r === 'spin' || r === 'free' || r === 'express' || r === 'expressRide' || r === 'wild') {
        if (paid()) return 'A vowel was bought, so call a vowel now.';
        return '';
      }
      if (paid()) return 'A vowel was bought, so call a vowel now.';
      return 'Spin first! A consonant can only be called after a spin.';
    }

    /* the Wild Card lets a player call one more consonant at their last spin's value */
    function wildCandidates() {
      if (st() !== '' || paid() || finalSpinOn() || spunValue() === '') return [];
      var h = wildHolders();
      if (on('XTurnTracker')) return holdsWild(active()) ? [active()] : [];
      return h;
    }

    async function explain(l, el) {
      var why = blockReason(l), cands = WOFCore.isVowel(l) ? [] : wildCandidates();
      if (!cands.length) { await Dlg.msg(why, 'Can’t Call ' + l + ' Yet'); return; }
      var labels = cands.map(function (i) { return 'Use ' + name(i) + '’s Wild Card'; }).concat(['Cancel']);
      var pick = await Dlg.choose(why + '\n\n' + (cands.length === 1 ? name(cands[0]) + ' has' : 'These players have') + ' the Wild Card, which lets them call one more consonant at the last spin’s value ($' + WOFCore.fmt(+spunValue()) + ').', 'Can’t Call ' + l + ' Yet', labels);
      if (pick < 0 || pick >= cands.length) return;
      S(2, 'Player' + cands[pick] + 'WildCard').FillTransparency = 1;   // the card is used up
      set('wild');
      VBA.guessLetter(el);
    }

    /* bonus round: three consonants (four with the Wild Card) and one vowel */
    function bonusBlockReason(l) {
      var picked = S(2, 'BonusLetters').Text, v = 0, c = 0;
      for (var k = 0; k < picked.length; k++) { if (isVowel(picked.charAt(k))) v++; else c++; }
      if (isVowel(l)) return v >= 1 ? 'The contestant only gets one vowel in the Bonus Round.' : '';
      var maxC = wildHolders().length ? 4 : 3;
      if (c >= maxC) return maxC === 4 ? 'The contestant only gets four consonants in the Bonus Round (three, plus one for the Wild Card).' : 'The contestant only gets three consonants in the Bonus Round (four if they have the Wild Card).';
      return '';
    }

    return {
      reset: function () { try { set(''); setPaid(false); } catch (e) { } },
      blockReason: blockReason,
      bonusBlockReason: bonusBlockReason,
      explain: explain,
      onLanded: function (landed) {
        setPaid(false);
        if (landed === 'Bankrupt' || landed === 'Lose a Turn') set('');
        else if (landed === 'Express') set('express');
        else if (landed === 'Free Play') set('free');
        else set('spin');
      },
      onManualValue: function () { if (!finalSpinOn()) { set('spin'); setPaid(false); } },
      onLetter: function (l, count) {
        if (exempt() || finalSpinOn()) return;
        var r = st();
        if (isVowel(l)) setPaid(false);
        if (count === 0) { set(''); return; }
        if (r === 'express' && !isVowel(l)) set('expressRide');
        else if (r === 'expressRide') set('expressRide');
        else set('');
      },
      /* buying a vowel: only when a vowel may be called next */
      buyBlockReason: function (i) {
        if (exempt() || bonusEntry()) return '';
        if (finalSpinOn()) return 'Vowels are free during the Final Spin, so there’s nothing to buy. Just call the vowel.';
        var r = st();
        if (r === 'spin' || r === 'express' || r === 'free' || r === 'wild') return 'The wheel was just spun, so ' + (r === 'free' ? 'a letter' : 'a consonant') + ' has to be called first.' + (r === 'free' ? ' On Free Play the vowel is free anyway.' : '');
        if (paid()) return 'A vowel was already bought. Call it before buying another.';
        if (on('XTurnTracker') && i !== active()) return 'It’s ' + name(active()) + '’s turn, so only they can buy a vowel.';
        return '';
      },
      onVowelBought: function () { setPaid(true); }
    };
  })();
  window.Rules = Rules;

  /* ---------- hooks called from the port ---------- */
  var lastLanded = '';
  var Extras = {
    init: function () {},
    afterBoot: function () { paintTurn(); syncBonusLink(); try { paintSampleBox(); } catch (e) { } try { paintSpin(); } catch (e) { } },
    spinPlan: spinPlan,
    samplesOn: function () { try { return samplesOn(); } catch (e) { return false; } },
    trySampleCode: trySampleCode,
    loadNextSample: loadNextSample,
    currentHelpTopic: currentHelpTopic,
    openPanel: function () { App.show(40); },
    onBuild: function (s, id) {
      if (id === 2) { setTimeout(function () { try { placePlayerExtras(); paintTurn(); } catch (e) { } }, 0); }
    },
    onShow: function (id) { if (id === 2) { paintTurn(); syncBonusLink(); } if (id === 41) WOFWheel.redraw(App.slide(41).el); if (id === 42) paintSpin(); },
    save: function () { return null; },
    load: function () {},
    onClearBoard: function () { Rules.reset(); S(2, 'XPrizeActive').Text = ''; S(2, 'XPrizeRibbon').Visible = false; },
    onPuzzleLoaded: function (i, isTossUp, opts) {
      Rules.reset();
      if (isTossUp !== 4) S(2, 'XSampleQueue').Text = '';
      var prize = !!(opts && opts.prize);
      S(2, 'XPrizeActive').Text = prize ? '1' : '';
      S(2, 'XPrizeRibbon').Visible = prize;
    },
    onSolved: function () {
      Rules.reset();
      if (S(2, 'XPrizeActive').Text === '1') {
        S(2, 'XPrizeActive').Text = ''; S(2, 'XPrizeRibbon').Visible = false;
        setTimeout(function () { App.hold(); awardPrize().then(App.release, App.release); }, 350);
      }
    },
    onWrongSolve: function () { if (!inTossUp()) nextTurn('Wrong solve'); },
    onLetter: function (letter, count) {
      Rules.onLetter(letter, count);
      if (count > 0 || inTossUp()) return;
      if (lastLanded === 'Free Play') return;          // Free Play: the turn continues regardless
      nextTurn(letter + ' is not in the puzzle');
    },
    onScoreAdded: function () {},
    onShotClockExpired: function () { if (!inTossUp()) nextTurn("Time's up"); },
    onLanded: function (landed) { lastLanded = landed; S(2, 'XLastLanded').Text = landed; if (App.current !== 41) Rules.onLanded(landed); },
    afterSpin: async function (landed) {
      if (landed === 'Bankrupt' || landed === 'Lose a Turn') nextTurn(landed);
    },
    onPlayersChanged: function () { placePlayerExtras(); paintTurn(); },
    onRoundChanged: function () { Rules.reset(); syncBonusLink(); },
    onWipe: function () { Rules.reset(); S(2, 'XSampleQueue').Text = ''; S(40, 'XSampleUsed').Text = ''; S(2, 'XActivePlayer').Text = '1'; for (var i = 1; i <= 4; i++) S(2, 'Player' + i + 'MDW').FillTransparency = 1; if (mdwOn()) setMDWOnWheels(true); paintTurn(); },
    beforeLoadPrompt: async function () {
      if (bonusMode() && on('XPickCategory')) return pickCategoryFlow();
      return false;
    }
  };
  function syncBonusLink() {
    var show = bonusMode() && on('XBonusWheel');
    S(2, 'XBonusWheelLink').Visible = show;
  }
  function placePlayerExtras() {
    for (var i = 1; i <= 4; i++) {
      var left = S(2, 'Player' + i + 'Name').Left;   // points
      S(2, 'XTurnDot' + i).Left = left + 3;
      S(2, 'Player' + i + 'MDW').Left = left + 106.5;
    }
  }
  window.Extras = Extras;
})();
