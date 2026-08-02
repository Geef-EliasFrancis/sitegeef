import Link from 'next/link';
import { getFuncoes } from './actions';
import { Suspense } from 'react';

export const metadata = {
  title: 'Funções e Temas - Admin GEEF',
};

type FuncaoItem = {
  id: string;
  nome: string;
  descricao?: string | null;
};

async function FuncoesList() {
  const funcoes = await getFuncoes();
  const funcaoList = funcoes as FuncaoItem[];

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="area-subtitle">Escalas e temas</p>
            <h1 className="area-hero-title">Funções e Temas</h1>
          </div>
          <Link href="/admin/funcoes/nova" className="profile-form-btn profile-form-btn-primary">
            Nova Função
          </Link>
        </div>
        <p className="area-subtitle">Configure funções de escalas e temas doutrinários.</p>
      </section>

      <section className="area-section">
        <div className="table-surface">
          {funcaoList.length === 0 ? (
            <div className="area-empty">
              <p>Nenhuma função cadastrada.</p>
              <Link href="/admin/funcoes/nova" className="profile-form-btn profile-form-btn-primary">Criar primeira função</Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {funcaoList.map((funcao) => (
                  <tr key={funcao.id}>
                    <td><strong>{funcao.nome}</strong></td>
                    <td className="text-sm-muted">{funcao.descricao || '—'}</td>
                    <td>
                      <Link href={`/admin/funcoes/${funcao.id}`} className="profile-form-btn profile-form-btn-secondary">
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

export default function FuncoesPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <FuncoesList />
    </Suspense>
  );
}
