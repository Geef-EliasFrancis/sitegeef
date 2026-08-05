'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { type tipo_vinculo, type status_pessoa } from '@/lib/supabase/types';
import { invalidateUserAreaCache } from '@/lib/areas/invalidate-user-area';
import { invalidateAdminDashboardCache, invalidateAdminBibliotecaCache, invalidateAdminDocumentosCache } from '@/lib/admin/cache';
import { applySearchFilter, calculateRange } from '@/lib/admin/query-helpers';
import { checkModuleAccess } from '@/lib/auth/permissions';

const PESSOAS_PROFILES = ['diretoria', 'secretaria'] as const;

type PessoaUpdate = Partial<{
  nome: string;
  nome_social: string;
  email: string;
  telefone: string;
  whatsapp: string;
  data_nascimento: string;
  cpf: string;
  rg: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
  contato_emergencia: string;
  status: status_pessoa;
  autoriza_notificacao: boolean;
  autoriza_imagem_voz: boolean;
}>;

export type PessoaAllowlistItem = {
  id: string;
  nome: string | null;
  email: string | null;
  cpf: string | null;
  observacoes: string | null;
  ativo: boolean;
};

export type TarefeiroDisponibilidade = {
  id?: string;
  pessoa_id?: string;
  dia_semana: number;
  disponivel: boolean;
  inicio: string | null;
  fim: string | null;
  observacao: string | null;
};

async function requirePessoasAccess() {
  const allowed = await checkModuleAccess('pode_pessoas', [...PESSOAS_PROFILES]);
  if (!allowed) throw new Error('Acesso negado: cadastro de pessoas');
}

export async function getPessoas(
  page = 1,
  search = '',
  vinculoFilter?: tipo_vinculo,
  statusFilter?: status_pessoa
) {
  const supabase = await createClient();


  // Usar service role para bypass RLS e debug
  const supabaseService = createServiceRoleClient();

  const pageSize = 20;
  const { start, end } = calculateRange(page, pageSize);

  try {
    // Buscar pessoas sem join (relação não está configurada no Supabase)
    // Usando service role para bypass RLS
    let query = supabaseService
      .from('pessoas')
      .select('id,nome,email,telefone,status,criado_em', { count: 'exact' });

    query = applySearchFilter(query, search, ['nome', 'email', 'telefone']);

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, count, error } = await query.range(start, end);

    if (error) {
      console.error('[getPessoas] Erro ao buscar pessoas:', error);
      return {
        pessoas: [],
        total: 0,
        page,
        pageSize,
      };
    }

    let pessoas = data || [];

    // Buscar vínculos separadamente se houver pessoas
    if (pessoas.length > 0) {
      const pessoaIds = pessoas.map((p: any) => p.id);
      const { data: vinculosData, error: vinculosError } = await supabaseService
        .from('pessoa_vinculos')
        .select('pessoa_id,vinculo')
        .in('pessoa_id', pessoaIds);

      if (!vinculosError && vinculosData) {
        // Mapear vínculos para cada pessoa
        const vinculosByPessoaId = vinculosData.reduce((acc: any, v: any) => {
          if (!acc[v.pessoa_id]) acc[v.pessoa_id] = [];
          acc[v.pessoa_id].push({ vinculo: v.vinculo });
          return acc;
        }, {});

        pessoas = pessoas.map((p: any) => ({
          ...p,
          pessoa_vinculos: vinculosByPessoaId[p.id] || [],
        }));
      }
    }

    // Aplicar filtro de vínculo se necessário
    let filtered = pessoas;
    if (vinculoFilter) {
      filtered = filtered.filter((pessoa: any) =>
        pessoa.pessoa_vinculos?.some((v: any) => v.vinculo === vinculoFilter)
      );
    }


    return {
      pessoas: filtered,
      total: count || 0,
      page,
      pageSize,
    };
  } catch (err) {
    console.error('[getPessoas] Erro inesperado:', err);
    return {
      pessoas: [],
      total: 0,
      page,
      pageSize,
    };
  }
}

export type TarefeiroReportItem = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  diasDisponiveis: number;
  diasInformados: number;
  escalas: number;
  escalasPublicadas: number;
  funcoes: string[];
  ultimaEscala: string | null;
};

export async function getTarefeiroReport(search = '') {
  await requirePessoasAccess();
  const supabase = createServiceRoleClient();
  const { data: pessoas, error: pessoasError } = await supabase
    .from('pessoas')
    .select('id,nome,email,telefone,status')
    .eq('status', 'ativo')
    .order('nome');

  if (pessoasError || !pessoas || pessoas.length === 0) return [] as TarefeiroReportItem[];

  const pessoaIds = pessoas.map((pessoa) => pessoa.id);
  const [{ data: vinculos }, { data: disponibilidades }, { data: escalas }] = await Promise.all([
    supabase.from('pessoa_vinculos').select('pessoa_id').eq('vinculo', 'tarefeiro').in('pessoa_id', pessoaIds),
    supabase.from('tarefeiro_disponibilidades').select('pessoa_id,dia_semana,disponivel').in('pessoa_id', pessoaIds),
    supabase.from('escala_funcoes').select('pessoa_id,funcao_id,reuniao_id').in('pessoa_id', pessoaIds),
  ]);

  const tarefeiroIds = new Set((vinculos || []).map((item) => item.pessoa_id));
  const tarefeiros = pessoas.filter((pessoa) => tarefeiroIds.has(pessoa.id));
  if (tarefeiros.length === 0) return [] as TarefeiroReportItem[];

  const escalaRows = escalas || [];
  const funcaoIds = [...new Set(escalaRows.map((item) => item.funcao_id).filter(Boolean))];
  const reuniaoIds = [...new Set(escalaRows.map((item) => item.reuniao_id).filter(Boolean))];
  const [{ data: funcoes }, { data: reunioes }] = await Promise.all([
    funcaoIds.length > 0 ? supabase.from('funcoes').select('id,nome').in('id', funcaoIds) : Promise.resolve({ data: [] }),
    reuniaoIds.length > 0 ? supabase.from('reunioes').select('id,data,escala_id').in('id', reuniaoIds) : Promise.resolve({ data: [] }),
  ]);

  const funcaoNames = new Map((funcoes || []).map((funcao) => [funcao.id, funcao.nome]));
  const reuniaoById = new Map((reunioes || []).map((reuniao) => [reuniao.id, reuniao]));
  const escalaIds = [...new Set((reunioes || []).map((reuniao) => reuniao.escala_id).filter(Boolean))];
  const { data: escalasMensais } = escalaIds.length > 0
    ? await supabase.from('escalas_mensais').select('id,status').in('id', escalaIds)
    : { data: [] };
  const escalaStatus = new Map((escalasMensais || []).map((escala) => [escala.id, escala.status]));
  const disponibilidadeByPessoa = new Map<string, { informados: number; disponiveis: number }>();
  for (const item of disponibilidades || []) {
    const current = disponibilidadeByPessoa.get(item.pessoa_id) || { informados: 0, disponiveis: 0 };
    current.informados += 1;
    if (item.disponivel) current.disponiveis += 1;
    disponibilidadeByPessoa.set(item.pessoa_id, current);
  }

  const report = tarefeiros.map((pessoa) => {
    const pessoaEscalas = escalaRows.filter((item) => item.pessoa_id === pessoa.id);
    const nomesFuncoes = [...new Set(pessoaEscalas.map((item) => funcaoNames.get(item.funcao_id)).filter((nome): nome is string => Boolean(nome)))].sort();
    const datas = pessoaEscalas.map((item) => reuniaoById.get(item.reuniao_id)?.data).filter((data): data is string => Boolean(data)).sort();
    return {
      id: pessoa.id,
      nome: pessoa.nome,
      email: pessoa.email,
      telefone: pessoa.telefone,
      diasDisponiveis: disponibilidadeByPessoa.get(pessoa.id)?.disponiveis || 0,
      diasInformados: disponibilidadeByPessoa.get(pessoa.id)?.informados || 0,
      escalas: pessoaEscalas.length,
      escalasPublicadas: pessoaEscalas.filter((item) => escalaStatus.get(reuniaoById.get(item.reuniao_id)?.escala_id) === 'publicada').length,
      funcoes: nomesFuncoes,
      ultimaEscala: datas.at(-1) || null,
    } satisfies TarefeiroReportItem;
  });

  const normalizedSearch = search.trim().toLowerCase();
  return normalizedSearch
    ? report.filter((item) => `${item.nome} ${item.email || ''} ${item.funcoes.join(' ')}`.toLowerCase().includes(normalizedSearch))
    : report;
}

export async function getPessoasAllowlist(onlyActive = false) {
  await requirePessoasAccess();
  const supabase = createServiceRoleClient();
  let query = supabase
    .from('pessoas_allowlist')
    .select('id,nome,email,cpf,observacoes,ativo')
    .order('nome');

  if (onlyActive) query = query.eq('ativo', true);
  const { data, error } = await query;
  if (error) throw new Error('Não foi possível carregar a allowlist.');
  return (data ?? []) as PessoaAllowlistItem[];
}

export async function createPessoaAllowlist(formData: {
  nome?: string;
  email: string;
  cpf?: string;
  observacoes?: string;
}) {
  await requirePessoasAccess();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('pessoas_allowlist')
    .insert({
      nome: formData.nome?.trim() || null,
      email: formData.email.trim().toLowerCase(),
      cpf: formData.cpf?.trim() || null,
      observacoes: formData.observacoes?.trim() || null,
      ativo: true,
    })
    .select('id,nome,email,cpf,observacoes,ativo')
    .single();

  if (error) throw new Error('Não foi possível salvar a autorização.');
  return data as PessoaAllowlistItem;
}

export async function togglePessoaAllowlistStatus(id: string, ativo: boolean) {
  await requirePessoasAccess();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('pessoas_allowlist')
    .update({ ativo, atualizado_em: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error('Não foi possível atualizar a autorização.');
  return { success: true };
}

export async function getPessoaById(id: string) {
  const supabase = await createClient();

  try {
    const { data: pessoa, error: pessoaError } = await supabase
      .from('pessoas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (pessoaError) {
      return { pessoa: null, vinculos: [], disponibilidades: [] };
    }

    const { data: vinculos, error: vinculosError } = await supabase
      .from('pessoa_vinculos')
      .select('*')
      .eq('pessoa_id', id);

    const { data: disponibilidades, error: disponibilidadesError } = await supabase
      .from('tarefeiro_disponibilidades')
      .select('id,pessoa_id,dia_semana,disponivel,inicio,fim,observacao')
      .eq('pessoa_id', id)
      .order('dia_semana');

    if (vinculosError) {
      return { pessoa: pessoa ?? null, vinculos: [], disponibilidades: [] };
    }

    return {
      pessoa: pessoa ?? null,
      vinculos: vinculos ?? [],
      disponibilidades: disponibilidadesError ? [] : (disponibilidades ?? []),
    };
  } catch {
    return { pessoa: null, vinculos: [], disponibilidades: [] };
  }
}

export async function saveTarefeiroDisponibilidades(
  pessoaId: string,
  disponibilidades: Array<Omit<TarefeiroDisponibilidade, 'id' | 'pessoa_id'>>,
) {
  await requirePessoasAccess();
  const supabase = await createClient();
  const normalized = disponibilidades
    .filter((item) => Number.isInteger(item.dia_semana) && item.dia_semana >= 0 && item.dia_semana <= 6)
    .map((item) => ({
      pessoa_id: pessoaId,
      dia_semana: item.dia_semana,
      disponivel: item.disponivel,
      inicio: item.inicio || null,
      fim: item.fim || null,
      observacao: item.observacao?.trim() || null,
      atualizado_em: new Date().toISOString(),
    }));

  const dias = normalized.map((item) => item.dia_semana);
  const deleteQuery = supabase.from('tarefeiro_disponibilidades').delete().eq('pessoa_id', pessoaId);
  const { error: deleteError } = dias.length > 0 ? await deleteQuery.not('dia_semana', 'in', `(${dias.join(',')})`) : await deleteQuery;
  if (deleteError) return { success: false };

  if (normalized.length > 0) {
    const { error } = await supabase
      .from('tarefeiro_disponibilidades')
      .upsert(normalized, { onConflict: 'pessoa_id,dia_semana' });
    if (error) return { success: false };
  }

  invalidateAdminDashboardCache();
  invalidateUserAreaCache();
  return { success: true };
}

export async function createPessoa(formData: {
  allowlist_id?: string;
  nome: string;
  nome_social?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  data_nascimento?: string;
  cpf?: string;
  rg?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  contato_emergencia?: string;
  status?: status_pessoa;
  autoriza_notificacao?: boolean;
  autoriza_imagem_voz?: boolean;
  vinculos?: tipo_vinculo[];
}) {
  await requirePessoasAccess();
  const supabase = await createClient();

  if (!formData.allowlist_id) return null;
  const { data: autorizado, error: allowlistError } = await createServiceRoleClient()
    .from('pessoas_allowlist')
    .select('id,nome,email,cpf')
    .eq('id', formData.allowlist_id)
    .eq('ativo', true)
    .maybeSingle();

  if (allowlistError || !autorizado) return null;

  const { data: pessoa, error: pessoaError } = await supabase
    .from('pessoas')
    .insert([
      {
        nome: autorizado.nome,
        allowlist_id: autorizado.id,
        nome_social: formData.nome_social,
        email: formData.email || autorizado.email,
        telefone: formData.telefone,
        whatsapp: formData.whatsapp,
        data_nascimento: formData.data_nascimento,
        cpf: formData.cpf || autorizado.cpf,
        rg: formData.rg,
        logradouro: formData.logradouro,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        observacoes: formData.observacoes,
        contato_emergencia: formData.contato_emergencia,
        status: formData.status || 'ativo',
        autoriza_notificacao: formData.autoriza_notificacao !== false,
        autoriza_imagem_voz: formData.autoriza_imagem_voz || false,
      },
    ])
    .select()
    .single();

  if (pessoaError) return null;

  // Add vínculos if provided
  if (formData.vinculos && formData.vinculos.length > 0) {
    const vinculosData = formData.vinculos.map((vinculo) => ({
      pessoa_id: pessoa.id,
      vinculo,
      desde: new Date().toISOString().split('T')[0],
    }));

    const { error: vinculosError } = await supabase
      .from('pessoa_vinculos')
      .insert(vinculosData);

    if (vinculosError) return null;
  }

  invalidateAdminDashboardCache();
  invalidateAdminBibliotecaCache();
  invalidateAdminDocumentosCache();
  invalidateUserAreaCache();
  return pessoa;
}

export async function updatePessoa(id: string, formData: PessoaUpdate) {
  await requirePessoasAccess();
  const supabase = await createClient();

  const allowedFields: Array<keyof PessoaUpdate> = [
    'nome', 'nome_social', 'email', 'telefone', 'whatsapp', 'data_nascimento', 'cpf', 'rg',
    'logradouro', 'numero', 'bairro', 'cidade', 'estado', 'cep', 'observacoes',
    'contato_emergencia', 'status', 'autoriza_notificacao', 'autoriza_imagem_voz',
  ];
  const payload = Object.fromEntries(
    allowedFields
      .filter((field) => field in (formData as Record<string, unknown>))
      .map((field) => [field, (formData as Record<string, unknown>)[field]])
  );

  const { error } = await supabase
    .from('pessoas')
    .update({
      ...payload,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { success: false };

  invalidateAdminDashboardCache();
  invalidateAdminBibliotecaCache();
  invalidateAdminDocumentosCache();
  invalidateUserAreaCache();
  return { success: true };
}

export async function addVinculo(pessoaId: string, vinculo: tipo_vinculo) {
  await requirePessoasAccess();
  const supabase = await createClient();

  const { error } = await supabase.from('pessoa_vinculos').insert([
    {
      pessoa_id: pessoaId,
      vinculo,
      desde: new Date().toISOString().split('T')[0],
    },
  ]);

  if (error) return null;

  invalidateAdminDashboardCache();
  invalidateAdminBibliotecaCache();
  invalidateAdminDocumentosCache();
  invalidateUserAreaCache();
  return { success: true };
}

export async function removeVinculo(pessoaId: string, vinculo: tipo_vinculo) {
  await requirePessoasAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from('pessoa_vinculos')
    .delete()
    .eq('pessoa_id', pessoaId)
    .eq('vinculo', vinculo);

  if (error) return null;

  invalidateAdminDashboardCache();
  invalidateAdminBibliotecaCache();
  invalidateAdminDocumentosCache();
  invalidateUserAreaCache();
  return { success: true };
}

export async function togglePessoaStatus(id: string, novoStatus: status_pessoa) {
  await requirePessoasAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from('pessoas')
    .update({
      status: novoStatus,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { success: false };

  invalidateAdminDashboardCache();
  invalidateAdminBibliotecaCache();
  invalidateAdminDocumentosCache();
  invalidateUserAreaCache();
  return { success: true };
}
