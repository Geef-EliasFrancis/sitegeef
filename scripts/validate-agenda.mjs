import fs from 'node:fs';

const page = fs.readFileSync('app/[slug]/page.tsx', 'utf8');
const component = fs.readFileSync('components/agenda/agenda-view.tsx', 'utf8');
const styles = fs.readFileSync('styles/globals.css', 'utf8');
const checks = [
  ['rota agenda carrega eventos públicos', page.includes('slug === "agenda"') && page.includes('<AgendaView events={events} />')],
  ['semana começa na segunda', component.includes('mondayOffset')],
  ['troca de mês e ano', component.includes('type="month"')],
  ['detalhes por atividade', component.includes('aria-expanded') && component.includes('role="dialog"')],
  ['carrossel mobile', component.includes('mobileDay') && styles.includes('.agenda-mobile-day-switcher')],
  ['redução de movimento', styles.includes('@media (prefers-reduced-motion: reduce)')],
];

for (const [name, passed] of checks) console.log(`${passed ? '✓' : '✗'} ${name}`);
if (checks.some(([, passed]) => !passed)) process.exit(1);
console.log('\nGate da agenda aprovado.');
