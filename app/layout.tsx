import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RED ERA｜利物浦独立中文球迷档案",
  description:
    "聚焦利物浦 2026/27 赛季的比赛、阵容、战术与历史；所有动态内容保留日期与来源。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
