import { guessMime, titleFromHtml, decodeText } from "@/lib/runtime/mime";
import { normalizePath, stripCommonRoot } from "@/lib/runtime/paths";
import type { Orientation, Permissions, StoredFile } from "@/lib/runtime/types";
import { DEFAULT_PERMISSIONS } from "@/lib/runtime/types";
import { unzip } from "@/lib/runtime/zip";

const MAX_FILE = 32 * 1024 * 1024;
const MAX_PROJECT = 80 * 1024 * 1024;

export type ProjectManifest = {
  name?: string;
  entry?: string;
  rootPath?: string;
  permissions?: Partial<Permissions>;
  orientation?: Orientation;
  storage?: Record<string, string>;
  cookies?: string;
  iconDataUrl?: string | null;
};

export type ImportedBundle = {
  files: StoredFile[];
  manifest: ProjectManifest | null;
  suggestedName: string;
};

function assertLimits(files: StoredFile[]): void {
  let total = 0;
  for (const file of files) {
    if (file.data.byteLength > MAX_FILE) {
      throw new Error(`${file.path} is larger than 32 MB`);
    }
    total += file.data.byteLength;
  }
  if (total > MAX_PROJECT) throw new Error("Project is larger than 80 MB");
}

async function toStored(path: string, blob: Blob, typeHint = ""): Promise<StoredFile> {
  const data = new Uint8Array(await blob.arrayBuffer());
  const normalized = normalizePath(path);
  return { path: normalized, mime: guessMime(normalized, typeHint || blob.type), data };
}

export async function filesFromList(list: FileList | File[]): Promise<StoredFile[]> {
  const files = await Promise.all(
    Array.from(list).map(async (file) => toStored(file.webkitRelativePath || file.name, file, file.type)),
  );
  const usable = files.filter((file) => file.path && !file.path.endsWith("/"));
  const stripped = stripCommonRoot(usable);
  assertLimits(stripped);
  return stripped;
}

function fileFromEntry(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file(resolve, () => reject(new Error(`Could not read ${entry.name}`)));
  });
}

function readEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const all: FileSystemEntry[] = [];
    const read = () => {
      reader.readEntries((batch) => {
        if (batch.length === 0) resolve(all);
        else {
          all.push(...batch);
          read();
        }
      }, () => reject(new Error("Could not read a folder")));
    };
    read();
  });
}

async function walk(entry: FileSystemEntry, path: string, out: StoredFile[]): Promise<void> {
  if (entry.isFile) {
    const file = await fileFromEntry(entry as FileSystemFileEntry);
    out.push(await toStored(path, file, file.type));
    return;
  }
  if (!entry.isDirectory) return;
  const reader = (entry as FileSystemDirectoryEntry).createReader();
  const children = await readEntries(reader);
  for (const child of children) {
    await walk(child, `${path}/${child.name}`, out);
  }
}

export async function filesFromDataTransfer(transfer: DataTransfer): Promise<StoredFile[]> {
  const entries: FileSystemEntry[] = [];
  for (const item of Array.from(transfer.items)) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) entries.push(entry);
  }
  if (entries.length === 0) return filesFromList(transfer.files);
  const collected: StoredFile[] = [];
  for (const entry of entries) await walk(entry, entry.name, collected);
  const stripped = stripCommonRoot(collected.filter((file) => file.path));
  assertLimits(stripped);
  return stripped;
}

function parseManifest(text: string): ProjectManifest | null {
  try {
    const value = JSON.parse(text) as ProjectManifest;
    if (!value || typeof value !== "object") return null;
    return value;
  } catch {
    return null;
  }
}

export async function bundleFromFiles(files: StoredFile[]): Promise<ImportedBundle> {
  const manifestFile = files.find((file) => file.path === "html-runtime.json");
  const manifest = manifestFile ? parseManifest(decodeText(manifestFile.data)) : null;
  const projectFiles = files.filter((file) => file.path !== "html-runtime.json");
  if (projectFiles.length === 0) throw new Error("No HTML files found");
  const html = projectFiles.find((file) => /\.html?$/i.test(file.path) && file.path === (manifest?.entry ?? file.path));
  const firstHtml = projectFiles.find((file) => /\.html?$/i.test(file.path));
  let suggested = manifest?.name?.trim() || "";
  if (!suggested && firstHtml) {
    suggested = titleFromHtml(decodeText(firstHtml.data)) ?? "";
  }
  if (!suggested) {
    const stem = (html ?? firstHtml)?.path.split("/").pop()?.replace(/\.html?$/i, "") ?? "Project";
    suggested = stem === "index" ? "Untitled" : stem;
  }
  if (!projectFiles.some((file) => /\.html?$/i.test(file.path)) && !manifest) {
    throw new Error("Choose an HTML file or a folder that contains one");
  }
  return { files: projectFiles, manifest, suggestedName: suggested };
}

export async function bundleFromZip(buffer: ArrayBuffer): Promise<ImportedBundle> {
  const unzipped = await unzip(buffer);
  const files: StoredFile[] = stripCommonRoot(
    unzipped.map((file) => ({
      path: file.path,
      mime: guessMime(file.path),
      data: file.data,
    })),
  );
  assertLimits(files);
  return bundleFromFiles(files);
}

export function manifestPermissions(manifest: ProjectManifest | null): Permissions {
  return { ...DEFAULT_PERMISSIONS, ...manifest?.permissions };
}
