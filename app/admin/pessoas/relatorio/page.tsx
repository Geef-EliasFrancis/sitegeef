import Link from 'next/link';
import { getTarefeiroReport } from '../actions';

export const metadata = {
  title: 'Relatório de tarefeiros - Admin GEEF',
};

export default async function TarefeirosReportPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const tarefeiros = await getTarefeiroReport(search);
  const totalDisponiveis = tarefeiros.reduce((total, item) => total + item.diasDisponiveis, 0);
  const totalEscalas = tarefeiros.reduce((total, item) => total + item.escalas, 0);

  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Tarefeiros</p>
          <h1 className="admin-page-title">Relatório de tarefeiros</h1>
        </div>
        <div className="admin-actions">
          <Link href="/admin/pessoas" className="admin-btn admin-btn-secondary">Pessoas</Link>
        </div>
      </div>

      <section className="area-section">
        <div className="stat-grid">
          <article className="stat-card"><span>Tarefeiros ativos</span><strong>{tarefeiros.length}</strong></article>
          <article className="stat-card"><span>Dias disponíveis</span><strong>{totalDisponiveis}</strong></article>
          <article className="stat-card"><span>Escalas registradas</span><strong>{totalEscalas}</strong></article>
        </div>
      </section>

      <section className="area-section">
        <div className="admin-card">
          <form method="GET" className="module-grid">
            <label className="profile-form-field">
              <span>Buscar tarefeiro, email ou função</span>
              <input name="search" defaultValue={search} className="profile-form-input" placeholder="Digite para filtrar" />
            </label>
            <div style={{ alignSelf: 'end' }}>
              <button type="submit" className="admin-btn admin-btn-secondary">Buscar</button>
            </div>
          </form>
        </div>
      </section>

      <section className="area-section">
        <div className="table-surface" style={{ overflowX: 'auto' }}>
          {tarefeiros.length === 0 ? (
            <div className="area-empty">Nenhum tarefeiro ativo encontrado.</div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Tarefeiro</th><th>Contato</th><th>Disponibilidade</th><th>Funções</th><th>Escalas</th><th>Última escala</th><th>Ação</th></tr></thead>
              <tbody>
                {tarefeiros.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong></td>
                    <td>{item.email || item.telefone || '—'}</td>
                    <td>{item.diasInformados === 0 ? 'Não informada' : `${item.diasDisponiveis}/ ${item.diasInformados} dias ativos`}</td>
                    <td>{item.funcoes.length > 0 ? item.funcoes.join(', ') : '—'}</td>
                    <td>{item.escalas} ({item.escalasPublicadas} publicadas)</td>
                    <td>{item.ultimaEscala ? new Date(`${item.ultimaEscala}T00:00:00`).toLocaleDateString('pt-BR') : '—'}</td>
                    <td><Link href={`/admin/pessoas/${item.id}`} className="admin-btn admin-btn-small">Editar</Link></td>
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
