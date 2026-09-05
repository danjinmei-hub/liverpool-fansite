"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isFootballSnapshot, type FootballSnapshot } from "./football-data";

const FootballSnapshotContext = createContext<FootballSnapshot | null>(null);

export function FootballSnapshotProvider({
  initialData,
  children,
}: {
  initialData: FootballSnapshot;
  children: ReactNode;
}) {
  const [snapshot, setSnapshot] = useState(initialData);

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const result = await fetch("/api/football", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const value: unknown = await result.json();
        if (result.ok && isFootballSnapshot(value)) setSnapshot(value);
      } catch {
        // The rendered fallback remains visible when the snapshot endpoint is unavailable.
      }
    }

    void refresh();
    return () => controller.abort();
  }, []);

  return (
    <FootballSnapshotContext.Provider value={snapshot}>
      {children}
    </FootballSnapshotContext.Provider>
  );
}

export function useFootballSnapshot() {
  const snapshot = useContext(FootballSnapshotContext);
  if (!snapshot) {
    throw new Error("useFootballSnapshot must be used inside FootballSnapshotProvider");
  }
  return snapshot;
}
