import { chromium } from "playwright-core";
import { serve } from "./server.mjs";
import { spawn } from "node:child_process";
import fs from "node:fs";
const args = Object.fromEntries(process.argv.slice(2).map(a=>a.replace(/^--/,"").split("=")));
const FPS=30, W=1920,H=1080;
const PORT = 4180 + Number(args.port ?? 0); const srv = await serve(PORT);
const b = await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome",args:["--disable-gpu-vsync","--force-color-profile=srgb","--font-render-hinting=none"]});
async function page(){
  const ctx = await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
  const p = await ctx.newPage();
  p.on("pageerror",e=>console.log("PAGEERR",e.message)); p.on("response",r=>{if(r.status()>=400)console.log("HTTP",r.status(),r.url())});
  await p.goto(`http://localhost:${PORT}/stage.html`); await p.evaluate(()=>window.ready);
  // warm fonts: touch every scene
  const info = await p.evaluate(()=>window.scenesInfo);
  for (const [a,z] of info) { await p.evaluate(t=>window.setTime(t),a+(z-a)*0.5); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(250); }
  await p.evaluate(()=>document.fonts.ready);
  return p;
}
if (args.stills) {
  const p = await page(); fs.mkdirSync("stills",{recursive:true});
  for (const t of args.stills.split(",").map(Number)) { await p.evaluate(t=>window.setTime(t),t); await p.screenshot({path:`stills/t${String(t).padStart(6,"0")}.png`}); }
} else {
  const from=Number(args.from??0), to=Number(args.to??120); const out=args.out??`chunks/c_${from}.mp4`; fs.mkdirSync("chunks",{recursive:true});
  const p = await page();
  const ff = spawn(process.env.FFMPEG,["-y","-loglevel","error","-f","image2pipe","-framerate",String(FPS),"-c:v","mjpeg","-i","-","-c:v","libx264","-preset","medium","-crf","14","-pix_fmt","yuv420p","-r",String(FPS),out],{stdio:["pipe","inherit","inherit"]});
  const f0=Math.round(from*FPS), f1=Math.round(to*FPS); const t0=Date.now();
  for(let f=f0;f<f1;f++){
    await p.evaluate(t=>window.setTime(t),f/FPS);
    const buf = await p.screenshot({type:"jpeg",quality:96});
    if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once("drain",r));
    if((f-f0)%30===0) console.log(`chunk ${from}: ${f-f0}/${f1-f0} ${((Date.now()-t0)/1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r=>ff.on("close",r));
}
await b.close(); srv.close();
