'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { invalidateUserAreaCache } from '@/lib/areas/invalidate-user-area';
import { invalidateAdminDashboardCache } from '@/lib/admin/cache';
import { calculateRange } from '@/lib/admin/query-helpers';

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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

  const { data, error } = await supabase
    .from('pessoas')
    .select('id, nome')
    .eq('status', 'ativo')
    .order('nome');

  if (error) return [];

  return data || [];
}

export async function getFuncoes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('funcoes')
    .select('id, nome')
    .eq('ativo', true)
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
