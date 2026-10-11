# Binary Spiral

A twisting orange spiral drawn entirely with `0` and `1`. Each cell is a 5×7 pixel-font digit, shaded by how much light hits the surface at that point. It loops seamlessly every 4 seconds.

- `index.html`: open it in a browser for the live loop. Controls cover three shapes (twisted ribbon, double helix, twisted torus) and flowing bits. URL params: `?shape=helix`, `?flow=0`, `?clean` (hides the UI).
- `out/*.gif`, `out/*.mp4`: pre-rendered loops (96 frames @ 24fps).
- `export.mjs`: re-renders the loops, e.g. `node export.mjs ribbon 24 2` (shape, fps, integer upscale). Needs Playwright and ffmpeg.

## Why the loop is seamless
- Every shape has 180° symmetry, so the twist phase goes from 0 to π over one loop.
- Each bit is pinned to the surface using coordinates that don't change under that symmetry, so the digits match up at the seam.
- Flowing bits move exactly 12 cells per loop.
- The export renders `t = i/n` for `i < n`, so the last frame never duplicates the first.
