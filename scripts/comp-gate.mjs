import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.COMP_GATE_BASE_URL ?? 'http://127.0.0.1:3500';
const storageState = process.env.COMP_GATE_STORAGE_STATE;
const requireLive = process.env.COMP_GATE_REQUIRE_LIVE === '1';
const outputDir = 'test-artifacts/comp-gate';
const routes = ['/admin/painel', '/admin/reuniao-publica', '/admin/reuniao-publica/musicas', '/admin/escalas', '/admin/financeiro'];
const viewports = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 1024, height: 768, name: 'tablet-wide' },
  { width: 900, height: 900, name: 'tablet-compact' },
  { width: 768, height: 1024, name: 'tablet-narrow' },
  { width: 390, height: 844, name: 'mobile' },
];

const adminCss = fs.readFileSync('styles/admin.css', 'utf8');
const sidebarCss = fs.readFileSync('styles/admin-sidebar.css', 'utf8');
const musicCatalogSource = fs.readFileSync('components/admin/musicas/musicas-catalog-table.tsx', 'utf8');
const adminHeaderSource = fs.readFileSync('components/admin/admin-header.tsx', 'utf8');
const shellTabsBlock = adminCss.match(/\.admin-shell-tabs\s*\{[^}]*\}/s)?.[0] ?? '';
const responsiveContract = [
  ['header tablet em duas colunas', adminCss.includes('grid-template-columns: minmax(0, 1fr) auto')],
  ['abas com seis colunas compactas', adminCss.includes('grid-template-columns: repeat(6, minmax(0, 1fr))')],
  ['abas não usam wrap', !shellTabsBlock.includes('flex-wrap: wrap')],
  ['drawer limitado ao mobile', sidebarCss.includes('@media (max-width: 767px)')],
  ['rail tablet explicitamente visível', sidebarCss.includes('Tablet: o rail continua visível')],
  ['conteúdo pode encolher', adminCss.includes('.admin-main') && adminCss.includes('min-width: 0')],
  ['catálogo tem busca móvel recolhida', musicCatalogSource.includes('music-catalog-search-toggle') && musicCatalogSource.includes('setSearchOpen(false)')],
  ['catálogo tem ação móvel por ícone', musicCatalogSource.includes('music-catalog-create-label') && adminCss.includes('.music-catalog-create-label')],
  ['top menu móvel tem ícones e tooltip', adminHeaderSource.includes('admin-shell-tab-icon') && adminHeaderSource.includes('title={`${item.label}: ${item.note}`}') && adminCss.includes('.admin-shell-tab-label')],
  ['top menu móvel compartilha linha com usuário', adminCss.includes('grid-template-columns: minmax(0, 1fr) auto') && adminCss.includes('.admin-header-right')],
];

for (const [name, passed] of responsiveContract) console.log(`${passed ? '✓' : '✗'} contrato: ${name}`);
if (responsiveContract.some(([, passed]) => !passed)) process.exit(1);

if (!storageState) {
  const message = 'Live gate ignorado: defina COMP_GATE_STORAGE_STATE com uma sessão autenticada.';
  if (requireLive) {
    console.error(`✗ ${message}`);
    process.exit(1);
  }
  console.log(`⚠ ${message}`);
  console.log('Gate composto aprovado em modo estrutural. CI/entrega deve usar COMP_GATE_REQUIRE_LIVE=1.');
  process.exit(0);
}

await fsPromises.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];

try {
  for (const viewport of viewports) {
    for (const route of routes) {
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, storageState });
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      const result = await page.evaluate(() => {
        const header = document.querySelector('.admin-header');
        const tabs = [...document.querySelectorAll('.admin-shell-tab')];
        const navigation = document.querySelector('.admin-navigation');
        const sidebar = document.querySelector('.admin-sidebar');
        const main = document.querySelector('.admin-main');
        const headerBox = header?.getBoundingClientRect();
        const middle = document.querySelector('.admin-header-middle')?.getBoundingClientRect();
        const right = document.querySelector('.admin-header-right')?.getBoundingClientRect();
        const tabTops = tabs.map((tab) => Math.round(tab.getBoundingClientRect().top));
        const noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
        const sameTabRow = tabTops.length < 2 || Math.max(...tabTops) - Math.min(...tabTops) <= 2;
        const sidebarVisible = window.innerWidth < 768 || (sidebar && getComputedStyle(sidebar).display !== 'none' && (navigation?.getBoundingClientRect().width ?? 0) > 0);
        return {
          noHorizontalOverflow,
          sameTabRow,
          sidebarVisible,
          headerHeight: headerBox?.height ?? 0,
          headerSingleRow: window.innerWidth >= 768 || !middle || !right || Math.abs(middle.top - right.top) <= 3,
          loginRedirect: location.pathname === '/login',
        };
      });
      if (route.endsWith('/musicas') && viewport.width < 768 && !result.loginRedirect) {
        const searchToggle = page.locator('.music-catalog-search-toggle');
        const titleRow = page.locator('.admin-page-title-row');
        const mobileSearch = page.locator('.music-catalog-mobile-search');
        if (await searchToggle.count() !== 1 || await titleRow.count() !== 1 || await mobileSearch.count() !== 0) {
          failures.push(`${route} @ ${viewport.width}x${viewport.height}: busca móvel não inicia recolhida`);
        } else {
          await searchToggle.click();
          if (await page.locator('.music-catalog-mobile-search').count() !== 1 || await page.locator('.admin-page-title-row').count() !== 0) {
            failures.push(`${route} @ ${viewport.width}x${viewport.height}: busca móvel não expandiu substituindo o título`);
          }
          await page.locator('.music-catalog-search-close').click();
          if (await page.locator('.admin-page-title-row').count() !== 1) {
            failures.push(`${route} @ ${viewport.width}x${viewport.height}: título não voltou após fechar busca`);
          }
        }
      }
      await page.screenshot({ path: `${outputDir}/${viewport.name}-${route.replaceAll('/', '_') || 'root'}.png`, fullPage: true });
      await page.close();

      const errors = [];
      if (!response || response.status() >= 400) errors.push(`HTTP ${response?.status() ?? 'sem resposta'}`);
      if (result.loginRedirect) errors.push('sessão não autenticada');
      if (!result.noHorizontalOverflow) errors.push('overflow horizontal');
      if (viewport.width >= 768 && !result.sameTabRow) errors.push('top menu quebrou linha');
      if (viewport.width < 768 && !result.headerSingleRow) errors.push('header mobile quebrou linha');
      if (!result.sidebarVisible) errors.push('menu lateral oculto');
      if (errors.length) failures.push(`${route} @ ${viewport.width}x${viewport.height}: ${errors.join(', ')}`);
      console.log(`${errors.length ? '✗' : '✓'} ${route} @ ${viewport.width}x${viewport.height}`);
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\nGate composto reprovado: ${failures.length} cenário(s).`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('\nGate composto aprovado em todas as telas e resoluções.');
