"use client";

import { createTheme, CSSVariablesResolver } from "@mantine/core";

export const theme = createTheme({
  /* Put your mantine theme override here */
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-dimmed": "#5f6368",
  },
  dark: {},
});
