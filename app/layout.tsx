import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roleplay Writing Room",
  description: "多人回合制语 C 写作工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
