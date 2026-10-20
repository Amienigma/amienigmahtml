import { useEffect, useRef, useState } from "react";
import { deleteProjectRecord, getSettings, listProjects, readAllFiles, replaceFiles, saveProject, saveSettings, writeFiles } from "@/lib/runtime/db";
import { bundleFromFiles, bundleFromZip, filesFromDataTransfer, filesFromList, manifestPermissions, type ImportedBundle } from "@/lib/runtime/import-files";
import { titleFromHtml } from "@/lib/runtime/mime";
import { findByPath, indexFiles, makeProject, sortProjects, uniqueRoot } from "@/lib/runtime/projects";
import { safeName, splitRootAndEntry } from "@/lib/runtime/paths";
import { selfTestFiles } from "@/lib/runtime/selftest";
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_SETTINGS,
  formatBytes,
  nid,
  type Diag,
  type DiagLevel,
  type NetEvent,
  type Orientation,
  type ProjectMeta,
  type Settings,
  type StoredFile,
} from "@/lib/runtime/types";
import { zipStore } from "@/lib/runtime/zip";
import { HomeScreen } from "@/components/html-runtime/home";
import { PasteView } from "@/components/html-runtime/paste-view";
import { diag, RuntimeView, type RunState } from "@/components/html-runtime/runtime-view";
import { ExternalSheet, ImportSheet, PathSheet, ProjectSheet, SettingsSheet } from "@/components/html-runtime/sheets";

type Route = { screen: "home" } | { screen: "paste" } | { screen: "run"; id: string; mode: "run" | "app" };

const BOILERPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Untitled</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #101416; color: #e7eeea; font-family: system-ui, sans-serif; }
    button { min-height: 44px; padding: 0 16px; border-radius: 10px; border: 0; background: #3ddc84; color: #05210f; font: inherit; }
  </style>
</head>
<body>
  <button id="go" type="button">Hello</button>
  <script>
    var n = 0;
    document.getElementById("go").onclick = function () {
      n += 1;
      this.textContent = "Clicked " + n;
    };
  </script>
</body>
</html>`;

function parseHash(hash: string): Route {
  const value = hash.replace(/^#\/?/, "");
  if (value === "paste") return { screen: "paste" };
  if (value.startsWith("app/")) return { screen: "run", id: decodeURIComponent(value.slice(4)), mode: "app" };
  if (value.startsWith("run/")) return { screen: "run", id: decodeURIComponent(value.slice(4)), mode: "run" };
  return { screen: "home" };
}

export function HtmlRuntimeApp() {
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<Route>({ screen: "home" });
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [run, setRun] = useState<RunState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [logs, setLogs] = useState<Diag[]>([]);
  const [net, setNet] = useState<NetEvent[]>([]);
  const [devOpen, setDevOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pathOpen, setPathOpen] = useState(false);
  const [pathValue, setPathValue] = useState("/sdcard/");
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manageId, setManageId] = useState<string | null>(null);
  const [externalHref, setExternalHref] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [launch, setLaunch] = useState(0);
  const projectsRef = useRef(projects);
  projectsRef.current = projects;
  const runRef = useRef(run);
  runRef.current = run;
  const pendingEntry = useRef<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const mountRoot = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dirRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apply = () => setRoute(parseHash(window.location.hash));
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => {
    dirRef.current?.setAttribute("webkitdirectory", "");
    dirRef.current?.setAttribute("directory", "");
  }, []);

  useEffect(() => {
    void Promise.all([listProjects(), getSettings()])
      .then(([list, stored]) => {
        setProjects(list);
        setSettings(stored);
        setReady(true);
      })
      .catch((error: unknown) => {
        setReady(true);
        setToast(error instanceof Error ? error.message : "Could not read projects");
      });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function go(next: string) {
    const current = window.location.hash.replace(/^#/, "");
    if (current === next) {
      setLaunch((value) => value + 1);
      setRoute(parseHash(next ? `#${next}` : ""));
      return;
    }
    window.location.hash = next;
  }

  function notify(message: string) {
    setToast(message);
  }

  function remember(projectId: string, patch: Partial<ProjectMeta>) {
    const current = projectsRef.current.find((item) => item.id === projectId);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: Date.now() };
    const list = projectsRef.current.map((item) => (item.id === projectId ? next : item));
    projectsRef.current = list;
    setProjects(list);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void saveProject(next), 200);
    return next;
  }

  async function adopt(bundle: ImportedBundle, rootPath?: string, entry?: string) {
    if (!bundle.files.some((file) => /\.html?$/i.test(file.path))) {
      throw new Error("Choose an HTML file or a folder that contains one");
    }
    const explicitRoot = rootPath?.trim();
    if (explicitRoot && projectsRef.current.some((project) => project.rootPath === explicitRoot)) {
      throw new Error("A project is already mounted at this path");
    }
    const meta = makeProject({
      name: bundle.suggestedName,
      files: bundle.files,
      entry: entry && bundle.files.some((file) => file.path === entry) ? entry : bundle.manifest?.entry,
      rootPath: explicitRoot || bundle.manifest?.rootPath || uniqueRoot(projectsRef.current, bundle.suggestedName),
      permissions: manifestPermissions(bundle.manifest),
      projects: projectsRef.current,
    });
    if (!explicitRoot && bundle.manifest?.rootPath && projectsRef.current.some((project) => project.rootPath === meta.rootPath)) {
      meta.rootPath = uniqueRoot(projectsRef.current, meta.name);
    }
    if (bundle.manifest?.orientation) meta.orientation = bundle.manifest.orientation;
    if (bundle.manifest?.storage) meta.storage = bundle.manifest.storage;
    if (bundle.manifest?.cookies) meta.cookies = bundle.manifest.cookies ?? "";
    if (bundle.manifest?.iconDataUrl) meta.iconDataUrl = bundle.manifest.iconDataUrl;
    await replaceFiles(meta.id, bundle.files);
    await saveProject(meta);
    const list = [meta, ...projectsRef.current];
    projectsRef.current = list;
    setProjects(list);
    setImportOpen(false);
    setPathOpen(false);
    go(`run/${meta.id}`);
  }

  const runId = route.screen === "run" ? route.id : "";
  const runMode = route.screen === "run" ? route.mode : "run";

  useEffect(() => {
    if (!ready) return;
    if (!runId) {
      setRun(null);
      setActiveId(null);
      return;
    }
    let cancel = false;
    const override = pendingEntry.current;
    pendingEntry.current = null;
    void (async () => {
      const meta = projectsRef.current.find((item) => item.id === runId);
      if (!meta) {
        if (!cancel) {
          notify("Project not found");
          go("");
        }
        return;
      }
      const files = await readAllFiles(meta.id, meta.files);
      if (cancel) return;
      const entry = override && files.some((file) => file.path === override) ? override : meta.entry;
      const opened = { ...meta, lastOpenedAt: Date.now() };
      await saveProject(opened);
      if (cancel) return;
      const list = projectsRef.current.map((item) => (item.id === opened.id ? opened : item));
      projectsRef.current = list;
      setProjects(list);
      setActiveId(opened.id);
      setLogs([]);
      setNet([]);
      setDevOpen(false);
      setRun({
        mode: runMode,
        files,
        stack: [entry],
        index: 0,
        tick: 1,
        zoom: 1,
        storage: { ...opened.storage },
        sessionStorage: {},
        cookies: opened.cookies,
      });
    })().catch((error: unknown) => {
      if (!cancel) notify(error instanceof Error ? error.message : "Could not open project");
    });
    return () => {
      cancel = true;
    };
  }, [ready, runId, runMode, launch]);

  async function handleOpenPath() {
    const match = findByPath(projectsRef.current, pathValue);
    if (match) {
      pendingEntry.current = match.entry;
      setPathOpen(false);
      go(`run/${match.project.id}`);
      return;
    }
    mountRoot.current = pathValue.trim() || "/sdcard/index.html";
    dirRef.current?.click();
  }

  async function ingestFiles(files: StoredFile[], rootPath?: string, entry?: string) {
    const bundle = await bundleFromFiles(files);
    await adopt(bundle, rootPath, entry);
    notify(`Imported ${bundle.files.length} files`);
  }

  const active = projects.find((project) => project.id === activeId) ?? null;
  const managed = projects.find((project) => project.id === manageId) ?? null;
  const ordered = sortProjects(projects);

  async function launchPaste(name: string, html: string) {
    const source = html.trim() || BOILERPLATE;
    const files: StoredFile[] = [{ path: "index.html", mime: "text/html", data: new TextEncoder().encode(source) }];
    const meta = makeProject({
      name: name.trim() || titleFromHtml(source) || "Pasted HTML",
      files,
      projects: projectsRef.current,
    });
    await replaceFiles(meta.id, files);
    await saveProject(meta);
    const list = [meta, ...projectsRef.current];
    projectsRef.current = list;
    setProjects(list);
    go(`run/${meta.id}`);
  }

  async function runSelfTest() {
    const files = selfTestFiles();
    const existing = projectsRef.current.find((project) => project.name === "Engine self-test");
    if (existing) {
      const next: ProjectMeta = {
        ...existing,
        entry: "index.html",
        files: indexFiles(files),
        storage: {},
        cookies: "",
        permissions: { ...DEFAULT_PERMISSIONS },
        updatedAt: Date.now(),
      };
      await replaceFiles(existing.id, files);
      await saveProject(next);
      const list = projectsRef.current.map((project) => (project.id === next.id ? next : project));
      projectsRef.current = list;
      setProjects(list);
      go(`run/${next.id}`);
      return;
    }
    const meta = makeProject({ name: "Engine self-test", files, projects: projectsRef.current });
    await replaceFiles(meta.id, files);
    await saveProject(meta);
    const list = [meta, ...projectsRef.current];
    projectsRef.current = list;
    setProjects(list);
    go(`run/${meta.id}`);
  }

  function patchRun(patch: Partial<RunState>) {
    setRun((current) => (current ? { ...current, ...patch } : current));
  }

  async function saveEditedFile(path: string, text: string) {
    if (!active || !runRef.current) return;
    const data = new TextEncoder().encode(text);
    const mime = runRef.current.files.find((file) => file.path === path)?.mime ?? "text/plain";
    const nextFiles = runRef.current.files.map((file) => (file.path === path ? { ...file, data, mime } : file));
    await writeFiles(active.id, [{ path, mime, data }]);
    const next = remember(active.id, { files: indexFiles(nextFiles) });
    if (!next) return;
    setRun((current) => (current ? { ...current, files: nextFiles, tick: current.tick + 1, storage: next.storage, cookies: next.cookies } : current));
    notify("Saved");
  }

  return (
    <div
      className="app-shell relative mx-auto flex h-dvh w-full max-w-3xl flex-col bg-bg text-fg md:border-x md:border-line"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void filesFromDataTransfer(event.dataTransfer)
          .then((files) => ingestFiles(files))
          .catch((error: unknown) => notify(error instanceof Error ? error.message : "Import failed"));
      }}
    >
      {route.screen === "paste" ? (
        <PasteView onBack={() => go("")} onLaunch={(name, html) => void launchPaste(name, html).catch((error: unknown) => notify(error instanceof Error ? error.message : "Could not launch"))} />
      ) : route.screen === "run" && run && active ? (
        <RuntimeView
          project={active}
          run={run}
          logs={logs}
          net={net}
          developer={settings.developerMode}
          devOpen={devOpen}
          onToggleDev={() => setDevOpen((open) => !open)}
          onEnableDeveloper={() => {
            const next = { ...settings, developerMode: true };
            setSettings(next);
            void saveSettings(next);
          }}
          onBack={() => {
            const current = runRef.current;
            if (current && current.index > 0) {
              patchRun({ index: current.index - 1, tick: current.tick + 1 });
              return;
            }
            go("");
          }}
          onReload={() => {
            const current = runRef.current;
            const project = projectsRef.current.find((item) => item.id === active.id);
            if (!current || !project) return;
            patchRun({ tick: current.tick + 1, storage: { ...project.storage }, cookies: project.cookies, sessionStorage: {} });
          }}
          onZoom={(zoom) => patchRun({ zoom })}
          onNavigate={(path, storage, sessionStorage, cookies) => {
            const current = runRef.current;
            if (!current) return;
            remember(active.id, { storage, cookies });
            const stack = current.stack.slice(0, current.index + 1);
            if (stack[stack.length - 1] !== path) stack.push(path);
            setRun({ ...current, stack, index: stack.length - 1, tick: current.tick + 1, storage, sessionStorage, cookies });
          }}
          onStorage={(storage) => remember(active.id, { storage })}
          onSession={(sessionStorage) => patchRun({ sessionStorage })}
          onCookies={(cookies) => remember(active.id, { cookies })}
          onDiag={(level: DiagLevel, message: string) => setLogs((prev) => [...prev.slice(-200), diag(level, message)])}
          onNet={(event) => setNet((prev) => [...prev.slice(-200), { ...event, id: nid(), t: Date.now() }])}
          onExternal={(href) => {
            if (settings.externalLinks === "block") {
              notify("External link blocked");
              setLogs((prev) => [...prev, diag("warn", `External link blocked: ${href}`)]);
              return;
            }
            if (settings.externalLinks === "allow") {
              window.open(href, "_blank", "noopener,noreferrer");
              return;
            }
            setExternalHref(href);
          }}
          onNotify={(title, body) => notify(body ? `${title}: ${body}` : title)}
          onClearCache={() => {
            const current = runRef.current;
            if (!current) return;
            patchRun({ tick: current.tick + 1, sessionStorage: {} });
            setLogs((prev) => [...prev, diag("info", "Cache cleared")]);
          }}
          onClearStorage={() => {
            const current = runRef.current;
            if (!current) return;
            remember(active.id, { storage: {}, cookies: "" });
            setRun({ ...current, storage: {}, cookies: "", sessionStorage: {}, tick: current.tick + 1 });
            setLogs((prev) => [...prev, diag("info", "Local storage cleared")]);
          }}
          onClearLogs={() => setLogs([])}
          onSaveFile={(path, text) => void saveEditedFile(path, text)}
          onOrientation={(orientation: Orientation) => remember(active.id, { orientation })}
          onManage={() => setManageId(active.id)}
          onExit={() => go("")}
        />
      ) : route.screen === "run" ? (
        <p className="px-4 py-6 font-mono text-sm text-muted">Loading project…</p>
      ) : (
        <HomeScreen
          projects={ordered}
          onOpenPath={() => setPathOpen(true)}
          onImport={() => setImportOpen(true)}
          onPaste={() => go("paste")}
          onOpenProject={(project, mode) => go(`${mode}/${project.id}`)}
          onManage={(project) => setManageId(project.id)}
          onTogglePin={(project) => remember(project.id, { pinned: !project.pinned })}
          onSelfTest={() => void runSelfTest().catch((error: unknown) => notify(error instanceof Error ? error.message : "Self-test failed"))}
          onSettings={() => setSettingsOpen(true)}
        />
      )}

      {dragging ? (
        <div className="pointer-events-none absolute inset-4 grid place-items-center rounded-card border border-accent bg-bg/80 font-mono text-sm text-accent">
          Drop HTML, a folder, or a zip
        </div>
      ) : null}

      <PathSheet
        open={pathOpen}
        value={pathValue}
        onOpenChange={setPathOpen}
        onChange={setPathValue}
        onOpen={() => void handleOpenPath()}
        onBrowseFile={() => {
          mountRoot.current = null;
          fileRef.current?.click();
        }}
        onMountFolder={() => {
          mountRoot.current = pathValue;
          dirRef.current?.click();
        }}
      />
      <ImportSheet
        open={importOpen}
        onOpenChange={setImportOpen}
        onFile={() => {
          mountRoot.current = null;
          fileRef.current?.click();
        }}
        onFolder={() => {
          mountRoot.current = null;
          dirRef.current?.click();
        }}
        onZip={() => zipRef.current?.click()}
      />
      <SettingsSheet
        open={settingsOpen}
        settings={settings}
        onOpenChange={setSettingsOpen}
        onChange={(next) => {
          setSettings(next);
          void saveSettings(next);
        }}
      />
      <ProjectSheet
        project={managed}
        onOpenChange={(open) => { if (!open) setManageId(null); }}
        onPatch={(patch, reload) => {
          if (!managed) return;
          const next = remember(managed.id, patch);
          if (reload && next && runRef.current && activeId === managed.id) {
            const entry = next.entry;
            setRun((current) => current ? { ...current, tick: current.tick + 1, stack: [entry], index: 0 } : current);
          }
        }}
        onDelete={() => {
          if (!managed) return;
          const id = managed.id;
          void deleteProjectRecord(id).then(() => {
            const list = projectsRef.current.filter((project) => project.id !== id);
            projectsRef.current = list;
            setProjects(list);
            setManageId(null);
            if (activeId === id) go("");
            notify("Project deleted");
          });
        }}
        onDuplicate={() => {
          if (!managed) return;
          void readAllFiles(managed.id, managed.files).then(async (files) => {
            const meta = makeProject({
              name: `${managed.name} copy`,
              files,
              entry: managed.entry,
              projects: projectsRef.current,
            });
            meta.permissions = { ...managed.permissions };
            meta.orientation = managed.orientation;
            meta.iconDataUrl = managed.iconDataUrl;
            meta.storage = { ...managed.storage };
            meta.cookies = managed.cookies;
            await replaceFiles(meta.id, files);
            await saveProject(meta);
            const list = [meta, ...projectsRef.current];
            projectsRef.current = list;
            setProjects(list);
            notify("Duplicated");
          });
        }}
        onExport={() => {
          if (!managed) return;
          void readAllFiles(managed.id, managed.files).then((files) => {
            const manifest = {
              name: managed.name,
              entry: managed.entry,
              rootPath: managed.rootPath,
              permissions: managed.permissions,
              orientation: managed.orientation,
              storage: managed.storage,
              cookies: managed.cookies,
              iconDataUrl: managed.iconDataUrl,
            };
            const packed = zipStore([
              { path: "html-runtime.json", data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) },
              ...files.map((file) => ({ path: file.path, data: file.data })),
            ]);
            const bytes = new ArrayBuffer(packed.byteLength);
            new Uint8Array(bytes).set(packed);
            const blob = new Blob([bytes], { type: "application/zip" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${safeName(managed.name)}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
            notify(`Exported ${formatBytes(packed.byteLength)}`);
          });
        }}
        onInstall={() => {
          if (!managed) return;
          const installed = !managed.installed;
          remember(managed.id, { installed });
          notify(installed ? "Installed as a local app" : "Removed from installed apps");
        }}
        onShortcut={() => {
          if (!managed) return;
          const url = new URL(window.location.href);
          url.hash = `app/${managed.id}`;
          void navigator.clipboard.writeText(url.toString()).then(
            () => notify("Shortcut link copied"),
            () => notify(url.toString()),
          );
        }}
        onOpen={(mode) => {
          if (!managed) return;
          setManageId(null);
          go(`${mode}/${managed.id}`);
        }}
        onIcon={(file) => {
          if (!managed) return;
          void createImageBitmap(file).then((bitmap) => {
            const canvas = document.createElement("canvas");
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const scale = Math.max(128 / bitmap.width, 128 / bitmap.height);
            const width = bitmap.width * scale;
            const height = bitmap.height * scale;
            ctx.drawImage(bitmap, (128 - width) / 2, (128 - height) / 2, width, height);
            remember(managed.id, { iconDataUrl: canvas.toDataURL("image/png") });
          });
        }}
      />
      <ExternalSheet
        href={externalHref}
        onCancel={() => setExternalHref(null)}
        onOpen={() => {
          if (externalHref) window.open(externalHref, "_blank", "noopener,noreferrer");
          setExternalHref(null);
        }}
      />

      <input
        ref={fileRef}
        type="file"
        accept=".html,.htm,text/html"
        className="hidden"
        onChange={(event) => {
          const list = event.target.files;
          event.target.value = "";
          if (!list?.length) return;
          void filesFromList(list)
            .then((files) => ingestFiles(files))
            .catch((error: unknown) => notify(error instanceof Error ? error.message : "Import failed"));
        }}
      />
      <input
        ref={dirRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          const list = event.target.files;
          const root = mountRoot.current;
          mountRoot.current = null;
          event.target.value = "";
          if (!list?.length) return;
          void filesFromList(list)
            .then((files) => {
              if (!root) return ingestFiles(files);
              const parts = splitRootAndEntry(root);
              const entry = files.some((file) => file.path === parts.entry) ? parts.entry : undefined;
              return ingestFiles(files, parts.rootPath, entry);
            })
            .catch((error: unknown) => notify(error instanceof Error ? error.message : "Import failed"));
        }}
      />
      <input
        ref={zipRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          void file.arrayBuffer()
            .then((buffer) => bundleFromZip(buffer))
            .then((bundle) => adopt(bundle))
            .then(() => notify("Zip imported"))
            .catch((error: unknown) => notify(error instanceof Error ? error.message : "Could not read zip"));
        }}
      />
      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" aria-live="polite">
          <p className="max-w-sm rounded-control border border-line bg-raised px-4 py-3 text-sm text-fg">{toast}</p>
        </div>
      ) : null}
    </div>
  );
}
