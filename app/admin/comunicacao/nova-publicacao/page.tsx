import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createPublicacao, getPessoasDisponiveis } from '../actions';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = {
  title: 'Nova Publicação - Admin GEEF',
};

type PessoaOption = {
  id: string;
  nome: string;
};

async function handleSubmit(formData: FormData) {
  'use server';

  try {
    const publicacao = await createPublicacao({
      titulo: formData.get('titulo') as string,
      tipo: (formData.get('tipo') as string) || undefined,
      conteudo: (formData.get('conteudo') as string) || undefined,
      autor_id: formData.get('autor_id') as string,
    });

    redirect(buildFlashNoticeUrl(`/admin/comunicacao/${publicacao.id}`, { variant: 'success', message: 'Publicação criada.' }));
  } catch (error) {
    console.error('Erro:', error);
    redirect(buildFlashNoticeUrl('/admin/comunicacao', { variant: 'error', message: 'Não foi possível criar a publicação.' }));
    return;
  }
}

type PageProps = {
  searchParams?: Promise<{ tipo?: string }>;
};

export default async function NovaPublicacaoPage({ searchParams }: PageProps) {
  const pessoas = (await getPessoasDisponiveis()) as PessoaOption[];
  const params = (await searchParams) ?? {};
  const tipoInicial = params.tipo === 'aviso' ? 'aviso' : '';

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Nova Publicação</h1>
          <p className="admin-page-subtitle">Criar uma nova publicação</p>
        </div>
      </div>

      <div className="admin-card form-panel-centered-lg">
        <form action={handleSubmit}>
          <div className="admin-form-group">
            <label>Título *</label>
            <input
              type="text"
              name="titulo"
              placeholder="Título da publicação..."
              required
            />
          </div>

          <div className="grid-auto-300">
            <div className="admin-form-group">
              <label>Tipo</label>
              <select
                name="tipo"
                className="profile-form-input form-control-full"
                defaultValue={tipoInicial}
              >
                <option value="">Selecione um tipo</option>
                <option value="noticia">📰 Notícia</option>
                <option value="aviso">📢 Aviso</option>
                <option value="evento">📅 Evento</option>
                <option value="devotional">📖 Devocional</option>
                <option value="testemunho">💭 Testemunho</option>
                <option value="outro">📄 Outro</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>Autor *</label>
              <select
                name="autor_id"
                required
                className="profile-form-input form-control-full"
              >
                <option value="">Selecione um autor</option>
                {pessoas.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Conteúdo</label>
            <textarea
              name="conteudo"
              placeholder="Conteúdo da publicação..."
              rows={8}
              className="profile-input form-control-full"
            />
          </div>

          <div className="admin-form-group panel-accent-card">
            <p className="text-xs-muted">
              ℹ️ Esta publicação será criada como rascunho. Você poderá revisar e publicar depois.
            </p>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="admin-btn admin-btn-primary">
              ✅ Criar Rascunho
            </button>
            <Link href="/admin/comunicacao" className="admin-btn admin-btn-secondary">
              ❌ Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
