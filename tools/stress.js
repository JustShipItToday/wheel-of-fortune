// stress: long names / big numbers / long category + game name; report text that spills out of its box
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: (process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'), args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  await p.goto('file://' + require('path').join(__dirname, '..', 'dist') + '/wheel-of-fortune.html'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  const res = await p.evaluate(async () => {
    const over = [], S = PPT.sh, sleep = ms => new Promise(r => setTimeout(r, ms));
    const check = (tag) => document.querySelectorAll('.screen.on [data-name], .screen:not([hidden]) [data-name]').forEach(el => {
      const tx = el.querySelector(':scope > .txt'); if (!tx || !tx.textContent.trim() || el.offsetParent === null) return;
      const r = el.getBoundingClientRect(), g = document.createRange(); g.selectNodeContents(tx); const q = g.getBoundingClientRect();
      if (r.width < 1) return;
      const dx = Math.max(r.left - q.left, q.right - r.right), dy = Math.max(r.top - q.top, q.bottom - r.bottom);
      if (dx > 2 || dy > 4) over.push(tag + ' ' + el.dataset.name + ' dx=' + dx.toFixed(1) + ' dy=' + dy.toFixed(1) + ' "' + tx.textContent.trim().slice(0, 40) + '"');
    });
    App.show(2); await sleep(150);
    ['Christopher Alexander Montgomery', 'Wolfeschlegelsteinhausenbergerdorff', 'Bartholomew-Jones III'].forEach((n, i) => S(2, 'Player' + (i + 1) + 'Name').Text = n);
    [1, 2, 3].forEach(i => { S(2, 'Player' + i + 'RoundScore').Text = '1,234,567'; S(2, 'Player' + i + 'TotalsScore').Text = '12,345,678'; });
    S(2, 'CategoryBox').Text = 'BEFORE & AFTER: THE VERY LONG CATEGORY NAME';
    S(2, 'ValuePanel').Text = 'A VERY LONG GAME NAME HERE'; S(2, 'SpunWheelValue').Text = '$1,000,000';
    await sleep(200); check('board');
    for (const id of [9, 10, 7, 8, 40, 41, 17, 18, 11]) { App.show(id); await sleep(150); check('slide' + id); }
    return over;
  });
  console.log(res.length ? res.join('\n') : 'no overflow found');
  await b.close();
})();
