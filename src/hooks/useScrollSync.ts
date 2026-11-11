import { type RefObject, useEffect } from "react";

const scrollRange = (el: HTMLElement) => el.scrollHeight - el.clientHeight;

/**
 * Keeps two scroll containers at the same relative position while enabled.
 * The panes differ in height, so the scroll fraction is mirrored, not the offset.
 */
export function useScrollSync(
  enabled: boolean,
  firstRef: RefObject<HTMLElement | null>,
  secondRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const first = firstRef.current;
    const second = secondRef.current;
    if (!enabled || !first || !second) return;

    // The pane we just moved ourselves: its next scroll event is an echo, not the user.
    let echo: HTMLElement | null = null;

    const mirror = (from: HTMLElement, to: HTMLElement) => {
      const fromRange = scrollRange(from);
      const toRange = scrollRange(to);
      if (fromRange <= 0 || toRange <= 0) return;
      const before = to.scrollTop;
      to.scrollTop = (from.scrollTop / fromRange) * toRange;
      // No scroll event fires when the position did not change.
      if (to.scrollTop !== before) echo = to;
    };

    const handler = (from: HTMLElement, to: HTMLElement) => () => {
      if (echo === from) {
        echo = null;
        return;
      }
      mirror(from, to);
    };

    const onFirst = handler(first, second);
    const onSecond = handler(second, first);
    first.addEventListener("scroll", onFirst, { passive: true });
    second.addEventListener("scroll", onSecond, { passive: true });
    mirror(first, second);

    return () => {
      first.removeEventListener("scroll", onFirst);
      second.removeEventListener("scroll", onSecond);
    };
  }, [enabled, firstRef, secondRef]);
}
