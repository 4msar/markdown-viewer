import type { LucideIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type IconButtonProps = {
  icon: LucideIcon;
  /** Accessible name and tooltip; the button itself shows only the icon. */
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  /** Set for toggles so assistive tech announces the pressed state. */
  toggle?: boolean;
};

const EDGE_GAP = 6;

/**
 * Tooltip rendered in a portal with fixed positioning, so the scrolling
 * toolbar cannot clip it. Flips above the anchor when there is no room below.
 */
function Tooltip({ anchor, text }: { anchor: DOMRect; text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const centered = anchor.left + anchor.width / 2 - width / 2;
    const left = Math.max(EDGE_GAP, Math.min(centered, window.innerWidth - width - EDGE_GAP));
    const below = anchor.bottom + EDGE_GAP;
    const top = below + height > window.innerHeight ? anchor.top - height - EDGE_GAP : below;
    setPosition({ left, top });
  }, [anchor, text]);

  return createPortal(
    <span
      ref={ref}
      aria-hidden="true"
      style={{ left: position?.left ?? 0, top: position?.top ?? 0, opacity: position ? 1 : 0 }}
      className="no-print pointer-events-none fixed z-50 rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-md transition-opacity dark:bg-zinc-100 dark:text-zinc-900"
    >
      {text}
    </span>,
    document.body,
  );
}

export function IconButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  toggle,
}: IconButtonProps) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  const show = (element: HTMLElement) => setAnchor(element.getBoundingClientRect());
  const hide = () => setAnchor(null);

  return (
    // The wrapper takes the hover events: disabled buttons do not fire them.
    <span
      className="inline-flex shrink-0"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") show(event.currentTarget);
      }}
      onPointerLeave={hide}
    >
      <button
        type="button"
        aria-label={label}
        aria-pressed={toggle ? Boolean(active) : undefined}
        disabled={disabled}
        onClick={() => {
          hide();
          onClick();
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) show(event.currentTarget);
        }}
        onBlur={hide}
        // Keep the editor selection when a toolbar button is pressed.
        onMouseDown={(event) => event.preventDefault()}
        className={`inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-35 ${
          active
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        }`}
      >
        <Icon size={17} strokeWidth={2} aria-hidden="true" />
      </button>
      {anchor && <Tooltip anchor={anchor} text={label} />}
    </span>
  );
}

export function ToolbarDivider() {
  return (
    <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-zinc-300 dark:bg-zinc-700" />
  );
}
