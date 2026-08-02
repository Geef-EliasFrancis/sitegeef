import { getRelatorioFinanceiro, getEstatisticasGerais, getMesesDisponiveis, getAnosDisponiveis } from './actions';
import { Suspense } from 'react';

export const metadata = {
  title: 'Relatórios - Admin GEEF',
};

async function RelatoriosContent() {
  const stats = await getEstatisticasGerais();
  const relatorio = await getRelatorioFinanceiro();
  const meses = await getMesesDisponiveis();
  const anos = await getAnosDisponiveis();
  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="area-subtitle">Relatórios</p>
            <h1 className="area-hero-title">Relatórios</h1>
          </div>
        </div>
        <p className="area-subtitle">Síntese e análise de dados da organização.</p>
      </section>

      <section className="area-section">
        <div className="stat-grid">
          <div className="stat-card">
            <span>Pessoas ativas</span>
            <strong>{stats.pessoasAtivas}</strong>
          </div>
          <div className="stat-card">
            <span>Cursos ativos</span>
            <strong>{stats.cursosAtivos}</strong>
          </div>
          <div className="stat-card">
            <span>Turmas total</span>
            <strong>{stats.turmasTotal}</strong>
          </div>
          <div className="stat-card">
            <span>Famílias assistidas</span>
            <strong>{stats.familiasAssistidas}</strong>
          </div>
        </div>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>
            Resumo financeiro - {meses[relatorio.mes - 1]?.nome} de {relatorio.ano}
          </h2>
          <p>Consolidação do período selecionado.</p>
        </div>
        <div className="table-surface">
          <div className="stat-grid stat-grid-220">
            <div className="stat-card">
              <span>Receitas</span>
              <strong className="text-success">
                R$ {relatorio.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="stat-card">
              <span>Despesas</span>
              <strong className="text-danger">
                R$ {relatorio.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="stat-card">
              <span>Resultado</span>
              <strong className={relatorio.resultado >= 0 ? 'text-success' : 'text-danger'}>
                R$ {relatorio.resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <p className="panel-note mt-1">Relatórios detalhados estão disponíveis nos módulos específicos.</p>
        </div>
      </section>

    </div>
  );
}

export default function RelatoriosPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <RelatoriosContent />
    </Suspense>
  );
}
