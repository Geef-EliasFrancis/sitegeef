import Link from "next/link";
import { getSaldoMes, getMovimentosFinanceiros } from "./actions";
import { Suspense } from "react";

export const metadata = {
  title: "Financeiro - Admin GEEF",
};

type MovimentoItem = {
  id: string;
  data: string;
  descricao: string;
  tipo?: string | null;
  valor: number;
  centros_custo?: { nome?: string | null } | null;
};

async function FinanceiroContent() {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const { entradas, saidas, saldo } = await getSaldoMes(mesAtual, anoAtual);
  const movimentos = await getMovimentosFinanceiros(mesAtual, anoAtual);
  const movimentoList = movimentos as MovimentoItem[];

  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Financeiro</span>
          <h1 className="admin-page-title">Financeiro</h1>
          <p className="admin-page-subtitle">
            {new Date(anoAtual, mesAtual - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <section className="area-section">
        <div className="stat-grid">
          <div className="stat-card">
            <span>Entradas</span>
            <strong className="text-success">R$ {entradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className="stat-card">
            <span>Saídas</span>
            <strong className="text-danger">R$ {saidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className="stat-card">
            <span>Saldo</span>
            <strong className={saldo >= 0 ? "text-primary" : "text-danger"}>R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </section>

      <section className="area-section">
        <div className="admin-card">
          <div className="atendimento-section-header">
            <h2>Últimos lançamentos</h2>
            <Link href="/admin/financeiro/lancamentos" className="admin-btn admin-btn-small">
              Ver Todos →
            </Link>
          </div>

          {movimentoList.length > 0 ? (
            <div className="table-surface">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Centro de Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentoList.slice(0, 10).map((mov) => (
                    <tr key={mov.id}>
                      <td className="text-sm-muted">{new Date(mov.data).toLocaleDateString("pt-BR")}</td>
                      <td>
                        <strong>{mov.descricao}</strong>
                      </td>
                      <td>
                        <span className={mov.tipo === "entrada" ? "inline-status inline-status-success" : "inline-status inline-status-danger"}>
                          {mov.tipo === "entrada" ? "📥 Entrada" : "📤 Saída"}
                        </span>
                      </td>
                      <td className={mov.tipo === "entrada" ? "text-success" : "text-danger"}>
                        <strong>
                        R$ {mov.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </strong>
                      </td>
                      <td className="text-sm-muted">{mov.centros_custo?.nome || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="area-empty">
              <p className="mb-0">Nenhum lançamento neste mês.</p>
              <Link href="/admin/financeiro/lancamentos/novo" className="admin-btn admin-btn-primary mt-1">
                ➕ Novo Lançamento
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function FinanceiroPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <FinanceiroContent />
    </Suspense>
  );
}
