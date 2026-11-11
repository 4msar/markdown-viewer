import { Download, FileCode, FileText, FileType, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton.tsx";

export type ExportFormat = "md" | "html" | "txt" | "pdf";

const FORMATS = [
  { format: "md", icon: FileText, label: "Export as Markdown (.md)" },
  { format: "html", icon: FileCode, label: "Export as HTML (.html)" },
  { format: "txt", icon: FileType, label: "Export as plain text (.txt)" },
  { format: "pdf", icon: Printer, label: "Print or save as PDF" },
] as const;

export function ExportMenu({ onExport }: { onExport: (format: ExportFormat) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        icon={Download}
        label="Export"
        active={open}
        toggle
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div
          role="menu"
          aria-label="Export formats"
          className="absolute top-full right-0 z-30 mt-1.5 flex gap-0.5 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {FORMATS.map(({ format, icon, label }) => (
            <IconButton
              key={format}
              icon={icon}
              label={label}
              onClick={() => {
                setOpen(false);
                onExport(format);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
