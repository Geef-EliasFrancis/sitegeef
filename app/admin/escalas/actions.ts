'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { invalidateUserAreaCache } from '@/lib/areas/invalidate-user-area';
import { invalidateAdminDashboardCache } from '@/lib/admin/cache';
import { calculateRange } from '@/lib/admin/query-helpers';
import { checkModuleAccess } from '@/lib/auth/permissions';

async function requireEscalasAccess() {
  const allowed = await checkModuleAccess('pode_escalas', ['coord_passe']);
  if (!allowed) throw new Error('Acesso negado: escala');
}

function invalidateEscalasCache() {
  revalidateTag('public-escalas');
  revalidatePath('/reuniao-publica/escalas');
  revalidatePath('/admin/escalas');
  invalidateUserAreaCache();
}

export async function getEscalas(page = 1) {
  const supabase = await createClient();
  const pageSize = 20;
  const { start, end } = calculateRange(page, pageSize);

  const { data, count, error } = await supabase
    .from('escalas_mensais')
    .select('*', { count: 'exact' })
    .order('ano', { ascending: false })
    .order('mes', { ascending: false })
    .range(start, end);

  if (error) return {
    escalas: [],
    total: 0,
    page,
    pageSize,
  };

  return {
    escalas: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

export async function getEscalaById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('escalas_mensais')
    .select(
      `
      *,
      reunioes (
        id, data,
        escala_funcoes (
          id, funcao_id, pessoa_id, substituto_id,
          funcoes (nome),
          pessoas (nome),
          substitutos:pessoas!substituto_id (nome)
        ),
        escala_passe (
          id, pessoa_id, posicao,
          pessoas (nome)
        ),
        escala_evangelizacao (
          id, pessoa_id, tema_id, tema_livre, turma,
          pessoas (nome),
          temas_doutrinarios (titulo)
        ),
        escala_palestras (
          id, expositor_id, tema_id, tema_livre, cidade_origem, tipo_palestra,
          expositores:pessoas (nome),
          temas_doutrinarios (titulo)
        )
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) return null;

  return data;
}

export async function createEscala(formData: {
  mes: number;
  ano: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Create escala
  const { data: escala, error: escalaError } = await supabase
    .from('escalas_mensais')
    .insert([
      {
        mes: formData.mes,
        ano: formData.ano,
        status: 'rascunho',
        criado_por: user?.id,
      },
    ])
    .select()
    .single();

  if (escalaError) return null;

  // Generate Thursday dates for the month
  const firstDay = new Date(formData.ano, formData.mes - 1, 1);
  const lastDay = new Date(formData.ano, formData.mes, 0);

  const quintas = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 4) { // Thursday
      quintas.push(new Date(d));
    }
  }

  // Create reunioes for each Thursday
  const reunioesData = quintas.map((data) => ({
    escala_id: escala.id,
    data: data.toISOString().split('T')[0],
  }));

  const { error: reunioesError } = await supabase
    .from('reunioes')
    .insert(reunioesData);

  if (reunioesError) return null;

  invalidateEscalasCache();
  invalidateAdminDashboardCache();
  return escala;
}

export async function updateEscalaStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('escalas_mensais')
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq('id', id);

  if (error) return { success: false };

  invalidateEscalasCache();
  invalidateAdminDashboardCache();
  return { success: true };
}

export async function addFuncao(reuniaoId: string, funcaoId: string, pessoaId: string, substitutoId?: string) {
  await requireEscalasAccess();
  const supabase = await createClient();

  const [{ data: funcao }, { data: pessoa }, { data: vinculoPessoa }, { data: reuniao }, { data: vinculoExistente }, { data: capacidade }] = await Promise.all([
    supabase.from('funcoes').select('id, ativo').eq('id', funcaoId).maybeSingle(),
    supabase.from('pessoas').select('id, status').eq('id', pessoaId).maybeSingle(),
    supabase.from('pessoa_vinculos').select('id').eq('pessoa_id', pessoaId).eq('vinculo', 'tarefeiro').maybeSingle(),
    supabase.from('reunioes').select('data').eq('id', reuniaoId).maybeSingle(),
    supabase.from('escala_funcoes').select('id').eq('reuniao_id', reuniaoId).eq('funcao_id', funcaoId).maybeSingle(),
    supabase.from('tarefeiro_funcoes').select('id').eq('pessoa_id', pessoaId).eq('funcao_id', funcaoId).eq('habilitado', true).maybeSingle(),
  ]);

  if (!funcao?.ativo || pessoa?.status !== 'ativo' || !vinculoPessoa || !reuniao?.data || vinculoExistente || !capacidade) return null;

  const [{ data: outraFuncao }, { data: passeExistente }] = await Promise.all([
    supabase.from('escala_funcoes').select('id').eq('reuniao_id', reuniaoId).eq('pessoa_id', pessoaId).maybeSingle(),
    supabase.from('escala_passe').select('id').eq('reuniao_id', reuniaoId).eq('pessoa_id', pessoaId).maybeSingle(),
  ]);
  if (outraFuncao || passeExistente) return null;

  const diaSemana = new Date(`${reuniao.data}T00:00:00`).getDay();
  const { data: disponibilidade } = await supabase
    .from('tarefeiro_disponibilidades')
    .select('disponivel')
    .eq('pessoa_id', pessoaId)
    .eq('dia_semana', diaSemana)
    .maybeSingle();

  if (disponibilidade && !disponibilidade.disponivel) return null;

  const { data, error } = await supabase
    .from('escala_funcoes')
    .insert([
      {
        reuniao_id: reuniaoId,
        funcao_id: funcaoId,
        pessoa_id: pessoaId,
        substituto_id: substitutoId || null,
      },
    ])
    .select()
    .single();

  if (error) return null;

  invalidateEscalasCache();
  return data;
}

export async function updateFuncao(id: string, pessoaId: string, substitutoId?: string) {
  await requireEscalasAccess();
  const supabase = await createClient();

  const { data: pessoa } = await supabase.from('pessoas').select('id, status').eq('id', pessoaId).maybeSingle();
  const { data: vinculoPessoa } = await supabase.from('pessoa_vinculos').select('id').eq('pessoa_id', pessoaId).eq('vinculo', 'tarefeiro').maybeSingle();
  if (pessoa?.status !== 'ativo' || !vinculoPessoa) return { success: false };

  const { data: escalaFuncao } = await supabase
    .from('escala_funcoes')
    .select('funcao_id,reuniao_id,reunioes(data)')
    .eq('id', id)
    .maybeSingle();
  if (!escalaFuncao?.funcao_id || !escalaFuncao.reuniao_id) return { success: false };

  const { data: capacidade } = await supabase
    .from('tarefeiro_funcoes')
    .select('id')
    .eq('pessoa_id', pessoaId)
    .eq('funcao_id', escalaFuncao.funcao_id)
    .eq('habilitado', true)
    .maybeSingle();
  if (!capacidade) return { success: false };

  const [{ data: outraFuncao }, { data: passeExistente }] = await Promise.all([
    supabase.from('escala_funcoes').select('id').eq('reuniao_id', escalaFuncao.reuniao_id).eq('pessoa_id', pessoaId).neq('id', id).maybeSingle(),
    supabase.from('escala_passe').select('id').eq('reuniao_id', escalaFuncao.reuniao_id).eq('pessoa_id', pessoaId).maybeSingle(),
  ]);
  if (outraFuncao || passeExistente) return { success: false };

  const reuniaoData = (escalaFuncao?.reunioes as { data?: string } | null)?.data;
  if (reuniaoData) {
    const { data: disponibilidade } = await supabase
      .from('tarefeiro_disponibilidades')
      .select('disponivel')
      .eq('pessoa_id', pessoaId)
      .eq('dia_semana', new Date(`${reuniaoData}T00:00:00`).getDay())
      .maybeSingle();
    if (disponibilidade && !disponibilidade.disponivel) return { success: false };
  }

  const { error } = await supabase
    .from('escala_funcoes')
    .update({
      pessoa_id: pessoaId,
      substituto_id: substitutoId || null,
    })
    .eq('id', id);

  if (error) return { success: false };

  invalidateEscalasCache();
  return { success: true };
}

export async function removeFuncao(id: string) {
  await requireEscalasAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from('escala_funcoes')
    .delete()
    .eq('id', id);

  if (error) return { success: false };

  invalidateEscalasCache();
  return { success: true };
}

export async function addPasseEscalon(reuniaoId: string, pessoaId: string, posicao: number) {
  await requireEscalasAccess();
  const supabase = await createClient();

  const [{ data: pessoa }, { data: vinculo }, { data: reuniao }, { data: funcaoPasse }] = await Promise.all([
    supabase.from('pessoas').select('id,status').eq('id', pessoaId).maybeSingle(),
    supabase.from('pessoa_vinculos').select('id').eq('pessoa_id', pessoaId).eq('vinculo', 'tarefeiro').maybeSingle(),
    supabase.from('reunioes').select('data').eq('id', reuniaoId).maybeSingle(),
    supabase.from('funcoes').select('id').eq('nome', 'Aplicador de passe').eq('ativo', true).maybeSingle(),
  ]);
  if (!pessoa || pessoa.status !== 'ativo' || !vinculo || !reuniao?.data || !funcaoPasse) return null;

  const [{ data: capacidade }, { data: funcaoConflitante }, { data: passeExistente }] = await Promise.all([
    supabase.from('tarefeiro_funcoes').select('id').eq('pessoa_id', pessoaId).eq('funcao_id', funcaoPasse.id).eq('habilitado', true).maybeSingle(),
    supabase.from('escala_funcoes').select('id').eq('reuniao_id', reuniaoId).eq('pessoa_id', pessoaId).maybeSingle(),
    supabase.from('escala_passe').select('id').eq('reuniao_id', reuniaoId).eq('pessoa_id', pessoaId).maybeSingle(),
  ]);
  if (!capacidade || funcaoConflitante || passeExistente) return null;

  const { data: disponibilidade } = await supabase
    .from('tarefeiro_disponibilidades')
    .select('disponivel')
    .eq('pessoa_id', pessoaId)
    .eq('dia_semana', new Date(`${reuniao.data}T00:00:00`).getDay())
    .maybeSingle();
  if (disponibilidade && !disponibilidade.disponivel) return null;

  const { data, error } = await supabase
    .from('escala_passe')
    .insert([
      {
        reuniao_id: reuniaoId,
        pessoa_id: pessoaId,
        posicao,
      },
    ])
    .select()
    .single();

  if (error) return null;

  invalidateEscalasCache();
  return data;
}

export async function updatePasseEscalon(id: string, pessoaId: string, posicao: number) {
  await requireEscalasAccess();
  const supabase = await createClient();

  const { data: passeAtual } = await supabase
    .from('escala_passe')
    .select('reuniao_id,reunioes(data)')
    .eq('id', id)
    .maybeSingle();
  if (!passeAtual?.reuniao_id) return { success: false };

  const [{ data: pessoa }, { data: vinculo }, { data: funcaoPasse }, { data: funcaoConflitante }, { data: outroPasse }] = await Promise.all([
    supabase.from('pessoas').select('id,status').eq('id', pessoaId).maybeSingle(),
    supabase.from('pessoa_vinculos').select('id').eq('pessoa_id', pessoaId).eq('vinculo', 'tarefeiro').maybeSingle(),
    supabase.from('funcoes').select('id').eq('nome', 'Aplicador de passe').eq('ativo', true).maybeSingle(),
    supabase.from('escala_funcoes').select('id').eq('reuniao_id', passeAtual.reuniao_id).eq('pessoa_id', pessoaId).maybeSingle(),
    supabase.from('escala_passe').select('id').eq('reuniao_id', passeAtual.reuniao_id).eq('pessoa_id', pessoaId).neq('id', id).maybeSingle(),
  ]);
  if (!pessoa || pessoa.status !== 'ativo' || !vinculo || !funcaoPasse || funcaoConflitante || outroPasse) return { success: false };

  const { data: capacidade } = await supabase
    .from('tarefeiro_funcoes')
    .select('id')
    .eq('pessoa_id', pessoaId)
    .eq('funcao_id', funcaoPasse.id)
    .eq('habilitado', true)
    .maybeSingle();
  if (!capacidade) return { success: false };

  const reuniaoData = (passeAtual.reunioes as { data?: string } | null)?.data;
  if (reuniaoData) {
    const { data: disponibilidade } = await supabase
      .from('tarefeiro_disponibilidades')
      .select('disponivel')
      .eq('pessoa_id', pessoaId)
      .eq('dia_semana', new Date(`${reuniaoData}T00:00:00`).getDay())
      .maybeSingle();
    if (disponibilidade && !disponibilidade.disponivel) return { success: false };
  }

  const { error } = await supabase
    .from('escala_passe')
    .update({
      pessoa_id: pessoaId,
      posicao,
    })
    .eq('id', id);

  if (error) return { success: false };

  invalidateEscalasCache();
  return { success: true };
}

export async function removePasseEscalon(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('escala_passe')
    .delete()
    .eq('id', id);

  if (error) return { success: false };

  invalidateEscalasCache();
  return { success: true };
}

export async function getPessoasDisponiveis() {
  const supabase = await createClient();

  const { data: pessoas, error } = await supabase
    .from('pessoas')
    .select('id, nome')
    .eq('status', 'ativo')
    .order('nome');

  if (error) return [];

  if (!pessoas || pessoas.length === 0) return [];

  const { data: vinculos, error: vinculosError } = await supabase
    .from('pessoa_vinculos')
    .select('pessoa_id')
    .eq('vinculo', 'tarefeiro')
    .in('pessoa_id', pessoas.map((pessoa) => pessoa.id));

  if (vinculosError) return [];
  const tarefeiroIds = new Set((vinculos || []).map((vinculo) => vinculo.pessoa_id));
  return pessoas.filter((pessoa) => tarefeiroIds.has(pessoa.id));
}

export async function getFuncoes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('funcoes')
    .select('id, nome, escalavel')
    .eq('ativo', true)
    .eq('escalavel', true)
    .order('nome');

  if (error) return [];

  return data || [];
}

export async function getTemas() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('temas_doutrinarios')
    .select('id, titulo, categoria')
    .eq('ativo', true)
    .order('titulo');

  if (error) return [];

  return data || [];
}

export async function getEscalaFuncaoById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('escala_funcoes')
    .select(
      `
      *,
      funcoes (id, nome),
      pessoas (id, nome),
      substitutos:pessoas!substituto_id (id, nome)
    `
    )
    .eq('id', id)
    .single();

  if (error) return null;

  return data;
}

export async function getPasseById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('escala_passe')
    .select(
      `
      *,
      pessoas (id, nome),
      reunioes (data, escala_id)
    `
    )
    .eq('id', id)
    .single();

  if (error) return null;

  return data;
}
