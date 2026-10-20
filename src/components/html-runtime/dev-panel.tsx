import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { decodeText, isTextualMime } from "@/lib/runtime/mime";
import { formatBytes, type Diag, type NetEvent, type ProjectMeta, type StoredFile } from "@/lib/runtime/types";
import { Button, fileGlyph, IconButton } from "@/components/html-runtime/ui";
import { cn } from "@/lib/cn";

const TABS = ["Console", "Network", "Storage", "Files", "Source", "Info"] as const;
type Tab = (typeof TABS)[number];

export function DevPanel({
  project,
  files,
  entry,
  logs,
  net,
  zoom,
  developer,
  onClose,
  onEnableDeveloper,
  onReload,
  onClearCache,
  onClearStorage,
  onClearLogs,
  onSaveFile,
}: {
  project: ProjectMeta;
  files: StoredFile[];
  entry: string;
  logs: Diag[];
  net: NetEvent[];
  zoom: number;
  developer: boolean;
  onClose: () => void;
  onEnableDeveloper: () => void;
  onReload: () => void;
  onClearCache: () => void;
  onClearStorage: () => void;
  onClearLogs: () => void;
  onSaveFile: (path: string, text: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("Console");
  const [selected, setSelected] = useState(entry);
  const file = files.find((item) => item.path === selected) ?? files.find((item) => item.path === entry);
  const text = file && isTextualMime(file.mime) ? decodeText(file.data) : "";
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? text;
  const binary = file ? !isTextualMime(file.mime) : false;
  const sortedFiles = useMemo(() => [...files].sort((a, b) => a.path.localeCompare(b.path)), [files]);

  return (
    <section className="absolute inset-x-0 bottom-0 z-30 flex h-[58%] w-full flex-col border-t border-line bg-surface md:inset-y-0 md:left-auto md:h-auto md:max-w-md md:border-t-0 md:border-l">
      <header className="flex items-center justify-between border-b border-line px-3 py-1">
        <h2 className="font-mono text-xs tracking-widest text-muted">RUNTIME CONSOLE</h2>
        <IconButton label="Close inspector" onClick={onClose}>
          <X className="size-5" />
        </IconButton>
      </header>
      <div className="flex border-b border-line px-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "min-w-0 flex-1 px-1 py-2 text-center font-mono text-[11px] tracking-wide",
              tab === item ? "border-b-2 border-accent text-accent" : "text-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      {tab !== "Console" && !developer ? (
        <div className="flex flex-1 flex-col items-start gap-3 p-4">
          <p className="text-sm">Developer mode is off.</p>
          <p className="text-xs text-muted">Turn it on to inspect network, storage, files, and source.</p>
          <Button variant="primary" onClick={onEnableDeveloper}>
            Enable developer mode
          </Button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === "Console" ? (
            <LogList logs={logs} empty="No console output yet." />
          ) : null}
          {tab === "Network" ? (
            <ul className="divide-y divide-line font-mono text-xs">
              {net.length === 0 ? <li className="p-4 text-muted">No requests yet.</li> : null}
              {net.map((event) => (
                <li key={event.id} className="px-3 py-2">
                  <p className={event.status === "blocked" ? "text-warn" : event.status === "error" ? "text-danger" : "text-muted"}>
                    {event.method} · {event.status}
                  </p>
                  <p className="break-all text-fg">{event.url}</p>
                  <p className="text-faint">{event.detail}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {tab === "Storage" ? (
            <ul className="divide-y divide-line font-mono text-xs">
              {Object.keys(project.storage).length === 0 ? <li className="p-4 text-muted">localStorage is empty.</li> : null}
              {Object.entries(project.storage).map(([key, value]) => (
                <li key={key} className="px-3 py-2">
                  <p className="text-accent">{key}</p>
                  <p className="break-all text-fg">{value}</p>
                </li>
              ))}
              {project.cookies ? (
                <li className="px-3 py-2">
                  <p className="text-accent">cookie</p>
                  <p className="break-all text-fg">{project.cookies}</p>
                </li>
              ) : null}
            </ul>
          ) : null}
          {tab === "Files" ? (
            <ul className="divide-y divide-line">
              {sortedFiles.map((item) => {
                const Glyph = fileGlyph(item.path);
                return (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(item.path);
                        setDraft(null);
                        setTab("Source");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left"
                    >
                      <Glyph className="size-4 shrink-0 text-muted" />
                      <span className="min-w-0 flex-1 truncate font-mono text-xs" title={item.path}>{item.path}</span>
                      <span className="shrink-0 font-mono text-xs text-faint">{formatBytes(item.data.byteLength)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {tab === "Source" ? (
            <div className="flex h-full min-h-64 flex-col">
              <label className="border-b border-line px-3 py-2 font-mono text-xs text-muted">
                {file?.path ?? "No file"}
                <select
                  value={file?.path ?? ""}
                  onChange={(event) => {
                    setSelected(event.target.value);
                    setDraft(null);
                  }}
                  className="mt-2 h-11 w-full rounded-control border border-line bg-inset px-2 text-sm text-fg"
                >
                  {sortedFiles.map((item) => (
                    <option key={item.path} value={item.path}>
                      {item.path}
                    </option>
                  ))}
                </select>
              </label>
              {binary ? (
                <p className="p-4 font-mono text-xs text-muted">Binary file. Open it from the page instead of the editor.</p>
              ) : (
                <textarea
                  value={shown}
                  onChange={(event) => setDraft(event.target.value)}
                  spellCheck={false}
                  className="min-h-64 w-full flex-1 resize-none bg-inset p-3 font-mono text-xs text-fg outline-none"
                />
              )}
            </div>
          ) : null}
          {tab === "Info" ? (
            <dl className="space-y-3 p-4 font-mono text-xs">
              <Info label="Engine" value="Isolated iframe · WebView prototype" />
              <Info label="Entry" value={entry} />
              <Info label="Root" value={project.rootPath} />
              <Info label="Origin" value="Opaque sandbox. No parent DOM access." />
              <Info label="Zoom" value={`${Math.round(zoom * 100)}%`} />
              <Info label="Orientation" value={project.orientation} />
              <Info label="Network" value={project.permissions.network ? "ALLOWED" : "BLOCKED"} />
              <Info label="Files" value={String(files.length)} />
              <Info
                label="IndexedDB"
                value="Session-scoped in this browser build. localStorage, sessionStorage, and cookies are saved with the project."
              />
            </dl>
          ) : null}
        </div>
      )}
      <footer className="flex flex-wrap gap-2 border-t border-line p-3">
        <Button onClick={onReload}>Reload</Button>
        <Button onClick={onClearLogs}>Clear log</Button>
        <Button disabled={!developer} onClick={onClearCache}>
          Clear cache
        </Button>
        <Button variant="danger" disabled={!developer} onClick={onClearStorage}>
          Clear storage
        </Button>
        {tab === "Source" && developer && !binary ? (
          <Button
            variant="primary"
            onClick={() => {
              if (file) onSaveFile(file.path, shown);
              setDraft(null);
            }}
          >
            Save & reload
          </Button>
        ) : null}
      </footer>
    </section>
  );
}

function LogList({ logs, empty }: { logs: Diag[]; empty: string }) {
  if (logs.length === 0) return <p className="p-4 font-mono text-xs text-muted">{empty}</p>;
  return (
    <ol className="space-y-1 p-3 font-mono text-xs">
      {logs.map((entry) => (
        <li
          key={entry.id}
          className={cn(
            "break-words whitespace-pre-wrap",
            entry.level === "error" && "text-danger",
            entry.level === "warn" && "text-warn",
            entry.level === "info" && "text-fg",
            entry.level === "debug" && "text-faint",
          )}
        >
          [{entry.level.toUpperCase()}] {entry.message}
        </li>
      ))}
    </ol>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 break-all text-fg">{value}</dd>
    </div>
  );
}
