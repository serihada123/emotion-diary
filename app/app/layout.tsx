import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "감정일기 (우루루)",
  description: "우루루와 대화하며 오늘의 감정을 감정 오브젝트로 남기는 감정 일기",
  // manifest.ts의 display: "standalone"은 안드로이드/크롬 "홈 화면에 추가"에는 충분하지만,
  // iOS Safari에서 주소창 없는 몰입형 실행과 홈 화면 아이콘/타이틀을 보장하려면
  // 애플 전용 메타 태그가 별도로 필요하다.
  appleWebApp: {
    capable: true,
    title: "우루루",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/images/uruuru.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#C5E4EF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
