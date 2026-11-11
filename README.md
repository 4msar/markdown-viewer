# Markdown Viewer

A live markdown editor and viewer that runs entirely in the browser. Write in a rich text editor or in raw markdown, watch the rendered preview update as you type, and import or export files.

## Features

- **Rich text editor** built on Tiptap, with an icon-only toolbar and a tooltip on every button
- **Four views**: side by side, editor only, raw markdown, and view only
- **Live preview** rendered from the markdown and sanitized before display
- **Import** `.md`, `.markdown` and `.txt` files by drag and drop or the file picker (up to 5 MB)
- **Export** to Markdown, standalone HTML, plain text, or PDF through the print dialog
- **GitHub-flavored markdown**: tables, task lists, strikethrough and syntax-highlighted code blocks
- **Autosave** of the document, view and theme to `localStorage`
- **Dark mode**, defaulting to the system preference

Nothing is uploaded: the document stays in the browser.

## Tech stack

| Area      | Choice                                                                        |
| --------- | ----------------------------------------------------------------------------- |
| Toolchain | [Vite+](https://viteplus.dev/guide/) (`vp`), pnpm, TypeScript                 |
| UI        | React 19 with the React Compiler, Tailwind CSS v4 and the typography plugin   |
| Editor    | [Tiptap 3](https://tiptap.dev) with the official `@tiptap/markdown` extension |
| Markdown  | [marked](https://marked.js.org) for parsing, DOMPurify for sanitizing         |
| Code      | lowlight in the editor, highlight.js in the preview                           |
| Icons     | [lucide-react](https://lucide.dev)                                            |
| Hosting   | Cloudflare Workers static assets                                              |

`marked` is the single markdown parser for both the editor round-trip and the preview, since it is the parser inside `@tiptap/markdown`.

## Getting started

Requires the [Vite+](https://viteplus.dev/guide/) CLI.

```bash
vp install
vp dev
```

## Scripts

| Command         | What it does                       |
| --------------- | ---------------------------------- |
| `vp dev`        | Start the dev server               |
| `vp check`      | Format, lint and type-check        |
| `vp test`       | Run the unit tests                 |
| `vp run build`  | Type-check and build to `dist`     |
| `vp preview`    | Serve the production build locally |
| `vp run deploy` | Build and deploy to Cloudflare     |

## Project structure

```
src/
  App.tsx            App shell: toolbar, panes, import and export wiring
  components/        Toolbar, IconButton (with tooltip), ExportMenu
  hooks/             Editor setup, persistent state, window file drop
  lib/               Markdown rendering, import, export, Tiptap extensions, tests
wrangler.jsonc       Cloudflare Worker configuration
```

The markdown string is the single source of truth. The rich editor reports its content as markdown; the preview, the raw view and autosave all read from it.

## Deployment

The app deploys as a static-assets Cloudflare Worker named `markdown`, configured in `wrangler.jsonc`. Log in once, then deploy:

```bash
./node_modules/.bin/wrangler login
vp run deploy
```

It publishes to `markdown.<your-subdomain>.workers.dev`.

After the first deploy, finish the SEO tags in `index.html` that need the final address: add `<link rel="canonical">` and `og:url`, and change `og:image` and `twitter:image` from `/og-image.png` to the full URL, since most link-preview crawlers ignore relative image paths.

## Notes

- `@tiptap/markdown` is an early release; the round-trip for headings, marks, lists, task lists, tables and code blocks is covered by tests in `src/lib/lib.test.ts`.
- Markdown has no underline syntax, so underline is disabled in the editor to keep documents round-trippable.
