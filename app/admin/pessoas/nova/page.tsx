import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createPessoa, getPessoaById, getPessoasAllowlist, removeVinculo, addVinculo, updatePessoa, saveTarefeiroDisponibilidades } from '../actions';
import { type tipo_vinculo } from '@/lib/supabase/types';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';
import { LgpdFormNotice } from '@/components/lgpd/lgpd-form-notice';
import { IconSave, IconX } from '@/components/icons';

export const metadata = {
  title: 'Nova pessoa - Admin GEEF',
};

const TIPOS_VINCULO = [
  'frequentador',
  'tarefeiro',
  'voluntario',
  'evangelizador',
  'crianca',
  'jovem',
  'responsavel_legal',
  'leitor',
  'comprador',
  'doador',
  'assistido',
  'palestrante',
  'dirigente',
  'membro_departamento',
  'visitante',
] as const;

const PERSONA_STEPS = [
  { key: 'identificacao', label: 'Identificação' },
  { key: 'contato', label: 'Contato' },
  { key: 'endereco', label: 'Endereço' },
  { key: 'vinculos', label: 'Vínculos' },
  { key: 'configuracoes', label: 'Configurações' },
  { key: 'disponibilidade', label: 'Disponibilidade' },
] as const;

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
] as const;

type PessoaStep = (typeof PERSONA_STEPS)[number]['key'];

function isPessoaStep(value: unknown): value is PessoaStep {
  return typeof value === 'string' && PERSONA_STEPS.some((step) => step.key === value);
}

function getNextStep(step: PessoaStep): PessoaStep | null {
  const index = PERSONA_STEPS.findIndex((item) => item.key === step);
  if (index < 0 || index + 1 >= PERSONA_STEPS.length) {
    return null;
  }

  return PERSONA_STEPS[index + 1].key;
}

function buildHref(pessoaId: string | null, step: PessoaStep) {
  const params = new URLSearchParams();

  if (pessoaId) {
    params.set('id', pessoaId);
  }

  params.set('tab', step);
  return `/admin/pessoas/nova?${params.toString()}`;
}

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function booleanValue(formData: FormData, name: string) {
  return formData.get(name) === 'on';
}

function availabilityValues(formData: FormData) {
  return DAYS_OF_WEEK.map(({ value }) => ({
    dia_semana: value,
    disponivel: booleanValue(formData, `disponibilidade_${value}_ativo`),
    inicio: textValue(formData, `disponibilidade_${value}_inicio`) || null,
    fim: textValue(formData, `disponibilidade_${value}_fim`) || null,
    observacao: textValue(formData, `disponibilidade_${value}_observacao`) || null,
  })).filter((item) => item.disponivel || item.inicio || item.fim || item.observacao);
}

async function savePessoaStep(formData: FormData) {
  'use server';

  const step = isPessoaStep(formData.get('step')) ? (formData.get('step') as PessoaStep) : 'identificacao';
  const pessoaId = textValue(formData, 'pessoa_id');

  try {
    if (step === 'identificacao') {
      const identificacao = {
        allowlist_id: textValue(formData, 'allowlist_id'),
        nome: textValue(formData, 'nome'),
        nome_social: textValue(formData, 'nome_social'),
        data_nascimento: textValue(formData, 'data_nascimento'),
        cpf: textValue(formData, 'cpf'),
        rg: textValue(formData, 'rg'),
      };

      if (!identificacao.nome) {
        redirect(
          buildFlashNoticeUrl(buildHref(pessoaId || null, 'identificacao'), {
            variant: 'error',
            message: 'Informe o nome para continuar.',
          }),
        );
      }

      if (!pessoaId) {
        const pessoa = await createPessoa({
          allowlist_id: identificacao.allowlist_id,
          nome: identificacao.nome,
          nome_social: identificacao.nome_social,
          data_nascimento: identificacao.data_nascimento,
          cpf: identificacao.cpf,
          rg: identificacao.rg,
        });

        if (!pessoa) {
          redirect(
            buildFlashNoticeUrl(buildHref(null, 'identificacao'), {
              variant: 'error',
              message: 'Não foi possível criar a pessoa.',
            }),
          );
        }

        const nextStep = getNextStep(step) ?? step;
        redirect(
          buildFlashNoticeUrl(buildHref(pessoa.id, nextStep), {
            variant: 'success',
            message: 'Etapa salva.',
          }),
        );
      }

      await updatePessoa(pessoaId, identificacao);
      const nextStep = getNextStep(step) ?? step;
      redirect(
        buildFlashNoticeUrl(buildHref(pessoaId, nextStep), {
          variant: 'success',
          message: 'Etapa salva.',
        }),
      );
    }

    if (!pessoaId) {
      redirect(
        buildFlashNoticeUrl(buildHref(null, 'identificacao'), {
          variant: 'error',
        message: 'Crie a pessoa pela etapa de identificação.',
        }),
      );
    }

    if (step === 'contato') {
      await updatePessoa(pessoaId, {
        telefone: textValue(formData, 'telefone'),
        whatsapp: textValue(formData, 'whatsapp'),
        email: textValue(formData, 'email'),
        contato_emergencia: textValue(formData, 'contato_emergencia'),
      });

      const nextStep = getNextStep(step);
      redirect(
        buildFlashNoticeUrl(nextStep ? buildHref(pessoaId, nextStep) : '/admin/pessoas', {
          variant: 'success',
          message: 'Etapa salva.',
        }),
      );
    }

    if (step === 'endereco') {
      await updatePessoa(pessoaId, {
        logradouro: textValue(formData, 'logradouro'),
        numero: textValue(formData, 'numero'),
        bairro: textValue(formData, 'bairro'),
        cidade: textValue(formData, 'cidade'),
        estado: textValue(formData, 'estado'),
        cep: textValue(formData, 'cep'),
      });

      const nextStep = getNextStep(step);
      redirect(
        buildFlashNoticeUrl(nextStep ? buildHref(pessoaId, nextStep) : '/admin/pessoas', {
          variant: 'success',
          message: 'Etapa salva.',
        }),
      );
    }

    if (step === 'vinculos') {
      const { vinculos } = await getPessoaById(pessoaId);
      const vinculosAtuais = new Set(vinculos.map((v: any) => v.vinculo));
      const vinculosNovos = new Set(
        TIPOS_VINCULO.filter((vinculo) => formData.get(`vinculo_${vinculo}`) === 'on'),
      );

      for (const vinculo of vinculosAtuais) {
        if (!vinculosNovos.has(vinculo)) {
          await removeVinculo(pessoaId, vinculo as tipo_vinculo);
        }
      }

      for (const vinculo of vinculosNovos) {
        if (!vinculosAtuais.has(vinculo)) {
          await addVinculo(pessoaId, vinculo as tipo_vinculo);
        }
      }

      const nextStep = getNextStep(step);
      redirect(
        buildFlashNoticeUrl(nextStep ? buildHref(pessoaId, nextStep) : '/admin/pessoas', {
          variant: 'success',
          message: 'Etapa salva.',
        }),
      );
    }

    if (step === 'configuracoes') {
      await updatePessoa(pessoaId, {
        observacoes: textValue(formData, 'observacoes'),
        autoriza_notificacao: booleanValue(formData, 'autoriza_notificacao'),
        autoriza_imagem_voz: booleanValue(formData, 'autoriza_imagem_voz'),
      });

      const nextStep = getNextStep(step);
      redirect(
        buildFlashNoticeUrl(nextStep ? buildHref(pessoaId, nextStep) : '/admin/pessoas', {
          variant: 'success',
          message: 'Etapa salva.',
        }),
      );
    }

    if (step === 'disponibilidade') {
      await saveTarefeiroDisponibilidades(pessoaId, availabilityValues(formData));
      redirect(
        buildFlashNoticeUrl('/admin/pessoas', {
          variant: 'success',
          message: 'Pessoa salva.',
        }),
      );
    }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error && String((error as { digest?: string }).digest || '').startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    const fallbackHref = pessoaId ? buildHref(pessoaId, step) : buildHref(null, 'identificacao');
    redirect(
      buildFlashNoticeUrl(fallbackHref, {
        variant: 'error',
        message: 'Não foi possível salvar o tarefeiro.',
      }),
    );
  }
}

async function NovaPessoaContent({ searchParams }: { searchParams: { id?: string; tab?: string } }) {
  const pessoaId = typeof searchParams.id === 'string' ? searchParams.id.trim() : '';
  const requestedStep = isPessoaStep(searchParams.tab) ? searchParams.tab : 'identificacao';
  const activeStep = pessoaId ? requestedStep : 'identificacao';
  const pessoaData = pessoaId ? await getPessoaById(pessoaId) : { pessoa: null, vinculos: [], disponibilidades: [] };
  const allowlist = pessoaId ? [] : await getPessoasAllowlist(true);
  const pessoa = pessoaData.pessoa;
  const vinculosSet = new Set(pessoaData.vinculos.map((v: any) => v.vinculo));
  const disponibilidadesByDay = new Map(pessoaData.disponibilidades.map((item: any) => [item.dia_semana, item]));

  if (pessoaId && !pessoa) {
    return (
      <div className="area-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Nova pessoa</h1>
          </div>
          <div className="admin-actions">
            <Link href="/admin/pessoas" className="admin-btn admin-btn-secondary">Cancelar</Link>
          </div>
        </div>

        <section className="area-section">
          <div className="admin-card">
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Não foi possível carregar o tarefeiro selecionado.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const renderTabLink = (step: PessoaStep) => {
    const isActive = activeStep === step;
    const isEnabled = Boolean(pessoaId) || step === 'identificacao';
    const className = `admin-step-tab ${isActive ? 'active' : ''} ${!isEnabled ? 'disabled' : ''}`;
    const href = buildHref(pessoaId, step);
    const label = PERSONA_STEPS.find((item) => item.key === step)?.label ?? step;

    if (!isEnabled) {
      return (
        <span key={step} className={className} aria-disabled="true">
          {label}
        </span>
      );
    }

    return (
      <Link key={step} href={href} className={className}>
        {label}
      </Link>
    );
  };

  return (
    <div className="area-page">
      <div className="admin-page-header pessoa-form-header">
        <div>
          <h1 className="admin-page-title">Nova pessoa</h1>
        </div>
        <div className="admin-actions">
          <button
            type="submit"
            form="pessoa-step-form"
            className="admin-btn admin-btn-primary admin-icon-action"
            aria-label="Salvar etapa"
            title="Salvar etapa"
          >
            <IconSave size={19} />
          </button>
          <Link
            href="/admin/pessoas"
            className="admin-btn admin-btn-secondary admin-icon-action"
            aria-label="Cancelar e voltar para pessoas"
            title="Cancelar e voltar para pessoas"
          >
            <IconX size={19} />
          </Link>
        </div>
      </div>

      <nav className="admin-step-tabs" aria-label="Etapas do cadastro">
        {PERSONA_STEPS.map((step) => renderTabLink(step.key))}
      </nav>

      <section className="area-section">
        <div className="admin-card admin-step-card">
          <LgpdFormNotice text="Usamos os dados desta ficha para manter o cadastro e o atendimento institucional atualizados." />
          <form id="pessoa-step-form" action={savePessoaStep}>
            <input type="hidden" name="step" value={activeStep} />
            {pessoaId ? <input type="hidden" name="pessoa_id" value={pessoaId} /> : null}

            {activeStep === 'identificacao' && (
              <div className="module-grid">
                {!pessoaId && (
                  <label className="profile-form-field" style={{ gridColumn: '1 / -1' }}>
                    <span>Autorização da allowlist *</span>
                    <select name="allowlist_id" required className="profile-form-input" defaultValue="">
                      <option value="">Selecione uma pessoa autorizada</option>
                      {allowlist.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nome}{item.email ? ` — ${item.email}` : ''}
                        </option>
                      ))}
                    </select>
                    {allowlist.length === 0 ? <small>Cadastre uma autorização antes de criar uma pessoa.</small> : null}
                  </label>
                )}
                <label className="profile-form-field" style={{ gridColumn: '1 / -1' }}>
                  <span>Nome completo *</span>
                  <input type="text" name="nome" required defaultValue={pessoa?.nome || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>Nome social</span>
                  <input type="text" name="nome_social" defaultValue={pessoa?.nome_social || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>CPF</span>
                  <input type="text" name="cpf" defaultValue={pessoa?.cpf || ''} placeholder="000.000.000-00" className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>RG</span>
                  <input type="text" name="rg" defaultValue={pessoa?.rg || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>Data de nascimento</span>
                  <input type="date" name="data_nascimento" defaultValue={pessoa?.data_nascimento || ''} className="profile-form-input" />
                </label>
              </div>
            )}

            {activeStep === 'contato' && (
              <div className="module-grid">
                <label className="profile-form-field">
                  <span>Telefone</span>
                  <input type="tel" name="telefone" defaultValue={pessoa?.telefone || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>WhatsApp</span>
                  <input type="tel" name="whatsapp" defaultValue={pessoa?.whatsapp || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>Email</span>
                  <input type="email" name="email" defaultValue={pessoa?.email || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>Contato de emergência</span>
                  <input
                    type="text"
                    name="contato_emergencia"
                    defaultValue={pessoa?.contato_emergencia || ''}
                    placeholder="Nome e telefone"
                    className="profile-form-input"
                  />
                </label>
              </div>
            )}

            {activeStep === 'endereco' && (
              <div className="module-grid">
                <label className="profile-form-field" style={{ gridColumn: '1 / -1' }}>
                  <span>Logradouro</span>
                  <input type="text" name="logradouro" defaultValue={pessoa?.logradouro || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>Número</span>
                  <input type="text" name="numero" defaultValue={pessoa?.numero || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>Bairro</span>
                  <input type="text" name="bairro" defaultValue={pessoa?.bairro || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>Cidade</span>
                  <input type="text" name="cidade" defaultValue={pessoa?.cidade || ''} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>Estado</span>
                  <input type="text" name="estado" defaultValue={pessoa?.estado || ''} placeholder="RJ" maxLength={2} className="profile-form-input" />
                </label>
                <label className="profile-form-field">
                  <span>CEP</span>
                  <input type="text" name="cep" defaultValue={pessoa?.cep || ''} placeholder="00000-000" className="profile-form-input" />
                </label>
              </div>
            )}

            {activeStep === 'vinculos' && (
              <div className="tag-list" style={{ flexWrap: 'wrap' }}>
                {TIPOS_VINCULO.map((vinculo) => (
                  <label
                    key={vinculo}
                    className="tag"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <input type="checkbox" name={`vinculo_${vinculo}`} defaultChecked={vinculosSet.has(vinculo)} />
                    <span>{vinculo}</span>
                  </label>
                ))}
              </div>
            )}

            {activeStep === 'configuracoes' && (
              <div className="module-grid">
                <label className="profile-form-field" style={{ gridColumn: '1 / -1' }}>
                  <span>Observações</span>
                  <textarea name="observacoes" rows={5} defaultValue={pessoa?.observacoes || ''} className="profile-form-input" />
                </label>
                <label className="tag" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="autoriza_notificacao" defaultChecked={pessoa?.autoriza_notificacao ?? true} />
                  <span>Autoriza notificações</span>
                </label>
                <label className="tag" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="autoriza_imagem_voz" defaultChecked={pessoa?.autoriza_imagem_voz ?? false} />
                  <span>Autoriza imagem/voz</span>
                </label>
              </div>
            )}

            {activeStep === 'disponibilidade' && (
              <div>
                <p className="panel-note" style={{ marginTop: 0 }}>
                  Informe os dias e horários habituais em que o tarefeiro pode ser escalado. Sem registro, a disponibilidade fica como não informada.
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr><th>Dia</th><th>Disponível</th><th>Início</th><th>Fim</th><th>Observação</th></tr>
                    </thead>
                    <tbody>
                      {DAYS_OF_WEEK.map((day) => {
                        const item = disponibilidadesByDay.get(day.value);
                        return (
                          <tr key={day.value}>
                            <td><strong>{day.label}</strong></td>
                            <td><input type="checkbox" name={`disponibilidade_${day.value}_ativo`} defaultChecked={item?.disponivel ?? false} /></td>
                            <td><input type="time" name={`disponibilidade_${day.value}_inicio`} defaultValue={item?.inicio?.slice(0, 5) || ''} className="profile-form-input" /></td>
                            <td><input type="time" name={`disponibilidade_${day.value}_fim`} defaultValue={item?.fim?.slice(0, 5) || ''} className="profile-form-input" /></td>
                            <td><input type="text" name={`disponibilidade_${day.value}_observacao`} defaultValue={item?.observacao || ''} className="profile-form-input" placeholder="Opcional" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

export default async function NovaPessoaPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedSearchParams = await searchParams;
  return <NovaPessoaContent searchParams={resolvedSearchParams} />;
}
