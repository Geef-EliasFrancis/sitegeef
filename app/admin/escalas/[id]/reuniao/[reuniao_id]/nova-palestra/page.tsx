import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createEscalaPalestra, getPalestrantes } from '@/app/admin/palestrantes/actions';
import { getTemas } from '@/app/admin/escalas/actions';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = { title: 'Registrar Palestra - Admin GEEF' };

async function handleSubmit(formData: FormData, escalaId: string, reuniaoId: string) {
  'use server';
  const result = await createEscalaPalestra({ reuniaoId, palestranteId: String(formData.get('palestrante_id') || ''), temaId: String(formData.get('tema_id') || '') || undefined, temaLivre: String(formData.get('tema_livre') || ''), tipoPalestra: String(formData.get('tipo_palestra') || ''), status: String(formData.get('status') || 'prevista') });
  const message = result.success ? 'Palestra registrada.' : result.reason === 'conflito' ? 'O palestrante já está em outra função ou no passe desta reunião.' : 'Não foi possível registrar a palestra.';
  redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: result.success ? 'success' : 'error', message }));
}

export default async function NovaPalestraPage({ params }: { params: Promise<{ id: string; reuniao_id: string }> }) {
  const { id, reuniao_id: reuniaoId } = await params;
  const [palestrantes, temas] = await Promise.all([getPalestrantes(true), getTemas()]);
  return <div><div className="admin-page-header"><div><h1 className="admin-page-title">Registrar palestra</h1><p className="admin-page-subtitle">Selecione o expositor e o tema da reunião.</p></div></div><div className="admin-card" style={{ maxWidth: '680px', margin: '0 auto' }}><form action={(formData) => handleSubmit(formData, id, reuniaoId)}><div className="admin-form-group"><label>Palestrante *</label><select name="palestrante_id" required><option value="">Selecione</option>{palestrantes.map((palestrante: any) => <option key={palestrante.id} value={palestrante.id}>{palestrante.nome}{palestrante.cidade ? ` — ${palestrante.cidade}` : ''}</option>)}</select><small><Link href="/admin/palestrantes/novo">Cadastrar novo palestrante</Link></small></div><div className="admin-form-group"><label>Tema cadastrado</label><select name="tema_id"><option value="">Usar tema livre</option>{temas.map((tema: any) => <option key={tema.id} value={tema.id}>{tema.titulo}</option>)}</select></div><div className="admin-form-group"><label>Tema livre</label><input name="tema_livre" placeholder="Informe se não selecionou um tema cadastrado" /></div><div className="admin-form-group"><label>Tipo de palestra</label><input name="tipo_palestra" placeholder="Ex.: Evangélico doutrinário" /></div><div className="admin-form-group"><label>Status</label><select name="status" defaultValue="prevista"><option value="prevista">Prevista</option><option value="confirmada">Confirmada</option><option value="realizada">Realizada</option><option value="cancelada">Cancelada</option></select></div><div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}><button className="admin-btn admin-btn-primary">Registrar</button><Link href={`/admin/escalas/${id}`} className="admin-btn admin-btn-secondary">Cancelar</Link></div></form></div></div>;
}
