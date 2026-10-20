/** Injected into every sandboxed document before user scripts. PAYLOAD is in scope. */
export const PRELUDE_JS = `
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
