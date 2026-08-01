import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SERVER = 'supabase-geef';
const PROJECT_REF = 'nycgpokqlmrfzegjlrwa';
const EXPECTED_URL = `https://mcp.supabase.com/mcp?project_ref=${PROJECT_REF}`;
const strict = process.argv.includes('--strict');

function command(bin, args) {
  const result = spawnSync(bin, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: process.platform === 'win32',
    windowsHide: true,
  });
  return { ok: result.status === 0, output: `${result.stdout ?? ''}\n${result.stderr ?? ''}` };
}

function readEnvNames(file) {
  if (!fs.existsSync(file)) return new Set();
  const names = new Set();
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=/);
    if (match) names.add(match[1]);
  }
  return names;
}

const results = [];
const check = (level, name, passed, help) => results.push({ level, name, passed, help });

let mcpConfig;
try {
  mcpConfig = JSON.parse(fs.readFileSync('.mcp.json', 'utf8'));
} catch {
  mcpConfig = null;
}
check('error', '.mcp.json válido', Boolean(mcpConfig), 'Restaurar o JSON do repositório.');
check('error', 'servidor isolado configurado', mcpConfig?.mcpServers?.[SERVER]?.url === EXPECTED_URL, `Usar exatamente ${EXPECTED_URL}.`);

let claudeConfig;
try {
  claudeConfig = JSON.parse(fs.readFileSync('.claude/settings.json', 'utf8'));
} catch {
  claudeConfig = null;
}
check('error', 'servidor permitido no projeto', claudeConfig?.enabledMcpjsonServers?.includes(SERVER) === true, 'Adicionar supabase-geef a enabledMcpjsonServers.');

const codexGet = command('codex', ['mcp', 'get', SERVER]);
check('error', 'MCP registrado no Codex', codexGet.ok && codexGet.output.includes(EXPECTED_URL), `Executar codex mcp add ${SERVER} --url "${EXPECTED_URL}".`);
check('error', 'MCP habilitado', codexGet.output.includes('enabled: true'), `Executar codex mcp enable ${SERVER} ou revisar a configuração do Codex.`);

const codexList = command('codex', ['mcp', 'list']);
check('error', 'OAuth selecionado', codexList.ok && new RegExp(`${SERVER}.*OAuth`).test(codexList.output.replace(/\r?\n/g, ' ')), `Executar codex mcp login ${SERVER}.`);

const projects = command('npx', ['supabase', 'projects', 'list']);
check('error', 'CLI autenticada no projeto GEEF', projects.ok && projects.output.includes(PROJECT_REF), 'Executar npx supabase login e confirmar a conta correta.');

const linkedRef = fs.existsSync('supabase/.temp/project-ref') ? fs.readFileSync('supabase/.temp/project-ref', 'utf8').trim() : '';
check('warning', 'checkout vinculado pela CLI', linkedRef === PROJECT_REF, `Executar npx supabase link --project-ref ${PROJECT_REF}.`);

const ignoredSecrets = command('git', ['check-ignore', '.env.supabase', '.env.local', '.env']);
check('error', 'arquivos locais de segredo ignorados pelo Git', ignoredSecrets.ok, 'Restaurar as regras .env e .env.* no .gitignore.');
const trackedSupabaseEnv = command('git', ['ls-files', '--error-unmatch', '.env.supabase']);
check('error', '.env.supabase não versionado', !trackedSupabaseEnv.ok, 'Remover .env.supabase do índice Git e rotacionar as credenciais.');
const trackedJwt = command('git', ['grep', '-l', '-E', 'eyJ[A-Za-z0-9_-]{20,}\\.eyJ[A-Za-z0-9_-]{20,}']);
check('error', 'nenhum JWT rastreado no repositório', !trackedJwt.ok || trackedJwt.output.trim() === '', 'Revogar o token, remover do histórico e rotacionar a credencial.');

const envNames = new Set([
  ...readEnvNames('.env'),
  ...readEnvNames('.env.local'),
  ...readEnvNames('.env.supabase'),
]);
check('warning', 'URL pública configurada', envNames.has('NEXT_PUBLIC_SUPABASE_URL'), 'Definir NEXT_PUBLIC_SUPABASE_URL em .env.local.');
check('warning', 'chave pública configurada', envNames.has('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'), 'Definir NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY em .env.local.');
check('warning', 'service role configurada localmente', envNames.has('SUPABASE_SERVICE_ROLE_KEY') || envNames.has('GEEF_SUPABASE_SERVICE_ROLE_KEY'), 'Definir a chave rotacionada somente em .env.local ou secret manager.');

for (const item of results) {
  const icon = item.passed ? '✓' : item.level === 'warning' ? '!' : '✗';
  console.log(`${icon} ${item.name}`);
  if (!item.passed) console.log(`  ${item.help}`);
}

const errors = results.filter((item) => !item.passed && item.level === 'error');
const warnings = results.filter((item) => !item.passed && item.level === 'warning');
console.log(`\nResultado: ${errors.length} erro(s), ${warnings.length} aviso(s).`);
if (errors.length || (strict && warnings.length)) process.exit(1);
