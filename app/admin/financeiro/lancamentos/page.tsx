import Link from 'next/link';
import { getMovimentosFinanceiros } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Lançamentos - Admin GEEF',
};

type MovimentoItem = {
  id: string;
  data: string;
  descricao: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  plano_contas?: { codigo?: string | null } | null;
  centros_custo?: { nome?: string | null } | null;
};

type FinanceSearchParams = {
  mes?: string;
  ano?: string;
};

async function LancamentosContent({ searchParams }: { searchParams: FinanceSearchParams }) {
  const hoje = new Date();
  const mes = searchParams.mes ? parseInt(searchParams.mes) : hoje.getMonth() + 1;
  const ano = searchParams.ano ? parseInt(searchParams.ano) : hoje.getFullYear();

  const movimentos = await getMovimentosFinanceiros(mes, ano);
  const movimentoList = movimentos as MovimentoItem[];

  const mesTexto = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <AdminPageTitleAdd title="Lançamentos" href="/admin/financeiro/lancamentos/novo" label="Adicionar lançamento" />

      {/* Filtros */}
      <div className="admin-card panel-accent-card">
        <form method="get" className="admin-search-form">
          <label className="profile-form-field">
            <span>Mês</span>
            <select name="mes" defaultValue={mes} className="profile-form-input">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(ano, m - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-form-field">
            <span>Ano</span>
            <select name="ano" defaultValue={ano} className="profile-form-input">
              {Array.from({ length: 5 }, (_, i) => ano - 2 + i).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="admin-btn admin-btn-primary">
            🔍 Filtrar
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div className="admin-card">
        {movimentoList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Conta</th>
                  <th>Valor</th>
                  <th>Centro de Custo</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {movimentoList.map((mov) => (
                  <tr key={mov.id}>
                    <td className="text-sm-muted">
                      {new Date(mov.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="text-sm-500">
                      {mov.descricao}
                    </td>
                    <td>
                      <span className={mov.tipo === 'entrada' ? 'inline-status inline-status-success' : 'inline-status inline-status-danger'}>
                        {mov.tipo === 'entrada' ? '📥' : '📤'} {mov.tipo}
                      </span>
                    </td>
                    <td className="text-sm-muted">
                      {mov.plano_contas?.codigo}
                    </td>
                    <td className={mov.tipo === 'entrada' ? 'text-success' : 'text-danger'}>
                      {mov.tipo === 'entrada' ? '+' : '-'} R$ {mov.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-sm-muted">
                      {mov.centros_custo?.nome || '—'}
                    </td>
                    <td>
                      <Link href={`/admin/financeiro/lancamentos/${mov.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="area-empty">
            <p>Nenhum lançamento neste período.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function LancamentosPage({ searchParams }: { searchParams: Promise<FinanceSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <LancamentosContent searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

