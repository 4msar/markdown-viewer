import { useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { extensions } from "../lib/extensions.ts";

const DEBOUNCE_MS = 150;

/** Tiptap editor that reports its content as markdown, debounced. */
export function useMarkdownEditor(initialMarkdown: string, onChange: (markdown: string) => void) {
  const onChangeRef = useRef(onChange);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return useEditor({
    extensions,
    content: initialMarkdown,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "tiptap prose prose-zinc dark:prose-invert max-w-none px-6 py-5",
        "aria-label": "Markdown editor",
      },
    },
    onUpdate: ({ editor }) => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        onChangeRef.current(editor.getMarkdown());
      }, DEBOUNCE_MS);
    },
  });
}
