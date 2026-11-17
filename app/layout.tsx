import type { Metadata, Viewport } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "../styles.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"]
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "MIT — Your AI command center",
  description: "MIT is your personal AI workspace, with a specialist agent for every task.",
  applicationName: "MIT"
};

export const viewport: Viewport = { themeColor: "#101116" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
