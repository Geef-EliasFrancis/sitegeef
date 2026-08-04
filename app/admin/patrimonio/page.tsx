import Link from 'next/link';
import { getBens } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Patrimônio - Admin GEEF',
};

type BemItem = {
  id: string;
  nome: string;
  categoria?: string | null;
  localizacao?: string | null;
  status?: string | null;
  conservacao?: string | null;
  responsavel?: { nome?: string | null } | null;
};

async function PatrimonioContent() {
  const bens = await getBens();
  const bemList = bens as BemItem[];
  const ativos = bemList.filter((b) => b.status === 'ativo');

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Patrimônio" href="/admin/patrimonio/novo-bem" label="Adicionar bem" />

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-label">Bens ativos</span>
          <strong>{ativos.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Total de bens</span>
          <strong>{bens.length}</strong>
        </article>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>Todos os bens</h2>
          <p>Lista consolidada com localização e estado de conservação.</p>
        </div>
        <div className="table-surface">
          {bemList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Localização</th>
                    <th>Responsável</th>
                    <th>Conservação</th>
                    <th>Status</th>
                    <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                  {bemList.map((bem) => (
                    <tr key={bem.id}>
                      <td><strong>{bem.nome}</strong></td>
                      <td>{bem.categoria || '—'}</td>
                      <td className="text-sm-muted">{bem.localizacao || '—'}</td>
                      <td>{bem.responsavel?.nome || '—'}</td>
                      <td>
                        <span className={
                          bem.conservacao === 'bom'
                            ? 'inline-status inline-status-success'
                            : bem.conservacao === 'regular'
                              ? 'inline-status inline-status-warning'
                              : bem.conservacao === 'ruim'
                                ? 'inline-status inline-status-danger'
                                : 'inline-status'
                        }>
                          {bem.conservacao === 'bom' && 'Bom'}
                          {bem.conservacao === 'regular' && 'Regular'}
                          {bem.conservacao === 'ruim' && 'Ruim'}
                          {!bem.conservacao && '—'}
                        </span>
                      </td>
                      <td>
                        <span className={bem.status === 'ativo' ? 'inline-status inline-status-success' : 'inline-status'}>
                          {bem.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/patrimonio/${bem.id}`} className="profile-form-btn profile-form-btn-secondary">
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="area-empty">Nenhum bem cadastrado.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function PatrimonioPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <PatrimonioContent />
    </Suspense>
  );
}
