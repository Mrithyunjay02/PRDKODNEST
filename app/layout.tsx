import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GlobalNavbar from "@/components/GlobalNavbar";
import AntigravityCursor from "@/components/CursorEffect";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job AI Copilot",
  description: "AI-powered job aggregator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-black text-white selection:bg-blue-500/30 overflow-x-hidden`}
      >
        {/* Background Visual Effect Layer */}
        <AntigravityCursor />

        {/* Global Navigation (Fixed / Floating inside component) */}
        <GlobalNavbar />

        {/* Main App Content */}
        <main className="relative z-10 pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
