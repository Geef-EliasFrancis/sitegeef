import Link from 'next/link';
import { getEscalas } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Escalas Mensais - Admin GEEF',
};

type EscalaItem = {
  id: string;
  mes: number;
  ano: number;
  status?: string | null;
  criado_em: string;
};

function getMonthName(mes: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  return months[mes - 1];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'rascunho':
      return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    case 'revisada':
      return { bg: 'rgba(251, 146, 60, 0.1)', color: '#f97316' };
    case 'publicada':
      return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
    default:
      return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
  }
}

async function EscalasList({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || '1', 10);

  const { escalas, total, pageSize } = await getEscalas(page);
  const escalaList = escalas as EscalaItem[];
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Escalas Mensais" href="/admin/escalas/nova" label="Adicionar escala" />

      <section className="area-section">
        <div className="table-surface">
          {escalaList.length === 0 ? (
            <div className="area-empty">
              <p>Nenhuma escala cadastrada.</p>
              <Link href="/admin/escalas/nova" className="profile-form-btn profile-form-btn-primary">
                Criar primeira escala
              </Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Ano</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {escalaList.map((escala) => {
                  const statusColor = getStatusColor(escala.status || 'default');
                  return (
                    <tr key={escala.id}>
                      <td><strong>{getMonthName(escala.mes)}</strong></td>
                      <td>{escala.ano}</td>
                      <td>
                        <span className="inline-status" style={{ backgroundColor: statusColor.bg, color: statusColor.color }}>
                          {escala.status}
                        </span>
                      </td>
                      <td className="text-sm-muted">
                        {new Date(escala.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                      <td>
                        <Link href={`/admin/escalas/${escala.id}`} className="profile-form-btn profile-form-btn-secondary">
                          Editar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {totalPages > 1 && (
        <section className="area-section">
          <div className="page-pagination">
            {page > 1 && (
              <Link href={`/admin/escalas?page=${page - 1}`} className="profile-form-btn profile-form-btn-secondary">
                Anterior
              </Link>
            )}
            <span className="page-pagination-label">
              Página {page} de {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/admin/escalas?page=${page + 1}`} className="profile-form-btn profile-form-btn-secondary">
                Próxima
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function EscalasPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <EscalasList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

