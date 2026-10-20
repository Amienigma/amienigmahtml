import { guessMime } from "@/lib/runtime/mime";
import type { ProjectMeta, Settings, StoredFile } from "@/lib/runtime/types";
import { DEFAULT_SETTINGS } from "@/lib/runtime/types";

const DB_NAME = "html-runtime-vault";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("projects")) db.createObjectStore("projects", { keyPath: "id" });
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files");
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open the project vault"));
  });
}

function asBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return new Uint8Array();
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("projects", "readonly");
    const request = tx.objectStore("projects").getAll();
    request.onsuccess = () => resolve((request.result as ProjectMeta[]) ?? []);
    request.onerror = () => reject(request.error);
  });
}

export async function getProject(id: string): Promise<ProjectMeta | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction("projects", "readonly").objectStore("projects").get(id);
    request.onsuccess = () => resolve((request.result as ProjectMeta | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: ProjectMeta): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("projects", "readwrite");
    tx.objectStore("projects").put(project);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteProjectRecord(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["projects", "files"], "readwrite");
    tx.objectStore("projects").delete(id);
    const files = tx.objectStore("files");
    const range = IDBKeyRange.bound(`${id}:`, `${id}:\uffff`);
    const cursor = files.openCursor(range);
    cursor.onsuccess = () => {
      const current = cursor.result;
      if (!current) return;
      current.delete();
      current.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function writeFiles(projectId: string, files: StoredFile[]): Promise<void> {
  if (files.length === 0) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    const store = tx.objectStore("files");
    for (const file of files) {
      const bytes =
        file.data.byteOffset === 0 && file.data.byteLength === file.data.buffer.byteLength
          ? file.data
          : file.data.slice();
      store.put(bytes, `${projectId}:${file.path}`);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function replaceFiles(projectId: string, files: StoredFile[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    const store = tx.objectStore("files");
    const range = IDBKeyRange.bound(`${projectId}:`, `${projectId}:\uffff`);
    const cursor = store.openCursor(range);
    cursor.onsuccess = () => {
      const current = cursor.result;
      if (!current) return;
      current.delete();
      current.continue();
    };
    tx.oncomplete = () => {
      void writeFiles(projectId, files).then(resolve, reject);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function readAllFiles(projectId: string, index: ProjectMeta["files"]): Promise<StoredFile[]> {
  const db = await openDb();
  const mimeByPath = new Map(index.map((file) => [file.path, file.mime]));
  const files: StoredFile[] = [];
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("files", "readonly");
    const range = IDBKeyRange.bound(`${projectId}:`, `${projectId}:\uffff`);
    const cursor = tx.objectStore("files").openCursor(range);
    cursor.onsuccess = () => {
      const current = cursor.result;
      if (!current) return;
      const key = String(current.key);
      const path = key.slice(projectId.length + 1);
      files.push({
        path,
        mime: mimeByPath.get(path) ?? guessMime(path),
        data: asBytes(current.value),
      });
      current.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

export async function getSettings(): Promise<Settings> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction("kv", "readonly").objectStore("kv").get("settings");
    request.onsuccess = () => {
      const value = request.result as Settings | undefined;
      resolve(value ? { ...DEFAULT_SETTINGS, ...value } : { ...DEFAULT_SETTINGS });
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(settings, "settings");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
