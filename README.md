# Win Mancala — Avalanche solver

Same original vertical interface, now using Avalanche relay rules. This is a separate app; the previously delivered Capture version remains available.

## Mobile and desktop

The board scales to the available screen width. On phones the strategy selector spans a second row, all inputs and buttons are at least 46px tall, and select text is 16px to avoid focus zoom in mobile Safari. Safe-area padding accommodates screen edges. After a search finishes, the page scrolls to the result; reduced-motion preferences are respected. Desktop uses a wider board and three settings columns. Pinch zoom remains enabled.

## Use

My pits are the left column, opponent pits the right column. Both columns are numbered 1–6 from top to bottom. My store is below the board; opponent store is above it. Copy all 12 current counts and both scores, including zeros. Select My turn and press Find Best Move. Use the blue outlined pit. Update the board after each actual move and search again. Opponent's turn is optional and shows their strongest reply.

All counts must be whole numbers from 0 through 999. Randomized totals are supported. Load example fills a sample board; Reset / Clear empties the pits and zeros the stores. Editing the board cancels the search and removes stale recommendations. Suggestions do not play a move automatically.

## Prefer a close win

This is the default strategy. When every root option has been evaluated to game end without relying on a depth-limit heuristic, it chooses the smallest positive minimax margin among the available first moves. This means a narrower winning outcome under strongest future play, rather than automatically maximizing the score difference. If the position has not been solved, it uses the strongest estimated move and says so. If there is no winning option, it chooses the best available result.

The exact margin assumes optimal future score play by both sides under the implemented rules. Later close-win selections and the opponent's actual choices can change it. No program can guarantee that every starting position is winnable or force an exact narrow margin against every opponent. Recalculate after each move. The option does not intentionally select a known draw or loss when a proven winning move is available.

Choose Strongest winning margin to maximize My score advantage. When analyzing Opponent's turn, the search always favors their strongest play.

## Avalanche rules

- Sow around the ring, including the mover's store and skipping the opponent's store.
- If the last stone lands in a pit that now contains more than one stone, pick up ALL stones in that pit and continue sowing. Relay pickups apply to either player's side.
- A last stone in a previously empty pit ends the move. There is no opposite-pit capture.
- A last stone in the mover's store grants another selection, unless the game has ended.
- After the complete relay chain, either side having no stones ends the game; each player collects their own remaining stones into their store. Empty sides during a relay do not end the chain.

Relay behavior was cross-checked against the independently maintained [Game-Pigeon-Solvers Avalanche implementation](https://github.com/k-gerner/Game-Pigeon-Solvers/blob/master/mancalaavalanche/python/classes.py). The empty-side collection convention is explicit above; that reference focuses on finding moves within a turn and does not implement whole-game terminal scoring. This app is unofficial and has not been verified against a physical iPhone.

## Upload to GitHub Pages

Extract WinMancala-Avalanche.zip and upload the contents to the root of your repository: index.html, main.js, style.css, favicon.ico, GamePigeon.png, GitHub-Mark-Light-64px.png. README and test report may also be uploaded. Keep capitalization and paths unchanged.

Enable repository Settings → Pages → Deploy from a branch → main → / (root). Open the resulting site URL. No build, account, API key or backend is required. For local testing, run an HTTP server in this folder; direct file URLs may block the worker.

## Search and verification

Iterative-deepening alpha-beta minimax considers both players and retains the mover on extra turns. Each root option uses a full search window, so its score is not mistaken for a pruning bound when comparing winning margins. Cache keys include board, player and depth. Entries include bound type and whether a heuristic frontier remains unresolved. Search runs in a Web Worker with 1, 3 or 10-second budgets and a depth cap of 64. Only complete iterations produce recommendations. Unsolved results are clearly labeled as estimates.

Original appearance and supplied image/favicon assets are preserved. See TEST-REPORT.txt for the tests performed. No live site was published as part of this delivery.
