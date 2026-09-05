import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RED CHORUS｜红潮同行",
    template: "%s｜RED CHORUS",
  },
  description: "面向中文 Liverpool 球迷的独立球迷空间，记录比赛、人物、历史、故事与球迷声音。",
  openGraph: {
    title: "RED CHORUS｜红潮同行",
    description: "面向中文 Liverpool 球迷的独立球迷空间，记录比赛、人物、历史、故事与球迷声音。",
    siteName: "RED CHORUS",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RED CHORUS｜红潮同行",
    description: "面向中文 Liverpool 球迷的独立球迷空间，记录比赛、人物、历史、故事与球迷声音。",
  },
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
