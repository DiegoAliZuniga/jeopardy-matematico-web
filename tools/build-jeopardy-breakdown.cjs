const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const INPUT = "C:\\Users\\Lenovo T14s\\Downloads\\jeopardy-matematico (3).json";
const OUTPUT_DIR = path.join(ROOT, "output", "pdf");
const ASSET_DIR = path.join(OUTPUT_DIR, "jeopardy-pne-assets");
const TMP_DIR = path.join(ROOT, "tmp", "pdfs");
const PDF_PATH = path.join(OUTPUT_DIR, "jeopardy-pne-preguntas-respuestas.pdf");
const TEX_PATH = path.join(OUTPUT_DIR, "jeopardy-pne-preguntas-respuestas.tex");
const HTML_PATH = path.join(TMP_DIR, "jeopardy-pne-preguntas-respuestas.html");
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(ASSET_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

for (const filename of fs.readdirSync(ASSET_DIR)) {
  if (filename.endsWith(".png")) fs.rmSync(path.join(ASSET_DIR, filename));
}

const game = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const imageFiles = new Map();

function htmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function latexEscapeText(value) {
  const text = String(value ?? "");
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*\$)/g);
  return parts.map((part) => {
    if ((part.startsWith("$$") && part.endsWith("$$")) || (part.startsWith("$") && part.endsWith("$"))) {
      return part;
    }
    return part
      .replaceAll("\\", "\\textbackslash{}")
      .replaceAll("&", "\\&")
      .replaceAll("%", "\\%")
      .replaceAll("#", "\\#")
      .replaceAll("_", "\\_")
      .replaceAll("{", "\\{")
      .replaceAll("}", "\\}")
      .replaceAll("~", "\\textasciitilde{}")
      .replaceAll("^", "\\textasciicircum{}");
  }).join("");
}

function isImage(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function imageName(source) {
  if (!isImage(source)) return "";
  if (imageFiles.has(source)) return imageFiles.get(source);
  const hash = crypto.createHash("sha256").update(source).digest("hex").slice(0, 14);
  const filename = `diagrama-${hash}.png`;
  imageFiles.set(source, filename);
  return filename;
}

function imageHtml(source, alt) {
  if (!isImage(source)) return "";
  imageName(source);
  return `<figure class="diagram-wrap"><img class="diagram" src="${source}" alt="${htmlEscape(alt)}"></figure>`;
}

function imageLatex(source) {
  if (!isImage(source)) return "";
  const filename = imageName(source);
  return `\\begin{center}\n\\includegraphics[width=0.80\\linewidth,height=0.27\\textheight,keepaspectratio]{${filename}}\n\\end{center}\n`;
}

function fieldHtml(label, value, cssClass = "") {
  if (!value) return "";
  return `<div class="field ${cssClass}"><strong>${label}</strong><div>${htmlEscape(value)}</div></div>`;
}

function clueHtml(category, clue) {
  const explanationImage = clue.explanationImage && clue.explanationImage !== clue.questionImage
    ? imageHtml(clue.explanationImage, `Retroalimentación de ${category}, ${clue.value} puntos`)
    : "";
  return `<article class="clue">
    <div class="clue-head"><span>${htmlEscape(category)}</span><b>$${Number(clue.value).toLocaleString("es-CR")}</b></div>
    ${fieldHtml("Pregunta", clue.question, "question")}
    ${imageHtml(clue.questionImage, `Pregunta de ${category}, ${clue.value} puntos`)}
    ${fieldHtml("Respuesta", clue.answer, "answer")}
    ${fieldHtml("Pista", clue.hint, "hint")}
    ${fieldHtml("Explicación", clue.explanation, "explanation")}
    ${explanationImage}
  </article>`;
}

function clueLatex(category, clue) {
  const explanationImage = clue.explanationImage && clue.explanationImage !== clue.questionImage
    ? imageLatex(clue.explanationImage)
    : "";
  return `
\\subsection*{\\textcolor{DeepBlue}{${latexEscapeText(category)}} \\hfill \\$${Number(clue.value).toLocaleString("es-CR")}}
\\textbf{Pregunta.} ${latexEscapeText(clue.question)}

${imageLatex(clue.questionImage)}
\\textbf{Respuesta.} ${latexEscapeText(clue.answer)}

\\textbf{Pista.} ${latexEscapeText(clue.hint)}

\\textbf{Explicación.} ${latexEscapeText(clue.explanation)}

${explanationImage}
\\vspace{0.8em}
\\hrule
\\vspace{1.1em}
`;
}

function buildHtml() {
  const categorySummary = game.categories.map((category) => `<li><span>${htmlEscape(category.title)}</span><b>${category.clues.length} preguntas</b></li>`).join("");
  const categories = game.categories.map((category) => `
    <section class="category">
      <header class="category-title"><span>Categoría</span><h2>${htmlEscape(category.title)}</h2></header>
      ${category.clues.map((clue) => clueHtml(category.title, clue)).join("\n")}
    </section>`).join("\n");
  const finalExplanationImage = game.final.explanationImage && game.final.explanationImage !== game.final.questionImage
    ? imageHtml(game.final.explanationImage, "Retroalimentación del reto final")
    : "";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${htmlEscape(game.title)} - Preguntas y respuestas</title>
  <script>
    window.MathJax = {
      tex: { inlineMath: [["$", "$"], ["\\\\(", "\\\\)"]], displayMath: [["$$", "$$"], ["\\\\[", "\\\\]"]] },
      chtml: { scale: 0.96, matchFontHeight: false },
      startup: { typeset: false }
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
  <style>
    :root { --ink:#11333d; --blue:#126d87; --cyan:#dff2f6; --green:#278c61; --green-bg:#eaf7f0; --yellow:#f2c94c; --yellow-bg:#fff8dc; --coral:#df6a56; --line:#c8d8dc; --paper:#ffffff; --soft:#f4f8f9; }
    * { box-sizing: border-box; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; color: var(--ink); background: var(--paper); font-family: "Segoe UI", Arial, sans-serif; font-size: 10.7pt; line-height: 1.45; }
    .cover { min-height: 235mm; display: flex; flex-direction: column; justify-content: center; page-break-after: always; padding: 12mm 8mm; }
    .cover-mark { width: 78px; height: 78px; display: grid; place-items: center; border-radius: 14px; color: white; background: var(--blue); font-size: 24px; font-weight: 800; border: 5px solid var(--yellow); }
    .eyebrow { margin: 24px 0 8px; color: var(--blue); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; }
    h1 { margin: 0; max-width: 165mm; color: #082f3b; font-size: 31pt; line-height: 1.05; letter-spacing: 0; }
    .subtitle { max-width: 150mm; margin: 16px 0 24px; color: #567078; font-size: 14pt; }
    .summary { max-width: 150mm; padding: 15px 20px; background: var(--soft); border-left: 6px solid var(--yellow); }
    .summary ul { margin: 8px 0 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 5px 22px; }
    .summary li { display: flex; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--line); padding: 4px 0; }
    .summary b { color: var(--blue); white-space: nowrap; }
    .source-note { margin-top: 20px; color: #627980; font-size: 9.5pt; }
    .category { page-break-before: always; }
    .category-title { margin-bottom: 15px; border-bottom: 4px solid var(--yellow); }
    .category-title span { color: var(--blue); font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; }
    .category-title h2 { margin: 2px 0 8px; color: #082f3b; font-size: 24pt; letter-spacing: 0; }
    .clue { margin: 0 0 13px; padding: 13px 15px; border: 1.5px solid var(--line); border-radius: 7px; break-inside: avoid; }
    .clue-head { display: flex; justify-content: space-between; align-items: center; margin: -13px -15px 11px; padding: 7px 12px; color: white; background: var(--blue); border-radius: 6px 6px 0 0; }
    .clue-head span { font-size: 9pt; font-weight: 700; text-transform: uppercase; }
    .clue-head b { color: var(--yellow); font-size: 13pt; }
    .field { display: grid; grid-template-columns: 26mm 1fr; gap: 8px; margin: 7px 0; }
    .field strong { color: var(--blue); }
    .field.answer { padding: 8px 10px; background: var(--green-bg); border-left: 4px solid var(--green); }
    .field.answer strong { color: var(--green); }
    .field.hint { padding: 7px 10px; background: var(--yellow-bg); border-left: 4px solid var(--yellow); }
    .field.explanation { padding-top: 7px; border-top: 1px solid var(--line); }
    .diagram-wrap { margin: 8px 0 10px; text-align: center; }
    .diagram { display: block; max-width: 82%; max-height: 205px; margin: 0 auto; object-fit: contain; border: 1px solid #d6e1e4; border-radius: 5px; }
    .final { page-break-before: always; }
    .final .clue-head { background: #514299; }
    mjx-container { margin: 0 0.05em !important; }
  </style>
</head>
<body>
  <section class="cover">
    <div class="cover-mark">PNE</div>
    <div class="eyebrow">Desglose docente</div>
    <h1>${htmlEscape(game.title)}</h1>
    <p class="subtitle">Preguntas, respuestas, pistas y retroalimentaciones organizadas por categoría y puntuación.</p>
    <div class="summary"><strong>Contenido del documento</strong><ul>${categorySummary}</ul></div>
    <p class="source-note">Configuración fuente: jeopardy-matematico (3).json. Incluye ${game.categories.reduce((sum, category) => sum + category.clues.length, 0)} preguntas y un reto final.</p>
  </section>
  ${categories}
  <section class="category final">
    <header class="category-title"><span>Ronda de cierre</span><h2>${htmlEscape(game.final.category || "Reto final")}</h2></header>
    <article class="clue">
      <div class="clue-head"><span>Reto final</span><b>Apuesta libre</b></div>
      ${fieldHtml("Pregunta", game.final.question, "question")}
      ${imageHtml(game.final.questionImage, "Pregunta del reto final")}
      ${fieldHtml("Respuesta", game.final.answer, "answer")}
      ${fieldHtml("Explicación", game.final.explanation, "explanation")}
      ${finalExplanationImage}
    </article>
  </section>
</body>
</html>`;
}

function buildLatex() {
  const categoryList = game.categories.map((category) => `\\item ${latexEscapeText(category.title)}: ${category.clues.length} preguntas.`).join("\n");
  const finalCategory = String(game.final.category || "Reto final").replace(/^Reto final:\s*/i, "");
  const categories = game.categories.map((category) => `
\\clearpage
\\section*{${latexEscapeText(category.title)}}
\\addcontentsline{toc}{section}{${latexEscapeText(category.title)}}
${category.clues.map((clue) => clueLatex(category.title, clue)).join("\n")}
`).join("\n");
  const finalExplanationImage = game.final.explanationImage && game.final.explanationImage !== game.final.questionImage
    ? imageLatex(game.final.explanationImage)
    : "";

  return `\\documentclass[11pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[spanish]{babel}
\\usepackage{lmodern}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage[margin=2.1cm]{geometry}
\\usepackage{fancyhdr}
\\usepackage{parskip}
\\usepackage{enumitem}
\\definecolor{DeepBlue}{HTML}{126D87}
\\definecolor{DarkInk}{HTML}{082F3B}
\\definecolor{AnswerGreen}{HTML}{278C61}
\\graphicspath{{jeopardy-pne-assets/}}
\\pagestyle{fancy}
\\fancyhf{}
\\lhead{${latexEscapeText(game.title)}}
\\rhead{Preguntas y respuestas}
\\cfoot{\\thepage}
\\setlength{\\headheight}{14pt}
\\setlength{\\parindent}{0pt}
\\begin{document}

\\begin{titlepage}
\\color{DarkInk}
\\vspace*{3cm}
{\\color{DeepBlue}\\bfseries\\MakeUppercase{Desglose docente}}\\par
\\vspace{0.8cm}
{\\Huge\\bfseries ${latexEscapeText(game.title)}}\\par
\\vspace{0.7cm}
{\\Large Preguntas, respuestas, pistas y retroalimentaciones}\\par
\\vspace{1.5cm}
\\rule{\\textwidth}{1.5pt}
\\vspace{0.7cm}
\\begin{itemize}[leftmargin=1.5em]
${categoryList}
\\item Reto final: ${latexEscapeText(finalCategory)}.
\\end{itemize}
\\vfill
Configuración fuente: \\texttt{jeopardy-matematico (3).json}.
\\end{titlepage}

\\tableofcontents
${categories}

\\clearpage
\\section*{${latexEscapeText(game.final.category || "Reto final")}}
\\addcontentsline{toc}{section}{Reto final}
\\subsection*{\\textcolor{DeepBlue}{Reto final} \\hfill Apuesta libre}
\\textbf{Pregunta.} ${latexEscapeText(game.final.question)}

${imageLatex(game.final.questionImage)}
\\textbf{Respuesta.} ${latexEscapeText(game.final.answer)}

\\textbf{Explicación.} ${latexEscapeText(game.final.explanation)}

${finalExplanationImage}
\\end{document}
`;
}

async function renderImages(browser) {
  const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2 });
  for (const [source, filename] of imageFiles.entries()) {
    await page.setContent(`<style>html,body{margin:0;width:960px;height:540px;background:white;overflow:hidden}img{display:block;width:960px;height:540px;object-fit:contain}</style><img src="${source}">`, { waitUntil: "load" });
    await page.waitForFunction(() => document.querySelector("img")?.complete && document.querySelector("img")?.naturalWidth > 0);
    await page.screenshot({ path: path.join(ASSET_DIR, filename), type: "png" });
  }
  await page.close();
}

async function renderPdf(browser, html) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load", timeout: 120000 });
  await page.waitForFunction(() => window.MathJax?.startup?.promise, null, { timeout: 120000 });
  await page.evaluate(async () => {
    await window.MathJax.startup.promise;
    await window.MathJax.typesetPromise();
    await document.fonts.ready;
  });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: PDF_PATH,
    format: "Letter",
    printBackground: true,
    displayHeaderFooter: true,
    margin: { top: "18mm", right: "15mm", bottom: "18mm", left: "15mm" },
    headerTemplate: `<div style="width:100%;padding:0 15mm;font:9px Arial;color:#587078;border-bottom:1px solid #d6e1e4;">${htmlEscape(game.title)}</div>`,
    footerTemplate: `<div style="width:100%;padding:0 15mm;font:9px Arial;color:#587078;text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`
  });
  await page.close();
}

(async () => {
  const html = buildHtml();
  const latex = buildLatex();
  fs.writeFileSync(HTML_PATH, html, "utf8");
  fs.writeFileSync(TEX_PATH, latex, "utf8");

  const browser = await chromium.launch({ headless: true, executablePath: EDGE_PATH });
  try {
    await renderImages(browser);
    await renderPdf(browser, html);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify({
    pdf: PDF_PATH,
    tex: TEX_PATH,
    categories: game.categories.length,
    clues: game.categories.reduce((sum, category) => sum + category.clues.length, 0),
    images: imageFiles.size,
    pdfBytes: fs.statSync(PDF_PATH).size,
    texBytes: fs.statSync(TEX_PATH).size
  }, null, 2));
})();
