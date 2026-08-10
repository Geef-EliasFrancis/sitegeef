import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createPalestrante, getPalestrantesFormData } from '../actions';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = { title: 'Novo Palestrante - Admin GEEF' };

async function handleSubmit(formData: FormData) {
  'use server';
  const nome = String(formData.get('nome') || '').trim();
  if (!nome) redirect(buildFlashNoticeUrl('/admin/palestrantes/novo', { variant: 'error', message: 'Informe o nome.' }));
  const palestrante = await createPalestrante({
    nome,
    pessoaId: String(formData.get('pessoa_id') || '') || undefined,
    cidade: String(formData.get('cidade') || ''),
    instituicao: String(formData.get('instituicao') || ''),
    contato: String(formData.get('contato') || ''),
    observacoes: String(formData.get('observacoes') || ''),
  });
  if (!palestrante) redirect(buildFlashNoticeUrl('/admin/palestrantes/novo', { variant: 'error', message: 'Não foi possível salvar.' }));
  redirect(buildFlashNoticeUrl(`/admin/palestrantes/${palestrante.id}`, { variant: 'success', message: 'Palestrante criado.' }));
}

export default async function NovoPalestrantePage() {
  const { pessoas } = await getPalestrantesFormData();
  return <PalestranteForm title="Novo Palestrante" pessoas={pessoas} action={handleSubmit} />;
}

export function PalestranteForm({ title, pessoas, action, values }: { title: string; pessoas: any[]; action: (formData: FormData) => Promise<void>; values?: any }) {
  return (
    <div>
      <div className="admin-page-header"><div><h1 className="admin-page-title">{title}</h1><p className="admin-page-subtitle">Expositor externo ou pessoa vinculada ao GEEF.</p></div></div>
      <div className="admin-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
        <form action={action}>
          <div className="admin-form-group"><label>Nome *</label><input name="nome" defaultValue={values?.nome || ''} required /></div>
          <div className="admin-form-group"><label>Pessoa já cadastrada (opcional)</label><select name="pessoa_id" defaultValue={values?.pessoa_id || ''}><option value="">Expositor externo</option>{pessoas.map((pessoa) => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>)}</select></div>
          <div className="admin-form-group"><label>Cidade</label><input name="cidade" defaultValue={values?.cidade || ''} placeholder="Ex.: Cordeiro-RJ" /></div>
          <div className="admin-form-group"><label>Instituição</label><input name="instituicao" defaultValue={values?.instituicao || ''} /></div>
          <div className="admin-form-group"><label>Contato</label><input name="contato" defaultValue={values?.contato || ''} placeholder="Telefone, WhatsApp ou e-mail" /></div>
          <div className="admin-form-group"><label>Observações</label><textarea name="observacoes" defaultValue={values?.observacoes || ''} rows={4} /></div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}><button type="submit" className="admin-btn admin-btn-primary">Salvar</button><Link href="/admin/palestrantes" className="admin-btn admin-btn-secondary">Cancelar</Link></div>
        </form>
      </div>
    </div>
  );
}
