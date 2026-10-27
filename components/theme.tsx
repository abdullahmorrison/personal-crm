"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";

type Theme = "system" | "light" | "dark";

const KEY = "theme";
// Browser bar colours, the same as --color-paper.
const BAR = { light: "#faf7f2", dark: "#1b1916" };

const OPTIONS = [
  { value: "system", label: "System", Icon: Monitor, hint: "Matches your device's setting." },
  { value: "light", label: "Light", Icon: Sun, hint: "Always light." },
  { value: "dark", label: "Dark", Icon: Moon, hint: "Always dark." },
] as const;

function saved(): Theme {
  try {
    const theme = localStorage.getItem(KEY);
    return theme === "light" || theme === "dark" ? theme : "system";
  } catch {
    return "system";
  }
}

// System leaves data-theme off, so the CSS follows the device.
function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  // The browser bar's metas pick their colour by media query, which ignores data-theme.
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    const dark = theme === "system" ? meta.getAttribute("media")?.includes("dark") : theme === "dark";
    meta.setAttribute("content", dark ? BAR.dark : BAR.light);
  }
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function choose(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {}
  apply(theme);
  listeners.forEach((listener) => listener());
}

const SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

/** In <head>: applies the saved theme while the page parses, before the first paint. */
export function ThemeScript() {
  // React's dev remount resets <html> attributes, and the browser bar metas need it too.
  useLayoutEffect(() => apply(saved()), []);
  // text/plain on the client so React doesn't warn about rendering a script; it already ran.
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}

/** System / Light / Dark, saved on this device. */
export function ThemePicker() {
  const theme = useSyncExternalStore(subscribe, saved, () => "system");
  return (
    <>
      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1 rounded-[14px] bg-surface p-1">
        {OPTIONS.map(({ value, label, Icon }) => (
          <label
            key={value}
            className="flex flex-col items-center gap-1.5 rounded-[10px] py-3 text-[13px] text-muted transition-colors hover:text-ink has-checked:bg-raised has-checked:font-medium has-checked:text-ink has-checked:shadow-(--shadow-avatar) has-focus-visible:ring-2 has-focus-visible:ring-ink"
          >
            <input
              type="radio"
              name="theme"
              value={value}
              checked={theme === value}
              onChange={() => choose(value)}
              className="sr-only"
            />
            <Icon size={20} />
            {label}
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">{OPTIONS.find((option) => option.value === theme)?.hint}</p>
    </>
  );
}
