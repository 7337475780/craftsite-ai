import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import { WorkspaceProvider } from "@/components/providers/WorkspaceProvider";
import "./globals.css";

import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI Website Builder for Developers & Startups`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI website builder",
    "no-code website builder",
    "React website generator",
    "AI landing page generator",
    "SaaS website builder",
    "portfolio builder",
    "Next.js website generator",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
  },
};

import { ScrollAnimationProvider } from "@/components/providers/ScrollAnimationProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
          <body suppressHydrationWarning>
            <ThemeProvider>
              <WorkspaceProvider>
                <ScrollAnimationProvider />
                {children}
              </WorkspaceProvider>
            </ThemeProvider>
          </body>
        </html>
      </RealtimeProvider>
    </AuthProvider>
  );
}
