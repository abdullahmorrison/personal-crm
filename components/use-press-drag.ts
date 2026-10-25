"use client";

import { useRef } from "react";

type Point = { clientX: number; clientY: number };
type Handlers = { onStart: (p: Point) => void; onMove: (p: Point) => void; onDrop: (p: Point) => void; onCancel: () => void };

const HOLD_MS = 300; // touch: press and hold this long to pick up
const SLOP = 6; // px a finger or mouse may wander before it counts as a move

/**
 * Drag that leaves taps and clicks alone. Mouse: starts once the pointer moves while pressed.
 * Touch: starts after a short hold; moving first cancels it. Returns handlers for the element.
 */
export function usePressDrag({ onStart, onMove, onDrop, onCancel }: Handlers) {
  const press = useRef<{ x: number; y: number; id: number; el: Element; touch: boolean; active: boolean; timer?: number } | null>(null);
  const dragged = useRef(false);

  const activate = (p: Point) => {
    const s = press.current;
    if (!s) return;
    s.active = true;
    s.el.setPointerCapture(s.id);
    onStart(p);
  };
  const end = () => {
    if (press.current?.timer) clearTimeout(press.current.timer);
    press.current = null;
  };

  return {
    draggable: false,
    onPointerDown(e: React.PointerEvent) {
      if (e.button !== 0) return;
      const touch = e.pointerType !== "mouse";
      const p = { clientX: e.clientX, clientY: e.clientY };
      press.current = { x: e.clientX, y: e.clientY, id: e.pointerId, el: e.currentTarget, touch, active: false };
      if (touch) press.current.timer = window.setTimeout(() => activate(p), HOLD_MS);
    },
    onPointerMove(e: React.PointerEvent) {
      const s = press.current;
      if (!s) return;
      const moved = Math.hypot(e.clientX - s.x, e.clientY - s.y) > SLOP;
      if (!s.active) {
        if (s.touch && moved) end(); // moved before the hold finished: not a drag
        else if (!s.touch && moved) activate(e);
        return;
      }
      onMove(e);
    },
    onPointerUp(e: React.PointerEvent) {
      const active = press.current?.active;
      end();
      if (active) {
        // Swallow the click the browser may send right after the drop. It doesn't always send one
        // (not when the drop lands elsewhere), so clear the flag once this event is done.
        dragged.current = true;
        setTimeout(() => (dragged.current = false));
        onDrop(e);
      }
    },
    onPointerCancel() {
      const active = press.current?.active;
      end();
      if (active) onCancel();
    },
    onClickCapture(e: React.MouseEvent) {
      if (dragged.current) e.preventDefault();
    },
    onContextMenu(e: React.MouseEvent) {
      if (press.current?.touch) e.preventDefault(); // no long-press menu on phones
    },
  };
}
