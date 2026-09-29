"use strict";
(() => {
  // ../app/history/milestones.ts
  var milestones = [
    {
      year: "1892",
      title: "\u5229\u7269\u6D66\u8DB3\u7403\u4FF1\u4E50\u90E8\u8BDE\u751F",
      text: "\u57C3\u5F17\u987F\u642C\u79BB\u5B89\u83F2\u5C14\u5FB7\u540E\uFF0C\u7EA6\u7FF0\xB7\u970D\u5C14\u4E01\u5728\u8FD9\u5EA7\u7403\u573A\u4E0A\u5EFA\u7ACB\u4E86\u5229\u7269\u6D66\u8DB3\u7403\u4FF1\u4E50\u90E8\u3002",
      duration: 4
    },
    {
      year: "1901",
      title: "\u9996\u5EA7\u82F1\u683C\u5170\u9876\u7EA7\u8054\u8D5B\u51A0\u519B",
      text: "\u5EFA\u961F\u7B2C\u4E5D\u5E74\uFF0C\u5229\u7269\u6D66\u7B2C\u4E00\u6B21\u6367\u8D77\u82F1\u683C\u5170\u9876\u7EA7\u8054\u8D5B\u51A0\u519B\u3002",
      duration: 3.5
    },
    {
      year: "1959",
      title: "\u6BD4\u5C14\xB7\u9999\u514B\u5229\u5230\u6765",
      text: "\u9999\u514B\u5229\u63A5\u624B\u4E00\u652F\u4E59\u7EA7\u7403\u961F\uFF0C1962 \u5E74\u5E26\u961F\u91CD\u8FD4\u9876\u7EA7\uFF0C1964 \u5E74\u593A\u5F97\u8054\u8D5B\u51A0\u519B\u3002",
      duration: 4
    },
    {
      year: "1963",
      title: "Kop \u5531\u54CD\u961F\u6B4C",
      text: "\u300AYou'll Never Walk Alone\u300B\u767B\u4E0A\u82F1\u56FD\u5355\u66F2\u699C\u9996\uFF0CKop \u770B\u53F0\u628A\u5B83\u5531\u6210\u4E86\u4FF1\u4E50\u90E8\u7684\u7075\u9B42\u3002",
      duration: 4
    },
    {
      year: "1977\u201384",
      title: "\u56DB\u593A\u6B27\u6D32\u51A0\u519B\u676F",
      text: "\u4F69\u65AF\u5229\u4E0E\u6CD5\u6839\u65F6\u4EE3\uFF0C\u5229\u7269\u6D66\u5728\u7F57\u9A6C\u3001\u6E29\u5E03\u5229\u3001\u5DF4\u9ECE\u548C\u7F57\u9A6C\u56DB\u6B21\u767B\u4E0A\u6B27\u6D32\u4E4B\u5DC5\u3002",
      duration: 4.5
    },
    {
      year: "1989",
      title: "\u5E0C\u5C14\u65AF\u5821\u60E8\u6848",
      text: "\u5E0C\u5C14\u65AF\u5821\u60E8\u6848\u593A\u53BB\u4E86 97 \u4F4D\u5229\u7269\u6D66\u7403\u8FF7\u7684\u751F\u547D\u3002\u6211\u4EEC\u6C38\u8FDC\u94ED\u8BB0\u3002",
      duration: 4.5
    },
    {
      year: "2005",
      title: "\u4F0A\u65AF\u5766\u5E03\u5C14\u5947\u8FF9",
      text: "\u534A\u573A 0:3 \u843D\u540E AC \u7C73\u5170\uFF0C\u516D\u5206\u949F\u5185\u8FDE\u8FDB\u4E09\u7403\uFF0C\u70B9\u7403\u5927\u6218 3:2 \u593A\u51A0\u3002",
      duration: 4.5
    },
    {
      year: "2019",
      title: "\u9A6C\u5FB7\u91CC \xB7 \u7B2C\u516D\u5EA7\u6B27\u51A0",
      text: "\u514B\u6D1B\u666E\u5E26\u961F\u5728\u9A6C\u5FB7\u91CC 2:0 \u51FB\u8D25\u70ED\u523A\uFF0C\u7B2C\u516D\u6B21\u6367\u8D77\u6B27\u6D32\u51A0\u519B\u676F\u3002",
      duration: 3.5
    },
    {
      year: "2020",
      title: "\u4E09\u5341\u5E74\u7B49\u5F85\uFF0C\u7EC8\u767B\u82F1\u8D85\u4E4B\u5DC5",
      text: "\u7ED3\u675F\u4E09\u5341\u5E74\u7684\u8054\u8D5B\u51A0\u519B\u7B49\u5F85\uFF0C\u5229\u7269\u6D66\u9996\u6B21\u6367\u8D77\u82F1\u8D85\u51A0\u519B\u5956\u676F\u3002",
      duration: 3.5
    },
    {
      year: "2025",
      title: "\u7B2C 20 \u5EA7\u9876\u7EA7\u8054\u8D5B\u51A0\u519B",
      text: "\u65AF\u6D1B\u7279\u6267\u6559\u9996\u5B63\u593A\u51A0\uFF0C\u5229\u7269\u6D66\u7B2C 20 \u6B21\u6210\u4E3A\u82F1\u683C\u5170\u9876\u7EA7\u8054\u8D5B\u51A0\u519B\u3002\u6545\u4E8B\uFF0C\u4ECD\u5728\u7EE7\u7EED\u3002",
      duration: 4
    }
  ];
  var sceneStarts = milestones.map((_, i) => milestones.slice(0, i).reduce((sum, m) => sum + m.duration, 0));
  var totalDuration = milestones.reduce((sum, m) => sum + m.duration, 0);

  // ../app/history/scenes.ts
  var W = 1280;
  var H = 720;
  var FADE = 0.35;
  var RED = "#c8102e";
  var RED_BRIGHT = "#e31b3d";
  var DEEP = "#35000c";
  var INK = "#100e0e";
  var PAPER = "#f4f1eb";
  var LIME = "#dfff5b";
  var GOLD = "#e6bf62";
  var GOLD_DARK = "#a97c28";
  var DISPLAY = 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';
  var SANS = '"PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", Arial, sans-serif';
  var clamp = (v) => Math.min(1, Math.max(0, v));
  var ease = (v) => 1 - (1 - clamp(v)) ** 3;
  var phase = (s, start, length) => ease((s - start) / length);
  var pop = (v) => {
    const x = clamp(v);
    return x === 0 ? 0 : 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;
  };
  var rand = (i) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  function backdrop(c, top, bottom) {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
  function glow(c, x, y, r, color) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function heading(c, s, year, title, yearColor = PAPER) {
    const a = phase(s, 0.15, 0.7);
    c.save();
    c.globalAlpha *= a;
    c.translate((1 - a) * -48, 0);
    c.textAlign = "left";
    c.fillStyle = yearColor;
    c.font = `168px ${DISPLAY}`;
    c.fillText(year, 76, 318, 540);
    c.fillStyle = PAPER;
    c.font = `800 44px ${SANS}`;
    c.fillText(title, 80, 390, 540);
    c.fillStyle = RED_BRIGHT;
    c.fillRect(80, 418, 72 * phase(s, 0.55, 0.6), 6);
    c.restore();
  }
  function drawCup(c, x, y, scale, bigEars) {
    if (scale <= 0) return;
    c.save();
    c.translate(x, y);
    c.scale(scale, scale);
    c.fillStyle = GOLD_DARK;
    c.fillRect(-44, -22, 88, 22);
    c.fillStyle = GOLD;
    c.fillRect(-30, -38, 60, 16);
    c.fillRect(-8, -84, 16, 48);
    c.beginPath();
    c.moveTo(-62, -210);
    c.lineTo(62, -210);
    c.quadraticCurveTo(62, -96, 0, -84);
    c.quadraticCurveTo(-62, -96, -62, -210);
    c.fill();
    c.strokeStyle = GOLD;
    c.lineWidth = 12;
    c.beginPath();
    if (bigEars) {
      c.arc(-64, -160, 42, Math.PI * 0.5, Math.PI * 1.5);
      c.moveTo(64, -202);
      c.arc(64, -160, 42, -Math.PI * 0.5, Math.PI * 0.5);
    } else {
      c.arc(-66, -172, 24, Math.PI * 0.5, Math.PI * 1.5);
      c.moveTo(66, -196);
      c.arc(66, -172, 24, -Math.PI * 0.5, Math.PI * 0.5);
    }
    c.stroke();
    c.fillStyle = "rgba(255,255,255,.4)";
    c.fillRect(-42, -198, 10, 84);
    c.restore();
  }
  function drawStar(c, x, y, r, color) {
    if (r <= 0) return;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? r : r * 0.42;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      c.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    }
    c.closePath();
    c.fillStyle = color;
    c.fill();
  }
  function confetti(c, k, count) {
    const colors = [RED_BRIGHT, PAPER, LIME];
    for (let i = 0; i < count; i++) {
      const y = -30 - rand(i + 7) * 260 + k * (200 + rand(i + 99) * 240);
      if (y < -20 || y > H + 20) continue;
      const x = rand(i) * W + Math.sin(k * 3 + i) * 24;
      c.save();
      c.translate(x, y);
      c.rotate(k * (2 + rand(i + 3) * 4) + i);
      c.fillStyle = colors[i % 3];
      c.fillRect(-6, -3, 12, 6);
      c.restore();
    }
  }
  var founded = (c, s) => {
    backdrop(c, "#4a0512", INK);
    glow(c, 940, 470, 440, "rgba(227,27,61,.42)");
    const base = 560;
    c.fillStyle = "#1d4d2b";
    c.beginPath();
    c.moveTo(600, H);
    c.lineTo(700, base);
    c.lineTo(1180, base);
    c.lineTo(1280, H);
    c.closePath();
    c.fill();
    const pylon = phase(s, 0.3, 1.3);
    c.strokeStyle = "rgba(244,241,235,.7)";
    c.lineWidth = 5;
    for (const x of [660, 1220]) {
      c.beginPath();
      c.moveTo(x, base);
      c.lineTo(x, base - 330 * pylon);
      c.stroke();
      if (pylon > 0.98) {
        const on = phase(s, 2.1, 0.3);
        c.save();
        c.globalAlpha *= on;
        glow(c, x, base - 338, 70, "rgba(255,248,210,.7)");
        c.fillStyle = PAPER;
        c.fillRect(x - 20, base - 346, 40, 18);
        c.restore();
      }
    }
    const h = 230 * phase(s, 0.5, 1.4);
    c.fillStyle = RED;
    c.fillRect(700, base - h, 480, h);
    c.strokeStyle = "rgba(255,255,255,.18)";
    c.lineWidth = 2;
    for (let y = base - 18; y > base - h + 8; y -= 20) {
      c.beginPath();
      c.moveTo(712, y);
      c.lineTo(1168, y);
      c.stroke();
    }
    c.fillStyle = PAPER;
    c.fillRect(680, base - 246, 520 * phase(s, 1.7, 0.6), 16);
    const sign = phase(s, 2, 0.6);
    c.save();
    c.globalAlpha *= sign;
    c.fillStyle = PAPER;
    c.textAlign = "center";
    c.font = `72px ${DISPLAY}`;
    c.fillText("ANFIELD", 940, base - 92 + (1 - sign) * 20, 440);
    c.restore();
    heading(c, s, "1892", milestones[0].title);
  };
  var firstTitle = (c, s) => {
    backdrop(c, DEEP, INK);
    c.save();
    c.translate(930, 400);
    c.rotate(s * 0.15);
    c.fillStyle = "rgba(230,191,98,.07)";
    for (let i = 0; i < 16; i++) {
      c.rotate(Math.PI * 2 / 16);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-40, -700);
      c.lineTo(40, -700);
      c.closePath();
      c.fill();
    }
    c.restore();
    const rise = phase(s, 0.3, 1.2);
    c.save();
    c.globalAlpha *= rise;
    glow(c, 930, 460, 260, "rgba(230,191,98,.3)");
    drawCup(c, 930, 610 + (1 - rise) * 120, 1.35, false);
    c.restore();
    for (let i = 0; i < 14; i++) {
      const r = 7 * Math.max(0, Math.sin(s * 4 + i * 1.3)) * phase(s, 1.2, 0.4);
      drawStar(c, 760 + rand(i) * 340, 250 + rand(i + 20) * 330, r, PAPER);
    }
    heading(c, s, "1901", milestones[1].title);
  };
  var shankly = (c, s) => {
    backdrop(c, "#1b1415", INK);
    c.strokeStyle = "rgba(244,241,235,.06)";
    c.lineWidth = 2;
    for (let i = 0; i <= 12; i++) {
      c.beginPath();
      c.moveTo(930, 360);
      c.lineTo(620 + i * 55, H);
      c.stroke();
    }
    for (let i = 1; i <= 7; i++) {
      const y = 360 + i * i * (H - 360) / 49;
      c.beginPath();
      c.moveTo(620, y);
      c.lineTo(1280, y);
      c.stroke();
    }
    glow(c, 930, 300, 320, "rgba(200,16,46,.25)");
    const drop = phase(s, 0.3, 0.9);
    const t = Math.max(0, s - 0.3);
    const angle = 0.16 * Math.exp(-2.4 * t) * Math.cos(7 * t);
    c.save();
    c.translate(930, 90 - (1 - drop) * 440);
    c.rotate(angle);
    c.strokeStyle = "rgba(244,241,235,.55)";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(-200, 84);
    c.moveTo(0, 0);
    c.lineTo(200, 84);
    c.stroke();
    c.fillStyle = RED;
    c.beginPath();
    c.roundRect(-240, 80, 480, 220, 10);
    c.fill();
    c.strokeStyle = PAPER;
    c.lineWidth = 4;
    c.beginPath();
    c.roundRect(-224, 96, 448, 188, 6);
    c.stroke();
    c.fillStyle = PAPER;
    c.textAlign = "center";
    c.font = `44px ${DISPLAY}`;
    c.fillText("THIS IS", 0, 162, 400);
    c.font = `112px ${DISPLAY}`;
    c.fillText("ANFIELD", 0, 268, 420);
    c.restore();
    heading(c, s, "1959", milestones[2].title);
  };
  var theKop = (c, s) => {
    backdrop(c, "#5a0716", DEEP);
    const lyric = ["YOU'LL NEVER", "WALK ALONE"];
    const typed = Math.floor(22 * clamp((s - 0.8) / 1.8));
    c.fillStyle = LIME;
    c.font = `96px ${DISPLAY}`;
    c.textAlign = "left";
    const squeeze = Math.min(1, 560 / c.measureText(lyric[0]).width);
    c.save();
    c.translate(660, 0);
    c.scale(squeeze, 1);
    c.fillText(lyric[0].slice(0, typed), 0, 200);
    c.fillText(lyric[1].slice(0, Math.max(0, typed - 11)), 0, 300);
    c.restore();
    for (let i = 0; i < 7; i++) {
      const y = 520 - (s * 70 + i * 64) % 220;
      const x = 720 + i * 72 + Math.sin(s * 2 + i) * 14;
      c.save();
      c.globalAlpha *= clamp((y - 300) / 80) * phase(s, 1, 0.5) * 0.8;
      c.fillStyle = PAPER;
      c.strokeStyle = PAPER;
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(x, y, 10, 7, -0.4, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(x + 9, y);
      c.lineTo(x + 9, y - 34);
      c.lineTo(x + 22, y - 24);
      c.stroke();
      c.restore();
    }
    const rows = 5;
    for (let r = 0; r < rows; r++) {
      const show = phase(s, 0.1 + r * 0.12, 0.6);
      for (let i = 0; i < 36; i++) {
        const x = i * 37 + r % 2 * 18 + 4;
        const bob = Math.sin(s * 5 + i * 0.8 + r * 1.3) * 4 * phase(s, 0.8, 0.8);
        const y = 560 + r * 38 + bob + (1 - show) * 80;
        const body = r % 2 ? "#1c0508" : "#260a0f";
        c.fillStyle = body;
        c.beginPath();
        c.arc(x, y + 32, 20, Math.PI, 0);
        c.fill();
        c.beginPath();
        c.arc(x, y, 12, 0, Math.PI * 2);
        c.fill();
        if (rand(i * 7 + r) > 0.7) {
          const up = phase(s, 0.9 + rand(i + r) * 0.8, 0.5);
          if (up <= 0) continue;
          const sy = y - 10 - 30 * up;
          c.strokeStyle = body;
          c.lineWidth = 6;
          c.beginPath();
          c.moveTo(x - 14, y + 16);
          c.lineTo(x - 30, sy);
          c.moveTo(x + 14, y + 16);
          c.lineTo(x + 30, sy);
          c.stroke();
          for (let k = 0; k < 6; k++) {
            c.fillStyle = k % 2 ? PAPER : RED_BRIGHT;
            c.fillRect(x - 33 + k * 11, sy - 7 + Math.sin(s * 7 + i + k * 0.9) * 3, 11, 14);
          }
        }
      }
    }
    heading(c, s, "1963", milestones[3].title);
  };
  var europeanCups = (c, s) => {
    backdrop(c, DEEP, INK);
    const cups = [["1977", "\u7F57\u9A6C"], ["1978", "\u6E29\u5E03\u5229"], ["1981", "\u5DF4\u9ECE"], ["1984", "\u7F57\u9A6C"]];
    cups.forEach(([year, city], i) => {
      const k = pop((s - 0.5 - i * 0.55) / 0.6);
      if (k <= 0) return;
      const x = 720 + i * 150;
      c.save();
      c.globalAlpha *= clamp(k);
      glow(c, x, 420, 120, "rgba(230,191,98,.22)");
      drawCup(c, x, 520, 0.62 * k, true);
      c.textAlign = "center";
      c.fillStyle = PAPER;
      c.font = `44px ${DISPLAY}`;
      c.fillText(year, x, 584);
      c.fillStyle = "rgba(244,241,235,.6)";
      c.font = `600 20px ${SANS}`;
      c.fillText(city, x, 616);
      c.restore();
    });
    heading(c, s, "1977\u201384", milestones[4].title);
  };
  var hillsborough = (c, s) => {
    backdrop(c, "#151213", "#060505");
    for (let i = 0; i < 97; i++) {
      const lit = phase(s, 0.4 + i * 0.025, 0.4);
      if (lit <= 0) continue;
      const r = 245 * Math.sqrt((i + 0.5) / 97);
      const a = i * 2.39996;
      const x = 930 + Math.cos(a) * r;
      const y = 370 + Math.sin(a) * r * 0.92;
      const flicker = 1 + Math.sin(s * 11 + i * 1.7) * 0.08 + Math.sin(s * 6.3 + i) * 0.06;
      c.save();
      c.globalAlpha *= lit;
      glow(c, x, y - 6, 22, "rgba(255,186,90,.4)");
      c.fillStyle = "rgba(244,241,235,.85)";
      c.fillRect(x - 3, y + 2, 6, 14);
      c.fillStyle = "#ffcf6b";
      c.beginPath();
      c.moveTo(x, y - 15 * flicker);
      c.quadraticCurveTo(x + 6, y - 3, x, y + 1);
      c.quadraticCurveTo(x - 6, y - 3, x, y - 15 * flicker);
      c.fill();
      c.restore();
    }
    heading(c, s, "1989", milestones[5].title);
    const line = phase(s, 2.6, 0.8);
    c.save();
    c.globalAlpha *= line;
    c.textAlign = "left";
    c.fillStyle = "rgba(244,241,235,.75)";
    c.font = `600 26px ${SANS}`;
    c.fillText("\u6C38\u8FDC\u94ED\u8BB0 97 \u4F4D\u901D\u53BB\u7684\u7403\u8FF7", 80, 472, 540);
    c.restore();
  };
  var istanbul = (c, s) => {
    backdrop(c, "#240308", INK);
    const goals = [1.4, 2, 2.6];
    const scored = goals.filter((g) => s >= g).length;
    const won = s >= 3.3;
    const slide = phase(s, 0.1, 0.6);
    c.save();
    c.globalAlpha *= slide;
    c.translate((1 - slide) * 80, 0);
    c.fillStyle = "#1c1617";
    c.fillRect(640, 170, 560, 370);
    c.fillStyle = RED;
    c.fillRect(640, 170, 560, 8);
    c.strokeStyle = "rgba(244,241,235,.14)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(672, 340);
    c.lineTo(1168, 340);
    c.stroke();
    c.textAlign = "left";
    c.font = `52px ${DISPLAY}`;
    c.fillStyle = "rgba(244,241,235,.7)";
    c.fillText("AC MILAN", 680, 300, 340);
    c.fillStyle = PAPER;
    c.fillText("LIVERPOOL", 680, 430, 340);
    c.textAlign = "right";
    c.font = `110px ${DISPLAY}`;
    c.fillStyle = "rgba(244,241,235,.7)";
    c.fillText("3", 1160, 310);
    const since = scored ? s - goals[scored - 1] : 9;
    if (since < 0.4) glow(c, 1130, 400, 110, "rgba(223,255,91,.45)");
    c.save();
    c.translate(1160, 440);
    const bump = since < 0.4 ? 1 + 0.25 * Math.sin(since / 0.4 * Math.PI) : 1;
    c.scale(bump, bump);
    c.fillStyle = won ? LIME : PAPER;
    c.fillText(String(scored), 0, 0);
    c.restore();
    const ticker = won ? "\u70B9\u7403\u5927\u6218 3:2 \xB7 \u6B27\u6D32\u51A0\u519B" : ["\u534A\u573A \xB7 0:3 \u843D\u540E", "54' \u6770\u62C9\u5FB7\u5934\u7403", "56' \u65AF\u7C73\u5207\u5C14\u8FDC\u5C04", "60' \u963F\u9686\u7D22\u8865\u5C04"][scored];
    c.textAlign = "left";
    c.font = `700 26px ${SANS}`;
    c.fillStyle = won ? LIME : "rgba(244,241,235,.8)";
    c.fillText(ticker, 680, 505, 480);
    c.restore();
    heading(c, s, "2005", milestones[6].title, won ? LIME : PAPER);
    if (won) confetti(c, s - 3.3, 90);
  };
  var madrid = (c, s) => {
    backdrop(c, DEEP, INK);
    glow(c, 930, 440, 360, "rgba(227,27,61,.35)");
    const rise = phase(s, 0.2, 0.9);
    c.save();
    c.globalAlpha *= rise;
    drawCup(c, 930, 640 + (1 - rise) * 100, 1.15, true);
    c.restore();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI + 0.35 + i * (Math.PI - 0.7) / 5;
      const x = 930 + Math.cos(a) * 250;
      const y = 400 + Math.sin(a) * 250;
      const last = i === 5;
      const k = pop((s - (last ? 2.2 : 0.8 + i * 0.22)) / 0.5);
      if (last && k > 0) glow(c, x, y, 70 + Math.sin(s * 6) * 8, "rgba(223,255,91,.45)");
      drawStar(c, x, y, (last ? 34 : 24) * k, last ? LIME : PAPER);
    }
    heading(c, s, "2019", milestones[7].title);
  };
  var premierLeague = (c, s) => {
    backdrop(c, "#2a040c", INK);
    const count = Math.round(30 * phase(s, 0.3, 1.9));
    c.textAlign = "left";
    c.fillStyle = RED_BRIGHT;
    c.font = `200px ${DISPLAY}`;
    c.fillText(String(count), 680, 330);
    const numberWidth = c.measureText(String(count)).width;
    c.fillStyle = PAPER;
    c.font = `800 34px ${SANS}`;
    c.fillText("\u5E74", 692 + numberWidth, 330);
    const champ = phase(s, 2.3, 0.5);
    c.save();
    c.globalAlpha *= champ;
    c.fillStyle = LIME;
    c.font = `64px ${DISPLAY}`;
    c.fillText("CHAMPIONS", 960, 324, 240);
    c.restore();
    for (let i = 0; i < 30; i++) {
      const x = 680 + i * 17;
      const filled = i < count;
      const final = i === 29 && champ > 0;
      const h = final ? 60 + 170 * pop(champ) : 60;
      c.fillStyle = final ? LIME : filled ? RED : "rgba(244,241,235,.16)";
      c.fillRect(x, 580 - h, 11, h);
    }
    c.fillStyle = "rgba(244,241,235,.55)";
    c.font = `600 18px ${SANS}`;
    c.fillText("1990", 680, 612);
    c.textAlign = "right";
    c.fillText("2020", 1184, 612);
    heading(c, s, "2020", milestones[8].title);
  };
  var twenty = (c, s) => {
    backdrop(c, DEEP, INK);
    const filled = Math.min(20, Math.max(0, Math.floor((s - 0.3) / 0.07) + 1));
    c.textAlign = "left";
    c.fillStyle = "rgba(244,241,235,.6)";
    c.font = `700 20px ${SANS}`;
    c.fillText("LEAGUE TITLES", 690, 190);
    c.fillStyle = filled === 20 ? LIME : PAPER;
    c.font = `190px ${DISPLAY}`;
    c.fillText(String(filled), 684, 370);
    for (let i = 0; i < 20; i++) {
      const x = 708 + i % 10 * 52;
      const y = 450 + Math.floor(i / 10) * 56;
      const on = i < filled;
      const r = i === 19 && on ? 18 * pop((s - 1.63) / 0.4) : 18;
      c.beginPath();
      c.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
      if (on) {
        c.fillStyle = i === 19 ? LIME : RED_BRIGHT;
        c.fill();
      } else {
        c.strokeStyle = "rgba(244,241,235,.3)";
        c.lineWidth = 2;
        c.stroke();
      }
    }
    heading(c, s, "2025", milestones[9].title);
    const outro = phase(s, 2.2, 0.9);
    if (outro <= 0) return;
    c.save();
    c.fillStyle = `rgba(16,14,14,${0.92 * outro})`;
    c.fillRect(0, 0, W, H);
    c.globalAlpha *= outro;
    c.textAlign = "center";
    c.fillStyle = PAPER;
    c.font = `104px ${DISPLAY}`;
    c.fillText("YOU'LL NEVER WALK ALONE", W / 2, 390 + (1 - outro) * 24, 1100);
    c.fillStyle = LIME;
    c.font = `700 30px ${SANS}`;
    c.fillText("\u6545\u4E8B\uFF0C\u4ECD\u5728\u7EE7\u7EED", W / 2, 456);
    c.restore();
  };
  var painters = [
    founded,
    firstTitle,
    shankly,
    theKop,
    europeanCups,
    hillsborough,
    istanbul,
    madrid,
    premierLeague,
    twenty
  ];
  function sceneAt(t) {
    let index = 0;
    for (let i = 0; i < sceneStarts.length; i++) if (t >= sceneStarts[i]) index = i;
    return index;
  }
  function drawChrome(c, index) {
    c.save();
    c.fillStyle = "rgba(244,241,235,.5)";
    c.font = `700 17px ${SANS}`;
    c.textAlign = "left";
    c.fillText("RED CHORUS \xB7 LIVERPOOL FC 1892\u20132025", 76, 70);
    if (index !== null) {
      c.textAlign = "right";
      c.fillText(`${String(index + 1).padStart(2, "0")} / ${painters.length}`, W - 76, 70);
    }
    c.restore();
  }
  function drawPoster(c) {
    c.save();
    backdrop(c, DEEP, INK);
    glow(c, W / 2, 360, 480, "rgba(200,16,46,.35)");
    c.textAlign = "center";
    c.fillStyle = PAPER;
    c.font = `150px ${DISPLAY}`;
    c.fillText("1892\u20132025", W / 2, 360, 900);
    c.fillStyle = LIME;
    c.font = `700 32px ${SANS}`;
    c.fillText("40 \u79D2\uFF0C\u8D70\u8FC7\u5229\u7269\u6D66\u7684\u5386\u53F2", W / 2, 426);
    c.fillStyle = RED;
    c.beginPath();
    c.arc(W / 2, 540, 46, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = PAPER;
    c.beginPath();
    c.moveTo(W / 2 - 14, 518);
    c.lineTo(W / 2 + 22, 540);
    c.lineTo(W / 2 - 14, 562);
    c.closePath();
    c.fill();
    c.restore();
    drawChrome(c, null);
  }
  function drawFrame(c, t) {
    const index = sceneAt(t);
    const s = t - sceneStarts[index];
    const last = index === painters.length - 1;
    c.save();
    c.fillStyle = INK;
    c.fillRect(0, 0, W, H);
    c.globalAlpha = clamp(Math.min(s / FADE, last ? 1 : (milestones[index].duration - s) / FADE));
    painters[index](c, s);
    c.restore();
    drawChrome(c, index);
    return index;
  }

  // hist-entry.ts
  window.LFC = { drawFrame, drawPoster, W, H };
})();
