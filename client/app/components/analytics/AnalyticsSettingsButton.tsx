"use client";

import { Button } from "@mantine/core";
import { openAnalyticsConsentSettings } from "./analyticsConsent";

export default function AnalyticsSettingsButton() {
  return (
    <Button variant="light" size="xs" onClick={openAnalyticsConsentSettings}>
      Zmień ustawienia analityki
    </Button>
  );
}
