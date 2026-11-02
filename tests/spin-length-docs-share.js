// Spin Length in the Help, the .md docs and the share link.   usage: node tools/play.js <outdir> tests/spin-length-docs-share.js
const fs = require('fs'), path = require('path');
module.exports = async function (t) {
  const ok = (name, cond, info) => t.log(cond ? 'PASS' : 'FAIL', name, info === undefined ? '' : info);
  const root = path.join(__dirname, '..');

  // ---- Help ----
  await t.eval("WOFHelp.open('spinlength')"); await t.wait(250);
  const title = await t.eval("document.querySelector('.x-help .xh-body').innerText");
  ok('help topic opens with its content', /Spin Length/.test(title) && /Build Tension/.test(title) && /Nail-Biter/.test(title) && /Share Game link/.test(title));
  ok('help topic is listed in the sidebar', await t.eval("[...document.querySelectorAll('.xh-item')].some(b => b.dataset.topic === 'spinlength')"));
  // search finds it
  await t.eval("var s=document.querySelector('.xh-search'); s.value='nail'; s.dispatchEvent(new Event('input'))"); await t.wait(150);
  ok('help search for "nail" finds it', await t.eval("[...document.querySelectorAll('.xh-item')].some(b => b.dataset.topic === 'spinlength')"));
  await t.eval("var s=document.querySelector('.xh-search'); s.value=''; s.dispatchEvent(new Event('input'))");
  // other topics link to it, and the link works
  for (const id of ['normal', 'mystery', 'express', 'finalspin', 'bonuswheel', 'shotclock']) {
    await t.eval(`WOFHelp.open('${id}')`); await t.wait(120);
    const linked = await t.eval("!!document.querySelector('.x-help .xh-body [data-topic=spinlength]')");
    ok('help "' + id + '" links to Spin Length', linked);
  }
  await t.eval("document.querySelector('.x-help .xh-body [data-topic=spinlength]').click()"); await t.wait(120);
  ok('clicking the related link opens it', /Build Tension/.test(await t.eval("document.querySelector('.x-help .xh-body').innerText")));
  await t.shot('help');
  await t.eval("document.querySelector('.xh-close').click()");

  // ---- the .md files ----
  const need = { 'README.md': /Spin Length/, 'MODES.md': /Spin length:/, 'docs/MODES.md': /Spin length:/, 'docs/FEATURES.md': /### Spin Length/, 'docs/SETTINGS.md': /## Spin Length[\s\S]*Build Tension/, 'docs/FAQ.md': /longer \(or shorter\)/, 'docs/HOW-TO-USE.md': /Spin Length/ };
  Object.keys(need).forEach(f => ok('docs: ' + f, need[f].test(fs.readFileSync(path.join(root, f), 'utf8'))));
  const md = fs.readFileSync(path.join(root, 'docs/SETTINGS.md'), 'utf8');
  ok('docs numbers match the code', ['3.6s', '4.1s', '4.5s', '6.3s', '7.2s'].every(x => md.indexOf(x) >= 0) && (await t.eval("['normal','mystery','fourth','final','bonus'].map(k => WOFCore.spinSeconds(k, {base:3.6,tension:true,over:{}})).join()")) === '3.6,4.1,4.5,6.3,7.2');
  ok('anchors exist', /^## Spin Length/m.test(md));

  // ---- share link round trip: a different browser profile opens the link ----
  await t.eval('App.show(42)');
  await t.click('XSpinBaseBox', 42); await t.answer('Nail-Biter');
  await t.click('XSpinTension', 42);
  await t.click('XSpinT_final', 42); await t.answer('9');
  ok('sender settings', (await t.text('XSpinBaseBox', 42)) === 'Nail-Biter · 8s' && (await t.text('XSpinTension', 42)) === 'off');
  // the share window says it is included
  await t.eval('App.show(9)'); await t.click('XShareButton', 9); await t.wait(200);
  const dlg = await t.dialog();
  ok('share window mentions spin lengths', dlg && /spin lengths/i.test(await t.eval("document.querySelector('#dlg').innerText")));
  await t.answer('Cancel');
  const link = await t.eval('Share.makeLink({ scores: false, board: false })');
  ok('link made', link.indexOf('#wof=') > 0, link.length + ' chars');
  const hash = link.slice(link.indexOf('#wof='));
  const url = 'file://' + path.join(root, 'dist', 'wheel-of-fortune.html');
  const ctx = await t.page.context().browser().newContext({ viewport: { width: 960, height: 540 } });
  const p2 = await ctx.newPage();
  const errs = []; p2.on('pageerror', e => errs.push(e.message));
  await p2.goto(url + hash); await p2.waitForTimeout(900);
  const dTxt = await p2.evaluate(() => { const d = document.getElementById('dlg'); return d && d.classList.contains('open') ? d.innerText : null; });
  ok('receiver is asked first, and is told settings come along', !!dTxt && /Open Shared Game/.test(dTxt) && /spin length/i.test(dTxt));
  await p2.evaluate(() => [...document.querySelectorAll('#dlg .bt button')].find(b => b.textContent === 'Open it').click());
  await p2.waitForTimeout(1200);
  const got = await p2.evaluate(() => { App.show(42); return { base: PPT.sh(42, 'XSpinBaseBox').Text, tension: PPT.sh(42, 'XSpinTension').Text, final: PPT.sh(42, 'XSpinT_final').Text, normal: PPT.sh(42, 'XSpinT_normal').Text, bonus: PPT.sh(42, 'XSpinT_bonus').Text, plan: Extras.spinPlan(6, true), plan2: Extras.spinPlan(41, false) }; });
  ok('receiver has the sender\'s settings', got.base === 'Nail-Biter · 8s' && got.tension === 'off' && got.final === '9s' && got.normal === '8s' && got.bonus === '8s', JSON.stringify(got));
  ok('receiver spin plans use them', got.plan.ms === 9000 && got.plan2.ms === 8000 && got.plan2.power === 2, JSON.stringify([got.plan, got.plan2]));
  // and a real timed spin over there
  const ms = await p2.evaluate(async () => { App.show(5); Math.random = () => 0.3; const el = App.slide(5).byName.TransparentWheelOverlay[0], t0 = performance.now(); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 50)); while (App.busy) await new Promise(r => setTimeout(r, 20)); return performance.now() - t0; });
  ok('receiver Express spin ~8s', Math.abs(ms - 8000) < 300, Math.round(ms));
  await p2.screenshot({ path: path.join(process.argv[2], 'receiver.png') });
  ok('no page errors on receiver', errs.length === 0, errs.join('; '));
  // a link from before this feature (no screen 42) leaves the receiver on defaults
  const old = await p2.evaluate(async () => { const d = Persist.collect(); delete d.slides[42]; d.extras = null; d.sh = { sc: false, bd: false }; return location.pathname + '#wof=' + await Share.pack(d); });
  await p2.evaluate(() => localStorage.clear());
  await p2.goto(url + old.slice(old.indexOf('#wof='))); await p2.waitForTimeout(800);
  await p2.evaluate(() => [...document.querySelectorAll('#dlg .bt button')].find(b => b.textContent === 'Open it').click()); await p2.waitForTimeout(1200);
  const def = await p2.evaluate(() => { App.show(42); return PPT.sh(42, 'XSpinBaseBox').Text + '|' + PPT.sh(42, 'XSpinTension').Text; });
  ok('old-style link keeps defaults', def === 'Classic · 3.6s|on', def);
  await ctx.close();
};
