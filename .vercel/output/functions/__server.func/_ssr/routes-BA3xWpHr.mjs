import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as FileAudio, a as Settings, b as ChevronRight, c as Pin, d as File, f as FileVideo, g as FileCode, h as FileImage, l as Maximize2, m as FileJson, n as ZoomOut, o as RefreshCw, p as FileText, r as X, s as Plus, t as ZoomIn, u as FolderInput, v as EllipsisVertical, x as ChevronLeft, y as ClipboardPaste } from "../_libs/lucide-react.mjs";
import { t as formatDistanceToNowStrict } from "../_libs/date-fns.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as SwitchThumb, t as Switch } from "../_libs/@radix-ui/react-switch+[...].mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BA3xWpHr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MIME = {
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
	vert: "text/plain"
};
function guessMime(path, fallback = "") {
	const ext = path.split(".").pop()?.toLowerCase() ?? "";
	if (MIME[ext]) return MIME[ext];
	if (fallback && fallback !== "application/octet-stream") return fallback;
	return "application/octet-stream";
}
function isTextualMime(mime) {
	if (mime.startsWith("text/")) return true;
	return mime === "application/json" || mime === "application/javascript" || mime === "text/javascript" || mime === "image/svg+xml" || mime === "application/xml" || mime === "application/xhtml+xml";
}
function looksLikeModule(code) {
	return /^\s*import\s/m.test(code) || /^\s*export\s/m.test(code);
}
function bytesToBase64(bytes) {
	let binary = "";
	const chunk = 4096;
	for (let index = 0; index < bytes.length; index += chunk) {
		const slice = bytes.subarray(index, index + chunk);
		binary += String.fromCharCode(...slice);
	}
	return btoa(binary);
}
function toDataUrl(mime, data) {
	if (isTextualMime(mime)) {
		const text = new TextDecoder().decode(data);
		return `data:${mime || "text/plain"};charset=utf-8,${encodeURIComponent(text)}`;
	}
	return `data:${mime || "application/octet-stream"};base64,${bytesToBase64(data)}`;
}
function decodeText(data) {
	return new TextDecoder().decode(data);
}
function titleFromHtml(text) {
	const match = text.match(/<title[^>]*>([^<]{1,80})<\/title>/i);
	if (!match?.[1]) return null;
	return match[1].replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\"").replace(/&#39;/g, "'").trim() || null;
}
var DEFAULT_PERMISSIONS = {
	network: false,
	camera: false,
	microphone: false,
	location: false,
	notifications: false,
	clipboard: false
};
var DEFAULT_SETTINGS = {
	developerMode: false,
	externalLinks: "ask"
};
function newId() {
	return crypto.randomUUID();
}
var seq = 0;
function nid() {
	seq += 1;
	return `${Date.now().toString(36)}-${seq}`;
}
function projectDisplayPath(project) {
	return `${project.rootPath.replace(/\/+$/, "") || "/"}/${project.entry}`.replace(/\/{2,}/g, "/");
}
function totalBytes(project) {
	return project.files.reduce((sum, file) => sum + file.bytes, 0);
}
function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1048576) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
	return `${(bytes / 1048576).toFixed(1)} MB`;
}
var DB_NAME = "html-runtime-vault";
var DB_VERSION = 1;
function openDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("projects")) db.createObjectStore("projects", { keyPath: "id" });
			if (!db.objectStoreNames.contains("files")) db.createObjectStore("files");
			if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? /* @__PURE__ */ new Error("Could not open the project vault"));
	});
}
function asBytes(value) {
	if (value instanceof Uint8Array) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	return /* @__PURE__ */ new Uint8Array();
}
async function listProjects() {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const request = db.transaction("projects", "readonly").objectStore("projects").getAll();
		request.onsuccess = () => resolve(request.result ?? []);
		request.onerror = () => reject(request.error);
	});
}
async function saveProject(project) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction("projects", "readwrite");
		tx.objectStore("projects").put(project);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function deleteProjectRecord(id) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(["projects", "files"], "readwrite");
		tx.objectStore("projects").delete(id);
		const files = tx.objectStore("files");
		const range = IDBKeyRange.bound(`${id}:`, `${id}:\uffff`);
		const cursor = files.openCursor(range);
		cursor.onsuccess = () => {
			const current = cursor.result;
			if (!current) return;
			current.delete();
			current.continue();
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function writeFiles(projectId, files) {
	if (files.length === 0) return;
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction("files", "readwrite");
		const store = tx.objectStore("files");
		for (const file of files) {
			const bytes = file.data.byteOffset === 0 && file.data.byteLength === file.data.buffer.byteLength ? file.data : file.data.slice();
			store.put(bytes, `${projectId}:${file.path}`);
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function replaceFiles(projectId, files) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction("files", "readwrite");
		const store = tx.objectStore("files");
		const range = IDBKeyRange.bound(`${projectId}:`, `${projectId}:\uffff`);
		const cursor = store.openCursor(range);
		cursor.onsuccess = () => {
			const current = cursor.result;
			if (!current) return;
			current.delete();
			current.continue();
		};
		tx.oncomplete = () => {
			writeFiles(projectId, files).then(resolve, reject);
		};
		tx.onerror = () => reject(tx.error);
	});
}
async function readAllFiles(projectId, index) {
	const db = await openDb();
	const mimeByPath = new Map(index.map((file) => [file.path, file.mime]));
	const files = [];
	await new Promise((resolve, reject) => {
		const tx = db.transaction("files", "readonly");
		const range = IDBKeyRange.bound(`${projectId}:`, `${projectId}:\uffff`);
		const cursor = tx.objectStore("files").openCursor(range);
		cursor.onsuccess = () => {
			const current = cursor.result;
			if (!current) return;
			const path = String(current.key).slice(projectId.length + 1);
			files.push({
				path,
				mime: mimeByPath.get(path) ?? guessMime(path),
				data: asBytes(current.value)
			});
			current.continue();
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	files.sort((a, b) => a.path.localeCompare(b.path));
	return files;
}
async function getSettings() {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const request = db.transaction("kv", "readonly").objectStore("kv").get("settings");
		request.onsuccess = () => {
			const value = request.result;
			resolve(value ? {
				...DEFAULT_SETTINGS,
				...value
			} : { ...DEFAULT_SETTINGS });
		};
		request.onerror = () => reject(request.error);
	});
}
async function saveSettings(settings) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction("kv", "readwrite");
		tx.objectStore("kv").put(settings, "settings");
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
var SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
function normalizePath(input) {
	const parts = [];
	for (const raw of input.replace(/\\/g, "/").split("/")) {
		if (!raw || raw === ".") continue;
		if (raw === "..") {
			parts.pop();
			continue;
		}
		parts.push(raw);
	}
	return parts.join("/");
}
function dirname(path) {
	const normalized = normalizePath(path);
	const index = normalized.lastIndexOf("/");
	return index === -1 ? "" : normalized.slice(0, index);
}
function joinPath(base, rel) {
	if (!rel) return normalizePath(base);
	if (rel.startsWith("/")) return normalizePath(rel);
	return normalizePath(`${base}/${rel}`);
}
function resolveSpec(fromFile, spec) {
	const clean = spec.trim();
	if (!clean || clean.startsWith("#") || clean.startsWith("//")) return null;
	if (clean.startsWith("data:") || clean.startsWith("blob:") || clean.startsWith("javascript:") || clean.startsWith("mailto:")) return null;
	if (SCHEME.test(clean)) return null;
	const noHash = clean.split("#")[0] ?? clean;
	const noQuery = noHash.split("?")[0] ?? noHash;
	if (!noQuery) return null;
	if (noQuery.startsWith("/")) return normalizePath(noQuery);
	return joinPath(dirname(fromFile), noQuery);
}
function isExternalSpec(spec) {
	const value = spec.trim();
	return value.startsWith("//") || /^https?:/i.test(value) || /^wss?:/i.test(value);
}
function normalizeUserPath(input) {
	let path = input.trim();
	if (!path) return "/";
	path = path.replace(/^file:\/\//i, "");
	path = path.replace(/\\/g, "/");
	if (!path.startsWith("/")) path = `/${path}`;
	const normalized = normalizePath(path);
	return normalized ? `/${normalized}` : "/";
}
function splitRootAndEntry(userPath) {
	const full = normalizeUserPath(userPath);
	const index = full.lastIndexOf("/");
	if (index <= 0) return {
		rootPath: "/",
		entry: full.replace(/^\//, "") || "index.html"
	};
	return {
		rootPath: full.slice(0, index),
		entry: full.slice(index + 1)
	};
}
function safeName(name) {
	return name.replace(/[^\w\s.-]+/g, "").trim().replace(/\s+/g, " ").slice(0, 48) || "Project";
}
function stripCommonRoot(files) {
	if (files.length === 0) return files;
	if (!files.every((file) => file.path.includes("/"))) return files;
	const root = files[0]?.path.split("/")[0];
	if (!root || !files.every((file) => file.path.split("/")[0] === root)) return files;
	return files.map((file) => ({
		...file,
		path: file.path.split("/").slice(1).join("/")
	}));
}
function crc32(data) {
	let crc = 4294967295;
	for (let index = 0; index < data.length; index += 1) {
		crc ^= data[index] ?? 0;
		for (let bit = 0; bit < 8; bit += 1) {
			const mask = -(crc & 1);
			crc = crc >>> 1 ^ 3988292384 & mask;
		}
	}
	return (crc ^ 4294967295) >>> 0;
}
function dosStamp(date) {
	return {
		time: date.getHours() << 11 | date.getMinutes() << 5 | date.getSeconds() >> 1,
		day: date.getFullYear() - 1980 << 9 | date.getMonth() + 1 << 5 | date.getDate()
	};
}
function zipStore(entries) {
	const stamp = dosStamp(/* @__PURE__ */ new Date());
	const locals = [];
	const centrals = [];
	let offset = 0;
	for (const entry of entries) {
		const name = new TextEncoder().encode(normalizePath(entry.path));
		const crc = crc32(entry.data);
		const local = new Uint8Array(30 + name.length + entry.data.length);
		const view = new DataView(local.buffer);
		view.setUint32(0, 67324752, true);
		view.setUint16(4, 20, true);
		view.setUint16(6, 2048, true);
		view.setUint16(8, 0, true);
		view.setUint16(10, stamp.time, true);
		view.setUint16(12, stamp.day, true);
		view.setUint32(14, crc, true);
		view.setUint32(18, entry.data.length, true);
		view.setUint32(22, entry.data.length, true);
		view.setUint16(26, name.length, true);
		view.setUint16(28, 0, true);
		local.set(name, 30);
		local.set(entry.data, 30 + name.length);
		locals.push(local);
		const central = new Uint8Array(46 + name.length);
		const centralView = new DataView(central.buffer);
		centralView.setUint32(0, 33639248, true);
		centralView.setUint16(4, 20, true);
		centralView.setUint16(6, 20, true);
		centralView.setUint16(8, 2048, true);
		centralView.setUint16(10, 0, true);
		centralView.setUint16(12, stamp.time, true);
		centralView.setUint16(14, stamp.day, true);
		centralView.setUint32(16, crc, true);
		centralView.setUint32(20, entry.data.length, true);
		centralView.setUint32(24, entry.data.length, true);
		centralView.setUint16(28, name.length, true);
		centralView.setUint16(30, 0, true);
		centralView.setUint16(32, 0, true);
		centralView.setUint16(34, 0, true);
		centralView.setUint16(36, 0, true);
		centralView.setUint32(38, 0, true);
		centralView.setUint32(42, offset, true);
		central.set(name, 46);
		centrals.push(central);
		offset += local.length;
	}
	const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
	const eocd = /* @__PURE__ */ new Uint8Array(22);
	const endView = new DataView(eocd.buffer);
	endView.setUint32(0, 101010256, true);
	endView.setUint16(4, 0, true);
	endView.setUint16(6, 0, true);
	endView.setUint16(8, entries.length, true);
	endView.setUint16(10, entries.length, true);
	endView.setUint32(12, centralSize, true);
	endView.setUint32(16, offset, true);
	endView.setUint16(20, 0, true);
	const out = new Uint8Array(offset + centralSize + eocd.length);
	let pointer = 0;
	for (const part of locals) {
		out.set(part, pointer);
		pointer += part.length;
	}
	for (const part of centrals) {
		out.set(part, pointer);
		pointer += part.length;
	}
	out.set(eocd, pointer);
	return out;
}
async function inflateRaw(data) {
	const copy = new ArrayBuffer(data.byteLength);
	new Uint8Array(copy).set(data);
	const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
	const buffer = await new Response(stream).arrayBuffer();
	return new Uint8Array(buffer);
}
async function unzip(buffer) {
	const bytes = new Uint8Array(buffer);
	const view = new DataView(buffer);
	let eocd = -1;
	const lower = Math.max(0, bytes.length - 22 - 65536);
	for (let index = bytes.length - 22; index >= lower; index -= 1) if (view.getUint32(index, true) === 101010256) {
		eocd = index;
		break;
	}
	if (eocd < 0) throw new Error("Not a zip archive");
	const count = view.getUint16(eocd + 10, true);
	let pointer = view.getUint32(eocd + 16, true);
	const files = [];
	for (let index = 0; index < count; index += 1) {
		if (pointer + 46 > bytes.length || view.getUint32(pointer, true) !== 33639248) throw new Error("Zip directory is damaged");
		const method = view.getUint16(pointer + 10, true);
		const compressedSize = view.getUint32(pointer + 20, true);
		const nameLength = view.getUint16(pointer + 28, true);
		const extraLength = view.getUint16(pointer + 30, true);
		const commentLength = view.getUint16(pointer + 32, true);
		const localOffset = view.getUint32(pointer + 42, true);
		const name = new TextDecoder().decode(bytes.subarray(pointer + 46, pointer + 46 + nameLength));
		pointer += 46 + nameLength + extraLength + commentLength;
		if (!name || name.endsWith("/")) continue;
		if (localOffset + 30 > bytes.length || view.getUint32(localOffset, true) !== 67324752) throw new Error("Zip entry is damaged");
		const localNameLength = view.getUint16(localOffset + 26, true);
		const localExtraLength = view.getUint16(localOffset + 28, true);
		const dataStart = localOffset + 30 + localNameLength + localExtraLength;
		const compressed = bytes.subarray(dataStart, dataStart + compressedSize);
		let data;
		if (method === 0) data = new Uint8Array(compressed);
		else if (method === 8) data = await inflateRaw(compressed);
		else throw new Error(`Unsupported zip compression (${method})`);
		files.push({
			path: normalizePath(name),
			data
		});
	}
	return files;
}
var MAX_FILE = 33554432;
var MAX_PROJECT = 83886080;
function assertLimits(files) {
	let total = 0;
	for (const file of files) {
		if (file.data.byteLength > MAX_FILE) throw new Error(`${file.path} is larger than 32 MB`);
		total += file.data.byteLength;
	}
	if (total > MAX_PROJECT) throw new Error("Project is larger than 80 MB");
}
async function toStored(path, blob, typeHint = "") {
	const data = new Uint8Array(await blob.arrayBuffer());
	const normalized = normalizePath(path);
	return {
		path: normalized,
		mime: guessMime(normalized, typeHint || blob.type),
		data
	};
}
async function filesFromList(list) {
	const stripped = stripCommonRoot((await Promise.all(Array.from(list).map(async (file) => toStored(file.webkitRelativePath || file.name, file, file.type)))).filter((file) => file.path && !file.path.endsWith("/")));
	assertLimits(stripped);
	return stripped;
}
function fileFromEntry(entry) {
	return new Promise((resolve, reject) => {
		entry.file(resolve, () => reject(/* @__PURE__ */ new Error(`Could not read ${entry.name}`)));
	});
}
function readEntries(reader) {
	return new Promise((resolve, reject) => {
		const all = [];
		const read = () => {
			reader.readEntries((batch) => {
				if (batch.length === 0) resolve(all);
				else {
					all.push(...batch);
					read();
				}
			}, () => reject(/* @__PURE__ */ new Error("Could not read a folder")));
		};
		read();
	});
}
async function walk(entry, path, out) {
	if (entry.isFile) {
		const file = await fileFromEntry(entry);
		out.push(await toStored(path, file, file.type));
		return;
	}
	if (!entry.isDirectory) return;
	const children = await readEntries(entry.createReader());
	for (const child of children) await walk(child, `${path}/${child.name}`, out);
}
async function filesFromDataTransfer(transfer) {
	const entries = [];
	for (const item of Array.from(transfer.items)) {
		const entry = item.webkitGetAsEntry?.();
		if (entry) entries.push(entry);
	}
	if (entries.length === 0) return filesFromList(transfer.files);
	const collected = [];
	for (const entry of entries) await walk(entry, entry.name, collected);
	const stripped = stripCommonRoot(collected.filter((file) => file.path));
	assertLimits(stripped);
	return stripped;
}
function parseManifest(text) {
	try {
		const value = JSON.parse(text);
		if (!value || typeof value !== "object") return null;
		return value;
	} catch {
		return null;
	}
}
async function bundleFromFiles(files) {
	const manifestFile = files.find((file) => file.path === "html-runtime.json");
	const manifest = manifestFile ? parseManifest(decodeText(manifestFile.data)) : null;
	const projectFiles = files.filter((file) => file.path !== "html-runtime.json");
	if (projectFiles.length === 0) throw new Error("No HTML files found");
	const html = projectFiles.find((file) => /\.html?$/i.test(file.path) && file.path === (manifest?.entry ?? file.path));
	const firstHtml = projectFiles.find((file) => /\.html?$/i.test(file.path));
	let suggested = manifest?.name?.trim() || "";
	if (!suggested && firstHtml) suggested = titleFromHtml(decodeText(firstHtml.data)) ?? "";
	if (!suggested) {
		const stem = (html ?? firstHtml)?.path.split("/").pop()?.replace(/\.html?$/i, "") ?? "Project";
		suggested = stem === "index" ? "Untitled" : stem;
	}
	if (!projectFiles.some((file) => /\.html?$/i.test(file.path)) && !manifest) throw new Error("Choose an HTML file or a folder that contains one");
	return {
		files: projectFiles,
		manifest,
		suggestedName: suggested
	};
}
async function bundleFromZip(buffer) {
	const files = stripCommonRoot((await unzip(buffer)).map((file) => ({
		path: file.path,
		mime: guessMime(file.path),
		data: file.data
	})));
	assertLimits(files);
	return bundleFromFiles(files);
}
function manifestPermissions(manifest) {
	return {
		...DEFAULT_PERMISSIONS,
		...manifest?.permissions
	};
}
function indexFiles(files) {
	return files.map((file) => ({
		path: file.path,
		mime: file.mime,
		bytes: file.data.byteLength
	})).sort((a, b) => a.path.localeCompare(b.path));
}
function detectEntry(files, preferred) {
	if (preferred && files.some((file) => file.path === preferred)) return preferred;
	const html = files.filter((file) => /\.html?$/i.test(file.path));
	const rootIndex = html.find((file) => /^index\.html?$/i.test(file.path));
	if (rootIndex) return rootIndex.path;
	const nestedIndex = html.find((file) => /(^|\/)index\.html?$/i.test(file.path));
	if (nestedIndex) return nestedIndex.path;
	return html[0]?.path ?? files[0]?.path ?? "index.html";
}
function uniqueRoot(projects, name) {
	const base = `/sdcard/HTMLRuntime/${safeName(name)}`;
	if (!projects.some((project) => project.rootPath === base)) return base;
	let suffix = 2;
	while (projects.some((project) => project.rootPath === `${base}-${suffix}`)) suffix += 1;
	return `${base}-${suffix}`;
}
function makeProject(options) {
	const now = Date.now();
	const name = options.name.trim() || "Untitled";
	return {
		id: newId(),
		name,
		iconDataUrl: null,
		entry: detectEntry(options.files, options.entry),
		rootPath: options.rootPath ?? uniqueRoot(options.projects ?? [], name),
		files: indexFiles(options.files),
		pinned: false,
		installed: false,
		createdAt: now,
		updatedAt: now,
		lastOpenedAt: null,
		permissions: {
			...DEFAULT_PERMISSIONS,
			...options.permissions
		},
		orientation: "auto",
		storage: {},
		cookies: ""
	};
}
function findByPath(projects, raw) {
	const full = normalizeUserPath(raw);
	for (const project of projects) {
		if (normalizeUserPath(projectDisplayPath(project)) === full) return {
			project,
			entry: project.entry
		};
		const root = project.rootPath.replace(/\/+$/, "") || "/";
		if (full === root) return {
			project,
			entry: project.entry
		};
		if (full.startsWith(`${root}/`)) {
			const relative = normalizePath(full.slice(root.length + 1));
			if (project.files.some((file) => file.path === relative)) return {
				project,
				entry: /\.html?$/i.test(relative) ? relative : project.entry
			};
		}
	}
	return null;
}
function sortProjects(projects) {
	return [...projects].sort((a, b) => {
		if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
		const at = a.lastOpenedAt ?? a.updatedAt;
		return (b.lastOpenedAt ?? b.updatedAt) - at;
	});
}
function textFile(path, text) {
	return {
		path,
		mime: guessMime(path),
		data: new TextEncoder().encode(text)
	};
}
function toneWav() {
	const sampleRate = 8e3;
	const count = Math.floor(sampleRate * .25);
	const data = /* @__PURE__ */ new Uint8Array(2044);
	const view = new DataView(data.buffer);
	const write = (offset, value) => {
		for (let index = 0; index < value.length; index += 1) data[offset + index] = value.charCodeAt(index);
	};
	write(0, "RIFF");
	view.setUint32(4, 2036, true);
	write(8, "WAVE");
	write(12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate, true);
	view.setUint16(32, 1, true);
	view.setUint16(34, 8, true);
	write(36, "data");
	view.setUint32(40, count, true);
	for (let index = 0; index < count; index += 1) {
		const sample = Math.sin(2 * Math.PI * 440 * index / sampleRate);
		data[44 + index] = 128 + Math.round(sample * 48);
	}
	return data;
}
var INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Engine self-test</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <p class="kicker">HTML RUNTIME</p>
    <h1>Engine self-test</h1>
    <p id="status">Booting</p>
    <section class="row">
      <button id="inc" type="button">Increment</button>
      <output id="count">0</output>
    </section>
    <canvas id="plane" width="640" height="160"></canvas>
    <canvas id="gl" width="640" height="140"></canvas>
    <section class="assets">
      <img id="mark" alt="Local SVG asset" src="assets/mark.svg">
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle></svg>
      <span id="drag" class="chip">Drag</span>
    </section>
    <form id="note">
      <label>Field <input name="q" id="field" autocomplete="off"></label>
      <button type="submit">Store field</button>
    </form>
    <p id="saved"></p>
    <section class="row">
      <button id="json" type="button">Fetch local JSON</button>
      <button id="ext" type="button">Try external fetch</button>
      <button id="tone" type="button">Play tone</button>
    </section>
    <pre id="out"></pre>
    <p><a href="page2.html">Open linked page</a></p>
    <audio id="audio" src="assets/tone.wav" preload="auto"></audio>
  </main>
  <script src="app.js"><\/script>
</body>
</html>
`;
var PAGE2 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Linked page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <p class="kicker">RELATIVE LINK</p>
    <h1>Linked page</h1>
    <p id="seen">Reading storage…</p>
    <p><a href="index.html">Return to self-test</a></p>
  </main>
  <script>
    var count = localStorage.getItem("count");
    var note = localStorage.getItem("note");
    var session = sessionStorage.getItem("boot");
    document.getElementById("seen").textContent =
      "count=" + count + "  note=" + (note || "—") + "  session=" + session;
    console.log("Linked page read project storage");
  <\/script>
</body>
</html>
`;
var CSS = `:root { color-scheme: dark; }
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #101416;
  color: #e7eeea;
  font: 16px/1.45 ui-monospace, "IBM Plex Mono", monospace;
}
main { padding: 20px 16px 32px; max-width: 720px; }
.kicker { margin: 0; letter-spacing: 0.16em; color: #3ddc84; font-size: 12px; }
h1 { margin: 6px 0 8px; font: 600 28px/1.15 system-ui, sans-serif; letter-spacing: -0.03em; }
#status { color: #8d9994; margin-top: 0; }
button, input {
  font: inherit;
  color: inherit;
  background: #1e2529;
  border: 1px solid #2c353a;
  border-radius: 10px;
  min-height: 44px;
  padding: 0 12px;
}
button { cursor: pointer; }
#inc { background: #3ddc84; color: #05210f; border-color: #3ddc84; font-weight: 600; }
output { padding: 0 8px; color: #3ddc84; }
.row, .assets { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 12px 0; }
canvas { width: 100%; height: auto; background: #0e1214; border: 1px solid #2c353a; border-radius: 12px; display: block; margin-top: 8px; }
img { width: 36px; height: 36px; }
svg { fill: none; stroke: #3ddc84; stroke-width: 1.5; }
.chip { border: 1px dashed #3ddc84; color: #3ddc84; border-radius: 999px; padding: 8px 12px; touch-action: none; }
form { display: flex; flex-wrap: wrap; gap: 8px; align-items: end; }
label { display: grid; gap: 4px; font-size: 12px; color: #8d9994; }
pre { white-space: pre-wrap; color: #e6b450; min-height: 1.4em; }
a { color: #3ddc84; }
`;
var APP_JS = `var count = Number(localStorage.getItem("count") || "0");
var statusEl = document.getElementById("status");
var countEl = document.getElementById("count");
var outEl = document.getElementById("out");
sessionStorage.setItem("boot", "ok");
console.log("Self-test script running");

function paint() {
  countEl.textContent = String(count);
  var canvas = document.getElementById("plane");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#143026";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var bars = 16;
  for (var i = 0; i < bars; i++) {
    var h = 24 + ((i * 17 + count * 13) % 110);
    ctx.fillStyle = i === count % bars ? "#3ddc84" : "#1e2529";
    ctx.fillRect(16 + i * 38, canvas.height - 16 - h, 26, h);
  }
}

function paintGl() {
  var canvas = document.getElementById("gl");
  var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) {
    statusEl.textContent = "WebGL unavailable";
    return;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.055, 0.07, 0.08, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }");
  gl.compileShader(vs);
  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, "precision mediump float; void main(){ gl_FragColor = vec4(0.24, 0.86, 0.52, 1.0); }");
  gl.compileShader(fs);
  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.8,-0.6, 0.85,-0.15, -0.2,0.75]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  console.log("WebGL triangle drawn");
}

function render() {
  paint();
  statusEl.textContent = "Interactive document running offline";
}

document.getElementById("inc").addEventListener("click", function () {
  count += 1;
  localStorage.setItem("count", String(count));
  render();
});

document.getElementById("note").addEventListener("submit", function (event) {
  event.preventDefault();
  var value = document.getElementById("field").value;
  localStorage.setItem("note", value);
  document.getElementById("saved").textContent = "Stored note: " + value;
});

document.getElementById("json").addEventListener("click", function () {
  fetch("assets/data.json").then(function (res) { return res.json(); }).then(function (data) {
    outEl.textContent = JSON.stringify(data);
    console.log("Local JSON fetched");
  }).catch(function (error) {
    outEl.textContent = String(error);
  });
});

document.getElementById("ext").addEventListener("click", function () {
  fetch("https://example.com/").then(function () {
    outEl.textContent = "External fetch was allowed";
    console.warn("External request completed");
  }).catch(function () {
    outEl.textContent = "External request blocked";
  });
});

document.getElementById("tone").addEventListener("click", function () {
  var audio = document.getElementById("audio");
  audio.currentTime = 0;
  audio.play().catch(function (error) {
    outEl.textContent = "Audio: " + error.message;
  });
});

var drag = document.getElementById("drag");
drag.addEventListener("pointerdown", function (event) {
  drag.setPointerCapture(event.pointerId);
  drag.dataset.dx = String(event.clientX - drag.offsetLeft);
  drag.dataset.dy = String(event.clientY - drag.offsetTop);
});
drag.addEventListener("pointermove", function (event) {
  if (!drag.hasPointerCapture(event.pointerId)) return;
  drag.style.position = "relative";
  drag.style.left = (event.clientX - Number(drag.dataset.dx) - drag.parentElement.offsetLeft) + "px";
});

var mark = document.getElementById("mark");
mark.addEventListener("load", function () {
  console.log("SVG asset loaded");
});
mark.addEventListener("error", function () {
  console.error("assets/mark.svg failed");
});

render();
paintGl();
console.log("Self-test ready");
`;
var MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#143026"/>
  <path d="M18 40 L32 16 L46 40" fill="none" stroke="#3ddc84" stroke-width="4"/>
  <path d="M24 40 H40" stroke="#e7eeea" stroke-width="4"/>
</svg>`;
function selfTestFiles() {
	return [
		textFile("index.html", INDEX_HTML),
		textFile("page2.html", PAGE2),
		textFile("style.css", CSS),
		textFile("app.js", APP_JS),
		textFile("assets/mark.svg", MARK),
		textFile("assets/data.json", JSON.stringify({
			ok: true,
			engine: "html-runtime",
			assets: 6
		}, null, 2)),
		{
			path: "assets/tone.wav",
			mime: "audio/wav",
			data: toneWav()
		}
	];
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Button({ variant = "surface", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40", variant === "primary" && "bg-accent text-accent-ink", variant === "surface" && "border border-line bg-raised text-fg", variant === "ghost" && "bg-transparent text-fg", variant === "danger" && "bg-danger-dim text-danger", className),
		...props
	});
}
function IconButton({ label, className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		className: cn("grid size-11 shrink-0 place-items-center rounded-control text-fg transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40", className),
		...props,
		children
	});
}
function Sheet({ open, onOpenChange, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-black/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-card border border-line bg-surface focus:outline-none md:inset-x-auto md:left-1/2 md:w-full md:max-w-lg md:-translate-x-1/2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-line px-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-mono text-xs tracking-widest text-muted",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: "grid size-11 place-items-center rounded-control text-muted",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 overflow-y-auto px-4 py-4",
				children
			})]
		})] })
	});
}
function SwitchRow({ label, description, checked, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-start gap-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm",
				children: label
			}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-xs text-muted",
				children: description
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange,
			"aria-label": label,
			className: cn("mt-1 h-7 w-12 shrink-0 rounded-full border border-line bg-inset transition-colors", checked && "border-accent bg-accent"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("block size-5 translate-x-1 rounded-full bg-fg transition-transform", checked && "translate-x-6 bg-accent-ink") })
		})]
	});
}
function TextField({ label, mono, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-2 block font-mono text-xs tracking-widest text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: cn("h-11 w-full rounded-control border border-line bg-inset px-3 text-base text-fg outline-none focus:border-accent", mono && "font-mono text-sm", className),
			...props
		})]
	});
}
function SectionLabel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-1 font-mono text-xs tracking-widest text-muted",
		children
	});
}
function ProjectMark({ name, icon, className }) {
	const letter = (name.trim()[0] || "H").toUpperCase();
	if (icon) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: icon,
		alt: "",
		className: cn("size-11 rounded-control object-cover", className)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid size-11 place-items-center rounded-control bg-accent-dim font-mono text-sm text-accent", className),
		children: letter
	});
}
function StatusLine({ label, value, tone = "fg" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-4 px-4 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: cn("text-right font-mono text-sm", tone === "accent" && "text-accent", tone === "warn" && "text-warn", tone === "fg" && "text-fg"),
			children: value
		})]
	});
}
function fileGlyph(path) {
	const ext = path.split(".").pop()?.toLowerCase() ?? "";
	if (ext === "html" || ext === "htm" || ext === "css" || ext === "js" || ext === "mjs") return FileCode;
	if (ext === "json") return FileJson;
	if ([
		"png",
		"jpg",
		"jpeg",
		"gif",
		"webp",
		"svg",
		"ico"
	].includes(ext)) return FileImage;
	if ([
		"mp3",
		"wav",
		"ogg"
	].includes(ext)) return FileAudio;
	if (["mp4", "webm"].includes(ext)) return FileVideo;
	if (ext === "txt" || ext === "md") return FileText;
	return File;
}
function HomeScreen({ projects, onOpenPath, onImport, onPaste, onOpenProject, onManage, onTogglePin, onSelfTest, onSettings }) {
	const installed = projects.filter((project) => project.installed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between px-4 pt-4 pb-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-widest text-accent",
				children: "SYSTEM"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-mono text-base font-medium tracking-widest",
				children: "HTML RUNTIME"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
				label: "Settings",
				onClick: onSettings,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionRow, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" }),
								accent: true,
								title: "Open HTML",
								detail: "file:///sdcard/…/index.html",
								onClick: onOpenPath
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionRow, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderInput, { className: "size-5" }),
								title: "Import project",
								detail: "Folder, HTML file, or zip",
								onClick: onImport
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionRow, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardPaste, { className: "size-5" }),
								title: "Paste HTML",
								detail: "Raw document, then launch",
								onClick: onPaste
							})
						]
					}),
					installed.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "INSTALLED" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-3 overflow-x-auto pb-1",
							children: installed.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onOpenProject(project, "app"),
								className: "flex w-20 shrink-0 flex-col items-center gap-2 active:scale-[0.96]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectMark, {
									name: project.name,
									icon: project.iconDataUrl,
									className: "size-14 rounded-card text-base"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-full truncate text-center text-xs",
									children: project.name
								})]
							}, project.id))
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "RECENT PROJECTS" }), projects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-card border border-dashed border-line px-4 py-6 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: "No projects yet"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Open a path, import a folder, or paste HTML."
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "overflow-hidden rounded-card border border-line bg-surface",
							children: projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "border-b border-line last:border-b-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 pr-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => onOpenProject(project, "run"),
											className: "flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectMark, {
												name: project.name,
												icon: project.iconDataUrl
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "truncate text-sm font-medium",
															children: project.name
														}), project.installed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-mono text-xs text-accent",
															children: "APP"
														}) : null]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "mt-0.5 block truncate font-mono text-xs text-muted",
														title: projectDisplayPath(project),
														children: projectDisplayPath(project)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "mt-0.5 block font-mono text-xs text-faint",
														children: [formatBytes(totalBytes(project)), project.lastOpenedAt ? ` · ${formatDistanceToNowStrict(project.lastOpenedAt, { addSuffix: true })}` : ""]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
											label: project.pinned ? "Unpin project" : "Pin project",
											onClick: () => onTogglePin(project),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: project.pinned ? "size-4 text-accent" : "size-4 text-faint" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
											label: `Manage ${project.name}`,
											onClick: () => onManage(project),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-faint" })
										})
									]
								})
							}, project.id))
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-hidden rounded-card border border-line bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b border-line px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-mono text-xs tracking-widest text-muted",
							children: "RUNTIME"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onSelfTest,
							className: "font-mono text-xs text-accent",
							children: "SELF-TEST"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusLine, {
							label: "Engine",
							value: "WebView"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusLine, {
							label: "Network",
							value: "OFFLINE",
							tone: "accent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusLine, {
							label: "JavaScript",
							value: "ENABLED"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusLine, {
							label: "Storage",
							value: "ENABLED"
						})
					] })]
				})
			})]
		})]
	});
}
function ActionRow({ icon, title, detail, onClick, accent = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex w-full items-center gap-3 rounded-card border border-line bg-surface px-3 py-3 text-left transition-transform duration-150 ease-out active:scale-[0.96]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: accent ? "grid size-11 place-items-center rounded-control bg-accent text-accent-ink" : "grid size-11 place-items-center rounded-control bg-raised text-fg",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate font-mono text-xs text-muted",
					children: detail
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-faint" })
		]
	});
}
function PasteView({ onBack, onLaunch }) {
	const [name, setName] = (0, import_react.useState)("");
	const [html, setHtml] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center gap-1 border-b border-line px-1 py-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
					label: "Back",
					onClick: onBack,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "min-w-0 flex-1 truncate font-mono text-xs tracking-widest text-muted",
					children: "PASTE HTML"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "primary",
					className: "mr-2",
					onClick: () => onLaunch(name, html),
					children: "Launch"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-3 px-4 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
				label: "NAME",
				value: name,
				placeholder: "Untitled",
				onChange: (event) => setName(event.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-2 font-mono text-xs tracking-widest text-muted",
					children: "SOURCE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: html,
					onChange: (event) => setHtml(event.target.value),
					spellCheck: false,
					placeholder: "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Untitled</title>\n</head>\n<body>\n</body>\n</html>",
					className: "min-h-64 w-full flex-1 resize-none rounded-card border border-line bg-inset p-3 font-mono text-sm text-fg outline-none focus:border-accent"
				})]
			})]
		})]
	});
}
/** Injected into every sandboxed document before user scripts. PAYLOAD is in scope. */
var PRELUDE_JS = `
var files = Object.create(null);
var srcFiles = PAYLOAD.files || {};
Object.keys(srcFiles).forEach(function (key) { files[key] = srcFiles[key]; });
var pageSet = Object.create(null);
(PAYLOAD.pages || []).forEach(function (page) { pageSet[page] = 1; });
var root = String(PAYLOAD.root || "").replace(/^\\/+/, "").replace(/\\/+$/, "");
var network = !!(PAYLOAD.permissions && PAYLOAD.permissions.network);
var clipboardOK = !!(PAYLOAD.permissions && PAYLOAD.permissions.clipboard);
var locationOK = !!(PAYLOAD.permissions && PAYLOAD.permissions.location);
var notificationsOK = !!(PAYLOAD.permissions && PAYLOAD.permissions.notifications);
var cameraOK = !!(PAYLOAD.permissions && PAYLOAD.permissions.camera);
var micOK = !!(PAYLOAD.permissions && PAYLOAD.permissions.microphone);
var cookieJar = String(PAYLOAD.cookies || "");
var seq = 1;
var waiters = new Map();

function post(msg) {
  try { parent.postMessage(Object.assign({ source: "htmlrt" }, msg), "*"); } catch (err) {}
}

function ser(value, depth) {
  if (depth === undefined) depth = 0;
  if (value instanceof Error) return String(value.stack || value.message).slice(0, 2000);
  if (typeof value === "string") return value.slice(0, 2000);
  if (typeof value === "bigint") return value.toString() + "n";
  if (value == null || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "function") return "[function]";
  if (depth > 2) return "[object]";
  try {
    if (Array.isArray(value)) return value.slice(0, 20).map(function (item) { return ser(item, depth + 1); });
    var out = {};
    Object.keys(value).slice(0, 20).forEach(function (key) { out[key] = ser(value[key], depth + 1); });
    return out;
  } catch (err) {
    return String(value).slice(0, 500);
  }
}

["log", "info", "warn", "error", "debug"].forEach(function (level) {
  var orig = console[level] ? console[level].bind(console) : console.log.bind(console);
  console[level] = function () {
    var args = Array.prototype.slice.call(arguments).map(function (item) { return ser(item); });
    var message = args.map(function (item) {
      return typeof item === "string" ? item : JSON.stringify(item);
    }).join(" ");
    post({ type: "console", level: level === "log" ? "info" : level, message: message });
    return orig.apply(null, arguments);
  };
});

window.addEventListener("error", function (event) {
  var src = String(event.filename || "").split("/").pop();
  post({
    type: "error",
    level: "error",
    message: (src ? src + ":" + (event.lineno || 0) + " " : "") + (event.message || "Script error")
  });
});
window.addEventListener("unhandledrejection", function (event) {
  post({ type: "error", level: "error", message: "Unhandled rejection: " + ser(event.reason) });
});
window.addEventListener("securitypolicyviolation", function (event) {
  post({
    type: "net",
    method: "GET",
    url: event.blockedURI || "",
    status: "blocked",
    detail: "CSP " + event.violatedDirective
  });
});

function makeStore(initial, kind) {
  var mem = new Map();
  Object.keys(initial || {}).forEach(function (key) { mem.set(String(key), String(initial[key])); });
  function dump() {
    var obj = {};
    mem.forEach(function (value, key) { obj[key] = value; });
    return obj;
  }
  function persist() {
    post(kind === "local" ? { type: "storage", storage: dump() } : { type: "session", session: dump() });
  }
  var api = {
    get length() { return mem.size; },
    key: function (index) { return Array.from(mem.keys())[index] || null; },
    getItem: function (key) { key = String(key); return mem.has(key) ? mem.get(key) : null; },
    setItem: function (key, value) { mem.set(String(key), String(value)); persist(); },
    removeItem: function (key) { mem.delete(String(key)); persist(); },
    clear: function () { mem.clear(); persist(); },
    exportState: dump
  };
  return new Proxy(api, {
    get: function (target, prop) {
      if (prop in target || typeof prop === "symbol") return target[prop];
      return target.getItem(prop);
    },
    set: function (target, prop, value) {
      target.setItem(prop, value);
      return true;
    },
    deleteProperty: function (target, prop) {
      target.removeItem(prop);
      return true;
    },
    ownKeys: function () { return Array.from(mem.keys()); },
    getOwnPropertyDescriptor: function (target, prop) {
      if (mem.has(String(prop))) return { configurable: true, enumerable: true, value: mem.get(String(prop)) };
      return undefined;
    }
  });
}

var localApi = makeStore(PAYLOAD.storage, "local");
var sessionApi = makeStore(PAYLOAD.session, "session");
function shadowStorage(name, api) {
  try {
    Object.defineProperty(window, name, { configurable: true, get: function () { return api; } });
    return window[name] === api;
  } catch (err) {
    return false;
  }
}
if (!shadowStorage("localStorage", localApi) || !shadowStorage("sessionStorage", sessionApi)) {
  try { window.localStorage = localApi; } catch (err) {}
  try { window.sessionStorage = sessionApi; } catch (err) {}
}

function mergeCookie(existing, assignment) {
  var pair = String(assignment).split(";")[0];
  var eq = pair.indexOf("=");
  if (eq < 1) return existing;
  var name = pair.slice(0, eq).trim();
  var value = pair.slice(eq + 1).trim();
  var map = new Map();
  String(existing || "").split(";").forEach(function (part) {
    var i = part.indexOf("=");
    if (i > 0) map.set(part.slice(0, i).trim(), part.slice(i + 1).trim());
  });
  if (!value || /max-age=0/i.test(assignment) || /expires=Thu, 01 Jan 1970/i.test(assignment)) map.delete(name);
  else map.set(name, value);
  return Array.from(map.entries()).map(function (entry) { return entry[0] + "=" + entry[1]; }).join("; ");
}
try {
  Object.defineProperty(Document.prototype, "cookie", {
    configurable: true,
    get: function () { return cookieJar; },
    set: function (value) {
      cookieJar = mergeCookie(cookieJar, String(value));
      post({ type: "cookie", cookies: cookieJar });
    }
  });
} catch (err) {}

function localKey(input) {
  try {
    var url = new URL(String(input), document.baseURI);
    if (url.protocol === "data:" || url.protocol === "blob:" || url.protocol === "about:") return null;
    if (url.hostname !== "htmlrt.local") return null;
    var path = decodeURIComponent(url.pathname).replace(/^\\/+/, "");
    if (path.indexOf("virtual/") === 0) path = path.slice("virtual/".length);
    else if (root && path.indexOf(root + "/") === 0) path = path.slice(root.length + 1);
    else if (root && path === root) path = PAYLOAD.entry || "index.html";
    var parts = [];
    path.split("/").forEach(function (seg) {
      if (!seg || seg === ".") return;
      if (seg === "..") parts.pop();
      else parts.push(seg);
    });
    return parts.join("/");
  } catch (err) {
    return null;
  }
}

function isExternalUrl(input) {
  try {
    var url = new URL(String(input), document.baseURI);
    if (url.protocol === "data:" || url.protocol === "blob:" || url.protocol === "about:") return false;
    if (url.hostname === "htmlrt.local") return false;
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ws:" || url.protocol === "wss:";
  } catch (err) {
    return false;
  }
}

function resolveLocal(input) {
  var key = localKey(input);
  if (key == null) return { kind: "other" };
  if (Object.prototype.hasOwnProperty.call(files, key)) return { kind: "file", key: key, data: files[key] };
  if (Object.prototype.hasOwnProperty.call(files, key + "/index.html")) {
    return { kind: "file", key: key + "/index.html", data: files[key + "/index.html"] };
  }
  return { kind: "missing", key: key };
}

function rewriteAttr(value) {
  if (typeof value !== "string" || !value) return value;
  var resolved = resolveLocal(value);
  if (resolved.kind === "file") return resolved.data;
  if (resolved.kind === "missing") return "data:text/plain,";
  if (isExternalUrl(value) && !network) {
    post({ type: "net", method: "GET", url: value, status: "blocked", detail: "external network blocked" });
    return "data:text/plain,";
  }
  return value;
}

function rewriteSrcset(value) {
  return String(value).split(",").map(function (part) {
    var bits = part.trim().split(/\\s+/);
    if (!bits[0]) return part;
    bits[0] = rewriteAttr(bits[0]);
    return bits.join(" ");
  }).join(", ");
}

function rewriteCssValue(value) {
  return String(value).replace(/url\\(\\s*(['"]?)([^'")]+)\\1\\s*\\)/g, function (all, quote, raw) {
    var next = rewriteAttr(String(raw).trim());
    return next === String(raw).trim() ? all : 'url("' + next + '")';
  });
}

var origFetch = window.fetch ? window.fetch.bind(window) : null;
if (origFetch) {
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || String(input);
    var method = (init && init.method) || "GET";
    var resolved = resolveLocal(url);
    if (resolved.kind === "file") {
      post({ type: "net", method: method, url: resolved.key, status: "local", detail: "local file" });
      return origFetch(resolved.data);
    }
    if (resolved.kind === "missing") {
      post({ type: "net", method: method, url: resolved.key, status: "error", detail: "not in project" });
      return Promise.resolve(new Response("Not found", { status: 404, statusText: "Not Found" }));
    }
    if (isExternalUrl(url) && !network) {
      post({ type: "net", method: method, url: url, status: "blocked", detail: "external network blocked" });
      return Promise.reject(new TypeError("Failed to fetch"));
    }
    if (isExternalUrl(url)) post({ type: "net", method: method, url: url, status: "ok", detail: "external allowed" });
    return origFetch(input, init);
  };
}

var origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
  var resolved = resolveLocal(String(url));
  if (resolved.kind === "file") {
    post({ type: "net", method: method, url: resolved.key, status: "local", detail: "xhr local" });
    return origOpen.call(this, method, resolved.data);
  }
  if (resolved.kind === "missing" || (isExternalUrl(String(url)) && !network)) {
    post({
      type: "net",
      method: method,
      url: resolved.kind === "missing" ? resolved.key : String(url),
      status: resolved.kind === "missing" ? "error" : "blocked",
      detail: resolved.kind === "missing" ? "xhr missing" : "external network blocked"
    });
    return origOpen.call(this, method, "https://htmlrt.invalid/blocked");
  }
  if (isExternalUrl(String(url))) {
    post({ type: "net", method: method, url: String(url), status: "ok", detail: "xhr external" });
  }
  return origOpen.apply(this, arguments);
};

function hookUrlProp(proto, prop) {
  if (!proto) return;
  var desc = Object.getOwnPropertyDescriptor(proto, prop);
  if (!desc || !desc.set || !desc.get) return;
  Object.defineProperty(proto, prop, {
    configurable: true,
    enumerable: desc.enumerable,
    get: function () { return desc.get.call(this); },
    set: function (value) {
      if (typeof value === "string") value = rewriteAttr(value);
      desc.set.call(this, value);
    }
  });
}
hookUrlProp(window.HTMLImageElement && HTMLImageElement.prototype, "src");
hookUrlProp(window.HTMLScriptElement && HTMLScriptElement.prototype, "src");
hookUrlProp(window.HTMLLinkElement && HTMLLinkElement.prototype, "href");
hookUrlProp(window.HTMLMediaElement && HTMLMediaElement.prototype, "src");
hookUrlProp(window.HTMLSourceElement && HTMLSourceElement.prototype, "src");
hookUrlProp(window.HTMLIFrameElement && HTMLIFrameElement.prototype, "src");

var origSetAttribute = Element.prototype.setAttribute;
Element.prototype.setAttribute = function (name, value) {
  var key = String(name).toLowerCase();
  if ((key === "src" || key === "href" || key === "poster" || key === "data") && typeof value === "string") {
    return origSetAttribute.call(this, name, rewriteAttr(value));
  }
  if (key === "srcset" && typeof value === "string") return origSetAttribute.call(this, name, rewriteSrcset(value));
  return origSetAttribute.call(this, name, value);
};

if (window.CSSStyleDeclaration) {
  var origSetProp = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (prop, value, priority) {
    if (typeof value === "string" && value.indexOf("url(") !== -1) value = rewriteCssValue(value);
    return origSetProp.call(this, prop, value, priority);
  };
}

function pageFor(key) {
  if (!key) return null;
  if (pageSet[key]) return key;
  if (pageSet[key + "/index.html"]) return key + "/index.html";
  if (pageSet[key + ".html"]) return key + ".html";
  return null;
}

function navMessage(path) {
  return {
    type: "navigate",
    path: path,
    storage: localApi.exportState(),
    session: sessionApi.exportState(),
    cookies: cookieJar
  };
}

document.addEventListener("click", function (event) {
  var target = event.target;
  if (!target || !target.closest) return;
  var anchor = target.closest("a");
  if (!anchor) return;
  var href = anchor.getAttribute("href");
  if (!href || href.charAt(0) === "#") return;
  var url;
  try { url = new URL(href, document.baseURI); } catch (err) { return; }
  if (url.hostname === "htmlrt.local") {
    event.preventDefault();
    var page = pageFor(localKey(url.href));
    if (page) post(navMessage(page));
    return;
  }
  if (url.protocol === "http:" || url.protocol === "https:") {
    event.preventDefault();
    post({ type: "external", href: url.href });
  }
}, true);

document.addEventListener("submit", function (event) {
  var form = event.target;
  if (!form || form.tagName !== "FORM") return;
  var action = form.getAttribute("action") || "";
  if (!action) return;
  event.preventDefault();
  try {
    var url = new URL(action, document.baseURI);
    if (url.hostname === "htmlrt.local") {
      var page = pageFor(localKey(url.href));
      if (page) post(navMessage(page));
      return;
    }
    post({ type: "external", href: url.href });
  } catch (err) {}
}, true);

try {
  var assign = location.assign.bind(location);
  location.assign = function (url) {
    var parsed = new URL(url, document.baseURI);
    if (parsed.hostname === "htmlrt.local") {
      var page = pageFor(localKey(parsed.href));
      if (page) { post(navMessage(page)); return; }
    }
    if (isExternalUrl(parsed.href)) { post({ type: "external", href: parsed.href }); return; }
    return assign(url);
  };
} catch (err) {}

var OrigWorker = window.Worker;
if (OrigWorker) {
  var WrappedWorker = function (url, opts) {
    var resolved = resolveLocal(String(url));
    if (resolved.kind === "file") return new OrigWorker(dataUrlToBlob(resolved.data), opts);
    if (!network && isExternalUrl(String(url))) {
      post({ type: "net", method: "WORKER", url: String(url), status: "blocked", detail: "worker blocked" });
      throw new DOMException("Worker blocked by HTML Runtime", "SecurityError");
    }
    return new OrigWorker(url, opts);
  };
  WrappedWorker.prototype = OrigWorker.prototype;
  window.Worker = WrappedWorker;
}

function dataUrlToBlob(dataUrl) {
  var comma = dataUrl.indexOf(",");
  var meta = dataUrl.slice(5, comma);
  var body = dataUrl.slice(comma + 1);
  var isB64 = /;base64/i.test(meta);
  var mime = (meta.replace(/;base64/i, "").split(";")[0]) || "application/octet-stream";
  var binary = isB64 ? atob(body) : decodeURIComponent(body);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  var origGum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function (constraints) {
    var c = constraints || {};
    if (c.video && !cameraOK) return Promise.reject(new DOMException("Camera blocked by HTML Runtime", "NotAllowedError"));
    if (c.audio && !micOK) return Promise.reject(new DOMException("Microphone blocked by HTML Runtime", "NotAllowedError"));
    return origGum(constraints);
  };
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition = function (ok, err) {
    if (!locationOK) {
      post({ type: "console", level: "warn", message: "Location blocked" });
      if (err) err({ code: 1, message: "Location blocked by HTML Runtime", PERMISSION_DENIED: 1 });
      return;
    }
    var req = seq++;
    waiters.set(req, { kind: "geo", ok: ok, err: err });
    post({ type: "geo-get", req: req });
  };
  navigator.geolocation.watchPosition = function (ok, err) {
    navigator.geolocation.getCurrentPosition(ok, err);
    return seq;
  };
  navigator.geolocation.clearWatch = function () {};
}

function RuntimeNotification(title, options) {
  this.title = String(title);
  this.body = (options && options.body) || "";
  if (!notificationsOK) {
    post({ type: "console", level: "warn", message: "Notifications blocked" });
    return;
  }
  post({ type: "notify", title: this.title, body: this.body });
}
RuntimeNotification.requestPermission = function () {
  return Promise.resolve(notificationsOK ? "granted" : "denied");
};
RuntimeNotification.permission = notificationsOK ? "granted" : "denied";
window.Notification = RuntimeNotification;

if (navigator.clipboard) {
  navigator.clipboard.writeText = function (text) {
    if (!clipboardOK) return Promise.reject(new DOMException("Clipboard blocked by HTML Runtime", "NotAllowedError"));
    return new Promise(function (resolve, reject) {
      var req = seq++;
      waiters.set(req, { kind: "clip", resolve: resolve, reject: reject });
      post({ type: "clipboard-write", req: req, text: String(text) });
    });
  };
  navigator.clipboard.readText = function () {
    if (!clipboardOK) return Promise.reject(new DOMException("Clipboard blocked by HTML Runtime", "NotAllowedError"));
    return new Promise(function (resolve, reject) {
      var req = seq++;
      waiters.set(req, { kind: "clip", resolve: resolve, reject: reject });
      post({ type: "clipboard-read", req: req });
    });
  };
}

var OrigWebSocket = window.WebSocket;
if (OrigWebSocket) {
  var WrappedSocket = function (url, protocols) {
    if (!network) {
      post({ type: "net", method: "WS", url: String(url), status: "blocked", detail: "websocket blocked" });
      throw new DOMException("WebSocket blocked by HTML Runtime", "SecurityError");
    }
    return protocols === undefined ? new OrigWebSocket(url) : new OrigWebSocket(url, protocols);
  };
  WrappedSocket.prototype = OrigWebSocket.prototype;
  WrappedSocket.CONNECTING = OrigWebSocket.CONNECTING;
  WrappedSocket.OPEN = OrigWebSocket.OPEN;
  WrappedSocket.CLOSING = OrigWebSocket.CLOSING;
  WrappedSocket.CLOSED = OrigWebSocket.CLOSED;
  window.WebSocket = WrappedSocket;
}

if (window.EventSource) {
  var OrigEventSource = EventSource;
  window.EventSource = function (url, config) {
    if (!network && isExternalUrl(String(url))) {
      post({ type: "net", method: "SSE", url: String(url), status: "blocked", detail: "eventsource blocked" });
      throw new DOMException("EventSource blocked by HTML Runtime", "SecurityError");
    }
    return new OrigEventSource(url, config);
  };
}

if (navigator.sendBeacon) {
  var origBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = function (url, data) {
    if (!network && isExternalUrl(String(url))) {
      post({ type: "net", method: "BEACON", url: String(url), status: "blocked", detail: "beacon blocked" });
      return false;
    }
    return origBeacon(url, data);
  };
}

var moduleUrls = Object.create(null);
if (PAYLOAD.modules && PAYLOAD.modules.length) {
  var imports = {};
  PAYLOAD.modules.forEach(function (mod) {
    var blob = new Blob([mod.code], { type: "text/javascript" });
    var url = URL.createObjectURL(blob);
    moduleUrls[mod.path] = url;
    imports["https://htmlrt.local/virtual/" + mod.path] = url;
  });
  var importMap = document.createElement("script");
  importMap.type = "importmap";
  importMap.textContent = JSON.stringify({ imports: imports });
  (document.head || document.documentElement).appendChild(importMap);
}

window.__htmlrtBootModules = function (list) {
  var index = 0;
  var step = function () {
    if (index >= list.length) return;
    var path = list[index++];
    var old = document.querySelector('[data-htmlrt-module="' + CSS.escape(path) + '"]');
    var script = document.createElement("script");
    script.type = "module";
    script.src = moduleUrls[path];
    script.onload = step;
    script.onerror = function () {
      post({ type: "error", level: "error", message: path + " failed to load" });
      step();
    };
    if (old && old.parentNode) {
      old.parentNode.insertBefore(script, old);
      old.parentNode.removeChild(old);
    } else {
      (document.body || document.documentElement).appendChild(script);
    }
  };
  step();
};

window.addEventListener("message", function (event) {
  var data = event.data;
  if (!data || data.source !== "htmlrt-host") return;
  var waiter = waiters.get(data.req);
  if (!waiter) return;
  waiters.delete(data.req);
  if (data.type === "clipboard-result") {
    if (data.error) waiter.reject(new DOMException(data.error, "NotAllowedError"));
    else waiter.resolve(data.text || "");
  }
  if (data.type === "geo-result") {
    if (data.error) {
      if (waiter.err) waiter.err({ code: 1, message: data.error, PERMISSION_DENIED: 1 });
    } else if (waiter.ok) {
      waiter.ok({
        coords: {
          latitude: data.coords.lat,
          longitude: data.coords.lon,
          accuracy: data.coords.acc || 0,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      });
    }
  }
});

post({ type: "ready" });
`;
function log(logs, level, message) {
	if (logs.length > 100) return;
	logs.push({
		id: nid(),
		t: Date.now(),
		level,
		message
	});
}
function lookup(map, path) {
	const normalized = normalizePath(path);
	const direct = map.get(normalized);
	if (direct) return direct;
	const lower = normalized.toLowerCase();
	for (const [key, file] of map) if (key.toLowerCase() === lower) return file;
}
function safeScript(code) {
	return code.replace(/<\/script/gi, "<\\/script");
}
function rewriteImports(code, fromFile) {
	return code.replace(/(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"]+)\2/g, (full, lead, quote, spec) => {
		if (!spec.startsWith(".") && !spec.startsWith("/")) return full;
		const resolved = resolveSpec(fromFile, spec);
		if (!resolved) return full;
		return `${lead}${quote}https://htmlrt.local/virtual/${resolved}${quote}`;
	});
}
function rewriteCssUrls(css, fromFile, map, logs, network) {
	return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (full, _quote, raw) => {
		const spec = String(raw).trim();
		const resolved = resolveSpec(fromFile, spec);
		if (!resolved) {
			if (!network && isExternalSpec(spec)) {
				log(logs, "warn", `External request blocked: ${spec}`);
				return "url(\"data:text/plain,\")";
			}
			return full;
		}
		const file = lookup(map, resolved);
		if (!file) {
			log(logs, "warn", `Missing asset ${resolved}`);
			return "url(\"data:text/plain,\")";
		}
		return `url("${toDataUrl(file.mime, file.data)}")`;
	});
}
function expandCss(css, fromFile, map, stack, logs, network) {
	return rewriteCssUrls(css.replace(/@import\s+(?:url\(\s*)?(['"]?)([^'")\s]+)\1\s*\)?[^;]*;/g, (full, _quote, spec) => {
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
	}), fromFile, map, logs, network);
}
function dataUrlFor(spec, fromFile, map, logs, network) {
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
function rewriteSrcset(value, fromFile, map, logs, network) {
	return value.split(",").map((part) => {
		const bits = part.trim().split(/\s+/);
		const url = bits[0];
		if (!url) return part.trim();
		const mapped = dataUrlFor(url, fromFile, map, logs, network);
		if (mapped) bits[0] = mapped;
		return bits.join(" ");
	}).join(", ");
}
function buildCsp(network) {
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
		"form-action https://htmlrt.local"
	].join("; ");
}
function baseHref(rootPath, entry) {
	const path = [rootPath.replace(/^\/+/, "").replace(/\/+$/, ""), dirname(entry)].filter(Boolean).join("/");
	return `https://htmlrt.local/${path}${path ? "/" : ""}`;
}
function errorDocument(message) {
	return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#101416;color:#e7eeea;font:16px/1.5 ui-monospace,monospace;padding:24px"><p style="color:#ff6b6b;letter-spacing:.14em;font-size:12px">RUNTIME</p><p>${message.replace(/[&<>]/g, (char) => ({
		"&": "&",
		"<": "<",
		">": ">"
	})[char] ?? char)}</p></body></html>`;
}
function isJsType(type) {
	const value = type.toLowerCase().trim();
	return !value || value === "module" || value === "text/javascript" || value === "application/javascript" || value === "text/ecmascript" || value === "application/ecmascript";
}
function ensure(doc, tag) {
	const found = doc.querySelector(tag);
	if (found) return found;
	const el = doc.createElement(tag);
	doc.documentElement.appendChild(el);
	return el;
}
function compileDocument(input) {
	const logs = [];
	const entry = normalizePath(input.entry);
	const fileMap = /* @__PURE__ */ new Map();
	for (const file of input.files) {
		const path = normalizePath(file.path);
		fileMap.set(path, {
			...file,
			path
		});
	}
	const entryFile = lookup(fileMap, entry);
	log(logs, "info", `Loading ${entry}`);
	if (!entryFile) {
		log(logs, "error", `Entry not found: ${entry}`);
		return {
			html: errorDocument(`Entry not found: ${entry}`),
			logs
		};
	}
	const network = input.permissions.network;
	const doc = new DOMParser().parseFromString(decodeText(entryFile.data), "text/html");
	const head = ensure(doc, "head");
	const body = ensure(doc, "body");
	for (const base of Array.from(doc.querySelectorAll("base"))) base.remove();
	for (const style of Array.from(doc.querySelectorAll("style"))) style.textContent = expandCss(style.textContent ?? "", entry, fileMap, /* @__PURE__ */ new Set([entry]), logs, network);
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
			style.textContent = expandCss(decodeText(file.data), file.path, fileMap, /* @__PURE__ */ new Set([file.path]), logs, network);
			link.replaceWith(style);
			continue;
		}
		const mapped = dataUrlFor(href, entry, fileMap, logs, network);
		if (mapped) link.setAttribute("href", mapped);
	}
	const boot = [];
	const tail = [];
	for (const script of Array.from(doc.querySelectorAll("script"))) {
		const type = script.getAttribute("type") || "";
		if (!isJsType(type)) continue;
		const src = script.getAttribute("src");
		if (!src) {
			if ((type || "").toLowerCase() === "module" || looksLikeModule(script.textContent || "")) {
				script.textContent = safeScript(rewriteImports(script.textContent || "", entry));
				if (!script.getAttribute("type")) script.setAttribute("type", "module");
			} else script.textContent = safeScript(script.textContent || "");
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
		if (type.toLowerCase() === "module" || file.path.endsWith(".mjs") || looksLikeModule(code)) {
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
		} else script.replaceWith(inline);
	}
	for (const el of Array.from(doc.querySelectorAll("img, video, audio, source, embed, track, object, iframe, image, use"))) {
		for (const attr of [
			"src",
			"href",
			"poster",
			"data",
			"xlink:href"
		]) {
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
	const filesPayload = {};
	const modules = [];
	const pages = [];
	for (const file of fileMap.values()) {
		filesPayload[file.path] = toDataUrl(file.mime, file.data);
		if (/\.html?$/i.test(file.path)) pages.push(file.path);
		if (!isTextualMime(file.mime)) continue;
		if (!/\.(mjs|js|cjs)$/i.test(file.path)) continue;
		const code = decodeText(file.data);
		if (file.path.endsWith(".mjs") || looksLikeModule(code)) modules.push({
			path: file.path,
			code: rewriteImports(code, file.path)
		});
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
		modules
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
	return {
		html: `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`,
		logs
	};
}
function allowAttribute(permissions) {
	const parts = [];
	if (permissions.camera) parts.push("camera");
	if (permissions.microphone) parts.push("microphone");
	if (permissions.location) parts.push("geolocation");
	if (permissions.clipboard) parts.push("clipboard-read", "clipboard-write");
	return parts.join("; ");
}
var TABS = [
	"Console",
	"Network",
	"Storage",
	"Files",
	"Source",
	"Info"
];
function DevPanel({ project, files, entry, logs, net, zoom, developer, onClose, onEnableDeveloper, onReload, onClearCache, onClearStorage, onClearLogs, onSaveFile }) {
	const [tab, setTab] = (0, import_react.useState)("Console");
	const [selected, setSelected] = (0, import_react.useState)(entry);
	const file = files.find((item) => item.path === selected) ?? files.find((item) => item.path === entry);
	const text = file && isTextualMime(file.mime) ? decodeText(file.data) : "";
	const [draft, setDraft] = (0, import_react.useState)(null);
	const shown = draft ?? text;
	const binary = file ? !isTextualMime(file.mime) : false;
	const sortedFiles = (0, import_react.useMemo)(() => [...files].sort((a, b) => a.path.localeCompare(b.path)), [files]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "absolute inset-x-0 bottom-0 z-30 flex h-[58%] w-full flex-col border-t border-line bg-surface md:inset-y-0 md:left-auto md:h-auto md:max-w-md md:border-t-0 md:border-l",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between border-b border-line px-3 py-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-mono text-xs tracking-widest text-muted",
					children: "RUNTIME CONSOLE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
					label: "Close inspector",
					onClick: onClose,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex border-b border-line px-1",
				children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(item),
					className: cn("min-w-0 flex-1 px-1 py-2 text-center font-mono text-[11px] tracking-wide", tab === item ? "border-b-2 border-accent text-accent" : "text-muted"),
					children: item
				}, item))
			}),
			tab !== "Console" && !developer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-start gap-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "Developer mode is off."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Turn it on to inspect network, storage, files, and source."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "primary",
						onClick: onEnableDeveloper,
						children: "Enable developer mode"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: [
					tab === "Console" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogList, {
						logs,
						empty: "No console output yet."
					}) : null,
					tab === "Network" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "divide-y divide-line font-mono text-xs",
						children: [net.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "p-4 text-muted",
							children: "No requests yet."
						}) : null, net.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: event.status === "blocked" ? "text-warn" : event.status === "error" ? "text-danger" : "text-muted",
									children: [
										event.method,
										" · ",
										event.status
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "break-all text-fg",
									children: event.url
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-faint",
									children: event.detail
								})
							]
						}, event.id))]
					}) : null,
					tab === "Storage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "divide-y divide-line font-mono text-xs",
						children: [
							Object.keys(project.storage).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "p-4 text-muted",
								children: "localStorage is empty."
							}) : null,
							Object.entries(project.storage).map(([key, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-accent",
									children: key
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "break-all text-fg",
									children: value
								})]
							}, key)),
							project.cookies ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-accent",
									children: "cookie"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "break-all text-fg",
									children: project.cookies
								})]
							}) : null
						]
					}) : null,
					tab === "Files" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-line",
						children: sortedFiles.map((item) => {
							const Glyph = fileGlyph(item.path);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setSelected(item.path);
									setDraft(null);
									setTab("Source");
								},
								className: "flex w-full items-center gap-2 px-3 py-2 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, { className: "size-4 shrink-0 text-muted" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 flex-1 truncate font-mono text-xs",
										title: item.path,
										children: item.path
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 font-mono text-xs text-faint",
										children: formatBytes(item.data.byteLength)
									})
								]
							}) }, item.path);
						})
					}) : null,
					tab === "Source" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-full min-h-64 flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "border-b border-line px-3 py-2 font-mono text-xs text-muted",
							children: [file?.path ?? "No file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: file?.path ?? "",
								onChange: (event) => {
									setSelected(event.target.value);
									setDraft(null);
								},
								className: "mt-2 h-11 w-full rounded-control border border-line bg-inset px-2 text-sm text-fg",
								children: sortedFiles.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.path,
									children: item.path
								}, item.path))
							})]
						}), binary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "p-4 font-mono text-xs text-muted",
							children: "Binary file. Open it from the page instead of the editor."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: shown,
							onChange: (event) => setDraft(event.target.value),
							spellCheck: false,
							className: "min-h-64 w-full flex-1 resize-none bg-inset p-3 font-mono text-xs text-fg outline-none"
						})]
					}) : null,
					tab === "Info" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "space-y-3 p-4 font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								label: "Engine",
								value: "Isolated iframe · WebView prototype"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								label: "Entry",
								value: entry
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								label: "Root",
								value: project.rootPath
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								label: "Origin",
								value: "Opaque sandbox. No parent DOM access."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								label: "Zoom",
								value: `${Math.round(zoom * 100)}%`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								label: "Orientation",
								value: project.orientation
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								label: "Network",
								value: project.permissions.network ? "ALLOWED" : "BLOCKED"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								label: "Files",
								value: String(files.length)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
								label: "IndexedDB",
								value: "Session-scoped in this browser build. localStorage, sessionStorage, and cookies are saved with the project."
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex flex-wrap gap-2 border-t border-line p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onReload,
						children: "Reload"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onClearLogs,
						children: "Clear log"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !developer,
						onClick: onClearCache,
						children: "Clear cache"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						disabled: !developer,
						onClick: onClearStorage,
						children: "Clear storage"
					}),
					tab === "Source" && developer && !binary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "primary",
						onClick: () => {
							if (file) onSaveFile(file.path, shown);
							setDraft(null);
						},
						children: "Save & reload"
					}) : null
				]
			})
		]
	});
}
function LogList({ logs, empty }) {
	if (logs.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-4 font-mono text-xs text-muted",
		children: empty
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-1 p-3 font-mono text-xs",
		children: logs.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: cn("break-words whitespace-pre-wrap", entry.level === "error" && "text-danger", entry.level === "warn" && "text-warn", entry.level === "info" && "text-fg", entry.level === "debug" && "text-faint"),
			children: [
				"[",
				entry.level.toUpperCase(),
				"] ",
				entry.message
			]
		}, entry.id))
	});
}
function Info({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 break-all text-fg",
		children: value
	})] });
}
function RuntimeView({ project, run, logs, net, developer, devOpen, onToggleDev, onEnableDeveloper, onBack, onReload, onZoom, onNavigate, onStorage, onSession, onCookies, onDiag, onNet, onExternal, onNotify, onClearCache, onClearStorage, onClearLogs, onSaveFile, onOrientation, onManage, onExit }) {
	const iframeRef = (0, import_react.useRef)(null);
	const shellRef = (0, import_react.useRef)(null);
	const [menu, setMenu] = (0, import_react.useState)(false);
	const [logsHidden, setLogsHidden] = (0, import_react.useState)(false);
	const handlers = (0, import_react.useRef)({
		onNavigate,
		onStorage,
		onSession,
		onCookies,
		onDiag,
		onNet,
		onExternal,
		onNotify,
		project
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
		project
	};
	const entry = run.stack[run.index] ?? project.entry;
	const permKey = JSON.stringify(project.permissions);
	const compiled = (0, import_react.useMemo)(() => compileDocument({
		files: run.files,
		entry,
		rootPath: project.rootPath,
		permissions: project.permissions,
		storage: project.storage,
		session: run.sessionStorage,
		cookies: project.cookies
	}), [
		run.files,
		run.tick,
		entry,
		project.rootPath,
		permKey
	]);
	const [seeded, setSeeded] = (0, import_react.useState)(compiled.logs);
	(0, import_react.useEffect)(() => {
		setSeeded(compiled.logs);
		setLogsHidden(false);
	}, [compiled]);
	(0, import_react.useEffect)(() => {
		function onMessage(event) {
			if (event.source !== iframeRef.current?.contentWindow) return;
			const data = event.data;
			if (!data || data.source !== "htmlrt") return;
			const current = handlers.current;
			if (data.type === "ready") {
				current.onDiag("info", "JavaScript initialized");
				return;
			}
			if (data.type === "console" || data.type === "error") {
				const level = data.level || "info";
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
						detail: String(data.detail ?? "")
					});
					if (status === "blocked") current.onDiag("warn", "External request blocked");
				}
				return;
			}
			if (data.type === "navigate") {
				current.onNavigate(String(data.path ?? ""), data.storage ?? {}, data.session ?? {}, String(data.cookies ?? ""));
				return;
			}
			if (data.type === "storage") {
				current.onStorage(data.storage ?? {});
				return;
			}
			if (data.type === "session") {
				current.onSession(data.session ?? {});
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
					frame.postMessage({
						source: "htmlrt-host",
						type: "clipboard-result",
						req: data.req,
						error: "Clipboard blocked"
					}, "*");
					return;
				}
				navigator.clipboard.writeText(String(data.text ?? "")).then(() => {
					frame.postMessage({
						source: "htmlrt-host",
						type: "clipboard-result",
						req: data.req,
						text: String(data.text ?? "")
					}, "*");
				}).catch(() => {
					frame.postMessage({
						source: "htmlrt-host",
						type: "clipboard-result",
						req: data.req,
						error: "Clipboard unavailable"
					}, "*");
				});
			}
			if (data.type === "clipboard-read") {
				if (!current.project.permissions.clipboard) {
					frame.postMessage({
						source: "htmlrt-host",
						type: "clipboard-result",
						req: data.req,
						error: "Clipboard blocked"
					}, "*");
					return;
				}
				navigator.clipboard.readText().then((text) => {
					frame.postMessage({
						source: "htmlrt-host",
						type: "clipboard-result",
						req: data.req,
						text
					}, "*");
				}).catch(() => {
					frame.postMessage({
						source: "htmlrt-host",
						type: "clipboard-result",
						req: data.req,
						error: "Clipboard unavailable"
					}, "*");
				});
			}
			if (data.type === "geo-get") {
				if (!current.project.permissions.location || !navigator.geolocation) {
					frame.postMessage({
						source: "htmlrt-host",
						type: "geo-result",
						req: data.req,
						error: "Location blocked"
					}, "*");
					return;
				}
				navigator.geolocation.getCurrentPosition((pos) => {
					frame.postMessage({
						source: "htmlrt-host",
						type: "geo-result",
						req: data.req,
						coords: {
							lat: pos.coords.latitude,
							lon: pos.coords.longitude,
							acc: pos.coords.accuracy
						}
					}, "*");
				}, (error) => {
					frame.postMessage({
						source: "htmlrt-host",
						type: "geo-result",
						req: data.req,
						error: error.message
					}, "*");
				});
			}
		}
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);
	(0, import_react.useEffect)(() => {
		const frame = iframeRef.current;
		if (!frame) return;
		const focus = () => frame.focus();
		frame.addEventListener("load", focus);
		return () => frame.removeEventListener("load", focus);
	}, [run.tick, entry]);
	(0, import_react.useEffect)(() => {
		const preference = project.orientation;
		const orientation = screen.orientation;
		if (preference === "auto" || !orientation?.lock) return;
		orientation.lock(preference).catch(() => void 0);
		return () => {
			screen.orientation.unlock?.();
		};
	}, [project.orientation]);
	const mergedLogs = logsHidden ? logs : [...seeded, ...logs];
	const lastError = [...mergedLogs].reverse().find((entryLog) => entryLog.level === "error");
	const zoom = run.zoom;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: shellRef,
		className: "relative flex min-h-0 flex-1 flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-1 border-b border-line pr-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: run.mode === "app" && run.index === 0 ? "Exit app" : "Back",
						onClick: onBack,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium",
							children: project.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("truncate font-mono text-xs", project.permissions.network ? "text-warn" : "text-accent"),
							children: project.permissions.network ? "NETWORK" : "OFFLINE"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Zoom out",
						onClick: () => onZoom(Math.max(.5, Math.round((zoom - .1) * 10) / 10)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "w-12 font-mono text-xs tabular-nums",
						onClick: () => onZoom(1),
						"aria-label": "Reset zoom",
						children: [Math.round(zoom * 100), "%"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Zoom in",
						onClick: () => onZoom(Math.min(2, Math.round((zoom + .1) * 10) / 10)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Reload",
						onClick: onReload,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Runtime menu",
						onClick: () => setMenu(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-5" })
					})
				]
			}),
			lastError && !devOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onToggleDev,
				className: "truncate bg-danger-dim px-4 py-2 text-left font-mono text-xs text-danger",
				children: ["[ERROR] ", lastError.message]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative min-h-0 flex-1 overflow-auto bg-inset",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-0 left-0",
					style: {
						width: `${100 / zoom}%`,
						height: `${100 / zoom}%`,
						transform: `scale(${zoom})`,
						transformOrigin: "top left"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						ref: iframeRef,
						title: project.name,
						className: "h-full w-full border-0 bg-inset",
						sandbox: "allow-scripts allow-forms allow-modals allow-popups allow-downloads allow-pointer-lock",
						referrerPolicy: "no-referrer",
						srcDoc: compiled.html,
						allow: allowAttribute(project.permissions)
					}, `${project.id}:${run.tick}:${entry}`)
				})
			}),
			devOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DevPanel, {
				project: {
					...project,
					storage: project.storage
				},
				files: run.files,
				entry,
				logs: mergedLogs,
				net,
				zoom,
				developer,
				onClose: onToggleDev,
				onEnableDeveloper,
				onReload,
				onClearCache,
				onClearStorage,
				onClearLogs: () => {
					setLogsHidden(true);
					onClearLogs();
				},
				onSaveFile
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: menu,
				onOpenChange: setMenu,
				title: "RUNTIME",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								"auto",
								"portrait",
								"landscape"
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: project.orientation === item ? "primary" : "surface",
								onClick: () => onOrientation(item),
								children: item
							}, item))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => {
								const node = shellRef.current;
								if (!node) return;
								if (document.fullscreenElement) document.exitFullscreen();
								else node.requestFullscreen();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-4" }), "Full screen"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								setMenu(false);
								onToggleDev();
							},
							children: "Console"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								setMenu(false);
								onManage();
							},
							children: "Project"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => {
								setMenu(false);
								onExit();
							},
							children: run.mode === "app" ? "Exit app" : "Close project"
						})
					]
				})
			})
		]
	});
}
function diag(level, message) {
	return {
		id: nid(),
		t: Date.now(),
		level,
		message
	};
}
var PERMISSIONS = [
	{
		key: "network",
		label: "Network",
		description: "Allow http(s) requests. Blocked by default."
	},
	{
		key: "camera",
		label: "Camera",
		description: "Allow camera capture. Blocked by default."
	},
	{
		key: "microphone",
		label: "Microphone",
		description: "Allow microphone capture. Blocked by default."
	},
	{
		key: "location",
		label: "Location",
		description: "Allow geolocation. Blocked by default."
	},
	{
		key: "notifications",
		label: "Notifications",
		description: "Allow in-app notifications. Blocked by default."
	},
	{
		key: "clipboard",
		label: "Clipboard",
		description: "Allow reading and writing the clipboard."
	}
];
function PathSheet({ open, value, onOpenChange, onChange, onOpen, onBrowseFile, onMountFolder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		title: "OPEN HTML",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "LOCAL PATH",
					mono: true,
					value,
					placeholder: "/sdcard/MyWebsite/index.html",
					onChange: (event) => onChange(event.target.value),
					onKeyDown: (event) => {
						if (event.key === "Enter") onOpen();
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Mounted projects open immediately. A new path asks for the folder that should appear there. This browser build cannot read arbitrary device paths until you pick them."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "primary",
					onClick: onOpen,
					children: "Open path"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onMountFolder,
					children: "Mount folder at this path"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onBrowseFile,
					children: "Choose HTML file"
				})
			]
		})
	});
}
function ImportSheet({ open, onOpenChange, onFile, onFolder, onZip }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		title: "IMPORT PROJECT",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Directory structure is preserved so relative paths keep working."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "primary",
					onClick: onFolder,
					children: "Choose folder"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onFile,
					children: "Choose HTML file"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onZip,
					children: "Import zip"
				})
			]
		})
	});
}
function SettingsSheet({ open, settings, onOpenChange, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		open,
		onOpenChange,
		title: "SETTINGS",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchRow, {
				label: "Developer mode",
				description: "Inspector, console, network monitor, storage, source editor, and live reload.",
				checked: settings.developerMode,
				onCheckedChange: (developerMode) => onChange({
					...settings,
					developerMode
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-xs tracking-widest text-muted",
				children: "EXTERNAL LINKS"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid grid-cols-3 gap-2",
				children: [
					"block",
					"ask",
					"allow"
				].map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: settings.externalLinks === mode ? "primary" : "surface",
					onClick: () => onChange({
						...settings,
						externalLinks: mode
					}),
					children: mode
				}, mode))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs text-muted",
				children: "Local documents run in an isolated sandbox. Network, camera, microphone, location, and notifications stay off until enabled per project. A native Android build would use WebView and real filesystem paths."
			})
		]
	});
}
function ExternalSheet({ href, onCancel, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		open: href != null,
		onOpenChange: (open) => {
			if (!open) onCancel();
		},
		title: "EXTERNAL LINK",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: "This page wants to leave the runtime."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 break-all font-mono text-xs text-muted",
				children: href
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onCancel,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "primary",
					onClick: onOpen,
					children: "Open"
				})]
			})
		]
	});
}
function ProjectSheet({ project, onOpenChange, onPatch, onDelete, onDuplicate, onExport, onInstall, onShortcut, onOpen, onIcon }) {
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	if (!project) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: false,
		onOpenChange,
		title: "PROJECT",
		children: null
	});
	const htmlFiles = project.files.filter((file) => /\.html?$/i.test(file.path));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: project != null,
		onOpenChange,
		title: "PROJECT",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "NAME",
					value: project.name,
					onChange: (event) => onPatch({ name: event.target.value })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "VIRTUAL PATH",
					mono: true,
					value: project.rootPath,
					onChange: (event) => onPatch({ rootPath: event.target.value })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 block font-mono text-xs tracking-widest text-muted",
						children: "ENTRY"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: project.entry,
						onChange: (event) => onPatch({ entry: event.target.value }, true),
						className: "h-11 w-full rounded-control border border-line bg-inset px-3 font-mono text-sm text-fg",
						children: htmlFiles.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: file.path,
							children: file.path
						}, file.path))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs text-muted",
					children: [
						projectDisplayPath(project),
						" · ",
						formatBytes(totalBytes(project)),
						" · ",
						project.files.length,
						" files"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2 [&>button]:w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							onClick: () => onOpen("run"),
							children: "Open"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: onInstall,
							children: project.installed ? "Uninstall app" : "Install as local app"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: onShortcut,
							children: "Create shortcut"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => onOpen("app"),
							disabled: !project.installed,
							children: "Launch app"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: onExport,
							children: "Export"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: onDuplicate,
							children: "Duplicate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => onPatch({ pinned: !project.pinned }),
							children: project.pinned ? "Unpin" : "Pin"
						}),
						confirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: onDelete,
							children: "Confirm delete"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => setConfirming(true),
							children: "Delete"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 cursor-pointer items-center justify-center rounded-control border border-line bg-raised text-sm",
					children: ["Custom icon", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "image/*",
						className: "hidden",
						onChange: (event) => {
							const file = event.target.files?.[0];
							if (file) onIcon(file);
							event.target.value = "";
						}
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-line border-y border-line",
					children: PERMISSIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchRow, {
						label: item.label,
						description: item.description,
						checked: project.permissions[item.key],
						onCheckedChange: (checked) => onPatch({ permissions: {
							...project.permissions,
							[item.key]: checked
						} }, true)
					}, item.key))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-40 overflow-y-auto rounded-control border border-line",
					children: project.files.map((file) => {
						const Glyph = fileGlyph(file.path);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2 border-b border-line px-3 py-2 last:border-b-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, { className: "size-4 text-muted" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate font-mono text-xs",
									children: file.path
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-faint",
									children: formatBytes(file.bytes)
								})
							]
						}, file.path);
					})
				})
			]
		})
	});
}
var BOILERPLATE = `<!DOCTYPE html>
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
  <\/script>
</body>
</html>`;
function parseHash(hash) {
	const value = hash.replace(/^#\/?/, "");
	if (value === "paste") return { screen: "paste" };
	if (value.startsWith("app/")) return {
		screen: "run",
		id: decodeURIComponent(value.slice(4)),
		mode: "app"
	};
	if (value.startsWith("run/")) return {
		screen: "run",
		id: decodeURIComponent(value.slice(4)),
		mode: "run"
	};
	return { screen: "home" };
}
function HtmlRuntimeApp() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [route, setRoute] = (0, import_react.useState)({ screen: "home" });
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [settings, setSettings] = (0, import_react.useState)(DEFAULT_SETTINGS);
	const [run, setRun] = (0, import_react.useState)(null);
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [net, setNet] = (0, import_react.useState)([]);
	const [devOpen, setDevOpen] = (0, import_react.useState)(false);
	const [toast, setToast] = (0, import_react.useState)(null);
	const [pathOpen, setPathOpen] = (0, import_react.useState)(false);
	const [pathValue, setPathValue] = (0, import_react.useState)("/sdcard/");
	const [importOpen, setImportOpen] = (0, import_react.useState)(false);
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [manageId, setManageId] = (0, import_react.useState)(null);
	const [externalHref, setExternalHref] = (0, import_react.useState)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [launch, setLaunch] = (0, import_react.useState)(0);
	const projectsRef = (0, import_react.useRef)(projects);
	projectsRef.current = projects;
	const runRef = (0, import_react.useRef)(run);
	runRef.current = run;
	const pendingEntry = (0, import_react.useRef)(null);
	const saveTimer = (0, import_react.useRef)(null);
	const mountRoot = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const dirRef = (0, import_react.useRef)(null);
	const zipRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const apply = () => setRoute(parseHash(window.location.hash));
		apply();
		window.addEventListener("hashchange", apply);
		return () => window.removeEventListener("hashchange", apply);
	}, []);
	(0, import_react.useEffect)(() => {
		dirRef.current?.setAttribute("webkitdirectory", "");
		dirRef.current?.setAttribute("directory", "");
	}, []);
	(0, import_react.useEffect)(() => {
		Promise.all([listProjects(), getSettings()]).then(([list, stored]) => {
			setProjects(list);
			setSettings(stored);
			setReady(true);
		}).catch((error) => {
			setReady(true);
			setToast(error instanceof Error ? error.message : "Could not read projects");
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (!toast) return;
		const timer = window.setTimeout(() => setToast(null), 2800);
		return () => window.clearTimeout(timer);
	}, [toast]);
	function go(next) {
		if (window.location.hash.replace(/^#/, "") === next) {
			setLaunch((value) => value + 1);
			setRoute(parseHash(next ? `#${next}` : ""));
			return;
		}
		window.location.hash = next;
	}
	function notify(message) {
		setToast(message);
	}
	function remember(projectId, patch) {
		const current = projectsRef.current.find((item) => item.id === projectId);
		if (!current) return null;
		const next = {
			...current,
			...patch,
			updatedAt: Date.now()
		};
		const list = projectsRef.current.map((item) => item.id === projectId ? next : item);
		projectsRef.current = list;
		setProjects(list);
		if (saveTimer.current) window.clearTimeout(saveTimer.current);
		saveTimer.current = window.setTimeout(() => void saveProject(next), 200);
		return next;
	}
	async function adopt(bundle, rootPath, entry) {
		if (!bundle.files.some((file) => /\.html?$/i.test(file.path))) throw new Error("Choose an HTML file or a folder that contains one");
		const explicitRoot = rootPath?.trim();
		if (explicitRoot && projectsRef.current.some((project) => project.rootPath === explicitRoot)) throw new Error("A project is already mounted at this path");
		const meta = makeProject({
			name: bundle.suggestedName,
			files: bundle.files,
			entry: entry && bundle.files.some((file) => file.path === entry) ? entry : bundle.manifest?.entry,
			rootPath: explicitRoot || bundle.manifest?.rootPath || uniqueRoot(projectsRef.current, bundle.suggestedName),
			permissions: manifestPermissions(bundle.manifest),
			projects: projectsRef.current
		});
		if (!explicitRoot && bundle.manifest?.rootPath && projectsRef.current.some((project) => project.rootPath === meta.rootPath)) meta.rootPath = uniqueRoot(projectsRef.current, meta.name);
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
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		if (!runId) {
			setRun(null);
			setActiveId(null);
			return;
		}
		let cancel = false;
		const override = pendingEntry.current;
		pendingEntry.current = null;
		(async () => {
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
			const opened = {
				...meta,
				lastOpenedAt: Date.now()
			};
			await saveProject(opened);
			if (cancel) return;
			const list = projectsRef.current.map((item) => item.id === opened.id ? opened : item);
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
				cookies: opened.cookies
			});
		})().catch((error) => {
			if (!cancel) notify(error instanceof Error ? error.message : "Could not open project");
		});
		return () => {
			cancel = true;
		};
	}, [
		ready,
		runId,
		runMode,
		launch
	]);
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
	async function ingestFiles(files, rootPath, entry) {
		const bundle = await bundleFromFiles(files);
		await adopt(bundle, rootPath, entry);
		notify(`Imported ${bundle.files.length} files`);
	}
	const active = projects.find((project) => project.id === activeId) ?? null;
	const managed = projects.find((project) => project.id === manageId) ?? null;
	const ordered = sortProjects(projects);
	async function launchPaste(name, html) {
		const source = html.trim() || BOILERPLATE;
		const files = [{
			path: "index.html",
			mime: "text/html",
			data: new TextEncoder().encode(source)
		}];
		const meta = makeProject({
			name: name.trim() || titleFromHtml(source) || "Pasted HTML",
			files,
			projects: projectsRef.current
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
			const next = {
				...existing,
				entry: "index.html",
				files: indexFiles(files),
				storage: {},
				cookies: "",
				permissions: { ...DEFAULT_PERMISSIONS },
				updatedAt: Date.now()
			};
			await replaceFiles(existing.id, files);
			await saveProject(next);
			const list = projectsRef.current.map((project) => project.id === next.id ? next : project);
			projectsRef.current = list;
			setProjects(list);
			go(`run/${next.id}`);
			return;
		}
		const meta = makeProject({
			name: "Engine self-test",
			files,
			projects: projectsRef.current
		});
		await replaceFiles(meta.id, files);
		await saveProject(meta);
		const list = [meta, ...projectsRef.current];
		projectsRef.current = list;
		setProjects(list);
		go(`run/${meta.id}`);
	}
	function patchRun(patch) {
		setRun((current) => current ? {
			...current,
			...patch
		} : current);
	}
	async function saveEditedFile(path, text) {
		if (!active || !runRef.current) return;
		const data = new TextEncoder().encode(text);
		const mime = runRef.current.files.find((file) => file.path === path)?.mime ?? "text/plain";
		const nextFiles = runRef.current.files.map((file) => file.path === path ? {
			...file,
			data,
			mime
		} : file);
		await writeFiles(active.id, [{
			path,
			mime,
			data
		}]);
		const next = remember(active.id, { files: indexFiles(nextFiles) });
		if (!next) return;
		setRun((current) => current ? {
			...current,
			files: nextFiles,
			tick: current.tick + 1,
			storage: next.storage,
			cookies: next.cookies
		} : current);
		notify("Saved");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell relative mx-auto flex h-dvh w-full max-w-3xl flex-col bg-bg text-fg md:border-x md:border-line",
		onDragOver: (event) => {
			event.preventDefault();
			setDragging(true);
		},
		onDragLeave: () => setDragging(false),
		onDrop: (event) => {
			event.preventDefault();
			setDragging(false);
			filesFromDataTransfer(event.dataTransfer).then((files) => ingestFiles(files)).catch((error) => notify(error instanceof Error ? error.message : "Import failed"));
		},
		children: [
			route.screen === "paste" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasteView, {
				onBack: () => go(""),
				onLaunch: (name, html) => void launchPaste(name, html).catch((error) => notify(error instanceof Error ? error.message : "Could not launch"))
			}) : route.screen === "run" && run && active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuntimeView, {
				project: active,
				run,
				logs,
				net,
				developer: settings.developerMode,
				devOpen,
				onToggleDev: () => setDevOpen((open) => !open),
				onEnableDeveloper: () => {
					const next = {
						...settings,
						developerMode: true
					};
					setSettings(next);
					saveSettings(next);
				},
				onBack: () => {
					const current = runRef.current;
					if (current && current.index > 0) {
						patchRun({
							index: current.index - 1,
							tick: current.tick + 1
						});
						return;
					}
					go("");
				},
				onReload: () => {
					const current = runRef.current;
					const project = projectsRef.current.find((item) => item.id === active.id);
					if (!current || !project) return;
					patchRun({
						tick: current.tick + 1,
						storage: { ...project.storage },
						cookies: project.cookies,
						sessionStorage: {}
					});
				},
				onZoom: (zoom) => patchRun({ zoom }),
				onNavigate: (path, storage, sessionStorage, cookies) => {
					const current = runRef.current;
					if (!current) return;
					remember(active.id, {
						storage,
						cookies
					});
					const stack = current.stack.slice(0, current.index + 1);
					if (stack[stack.length - 1] !== path) stack.push(path);
					setRun({
						...current,
						stack,
						index: stack.length - 1,
						tick: current.tick + 1,
						storage,
						sessionStorage,
						cookies
					});
				},
				onStorage: (storage) => remember(active.id, { storage }),
				onSession: (sessionStorage) => patchRun({ sessionStorage }),
				onCookies: (cookies) => remember(active.id, { cookies }),
				onDiag: (level, message) => setLogs((prev) => [...prev.slice(-200), diag(level, message)]),
				onNet: (event) => setNet((prev) => [...prev.slice(-200), {
					...event,
					id: nid(),
					t: Date.now()
				}]),
				onExternal: (href) => {
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
				},
				onNotify: (title, body) => notify(body ? `${title}: ${body}` : title),
				onClearCache: () => {
					const current = runRef.current;
					if (!current) return;
					patchRun({
						tick: current.tick + 1,
						sessionStorage: {}
					});
					setLogs((prev) => [...prev, diag("info", "Cache cleared")]);
				},
				onClearStorage: () => {
					const current = runRef.current;
					if (!current) return;
					remember(active.id, {
						storage: {},
						cookies: ""
					});
					setRun({
						...current,
						storage: {},
						cookies: "",
						sessionStorage: {},
						tick: current.tick + 1
					});
					setLogs((prev) => [...prev, diag("info", "Local storage cleared")]);
				},
				onClearLogs: () => setLogs([]),
				onSaveFile: (path, text) => void saveEditedFile(path, text),
				onOrientation: (orientation) => remember(active.id, { orientation }),
				onManage: () => setManageId(active.id),
				onExit: () => go("")
			}) : route.screen === "run" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-6 font-mono text-sm text-muted",
				children: "Loading project…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeScreen, {
				projects: ordered,
				onOpenPath: () => setPathOpen(true),
				onImport: () => setImportOpen(true),
				onPaste: () => go("paste"),
				onOpenProject: (project, mode) => go(`${mode}/${project.id}`),
				onManage: (project) => setManageId(project.id),
				onTogglePin: (project) => remember(project.id, { pinned: !project.pinned }),
				onSelfTest: () => void runSelfTest().catch((error) => notify(error instanceof Error ? error.message : "Self-test failed")),
				onSettings: () => setSettingsOpen(true)
			}),
			dragging ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-4 grid place-items-center rounded-card border border-accent bg-bg/80 font-mono text-sm text-accent",
				children: "Drop HTML, a folder, or a zip"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathSheet, {
				open: pathOpen,
				value: pathValue,
				onOpenChange: setPathOpen,
				onChange: setPathValue,
				onOpen: () => void handleOpenPath(),
				onBrowseFile: () => {
					mountRoot.current = null;
					fileRef.current?.click();
				},
				onMountFolder: () => {
					mountRoot.current = pathValue;
					dirRef.current?.click();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportSheet, {
				open: importOpen,
				onOpenChange: setImportOpen,
				onFile: () => {
					mountRoot.current = null;
					fileRef.current?.click();
				},
				onFolder: () => {
					mountRoot.current = null;
					dirRef.current?.click();
				},
				onZip: () => zipRef.current?.click()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSheet, {
				open: settingsOpen,
				settings,
				onOpenChange: setSettingsOpen,
				onChange: (next) => {
					setSettings(next);
					saveSettings(next);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectSheet, {
				project: managed,
				onOpenChange: (open) => {
					if (!open) setManageId(null);
				},
				onPatch: (patch, reload) => {
					if (!managed) return;
					const next = remember(managed.id, patch);
					if (reload && next && runRef.current && activeId === managed.id) {
						const entry = next.entry;
						setRun((current) => current ? {
							...current,
							tick: current.tick + 1,
							stack: [entry],
							index: 0
						} : current);
					}
				},
				onDelete: () => {
					if (!managed) return;
					const id = managed.id;
					deleteProjectRecord(id).then(() => {
						const list = projectsRef.current.filter((project) => project.id !== id);
						projectsRef.current = list;
						setProjects(list);
						setManageId(null);
						if (activeId === id) go("");
						notify("Project deleted");
					});
				},
				onDuplicate: () => {
					if (!managed) return;
					readAllFiles(managed.id, managed.files).then(async (files) => {
						const meta = makeProject({
							name: `${managed.name} copy`,
							files,
							entry: managed.entry,
							projects: projectsRef.current
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
				},
				onExport: () => {
					if (!managed) return;
					readAllFiles(managed.id, managed.files).then((files) => {
						const manifest = {
							name: managed.name,
							entry: managed.entry,
							rootPath: managed.rootPath,
							permissions: managed.permissions,
							orientation: managed.orientation,
							storage: managed.storage,
							cookies: managed.cookies,
							iconDataUrl: managed.iconDataUrl
						};
						const packed = zipStore([{
							path: "html-runtime.json",
							data: new TextEncoder().encode(JSON.stringify(manifest, null, 2))
						}, ...files.map((file) => ({
							path: file.path,
							data: file.data
						}))]);
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
				},
				onInstall: () => {
					if (!managed) return;
					const installed = !managed.installed;
					remember(managed.id, { installed });
					notify(installed ? "Installed as a local app" : "Removed from installed apps");
				},
				onShortcut: () => {
					if (!managed) return;
					const url = new URL(window.location.href);
					url.hash = `app/${managed.id}`;
					navigator.clipboard.writeText(url.toString()).then(() => notify("Shortcut link copied"), () => notify(url.toString()));
				},
				onOpen: (mode) => {
					if (!managed) return;
					setManageId(null);
					go(`${mode}/${managed.id}`);
				},
				onIcon: (file) => {
					if (!managed) return;
					createImageBitmap(file).then((bitmap) => {
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
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalSheet, {
				href: externalHref,
				onCancel: () => setExternalHref(null),
				onOpen: () => {
					if (externalHref) window.open(externalHref, "_blank", "noopener,noreferrer");
					setExternalHref(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: ".html,.htm,text/html",
				className: "hidden",
				onChange: (event) => {
					const list = event.target.files;
					event.target.value = "";
					if (!list?.length) return;
					filesFromList(list).then((files) => ingestFiles(files)).catch((error) => notify(error instanceof Error ? error.message : "Import failed"));
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: dirRef,
				type: "file",
				multiple: true,
				className: "hidden",
				onChange: (event) => {
					const list = event.target.files;
					const root = mountRoot.current;
					mountRoot.current = null;
					event.target.value = "";
					if (!list?.length) return;
					filesFromList(list).then((files) => {
						if (!root) return ingestFiles(files);
						const parts = splitRootAndEntry(root);
						const entry = files.some((file) => file.path === parts.entry) ? parts.entry : void 0;
						return ingestFiles(files, parts.rootPath, entry);
					}).catch((error) => notify(error instanceof Error ? error.message : "Import failed"));
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: zipRef,
				type: "file",
				accept: ".zip,application/zip",
				className: "hidden",
				onChange: (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (!file) return;
					file.arrayBuffer().then((buffer) => bundleFromZip(buffer)).then((bundle) => adopt(bundle)).then(() => notify("Zip imported")).catch((error) => notify(error instanceof Error ? error.message : "Could not read zip"));
				}
			}),
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4",
				"aria-live": "polite",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm rounded-control border border-line bg-raised px-4 py-3 text-sm text-fg",
					children: toast
				})
			}) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HtmlRuntimeApp, {});
}
//#endregion
export { Home as component };
