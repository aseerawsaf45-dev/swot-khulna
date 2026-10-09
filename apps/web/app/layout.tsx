import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SWOT Khulna Platform",
  description: "Hydrological Modeling in Khulna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans")}>
      <body
        className={`font-sans antialiased bg-[#050505] text-white selection:bg-cyan-500/30`}
      >
        {children}
      </body>
    </html>
  );
}
