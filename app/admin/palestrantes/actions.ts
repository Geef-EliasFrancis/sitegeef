'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { checkModuleAccess } from '@/lib/auth/permissions';

async function requirePalestrantesAccess() {
  const allowed = await checkModuleAccess('pode_escalas', ['coord_passe']);
  if (!allowed) throw new Error('Acesso negado: cadastro de palestrantes');
}

function invalidatePalestrantes() {
  revalidatePath('/admin/palestrantes');
  revalidatePath('/admin/escalas');
  revalidatePath('/reuniao-publica/escalas');
  revalidateTag('public-escalas');
}

export async function getPalestrantes(onlyActive = false) {
  const supabase = await createClient();
  let query = supabase
    .from('palestrantes')
    .select('id,nome,cidade,instituicao,contato,observacoes,ativo,pessoa_id,pessoas(nome)')
    .order('nome');
  if (onlyActive) query = query.eq('ativo', true);
  const { data, error } = await query;
  return error ? [] : data || [];
}

export async function getPalestranteById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('palestrantes')
    .select('id,nome,cidade,instituicao,contato,observacoes,ativo,pessoa_id,pessoas(id,nome)')
    .eq('id', id)
    .maybeSingle();
  return error ? null : data;
}

export async function getPalestrantesFormData() {
  const supabase = await createClient();
  const [{ data: pessoas }, { data: temas }] = await Promise.all([
    supabase.from('pessoas').select('id,nome').eq('status', 'ativo').order('nome'),
    supabase.from('temas_doutrinarios').select('id,titulo').eq('ativo', true).order('titulo'),
  ]);
  return { pessoas: pessoas || [], temas: temas || [] };
}

export async function createPalestrante(form: {
  nome: string;
  pessoaId?: string;
  cidade?: string;
  instituicao?: string;
  contato?: string;
  observacoes?: string;
}) {
  await requirePalestrantesAccess();
  const supabase = await createClient();
  const { data, error } = await supabase.from('palestrantes').insert({
    nome: form.nome.trim(),
    pessoa_id: form.pessoaId || null,
    cidade: form.cidade?.trim() || null,
    instituicao: form.instituicao?.trim() || null,
    contato: form.contato?.trim() || null,
    observacoes: form.observacoes?.trim() || null,
  }).select('id').single();
  if (error) return null;
  invalidatePalestrantes();
  return data;
}

export async function updatePalestrante(id: string, form: {
  nome: string;
  pessoaId?: string;
  cidade?: string;
  instituicao?: string;
  contato?: string;
  observacoes?: string;
}) {
  await requirePalestrantesAccess();
  const supabase = await createClient();
  const { error } = await supabase.from('palestrantes').update({
    nome: form.nome.trim(),
    pessoa_id: form.pessoaId || null,
    cidade: form.cidade?.trim() || null,
    instituicao: form.instituicao?.trim() || null,
    contato: form.contato?.trim() || null,
    observacoes: form.observacoes?.trim() || null,
    atualizado_em: new Date().toISOString(),
  }).eq('id', id);
  if (error) return { success: false };
  invalidatePalestrantes();
  return { success: true };
}

export async function togglePalestranteStatus(id: string, ativo: boolean) {
  await requirePalestrantesAccess();
  const supabase = await createClient();
  const { error } = await supabase.from('palestrantes').update({ ativo }).eq('id', id);
  if (error) return { success: false };
  invalidatePalestrantes();
  return { success: true };
}

export async function createEscalaPalestra(form: {
  reuniaoId: string;
  palestranteId: string;
  temaId?: string;
  temaLivre?: string;
  tipoPalestra?: string;
  status?: string;
}) {
  await requirePalestrantesAccess();
  const supabase = await createClient();
  const { data: palestrante } = await supabase.from('palestrantes').select('id,pessoa_id,ativo').eq('id', form.palestranteId).maybeSingle();
  if (!palestrante?.ativo) return { success: false, reason: 'palestrante' };

  if (palestrante.pessoa_id) {
    const [{ data: funcao }, { data: passe }] = await Promise.all([
      supabase.from('escala_funcoes').select('id').eq('reuniao_id', form.reuniaoId).eq('pessoa_id', palestrante.pessoa_id).maybeSingle(),
      supabase.from('escala_passe').select('id').eq('reuniao_id', form.reuniaoId).eq('pessoa_id', palestrante.pessoa_id).maybeSingle(),
    ]);
    if (funcao || passe) return { success: false, reason: 'conflito' };
  }

  const { error } = await supabase.from('escala_palestras').insert({
    reuniao_id: form.reuniaoId,
    palestrante_id: form.palestranteId,
    tema_id: form.temaId || null,
    tema_livre: form.temaLivre?.trim() || null,
    tipo_palestra: form.tipoPalestra?.trim() || null,
    status: form.status || 'prevista',
  });
  if (error) return { success: false, reason: 'salvar' };
  invalidatePalestrantes();
  return { success: true };
}

export async function getEscalaPalestraById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('escala_palestras')
    .select('id,reuniao_id,palestrante_id,tema_id,tema_livre,tipo_palestra,status,reunioes(escala_id),palestrantes(nome,cidade),temas_doutrinarios(titulo)')
    .eq('id', id)
    .maybeSingle();
  return error ? null : data;
}

export async function updateEscalaPalestra(id: string, form: {
  palestranteId: string;
  temaId?: string;
  temaLivre?: string;
  tipoPalestra?: string;
  status: string;
}) {
  await requirePalestrantesAccess();
  const supabase = await createClient();
  const { data: atual } = await supabase.from('escala_palestras').select('reuniao_id').eq('id', id).maybeSingle();
  const { data: palestrante } = await supabase.from('palestrantes').select('id,pessoa_id,ativo').eq('id', form.palestranteId).maybeSingle();
  if (!atual?.reuniao_id || !palestrante?.ativo) return { success: false, reason: 'palestrante' };

  if (palestrante.pessoa_id) {
    const [{ data: funcao }, { data: passe }] = await Promise.all([
      supabase.from('escala_funcoes').select('id').eq('reuniao_id', atual.reuniao_id).eq('pessoa_id', palestrante.pessoa_id).maybeSingle(),
      supabase.from('escala_passe').select('id').eq('reuniao_id', atual.reuniao_id).eq('pessoa_id', palestrante.pessoa_id).maybeSingle(),
    ]);
    if (funcao || passe) return { success: false, reason: 'conflito' };
  }

  const { error } = await supabase.from('escala_palestras').update({
    palestrante_id: form.palestranteId,
    tema_id: form.temaId || null,
    tema_livre: form.temaLivre?.trim() || null,
    tipo_palestra: form.tipoPalestra?.trim() || null,
    status: form.status,
  }).eq('id', id);
  if (error) return { success: false, reason: 'salvar' };
  invalidatePalestrantes();
  return { success: true };
}

export async function removeEscalaPalestra(id: string) {
  await requirePalestrantesAccess();
  const supabase = await createClient();
  const { error } = await supabase.from('escala_palestras').delete().eq('id', id);
  if (error) return { success: false };
  invalidatePalestrantes();
  return { success: true };
}
