// Rebuilds the How to Use screenshots (image20-23) from the web edition itself, matching the states in the slideshow's own screenshots.
const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const out = path.join(__dirname, 'screens');
  require('fs').mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: (process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'), args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, '..', 'dist', 'wheel-of-fortune.html'));
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
  const shot = async (n) => { await p.waitForTimeout(250); await p.screenshot({ path: path.join(out, 'image' + n + '.png') }); };
  await p.evaluate(() => {
    const S = PPT.sh, W = '#FFFFFF';
    const put = (page, num, str, cat) => { for (let j = 1; j <= 52; j++) { const c = str[j - 1]; const t = S(App.pageId(page), 'PuzzleSolution' + num + '-' + j); t.Text = c && c !== ' ' ? c : ''; t.FillRGB = c && c !== ' ' ? W : '#189A50'; } S(App.pageId(page), 'PuzzleCategory' + num).Text = cat; };
    put(0, 1, WOFCore.EXAMPLE, 'FUN & GAMES');
    put(0, 2, WOFCore.EXAMPLE, 'FUN & GAMES');
    put(0, 3, WOFCore.EXAMPLE, 'FUN & GAMES');
    VBA.shadeOccupiedPuzzlesFull();
    App.show(7);
    App.M.puzzleSetupFromOtherSlide(App.slide(7).byName.LinkTo3[0]);
  });
  await shot(20);
  await p.evaluate(() => {
    VBA.savePuzzleAndShadeOccupiedPuzzles();
    ['Jake', 'Carissa', 'Jamie'].forEach((n, i) => PPT.sh(2, 'Player' + (i + 1) + 'Name').Text = n);
    PPT.sh(40, 'XTurnTracker').Text = 'off';
    App.show(2);
  });
  await shot(21);
  await p.evaluate(async () => {
    await VBA.loadPuzzle(1, 0);
    const S = PPT.sh, guess = (i) => App.M.guessLetter(App.slide(2).byName['Letter' + i][0]);
    [5, 23, 8, 15, 18, 20, 4, 1, 13, 7, 22].forEach(guess);
    // reveal all blue tiles, then light up the F tiles
    for (let k = 1; k <= 52; k++) { const t = S(2, 'PuzzleBoard' + k); if (t.FillRGB === '#0000FF') { t.Text = S(2, 'PuzzleCache' + k).Text; t.FillRGB = '#FFFFFF'; } }
    S(2, 'SpunWheelValue').Text = '650';
    guess(6);
    S(2, 'Player1RoundScore').Text = '1,000'; S(2, 'Player2RoundScore').Text = '950'; S(2, 'Player3RoundScore').Text = '600';
  });
  await shot(22);
  await p.evaluate(() => {
    const S = PPT.sh;
    VBA.ClearBoardButton();
    S(2, 'Player1RoundScore').Text = '0'; S(2, 'Player2RoundScore').Text = '0'; S(2, 'Player3RoundScore').Text = '0';
    S(2, 'Player1TotalsScore').Text = '1,500'; S(2, 'Player2TotalsScore').Text = '1,000';
    App.M.changeRounds(App.slide(2).byName['Normal Round'][0]);
    App.M.changeRounds(App.slide(2).byName['Mystery Round'][0]);
  });
  await shot(23);
  await b.close();
  console.log('ok');
})();
