const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: (process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'), args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  await p.goto('file://' + require('path').join(__dirname, '..', 'dist') + '/wheel-of-fortune.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  const ids = process.argv[2].split(',').map(Number);
  for (const id of ids) {
    const r = await p.evaluate(async (id) => { App.show(id); await new Promise(r => setTimeout(r, 100)); const scr = document.querySelector('.screen[data-slide="' + id + '"]'); const o = []; scr.querySelectorAll('[data-name]').forEach(el => { const tx = el.querySelector(':scope > .txt'); if (!tx || el.offsetParent === null) return; const t = tx.textContent.trim().replace(/\s+/g, ' '); if (t) o.push(el.dataset.name + ': ' + t.slice(0, 160)); }); return o; }, id);
    console.log('=== slide', id); console.log(r.join('\n'));
  }
  await b.close();
})();
