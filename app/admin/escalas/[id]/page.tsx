import { redirect } from 'next/navigation';
import Link from 'next/link';
import { generateEscalaSugestao, getEscalaById, updateEscalaStatus } from '../actions';
import { Suspense } from 'react';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = {
  title: 'Editar Escala - Admin GEEF',
};

function getMonthName(mes: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  return months[mes - 1];
}

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

async function EditEscalaContent({ id }: { id: string }) {
  const escala = await getEscalaById(id);

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
            <h1 className="area-hero-title">Escala {getMonthName(escala.mes)} de {escala.ano}</h1>
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

      {escala.reunioes && escala.reunioes.length > 0 ? (
        <section className="area-section">
          <div className="area-panel-grid">
            {escala.reunioes.map((reuniao: any) => (
              <article key={reuniao.id} className="area-panel-item">
                <h2 className="module-title">
                  Quinta-feira, {new Date(reuniao.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h2>

                <div className="area-section-title">
                  <h3>Funções</h3>
                  <p>Distribuição de titulares e substitutos.</p>
                </div>
                {reuniao.escala_funcoes && reuniao.escala_funcoes.length > 0 ? (
                  <div className="area-panel-grid">
                    {reuniao.escala_funcoes.map((ef: any) => (
                      <div key={ef.id} className="area-panel-item">
                        <div className="tag-list">
                          <span className="tag">{ef.funcoes?.nome}</span>
                        </div>
                        <p><strong>Titular:</strong> {ef.pessoas?.nome}</p>
                        <p><strong>Substituto:</strong> {ef.substitutos?.nome || '—'}</p>
                        <Link href={`/admin/escalas/${id}/funcao/${ef.id}`} className="profile-form-btn profile-form-btn-secondary">
                          Editar
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="area-empty">Nenhuma função escalada.</div>
                )}
                <Link href={`/admin/escalas/${id}/reuniao/${reuniao.id}/nova-funcao`} className="profile-form-btn profile-form-btn-secondary">
                  Adicionar Função
                </Link>

                <div className="area-section-title">
                  <h3>Passe</h3>
                  <p>Pessoas escaladas e posições definidas.</p>
                </div>
                {reuniao.escala_passe && reuniao.escala_passe.length > 0 ? (
                  <div className="area-panel-grid">
                    {reuniao.escala_passe
                      .sort((a: any, b: any) => a.posicao - b.posicao)
                      .map((ep: any) => (
                        <div key={ep.id} className="area-panel-item">
                          <div className="tag-list">
                            <span className="tag">#{ep.posicao}</span>
                          </div>
                          <p><strong>Pessoa:</strong> {ep.pessoas?.nome}</p>
                          <Link href={`/admin/escalas/${id}/passe/${ep.id}`} className="profile-form-btn profile-form-btn-secondary">
                            Editar
                          </Link>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="area-empty">Nenhuma pessoa escalada para passe.</div>
                )}
                <Link href={`/admin/escalas/${id}/reuniao/${reuniao.id}/novo-passe`} className="profile-form-btn profile-form-btn-secondary">
                  Adicionar Passe
                </Link>
              </article>
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
