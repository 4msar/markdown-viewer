import { EditorContent } from "@tiptap/react";
import { FileDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ExportFormat } from "./components/ExportMenu.tsx";
import { Toolbar, type Layout, type Theme } from "./components/Toolbar.tsx";
import { useFileDrop } from "./hooks/useFileDrop.ts";
import { useMarkdownEditor } from "./hooks/useMarkdownEditor.ts";
import { usePersistentState } from "./hooks/usePersistentState.ts";
import { buildHtmlDocument, downloadFile, safeFileName } from "./lib/exportFile.ts";
import { FILE_ACCEPT, importFile } from "./lib/importFile.ts";
import { renderMarkdown } from "./lib/renderMarkdown.ts";
import { SAMPLE_MARKDOWN } from "./lib/sample.ts";

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const PANE = "min-h-0 min-w-0 overflow-auto bg-white dark:bg-zinc-950";

export default function App() {
  const [markdown, setMarkdown] = usePersistentState("mdv:doc", SAMPLE_MARKDOWN);
  const [layout, setLayout] = usePersistentState<Layout>("mdv:layout", "split");
  // In side-by-side, the left pane can show raw markdown instead of the rich editor.
  const [splitRaw, setSplitRaw] = usePersistentState("mdv:splitRaw", false);
  const [theme, setTheme] = usePersistentState<Theme>("mdv:theme", systemTheme);
  const [fileName, setFileName] = usePersistentState("mdv:name", "document");
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useMarkdownEditor(markdown, setMarkdown);
  const previewHtml = useMemo(() => renderMarkdown(markdown), [markdown]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openFile = async (file: File) => {
    const result = await importFile(file);
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    if (
      markdown.trim() !== "" &&
      !window.confirm(`Replace the current document with "${file.name}"?`)
    ) {
      return;
    }
    editor.commands.setContent(result.text, { contentType: "markdown" });
    setMarkdown(editor.getMarkdown());
    setFileName(result.name);
  };

  const dragging = useFileDrop((file) => void openFile(file));

  /** Raw edits only reach the rich editor when it is needed again. */
  const syncEditorFromSource = () => {
    editor.commands.setContent(markdown, { contentType: "markdown", emitUpdate: false });
  };

  const isRaw = (l: Layout, raw: boolean) => l === "source" || (l === "split" && raw);
  const rawActive = isRaw(layout, splitRaw);

  const applyView = (nextLayout: Layout, nextSplitRaw: boolean) => {
    if (rawActive && !isRaw(nextLayout, nextSplitRaw)) syncEditorFromSource();
    if (nextLayout !== layout) setLayout(nextLayout);
    if (nextSplitRaw !== splitRaw) setSplitRaw(nextSplitRaw);
  };

  const exportAs = (format: ExportFormat) => {
    const name = safeFileName(fileName);
    if (rawActive) syncEditorFromSource();
    const current = editor.getMarkdown();
    if (format === "md") {
      downloadFile(`${name}.md`, current, "text/markdown");
    } else if (format === "html") {
      downloadFile(`${name}.html`, buildHtmlDocument(name, renderMarkdown(current)), "text/html");
    } else if (format === "txt") {
      downloadFile(`${name}.txt`, editor.getText({ blockSeparator: "\n\n" }), "text/plain");
    } else {
      // Print the preview on a light page whatever the current theme.
      setMarkdown(current);
      const root = document.documentElement;
      const wasDark = root.classList.contains("dark");
      root.classList.remove("dark");
      window.print();
      root.classList.toggle("dark", wasDark);
    }
  };

  const clearDocument = () => {
    if (markdown.trim() === "" || !window.confirm("Clear the whole document?")) return;
    editor.commands.clearContent(true);
    setMarkdown("");
    setFileName("document");
  };

  const showEditor = layout === "editor" || (layout === "split" && !splitRaw);
  const showPreview = layout === "split" || layout === "preview";

  return (
    <div className="print-root flex h-full flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Toolbar
        editor={editor}
        layout={layout}
        onLayoutChange={(next) => applyView(next, splitRaw)}
        splitRaw={splitRaw}
        onToggleSplitRaw={() => applyView(layout, !splitRaw)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onImport={() => fileInputRef.current?.click()}
        onExport={exportAs}
        onClear={clearDocument}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_ACCEPT}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void openFile(file);
        }}
      />

      <main
        className={`print-root grid min-h-0 flex-1 ${
          layout === "split" ? "grid-rows-2 md:grid-cols-2 md:grid-rows-1" : "grid-cols-1"
        }`}
      >
        {/* Stays mounted in every layout so undo history and selection survive. */}
        <section
          aria-label="Editor"
          hidden={!showEditor}
          className={`no-print ${PANE} ${
            layout === "split"
              ? "border-b border-zinc-200 md:border-r md:border-b-0 dark:border-zinc-800"
              : ""
          }`}
        >
          <EditorContent
            editor={editor}
            className={`h-full ${layout === "editor" ? "mx-auto max-w-4xl" : ""}`}
          />
        </section>

        <section
          aria-label="Raw markdown"
          hidden={!rawActive}
          className={`no-print ${PANE} ${
            layout === "split"
              ? "border-b border-zinc-200 md:border-r md:border-b-0 dark:border-zinc-800"
              : ""
          }`}
        >
          <textarea
            aria-label="Raw markdown source"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className={`block h-full w-full resize-none ${layout === "source" ? "mx-auto max-w-4xl" : ""} bg-transparent px-6 py-5 font-mono text-sm leading-relaxed outline-none`}
          />
        </section>

        <section aria-label="Preview" hidden={!showPreview} className={`print-pane ${PANE}`}>
          <article
            className={`markdown-body prose prose-zinc dark:prose-invert max-w-none px-6 py-5 ${
              layout === "preview" ? "mx-auto max-w-4xl" : ""
            }`}
            // Sanitized by DOMPurify in renderMarkdown.
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </section>
      </main>

      {notice && (
        <div
          role="alert"
          className="no-print fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg"
        >
          {notice}
        </div>
      )}

      {dragging && (
        <div
          aria-hidden="true"
          className="no-print pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-blue-500/10"
        >
          <div className="rounded-2xl border-2 border-dashed border-blue-500 bg-white/90 p-10 text-blue-600 dark:bg-zinc-900/90 dark:text-blue-400">
            <FileDown size={56} strokeWidth={1.5} />
          </div>
        </div>
      )}
    </div>
  );
}
