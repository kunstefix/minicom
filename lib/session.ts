/**
 * Visitor session helpers: load/save visitor id and optional widget/theme state.
 * Uses localStorage (client-only).
 */

const VISITOR_ID_KEY = "minicom_visitor_id";
const WIDGET_OPEN_KEY = "minicom_widget_open";
const THEME_KEY = "minicom_theme";

export function loadVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(VISITOR_ID_KEY);
}

export function saveVisitorId(visitorId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VISITOR_ID_KEY, visitorId);
}

export function loadWidgetOpen(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(WIDGET_OPEN_KEY) === "true";
}

export function saveWidgetOpen(open: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WIDGET_OPEN_KEY, open ? "true" : "false");
}

export function loadTheme(): "light" | "dark" | "system" | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(THEME_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return null;
}

export function saveTheme(theme: "light" | "dark" | "system"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
}
