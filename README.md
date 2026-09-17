# Win Mancala — original UI, manual Capture solver

This revision keeps the supplied app's vertical two-column board, original colors, header, footer, rounded pits and blue move outline.

## Use

1. Copy the current GamePigeon board. My pits are the LEFT column, opponent pits the RIGHT column. Opponent store is at the TOP; My store is at the BOTTOM. Both columns are numbered 1–6 from TOP to BOTTOM. Opposite pits share the same number.
2. Enter all 12 pit values, including zeros, and both store scores.
3. Select whose turn it is and press Find Best Move. The result states the column and pit number; the selected pit has a blue outline and MOVE label.
4. Update the counts after each real move and search again. An extra turn belongs to the same player. Editing the inputs clears the previous suggestion.

Reset / Clear empties the pits and resets both stores to zero. Load example supplies a nonuniform 48-stone example. Input fields edit the board; clicking a pit does not automatically play a move.

Capture rules include sowing down My column, into My store, up the opponent column, and skipping the opponent store; the opponent sows up the right column into the top store, then down the left column, skipping My store. Landing in your store gives an extra turn. Landing in an empty own pit captures the landing stone plus the occupied opposite pit. An empty column ends the game and remaining stones are collected into their owner's store. Randomized counts are supported without assuming a total of 48 or a winning score of 25.

Search runs in a background worker using iterative deepening, alpha-beta minimax and depth-aware bound caching. Choose 1, 3 or 10 seconds. Recommendations are time-limited estimates, not guaranteed wins.

## GitHub Pages

Extract the ZIP and upload its contents to the repository root, keeping these files together:

- index.html
- style.css
- main.js
- favicon.ico
- GamePigeon.png
- GitHub-Mark-Light-64px.png

Enable Settings → Pages → Deploy from a branch → main → / (root). Open the published URL. No build or backend is needed. Local previews need an HTTP server because browsers may block workers from file URLs.

## Changes and verification

The original HTML/CSS and assets were read from the supplied WinMancala-master folder. The supplied JavaScript was inspected: its automatic fixed-depth search, depthless cache, asymmetric capture check, and fixed-score terminal logic were replaced with the tested Capture engine. The original files in D: were not overwritten; this folder is the revised upload-ready copy.

Engine checks passed: 60 comparisons against naive minimax, explicit capture/extra-turn/collection fixtures, and 4,155 legal transitions preserving stones. The revised browser interface was checked for mapping, move suggestions, reset and console errors, including a 390px phone viewport.

The supplied [Ez3d reference](https://github.com/Ez3d/Mancala-Solver) targets Avalanche mode and screenshot recognition with Google Cloud Vision. Its rules are not used for this Capture solver.

Original project attribution and image assets are preserved from the supplied app.

