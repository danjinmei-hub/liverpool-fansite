"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function CopyLink({ url }: { url: string }) {
  const [showUrl, setShowUrl] = useState(false);
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("链接已复制");
    } catch {
      setShowUrl(true);
      setStatus("请长按链接复制");
    }
  }

  return (
    <div className={styles.copy}>
      <button type="button" onClick={copy}>复制网页链接</button>
      {showUrl && <textarea aria-label="该场比赛的网页链接" readOnly value={url} rows={3} spellCheck={false} onFocus={(event) => event.currentTarget.select()} />}
      <p className={styles.status} role="status">{status}</p>
    </div>
  );
}
