/**
 * Generate docs/EC2_Deployment_Guide.pdf from docs/DEPLOYMENT-EC2.md
 * Usage: pnpm run deploy-ec2:pdf
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const mdPath = resolve(root, "docs/DEPLOYMENT-EC2.md");
const outPath = resolve(root, "docs/EC2_Deployment_Guide.pdf");

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
        out.push("<table><tbody>");
        inTable = true;
      }
      const tag =
        out.filter((l) => l.includes("<tr>")).length === 0 && inTable
          ? "th"
          : "td";
      if (tag === "th") {
        out.push(
          "<tr>" +
            cells.map((c) => `<th>${inlineFormat(c)}</th>`).join("") +
            "</tr>",
        );
      } else {
        out.push(
          "<tr>" +
            cells.map((c) => `<td>${inlineFormat(c)}</td>`).join("") +
            "</tr>",
        );
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
  <title>Pharm LMS — EC2 Deployment Guide</title>
  <style>
    @page { margin: 16mm 14mm; size: A4; }
    body {
      font-family: "Segoe UI", system-ui, sans-serif;
      font-size: 10pt;
      line-height: 1.42;
      color: #191c1d;
      max-width: 100%;
    }
    h1 {
      font-size: 20pt;
      color: #1e40af;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 8px;
      margin-top: 0;
    }
    h2 {
      font-size: 13pt;
      color: #1e40af;
      margin-top: 20px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      color: #404943;
      margin-top: 12px;
      page-break-after: avoid;
    }
    p { margin: 5px 0; }
    ul { margin: 6px 0 6px 18px; padding: 0; }
    li { margin: 3px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #d1d7dc;
      padding: 5px 7px;
      text-align: left;
      vertical-align: top;
    }
    th { background: #eff6ff; color: #1e40af; }
    code {
      font-family: Consolas, "Courier New", monospace;
      font-size: 8.5pt;
      background: #f3f4f6;
      padding: 1px 4px;
      border-radius: 3px;
    }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 14px 0; }
    pre, .code-block {
      font-family: Consolas, "Courier New", monospace;
      font-size: 8pt;
      background: #f8fafb;
      border: 1px solid #d1d7dc;
      padding: 8px 10px;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 8px 0;
      page-break-inside: avoid;
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
    margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
  });
  await browser.close();
  console.log(`Wrote ${outPath} (${pdf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
