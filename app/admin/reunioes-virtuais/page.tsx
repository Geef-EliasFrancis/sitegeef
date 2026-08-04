import Link from 'next/link';
import { getReunioes } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Reuniões Virtuais - Admin GEEF',
};

type ReuniaoItem = {
  id: string;
  titulo: string;
  plataforma?: string | null;
  data_hora?: string | null;
  status?: string | null;
  anfitriao?: { nome?: string | null } | null;
};

async function ReunioesvirtualaisContent() {
  const reunioes = await getReunioes();
  const reuniaoList = reunioes as ReuniaoItem[];
  const planejadas = reuniaoList.filter((r) => r.status === 'planejada');
  const finalizadas = reuniaoList.filter((r) => r.status === 'finalizada');

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Reuniões Virtuais" href="/admin/reunioes-virtuais/nova" label="Adicionar reunião" />

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-label">Planejadas</span>
          <strong>{planejadas.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Finalizadas</span>
          <strong>{finalizadas.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Total</span>
          <strong>{reunioes.length}</strong>
        </article>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>Todas as reuniões</h2>
          <p>Panorama dos encontros agendados e concluídos.</p>
        </div>
        <div className="table-surface">
          {reuniaoList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Plataforma</th>
                    <th>Anfitrião</th>
                    <th>Data/Hora</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
              </thead>
              <tbody>
                  {reuniaoList.map((reuniao) => (
                    <tr key={reuniao.id}>
                      <td><strong>{reuniao.titulo}</strong></td>
                      <td>{reuniao.plataforma ? reuniao.plataforma : '—'}</td>
                      <td>{reuniao.anfitriao?.nome || '—'}</td>
                      <td className="text-sm-muted">
                        {reuniao.data_hora ? new Date(reuniao.data_hora).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td>
                        <span className={reuniao.status === 'planejada' ? 'inline-status inline-status-warning' : 'inline-status inline-status-success'}>
                          {reuniao.status === 'planejada' ? 'Planejada' : 'Finalizada'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/reunioes-virtuais/${reuniao.id}`} className="profile-form-btn profile-form-btn-secondary">
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="area-empty">Nenhuma reunião cadastrada.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ReunioesvirtualaisPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <ReunioesvirtualaisContent />
    </Suspense>
  );
}
