import Link from 'next/link';
import { getGrupos } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Juventude - Admin GEEF',
};

type GrupoItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  status?: string | null;
  coordenador?: { nome?: string | null } | null;
};

async function JuventudeContent() {
  const grupos = await getGrupos();
  const grupoList = grupos as GrupoItem[];
  const gruposAtivos = grupoList.filter((g) => g.status === 'ativo');

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Juventude" href="/admin/juventude/novo" label="Adicionar grupo" />

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-label">Grupos ativos</span>
          <strong>{gruposAtivos.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Total de grupos</span>
          <strong>{grupos.length}</strong>
        </article>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>Grupos</h2>
          <p>Visão geral dos grupos cadastrados e seus coordenadores.</p>
        </div>
        <div className="table-surface">
          {grupoList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Coordenador</th>
                    <th>Descrição</th>
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
                      <td className="text-sm-muted">{grupo.descricao || '—'}</td>
                      <td>
                        <span className={grupo.status === 'ativo' ? 'inline-status inline-status-success' : 'inline-status inline-status-neutral'}>
                          {grupo.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/juventude/${grupo.id}`} className="profile-form-btn profile-form-btn-secondary">
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

export default function JuventudePagePage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <JuventudeContent />
    </Suspense>
  );
}
