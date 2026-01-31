import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orca",
  description: "Orca - Your description here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
