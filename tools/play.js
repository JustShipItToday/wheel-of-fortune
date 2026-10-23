// Scripted play-through harness.  usage: node play.js <outdir> <script.js>
// The script exports async function(t) using helpers: t.click(name[, slide]), t.answer(value|true|false|index), t.shot(label), t.eval(js), t.wait(ms), t.text(name, slide)
const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const [out, scriptPath, fresh] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: (process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'), args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message + '\n' + e.stack));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  await p.goto('file://' + require('path').join(__dirname, '..', 'dist') + '/wheel-of-fortune.html');
  if (fresh !== 'keep') { await p.evaluate(() => localStorage.clear()); await p.reload(); }
  await p.waitForTimeout(500);
  let n = 0;
  const t = {
    page: p,
    async click(name, slide) {
      const ok = await p.evaluate(([name, slide]) => {
        const sid = slide != null ? slide : App.current;
        const s = App.slide(sid); const a = s.byName[name];
        if (!a) return 'no shape ' + name;
        const el = a.find(e => e.classList.contains('click') && e.offsetParent !== null) || a[0];
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return 'ok';
      }, [name, slide]);
      if (ok !== 'ok') console.log('CLICK FAIL', name, ok);
      await p.waitForTimeout(60);
    },
    async dialog() { return p.evaluate(() => { const d = document.getElementById('dlg'); if (!d || !d.classList.contains('open')) return null; return { title: d.querySelector('.tt').textContent, text: d.querySelector('.tx').textContent, input: d.querySelector('.box > input').style.display !== 'none', buttons: [...d.querySelectorAll('.bt button')].map(b => b.textContent) }; }); },
    async answer(v) {
      const d = await t.dialog();
      if (!d) { console.log('NO DIALOG to answer with', v); return; }
      console.log('  [dialog]', d.title, '|', d.text.replace(/\n+/g, ' / ').slice(0, 140), '->', JSON.stringify(v));
      await p.evaluate((v) => {
        const d = document.getElementById('dlg'); const inp = d.querySelector('.box > input'); const btns = [...d.querySelectorAll('.bt button')];
        if (inp.style.display !== 'none') {
          if (v === null) { btns.find(b => b.textContent === 'Cancel').click(); return; }
          inp.value = String(v); btns.find(b => b.textContent === 'OK').click(); return;
        }
        if (typeof v === 'number') { btns[v].click(); return; }
        if (typeof v === 'string') { btns.find(b => b.textContent === v).click(); return; }
        if (v === false) { (btns.find(b => b.textContent === 'No' || b.textContent === 'Cancel') || btns[btns.length - 1]).click(); return; }
        (btns.find(b => b.textContent === 'Yes' || b.textContent === 'OK') || btns[0]).click();
      }, v);
      await p.waitForTimeout(80);
    },
    async shot(label) { n++; await p.screenshot({ path: path.join(out, String(n).padStart(2, '0') + '-' + label + '.png') }); },
    async eval(js) { return p.evaluate(js); },
    async wait(ms) { await p.waitForTimeout(ms); },
    async text(name, slide) { return p.evaluate(([name, slide]) => PPT.sh(slide != null ? slide : App.current, name).Text, [name, slide]); },
    log: (...a) => console.log(...a)
  };
  try { await require(path.resolve(scriptPath))(t); } catch (e) { console.log('SCRIPT ERROR', e); }
  if (errs.length) console.log('--- page errors ---\n' + errs.slice(0, 20).join('\n'));
  await b.close();
})();
