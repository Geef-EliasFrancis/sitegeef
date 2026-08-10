import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getEscalaFuncaoById, updateFuncao, removeFuncao, getPessoasDisponiveis, getFuncoes } from '../../../actions';
import { Suspense } from 'react';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = {
  title: 'Editar Função - Admin GEEF',
};

async function handleUpdate(formData: FormData, escalaId: string, funcaoId: string) {
  'use server';

  try {
    await updateFuncao(
      funcaoId,
      formData.get('pessoa_id') as string,
      (formData.get('substituto_id') as string) || undefined,
      (formData.get('motivo') as string) || undefined,
    );

    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'success', message: 'Função salva.' }));
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error && String((error as { digest?: string }).digest || '').startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Erro ao atualizar função:', error);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'error', message: 'Não foi possível salvar a função.' }));
    return;
  }
}

async function handleRemove(escalaId: string, funcaoId: string) {
  'use server';

  try {
    await removeFuncao(funcaoId);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'success', message: 'Função removida.' }));
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error && String((error as { digest?: string }).digest || '').startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Erro ao remover função:', error);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'error', message: 'Não foi possível remover a função.' }));
    return;
  }
}

async function EditFuncaoContent({
  params,
}: {
  params: { id: string; funcao_id: string };
}) {
  const funcaoData = await getEscalaFuncaoById(params.funcao_id);
  const pessoas = await getPessoasDisponiveis();

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Editar Função</h1>
          <p className="admin-page-subtitle">{funcaoData.funcoes?.nome}</p>
        </div>
        <form action={() => handleRemove(params.id, params.funcao_id)} style={{ display: 'inline' }}>
          <button
            type="submit"
            className="admin-btn"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
            onClick={(e) => {
              if (!confirm('Tem certeza que deseja remover esta função?')) {
                e.preventDefault();
              }
            }}
          >
            ✕ Remover
          </button>
        </form>
      </div>

      {/* Form */}
      <div className="admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form action={(formData) => handleUpdate(formData, params.id, params.funcao_id)}>
          <div className="admin-form-group">
            <label>Função</label>
            <input
              type="text"
              value={funcaoData.funcoes?.nome || ''}
              disabled
              style={{
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--admin-border)',
                borderRadius: '0.6rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'var(--muted)',
                backgroundColor: 'var(--admin-bg)',
              }}
            />
          </div>

          <div className="admin-form-group">
            <label>Pessoa (Titular) *</label>
            <select
              name="pessoa_id"
              defaultValue={funcaoData.pessoa_id}
              required
              style={{
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--admin-border)',
                borderRadius: '0.6rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'var(--text)',
              }}
            >
              <option value="">— Selecione —</option>
              {pessoas.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label>Substituto</label>
            <select
              name="substituto_id"
              defaultValue={funcaoData.substituto_id || ''}
              style={{
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--admin-border)',
                borderRadius: '0.6rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'var(--text)',
              }}
            >
              <option value="">— Nenhum —</option>
              {pessoas.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label>Motivo da alteração</label>
            <textarea name="motivo" rows={3} placeholder="Opcional; ficará registrado no histórico." />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              ✅ Salvar
            </button>
            <Link href={`/admin/escalas/${params.id}`} className="admin-btn admin-btn-secondary">
              ❌ Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default async function EditFuncaoPage({ params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>}>
      <EditFuncaoContent params={resolvedParams} />
    </Suspense>
  );
}

