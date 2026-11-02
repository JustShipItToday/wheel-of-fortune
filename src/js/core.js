/* core.js — game rules, ported from Games by Tim's VBA (Module1/Module2). No DOM access here so it can be unit-tested. */
(function (root) {
  'use strict';

  var GREEN = '#189A50', WHITE = '#FFFFFF', BLUE = '#0000FF';

  /* ---------- number helpers ---------- */
  function fmt(n) { n = Math.round(Number(n) || 0); var neg = n < 0; var s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '-' : '') + s; }
  function money(n) { return '$' + fmt(n); }
  /* VBA-ish IsNumeric/CLng: accepts "1,000", "$500", "-20", "+5" */
  function parseNum(s) {
    if (typeof s === 'number') return isFinite(s) ? Math.round(s) : null;
    s = String(s == null ? '' : s).trim();
    if (!s) return null;
    var t = s.replace(/[$,\s]/g, '');
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
    return Math.round(parseFloat(t));
  }

  /* ---------- letters (slide-9 hidden tables in the PPT) ---------- */
  var CH = {
    extended: 'ÁÀÂÄÃÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜ',
    A: 'AÁÀÂÄÃ', C: 'CÇ', E: 'EÉÈÊË', I: 'IÍÌÎÏ', O: 'OÓÒÔÖÕ', U: 'UÚÙÛÜ',
    vowels: 'AÁÀÂÄÃEÉÈÊËIÍÌÎÏOÓÒÔÖÕUÚÙÛÜ'
  };
  function isLetter(s) {
    if (!s) return false;
    var c = s.charAt(0), code = c.charCodeAt(0);
    return (code >= 65 && code <= 90) || CH.extended.indexOf(c) >= 0;
  }
  function isVowel(s) { return !!s && CH.vowels.indexOf(s.charAt(0)) >= 0; }
  function lettersMatch(tile, sel) {
    var set = (sel === 'A' || sel === 'C' || sel === 'E' || sel === 'I' || sel === 'O' || sel === 'U') ? CH[sel] : sel;
    return !!tile && set.indexOf(tile) >= 0;
  }
  function selLetter(i) { return i === 27 ? 'Ñ' : String.fromCharCode(64 + i); }
  var VOWEL_SEL = [1, 5, 9, 15, 21];
  var CONS_SEL = [2, 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27];

  /* ---------- the wheel (Module2.youLandedOn) ---------- */
  /* wheelType = slide number: 3 Normal, 4 Mystery, 5 Express, 6 Fourth.
     cfg: {bankrupts:{3,4,5,6}, values:'$500-$900'|'$300-$900', freePlay:'on'|'off', sliver:bool, five:bool, m1flip:bool, m2flip:bool} */
  function landing(r, type, cfg) {
    var std = cfg.values === '$500-$900';
    var b = Math.floor(r / 150);
    switch (b) {
      case 0: return cfg.bankrupts[type] === 1 ? '$600' : 'Bankrupt';
      case 1: return std ? '$900' : '$300';
      case 2: return '$500';
      case 3: return std ? '$650' : '$450';
      case 4: return '$500';
      case 5: return '$800';
      case 6: return 'Lose a Turn';
      case 7: return (type === 4 && !cfg.m1flip) ? 'Mystery 1' : '$700';
      case 8: return cfg.freePlay === 'on' ? 'Free Play' : '$850';
      case 9: return '$650';
      case 10: return 'Bankrupt';
      case 11: return std ? '$600' : '$900';
      case 12: return '$500';
      case 13: return std ? '$550' : '$350';
      case 14: return '$600';
      case 15: // the $5,000 sliver is three 50-unit bands
        if (!cfg.sliver) return '$500';
        return (r >= 2300 && r <= 2349) ? '$5,000' : 'Bankrupt';
      case 16: return std ? '$700' : '$400';
      case 17: return cfg.five ? '$5' : '$500';
      case 18: return std ? '$650' : '$800';
      case 19:
        if (type === 4 && !cfg.m2flip) return 'Mystery 2';
        return std ? '$600' : '$300';
      case 20: return type === 5 ? 'Express' : '$700';
      case 21: return '$900';
      case 22: return '$500';
      default: return type === 3 ? '$2,500' : (type === 4 || type === 5) ? '$3,500' : '$5,000';
    }
  }
  /* value the Value Panel receives from a wheel result (Module1.randomSpin) */
  function spunFromWheel(txt) {
    var n = parseNum(txt.replace('$', ''));
    if (txt.charAt(0) === '$' && n != null) return String(n);
    if (txt === 'Mystery 1' || txt === 'Mystery 2' || txt === 'Express') return '1000';
    if (txt === 'Free Play') return '500';
    return '';
  }

  /* ---------- spin length (web edition extra) ----------
     The slideshow spins the wheel for a fixed 3.6 s. Here the host sets a base length, and with "Build Tension" on the
     high-stakes wheels spin longer than a regular round. Any wheel can also be given its own length. */
  var SPIN = {
    DEFAULT_BASE: 3.6,      // seconds: the slideshow's own spin
    MIN: 1.5, MAX: 30,      // limits for any single wheel
    BASE_MAX: 15,           // limit for the base length
    PRESETS: [['Quick', 2.5], ['Classic', 3.6], ['Dramatic', 5.5], ['Nail-Biter', 8]],
    KEYS: ['normal', 'mystery', 'express', 'fourth', 'final', 'bonus'],
    LABELS: { normal: 'Normal Round', mystery: 'Mystery Round', express: 'Express Round', fourth: 'Fourth Round', final: 'Final Spin', bonus: 'Bonus Wheel' },
    FACTOR: { normal: 1, mystery: 1.15, express: 1.15, fourth: 1.25, final: 1.75, bonus: 2 }   // Build Tension multipliers
  };
  /* which wheel a spin is: slide 3 Normal, 4 Mystery, 5 Express, 6 Fourth, 41 Bonus Wheel; finalSpin = the single Final Spin turn */
  function spinKey(slide, finalSpin) {
    if (slide === 41) return 'bonus';
    if (finalSpin) return 'final';
    return slide === 4 ? 'mystery' : slide === 5 ? 'express' : slide === 6 ? 'fourth' : 'normal';
  }
  /* "4", "4.5", "4,5", "4.5s", "4 seconds" -> seconds to a tenth, or null if unreadable or outside lo..hi */
  function parseSeconds(text, lo, hi) {
    var m = /^\s*(\d+(?:[.,]\d+)?)\s*(?:s|sec|secs|second|seconds)?\s*$/i.exec(String(text == null ? '' : text));
    if (!m) return null;
    var v = Math.round(parseFloat(m[1].replace(',', '.')) * 10) / 10;
    return (v >= lo && v <= hi) ? v : null;
  }
  /* cfg: {base: seconds, tension: bool, over: {key: seconds | null}} -> how long that wheel spins, in seconds */
  function spinSeconds(key, cfg) {
    var o = cfg.over && cfg.over[key], v;
    if (o > 0) v = o;
    else v = (cfg.base > 0 ? cfg.base : SPIN.DEFAULT_BASE) * (cfg.tension ? (SPIN.FACTOR[key] || 1) : 1);
    return Math.max(SPIN.MIN, Math.min(SPIN.MAX, Math.round(v * 10) / 10));
  }
  /* deceleration exponent (2 = the slideshow's "decelerate"): the two biggest moments crawl to a stop for longer */
  function spinPower(key, tension) { return tension && (key === 'final' || key === 'bonus') ? 2.3 : 2; }
  function spinPresetName(base) {
    for (var i = 0; i < SPIN.PRESETS.length; i++) if (Math.abs(SPIN.PRESETS[i][1] - base) < 0.001) return SPIN.PRESETS[i][0];
    return '';
  }
  function fmtSeconds(n) { return (Math.round(n * 10) / 10) + 's'; }

  /* ---------- puzzle helpers ---------- */
  var ROW_START = [1, 13, 27, 41], ROW_END = [12, 26, 40, 52];
  function emptyPuzzle() { var c = []; for (var i = 0; i < 52; i++) c.push(''); return { c: c, cat: '' }; }
  function puzzleOccupied(p) { if (!p) return false; if (p.cat) return true; for (var i = 0; i < 52; i++) if (p.c[i]) return true; return false; }
  var EXAMPLE = '               WHEEL OF      FORTUNE                ';

  /* Puzzle Scribe: "wheel of \ fortune" -> 52 cells. returns {cells} or {error:row} (row 5 = too many rows) */
  function scribe(text) {
    var parts = String(text).replace(/\|/g, '\\').split('\\');
    var n = parts.length, lens = [-2, -2, -2, -2]; // -1 = row unused
    var i, L;
    if (n <= 2) {
      lens[0] = -1;
      for (i = 0; i < n; i++) { L = parts[i].trim().length; if (L > 14) return { error: i + 1 }; lens[i + 1] = L; }
      lens[3] = -1;
    } else if (n === 3) {
      var ptr = 0;
      for (i = 0; i < n; i++) {
        L = parts[i].trim().length;
        if (L > 14) return { error: i + 1 };
        else if (L > 12) {
          if (ptr === 0) { lens[0] = -1; ptr = 1; }
          else if (ptr === 3) return { error: i + 1 };
          lens[ptr] = L;
        } else {
          if (ptr === 0) lens[3] = -1;
          lens[ptr] = L;
        }
        ptr++;
      }
    } else if (n === 4) {
      for (i = 0; i < n; i++) {
        L = parts[i].trim().length;
        if (L > 14) return { error: i + 1 };
        if (L > 12 && (i === 0 || i === 3)) return { error: i + 1 };
        lens[i] = L;
      }
    } else return { error: 5 };
    var maxLen = 0;
    for (i = 0; i < 4; i++) if (lens[i] > maxLen) maxLen = lens[i];
    var cells = []; for (i = 0; i < 52; i++) cells.push('');
    var processed = 0;
    for (var r = 0; r < 4; r++) {
      if (lens[r] > -1) {
        var half = Math.round(maxLen / 2 + 0.0001), start;
        // VBA CInt rounds half to even: replicate
        half = bankers(maxLen / 2 + 0.0001);
        if (r === 0) { start = 7 - half; if (start < 1) start = 1; }
        else if (r === 1) start = 20 - half;
        else if (r === 2) start = 34 - half;
        else { start = 47 - half; if (start < 41) start = 41; }
        var row = parts[processed].trim();
        for (var p = 0; p < row.length; p++) {
          var ch = row.charAt(p);
          if (ch !== ' ') cells[start + p - 1] = ch.toUpperCase();
        }
        processed++;
      }
    }
    return { cells: cells };
  }
  function bankers(x) { var f = Math.floor(x), d = x - f; if (d < 0.5) return f; if (d > 0.5) return f + 1; return f % 2 === 0 ? f : f + 1; }

  function properties(cells) {
    var total = 0, vowels = 0, rst = 0, uc = {}, uv = {};
    cells.forEach(function (ch) {
      if (!isLetter(ch)) return;
      var cv = ch;
      ['A', 'C', 'E', 'I', 'O', 'U'].forEach(function (k) { if (CH[k].indexOf(ch) >= 0) cv = k; });
      if (isVowel(cv)) { uv[cv] = 1; vowels++; } else uc[cv] = 1;
      if ('RSTLNE'.indexOf(cv) >= 0) rst++;
      total++;
    });
    var ratio = (rst === 0 && total === 0) ? 0 : bankers((rst / total) * 100 + 0.00000001);
    return { total: total, consonants: total - vowels, vowels: vowels, uniqueConsonants: Object.keys(uc).length, uniqueVowels: Object.keys(uv).length, uniqueTotal: Object.keys(uc).length + Object.keys(uv).length, rstlneRatio: ratio };
  }

  var CATEGORIES = ['AROUND THE HOUSE', 'BEFORE & AFTER', 'CHARACTER', 'CLASSIC TV', 'COLLEGE LIFE', 'EVENT', 'FUN & GAMES', 'FOOD & DRINK', 'HEADLINE', 'HUSBAND & WIFE', 'IN THE KITCHEN', 'LANDMARK', 'LIVING THING', 'LIVING THINGS', 'MOVIE QUOTE', 'TV QUOTE', 'OCCUPATION', 'ON THE MAP', 'PERSON', 'PEOPLE', 'PHRASE', 'PLACE', 'PLACES', 'PROPER NAME', 'QUOTATION', 'RHYME TIME', 'SAME LETTER', 'SAME NAME', 'SHOW BIZ', 'SONG/ARTIST', 'SONG LYRICS', 'STAR & ROLE', 'THING', 'THINGS', 'MOVIE TITLE', 'TV TITLE', 'TITLE/AUTHOR', 'WHAT ARE YOU DOING?', 'WHAT ARE YOU WEARING?'];

  root.WOFCore = {
    GREEN: GREEN, WHITE: WHITE, BLUE: BLUE, fmt: fmt, money: money, parseNum: parseNum, CH: CH,
    isLetter: isLetter, isVowel: isVowel, lettersMatch: lettersMatch, selLetter: selLetter, VOWEL_SEL: VOWEL_SEL, CONS_SEL: CONS_SEL,
    SPIN: SPIN, spinKey: spinKey, parseSeconds: parseSeconds, spinSeconds: spinSeconds, spinPower: spinPower, spinPresetName: spinPresetName, fmtSeconds: fmtSeconds,
    landing: landing, spunFromWheel: spunFromWheel, EXAMPLE: EXAMPLE, ROW_START: ROW_START, ROW_END: ROW_END,
    emptyPuzzle: emptyPuzzle, puzzleOccupied: puzzleOccupied, scribe: scribe, properties: properties, CATEGORIES: CATEGORIES, bankers: bankers
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.WOFCore;
})(typeof window !== 'undefined' ? window : globalThis);
