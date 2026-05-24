import type { Metadata } from "next";
import { Agentation } from "agentation";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://somabiseo.com"),
  title: {
    default: "SomaBiseo",
    template: "%s · SomaBiseo",
  },
  description: "소마 일정, 공지, 멘토링을 한눈에 보는 비공식 일정 비서",
  openGraph: {
    title: "SomaBiseo",
    description: "소마 일정, 공지, 멘토링을 한눈에 보는 비공식 일정 비서",
    url: "/",
    siteName: "SomaBiseo",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SomaBiseo",
    description: "소마 일정, 공지, 멘토링을 한눈에 보는 비공식 일정 비서",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full scroll-smooth antialiased">
      <body className="min-h-full">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === "development" && (
          <Agentation endpoint="http://localhost:4747" />
        )}
      </body>
    </html>
  );
}
