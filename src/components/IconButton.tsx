import type { LucideIcon } from "lucide-react";

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

export function IconButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  toggle,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={toggle ? Boolean(active) : undefined}
      disabled={disabled}
      onClick={onClick}
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
  );
}

export function ToolbarDivider() {
  return (
    <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-zinc-300 dark:bg-zinc-700" />
  );
}
