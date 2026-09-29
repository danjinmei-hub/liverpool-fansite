/* RED CHORUS promo — deterministic timeline stage. window.setTime(t) draws frame at t seconds. */
(() => {
const B = 0.625; // beat @ 96 BPM
const TOTAL = 120;
const C = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const P = (t, a, d) => C((t - a) / d);
const eo3 = (x) => 1 - Math.pow(1 - x, 3);
const eo5 = (x) => 1 - Math.pow(1 - x, 5);
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const bo = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const cam = document.getElementById("cam");
const scenes = [];

function box(parent, cls = "", css = {}, html = "") {
  const d = document.createElement("div");
  if (cls) d.className = cls;
  Object.assign(d.style, css);
  if (html) d.innerHTML = html;
  parent.appendChild(d);
  return d;
}
function img(parent, src, css = {}) {
  const i = document.createElement("img");
  i.src = src;
  Object.assign(i.style, css);
  parent.appendChild(i);
  return i;
}
function tf(el, { x = 0, y = 0, s = 1, r = 0, o, rx, ry, sk } = {}) {
  let t = `translate3d(${x}px,${y}px,0)`;
  if (rx !== undefined) t += ` rotateX(${rx}deg)`;
  if (ry !== undefined) t += ` rotateY(${ry}deg)`;
  if (r) t += ` rotate(${r}deg)`;
  if (sk) t += ` skewX(${sk}deg)`;
  if (s !== 1) t += ` scale(${s})`;
  el.style.transform = t;
  if (o !== undefined) el.style.opacity = o;
}
function scene(t0, t1, css = {}) {
  const root = box(cam, "scene", css);
  const sc = { t0, t1, root, update() {} };
  scenes.push(sc);
  return sc;
}
// split a string into per-char spans inside a masked line
function line(parent, text, css = {}, hl = {}) {
  const m = box(parent, "mask", css);
  const chars = [];
  [...text].forEach((c, i) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = c === " " ? " " : c;
    if (hl.range && i >= hl.range[0] && i < hl.range[1]) Object.assign(s.style, hl.css);
    m.appendChild(s);
    chars.push(s);
  });
  return { m, chars };
}
// per-char slide in / out (percent of own height)
function slide(chars, lt, start, stag, dur, endAt = 1e9, exitDur = 0.35) {
  chars.forEach((c, i) => {
    const inP = eo5(C((lt - start - i * stag) / dur));
    const outP = eio(C((lt - endAt - i * stag * 0.4) / exitDur));
    c.style.transform = `translateY(${(1 - inP) * 118 - outP * 118}%)`;
    c.style.opacity = inP > 0 ? 1 : 0;
  });
}

// browser mock-up: w = displayed width; returns scroll(cssPx)
function mock(parent, src, w, vh, url = "redchorus.com") {
  const root = box(parent, "mock", { width: w + "px", height: vh + 52 + "px" });
  const bar = box(root, "bar");
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c) => box(bar, "dot", { background: c }));
  box(bar, "url", {}, url);
  const vp = box(root, "vp", { height: vh + "px" });
  const layer = box(vp, "", { position: "absolute", left: 0, top: 0, width: w + "px" });
  const im = img(layer, src, { width: w + "px", height: "auto", display: "block" });
  const k = w / 1440;
  return { root, vp: layer, k, scroll: (y) => { layer.style.transform = `translateY(${-y * k}px)`; } };
}
function ring(mk, x, y, w, h, label, lx = 0, ly = -46) {
  const r = box(mk.vp, "ring", { left: x * mk.k + "px", top: y * mk.k + "px", width: w * mk.k + "px", height: h * mk.k + "px" });
  const l = box(mk.vp, "ringlabel", { left: x * mk.k + lx + "px", top: y * mk.k + ly + "px" }, label);
  return { r, l, set(p, pulse = 0) { r.style.opacity = p; l.style.opacity = p; r.style.transform = `scale(${lerp(1.06, 1, eo3(p)) + pulse * 0.012})`; l.style.transform = `translateY(${(1 - eo3(p)) * 12}px)`; } };
}
function bgOutline(parent, text, css) {
  return box(parent, "disp", Object.assign({ position: "absolute", color: "transparent", WebkitTextStroke: "3px rgba(244,241,235,.10)", whiteSpace: "nowrap", lineHeight: 0.9 }, css), text);
}
function cropDiv(parent, src, x, y, w, h, s) {
  return box(parent, "", { position: "absolute", width: w * s + "px", height: h * s + "px", backgroundImage: `url(${src})`, backgroundSize: `${1440 * s}px auto`, backgroundPosition: `${-x * s}px ${-y * s}px` });
}

let BOX = null;
const hb = (k, i = 0) => BOX[k][i];

function build() {
/* ---------------------------------------------------------------- 1. HOOK 0–10 */
{
  const s = scene(0, 10, { background: "#050404" });
  const cv = document.createElement("canvas");
  cv.width = 960; cv.height = 540;
  Object.assign(cv.style, { position: "absolute", inset: 0, width: "1920px", height: "1080px" });
  s.root.appendChild(cv);
  const g = cv.getContext("2d");
  const glow = box(s.root, "", { position: "absolute", left: "-10%", right: "-10%", bottom: "-30%", height: "80%", background: "radial-gradient(ellipse at 50% 100%, rgba(200,16,46,.75), rgba(53,0,12,.0) 62%)" });
  const stage1 = box(s.root, "", { position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "10px" });
  const l1a = line(stage1, "看球的人，", { fontSize: "150px", fontWeight: 900 });
  const l1b = line(stage1, "从来不缺比分。", { fontSize: "150px", fontWeight: 900 }, { range: [4, 6], css: { color: "#e31b3d" } });
  const stage2 = box(s.root, "", { position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" });
  const l2 = line(stage2, "缺的是", { fontSize: "230px", fontWeight: 900 });
  const dash = box(stage2, "", { height: "14px", width: "0px", background: "var(--lime)", marginTop: "10px", transformOrigin: "left" });
  const stage3 = box(s.root, "", { position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "14px" });
  const l3a = line(stage3, "一个说中文的，", { fontSize: "118px", fontWeight: 900 });
  const l3b = line(stage3, "把每一场都留下来的地方。", { fontSize: "118px", fontWeight: 900 }, { range: [1, 4], css: { color: "#dfff5b" } });
  // flash montage
  const flashes = [
    { w: "赛果", bg: "#c8102e", el: "el-last", ang: -5, sc: 1.9 },
    { w: "赛程", bg: "#100e0e", el: "el-next", ang: 4, sc: 1.75 },
    { w: "积分", bg: "#f4f1eb", el: "el-table", ang: -3, sc: 1.8, dark: true },
    { w: "阵容", bg: "#35000c", ph: "wirtz.jpg", pos: "50% 14%", ang: 0 },
    { w: "球员", bg: "#c8102e", ph: "isak.jpg", pos: "50% 12%", ang: 0 },
    { w: "战术", bg: "#dfff5b", el: "el-coach", ang: 3, sc: 1.05, dark: true },
    { w: "历史", bg: "#35000c", el: "el-archive", ang: -2, sc: 0.62 },
  ].map((f, i) => {
    const d = box(s.root, "", { position: "absolute", inset: 0, background: f.bg, visibility: "hidden", overflow: "hidden" });
    box(d, "", { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "760px", fontWeight: 900, color: f.dark ? "rgba(16,14,14,.10)" : "rgba(255,255,255,.10)", whiteSpace: "nowrap", letterSpacing: "-.04em" }, f.w);
    let inner;
    if (f.el) {
      inner = box(d, "", { position: "absolute", left: "50%", top: "50%", width: "0", height: "0" });
      const im = img(inner, `/assets/shots/${f.el}.png`, { position: "absolute", height: "auto", width: (f.el === "el-archive" ? 2880 : 956 / 2) * f.sc + "px", left: "0", top: "0", transform: "translate(-50%,-50%)", boxShadow: "0 50px 100px rgba(0,0,0,.55)" });
      f.im = im;
    } else {
      inner = box(d, "", { position: "absolute", left: "50%", top: "50%", width: "0", height: "0" });
      box(inner, "", { position: "absolute", width: "820px", height: "1040px", left: "-410px", top: "-520px", backgroundImage: `url(/assets/players/${f.ph})`, backgroundSize: "cover", backgroundPosition: f.pos, transform: "skewX(-6deg)", boxShadow: "0 50px 100px rgba(0,0,0,.55)" });
    }
    box(d, "", { position: "absolute", left: 0, right: 0, bottom: "70px", textAlign: "center", fontSize: "54px", fontWeight: 900, letterSpacing: ".5em", color: f.dark ? "#111" : "#fff" }, f.w.split("").join(" "));
    return { d, inner, f, i };
  });
  const blk = box(s.root, "", { position: "absolute", inset: 0, background: "#000", opacity: 0 });
  s.update = (lt) => {
    // embers
    g.clearRect(0, 0, 960, 540);
    g.globalCompositeOperation = "lighter";
    const inten = 0.35 + lt * 0.06;
    for (let i = 0; i < 140; i++) {
      const sp = 26 + rnd(i + 3) * 70;
      const y = 560 - ((lt * sp + rnd(i + 9) * 700) % 640);
      const x = rnd(i) * 960 + Math.sin(lt * (0.6 + rnd(i + 2)) + i) * 26;
      const a = (0.25 + 0.75 * rnd(i + 5)) * inten * (0.6 + 0.4 * Math.sin(lt * 9 + i));
      const r = 1 + rnd(i + 7) * 2.6;
      g.fillStyle = `rgba(${230 + rnd(i) * 25 | 0},${50 + rnd(i + 1) * 90 | 0},30,${C(a, 0, 1)})`;
      g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    }
    glow.style.opacity = 0.35 + 0.65 * P(lt, 0, 9);
    tf(glow, { y: lerp(200, 0, eo3(P(lt, 0, 6))) });
    slide(l1a.chars, lt, 0.5, 0.06, 0.6, 2.75, 0.4);
    slide(l1b.chars, lt, 0.85, 0.05, 0.6, 2.75, 0.4);
    slide(l2.chars, lt, 3.05, 0.09, 0.6, 5.0, 0.35);
    dash.style.width = 620 * eo5(P(lt, 3.6, 0.9)) + "px";
    dash.style.opacity = 1 - P(lt, 5.0, 0.25);
    slide(l3a.chars, lt, 5.3, 0.045, 0.55, 7.55, 0.3);
    slide(l3b.chars, lt, 5.55, 0.035, 0.55, 7.55, 0.3);
    const sc = 1 + lt * 0.006;
    stage1.style.transform = stage3.style.transform = `scale(${sc})`;
    stage2.style.transform = `scale(${1 + P(lt, 3, 2) * 0.05})`;
    // flashes
    const f0 = 7.8125;
    flashes.forEach(({ d, inner, f, i }) => {
      const a = f0 + i * (B / 2);
      const on = lt >= a && lt < a + B / 2;
      d.style.visibility = on ? "inherit" : "hidden";
      if (on) {
        const p = P(lt, a, 0.22);
        const k = lerp(1.22, 1, eo5(p));
        tf(inner, { s: k, r: f.ang * (1 - 0.3 * p) });
      }
    });
    blk.style.opacity = P(lt, 9.72, 0.06);
  };
}

/* ---------------------------------------------------------------- 2. TITLE 10–17.5 */
{
  const s = scene(10, 17.5, { background: "#1b0006" });
  const bg = img(s.root, "/assets/anfield-cc0.jpg", { position: "absolute", left: "-5%", top: "-5%", width: "110%", height: "110%", objectFit: "cover", filter: "saturate(1.25) contrast(1.1)" });
  box(s.root, "", { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(40,0,10,.96) 0%, rgba(53,0,12,.88) 40%, rgba(53,0,12,.25) 78%, rgba(53,0,12,.55) 100%)" });
  box(s.root, "", { position: "absolute", left: 0, top: 0, bottom: 0, width: "22px", background: "var(--red2)" });
  const eyebrow = box(s.root, "osw", { position: "absolute", left: "112px", top: "70px", fontSize: "30px", color: "var(--lime)", display: "flex", alignItems: "center", gap: "22px" });
  const eb1 = box(eyebrow, "", { width: "70px", height: "5px", background: "var(--lime)" });
  const eb2 = box(eyebrow, "", {}, "2026 / 27 · ANFIELD");
  const letters = (word, top, size, color, stroke) => {
    const row = box(s.root, "disp", { position: "absolute", left: "104px", top: top + "px", fontSize: size + "px", lineHeight: 1, whiteSpace: "nowrap", color: stroke ? "transparent" : color, WebkitTextStroke: stroke ? `4px ${color}` : "0", display: "flex" });
    const m = box(row, "", { overflow: "hidden", padding: "0 30px 0 0", display: "flex" });
    return [...word].map((c) => box(m, "", { display: "inline-block" }, c));
  };
  const RED = letters("RED", 110, 400, "#fff");
  const CHO = letters("CHORUS", 462, 400, "#fff");
  const zh = line(s.root, "红潮同行", { position: "absolute", left: "112px", top: "868px", fontSize: "104px", fontWeight: 900, color: "var(--lime)", letterSpacing: ".22em" });
  const tag = box(s.root, "", { position: "absolute", left: "116px", top: "1004px", fontSize: "34px", fontStyle: "italic", fontFamily: '"Noto Serif SC", serif', color: "rgba(244,241,235,.86)", fontWeight: 900, whiteSpace: "nowrap" });
  const tagText = "For those who never walk alone.";
  const items = ["赛果与积分", "阵容与球员", "战术观察", "红军历史", "核验过的事实"].map((t, i) => {
    const d = box(s.root, "", { position: "absolute", left: "1420px", top: 250 + i * 118 + "px", width: "420px", display: "flex", alignItems: "baseline", gap: "22px", borderTop: "2px solid rgba(244,241,235,.35)", paddingTop: "16px" });
    box(d, "disp", { fontSize: "34px", color: "var(--lime)" }, "0" + (i + 1));
    box(d, "", { fontSize: "42px", fontWeight: 900 }, t);
    return d;
  });
  const issue = box(s.root, "disp", { position: "absolute", right: "70px", bottom: "40px", fontSize: "150px", color: "var(--lime)", lineHeight: 1 }, "001");
  const issueL = box(s.root, "osw", { position: "absolute", right: "330px", bottom: "150px", fontSize: "28px" }, "ISSUE");
  const fl = box(s.root, "", { position: "absolute", inset: 0, background: "#fff", opacity: 0 });
  s.update = (lt) => {
    tf(bg, { s: lerp(1.22, 1.04, eo3(P(lt, 0, 7.5))), x: lerp(-40, 30, P(lt, 0, 7.5)) });
    const e = eo3(P(lt, 0.3, 0.6));
    eyebrow.style.opacity = e; tf(eyebrow, { x: (1 - e) * -60 });
    [RED, CHO].forEach((row, r) => row.forEach((c, i) => {
      const p = eo5(P(lt, 0.05 + r * 0.32 + i * 0.05, 0.55));
      tf(c, { y: (1 - p) * 380, s: 1, sk: (1 - p) * -14 });
      c.style.opacity = p > 0 ? 1 : 0;
    }));
    slide(zh.chars, lt, 1.25, 0.12, 0.7);
    // typewriter tagline
    const n = Math.floor(P(lt, 2.2, 1.6) * tagText.length);
    tag.textContent = tagText.slice(0, n) + (n < tagText.length && Math.floor(lt * 4) % 2 === 0 ? "▍" : "");
    items.forEach((d, i) => { const p = eo5(P(lt, 2.6 + i * 0.22, 0.6)); tf(d, { x: (1 - p) * 140 }); d.style.opacity = p; });
    tf(issue, { y: (1 - eo3(P(lt, 3.6, 0.6))) * 200 }); issueL.style.opacity = P(lt, 3.9, 0.3);
    fl.style.opacity = (1 - P(lt, 0, 0.45)) * 0.95;
  };
}

/* ---------------------------------------------------------------- 3. MATCHDAY 17.5–40 */
{
  const s = scene(17.5, 40, { background: "linear-gradient(135deg,#100e0e 0%,#1d0308 60%,#35000c 100%)" });
  const persp = box(s.root, "", { position: "absolute", inset: 0, perspective: "2600px" });
  const wordbg = bgOutline(s.root, "MATCHDAY", { left: "0", top: "560px", fontSize: "760px" });
  const tagA = box(s.root, "tag", { position: "absolute", left: "96px", top: "150px" }, "01 / MATCHDAY");
  const capA = box(s.root, "", { position: "absolute", left: "96px", top: "230px", width: "700px" });
  const cA1 = line(capA, "赛果、赛程、", { fontSize: "104px", fontWeight: 900 });
  const cA2 = line(capA, "积分榜。", { fontSize: "104px", fontWeight: 900 }, { range: [0, 4], css: { color: "#dfff5b" } });
  const cA3 = line(capA, "一屏看完。", { fontSize: "104px", fontWeight: 900 });
  const m = mock(persp, "/assets/shots/home.png", 1180, 737);
  const ringM = ring(m, 61, 681, 1320, 306, "MATCHDAY", 0, -48);
  // component cards
  const sc = 1.3;
  const defs = [
    { k: "el-last", w: 478, h: 262, cap: ["第 5 轮 · 客场", "伯恩茅斯 0–1 利物浦"], hl: [7, 9] },
    { k: "el-next", w: 478, h: 306, cap: ["下一场 · 10 月 11 日", "利物浦 vs 曼城"], hl: [10, 12] },
    { k: "el-table", w: 364, h: 306, cap: ["英超积分榜", "第 6 位 · 5 轮 9 分"], hl: [5, 8] },
  ];
  const gap = 46;
  const totalW = defs.reduce((a, d) => a + d.w * sc, 0) + gap * 2;
  let cx = (1920 - totalW) / 2;
  const cards = defs.map((d) => {
    const c = box(persp, "card", { width: d.w * sc + "px", height: d.h * sc + "px", left: cx + "px", top: "470px" });
    img(c, `/assets/shots/${d.k}.png`);
    d.x0 = cx; d.cx = cx + d.w * sc / 2; cx += d.w * sc + gap; return { c, d };
  });
  // LIV row highlight on table card
  const tcard = cards[2].c;
  const liv = box(tcard, "ring", { left: 27 * sc + "px", top: 222 * sc + "px", width: 310 * sc + "px", height: 28 * sc + "px", borderRadius: "6px" });
  const caps = defs.map((d, i) => {
    const w = box(s.root, "", { position: "absolute", left: "96px", top: "150px" });
    box(w, "tag", {}, ["02 / LAST MATCH", "03 / NEXT MATCH", "04 / TABLE"][i]);
    const a = line(w, d.cap[0], { fontSize: "58px", fontWeight: 700, color: "rgba(244,241,235,.8)", marginTop: "26px" });
    const b = line(w, d.cap[1], { fontSize: "104px", fontWeight: 900, marginTop: "6px" }, { range: d.hl, css: { color: "#dfff5b" } });
    return { w, a, b };
  });
  const stamp = box(s.root, "osw", { position: "absolute", left: "96px", bottom: "56px", fontSize: "26px", color: "rgba(244,241,235,.7)", display: "flex", alignItems: "center", gap: "16px" }, `<span style="width:14px;height:14px;border-radius:50%;background:var(--lime);display:inline-block"></span> football-data.org · 每 6 小时自动更新`);
  const starts = [5.625, 11.25, 16.875]; // lt of spotlight start
  s.update = (lt) => {
    tf(wordbg, { x: lerp(-200, -1500, lt / 22.5) });
    // phase A: browser
    const inA = eo5(P(lt, 0, 0.9)), outA = eio(P(lt, 5.0, 0.6));
    tf(m.root, { x: lerp(1000, 640, inA) - outA * 1500, y: lerp(160, 190, P(lt, 0, 5)), rx: lerp(10, 4, P(lt, 0, 5)), ry: lerp(-24, -12, P(lt, 0, 5)), s: 1 });
    m.scroll(lerp(0, 420, eio(P(lt, 0.6, 3.6))));
    ringM.set(eo3(P(lt, 2.8, 0.5)) * (1 - P(lt, 4.8, 0.4)), Math.sin(lt * 6));
    tagA.style.opacity = 1 - P(lt, 5.0, 0.3);
    slide(cA1.chars, lt, 0.4, 0.05, 0.6, 5.0, 0.3);
    slide(cA2.chars, lt, 0.65, 0.05, 0.6, 5.0, 0.3);
    slide(cA3.chars, lt, 0.9, 0.05, 0.6, 5.0, 0.3);
    // phase B: cards + captions
    cards.forEach(({ c, d }, i) => {
      const enter = eo5(P(lt, 5.2 + i * 0.16, 0.8));
      const act = lt >= starts[i] - 0.05 && (i === 2 || lt < starts[i + 1] - 0.05);
      // focus weight per card
      const f = i === 0 ? P(lt, starts[0], 0.6) * (1 - P(lt, starts[1] - 0.2, 0.6)) : i === 1 ? P(lt, starts[1], 0.6) * (1 - P(lt, starts[2] - 0.2, 0.6)) : P(lt, starts[2], 0.6);
      const fe = eo3(f);
      const target = 1.75;
      const scl = lerp(1, target / sc, fe);
      const dx = (1920 * 0.6 - d.cx) * fe;
      const dy = lerp(0, 90, fe);
      const dim = lt < starts[0] - 0.05 ? 1 : lerp(0.2, 1, fe);
      tf(c, { x: dx, y: (1 - enter) * 900 + dy, s: scl, ry: (1 - enter) * 30 + (1 - fe) * -6 + Math.sin(lt * 0.9 + i) * 1.2, rx: 0 });
      c.style.opacity = enter * dim;
      c.style.filter = fe < 0.98 && lt >= starts[0] - 0.05 ? `blur(${(1 - fe) * 5}px)` : "none";
      c.style.zIndex = Math.round(fe * 10);
      c.style.transformOrigin = "50% 50%";
    });
    liv.style.opacity = eo3(P(lt, starts[2] + 1.0, 0.4)); liv.style.transform = `scale(${1 + 0.02 * Math.sin(lt * 7)})`;
    caps.forEach(({ w, a, b }, i) => {
      const st = starts[i], en = i < 2 ? starts[i + 1] - 0.05 : 1e9;
      const vis = lt >= st - 0.05 && lt < en + 0.6;
      w.style.visibility = vis ? "inherit" : "hidden";
      slide(a.chars, lt, st + 0.1, 0.03, 0.5, en, 0.3);
      slide(b.chars, lt, st + 0.2, 0.04, 0.6, en, 0.3);
    });
    stamp.style.opacity = eo3(P(lt, 6.2, 0.6));
    const hideTags = lt >= starts[0] - 0.05;
  };
}

/* ---------------------------------------------------------------- 4. ARCHIVE 40–50 */
{
  const s = scene(40, 50, { background: "var(--paper)" });
  const persp = box(s.root, "", { position: "absolute", inset: 0, perspective: "2600px" });
  bgOutline(s.root, "ARCHIVE", { left: "40px", top: "600px", fontSize: "600px" }).style.webkitTextStroke = "3px rgba(16,14,14,.07)";
  box(s.root, "", { position: "absolute", left: 0, top: 0, bottom: 0, width: "22px", background: "var(--red)" });
  box(s.root, "tag", { position: "absolute", left: "96px", top: "150px", background: "#111", color: "var(--lime)" }, "05 / MATCH ARCHIVE");
  const cap = box(s.root, "", { position: "absolute", left: "96px", top: "240px", color: "#111" });
  const a1 = line(cap, "这一季，", { fontSize: "124px", fontWeight: 900 });
  const a2 = line(cap, "每一场", { fontSize: "124px", fontWeight: 900, color: "var(--red)" });
  const a3 = line(cap, "都留下来。", { fontSize: "124px", fontWeight: 900 });
  const sub = box(s.root, "", { position: "absolute", left: "100px", top: "850px", fontSize: "38px", fontWeight: 700, color: "#3b3535", lineHeight: 1.5 }, "赛果、日期、开球时间，<br>点进任意一场都有它自己的页面。");
  const m = mock(persp, "/assets/shots/matches.png", 1120, 700);
  // scoreboard punch-in
  const sb = box(persp, "", { position: "absolute", left: "560px", top: "300px", width: "1240px", height: "700px", boxShadow: "26px 26px 0 var(--red)", overflow: "hidden", background: "#fff", border: "2px solid #111" });
  const sbimg = img(sb, "/assets/shots/matchdetail.png", { position: "absolute", width: "1440px", left: "-160px", top: "-146px" });
  const sbs = 1240 / 1120;
  sbimg.style.width = 1440 * sbs + "px"; sbimg.style.left = -160 * sbs + "px"; sbimg.style.top = -146 * sbs + "px";
  const chip = box(s.root, "osw", { position: "absolute", left: "560px", top: "232px", fontSize: "28px", background: "#111", color: "var(--lime)", padding: "10px 18px" }, "redchorus.com / matches / 560582");
  s.update = (lt) => {
    const inP = eo5(P(lt, 0, 0.9)), out = eio(P(lt, 6.1, 0.55));
    tf(m.root, { x: lerp(1300, 640, inP) + out * 1300, y: 130, rx: lerp(8, 3, P(lt, 0, 6)), ry: lerp(-20, -10, P(lt, 0, 6)) });
    m.scroll(lerp(0, 1650, eio(P(lt, 0.5, 5.6))));
    slide(a1.chars, lt, 0.3, 0.06, 0.6, 6.0, 0.3);
    slide(a2.chars, lt, 0.55, 0.06, 0.6, 6.0, 0.3);
    slide(a3.chars, lt, 0.8, 0.05, 0.6, 6.0, 0.3);
    sub.style.opacity = eo3(P(lt, 1.6, 0.6)) * (1 - P(lt, 6.0, 0.3));
    const sp = eo5(P(lt, 6.25, 0.7));
    tf(sb, { x: (1 - sp) * 1600, y: 0, s: lerp(0.9, 1, sp) + P(lt, 6.9, 3) * 0.04, r: (1 - sp) * 4 });
    sb.style.opacity = sp > 0 ? 1 : 0;
    tf(chip, { y: (1 - sp) * -20 }); chip.style.opacity = sp;
  };
}

/* ---------------------------------------------------------------- 5. SQUAD 50–70 */
{
  const s = scene(50, 70, { background: "var(--ink)" });
  const players = [
    ["01", "Alisson", "门将", "alisson.jpg", "50% 18%"], ["04", "Van Dijk", "中卫", "van-dijk.jpg", "50% 18%"],
    ["06", "Kerkez", "左后卫", "kerkez.jpg", "82% 46%"], ["30", "Frimpong", "右后卫", "frimpong.jpg", "50% 18%"],
    ["38", "Gravenberch", "中场", "gravenberch.jpg", "50% 16%"], ["08", "Szoboszlai", "中场", "szoboszlai.jpg", "50% 13%"],
    ["07", "Wirtz", "中场", "wirtz.jpg", "50% 14%"], ["09", "Isak", "前锋", "isak.jpg", "50% 12%"],
    ["29", "B. Barcola", "边锋", "barcola.jpg", "57% 28%"], ["23", "V. Muñoz", "边锋", "victor-munoz.jpg", "50% 18%"],
  ];
  // 5A number flash
  const A = box(s.root, "", { position: "absolute", inset: 0 });
  const flash = players.map((p, i) => {
    const d = box(A, "", { position: "absolute", inset: 0, background: i % 2 ? "#c8102e" : "#1a0308", visibility: "hidden", overflow: "hidden" });
    box(d, "disp", { position: "absolute", left: "40px", top: "40px", fontSize: "1100px", lineHeight: 1, color: "transparent", WebkitTextStroke: "6px " + (i % 2 ? "rgba(255,255,255,.55)" : "rgba(223,255,91,.7)") }, p[0]);
    const ph = box(d, "", { position: "absolute", right: "150px", top: "-40px", width: "760px", height: "1160px", backgroundImage: `url(/assets/players/${p[3]})`, backgroundSize: "cover", backgroundPosition: p[4], transform: "skewX(-6deg)", boxShadow: "-30px 30px 0 rgba(0,0,0,.35)" });
    const nm = box(d, "disp", { position: "absolute", left: "96px", bottom: "110px", fontSize: "150px", color: "#fff", lineHeight: 1, textShadow: "0 8px 40px rgba(0,0,0,.4)" }, p[1]);
    const ps = box(d, "", { position: "absolute", left: "100px", bottom: "56px", fontSize: "42px", fontWeight: 900, color: i % 2 ? "#fff" : "var(--lime)", letterSpacing: ".3em" }, p[2]);
    return { d, ph, nm, ps };
  });
  const aTag = box(A, "tag", { position: "absolute", left: "96px", top: "60px", zIndex: 5 }, "06 / SQUAD");
  // 5B card marquee
  const Bg = box(s.root, "", { position: "absolute", inset: 0, background: "linear-gradient(180deg,#100e0e,#1d0308)", visibility: "hidden" });
  bgOutline(Bg, "SQUAD", { left: "-40px", top: "500px", fontSize: "900px" });
  const cs = 1.42;
  const rows = [0, 1].map((r) => box(Bg, "", { position: "absolute", left: 0, top: 250 + r * 400 + "px", width: "8000px", height: 470 * cs + "px" }));
  const rowCards = [];
  for (let r = 0; r < 2; r++) for (let k = 0; k < 10; k++) {
    const idx = r === 0 ? k : (k + 5) % 10;
    const b = hb("home .squad-grid > *", idx);
    const d = cropDiv(rows[r], "/assets/shots/home.png", b.x, b.y, b.w, b.h, cs);
    d.style.left = k * (b.w * cs + 24) + "px"; d.style.top = "0";
    d.style.boxShadow = "0 30px 70px rgba(0,0,0,.6)";
    rowCards.push(d);
  }
  const bTag = box(Bg, "tag", { position: "absolute", left: "96px", top: "70px", zIndex: 5 }, "07 / THE CORE");
  const bcap = box(Bg, "", { position: "absolute", left: "96px", top: "112px", width: "1400px" });
  const bc = line(bcap, "新时代的骨架", { fontSize: "108px", fontWeight: 900, textShadow: "0 8px 40px rgba(0,0,0,.6)" });
  const bcs = box(Bg, "", { position: "absolute", right: "96px", top: "150px", fontSize: "36px", fontWeight: 700, textAlign: "right", color: "rgba(244,241,235,.85)", lineHeight: 1.5 }, "一线队核心球员<br><span style='color:var(--lime)'>号码、位置、技术特点</span>");
  // 5C player page
  const Cg = box(s.root, "", { position: "absolute", inset: 0, visibility: "hidden", background: "linear-gradient(135deg,#100e0e,#35000c)" });
  const cpers = box(Cg, "", { position: "absolute", inset: 0, perspective: "2600px" });
  bgOutline(Cg, "PROFILE", { left: "0px", top: "560px", fontSize: "760px" });
  box(Cg, "tag", { position: "absolute", left: "96px", top: "150px" }, "08 / PLAYER ARCHIVE");
  const ccap = box(Cg, "", { position: "absolute", left: "96px", top: "232px" });
  const cc1 = line(ccap, "球员专页", { fontSize: "118px", fontWeight: 900 });
  const cc2 = line(ccap, "不只是名字，", { fontSize: "70px", fontWeight: 900, color: "rgba(244,241,235,.85)", marginTop: "22px" });
  const cc3 = line(ccap, "还有他怎么踢球。", { fontSize: "70px", fontWeight: 900, color: "var(--lime)", marginTop: "6px" });
  const pm = mock(cpers, "/assets/shots/vvd.png", 1180, 737, "redchorus.com/players/virgil-van-dijk");
  const pm2 = mock(cpers, "/assets/shots/dom.png", 1180, 737, "redchorus.com/players/dominik-szoboszlai");
  s.update = (lt) => {
    const showA = lt < 6.25, showB = lt >= 6.25 && lt < 13.75, showC = lt >= 13.75;
    A.style.visibility = showA ? "inherit" : "hidden";
    Bg.style.visibility = showB ? "inherit" : "hidden";
    Cg.style.visibility = showC ? "inherit" : "hidden";
    if (showA) {
      const i = Math.min(9, Math.floor(lt / B));
      flash.forEach((f, j) => (f.d.style.visibility = j === i ? "inherit" : "hidden"));
      const p = P(lt - i * B, 0, 0.3), f = flash[i];
      tf(f.ph, { x: (1 - eo5(p)) * 300, s: lerp(1.08, 1, eo3(p)) });
      tf(f.nm, { x: (1 - eo5(P(lt - i * B, 0.04, 0.3))) * -200 });
      f.d.style.filter = `brightness(${lerp(1.7, 1, eo3(P(lt - i * B, 0, 0.16)))})`;
    }
    if (showB) {
      const l = lt - 6.25;
      rows[0].style.transform = `translateX(${lerp(-100, -1100, l / 7.5)}px)`;
      rows[1].style.transform = `translateX(${lerp(-1300, -300, l / 7.5)}px)`;
      Bg.style.opacity = 1;
      rows.forEach((r, i) => { r.style.opacity = eo3(P(l, 0.05 + i * 0.15, 0.5)); });
      slide(bc.chars, l, 0.15, 0.06, 0.6, 7.1, 0.3);
      bcs.style.opacity = eo3(P(l, 0.8, 0.5)) * (1 - P(l, 7.0, 0.3));
      bTag.style.opacity = 1 - P(l, 7.0, 0.3);
    }
    if (showC) {
      const l = lt - 13.75;
      const inP = eo5(P(l, 0, 0.8));
      const swap = P(l, 3.4, 0.6);
      tf(pm.root, { x: lerp(1000, 640, inP) - eio(swap) * 1300, y: 120, rx: lerp(8, 3, P(l, 0, 6)), ry: lerp(-22, -12, P(l, 0, 6)) });
      pm.scroll(lerp(0, 1000, eio(P(l, 0.8, 2.6))));
      tf(pm2.root, { x: lerp(1900, 640, eio(swap)), y: 120, rx: 3, ry: -12 + (1 - eio(swap)) * -10 });
      pm2.scroll(lerp(0, 1000, eio(P(l, 4.2, 2.0))));
      slide(cc1.chars, l, 0.1, 0.07, 0.6);
      slide(cc2.chars, l, 0.5, 0.04, 0.55);
      slide(cc3.chars, l, 0.8, 0.04, 0.55);
    }
  };
}

/* ---------------------------------------------------------------- 6. TACTICS 70–81.25 */
{
  const s = scene(70, 81.25, { background: "radial-gradient(ellipse at 20% 100%,#4a0413 0%,#100e0e 60%)" });
  const words = ["PRESS", "FORWARD", "ROTATE"].map((w, i) => bgOutline(s.root, w, { left: "0", top: 120 + i * 300 + "px", fontSize: "420px", WebkitTextStroke: "3px rgba(244,241,235,.09)" }));
  box(s.root, "tag", { position: "absolute", left: "88px", top: "56px" }, "09 / TACTICS");
  const cap = box(s.root, "", { position: "absolute", left: "88px", top: "112px" });
  const c1 = line(cap, "伊拉奥拉的比赛原则", { fontSize: "92px", fontWeight: 900 }, { range: [0, 3], css: { color: "#dfff5b" } });
  const sc = 1.28;
  const list = [["el-coach", 429, 531], ["el-pr0", 296, 531], ["el-pr1", 296, 531], ["el-pr2", 296, 531]];
  const gap = 22;
  const totalW = list.reduce((a, d) => a + d[1] * sc, 0) + gap * 3;
  let x = (1920 - totalW) / 2;
  const cards = list.map((d, i) => {
    const c = box(s.root, "card", { left: x + "px", top: "290px", width: d[1] * sc + "px", height: d[2] * sc + "px" });
    img(c, `/assets/shots/${d[0]}.png`);
    const sweep = box(c, "", { position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 40%,rgba(223,255,91,.55) 50%,transparent 60%)", opacity: 0, mixBlendMode: "overlay" });
    x += d[1] * sc + gap; return { c, sweep };
  });
  const foot = box(s.root, "", { position: "absolute", left: "88px", bottom: "36px", fontSize: "30px", fontWeight: 700, color: "rgba(244,241,235,.75)" }, "五轮比赛，形成轮廓 —— 这里记录趋势，也保留修正的空间");
  s.update = (lt) => {
    words.forEach((w, i) => tf(w, { x: lerp(i % 2 ? -1800 : -200, i % 2 ? -200 : -1800, lt / 11.25) }));
    slide(c1.chars, lt, 0.2, 0.05, 0.6, 1e9);
    cards.forEach(({ c, sweep }, i) => {
      const at = 0.9 + i * 0.625 * (i === 0 ? 0 : 1) * 1.0 + (i === 0 ? 0 : 0.6);
      const p = eo5(P(lt, at, 0.8));
      tf(c, { y: (1 - p) * 700, ry: (1 - p) * -55, rx: 0, s: 1 });
      c.style.opacity = p;
      const sp = P(lt, 4.4 + i * 1.25, 0.9);
      sweep.style.opacity = sp > 0 && sp < 1 ? 1 : 0;
      sweep.style.transform = `translateX(${lerp(-100, 100, sp)}%)`;
    });
    foot.style.opacity = eo3(P(lt, 2.4, 0.6));
  };
}

/* ---------------------------------------------------------------- 7. FACTS 81.25–87.5 */
{
  const s = scene(81.25, 87.5, { background: "var(--paper)" });
  bgOutline(s.root, "FACTS", { left: "-30px", top: "560px", fontSize: "760px" }).style.webkitTextStroke = "3px rgba(16,14,14,.07)";
  box(s.root, "", { position: "absolute", left: 0, top: 0, bottom: 0, width: "22px", background: "var(--red)" });
  box(s.root, "tag", { position: "absolute", left: "96px", top: "70px", background: "#111", color: "var(--lime)" }, "10 / VERIFIED");
  const cap = box(s.root, "", { position: "absolute", left: "96px", top: "132px", color: "#111" });
  const c1 = line(cap, "只把事实，", { fontSize: "126px", fontWeight: 900 });
  const c2 = line(cap, "叫作事实。", { fontSize: "126px", fontWeight: 900 }, { range: [2, 4], css: { color: "var(--red)" } });
  const sc = 1.0;
  const cards = [0, 1, 2].map((i) => {
    const c = box(s.root, "card", { left: 130 + i * 590 + "px", top: "560px", width: 440 * 1.24 + "px", height: 330 * 1.24 + "px" });
    img(c, `/assets/shots/el-news${i}.png`);
    return c;
  });
  const stamps = [0, 1, 2].map((i) => box(s.root, "disp", { position: "absolute", left: 130 + i * 590 + 330 + "px", top: "500px", border: "7px solid var(--red)", color: "var(--red)", fontFamily: '"Noto Sans SC"', fontWeight: 900, fontSize: "60px", padding: "6px 22px", background: "rgba(244,241,235,.92)", transform: "rotate(-9deg)", letterSpacing: ".12em" }, "已确认"));
  const pr = box(s.root, "card", { left: "1130px", top: "160px", width: "700px", height: "700px", boxShadow: "none", display: "none" });
  const badge = box(s.root, "", { position: "absolute", right: "96px", top: "150px", border: "3px solid #111", padding: "16px 24px", fontSize: "34px", fontWeight: 900, color: "#111", background: "#fff", boxShadow: "8px 8px 0 #111" }, "官方来源优先 ↗");
  s.update = (lt) => {
    slide(c1.chars, lt, 0.1, 0.06, 0.6);
    slide(c2.chars, lt, 0.4, 0.06, 0.6);
    cards.forEach((c, i) => { const p = eo5(P(lt, 0.9 + i * 0.25, 0.8)); tf(c, { y: (1 - p) * 700, r: (1 - p) * (i - 1) * 10 + (i - 1) * 1.2, s: 1 }); c.style.opacity = p; });
    stamps.forEach((d, i) => { const p = P(lt, 2.4 + i * 0.32, 0.22); const k = bo(p); tf(d, { s: lerp(3, 1, C(k, 0, 1.2)), r: -9 }); d.style.opacity = p > 0 ? Math.min(1, p * 4) : 0; });
    const b = eo5(P(lt, 1.0, 0.7)); tf(badge, { x: (1 - b) * 400 }); badge.style.opacity = b;
  };
}

/* ---------------------------------------------------------------- 8. HISTORY 87.5–110 */
{
  const s = scene(87.5, 110, { background: "#000" });
  const cv = document.createElement("canvas");
  cv.width = 1920; cv.height = 1080;
  Object.assign(cv.style, { position: "absolute", inset: 0, width: "1920px", height: "1080px" });
  s.root.appendChild(cv);
  const g = cv.getContext("2d");
  const intro = box(s.root, "", { position: "absolute", inset: 0, background: "rgba(0,0,0,.72)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" });
  const i1 = line(intro, "一百三十三年，", { fontSize: "170px", fontWeight: 900 });
  const i2 = line(intro, "四十秒走完。", { fontSize: "170px", fontWeight: 900 }, { range: [0, 2], css: { color: "#dfff5b" } });
  const tagH = box(s.root, "tag", { position: "absolute", left: "64px", bottom: "36px" }, "11 / HISTORY IN 40 SECONDS");
  const url = box(s.root, "osw", { position: "absolute", right: "64px", bottom: "36px", fontSize: "24px", color: "#fff", background: "rgba(0,0,0,.55)", padding: "10px 16px" }, "redchorus.com/history");
  const bar = box(s.root, "", { position: "absolute", left: "0", bottom: "0", height: "8px", background: "var(--lime)", width: "100%", transformOrigin: "0 50%" });
  const endBlk = box(s.root, "", { position: "absolute", inset: 0, background: "#000", opacity: 0 });
  const START = 2.0, RATE = 40 / (22.5 - START - 0.5);
  s.update = (lt) => {
    const ht = C((lt - START) * RATE, 0, 39.99);
    g.setTransform(1.5, 0, 0, 1.5, 0, 0);
    g.globalAlpha = 1;
    LFC.drawFrame(g, ht);
    intro.style.opacity = 1 - eio(P(lt, 1.5, 0.5));
    slide(i1.chars, lt, 0.1, 0.05, 0.6, 1.5, 0.3);
    slide(i2.chars, lt, 0.35, 0.05, 0.6, 1.5, 0.3);
    tagH.style.opacity = eo3(P(lt, 2.2, 0.5));
    url.style.opacity = eo3(P(lt, 2.4, 0.5));
    bar.style.transform = `scaleX(${ht / 40})`;
    tf(cv, { s: lerp(1, 1.035, P(lt, 0, 22.5)) });
    endBlk.style.opacity = P(lt, 22.0, 0.5);
  };
}

/* ---------------------------------------------------------------- 9. OUTRO 110–120 */
{
  const s = scene(110, 120, { background: "#050404" });
  const embers = document.createElement("canvas");
  embers.width = 960; embers.height = 540;
  Object.assign(embers.style, { position: "absolute", inset: 0, width: "1920px", height: "1080px" });
  s.root.appendChild(embers);
  const g = embers.getContext("2d");
  const st1 = box(s.root, "", { position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "18px" });
  const y1 = line(st1, "你永远不会", { fontSize: "220px", fontWeight: 900 });
  const y2 = line(st1, "独行。", { fontSize: "220px", fontWeight: 900 }, { range: [0, 3], css: { color: "#e31b3d" } });
  const yn = box(st1, "osw", { fontSize: "36px", color: "var(--lime)", marginTop: "12px" }, "YOU'LL NEVER WALK ALONE");
  // red flood
  const flood = box(s.root, "", { position: "absolute", left: "-20%", top: "-20%", width: "140%", height: "140%", background: "var(--red)", transform: "skewX(-14deg)", transformOrigin: "50% 50%" });
  const deep = box(s.root, "", { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 120%, #35000c 0%, transparent 65%)", opacity: 0 });
  const fin = box(s.root, "", { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" });
  const logo = box(fin, "skew", { fontSize: "60px", padding: "22px 30px", background: "#100e0e", marginBottom: "10px" }, "R/26");
  const t1 = box(fin, "disp", { fontSize: "330px", lineHeight: 0.92, color: "#fff", display: "flex", overflow: "hidden", padding: "0 20px" });
  const t1c = [..."RED CHORUS"].map((c) => box(t1, "", { display: "inline-block", whiteSpace: "pre" }, c));
  const zh = line(fin, "红潮同行", { fontSize: "96px", fontWeight: 900, letterSpacing: ".3em", color: "#100e0e" });
  const cta = box(fin, "", { marginTop: "36px", background: "var(--lime)", color: "#111", fontSize: "76px", fontWeight: 900, padding: "20px 56px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "26px", boxShadow: "0 24px 60px rgba(0,0,0,.35)" });
  const ctaT = box(cta, "", {}, "点开看看");
  box(cta, "osw", { fontSize: "60px", letterSpacing: ".06em", textTransform: "none" }, "redchorus.com");
  const arrow = box(cta, "", { fontSize: "76px" }, "→");
  const small = box(fin, "", { marginTop: "26px", fontSize: "30px", fontStyle: "italic", fontFamily: '"Noto Serif SC"', fontWeight: 900, color: "rgba(255,255,255,.92)" }, "For those who never walk alone.");
  const credit = box(s.root, "", { position: "absolute", left: 0, right: 0, bottom: "28px", textAlign: "center", fontSize: "20px", color: "rgba(255,255,255,.7)" }, "球员照片来自 Wikimedia Commons，作者与授权见网站  ·  独立球迷站，非利物浦俱乐部官方");
  const fade = box(s.root, "", { position: "absolute", inset: 0, background: "#000", opacity: 0 });
  s.update = (lt) => {
    g.clearRect(0, 0, 960, 540); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 130; i++) {
      const sp = 30 + rnd(i + 3) * 70;
      const y = 560 - ((lt * sp + rnd(i + 9) * 700) % 640);
      const x = rnd(i) * 960 + Math.sin(lt * (0.6 + rnd(i + 2)) + i) * 26;
      const a = (0.3 + 0.7 * rnd(i + 5)) * 0.8 * (0.6 + 0.4 * Math.sin(lt * 9 + i)) * (1 - P(lt, 3.6, 0.3));
      g.fillStyle = `rgba(${230 + rnd(i) * 25 | 0},${60 + rnd(i + 1) * 80 | 0},30,${C(a, 0, 1)})`;
      g.beginPath(); g.arc(x, y, 1 + rnd(i + 7) * 2.6, 0, 6.283); g.fill();
    }
    slide(y1.chars, lt, 0.3, 0.07, 0.7, 3.3, 0.3);
    slide(y2.chars, lt, 0.7, 0.07, 0.7, 3.3, 0.3);
    yn.style.opacity = eo3(P(lt, 1.6, 0.6)) * (1 - P(lt, 3.3, 0.2));
    // flood sweeps in at 3.75
    const fp = eio(P(lt, 3.6, 0.6));
    flood.style.transform = `skewX(-14deg) translateX(${lerp(-110, 0, fp)}%)`;
    flood.style.visibility = lt < 3.55 ? "hidden" : "inherit";
    deep.style.opacity = P(lt, 4.2, 1.5);
    const show = lt >= 3.7;
    fin.style.visibility = show ? "inherit" : "hidden";
    tf(logo, { y: (1 - eo5(P(lt, 4.0, 0.6))) * -200, sk: -10 }); logo.style.opacity = eo3(P(lt, 4.0, 0.4));
    t1c.forEach((c, i) => { const p = eo5(P(lt, 4.15 + i * 0.045, 0.55)); tf(c, { y: (1 - p) * 330 }); c.style.opacity = p > 0 ? 1 : 0; });
    slide(zh.chars, lt, 4.9, 0.1, 0.6);
    const cp = bo(P(lt, 5.5, 0.6)); tf(cta, { s: lerp(0.4, 1, C(cp, 0, 1.15)) + Math.sin(lt * 4) * 0.008 * P(lt, 6.2, 0.2), y: 0 }); cta.style.opacity = P(lt, 5.5, 0.15);
    tf(arrow, { x: Math.sin(lt * 6) * 10 });
    small.style.opacity = eo3(P(lt, 6.4, 0.6));
    credit.style.opacity = eo3(P(lt, 7, 0.6));
    fade.style.opacity = P(lt, 9.4, 0.6);
  };
}
}

/* ---------------------------------------------------------------- GLOBAL OVERLAYS */
function overlays() {
  const root = document.getElementById("root");
  const vig = box(root, "", { position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)" });
  const grain = document.createElement("canvas");
  grain.width = 480; grain.height = 270;
  Object.assign(grain.style, { position: "absolute", inset: 0, width: "1920px", height: "1080px", opacity: 0.11, mixBlendMode: "overlay", pointerEvents: "none" });
  root.appendChild(grain);
  const gg = grain.getContext("2d"); const gd = gg.createImageData(480, 270);
  // HUD
  const hud = box(root, "", { position: "absolute", inset: 0, pointerEvents: "none" });
  const mark = box(hud, "", { position: "absolute", right: "64px", top: "44px", display: "flex", alignItems: "center", gap: "14px" });
  box(mark, "skew", { fontSize: "20px", padding: "9px 12px" }, "R/26");
  box(mark, "osw", { fontSize: "22px", color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,.6)" }, "RED CHORUS 红潮同行");
  const prog = box(root, "", { position: "absolute", left: 0, bottom: 0, height: "6px", width: "100%", background: "var(--lime)", transformOrigin: "0 50%", pointerEvents: "none" });
  const flashW = box(root, "", { position: "absolute", inset: 0, background: "#fff", opacity: 0, pointerEvents: "none" });
  // wipes
  const wipeTimes = [17.5, 40, 50, 70, 81.25, 87.5, 110 - 0.0001].slice(0, 6);
  const wipes = wipeTimes.map(() => {
    const w = box(root, "", { position: "absolute", left: "-30%", top: "-20%", width: "160%", height: "140%", pointerEvents: "none", visibility: "hidden", transform: "skewX(-14deg)" });
    box(w, "", { position: "absolute", inset: 0, background: "var(--red)" });
    box(w, "", { position: "absolute", top: 0, bottom: 0, right: "-70px", width: "70px", background: "var(--lime)" });
    box(w, "", { position: "absolute", top: 0, bottom: 0, left: "-140px", width: "140px", background: "#100e0e" });
    return w;
  });
  const shakeAt = [10.0, 110 + 3.7];
  return (t) => {
    // HUD hidden on hook, title, history intro & outro
    const hudOn = t >= 17.5 && t < 87.5;
    hud.style.opacity = hudOn ? 1 : 0;
    prog.style.transform = `scaleX(${t / TOTAL})`;
    prog.style.opacity = t >= 87.5 && t < 110 ? 0 : 1;
    const d = 0.32;
    wipes.forEach((w, i) => {
      const b = wipeTimes[i];
      const p = (t - (b - d)) / (2 * d);
      if (p <= 0 || p >= 1) { w.style.visibility = "hidden"; return; }
      w.style.visibility = "inherit";
      const x = p < 0.5 ? lerp(-105, 0, eio(p * 2)) : lerp(0, 105, eio(p * 2 - 1));
      w.style.transform = `translateX(${x}%) skewX(-14deg)`;
    });
    // impact flash
    flashW.style.opacity = t >= 10 && t < 10.5 ? (1 - (t - 10) / 0.5) ** 2 * 0.9 : 0;
    // camera shake
    let sx = 0, sy = 0;
    shakeAt.forEach((a) => { const q = t - a; if (q >= 0 && q < 0.6) { const k = (1 - q / 0.6) ** 2; sx += Math.sin(q * 90) * 16 * k; sy += Math.cos(q * 77) * 12 * k; } });
    cam.style.transform = `translate3d(${sx}px,${sy}px,0)`;
    // grain
    const fr = Math.floor(t * 30);
    for (let i = 0; i < gd.data.length; i += 4) { const v = (Math.sin((i + fr * 7919) * 12.9898) * 43758.5453) % 1; const c = 128 + (v < 0 ? -v : v) * 127; gd.data[i] = gd.data[i + 1] = gd.data[i + 2] = c; gd.data[i + 3] = 255; }
    gg.putImageData(gd, 0, 0);
  };
}

window.ready = (async () => {
  BOX = await (await fetch("/assets/boxes.json")).json();
  build();
  const ov = overlays();
  window.setTime = (t) => {
    scenes.forEach((s) => {
      const vis = t >= s.t0 - 1e-6 && t < s.t1;
      s.root.style.visibility = vis ? "inherit" : "hidden";
      if (vis) s.update(t - s.t0, t);
    });
    ov(t);
  };
  window.TOTAL = TOTAL;
  window.scenesInfo = scenes.map((s) => [s.t0, s.t1]);
  await Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => {}) : 0)));
  window.setTime(0);
})();
})();
