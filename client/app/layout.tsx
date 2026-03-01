import "@mantine/core/styles.css";
import "./globals.css";
import localFont from "next/font/local";
import { Open_Sans } from "next/font/google";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { theme } from "../theme";

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

export const metadata = {
  title: "Mantine Next.js template",
  description: "I am using Mantine with Next.js!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body className={`${openSans.variable} ${juraMedium.variable} ${juraBold.variable}`}>
        <MantineProvider theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
