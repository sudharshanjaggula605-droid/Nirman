import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClientLayoutWrapper } from "@/components/client-layout-wrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nirman-hsxg.vercel.app"),
  title: {
    default: "NIRMAN | Construction Tender Marketplace & Contractor Management",
    template: "%s | NIRMAN",
  },
  description: "NIRMAN is India's leading transparent construction tender marketplace, connecting verified property owners directly with licensed civil contractors.",
  keywords: ["construction tender", "contractor management", "civil contractor", "property owner", "BOQ bidding", "India construction"],
  authors: [{ name: "NIRMAN Platform" }],
  creator: "NIRMAN",
  publisher: "NIRMAN",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NIRMAN | Construction Tender Marketplace & Contractor Management",
    description: "Connect with verified civil contractors, compare transparent BOQ bids, and manage construction milestones securely.",
    url: "https://nirman-hsxg.vercel.app",
    siteName: "NIRMAN",
    images: [
      {
        url: "/hero-construction.jpg",
        width: 1200,
        height: 630,
        alt: "NIRMAN Construction Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIRMAN | Construction Tender Marketplace",
    description: "India's transparent construction tender and contractor marketplace.",
    images: ["/hero-construction.jpg"],
  },
  icons: {
    icon: [
      { url: "/images/nirman-logo.png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/images/nirman-logo.png",
    apple: "/images/nirman-logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body
        suppressHydrationWarning
        className={`min-h-screen flex flex-col bg-background text-foreground antialiased font-sans ${inter.className}`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

