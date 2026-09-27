import type { Metadata } from "next";

export const canonicalOrigin = "https://redchorus.com";
export const isStaticProduction = process.env.NEXT_PUBLIC_STATIC_PRODUCTION === "1";

const image = {
  url: "/anfield-cc0.jpg",
  width: 1280,
  height: 853,
  alt: "Anfield · RED CHORUS",
};

export function pageMetadata({
  path, title, description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "RED CHORUS",
      locale: "zh_CN",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
