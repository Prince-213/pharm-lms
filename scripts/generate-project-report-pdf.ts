/**
 * Generate Project_Report.pdf from docs/Project_Report.md
 * Usage: pnpm dlx tsx scripts/generate-project-report-pdf.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const mdPath = resolve(root, "docs/Project_Report.md");
const outPath = resolve(root, "Project_Report.pdf");

function mdToHtml(md: string): string {
  const withCode = md.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_, _lang, code) =>
      `<pre class="code-block">${escapeHtml(code.trim())}</pre>`,
  );
  const lines = withCode.split("\n");
  const out: string[] = [];
  let inTable = false;
  let inList = false;

  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  const flushTable = () => {
    if (inTable) {
      out.push("</tbody></table>");
      inTable = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      flushList();
      flushTable();
      out.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      flushTable();
      out.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      flushTable();
      out.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("---")) {
      flushList();
      flushTable();
      out.push("<hr />");
      continue;
    }
    if (line.startsWith("|")) {
      flushList();
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c.replace(/:/g, "")))) {
        continue;
      }
      if (!inTable) {
        out.push('<table><tbody>');
        inTable = true;
      }
      const tag = out.filter((l) => l.includes("<tr>")).length === 0 && inTable ? "th" : "td";
      if (tag === "th") {
        out.push("<tr>" + cells.map((c) => `<th>${inlineFormat(c)}</th>`).join("") + "</tr>");
      } else {
        out.push("<tr>" + cells.map((c) => `<td>${inlineFormat(c)}</td>`).join("") + "</tr>");
      }
      continue;
    }
    flushTable();
    if (line.startsWith("- ")) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineFormat(line.slice(2))}</li>`);
      continue;
    }
    flushList();
    if (line.startsWith("```")) {
      continue;
    }
    if (!line.trim()) {
      out.push("<br />");
      continue;
    }
    out.push(`<p>${inlineFormat(line)}</p>`);
  }
  flushList();
  flushTable();
  return out.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineFormat(s: string): string {
  let t = escapeHtml(s);
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  return t;
}

async function main() {
  const md = readFileSync(mdPath, "utf8");
  const body = mdToHtml(md);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Pharm LMS — Project Report</title>
  <style>
    @page { margin: 18mm 16mm; size: A4; }
    body {
      font-family: "Segoe UI", system-ui, sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
      color: #191c1d;
      max-width: 100%;
    }
    h1 {
      font-size: 22pt;
      color: #0f5238;
      border-bottom: 3px solid #0f5238;
      padding-bottom: 8px;
      margin-top: 0;
    }
    h2 {
      font-size: 14pt;
      color: #0f5238;
      margin-top: 22px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11.5pt;
      color: #404943;
      margin-top: 14px;
    }
    p { margin: 6px 0; }
    ul { margin: 8px 0 8px 20px; padding: 0; }
    li { margin: 4px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    th { background: #f0fdf4; color: #0f5238; }
    code {
      font-family: Consolas, monospace;
      font-size: 9pt;
      background: #f3f4f6;
      padding: 1px 4px;
      border-radius: 3px;
    }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
    pre, .code-block {
      font-family: Consolas, monospace;
      font-size: 8.5pt;
      background: #f8fafb;
      border: 1px solid #e5e7eb;
      padding: 10px;
      white-space: pre-wrap;
      margin: 10px 0;
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  const pdf = await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
  });
  await browser.close();
  console.log(`Wrote ${outPath} (${pdf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
