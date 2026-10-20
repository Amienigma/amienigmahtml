import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import {
  File,
  FileAudio,
  FileCode,
  FileImage,
  FileJson,
  FileText,
  FileVideo,
  X,
} from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Button({
  variant = "surface",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "surface" | "ghost" | "danger" }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40",
        variant === "primary" && "bg-accent text-accent-ink",
        variant === "surface" && "border border-line bg-raised text-fg",
        variant === "ghost" && "bg-transparent text-fg",
        variant === "danger" && "bg-danger-dim text-danger",
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-control text-fg transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-card border border-line bg-surface focus:outline-none md:inset-x-auto md:left-1/2 md:w-full md:max-w-lg md:-translate-x-1/2">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <Dialog.Title className="font-mono text-xs tracking-widest text-muted">{title}</Dialog.Title>
            <Dialog.Close className="grid size-11 place-items-center rounded-control text-muted" aria-label="Close">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 overflow-y-auto px-4 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 py-3">
      <span className="min-w-0 flex-1">
        <span className="block text-sm">{label}</span>
        {description ? <span className="mt-1 block text-xs text-muted">{description}</span> : null}
      </span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
        className={cn(
          "mt-1 h-7 w-12 shrink-0 rounded-full border border-line bg-inset transition-colors",
          checked && "border-accent bg-accent",
        )}
      >
        <Switch.Thumb
          className={cn(
            "block size-5 translate-x-1 rounded-full bg-fg transition-transform",
            checked && "translate-x-6 bg-accent-ink",
          )}
        />
      </Switch.Root>
    </label>
  );
}

export function TextField({
  label,
  mono,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; mono?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-xs tracking-widest text-muted">{label}</span>
      <input
        className={cn(
          "h-11 w-full rounded-control border border-line bg-inset px-3 text-base text-fg outline-none focus:border-accent",
          mono && "font-mono text-sm",
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="px-1 font-mono text-xs tracking-widest text-muted">{children}</p>;
}

export function ProjectMark({
  name,
  icon,
  className,
}: {
  name: string;
  icon: string | null;
  className?: string;
}) {
  const letter = (name.trim()[0] || "H").toUpperCase();
  if (icon) {
    return <img src={icon} alt="" className={cn("size-11 rounded-control object-cover", className)} />;
  }
  return (
    <span
      className={cn(
        "grid size-11 place-items-center rounded-control bg-accent-dim font-mono text-sm text-accent",
        className,
      )}
    >
      {letter}
    </span>
  );
}

export function StatusLine({ label, value, tone = "fg" }: { label: string; value: string; tone?: "fg" | "accent" | "warn" }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={cn("text-right font-mono text-sm", tone === "accent" && "text-accent", tone === "warn" && "text-warn", tone === "fg" && "text-fg")}>
        {value}
      </dd>
    </div>
  );
}

export function fileGlyph(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "html" || ext === "htm" || ext === "css" || ext === "js" || ext === "mjs") return FileCode;
  if (ext === "json") return FileJson;
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "ico"].includes(ext)) return FileImage;
  if (["mp3", "wav", "ogg"].includes(ext)) return FileAudio;
  if (["mp4", "webm"].includes(ext)) return FileVideo;
  if (ext === "txt" || ext === "md") return FileText;
  return File;
}
