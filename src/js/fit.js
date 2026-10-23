/* fit.js — keeps text inside its box. If a shape's text is taller or wider than the shape, every run in it is
   scaled down (never below 35%) until it fits. Runs after a slide is shown and whenever a shape's text changes. */
(function () {
  'use strict';
  var MIN = 0.35, STEP = 0.04;

  function runs(tx) { return tx.querySelectorAll('span, .para'); }
  function remember(tx) {
    if (tx._fit0) return;
    tx._fit0 = [];
    Array.prototype.forEach.call(runs(tx), function (n) {
      var cs = getComputedStyle(n);
      tx._fit0.push([n, parseFloat(cs.fontSize), cs.lineHeight, cs.marginTop, cs.marginBottom]);
    });
  }
  function apply(tx, k) {
    tx._fit0.forEach(function (r) {
      var n = r[0];
      n.style.fontSize = (r[1] * k) + 'px';
      if (r[2] && r[2] !== 'normal' && /px$/.test(r[2])) n.style.lineHeight = (parseFloat(r[2]) * k) + 'px';
    });
  }
  function over(tx) { return tx.scrollHeight - tx.clientHeight > 1 || tx.scrollWidth - tx.clientWidth > 1; }

  function one(el) {
    var tx = el && el.querySelector && el.querySelector(':scope > .txt');
    if (!tx || el.offsetParent === null || el.classList.contains('wheel-item')) return;
    if (el.offsetWidth < 28 && el.offsetHeight < 28) tx.style.lineHeight = '1';   // tiny glyph buttons (+ - x ?): keep the glyph inside its circle
    if (tx._fitBusy) return; tx._fitBusy = true;
    try {
      // text changed since the last fit: start again from the original sizes
      if (tx._fit0 && tx._fit0.some(function (r) { return !tx.contains(r[0]); })) { tx._fit0 = null; tx._fitK = null; }
      if (tx._fit0 && tx._fitK != null && tx._fitK !== 1) { apply(tx, 1); tx._fitK = 1; }
      if (!tx.textContent.trim()) return;
      if (!over(tx)) return;
      remember(tx);
      // spans created after the first fit (e.g. setText) are not in _fit0: refresh the list
      if (tx._fit0.length !== runs(tx).length) { tx._fit0 = null; remember(tx); }
      var k = 1;
      while (k > MIN && over(tx)) { k = Math.max(MIN, k - STEP); apply(tx, k); }
      tx._fitK = k;
    } finally { tx._fitBusy = false; }
  }
  function slide(id) {
    var scr = document.querySelector('.screen[data-slide="' + id + '"]'); if (!scr) return;
    Array.prototype.forEach.call(scr.querySelectorAll('[data-name]'), one);
  }
  window.WOFFit = { one: one, slide: slide };
})();
