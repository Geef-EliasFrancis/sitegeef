import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3500";
const outputDir = "test-artifacts/musicas-all";
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  const listPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await listPage.goto(`${baseUrl}/musicas`, { waitUntil: "networkidle" });
  const links = await listPage.locator(".musica-catalog-title-link").evaluateAll((items) =>
    items.map((item) => ({ href: item.href, title: item.textContent?.trim() ?? "" })),
  );
  if (links.length === 0) throw new Error("Nenhuma música encontrada no catálogo");
  await listPage.screenshot({ path: `${outputDir}/catalogo-1440.png`, fullPage: true });
  await listPage.close();

  for (const [index, item] of links.entries()) {
    const slug = new URL(item.href).pathname.split("/").filter(Boolean).pop() ?? String(index);
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(item.href, { waitUntil: "networkidle" });
    const desktop = await page.evaluate(() => ({
      title: Boolean(document.querySelector("h1")),
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));
    await page.screenshot({ path: `${outputDir}/${String(index + 1).padStart(2, "0")}-${slug}-desktop.png`, fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    const mobile = await page.evaluate(() => ({
      title: Boolean(document.querySelector("h1")),
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    }));
    await page.screenshot({ path: `${outputDir}/${String(index + 1).padStart(2, "0")}-${slug}-mobile.png`, fullPage: true });
    await page.close();
    if (!desktop.title || !mobile.title || desktop.overflow || mobile.overflow) {
      throw new Error(`Falha visual em ${item.title}: ${JSON.stringify({ desktop, mobile })}`);
    }
    results.push({ index: index + 1, title: item.title, desktop, mobile });
  }

  const projector = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await projector.goto(`${baseUrl}/musicas/exibir`, { waitUntil: "networkidle" });
  const projectorResult = await projector.evaluate(() => ({
    viewport: `${innerWidth}x${innerHeight}`,
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    overflowY: document.documentElement.scrollHeight > innerHeight + 1,
  }));
  await projector.screenshot({ path: `${outputDir}/projetor-1920x1080.png`, fullPage: true });
  await projector.close();
  if (projectorResult.overflowX || projectorResult.overflowY) throw new Error(`Overflow na tela de projetor: ${JSON.stringify(projectorResult)}`);

  console.log(JSON.stringify({ ok: true, total: results.length, projector: projectorResult, outputDir }, null, 2));
} finally {
  await browser.close();
}
