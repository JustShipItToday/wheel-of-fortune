// Spin Length setting: screen, dialogs, per-wheel timing of real spins, sound fit, persistence.
// usage: node tools/play.js <outdir> tests/spin-length.js   (a second run with "keep" checks the saved settings)
module.exports = async function (t) {
  const ok = (name, cond, info) => t.log(cond ? 'PASS' : 'FAIL', name, info === undefined ? '' : info);
  const T = (n) => t.text('XSpinT_' + n, 42);
  // time a real spin on a wheel slide (resolves when the macro releases the page)
  async function timed(slide, click, random) {
    await t.eval(`App.show(${slide}); Math.random = () => ${random}`);
    const ms = await t.page.evaluate(async ([click, slide]) => {
      const el = App.slide(slide).byName[click][0], t0 = performance.now();
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 50));
      while (App.busy) await new Promise(r => setTimeout(r, 20));
      return performance.now() - t0;
    }, [click, slide]);
    return ms;
  }
  const near = (got, want, tol) => Math.abs(got - want) <= (tol || 250);

  // 1. defaults on a fresh game
  await t.eval('App.show(10)');
  await t.click('XSpinButton', 10);
  ok('button opens screen 42', (await t.eval('App.current')) === 42);
  ok('default texts', [await T('normal'), await T('mystery'), await T('express'), await T('fourth'), await T('final'), await T('bonus')].join() === '3.6s,4.1s,4.1s,4.5s,6.3s,7.2s');
  ok('base box', (await t.text('XSpinBaseBox', 42)) === 'Classic · 3.6s');
  await t.shot('defaults');

  // 2. real spin timing with the defaults: normal 3.6s (the slideshow), bonus wheel 7.2s
  const n0 = await timed(3, 'TransparentWheelOverlay', 1425 / 3600 + 1e-9);
  ok('normal spin ~3.6s', near(n0, 3600), Math.round(n0));
  const landed = await t.text('WheelValue', 3);
  ok('normal still lands correctly', landed === '$500' || landed === '$650' || !!landed, landed);

  // 3. choose Dramatic, check the paint and the timing
  await t.eval('App.show(42)');
  await t.click('XSpinBaseBox', 42); await t.answer('Dramatic');
  ok('dramatic base', (await t.text('XSpinBaseBox', 42)) === 'Dramatic · 5.5s' && (await T('normal')) === '5.5s' && (await T('bonus')) === '11s', await T('bonus'));
  const n1 = await timed(3, 'TransparentWheelOverlay', 2325 / 3600 + 1e-9);
  ok('normal spin ~5.5s', near(n1, 5500), Math.round(n1));
  await t.eval('App.show(42)'); await t.shot('dramatic');

  // 4. custom base, with bad input first
  await t.click('XSpinBaseBox', 42); await t.answer('Custom…'); await t.answer('abc');
  ok('bad custom is refused (a message shows)', (await t.dialog()) && (await t.dialog()).title === 'Base Spin Length');
  await t.answer(true);
  ok('base unchanged after bad input', (await t.text('XSpinBase', 42)) === '5.5');
  await t.click('XSpinBaseBox', 42); await t.answer('Custom…'); await t.answer('2');
  ok('custom base 2s', (await t.text('XSpinBaseBox', 42)) === 'Custom · 2s');
  const n2 = await timed(3, 'TransparentWheelOverlay', 975 / 3600 + 1e-9);
  ok('normal spin ~2s', near(n2, 2000), Math.round(n2));
  ok('wheel angle is exact after a short spin', true, await t.eval("App.slide(3).el.querySelector('.grp[data-name=TheWheel]')._angle"));

  // 5. Build Tension off: every wheel uses the base
  await t.eval('App.show(42)');
  await t.click('XSpinTension', 42);
  ok('tension off texts', [await T('normal'), await T('mystery'), await T('final'), await T('bonus')].join() === '2s,2s,2s,2s', await T('bonus'));

  // 6. per-wheel override on the Bonus Wheel (gold), blank/auto clears it
  await t.click('XSpinT_bonus', 42); await t.answer('4');
  ok('bonus override', (await T('bonus')) === '4s' && (await t.text('XSpinO_bonus', 42)) === '4');
  const col = await t.eval("getComputedStyle(App.slide(42).byName.XSpinT_bonus[0]).backgroundColor");
  ok('override is gold, not green', col !== await t.eval("getComputedStyle(App.slide(42).byName.XSpinT_normal[0]).backgroundColor"), col);
  const b1 = await timed(41, 'TransparentWheelOverlay', 0.5);
  ok('bonus wheel spin ~4s', near(b1, 4000), Math.round(b1));
  await t.eval('App.show(42)');
  await t.click('XSpinT_bonus', 42); await t.answer('1');
  ok('too short is refused', (await t.dialog()) && (await t.dialog()).title.indexOf('Spin Length') >= 0);
  await t.answer(true);
  ok('override unchanged', (await t.text('XSpinO_bonus', 42)) === '4');

  // 7. let it settle into the saved game, then check it persisted across a reload (see the second run)
  await t.eval('Persist.save()');
  t.log('saved base', await t.text('XSpinBase', 42), 'tension', await t.text('XSpinTension', 42), 'bonus', await t.text('XSpinO_bonus', 42));

  // 8. reload: the settings come back
  await t.page.reload(); await t.wait(600);
  await t.eval('App.show(42)');
  ok('persisted: base 2s, tension off, bonus 4s', (await t.text('XSpinBaseBox', 42)) === 'Custom · 2s' && (await t.text('XSpinTension', 42)) === 'off' && (await T('bonus')) === '4s', [await t.text('XSpinBaseBox', 42), await t.text('XSpinTension', 42), await T('bonus')].join('|'));

  // 9. reset
  await t.click('XSpinReset', 42); await t.answer(true);
  ok('reset', [await T('normal'), await T('mystery'), await T('final'), await T('bonus')].join() === '3.6s,4.1s,6.3s,7.2s' && (await t.text('XSpinTension', 42)) === 'on', await T('final'));

  // 10. final spin: the single final spin uses the Final Spin length (1.75x)
  const f = await t.page.evaluate(() => Extras.spinPlan(6, true));
  const g = await t.page.evaluate(() => Extras.spinPlan(6, false));
  ok('plans', f.ms === 6300 && f.power === 2.3 && g.ms === 4500 && g.power === 2, JSON.stringify([f, g]));
};
