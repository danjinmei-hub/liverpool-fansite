// usage: node render.mjs stills 3 8 15 ...   |   node render.mjs video out.mp4 [fps]
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--disable-web-security', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`http://127.0.0.1:${port}/index.html`);
await page.evaluate(() => window.ready);

const grab = async (t, q = 0.95) => {
  const b64 = await page.evaluate(([t, q]) => { window.render(t); return document.getElementById('c').toDataURL('image/jpeg', q).slice(23); }, [t, q]);
  return Buffer.from(b64, 'base64');
};

const [mode, ...rest] = process.argv.slice(2);
if (mode === 'stills') {
  fs.mkdirSync(path.join(root, 'stills'), { recursive: true });
  for (const t of rest) fs.writeFileSync(path.join(root, 'stills', `t${t}.jpg`), await grab(parseFloat(t), .9));
} else {
  const out = rest[0], fps = +(rest[1] || 30), N = 60 * fps;
  const ff = spawn(process.env.FFMPEG, ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let i = 0; i < N; i++) {
    const buf = await grab(i / fps, 0.96);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${N}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
await browser.close();
server.close();
