/* audio.js — the slideshow's sound effects. Like PowerPoint action sounds, a new sound stops the one playing.
   Any sound (including the two music slots that ship empty) can be replaced with the host's own audio file;
   replacements are kept in this browser's IndexedDB. */
(function () {
  'use strict';
  var NAMES = ['LoadPuzzleChime', 'GuessLetterCorrect', 'GuessLetterWrong', 'SpinWheel', 'SolvePuzzleChime', 'TripleTossUpSolve', 'FinalSpinAlert', 'BonusCountdown', 'TossUpMusic', 'FinalSpinMusic'];
  var custom = {};        // name -> object URL
  var player = null, muted = false, fitTimer = null;
  var DB = 'wof-web-sounds', STORE = 'sounds';

  function db() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('no indexedDB'));
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(STORE, mode), st = t.objectStore(STORE), out = fn(st);
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
        t.onerror = function () { rej(t.error); };
      });
    });
  }
  function loadCustom() {
    return tx('readonly', function (st) {
      var req = st.openCursor();
      req.onsuccess = function () {
        var c = req.result; if (!c) return;
        try { custom[c.key] = URL.createObjectURL(c.value); } catch (e) { }
        c.continue();
      };
    }).catch(function () { });
  }

  function src(name) { return custom[name] || (window.WOF_SOUNDS && WOF_SOUNDS[name]) || null; }
  function stop() { clearTimeout(fitTimer); if (player) { try { player.pause(); } catch (e) { } player = null; } }
  /* fitMs (optional): stretch or squeeze the sound to last about this long (pitch is kept; the speed change is limited
     to half to double), and cut it off then if it still runs on. Used so the spin sound follows the spin length. */
  function play(name, fitMs) {
    var s = src(name);
    if (!s || muted) return;
    stop();
    try {
      var a = player = new Audio(s);
      if (fitMs > 0) {
        a.preservesPitch = true;
        a.addEventListener('loadedmetadata', function () {
          if (a.duration > 0 && isFinite(a.duration)) a.playbackRate = Math.max(0.5, Math.min(2, a.duration * 1000 / fitMs));
        });
        fitTimer = setTimeout(function () { if (player === a) stop(); }, fitMs + 50);
      }
      var p = a.play(); if (p && p.catch) p.catch(function () { });
    } catch (e) { }
  }
  function setCustom(name, file) {
    return tx('readwrite', function (st) { st.put(file, name); }).then(function () {
      if (custom[name]) URL.revokeObjectURL(custom[name]);
      custom[name] = URL.createObjectURL(file);
    });
  }
  function reset(name) {
    return tx('readwrite', function (st) { st.delete(name); }).catch(function () { }).then(function () {
      if (custom[name]) URL.revokeObjectURL(custom[name]);
      delete custom[name];
    });
  }
  function pickFile() {
    return new Promise(function (resolve) {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'audio/*';
      inp.onchange = function () { resolve(inp.files && inp.files[0] || null); };
      inp.click();
    });
  }

  /* the box clicked on the Sound Effect Settings slide */
  async function soundBox(name, label) {
    var has = !!src(name), isCustom = !!custom[name];
    var text = has ? (isCustom ? 'Using your own file.' : 'Using the built-in sound.') : 'No sound is set for this slot (the slideshow ships without one).';
    var choices = [];
    if (has) choices.push('Play');
    choices.push('Use my own file…');
    if (isCustom) choices.push('Reset to default');
    choices.push('Close');
    for (;;) {
      var i = await Dlg.choose(text + '\n\nYou can replace any sound with an audio file from your computer. Replacements are saved in this browser.', label, choices);
      var c = choices[i];
      if (c === 'Play') { play(name); continue; }
      if (c === 'Use my own file…') {
        var f = await pickFile();
        if (f) { try { await setCustom(name, f); toast('Saved: ' + label); play(name); } catch (e) { await Dlg.msg('That file could not be saved in this browser.', label); } }
        return;
      }
      if (c === 'Reset to default') { await reset(name); toast(label + ' reset'); return; }
      stop();
      return;
    }
  }

  window.WOFAudio = { play: play, stop: stop, load: loadCustom, soundBox: soundBox, NAMES: NAMES, setMuted: function (m) { muted = m; if (m) stop(); }, get muted() { return muted; } };
})();
