import Link from 'next/link';
import { getAtendimentosFraterno } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Atendimento Fraterno - Admin GEEF',
};

export const dynamic = 'force-dynamic';

type FraternoItem = {
  id: string;
  data: string;
  tipo?: string | null;
  status?: string | null;
  sigilo?: boolean | null;
  pessoas?: { nome?: string | null } | null;
  atendente?: { nome?: string | null } | null;
};

type FraternoSearchParams = {
  mes?: string;
  ano?: string;
};

function resolveStatusClass(status?: string | null) {
  return status === 'em_aberto' ? 'inline-status inline-status-success' : 'inline-status inline-status-warning';
}

async function FraternoContent({ searchParams }: { searchParams: FraternoSearchParams }) {
  const hoje = new Date();
  const mes = searchParams.mes ? parseInt(searchParams.mes, 10) : hoje.getMonth() + 1;
  const ano = searchParams.ano ? parseInt(searchParams.ano, 10) : hoje.getFullYear();

  const atendimentos = await getAtendimentosFraterno(mes, ano);
  const atendimentoList = atendimentos as FraternoItem[];

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Fraterno" href="/admin/atendimento/fraterno/novo" label="Adicionar atendimento" />

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
            <div className="area-panel-item area-panel-item-end">
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
          {atendimentoList.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Pessoa</th>
                  <th>Atendente</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Privacidade</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {atendimentoList.map((atend) => (
                  <tr key={atend.id}>
                    <td><strong>{new Date(atend.data).toLocaleDateString('pt-BR')}</strong></td>
                    <td><strong>{atend.pessoas?.nome}</strong></td>
                    <td className="text-sm-muted">{atend.atendente?.nome}</td>
                    <td>{atend.tipo}</td>
                    <td>
                      <span className={resolveStatusClass(atend.status)}>
                        {atend.status === 'em_aberto' ? 'Aberto' : 'Encerrado'}
                      </span>
                    </td>
                    <td>
                      <span className={atend.sigilo ? 'inline-status inline-status-danger' : 'inline-status'}>
                        {atend.sigilo ? 'Sigiloso' : 'Registro'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/atendimento/fraterno/${atend.id}`} className="profile-form-btn profile-form-btn-secondary">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="area-empty">Nenhum atendimento fraterno neste período.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default async function FraternoPage({ searchParams }: { searchParams: Promise<FraternoSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <FraternoContent searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

