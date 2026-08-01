import { getRelatorioFinanceiro } from "@/app/admin/financeiro/actions";

type DREReportProps = {
  searchParams: { mes?: string; ano?: string };
};

type Movimento = {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  plano_contas?: { tipo?: "receita" | "despesa" } | null;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

export async function DREReport({ searchParams }: DREReportProps) {
  const hoje = new Date();
  const mes = searchParams.mes ? parseInt(searchParams.mes, 10) : hoje.getMonth() + 1;
  const ano = searchParams.ano ? parseInt(searchParams.ano, 10) : hoje.getFullYear();
  const movimentos = (await getRelatorioFinanceiro(mes, ano)) as Movimento[];
  const receitas = movimentos.filter((movimento) => movimento.plano_contas?.tipo === "receita");
  const despesas = movimentos.filter((movimento) => movimento.plano_contas?.tipo === "despesa");
  const totalReceitas = receitas.reduce((sum, movimento) => sum + movimento.valor, 0);
  const totalDespesas = despesas.reduce((sum, movimento) => sum + movimento.valor, 0);
  const resultado = totalReceitas - totalDespesas;
  const mesTexto = new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const despesasPorCategoria = despesas.reduce<Record<string, number>>((totais, movimento) => {
    totais[movimento.categoria] = (totais[movimento.categoria] ?? 0) + movimento.valor;
    return totais;
  }, {});
  const categorias = Object.entries(despesasPorCategoria)
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor);

  return (
    <div className="admin-report-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Financeiro</span>
          <h1 className="admin-page-title">Demonstração de Resultado</h1>
          <p className="admin-page-subtitle">{mesTexto}</p>
        </div>
      </header>

      <section className="admin-card admin-report-filters">
        <form method="get" className="admin-filter-form">
          <div className="admin-filter-fields">
            <label className="admin-field-label">
              Mês
              <select name="mes" defaultValue={mes} className="admin-filter-select">
                {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
                  <option key={item} value={item}>
                    {new Date(ano, item - 1).toLocaleDateString("pt-BR", { month: "short" })}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field-label">
              Ano
              <select name="ano" defaultValue={ano} className="admin-filter-select">
                {Array.from({ length: 5 }, (_, index) => ano - 2 + index).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="admin-btn admin-btn-primary">🔍 Gerar</button>
        </form>
      </section>

      <section className="admin-card admin-report-card">
        <h2 className="admin-report-title">Demonstração de Resultado do Exercício</h2>
        <div className="admin-report-content">
          <ReportGroup title="📥 RECEITAS" tone="success" items={receitas} total={totalReceitas} emptyLabel="Nenhuma receita registrada." />
          <ReportGroup title="📤 DESPESAS" tone="error" items={despesas} total={totalDespesas} emptyLabel="Nenhuma despesa registrada." />
          <div className={`admin-report-result ${resultado >= 0 ? "is-positive" : "is-negative"}`}>
            <span>RESULTADO DO EXERCÍCIO</span>
            <strong>{resultado >= 0 ? "+" : "-"} R$ {formatCurrency(Math.abs(resultado))}</strong>
          </div>
        </div>
      </section>

      {categorias.length > 0 ? (
        <section className="admin-card">
          <h2 className="admin-report-title">Despesas por Categoria</h2>
          <div className="admin-category-list">
            {categorias.map(({ categoria, valor }, index) => {
              const percentual = totalDespesas ? (valor / totalDespesas) * 100 : 0;
              return (
                <div key={categoria} className="admin-category-item">
                  <div className="admin-category-heading">
                    <span>{categoria}</span>
                    <strong>R$ {formatCurrency(valor)} ({percentual.toFixed(1)}%)</strong>
                  </div>
                  <div className="admin-category-track">
                    <div className={`admin-category-bar tone-${index % 5}`} style={{ width: `${percentual}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ReportGroup({
  title,
  tone,
  items,
  total,
  emptyLabel,
}: {
  title: string;
  tone: "success" | "error";
  items: Movimento[];
  total: number;
  emptyLabel: string;
}) {
  return (
    <div className={`admin-report-group tone-${tone}`}>
      <h3>{title}</h3>
      {items.length > 0 ? (
        <div className="admin-report-items">
          {items.map((item) => (
            <div key={item.id} className="admin-report-line">
              <span>{item.descricao}</span>
              <strong>{tone === "success" ? "+" : "-"}R$ {formatCurrency(item.valor)}</strong>
            </div>
          ))}
        </div>
      ) : <p className="admin-empty-state">{emptyLabel}</p>}
      <div className="admin-report-total">
        <span>Total de {tone === "success" ? "Receitas" : "Despesas"}</span>
        <strong>R$ {formatCurrency(total)}</strong>
      </div>
    </div>
  );
}
