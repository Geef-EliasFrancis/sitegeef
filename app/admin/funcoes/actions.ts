'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { invalidateAdminDashboardCache } from '@/lib/admin/cache';
import { checkModuleAccess } from '@/lib/auth/permissions';

async function requireFuncoesAccess() {
  const allowed =
    (await checkModuleAccess('pode_escalas', ['coord_passe'])) ||
    (await checkModuleAccess('pode_pessoas', ['diretoria', 'secretaria']));
  if (!allowed) throw new Error('Acesso negado: cadastro de funções');
}

export async function getFuncoes(onlyActive = true) {
  const supabase = createServiceRoleClient();

  let query = supabase.from('funcoes').select('*').order('nome');
  if (onlyActive) query = query.eq('ativo', true);

  const { data, error } = await query;

  if (error) return [];

  return data || [];
}

export async function getFuncaoById(id: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('funcoes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return data;
}

export async function createFuncao(formData: {
  nome: string;
  descricao?: string;
}) {
  await requireFuncoesAccess();
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('funcoes')
    .insert([
      {
        nome: formData.nome,
        descricao: formData.descricao || null,
        ativo: true,
      },
    ])
    .select()
    .single();

  if (error) return null;

  revalidatePath('/admin/funcoes');
  revalidatePath('/admin/pessoas/funcoes');
  revalidatePath('/admin/escalas');
  invalidateAdminDashboardCache();
  return data;
}

export async function updateFuncao(
  id: string,
  formData: {
    nome?: string;
    descricao?: string;
  }
) {
  await requireFuncoesAccess();
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('funcoes')
    .update({
      ...formData,
    })
    .eq('id', id);

  if (error) return { success: false };

  revalidatePath('/admin/funcoes');
  revalidatePath('/admin/pessoas/funcoes');
  revalidatePath('/admin/escalas');
  invalidateAdminDashboardCache();
  return { success: true };
}

export async function toggleFuncaoStatus(id: string, ativo: boolean) {
  await requireFuncoesAccess();
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('funcoes')
    .update({ ativo })
    .eq('id', id);

  if (error) return { success: false };

  revalidatePath('/admin/funcoes');
  revalidatePath('/admin/pessoas/funcoes');
  revalidatePath('/admin/escalas');
  invalidateAdminDashboardCache();
  return { success: true };
}

export async function getTemasDourinarios() {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('temas_doutrinarios')
    .select('*')
    .eq('ativo', true)
    .order('titulo');

  if (error) return [];

  return data || [];
}

export async function getTemaDoutrinarioById(id: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('temas_doutrinarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  invalidateAdminDashboardCache();
  return data;
}

export async function createTemaDoutrinario(formData: {
  titulo: string;
  categoria: string;
}) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('temas_doutrinarios')
    .insert([
      {
        titulo: formData.titulo,
        categoria: formData.categoria,
        ativo: true,
      },
    ])
    .select()
    .single();

  if (error) return null;

  return data;
}

export async function updateTemaDoutrinario(
  id: string,
  formData: {
    titulo?: string;
    categoria?: string;
  }
) {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('temas_doutrinarios')
    .update({
      ...formData,
    })
    .eq('id', id);

  if (error) return { success: false };

  invalidateAdminDashboardCache();
  return { success: true };
}

export async function toggleTemaDoutrinarioStatus(id: string, ativo: boolean) {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from('temas_doutrinarios')
    .update({ ativo })
    .eq('id', id);

  if (error) return { success: false };

  invalidateAdminDashboardCache();
  return { success: true };
}
