import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPasseById, updatePasseEscalon, removePasseEscalon, getPessoasDisponiveis } from '../../../actions';
import { Suspense } from 'react';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = {
  title: 'Editar Passe - Admin GEEF',
};

async function handleUpdate(formData: FormData, escalaId: string, passeId: string) {
  'use server';

  try {
    await updatePasseEscalon(
      passeId,
      formData.get('pessoa_id') as string,
      parseInt(formData.get('posicao') as string),
      (formData.get('motivo') as string) || undefined
    );

    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'success', message: 'Passe salvo.' }));
  } catch (error) {
    console.error('Erro ao atualizar passe:', error);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'error', message: 'Não foi possível salvar o passe.' }));
    return;
  }
}

async function handleRemove(escalaId: string, passeId: string) {
  'use server';

  try {
    await removePasseEscalon(passeId);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'success', message: 'Passe removido.' }));
  } catch (error) {
    console.error('Erro ao remover passe:', error);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'error', message: 'Não foi possível remover o passe.' }));
    return;
  }
}

async function EditPasseContent({
  params,
}: {
  params: { id: string; passe_id: string };
}) {
  const passeData = await getPasseById(params.passe_id);
  const pessoas = await getPessoasDisponiveis();

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Editar Passe</h1>
          <p className="admin-page-subtitle">Posição #{passeData.posicao}</p>
        </div>
        <form action={() => handleRemove(params.id, params.passe_id)} style={{ display: 'inline' }}>
          <button
            type="submit"
            className="admin-btn"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
            onClick={(e) => {
              if (!confirm('Tem certeza que deseja remover este passe?')) {
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
        <form action={(formData) => handleUpdate(formData, params.id, params.passe_id)}>
          <div className="admin-form-group">
            <label>Pessoa *</label>
            <select
              name="pessoa_id"
              defaultValue={passeData.pessoa_id}
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
            <label>Posição na Escala *</label>
            <input
              type="number"
              name="posicao"
              defaultValue={passeData.posicao}
              min="1"
              required
            />
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

export default async function EditPassePage({ params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>}>
      <EditPasseContent params={resolvedParams} />
    </Suspense>
  );
}

