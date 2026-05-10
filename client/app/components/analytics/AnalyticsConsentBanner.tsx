"use client";

import { useEffect, useState } from "react";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  ANALYTICS_CONSENT_SETTINGS_EVENT,
  type AnalyticsConsent,
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "./analyticsConsent";
import styles from "./analyticsConsentBanner.module.css";

const MATOMO_URL = "//stats.myceevee.com/";
const MATOMO_SITE_ID = "2";

type MatomoQueue = Array<[string, ...unknown[]]>;
type WindowWithMatomo = Window & {
  _paq?: MatomoQueue;
  hydrodaneMatomoLoaded?: boolean;
};

function getPageUrl() {
  return `${window.location.origin}${window.location.pathname}${window.location.search}`;
}

function initializeMatomo() {
  const matomoWindow = window as WindowWithMatomo;
  const queue = (matomoWindow._paq = matomoWindow._paq || []);

  queue.push(["disableCookies"]);
  queue.push(["forgetUserOptOut"]);
  queue.push(["enableLinkTracking"]);
  queue.push(["setTrackerUrl", `${MATOMO_URL}matomo.php`]);
  queue.push(["setSiteId", MATOMO_SITE_ID]);
  queue.push(["setCustomUrl", getPageUrl()]);
  queue.push(["setDocumentTitle", document.title]);
  queue.push(['disableCookies']);
  queue.push(["trackPageView"]);

  if (matomoWindow.hydrodaneMatomoLoaded) {
    return;
  }

  const script = document.createElement("script");
  const firstScript = document.getElementsByTagName("script")[0];

  script.async = true;
  script.src = `${MATOMO_URL}matomo.js`;
  firstScript.parentNode?.insertBefore(script, firstScript);
  matomoWindow.hydrodaneMatomoLoaded = true;
}

function optOutMatomo() {
  const queue = (window as WindowWithMatomo)._paq;
  queue?.push(["optUserOut"]);
}

export default function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const storedConsent = getAnalyticsConsent();
    setConsent(storedConsent);

    if (storedConsent === "accepted") {
      initializeMatomo();
    }

    const handleConsentChange = (event: Event) => {
      const nextConsent = (event as CustomEvent<AnalyticsConsent>).detail;
      setConsent(nextConsent);
      setSettingsOpen(false);

      if (nextConsent === "accepted") {
        initializeMatomo();
      } else {
        optOutMatomo();
      }
    };

    const handleSettingsOpen = () => {
      setSettingsOpen(true);
    };

    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, handleConsentChange);
    window.addEventListener(ANALYTICS_CONSENT_SETTINGS_EVENT, handleSettingsOpen);

    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, handleConsentChange);
      window.removeEventListener(ANALYTICS_CONSENT_SETTINGS_EVENT, handleSettingsOpen);
    };
  }, []);

  const visible = consent === null || settingsOpen;

  if (!visible) {
    return null;
  }

  const updateConsent = (nextConsent: AnalyticsConsent) => {
    if (consent === nextConsent) {
      setSettingsOpen(false);
      return;
    }

    setAnalyticsConsent(nextConsent);
  };

  const acceptAnalytics = () => {
    updateConsent("accepted");
  };

  const declineAnalytics = () => {
    updateConsent("declined");
  };

  return (
    <Paper className={styles.banner} shadow="md" radius="lg" withBorder>
      <Stack gap="sm">
        <div>
          <Text fw={600} size="sm">
            Anonimowa analityka
          </Text>
          <Text size="sm" c="dimmed">
            Używamy narzędzi analitycznych bez plików cookie, żeby sprawdzić, które części aplikacji są używane. Dane są anonimowe.
          </Text>
        </div>
        <Group gap="sm" justify="flex-end">
          <Button variant="subtle" color="gray" size="xs" onClick={declineAnalytics}>
            Nie zgadzam się
          </Button>
          <Button size="xs" onClick={acceptAnalytics}>
            Zgadzam się
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
