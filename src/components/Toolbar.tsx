import { type Editor, useEditorState } from "@tiptap/react";
import {
  BetweenHorizontalEnd,
  BetweenVerticalEnd,
  Bold,
  Code,
  CodeXml,
  Columns2,
  Eye,
  FileUp,
  Grid2x2X,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  ListTodo,
  Lock,
  LockOpen,
  Minus,
  Moon,
  PencilLine,
  Pilcrow,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Sun,
  Table,
  TableColumnsSplit,
  TableRowsSplit,
  TextQuote,
  Trash2,
  Undo2,
} from "lucide-react";
import { ExportMenu, type ExportFormat } from "./ExportMenu.tsx";
import { IconButton, ToolbarDivider } from "./IconButton.tsx";

export type Layout = "split" | "editor" | "source" | "preview";
export type Theme = "light" | "dark";

type ToolbarProps = {
  editor: Editor;
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  /** Side-by-side only: left pane shows raw markdown instead of the rich editor. */
  splitRaw: boolean;
  onToggleSplitRaw: () => void;
  /** Side-by-side only: both panes scroll together. */
  scrollLock: boolean;
  onToggleScrollLock: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onImport: () => void;
  onExport: (format: ExportFormat) => void;
  onClear: () => void;
};

function editLink(editor: Editor) {
  const current = (editor.getAttributes("link").href as string | undefined) ?? "";
  const url = window.prompt("Link URL (leave empty to remove)", current);
  if (url === null) return;
  const chain = editor.chain().focus().extendMarkRange("link");
  if (url.trim() === "") chain.unsetLink().run();
  else chain.setLink({ href: url.trim() }).run();
}

export function Toolbar({
  editor,
  layout,
  onLayoutChange,
  splitRaw,
  onToggleSplitRaw,
  scrollLock,
  onToggleScrollLock,
  theme,
  onToggleTheme,
  onImport,
  onExport,
  onClear,
}: ToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      paragraph: e.isActive("paragraph"),
      blockquote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      taskList: e.isActive("taskList"),
      table: e.isActive("table"),
    }),
  });

  // Formatting only applies while the rich editor is on screen.
  const off = layout === "preview" || layout === "source" || (layout === "split" && splitRaw);
  const run = () => editor.chain().focus();

  return (
    <header className="no-print relative z-20 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
      <div
        role="toolbar"
        aria-label="Formatting"
        className="toolbar-scroll order-2 flex min-w-0 basis-full items-center gap-0.5 overflow-x-auto p-0.5 md:order-1 md:flex-1 md:basis-0"
      >
        <IconButton
          icon={Undo2}
          label="Undo"
          disabled={off || !state.canUndo}
          onClick={() => run().undo().run()}
        />
        <IconButton
          icon={Redo2}
          label="Redo"
          disabled={off || !state.canRedo}
          onClick={() => run().redo().run()}
        />
        <ToolbarDivider />
        <IconButton
          icon={Heading1}
          label="Heading 1"
          toggle
          active={state.h1}
          disabled={off}
          onClick={() => run().toggleHeading({ level: 1 }).run()}
        />
        <IconButton
          icon={Heading2}
          label="Heading 2"
          toggle
          active={state.h2}
          disabled={off}
          onClick={() => run().toggleHeading({ level: 2 }).run()}
        />
        <IconButton
          icon={Heading3}
          label="Heading 3"
          toggle
          active={state.h3}
          disabled={off}
          onClick={() => run().toggleHeading({ level: 3 }).run()}
        />
        <IconButton
          icon={Pilcrow}
          label="Paragraph"
          disabled={off}
          onClick={() => run().setParagraph().run()}
        />
        <IconButton
          icon={TextQuote}
          label="Quote"
          toggle
          active={state.blockquote}
          disabled={off}
          onClick={() => run().toggleBlockquote().run()}
        />
        <IconButton
          icon={SquareCode}
          label="Code block"
          toggle
          active={state.codeBlock}
          disabled={off}
          onClick={() => run().toggleCodeBlock().run()}
        />
        <IconButton
          icon={Minus}
          label="Horizontal rule"
          disabled={off}
          onClick={() => run().setHorizontalRule().run()}
        />
        <ToolbarDivider />
        <IconButton
          icon={Bold}
          label="Bold"
          toggle
          active={state.bold}
          disabled={off}
          onClick={() => run().toggleBold().run()}
        />
        <IconButton
          icon={Italic}
          label="Italic"
          toggle
          active={state.italic}
          disabled={off}
          onClick={() => run().toggleItalic().run()}
        />
        <IconButton
          icon={Strikethrough}
          label="Strikethrough"
          toggle
          active={state.strike}
          disabled={off}
          onClick={() => run().toggleStrike().run()}
        />
        <IconButton
          icon={Code}
          label="Inline code"
          toggle
          active={state.code}
          disabled={off}
          onClick={() => run().toggleCode().run()}
        />
        <IconButton
          icon={Link}
          label="Link"
          toggle
          active={state.link}
          disabled={off}
          onClick={() => editLink(editor)}
        />
        <ToolbarDivider />
        <IconButton
          icon={List}
          label="Bullet list"
          toggle
          active={state.bulletList}
          disabled={off}
          onClick={() => run().toggleBulletList().run()}
        />
        <IconButton
          icon={ListOrdered}
          label="Numbered list"
          toggle
          active={state.orderedList}
          disabled={off}
          onClick={() => run().toggleOrderedList().run()}
        />
        <IconButton
          icon={ListTodo}
          label="Task list"
          toggle
          active={state.taskList}
          disabled={off}
          onClick={() => run().toggleTaskList().run()}
        />
        <ToolbarDivider />
        <IconButton
          icon={Table}
          label="Insert table"
          disabled={off || state.table}
          onClick={() => run().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        {state.table && !off && (
          <>
            <IconButton
              icon={BetweenHorizontalEnd}
              label="Add row below"
              onClick={() => run().addRowAfter().run()}
            />
            <IconButton
              icon={BetweenVerticalEnd}
              label="Add column right"
              onClick={() => run().addColumnAfter().run()}
            />
            <IconButton
              icon={TableRowsSplit}
              label="Delete row"
              onClick={() => run().deleteRow().run()}
            />
            <IconButton
              icon={TableColumnsSplit}
              label="Delete column"
              onClick={() => run().deleteColumn().run()}
            />
            <IconButton
              icon={Grid2x2X}
              label="Delete table"
              onClick={() => run().deleteTable().run()}
            />
          </>
        )}
      </div>

      <div className="order-1 ml-auto flex shrink-0 items-center gap-0.5 md:order-2">
        <div
          role="group"
          aria-label="Layout"
          className="flex items-center gap-0.5 rounded-lg bg-zinc-200/60 p-0.5 dark:bg-zinc-800"
        >
          <IconButton
            icon={Columns2}
            label="Side by side"
            toggle
            active={layout === "split"}
            onClick={() => onLayoutChange("split")}
          />
          <IconButton
            icon={PencilLine}
            label="Editor only"
            toggle
            active={layout === "editor"}
            onClick={() => onLayoutChange("editor")}
          />
          <IconButton
            icon={CodeXml}
            label="Raw markdown"
            toggle
            active={layout === "source"}
            onClick={() => onLayoutChange("source")}
          />
          <IconButton
            icon={Eye}
            label="View only"
            toggle
            active={layout === "preview"}
            onClick={() => onLayoutChange("preview")}
          />
        </div>
        <IconButton
          icon={RemoveFormatting}
          label="Raw markdown in left pane (side by side)"
          toggle
          active={layout === "split" && splitRaw}
          disabled={layout !== "split"}
          onClick={onToggleSplitRaw}
        />
        <IconButton
          icon={scrollLock ? Lock : LockOpen}
          label="Scroll both panes together (side by side)"
          toggle
          active={layout === "split" && scrollLock}
          disabled={layout !== "split"}
          onClick={onToggleScrollLock}
        />
        <ToolbarDivider />
        <IconButton icon={FileUp} label="Import .md or .txt file" onClick={onImport} />
        <ExportMenu onExport={onExport} />
        <IconButton icon={Trash2} label="Clear document" onClick={onClear} />
        <ToolbarDivider />
        <IconButton
          icon={theme === "dark" ? Sun : Moon}
          label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={onToggleTheme}
        />
      </div>
    </header>
  );
}
