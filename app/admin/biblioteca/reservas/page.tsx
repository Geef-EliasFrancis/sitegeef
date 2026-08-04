import Link from 'next/link';
import { getReservas } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Reservas - Admin GEEF',
};

type ReservaItem = {
  id: string;
  posicao_fila: number;
  criado_em: string;
  pessoas?: { nome?: string | null } | null;
  obras?: { titulo?: string | null; autor?: string | null } | null;
};

type ReservasSearchParams = {
  page?: string;
};

async function ReservasList({ searchParams }: { searchParams: ReservasSearchParams }) {
  const page = parseInt(searchParams.page || '1', 10);

  const { reservas, total, pageSize } = await getReservas(page);
  const reservaList = reservas as ReservaItem[];
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Header */}
      <AdminPageTitleAdd title="Reservas" href="/admin/biblioteca/reservas/nova" label="Adicionar reserva" />

      {/* Table */}
      <div className="admin-card">
        {reservaList.length > 0 ? (
          <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Pessoa</th>
                <th>Obra</th>
                <th>Autor</th>
                <th>Data Reserva</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {reservaList.map((reserva) => (
                <tr key={reserva.id}>
                  <td className="table-cell-center">
                    <strong>
                    #{reserva.posicao_fila}
                    </strong>
                  </td>
                  <td><strong>{reserva.pessoas?.nome}</strong></td>
                  <td className="text-sm-muted">
                    {reserva.obras?.titulo}
                  </td>
                  <td className="text-xs-muted">
                    {reserva.obras?.autor || '—'}
                  </td>
                  <td className="text-sm-muted">
                    {new Date(reserva.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <Link
                      href={`/admin/biblioteca/reservas/${reserva.id}`}
                      className="admin-btn admin-btn-small"
                    >
                      ✏️ Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="area-empty">
            <p>Nenhuma reserva aguardando.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="page-pagination">
          {page > 1 && (
            <Link
              href={`/admin/biblioteca/reservas?page=${page - 1}`}
              className="admin-btn admin-btn-secondary"
            >
              ← Anterior
            </Link>
          )}
          <span className="page-pagination-label">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/biblioteca/reservas?page=${page + 1}`}
              className="admin-btn admin-btn-secondary"
            >
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function ReservasPage({ searchParams }: { searchParams: Promise<ReservasSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <ReservasList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

