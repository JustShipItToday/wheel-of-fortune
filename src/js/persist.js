/* persist.js — autosave. Because the game keeps its state in the shapes (exactly like the slideshow, which you'd
   save as a .pptm), saving means recording every shape that differs from the freshly built slide:
   its text, visibility, name (puzzle-number buttons get renamed), colours/transparency and position.
   Saved to localStorage on every change; can also be exported/imported as a .json "game file". */
(function () {
  'use strict';
  var KEY = 'wof-web-v1', BACKUP = 'wof-web-v1-backup', timer = null, restoring = false, frozen = false;

  function shapesOf(slideObj) { return slideObj.el.querySelectorAll('[data-name]'); }
  function snapshotInit(slideObj) {
    Array.prototype.forEach.call(shapesOf(slideObj), function (el) {
      el._init = { t: PPT.getText(el), d: el.style.display || '' };
    });
  }
  /* skip(slideId, el): optional, return true to leave a shape out (used by Share to leave out scores or the board) */
  function collect(skip) {
    var out = { v: 1, pages: App.pageCount(), slides: {}, extras: window.Extras ? Extras.save() : null, at: Date.now() };
    App.built().sort(function (a, b) { return a - b; }).forEach(function (id) {
      var s = App.slide(id), recs = [];
      Array.prototype.forEach.call(shapesOf(s), function (el, i) {
        if (!el._init) return;
        if (skip && skip(id, el)) return;
        var r = null, t = PPT.getText(el), d = el.style.display || '';
        function R() { return r || (r = { i: i }); }
        if (t !== el._init.t) R().t = t;
        if (d !== el._init.d) R().d = d;
        if (el._o && el.dataset.name !== el._o.n) R().n = el.dataset.name;
        if (el._st && Object.keys(el._st).some(function (k) { return el._st[k] != null; })) R().s = el._st;
        if (r) recs.push(r);
      });
      if (recs.length) out.slides[id] = recs;
    });
    return out;
  }
  function save() {
    if (restoring || frozen) return;
    try { localStorage.setItem(KEY, JSON.stringify(collect())); } catch (e) { console.warn('autosave failed', e); }
  }
  function touch() { clearTimeout(timer); timer = setTimeout(save, 300); }

  function apply(data) {
    restoring = true;
    try {
      for (var k = 1; k < (data.pages || 1); k++) App.slide(App.pageId(k));
      Object.keys(data.slides || {}).map(Number).sort(function (a, b) { return a - b; }).forEach(function (id) {
        var s = App.slide(id), list = shapesOf(s);
        data.slides[id].forEach(function (r) {
          var el = list[r.i]; if (!el) return;
          if (r.n != null) new PPT.Shape(el, id).rename(r.n);
          if (r.t != null) PPT.setText(el, r.t);
          if (r.d != null) el.style.display = r.d;
          if (r.s) { el._st = r.s; PPT.restyle(el); if (el._o && el._o.art && window.WOFArt) WOFArt.refresh(el); }
        });
      });
      if (data.extras && window.Extras) Extras.load(data.extras);
      if (window.WOFWheel) WOFWheel.redrawAll();
    } finally { restoring = false; }
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { }
    if (!raw) return false;
    try { apply(JSON.parse(raw)); return true; } catch (e) { console.warn('could not restore save', e); return false; }
  }
  /* take over this browser's save with another game (a shared link). The previous save is kept as a backup. */
  function adopt(data) {
    var prev = localStorage.getItem(KEY);
    if (prev) localStorage.setItem(BACKUP, prev);
    localStorage.setItem(KEY, JSON.stringify(data));
    frozen = true;            // the page is about to reload; don't let the pending autosave overwrite it
  }
  function hasBackup() { try { return !!localStorage.getItem(BACKUP); } catch (e) { return false; } }
  /* swap the current game with the backup (so you can go back and forth) */
  function swapBackup() {
    save();
    var cur = localStorage.getItem(KEY), bak = localStorage.getItem(BACKUP);
    if (!bak) return false;
    localStorage.setItem(KEY, bak);
    if (cur) localStorage.setItem(BACKUP, cur); else localStorage.removeItem(BACKUP);
    frozen = true;
    return true;
  }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) { } }

  function exportFile() {
    var blob = new Blob([JSON.stringify(collect())], { type: 'application/json' });
    var a = document.createElement('a');
    var d = new Date(), pad = function (n) { return ('0' + n).slice(-2); };
    a.download = 'wheel-game-' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '.json';
    a.href = URL.createObjectURL(blob); document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function importFile() {
    return new Promise(function (resolve) {
      var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = function () {
        var f = inp.files && inp.files[0]; if (!f) return resolve(false);
        var rd = new FileReader();
        rd.onload = function () {
          try {
            var data = JSON.parse(rd.result);
            if (!data || data.v !== 1 || !data.slides) throw new Error('not a game file');
            localStorage.setItem(KEY, JSON.stringify(data));
            resolve(true);
          } catch (e) { resolve(false); }
        };
        rd.readAsText(f);
      };
      inp.click();
    });
  }

  window.Persist = { touch: touch, save: save, load: load, clear: clear, snapshotInit: snapshotInit, exportFile: exportFile, importFile: importFile, collect: collect, adopt: adopt, hasBackup: hasBackup, swapBackup: swapBackup, KEY: KEY, get restoring() { return restoring; } };
})();
