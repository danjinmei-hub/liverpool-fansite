import { chromium } from "playwright-core";
import { staticServer } from "../scripts/serve-static.mjs";
import fs from "node:fs";
const server = staticServer("../out"); await new Promise(r=>server.listen(4173,r));
const b = await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
const ctx = await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
const out = {};
async function open(p){const pg=await ctx.newPage();await pg.goto("http://localhost:4173"+p,{waitUntil:"networkidle"});await pg.waitForTimeout(600);return pg;}
async function boxes(pg,sel){return pg.$$eval(sel,els=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,w:r.width,h:r.height,t:(e.innerText||"").slice(0,30).replace(/\n/g," ")}}));}
const home = await open("/");
for (const s of [".hero",".last-match",".next-match",".standings-card",".matchday",".squad-grid",".squad-grid > *",".tactics-section",".coach-panel",".principles-grid > *",".updates-section",".news-card",".data-promise",".archive-section",".captain-strip",".site-header"]) out["home "+s]=await boxes(home,s);
async function shot(pg,sel,name,i=0){const els=await pg.$$(sel);await els[i].screenshot({path:`assets/shots/${name}.png`});}
await shot(home,".last-match","el-last");await shot(home,".next-match","el-next");await shot(home,".standings-card","el-table");
await shot(home,".coach-panel","el-coach");
for(let i=0;i<3;i++){await shot(home,".principles-grid > *",`el-pr${i}`,i);await shot(home,".news-card",`el-news${i}`,i);}
await shot(home,".data-promise","el-promise");await shot(home,".archive-section","el-archive");await shot(home,".captain-strip","el-captain");
const m = await open("/matches/"); for (const s of ["main > *","main section","[class*=row]","a"]) out["matches "+s]=(await boxes(m,s)).slice(0,25);
const d = await open("/matches/560582/"); await d.screenshot({path:"assets/shots/matchdetail.png",fullPage:true}); out.md = await boxes(d,"main > *");
fs.writeFileSync("assets/boxes.json",JSON.stringify(out,null,1));
await b.close(); server.close();
