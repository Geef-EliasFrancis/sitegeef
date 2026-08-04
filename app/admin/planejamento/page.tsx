import Link from 'next/link';
import { getMetas } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Planejamento - Admin GEEF',
};

type MetaItem = {
  id: string;
  objetivo: string;
  andamento?: number | null;
  prazo?: string | null;
  status?: string | null;
  responsavel?: { nome?: string | null } | null;
};

async function PlanejamentoContent() {
  const metas = await getMetas();
  const metaList = metas as MetaItem[];
  const ativas = metaList.filter((m) => m.status === 'em_execucao' || m.status === 'planejada');
  const concluidas = metaList.filter((m) => m.status === 'concluida');

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Planejamento" href="/admin/planejamento/nova-meta" label="Adicionar meta" />

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-label">Metas ativas</span>
          <strong>{ativas.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Metas concluídas</span>
          <strong>{concluidas.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Total</span>
          <strong>{metas.length}</strong>
        </article>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>Todas as metas</h2>
          <p>Panorama de andamento, prazo e status de execução.</p>
        </div>
        <div className="table-surface">
          {metaList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Objetivo</th>
                    <th>Responsável</th>
                    <th>Andamento</th>
                    <th>Prazo</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
              </thead>
              <tbody>
                  {metaList.map((meta) => (
                    <tr key={meta.id}>
                      <td className="table-cell-truncate"><strong>{meta.objetivo}</strong></td>
                      <td>{meta.responsavel?.nome || '—'}</td>
                      <td>
                        <div className="progress-row">
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${meta.andamento || 0}%` }} />
                          </div>
                          <span className="progress-value">{meta.andamento || 0}%</span>
                        </div>
                      </td>
                      <td className="text-sm-muted">
                        {meta.prazo ? new Date(meta.prazo).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td>
                        <span className={
                          meta.status === 'concluida'
                            ? 'inline-status inline-status-success'
                            : meta.status === 'atrasada'
                              ? 'inline-status inline-status-danger'
                              : meta.status === 'em_execucao'
                                ? 'inline-status inline-status-warning'
                                : 'inline-status'
                        }>
                          {meta.status === 'planejada' && 'Planejada'}
                          {meta.status === 'em_execucao' && 'Em execução'}
                          {meta.status === 'atrasada' && 'Atrasada'}
                          {meta.status === 'concluida' && 'Concluída'}
                          {meta.status === 'cancelada' && 'Cancelada'}
                          {meta.status === 'suspensa' && 'Suspensa'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/planejamento/${meta.id}`} className="profile-form-btn profile-form-btn-secondary">
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="area-empty">Nenhuma meta cadastrada.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function PlanejamentoPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <PlanejamentoContent />
    </Suspense>
  );
}
