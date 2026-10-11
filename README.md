# Binary DNA

Twisting strands drawn entirely with `0` and `1`. Each cell is a 5×7 pixel-font digit, shaded by how much light hits the surface at that point. It loops seamlessly every 4 seconds.

- `index.html`: the interactive page. The panel on the bottom left has:
  - **Color**: purple, red, yellow, orange, pink, blue
  - **Strands**: 2–6
  - **Width**: skinny strands merge into one grooved rope; fat strands pull apart until gaps open between them

  The subtitle under the title names the current strand (e.g. *Two-strand orange*). Settings are kept in the URL (`?color=blue&strands=4&width=0.8`) so you can share a link. Add `?clean` to hide the panel. Space pauses the animation.
- `out/*.gif`, `out/*.mp4`: pre-rendered loops (96 frames @ 24fps).
- `export.mjs`: renders a loop, e.g. `node export.mjs 4 pink 0.7` (strands, color, width, then optional fps and integer upscale). Needs Playwright and ffmpeg.

## Run locally
```sh
git clone https://github.com/atinajanice-codes/spiral.git
cd spiral
git checkout claude/gifted-gates-ud08vc
```
Then just double-click `index.html` (no server or install needed), or `npm start` and open http://localhost:3000.

To re-render the GIF/MP4 (needs Node 18+ and ffmpeg on your PATH):
```sh
npm install
npx playwright install chromium
npm run export -- 4 pink 0.7 24 2   # strands, color, width, fps, upscale
```

## Why the loop is seamless
- N strands look identical after a 2π/N turn, so each loop twists by a whole number of those turns (about half a turn).
- Each bit is pinned to its strand's own local frame, which is the same for every strand, so the digits match up at the seam.
- The bit pattern repeats every 24 cells along a strand, and flowing bits move exactly 24 cells per loop.
- The export renders `t = i/n` for `i < n`, so the last frame never duplicates the first.
