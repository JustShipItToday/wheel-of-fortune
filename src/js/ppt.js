/* ppt.js — a tiny stand-in for the PowerPoint object model the original VBA talks to.
   The VBA keeps all game state inside shapes (their text, fill colour, transparency, visibility, position),
   so the port reads and writes the very same shapes here. Each DOM shape carries:
     el._o  - its layout record (from layout.js)
     el._st - live state that differs from the layout: {fc, ft, lc, lt, grad, x, y, w}
   Colours are '#RRGGBB' strings; RGB(r,g,b) builds one. */
(function () {
  'use strict';
  var R = function () { return WOFRender; };
  var PT = 4 / 3; // PowerPoint points -> slide pixels

  function RGB(r, g, b) { return '#' + [r, g, b].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('').toUpperCase(); }

  function find(slideId, name) {
    var s = App.slide(slideId), a = s.byName[name];
    if (!a) {
      var low = name.toLowerCase();
      Object.keys(s.byName).some(function (k) { if (k.toLowerCase() === low) { a = s.byName[k]; return true; } return false; });
    }
    if (!a) throw new Error('No shape "' + name + '" on slide ' + slideId);
    return a[0];
  }

  function st(el) { return el._st || (el._st = {}); }
  function isGeo(el) { return !!el.querySelector(':scope > svg.geo'); }
  function lineW(el) { var l = el._o && el._o.l; return l && !l.n ? l.w : 0; }

  /* ---- fill painting ---- */
  function origAlpha(o) { return o.f && !o.f.n && o.f.a != null ? o.f.a : (o.f && o.f.n ? 0 : 1); }
  function fillTransp(el) {
    var s = st(el), o = el._o || {};
    if (s.ft != null) return s.ft;
    if (o.art === 'blip') return o.ba === 0 ? 1 : 0;
    if (!o.f || o.f.n) return 1;
    return Math.round((1 - origAlpha(o)) * 100) / 100;
  }
  function fillColor(el) {
    var s = st(el), o = el._o || {};
    if (s.fc) return s.fc;
    if (o.f && o.f.c) return o.f.c.toUpperCase();
    if (o.f && o.f.g) return o.f.g[0][1].toUpperCase();
    return '#FFFFFF';
  }
  function paintFill(el) {
    var s = st(el), o = el._o || {}, css, svgFill;
    var a = 1 - fillTransp(el);
    if (s.ft === 1) {
      css = 'transparent';
    } else if (s.grad) {
      var g = { g: s.grad.map(function (x) { return [x[0], x[1], x[2] == null ? 1 : x[2]]; }), ang: o.f && o.f.ang || 90, path: o.f && o.f.path };
      css = R().cssFill(g);
      if (isGeo(el)) { var svg = el.querySelector(':scope > svg.geo'); var old = svg.querySelector('defs'); if (old) old.remove(); svgFill = R().svgFillDefs(svg, g); }
    } else if (o.f && o.f.g && !s.fc) {
      css = R().cssFill(o.f); // untouched gradient
      if (s.ft === 1) css = 'transparent';
    } else {
      css = a <= 0 ? 'transparent' : R().rgba(fillColor(el), a);
    }
    if (o.art) { el.style.opacity = a <= 0 ? '0' : ''; if (window.WOFArt) WOFArt.refresh(el); return; }
    if (isGeo(el)) {
      Array.prototype.forEach.call(el.querySelectorAll(':scope > svg.geo > path'), function (p) {
        if (p.getAttribute('fill') === 'none' && !s.fc && !s.grad && s.ft == null) return;
        p.setAttribute('fill', svgFill || css);
      });
    } else el.style.background = css;
  }
  function lineTransp(el) {
    var s = st(el), l = el._o && el._o.l;
    if (s.lt != null) return s.lt;
    if (!l || l.n) return 1;
    return l.a != null ? Math.round((1 - l.a) * 100) / 100 : 0;
  }
  function paintLine(el) {
    var s = st(el), l = (el._o && el._o.l) || {};
    var col = R().rgba(s.lc || l.c || '#000000', 1 - lineTransp(el));
    if (isGeo(el)) Array.prototype.forEach.call(el.querySelectorAll(':scope > svg.geo > path'), function (p) { p.setAttribute('stroke', col); });
    else if (lineW(el)) el.style.borderColor = col;
  }

  /* ---- text ---- */
  function getText(el) {
    var tx = el.querySelector(':scope > .txt');
    if (!tx) return '';
    return Array.prototype.map.call(tx.querySelectorAll('.para'), function (p) {
      return Array.prototype.map.call(p.querySelectorAll('span'), function (s) { return s.textContent; }).join('');
    }).join('\r');
  }
  function setText(el, v) {
    v = v == null ? '' : String(v);
    var tx = el.querySelector(':scope > .txt');
    if (!tx) {
      tx = R().mk('div', 'txt'); tx.style.justifyContent = 'center'; tx.style.padding = '0';
      var p0 = R().mk('div', 'para'); p0.style.textAlign = 'center'; tx.appendChild(p0); el.appendChild(tx);
    }
    var paras = tx.querySelectorAll('.para');
    var p = paras[0];
    for (var i = 1; i < paras.length; i++) paras[i].remove();
    var spans = p.querySelectorAll('span'), span = spans[0];
    for (var j = 1; j < spans.length; j++) spans[j].remove();
    if (!span) { p.innerHTML = ''; span = R().mk('span'); span.style.color = (el._o && el._o.fc) || '#000000'; p.appendChild(span); }
    span.textContent = v;
    p.classList.toggle('emptyp', v === '');
    if (window.WOFFit) WOFFit.one(el);
  }

  /* ---- the Shape wrapper ---- */
  function Shape(el, slideId) { this.el = el; this.slide = slideId; }
  Shape.prototype = {
    get Name() { return this.el.dataset.name; },
    get Text() { return getText(this.el); },
    set Text(v) { setText(this.el, v); },
    get Visible() { return this.el.style.display !== 'none'; },
    set Visible(v) {
      this.el.style.display = v ? '' : 'none';
      if (this.el.classList.contains('grp')) Array.prototype.forEach.call(this.el.querySelectorAll('[data-name]'), function (c) { c.style.display = v ? '' : 'none'; });
      if (window.WOFArt && this.el._o && this.el._o.art) WOFArt.refresh(this.el); },
    get FillRGB() { return fillColor(this.el); },
    set FillRGB(c) { var s = st(this.el); s.fc = c.toUpperCase(); s.grad = null; if (s.ft == null && this.el._o && this.el._o.f && this.el._o.f.n) s.ft = 0; paintFill(this.el); },
    get FillTransparency() { return fillTransp(this.el); },
    set FillTransparency(v) { st(this.el).ft = v; paintFill(this.el); },
    get LineTransparency() { return lineTransp(this.el); },
    set LineTransparency(v) { st(this.el).lt = v; paintLine(this.el); },
    set LineRGB(c) { st(this.el).lc = c.toUpperCase(); paintLine(this.el); },
    get LineRGB() { var l = this.el._o && this.el._o.l; return st(this.el).lc || (l && l.c ? l.c.toUpperCase() : '#000000'); },
    /* gradient stops: [[pos, '#RRGGBB', alpha], ...] */
    set Gradient(stops) { st(this.el).grad = stops; paintFill(this.el); },
    get Gradient() { var s = st(this.el); if (s.grad) return s.grad; var f = this.el._o && this.el._o.f; return f && f.g ? f.g.map(function (x) { return [x[0], x[1], x[2]]; }) : null; },
    get Left() { return (this.el._o.x + (st(this.el).dx || 0)) / PT; },
    set Left(pt) { var s = st(this.el); s.dx = pt * PT - this.el._o.x; applyPos(this.el); },
    set Width(pt) { var s = st(this.el); s.w = pt * PT; applyPos(this.el); },
    item: function (child) {
      var c = this.el.querySelector('[data-name="' + child + '"]');
      if (!c) throw new Error('No group item ' + child + ' in ' + this.Name);
      return new Shape(c, this.slide);
    },
    rename: function (n) {
      var s = App.slide(this.slide), old = this.el.dataset.name, self = this.el;
      if (s.byName[old]) { s.byName[old] = s.byName[old].filter(function (e) { return e !== self; }); if (!s.byName[old].length) delete s.byName[old]; }
      (s.byName[n] = s.byName[n] || []).unshift(self);
      this.el.dataset.name = n;
    },
    bringToFront: function () { this.el.parentNode.appendChild(this.el); }
  };
  function applyPos(el) {
    var s = st(el), o = el._o, lw = isGeo(el) || el.classList.contains('grp') ? 0 : lineW(el);
    if (el.classList.contains('grp')) { el.style.left = (s.dx || 0) + 'px'; return; }
    el.style.left = (o.x + (s.dx || 0) - lw / 2) + 'px';
    if (s.w != null) {
      el.style.width = (s.w + lw) + 'px';
      var svg = el.querySelector(':scope > svg.geo'); if (svg) { svg.setAttribute('width', s.w); }
    }
  }

  function sh(slideId, name) { return new Shape(find(slideId, name), slideId); }
  function wrap(el) { var scr = el.closest('.screen'); return new Shape(el, scr ? +scr.dataset.slide : App.current); }

  /* re-apply stored state to a freshly built element (used by Persist on restore) */
  function restyle(el) {
    if (!el._st) return;
    var s = el._st;
    if (s.fc || s.ft != null || s.grad) paintFill(el);
    if (s.lc || s.lt != null) paintLine(el);
    if (s.dx != null || s.w != null) applyPos(el);
  }

  window.PPT = { RGB: RGB, sh: sh, wrap: wrap, Shape: Shape, restyle: restyle, getText: getText, setText: setText, fillTransp: fillTransp, PT: PT };
})();
