/**
 * Builds docs/AI-Whiteboard-Study-Guide.pdf from the learning documentation.
 *
 * Why this exists: the study material is written in Markdown with Mermaid
 * diagrams. A single self-contained HTML file is generated, rendered by
 * headless Chrome (so Mermaid becomes real SVG), then printed to PDF via the
 * Chrome DevTools Protocol. No network access is required.
 *
 * Usage: node scripts/generate-study-pdf.mjs
 * Requires: Google Chrome installed, and node_modules/mermaid + marked present.
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { marked } from "marked";

const ROOT = resolve(process.cwd());
const OUT = join(ROOT, "docs", "AI-Whiteboard-Study-Guide.pdf");
const HTML_OUT = join(tmpdir(), `aiwb-study-guide-${process.pid}.html`);

const DOCS = [
  { file: "docs/LEARNING_GUIDE.md", label: "Part I — Learning Guide (Phase 1 Analysis)" },
  { file: "docs/chapters/01-project-overview.md", label: "Part II — Chapter 1: Project Overview" },
  { file: "docs/PORTFOLIO_AND_INTERVIEW.md", label: "Part III — Portfolio & Interview Preparation" },
];

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const decodeEntities = (s) =>
  s
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

const slug = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "and")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";

const toc = [];
const parts = DOCS.map((doc, docIndex) => {
  let html = marked.parse(readFileSync(join(ROOT, doc.file), "utf8"), { gfm: true });

  // Mermaid code fences -> containers that headless Chrome will render as SVG.
  html = html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => `<div class="mermaid">${decodeEntities(code)}</div>`,
  );

  // Heading anchors + table-of-contents entries (scoped per part to avoid duplicates).
  html = html.replace(/<h([12])>([\s\S]*?)<\/h\1>/g, (_, level, inner) => {
    const id = `p${docIndex + 1}-${slug(inner)}`;
    toc.push({ level: Number(level), id, text: inner.replace(/<[^>]+>/g, "") });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });

  return `<section class="part"><p class="part-label">${escapeHtml(doc.label)}</p>${html}</section>`;
});

const tocHtml = toc
  .map(
    (t) =>
      `<li class="toc-l${t.level}"><a href="#${t.id}"><span>${escapeHtml(t.text)}</span><span class="dots"></span><span class="pg"></span></a></li>`,
  )
  .join("\n");

const mermaidBundle = readFileSync(
  join(ROOT, "node_modules", "mermaid", "dist", "mermaid.min.js"),
  "utf8",
).replace(/<\/script/gi, "<\\/script");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>AI Whiteboard — Complete Study Guide</title>
<style>
@page { size: A4; margin: 17mm 16mm 18mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; color: #1b1b1b; font-family: "Segoe UI", Arial, sans-serif; font-size: 10pt; line-height: 1.55; }
a { color: inherit; text-decoration: none; }
p { margin: 0 0 8pt; }
h1, h2, h3, h4 { color: #111; line-height: 1.25; page-break-after: avoid; break-after: avoid; }
h1 { font-size: 19pt; margin: 0 0 12pt; padding-bottom: 6pt; border-bottom: 2px solid #d12a1e; }
h2 { font-size: 14pt; margin: 18pt 0 8pt; padding-bottom: 3pt; border-bottom: 1px solid #ddd; }
h3 { font-size: 11.5pt; margin: 13pt 0 5pt; color: #7a1f18; }
h4 { font-size: 10.5pt; margin: 10pt 0 4pt; }
ul, ol { margin: 0 0 9pt; padding-left: 18pt; }
li { margin: 2pt 0; }
strong { color: #111; }
code { font-family: Consolas, "Cascadia Mono", monospace; font-size: 8.6pt; background: #f3f2f1; padding: 0.5pt 3pt; border-radius: 3px; }
pre { background: #f7f6f5; border: 1px solid #e4e2e0; border-left: 3px solid #d12a1e; border-radius: 4px; padding: 8pt 9pt; margin: 7pt 0 11pt; overflow: visible; page-break-inside: avoid; break-inside: avoid; }
pre code { background: none; padding: 0; font-size: 8.3pt; line-height: 1.42; white-space: pre-wrap; overflow-wrap: anywhere; }
blockquote { margin: 8pt 0; padding: 6pt 10pt; border-left: 3px solid #d12a1e; background: #fdf6f5; color: #333; page-break-inside: avoid; }
blockquote p:last-child { margin-bottom: 0; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0 12pt; font-size: 8.6pt; page-break-inside: auto; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; break-inside: avoid; }
th, td { border: 1px solid #dcdad7; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { background: #f2efed; font-weight: 600; color: #111; }
tbody tr:nth-child(even) { background: #faf9f8; }
hr { border: 0; border-top: 1px solid #ddd; margin: 14pt 0; }
.mermaid { margin: 9pt auto 12pt; text-align: center; page-break-inside: avoid; break-inside: avoid; }
.mermaid svg { max-width: 100%; height: auto; }
.part { page-break-before: always; break-before: page; }
.part:first-of-type { page-break-before: avoid; break-before: avoid; }
.part-label { font-family: Consolas, monospace; font-size: 8pt; letter-spacing: 0.13em; text-transform: uppercase; color: #d12a1e; margin-bottom: 4pt; }
.cover { height: 245mm; display: flex; flex-direction: column; justify-content: center; page-break-after: always; break-after: page; }
.cover .rule { width: 44mm; height: 4px; background: #d12a1e; margin-bottom: 14mm; }
.cover h1 { font-size: 30pt; border: 0; padding: 0; margin: 0 0 6mm; letter-spacing: -0.02em; }
.cover .sub { font-size: 14pt; color: #444; margin-bottom: 16mm; }
.cover .meta { font-family: Consolas, monospace; font-size: 9pt; color: #666; line-height: 1.8; }
.cover .foot { margin-top: 20mm; font-size: 9pt; color: #888; border-top: 1px solid #ddd; padding-top: 5mm; }
.toc { page-break-after: always; break-after: page; }
.toc h2 { margin-top: 0; }
.toc ol { list-style: none; padding: 0; }
.toc li a { display: flex; align-items: baseline; gap: 4pt; padding: 1.5pt 0; }
.toc li .dots { flex: 1; border-bottom: 1px dotted #bbb; }
.toc-l1 { font-size: 11pt; font-weight: 600; margin-top: 9pt !important; }
.toc-l2 { font-size: 9pt; padding-left: 14pt; }
</style></head>
<body>
<section class="cover">
  <div class="rule"></div>
  <h1>AI Whiteboard<br>Complete Study Guide</h1>
  <div class="sub">Source-grounded documentation: analysis, Chapter 1, and interview preparation.</div>
  <div class="meta">
    Built for: the project author<br>
    Method: every claim traces to a file in this repository<br>
    Contents: LEARNING_GUIDE.md + Chapter 1 + PORTFOLIO_AND_INTERVIEW.md<br>
    Generated: 23 November 2026
  </div>
  <div class="foot">Study one chapter at a time. Answer the checks at the end of each chapter before moving on.</div>
</section>
<nav class="toc"><h2>Table of Contents</h2><ol>${tocHtml}</ol></nav>
${parts.join("\n")}
<script>${mermaidBundle}</script>
<script>
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "base",
    themeVariables: {
      primaryColor: "#ffffff", primaryBorderColor: "#d12a1e", primaryTextColor: "#1b1b1b",
      lineColor: "#8a8a8a", secondaryColor: "#fdf1e3", tertiaryColor: "#faf9f8",
      fontFamily: "Segoe UI, Arial, sans-serif", fontSize: "12px"
    },
    flowchart: { curve: "basis", useMaxWidth: true },
    sequence: { useMaxWidth: true }
  });
  (async function () {
    try {
      await mermaid.run({ querySelector: "div.mermaid" });
    } catch (err) {
      document.body.setAttribute("data-mermaid-error", String(err));
      document.querySelectorAll("div.mermaid").forEach(function (el) {
        if (!el.querySelector("svg")) el.textContent = "Diagram failed to render: " + String(err);
      });
    } finally {
      window.__PDF_READY__ = true;
    }
  })();
</script>
</body></html>`;

writeFileSync(HTML_OUT, html, "utf8");

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const chrome = chromeCandidates.find((p) => {
  try { readFileSync(p); return true; } catch { return false; }
});
if (!chrome) throw new Error("Google Chrome was not found; cannot render the PDF.");

const profile = mkdtempSync(join(tmpdir(), "aiwb-pdf-"));
const port = 9300 + Math.floor(Math.random() * 500);
const child = spawn(chrome, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
  "--no-first-run", "--no-default-browser-check", "--hide-scrollbars",
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  `file:///${HTML_OUT.replace(/\\/g, "/")}`,
], { stdio: "ignore" });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;

try {
  let page = null;
  for (let i = 0; i < 60; i++) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      page = targets.find((t) => t.type === "page" && t.url.includes("study-guide-"));
      if (page) break;
    } catch { /* Chrome still starting */ }
    await delay(250);
  }
  if (!page) throw new Error("Could not connect to headless Chrome page target.");

  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    ws.onopen = resolveOpen;
    ws.onerror = rejectOpen;
  });

  let seq = 0;
  const pending = new Map();
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve: res, reject: rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
    } else if (msg.method === "Runtime.consoleAPICalled") {
      const args = msg.params.args.map((a) => a.value ?? a.description).join(" ");
      if (msg.params.type === "error") console.error("Chrome console:", args);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const id = ++seq;
      pending.set(id, { resolve: res, reject: rej });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send("Runtime.enable");
  await send("Page.enable");
  await delay(600);

  for (let i = 0; i < 120; i++) {
    const r = await send("Runtime.evaluate", {
      expression: "window.__PDF_READY__ === true",
      returnByValue: true,
    });
    if (r.result.value === true) break;
    await delay(250);
  }

  const diag = await send("Runtime.evaluate", {
    expression: "document.body.getAttribute('data-mermaid-error') || 'ok'",
    returnByValue: true,
  });
  console.log("Mermaid status:", diag.result.value);

  const pdf = await send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:7px;color:#999;width:100%;padding:0 16mm;font-family:Arial;">AI Whiteboard — Complete Study Guide</div>',
    footerTemplate: '<div style="font-size:7px;color:#999;width:100%;padding:0 16mm;text-align:right;font-family:Arial;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    marginTop: 0.18, marginBottom: 0.18, marginLeft: 0, marginRight: 0,
  });

  writeFileSync(OUT, Buffer.from(pdf.data, "base64"));
  console.log("Wrote", OUT);
} finally {
  if (ws) ws.close();
  child.kill();
  await delay(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
  try { rmSync(HTML_OUT, { force: true }); } catch { /* ignore */ }
}
