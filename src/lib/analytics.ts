import { hasDebugParam, isDemoToolsEnabled } from "@/lib/demoTools";

export type AnalyticsEvent = {
  event: string;
  timestamp: string;
  data?: Record<string, unknown>;
};

const events: AnalyticsEvent[] = [];
const listeners: Set<() => void> = new Set();

export function trackEvent(event: string, data?: Record<string, unknown>) {
  const entry: AnalyticsEvent = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };
  events.push(entry);
  if (isDemoToolsEnabled && hasDebugParam()) {
    console.log(`[analytics] ${event}`, data ?? "");
  }
  listeners.forEach((fn) => fn());
}

export function getEvents() {
  return [...events];
}

export function clearEvents() {
  events.length = 0;
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
