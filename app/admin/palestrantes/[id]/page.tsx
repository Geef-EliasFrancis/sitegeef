import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPalestranteById, getPalestrantesFormData, togglePalestranteStatus, updatePalestrante } from '../actions';
import { PalestranteForm } from '../novo/page';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = { title: 'Editar Palestrante - Admin GEEF' };

async function handleUpdate(id: string, formData: FormData) {
  'use server';
  const result = await updatePalestrante(id, {
    nome: String(formData.get('nome') || ''), pessoaId: String(formData.get('pessoa_id') || '') || undefined,
    cidade: String(formData.get('cidade') || ''), instituicao: String(formData.get('instituicao') || ''),
    contato: String(formData.get('contato') || ''), observacoes: String(formData.get('observacoes') || ''),
  });
  redirect(buildFlashNoticeUrl(`/admin/palestrantes/${id}`, { variant: result.success ? 'success' : 'error', message: result.success ? 'Palestrante salvo.' : 'Não foi possível salvar.' }));
}

export default async function EditarPalestrantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [palestrante, { pessoas }] = await Promise.all([getPalestranteById(id), getPalestrantesFormData()]);
  if (!palestrante) return <div className="area-empty">Palestrante não encontrado.</div>;
  const currentPalestrante = palestrante;
  async function handleToggle() {
    'use server';
    const result = await togglePalestranteStatus(id, !currentPalestrante.ativo);
    redirect(buildFlashNoticeUrl(`/admin/palestrantes/${id}`, { variant: result.success ? 'success' : 'error', message: 'Status atualizado.' }));
  }
  return <div><div className="admin-page-header"><div><h1 className="admin-page-title">Editar Palestrante</h1><p className="admin-page-subtitle">{currentPalestrante.nome}</p></div><form action={handleToggle}><button className="admin-btn admin-btn-secondary">{currentPalestrante.ativo ? 'Ativo' : 'Inativo'}</button></form></div><PalestranteForm title="Dados do palestrante" pessoas={pessoas} values={currentPalestrante} action={(formData) => handleUpdate(id, formData)} /><div style={{ textAlign: 'center', marginTop: '1rem' }}><Link href="/admin/palestrantes">Voltar para palestrantes</Link></div></div>;
}
