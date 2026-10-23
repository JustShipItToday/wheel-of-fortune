/* extras.js — features the slideshow doesn't have, modelled on today's show:
     • Turn tracker (who's up; passes on Bankrupt, Lose a Turn, a missed letter, a wrong solve, or shot-clock time-out)
     • Million Dollar Wedge (a wheel item for the Normal/Mystery/Express wheels; swaps the $100,000 bonus envelope for $1,000,000)
     • Bonus prize wheel (24 envelopes, prizes editable; defaults follow the show's $40,000 to $100,000 range plus cars)
     • Prize Puzzle (load a puzzle number with P, e.g. 4P; the solver wins the prize)
     • Pick-a-category Bonus Round (the contestant chooses one of three categories)
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
      var y = 150 + i * 56;
      s.push(txt(clone(9, 'TextBox 152', { n: 'XLabel' + i, x: 150, y: y, w: 230, h: 30 }), r[1]));
      s.push(clone(9, 'Help', { n: 'XHelp' + i, x: 130, y: y + 6, m: r[3] }));
      var tg = txt(clone(9, r[2] === 'on' ? 'BlueTiles' : 'SpanishN', { n: r[0], x: 392, y: y + 2, m: r[0] === 'XMillionWedge' ? 'XToggleMDW' : 'toggleOnOff' }), r[2]);
      s.push(tg);
    });
    var btns = [['XEditPrizes', 'Edit Bonus Prizes'], ['XEditPrizePuzzle', 'Edit Prize Puzzle Prize'], ['XImportPuzzles', 'Import Puzzles from Text'], ['XSaveFile', 'Save Game File'], ['XLoadFile', 'Load Game File']];
    btns.forEach(function (b, i) {
      s.push(txt(clone(9, 'TextBox 173', { n: b[0], x: 560, y: 150 + i * 50, w: 240, h: 30, m: b[0] }), b[1]));
    });
    s.push(txt(clone(10, 'TextBox 125', { n: 'XHint', y: 410, h: 48 }), 'Prize Puzzle: when loading a puzzle, append P to the number (for example 4P). Turn tracker: click the dot next to a player to give them the turn.'));
    s.push(clone(10, 'GoBack', { n: 'XGoBack', j: 'back' }));
    s.push(hiddenText('XBonusPrizes', DEFAULT_PRIZES.join('|')));
    s.push(hiddenText('XPrizeName', 'A TRIP TO HAWAII'));
    s.push(hiddenText('XPrizeValue', '10000'));
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

  /* ---------- additions to the slideshow's own slides ---------- */
  function extendLayouts() {
    // Settings: a button to the Extra Features screen
    L['9'].push(txt(clone(9, 'TextBox 173', { n: 'XExtrasButton', x: 705, y: 112, w: 150, h: 30, j: 40, f: { c: '#F7D774', a: 0.85 } }), 'Extra Features'));
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
    L['2'] = L['2'].concat(add);
    // Million Dollar Wedge item on the Normal, Mystery and Express wheels (hidden until switched on)
    [3, 4, 5].forEach(function (n) {
      var wc = find(n, 'WildCard', function (o) { return o.p && /^TheWheel#/.test(o.p); });
      insertAfter(String(n), 'WildCard', [{ k: 's', n: 'MDWedge', p: wc.p, x: wc.x, y: wc.y, w: 10, h: 10, art: 'blip', ba: 0, f: { n: 1 }, l: { n: 1 } }]);
    });
  }

  buildExtrasLayout();
  buildBonusWheelLayout();
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
  function setTurn(i) { S(2, 'XActivePlayer').Text = String(i); paintTurn(); App.changed(); }
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
    var def = [next, next + 1, next + 2].join(', ');
    var raw = await Dlg.input('Bonus Round: enter three puzzle numbers. The contestant picks one of their categories.\n\n(Leave blank to load a single puzzle the usual way.)', 'Bonus Round Categories', def);
    if (raw == null) return true;              // cancelled
    if (!raw.trim()) return false;             // fall back to the slideshow's prompt
    var nums = raw.split(/[^0-9]+/).filter(Boolean).map(Number);
    if (nums.length !== 3) { await Dlg.msg('Please enter exactly three puzzle numbers, like 10, 11, 12.', 'Bonus Round Categories'); return true; }
    for (var i = 0; i < 3; i++) if (!VBA.puzzleExists(nums[i])) { await Dlg.msg('No puzzle found for number ' + nums[i] + '.', 'Bonus Round Categories'); return true; }
    var cats = nums.map(function (n) { var idx = Math.floor((n - 1) / 12); return S(App.pageId(idx), 'PuzzleCategory' + n).Text || '(NO CATEGORY)'; });
    var pick = await chooseCard(cats);
    if (pick < 0) return true;
    await VBA.loadPuzzle(nums[pick], 0);
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
    VBA.Play('SpinWheel');
    var hide = ['WheelValue', 'BackText', 'BackOval'].map(function (n) { return S(sl, n); });
    hide.forEach(function (s) { s.el.style.visibility = 'hidden'; });
    await WOFWheel.spin(App.slide(sl).el, r / 10, 3600);
    hide.forEach(function (s) { s.el.style.visibility = ''; });
    S(sl, 'XRevealPrize').Visible = true;
  };
  App.M.XRevealPrize = async function () {
    var p = S(41, 'XChosen').Text;
    if (!p) { await Dlg.msg('Spin the wheel first.', 'Reveal Prize'); return; }
    S(41, 'WheelValue').Text = p;
    VBA.Play('SolvePuzzleChime');
  };

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
    XExplainBonusWheel: ['Adds a Bonus Wheel with 24 envelopes. In the Bonus Round, click the Bonus Wheel button at the top right of the puzzle board to spin it. Edit the prizes with Edit Bonus Prizes. The default is on.', 'Bonus Prize Wheel']
  };
  Object.keys(EXPLAIN).forEach(function (k) { App.M[k] = function () { return Dlg.msg(EXPLAIN[k][0], EXPLAIN[k][1]); }; });

  /* ---------- hooks called from the port ---------- */
  var lastLanded = '';
  var Extras = {
    init: function () {},
    afterBoot: function () { paintTurn(); syncBonusLink(); },
    openPanel: function () { App.show(40); },
    onBuild: function (s, id) {
      if (id === 2) { setTimeout(function () { try { placePlayerExtras(); paintTurn(); } catch (e) { } }, 0); }
    },
    onShow: function (id) { if (id === 2) { paintTurn(); syncBonusLink(); } if (id === 41) WOFWheel.redraw(App.slide(41).el); },
    save: function () { return null; },
    load: function () {},
    onClearBoard: function () { S(2, 'XPrizeActive').Text = ''; S(2, 'XPrizeRibbon').Visible = false; },
    onPuzzleLoaded: function (i, isTossUp, opts) {
      var prize = !!(opts && opts.prize);
      S(2, 'XPrizeActive').Text = prize ? '1' : '';
      S(2, 'XPrizeRibbon').Visible = prize;
    },
    onSolved: function () {
      if (S(2, 'XPrizeActive').Text === '1') {
        S(2, 'XPrizeActive').Text = ''; S(2, 'XPrizeRibbon').Visible = false;
        setTimeout(function () { App.hold(); awardPrize().then(App.release, App.release); }, 350);
      }
    },
    onWrongSolve: function () { if (!inTossUp()) nextTurn('Wrong solve'); },
    onLetter: function (letter, count) {
      if (count > 0 || inTossUp()) return;
      if (lastLanded === 'Free Play') return;          // Free Play: the turn continues regardless
      nextTurn(letter + ' is not in the puzzle');
    },
    onScoreAdded: function () {},
    onShotClockExpired: function () { if (!inTossUp()) nextTurn("Time's up"); },
    onLanded: function (landed) { lastLanded = landed; S(2, 'XLastLanded').Text = landed; },
    afterSpin: async function (landed) {
      if (landed === 'Bankrupt' || landed === 'Lose a Turn') nextTurn(landed);
    },
    onPlayersChanged: function () { placePlayerExtras(); paintTurn(); },
    onRoundChanged: function () { syncBonusLink(); },
    onWipe: function () { S(2, 'XActivePlayer').Text = '1'; for (var i = 1; i <= 4; i++) S(2, 'Player' + i + 'MDW').FillTransparency = 1; if (mdwOn()) setMDWOnWheels(true); paintTurn(); },
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
