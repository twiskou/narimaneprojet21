import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LangProvider } from "@/context/LangContext";

export const metadata: Metadata = {
  title: "NARP-SMART | Intelligent PR Engineering Platform",
  description: "Measure reputation, analyze sentiment in Arabic & French, and detect communication crises early with NARP-SMART.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="hero-gradient min-h-screen">
        <LangProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LangProvider>
      </body>
    </html>
  );
}
