const MIME: Record<string, string> = {
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  js: "text/javascript",
  mjs: "text/javascript",
  cjs: "text/javascript",
  json: "application/json",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  mp4: "video/mp4",
  webm: "video/webm",
  txt: "text/plain",
  md: "text/markdown",
  xml: "application/xml",
  wasm: "application/wasm",
  gltf: "model/gltf+json",
  map: "application/json",
  glsl: "text/plain",
  frag: "text/plain",
  vert: "text/plain",
};

export function guessMime(path: string, fallback = ""): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (MIME[ext]) return MIME[ext];
  if (fallback && fallback !== "application/octet-stream") return fallback;
  return "application/octet-stream";
}

export function isTextualMime(mime: string): boolean {
  if (mime.startsWith("text/")) return true;
  return (
    mime === "application/json" ||
    mime === "application/javascript" ||
    mime === "text/javascript" ||
    mime === "image/svg+xml" ||
    mime === "application/xml" ||
    mime === "application/xhtml+xml"
  );
}

export function looksLikeModule(code: string): boolean {
  return /^\s*import\s/m.test(code) || /^\s*export\s/m.test(code);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x1000;
  for (let index = 0; index < bytes.length; index += chunk) {
    const slice = bytes.subarray(index, index + chunk);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export function toDataUrl(mime: string, data: Uint8Array): string {
  if (isTextualMime(mime)) {
    const text = new TextDecoder().decode(data);
    return `data:${mime || "text/plain"};charset=utf-8,${encodeURIComponent(text)}`;
  }
  return `data:${mime || "application/octet-stream"};base64,${bytesToBase64(data)}`;
}

export function decodeText(data: Uint8Array): string {
  return new TextDecoder().decode(data);
}

export function titleFromHtml(text: string): string | null {
  const match = text.match(/<title[^>]*>([^<]{1,80})<\/title>/i);
  if (!match?.[1]) return null;
  const value = match[1]
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  return value || null;
}
