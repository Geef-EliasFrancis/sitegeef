#!/usr/bin/env node
import readline from 'node:readline';
import {
  COORDINATOR_URL,
  getHybridJobStatus,
  sanitizeJob,
  submitHybridJob,
} from './hybrid-worker-client.mjs';

const tokenFile = process.env.HYBRID_SUBMITTER_TOKEN_FILE;
const coordinatorUrl = process.env.HYBRID_COORDINATOR_URL ?? COORDINATOR_URL;

const tools = [
  {
    name: 'hybrid_test',
    description: 'Enfileira npm test isolado na homelab para um commit SHA completo do GEEF. Não faz deploy.',
    inputSchema: {
      type: 'object',
      properties: { commit_sha: { type: 'string', description: 'SHA Git completo de 40 caracteres.' } },
      required: ['commit_sha'],
      additionalProperties: false,
    },
  },
  {
    name: 'hybrid_build',
    description: 'Enfileira npm run build isolado na homelab para um commit SHA completo do GEEF. Não faz deploy.',
    inputSchema: {
      type: 'object',
      properties: { commit_sha: { type: 'string', description: 'SHA Git completo de 40 caracteres.' } },
      required: ['commit_sha'],
      additionalProperties: false,
    },
  },
  {
    name: 'hybrid_job_status',
    description: 'Consulta o status e os logs sanitizados de um job híbrido já submetido.',
    inputSchema: {
      type: 'object',
      properties: { job_id: { type: 'string', description: 'Identificador retornado ao submeter o job, como job-12.' } },
      required: ['job_id'],
      additionalProperties: false,
    },
  },
];

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function textResult(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

async function callTool(name, args) {
  if (name === 'hybrid_test' || name === 'hybrid_build') {
    const job = await submitHybridJob({
      kind: name === 'hybrid_test' ? 'npm_test' : 'npm_build',
      commitSha: args?.commit_sha,
      tokenFile,
      coordinatorUrl,
    });
    return textResult(sanitizeJob(job));
  }
  if (name === 'hybrid_job_status') {
    const job = await getHybridJobStatus({ jobId: args?.job_id, tokenFile, coordinatorUrl });
    return textResult(sanitizeJob(job));
  }
  throw new Error(`ferramenta não permitida: ${name}`);
}

async function handle(message) {
  if (message.method === 'notifications/initialized') return;
  if (message.method === 'initialize') {
    return {
      protocolVersion: message.params?.protocolVersion ?? '2025-03-26',
      capabilities: { tools: {} },
      serverInfo: { name: 'geef-hybrid-worker', version: '1.0.0' },
      instructions: 'Use somente para testes ou builds de um SHA Git completo do GEEF. Nunca use para deploy, shell, upload, segredo ou alterações de infraestrutura.',
    };
  }
  if (message.method === 'tools/list') return { tools };
  if (message.method === 'tools/call') return callTool(message.params?.name, message.params?.arguments);
  throw new Error(`método não suportado: ${message.method}`);
}

const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of input) {
  if (!line.trim()) continue;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON inválido' } });
    continue;
  }
  try {
    const result = await handle(message);
    if (message.id !== undefined && result !== undefined) send({ jsonrpc: '2.0', id: message.id, result });
  } catch (error) {
    if (message.id !== undefined) send({ jsonrpc: '2.0', id: message.id, error: { code: -32000, message: error instanceof Error ? error.message : 'erro interno' } });
  }
}
