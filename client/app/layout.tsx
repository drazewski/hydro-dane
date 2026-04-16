import "@mantine/core/styles.css";
import "./globals.css";
import localFont from "next/font/local";
import { Open_Sans } from "next/font/google";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { theme } from "../theme";
import type { Metadata } from "next";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
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
    default: "HydroDane – Wykresy archiwalnych danych hydrologicznych",
    template: "%s – HydroDane",
  },
  applicationName: "HydroDane",
  description:
    "Interaktywne wykresy archiwalnych danych hydrologicznych z polskich stacji pomiarowych. Dane IMGW-PIB: poziom wody, przepływ, temperatura wody.",
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
    title: "HydroDane – Wykresy archiwalnych danych hydrologicznych",
    description:
      "Interaktywne wykresy archiwalnych danych hydrologicznych z polskich stacji pomiarowych. Dane IMGW-PIB: poziom wody, przepływ, temperatura wody.",
  },
  twitter: {
    card: "summary",
    title: "HydroDane – Wykresy archiwalnych danych hydrologicznych",
    description:
      "Interaktywne wykresy archiwalnych danych hydrologicznych z polskich stacji pomiarowych. Dane IMGW-PIB.",
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
              name: "HydroDane",
              alternateName: "Hydro Dane",
              url: BASE_URL,
              description:
                "Wykresy archiwalnych danych hydrologicznych z polskich stacji pomiarowych.",
              inLanguage: "pl-PL",
            }),
          }}
        />
      </head>
      <body className={`${openSans.variable} ${juraMedium.variable} ${juraBold.variable}`}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {children}
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
