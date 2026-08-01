import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getGrupoById, updateGrupo, getGrupoMembros, adicionarMembro, updateMembroStatus, removerMembro, getReunioes, criarReuniao, getPessoasDisponiveis } from '../actions';
import { Suspense } from 'react';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = {
  title: 'Grupo Mediúnico - Admin GEEF',
};

async function handleSubmitGrupo(id: string, formData: FormData) {
  'use server';

  try {
    await updateGrupo(id, {
      nome: (formData.get('nome') as string) || undefined,
      coordenador_id: (formData.get('coordenador_id') as string) || undefined,
      status: (formData.get('status') as string) || undefined,
    });

    redirect(buildFlashNoticeUrl(`/admin/mediunidade/${id}`, { variant: 'success', message: 'Grupo salvo.' }));
  } catch (error) {
    console.error('Erro:', error);
    redirect(buildFlashNoticeUrl(`/admin/mediunidade/${id}`, { variant: 'error', message: 'Não foi possível salvar o grupo.' }));
    return;
  }
}

async function handleAdicionarMembro(id: string, formData: FormData) {
  'use server';

  try {
    await adicionarMembro({
      grupo_id: id,
      pessoa_id: formData.get('pessoa_id') as string,
      status: (formData.get('status') as string) || 'ativo',
      desde: new Date().toISOString().split('T')[0],
    });

    redirect(buildFlashNoticeUrl(`/admin/mediunidade/${id}`, { variant: 'success', message: 'Membro adicionado.' }));
  } catch (error) {
    console.error('Erro:', error);
    redirect(buildFlashNoticeUrl(`/admin/mediunidade/${id}`, { variant: 'error', message: 'Não foi possível adicionar o membro.' }));
    return;
  }
}

async function handleCriarReuniao(id: string, formData: FormData) {
  'use server';

  try {
    await criarReuniao({
      grupo_id: id,
      data: formData.get('data') as string,
      observacoes: (formData.get('observacoes') as string) || undefined,
    });

    redirect(buildFlashNoticeUrl(`/admin/mediunidade/${id}`, { variant: 'success', message: 'Reunião registrada.' }));
  } catch (error) {
    console.error('Erro:', error);
    redirect(buildFlashNoticeUrl(`/admin/mediunidade/${id}`, { variant: 'error', message: 'Não foi possível registrar a reunião.' }));
    return;
  }
}

async function handleRemoverMembro(grupoId: string, id: string) {
  'use server';

  try {
    await removerMembro(id);
    redirect(buildFlashNoticeUrl(`/admin/mediunidade/${grupoId}`, { variant: 'success', message: 'Membro removido.' }));
  } catch (error) {
    console.error('Erro:', error);
    redirect(buildFlashNoticeUrl(`/admin/mediunidade/${grupoId}`, { variant: 'error', message: 'Não foi possível remover o membro.' }));
    return;
  }
}

async function GrupoContent({ id }: { id: string }) {
  const grupo = await getGrupoById(id);
  const membros = await getGrupoMembros(id);
  const reunioes = await getReunioes(id);
  const pessoas = await getPessoasDisponiveis();

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{grupo.nome}</h1>
          <p className="admin-page-subtitle">🔒 {grupo.coordenador?.nome ? `Coordenador: ${grupo.coordenador.nome}` : 'Sem coordenador definido'}</p>
        </div>
      </div>

      <div className="admin-card admin-detail-card admin-detail-card-narrow">
        <h2 className="admin-section-title">Editar Grupo</h2>
        <form action={(formData) => handleSubmitGrupo(id, formData)}>
          <div className="admin-form-group">
            <label>Nome *</label>
            <input
              type="text"
              name="nome"
              defaultValue={grupo.nome}
              required
            />
          </div>

          <div className="admin-form-grid admin-form-grid-two">
            <div className="admin-form-group">
              <label>Coordenador</label>
              <select
                name="coordenador_id"
                defaultValue={grupo.coordenador_id || ''}
                className="admin-form-control"
              >
                <option value="">Selecione um coordenador</option>
                {pessoas.map((pessoa: any) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Status</label>
              <select
                name="status"
                defaultValue={grupo.status || 'ativo'}
                className="admin-form-control"
              >
                <option value="ativo">✓ Ativo</option>
                <option value="inativo">✕ Inativo</option>
              </select>
            </div>
          </div>

          <button type="submit" className="admin-btn admin-btn-primary">
            ✅ Salvar
          </button>
        </form>
      </div>

      <div className="admin-card admin-detail-card">
        <h2 className="admin-section-title">Membros ({membros.length})</h2>

        <div className="admin-inline-form-panel">
          <h3 className="admin-subsection-title">Adicionar Membro</h3>
          <form action={(formData) => handleAdicionarMembro(id, formData)} className="admin-inline-form admin-inline-form-member">
            <div>
              <label className="admin-inline-label">Pessoa</label>
              <select
                name="pessoa_id"
                required
                className="admin-form-control admin-form-control-compact"
              >
                <option value="">Selecione</option>
                {pessoas.map((pessoa: any) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-inline-label">Status</label>
              <select
                name="status"
                defaultValue="ativo"
                className="admin-form-control admin-form-control-compact"
              >
                <option value="ativo">✓ Ativo</option>
                <option value="afastado">⏸️ Afastado</option>
                <option value="visitante">👤 Visitante</option>
              </select>
            </div>
            <button type="submit" className="admin-btn admin-btn-small admin-align-end">
              ➕ Adicionar
            </button>
          </form>
        </div>

        {membros.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Desde</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {membros.map((membro: any) => (
                  <tr key={membro.id}>
                    <td className="admin-cell-emphasis">
                      {membro.pessoa?.nome}
                    </td>
                    <td>
                      <span className={`admin-status-chip admin-status-chip--${membro.status}`} data-status={membro.status}>
                        {membro.status === 'ativo' && '✓ Ativo'}
                        {membro.status === 'afastado' && '⏸️ Afastado'}
                        {membro.status === 'visitante' && '👤 Visitante'}
                      </span>
                    </td>
                    <td className="admin-cell-muted admin-cell-small">
                      {membro.desde ? new Date(membro.desde).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td>
                      <form action={() => handleRemoverMembro(id, membro.id)} className="admin-inline-form-reset">
                        <button type="submit" className="admin-btn admin-btn-small admin-btn-danger">
                          ✕ Remover
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty-state admin-empty-state-centered">Nenhum membro neste grupo.</p>
        )}
      </div>

      <div className="admin-card admin-detail-card">
        <h2 className="admin-section-title">Reuniões ({reunioes.length})</h2>

        <div className="admin-inline-form-panel">
          <h3 className="admin-subsection-title">Registrar Reunião</h3>
          <form action={(formData) => handleCriarReuniao(id, formData)} className="admin-inline-form admin-inline-form-meeting">
            <div>
              <label className="admin-inline-label">Data</label>
              <input
                type="date"
                name="data"
                required
                className="admin-form-control admin-form-control-compact"
              />
            </div>
            <div>
              <label className="admin-inline-label">Observações</label>
              <input
                type="text"
                name="observacoes"
                placeholder="Tema, insights..."
                className="admin-form-control admin-form-control-compact"
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-small">
              ➕ Registrar
            </button>
          </form>
        </div>

        {reunioes.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {reunioes.map((reuniao: any) => (
                  <tr key={reuniao.id}>
                    <td className="admin-cell-emphasis">
                      {new Date(reuniao.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="admin-cell-muted">
                      {reuniao.observacoes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-empty-state admin-empty-state-centered">Nenhuma reunião registrada.</p>
        )}
      </div>
    </div>
  );
}

export default async function GrupoPage({ params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div className="admin-loading-state">Carregando...</div>}>
      <GrupoContent id={resolvedParams.id} />
    </Suspense>
  );
}
