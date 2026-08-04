import Link from 'next/link';
import { getCentrosCusto, toggleCentroCustoStatus } from '../actions';
import { redirect } from 'next/navigation';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Centros de Custo - Admin GEEF',
};

async function handleToggle(id: string, ativo: boolean) {
  'use server';
  const { toggleCentroCustoStatus: toggle } = await import('../actions');
  await toggle(id, ativo);
  redirect(buildFlashNoticeUrl('/admin/financeiro/centros-custo', { variant: 'success', message: 'Status do centro de custo atualizado.' }));
}

async function CentrosCustoPage() {
  const centros = await getCentrosCusto();

  return (
    <div>
      <AdminPageTitleAdd title="Centros de Custo" href="/admin/financeiro/centros-custo/novo" label="Adicionar centro de custo" />

      {/* Lista */}
      <div className="admin-card">
        {centros.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {centros.map((centro: any) => (
                  <tr key={centro.id}>
                    <td style={{ fontWeight: 500 }}>
                      {centro.nome}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.6rem',
                        backgroundColor: centro.ativo ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: centro.ativo ? '#22c55e' : '#6b7280',
                        borderRadius: '0.3rem',
                        fontSize: '0.85rem',
                      }}>
                        {centro.ativo ? '✓ Ativo' : '✕ Inativo'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/admin/financeiro/centros-custo/${centro.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                      <form action={() => handleToggle(centro.id, centro.ativo)}>
                        <button type="submit" className="admin-btn admin-btn-small" style={{
                          backgroundColor: centro.ativo ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                          color: centro.ativo ? '#ef4444' : '#22c55e',
                        }}>
                          {centro.ativo ? '🗑️ Inativar' : '✓ Ativar'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--admin-bg)',
            borderRadius: '0.6rem',
            color: 'var(--muted)',
          }}>
            <p>Nenhum centro de custo cadastrado.</p>
            <Link href="/admin/financeiro/centros-custo/novo" className="admin-btn admin-btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              ➕ Criar Primeiro Centro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CentrosCustoPage;
