import { decodeText, isTextualMime, looksLikeModule, toDataUrl } from "@/lib/runtime/mime";
import { dirname, isExternalSpec, normalizePath, resolveSpec } from "@/lib/runtime/paths";
import { PRELUDE_JS } from "@/lib/runtime/prelude";
import {
  nid,
  type Diag,
  type DiagLevel,
  type Permissions,
  type StoredFile,
} from "@/lib/runtime/types";

export type CompileInput = {
  files: StoredFile[];
  entry: string;
  rootPath: string;
  permissions: Permissions;
  storage: Record<string, string>;
  session: Record<string, string>;
  cookies: string;
};

export type CompileResult = {
  html: string;
  logs: Diag[];
};

function log(logs: Diag[], level: DiagLevel, message: string) {
  if (logs.length > 100) return;
  logs.push({ id: nid(), t: Date.now(), level, message });
}

function lookup(map: Map<string, StoredFile>, path: string): StoredFile | undefined {
  const normalized = normalizePath(path);
  const direct = map.get(normalized);
  if (direct) return direct;
  const lower = normalized.toLowerCase();
  for (const [key, file] of map) {
    if (key.toLowerCase() === lower) return file;
  }
  return undefined;
}

function safeScript(code: string): string {
  return code.replace(/<\/script/gi, "<\\/script");
}

function rewriteImports(code: string, fromFile: string): string {
  return code.replace(
    /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"]+)\2/g,
    (full, lead: string, quote: string, spec: string) => {
      if (!spec.startsWith(".") && !spec.startsWith("/")) return full;
      const resolved = resolveSpec(fromFile, spec);
      if (!resolved) return full;
      return `${lead}${quote}https://htmlrt.local/virtual/${resolved}${quote}`;
    },
  );
}

function rewriteCssUrls(
  css: string,
  fromFile: string,
  map: Map<string, StoredFile>,
  logs: Diag[],
  network: boolean,
): string {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (full, _quote, raw: string) => {
    const spec = String(raw).trim();
    const resolved = resolveSpec(fromFile, spec);
    if (!resolved) {
      if (!network && isExternalSpec(spec)) {
        log(logs, "warn", `External request blocked: ${spec}`);
        return 'url("data:text/plain,")';
      }
      return full;
    }
    const file = lookup(map, resolved);
    if (!file) {
      log(logs, "warn", `Missing asset ${resolved}`);
      return 'url("data:text/plain,")';
    }
    return `url("${toDataUrl(file.mime, file.data)}")`;
  });
}

function expandCss(
  css: string,
  fromFile: string,
  map: Map<string, StoredFile>,
  stack: Set<string>,
  logs: Diag[],
  network: boolean,
): string {
  const expanded = css.replace(
    /@import\s+(?:url\(\s*)?(['"]?)([^'")\s]+)\1\s*\)?[^;]*;/g,
    (full, _quote, spec: string) => {
      const resolved = resolveSpec(fromFile, String(spec));
      if (!resolved || stack.has(resolved)) return "";
      const file = lookup(map, resolved);
      if (!file) {
        log(logs, "warn", `Missing stylesheet ${resolved}`);
        return "";
      }
      const next = new Set(stack);
      next.add(resolved);
      return expandCss(decodeText(file.data), file.path, map, next, logs, network);
    },
  );
  return rewriteCssUrls(expanded, fromFile, map, logs, network);
}

function dataUrlFor(spec: string, fromFile: string, map: Map<string, StoredFile>, logs: Diag[], network: boolean): string | null {
  const resolved = resolveSpec(fromFile, spec);
  if (!resolved) {
    if (!network && isExternalSpec(spec)) {
      log(logs, "warn", `External request blocked: ${spec}`);
      return "data:text/plain,";
    }
    return null;
  }
  const file = lookup(map, resolved);
  if (!file) {
    log(logs, "warn", `Missing asset ${resolved}`);
    return "data:text/plain,";
  }
  return toDataUrl(file.mime, file.data);
}

function rewriteSrcset(value: string, fromFile: string, map: Map<string, StoredFile>, logs: Diag[], network: boolean): string {
  return value
    .split(",")
    .map((part) => {
      const bits = part.trim().split(/\s+/);
      const url = bits[0];
      if (!url) return part.trim();
      const mapped = dataUrlFor(url, fromFile, map, logs, network);
      if (mapped) bits[0] = mapped;
      return bits.join(" ");
    })
    .join(", ");
}

function buildCsp(network: boolean): string {
  const net = network ? " https: http:" : "";
  return [
    "default-src 'none'",
    `script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: data:${network ? " https: http:" : ""}`,
    `style-src 'unsafe-inline' blob: data:${net}`,
    `img-src blob: data:${net}`,
    `media-src blob: data:${net}`,
    `font-src blob: data:${net}`,
    `connect-src blob: data:${net}`,
    "worker-src blob:",
    "frame-src blob: data:",
    "object-src 'none'",
    "base-uri https://htmlrt.local",
    "form-action https://htmlrt.local",
  ].join("; ");
}

function baseHref(rootPath: string, entry: string): string {
  const root = rootPath.replace(/^\/+/, "").replace(/\/+$/, "");
  const dir = dirname(entry);
  const path = [root, dir].filter(Boolean).join("/");
  return `https://htmlrt.local/${path}${path ? "/" : ""}`;
}

function errorDocument(message: string): string {
  const safe = message.replace(/[&<>]/g, (char) => ({ "&": "&", "<": "<", ">": ">" })[char] ?? char);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#101416;color:#e7eeea;font:16px/1.5 ui-monospace,monospace;padding:24px"><p style="color:#ff6b6b;letter-spacing:.14em;font-size:12px">RUNTIME</p><p>${safe}</p></body></html>`;
}

function isJsType(type: string): boolean {
  const value = type.toLowerCase().trim();
  return (
    !value ||
    value === "module" ||
    value === "text/javascript" ||
    value === "application/javascript" ||
    value === "text/ecmascript" ||
    value === "application/ecmascript"
  );
}

function ensure(doc: Document, tag: "head" | "body"): HTMLElement {
  const found = doc.querySelector(tag);
  if (found) return found as HTMLElement;
  const el = doc.createElement(tag);
  doc.documentElement.appendChild(el);
  return el;
}

export function compileDocument(input: CompileInput): CompileResult {
  const logs: Diag[] = [];
  const entry = normalizePath(input.entry);
  const fileMap = new Map<string, StoredFile>();
  for (const file of input.files) {
    const path = normalizePath(file.path);
    fileMap.set(path, { ...file, path });
  }
  const entryFile = lookup(fileMap, entry);
  log(logs, "info", `Loading ${entry}`);
  if (!entryFile) {
    log(logs, "error", `Entry not found: ${entry}`);
    return { html: errorDocument(`Entry not found: ${entry}`), logs };
  }

  const network = input.permissions.network;
  const doc = new DOMParser().parseFromString(decodeText(entryFile.data), "text/html");
  const head = ensure(doc, "head");
  const body = ensure(doc, "body");

  for (const base of Array.from(doc.querySelectorAll("base"))) base.remove();

  for (const style of Array.from(doc.querySelectorAll("style"))) {
    style.textContent = expandCss(style.textContent ?? "", entry, fileMap, new Set([entry]), logs, network);
  }

  for (const link of Array.from(doc.querySelectorAll("link[href]"))) {
    const rel = (link.getAttribute("rel") || "").toLowerCase();
    const href = link.getAttribute("href") || "";
    if (rel.split(/\s+/).includes("stylesheet")) {
      const resolved = resolveSpec(entry, href);
      const style = doc.createElement("style");
      style.setAttribute("data-htmlrt-css", "1");
      if (!resolved) {
        if (!network && isExternalSpec(href)) {
          log(logs, "warn", `External request blocked: ${href}`);
          link.remove();
        }
        continue;
      }
      const file = lookup(fileMap, resolved);
      if (!file) {
        log(logs, "warn", `Missing stylesheet ${resolved}`);
        link.remove();
        continue;
      }
      style.textContent = expandCss(decodeText(file.data), file.path, fileMap, new Set([file.path]), logs, network);
      link.replaceWith(style);
      continue;
    }
    const mapped = dataUrlFor(href, entry, fileMap, logs, network);
    if (mapped) link.setAttribute("href", mapped);
  }

  const boot: string[] = [];
  const tail: HTMLScriptElement[] = [];
  for (const script of Array.from(doc.querySelectorAll("script"))) {
    const type = script.getAttribute("type") || "";
    if (!isJsType(type)) continue;
    const src = script.getAttribute("src");
    if (!src) {
      if ((type || "").toLowerCase() === "module" || looksLikeModule(script.textContent || "")) {
        script.textContent = safeScript(rewriteImports(script.textContent || "", entry));
        if (!script.getAttribute("type")) script.setAttribute("type", "module");
      } else {
        script.textContent = safeScript(script.textContent || "");
      }
      continue;
    }
    const resolved = resolveSpec(entry, src);
    if (!resolved) {
      if (!network && isExternalSpec(src)) {
        log(logs, "warn", `External request blocked: ${src}`);
        script.remove();
      }
      continue;
    }
    const file = lookup(fileMap, resolved);
    if (!file) {
      log(logs, "error", `Missing script ${resolved}`);
      script.remove();
      continue;
    }
    const code = decodeText(file.data);
    const asModule = type.toLowerCase() === "module" || file.path.endsWith(".mjs") || looksLikeModule(code);
    if (asModule) {
      const placeholder = doc.createElement("script");
      placeholder.setAttribute("data-htmlrt-module", file.path);
      script.replaceWith(placeholder);
      boot.push(file.path);
      continue;
    }
    const inline = doc.createElement("script");
    const keepType = type && type.toLowerCase() !== "text/javascript" ? type : "";
    if (keepType) inline.setAttribute("type", keepType);
    inline.textContent = safeScript(rewriteImports(code, file.path));
    if (script.hasAttribute("defer") || script.hasAttribute("async")) {
      script.remove();
      tail.push(inline);
    } else {
      script.replaceWith(inline);
    }
  }

  const urlSelectors = "img, video, audio, source, embed, track, object, iframe, image, use";
  for (const el of Array.from(doc.querySelectorAll(urlSelectors))) {
    for (const attr of ["src", "href", "poster", "data", "xlink:href"]) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      const mapped = dataUrlFor(value, entry, fileMap, logs, network);
      if (mapped) el.setAttribute(attr, mapped);
    }
    const srcset = el.getAttribute("srcset");
    if (srcset) el.setAttribute("srcset", rewriteSrcset(srcset, entry, fileMap, logs, network));
  }

  for (const el of Array.from(doc.querySelectorAll("[style]"))) {
    const style = el.getAttribute("style") || "";
    if (style.includes("url(")) el.setAttribute("style", rewriteCssUrls(style, entry, fileMap, logs, network));
  }

  for (const node of tail) body.appendChild(node);
  if (boot.length > 0) {
    const bootScript = doc.createElement("script");
    bootScript.textContent = `__htmlrtBootModules(${JSON.stringify(boot)});`;
    body.appendChild(bootScript);
  }

  const filesPayload: Record<string, string> = {};
  const modules: { path: string; code: string }[] = [];
  const pages: string[] = [];
  for (const file of fileMap.values()) {
    filesPayload[file.path] = toDataUrl(file.mime, file.data);
    if (/\.html?$/i.test(file.path)) pages.push(file.path);
    if (!isTextualMime(file.mime)) continue;
    if (!/\.(mjs|js|cjs)$/i.test(file.path)) continue;
    const code = decodeText(file.data);
    if (file.path.endsWith(".mjs") || looksLikeModule(code)) {
      modules.push({ path: file.path, code: rewriteImports(code, file.path) });
    }
  }

  const payload = {
    files: filesPayload,
    root: input.rootPath.replace(/^\/+/, "").replace(/\/+$/, ""),
    entry,
    permissions: input.permissions,
    storage: input.storage,
    session: input.session,
    cookies: input.cookies,
    pages,
    modules,
  };
  const json = JSON.stringify(payload).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const prelude = doc.createElement("script");
  prelude.setAttribute("data-htmlrt-prelude", "1");
  prelude.textContent = `(function(){\nconst PAYLOAD=${json};\n${PRELUDE_JS}\n})();`;

  const csp = doc.createElement("meta");
  csp.setAttribute("http-equiv", "Content-Security-Policy");
  csp.setAttribute("content", buildCsp(network));
  const base = doc.createElement("base");
  base.setAttribute("href", baseHref(input.rootPath, entry));
  const charset = doc.createElement("meta");
  charset.setAttribute("charset", "utf-8");

  head.prepend(prelude);
  head.prepend(base);
  head.prepend(csp);
  head.prepend(charset);

  log(logs, "info", `${input.files.length} assets loaded`);
  log(logs, "info", network ? "Network policy: ALLOWED" : "Network policy: BLOCKED");

  return { html: `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`, logs };
}

export function allowAttribute(permissions: Permissions): string {
  const parts: string[] = [];
  if (permissions.camera) parts.push("camera");
  if (permissions.microphone) parts.push("microphone");
  if (permissions.location) parts.push("geolocation");
  if (permissions.clipboard) parts.push("clipboard-read", "clipboard-write");
  return parts.join("; ");
}
