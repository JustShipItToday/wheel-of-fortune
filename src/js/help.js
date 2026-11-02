/* help.js — the in-game Help screen: one page per round, puzzle type, wheel space and feature, each with
   what it is, how to set it up, how to play it, tips and lines for the host. Opens from the title screen,
   Settings, Extra Features, the ? on the puzzle board (which jumps to the current round), the corner menu,
   or the F1 / ? keys. It is an overlay on the stage, so nothing in the game state changes while it is open. */
(function () {
  'use strict';

  var GROUPS = ['Getting Started', 'Rounds (the wheels)', 'Puzzle Types', 'Bonus Round Extras', 'Wheel Spaces & Items', 'Running the Game'];

  var TOPICS = [
    /* ---------------- Getting Started ---------------- */
    {
      id: 'start', group: 0, icon: '🚀', title: 'Quick Start',
      what: 'Wheel of Fortune Web Edition is the classroom game show on one screen: spin the wheel, call letters, buy vowels, solve puzzles and finish with the Bonus Round. You are the host and run everything with clicks while the players shout out letters.',
      use: [
        'On the title screen click **Puzzle Board**.',
        'Click the blue **Load Puzzle** tab at the bottom left, type **S** and press Enter. A random sample puzzle appears on the board. (Or type the number of one of your own puzzles.)',
        'Click **Wheel** at the top of the board, then click the wheel to spin. Click **Back** when it stops.',
        'The player calls a consonant: click it in the letter selector, click each blue tile to reveal it, then click the player’s red/yellow/blue **round score** to add the money.',
        'When someone solves, click the left tab (now called **Solve**), then the teal **Transfer Totals** arrow by the winner’s totals to bank the round.'
      ],
      tips: [
        'Press **F1** or **?** on the keyboard any time to open this Help.',
        'Click the **?** at the top of the puzzle board to jump straight to the help page for the round you are in.',
        'The game saves itself in this browser after every click, so you can close the tab and come back.'
      ],
      related: ['codes', 'samples', 'normal', 'letters']
    },
    {
      id: 'codes', group: 0, icon: '⌨️', title: 'Load Puzzle Codes',
      what: 'Everything starts at the blue **Load Puzzle** tab. What you type there decides which puzzle loads and how it is played.',
      table: [
        ['3', 'Your puzzle 3, played normally'],
        ['3T', 'Puzzle 3 as a Toss-Up'],
        ['3TTT', 'A Triple Toss-Up with puzzles 3, 4 and 5'],
        ['3P', 'Puzzle 3 as a Prize Puzzle'],
        ['S', 'A random sample puzzle that hasn’t been played yet'],
        ['S42', 'Sample puzzle 42'],
        ['ST', 'A random sample puzzle as a Toss-Up'],
        ['STTT', 'Three random sample puzzles as a Triple Toss-Up'],
        ['SP', 'A random sample puzzle as a Prize Puzzle']
      ],
      tips: [
        'Letters are not case sensitive, so s, st and 3p work too.',
        'In the Bonus Round (with Pick-a-Category on) you type three puzzles instead, like **10, 11, 12** or just **S** for three random sample categories.',
        'If you type something the game cannot read, it simply asks again.'
      ],
      related: ['samples', 'tossup', 'tripletossup', 'prize', 'pickcategory']
    },
    {
      id: 'samples', group: 0, icon: '🎲', title: 'Sample Puzzles',
      what: 'The game comes with **100 ready-made puzzles** across classic categories (Phrase, Before & After, Same Name, Rhyme Time, Food & Drink, On the Map, College Life and more). They live apart from your own puzzles, so they never overwrite anything you wrote. Perfect for a practice round, a warm-up, or when you run out of puzzles mid-game.',
      use: [
        'Nothing to set up: sample puzzles are **on** by default with all 100 in play.',
        'To change how many the game draws from, open **Settings → Extra Features** and click the **Sample Puzzles** box. Enter any number from **1 to 100** (for example 50 uses samples 1 to 50), or **0** to turn them off.',
        'Want to edit them or see them in your list? Click **Add Sample Puzzles to My List** on Extra Features. They are copied after your last puzzle in a random order, and then they are ordinary puzzles you can change in Set Up Puzzles.'
      ],
      play: [
        'At **Load Puzzle** type **S** for a random sample. The game remembers which ones were played and won’t repeat until every sample in the pool has had its turn.',
        'Add the usual codes: **ST** (Toss-Up), **SP** (Prize Puzzle), **STTT** (Triple Toss-Up with three different samples). **S7** loads sample 7 exactly.',
        'In the Bonus Round, type **S** in the three-categories box for three random sample categories, or mix them with your own, like **12, S, S30**.',
        'A small message at the bottom of the screen tells you which sample number loaded.'
      ],
      tips: [
        'If you haven’t written any puzzles yet, Load Puzzle fills in **S** for you.',
        'Wiping puzzles and scores (End Game) also resets the list of samples already played.',
        'Sample puzzles don’t move the "next puzzle" number, so your own puzzle order stays exactly where you left it.'
      ],
      related: ['codes', 'setup', 'pickcategory']
    },
    {
      id: 'setup', group: 0, icon: '✏️', title: 'Writing Your Own Puzzles',
      what: 'Your own puzzles are stored by number (12 per page, as many pages as you like). You can mix them freely with sample puzzles in the same game.',
      use: [
        'On the title screen click **Set Up Puzzles** and pick a number.',
        'Click the **pencil (Puzzle Scribe)** and type the puzzle. Use **\\** to start a new board row, for example **HAPPY \\ BIRTHDAY \\ TO YOU**.',
        'Type the **category**, or choose **(Pick Random)**.',
        'The **chart button (Puzzle Properties)** shows letter counts and how many R, S, T, L, N, E letters it has (handy for Bonus Round puzzles).',
        'For lots at once: **Settings → Extra Features → Import Puzzles from Text**, one per line as **CATEGORY | puzzle**.'
      ],
      tips: [
        'The top and bottom rows hold 12 letters and the middle rows hold 14.',
        'Show All Puzzles (in Settings) lists every puzzle on one screen.'
      ],
      related: ['samples', 'codes']
    },

    /* ---------------- Rounds ---------------- */
    {
      id: 'normal', group: 1, icon: '🎯', title: 'Normal Round', chip: '#2E86DE',
      what: 'The classic game and the round you start in. Spin, call a consonant, earn the wedge’s value for every time that letter appears, buy vowels, and solve to win the round.',
      wheel: 'Dollar wedges ($500 to $900 by default), two **Bankrupts**, a **Lose a Turn**, and a top wedge worth **$2,500**, plus any wheel items you switched on.',
      use: [
        'It’s on by default: the round button next to Load Puzzle says **Normal Round**.',
        'Change the dollar range or the number of Bankrupts in **Settings → Wheel Settings**.'
      ],
      play: [
        'Load a puzzle (a number, or **S** for a sample).',
        'Click **Wheel**, click the wheel to spin, then **Back**.',
        'The player calls **one consonant**. If it’s there, click each blue tile, then click their **round score** to add value × matches (the value panel shows the math, like $700 × 2 = $1,400).',
        'If it’s not there, a buzzer plays and the turn passes.',
        'To buy a vowel, click the **orange circle** left of their round score ($250 by default), then the vowel.',
        'To solve, click **Solve**. Then click **Transfer Totals** for the winner.'
      ],
      tips: ['Using a real wheel in the room? Click the value panel and type the amount you spun.'],
      say: ['Our category is… Food and Drink! Give it a spin!', 'Seven hundred dollars! Pick a consonant.', 'There are two Ts. That’s fourteen hundred dollars!'],
      related: ['letters', 'scoring', 'bankrupt', 'mystery']
    },
    {
      id: 'mystery', group: 1, icon: '🔮', title: 'Mystery Round', chip: '#8E44AD',
      what: 'A normal round with two purple **Mystery wedges** on the wheel. Land on one and call a correct consonant, and the player chooses: play it safe at **$1,000 per letter**, or **flip the wedge** for a 50/50 shot at **$10,000** or **Bankrupt**.',
      wheel: 'Everything on the Normal wheel, plus **Mystery 1** and **Mystery 2**. The top wedge is **$3,500**.',
      use: ['Click the round button once (Normal Round → **Mystery Round**), then load a puzzle.'],
      play: [
        'Spin. A Mystery wedge counts as **$1,000 per letter**.',
        'The player calls a consonant. If it’s in the puzzle, they choose:',
        '**Safe:** take $1,000 for each match. Click their round score as usual.',
        '**Gamble:** click **Wheel**, then the giant **?**. The wedge flips to **$10,000** (then click their round score: $10,000 per match) or **Bankrupt** (zero their score with the small **X**; the turn passes).',
        'A flipped wedge leaves the wheel and becomes a regular space. The other one stays until it’s flipped too.'
      ],
      tips: [
        'Taking the safe $1,000 does **not** remove the wedge. Only flipping does.',
        'Put both wedges back with the small blue **x** next to the Mystery result box.'
      ],
      say: ['You landed on a Mystery wedge! Pick a consonant.', 'A thousand dollars each… or flip it for ten thousand, or Bankrupt. What’ll it be?'],
      related: ['normal', 'express', 'bankrupt']
    },
    {
      id: 'express', group: 1, icon: '🚂', title: 'Express Round', chip: '#F1C40F',
      what: 'A normal round with a yellow **Express** wedge. Land on it, hit a consonant, and the player can **ride the Express**: keep calling consonants at **$1,000 each without spinning**, until they solve or miss. One miss and it’s **Bankrupt**.',
      wheel: 'Everything on the Normal wheel, plus the **Express** wedge. The top wedge is **$3,500**.',
      use: ['Click the round button twice from Normal until it says **Express Round**, then load a puzzle.'],
      play: [
        'Spin. Express counts as **$1,000 per letter**. The first letter must be a consonant.',
        'If it’s there, reveal it and add $1,000 × matches to their round score. They’re now **on the Express**.',
        'They keep calling consonants with no spin (add $1,000 × matches each time) and can still **buy vowels** with the orange circle.',
        'It ends when they **solve** or **miss**. A miss is Bankrupt: zero their round score with the **X**, and the turn passes.'
      ],
      tips: [
        'A player may decline the ride: click the next player’s dot to hand over the turn, or let them solve.',
        'If the very first consonant after landing misses, the turn just passes like any other miss.'
      ],
      say: ['You hit the Express! Hop aboard? A thousand dollars a letter, but one miss and it’s Bankrupt!', 'All aboard!'],
      related: ['normal', 'letters', 'bankrupt']
    },
    {
      id: 'finalspin', group: 1, icon: '🌀', title: 'Final Spin', chip: '#6C5CE7',
      what: 'The last wheel of the main game. The host gives **one spin** for the whole round; every consonant is worth **$1,000 plus that spin**, vowels are **free**, and players race to solve.',
      wheel: 'Only dollar values: no Bankrupt, no Lose a Turn, no wheel items. The top wedge is **$5,000**.',
      use: [
        'Click the round button until it says **Fourth Round**. A purple **FINAL SPIN** button appears on the board.',
        '**Load a puzzle first**; the Final Spin can’t start on an empty board.'
      ],
      play: [
        'Click **FINAL SPIN**. The purple banner explains the rules to the room.',
        'Click anywhere to spin (or **Manually Set Final Spin Value** if you use a real wheel).',
        'The value panel shows the spin **plus $1,000**. Players take turns calling one letter each.',
        'Correct consonant: click their round score to add value × matches. Vowels are free and add nothing.',
        'After a correct letter they get a short time to solve (the shot clock is great here).',
        'Click **FINAL SPIN** again to cancel it and go back to normal play.'
      ],
      tips: ['There is no Bankrupt here, and a missed letter doesn’t clear the spin.', 'Bank the winner with Transfer Totals before going to the Bonus Round.'],
      say: ['It’s time for the Final Spin! Every consonant is worth a thousand dollars plus the spin, and vowels are free!'],
      related: ['shotclock', 'bonus', 'scoring']
    },
    {
      id: 'bonus', group: 1, icon: '💰', title: 'Bonus Round', chip: '#D4A017',
      what: 'The grand finale for the game’s winner: one puzzle, **R S T L N E** for free, three more consonants and a vowel of their choosing, and **10 seconds** to solve for a big prize.',
      use: [
        'Click the round button until it says **Bonus Round**. The bonus controls appear in the gray box at the top right of the board.',
        'Load the puzzle. With **Pick-a-Category** on, enter three puzzles (or **S**) and the contestant picks a category card.'
      ],
      play: [
        'Click **RSTLNE** to give the free letters, then click each blue tile to reveal them.',
        'The contestant picks **three consonants and one vowel** (four consonants with the Wild Card). Click each in the letter selector; they collect in the small box. The **spiral arrow** removes the last pick.',
        'Click the box of chosen letters to reveal them all at once, then click the blue tiles.',
        'Click the **10** circle to start the countdown. Click it again to reset.',
        'If they solve it, click **Solve**. With the Bonus Wheel on, reveal their envelope!'
      ],
      tips: ['The round button is locked while the countdown runs. Reset the timer first.', 'Pick bonus puzzles with a good RSTLNE count (Puzzle Properties shows it).'],
      say: ['I’ll give you R, S, T, L, N and E. Now choose three more consonants and a vowel.', 'You have ten seconds… go!'],
      related: ['pickcategory', 'bonuswheel', 'wildcard', 'mdw']
    },

    /* ---------------- Puzzle types ---------------- */
    {
      id: 'tossup', group: 2, icon: '💥', title: 'Toss-Up', chip: '#E74C3C',
      what: 'A fast, no-wheel puzzle. Letters pop up one at a time and everyone races to buzz in. The first correct solver wins the Toss-Up’s value ($1,000 by default).',
      use: ['At Load Puzzle type the number plus **T** (like **2T**), or **ST** for a random sample.', 'Enter the value when asked, or keep $1,000.'],
      play: [
        'A **Toss-Up** banner appears and nobody calls letters.',
        'Reveal letters by clicking blank tiles, or use **Reveal a Letter** for a random one. Music starts on the first reveal.',
        'When someone buzzes in and solves, click **their round score**. It adds the value and reveals the puzzle in one click.',
        'Clicking **Solve** instead reveals it without awarding money.'
      ],
      tips: ['Revealing the very last letter solves it automatically with a buzz.', 'The turn tracker and letter rules don’t apply during Toss-Ups.'],
      say: ['Toss-Up! First to solve wins a thousand dollars. Buzz in when you know it!'],
      related: ['tripletossup', 'codes']
    },
    {
      id: 'tripletossup', group: 2, icon: '🔥', title: 'Triple Toss-Up', chip: '#C0392B',
      what: 'Three Toss-Ups back to back, each worth the same amount ($2,000 by default). Round scores carry over across all three.',
      use: ['Type the first number plus **TTT** (**3TTT** plays 3, 4 and 5; they must all exist), or **STTT** for three random sample puzzles.', 'Enter one value for all three.'],
      play: [
        'Play each one exactly like a Toss-Up. The banner says Puzzle 1, 2, 3.',
        'After puzzles 1 and 2 the left tab turns into **Load Next**. Click it for the next puzzle.',
        'After the third, bank with **Transfer Totals**.'
      ],
      tips: ['Transfer Totals is blocked until all three are solved.', 'With **Special Score Bonuses** on, a player who solves all three gets **5×** the value.'],
      say: ['Triple Toss-Up! Three puzzles, two thousand dollars each!'],
      related: ['tossup', 'scoring']
    },
    {
      id: 'prize', group: 2, icon: '🎁', title: 'Prize Puzzle', chip: '#E2A92B',
      what: 'A regular puzzle with a prize on the line. A gold **PRIZE PUZZLE** ribbon shows on the board, and whoever solves it wins the prize (and its dollar value goes on their round score).',
      use: ['Set the prize in **Settings → Extra Features → Edit Prize Puzzle Prize** (default: A TRIP TO HAWAII, worth $10,000). Enter $0 to give the prize with no money.', 'At Load Puzzle add **P** (like **4P**), or type **SP** for a random sample.'],
      play: ['Play it like any round in whichever wheel you’re on.', 'When it’s solved, a box announces the prize. Pick who solved it and the value is added to their round score.'],
      tips: ['Clearing the board or loading another puzzle removes the ribbon.', 'P can’t be combined with T.'],
      say: ['This is a Prize Puzzle! Solve it and you’re going to Hawaii!'],
      related: ['codes', 'scoring']
    },

    /* ---------------- Bonus extras ---------------- */
    {
      id: 'pickcategory', group: 3, icon: '🃏', title: 'Pick-a-Category Bonus',
      what: 'Like today’s show: before the Bonus Round puzzle, the contestant sees **three categories on big cards** and picks the one they want.',
      use: ['On by default. Toggle it in **Settings → Extra Features → Pick-a-Category Bonus**.'],
      play: [
        'In the Bonus Round, click **Load Puzzle**. Enter three puzzle numbers, like **10, 11, 12**.',
        'Or type **S** for three random sample categories, or mix: **10, S, S42**.',
        'The contestant clicks a card and that puzzle loads.',
        'Leave the box blank to load a single puzzle the usual way.'
      ],
      related: ['bonus', 'samples']
    },
    {
      id: 'bonuswheel', group: 3, icon: '✉️', title: 'Bonus Prize Wheel',
      what: 'A wheel of **24 envelopes** for the Bonus Round prize, from $40,000 to $100,000 plus cars by default. Spin before they solve for maximum suspense.',
      use: ['On by default. Toggle it in **Extra Features → Bonus Prize Wheel**.', 'Change any envelope with **Edit Bonus Prizes** (one prize per line) or restore the defaults.'],
      play: [
        'In the Bonus Round, click **Bonus Wheel** at the top right of the board.',
        'Click the wheel to spin. It lands on an envelope number.',
        'After the contestant solves (or time runs out), click **Reveal Prize**.'
      ],
      tips: ['If the contestant still holds the Million Dollar Wedge, the $100,000 envelope becomes $1,000,000.', 'The default prizes are a close approximation of the show, not an official list.'],
      related: ['bonus', 'mdw']
    },

    /* ---------------- Wheel spaces & items ---------------- */
    {
      id: 'bankrupt', group: 4, icon: '💸', title: 'Bankrupt & Lose a Turn', chip: '#111111',
      what: '**Bankrupt** wipes out the player’s money for this round and ends their turn. **Lose a Turn** ends the turn without costing money.',
      play: [
        'Bankrupt: click the small **X** next to the player’s round score to zero it.',
        'Lose a Turn: no letter is called; the next player goes.',
        'With the turn tracker on, the turn passes automatically for both.'
      ],
      tips: ['Totals already banked are safe from Bankrupt; only the round score is lost.', 'Set how many Bankrupts each wheel has in **Wheel Settings**.'],
      say: ['Oh no… Bankrupt!'],
      related: ['turntracker', 'scoring']
    },
    {
      id: 'freeplay', group: 4, icon: '🆓', title: 'Free Play', chip: '#9BE15D',
      what: 'A no-risk wedge: the player calls a **consonant worth $500** or a **vowel for free**, and keeps the turn **no matter what**.',
      use: ['Off by default. Turn on **Free Play Wedge** in **Settings → Wheel Settings**.'],
      play: ['Land on it, call any one letter.', 'Correct consonant: click their round score for $500 × matches.', 'Even a miss doesn’t pass the turn; they spin again.'],
      related: ['letters', 'wildcard']
    },
    {
      id: 'wildcard', group: 4, icon: '🃏', title: 'Wild Card', chip: '#2ECC71',
      what: 'A card the player keeps. During a round it lets them call **one extra consonant** at their last spin’s value. In the Bonus Round it gives a **fourth consonant**.',
      use: ['Off by default. Turn on **Wild Card** in **Wheel Settings**.'],
      play: [
        'When a player lands on it and calls a correct letter, click their **Wild Card token** by their name to award it.',
        'To use it: after a correct consonant, have them call another one. The game says a spin is needed and offers to **use the Wild Card**. Click it and the letter counts at the last spin’s value.',
        'In the Bonus Round, holding it unlocks a fourth consonant automatically.'
      ],
      tips: ['Click the token again to take it away.', 'Claimable "once" removes it from the wheel when won; "multiple" leaves it for others.'],
      related: ['bonus', 'freeplay', 'gifttag']
    },
    {
      id: 'gifttag', group: 4, icon: '🏷️', title: 'Gift Tag', chip: '#E84393',
      what: 'A wedge with a prize of **your choice** attached, like a gift card or a class treat.',
      use: ['Off by default. Turn on **Gift Tag** in **Wheel Settings**. Decide the prize before you play.'],
      play: ['When a player lands on it and calls a correct letter, click their **Gift Tag token** to award it.', 'Hand out the prize however you like at the end.'],
      related: ['wildcard', 'mdw']
    },
    {
      id: 'mdw', group: 4, icon: '💎', title: 'Million Dollar Wedge', chip: '#27AE60',
      what: 'A thin **ONE MILLION** sliver sitting between two Bankrupts on the Normal, Mystery and Express wheels. Grab it and keep it to the Bonus Round, and the $100,000 envelope becomes **$1,000,000**.',
      use: ['Off by default. Turn on **Million Dollar Wedge** in **Settings → Extra Features**.'],
      play: [
        'Landing in the middle is worth **$500** per letter.',
        'If the letter is correct, click the green **token** next to the player’s name to give them the wedge.',
        'Hitting Bankrupt? Click the token to take it back, just like the show.',
        'If they reach the Bonus Round still holding it, spin the Bonus Wheel: the $100,000 envelope is now $1,000,000.'
      ],
      related: ['bonuswheel', 'bankrupt']
    },
    {
      id: 'sliver', group: 4, icon: '⚡', title: '$5,000 Sliver', chip: '#F39C12',
      what: 'A custom wedge split into **two Bankrupts with a $5,000 center**. High risk, high reward.',
      use: ['Off by default. Turn on **$5,000 Sliver** in **Wheel Settings**.'],
      play: ['It plays like any dollar wedge: land in the middle and each correct consonant is $5,000. Land on either edge and it’s Bankrupt.'],
      related: ['fivewedge', 'bankrupt']
    },
    {
      id: 'fivewedge', group: 4, icon: '🪙', title: '$5 Wedge', chip: '#B2BEC3',
      what: 'A silly **$5** wedge for laughs.',
      use: ['Off by default. Turn on **$5 Wedge** in **Wheel Settings**.'],
      play: ['Plays like any dollar wedge: $5 per correct consonant.'],
      say: ['Five dollars! Don’t spend it all in one place.'],
      related: ['sliver']
    },

    /* ---------------- Running the game ---------------- */
    {
      id: 'letters', group: 5, icon: '🔤', title: 'Letters & Vowels (the rules)',
      what: 'The letter selector follows the show’s rules, and pops up a short reason whenever something isn’t allowed.',
      play: [
        'A spin that lands on a value allows exactly **one consonant**.',
        'A vowel can’t be called right after a spin. **Buy it first** with the orange circle (one purchase = one vowel).',
        'A player needs at least the vowel price ($250 by default) in their round score to buy.',
        'A letter that isn’t in the puzzle ends the turn.',
        'With the turn tracker on, only the player whose turn it is can buy a vowel.'
      ],
      tips: ['Setting the value panel by hand (for a real wheel) counts as a spin.', 'Special wedges change the rules for that turn: Free Play, Wild Card, Express and the Final Spin each have their own page here.'],
      related: ['normal', 'freeplay', 'express', 'finalspin']
    },
    {
      id: 'scoring', group: 5, icon: '🏆', title: 'Scores & Banking',
      what: 'Each player has a **round score** (money this puzzle) and **totals** (money banked across the game).',
      play: [
        'Add money: click a player’s round score after a correct letter.',
        'Zero it (Bankrupt): click the small **X** beside it.',
        'Bank the round: click the teal **Transfer Totals** arrow by the **winner’s** totals. Only the winner banks; everyone’s round score resets to $0.',
        'If the winner has less than the **house minimum** ($1,000 by default), the game offers the minimum instead.'
      ],
      tips: ['Switch between 2, 3 and 4 players with the + and − buttons. Click a name to rename a player.', 'End Game (top right) can wipe scores, or puzzles and scores, when you are done.'],
      related: ['bankrupt', 'turntracker']
    },
    {
      id: 'turntracker', group: 5, icon: '👉', title: 'Turn Tracker',
      what: 'A gold dot and a glowing name show **whose turn it is**, so the whole room can see.',
      use: ['On by default. Toggle in **Extra Features → Turn Tracker**.'],
      play: ['The turn passes by itself after Bankrupt, Lose a Turn, a missed letter, a wrong solve (in verify mode), or when the shot clock runs out.', 'Click any player’s **dot** to hand them the turn yourself.'],
      related: ['letters', 'shotclock']
    },
    {
      id: 'shotclock', group: 5, icon: '⏱️', title: 'Shot Clock',
      what: 'An on-board countdown from **1 to 30 seconds** to keep decisions moving.',
      use: ['Set the seconds in **Settings → Shot Clock** (it is off, "none", by default). The clock then appears on the puzzle board.'],
      play: ['Click the clock to start the countdown; click it again to reset.', 'When it hits zero the turn passes (with the turn tracker on).'],
      related: ['finalspin', 'turntracker']
    },
    {
      id: 'spinlength', group: 5, icon: '🎡', title: 'Spin Length',
      what: 'How long the wheel spins. The original slideshow always spins for **3.6 seconds**; here you can make it quicker for a big class or slower for more suspense, and let the biggest moments build tension.',
      use: [
        'Open **Settings → Wheel Settings → Spin Length**.',
        '**Base Spin Length** is a regular spin: **Quick** 2.5s, **Classic** 3.6s (the default), **Dramatic** 5.5s, **Nail-Biter** 8s, or **Custom** from 1.5 to 15 seconds.',
        '**Build Tension** (on by default) gives the wheels with more at stake a longer spin than the base.',
        'Click any wheel’s time to set your own for that wheel (it turns gold). Type **auto** to go back to automatic. **Reset to Defaults** undoes everything.'
      ],
      table: [
        ['Normal Round', 'the base length (3.6s)'],
        ['Mystery / Express Round', '15% longer (4.1s)'],
        ['Fourth Round', '25% longer (4.5s)'],
        ['Final Spin', '75% longer (6.3s), with a slower crawl to the stop'],
        ['Bonus Wheel', 'twice as long (7.2s), with a slower crawl to the stop']
      ],
      tips: ['Times shown are with the Classic base. Pick Dramatic and the Bonus Wheel spins for 11 seconds.', 'The spin sound stretches or shrinks to fit the spin.', 'The settings are saved with the game, so they travel in a game file or a shared link.'],
      related: ['finalspin', 'bonuswheel', 'normal']
    },
    {
      id: 'solve', group: 5, icon: '✅', title: 'Solving (reveal or verify)',
      what: 'How the Solve button works is up to you, set in **Settings → Solve Button**.',
      play: [
        '**reveal** (default): clicking Solve shows the answer at once and you judge whether the player was right.',
        '**verify**: a box asks you to type the player’s answer. Right reveals the puzzle; wrong shows "Incorrect Solve" and passes the turn.',
        'In verify mode, type **/reveal** to show the puzzle without checking.'
      ],
      related: ['scoring', 'tossup']
    },
    {
      id: 'saving', group: 5, icon: '💾', title: 'Saving, Sharing & Projecting',
      what: 'Your puzzles, scores and settings **save automatically in this browser** after every change.',
      play: [
        'Move a game to another computer: corner menu **⋯ → Save game file**, then **Load game file** on the other machine.',
        'Send a game to a friend: **Settings → Share Game** copies a link with your puzzles and settings (scores optional).',
        'Full screen: corner menu **⋯ → Full screen**, or F11.'
      ],
      tips: ['The **⋯** menu sits in the bottom-right corner and appears when you move the mouse.', 'Don’t use the browser’s Back button mid-game; use the on-screen buttons.', 'On a video call, share this browser tab.'],
      related: ['start']
    }
  ];

  var byId = {};
  TOPICS.forEach(function (t) { byId[t.id] = t; });

  /* ---------- rendering ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
  function list(items, ordered) {
    var tag = ordered ? 'ol' : 'ul';
    return '<' + tag + '>' + items.map(function (x) { return '<li>' + md(x) + '</li>'; }).join('') + '</' + tag + '>';
  }
  function section(icon, title, body) { return '<section><h3><span>' + icon + '</span>' + title + '</h3>' + body + '</section>'; }

  function page(t) {
    var h = '<div class="xh-hero"><div class="xh-icon"' + (t.chip ? ' style="--chip:' + t.chip + '"' : '') + '>' + t.icon + '</div>' +
      '<div><div class="xh-group">' + esc(GROUPS[t.group]) + '</div><h2>' + esc(t.title) + '</h2></div></div>';
    h += section('💡', 'What it is', '<p>' + md(t.what) + '</p>' + (t.wheel ? '<p class="xh-wheel"><b>On the wheel:</b> ' + md(t.wheel) + '</p>' : ''));
    if (t.table) h += section('📋', 'Cheat sheet', '<table>' + t.table.map(function (r) { return '<tr><td><code>' + esc(r[0]) + '</code></td><td>' + md(r[1]) + '</td></tr>'; }).join('') + '</table>');
    if (t.use) h += section('⚙️', 'How to set it up', list(t.use, t.use.length > 1));
    if (t.play) h += section('🎮', 'How to play it', list(t.play, true));
    if (t.tips) h += section('⭐', 'Good to know', list(t.tips));
    if (t.say) h += section('🎤', 'What to say as host', t.say.map(function (q) { return '<blockquote>“' + md(q) + '”</blockquote>'; }).join(''));
    if (t.related && t.related.length) {
      h += '<div class="xh-related"><span>See also:</span>' + t.related.filter(function (r) { return byId[r]; }).map(function (r) {
        return '<button data-topic="' + r + '">' + byId[r].icon + ' ' + esc(byId[r].title) + '</button>';
      }).join('') + '</div>';
    }
    return h;
  }

  var root = null, current = 'start', prevFocus = null;

  function plain(t) {
    return [t.title, t.what, t.wheel || ''].concat(t.use || [], t.play || [], t.tips || [], t.say || [], (t.table || []).map(function (r) { return r.join(' '); })).join(' ').toLowerCase();
  }
  function renderNav(filter) {
    var nav = root.querySelector('.xh-nav'), f = (filter || '').trim().toLowerCase(), h = '', shown = 0;
    GROUPS.forEach(function (g, gi) {
      var items = TOPICS.filter(function (t) { return t.group === gi && (!f || plain(t).indexOf(f) >= 0); });
      if (!items.length) return;
      h += '<div class="xh-gh">' + esc(g) + '</div>';
      items.forEach(function (t) {
        shown++;
        h += '<button class="xh-item' + (t.id === current ? ' on' : '') + '" data-topic="' + t.id + '"><span class="xh-ii">' + t.icon + '</span>' + esc(t.title) + '</button>';
      });
    });
    if (!shown) h = '<div class="xh-none">Nothing matches “' + esc(filter) + '”.</div>';
    nav.innerHTML = h;
  }
  function show(id) {
    if (!byId[id]) id = 'start';
    current = id;
    var body = root.querySelector('.xh-body');
    body.innerHTML = page(byId[id]);
    body.scrollTop = 0;
    root.querySelectorAll('.xh-item').forEach(function (b) { b.classList.toggle('on', b.dataset.topic === id); });
    var on = root.querySelector('.xh-item.on');
    if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
  }

  function build() {
    root = document.createElement('div');
    root.className = 'x-help';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Game Help');
    root.innerHTML =
      '<div class="xh-top"><div class="xh-title">🎡 Game Help</div>' +
      '<input class="xh-search" type="search" placeholder="Search help…" spellcheck="false" autocomplete="off">' +
      '<button class="xh-close" title="Close (Esc)">✕ Close</button></div>' +
      '<div class="xh-main"><nav class="xh-nav"></nav><article class="xh-body"></article></div>';
    root.addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest ? e.target.closest('[data-topic]') : null;
      if (b) { show(b.dataset.topic); return; }
      if (e.target.closest && e.target.closest('.xh-close')) close();
    });
    var search = root.querySelector('.xh-search');
    search.addEventListener('input', function () {
      renderNav(search.value);
      var first = root.querySelector('.xh-item');
      if (first && !root.querySelector('.xh-item.on')) show(first.dataset.topic);
    });
    root.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); close(); } });
    App.stage().appendChild(root);
  }

  function isOpen() { return !!(root && root.classList.contains('open')); }
  function open(id) {
    if (window.Dlg && Dlg.isOpen()) return;
    if (!root) build();
    prevFocus = document.activeElement;
    root.querySelector('.xh-search').value = '';
    current = byId[id] ? id : current;
    renderNav('');
    show(current);
    root.classList.add('open');
    setTimeout(function () { var c = root.querySelector('.xh-close'); if (c) c.focus(); }, 30);
  }
  function close() {
    if (!root) return;
    root.classList.remove('open');
    if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) { }
  }

  /* F1 or ? opens help (when no dialog is open and you aren't typing); Esc closes it */
  document.addEventListener('keydown', function (e) {
    var tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (isOpen()) { if (e.key === 'Escape') { e.preventDefault(); close(); } return; }
    if (window.Dlg && Dlg.isOpen()) return;
    if (e.key === 'F1' || e.key === '?') {
      e.preventDefault();
      var topic = (window.App && App.current === 2 && window.Extras && Extras.currentHelpTopic) ? Extras.currentHelpTopic() : undefined;
      open(topic);
    }
  });

  window.WOFHelp = { open: open, close: close, isOpen: isOpen, TOPICS: TOPICS };
})();
