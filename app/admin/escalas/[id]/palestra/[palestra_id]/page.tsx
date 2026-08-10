import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPalestrantesFormData, getPalestrantes, getEscalaPalestraById, removeEscalaPalestra, updateEscalaPalestra } from '@/app/admin/palestrantes/actions';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = { title: 'Editar Palestra - Admin GEEF' };

async function handleUpdate(formData: FormData, escalaId: string, palestraId: string) {
  'use server';
  const result = await updateEscalaPalestra(palestraId, {
    palestranteId: String(formData.get('palestrante_id') || ''), temaId: String(formData.get('tema_id') || '') || undefined,
    temaLivre: String(formData.get('tema_livre') || ''), tipoPalestra: String(formData.get('tipo_palestra') || ''), status: String(formData.get('status') || 'prevista'),
  });
  const message = result.success ? 'Palestra salva.' : result.reason === 'conflito' ? 'O palestrante já está em outra escala nesta reunião.' : 'Não foi possível salvar a palestra.';
  redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: result.success ? 'success' : 'error', message }));
}

async function handleRemove(escalaId: string, palestraId: string) {
  'use server';
  const result = await removeEscalaPalestra(palestraId);
  redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: result.success ? 'success' : 'error', message: result.success ? 'Palestra removida.' : 'Não foi possível remover a palestra.' }));
}

export default async function EditarPalestraPage({ params }: { params: Promise<{ id: string; palestra_id: string }> }) {
  const { id, palestra_id: palestraId } = await params;
  const [palestra, { temas }, palestrantes] = await Promise.all([getEscalaPalestraById(palestraId), getPalestrantesFormData(), getPalestrantes(true)]);
  if (!palestra) return <div className="area-empty">Palestra não encontrada.</div>;
  return <div><div className="admin-page-header"><div><h1 className="admin-page-title">Editar palestra</h1><p className="admin-page-subtitle">Atualize o expositor, tema ou status.</p></div><form action={() => handleRemove(id, palestraId)}><button className="admin-btn admin-btn-secondary">Remover</button></form></div><div className="admin-card" style={{ maxWidth: '680px', margin: '0 auto' }}><form action={(formData) => handleUpdate(formData, id, palestraId)}><div className="admin-form-group"><label>Palestrante *</label><select name="palestrante_id" defaultValue={palestra.palestrante_id || ''} required>{palestrantes.map((item: any) => <option key={item.id} value={item.id}>{item.nome}{item.cidade ? ` — ${item.cidade}` : ''}</option>)}</select><small><Link href="/admin/palestrantes/novo">Cadastrar novo palestrante</Link></small></div><div className="admin-form-group"><label>Tema cadastrado</label><select name="tema_id" defaultValue={palestra.tema_id || ''}><option value="">Usar tema livre</option>{temas.map((tema: any) => <option key={tema.id} value={tema.id}>{tema.titulo}</option>)}</select></div><div className="admin-form-group"><label>Tema livre</label><input name="tema_livre" defaultValue={palestra.tema_livre || ''} /></div><div className="admin-form-group"><label>Tipo de palestra</label><input name="tipo_palestra" defaultValue={palestra.tipo_palestra || ''} /></div><div className="admin-form-group"><label>Status</label><select name="status" defaultValue={palestra.status || 'prevista'}><option value="prevista">Prevista</option><option value="confirmada">Confirmada</option><option value="realizada">Realizada</option><option value="cancelada">Cancelada</option></select></div><div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}><button className="admin-btn admin-btn-primary">Salvar</button><Link href={`/admin/escalas/${id}`} className="admin-btn admin-btn-secondary">Cancelar</Link></div></form></div></div>;
}
