import type { Metadata } from "next";
import { canonicalOrigin, isStaticProduction, pageMetadata } from "./seo";
import "./globals.css";

const siteMetadata = pageMetadata({
  path: "/",
  title: "RED CHORUS｜红潮同行",
  description: "面向中文 Liverpool 球迷的独立球迷空间，记录比赛、人物、历史、故事与球迷声音。",
});

export const metadata: Metadata = {
  ...siteMetadata,
  metadataBase: new URL(canonicalOrigin),
  title: {
    default: "RED CHORUS｜红潮同行",
    template: "%s｜RED CHORUS",
  },
  // The OSS export is the only indexable deployment. Sites remains a preview.
  robots: { index: isStaticProduction, follow: isStaticProduction },
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
