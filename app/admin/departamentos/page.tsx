import Link from 'next/link';
import { Suspense } from 'react';
import { getDepartamentos } from './actions';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Departamentos - Admin GEEF',
};

type DepartamentoListItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  coordenador_id?: string | null;
  departamento_membros?: Array<{ pessoa_id?: string | null }>;
};

type DepartamentosSearchParams = {
  page?: string;
};

async function DepartamentosList({ searchParams }: { searchParams: DepartamentosSearchParams }) {
  const page = Number.parseInt(searchParams.page || '1', 10);
  const { departamentos, total, pageSize } = await getDepartamentos(page);
  const departamentoList = departamentos as DepartamentoListItem[];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Departamentos" href="/admin/departamentos/novo" />

      <section className="area-section">
        <div className="admin-card panel-accent-card">
          {departamentoList.length === 0 ? (
            <div className="area-empty">
              <p>Nenhum departamento cadastrado.</p>
              <Link href="/admin/departamentos/novo" className="admin-btn admin-btn-primary mt-1">
                ➕ Criar primeiro departamento
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Coordenador</th>
                    <th>Membros</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {departamentoList.map((dept) => (
                    <tr key={dept.id}>
                      <td>
                        <strong>{dept.nome}</strong>
                      </td>
                      <td className="text-sm-muted">
                        {dept.descricao ? dept.descricao.substring(0, 50) : '—'}
                        {dept.descricao && dept.descricao.length > 50 ? '...' : ''}
                      </td>
                      <td className="text-sm-muted">{dept.coordenador_id ? '✅ Sim' : '—'}</td>
                      <td className="text-sm-muted">
                        <strong>{dept.departamento_membros?.length || 0}</strong>
                      </td>
                      <td>
                        <Link href={`/admin/departamentos/${dept.id}`} className="admin-btn admin-btn-small">
                          ✏️ Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {totalPages > 1 && (
        <div className="page-pagination">
          {page > 1 && (
            <Link href={`/admin/departamentos?page=${page - 1}`} className="admin-btn admin-btn-secondary">
              ← Anterior
            </Link>
          )}
          <span className="page-pagination-label">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/admin/departamentos?page=${page + 1}`} className="admin-btn admin-btn-secondary">
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

type DepartamentosPageParams = {
  page?: string;
};

export default async function DepartamentosPage({
  searchParams,
}: {
  searchParams: Promise<DepartamentosPageParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <DepartamentosList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
