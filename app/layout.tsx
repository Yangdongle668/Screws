import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZUFEK | Custom Metal Screws",
  description: "Drawing-led custom metal screw sourcing from DONGGUAN ZUFEK PRECISION CO., LTD.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
