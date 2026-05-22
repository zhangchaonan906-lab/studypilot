import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyPilot",
  description: "面向大学同学的 AI 学习计划生成器",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
