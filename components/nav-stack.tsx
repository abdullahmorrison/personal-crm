"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore } from "react";

// The browser's Back should only undo pages that sit on top of another: a profile over People on a
// phone, a moment over a profile, a form over what it edits. Everything else (switching tabs, opening
// a panel beside the list on desktop, leaving a form) replaces the current entry, so Back from there
// leaves the app.
//
// The browser doesn't say which entries are below the current one, so this keeps its own copy of the
// app's part of the history: the paths Back would return to, bottom first. After a reload it starts
// over from the current page, which only means a close replaces instead of going back.

type Router = ReturnType<typeof useRouter>;

let stack: string[] = [];
// How the next path change happened. Link and router.push leave it unset, which means a push.
let incoming: "replace" | "pop" | null = null;
// What to do once a jump back through history lands: go on to another page, or refetch the one landed on.
let afterPop: { replace?: string; refresh?: boolean } | null = null;

function track(path: string, router: Router) {
  if (stack.length === 0) stack = [path];
  else if (incoming === "replace") stack[stack.length - 1] = path;
  else if (incoming === "pop") {
    // Back lands on a page already in the stack; anything else (Forward) starts over from here.
    const i = stack.lastIndexOf(path);
    stack = i === -1 ? [path] : stack.slice(0, i + 1);
  } else if (stack.at(-1) !== path) stack.push(path);
  incoming = null;

  const next = afterPop;
  afterPop = null;
  if (next?.replace && next.replace !== path) {
    incoming = "replace";
    router.replace(next.replace);
  } else if (next?.refresh) router.refresh();
}

/** Keeps the stack in step with navigation. Rendered once, in the app layout. */
export function NavStack() {
  return (
    <Suspense>
      <Tracker />
    </Suspense>
  );
}

function Tracker() {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const onPop = () => (incoming = "pop");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => track(path, router), [path, router]);
  return null;
}

function replace(router: Router, href: string) {
  incoming = "replace";
  router.replace(href);
}

function goBack(steps: number, then: NonNullable<typeof afterPop>) {
  afterPop = then;
  window.history.go(-steps);
}

/** Goes to a page as if it were the bottom of the app's history, like switching tabs. */
export function goLevel(router: Router, href: string) {
  if (stack.length > 1) goBack(stack.length - 1, { replace: href });
  else replace(router, href);
}

/**
 * Leaves the current page for `href`: back through history if `href` is under it, so Back doesn't return
 * here; otherwise as if `href` were the bottom of the app's history. `refresh` refetches the page landed on.
 */
export function close(router: Router, href: string, { refresh = false } = {}) {
  const i = stack.lastIndexOf(href, stack.length - 2);
  if (i !== -1) goBack(stack.length - 1 - i, { refresh });
  else if (stack.length > 1) goBack(stack.length - 1, { replace: href });
  else replace(router, href);
}

/** Once a form's action reports where it's done, closes the form to there, refetching what's there. */
export function useCloseOnDone(state: { done?: string }) {
  const router = useRouter();
  useEffect(() => {
    if (state.done) close(router, state.done, { refresh: true });
  }, [state, router]);
}

const DESK = "(width >= 1024px)"; // --breakpoint-desk
function subscribeDesk(onChange: () => void) {
  const query = window.matchMedia(DESK);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isDesk = () => window.matchMedia(DESK).matches;

type LinkProps = Omit<React.ComponentProps<typeof Link>, "href" | "onNavigate" | "replace"> & { href: string };

/** A link to a tab, or anything else that's the bottom of the app's history. */
export function LevelLink({ href, ...props }: LinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onNavigate={(e) => {
        e.preventDefault();
        goLevel(router, href);
      }}
      {...props}
    />
  );
}

/** Opens a page over the list on phones, or in the panel beside it on desktop, swapping what's there. */
export function PanelLink({ href, ...props }: LinkProps) {
  const desk = useSyncExternalStore(subscribeDesk, isDesk, () => false);
  return (
    <Link
      href={href}
      replace={desk}
      onNavigate={() => {
        if (desk) incoming = "replace";
      }}
      {...props}
    />
  );
}

/** Leaves the current page for the one under it, going back instead of adding to history. */
export function CloseLink({ href, ...props }: LinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onNavigate={(e) => {
        e.preventDefault();
        close(router, href);
      }}
      {...props}
    />
  );
}
