/* app.js — stage scaling, screen switching, click routing.
   Slide ids are the original PowerPoint slide numbers (1-26). The "All Puzzles" section is a run of
   pages: page 0 is slide 12 itself, page k (k >= 1) is a copy of slide 12 kept under id 1000 + k. */
(function () {
  'use strict';
  var stage, cache = {}, current = null, last = null;
  var M = {};            // macro handlers: M.name(el, slideId)
  var hooks = {};        // per-slide onShow hooks
  var busy = 0;          // > 0 while a macro is waiting on a dialog or an animation

  function scaleStage() {
    var s = Math.min(window.innerWidth / 960, window.innerHeight / 540);
    stage.style.transform = 'scale(' + s + ')';
  }

  function pageOf(id) { return id === 12 ? 0 : (id >= 1000 ? id - 1000 : -1); }
  function pageId(k) { return k === 0 ? 12 : 1000 + k; }

  function pageMap(k) {
    var off = 12 * k;
    return function (o) {
      var c = Object.assign({}, o), m;
      if ((m = /^PuzzleSolution(\d+)-(\d+)$/.exec(o.n))) c.n = 'PuzzleSolution' + (+m[1] + off) + '-' + m[2];
      else if ((m = /^(LinkTo|Swap|PuzzleCategory)(\d+)$/.exec(o.n))) {
        c.n = m[1] + (+m[2] + off);
        if (m[1] !== 'PuzzleCategory' && o.t) {
          c.t = JSON.parse(JSON.stringify(o.t)); c.t[0].r = [Object.assign({}, c.t[0].r[0], { t: String(+m[2] + off) })];
        }
      }
      if (o.n === 'PrevAllPuzzles') delete c.hid;
      if (o.n === 'NextAllPuzzles') c.hid = 1;
      return c;
    };
  }

  function slide(n) {
    if (!cache[n]) {
      var k = pageOf(n);
      cache[n] = k > 0 ? WOFRender.buildSlide(n, { layout: 12, map: pageMap(k) }) : WOFRender.buildSlide(n);
      stage.insertBefore(cache[n].el, stage.firstChild);
      var hookKey = k >= 0 ? 12 : n;
      if (App.onBuild[hookKey]) App.onBuild[hookKey](cache[n], n);
      if (App.onAnyBuild) App.onAnyBuild(cache[n], n);
    }
    return cache[n];
  }
  function exists(n) { return !!cache[n]; }
  function drop(n) { if (cache[n]) { cache[n].el.remove(); delete cache[n]; } }

  function show(n) {
    var s = slide(n);
    if (current !== n) {
      if (current != null && cache[current]) { cache[current].el.classList.remove('active'); last = current; }
      s.el.classList.add('active');
      current = n;
    }
    var hk = hooks[pageOf(n) >= 0 ? 12 : n];
    if (hk) hk(s, n);
    if (App.onShow) App.onShow(n);
  }
  function back() { show(last != null ? last : 1); }

  function run(fn, el) {
    busy++;
    var r;
    try { r = fn(el, current); } catch (err) { busy--; console.error(err); return; }
    if (r && r.then) r.then(function () { busy--; App.changed(); }, function (err) { busy--; console.error('macro error', err); App.changed(); });
    else { busy--; App.changed(); }
  }

  function onClick(e) {
    if (Dlg.isOpen()) return;
    var t = e.target.closest ? e.target.closest('.click') : null;
    if (!t || !stage.contains(t)) return;
    if (t.style.display === 'none') return;
    var m = t.dataset.m, j = t.dataset.j, u = t.dataset.u;
    if (busy > 0 && !(t.dataset.trig && !m)) return;
    if (App.onTrigger) { try { App.onTrigger(current, t); } catch (err) { console.error(err); } }
    if (t.dataset.trig && !m) return;
    if (m) {
      if (busy > 0) return;              // a macro is still running (dialog open or wheel spinning)
      var fn = M[m] || M[m.replace(/^Slide\d+\./, '')];
      if (fn) run(fn, t);
      else console.warn('Unhandled macro', m, 'on', t.dataset.name, 'slide', current);
    } else if (j != null && j !== '') {
      if (busy > 0) return;
      if (j === 'back') back();
      else if (j === 'end') show(1);
      else if (j === 'next' || j === 'prev') {
        var k = pageOf(current);
        if (k >= 0) { var nk = k + (j === 'next' ? 1 : -1); if (nk >= 0 && nk < App.pageCount()) show(pageId(nk)); }
      } else show(parseInt(j, 10));
      App.changed();
    } else if (u) { window.open(u, '_blank', 'noopener'); }
  }

  var App = {
    M: M, onBuild: {}, hooks: hooks, onAnyBuild: null, onShow: null, onTrigger: null,
    init: function () {
      stage = document.getElementById('stage');
      scaleStage(); window.addEventListener('resize', scaleStage);
      stage.addEventListener('click', onClick);
    },
    stage: function () { return stage; },
    slide: slide, show: show, back: back, exists: exists, drop: drop,
    pageOf: pageOf, pageId: pageId,
    pageCount: function () { var n = 1; while (cache[pageId(n)]) n++; return n; },
    get current() { return current; },
    get busy() { return busy > 0; },
    hold: function () { busy++; }, release: function () { if (busy > 0) busy--; },
    changed: function () { if (window.Persist) window.Persist.touch(); },
    built: function () { return Object.keys(cache).map(Number); }
  };
  window.App = App;
})();
