import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const sansTC = Noto_Sans_TC({
  variable: "--font-sans-tc",
  weight: ["400", "500", "700", "900"],
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "Randy的小工具箱", template: "%s | Randy的小工具箱" },
  description: "抽獎轉盤、番茄鐘、好運抽籤。三個隨手就能打開的小工具，不用註冊、不用安裝。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${sansTC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
