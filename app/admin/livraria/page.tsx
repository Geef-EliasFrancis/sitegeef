import Link from 'next/link';
import { getProdutos } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Livraria - Admin GEEF',
};

type LivrariaSearchParams = {
  page?: string;
  search?: string;
};

type ProdutoLivrariaItem = {
  id: string;
  titulo: string;
  autor?: string | null;
  categoria?: string | null;
  qtd_estoque: number;
  estoque_minimo: number;
  valor_venda?: number | null;
  status?: string | null;
};

async function LivrariaList({ searchParams }: { searchParams: LivrariaSearchParams }) {
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';

  const { produtos, total, pageSize } = await getProdutos(page, search);
  const produtoList = produtos as ProdutoLivrariaItem[];
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Livraria" href="/admin/livraria/novo-produto" label="Adicionar produto" />

      <section className="area-section">
        <div className="table-surface">
          <form method="get" className="admin-search-form">
            <label className="profile-form-field">
              <span>Buscar</span>
              <input
                type="text"
                name="search"
                placeholder="Buscar por título ou autor..."
                defaultValue={search}
                className="profile-form-input"
              />
            </label>
            <div className="area-panel-item">
              <button type="submit" className="profile-form-btn profile-form-btn-primary">Buscar</button>
              {search ? (
                <Link href="/admin/livraria" className="profile-form-btn profile-form-btn-secondary">
                  Limpar
                </Link>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>Produtos</h2>
          <p>Controle de disponibilidade, categoria e preço de venda.</p>
        </div>
        <div className="table-surface">
          {produtos.length === 0 ? (
            <div className="area-empty text-center-muted">
              <p>{search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}</p>
              <Link href="/admin/livraria/novo-produto" className="profile-form-btn profile-form-btn-primary">
                Adicionar primeiro produto
              </Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                  <th>Preço venda</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {produtoList.map((produto) => {
                  const baixoEstoque = produto.qtd_estoque <= produto.estoque_minimo;
                  return (
                    <tr key={produto.id}>
                      <td className="text-sm-500">{produto.titulo}</td>
                      <td className="text-sm-muted">{produto.autor || '—'}</td>
                      <td>
                        {produto.categoria ? <span className="tag">{produto.categoria}</span> : '—'}
                      </td>
                      <td className={baixoEstoque ? 'text-sm-500 text-danger' : 'text-sm-500'}>
                        {produto.qtd_estoque}{baixoEstoque ? ' ⚠️' : ''}
                      </td>
                      <td className="text-sm-500">
                        {produto.valor_venda
                          ? `R$ ${produto.valor_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : '—'}
                      </td>
                      <td>
                        <span className={produto.status === 'disponivel' ? 'inline-status inline-status-success' : 'inline-status'}>
                          {produto.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/livraria/${produto.id}`} className="profile-form-btn profile-form-btn-secondary">
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
          <div className="area-panel-grid page-pagination">
            {page > 1 && (
              <Link href={`/admin/livraria?page=${page - 1}${search ? `&search=${search}` : ''}`} className="profile-form-btn profile-form-btn-secondary">
                Anterior
              </Link>
            )}
            <span className="area-panel-item page-pagination-label">
              Página {page} de {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/admin/livraria?page=${page + 1}${search ? `&search=${search}` : ''}`} className="profile-form-btn profile-form-btn-secondary">
                Próxima
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function LivrariaPage({ searchParams }: { searchParams: Promise<LivrariaSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <LivrariaList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

