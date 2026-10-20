import { useState } from "react";
import { formatBytes, projectDisplayPath, totalBytes, type ExternalLinkMode, type Permissions, type ProjectMeta, type Settings } from "@/lib/runtime/types";
import { Button, fileGlyph, Sheet, SwitchRow, TextField } from "@/components/html-runtime/ui";

const PERMISSIONS: { key: keyof Permissions; label: string; description: string }[] = [
  { key: "network", label: "Network", description: "Allow http(s) requests. Blocked by default." },
  { key: "camera", label: "Camera", description: "Allow camera capture. Blocked by default." },
  { key: "microphone", label: "Microphone", description: "Allow microphone capture. Blocked by default." },
  { key: "location", label: "Location", description: "Allow geolocation. Blocked by default." },
  { key: "notifications", label: "Notifications", description: "Allow in-app notifications. Blocked by default." },
  { key: "clipboard", label: "Clipboard", description: "Allow reading and writing the clipboard." },
];

export function PathSheet({
  open,
  value,
  onOpenChange,
  onChange,
  onOpen,
  onBrowseFile,
  onMountFolder,
}: {
  open: boolean;
  value: string;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  onOpen: () => void;
  onBrowseFile: () => void;
  onMountFolder: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="OPEN HTML">
      <div className="flex flex-col gap-4">
        <TextField
          label="LOCAL PATH"
          mono
          value={value}
          placeholder="/sdcard/MyWebsite/index.html"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onOpen();
          }}
        />
        <p className="text-xs text-muted">
          Mounted projects open immediately. A new path asks for the folder that should appear there. This browser build cannot read arbitrary device paths until you pick them.
        </p>
        <Button variant="primary" onClick={onOpen}>
          Open path
        </Button>
        <Button onClick={onMountFolder}>Mount folder at this path</Button>
        <Button onClick={onBrowseFile}>Choose HTML file</Button>
      </div>
    </Sheet>
  );
}

export function ImportSheet({
  open,
  onOpenChange,
  onFile,
  onFolder,
  onZip,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFile: () => void;
  onFolder: () => void;
  onZip: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="IMPORT PROJECT">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">Directory structure is preserved so relative paths keep working.</p>
        <Button variant="primary" onClick={onFolder}>
          Choose folder
        </Button>
        <Button onClick={onFile}>Choose HTML file</Button>
        <Button onClick={onZip}>Import zip</Button>
      </div>
    </Sheet>
  );
}

export function SettingsSheet({
  open,
  settings,
  onOpenChange,
  onChange,
}: {
  open: boolean;
  settings: Settings;
  onOpenChange: (open: boolean) => void;
  onChange: (settings: Settings) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="SETTINGS">
      <SwitchRow
        label="Developer mode"
        description="Inspector, console, network monitor, storage, source editor, and live reload."
        checked={settings.developerMode}
        onCheckedChange={(developerMode) => onChange({ ...settings, developerMode })}
      />
      <p className="mt-3 font-mono text-xs tracking-widest text-muted">EXTERNAL LINKS</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {(["block", "ask", "allow"] as ExternalLinkMode[]).map((mode) => (
          <Button
            key={mode}
            variant={settings.externalLinks === mode ? "primary" : "surface"}
            onClick={() => onChange({ ...settings, externalLinks: mode })}
          >
            {mode}
          </Button>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        Local documents run in an isolated sandbox. Network, camera, microphone, location, and notifications stay off until enabled per project. A native Android build would use WebView and real filesystem paths.
      </p>
    </Sheet>
  );
}

export function ExternalSheet({
  href,
  onCancel,
  onOpen,
}: {
  href: string | null;
  onCancel: () => void;
  onOpen: () => void;
}) {
  return (
    <Sheet open={href != null} onOpenChange={(open) => { if (!open) onCancel(); }} title="EXTERNAL LINK">
      <p className="text-sm">This page wants to leave the runtime.</p>
      <p className="mt-2 break-all font-mono text-xs text-muted">{href}</p>
      <div className="mt-4 flex gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={onOpen}>
          Open
        </Button>
      </div>
    </Sheet>
  );
}

export function ProjectSheet({
  project,
  onOpenChange,
  onPatch,
  onDelete,
  onDuplicate,
  onExport,
  onInstall,
  onShortcut,
  onOpen,
  onIcon,
}: {
  project: ProjectMeta | null;
  onOpenChange: (open: boolean) => void;
  onPatch: (patch: Partial<ProjectMeta>, reload?: boolean) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onInstall: () => void;
  onShortcut: () => void;
  onOpen: (mode: "run" | "app") => void;
  onIcon: (file: File) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  if (!project) {
    return <Sheet open={false} onOpenChange={onOpenChange} title="PROJECT">{null}</Sheet>;
  }
  const htmlFiles = project.files.filter((file) => /\.html?$/i.test(file.path));
  return (
    <Sheet open={project != null} onOpenChange={onOpenChange} title="PROJECT">
      <div className="flex flex-col gap-4">
        <TextField label="NAME" value={project.name} onChange={(event) => onPatch({ name: event.target.value })} />
        <TextField
          label="VIRTUAL PATH"
          mono
          value={project.rootPath}
          onChange={(event) => onPatch({ rootPath: event.target.value })}
        />
        <label className="block">
          <span className="mb-2 block font-mono text-xs tracking-widest text-muted">ENTRY</span>
          <select
            value={project.entry}
            onChange={(event) => onPatch({ entry: event.target.value }, true)}
            className="h-11 w-full rounded-control border border-line bg-inset px-3 font-mono text-sm text-fg"
          >
            {htmlFiles.map((file) => (
              <option key={file.path} value={file.path}>
                {file.path}
              </option>
            ))}
          </select>
        </label>
        <p className="font-mono text-xs text-muted">
          {projectDisplayPath(project)} · {formatBytes(totalBytes(project))} · {project.files.length} files
        </p>
        <div className="grid grid-cols-2 gap-2 [&>button]:w-full">
          <Button variant="primary" onClick={() => onOpen("run")}>
            Open
          </Button>
          <Button onClick={onInstall}>{project.installed ? "Uninstall app" : "Install as local app"}</Button>
          <Button onClick={onShortcut}>Create shortcut</Button>
          <Button onClick={() => onOpen("app")} disabled={!project.installed}>
            Launch app
          </Button>
          <Button onClick={onExport}>Export</Button>
          <Button onClick={onDuplicate}>Duplicate</Button>
          <Button onClick={() => onPatch({ pinned: !project.pinned })}>{project.pinned ? "Unpin" : "Pin"}</Button>
          {confirming ? (
            <Button variant="danger" onClick={onDelete}>
              Confirm delete
            </Button>
          ) : (
            <Button variant="danger" onClick={() => setConfirming(true)}>
              Delete
            </Button>
          )}
        </div>
        <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-control border border-line bg-raised text-sm">
          Custom icon
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onIcon(file);
              event.target.value = "";
            }}
          />
        </label>
        <div className="divide-y divide-line border-y border-line">
          {PERMISSIONS.map((item) => (
            <SwitchRow
              key={item.key}
              label={item.label}
              description={item.description}
              checked={project.permissions[item.key]}
              onCheckedChange={(checked) =>
                onPatch({ permissions: { ...project.permissions, [item.key]: checked } }, true)
              }
            />
          ))}
        </div>
        <ul className="max-h-40 overflow-y-auto rounded-control border border-line">
          {project.files.map((file) => {
            const Glyph = fileGlyph(file.path);
            return (
              <li key={file.path} className="flex items-center gap-2 border-b border-line px-3 py-2 last:border-b-0">
                <Glyph className="size-4 text-muted" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{file.path}</span>
                <span className="font-mono text-xs text-faint">{formatBytes(file.bytes)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Sheet>
  );
}
