/* main.js — boot: build every slide, apply the few wording changes a browser needs (no PowerPoint, no macros),
   restore the autosave, and add the small corner menu (full screen, sound, save/load game file). */
(function () {
  'use strict';

  /* replace the paragraphs of a text shape, keeping the first run's formatting of each paragraph */
  function setParas(el, lines) {
    var tx = el.querySelector(':scope > .txt'); if (!tx) { PPT.setText(el, lines.join(' ')); return; }
    var paras = Array.prototype.slice.call(tx.querySelectorAll('.para'));
    var tmpl = paras.filter(function (p) { return p.textContent.trim(); });
    paras.forEach(function (p) { p.remove(); });
    lines.forEach(function (line, i) {
      var src = tmpl[Math.min(i, tmpl.length - 1)] || paras[0];
      var p = src.cloneNode(true), spans = p.querySelectorAll('span');
      for (var k = 1; k < spans.length; k++) spans[k].remove();
      if (spans[0]) spans[0].textContent = line; else p.textContent = line;
      if (!line) p.innerHTML = '&nbsp;';
      tx.appendChild(p);
    });
  }
  /* rich text: paragraphs of [{t, b, a}] runs (a = link), sized in pt, in the box's own font and colour */
  function rich(s, name, paras, ptDefault) {
    var a = s.byName[name]; if (!a) return;
    var el = a[0], tx = el.querySelector(':scope > .txt'); if (!tx) return;
    var ref = tx.querySelector('span'), cs = ref ? getComputedStyle(ref) : getComputedStyle(tx);
    var fam = cs.fontFamily, col = (el._o && el._o.fc) || cs.color;
    tx.innerHTML = '';
    paras.forEach(function (pp) {
      var p = document.createElement('div'); p.className = 'para';
      p.style.textAlign = pp.al || 'left'; p.style.marginTop = (pp.gap || 0) + 'px';
      (pp.runs || []).forEach(function (r) {
        var sp;
        if (r.svg) { sp = document.createElement('span'); sp.innerHTML = r.svg; sp.style.display = 'inline-block'; sp.style.verticalAlign = '-3px'; }
        else if (r.a) { sp = document.createElement('a'); sp.href = r.a; sp.target = '_blank'; sp.rel = 'noopener'; sp.style.color = '#0B3D91'; sp.style.textDecoration = 'underline'; sp.style.pointerEvents = 'auto'; sp.style.cursor = 'pointer'; sp.textContent = r.t; }
        else { sp = document.createElement('span'); sp.textContent = r.t; sp.style.color = col; }
        sp.style.fontFamily = fam; sp.style.fontSize = ((r.pt || pp.pt || ptDefault || 11) * 4 / 3) + 'px';
        sp.style.fontWeight = r.b ? '700' : '400';
        p.appendChild(sp);
      });
      tx.appendChild(p);
    });
  }
  function noLink(el) { el.classList.remove('click'); delete el.dataset.u; delete el.dataset.m; delete el.dataset.j; el.style.cursor = ''; }
  function link(el, j) { el.classList.add('click'); el.dataset.m = ''; el.dataset.j = j; }
  function T(s, name, lines) { var a = s.byName[name]; if (a) setParas(a[0], [].concat(lines)); }

  var SMILEY = '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7.2" fill="#FFD43B" stroke="#8A6D00" stroke-width="1"/><circle cx="5.6" cy="6.2" r="1.1" fill="#3A2A00"/><circle cx="10.4" cy="6.2" r="1.1" fill="#3A2A00"/><path d="M4.3 9.3c1 2.3 5.4 2.3 6.4 0" fill="none" stroke="#3A2A00" stroke-width="1.2" stroke-linecap="round"/></svg>';
  var ORIGINAL_URL = 'https://github.com/TimTree/wheel-of-fortune-ppt';

  var ADAPT = {
    1: function (s) {
      T(s, 'TextBox 29', 'Web Edition');
      T(s, 'TextBox 32', 'Web Edition by Avi Lindenboim');
      T(s, 'TextBox 33', 'Based on \u00A9 Games by Tim  ~  Credits');
      if (s.byName['TextBox 32']) noLink(s.byName['TextBox 32'][0]);
      ['MacroDisabledText', 'MacroBlocker'].forEach(function (n) { if (s.byName[n]) s.byName[n][0].style.display = 'none'; });
    },
    2: function (s) {
      var b = s.byName.GamesByTimButton; if (b) { b[0].style.display = 'none'; } if (window.VBA && VBA.compactTopRight) { try { VBA.compactTopRight(); } catch (e) { setTimeout(function () { VBA.compactTopRight(); }, 0); } } /* board credit removed; credits page still lists Tim */
    },
    11: function (s) {
      T(s, 'TextBox 125', ['Click a sound effect box to preview its sound.', 'You can also replace any sound with your own audio file (including the two music slots below).']);
      WOFAudio.NAMES.forEach(function (n) { var e = s.byName[n]; if (e) { e[0].classList.add('click'); e[0].dataset.m = 'soundBox'; } });
    },
    18: function (s) {
      T(s, 'TextBox 11', ['Thank you for using', 'Wheel of Fortune Web Edition']);
      T(s, 'TextBox 12', 'Your game saves automatically in this browser.');
    },
    23: function (s) { T(s, 'TextBox 11', 'Hosting through video call? Share this browser tab, and use full screen (F11 or the corner menu) for the cleanest view.'); },
    24: function (s) {
      T(s, 'TextBox 6', 'Use an up-to-date Chrome, Edge, Firefox or Safari.');
      T(s, 'TextBox 7', "Don't use the browser's Back button or reload while playing; use the on-screen buttons.");
      T(s, 'TextBox 8', 'Your puzzles and scores save automatically in this browser. To move them to another computer, use the corner menu: Save game file.');
      if (s.byName['TextBox 11']) s.byName['TextBox 11'][0].style.display = 'none';
      T(s, 'TextBox 9', ['Everything runs inside your browser.', 'Nothing is uploaded anywhere.']);
    },
    25: function (s) {
      var H = function (t) { return { runs: [{ t: t, b: 1, pt: 15 }], gap: 0 }; };
      T(s, 'TextBox 33', 'Wheel of Fortune Web Edition');
      rich(s, 'TextBox 36', [{ al: 'center', runs: [{ t: 'Developer: ', b: 1, pt: 16 }, { t: 'Avi Lindenboim', pt: 16 }, { t: '     Revised: ', b: 1, pt: 16 }, { t: 'October 2026', pt: 16 }] }]);
      rich(s, 'TextBox 34', [
        H('The Original'),
        { gap: 3, runs: [{ t: 'Wheel of Fortune for PowerPoint', b: 1 }, { t: ' was created by ' }, { t: 'Timothy Hsu (Games by Tim)', b: 1 }, { t: '. This edition is based on his game: the rules, screens, layout and sound effects all come from his work (v6.4).' }] },
        { gap: 5, runs: [{ t: 'View the original', a: ORIGINAL_URL }, { t: ' on GitHub.' }] },
        { gap: 12, runs: [{ t: 'The Web Edition', b: 1, pt: 15 }] },
        { gap: 3, runs: [{ t: 'Completely redone for the web by ' }, { t: 'Avi Lindenboim', b: 1 }, { t: ': rebuilt to run in any browser, with a redrawn wheel and logo, plus a Bonus Wheel, Million Dollar Wedge, Prize Puzzle, turn tracker and pick-a-category bonus.' }] }
      ], 11);
      rich(s, 'TextBox 35', [
        H('Special Thanks'),
        { gap: 3, runs: [{ t: 'Merv Griffin', b: 1 }, { t: ' (creator of Wheel of Fortune)' }] },
        { gap: 3, runs: [{ t: 'Pat Sajak and Vanna White', b: 1 }, { t: ' (longtime hosts of Wheel of Fortune)' }] },
        { gap: 3, runs: [{ t: 'Rusnakcreative', b: 1 }, { t: ' (inspired the original Wheel of Fortune template)' }] },
        { gap: 3, runs: [{ t: 'JapanYoshi', b: 1 }, { t: ' (the option to verify an answer when pressing Solve)' }] },
        { gap: 3, runs: [{ t: 'You all', b: 1 }, { t: ' for playing  ' }, { svg: SMILEY }] }
      ], 11);
      rich(s, 'TextBox 37', [
        H('Legal'),
        { gap: 4, runs: [{ t: '\u201CWheel of Fortune\u201D is a registered trademark of Califon Productions, Inc, which was not involved in the production of, and does not endorse, this product. For more information about the game show, visit www.wheeloffortune.com.' }] }
      ], 10);
      rich(s, 'TextBox 39', [{ al: 'center', runs: [
        { t: 'Wheel of Fortune Web Edition is an adaptation of ' }, { t: 'Wheel of Fortune for PowerPoint', b: 1 }, { t: ' by Timothy Hsu (Games by Tim), \u00A9 Games by Tim, and is licensed under a ' },
        { t: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License', b: 1 }, { t: '.' }] }], 10);
    }
  };
  /* replace the run texts of one paragraph, keeping each run's own formatting */
  function SP(s, name, para, texts) {
    var a = s.byName[name]; if (!a) return;
    var p = a[0].querySelectorAll('.para')[para]; if (!p) return;
    var spans = p.querySelectorAll('span');
    texts.forEach(function (t, i) { if (spans[i]) spans[i].textContent = t; });
    for (var k = texts.length; k < spans.length; k++) spans[k].remove();
  }

  function onAnyBuild(s, id) {
    var base = App.pageOf(id) >= 0 ? 12 : id;
    if (ADAPT[base]) ADAPT[base](s);
    if ([1, 3, 4, 5, 6].indexOf(base) >= 0) WOFWheel.setup(s);
    if (base === 1) WOFAnim.setupSlide1(s);
    if (base === 2) WOFAnim.setupSlide2(s);
    if (base === 4) WOFAnim.setupSlide4(s);
    if (window.Extras && Extras.onBuild) Extras.onBuild(s, id);
    Persist.snapshotInit(s);
  }

  App.M.soundBox = function (el) {
    var label = PPT.wrap(el).Text;
    return WOFAudio.soundBox(el.dataset.name, label);
  };

  /* ---- corner menu ---- */
  function menu() {
    var b = document.createElement('button');
    b.className = 'fs-btn'; b.textContent = '⋯'; b.title = 'Menu';
    b.onclick = async function () {
      if (Dlg.isOpen() || App.busy) return;
      var fs = !!document.fullscreenElement;
      var choices = [fs ? 'Exit full screen' : 'Full screen', WOFAudio.muted ? 'Sound on' : 'Sound off', 'Save game file', 'Load game file', 'Extra features', 'Close'];
      var i = await Dlg.choose('Your game saves automatically in this browser. A game file lets you move it to another computer or keep a backup.', 'Menu', choices);
      var c = choices[i];
      if (c === 'Full screen') document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(function () { });
      else if (c === 'Exit full screen') document.exitFullscreen();
      else if (c === 'Sound on' || c === 'Sound off') { WOFAudio.setMuted(c === 'Sound off'); try { localStorage.setItem('wof-web-muted', c === 'Sound off' ? '1' : ''); } catch (e) { } }
      else if (c === 'Save game file') { Persist.save(); Persist.exportFile(); }
      else if (c === 'Load game file') {
        if (await Dlg.confirm('Loading a game file replaces the puzzles, scores and settings in this browser. Continue?', 'Load Game File', { defaultNo: true })) {
          var ok = await Persist.importFile();
          if (ok) location.reload(); else await Dlg.msg("That file couldn't be loaded. Pick a .json game file saved from this game.", 'Load Game File');
        }
      } else if (c === 'Extra features' && window.Extras) Extras.openPanel();
    };
    document.getElementById('app').appendChild(b);
  }

  function boot() {
    App.init();
    App.onAnyBuild = onAnyBuild;
    App.onTrigger = WOFAnim.trigger;
    App.onShow = function (n) { if (window.WOFFit) WOFFit.slide(n); App.changed(); if (window.Extras && Extras.onShow) Extras.onShow(App.current); };
    for (var n = 1; n <= 25; n++) App.slide(n);   // slide 26 (the original's end-of-development notice) is not part of this edition
    if (window.Extras && Extras.init) Extras.init();
    Persist.load();
    try { if (localStorage.getItem('wof-web-muted') === '1') WOFAudio.setMuted(true); } catch (e) { }
    WOFAudio.load();
    menu();
    App.show(1);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (window.WOFFit) WOFFit.slide(App.current); });
    if (window.Extras && Extras.afterBoot) Extras.afterBoot();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.WOFMain = { setParas: setParas };
})();
