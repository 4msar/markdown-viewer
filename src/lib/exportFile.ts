const EXPORT_CSS = `
:root{color-scheme:light dark}
body{max-width:46rem;margin:0 auto;padding:2.5rem 1.25rem;font:16px/1.7 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2328;background:#fff}
h1,h2,h3,h4,h5,h6{line-height:1.25;margin:1.6em 0 .6em}
h1{font-size:2em}h2{font-size:1.5em}h3{font-size:1.25em}
a{color:#0969da}
img{max-width:100%}
hr{border:0;border-top:1px solid #d0d7de;margin:2em 0}
blockquote{margin:1em 0;padding:0 1em;border-left:4px solid #d0d7de;color:#59636e}
code{font:.875em ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:#eff1f3;padding:.15em .35em;border-radius:4px}
pre{background:#161b22;color:#e6edf3;padding:1em;border-radius:8px;overflow-x:auto}
pre code{background:none;padding:0;color:inherit}
table{border-collapse:collapse;display:block;overflow-x:auto}
th,td{border:1px solid #d0d7de;padding:.4em .75em}
th{background:#f6f8fa}
li:has(>input[type=checkbox]){list-style:none;margin-left:-1.25em}
li>input[type=checkbox]{margin-right:.5em}
.hljs-comment,.hljs-quote{color:#8b949e;font-style:italic}
.hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-doctag{color:#ff7b72}
.hljs-string,.hljs-regexp,.hljs-addition{color:#a5d6ff}
.hljs-number,.hljs-attr,.hljs-attribute,.hljs-variable,.hljs-template-variable,.hljs-meta{color:#79c0ff}
.hljs-title,.hljs-section,.hljs-selector-id,.hljs-selector-class{color:#d2a8ff}
.hljs-built_in,.hljs-type,.hljs-symbol,.hljs-bullet{color:#ffa657}
.hljs-name,.hljs-tag{color:#7ee787}
@media (prefers-color-scheme:dark){
body{color:#e6edf3;background:#0d1117}
a{color:#4493f8}
hr,blockquote,th,td{border-color:#3d444d}
blockquote{color:#9198a1}
code{background:#262c36}
th{background:#151b23}
}
@media print{body{color:#1f2328;background:#fff;padding:0}}
`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wraps already-sanitized body HTML in a standalone styled document. */
export function buildHtmlDocument(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${EXPORT_CSS}</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`;
}

/** Keeps a user-supplied name usable as a download filename. */
export function safeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, "-").trim();
  return cleaned || "document";
}

export function downloadFile(fileName: string, content: string, mimeType: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
