const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const assetDir = path.join(root, "public", "pne-assets");
const outputDir = path.join(root, "tmp", "pne-qa");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

fs.mkdirSync(outputDir, { recursive: true });

const cards = fs.readdirSync(assetDir)
  .filter((filename) => filename.endsWith(".svg"))
  .sort()
  .map((filename) => {
    const data = fs.readFileSync(path.join(assetDir, filename), "utf8");
    const source = `data:image/svg+xml;base64,${Buffer.from(data).toString("base64")}`;
    return `<figure><img src="${source}" alt="${filename}"><figcaption>${filename}</figcaption></figure>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; font-family: Arial, sans-serif; background: #12333b; }
  main { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  figure { margin: 0; padding: 10px; background: #fff; border-radius: 8px; }
  img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: contain; }
  figcaption { padding: 8px 4px 2px; color: #17343d; font-size: 14px; font-weight: 700; }
</style>
</head>
<body><main>${cards}</main></body>
</html>`;

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: path.join(outputDir, "pne-assets-gallery.png"), fullPage: true });
  await browser.close();
  console.log(path.join(outputDir, "pne-assets-gallery.png"));
})();
