import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IdeaCheck",
  description: "Сервіс первинної оцінки бізнес-ідей і стартапів"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
