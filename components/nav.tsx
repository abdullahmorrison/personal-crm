"use client";

import { BookOpen, MapPin, PenLine, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/people", label: "People", Icon: Users },
  { href: "/journal", label: "Journal", Icon: BookOpen },
  { href: "/places", label: "Places", Icon: MapPin },
] as const;

function useIsActive() {
  const path = usePathname();
  return (href: string) => path === href || path.startsWith(`${href}/`);
}

export function LogButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/write"
      className={`flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-paper shadow-[0_4px_14px_rgba(122,58,31,0.25)] ${className}`}
    >
      <PenLine size={18} />
      Log a moment
    </Link>
  );
}

// Form screens have their own submit button, so the floating one would compete with it.
const FORM_ROUTES = ["/write", "/people/new"];

/** Phones: floating Log a moment button above the tab bar, hidden on form screens. */
export function FloatingLogButton() {
  const path = usePathname();
  if (FORM_ROUTES.includes(path)) return null;
  return <LogButton className="fixed right-4 bottom-[calc(max(env(safe-area-inset-bottom),12px)+76px)] z-20 desk:hidden" />;
}

/** Phones: bottom tab bar. */
export function TabBar() {
  const isActive = useIsActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-paper pt-2.5 pb-[max(env(safe-area-inset-bottom),12px)] desk:hidden">
      {TABS.map(({ href, label, Icon }) => {
        const on = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 text-[11px] ${on ? "font-medium text-accent" : "text-muted"}`}
          >
            <Icon size={22} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop: left sidebar. */
export function Sidebar() {
  const isActive = useIsActive();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r border-line px-5 py-7 desk:flex">
      <span className="text-[17px] font-medium">Personal CRM</span>
      <LogButton />
      <nav className="flex flex-col gap-1">
        {TABS.map(({ href, label, Icon }) => {
          const on = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm ${on ? "bg-surface font-medium text-ink" : "text-muted"}`}
            >
              <Icon size={20} className={on ? "text-accent" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
