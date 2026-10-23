/* anim.js — the slideshow's click-triggered animations ("interactive sequences"), rebuilt with the Web Animations API:
   button wiggles and spins, the swaying light pillars, the board glare sweep, the title-screen wheel,
   and the two timers that PowerPoint drove with animation timelines (shot clock, Bonus Round countdown). */
(function () {
  'use strict';
  function sh(n, name) { try { return PPT.sh(n, name).el; } catch (e) { return null; } }
  function baseT(el) { return el.style.transform || ''; }
  function origin(el) {
    if (el.classList.contains('grp')) { var o = el._o; el.style.transformOrigin = (o.x + o.w / 2) + 'px ' + (o.y + o.h / 2) + 'px'; }
  }
  function anim(el, frames, ms, opts) {
    if (!el || !el.animate) return null;
    origin(el);
    var b = baseT(el);
    return el.animate(frames.map(function (f) { var c = Object.assign({}, f); if (f.transform != null) c.transform = (b + ' ' + f.transform).trim(); return c; }), Object.assign({ duration: ms }, opts || {}));
  }
  var FX = {
    teeter: function (el) { anim(el, [{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-5px) rotate(25deg)', offset: 0.25 }, { transform: 'translateY(-10px) rotate(0)', offset: 0.5 }, { transform: 'translateY(-5px) rotate(-25deg)', offset: 0.75 }, { transform: 'translateY(0) rotate(0)' }], 500); },
    wiggle: function (el) { anim(el, [{ transform: 'rotate(0)' }, { transform: 'rotate(2deg)', offset: 0.11 }, { transform: 'rotate(-2deg)', offset: 0.33 }, { transform: 'rotate(2deg)', offset: 0.56 }, { transform: 'rotate(-2deg)', offset: 0.78 }, { transform: 'rotate(0)' }], 675); },
    flash: function (el, ms) { anim(el, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.6)' }, { filter: 'brightness(1)' }], ms || 500); },
    spin: function (el, deg, ms) { anim(el, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + deg + 'deg)' }], ms, { easing: 'ease-in-out' }); },
    squeeze: function (el, ms) { anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(.9)' }, { transform: 'scale(1)' }], ms * 2); },
    tilt: function (el, deg, ms) { anim(el, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + deg + 'deg)' }, { transform: 'rotate(0deg)' }], ms * 2); }
  };

  var sway = null;
  function lights(on) {
    var L = sh(2, 'LeftLights'), R = sh(2, 'RightLights');
    if (sway) { sway.forEach(function (a) { a && a.cancel(); }); sway = null; if (!on) return; }
    if (on === false) return;
    sway = [anim(L, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(12deg)' }], 500, { iterations: Infinity, direction: 'alternate' }),
      anim(R, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' }], 500, { iterations: Infinity, direction: 'alternate', delay: 200 })];
  }
  function sweep() {
    var p = sh(2, 'Parallelogram 2'); if (!p) return;
    anim(p, [{ transform: 'translateX(0)' }, { transform: 'translateX(' + (1.29566 * 960) + 'px)' }], 1000, { easing: 'ease-in-out' });
  }

  /* triggers: slide -> clicked shape name -> effect */
  var T = {
    2: function (name) {
      var m;
      if ((m = /^Player(\d)TransferTotalsButton$/.exec(name))) FX.spin(sh(2, name), -360, 750);
      else if ((m = /^Player(\d)BuyVowelButton$/.exec(name))) FX.squeeze(sh(2, name), m[1] === '4' ? 50 : 100);
      else if ((m = /^Player(\d)RoundScoreCompatibility$/.exec(name))) FX.teeter(sh(2, 'Player' + m[1] + 'RoundDollarSign'));
      else if ((m = /^Player(\d)XButtonCompatibility$/.exec(name))) FX.teeter(sh(2, 'Player' + m[1] + 'XButton'));
      else if (name === 'ClearBoardButton') sweep();
      else if (name === 'LeftLights') lights(!sway);
      else if (name === 'ShotClockOverlay') ShotClock.click();
      else if (name === 'BonusTimerOverlay') BonusTimer.click();
    },
    4: function (name) {
      if (name === 'Rectangle 7') FX.teeter(sh(4, 'Rectangle 26'));
      else if (name === 'Oval 39' || name === 'TextBox 42') FX.wiggle(sh(4, 'Group 40'));
    },
    8: function (name) {
      if (/^Eraser\d$/.test(name)) FX.wiggle(sh(8, name));
      else if (/^Shift(Right|Left)\d$|^ShiftUp$|^ShiftDown$/.test(name)) FX.flash(sh(8, name), name.indexOf('Right') > 0 ? 250 : 500);
      else if (name === 'Rectangle 92') { FX.tilt(sh(8, 'Group 2'), -15, 250); FX.tilt(sh(8, 'Group 4'), 15, 250); FX.flash(sh(8, 'Rectangle 82'), 500); }
      else if (name === 'PencilClickable') { FX.wiggle(sh(8, 'Pencil')); FX.flash(sh(8, 'PencilButton'), 500); }
    }
  };
  function trigger(slideId, el) {
    var f = T[slideId]; if (!f || !el) return;
    var name = el.dataset.name;
    var grp = el.closest('.grp');
    if (grp && grp.dataset.name === 'LeftLights') name = 'LeftLights';
    f(name);
  }

  /* ---- shot clock: click the clock to count down from the configured seconds; click again to reset ---- */
  var ShotClock = {
    timer: null, left: 0,
    click: function () { if (this.timer != null || this.running) this.reset(); else this.start(); },
    start: function () {
      var n = parseInt(PPT.sh(2, 'ShotClockBaseNumber').Text, 10); if (!(n > 0)) return;
      var self = this, base = PPT.sh(2, 'ShotClockBase');
      base.el.style.visibility = 'visible';
      this.running = true; this.left = n;
      var tick = function () {
        if (!self.running) return;
        self.left--;
        for (var i = 0; i < 30; i++) { var e = sh(2, 'ShotClock' + i); if (e) e.style.visibility = 'hidden'; }
        var cur = sh(2, 'ShotClock' + self.left); if (cur) cur.style.visibility = 'visible';
        if (self.left <= 0) { self.timer = null; if (window.Extras) Extras.onShotClockExpired(); return; }
        self.timer = setTimeout(tick, 1000);
      };
      this.timer = setTimeout(tick, 1000);
    },
    reset: function () {
      clearTimeout(this.timer); this.timer = null; this.running = false;
      for (var i = 0; i < 30; i++) { var e = sh(2, 'ShotClock' + i); if (e) e.style.visibility = 'hidden'; }
      var b = sh(2, 'ShotClockBase'); if (b) b.style.visibility = 'hidden';
    },
    init: function () {
      // entrance-animated shapes start invisible (PowerPoint hides them until their effect plays)
      this.reset();
    }
  };

  /* ---- Bonus Round countdown: 10 seconds, the frame flashes at zero; a second click resets ---- */
  var BonusTimer = {
    timers: [], running: false,
    click: function () { /* the macro (startBonusCountdownMusic) calls start/reset */ },
    start: function () {
      var self = this; this.reset(); this.running = true;
      var ring = sh(2, 'BonusTimerCountdown'), blk = sh(2, 'RoundBlocker');
      if (ring) { ring.style.visibility = 'visible'; if (ring.animate) self.ringAnim = ring.animate([{ clipPath: 'polygon(50% 50%, 50% 0, 50% 0, 50% 0, 50% 0, 50% 0, 50% 0)' }, { clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0)' }], { duration: 10000, fill: 'forwards' }); }
      if (blk) blk.style.visibility = 'visible';
      for (var s = 9; s >= 0; s--) (function (k) {
        self.timers.push(setTimeout(function () { var e = sh(2, 'Bonus' + k); if (e) e.style.visibility = 'visible'; }, (10 - k) * 1000));
      })(s);
      this.timers.push(setTimeout(function () {
        ['BoardFrameOuterBlue', 'BoardFrameOuterGold', 'BoardFrameOuterSilver'].forEach(function (n) { var e = sh(2, n); if (e && e.animate) e.animate([{ filter: 'none' }, { filter: 'brightness(2.2) saturate(.2)' }, { filter: 'none' }], 600); });
      }, 10000));
    },
    reset: function () {
      this.timers.forEach(clearTimeout); this.timers = []; this.running = false;
      if (this.ringAnim) { this.ringAnim.cancel(); this.ringAnim = null; }
      for (var k = 0; k <= 9; k++) { var e = sh(2, 'Bonus' + k); if (e) e.style.visibility = 'hidden'; }
      ['BonusTimerCountdown', 'RoundBlocker'].forEach(function (n) { var e = sh(2, n); if (e) e.style.visibility = 'hidden'; });
    }
  };

  function setupSlide2(s) {
    var L = s.byName.LeftLights && s.byName.LeftLights[0];
    if (L) Array.prototype.forEach.call(L.querySelectorAll('.shp'), function (c) { c.classList.add('click'); c.dataset.trig = '1'; });
    if (s.byName.ShotClockOverlay) { var so = s.byName.ShotClockOverlay[0]; so.classList.add('click'); so.dataset.trig = '1'; }
    var p = s.byName['Parallelogram 2']; if (p) p[0].style.zIndex = '';
    ShotClock.init(); BonusTimer.reset();
  }
  function setupSlide1(s) {
    var w = s.byName.TheWheel && s.byName.TheWheel[0];
    if (w && w.animate) { origin(w); w.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 15000, iterations: Infinity }); }
  }
  function setupSlide4(s) { ['Oval 39', 'TextBox 42'].forEach(function (n) { var e = s.byName[n]; if (e) e[0].classList.add('click'); }); }

  window.WOFAnim = { trigger: trigger, setupSlide1: setupSlide1, setupSlide2: setupSlide2, setupSlide4: setupSlide4, lights: lights };
  window.ShotClock = ShotClock;
  window.BonusTimer = BonusTimer;
})();
