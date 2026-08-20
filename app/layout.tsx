import type { Metadata } from "next";
import "./globals.css";

import Header from "@/app/components/Header";

export const metadata: Metadata = {
  title: "SAT Vocabulary Builder",
  description:
    "Practice SAT vocabulary through interactive games and personalized learning activities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />

        <main>{children}</main>
      </body>
    </html>
  );
}