export const isDemoToolsEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_TOOLS === "true";

export function hasDebugParam() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "true";
}
