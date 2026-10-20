import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Maximize2, MoreVertical, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { allowAttribute, compileDocument } from "@/lib/runtime/compile";
import { nid, type Diag, type DiagLevel, type NetEvent, type Orientation, type ProjectMeta, type StoredFile } from "@/lib/runtime/types";
import { DevPanel } from "@/components/html-runtime/dev-panel";
import { Button, IconButton, Sheet } from "@/components/html-runtime/ui";
import { cn } from "@/lib/cn";

export type RunState = {
  mode: "run" | "app";
  files: StoredFile[];
  stack: string[];
  index: number;
  tick: number;
  zoom: number;
  storage: Record<string, string>;
  sessionStorage: Record<string, string>;
  cookies: string;
};

export function RuntimeView({
  project,
  run,
  logs,
  net,
  developer,
  devOpen,
  onToggleDev,
  onEnableDeveloper,
  onBack,
  onReload,
  onZoom,
  onNavigate,
  onStorage,
  onSession,
  onCookies,
  onDiag,
  onNet,
  onExternal,
  onNotify,
  onClearCache,
  onClearStorage,
  onClearLogs,
  onSaveFile,
  onOrientation,
  onManage,
  onExit,
}: {
  project: ProjectMeta;
  run: RunState;
  logs: Diag[];
  net: NetEvent[];
  developer: boolean;
  devOpen: boolean;
  onToggleDev: () => void;
  onEnableDeveloper: () => void;
  onBack: () => void;
  onReload: () => void;
  onZoom: (zoom: number) => void;
  onNavigate: (path: string, storage: Record<string, string>, session: Record<string, string>, cookies: string) => void;
  onStorage: (storage: Record<string, string>) => void;
  onSession: (session: Record<string, string>) => void;
  onCookies: (cookies: string) => void;
  onDiag: (level: DiagLevel, message: string) => void;
  onNet: (event: Omit<NetEvent, "id" | "t">) => void;
  onExternal: (href: string) => void;
  onNotify: (title: string, body: string) => void;
  onClearCache: () => void;
  onClearStorage: () => void;
  onClearLogs: () => void;
  onSaveFile: (path: string, text: string) => void;
  onOrientation: (orientation: Orientation) => void;
  onManage: () => void;
  onExit: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [logsHidden, setLogsHidden] = useState(false);
  const handlers = useRef({
    onNavigate,
    onStorage,
    onSession,
    onCookies,
    onDiag,
    onNet,
    onExternal,
    onNotify,
    project,
  });
  handlers.current = {
    onNavigate,
    onStorage,
    onSession,
    onCookies,
    onDiag,
    onNet,
    onExternal,
    onNotify,
    project,
  };

  const entry = run.stack[run.index] ?? project.entry;
  const permKey = JSON.stringify(project.permissions);
  // Storage, cookies, and session are read when the document is rebuilt.
  // They are not dependencies: a live write must not reload the iframe.
  const compiled = useMemo(
    () =>
      compileDocument({
        files: run.files,
        entry,
        rootPath: project.rootPath,
        permissions: project.permissions,
        storage: project.storage,
        session: run.sessionStorage,
        cookies: project.cookies,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run.files, run.tick, entry, project.rootPath, permKey],
  );

  const [seeded, setSeeded] = useState(compiled.logs);
  useEffect(() => {
    setSeeded(compiled.logs);
    setLogsHidden(false);
  }, [compiled]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as Record<string, unknown> | null;
      if (!data || data.source !== "htmlrt") return;
      const current = handlers.current;
      if (data.type === "ready") {
        current.onDiag("info", "JavaScript initialized");
        return;
      }
      if (data.type === "console" || data.type === "error") {
        const level = (data.level as DiagLevel) || "info";
        const message = String(data.message ?? "").replace(new RegExp(`^\\[${level.toUpperCase()}\\]\\s*`), "");
        current.onDiag(level, message);
        return;
      }
      if (data.type === "net") {
        const status = data.status;
        if (status === "blocked" || status === "local" || status === "ok" || status === "error") {
          current.onNet({
            method: String(data.method ?? "GET"),
            url: String(data.url ?? ""),
            status,
            detail: String(data.detail ?? ""),
          });
          if (status === "blocked") current.onDiag("warn", "External request blocked");
        }
        return;
      }
      if (data.type === "navigate") {
        current.onNavigate(
          String(data.path ?? ""),
          (data.storage as Record<string, string>) ?? {},
          (data.session as Record<string, string>) ?? {},
          String(data.cookies ?? ""),
        );
        return;
      }
      if (data.type === "storage") {
        current.onStorage((data.storage as Record<string, string>) ?? {});
        return;
      }
      if (data.type === "session") {
        current.onSession((data.session as Record<string, string>) ?? {});
        return;
      }
      if (data.type === "cookie") {
        current.onCookies(String(data.cookies ?? ""));
        return;
      }
      if (data.type === "external") {
        current.onExternal(String(data.href ?? ""));
        return;
      }
      if (data.type === "notify") {
        current.onNotify(String(data.title ?? "Notification"), String(data.body ?? ""));
        return;
      }
      const frame = iframeRef.current?.contentWindow;
      if (!frame) return;
      if (data.type === "clipboard-write") {
        if (!current.project.permissions.clipboard) {
          frame.postMessage({ source: "htmlrt-host", type: "clipboard-result", req: data.req, error: "Clipboard blocked" }, "*");
          return;
        }
        navigator.clipboard
          .writeText(String(data.text ?? ""))
          .then(() => {
            frame.postMessage({ source: "htmlrt-host", type: "clipboard-result", req: data.req, text: String(data.text ?? "") }, "*");
          })
          .catch(() => {
            frame.postMessage({ source: "htmlrt-host", type: "clipboard-result", req: data.req, error: "Clipboard unavailable" }, "*");
          });
      }
      if (data.type === "clipboard-read") {
        if (!current.project.permissions.clipboard) {
          frame.postMessage({ source: "htmlrt-host", type: "clipboard-result", req: data.req, error: "Clipboard blocked" }, "*");
          return;
        }
        navigator.clipboard
          .readText()
          .then((text) => {
            frame.postMessage({ source: "htmlrt-host", type: "clipboard-result", req: data.req, text }, "*");
          })
          .catch(() => {
            frame.postMessage({ source: "htmlrt-host", type: "clipboard-result", req: data.req, error: "Clipboard unavailable" }, "*");
          });
      }
      if (data.type === "geo-get") {
        if (!current.project.permissions.location || !navigator.geolocation) {
          frame.postMessage({ source: "htmlrt-host", type: "geo-result", req: data.req, error: "Location blocked" }, "*");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            frame.postMessage(
              {
                source: "htmlrt-host",
                type: "geo-result",
                req: data.req,
                coords: { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy },
              },
              "*",
            );
          },
          (error) => {
            frame.postMessage({ source: "htmlrt-host", type: "geo-result", req: data.req, error: error.message }, "*");
          },
        );
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const focus = () => frame.focus();
    frame.addEventListener("load", focus);
    return () => frame.removeEventListener("load", focus);
  }, [run.tick, entry]);

  useEffect(() => {
    const preference = project.orientation;
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (type: string) => Promise<void>;
    };
    if (preference === "auto" || !orientation?.lock) return;
    void orientation.lock(preference).catch(() => undefined);
    return () => {
      screen.orientation.unlock?.();
    };
  }, [project.orientation]);

  const mergedLogs = logsHidden ? logs : [...seeded, ...logs];
  const lastError = [...mergedLogs].reverse().find((entryLog) => entryLog.level === "error");
  const zoom = run.zoom;

  return (
    <div ref={shellRef} className="relative flex min-h-0 flex-1 flex-col bg-bg">
      <header className="flex items-center gap-1 border-b border-line pr-1">
        <IconButton label={run.mode === "app" && run.index === 0 ? "Exit app" : "Back"} onClick={onBack}>
          <ChevronLeft className="size-5" />
        </IconButton>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{project.name}</p>
          <p className={cn("truncate font-mono text-xs", project.permissions.network ? "text-warn" : "text-accent")}>
            {project.permissions.network ? "NETWORK" : "OFFLINE"}
          </p>
        </div>
        <IconButton label="Zoom out" onClick={() => onZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))}>
          <ZoomOut className="size-4" />
        </IconButton>
        <button type="button" className="w-12 font-mono text-xs tabular-nums" onClick={() => onZoom(1)} aria-label="Reset zoom">
          {Math.round(zoom * 100)}%
        </button>
        <IconButton label="Zoom in" onClick={() => onZoom(Math.min(2, Math.round((zoom + 0.1) * 10) / 10))}>
          <ZoomIn className="size-4" />
        </IconButton>
        <IconButton label="Reload" onClick={onReload}>
          <RefreshCw className="size-4" />
        </IconButton>
        <IconButton label="Runtime menu" onClick={() => setMenu(true)}>
          <MoreVertical className="size-5" />
        </IconButton>
      </header>
      {lastError && !devOpen ? (
        <button type="button" onClick={onToggleDev} className="truncate bg-danger-dim px-4 py-2 text-left font-mono text-xs text-danger">
          [ERROR] {lastError.message}
        </button>
      ) : null}
      <div className="relative min-h-0 flex-1 overflow-auto bg-inset">
        <div
          className="absolute top-0 left-0"
          style={{
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            key={`${project.id}:${run.tick}:${entry}`}
            ref={iframeRef}
            title={project.name}
            className="h-full w-full border-0 bg-inset"
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads allow-pointer-lock"
            referrerPolicy="no-referrer"
            srcDoc={compiled.html}
            allow={allowAttribute(project.permissions)}
          />
        </div>
      </div>
      {devOpen ? (
        <DevPanel
          project={{ ...project, storage: project.storage }}
          files={run.files}
          entry={entry}
          logs={mergedLogs}
          net={net}
          zoom={zoom}
          developer={developer}
          onClose={onToggleDev}
          onEnableDeveloper={onEnableDeveloper}
          onReload={onReload}
          onClearCache={onClearCache}
          onClearStorage={onClearStorage}
          onClearLogs={() => {
            setLogsHidden(true);
            onClearLogs();
          }}
          onSaveFile={onSaveFile}
        />
      ) : null}
      <Sheet open={menu} onOpenChange={setMenu} title="RUNTIME">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {(["auto", "portrait", "landscape"] as const).map((item) => (
              <Button
                key={item}
                variant={project.orientation === item ? "primary" : "surface"}
                onClick={() => onOrientation(item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => {
              const node = shellRef.current;
              if (!node) return;
              if (document.fullscreenElement) void document.exitFullscreen();
              else void node.requestFullscreen();
            }}
          >
            <Maximize2 className="size-4" />
            Full screen
          </Button>
          <Button onClick={() => { setMenu(false); onToggleDev(); }}>Console</Button>
          <Button onClick={() => { setMenu(false); onManage(); }}>Project</Button>
          <Button variant="danger" onClick={() => { setMenu(false); onExit(); }}>
            {run.mode === "app" ? "Exit app" : "Close project"}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

export function diag(level: DiagLevel, message: string): Diag {
  return { id: nid(), t: Date.now(), level, message };
}
