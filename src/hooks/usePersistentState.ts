import { useState } from "react";

/** useState that survives reloads. Storage failures are ignored: the app works without it. */
export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      // fall through to the default
    }
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });

  const update = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // private mode or quota exceeded
    }
  };

  return [value, update] as const;
}
