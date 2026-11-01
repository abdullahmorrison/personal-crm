/**
 * How much CSS zoom (app/globals.css scales the app up on wide screens) enlarges an element on screen: 1 when
 * unzoomed. getBoundingClientRect and pointer coordinates come back zoomed, so divide distances between them by
 * this to get the px that layout and styles use.
 */
export function zoomOf(el: HTMLElement) {
  return el.getBoundingClientRect().width / el.offsetWidth || 1;
}
