import { describe, expect, it, vi } from 'vitest';

import {
  GEEF_REPOSITORY,
  getHybridJobStatus,
  requireCommitSha,
  submitHybridJob,
} from '../mcp/hybrid-worker-client.mjs';

const sha = '0123456789012345678901234567890123456789';

describe('hybrid worker client', () => {
  it('requires an immutable complete commit SHA', () => {
    expect(requireCommitSha(sha.toUpperCase())).toBe(sha);
    expect(() => requireCommitSha('main')).toThrow('SHA Git completo');
  });

  it('submits only the GEEF test contract to the coordinator', async () => {
    const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => new Response(JSON.stringify({ ID: 'job-7', Spec: {} }), { status: 201 }));
    const job = await submitHybridJob({
      kind: 'npm_test',
      commitSha: sha,
      tokenFile: '/run/secrets/hybrid_site_geef_submitter_token',
      coordinatorUrl: 'https://worker.example.test',
      fetchImpl,
      readFileImpl: async () => 'test-token',
    });

    expect(job.ID).toBe('job-7');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [, init] = fetchImpl.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      mode: 'homelab',
      memoryMB: 1024,
      repository: GEEF_REPOSITORY,
      ref: sha,
      kind: 'npm_test',
    });
  });

  it('rejects arbitrary job ids before calling the coordinator', async () => {
    const fetchImpl = vi.fn();
    await expect(getHybridJobStatus({
      jobId: '../../etc/passwd',
      tokenFile: '/run/secrets/hybrid_site_geef_submitter_token',
      coordinatorUrl: 'https://worker.example.test',
      fetchImpl,
      readFileImpl: async () => 'test-token',
    })).rejects.toThrow('job_id inválido');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
