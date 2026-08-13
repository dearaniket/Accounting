import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { AppProvider } from "@/components/providers/app-provider";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "House Ledger",
  description: "Construction expense journal, ledgers, payments, analytics, and reports.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--surface-app)] text-[var(--text-strong)]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
