"use client";

import { StationType, RecordDataType } from "../../types/recordTypes";
import { getAnalyticsConsent } from "./analyticsConsent";

type MatomoQueue = Array<[string, ...unknown[]]>;

const EVENT_CATEGORY = "HydroDane";

function getStationDetail(station: StationType | null | undefined) {
  if (!station) {
    return "station: none";
  }

  const stationName = station.fullName || `${station.waterName} (${station.name})`;
  return `station: ${stationName} (${station.id})`;
}

function getDataTypeDetail(dataType: RecordDataType | null | undefined) {
  return `data: ${dataType ?? "none"}`;
}

function getChartDetail(station: StationType, dataType: RecordDataType) {
  return `${getStationDetail(station)} | ${getDataTypeDetail(dataType)}`;
}

function trackAnalyticsEvent(action: string, name: string) {
  if (typeof window === "undefined" || getAnalyticsConsent() !== "accepted") {
    return;
  }

  const queue = (window as Window & { _paq?: MatomoQueue })._paq;
  queue?.push(["trackEvent", EVENT_CATEGORY, action, name]);
}

export function trackStationSelected(station: StationType, dataType: RecordDataType) {
  trackAnalyticsEvent(
    "station_selected",
    `${getStationDetail(station)} | ${getDataTypeDetail(dataType)}`
  );
}

export function trackDataSelected(station: StationType | null, dataType: RecordDataType) {
  trackAnalyticsEvent(
    "data_selected",
    `${getStationDetail(station)} | ${getDataTypeDetail(dataType)}`
  );
}

export function trackPageChanged(
  page: string,
  station: StationType | null,
  dataType: RecordDataType
) {
  trackAnalyticsEvent(
    "page_changed",
    `page: ${page} | ${getStationDetail(station)} | ${getDataTypeDetail(dataType)}`
  );
}

export function trackChartImageDownloaded(station: StationType, dataType: RecordDataType) {
  trackAnalyticsEvent("chart_image_downloaded", getChartDetail(station, dataType));
}

export function trackChartPdfDownloaded(station: StationType, dataType: RecordDataType) {
  trackAnalyticsEvent("chart_pdf_downloaded", getChartDetail(station, dataType));
}

export function trackChartLinkGenerated(station: StationType, dataType: RecordDataType) {
  trackAnalyticsEvent("chart_link_generated", getChartDetail(station, dataType));
}

export function trackChartFullscreenEntered(station: StationType, dataType: RecordDataType) {
  trackAnalyticsEvent("chart_fullscreen_entered", getChartDetail(station, dataType));
}

export function trackMapOpened(station: StationType | null) {
  trackAnalyticsEvent(
    "map_opened",
    station ? `map: station | ${getStationDetail(station)}` : "map: global"
  );
}

export function trackFrequencySelected(
  station: StationType,
  dataType: RecordDataType,
  frequency: "monthly" | "yearly"
) {
  trackAnalyticsEvent(
    "frequency_selected",
    `frequency: ${frequency} | ${getChartDetail(station, dataType)}`
  );
}
