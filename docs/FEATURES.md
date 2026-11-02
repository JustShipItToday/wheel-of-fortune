# Features

## From the original game (by Games by Tim)
- All four wheels (Normal, Mystery, Express, Final Spin) and the Bonus Round.
- Toss-Ups and Triple Toss-Ups, with optional Special Score Bonuses (a $1,000 bonus for a Same Letter puzzle, and 5× the value for solving all three Triple Toss-Ups).
- **Puzzle Scribe** to type a whole puzzle and have it written onto the board, and **Puzzle Properties** for letter counts and the RSTLNE ratio.
- Up to **12 puzzles per page**, with more pages as you need them, a **Show All Puzzles** view, and **Delete All Puzzles**.
- **2, 3 or 4 players**, with editable names.
- **Buy a vowel**, **house minimum**, **Transfer Totals**, and manual score adjustment with the dollar sign.
- **Shot clock** (1–30 seconds).
- **Blue tiles** (click to reveal) or instant letters.
- **Puzzle swap** to exchange two puzzle numbers.
- **Sound effects**, with a **Sound Effect Settings** screen where you can preview each sound or replace it with your own audio file.
- **Backdrops** and **color schemes** for the board and wheel; you can click the board's right light pillar or the frame to change them quickly.
- **Spanish Ñ** option and an editable **game name**.
- **Wheel Settings:** value range, number of Bankrupts per round, Free Play, Wild Card, Gift Tag, $5,000 Sliver, $5 Wedge, and **Spin Length** (how long each wheel spins, with optional extra tension on the big wheels).
- **Manual wheel value:** click the Value Panel to set the spun value yourself (for a real wheel).

## New in this edition
These are on the **Extra Features** screen (open it from **Settings → Extra Features**, or from the **⋯** menu).

### Turn tracker
A gold dot and highlighted name show whose turn it is. The turn passes automatically after a Bankrupt, a Lose a Turn, a letter that isn't in the puzzle, a wrong solve (in *verify* mode), or when the shot clock runs out. Click any player's dot to hand them the turn. **On by default.**

### Letter rules
The letter selector follows the show's rules, so a letter can't be called when the rules don't allow it. A message explains why. These rules are always on.
- **Regular rounds:** a spin that lands on a value allows exactly one consonant. A vowel can't be called right after a spin; it has to be bought first with the orange circle next to the player's round score, and one purchase buys one vowel. Bankrupt and Lose a Turn allow no letters, and a letter that isn't in the puzzle ends the turn. Only the player whose turn it is can buy a vowel (with the turn tracker on). Setting the Value Panel by hand (for a real wheel) counts as a spin.
- **Free Play:** one consonant, or one vowel for free.
- **Wild Card:** when a second consonant is blocked and the player holds the Wild Card, the message offers to use it. The consonant is then called at the last spin's value, and the card is used up.
- **Express:** after landing on Express, the first letter is a consonant. If it's in the puzzle, the player is on the Express: more consonants without spinning, and vowels can still be bought, until a miss.
- **Final Spin:** vowels are free at any time; consonants need the Final Spin's one spin.
- **Bonus Round:** three consonants (four with the Wild Card) and one vowel.
- **Toss-Ups** are unchanged.

### Million Dollar Wedge
Adds a sliver worth **ONE MILLION** between two Bankrupts to the Normal, Mystery and Express wheels. Landing in the middle is worth $500. Give the wedge to the player with the green token next to their name. If that player reaches the Bonus Round still holding it, the $100,000 envelope on the Bonus Wheel becomes **$1,000,000**. **Off by default.**

### Bonus Wheel
A **24-envelope** prize wheel for the Bonus Round, with prizes from $40,000 to $100,000 plus cars by default. Click **Bonus Wheel** at the top right of the board during the Bonus Round, spin it, and reveal the prize. Use **Edit Bonus Prizes** to change any envelope or restore the defaults. **On by default.** (The default prize mix is an approximation of the show's, not an official list; edit it to match your game.)

### Pick-a-Category Bonus
Before the Bonus Round puzzle, enter three puzzle numbers; the contestant sees their three categories on a big card and picks one. Leave it blank to load a single puzzle the usual way. **On by default.**

### Prize Puzzle
Load a puzzle with **P** (for example `4P`) and name the prize. When it is solved, you choose the winner and the prize value is added to their round score. See [Game Modes](MODES.md).

### Sample puzzles
**100 ready-made puzzles** (Sample 1 to Sample 100) across classic categories, kept separate from your own puzzle list so they never replace anything. At **Load Puzzle**:

| Type | You get |
|---|---|
| `S` | A random sample puzzle that hasn't been played yet this game |
| `S7` | Sample puzzle 7 |
| `ST` / `SP` | A random sample as a Toss-Up / Prize Puzzle |
| `STTT` | Three different random samples as a Triple Toss-Up (`S7TTT` plays 7, 8 and 9) |

In the Bonus Round with Pick-a-Category on, type `S` for three random sample categories (always three different categories), or mix them with your own puzzles, like `10, S, S42`. If you haven't written any puzzles yet, Load Puzzle fills in `S` for you.

The **Sample Puzzles** box on Extra Features sets how many of them the game draws from, **1 to 100** (default 100), or **0** to turn them off. **Add Sample Puzzles to My List** copies any number of them, in random order, after your last puzzle so you can edit them. Random picks don't repeat until every sample in the pool has been played; wiping puzzles and scores resets that.

### In-game Help
A full Help screen with a page for every round (Normal, Mystery, Express, Final Spin, Bonus), puzzle type (Toss-Up, Triple Toss-Up, Prize Puzzle), Bonus Round extra, wheel space and item (Bankrupt, Lose a Turn, Free Play, Wild Card, Gift Tag, Million Dollar Wedge, $5,000 Sliver, $5 Wedge) and game feature. Each page covers **what it is, how to set it up, how to play it, tips, and what to say as host**, with links to related pages and a search box.

Open it from **Game Help** on the title screen, Settings or Extra Features, the **⋯** menu, or the keyboard (**F1** or **?**). The **?** at the top of the puzzle board opens the page for the round you are playing right now.

### Import puzzles from text
Paste one puzzle per line as `CATEGORY | puzzle text`. Separate board rows with `\`, or leave them out and rows are chosen for you. Lines that don't fit on the board are listed so you can fix them.

### Save and load a game file
The **⋯** menu in the bottom-right corner has **Save game file** and **Load game file**, so you can move a game (puzzles, scores and settings) to another computer or keep a backup. The game also **autosaves in the browser** you are using.

### Share a game as a link
Click **Share Game** on the Settings screen (or **⋯ → Share game link**), choose what goes in the link, and click **Copy link**. Anyone who opens it gets their own copy of your game: puzzles, settings, colors and rules always travel; you can also include **player names and scores**, and the **current puzzle and whose turn it is** (their game then opens on the puzzle board). They can edit anything, and if they share it they get a new link; yours never changes.

There is no server: the whole game is packed into the link itself (a game with 16 puzzles is about 4,000 characters). Opening a link asks first, keeps the visitor's own game as a backup (**⋯ → Switch to previous game**), and works on any browser. Sounds you uploaded yourself can't travel in a link; the built-in sounds are the same for everyone. A link is a snapshot, not a live session: it doesn't sync while two people play.

### Corner menu
**⋯** also has full screen, sound on/off, share game link, and (after opening someone else's game) switch to previous game.

## Not included
- Crossword puzzles.
- Team weeks and Fortune Frenzy.
- The original's PowerPoint-only screens (macro warnings, update checks).
