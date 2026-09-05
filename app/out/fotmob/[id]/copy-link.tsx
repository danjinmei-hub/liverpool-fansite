"use client";

import { useRef, useState } from "react";
import styles from "./page.module.css";

export default function CopyLink({ url }: { url: string }) {
  const field = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("已复制。请粘贴到 Safari 地址栏并前往。");
    } catch {
      field.current?.focus();
      field.current?.select();
      setStatus("请长按下方链接并选择复制，再粘贴到 Safari 地址栏。");
    }
  }

  return (
    <div className={styles.copy}>
      <label htmlFor="fotmob-web-url">该场比赛的网页链接</label>
      <textarea id="fotmob-web-url" ref={field} readOnly value={url} rows={3} spellCheck={false} />
      <button type="button" onClick={copy}>复制网页链接</button>
      <p className={styles.status} role="status">{status}</p>
    </div>
  );
}
