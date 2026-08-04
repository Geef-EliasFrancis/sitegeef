import Link from 'next/link';
import { getCampanhas } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Campanhas APSE - Admin GEEF',
};

type CampanhaItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  meta?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  status?: string | null;
};

async function CampanhasContent() {
  const campanhas = (await getCampanhas()) as CampanhaItem[];

  return (
    <div>
      <AdminPageTitleAdd title="Campanhas APSE" href="/admin/apse/campanhas/nova" />

      <div className="admin-card">
        {campanhas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Meta</th>
                  <th>Período</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.map((campanha) => (
                  <tr key={campanha.id}>
                    <td className="text-sm-500">{campanha.nome}</td>
                    <td className="text-sm-muted">{campanha.descricao || '—'}</td>
                    <td className="text-sm-muted">{campanha.meta || '—'}</td>
                    <td className="text-xs-muted">
                      {campanha.data_inicio ? new Date(campanha.data_inicio).toLocaleDateString('pt-BR') : '—'} a {campanha.data_fim ? new Date(campanha.data_fim).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td>
                      <span className={campanha.status === 'planejada' ? 'inline-status inline-status-neutral' : 'inline-status inline-status-success'}>
                        {campanha.status === 'planejada' ? '📋 Planejada' : '▶ Em execução'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/apse/campanhas/${campanha.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center-muted">Nenhuma campanha cadastrada.</p>
        )}
      </div>
    </div>
  );
}

export default function CampanhasPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <CampanhasContent />
    </Suspense>
  );
}
