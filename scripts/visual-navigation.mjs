import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3500";
const outputDir = "test-artifacts/navigation";
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

async function runDesktop(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outputDir}/desktop-${width}.png`, fullPage: true });

  const groups = page.locator(".site-nav-group-trigger");
  const groupCount = await groups.count();
  if (groupCount !== 5) throw new Error(`Esperados 5 grupos no desktop; encontrados ${groupCount}`);

  await groups.first().click();
  const dropdown = page.locator(".site-context-navigation").first();
  await dropdown.waitFor({ state: "visible" });
  await page.waitForTimeout(300);
  const dropdownBox = await dropdown.boundingBox();
  if (!dropdownBox || dropdownBox.width < 180 || dropdownBox.height < 80) {
    throw new Error(`Dropdown desktop não está visualmente aberto: ${JSON.stringify(dropdownBox)}`);
  }
  const submenuCount = await dropdown.locator("a").count();
  if (submenuCount < 3) throw new Error(`Dropdown sem submenus suficientes: ${submenuCount}`);
  const visualState = await page.evaluate(() => {
    const ribbon = document.querySelector(".site-nav-primary");
    const active = document.querySelector('.site-nav-group-trigger[aria-expanded="true"]');
    const inactive = document.querySelector('.site-nav-group-trigger[aria-expanded="false"]');
    if (!ribbon || !active || !inactive) return null;
    const activeStyle = getComputedStyle(active);
    const ribbonRail = getComputedStyle(ribbon, "::after");
    return {
      activeHeight: active.getBoundingClientRect().height,
      inactiveHeight: inactive.getBoundingClientRect().height,
      activeTop: active.getBoundingClientRect().top,
      inactiveTop: inactive.getBoundingClientRect().top,
      activeBackground: activeStyle.backgroundImage,
      activeColor: activeStyle.color,
      railBackground: ribbonRail.backgroundImage,
      activeShadow: activeStyle.boxShadow,
    };
  });
  if (!visualState) throw new Error("Estado visual da barra não foi encontrado");
  if (visualState.activeTop >= visualState.inactiveTop) throw new Error(`Aba ativa não está elevada: ${JSON.stringify(visualState)}`);
  if (visualState.activeBackground === "none" || visualState.activeColor === "rgb(28, 32, 31)") {
    throw new Error(`Contraste insuficiente na aba ativa: ${JSON.stringify(visualState)}`);
  }
  if (visualState.railBackground === "none" || visualState.activeShadow === "none") {
    throw new Error(`Acabamento visual ausente na barra: ${JSON.stringify(visualState)}`);
  }
  const animationName = await dropdown.evaluate((element) => getComputedStyle(element).animationName);
  if (animationName === "none") throw new Error("Dropdown desktop sem animação");
  const headerBox = await page.locator(".site-header").boundingBox();
  await page.screenshot({
    path: `${outputDir}/desktop-${width}-dropdown-focused.png`,
    clip: headerBox ? { x: 0, y: 0, width: Math.min(width, headerBox.width), height: Math.min(height, headerBox.y + headerBox.height + 280) } : undefined,
  });

  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  if (!noHorizontalOverflow) throw new Error(`Overflow horizontal em ${width}px`);
  results.push({ viewport: `${width}x${height}`, groups: groupCount, submenuCount, noHorizontalOverflow });
  await page.close();
}

async function runMobile(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outputDir}/mobile-${width}.png`, fullPage: true });

  const menu = page.locator(".site-mobile-menu-toggle");
  await menu.click();
  const mobileNavigation = page.locator("#site-mobile-navigation");
  await mobileNavigation.waitFor({ state: "visible" });
  await page.waitForTimeout(300);
  await mobileNavigation.locator(".site-mobile-nav-group-trigger").first().click();
  const mobileDropdownBox = await mobileNavigation.boundingBox();
  if (!mobileDropdownBox || mobileDropdownBox.width < 200 || mobileDropdownBox.height < 120) {
    throw new Error(`Menu mobile não está visualmente aberto: ${JSON.stringify(mobileDropdownBox)}`);
  }
  const submenuCount = await mobileNavigation.locator(".site-nav-dropdown-item").count();
  if (submenuCount < 3) throw new Error(`Accordion sem submenus suficientes: ${submenuCount}`);
  const mobileAnimationName = await mobileNavigation.evaluate((element) => getComputedStyle(element).animationName);
  if (mobileAnimationName === "none") throw new Error("Menu mobile sem animação");
  await page.screenshot({ path: `${outputDir}/mobile-${width}-submenu.png`, fullPage: true });

  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  if (!noHorizontalOverflow) throw new Error(`Overflow horizontal em ${width}px`);
  results.push({ viewport: `${width}x${height}`, groups: 5, submenuCount, noHorizontalOverflow });
  await page.close();
}

try {
  await runDesktop(1440, 900);
  await runDesktop(900, 900);
  await runMobile(390, 844);
  console.log(JSON.stringify({ ok: true, screenshots: outputDir, results }, null, 2));
} finally {
  await browser.close();
}
