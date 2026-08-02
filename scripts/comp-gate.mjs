import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.COMP_GATE_BASE_URL ?? 'http://127.0.0.1:3500';
const storageState = process.env.COMP_GATE_STORAGE_STATE;
const requireLive = process.env.COMP_GATE_REQUIRE_LIVE === '1';
const outputDir = 'test-artifacts/comp-gate';
const routes = ['/admin/painel', '/admin/reuniao-publica', '/admin/reuniao-publica/musica/inicio', '/admin/reuniao-publica/musica/catalogo', '/admin/escalas', '/admin/financeiro'];
const viewports = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 1024, height: 768, name: 'tablet-wide' },
  { width: 900, height: 900, name: 'tablet-compact' },
  { width: 768, height: 1024, name: 'tablet-narrow' },
  { width: 390, height: 844, name: 'mobile' },
];

const adminCss = fs.readFileSync('styles/admin.css', 'utf8');
const sidebarCss = fs.readFileSync('styles/admin-sidebar.css', 'utf8');
const adminSidebarSource = fs.readFileSync('components/admin/admin-sidebar.tsx', 'utf8');
const musicCatalogSource = fs.readFileSync('components/admin/musicas/musicas-catalog-table.tsx', 'utf8');
const publicDisplaySource = fs.readFileSync('components/admin/musicas/musica-exibicao-publica-button.tsx', 'utf8');
const adminHeaderSource = fs.readFileSync('components/admin/admin-header.tsx', 'utf8');
const shellAreaSource = fs.readFileSync('components/admin/use-admin-shell-area.ts', 'utf8');
const nextConfigSource = fs.readFileSync('next.config.ts', 'utf8');
const dashboardSource = fs.readFileSync('components/admin/admin-dashboard-workspace.tsx', 'utf8');
const shellTabsBlock = adminCss.match(/\.admin-shell-tabs\s*\{[^}]*\}/s)?.[0] ?? '';
const responsiveContract = [
  ['header tablet em duas colunas', adminCss.includes('grid-template-columns: minmax(0, 1fr) auto')],
  ['abas com seis colunas compactas', adminCss.includes('grid-template-columns: repeat(6, minmax(0, 1fr))')],
  ['abas não usam wrap', !shellTabsBlock.includes('flex-wrap: wrap')],
  ['navegação contextual substitui o rail lateral', adminHeaderSource.includes('admin-context-menu') && fs.existsSync('components/admin/admin-sidebar.tsx')],
  ['conteúdo pode encolher', adminCss.includes('.admin-main') && adminCss.includes('min-width: 0')],
  ['catálogo tem busca móvel recolhida', musicCatalogSource.includes('music-catalog-search-toggle') && musicCatalogSource.includes('setSearchOpen(false)')],
  ['catálogo tem ação móvel por ícone', musicCatalogSource.includes('music-catalog-create-label') && adminCss.includes('.music-catalog-create-label')],
  ['catálogo não repete área no título', !musicCatalogSource.includes('>Reunião pública<') && !musicCatalogSource.includes('content-surface-note-inline')],
  ['catálogo não repete título da lista', !musicCatalogSource.includes('<h2>Catálogo</h2>') && !musicCatalogSource.includes('table-cell-text-muted')],
  ['catálogo móvel prioriza leitura', musicCatalogSource.includes('musica-catalog-table') && adminCss.includes('.musica-catalog-table') && adminCss.includes('grid-template-columns: minmax(0, 1.45fr)') && adminCss.includes('white-space: nowrap')],
  ['catálogo móvel reduz tom e status', adminCss.includes('.musica-catalog-table th:nth-child(3)') && adminCss.includes('.musica-catalog-table th:nth-child(5)')],
  ['catálogo usa ações por ícone', publicDisplaySource.includes('IconBroadcast') && adminCss.includes('.musica-public-toggle-button span') && adminCss.includes('.music-catalog-row-action span')],
  ['top menu compacto sem ícones e com tooltip', !adminHeaderSource.includes('shellIcons') && adminHeaderSource.includes('title={`${item.label}: ${item.note}`}') && adminCss.includes('.admin-shell-tab-label')],
  ['top menu compartilha linha com usuário', adminCss.includes('grid-template-columns: minmax(0, 1fr) auto') && adminCss.includes('.admin-header-right') && adminCss.includes('.admin-header .admin-brand')],
  ['submenu reunião pública possui cinco entradas', ['Avisos', 'Música', 'Leitura', 'Palestra', 'Prece'].every((label) => adminHeaderSource.includes(`label: '${label}'`)) && adminHeaderSource.includes('admin-context-menu')],
  ['submenu Música possui início catálogo autores e sessões', ['Início', 'Catálogo', 'Autores', 'Sessões'].every((label) => adminHeaderSource.includes(`label: '${label}'`)) && adminHeaderSource.includes('musicContextMenuItems') && adminHeaderSource.includes('/admin/reuniao-publica/musica/catalogo')],
  ['submenu contextual é restrito às áreas configuradas', adminHeaderSource.includes("'reuniao-publica': [") && adminHeaderSource.includes('contextMenuItems &&')],
  ['submenu GEEF possui instituição e seis telas', ['Início', 'Instituição', 'Dados', 'Endereço', 'Agenda', 'Departamentos', 'Contas'].every((label) => adminHeaderSource.includes(`label: '${label}'`)) && adminHeaderSource.includes("geef: [")],
  ['submenu Tarefeiros possui início pessoas e funções', ['Início', 'Pessoas', 'Funções'].every((label) => adminHeaderSource.includes(`label: '${label}'`)) && adminHeaderSource.includes("pessoas: [") && fs.existsSync('app/admin/pessoas/inicio/page.tsx')],
  ['submenu Sistema possui cinco telas', ['Início', 'Observabilidade', 'Migrações', 'Idiomas', 'Fix Usuários'].every((label) => adminHeaderSource.includes(`label: '${label}'`)) && adminHeaderSource.includes("sistema: [")],
  ['home do painel não duplica o início no submenu', !adminHeaderSource.includes('painel: [')],
  ['contextos administrativos possuem submenu', ['perfil: [', 'geef: [', 'pessoas: [', "'reuniao-publica': [", 'governanca: [', 'documentos: [', 'operacao: [', 'sistema: ['].every((context) => adminHeaderSource.includes(context))],
  ['rotas canônicas seguem menu e submenu', nextConfigSource.includes('contextualRouteRewrites') && nextConfigSource.includes('/admin/geef/instituicao') && nextConfigSource.includes('/admin/pessoas/funcoes') && nextConfigSource.includes('/admin/operacao/${submenu}') && nextConfigSource.includes('/admin/sistema/observabilidade')],
  ['funções pertencem à área Tarefeiros', shellAreaSource.includes('normalizedPath.startsWith("/admin/funcoes")') && shellAreaSource.includes('return "pessoas"') && !shellAreaSource.match(/normalizedPath\.startsWith\("\/admin\/funcoes"\)[\s\S]{0,180}return "geef"/)],
  ['atalhos GEEF foram centralizados', !adminSidebarSource.includes('href="/admin/instituicao/identificacao"') && !adminSidebarSource.includes('href="/admin/instituicao/endereco"') && !adminSidebarSource.includes('href="/admin/instituicao/contas"') && !adminSidebarSource.includes('href="/admin/departamentos"') && !dashboardSource.includes('href: "/admin/departamentos"')],
  ['atalhos Sistema saíram dos corpos', !adminSidebarSource.includes('href="/admin/migrations"') && !adminSidebarSource.includes('href="/admin/fix-usuarios"') && !dashboardSource.includes('href: "/admin/observability"')],
  ['submenu contextual é responsivo', adminCss.includes('.admin-context-menu-item') && adminCss.includes('overflow-x: auto')],
  ['painel possui variante compacta', dashboardSource.includes('admin-dashboard-page--panel') && adminCss.includes('.admin-dashboard-page--panel .admin-dashboard-mini-card')],
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
        const main = document.querySelector('.admin-main');
        const headerBox = header?.getBoundingClientRect();
        const middle = document.querySelector('.admin-header-middle')?.getBoundingClientRect();
        const right = document.querySelector('.admin-header-right')?.getBoundingClientRect();
        const tabTops = tabs.map((tab) => Math.round(tab.getBoundingClientRect().top));
        const noHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
        const catalog = document.querySelector('.musica-catalog-table');
        const catalogNoOverflow = !catalog || catalog.scrollWidth <= catalog.clientWidth + 1;
        const sameTabRow = tabTops.length < 2 || Math.max(...tabTops) - Math.min(...tabTops) <= 2;
        const sidebarRemoved = !document.querySelector('.admin-sidebar') && !document.querySelector('.admin-navigation');
        return {
          noHorizontalOverflow,
          catalogNoOverflow,
          sameTabRow,
          sidebarRemoved,
          headerHeight: headerBox?.height ?? 0,
          headerSingleRow: window.innerWidth >= 768 || !middle || !right || Math.abs(middle.top - right.top) <= 3,
          loginRedirect: location.pathname === '/login',
        };
      });
      if (route.endsWith('/musicas') && !result.loginRedirect) {
        const searchToggle = page.locator('.music-catalog-search-toggle');
        const titleRow = page.locator('.admin-page-title-row');
        const mobileSearch = page.locator('.music-catalog-mobile-search');
        if (await searchToggle.count() !== 1 || await titleRow.count() !== 1 || await mobileSearch.count() !== 0) {
          failures.push(`${route} @ ${viewport.width}x${viewport.height}: busca móvel não inicia recolhida`);
        } else {
          const titleBox = await titleRow.boundingBox();
          const createBox = await page.locator('.music-catalog-create').boundingBox();
          if (!titleBox || !createBox || Math.abs(titleBox.top - createBox.top) > 8) {
            failures.push(`${route} @ ${viewport.width}x${viewport.height}: título e adicionar música não estão na mesma linha`);
          }
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
      if (route.endsWith('/musicas') && viewport.width < 768 && !result.catalogNoOverflow) errors.push('catálogo com overflow horizontal');
      if (!result.sidebarRemoved) errors.push('menu lateral ainda renderizado');
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
