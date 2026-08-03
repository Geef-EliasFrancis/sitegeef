import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.COMP_GATE_BASE_URL ?? 'http://127.0.0.1:3500';
const storageState = process.env.COMP_GATE_STORAGE_STATE;
const requireLive = process.env.COMP_GATE_REQUIRE_LIVE === '1';
const outputDir = 'test-artifacts/comp-gate';
const routes = ['/admin/painel', '/admin/reuniao-publica', '/admin/reuniao-publica/avisos', '/admin/reuniao-publica/musica/inicio', '/admin/reuniao-publica/musica/catalogo', '/reuniao-publica', '/reuniao-publica/live', '/admin/escalas', '/admin/financeiro'];
const viewports = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 1024, height: 768, name: 'tablet-wide' },
  { width: 900, height: 900, name: 'tablet-compact' },
  { width: 768, height: 1024, name: 'tablet-narrow' },
  { width: 390, height: 844, name: 'mobile' },
];

const adminCss = fs.readFileSync('styles/admin.css', 'utf8');
const globalsCss = fs.readFileSync('styles/globals.css', 'utf8');
const siteHeaderCss = fs.readFileSync('styles/site-header.css', 'utf8');
const sidebarCss = fs.readFileSync('styles/admin-sidebar.css', 'utf8');
const adminSidebarSource = fs.readFileSync('components/admin/admin-sidebar.tsx', 'utf8');
const musicCatalogSource = fs.readFileSync('components/admin/musicas/musicas-catalog-table.tsx', 'utf8');
const avisosSource = fs.readFileSync('app/admin/reuniao-publica/avisos/page.tsx', 'utf8');
const avisosActionsSource = fs.readFileSync('app/admin/reuniao-publica/avisos/actions.ts', 'utf8');
const publicDisplaySource = fs.readFileSync('components/admin/musicas/musica-exibicao-publica-button.tsx', 'utf8');
const adminHeaderSource = fs.readFileSync('components/admin/admin-header.tsx', 'utf8');
const siteHeaderSource = fs.readFileSync('components/site-header.tsx', 'utf8');
const presentationSource = fs.readFileSync('components/reuniao-publica-presentation.tsx', 'utf8');
const presentationSlideSource = fs.readFileSync('components/reuniao-publica-slide.tsx', 'utf8');
const presentationNavigationSource = fs.readFileSync('hooks/use-reuniao-publica-navigation.ts', 'utf8');
const adminContextMenuSource = fs.readFileSync('components/admin/admin-context-menu.tsx', 'utf8');
const adminMusicNavigationSource = fs.readFileSync('lib/admin-music-navigation.ts', 'utf8');
const adminContextNavigationSource = fs.readFileSync('lib/admin-context-navigation.ts', 'utf8');
const adminShellTabsSource = fs.readFileSync('components/admin/admin-shell-tabs.tsx', 'utf8');
const adminShellNavigationSource = fs.readFileSync('lib/admin-shell-navigation.ts', 'utf8');
const adminShellHookSource = fs.readFileSync('components/admin/use-admin-shell-area.ts', 'utf8');
const adminUserMenuSource = fs.readFileSync('components/admin/admin-user-menu.tsx', 'utf8');
const adminUserNavigationSource = fs.readFileSync('lib/admin-user-navigation.ts', 'utf8');
const institutionContactsPageSource = fs.readFileSync('app/admin/instituicao/contatos/page.tsx', 'utf8');
const musicVersionsPageSource = fs.readFileSync('app/admin/reuniao-publica/musica/versoes/page.tsx', 'utf8');
const publicMusicLiveButtonSource = fs.readFileSync('components/musicas/musica-catalog-live-button.tsx', 'utf8');
const publicMusicasToolbarSource = fs.readFileSync('components/musicas/musicas-toolbar.tsx', 'utf8');
const musicPassesSource = fs.readFileSync('lib/musica-passes.ts', 'utf8');
const musicPassesRepositorySource = fs.readFileSync('lib/musica-passes-repository.ts', 'utf8');
const musicPassesPublicSource = fs.readFileSync('app/musicas/passes/page.tsx', 'utf8');
const musicPassesPlayerSource = fs.readFileSync('components/musicas/musica-passes-player.tsx', 'utf8');
const musicPassesAdminSource = fs.readFileSync('app/admin/reuniao-publica/musica/passes/page.tsx', 'utf8');
const musicPassesStorageSource = fs.readFileSync('lib/musica-passes-storage.ts', 'utf8');
const musicPassesMigrationSource = fs.readFileSync('supabase/migrations/20260802010000_musica_passes.sql', 'utf8');
const musicPassesOrderMigrationSource = fs.readFileSync('supabase/migrations/20260802020000_musica_passes_ordem_unica.sql', 'utf8');
const publicMusicCatalogCss = fs.readFileSync('styles/globals.css', 'utf8');
const publicSiteHeaderSource = fs.readFileSync('components/site-header.tsx', 'utf8');
const publicSiteHeaderCss = fs.readFileSync('styles/site-header.css', 'utf8');
const publicLibrarySource = fs.readFileSync('lib/biblioteca/public-biblioteca.ts', 'utf8');
const publicLibraryPageSource = fs.readFileSync('app/biblioteca/livros/page.tsx', 'utf8');
const participeSource = fs.readFileSync('components/site-header.tsx', 'utf8');
const meetingNoticesSource = fs.readFileSync('lib/reuniao-publica/avisos.ts', 'utf8');
const meetingNoticesRepositorySource = fs.readFileSync('lib/reuniao-publica/avisos-repository.ts', 'utf8');
const musicRepositorySource = fs.readFileSync('lib/musicas-repository.ts', 'utf8');
const musicasSource = fs.readFileSync('lib/musicas.ts', 'utf8');
const shellAreaSource = fs.readFileSync('components/admin/use-admin-shell-area.ts', 'utf8');
const nextConfigSource = fs.readFileSync('next.config.ts', 'utf8');
const canonicalPublicRoutes = [
  'app/biblioteca/leitor/page.tsx',
  'app/reuniao-publica/programacao/page.tsx',
  'app/reuniao-publica/leitura/page.tsx',
  'app/reuniao-publica/musicas/page.tsx',
  'app/reuniao-publica/musicas/passes/page.tsx',
  'app/reuniao-publica/musicas/exibir/page.tsx',
  'app/reuniao-publica/musicas/controle/page.tsx',
];
const dashboardSource = fs.readFileSync('components/admin/admin-dashboard-workspace.tsx', 'utf8');
const dashboardRepositorySource = fs.readFileSync('lib/admin/dashboard-repository.ts', 'utf8');
const dashboardViewModelSource = fs.readFileSync('lib/admin/dashboard-view-model.ts', 'utf8');
const contactSource = fs.readFileSync('lib/site-contact.ts', 'utf8');
const contactRepositorySource = fs.readFileSync('lib/site-contact-repository.ts', 'utf8');
const publicationsRepositorySource = fs.readFileSync('lib/publicacoes-repository.ts', 'utf8');
const agendaSource = fs.readFileSync('lib/agenda/public-agenda.ts', 'utf8');
const agendaRepositorySource = fs.readFileSync('lib/agenda/public-agenda-repository.ts', 'utf8');
const publicEscalasSource = fs.readFileSync('lib/escalas/public-escalas.ts', 'utf8');
const publicEscalasRepositorySource = fs.readFileSync('lib/escalas/public-escalas-repository.ts', 'utf8');
const userAreaSource = fs.readFileSync('lib/areas/user-area.ts', 'utf8');
const userAreaIdentityRepositorySource = fs.readFileSync('lib/areas/user-area-identity-repository.ts', 'utf8');
const userAreaOperationsRepositorySource = fs.readFileSync('lib/areas/user-area-operations-repository.ts', 'utf8');
const userAreaComplianceRepositorySource = fs.readFileSync('lib/areas/user-area-compliance-repository.ts', 'utf8');
const contactMessagesSource = fs.readFileSync('lib/contato-mensagens.ts', 'utf8');
const contactMessagesRepositorySource = fs.readFileSync('lib/contato-mensagens-repository.ts', 'utf8');
const opsEventsSource = fs.readFileSync('lib/ops-events.ts', 'utf8');
const opsEventsRepositorySource = fs.readFileSync('lib/ops-events-repository.ts', 'utf8');
const institutionBrandSource = fs.readFileSync('lib/institution-brand.ts', 'utf8');
const institutionBrandRepositorySource = fs.readFileSync('lib/institution-brand-repository.ts', 'utf8');
const lgpdPersistenceSource = fs.readFileSync('lib/lgpd/persistence.ts', 'utf8');
const lgpdPersistenceRepositorySource = fs.readFileSync('lib/lgpd/persistence-repository.ts', 'utf8');
const lgpdAdminSource = fs.readFileSync('lib/lgpd/admin.ts', 'utf8');
const lgpdAdminRepositorySource = fs.readFileSync('lib/lgpd/admin-repository.ts', 'utf8');
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
  ['top menu compacto sem ícones e com tooltip', !adminShellTabsSource.includes('shellIcons') && adminShellTabsSource.includes('title={`${item.label}: ${item.note}`}') && adminCss.includes('.admin-shell-tab-label')],
  ['top menu interno verde possui contraste forte', adminCss.includes('.admin-shell-tab:not(.active) span') && adminCss.includes('color: #102a0c !important') && adminCss.includes('border-bottom: 3px solid #174d0b')],
  ['menu público verde possui contraste forte', siteHeaderCss.includes('border-bottom: 3px solid #174d0b') && siteHeaderCss.includes('color: #102a0c !important') && siteHeaderCss.includes('text-shadow: 0 1px 0 rgba(255, 255, 255, 0.68)')],
  ['top menu compartilha linha com usuário', adminCss.includes('grid-template-columns: minmax(0, 1fr) auto') && adminCss.includes('.admin-header-right') && adminCss.includes('.admin-header .admin-brand')],
  ['submenu reunião pública possui cinco entradas', ['Avisos', 'Música', 'Leitura', 'Palestra', 'Prece'].every((label) => adminContextNavigationSource.includes(`label: "${label}"`)) && adminHeaderSource.includes('admin-context-menu')],
  ['avisos possui tela própria', fs.existsSync('app/admin/reuniao-publica/avisos/page.tsx') && !nextConfigSource.includes('source: "/admin/reuniao-publica/avisos"')],
  ['avisos usa ação de criação por ícone', avisosSource.includes('IconPlus') && avisosSource.includes('admin-icon-action') && avisosSource.includes('aria-label="Adicionar aviso"') && adminCss.includes('.admin-icon-action')],
  ['avisos possui cadastro próprio', avisosSource.includes('/admin/reuniao-publica/avisos/novo') && avisosActionsSource.includes('saveAvisoReuniaoAction') && fs.existsSync('app/admin/reuniao-publica/avisos/novo/page.tsx') && fs.existsSync('app/admin/reuniao-publica/avisos/[id]/page.tsx')],
  ['avisos usam persistência própria', meetingNoticesRepositorySource.includes('reuniao_publica_avisos') && meetingNoticesRepositorySource.includes('savePersistedAviso') && fs.existsSync('supabase/migrations/20260802010000_reuniao_publica_avisos.sql')],
  ['avisos separam domínio e persistência', meetingNoticesSource.includes('listPersistedAvisos') && meetingNoticesRepositorySource.includes('createServiceRoleClient') && !meetingNoticesSource.includes('createServiceRoleClient')],
  ['avisos não dependem de publicacoes legadas', !meetingNoticesSource.includes('mergeAvisosComAgenda') && !avisosSource.includes('getPublicacoes')],
  ['músicas isolam catálogo, sessões e créditos do banco', musicRepositorySource.includes('saveMusicaRecord') && musicRepositorySource.includes('saveMusicaSessaoRecord') && musicRepositorySource.includes('saveMusicaCreditoRecord') && !musicasSource.includes('.from("musicas").upsert') && !musicasSource.includes('.from("musica_sessoes").upsert') && !musicasSource.includes('.from("musica_creditos").select')],
  ['dashboard separa consultas e cache', dashboardRepositorySource.includes('loadAdminDashboardSummary') && dashboardRepositorySource.includes('createServiceRoleClient') && !fs.readFileSync('lib/admin/dashboard.ts', 'utf8').includes('createServiceRoleClient')],
  ['dashboard separa transformação da view', dashboardViewModelSource.includes('createAdminDashboardViewModel') && dashboardSource.includes('createAdminDashboardViewModel') && !dashboardSource.includes('getProximaQuinta')],
  ['contato público separa consulta e composição', contactRepositorySource.includes('loadPublicContactRows') && contactRepositorySource.includes('createServiceRoleClient') && contactSource.includes('loadPublicContactRows') && !contactSource.includes('.from("instituicao")')],
  ['comunicação separa actions e persistência', publicationsRepositorySource.includes('listPublicacoes') && publicationsRepositorySource.includes('updatePublicacaoRecord') && !fs.readFileSync('app/admin/comunicacao/actions.ts', 'utf8').includes('.from(\'publicacoes\')')],
  ['agenda separa consulta e transformação', agendaRepositorySource.includes('listUpcomingAgendaRows') && agendaRepositorySource.includes('reunioes') && agendaSource.includes('PublicAgendaEvent') && !agendaSource.includes('.from("reunioes")')],
  ['escalas públicas separam consulta e transformação', publicEscalasRepositorySource.includes('listPublishedEscalasFromCurrentYear') && publicEscalasRepositorySource.includes('escalas_mensais') && publicEscalasSource.includes('PublicEscalaRecord') && !publicEscalasSource.includes('.from("escalas_mensais")')],
  ['minha área separa identidade e carga operacional', userAreaIdentityRepositorySource.includes('loadUserAreaIdentity') && userAreaIdentityRepositorySource.includes('usuarios_sistema') && userAreaSource.includes('loadUserAreaIdentity')],
  ['minha área separa operações autorizadas', userAreaOperationsRepositorySource.includes('loadUserAreaOperations') && userAreaOperationsRepositorySource.includes('emprestimos') && userAreaSource.includes('loadUserAreaOperations') && !userAreaSource.includes('.from("emprestimos")')],
  ['minha área separa voluntariado e LGPD', userAreaComplianceRepositorySource.includes('loadUserAreaCompliance') && userAreaComplianceRepositorySource.includes('consentimentos_lgpd') && userAreaSource.includes('loadUserAreaCompliance') && !userAreaSource.includes('.from("consentimentos_lgpd")')],
  ['mensagens de contato separam leitura e apresentação', contactMessagesRepositorySource.includes('listContatoMensagens') && contactMessagesRepositorySource.includes('contato_mensagens') && contactMessagesSource.includes('listContatoMensagens') && !contactMessagesSource.includes('createServiceRoleClient')],
  ['contato público compartilha normalizadores', fs.existsSync('lib/site-contact-formatters.ts') && contactSource.includes('site-contact-formatters') && fs.readFileSync('lib/site-contact-public.ts', 'utf8').includes('site-contact-formatters')],
  ['observabilidade separa persistência e métricas', opsEventsRepositorySource.includes('recordOpsEventRecord') && opsEventsRepositorySource.includes('ops_events') && opsEventsSource.includes('getOpsEventStats') && !opsEventsSource.includes('createClient')],
  ['identidade visual separa consulta e fallback', institutionBrandRepositorySource.includes('getInstitutionBrandRecord') && institutionBrandRepositorySource.includes('instituicao') && institutionBrandSource.includes('FALLBACK_BRAND') && !institutionBrandSource.includes('createServiceRoleClient')],
  ['LGPD separa regra e persistência', lgpdPersistenceRepositorySource.includes('insertLgpdRecord') && lgpdPersistenceRepositorySource.includes('lgpd_registros') && lgpdPersistenceSource.includes('resolveSeverity') && !lgpdPersistenceSource.includes('createServiceRoleClient')],
  ['admin LGPD separa consulta e normalização', lgpdAdminRepositorySource.includes('loadLgpdAdminRecords') && lgpdAdminRepositorySource.includes('consentimentos_lgpd') && lgpdAdminSource.includes('loadLgpdAdminRecords') && !lgpdAdminSource.includes('createServiceRoleClient')],
  ['avisos possui catálogo tabular persistente', avisosSource.includes('avisos-catalog-table') && avisosSource.includes('<th>Aviso</th>') && !avisosSource.includes('avisos-catalog-empty') && adminCss.includes('.avisos-catalog-table')],
  ['ao vivo pertence ao acesso principal de músicas', publicMusicasToolbarSource.includes('href="/reuniao-publica/musicas/exibir"') && siteHeaderSource.includes('const musicLinks') && siteHeaderSource.includes('const isMusicPath') && !siteHeaderSource.match(/const musicLinks = \[[\s\S]{0,180}musicas\/exibir/)],
  ['reunião pública possui início e live separados', siteHeaderSource.includes('/reuniao-publica/live') && presentationSource.includes('reuniao-publica-presentation') && presentationSource.includes('requestFullscreen') && presentationSource.includes('ArrowRight') && presentationSource.includes('avisos') && fs.existsSync('app/reuniao-publica/page.tsx') && fs.existsSync('app/reuniao-publica/live/page.tsx')],
  ['submenu público da reunião possui início e ordem', publicSiteHeaderSource.includes('{ href: "/reuniao-publica", label: "Início" }') && publicSiteHeaderSource.includes('{ href: "/reuniao-publica/programacao", label: "Programação" }') && publicSiteHeaderSource.includes('{ href: "/reuniao-publica/avisos", label: "Avisos" }') && publicSiteHeaderSource.includes('{ href: "/reuniao-publica/escalas", label: "Escalas" }') && publicSiteHeaderSource.includes('{ href: "/reuniao-publica/live", label: "Ao vivo" }') && publicSiteHeaderSource.indexOf('label: "Ao vivo"') > publicSiteHeaderSource.indexOf('label: "Escalas"') && publicSiteHeaderSource.includes('if (href === "/reuniao-publica") return pathname === href')],
  ['escalas pertence à rota da reunião', fs.existsSync('app/reuniao-publica/escalas/page.tsx') && nextConfigSource.includes('destination: "/reuniao-publica/escalas"') && fs.readFileSync('app/escalas/page.tsx', 'utf8').includes('getPublicEscalas')],
  ['avisos públicos pertencem à reunião', fs.existsSync('app/reuniao-publica/avisos/page.tsx') && fs.readFileSync('app/reuniao-publica/avisos/page.tsx', 'utf8').includes('listReuniaoPublicaAvisos') && fs.readFileSync('lib/admin/cache.ts', 'utf8').includes('revalidatePath("/reuniao-publica/avisos")')],
  ['avisos públicos possuem lista condensada', fs.readFileSync('app/reuniao-publica/avisos/page.tsx', 'utf8').includes('reuniao-publica-avisos-list') && fs.readFileSync('styles/globals.css', 'utf8').includes('.reuniao-publica-aviso-item') && fs.readFileSync('styles/globals.css', 'utf8').includes('grid-template-columns: 1fr')],
  ['programação possui hero compacto e diagrama', fs.readFileSync('app/programacao/page.tsx', 'utf8').includes('showBrandKicker={false}') && fs.readFileSync('app/programacao/page.tsx', 'utf8').includes('compactHero') && fs.readFileSync('app/programacao/page.tsx', 'utf8').includes('sequenceDiagram') && fs.readFileSync('components/content-page.tsx', 'utf8').includes('programacao-sequence')],
  ['apresentação separa controles e conteúdo', presentationSource.includes('ReuniaoPublicaSlide') && presentationSlideSource.includes('reuniao-publica-notices') && !presentationSource.includes('reuniao-publica-opening')],
  ['apresentação separa navegação e configuração', presentationSource.includes('useReuniaoPublicaNavigation') && presentationSource.includes('REUNIAO_PUBLICA_SLIDES') && presentationNavigationSource.includes('ArrowRight') && fs.existsSync('lib/reuniao-publica-presentation.ts')],
  ['header separa renderização do submenu', adminHeaderSource.includes('AdminContextMenu') && adminContextMenuSource.includes('admin-context-menu-item') && !adminHeaderSource.includes('contextMenuItems.map((item) => {')],
  ['regra de ativação do submenu isolada', adminContextMenuSource.includes('isAdminContextItemActive') && adminContextNavigationSource.includes('export function isAdminContextItemActive') && !adminContextMenuSource.includes('item.href.split("?")')],
  ['header importa navegação musical', adminHeaderSource.includes('admin-music-navigation') && adminMusicNavigationSource.includes('musicContextMenuItems') && adminMusicNavigationSource.includes('/reuniao-publica/musicas/exibir')],
  ['header separa abas superiores', adminHeaderSource.includes('AdminShellTabs') && adminShellTabsSource.includes('admin-shell-tab') && !adminHeaderSource.includes('topAreas.map((item) => (')],
  ['shell admin separa politica de rotas', adminShellNavigationSource.includes('getAdminShellAreaFromPath') && adminShellNavigationSource.includes('ADMIN_SHELL_ROUTES') && adminShellNavigationSource.includes('ADMIN_SHELL_AREAS') && adminShellHookSource.includes('useAdminShellArea')],
  ['menu do usuário separa links de navegação', adminUserMenuSource.includes('ADMIN_USER_MENU_LINKS.map') && adminUserNavigationSource.includes('ADMIN_USER_LOGOUT_LINK') && !adminUserMenuSource.includes('href="/perfil"')],
  ['contatos mantém canal e remove titulo WhatsApp', institutionContactsPageSource.includes('["whatsapp", "WhatsApp"]') && institutionContactsPageSource.includes('tipo !== "WhatsApp"') && institutionContactsPageSource.includes('instituicao-contato-card--untitled')],
  ['versões não passam evento para Server Component', !musicVersionsPageSource.match(/<button[\s\S]*onClick=/) && musicVersionsPageSource.includes('action={async () =>')],
  ['botão ao vivo da lista não abre a exibição', publicMusicLiveButtonSource.includes('router.refresh()') && !publicMusicLiveButtonSource.includes('router.push("/musicas/exibir")') && !publicMusicLiveButtonSource.includes('href="/musicas/exibir"')],
  ['catálogo público de músicas é compacto', publicMusicCatalogCss.includes('gap: 0.3rem') && publicMusicCatalogCss.includes('padding: 0.42rem 0.65rem') && publicMusicCatalogCss.includes('width: 1.9rem') && publicMusicCatalogCss.includes('flex-direction: row')],
  ['página de músicas reduz área vazia do contexto', publicSiteHeaderSource.includes('site-context-navigation--music') && publicSiteHeaderCss.includes('.site-context-navigation--music .site-context-navigation-copy p') && publicMusicCatalogCss.includes('public-page--compact .public-hero-shell') && publicMusicCatalogCss.includes('margin-top: 0')],
  ['submenu público diferencia item ativo', publicSiteHeaderSource.includes('site-context-navigation-link${isContextLinkActive') && publicSiteHeaderSource.includes('if (isMusicPath && (href === "/reuniao-publica/musicas" || href === "/musicas")) return pathname === href') && publicSiteHeaderSource.includes('aria-current={isContextLinkActive') && publicSiteHeaderCss.includes('.site-context-navigation-link.is-active') && publicSiteHeaderCss.includes('.site-nav-dropdown-item.is-active')],
  ['biblioteca separa leitor e livros', publicSiteHeaderSource.includes('{ href: "/biblioteca/leitor", label: "Área do leitor" }') && publicSiteHeaderSource.includes('{ href: "/biblioteca/livros", label: "Livros" }') && !publicSiteHeaderSource.match(/key: "biblioteca"[\s\S]{0,500}label: "Estudos"/)],
  ['catálogo público de livros usa persistência do acervo', fs.existsSync('app/biblioteca/livros/page.tsx') && publicLibrarySource.includes('from("obras")') && publicLibrarySource.includes('eq("ativo", true)') && publicLibraryPageSource.includes('listPublicLibraryBooks') && fs.readFileSync('lib/admin/cache.ts', 'utf8').includes('revalidateTag("public-library-books")')],
  ['biblioteca admin possui telas de cadastro compatíveis', fs.existsSync('app/admin/biblioteca/page.tsx') && fs.existsSync('app/admin/biblioteca/nova-obra/page.tsx') && fs.existsSync('app/admin/biblioteca/[id]/page.tsx') && fs.existsSync('supabase/migrations/20260515_geef_erp.sql')],
  ['participe possui submenu próprio', participeSource.includes('{ href: "/participe/doacoes", label: "Doações" }') && participeSource.includes('{ href: "/participe/voluntariado", label: "Voluntariado" }') && !participeSource.match(/key: "participe"[\s\S]{0,450}label: "Contato"/) && fs.existsSync('app/participe/doacoes/page.tsx') && fs.existsSync('app/participe/voluntariado/page.tsx')],
  ['contato possui estado ativo independente', publicSiteHeaderSource.includes('site-nav-contact-btn${pathname === "/contato"') && publicSiteHeaderSource.includes('className={`site-nav-dropdown-item${pathname === "/contato"') && publicSiteHeaderCss.includes('.site-nav-contact-btn.is-active')],
  ['home possui estado ativo independente', publicSiteHeaderSource.includes('site-nav-home-btn${pathname === "/" ? " is-active" : ""}') && publicSiteHeaderSource.includes('aria-current={pathname === "/" ? "page" : undefined}') && publicSiteHeaderCss.includes('.site-nav-home-btn.is-active')],
  ['aba principal permanece ativa nas rotas filhas', publicSiteHeaderSource.includes('const activeGroupKey = openGroup ?? routeGroup?.key ?? null') && publicSiteHeaderSource.includes('value={activeGroupKey ?? undefined}') && publicSiteHeaderSource.includes('activeGroupKey === group.key')],
  ['submenu de músicas possui retorno compacto', publicSiteHeaderSource.includes('{ href: "/reuniao-publica", label: "Voltar" }') && publicSiteHeaderSource.includes('if (isMusicPath && href === "/reuniao-publica") return false') && publicSiteHeaderSource.includes('label: "Músicas"') && !publicSiteHeaderSource.match(/const musicLinks = \[[\s\S]{0,220}musicas\/exibir/) && publicSiteHeaderCss.includes('.site-context-navigation--music .site-context-navigation-copy {')],
  ['playlist de passes possui persistência própria', musicPassesRepositorySource.includes('from("musica_passes")') && musicPassesSource.includes('listMusicaPasses') && musicPassesMigrationSource.includes('create table if not exists public.musica_passes')],
  ['playlist de passes toca em loop', musicPassesPublicSource.includes('MusicaPassesPlayer') && musicPassesPlayerSource.includes('onEnded') && musicPassesPlayerSource.includes('% items.length') && musicPassesPlayerSource.includes('audioRef.current.play()')],
  ['player de passes possui aleatório e repetição', musicPassesPlayerSource.includes('shuffle') && musicPassesPlayerSource.includes('repeatMode') && musicPassesPlayerSource.includes('useState<RepeatMode>("all")') && musicPassesPlayerSource.includes('musica-passes-spiritual')],
  ['admin possui cadastro e exclusão de passes', musicPassesAdminSource.includes('addPasse') && musicPassesAdminSource.includes('deleteMusicaPasse') && musicPassesAdminSource.includes('musica-passes-admin-form')],
  ['admin possui upload de mp3', musicPassesAdminSource.includes('name="audio"') && musicPassesAdminSource.includes('accept="audio/mpeg,.mp3"') && musicPassesStorageSource.includes('uploadMusicaPasseAudio')],
  ['upload de passes usa storage persistente', musicPassesStorageSource.includes('instituicao-assets') && musicPassesStorageSource.includes('.storage.from') && nextConfigSource.includes('bodySizeLimit: "50mb"')],
  ['exclusão remove o arquivo do storage', musicPassesRepositorySource.includes('removeMusicaPasseAudio') && musicPassesStorageSource.includes('.remove([decodeURIComponent(path)])')],
  ['ordem de passes é automática e única', musicPassesAdminSource.includes('moveMusicaPasse') && musicPassesRepositorySource.includes('reindexMusicaPasses') && musicPassesOrderMigrationSource.includes('create unique index if not exists idx_musica_passes_ordem_ativa_unica')],
  ['agenda alimenta avisos da reunião sem duplicação', meetingNoticesSource.includes('schedule') && meetingNoticesSource.includes('listReuniaoPublicaAvisos') && meetingNoticesSource.includes('titulos') && meetingNoticesSource.includes('origem: "reuniao"')],
  ['submenu Música possui início catálogo autores e sessões', ['Início', 'Catálogo', 'Autores', 'Sessões'].every((label) => adminMusicNavigationSource.includes(`label: "${label}"`)) && adminHeaderSource.includes('musicContextMenuItems') && adminMusicNavigationSource.includes('/admin/reuniao-publica/musica/catalogo')],
  ['submenu contextual é restrito às áreas configuradas', adminContextNavigationSource.includes('"reuniao-publica": [') && adminHeaderSource.includes('contextMenuItems &&')],
  ['submenu GEEF possui instituição e seis telas', ['Início', 'Instituição', 'Dados', 'Endereço', 'Agenda', 'Departamentos', 'Contas'].every((label) => adminContextNavigationSource.includes(`label: "${label}"`)) && adminContextNavigationSource.includes("geef: [")],
  ['submenu Tarefeiros possui início pessoas e funções', ['Início', 'Pessoas', 'Funções'].every((label) => adminContextNavigationSource.includes(`label: "${label}"`)) && adminContextNavigationSource.includes("pessoas: [") && fs.existsSync('app/admin/pessoas/inicio/page.tsx')],
  ['submenu Sistema possui cinco telas', ['Início', 'Observabilidade', 'Migrações', 'Idiomas', 'Fix Usuários'].every((label) => adminContextNavigationSource.includes(`label: "${label}"`)) && adminContextNavigationSource.includes("sistema: [")],
  ['home do painel não duplica o início no submenu', !adminHeaderSource.includes('painel: [')],
  ['estilos admin não escondem o cabeçalho público', !adminCss.includes('.site-shell > .site-header') && !adminCss.includes('.site-shell > .site-footer')],
  ['cabeçalho público não duplica no Admin', siteHeaderSource.includes('if (pathname.startsWith("/admin"))') && siteHeaderSource.includes('return null;')],
  ['início não fica ativo nas rotas filhas', adminContextNavigationSource.includes('item.label === "Início"') && adminContextNavigationSource.includes('pathname === itemPath')],
  ['contextos administrativos possuem submenu', ['perfil: [', 'geef: [', 'pessoas: [', '"reuniao-publica": [', 'governanca: [', 'documentos: [', 'operacao: [', 'sistema: ['].every((context) => adminContextNavigationSource.includes(context))],
  ['rotas canônicas seguem menu e submenu', nextConfigSource.includes('contextualRouteRewrites') && nextConfigSource.includes('/admin/geef/instituicao') && nextConfigSource.includes('/admin/pessoas/funcoes') && nextConfigSource.includes('/admin/operacao/${submenu}') && nextConfigSource.includes('/admin/sistema/observabilidade')],
  ['rotas públicas canônicas existem por contexto', canonicalPublicRoutes.every((route) => fs.existsSync(route)) && nextConfigSource.includes('destination: "/biblioteca/leitor"') && nextConfigSource.includes('destination: "/reuniao-publica/programacao"') && nextConfigSource.includes('destination: "/reuniao-publica/musicas"')],
  ['biblioteca e reunião possuem leitura separada', fs.existsSync('app/biblioteca/leitor/page.tsx') && fs.existsSync('app/reuniao-publica/leitura/page.tsx') && nextConfigSource.includes('source: "/admin/reuniao-publica/leitura"') && nextConfigSource.includes('destination: "/reuniao-publica/leitura"') && !nextConfigSource.includes('destination: "/leitor"')],
  ['funções pertencem à área Tarefeiros', adminShellNavigationSource.includes('normalizedPath.startsWith("/admin/funcoes")') && adminShellNavigationSource.includes('return "pessoas"') && !adminShellNavigationSource.match(/normalizedPath\.startsWith\("\/admin\/funcoes"\)[\s\S]{0,180}return "geef"/)],
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
