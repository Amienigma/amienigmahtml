export type DiagLevel = "info" | "warn" | "error" | "debug";

export type Permissions = {
  network: boolean;
  camera: boolean;
  microphone: boolean;
  location: boolean;
  notifications: boolean;
  clipboard: boolean;
};

export const DEFAULT_PERMISSIONS: Permissions = {
  network: false,
  camera: false,
  microphone: false,
  location: false,
  notifications: false,
  clipboard: false,
};

export type Orientation = "auto" | "portrait" | "landscape";

export type ExternalLinkMode = "ask" | "block" | "allow";

export type FileIndexEntry = {
  path: string;
  mime: string;
  bytes: number;
};

export type ProjectMeta = {
  id: string;
  name: string;
  iconDataUrl: string | null;
  entry: string;
  rootPath: string;
  files: FileIndexEntry[];
  pinned: boolean;
  installed: boolean;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number | null;
  permissions: Permissions;
  orientation: Orientation;
  storage: Record<string, string>;
  cookies: string;
};

export type StoredFile = {
  path: string;
  mime: string;
  data: Uint8Array;
};

export type Settings = {
  developerMode: boolean;
  externalLinks: ExternalLinkMode;
};

export const DEFAULT_SETTINGS: Settings = {
  developerMode: false,
  externalLinks: "ask",
};

export type Diag = {
  id: string;
  t: number;
  level: DiagLevel;
  message: string;
};

export type NetEvent = {
  id: string;
  t: number;
  method: string;
  url: string;
  status: "blocked" | "local" | "ok" | "error";
  detail: string;
};

export function newId(): string {
  return crypto.randomUUID();
}

let seq = 0;
export function nid(): string {
  seq += 1;
  return `${Date.now().toString(36)}-${seq}`;
}

export function projectDisplayPath(project: Pick<ProjectMeta, "rootPath" | "entry">): string {
  const root = project.rootPath.replace(/\/+$/, "") || "/";
  return `${root}/${project.entry}`.replace(/\/{2,}/g, "/");
}

export function totalBytes(project: Pick<ProjectMeta, "files">): number {
  return project.files.reduce((sum, file) => sum + file.bytes, 0);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
