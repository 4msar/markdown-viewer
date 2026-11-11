import { Editor } from "@tiptap/react";
import { describe, expect, it } from "vite-plus/test";
import { buildHtmlDocument, safeFileName } from "./exportFile.ts";
import { extensions } from "./extensions.ts";
import { MAX_FILE_BYTES, importFile, stripExtension, validateFile } from "./importFile.ts";
import { renderMarkdown } from "./renderMarkdown.ts";

describe("renderMarkdown", () => {
  it("renders GFM tables, task lists and strikethrough", () => {
    const html = renderMarkdown("| a | b |\n| - | - |\n| 1 | 2 |\n\n- [x] done\n\n~~gone~~");
    expect(html).toContain("<table>");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("<del>gone</del>");
  });

  it("strips scripts, event handlers and javascript: links", () => {
    const html = renderMarkdown(
      '<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n[x](javascript:alert(1))',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
  });

  it("opens links safely in a new tab", () => {
    const html = renderMarkdown("[site](https://example.com)");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("highlights known languages and escapes unknown ones", () => {
    expect(renderMarkdown("```js\nconst a = 1;\n```")).toContain("hljs-keyword");
    expect(renderMarkdown("```nope\n<b>\n```")).toContain("&lt;b&gt;");
  });
});

describe("importFile", () => {
  it("accepts markdown and text files", () => {
    expect(validateFile({ name: "notes.md", size: 10 })).toBeNull();
    expect(validateFile({ name: "NOTES.TXT", size: 10 })).toBeNull();
    expect(validateFile({ name: "a.markdown", size: 10 })).toBeNull();
  });

  it("rejects other types and oversized files", () => {
    expect(validateFile({ name: "photo.png", size: 10 })).toMatch(/not a \.md or \.txt/);
    expect(validateFile({ name: "big.md", size: MAX_FILE_BYTES + 1 })).toMatch(/larger/);
  });

  it("reads text, normalizes line endings and drops the extension", async () => {
    const result = await importFile(new File(["# Hi\r\nthere"], "my.notes.md"));
    expect(result).toEqual({ ok: true, name: "my.notes", text: "# Hi\nthere" });
  });

  it("strips only the last extension", () => {
    expect(stripExtension("readme.md")).toBe("readme");
    expect(stripExtension(".md")).toBe(".md");
  });
});

describe("exportFile", () => {
  it("builds a standalone document with an escaped title", () => {
    const doc = buildHtmlDocument("<a&b>", "<p>body</p>");
    expect(doc).toContain("<title>&lt;a&amp;b&gt;</title>");
    expect(doc).toContain("<p>body</p>");
    expect(doc.startsWith("<!doctype html>")).toBe(true);
  });

  it("sanitizes file names", () => {
    expect(safeFileName("a/b:c")).toBe("a-b-c");
    expect(safeFileName("  ")).toBe("document");
  });
});

describe("editor markdown round-trip", () => {
  const roundTrip = (markdown: string) => {
    const editor = new Editor({ extensions, content: markdown, contentType: "markdown" });
    const output = editor.getMarkdown();
    editor.destroy();
    return output;
  };

  it("keeps headings, marks and links", () => {
    const output = roundTrip(
      "# Title\n\nSome **bold**, *italic*, ~~strike~~ and `code` [link](https://example.com).",
    );
    expect(output).toContain("# Title");
    expect(output).toContain("**bold**");
    expect(output).toContain("*italic*");
    expect(output).toContain("~~strike~~");
    expect(output).toContain("`code`");
    expect(output).toContain("[link](https://example.com)");
  });

  it("keeps lists and task lists", () => {
    const output = roundTrip("- one\n- two\n\n1. first\n2. second\n\n- [x] done\n- [ ] todo");
    expect(output).toContain("- one");
    expect(output).toContain("1. first");
    expect(output).toContain("- [x] done");
    expect(output).toContain("- [ ] todo");
  });

  it("keeps tables, code blocks and quotes", () => {
    const output = roundTrip(
      "| a | b |\n| --- | --- |\n| 1 | 2 |\n\n```ts\nconst a = 1;\n```\n\n> quote",
    );
    expect(output).toMatch(/\|\s*a\s*\|\s*b\s*\|/);
    expect(output).toMatch(/\|\s*1\s*\|\s*2\s*\|/);
    expect(output).toContain("```ts\nconst a = 1;\n```");
    expect(output).toContain("> quote");
  });
});
