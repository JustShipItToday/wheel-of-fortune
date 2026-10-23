/* art.js — original vector drawings that stand in for the slideshow's bitmap pictures
   (player Wild Card / Gift Tag tokens, the title-screen game-name logo). The wheel itself is drawn in wheel.js. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function svgEl(w, h, inner) {
    var d = document.createElement('div');
    d.className = 'art';
    d.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    d.innerHTML = '<svg xmlns="' + NS + '" width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' + inner + '</svg>';
    return d;
  }

  /* pink card with a dotted inner frame and a slanted WILD */
  function wildCard(w, h) {
    var r = Math.min(w, h) * 0.12;
    return '<defs><radialGradient id="wcg" cx="40%" cy="35%" r="80%"><stop offset="0" stop-color="#FF4FB8"/><stop offset="1" stop-color="#C2126F"/></radialGradient></defs>' +
      '<rect x="0.5" y="0.5" width="' + (w - 1) + '" height="' + (h - 1) + '" rx="' + r + '" fill="url(#wcg)" stroke="#7A0A45" stroke-width="1"/>' +
      '<rect x="' + w * 0.1 + '" y="' + h * 0.08 + '" width="' + w * 0.8 + '" height="' + h * 0.84 + '" rx="' + r * 0.7 + '" fill="none" stroke="#F7D7EA" stroke-width="' + Math.max(1, w * 0.04) + '" stroke-dasharray="' + w * 0.06 + ' ' + w * 0.04 + '"/>' +
      '<text x="' + w / 2 + '" y="' + h * 0.6 + '" text-anchor="middle" font-family="Alfa Slab One,Georgia,serif" font-size="' + w * 0.36 + '" fill="#A6E86A" stroke="#3E6B12" stroke-width="' + w * 0.015 + '" transform="rotate(-24 ' + w / 2 + ' ' + h / 2 + ')">WILD</text>';
  }
  /* white oval tag with a confetti rim and GIFT lettering */
  function giftTag(w, h) {
    var dots = '', cols = ['#E53935', '#43A047', '#1E88E5', '#FDD835', '#8E24AA'];
    for (var i = 0; i < 28; i++) {
      var a = i / 28 * Math.PI * 2;
      dots += '<circle cx="' + (w / 2 + Math.cos(a) * w * 0.455) + '" cy="' + (h / 2 + Math.sin(a) * h * 0.43) + '" r="' + Math.max(0.6, w * 0.018) + '" fill="' + cols[i % 5] + '"/>';
    }
    return '<ellipse cx="' + w / 2 + '" cy="' + h / 2 + '" rx="' + (w / 2 - 0.5) + '" ry="' + (h / 2 - 0.5) + '" fill="#6B6B6B"/>' +
      '<ellipse cx="' + w / 2 + '" cy="' + h / 2 + '" rx="' + w * 0.48 + '" ry="' + h * 0.46 + '" fill="#FFFFFF"/>' + dots +
      '<text x="' + w / 2 + '" y="' + h * 0.66 + '" text-anchor="middle" font-family="Georgia,\'Times New Roman\',serif" font-weight="700" font-size="' + h * 0.5 + '" fill="#111">GIFT</text>';
  }
  /* title logo: the game name in chunky slab letters (two lines) */
  function logo(w, h) {
    return '<defs><linearGradient id="lgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE97A"/><stop offset=".55" stop-color="#F7B500"/><stop offset="1" stop-color="#D98200"/></linearGradient></defs>' +
      '<g font-family="Alfa Slab One,Georgia,serif" text-anchor="middle" fill="url(#lgg)" stroke="#5A1E00" stroke-width="3" paint-order="stroke" style="letter-spacing:1px">' +
      '<text x="' + w / 2 + '" y="' + h * 0.44 + '" font-size="' + h * 0.42 + '">WHEEL OF</text>' +
      '<text x="' + w / 2 + '" y="' + h * 0.93 + '" font-size="' + h * 0.42 + '">FORTUNE</text></g>';
  }

  function paint(el, o) {
    var inWheel = o.p && /^TheWheel#/.test(o.p);
    if (inWheel) { el.classList.add('wheel-item'); return; }      // wheel.js draws these
    var html = null;
    if (/WildCard$/.test(o.n)) html = wildCard(o.w, o.h);
    else if (/GiftTag$/.test(o.n)) html = giftTag(o.w, o.h);
    else if (/MDW$/.test(o.n)) html = '<rect x="0.5" y="0.5" width="' + (o.w - 1) + '" height="' + (o.h - 1) + '" rx="3" fill="#0B7A3E" stroke="#E7C04A" stroke-width="1.2"/><text x="' + o.w / 2 + '" y="' + (o.h * 0.72) + '" text-anchor="middle" font-family="Alfa Slab One,Georgia,serif" font-size="' + o.h * 0.62 + '" fill="#FFE27A">1M</text>';
    else if (o.n === 'WheelofFortuneLogo') html = logo(o.w, o.h);
    if (html) { el.appendChild(svgEl(o.w, o.h, html)); refresh(el); }
  }
  function refresh(el) {
    var o = el._o;
    if (o && o.p && /^TheWheel#/.test(o.p)) { if (window.WOFWheel) WOFWheel.redraw(el.closest('.screen')); return; }
    var a = el.querySelector(':scope > .art');
    if (a && o.art === 'blip') a.style.opacity = PPT.fillTransp(el) >= 1 ? '0' : '1';
    el.style.opacity = '';
  }
  window.WOFArt = { paint: paint, refresh: refresh };
})();
