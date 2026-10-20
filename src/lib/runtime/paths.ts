const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

export function normalizePath(input: string): string {
  const parts: string[] = [];
  for (const raw of input.replace(/\\/g, "/").split("/")) {
    if (!raw || raw === ".") continue;
    if (raw === "..") {
      parts.pop();
      continue;
    }
    parts.push(raw);
  }
  return parts.join("/");
}

export function dirname(path: string): string {
  const normalized = normalizePath(path);
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}

export function joinPath(base: string, rel: string): string {
  if (!rel) return normalizePath(base);
  if (rel.startsWith("/")) return normalizePath(rel);
  return normalizePath(`${base}/${rel}`);
}

export function resolveSpec(fromFile: string, spec: string): string | null {
  const clean = spec.trim();
  if (!clean || clean.startsWith("#") || clean.startsWith("//")) return null;
  if (
    clean.startsWith("data:") ||
    clean.startsWith("blob:") ||
    clean.startsWith("javascript:") ||
    clean.startsWith("mailto:")
  ) {
    return null;
  }
  if (SCHEME.test(clean)) return null;
  const noHash = clean.split("#")[0] ?? clean;
  const noQuery = noHash.split("?")[0] ?? noHash;
  if (!noQuery) return null;
  if (noQuery.startsWith("/")) return normalizePath(noQuery);
  return joinPath(dirname(fromFile), noQuery);
}

export function isExternalSpec(spec: string): boolean {
  const value = spec.trim();
  return value.startsWith("//") || /^https?:/i.test(value) || /^wss?:/i.test(value);
}

export function normalizeUserPath(input: string): string {
  let path = input.trim();
  if (!path) return "/";
  path = path.replace(/^file:\/\//i, "");
  path = path.replace(/\\/g, "/");
  if (!path.startsWith("/")) path = `/${path}`;
  const normalized = normalizePath(path);
  return normalized ? `/${normalized}` : "/";
}

export function splitRootAndEntry(userPath: string): { rootPath: string; entry: string } {
  const full = normalizeUserPath(userPath);
  const index = full.lastIndexOf("/");
  if (index <= 0) {
    return { rootPath: "/", entry: full.replace(/^\//, "") || "index.html" };
  }
  return { rootPath: full.slice(0, index), entry: full.slice(index + 1) };
}

export function safeName(name: string): string {
  const cleaned = name.replace(/[^\w\s.-]+/g, "").trim().replace(/\s+/g, " ");
  return cleaned.slice(0, 48) || "Project";
}

export function stripCommonRoot<T extends { path: string }>(files: T[]): T[] {
  if (files.length === 0) return files;
  if (!files.every((file) => file.path.includes("/"))) return files;
  const root = files[0]?.path.split("/")[0];
  if (!root || !files.every((file) => file.path.split("/")[0] === root)) return files;
  return files.map((file) => ({ ...file, path: file.path.split("/").slice(1).join("/") }));
}
