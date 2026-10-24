# How to Use

A step-by-step guide to running a game, including what to say as the host. For the details of each round type see [Game Modes](MODES.md); for every setting see [Settings](SETTINGS.md).

## 1. Before you play (about 15 minutes)

1. **Open the game** in an up-to-date Chrome, Edge, Firefox or Safari, on the same computer and projector you will use for the real game.
2. **Go full screen** with the **⋯** button in the bottom-right corner (or press F11). Check the sound there too.
3. **Set up your puzzles.** Click **Set Up Puzzles** on the title screen.
   - Pick a puzzle number (1–12 on the first page; use the arrow to add more pages).
   - Click the **pencil (Puzzle Scribe)**, type the puzzle, and use `\` to start a new board row. Example: `HAPPY \ BIRTHDAY \ TO YOU`.
   - Type the **category**, or choose **(Pick Random)**.
   - The **chart button (Puzzle Properties)** shows letter counts and the RSTLNE ratio.
   - Or open **Settings → Extra Features → Import Puzzles from Text** and paste one puzzle per line as `CATEGORY | puzzle`.
4. **Fine-tune in Settings** (top right): player names live on the puzzle board, and everything else is in [Settings](SETTINGS.md).
5. **Do one full practice game.** Your puzzles and scores save automatically in that browser, so use the same browser on game day.

## 2. Running a round

1. On the **Puzzle Board**, click the blue **Load Puzzle** tab at the bottom left and type the puzzle number.
   - `3T` loads puzzle 3 as a Toss-Up.
   - `3TTT` starts a Triple Toss-Up with puzzles 3, 4 and 5.
   - `3P` loads it as a Prize Puzzle.
2. **Say:** "Welcome to *Wheel of Fortune*! Our category is… **[category]**!"
3. **Spin.** Click the **Wheel** button at the top of the board, then click the wheel. After about four seconds it lands, and the value appears. Click **Back** to return to the board. Read the result aloud: "Six hundred dollars!"
4. **The player calls a consonant.** Click that letter in the letter selector.
   - If it is in the puzzle, matching tiles light up blue. **Click each blue tile** to reveal its letter (or turn off Blue Tiles in Settings so they appear at once).
   - Then **click the player's round score** to add the spun value times the number of matches.
   - If it is not in the puzzle, a buzzer plays and the turn passes.
5. **Buying a vowel.** Click the small **orange circle** to the left of that player's round score (it takes the vowel price off, $250 by default), then click the vowel. A player needs at least the vowel price to buy. The game follows the show's letter rules (for example, one consonant per spin, and no vowel until it's bought); see [Letter rules](FEATURES.md#letter-rules).
6. **Special wedges.** Bankrupt, Lose a Turn, Free Play, Wild Card, Gift Tag, Mystery, Express and the Million Dollar Wedge each have their own behavior; see [Game Modes](MODES.md).
7. **Solving.** Click the left tab, which now says **Solve**.
   - With the Solve Button set to **reveal** (default) the puzzle reveals at once and you decide whether the answer was right.
   - With it set to **verify**, a box asks you to type the player's answer. A correct answer reveals the puzzle; a wrong one shows "Incorrect Solve" and passes the turn. Type `/reveal` to show the puzzle without checking.
8. **Bank the money.** Click the **teal arrow** by the *winner's* totals score (**Transfer Totals**). Only the winner's round score is added to their totals; then **everyone's round scores reset to $0**. If the winner's round score is below the house minimum ($1,000 by default), you will be asked to confirm the minimum is awarded instead.
9. **Next puzzle.** Click **Load Puzzle** again. Click **Clear Board** (top right) if you only want to wipe the board without scoring.

## 3. Changing rounds

The button next to Load Puzzle (it starts as **Normal Round**) switches the wheel and rules for the next round. Each click advances:

**Normal → Mystery → Express → Final Spin → Bonus Round → back to Normal**

## 4. The Bonus Round

1. Move to the **Bonus Round** with the round button and load the puzzle.
2. Use the **RSTLNE** button to give the contestant R, S, T, L, N and E, then click the blue tiles to reveal them.
3. The contestant picks three more consonants and a vowel (a fourth consonant if they hold the Wild Card). Click those letters in the letter selector and reveal the tiles.
4. A **10-second** countdown runs for the solve.
5. With Extra Features on, the **Bonus Wheel** button at the top right of the board opens the 24-envelope prize wheel. See [Features](FEATURES.md).

## 5. Ending the game

Click **End Game** (top right). You can **end the show**, **wipe all scores**, or **wipe all puzzles and scores**, or go back. Your game autosaves in the browser either way.

## What to say as host

| Moment | Line |
|---|---|
| Opening | "Good evening, and welcome to *Wheel of Fortune*!" |
| Before a spin | "Give it a spin!" |
| After a spin | "[Amount]! Pick a consonant." |
| Correct letter | "There are two of those. That's [amount]!" |
| Wrong letter | "Sorry, no [letter]'s." |
| Bankrupt | "Oh no, Bankrupt!" |
| Vowel | "You can buy a vowel for $250." |
| Solving | "Do you want to solve?" |
| Solved | "You've got it!" |
| Closing | "Thanks for playing, and thanks to Games by Tim for the inspiration!" |

## Tips

- **Hosting over a video call?** Share the browser tab and use full screen.
- **Using a real wheel?** Click the Value Panel to set the spun value by hand.
- **Don't use the browser's Back button or reload** mid-game; use the on-screen buttons. (Autosave should recover a reload, but don't test it live.)
- **Move to another computer:** **⋯ → Save game file**, then **Load game file** on the other computer.
- Keep a second copy of `index.html` on a flash drive in case the network is down.
