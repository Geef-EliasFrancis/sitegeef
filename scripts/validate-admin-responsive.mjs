import fs from 'node:fs';

const files = ['styles/admin.css', 'styles/admin-sidebar.css'];
const adminCss = fs.readFileSync('styles/admin.css', 'utf8');
const sidebarCss = fs.readFileSync('styles/admin-sidebar.css', 'utf8');
const source = `${adminCss}\n${sidebarCss}`;
const checks = [
  ['breakpoints CSS válidos', !source.includes('max-width: var(--bp-')],
  ['sem seletor legado do menu', !source.includes('admin-mobile-nav-toggle') && !source.includes('is-mobile-open')],
  ['sem estado legado de colapso', !source.includes('admin-sidebar.is-collapsed')],
  ['sidebar possui uma única fonte de layout', !adminCss.match(/\.admin-sidebar\s*\{/)],
  ['sem breakpoint intermediário conflitante', !sidebarCss.includes('@media (max-width: 1199px)')],
  ['contrato de navegação', source.includes('.admin-navigation.is-open .admin-sidebar')],
  ['drawer com camada de fechamento', source.includes('.admin-navigation-scrim')],
  ['conteúdo sem largura mínima', source.includes('.admin-main') && source.includes('min-width: 0')],
  ['breakpoint tablet explícito', source.includes('@media (max-width: 1023px)')],
  ['breakpoint mobile explícito', source.includes('@media (max-width: 767px)')],
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) {
  console.log(`${passed ? '✓' : '✗'} ${name}`);
}

if (failures.length > 0) {
  console.error(`\nGate responsivo reprovado: ${failures.length} regra(s) ausente(s).`);
  process.exit(1);
}

console.log('\nGate responsivo aprovado.');
