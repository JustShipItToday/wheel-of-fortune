/* render.js — rebuilds PowerPoint slide shapes (from layout.js) as DOM/SVG */
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var FONT_SCALE = 0.9;
  var FONTS = {
    'Tw Cen MT': "'Josefin Sans','Tw Cen MT','Century Gothic',Arial,sans-serif",
    'Arial': "Arial,Helvetica,'Liberation Sans',sans-serif",
    'Corbel': "'Josefin Sans',Corbel,Arial,sans-serif",
    'Cooper Black': "'Alfa Slab One','Cooper Black',Georgia,serif",
    'Verdana': "Verdana,'DejaVu Sans',sans-serif"
  };

  function rgba(hex, a) {
    if (!hex) return 'transparent';
    var h = hex.replace('#', '');
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return a == null || a >= 1 ? 'rgb(' + r + ',' + g + ',' + b + ')' : 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function cssFill(f) {
    if (!f || f.n) return 'transparent';
    if (f.g) {
      var stops = f.g.map(function (s) { return rgba(s[1], s[2]) + ' ' + (s[0] * 100).toFixed(1) + '%'; }).join(',');
      if (f.path) return 'radial-gradient(circle at 50% 50%,' + f.g.slice().reverse().map(function (s, i, arr) { return rgba(s[1], s[2]) + ' ' + ((1 - s[0]) * 100).toFixed(1) + '%'; }).join(',') + ')';
      return 'linear-gradient(' + ((f.ang || 0) + 90) + 'deg,' + stops + ')';
    }
    return rgba(f.c, f.a);
  }

  /* ---------- preset geometry -> svg path ---------- */
  function A(adj, key, def) { return adj && adj[key] != null ? adj[key] : def; }
  function presetPath(g, w, h, adj) {
    var ss = Math.min(w, h), p;
    switch (g) {
      case 'trapezoid': var x2 = ss * A(adj, 'adj', 25000) / 100000; return 'M0 ' + h + 'L' + x2 + ' 0L' + (w - x2) + ' 0L' + w + ' ' + h + 'Z';
      case 'triangle': var x1 = w * A(adj, 'adj', 50000) / 100000; return 'M0 ' + h + 'L' + x1 + ' 0L' + w + ' ' + h + 'Z';
      case 'rightArrow':
        var a1 = A(adj, 'adj1', 50000) / 100000, a2 = A(adj, 'adj2', 50000) / 100000;
        var hl = ss * a2, xs = w - hl, y1 = h * (1 - a1) / 2, y2 = h - y1;
        return 'M0 ' + y1 + 'L' + xs + ' ' + y1 + 'L' + xs + ' 0L' + w + ' ' + h / 2 + 'L' + xs + ' ' + h + 'L' + xs + ' ' + y2 + 'L0 ' + y2 + 'Z';
      case 'round1Rect': var r = ss * A(adj, 'adj', 16667) / 100000; return 'M0 0L' + (w - r) + ' 0A' + r + ' ' + r + ' 0 0 1 ' + w + ' ' + r + 'L' + w + ' ' + h + 'L0 ' + h + 'Z';
      case 'homePlate': var xh = w - ss * A(adj, 'adj', 50000) / 100000; return 'M0 0L' + xh + ' 0L' + w + ' ' + h / 2 + 'L' + xh + ' ' + h + 'L0 ' + h + 'Z';
      case 'parallelogram': var xp = ss * A(adj, 'adj', 25000) / 100000; return 'M0 ' + h + 'L' + xp + ' 0L' + w + ' 0L' + (w - xp) + ' ' + h + 'Z';
      case 'donut':
        var t = ss * A(adj, 'adj', 25000) / 100000, rx = w / 2, ry = h / 2;
        return 'M0 ' + ry + 'A' + rx + ' ' + ry + ' 0 1 0 ' + w + ' ' + ry + 'A' + rx + ' ' + ry + ' 0 1 0 0 ' + ry + 'ZM' + t + ' ' + ry + 'A' + (rx - t) + ' ' + (ry - t) + ' 0 1 1 ' + (w - t) + ' ' + ry + 'A' + (rx - t) + ' ' + (ry - t) + ' 0 1 1 ' + t + ' ' + ry + 'Z';
      case 'can':
        var e = h * A(adj, 'adj', 25000) / 200000;
        return 'M0 ' + e + 'A' + w / 2 + ' ' + e + ' 0 0 1 ' + w + ' ' + e + 'L' + w + ' ' + (h - e) + 'A' + w / 2 + ' ' + e + ' 0 0 1 0 ' + (h - e) + 'ZM0 ' + e + 'A' + w / 2 + ' ' + e + ' 0 0 0 ' + w + ' ' + e;
      case 'cube':
        var d = ss * A(adj, 'adj', 25000) / 100000;
        return 'M0 ' + d + 'L' + d + ' 0L' + w + ' 0L' + w + ' ' + (h - d) + 'L' + (w - d) + ' ' + h + 'L0 ' + h + 'ZM0 ' + d + 'L' + (w - d) + ' ' + d + 'L' + w + ' 0M' + (w - d) + ' ' + d + 'L' + (w - d) + ' ' + h;
      case 'cloud': return 'M' + w * 0.2 + ' ' + h * 0.8 + 'A' + w * 0.2 + ' ' + h * 0.3 + ' 0 1 1 ' + w * 0.35 + ' ' + h * 0.35 + 'A' + w * 0.25 + ' ' + h * 0.3 + ' 0 0 1 ' + w * 0.75 + ' ' + h * 0.3 + 'A' + w * 0.25 + ' ' + h * 0.35 + ' 0 1 1 ' + w * 0.85 + ' ' + h * 0.8 + 'Z';
      case 'circularArrow':
        return 'M' + w * 0.5 + ' ' + h * 0.05 + 'A' + w * 0.45 + ' ' + h * 0.45 + ' 0 1 0 ' + w * 0.95 + ' ' + h * 0.55 + 'L' + w * 0.75 + ' ' + h * 0.5 + 'M' + w * 0.95 + ' ' + h * 0.55 + 'L' + w * 1.0 + ' ' + h * 0.3;
      case 'bentArrow':
        return 'M0 ' + h + 'L0 ' + h * 0.45 + 'Q0 ' + h * 0.2 + ' ' + w * 0.3 + ' ' + h * 0.2 + 'L' + w * 0.6 + ' ' + h * 0.2 + 'L' + w * 0.6 + ' 0L' + w + ' ' + h * 0.38 + 'L' + w * 0.6 + ' ' + h * 0.75 + 'L' + w * 0.6 + ' ' + h * 0.55 + 'L' + w * 0.3 + ' ' + h * 0.55 + 'Q' + w * 0.2 + ' ' + h * 0.55 + ' ' + w * 0.2 + ' ' + h * 0.7 + 'L' + w * 0.2 + ' ' + h + 'Z';
      case 'curvedRightArrow':
        return 'M0 0Q' + w * 0.9 + ' ' + h * 0.05 + ' ' + w * 0.8 + ' ' + h * 0.55 + 'L' + w + ' ' + h * 0.5 + 'L' + w * 0.6 + ' ' + h + 'L' + w * 0.3 + ' ' + h * 0.55 + 'L' + w * 0.55 + ' ' + h * 0.6 + 'Q' + w * 0.6 + ' ' + h * 0.25 + ' 0 ' + h * 0.25 + 'Z';
      case 'line': case 'straightConnector1': return 'M0 0L' + w + ' ' + h;
    }
    return null;
  }

  /* ---------- builders ---------- */
  var uid = 0;
  function mk(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function applyTransform(el, o, w, h) {
    var t = [];
    if (o.r) t.push('rotate(' + o.r + 'deg)');
    if (o.fx) t.push('scaleX(-1)');
    if (o.fy) t.push('scaleY(-1)');
    if (t.length) el.style.transform = t.join(' ');
  }

  function styleRun(s, r, fscale, dflt) {
    if (r.sz) s.style.fontSize = (r.sz * 4 / 3 * fscale).toFixed(2) + 'px';
    if (r.b) s.style.fontWeight = '700';
    if (r.i) s.style.fontStyle = 'italic';
    s.style.color = r.col || dflt || '#000000';
    if (r.sh) s.style.textShadow = '2px 2px 3px rgba(0,0,0,.45)';
    if (r.spc) s.style.letterSpacing = (r.spc * 4 / 3) + 'px';
    s.style.fontFamily = FONTS[r.font] || FONTS['Tw Cen MT'];
  }
  function buildText(o) {
    var box = mk('div', 'txt');
    var ins = o.ins || [9.6, 4.8, 9.6, 4.8];
    box.style.padding = ins[1] + 'px ' + ins[2] + 'px ' + ins[3] + 'px ' + ins[0] + 'px';
    var an = o.an || 't';
    box.style.justifyContent = an === 'ctr' ? 'center' : an === 'b' ? 'flex-end' : 'flex-start';
    if (o.wr === 'none') box.style.whiteSpace = 'nowrap';
    if (o.vt && o.vt !== 'horz') { box.style.writingMode = o.vt === 'vert270' ? 'vertical-rl' : 'vertical-rl'; if (o.vt === 'vert270') box.style.transform = 'rotate(180deg)'; }
    var fscale = (o.fs || 1) * FONT_SCALE;
    o.t.forEach(function (p) {
      var pe = mk('div', 'para');
      pe.style.textAlign = p.al === 'ctr' ? 'center' : p.al === 'r' ? 'right' : p.al === 'just' ? 'justify' : 'left';
      var runs = p.r.length ? p.r : (p.e ? [Object.assign({ t: '' }, p.e)] : []);
      if (!runs.length) { pe.innerHTML = '&nbsp;'; }
      runs.forEach(function (r) {
        var s = mk('span');
        s.textContent = r.t;
        styleRun(s, r, fscale, o.fc);
        pe.appendChild(s);
      });
      if (!p.r.length && p.e) pe.classList.add('emptyp');
      box.appendChild(pe);
    });
    return box;
  }

  function svgFillDefs(svg, f, w, h) {
    if (!f || !f.g) return null;
    var id = 'gr' + (++uid);
    var defs = document.createElementNS(SVGNS, 'defs');
    var gr;
    if (f.path) { gr = document.createElementNS(SVGNS, 'radialGradient'); gr.setAttribute('cx', '50%'); gr.setAttribute('cy', '50%'); gr.setAttribute('r', '50%'); }
    else {
      gr = document.createElementNS(SVGNS, 'linearGradient');
      var a = (f.ang || 0) * Math.PI / 180;
      gr.setAttribute('x1', (50 - 50 * Math.cos(a)) + '%'); gr.setAttribute('y1', (50 - 50 * Math.sin(a)) + '%');
      gr.setAttribute('x2', (50 + 50 * Math.cos(a)) + '%'); gr.setAttribute('y2', (50 + 50 * Math.sin(a)) + '%');
    }
    gr.setAttribute('id', id);
    f.g.forEach(function (s) {
      var st = document.createElementNS(SVGNS, 'stop');
      st.setAttribute('offset', (s[0] * 100) + '%'); st.setAttribute('stop-color', s[1]); st.setAttribute('stop-opacity', s[2] == null ? 1 : s[2]);
      gr.appendChild(st);
    });
    defs.appendChild(gr); svg.appendChild(defs);
    return 'url(#' + id + ')';
  }

  function buildShape(o) {
    var el = mk('div', 'shp');
    el._o = o;
    el.style.left = o.x + 'px'; el.style.top = o.y + 'px'; el.style.width = o.w + 'px'; el.style.height = o.h + 'px';
    var g = o.g || 'rect';
    var ln = o.l && !o.l.n ? o.l : null;
    var lw = ln ? ln.w : 0;
    var pathGeom = o.paths || presetPath(g, o.w, o.h, o.adj);
    if (pathGeom) {
      var svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('class', 'geo'); svg.setAttribute('width', o.w); svg.setAttribute('height', o.h);
      svg.setAttribute('viewBox', '0 0 ' + o.w + ' ' + o.h); svg.style.overflow = 'visible';
      var fill = o.f && !o.f.n ? (o.f.g ? svgFillDefs(svg, o.f) : rgba(o.f.c, o.f.a)) : 'none';
      var stroke = ln ? rgba(ln.c || '#000000', ln.a) : 'none';
      var paths = o.paths ? o.paths : [{ w: o.w, h: o.h, d: pathGeom }];
      paths.forEach(function (pp) {
        var pe = document.createElementNS(SVGNS, 'path');
        pe.setAttribute('d', pp.d);
        if (o.paths) pe.setAttribute('transform', 'scale(' + (o.w / (pp.w || o.w)) + ' ' + (o.h / (pp.h || o.h)) + ')');
        pe.setAttribute('fill', g === 'line' || g === 'straightConnector1' || g === 'circularArrow' ? 'none' : fill);
        pe.setAttribute('stroke', stroke); pe.setAttribute('stroke-width', lw || 0);
        if (g === 'can' || g === 'cube' || o.paths) pe.setAttribute('fill-rule', g === 'donut' ? 'evenodd' : 'nonzero');
        if (g === 'donut') pe.setAttribute('fill-rule', 'evenodd');
        svg.appendChild(pe);
      });
      el.appendChild(svg);
    } else {
      el.style.boxSizing = 'border-box';
      el.style.background = cssFill(o.f);
      if (g === 'ellipse') el.style.borderRadius = '50%';
      else if (g === 'roundRect') el.style.borderRadius = (Math.min(o.w, o.h) * A(o.adj, 'adj', 16667) / 100000) + 'px';
      if (ln) {
        // PowerPoint strokes are centred on the edge: grow the box by half the line width
        el.style.left = (o.x - lw / 2) + 'px'; el.style.top = (o.y - lw / 2) + 'px';
        el.style.width = (o.w + lw) + 'px'; el.style.height = (o.h + lw) + 'px';
        el.style.border = lw + 'px solid ' + rgba(ln.c || '#000000', ln.a);
        el.style.backgroundClip = 'padding-box';
        if (o.f && !o.f.n) { var inner = mk('div', 'fillunder'); inner.style.cssText = 'position:absolute;inset:' + (-lw) + 'px;pointer-events:none;'; }
      }
    }
    if (o.art && window.WOFArt) window.WOFArt.paint(el, o);
    if (o.k === 'p' && o.img) { el.style.backgroundImage = 'url(' + (window.WOF_IMAGES && window.WOF_IMAGES[o.img] || '') + ')'; el.style.backgroundSize = '100% 100%'; }
    if (o.t) {
      var tx = buildText(o);
      if (ln && !pathGeom) { tx.style.left = (-lw / 2) + 'px'; tx.style.top = (-lw / 2) + 'px'; tx.style.right = (-lw / 2) + 'px'; tx.style.bottom = (-lw / 2) + 'px'; }
      el.appendChild(tx);
    }
    if (o.gl) {
      var gcol = rgba(o.gl[1], o.gl[2]);
      if (pathGeom) el.style.filter = 'drop-shadow(0 0 ' + (o.gl[0] * 0.5) + 'px ' + gcol + ')';
      else el.style.boxShadow = '0 0 ' + o.gl[0] + 'px ' + (o.gl[0] * 0.25) + 'px ' + gcol;
    }
    applyTransform(el, o);
    if (o.fx && !o.fy) { var tt = el.querySelector(':scope > .txt'); if (tt) tt.style.transform = (tt.style.transform || '') + ' scaleX(-1)'; }
    return el;
  }

  /* ---------- slide builder ---------- */
  function buildSlide(num, opts) {
    opts = opts || {};
    var shapes = window.WOF_LAYOUT[String(opts.layout || num)];
    if (opts.map) shapes = shapes.map(opts.map);
    var root = mk('div', 'screen'); root.dataset.slide = num;
    root.style.background = 'linear-gradient(180deg,#1E1264 0%,#6D3A8C 50%,#1E1264 100%)';
    var byName = {}, groups = {};
    shapes.forEach(function (o) {
      var parent = o.p ? groups[o.p] : root, el;
      if (o.k === 'g') {
        el = mk('div', 'grp'); el.dataset.name = o.n; el._o = o;
        if (o.r) { el.style.transformOrigin = (o.x + o.w / 2) + 'px ' + (o.y + o.h / 2) + 'px'; el.style.transform = 'rotate(' + o.r + 'deg)'; }
        groups[o.n + '#' + o.id] = el;
      } else {
        el = buildShape(o);
        el.dataset.name = o.n;
        if (o.m || o.j != null || o.u) { el.classList.add('click'); el.dataset.m = o.m || ''; if (o.j != null) el.dataset.j = o.j; if (o.u) el.dataset.u = o.u; }
      }
      if (el.classList.contains('grp') && (o.m || o.j != null)) { el.classList.add('click'); el.dataset.m = o.m || ''; if (o.j != null) el.dataset.j = o.j; }
      if (o.hid) el.style.display = 'none';
      (byName[o.n] = byName[o.n] || []).push(el);
      parent.appendChild(el);
    });
    return { num: num, el: root, byName: byName, groups: groups };
  }

  window.WOFRender = { buildSlide: buildSlide, svgFillDefs: svgFillDefs, styleRun: styleRun, rgba: rgba, cssFill: cssFill, FONTS: FONTS, mk: mk, SVGNS: SVGNS };
})();
