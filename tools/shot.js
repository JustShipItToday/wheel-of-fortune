// usage: node shot.js <outdir> <slide>[,<slide>...] [js-to-run-before-each]
const { chromium } = require('playwright-core');
(async () => {
  const [out, slides, pre] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: (process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'), args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  await p.goto('file://' + require('path').join(__dirname, '..', 'dist') + '/wheel-of-fortune.html');
  await p.waitForTimeout(400);
  for (const s of slides.split(',')) {
    await p.evaluate(`App.show(${s})`);
    if (pre) await p.evaluate(pre);
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${out}/s${s}.png` });
  }
  if (errs.length) console.log(errs.slice(0, 15).join('\n'));
  await b.close();
})();
