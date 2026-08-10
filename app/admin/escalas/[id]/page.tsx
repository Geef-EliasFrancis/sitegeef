import { redirect } from 'next/navigation';
import Link from 'next/link';
import { generateEscalaSugestao, getEscalaById, getEscalaConflitos, getEscalaFuncoesHistorico, getEscalaPasseHistorico, sortearAplicadoresPasse, updateEscalaStatus, updatePasseQuantidade } from '../actions';
import { Suspense } from 'react';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';
import { EscalaAuditPanels } from '@/components/admin/escalas/escala-audit-panels';
import { ReuniaoEscalaCard } from '@/components/admin/escalas/reuniao-escala-card';
import { getNomeMes } from '@/lib/escalas/datas';

export const metadata = {
  title: 'Editar Escala - Admin GEEF',
};

async function handlePublish(id: string) {
  'use server';

  try {
    await updateEscalaStatus(id, 'publicada');
    redirect(buildFlashNoticeUrl(`/admin/escalas/${id}`, { variant: 'success', message: 'Escala publicada.' }));
  } catch (error) {
    console.error('Erro ao publicar escala:', error);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${id}`, { variant: 'error', message: 'Não foi possível publicar a escala.' }));
    return;
  }
}

async function handleGenerate(id: string) {
  'use server';

  try {
    const result = await generateEscalaSugestao(id);
    if (!result.success) {
      redirect(buildFlashNoticeUrl(`/admin/escalas/${id}`, { variant: 'error', message: 'Não foi possível gerar a sugestão.' }));
    }
    const message = result.pending > 0
      ? `Sugestão criada: ${result.inserted} funções preenchidas e ${result.pending} pendências.`
      : `Sugestão criada: ${result.inserted} funções preenchidas.`;
    redirect(buildFlashNoticeUrl(`/admin/escalas/${id}`, { variant: 'success', message }));
  } catch (error) {
    console.error('Erro ao gerar sugestão:', error);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${id}`, { variant: 'error', message: 'Não foi possível gerar a sugestão.' }));
  }
}

async function handlePasseQuantity(formData: FormData, escalaId: string, reuniaoId: string) {
  'use server';
  const quantidade = Number(formData.get('passe_quantidade') || 0);
  try {
    const result = await updatePasseQuantidade(reuniaoId, quantidade);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: result.success ? 'success' : 'error', message: result.success ? 'Quantidade de passe salva.' : 'Não foi possível salvar a quantidade.' }));
  } catch (error) {
    console.error('Erro ao salvar quantidade de passe:', error);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'error', message: 'Não foi possível salvar a quantidade.' }));
  }
}

async function handleSortearPasse(escalaId: string, reuniaoId: string) {
  'use server';
  try {
    const result = await sortearAplicadoresPasse(reuniaoId);
    const message = result.pending > 0
      ? `Sorteio: ${result.inserted} aplicadores incluídos e ${result.pending} pendências.`
      : `Sorteio concluído: ${result.inserted} aplicadores incluídos.`;
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: result.success ? 'success' : 'error', message }));
  } catch (error) {
    console.error('Erro ao sortear passe:', error);
    redirect(buildFlashNoticeUrl(`/admin/escalas/${escalaId}`, { variant: 'error', message: 'Não foi possível sortear os aplicadores.' }));
  }
}

async function EditEscalaContent({ id }: { id: string }) {
  const escala = await getEscalaById(id);
  const conflitos = await getEscalaConflitos(id);
  const historico = await getEscalaFuncoesHistorico(id);
  const historicoPasse = await getEscalaPasseHistorico(id);

  const totalFuncoes = escala.reunioes.reduce((acc: number, r: any) => acc + (r.escala_funcoes?.length || 0), 0);
  const totalPasse = escala.reunioes.reduce((acc: number, r: any) => acc + (r.escala_passe?.length || 0), 0);
  const totalEvangelizacao = escala.reunioes.reduce((acc: number, r: any) => acc + (r.escala_evangelizacao?.length || 0), 0);
  const totalPalestras = escala.reunioes.reduce((acc: number, r: any) => acc + (r.escala_palestras?.length || 0), 0);

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="area-subtitle">Detalhe da escala</p>
            <h1 className="area-hero-title">Escala {getNomeMes(escala.mes)} de {escala.ano}</h1>
          </div>
          <div className="tag-list">
            <span className="tag">{escala.status}</span>
            <span className="tag">{escala.reunioes?.length || 0} reuniões</span>
          </div>
        </div>
        <p className="area-subtitle">Resumo e composição das funções do mês.</p>
          <div className="area-panel-grid">
            {escala.status !== 'publicada' && (
              <form action={() => handleGenerate(id)}>
                <button type="submit" className="profile-form-btn profile-form-btn-secondary">
                  Gerar sugestão automática
                </button>
              </form>
            )}
            {escala.status !== 'publicada' && (
            <form action={() => handlePublish(id)}>
              <button type="submit" className="profile-form-btn profile-form-btn-primary">Publicar</button>
            </form>
          )}
          <Link href="/admin/escalas" className="profile-form-btn profile-form-btn-secondary">
            Voltar
          </Link>
        </div>
      </section>

      <section className="stat-grid">
        <article className="stat-card"><span className="stat-label">Reuniões</span><strong>{escala.reunioes?.length || 0}</strong></article>
        <article className="stat-card"><span className="stat-label">Funções</span><strong>{totalFuncoes}</strong></article>
        <article className="stat-card"><span className="stat-label">Passe</span><strong>{totalPasse}</strong></article>
        <article className="stat-card"><span className="stat-label">Evangelização</span><strong>{totalEvangelizacao}</strong></article>
        <article className="stat-card"><span className="stat-label">Palestras</span><strong>{totalPalestras}</strong></article>
      </section>

      <EscalaAuditPanels conflitos={conflitos} historico={historico} historicoPasse={historicoPasse} />

      {escala.reunioes && escala.reunioes.length > 0 ? (
        <section className="area-section">
          <div className="area-panel-grid">
            {escala.reunioes.map((reuniao: any) => (
              <ReuniaoEscalaCard key={reuniao.id} escalaId={id} status={escala.status} reuniao={reuniao} onPasseQuantity={handlePasseQuantity} onSortearPasse={handleSortearPasse} />
            ))}
          </div>
        </section>
      ) : (
        <section className="area-section">
          <div className="area-empty">Nenhuma reunião escalada.</div>
        </section>
      )}
    </div>
  );
}

export default async function EditEscalaPage({ params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>}>
      <EditEscalaContent id={resolvedParams.id} />
    </Suspense>
  );
}
