"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getAnalyticsConsent } from "./analyticsConsent";
import { useStationStore } from "../../hooks/useStationStore";
import { trackPageChanged } from "./analyticsEvents";

type MatomoQueue = Array<[string, ...unknown[]]>;

export default function MatomoPageViewTracker() {
  const pathname = usePathname();
  const hasTrackedInitialPage = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (getAnalyticsConsent() !== "accepted") {
      return;
    }

    const queue = (window as Window & { _paq?: MatomoQueue })._paq;
    if (!queue) {
      return;
    }

    const url = `${window.location.origin}${pathname}${window.location.search}`;

    queue.push(["setCustomUrl", url]);
    queue.push(["setDocumentTitle", document.title]);

    if (!hasTrackedInitialPage.current) {
      hasTrackedInitialPage.current = true;
      return;
    }

    queue.push(["trackPageView"]);
    const { station, dataType } = useStationStore.getState();
    trackPageChanged(`${pathname}${window.location.search}`, station, dataType);
  }, [pathname]);

  return null;
}
