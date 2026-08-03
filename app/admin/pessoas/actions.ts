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
  nome: string;
  email: string | null;
  cpf: string | null;
  observacoes: string | null;
  ativo: boolean;
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

export async function getPessoasAllowlist(onlyActive = false) {
  const supabase = await createClient();
  let query = supabase
    .from('pessoas_allowlist')
    .select('id,nome,email,cpf,observacoes,ativo')
    .order('nome');

  if (onlyActive) query = query.eq('ativo', true);
  const { data, error } = await query;
  if (error) return [] as PessoaAllowlistItem[];
  return (data ?? []) as PessoaAllowlistItem[];
}

export async function createPessoaAllowlist(formData: {
  nome: string;
  email?: string;
  cpf?: string;
  observacoes?: string;
}) {
  await requirePessoasAccess();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pessoas_allowlist')
    .insert({
      nome: formData.nome.trim(),
      email: formData.email?.trim() || null,
      cpf: formData.cpf?.trim() || null,
      observacoes: formData.observacoes?.trim() || null,
      ativo: true,
    })
    .select('id,nome,email,cpf,observacoes,ativo')
    .single();

  if (error) return null;
  return data as PessoaAllowlistItem;
}

export async function togglePessoaAllowlistStatus(id: string, ativo: boolean) {
  await requirePessoasAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('pessoas_allowlist')
    .update({ ativo, atualizado_em: new Date().toISOString() })
    .eq('id', id);

  if (error) return { success: false };
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
      return { pessoa: null, vinculos: [] };
    }

    const { data: vinculos, error: vinculosError } = await supabase
      .from('pessoa_vinculos')
      .select('*')
      .eq('pessoa_id', id);

    if (vinculosError) {
      return { pessoa: pessoa ?? null, vinculos: [] };
    }

    return { pessoa: pessoa ?? null, vinculos: vinculos ?? [] };
  } catch {
    return { pessoa: null, vinculos: [] };
  }
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
  const { data: autorizado, error: allowlistError } = await supabase
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
