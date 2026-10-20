import type { ReactNode } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { ChevronRight, ClipboardPaste, FolderInput, Pin, Plus, Settings } from "lucide-react";
import { projectDisplayPath, totalBytes, formatBytes, type ProjectMeta } from "@/lib/runtime/types";
import { IconButton, ProjectMark, SectionLabel, StatusLine } from "@/components/html-runtime/ui";

export function HomeScreen({
  projects,
  onOpenPath,
  onImport,
  onPaste,
  onOpenProject,
  onManage,
  onTogglePin,
  onSelfTest,
  onSettings,
}: {
  projects: ProjectMeta[];
  onOpenPath: () => void;
  onImport: () => void;
  onPaste: () => void;
  onOpenProject: (project: ProjectMeta, mode: "run" | "app") => void;
  onManage: (project: ProjectMeta) => void;
  onTogglePin: (project: ProjectMeta) => void;
  onSelfTest: () => void;
  onSettings: () => void;
}) {
  const installed = projects.filter((project) => project.installed);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="font-mono text-xs tracking-widest text-accent">SYSTEM</p>
          <h1 className="font-mono text-base font-medium tracking-widest">HTML RUNTIME</h1>
        </div>
        <IconButton label="Settings" onClick={onSettings}>
          <Settings className="size-5" />
        </IconButton>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-4 py-3">
          <div className="flex flex-col gap-2">
            <ActionRow
              icon={<Plus className="size-5" />}
              accent
              title="Open HTML"
              detail="file:///sdcard/…/index.html"
              onClick={onOpenPath}
            />
            <ActionRow
              icon={<FolderInput className="size-5" />}
              title="Import project"
              detail="Folder, HTML file, or zip"
              onClick={onImport}
            />
            <ActionRow
              icon={<ClipboardPaste className="size-5" />}
              title="Paste HTML"
              detail="Raw document, then launch"
              onClick={onPaste}
            />
          </div>

          {installed.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionLabel>INSTALLED</SectionLabel>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {installed.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onOpenProject(project, "app")}
                    className="flex w-20 shrink-0 flex-col items-center gap-2 active:scale-[0.96]"
                  >
                    <ProjectMark name={project.name} icon={project.iconDataUrl} className="size-14 rounded-card text-base" />
                    <span className="w-full truncate text-center text-xs">{project.name}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <SectionLabel>RECENT PROJECTS</SectionLabel>
            {projects.length === 0 ? (
              <div className="rounded-card border border-dashed border-line px-4 py-6 text-center">
                <p className="text-sm">No projects yet</p>
                <p className="mt-1 text-xs text-muted">Open a path, import a folder, or paste HTML.</p>
              </div>
            ) : (
              <ul className="overflow-hidden rounded-card border border-line bg-surface">
                {projects.map((project) => (
                  <li key={project.id} className="border-b border-line last:border-b-0">
                    <div className="flex items-center gap-2 pr-1">
                      <button
                        type="button"
                        onClick={() => onOpenProject(project, "run")}
                        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                      >
                        <ProjectMark name={project.name} icon={project.iconDataUrl} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{project.name}</span>
                            {project.installed ? (
                              <span className="font-mono text-xs text-accent">APP</span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-xs text-muted" title={projectDisplayPath(project)}>
                            {projectDisplayPath(project)}
                          </span>
                          <span className="mt-0.5 block font-mono text-xs text-faint">
                            {formatBytes(totalBytes(project))}
                            {project.lastOpenedAt
                              ? ` · ${formatDistanceToNowStrict(project.lastOpenedAt, { addSuffix: true })}`
                              : ""}
                          </span>
                        </span>
                      </button>
                      <IconButton label={project.pinned ? "Unpin project" : "Pin project"} onClick={() => onTogglePin(project)}>
                        <Pin className={project.pinned ? "size-4 text-accent" : "size-4 text-faint"} />
                      </IconButton>
                      <IconButton label={`Manage ${project.name}`} onClick={() => onManage(project)}>
                        <ChevronRight className="size-4 text-faint" />
                      </IconButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <div className="px-4 pb-4">
          <section className="overflow-hidden rounded-card border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-mono text-xs tracking-widest text-muted">RUNTIME</h2>
              <button type="button" onClick={onSelfTest} className="font-mono text-xs text-accent">
                SELF-TEST
              </button>
            </div>
            <dl>
              <StatusLine label="Engine" value="WebView" />
              <StatusLine label="Network" value="OFFLINE" tone="accent" />
              <StatusLine label="JavaScript" value="ENABLED" />
              <StatusLine label="Storage" value="ENABLED" />
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function ActionRow({
  icon,
  title,
  detail,
  onClick,
  accent = false,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-card border border-line bg-surface px-3 py-3 text-left transition-transform duration-150 ease-out active:scale-[0.96]"
    >
      <span
        className={
          accent
            ? "grid size-11 place-items-center rounded-control bg-accent text-accent-ink"
            : "grid size-11 place-items-center rounded-control bg-raised text-fg"
        }
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate font-mono text-xs text-muted">{detail}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-faint" />
    </button>
  );
}
