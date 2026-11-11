# Chess GIF Editor

Turns a chess game in PGN format, for example a Chess.com export, into an animated MP4 or GIF. Pieces slide between squares instead of jumping. Everything runs in the browser, and after the first visit the app works offline.

Live at https://chess.orciuolo.it

## Use

Paste a PGN, open a `.pgn` file, or drop one on the text box. Pick the range of plies, board theme and colors, size, orientation, labels and timing, then press Export. Settings and the last game stay in your browser.

MP4 export uses WebCodecs, so it needs a recent Chrome, Edge or Safari. GIF export works everywhere.

## Develop

```
npm install
npm run dev     # local server with live reload
npm test        # unit tests
npm run build   # static site in dist/
```

The build is plain static files. `Dockerfile` serves them with nginx, and `deploy/` holds the scripts and proxy config for the hosted copy.

## Credits

Code under the MIT license. Pieces are the cburnett set by Colin M.L. Burnett, under CC BY-SA 3.0. PGN parsing by chess.js, MP4 muxing by Mediabunny, GIF encoding by gifenc.
