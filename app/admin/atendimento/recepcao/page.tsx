import Link from 'next/link';
import { getRecepcoes } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Recepção - Admin GEEF',
};

type RecepcaoItem = {
  id: string;
  data: string;
  pessoas_atendidas: number;
  motivo_geral: string;
  encaminhamento?: string | null;
};

async function RecepcaoContent({ searchParams }: { searchParams: { mes?: string; ano?: string } }) {
  const hoje = new Date();
  const mes = searchParams.mes ? parseInt(searchParams.mes, 10) : hoje.getMonth() + 1;
  const ano = searchParams.ano ? parseInt(searchParams.ano, 10) : hoje.getFullYear();

  const recepcoes = await getRecepcoes(mes, ano);
  const recepcaoList = recepcoes as RecepcaoItem[];

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Recepção" href="/admin/atendimento/recepcao/novo" label="Adicionar atendimento" />

      <section className="area-section">
        <div className="table-surface">
          <form method="get" className="module-grid align-end">
            <label className="profile-form-field">
              <span>Mês</span>
              <select name="mes" defaultValue={mes} className="profile-form-input">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{new Date(ano, m - 1).toLocaleDateString('pt-BR', { month: 'long' })}</option>
                ))}
              </select>
            </label>
            <label className="profile-form-field">
              <span>Ano</span>
              <select name="ano" defaultValue={ano} className="profile-form-input">
                {Array.from({ length: 5 }, (_, i) => ano - 2 + i).map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
            <div className="area-panel-item">
              <button type="submit" className="profile-form-btn profile-form-btn-primary">Filtrar</button>
            </div>
          </form>
        </div>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>Atendimentos</h2>
          <p>Registros do mês filtrado.</p>
        </div>
        <div className="table-surface">
          {recepcaoList.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Pessoas atendidas</th>
                  <th>Motivo geral</th>
                  <th>Encaminhamento</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {recepcaoList.map((rec) => (
                  <tr key={rec.id}>
                    <td><strong>{new Date(rec.data).toLocaleDateString('pt-BR')}</strong></td>
                    <td className="table-cell-center"><strong>{rec.pessoas_atendidas}</strong></td>
                    <td>{rec.motivo_geral}</td>
                    <td className="text-sm-muted">{rec.encaminhamento || '—'}</td>
                    <td>
                      <Link href={`/admin/atendimento/recepcao/${rec.id}`} className="profile-form-btn profile-form-btn-secondary">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="area-empty">Nenhum atendimento de recepção neste período.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default async function RecepcaoPage({ searchParams }: { searchParams: Promise<{ mes?: string; ano?: string }> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <RecepcaoContent searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

