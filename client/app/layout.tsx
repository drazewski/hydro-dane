import "@mantine/core/styles.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import localFont from "next/font/local";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { cssVariablesResolver, theme } from "../theme";
import type { Metadata } from "next";
import MatomoPageViewTracker from "./components/analytics/MatomoPageViewTracker";
import AnalyticsConsentBanner from "./components/analytics/AnalyticsConsentBanner";

const montserrat = localFont({
  src: "./fonts/Montserrat/Montserrat-VariableFont_wght.ttf",
  variable: "--font-montserrat",
  weight: "100 900",
  display: "swap",
});

const juraMedium = localFont({
  src: "./fonts/Jura/static/Jura-Medium.ttf",
  variable: "--font-jura-medium",
  weight: "500",
});
const juraBold = localFont({
  src: "./fonts/Jura/static/Jura-Bold.ttf",
  variable: "--font-jura-bold",
  weight: "600",
});

const BASE_URL = "https://hydro-dane.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Wykresy archiwalnych danych hydrologicznych IMGW",
    template: "%s – HydroDane",
  },
  applicationName: "HydroDane",
  description:
    "Interaktywne wykresy archiwalnych danych hydrologicznych z polskich stacji pomiarowych. Dane wodowskazów IMGW-PIB: poziom wody, przepływ, temperatura wody.",
  keywords: [
    "dane hydrologiczne",
    "hydrologia",
    "IMGW",
    "IMGW-PIB",
    "poziom wody",
    "przepływ wody",
    "temperatura wody",
    "stacje hydrologiczne",
    "wykresy hydrologiczne",
    "archiwalne dane hydrologiczne",
    "rzeki Polska",
  ],
  authors: [{ name: "HydroDane" }],
  creator: "HydroDane",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: BASE_URL,
    siteName: "HydroDane",
    title: "Wykresy archiwalnych danych hydrologicznych IMGW",
    description:
      "Interaktywne wykresy archiwalnych danych hydrologicznych z polskich stacji pomiarowych. Dane wodowskazów IMGW-PIB: poziom wody, przepływ, temperatura wody.",
  },
  twitter: {
    card: "summary",
    title: "Wykresy archiwalnych danych hydrologicznych IMGW",
    description:
      "Interaktywne wykresy archiwalnych danych hydrologicznych z polskich stacji pomiarowych. Dane wodowskazów IMGW-PIB.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <meta name="application-name" content="HydroDane" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${BASE_URL}/#website`,
              name: "HydroDane",
              alternateName: "Hydro Dane",
              url: `${BASE_URL}/`,
              description:
                "Wykresy archiwalnych danych hydrologicznych z polskich stacji pomiarowych.",
              inLanguage: "pl-PL",
            }),
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${juraMedium.variable} ${juraBold.variable}`}>
        <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme="light">
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {children}
            <AnalyticsConsentBanner />
            <MatomoPageViewTracker />
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
