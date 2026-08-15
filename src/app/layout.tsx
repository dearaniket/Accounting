import type { Metadata } from "next";

import { AppProvider } from "@/components/providers/app-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "House Ledger",
  description: "Construction expense journal, ledgers, payments, analytics, and reports.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" data-theme="dark">
      <head>
        {/* Shentox font via cdnfonts */}
        <link
          rel="preconnect"
          href="https://fonts.cdnfonts.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/shentox"
        />
      </head>
      <body className="min-h-dvh antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
