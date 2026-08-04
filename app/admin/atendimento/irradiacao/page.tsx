import Link from 'next/link';
import { getIrradiacoes } from '../actions';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = {
  title: 'Irradiação - Admin GEEF',
};

type IrradiacaoItem = {
  id: string;
  nome_irradiacao: string;
  status?: string | null;
  periodo?: string | null;
  confidencial?: boolean | null;
  pessoas?: { nome?: string | null } | null;
};

type IrradiacaoStatus = 'ativa' | 'encerrada' | string | null | undefined;

function resolveStatusClass(status: IrradiacaoStatus) {
  return status === 'ativa' ? 'inline-status inline-status-success' : 'inline-status inline-status-neutral';
}

async function handleToggle(id: string, ativa: boolean) {
  'use server';
  const { toggleIrradiacaoStatus: toggle } = await import('../actions');
  await toggle(id, ativa);
  redirect(buildFlashNoticeUrl('/admin/atendimento/irradiacao', { variant: 'success', message: 'Status da irradiação atualizado.' }));
}

async function IrradiacaoContent() {
  const irradiacoes = await getIrradiacoes();
  const irradiacaoList = irradiacoes as IrradiacaoItem[];

  return (
    <div>
      <AdminPageTitleAdd title="Irradiação" href="/admin/atendimento/irradiacao/nova" label="Adicionar solicitação" />

      <div className="admin-card">
        {irradiacaoList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome da Irradiação</th>
                  <th>Solicitante</th>
                  <th>Período</th>
                  <th>Status</th>
                  <th>Privacidade</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {irradiacaoList.map((irr) => (
                  <tr key={irr.id}>
                    <td>
                      <strong>
                      {irr.nome_irradiacao}
                      </strong>
                    </td>
                    <td className="text-sm-muted">
                      {irr.pessoas?.nome}
                    </td>
                    <td className="text-sm-muted">
                      {irr.periodo}
                    </td>
                    <td>
                      <span className={resolveStatusClass(irr.status)}>
                        {irr.status === 'ativa' ? '✓ Ativa' : '✕ Encerrada'}
                      </span>
                    </td>
                    <td>
                      {irr.confidencial ? (
                        <span className="text-danger">🔒 Confidencial</span>
                      ) : (
                        <span className="text-sm-muted">Público</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions-inline">
                      <Link href={`/admin/atendimento/irradiacao/${irr.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                      <form action={() => handleToggle(irr.id, irr.status === 'ativa')}>
                        <button
                          type="submit"
                          className={`admin-btn admin-btn-small status-toggle-btn ${irr.status === 'ativa' ? 'status-toggle-btn--active' : 'status-toggle-btn--inactive'}`}
                        >
                          {irr.status === 'ativa' ? '🔒' : '✓'}
                        </button>
                      </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="area-empty">
            <p>Nenhuma irradiação registrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IrradiacaoPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <IrradiacaoContent />
    </Suspense>
  );
}
