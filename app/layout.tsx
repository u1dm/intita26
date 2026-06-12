import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IdeaCheck AI",
  description: "AI-сервис первичной оценки бизнес-идей и стартапов"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
