import { readFile } from 'node:fs/promises';

export const GEEF_REPOSITORY = 'https://github.com/JeanMRocha/sitegeef.git';
export const COORDINATOR_URL = 'https://worker.aiveca.com.br';

const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/i;
const JOB_ID_PATTERN = /^job-[1-9][0-9]*$/;
const JOB_KINDS = new Set(['npm_test', 'npm_build']);

export function requireCommitSha(value) {
  const sha = typeof value === 'string' ? value.trim() : '';
  if (!COMMIT_SHA_PATTERN.test(sha)) {
    throw new Error('commit_sha deve ser um SHA Git completo de 40 caracteres hexadecimais.');
  }
  return sha.toLowerCase();
}

export function requireJobId(value) {
  const jobId = typeof value === 'string' ? value.trim() : '';
  if (!JOB_ID_PATTERN.test(jobId)) {
    throw new Error('job_id inválido.');
  }
  return jobId;
}

function requireSecureCoordinatorUrl(value) {
  const url = new URL(value ?? COORDINATOR_URL);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('HYBRID_COORDINATOR_URL deve usar HTTPS sem credenciais, query ou fragmento.');
  }
  return url.toString().replace(/\/$/, '');
}

export async function readSubmitterToken(tokenFile, readFileImpl = readFile) {
  if (typeof tokenFile !== 'string' || tokenFile.trim() === '') {
    throw new Error('HYBRID_SUBMITTER_TOKEN_FILE deve apontar para um arquivo de segredo.');
  }
  const token = (await readFileImpl(tokenFile, 'utf8')).trim();
  if (!token) throw new Error('o arquivo de segredo de submissão está vazio.');
  return token;
}

async function request({ coordinatorUrl, token, path, method, body, fetchImpl = fetch }) {
  const response = await fetchImpl(`${requireSecureCoordinatorUrl(coordinatorUrl)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text.slice(0, 512) };
    }
  }
  if (!response.ok) {
    throw new Error(`coordenador recusou a solicitação (${response.status}): ${payload?.message ?? text.slice(0, 256) ?? 'sem detalhe'}`);
  }
  return payload;
}

export async function submitHybridJob({ kind, commitSha, tokenFile, coordinatorUrl, fetchImpl, readFileImpl }) {
	if (!JOB_KINDS.has(kind)) throw new Error('tipo de job não permitido.');
	const token = await readSubmitterToken(tokenFile, readFileImpl);
  return request({
    coordinatorUrl,
    token,
    path: '/v1/hybrid/jobs',
    method: 'POST',
    fetchImpl,
    body: {
      mode: 'homelab',
      memoryMB: 1024,
      repository: GEEF_REPOSITORY,
      ref: requireCommitSha(commitSha),
      kind,
    },
  });
}

export async function getHybridJobStatus({ jobId, tokenFile, coordinatorUrl, fetchImpl, readFileImpl }) {
	const token = await readSubmitterToken(tokenFile, readFileImpl);
  return request({
    coordinatorUrl,
    token,
    path: `/v1/hybrid/jobs/${encodeURIComponent(requireJobId(jobId))}`,
    method: 'GET',
    fetchImpl,
  });
}

export function sanitizeJob(job) {
  return {
    id: job?.ID ?? null,
    status: job?.Status ?? null,
    executor: job?.WorkerID ?? null,
    repository: job?.Spec?.Repository ?? null,
    commit_sha: job?.Spec?.Ref ?? null,
    kind: job?.Spec?.Kind ?? null,
    exit_code: job?.ExitCode ?? null,
    created_at: job?.CreatedAt ?? null,
    finished_at: job?.FinishedAt ?? null,
    output: typeof job?.Output === 'string' ? job.Output.slice(-8000) : '',
  };
}
