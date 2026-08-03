import { redirect } from 'next/navigation';
import Link from 'next/link';
import { addFuncao, getFuncoes, getPessoasDisponiveis } from '../../../../actions';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = {
  title: 'Adicionar Função - Admin GEEF',
};

async function handleSubmit(formData: FormData, escalaId: string, reuniaoId: string) {
  'use server';

  try {
    await addFuncao(
      reuniaoId,
      formData.get('funcao_id') as string,
      formData.get('pessoa_id') as string,
      (formData.get('substituto_id') as string) || undefined
    );

    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'success', message: 'Função adicionada.' }));
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error && String((error as { digest?: string }).digest || '').startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Erro ao adicionar função:', error);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'error', message: 'Não foi possível adicionar a função.' }));
    return;
  }
}

export default async function NovaFuncaoPage({
  params,
}: {
  params: Promise<any>;
}) {
  const resolvedParams = await params;
  const funcoes = await getFuncoes();
  const pessoas = await getPessoasDisponiveis();

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Adicionar Função</h1>
          <p className="admin-page-subtitle">Escale uma nova função para esta reunião</p>
        </div>
      </div>

      {/* Form */}
      <div className="admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form action={(formData) => handleSubmit(formData, resolvedParams.id, resolvedParams.reuniao_id)}>
          <div className="admin-form-group">
            <label>Função *</label>
            <select
              name="funcao_id"
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
              {funcoes.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label>Pessoa (Titular) *</label>
            <select
              name="pessoa_id"
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              ✅ Adicionar Função
            </button>
            <Link href={`/admin/escalas/${resolvedParams.id}`} className="admin-btn admin-btn-secondary">
              ❌ Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
