import fs from 'node:fs';

const files = ['styles/admin.css', 'styles/admin-sidebar.css'];
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const checks = [
  ['breakpoints CSS válidos', !source.includes('max-width: var(--bp-')],
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
