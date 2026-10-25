import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal CRM",
  description: "Notable moments with the people in your life",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
