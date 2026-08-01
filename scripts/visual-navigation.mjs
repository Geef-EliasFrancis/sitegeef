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
  const primarySegments = await page.locator(".site-nav-primary > *").count();
  if (primarySegments !== 7 || await page.locator(".site-nav-home-btn").count() !== 1) {
    throw new Error(`Barra fora do formato HOME + 5 menus + CONTATO: segmentos=${primarySegments}`);
  }

  let submenuCount = 0;
  for (let index = 0; index < groupCount; index += 1) {
    await groups.nth(index).click();
    const dropdown = page.locator(".site-context-navigation").first();
    await dropdown.waitFor({ state: "visible" });
    await page.waitForTimeout(120);
    const dropdownBox = await dropdown.boundingBox();
    if (!dropdownBox || dropdownBox.width < 180 || dropdownBox.height < 60) {
      throw new Error(`Dropdown desktop não está visualmente aberto na aba ${index + 1}: ${JSON.stringify(dropdownBox)}`);
    }
    const currentSubmenuCount = await dropdown.locator("a").count();
    if (currentSubmenuCount < 3) throw new Error(`Dropdown sem submenus suficientes na aba ${index + 1}: ${currentSubmenuCount}`);
    submenuCount = Math.max(submenuCount, currentSubmenuCount);
    const visualState = await page.evaluate(() => {
      const ribbon = document.querySelector(".site-nav-primary");
      const active = document.querySelector('.site-nav-group-trigger[data-state="active"]');
      const inactive = document.querySelector('.site-nav-group-trigger:not([data-state="active"])');
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
        railBackgroundColor: ribbonRail.backgroundColor,
        activeShadow: activeStyle.boxShadow,
      };
    });
    if (!visualState) throw new Error(`Estado visual ausente na aba ${index + 1}`);
    if (visualState.activeTop >= visualState.inactiveTop || visualState.activeHeight <= visualState.inactiveHeight) {
      throw new Error(`Aba ativa não está elevada na aba ${index + 1}: ${JSON.stringify(visualState)}`);
    }
    if (visualState.activeBackground === "none" || visualState.activeColor === "rgb(28, 32, 31)") {
      throw new Error(`Contraste insuficiente na aba ${index + 1}: ${JSON.stringify(visualState)}`);
    }
    if ((visualState.railBackground === "none" && visualState.railBackgroundColor === "rgba(0, 0, 0, 0)") || visualState.activeShadow === "none") {
      throw new Error(`Acabamento visual ausente na aba ${index + 1}: ${JSON.stringify(visualState)}`);
    }
  }
  const animationName = await page.locator(".site-context-navigation").first().evaluate((element) => getComputedStyle(element).animationName);
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
