import Link from 'next/link';
import { createFuncaoFromList, getFuncoes, toggleFuncaoStatusFromList } from './actions';
import { Suspense } from 'react';
import { IconPlus } from '@/components/icons';

export const metadata = {
  title: 'Funções e Temas - Admin GEEF',
};

type FuncaoItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
};

async function FuncoesList({ closeKey }: { closeKey: string }) {
  const funcoes = await getFuncoes(false);
  const funcaoList = funcoes as FuncaoItem[];

  return (
    <div className="area-page">
      <details key={closeKey} className="funcoes-create-disclosure">
        <summary className="admin-page-header admin-page-header--title-add funcoes-page-header">
          <h1 className="admin-page-title">Funções</h1>
          <span className="admin-btn admin-btn-primary admin-page-add-button" aria-label="Adicionar função" title="Adicionar função">
            <IconPlus size={20} />
          </span>
        </summary>
        <section className="area-section">
          <div className="admin-card funcoes-create-card">
            <form action={createFuncaoFromList} className="module-grid funcoes-create-form">
              <label className="profile-form-field">
                <span>Nome da função *</span>
                <input name="nome" className="profile-form-input" required placeholder="Ex.: Dirigente" />
              </label>
              <label className="profile-form-field">
                <span>Descrição</span>
                <input name="descricao" className="profile-form-input" placeholder="Descreva a função" />
              </label>
              <div><button type="submit" className="admin-btn admin-btn-primary">Salvar função</button></div>
            </form>
          </div>
        </section>
      </details>

      <section className="area-section funcoes-list-section">
        <div className="table-surface">
          {funcaoList.length === 0 ? (
            <div className="area-empty" aria-hidden="true" />
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Escalável</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcaoList.map((funcao) => (
                  <tr key={funcao.id}>
                    <td><strong>{funcao.nome}</strong></td>
                    <td className="text-sm-muted">{funcao.descricao || '—'}</td>
                    <td>
                      <form action={toggleFuncaoStatusFromList}>
                        <input type="hidden" name="id" value={funcao.id} />
                        <input type="hidden" name="ativo" value={String(!funcao.ativo)} />
                        <button type="submit" className={`inline-status ${funcao.ativo ? 'inline-status-success' : 'inline-status-neutral'}`}>
                          {funcao.ativo ? 'Sim' : 'Não'}
                        </button>
                      </form>
                    </td>
                    <td>
                      <Link href={`/admin/pessoas/funcoes/${funcao.id}`} className="profile-form-btn profile-form-btn-secondary">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default async function FuncoesPage({ searchParams }: { searchParams: Promise<{ cadastro?: string }> }) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <FuncoesList closeKey={params.cadastro || 'novo'} />
    </Suspense>
  );
}
