import { chromium } from "playwright-core";
import { staticServer } from "../scripts/serve-static.mjs";
const server = staticServer("../out"); await new Promise(r=>server.listen(4173,r));
const b = await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
const ctx = await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
const pages = {home:"/",matches:"/matches/",squad:"/squad/",vvd:"/players/virgil-van-dijk/",dom:"/players/dominik-szoboszlai/",history:"/history/"};
for (const [k,p] of Object.entries(pages)) {
  const pg = await ctx.newPage(); await pg.goto("http://localhost:4173"+p,{waitUntil:"networkidle"}); await pg.waitForTimeout(800);
  const h = await pg.evaluate(()=>document.documentElement.scrollHeight);
  console.log(k,h);
  await pg.screenshot({path:`assets/shots/${k}.png`,fullPage:true}); await pg.close();
}
const pg = await ctx.newPage(); await pg.goto("http://localhost:4173/matches/",{waitUntil:"networkidle"});
console.log(await pg.$$eval("a",as=>as.map(a=>a.getAttribute("href")).filter(h=>h&&h.includes("matches/")).slice(0,6)));
await b.close(); server.close();
