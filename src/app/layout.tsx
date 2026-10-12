import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

/**
 * Fonts are downloaded at build time and served from our own origin: no
 * request to Google at runtime (privacy, speed, and a tighter CSP).
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${jetbrains.variable}`}>
      <head>
        {/* Runs before first paint: applies saved theme (no flash) and marks
            the first homepage visit of a session so the boot loader can cover
            the page without the content flashing underneath it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var r=document.documentElement;r.classList.add(localStorage.getItem("oxway-theme")==="light"?"light":"dark");if(location.pathname==="/"&&!sessionStorage.getItem("oxway_booted"))r.setAttribute("data-boot","pending")}catch(e){document.documentElement.classList.add("dark")}',
          }}
        />
      </head>
      <body className="antialiased bg-ambience">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
