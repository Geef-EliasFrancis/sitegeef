#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifestPath = join(root, 'supabase', 'MIGRATION_MANIFEST.json');
const migrationsDir = join(root, 'supabase', 'migrations');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function check(message, condition) {
  if (condition) {
    console.log(`✓ ${message}`);
  } else {
    fail(message);
    console.log(`✗ ${message}`);
  }
}

check(`project ref do manifesto é ${manifest.project_ref}`, manifest.project_ref === 'nycgpokqlmrfzegjlrwa');
check('manifesto aponta para o diretório local de migrations', manifest.local_directory === 'supabase/migrations');
check('manifesto existe e possui versão de schema', manifest.schema_version === 1);

const localFiles = readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();
const manifestFiles = manifest.local_files.map((item) => item.file).sort();
const unknownLocal = localFiles.filter((file) => !manifestFiles.includes(file));
const missingLocal = manifestFiles.filter((file) => !localFiles.includes(file));
check('todos os arquivos locais estão registrados no manifesto', unknownLocal.length === 0 && missingLocal.length === 0);
if (unknownLocal.length) failures.push(`arquivos locais não registrados: ${unknownLocal.join(', ')}`);
if (missingLocal.length) failures.push(`arquivos do manifesto ausentes: ${missingLocal.join(', ')}`);

const versions = new Map();
for (const file of localFiles) {
  const match = file.match(/^(\d+)_/);
  if (!match) {
    fail(`arquivo sem versão numérica: ${file}`);
    continue;
  }
  const version = match[1];
  const files = versions.get(version) || [];
  files.push(file);
  versions.set(version, files);
}
const duplicateVersions = [...versions.entries()].filter(([, files]) => files.length > 1);
const documentedDuplicateVersions = new Set(manifest.known_duplicate_versions.map((item) => item.version));
const undocumentedDuplicateVersions = duplicateVersions.filter(([version]) => !documentedDuplicateVersions.has(version));
check('não existem versões locais duplicadas não documentadas', undocumentedDuplicateVersions.length === 0);
for (const [version, files] of undocumentedDuplicateVersions) failures.push(`versão local duplicada não documentada ${version}: ${files.join(', ')}`);
for (const [version, files] of duplicateVersions.filter(([value]) => documentedDuplicateVersions.has(value))) warnings.push(`versão histórica duplicada documentada ${version}: ${files.join(', ')}`);

const envPath = join(root, '.env');
if (existsSync(envPath)) {
  const malformedEnv = readFileSync(envPath, 'utf8').split(/\r?\n/).map((line, index) => ({ line, number: index + 1 })).filter(({ line }) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#') && !/^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(trimmed);
  });
  check('.env não possui linhas inválidas', malformedEnv.length === 0);
  if (malformedEnv.length) failures.push(`linhas inválidas no .env: ${malformedEnv.map((item) => item.number).join(', ')}`);
} else {
  warnings.push('.env não encontrado; a CLI pode usar outra fonte de configuração');
}

const configPath = join(root, 'supabase', 'config.toml');
const config = readFileSync(configPath, 'utf8');
check('config.toml não possui seção customizada incompatível', !/^\[env\./m.test(config));
if (/^\[env\./m.test(config)) failures.push('supabase/config.toml contém seção [env.*] não suportada pela CLI');

let statusOutput = '';
try {
  statusOutput = execFileSync('npx.cmd', ['supabase', 'migration', 'list', '--linked'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: true });
} catch (error) {
  fail('não foi possível ler o histórico remoto com supabase migration list --linked');
  console.error(error.stdout || error.stderr || error.message);
}

const remoteVersions = new Set();
for (const line of statusOutput.split(/\r?\n/)) {
  const columns = line.split('|').map((value) => value.trim());
  if (columns.length < 3) continue;
  const remoteVersion = columns[1];
  if (/^\d+$/.test(remoteVersion)) remoteVersions.add(remoteVersion);
}

const expectedRemote = new Set(manifest.remote_checkpoints.map((item) => item.version));
const unexpectedRemote = [...remoteVersions].filter((version) => !expectedRemote.has(version));
const missingRemote = [...expectedRemote].filter((version) => !remoteVersions.has(version));
check('todos os checkpoints remotos estão registrados no manifesto', unexpectedRemote.length === 0 && missingRemote.length === 0);
if (unexpectedRemote.length) failures.push(`checkpoints remotos novos não registrados: ${unexpectedRemote.join(', ')}`);
if (missingRemote.length) warnings.push(`checkpoints previstos não retornaram na leitura remota: ${missingRemote.join(', ')}`);

const unmappedRemote = manifest.remote_checkpoints.filter((item) => item.state === 'unmapped_remote' && remoteVersions.has(item.version));
check('não existem checkpoints remotos sem reconciliação', unmappedRemote.length === 0);
if (unmappedRemote.length) failures.push(`checkpoints remotos sem fonte local: ${unmappedRemote.map((item) => item.version).join(', ')}`);

if (undocumentedDuplicateVersions.length || unmappedRemote.length) {
  warnings.push('o gate permanecerá bloqueado até a reconciliação manual do histórico; não usar migration repair automaticamente');
}

console.log('\nResumo do gate de migrations');
console.log(`Local: ${localFiles.length} arquivo(s)`);
console.log(`Remoto: ${remoteVersions.size} checkpoint(s) lido(s)`);
console.log(`Falhas: ${failures.length}`);
console.log(`Avisos: ${warnings.length}`);
for (const warning of warnings) console.log(`⚠ ${warning}`);
if (failures.length) {
  console.log('\nBloqueios:');
  for (const failure of failures) console.log(`- ${failure}`);
  process.exit(1);
}

console.log('✅ Histórico alinhado; aplicação pode seguir pelo comando gated.');
