import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePressDrag } from "./use-press-drag";

// The hook only needs a ref that lasts between events, so it runs here without rendering.
vi.mock("react", () => ({ useRef: (current: unknown) => ({ current }) }));

function useSetup() {
  const handlers = { onStart: vi.fn(), onMove: vi.fn(), onDrop: vi.fn(), onCancel: vi.fn() };
  const drag = usePressDrag(handlers);
  const el = { setPointerCapture: vi.fn() };
  const event = (pointerType: string, clientX = 0, clientY = 0) =>
    ({ button: 0, pointerType, pointerId: 1, clientX, clientY, currentTarget: el }) as unknown as React.PointerEvent;
  const click = () => {
    const e = { preventDefault: vi.fn() };
    drag.onClickCapture(e as unknown as React.MouseEvent);
    return e.preventDefault.mock.calls.length > 0; // true when the click was swallowed
  };
  return { drag, handlers, event, click };
}

const pressEscape = () => window.dispatchEvent(Object.assign(new Event("keydown"), { key: "Escape" }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", Object.assign(new EventTarget(), { setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("usePressDrag with a mouse", () => {
  it("starts only after the pointer moves past the slop", () => {
    const { drag, handlers, event } = useSetup();
    drag.onPointerDown(event("mouse"));
    drag.onPointerMove(event("mouse", 4, 0));
    expect(handlers.onStart).not.toHaveBeenCalled();
    drag.onPointerMove(event("mouse", 10, 0));
    expect(handlers.onStart).toHaveBeenCalledOnce();
  });

  it("leaves a plain click alone", () => {
    const { drag, handlers, event, click } = useSetup();
    drag.onPointerDown(event("mouse"));
    drag.onPointerUp(event("mouse"));
    expect(handlers.onDrop).not.toHaveBeenCalled();
    expect(click()).toBe(false);
  });

  it("drops, swallows the click that follows, then lets the next one through", () => {
    const { drag, handlers, event, click } = useSetup();
    drag.onPointerDown(event("mouse"));
    drag.onPointerMove(event("mouse", 20, 0));
    drag.onPointerUp(event("mouse", 20, 0));
    expect(handlers.onDrop).toHaveBeenCalledOnce();
    expect(click()).toBe(true);
    vi.runAllTimers();
    expect(click()).toBe(false);
  });

  it("cancels on Escape without dropping, and the release isn't a click", () => {
    const { drag, handlers, event, click } = useSetup();
    drag.onPointerDown(event("mouse"));
    drag.onPointerMove(event("mouse", 20, 0));
    pressEscape();
    expect(handlers.onCancel).toHaveBeenCalledOnce();
    drag.onPointerMove(event("mouse", 40, 0));
    drag.onPointerUp(event("mouse", 40, 0));
    expect(handlers.onMove).not.toHaveBeenCalled();
    expect(handlers.onDrop).not.toHaveBeenCalled();
    expect(click()).toBe(true);
  });
});

describe("usePressDrag with touch", () => {
  it("starts after a hold", () => {
    const { drag, handlers, event } = useSetup();
    drag.onPointerDown(event("touch"));
    vi.advanceTimersByTime(299);
    expect(handlers.onStart).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(handlers.onStart).toHaveBeenCalledOnce();
  });

  it("treats a move before the hold as a swipe, not a drag", () => {
    const { drag, handlers, event } = useSetup();
    drag.onPointerDown(event("touch"));
    drag.onPointerMove(event("touch", 0, 30));
    vi.runAllTimers();
    expect(handlers.onStart).not.toHaveBeenCalled();
  });

  it("leaves a quick tap alone", () => {
    const { drag, handlers, event, click } = useSetup();
    drag.onPointerDown(event("touch"));
    drag.onPointerUp(event("touch"));
    vi.runAllTimers();
    expect(handlers.onStart).not.toHaveBeenCalled();
    expect(click()).toBe(false);
  });
});
