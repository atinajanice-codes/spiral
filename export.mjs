// Renders index.html frame-by-frame in headless Chromium and encodes a seamless
// loop as GIF + MP4 with ffmpeg.
//
//   node export.mjs [strands=2] [color=orange] [width=0.5] [fps=24] [scale=1]
//
// Output: out/<strands>-strand-<color>.gif and .mp4
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const [strands = '2', color = 'orange', width = '0.5', fps = '24', scale = '1'] = process.argv.slice(2);
const name = `${strands}-strand-${color}`;
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'out');
const frameDir = path.join(outDir, `frames-${name}`);
rmSync(frameDir, { recursive: true, force: true });
mkdirSync(frameDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage();
const url = pathToFileURL(path.join(here, 'index.html'));
url.search = `?manual&clean&strands=${strands}&color=${color}&width=${width}`;
await page.goto(url.href);

const { loop } = await page.evaluate(() => ({ loop: window.binarySpiral.LOOP_SECONDS }));
const n = Math.round(loop * Number(fps));
for (let i = 0; i < n; i++) {
  // i / n, never 1: frame n would duplicate frame 0 and stutter the loop.
  const dataUrl = await page.evaluate(t => {
    window.binarySpiral.render(t);
    return document.getElementById('c').toDataURL('image/png');
  }, i / n);
  writeFileSync(path.join(frameDir, `${String(i).padStart(4, '0')}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
}
await browser.close();

const input = ['-y', '-framerate', fps, '-i', path.join(frameDir, '%04d.png')];
const scaleFilter = `scale=iw*${scale}:ih*${scale}:flags=neighbor`;
execFileSync('ffmpeg', [...input, '-vf',
  `${scaleFilter},split[a][b];[a]palettegen=max_colors=32:reserve_transparent=0[p];[b][p]paletteuse=dither=none`,
  '-loop', '0', path.join(outDir, `${name}.gif`)], { stdio: 'inherit' });
execFileSync('ffmpeg', [...input, '-vf', `${scaleFilter},pad=ceil(iw/2)*2:ceil(ih/2)*2`,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', path.join(outDir, `${name}.mp4`)], { stdio: 'inherit' });
rmSync(frameDir, { recursive: true, force: true });
console.log(`wrote out/${name}.gif and out/${name}.mp4 (${n} frames @ ${fps}fps)`);
