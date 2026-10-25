import type { Metadata } from "next";
import { Newsreader, Poppins } from "next/font/google";
import "./globals.css";

// Poppins for the interface, Newsreader for anything the user writes.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-poppins" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: "Personal CRM",
  description: "Notable moments with the people in your life",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${newsreader.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
