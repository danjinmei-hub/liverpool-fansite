# 《光环》— 一分钟看懂「弥赛亚情节」

![poster](poster.jpg)

`messiah-complex.mp4` · 60 秒 · 1920×1080 · 30fps · 无旁白（文字 + 配乐叙事）

一个自带光环的小人，想拯救身边所有人。光环越来越大、越来越亮，
亮到其他人都成了灰色的影子，还被一根根"金线"牵着走。
直到光环碎裂，才发现：每个人本来都有自己的光。

| 时间 | 段落 | 画面 / 文字 |
| --- | --- | --- |
| 0–7s | 引子 | 一粒火星 →「有一种人，总觉得全世界都在等自己去拯救。」 |
| 7–12s | 片名 | 火星扩成光环，框住「弥赛亚情节 MESSIAH COMPLEX」 |
| 12–21s | 定义 | 弥赛亚 = 希伯来语 Mashiach「受膏者」→ 救世主；弥赛亚情节 = 深信自己注定要拯救他人乃至世界（通俗心理学概念，非正式临床诊断） |
| 21–37s | 三个表现 | ① 没有我，他们就不行（过度承担）② 被需要，我才有价值（价值感建立在拯救上）③ 我没事，先顾他们（忽视自己直到耗尽）——光环变大、刺眼，他人被金线牵引、变暗，主角被压弯 |
| 37–45s | 反转 | 「可是光环越亮，就越看不见——每个人，本来都有自己的光。」他人亮起各自的颜色，金线断开，光环颤抖、碎裂 |
| 45–60s | 释然 | 碎片化作星星，所有人站成一排、手牵手：「你不必成为谁的救世主。真正的帮助，是并肩同行，而不是高高在上。」 |

## 如何重新生成

全部由代码生成：画面是 Canvas 逐帧确定性渲染，配乐是 numpy 合成（D 小调铺底 → 圣咏式合唱 → 加速的心跳 → 玻璃碎裂 → D 大调八音盒）。

```bash
cd media/messiah-complex
npm install                         # playwright + Noto Serif SC / Cormorant Garamond 字体
pip install numpy imageio-ffmpeg
export FFMPEG=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")

python3 score.py                                  # -> score.wav
node render.mjs video silent.mp4 30               # -> silent.mp4 (1800 帧)
$FFMPEG -i silent.mp4 -i score.wav -c:v copy -c:a aac -b:a 192k -shortest messiah-complex.mp4
```

- 预览单帧：`node render.mjs stills 8.5 24.5 45.15`（输出到 `stills/`）
- 浏览器实时预览：用任意静态服务器打开 `index.html`，`?t=30` 可定格到第 30 秒
- 需要 Chromium；`render.mjs` 默认使用 `/opt/pw-browsers/chromium`，可用 `CHROMIUM=/path/to/chrome` 覆盖
