"use client";

import { createTheme, CSSVariablesResolver, type MantineColorsTuple } from "@mantine/core";

const hydro: MantineColorsTuple = [
  "#eef8ff",
  "#d9efff",
  "#b8e2ff",
  "#8bcefa",
  "#5db4ef",
  "#3299dc",
  "#217fc2",
  "#17679f",
  "#15547f",
  "#123f61",
];

export const theme = createTheme({
  primaryColor: "hydro",
  colors: { hydro },
  defaultRadius: "md",
  fontFamily: "var(--font-montserrat, Arial), system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-jura-medium, Arial), var(--font-montserrat, Arial), system-ui, sans-serif",
    fontWeight: "500",
  },
  focusRing: "auto",
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-dimmed": "#5f6368",
    "--hydro-page-bg": "#f4f7fb",
    "--hydro-surface": "#ffffff",
    "--hydro-surface-muted": "#f8fafc",
    "--hydro-border": "#dbe4ee",
    "--hydro-grid": "#dce5ee",
  },
  dark: {
    "--mantine-color-text": "#e6edf3",
    "--mantine-color-dimmed": "#aebdca",
    "--hydro-page-bg": "#101820",
    "--hydro-surface": "#17232d",
    "--hydro-surface-muted": "#1d2b36",
    "--hydro-border": "#304451",
    "--hydro-grid": "#2b3d4a",
  },
});
