import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "OXWAY | Engineered for Absolute Capability",
  description: "A digital experience for a humanoid robotics company. Step into the lab where the future is being assembled.",
  openGraph: {
    title: "OXWAY",
    description: "A digital experience for a humanoid robotics company.",
    url: "https://oxway.io",
    siteName: "OXWAY",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OXWAY",
    description: "Step into the lab where the future is being assembled.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0B0D" },
    { media: "(prefers-color-scheme: light)", color: "#F5F4F1" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400..700&family=Outfit:wght@400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-ambience">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
