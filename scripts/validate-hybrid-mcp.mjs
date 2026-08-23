import fs from 'node:fs';

const configPath = '.codex/config.toml';
const config = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : '';
const required = [
  '[mcp_servers.hybrid_geef]',
  'command = "node"',
  'args = ["mcp/hybrid-worker.mjs"]',
  'HYBRID_SUBMITTER_TOKEN_FILE = "/run/secrets/hybrid_site_geef_submitter_token"',
  'enabled_tools = ["hybrid_test", "hybrid_build", "hybrid_job_status"]',
];
const missing = required.filter((entry) => !config.includes(entry));

if (missing.length) {
  console.error(`Configuração híbrida incompleta: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('✓ Configuração MCP híbrida do GEEF está restrita aos três tools aprovados.');
