// usage: node audit.js  -> lists forbidden strings and text overflowing its box on every slide
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: (process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'), args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
  await p.goto('file://' + require('path').join(__dirname, '..', 'dist') + '/wheel-of-fortune.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  const res = await p.evaluate(async () => {
    const out = { bad: [], over: [] };
    const BAD = /gamesbytim|PowerPoint|macro|Important Notice|Before you start|projects|family|Enable|original art|Rusnak.*template/i;
    const ids = []; for (let i = 1; i <= 41; i++) { try { App.slide(i); ids.push(i); } catch (e) { } }
    for (const id of ids) {
      App.show(id); await new Promise(r => setTimeout(r, 120));
      const scr = document.querySelector('.screen[data-slide="' + id + '"]'); if (!scr) continue;
      scr.querySelectorAll('[data-name]').forEach(el => {
        const tx = el.querySelector(':scope > .txt'); if (!tx) return;
        const t = tx.textContent.trim(); if (!t) return;
        const vis = el.offsetParent !== null && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
        if (!vis) return;
        if (BAD.test(t)) out.bad.push(id + ' ' + el.dataset.name + ': ' + t.slice(0, 90));
        const r = el.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(tx); const q = rg.getBoundingClientRect();
        const dx = Math.max(r.left - q.left, q.right - r.right), dy = Math.max(r.top - q.top, q.bottom - r.bottom);
        if (dx > 1.5 || dy > 1.5) out.over.push(id + ' ' + el.dataset.name + ' dx=' + dx.toFixed(1) + ' dy=' + dy.toFixed(1) + ' "' + t.slice(0, 50) + '"');
      });
    }
    return out;
  });
  console.log('FORBIDDEN:\n' + res.bad.join('\n')); console.log('\nOVERFLOW:\n' + res.over.join('\n'));
  await b.close();
})();
