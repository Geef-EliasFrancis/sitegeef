import Link from 'next/link';
import { getEvangelhasNoLar } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Evangelho no Lar - Admin GEEF',
};

type EvangelhoItem = {
  id: string;
  data: string;
  situacao?: string | null;
  endereco?: string | null;
  equipe?: string | null;
  pessoas?: { nome?: string | null } | null;
};

type EvangelhoSituacao = 'planejada' | 'realizada' | 'adiada' | 'cancelada' | string | null | undefined;

function resolveSituacaoClass(situacao: EvangelhoSituacao) {
  switch (situacao) {
    case 'planejada':
      return 'inline-status inline-status-info';
    case 'realizada':
      return 'inline-status inline-status-success';
    case 'adiada':
      return 'inline-status inline-status-warning';
    case 'cancelada':
      return 'inline-status inline-status-danger';
    default:
      return 'inline-status inline-status-neutral';
  }
}

async function EvangelhasContent() {
  const evangelhos = await getEvangelhasNoLar();
  const evangelhoList = evangelhos as EvangelhoItem[];

  return (
    <div>
      {/* Header */}
      <AdminPageTitleAdd title="Evangelho no Lar" href="/admin/atendimento/evangelhos-lar/novo" label="Adicionar evangelho no lar" />

      {/* Tabela */}
      <div className="admin-card">
        {evangelhoList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Pessoa</th>
                  <th>Endereço</th>
                  <th>Equipe</th>
                  <th>Situação</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {evangelhoList.map((ev) => {
                  const situacao = ev.situacao || 'indefinida';
                  return (
                    <tr key={ev.id}>
                      <td>
                        <strong className="text-sm-500">{new Date(ev.data).toLocaleDateString('pt-BR')}</strong>
                      </td>
                      <td>
                        <strong>{ev.pessoas?.nome}</strong>
                      </td>
                      <td className="text-sm-muted">
                        {ev.endereco}
                      </td>
                      <td className="text-sm-muted">
                        {ev.equipe}
                      </td>
                      <td>
                        <span className={resolveSituacaoClass(ev.situacao)}>
                          {situacao === 'planejada'
                            ? '📋 Planejada'
                            : situacao === 'realizada'
                              ? '✓ Realizada'
                              : situacao === 'adiada'
                                ? '⏸️ Adiada'
                                : situacao === 'cancelada'
                                  ? '❌ Cancelada'
                                  : situacao}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/atendimento/evangelhos-lar/${ev.id}`} className="admin-btn admin-btn-small">
                          ✏️ Editar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="area-empty">
            <p>Nenhum evangelho no lar registrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EvangelhasPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <EvangelhasContent />
    </Suspense>
  );
}
