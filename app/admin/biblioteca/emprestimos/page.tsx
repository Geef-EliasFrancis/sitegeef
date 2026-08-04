import Link from 'next/link';
import { getEmprestimos, getHistoricoEmprestimos } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Empréstimos - Admin GEEF',
};

type EmprestimoItem = {
  id: string;
  data_retirada: string;
  prazo_devolucao?: string | null;
  data_devolucao?: string | null;
  pessoas?: { nome?: string | null } | null;
  exemplares?: { codigo?: string | null; obra?: { titulo?: string | null } | null } | null;
};

type EmprestimosSearchParams = {
  page?: string;
  view?: string;
};

async function EmprestimosList({ searchParams }: { searchParams: EmprestimosSearchParams }) {
  const page = parseInt(searchParams.page || '1', 10);
  const view = searchParams.view || 'ativos';

  let data: { emprestimos?: EmprestimoItem[]; historico?: EmprestimoItem[]; total: number; pageSize: number };
  if (view === 'ativos') {
    data = await getEmprestimos(page);
  } else {
    data = await getHistoricoEmprestimos(page);
  }

  const emprestimos = view === 'ativos' ? data.emprestimos || [] : data.historico || [];
  const totalPages = Math.ceil(data.total / data.pageSize);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="area-page">
      {view === 'ativos' ? (
        <AdminPageTitleAdd title="Empréstimos" href="/admin/biblioteca/emprestimos/novo" label="Adicionar empréstimo" />
      ) : (
        <div className="admin-page-header admin-page-header--title-add">
          <h1 className="admin-page-title">Empréstimos</h1>
        </div>
      )}

      <section className="area-section">
        <div className="area-panel-grid">
          <Link href="/admin/biblioteca/emprestimos?view=ativos" className={`module-card${view === 'ativos' ? ' module-card-accent' : ''}`}>
            <h3 className="module-title">Empréstimos ativos</h3>
            <p>Itens em circulação e prazos em aberto.</p>
          </Link>
          <Link href="/admin/biblioteca/emprestimos?view=historico" className={`module-card${view === 'historico' ? ' module-card-accent' : ''}`}>
            <h3 className="module-title">Histórico de devoluções</h3>
            <p>Empréstimos já encerrados.</p>
          </Link>
        </div>
      </section>

      <section className="area-section">
        <div className="table-surface">
          {emprestimos.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Obra</th>
                  <th>Código</th>
                  <th>Data retirada</th>
                  {view === 'ativos' ? <th>Prazo devolução</th> : <th>Data devolução</th>}
                  {view === 'ativos' && <th>Status</th>}
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {emprestimos.map((emprestimo) => {
                  const vencido = Boolean(emprestimo.prazo_devolucao && emprestimo.prazo_devolucao < today);
                  return (
                    <tr key={emprestimo.id}>
                      <td><strong>{emprestimo.pessoas?.nome}</strong></td>
                      <td>{emprestimo.exemplares?.obra?.titulo}</td>
                      <td className="text-sm-muted">{emprestimo.exemplares?.codigo}</td>
                      <td>{new Date(emprestimo.data_retirada + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      {view === 'ativos' ? (
                        <>
                          <td className={vencido ? 'text-danger' : undefined}>
                            {emprestimo.prazo_devolucao
                              ? new Date(emprestimo.prazo_devolucao + 'T00:00:00').toLocaleDateString('pt-BR')
                              : '—'}
                            {vencido ? ' ⚠️' : ''}
                          </td>
                          <td>
                            <span className={vencido ? 'inline-status inline-status-danger' : 'inline-status inline-status-warning'}>
                              {vencido ? 'Vencido' : 'Em aberto'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td>{emprestimo.data_devolucao ? new Date(emprestimo.data_devolucao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                      )}
                      <td>
                        <Link href={`/admin/biblioteca/emprestimos/${emprestimo.id}`} className="profile-form-btn profile-form-btn-secondary">
                          {view === 'ativos' ? 'Devolver' : 'Ver'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="area-empty">{view === 'ativos' ? 'Nenhum empréstimo ativo.' : 'Nenhum histórico de devolução.'}</div>
          )}
        </div>
      </section>

      {totalPages > 1 && (
        <section className="area-section">
          <div className="page-pagination">
            {page > 1 && (
              <Link href={`/admin/biblioteca/emprestimos?page=${page - 1}&view=${view}`} className="profile-form-btn profile-form-btn-secondary">
                Anterior
              </Link>
            )}
            <span className="page-pagination-label">
              Página {page} de {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/admin/biblioteca/emprestimos?page=${page + 1}&view=${view}`} className="profile-form-btn profile-form-btn-secondary">
                Próxima
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function EmprestimosPage({ searchParams }: { searchParams: Promise<EmprestimosSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <EmprestimosList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

