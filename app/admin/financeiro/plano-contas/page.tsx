import Link from 'next/link';
import { getPlanoContas, toggleContaStatus } from '../actions';
import { redirect } from 'next/navigation';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Plano de Contas - Admin GEEF',
};

async function handleToggle(id: string, ativo: boolean) {
  'use server';
  const { toggleContaStatus: toggle } = await import('../actions');
  await toggle(id, ativo);
  redirect(buildFlashNoticeUrl('/admin/financeiro/plano-contas', { variant: 'success', message: 'Status da conta atualizado.' }));
}

async function PlanoContasPage() {
  const contas = await getPlanoContas();

  const tiposGrupo: { [key: string]: { label: string; color: string } } = {
    'receita': { label: '📥 Receita', color: '#22c55e' },
    'despesa': { label: '📤 Despesa', color: '#ef4444' },
    'ativo': { label: '📊 Ativo', color: '#3b82f6' },
    'passivo': { label: '💳 Passivo', color: '#f97316' },
  };

  const contasPorTipo: { [key: string]: any[] } = {};
  contas.forEach((conta: any) => {
    if (!contasPorTipo[conta.tipo]) {
      contasPorTipo[conta.tipo] = [];
    }
    contasPorTipo[conta.tipo].push(conta);
  });

  return (
    <div>
      <AdminPageTitleAdd title="Plano de Contas" href="/admin/financeiro/plano-contas/nova" label="Adicionar conta" />

      {/* Contas por Tipo */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {Object.entries(tiposGrupo).map(([tipo, grupo]) => (
          <div key={tipo} className="admin-card">
            <h2 style={{
              margin: '0 0 1.5rem',
              fontSize: '1.1rem',
              color: grupo.color,
            }}>
              {grupo.label}
            </h2>

            {contasPorTipo[tipo]?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nome</th>
                      <th>Status</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasPorTipo[tipo].map((conta: any) => (
                      <tr key={conta.id}>
                        <td style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          {conta.codigo}
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {conta.nome}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.6rem',
                            backgroundColor: conta.status === 'ativo' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            color: conta.status === 'ativo' ? '#22c55e' : '#6b7280',
                            borderRadius: '0.3rem',
                            fontSize: '0.85rem',
                          }}>
                            {conta.status === 'ativo' ? '✓ Ativo' : '✕ Inativo'}
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link href={`/admin/financeiro/plano-contas/${conta.id}`} className="admin-btn admin-btn-small">
                            ✏️ Editar
                          </Link>
                          <form action={() => handleToggle(conta.id, conta.status === 'ativo')}>
                            <button type="submit" className="admin-btn admin-btn-small" style={{
                              backgroundColor: conta.status === 'ativo' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                              color: conta.status === 'ativo' ? '#dc2626' : '#16a34a',
                            }}>
                              {conta.status === 'ativo' ? '🗑️ Inativar' : '✓ Ativar'}
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
                <p>Nenhuma conta deste tipo.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlanoContasPage;
