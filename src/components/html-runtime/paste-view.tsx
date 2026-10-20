import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button, IconButton, TextField } from "@/components/html-runtime/ui";

export function PasteView({ onBack, onLaunch }: { onBack: () => void; onLaunch: (name: string, html: string) => void }) {
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-1 border-b border-line px-1 py-1">
        <IconButton label="Back" onClick={onBack}>
          <ChevronLeft className="size-5" />
        </IconButton>
        <h1 className="min-w-0 flex-1 truncate font-mono text-xs tracking-widest text-muted">PASTE HTML</h1>
        <Button variant="primary" className="mr-2" onClick={() => onLaunch(name, html)}>
          Launch
        </Button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4">
        <TextField label="NAME" value={name} placeholder="Untitled" onChange={(event) => setName(event.target.value)} />
        <label className="flex min-h-0 flex-1 flex-col">
          <span className="mb-2 font-mono text-xs tracking-widest text-muted">SOURCE</span>
          <textarea
            value={html}
            onChange={(event) => setHtml(event.target.value)}
            spellCheck={false}
            placeholder={"<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Untitled</title>\n</head>\n<body>\n</body>\n</html>"}
            className="min-h-64 w-full flex-1 resize-none rounded-card border border-line bg-inset p-3 font-mono text-sm text-fg outline-none focus:border-accent"
          />
        </label>
      </div>
    </div>
  );
}
