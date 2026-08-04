import Link from 'next/link';
import { getGrupos } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Mediunidade - Admin GEEF',
};

type GrupoItem = {
  id: string;
  nome: string;
  status?: string | null;
  coordenador?: { nome?: string | null } | null;
};

async function MediunidadeContent() {
  const grupos = await getGrupos();
  const grupoList = grupos as GrupoItem[];
  const ativos = grupoList.filter((g) => g.status === 'ativo');

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Mediunidade" href="/admin/mediunidade/novo-grupo" label="Adicionar grupo" />

      <section className="area-section">
        <div className="area-panel-item">
          <strong>Acesso restrito</strong>
          <p className="area-subtitle mb-0">
            Apenas usuários com permissão <code>pode_mediunidade</code> podem acessar este módulo.
          </p>
        </div>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-label">Grupos ativos</span>
          <strong>{ativos.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Total de grupos</span>
          <strong>{grupos.length}</strong>
        </article>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>Grupos mediúnicos</h2>
          <p>Visão resumida dos grupos e seus responsáveis.</p>
        </div>
        <div className="table-surface">
          {grupoList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Coordenador</th>
                    <th>Status</th>
                    <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                  {grupoList.map((grupo) => (
                    <tr key={grupo.id}>
                      <td>
                        <strong>{grupo.nome}</strong>
                      </td>
                      <td>{grupo.coordenador?.nome || '—'}</td>
                      <td>
                        <span className={grupo.status === 'ativo' ? 'inline-status inline-status-success' : 'inline-status inline-status-neutral'}>
                          {grupo.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/mediunidade/${grupo.id}`} className="profile-form-btn profile-form-btn-secondary">
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="area-empty">Nenhum grupo cadastrado.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function MediunidadePage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <MediunidadeContent />
    </Suspense>
  );
}
