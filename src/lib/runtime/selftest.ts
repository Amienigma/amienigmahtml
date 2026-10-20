import { guessMime } from "@/lib/runtime/mime";
import type { StoredFile } from "@/lib/runtime/types";

function textFile(path: string, text: string): StoredFile {
  return { path, mime: guessMime(path), data: new TextEncoder().encode(text) };
}

function toneWav(): Uint8Array {
  const sampleRate = 8000;
  const seconds = 0.25;
  const count = Math.floor(sampleRate * seconds);
  const data = new Uint8Array(44 + count);
  const view = new DataView(data.buffer);
  const write = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) data[offset + index] = value.charCodeAt(index);
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + count, true);
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
    const sample = Math.sin((2 * Math.PI * 440 * index) / sampleRate);
    data[44 + index] = 128 + Math.round(sample * 48);
  }
  return data;
}

const INDEX_HTML = `<!DOCTYPE html>
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
  <script src="app.js"></script>
</body>
</html>
`;

const PAGE2 = `<!DOCTYPE html>
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
  </script>
</body>
</html>
`;

const CSS = `:root { color-scheme: dark; }
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

const APP_JS = `var count = Number(localStorage.getItem("count") || "0");
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

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#143026"/>
  <path d="M18 40 L32 16 L46 40" fill="none" stroke="#3ddc84" stroke-width="4"/>
  <path d="M24 40 H40" stroke="#e7eeea" stroke-width="4"/>
</svg>`;

export function selfTestFiles(): StoredFile[] {
  return [
    textFile("index.html", INDEX_HTML),
    textFile("page2.html", PAGE2),
    textFile("style.css", CSS),
    textFile("app.js", APP_JS),
    textFile("assets/mark.svg", MARK),
    textFile("assets/data.json", JSON.stringify({ ok: true, engine: "html-runtime", assets: 6 }, null, 2)),
    { path: "assets/tone.wav", mime: "audio/wav", data: toneWav() },
  ];
}
