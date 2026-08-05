import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPessoaById, updatePessoa, addVinculo, removeVinculo, togglePessoaStatus, saveTarefeiroDisponibilidades } from '../actions';
import { Suspense } from 'react';
import { buildFlashNoticeUrl } from '@/lib/notificacoes/flash-notice';
import { LgpdFormNotice } from '@/components/lgpd/lgpd-form-notice';

export const metadata = {
  title: 'Editar pessoa - Admin GEEF',
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
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
] as const;

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function availabilityValues(formData: FormData) {
  return DAYS_OF_WEEK.map(({ value }) => ({
    dia_semana: value,
    disponivel: formData.get(`disponibilidade_${value}_ativo`) === 'on',
    inicio: textValue(formData, `disponibilidade_${value}_inicio`),
    fim: textValue(formData, `disponibilidade_${value}_fim`),
    observacao: textValue(formData, `disponibilidade_${value}_observacao`),
  })).filter((item) => item.disponivel || item.inicio || item.fim || item.observacao);
}

async function handleUpdatePessoa(pessoaId: string, formData: FormData) {
  'use server';

  try {
    await updatePessoa(pessoaId, {
      nome: formData.get('nome') as string,
      nome_social: (formData.get('nome_social') as string) || undefined,
      email: (formData.get('email') as string) || undefined,
      telefone: (formData.get('telefone') as string) || undefined,
      whatsapp: (formData.get('whatsapp') as string) || undefined,
      data_nascimento: (formData.get('data_nascimento') as string) || undefined,
      cpf: (formData.get('cpf') as string) || undefined,
      rg: (formData.get('rg') as string) || undefined,
      logradouro: (formData.get('logradouro') as string) || undefined,
      numero: (formData.get('numero') as string) || undefined,
      bairro: (formData.get('bairro') as string) || undefined,
      cidade: (formData.get('cidade') as string) || undefined,
      estado: (formData.get('estado') as string) || undefined,
      cep: (formData.get('cep') as string) || undefined,
      observacoes: (formData.get('observacoes') as string) || undefined,
      contato_emergencia: (formData.get('contato_emergencia') as string) || undefined,
      autoriza_notificacao: formData.get('autoriza_notificacao') === 'on',
      autoriza_imagem_voz: formData.get('autoriza_imagem_voz') === 'on',
    });

    // Handle status change
    const novoStatus = formData.get('status') as string;
    if (novoStatus) {
      await togglePessoaStatus(pessoaId, novoStatus as any);
    }

    // Handle vínculo changes
    const { vinculos: vinculosAtuais } = await getPessoaById(pessoaId);
    const vinculosAtualSet = new Set(vinculosAtuais.map((v: any) => v.vinculo));
    const vinculosNovoSet = new Set(TIPOS_VINCULO.filter((v) => formData.get(`vinculo_${v}`) === 'on'));

    // Remove vínculos não mais selecionados
    for (const vinculoRemover of vinculosAtualSet) {
      if (!vinculosNovoSet.has(vinculoRemover)) {
        await removeVinculo(pessoaId, vinculoRemover as any);
      }
    }

    // Add novos vínculos
    for (const vinculoAdicionar of vinculosNovoSet) {
      if (!vinculosAtualSet.has(vinculoAdicionar)) {
        await addVinculo(pessoaId, vinculoAdicionar as any);
      }
    }

    const disponibilidadeResult = await saveTarefeiroDisponibilidades(pessoaId, availabilityValues(formData));
    if (!disponibilidadeResult.success) {
      throw new Error('Não foi possível salvar a disponibilidade.');
    }

    redirect(
      buildFlashNoticeUrl('/admin/pessoas', {
        variant: 'success',
        message: 'Pessoa salva.',
      }),
    );
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'digest' in error && String((error as { digest?: string }).digest || '').startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Erro ao atualizar pessoa:', error);
    redirect(
      buildFlashNoticeUrl(`/admin/pessoas/${pessoaId}`, {
        variant: 'error',
        message: 'Não foi possível salvar a pessoa.',
      }),
    );
  }
}

async function EditPessoaContent({ id }: { id: string }) {
  const { pessoa, vinculos, disponibilidades } = await getPessoaById(id);

  if (!pessoa) {
    return (
      <div className="area-page">
        <section className="area-hero">
          <div className="area-hero-top">
            <div>
              <p className="area-subtitle">Cadastro de pessoa</p>
              <h1 className="area-hero-title">Editar pessoa</h1>
            </div>
          </div>
          <p className="area-subtitle">A pessoa solicitada não foi encontrada ou ainda não está disponível.</p>
        </section>

        <section className="area-section">
          <div className="area-empty">
            <p>Não foi possível carregar o cadastro desta pessoa.</p>
            <Link href="/admin/pessoas" className="profile-form-btn profile-form-btn-secondary">
              Voltar para pessoas
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const vinculosSet = new Set(vinculos.map((v: any) => v.vinculo));
  const disponibilidadesByDay = new Map(disponibilidades.map((item: any) => [item.dia_semana, item]));

  return (
    <form action={(formData) => handleUpdatePessoa(id, formData)}>
      <div className="area-page">
        <section className="area-hero">
          <div className="area-hero-top">
            <div>
              <p className="area-subtitle">Cadastro de pessoa</p>
              <h1 className="area-hero-title">Editar pessoa</h1>
            </div>
            <div className="tag-list">
              <span className="tag">{pessoa.status}</span>
            </div>
          </div>
          <p className="area-subtitle">{pessoa.nome}</p>
        </section>

        <section className="area-section">
          <div className="area-section-title">
            <h2>Identificação</h2>
            <p>Dados principais da pessoa cadastrada.</p>
          </div>
          <div className="table-surface">
            <LgpdFormNotice text="Usamos estes dados para atualizar o cadastro e manter o vínculo institucional." />
            <div className="module-grid">
              <label className="profile-form-field">
                <span>Nome completo *</span>
                <input type="text" name="nome" defaultValue={pessoa.nome} required className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>Nome social</span>
                <input type="text" name="nome_social" defaultValue={pessoa.nome_social || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>CPF</span>
                <input type="text" name="cpf" defaultValue={pessoa.cpf || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>RG</span>
                <input type="text" name="rg" defaultValue={pessoa.rg || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>Data de nascimento</span>
                <input type="date" name="data_nascimento" defaultValue={pessoa.data_nascimento || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>Status</span>
                <select name="status" defaultValue={pessoa.status} className="profile-form-input">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="afastado">Afastado</option>
                  <option value="falecido">Falecido</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="area-section">
          <div className="area-section-title">
            <h2>Contato</h2>
            <p>Informações para retorno e emergência.</p>
          </div>
          <div className="table-surface">
            <div className="module-grid">
              <label className="profile-form-field">
                <span>Telefone</span>
                <input type="tel" name="telefone" defaultValue={pessoa.telefone || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>WhatsApp</span>
                <input type="tel" name="whatsapp" defaultValue={pessoa.whatsapp || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>Email</span>
                <input type="email" name="email" defaultValue={pessoa.email || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>Contato de emergência</span>
                <input type="text" name="contato_emergencia" defaultValue={pessoa.contato_emergencia || ''} className="profile-form-input" />
              </label>
            </div>
          </div>
        </section>

        <section className="area-section">
          <div className="area-section-title">
            <h2>Endereço</h2>
            <p>Localização residencial e complementar.</p>
          </div>
          <div className="table-surface">
            <div className="module-grid">
              <label className="profile-form-field">
                <span>Logradouro</span>
                <input type="text" name="logradouro" defaultValue={pessoa.logradouro || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>Bairro</span>
                <input type="text" name="bairro" defaultValue={pessoa.bairro || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>Número</span>
                <input type="text" name="numero" defaultValue={pessoa.numero || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>Cidade</span>
                <input type="text" name="cidade" defaultValue={pessoa.cidade || ''} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>Estado</span>
                <input type="text" name="estado" defaultValue={pessoa.estado || ''} maxLength={2} className="profile-form-input" />
              </label>
              <label className="profile-form-field">
                <span>CEP</span>
                <input type="text" name="cep" defaultValue={pessoa.cep || ''} className="profile-form-input" />
              </label>
            </div>
          </div>
        </section>

        <section className="area-section">
          <div className="area-section-title">
            <h2>Vínculos</h2>
            <p>Marcadores de participação e relação com a instituição.</p>
          </div>
          <div className="table-surface">
            <div className="tag-list" style={{ flexWrap: 'wrap' }}>
              {TIPOS_VINCULO.map((vinculo) => (
                <label key={vinculo} className="tag" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name={`vinculo_${vinculo}`}
                    defaultChecked={vinculosSet.has(vinculo)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{vinculo}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="area-section">
          <div className="area-section-title">
            <h2>Configurações</h2>
            <p>Autorização e observações internas.</p>
          </div>
          <div className="table-surface">
            <div className="module-grid">
              <label className="profile-form-field" style={{ gridColumn: '1 / -1' }}>
                <span>Observações</span>
                <textarea name="observacoes" defaultValue={pessoa.observacoes || ''} rows={4} className="profile-form-input" />
              </label>
              <label className="tag" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" name="autoriza_notificacao" defaultChecked={pessoa.autoriza_notificacao} />
                <span>Autoriza notificações</span>
              </label>
              <label className="tag" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" name="autoriza_imagem_voz" defaultChecked={pessoa.autoriza_imagem_voz} />
                <span>Autoriza imagem/voz</span>
              </label>
            </div>
          </div>
        </section>

        <section className="area-section">
          <div className="area-section-title">
            <h2>Disponibilidade</h2>
            <p>Informe os dias e horários habituais para escala.</p>
          </div>
          <div className="table-surface" style={{ overflowX: 'auto' }}>
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
        </section>

        <section className="area-section">
          <div className="area-panel-grid">
            <button type="submit" className="profile-form-btn profile-form-btn-primary">Salvar</button>
            <Link href="/admin/pessoas" className="profile-form-btn profile-form-btn-secondary">Cancelar</Link>
          </div>
        </section>
      </div>
    </form>
  );
}

export default async function EditPessoaPage({ params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>}>
      <EditPessoaContent id={resolvedParams.id} />
    </Suspense>
  );
}
