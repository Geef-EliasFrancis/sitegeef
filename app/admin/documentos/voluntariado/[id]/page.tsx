import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServicoById, updateServico, encerraServico } from '../../actions';
import { Suspense } from 'react';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';

export const metadata = {
  title: 'Serviço Voluntário - Admin GEEF',
};

async function handleUpdate(id: string, formData: FormData) {
  'use server';

  try {
    await updateServico(id, {
      servico: (formData.get('servico') as string) || undefined,
      horarios: (formData.get('horarios') as string) || undefined,
      termo_url: (formData.get('termo_url') as string) || undefined,
      data_inicio: (formData.get('data_inicio') as string) || undefined,
      data_fim: (formData.get('data_fim') as string) || undefined,
    });

    redirect(buildFlashNoticeUrl(`/admin/documentos/voluntariado/${id}`, { variant: 'success', message: 'Serviço salvo.' }));
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    redirect(buildFlashNoticeUrl(`/admin/documentos/voluntariado/${id}`, { variant: 'error', message: 'Não foi possível salvar o serviço.' }));
    return;
  }
}

async function handleEncerrar(id: string, formData: FormData) {
  'use server';

  try {
    const data_fim = formData.get('data_fim') as string;
    await encerraServico(id, data_fim || new Date().toISOString().split('T')[0]);
    redirect(buildFlashNoticeUrl(`/admin/documentos/voluntariado/${id}`, { variant: 'success', message: 'Serviço encerrado.' }));
  } catch (error) {
    console.error('Erro ao encerrar serviço:', error);
    redirect(buildFlashNoticeUrl(`/admin/documentos/voluntariado/${id}`, { variant: 'error', message: 'Não foi possível encerrar o serviço.' }));
    return;
  }
}

async function EditServicoContent({ id }: { id: string }) {
  const servico = await getServicoById(id);

  if (!servico) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Serviço Voluntário</h1>
            <p className="admin-page-subtitle">Registro não encontrado.</p>
          </div>
        </div>

        <div className="admin-card">
          <p className="admin-empty-state">
            O serviço pode ter sido removido ou você não tem acesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Serviço Voluntário</h1>
          <p className="admin-page-subtitle">{servico.pessoas?.nome} — {servico.departamentos?.nome}</p>
        </div>
        <div className="admin-header-actions">
          {servico.status === 'ativo' && (
            <form action={(formData) => handleEncerrar(id, formData)} className="admin-inline-form-reset">
              <input type="hidden" name="data_fim" value={new Date().toISOString().split('T')[0]} />
              <button
                type="submit"
                className="admin-btn admin-btn-danger"
                onClick={(e) => {
                  if (!confirm('Tem certeza que deseja encerrar este serviço?')) {
                    e.preventDefault();
                  }
                }}
              >
                ✕ Encerrar
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Status Box */}
      <div className="admin-card admin-service-status">
        <div className="admin-service-note">
          Mantenha o vínculo claro. Se o serviço terminar, registre o fim e preserve o histórico.
        </div>
        <div className="admin-service-summary">
          <div>
            <p className="admin-meta-label">Departamento</p>
            <p className="admin-meta-value admin-cell-emphasis">{servico.departamentos?.nome}</p>
          </div>
          <div>
            <p className="admin-meta-label">Serviço</p>
            <p className="admin-meta-value">{servico.servico}</p>
          </div>
          <div>
            <p className="admin-meta-label">Status</p>
            <p className="admin-meta-value">
              <span className={`admin-status-chip admin-status-chip--${servico.status}`} data-status={servico.status}>
                {servico.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {servico.status === 'ativo' && (
        <div className="admin-card admin-detail-card admin-detail-card-narrow">
          <h2 className="admin-section-title">Editar Informações</h2>

          <form action={(formData) => handleUpdate(id, formData)}>
            <div className="admin-form-group">
              <label>Descrição do Serviço</label>
              <input
                type="text"
                name="servico"
                defaultValue={servico.servico}
              />
            </div>

            <div className="admin-form-group">
              <label>Horários</label>
              <input
                type="text"
                name="horarios"
                defaultValue={servico.horarios || ''}
              />
            </div>

            <div className="admin-form-grid admin-form-grid-two admin-form-grid-spaced">
              <div className="admin-form-group">
                <label>Data de Início</label>
                <input
                  type="date"
                  name="data_inicio"
                  defaultValue={servico.data_inicio || ''}
                />
              </div>
              <div className="admin-form-group">
                <label>Data de Término</label>
                <input
                  type="date"
                  name="data_fim"
                  defaultValue={servico.data_fim || ''}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>URL do termo</label>
              <input
                type="url"
                name="termo_url"
                defaultValue={servico.termo_url || ''}
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn-primary">
                ✅ Salvar
              </button>
              <Link href="/admin/documentos/voluntariado" className="admin-btn admin-btn-secondary">
                ❌ Cancelar
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* Timeline */}
      <div className="admin-card admin-detail-card admin-detail-card-narrow">
        <h2 className="admin-section-title">Histórico</h2>

        <div className="admin-timeline">
          <div className="admin-timeline-item">
            <div className="admin-timeline-dot is-active" />
            <div>
              <p className="admin-timeline-title">Serviço iniciado</p>
              <p className="admin-timeline-date">
                {new Date(servico.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {servico.data_fim && (
            <div className="admin-timeline-item">
              <div className="admin-timeline-dot" />
              <div>
                <p className="admin-timeline-title">Serviço finalizado</p>
                <p className="admin-timeline-date">
                  {new Date(servico.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function EditServicoPage({ params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div className="admin-loading-state">Carregando...</div>}>
      <EditServicoContent id={resolvedParams.id} />
    </Suspense>
  );
}
