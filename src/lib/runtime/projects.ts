import { normalizePath, normalizeUserPath, safeName } from "@/lib/runtime/paths";
import {
  DEFAULT_PERMISSIONS,
  newId,
  projectDisplayPath,
  type FileIndexEntry,
  type Permissions,
  type ProjectMeta,
  type StoredFile,
} from "@/lib/runtime/types";

export function indexFiles(files: StoredFile[]): FileIndexEntry[] {
  return files
    .map((file) => ({ path: file.path, mime: file.mime, bytes: file.data.byteLength }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function detectEntry(files: StoredFile[], preferred?: string): string {
  if (preferred && files.some((file) => file.path === preferred)) return preferred;
  const html = files.filter((file) => /\.html?$/i.test(file.path));
  const rootIndex = html.find((file) => /^index\.html?$/i.test(file.path));
  if (rootIndex) return rootIndex.path;
  const nestedIndex = html.find((file) => /(^|\/)index\.html?$/i.test(file.path));
  if (nestedIndex) return nestedIndex.path;
  return html[0]?.path ?? files[0]?.path ?? "index.html";
}

export function uniqueRoot(projects: ProjectMeta[], name: string): string {
  const base = `/sdcard/HTMLRuntime/${safeName(name)}`;
  if (!projects.some((project) => project.rootPath === base)) return base;
  let suffix = 2;
  while (projects.some((project) => project.rootPath === `${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function makeProject(options: {
  name: string;
  files: StoredFile[];
  entry?: string;
  rootPath?: string;
  permissions?: Permissions;
  projects?: ProjectMeta[];
}): ProjectMeta {
  const now = Date.now();
  const name = options.name.trim() || "Untitled";
  return {
    id: newId(),
    name,
    iconDataUrl: null,
    entry: detectEntry(options.files, options.entry),
    rootPath: options.rootPath ?? uniqueRoot(options.projects ?? [], name),
    files: indexFiles(options.files),
    pinned: false,
    installed: false,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: null,
    permissions: { ...DEFAULT_PERMISSIONS, ...options.permissions },
    orientation: "auto",
    storage: {},
    cookies: "",
  };
}

export function findByPath(
  projects: ProjectMeta[],
  raw: string,
): { project: ProjectMeta; entry: string } | null {
  const full = normalizeUserPath(raw);
  for (const project of projects) {
    if (normalizeUserPath(projectDisplayPath(project)) === full) {
      return { project, entry: project.entry };
    }
    const root = project.rootPath.replace(/\/+$/, "") || "/";
    if (full === root) return { project, entry: project.entry };
    if (full.startsWith(`${root}/`)) {
      const relative = normalizePath(full.slice(root.length + 1));
      if (project.files.some((file) => file.path === relative)) {
        return { project, entry: /\.html?$/i.test(relative) ? relative : project.entry };
      }
    }
  }
  return null;
}

export function sortProjects(projects: ProjectMeta[]): ProjectMeta[] {
  return [...projects].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const at = a.lastOpenedAt ?? a.updatedAt;
    const bt = b.lastOpenedAt ?? b.updatedAt;
    return bt - at;
  });
}
