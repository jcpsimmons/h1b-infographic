import type { Metadata } from "next";
import { Big_Shoulders, Big_Shoulders_Stencil, Public_Sans } from "next/font/google";
import "./globals.css";

const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-big-shoulders", axes: ["opsz"], display: "swap" });
const stencil = Big_Shoulders_Stencil({ subsets: ["latin"], variable: "--font-big-shoulders-stencil", axes: ["opsz"], display: "swap" });
const body = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans", display: "swap" });

export const metadata: Metadata = {
  title: "What the H-1B paperwork says",
  description:
    "Eleven million H-1B and PERM cases from the Department of Labor's public disclosure files, charted: how many, what they pay, where the work is and who files.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${stencil.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
