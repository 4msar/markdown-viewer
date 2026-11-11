const ALLOWED_EXTENSION = /\.(md|markdown|mdown|txt)$/i;

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const FILE_ACCEPT = ".md,.markdown,.mdown,.txt,text/markdown,text/plain";

export type ImportResult = { ok: true; name: string; text: string } | { ok: false; error: string };

export function stripExtension(fileName: string): string {
  const base = fileName.replace(/\.[^./\\]+$/, "");
  return base || fileName;
}

/** Returns an error message, or null when the file can be imported. */
export function validateFile(file: { name: string; size: number }): string | null {
  if (!ALLOWED_EXTENSION.test(file.name)) {
    return `"${file.name}" is not a .md or .txt file`;
  }
  if (file.size > MAX_FILE_BYTES) {
    return `"${file.name}" is larger than 5 MB`;
  }
  return null;
}

export async function importFile(file: File): Promise<ImportResult> {
  const error = validateFile(file);
  if (error) return { ok: false, error };
  try {
    const text = await file.text();
    return { ok: true, name: stripExtension(file.name), text: text.replace(/\r\n?/g, "\n") };
  } catch {
    return { ok: false, error: `Could not read "${file.name}"` };
  }
}
