import { redirect } from 'next/navigation';
import Link from 'next/link';
import { generateEscalaSugestao, getEscalaById, sortearAplicadoresPasse, updateEscalaStatus, updatePasseQuantidade } from '../actions';
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
                  <p>Defina a quantidade e sorteie os aplicadores disponíveis.</p>
                </div>
                <div className="area-panel-grid">
                  <form action={(formData) => handlePasseQuantity(formData, id, reuniao.id)} className="admin-card">
                    <label className="profile-form-field">
                      <span>Quantidade de aplicadores</span>
                      <input type="number" name="passe_quantidade" min="0" max="50" defaultValue={reuniao.passe_quantidade || 0} className="profile-form-input" />
                    </label>
                    <button type="submit" className="profile-form-btn profile-form-btn-secondary">Salvar quantidade</button>
                  </form>
                  {escala.status !== 'publicada' && (
                    <form action={() => handleSortearPasse(id, reuniao.id)}>
                      <button type="submit" className="profile-form-btn profile-form-btn-primary">Sortear aplicadores</button>
                    </form>
                  )}
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

                <div className="area-section-title">
                  <h3>Palestra</h3>
                  <p>Registre expositor interno ou palestrante externo.</p>
                </div>
                {reuniao.escala_palestras && reuniao.escala_palestras.length > 0 ? (
                  <div className="area-panel-grid">
                    {reuniao.escala_palestras.map((palestra: any) => (
                      <div key={palestra.id} className="area-panel-item">
                        <div className="tag-list"><span className="tag">Palestrante</span></div>
                        <p><strong>Expositor:</strong> {palestra.palestrantes?.nome || palestra.expositores?.nome || '—'}</p>
                        <p><strong>Tema:</strong> {palestra.temas_doutrinarios?.titulo || palestra.tema_livre || '—'}</p>
                        <p><strong>Origem:</strong> {palestra.palestrantes?.cidade || palestra.cidade_origem || '—'}</p>
                        <p><strong>Status:</strong> {palestra.status || 'prevista'}</p>
                        <Link href={`/admin/escalas/${id}/palestra/${palestra.id}`} className="profile-form-btn profile-form-btn-secondary">Editar</Link>
                      </div>
                    ))}
                  </div>
                ) : <div className="area-empty">Nenhuma palestra registrada.</div>}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link href={`/admin/escalas/${id}/reuniao/${reuniao.id}/nova-palestra`} className="profile-form-btn profile-form-btn-secondary">Registrar palestra</Link>
                  <Link href="/admin/palestrantes" className="profile-form-btn profile-form-btn-secondary">Gerenciar palestrantes</Link>
                </div>
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
