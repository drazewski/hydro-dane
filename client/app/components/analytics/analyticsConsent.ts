"use client";

export const ANALYTICS_CONSENT_STORAGE_KEY = "hydrodane.analyticsConsent";
export const ANALYTICS_CONSENT_CHANGE_EVENT = "hydrodane:analytics-consent-change";
export const ANALYTICS_CONSENT_SETTINGS_EVENT = "hydrodane:analytics-consent-settings";

export type AnalyticsConsent = "accepted" | "declined";

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

export function setAnalyticsConsent(consent: AnalyticsConsent) {
  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  window.dispatchEvent(
    new CustomEvent<AnalyticsConsent>(ANALYTICS_CONSENT_CHANGE_EVENT, {
      detail: consent,
    })
  );
}

export function openAnalyticsConsentSettings() {
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_SETTINGS_EVENT));
}
