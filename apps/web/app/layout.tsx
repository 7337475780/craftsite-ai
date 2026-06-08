import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CraftSite AI",
  description: "Craft stunning websites with a single prompt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
        <body suppressHydrationWarning>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
