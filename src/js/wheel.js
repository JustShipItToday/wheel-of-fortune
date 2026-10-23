/* wheel.js — the wheel, redrawn from scratch as SVG (the slideshow's wheel artwork is not reused).
   Layout follows the slideshow exactly: 24 wedges of 15 degrees, band b (0-23) is what Module2.youLandedOn
   reads for rand in [150b, 150b+149]; a spin turns the wheel clockwise by rand/10 degrees, so band b sits under
   the pointer in clockwise slot k = 23 - b (slot k spans 15k..15k+15 degrees from 12 o'clock).
   Optional wedges (Wild Card, Gift Tag, $600 instead of a Bankrupt, alternate values, Mystery, Express, sliver,
   $5, Free Play) are shown or hidden by the same named group items the VBA toggles. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var BASE = {   // band -> [colour, standard label]
    0: ['#111111', 'BANKRUPT'], 1: ['#F86808', '900'], 2: ['#2FB36E', '500'], 3: ['#F09898', '650'], 4: ['#A878D8', '500'],
    5: ['#F01010', '800'], 6: ['#F2F2E6', 'LOSE A TURN'], 7: ['#38B8F8', '700'], 8: ['#70F0F0', 'FREE PLAY'], 9: ['#A878D8', '650'],
    10: ['#111111', 'BANKRUPT'], 11: ['#F09898', '600'], 12: ['#2FB36E', '500'], 13: ['#38B8F8', '550'], 14: ['#F01010', '600'],
    15: ['#F09898', '500'], 16: ['#F8EE10', '700'], 17: ['#A878D8', '500'], 18: ['#F86808', '650'], 19: ['#38B8F8', '600'],
    20: ['#F01010', '700'], 21: ['#F8EE10', '900'], 22: ['#2FB36E', '500'], 23: ['#C9CCD3', '2500']
  };
  var CLASSIC = { 19: 1, 18: 2, 16: 3, 13: 4, 11: 5, 3: 6, 1: 7 };   // band -> ClassicWedge number
  var CLASSIC_VAL = { 19: '300', 18: '800', 16: '400', 13: '350', 11: '900', 3: '450', 1: '300' };

  function gi(screen, name) {
    var g = screen.querySelector('.grp[data-name="TheWheel"]');
    return g ? g.querySelector('[data-name="' + name + '"]') : null;
  }
  function shown(screen, name) { var e = gi(screen, name); return !!e && e.style.display !== 'none' && PPT.fillTransp(e) < 1; }

  function polar(cx, cy, r, deg) { var a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function wedgePath(cx, cy, r, a0, a1) {
    var p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1);
    return 'M' + cx + ' ' + cy + 'L' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + 'A' + r + ' ' + r + ' 0 0 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) + 'Z';
  }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* stacked dollar value along the radius: "$" at the rim, digits under it */
  function stackedValue(cx, cy, R, ang, txt, col, opts) {
    opts = opts || {};
    var chars = ['$'].concat(txt.split('')), out = '';
    var size = opts.size || (chars.length >= 5 ? 26 : 31), step = size * 0.86, r0 = R * (opts.start || 0.885);
    chars.forEach(function (ch, i) {
      var r = r0 - (i === 0 ? 0 : size * 0.62 + (i - 1) * step) - (i === 0 ? 0 : 0);
      var p = polar(cx, cy, r, ang);
      var fs = i === 0 ? size * 0.62 : size;
      out += '<text x="0" y="0" transform="translate(' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ') rotate(' + ang + ') scale(.8 1.06)" font-size="' + fs.toFixed(1) + '" fill="' + col + '" text-anchor="middle" dominant-baseline="central" class="wv">' + esc(ch) + '</text>';
    });
    return out;
  }
  /* a word laid along the radius, reading from the rim towards the hub */
  function radialWord(cx, cy, R, ang, txt, col, size, start, spacing) {
    var p = polar(cx, cy, R * (start || 0.62), ang);
    return '<text x="0" y="0" transform="translate(' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ') rotate(' + (ang + 90) + ')" font-size="' + size + '" fill="' + col + '" text-anchor="middle" dominant-baseline="central" class="ww" letter-spacing="' + (spacing || 0) + '">' + esc(txt) + '</text>';
  }

  function topValue(type) { return type === 6 ? '5000' : (type === 4 || type === 5) ? '3500' : '2500'; }
  function topColor(type) { return type === 6 ? '#C9CCD3' : (type === 4 || type === 5) ? '#E3268C' : '#3FB7F0'; }

  function build(screen) {
    var type = +screen.dataset.slide; if (type === 1) type = 3;
    var std = true;
    try { std = PPT.sh(10, 'WheelValues').Text === '$500-$900'; } catch (e) { }
    var R = 216, cx = 216, cy = 216, s = '', labels = '', extras = '';
    s += '<defs>' +
      '<radialGradient id="wsh" cx="50%" cy="50%" r="50%"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>' +
      '<linearGradient id="wsl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F5F8"/><stop offset=".5" stop-color="#A9ADB8"/><stop offset="1" stop-color="#E9EBF0"/></linearGradient>' +
      '<radialGradient id="wmy" cx="50%" cy="20%" r="90%"><stop offset="0" stop-color="#9C7BEA"/><stop offset="1" stop-color="#4A2A9C"/></radialGradient>' +
      '<linearGradient id="wmd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E9E55"/><stop offset=".5" stop-color="#0B6B36"/><stop offset="1" stop-color="#1E9E55"/></linearGradient>' +
      '<pattern id="wgl" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".8" fill="#fff" fill-opacity=".45"/><circle cx="4.5" cy="4" r=".6" fill="#fff" fill-opacity=".3"/></pattern>' +
      '</defs>';
    for (var b = 0; b < 24; b++) {
      var k = 23 - b, a0 = 15 * k - 7.5, a1 = a0 + 15, ang = a0 + 7.5;   // drawn 7.5 deg early: the picture box is rotated +7.5
      var col = BASE[b][0], label = BASE[b][1], kind = 'value', txtCol = '#111';
      if (b === 23) { col = topColor(type); label = topValue(type); }
      if (b === 0 && shown(screen, 'Purple600')) { col = '#A878D8'; label = '600'; }
      if (b === 8 && shown(screen, 'Yellow850')) { col = '#F8EE10'; label = '850'; }
      if (CLASSIC[b] && shown(screen, 'ClassicWedge' + CLASSIC[b])) label = CLASSIC_VAL[b];
      if (label === 'BANKRUPT') { kind = 'word'; txtCol = '#FFFFFF'; }
      if (label === 'LOSE A TURN' || label === 'FREE PLAY') { kind = 'word'; }
      if (b === 7 && type === 4 && shown(screen, 'MysteryWedge1')) kind = 'mystery';
      if (b === 19 && type === 4 && shown(screen, 'MysteryWedge2')) kind = 'mystery';
      if (b === 20 && type === 5) kind = 'express';
      if (b === 15 && shown(screen, '5000Sliver')) kind = 'sliver';
      if (b === 12 && shown(screen, 'MDWedge')) kind = 'mdw';
      if (b === 17 && screen.dataset.five === '1') label = '5';
      if (kind === 'mystery') col = 'url(#wmy)';
      if (kind === 'express') col = '#1E9BE8';
      s += '<path d="' + wedgePath(cx, cy, R, a0, a1) + '" fill="' + col + '" stroke="#2B2B2B" stroke-width="0.8"/>';
      if (b === 23) s += '<path d="' + wedgePath(cx, cy, R, a0, a1) + '" fill="url(#wgl)"/>';
      var lowered = (b === 22 && shown(screen, 'WildCard')) || (b === 4 && shown(screen, 'GiftTag'));
      if (kind === 'value') labels += stackedValue(cx, cy, R, ang, label, txtCol, lowered ? { size: 26, start: 0.66 } : label.length >= 4 ? { size: 25 } : null);
      else if (kind === 'word') {
        if (label === 'BANKRUPT') labels += radialWord(cx, cy, R, ang, 'BANKRUPT', '#FFF', 19, 0.64, 1);
        else if (label === 'LOSE A TURN') { labels += radialWord(cx, cy, R, ang + 3.6, 'LOSE A', '#111', 15, 0.7, 0.5) + radialWord(cx, cy, R, ang - 3.6, 'TURN', '#111', 15, 0.7, 0.5); }
        else labels += radialWord(cx, cy, R, ang + 3.6, 'FREE', '#111', 16, 0.74, 0.5) + radialWord(cx, cy, R, ang - 3.6, 'PLAY', '#111', 16, 0.74, 0.5);
      } else if (kind === 'mystery') {
        var q = polar(cx, cy, R * 0.86, ang);
        extras += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="15" fill="#3A1C86" stroke="#D8C8FF" stroke-width="2"/><text x="' + q[0] + '" y="' + q[1] + '" font-size="22" fill="#F5E66B" text-anchor="middle" dominant-baseline="central" class="wv">?</text>';
        labels += stackedValue(cx, cy, R, ang, '1000', '#F5E66B', { size: 22, start: 0.75 });
      } else if (kind === 'express') {
        labels += radialWord(cx, cy, R, ang + 3.4, 'EXPRESS', '#FFE600', 14, 0.73, 0.5) + stackedValue(cx, cy, R, ang - 3.6, '1000', '#FFE600', { size: 15, start: 0.92 });
      } else if (kind === 'mdw') {
        // Million Dollar Wedge: Bankrupt | ONE MILLION | Bankrupt (the middle third is rand 1850-1899)
        s += '<path d="' + wedgePath(cx, cy, R, a0, a0 + 5) + '" fill="#111"/><path d="' + wedgePath(cx, cy, R, a0 + 10, a1) + '" fill="#111"/>' +
          '<path d="' + wedgePath(cx, cy, R, a0 + 5, a0 + 10) + '" fill="url(#wmd)" stroke="#E7C04A" stroke-width="1"/>';
        labels += radialWord(cx, cy, R, a0 + 2.5, 'BANKRUPT', '#FFF', 8, 0.68, 0.3) + radialWord(cx, cy, R, a1 - 2.5, 'BANKRUPT', '#FFF', 8, 0.68, 0.3) +
          radialWord(cx, cy, R, ang, 'ONE MILLION', '#FFE27A', 9, 0.66, 0.4);
      } else if (kind === 'sliver') {
        // thirds: Bankrupt | $5,000 | Bankrupt  (the middle third is rand 2300-2349)
        s += '<path d="' + wedgePath(cx, cy, R, a0, a0 + 5) + '" fill="#111"/><path d="' + wedgePath(cx, cy, R, a0 + 10, a1) + '" fill="#111"/>' +
          '<path d="' + wedgePath(cx, cy, R, a0 + 5, a0 + 10) + '" fill="url(#wsl)"/>';
        labels += radialWord(cx, cy, R, a0 + 2.5, 'BANKRUPT', '#FFF', 8, 0.68, 0.3) + radialWord(cx, cy, R, a1 - 2.5, 'BANKRUPT', '#FFF', 8, 0.68, 0.3) +
          stackedValue(cx, cy, R, ang, '5000', '#111', { size: 13, start: 0.93 });
      }
    }
    // Wild Card on the $500 wedge in band 22, Gift Tag on the $500 wedge in band 4
    if (shown(screen, 'WildCard')) {
      var wa = 15 * (23 - 22), wp = polar(cx, cy, R * 0.84, wa);
      extras += '<g transform="translate(' + wp[0] + ' ' + wp[1] + ') rotate(' + wa + ')"><rect x="-13" y="-18" width="26" height="36" rx="4" fill="#E0228E" stroke="#7A0A45"/><rect x="-10" y="-15" width="20" height="30" rx="3" fill="none" stroke="#F7D7EA" stroke-width="1.2" stroke-dasharray="2 1.5"/><text x="0" y="1" font-size="10" fill="#A6E86A" text-anchor="middle" dominant-baseline="central" class="wv" transform="rotate(-24)">WILD</text></g>';
    }
    if (shown(screen, 'GiftTag')) {
      var ga = 15 * (23 - 4), gp = polar(cx, cy, R * 0.82, ga);
      extras += '<g transform="translate(' + gp[0] + ' ' + gp[1] + ') rotate(' + (ga + 90) + ')"><ellipse rx="25" ry="15" fill="#fff" stroke="#555" stroke-width="1.5"/><text x="0" y="1" font-size="13" fill="#111" font-family="Georgia,serif" font-weight="700" text-anchor="middle" dominant-baseline="central">GIFT</text></g>';
    }
    // pegs, hub and a soft rim shadow
    var pegs = '';
    for (var p = 0; p < 24; p++) { var pp = polar(cx, cy, R - 6, 15 * p - 7.5); pegs += '<circle cx="' + pp[0].toFixed(2) + '" cy="' + pp[1].toFixed(2) + '" r="3.2" fill="#F3E3A0" stroke="#7A6418" stroke-width="1"/>'; }
    var hub = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R * 0.325 + '" fill="#2E8B6E" stroke="#1C5E49" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R * 0.29 + '" fill="none" stroke="#5FBF9C" stroke-opacity=".5" stroke-width="2"/>';
    var svg = '<svg xmlns="' + NS + '" class="wheel-svg" width="432" height="432" viewBox="0 0 432 432">' + s +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#wsh)"/>' +
      '<g class="wlab">' + labels + '</g>' + extras + pegs + hub + '</svg>';
    return svg;
  }

  /* Bonus Wheel (web edition extra): 24 sealed envelopes */
  function buildBonus() {
    var R = 216, cx = 216, cy = 216, s = '', deco = '';
    var cols = ['#D4A017', '#B22222', '#1F6FB2', '#2E8B57', '#7B3FA0', '#E0701C'];
    s += '<defs><radialGradient id="wsh" cx="50%" cy="50%" r="50%"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient></defs>';
    for (var k = 0; k < 24; k++) {
      var a0 = 15 * k - 7.5, a1 = a0 + 15, ang = a0 + 7.5;
      s += '<path d="' + wedgePath(cx, cy, R, a0, a1) + '" fill="' + cols[k % cols.length] + '" stroke="#2B2B2B" stroke-width="0.8"/>';
      var p = polar(cx, cy, R * 0.72, ang);
      deco += '<g transform="translate(' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ') rotate(' + ang + ')">' +
        '<rect x="-15" y="-11" width="30" height="22" rx="2" fill="#FBF6E6" stroke="#6B5B2B" stroke-width="1"/>' +
        '<path d="M-15 -11 L0 2 L15 -11" fill="none" stroke="#6B5B2B" stroke-width="1"/>' +
        '<text x="0" y="7" font-size="7" text-anchor="middle" class="ww" fill="#6B5B2B">' + (k + 1) + '</text></g>';
    }
    var pegs = '';
    for (var q = 0; q < 24; q++) { var pp = polar(cx, cy, R - 6, 15 * q - 7.5); pegs += '<circle cx="' + pp[0].toFixed(2) + '" cy="' + pp[1].toFixed(2) + '" r="3.2" fill="#F3E3A0" stroke="#7A6418" stroke-width="1"/>'; }
    var hub = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R * 0.3 + '" fill="#C9772F" stroke="#7A4515" stroke-width="2"/>' +
      '<text x="' + cx + '" y="' + (cy + 2) + '" font-size="20" text-anchor="middle" dominant-baseline="central" class="ww" fill="#FFF5D6">BONUS</text>';
    return '<svg xmlns="' + NS + '" class="wheel-svg" width="432" height="432" viewBox="0 0 432 432">' + s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#wsh)"/>' + deco + pegs + hub + '</svg>';
  }

  function host(screen) {
    var g = screen.querySelector('.grp[data-name="TheWheel"]');
    if (!g) return null;
    var pic = Array.prototype.find.call(g.querySelectorAll('.shp'), function (e) { return e._o && e._o.art === 'pic'; });
    return pic;
  }
  function redraw(screen) {
    if (!screen) return;
    var h = host(screen); if (!h) return;
    var five = false;
    try { five = PPT.sh(10, '5Wedge').Text === 'on'; } catch (e) { }
    screen.dataset.five = five ? '1' : '0';
    var html = +screen.dataset.slide === 41 ? buildBonus() : build(screen), sfx = '_s' + screen.dataset.slide;
    // gradient/pattern ids must be unique across all slides in the page
    h.innerHTML = html.replace(/id="(w[a-z]+)"/g, 'id="$1' + sfx + '"').replace(/url\(#(w[a-z]+)\)/g, 'url(#$1' + sfx + ')');
  }

  function setup(slideObj) {
    var screen = slideObj.el;
    var g = screen.querySelector('.grp[data-name="TheWheel"]');
    if (!g) return;
    var o = g._o; g.style.transformOrigin = (o.x + o.w / 2) + 'px ' + (o.y + o.h / 2) + 'px';
    var five = g.querySelector('[data-name="5Wedge"]'); if (five) five.style.visibility = 'hidden';
    g._angle = 0;
    redraw(screen);
  }

  /* spin the wheel group to an absolute final angle (deg, clockwise), at least five full turns */
  function spin(screen, finalDeg, ms) {
    var g = screen.querySelector('.grp[data-name="TheWheel"]');
    var start = g._angle || 0, startMod = ((start % 360) + 360) % 360;
    var delta = 1800 + (((finalDeg - startMod) % 360) + 360) % 360;
    var end = start + delta, t0 = null;
    return new Promise(function (resolve) {
      function frame(ts) {
        if (t0 == null) t0 = ts;
        var t = Math.min(1, (ts - t0) / ms), e = 1 - (1 - t) * (1 - t);   // PowerPoint "decelerate 100%"
        var a = start + delta * e;
        g.style.transform = 'rotate(' + a + 'deg)';
        if (t < 1) requestAnimationFrame(frame); else { g._angle = end % 360; g.style.transform = 'rotate(' + g._angle + 'deg)'; resolve(); }
      }
      requestAnimationFrame(frame);
    });
  }
  function redrawAll() { [1, 3, 4, 5, 6].forEach(function (n) { if (App.exists(n)) redraw(App.slide(n).el); }); }

  window.WOFWheel = { setup: setup, redraw: redraw, redrawAll: redrawAll, spin: spin, BASE: BASE };
})();
