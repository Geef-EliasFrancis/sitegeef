import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createFuncao } from '../actions';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = {
  title: 'Nova Função - Admin GEEF',
};

async function handleSubmit(formData: FormData) {
  'use server';

  try {
    const funcao = await createFuncao({
      nome: formData.get('nome') as string,
      descricao: (formData.get('descricao') as string) || undefined,
    });

    if (!funcao) {
      redirect(buildFlashNoticeUrl('/admin/pessoas/funcoes', { variant: 'error', message: 'Não foi possível criar a função.' }));
    }

    redirect(buildFlashNoticeUrl(`/admin/pessoas/funcoes/${funcao.id}`, { variant: 'success', message: 'Função criada.' }));
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error && String((error as { digest?: string }).digest || '').startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Erro ao criar função:', error);
    redirect(buildFlashNoticeUrl('/admin/pessoas/funcoes', { variant: 'error', message: 'Não foi possível criar a função.' }));
    return;
  }
}

export default function NovaFuncaoPage() {
  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Nova Função</h1>
          <p className="admin-page-subtitle">Crie uma nova função para escalas</p>
        </div>
      </div>

      {/* Form */}
      <div className="admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form action={handleSubmit}>
          <div className="admin-form-group">
            <label>Nome da Função *</label>
            <input
              type="text"
              name="nome"
              placeholder="Ex: Dirigente, Recepção, Prece Inicial, Paginista"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Descrição</label>
            <textarea
              name="descricao"
              rows={4}
              placeholder="Descreva as responsabilidades desta função..."
              style={{
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--admin-border)',
                borderRadius: '0.6rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'var(--text)',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              ✅ Criar Função
            </button>
            <Link href="/admin/pessoas/funcoes" className="admin-btn admin-btn-secondary">
              ❌ Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
