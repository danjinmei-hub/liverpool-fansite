"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { milestones, sceneStarts, totalDuration as TOTAL } from "./milestones";
import { drawFrame, drawPoster, H, W } from "./scenes";
import { createSoundtrack } from "./soundtrack";
import styles from "./history.module.css";

const formatClock = (t: number) => `00:${String(Math.floor(t)).padStart(2, "0")}`;

export function HistoryAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef(0);
  const playingRef = useRef(false);
  const startedRef = useRef(false);
  const soundOnRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [soundtrack] = useState(createSoundtrack);

  const setPlayback = useCallback((next: boolean) => {
    startedRef.current = true;
    playingRef.current = next;
    setPlaying(next);
    if (next && soundOnRef.current) soundtrack.play(timeRef.current);
    else soundtrack.stop();
  }, [soundtrack]);

  useEffect(() => () => soundtrack.close(), [soundtrack]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const c = canvas?.getContext("2d");
    if (!canvas || !c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frame = 0;
    let last = performance.now();
    let drawn = -1;
    let shown = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (playingRef.current) {
        timeRef.current = Math.min(TOTAL, soundtrack.position() ?? timeRef.current + dt);
        if (timeRef.current >= TOTAL) {
          playingRef.current = false;
          setPlaying(false);
        }
      }
      const t = timeRef.current;
      if (t !== drawn) {
        drawn = t;
        if (!startedRef.current) {
          drawPoster(c);
        } else {
          const index = drawFrame(c, t);
          if (index !== shown) {
            shown = index;
            setSceneIndex(index);
          }
        }
        if (barRef.current) barRef.current.style.transform = `scaleX(${t / TOTAL})`;
        if (clockRef.current) clockRef.current.textContent = `${formatClock(t)} / ${formatClock(TOTAL)}`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [soundtrack]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (!startedRef.current) setPlayback(true);
    }, { threshold: 0.6 });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [setPlayback]);

  const toggle = () => {
    if (!playingRef.current && timeRef.current >= TOTAL) timeRef.current = 0;
    setPlayback(!playingRef.current);
  };

  const restart = () => {
    timeRef.current = 0;
    setPlayback(true);
  };

  const seek = (index: number) => {
    timeRef.current = sceneStarts[index] + 0.001;
    setPlayback(true);
  };

  const toggleSound = () => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (!next) {
      soundtrack.stop();
    } else if (playingRef.current) {
      soundtrack.play(timeRef.current);
    } else {
      if (timeRef.current >= TOTAL) timeRef.current = 0;
      setPlayback(true);
    }
  };

  const current = milestones[sceneIndex];

  return (
    <div className={styles.player}>
      <div className={styles.stage}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          role="img"
          aria-label="利物浦俱乐部历史动画：从 1892 年建队到 2025 年第 20 座联赛冠军"
          onClick={toggle}
        />
      </div>

      <div className={styles.controls}>
        <button type="button" onClick={toggle} aria-label={playing ? "暂停" : "播放"}>
          {playing ? <Pause aria-hidden="true" size={18} /> : <Play aria-hidden="true" size={18} />}
        </button>
        <button type="button" className={styles.ghost} onClick={restart} aria-label="从头播放">
          <RotateCcw aria-hidden="true" size={17} />
        </button>
        <div className={styles.track} aria-hidden="true">
          <div ref={barRef} className={styles.bar} />
        </div>
        <span ref={clockRef} className={styles.clock}>00:00 / {formatClock(TOTAL)}</span>
        <button
          type="button"
          className={`${styles.ghost} ${styles.sound}`}
          aria-pressed={soundOn}
          aria-label={soundOn ? "关闭音乐" : "开启音乐"}
          onClick={toggleSound}
        >
          {soundOn ? <Volume2 aria-hidden="true" size={17} /> : <VolumeX aria-hidden="true" size={17} />}
          <span>音乐</span>
        </button>
      </div>

      <ol className={styles.timeline} aria-label="跳转到历史节点">
        {milestones.map((milestone, index) => (
          <li key={milestone.year}>
            <button
              type="button"
              aria-current={index === sceneIndex ? "step" : undefined}
              onClick={() => seek(index)}
            >
              {milestone.year}
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.caption} aria-live="polite">
        <span>{current.year}</span>
        <div>
          <h2>{current.title}</h2>
          <p>{current.text}</p>
        </div>
      </div>
    </div>
  );
}
