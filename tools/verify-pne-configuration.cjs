const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "configuraciones", "jeopardy-pne-matematica-2026.json");
const screenshotPath = path.join(root, "tmp", "pne-qa", "pne-game.png");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 3187;

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForServer(url) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await delay(150);
  }
  throw new Error("El servidor local no respondió a tiempo.");
}

(async () => {
  const game = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const server = spawn(process.execPath, [path.join(root, "server.js"), String(port)], {
    cwd: root,
    stdio: "ignore"
  });
  let browser;

  try {
    await waitForServer(`http://127.0.0.1:${port}/api/info`);
    browser = await chromium.launch({ headless: true, executablePath: edgePath });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.addInitScript((payload) => {
      localStorage.setItem("jeopardy-matematico-state-v6", JSON.stringify(payload));
    }, game);
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await page.click("#startGameBtn");
    await page.waitForSelector(".clue-card");

    const report = await page.evaluate(() => ({
      title: document.querySelector("#gameTitle")?.textContent,
      categories: document.querySelectorAll(".category-card").length,
      clues: document.querySelectorAll(".clue-card").length,
      firstRow: [...document.querySelectorAll(".clue-card")].slice(0, 6).map((node) => node.textContent.trim()),
      teamScores: [...document.querySelectorAll(".team-score")].map((node) => node.textContent.trim())
    }));

    await page.locator(".clue-card").nth(1).click();
    await page.waitForSelector("#clueModal:not(.hidden)");
    const imageReport = await page.evaluate(async () => {
      const image = document.querySelector("#questionText img");
      if (!image) return { present: false };
      if (!image.complete) await new Promise((resolve) => image.addEventListener("load", resolve, { once: true }));
      return {
        present: true,
        width: image.naturalWidth,
        height: image.naturalHeight,
        source: image.src.slice(0, 30)
      };
    });

    await page.screenshot({ path: screenshotPath, fullPage: true });
    const result = { ...report, questionImage: imageReport, screenshot: screenshotPath };
    console.log(JSON.stringify(result, null, 2));

    if (report.categories !== 6 || report.clues !== 30 || !imageReport.present || imageReport.width <= 0) {
      process.exitCode = 1;
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})();
