'use server';

import { createClient } from '@/lib/supabase/server';
import { deletePublicacaoRecord, getPublicacao, insertPublicacao, listPessoasDisponiveis, listPublicacoes, updatePublicacaoRecord } from '@/lib/publicacoes-repository';

export async function getPublicacoes(status?: string) {
  const supabase = await createClient();

  const { data, error } = await listPublicacoes(supabase, status);

  if (error) return [];

  return data || [];
}

export async function getPublicacaoById(id: string) {
  const supabase = await createClient();

  const { data, error } = await getPublicacao(supabase, id);

  if (error) return null;

  return data;
}

export async function createPublicacao(formData: {
  titulo: string;
  tipo?: string;
  conteudo?: string;
  autor_id: string;
}) {
  const supabase = await createClient();

  const { data, error } = await insertPublicacao(supabase, formData);

  if (error) return null;

  return data;
}

export async function updatePublicacao(
  id: string,
  formData: {
    titulo?: string;
    tipo?: string;
    conteudo?: string;
    status?: string;
  }
) {
  const supabase = await createClient();

  const { error } = await updatePublicacaoRecord(supabase, id, formData);

  if (error) return { success: false };

  return { success: true };
}

export async function deletePublicacao(id: string) {
  const supabase = await createClient();

  const { error } = await deletePublicacaoRecord(supabase, id);

  if (error) return { success: false };

  return { success: true };
}

export async function getPessoasDisponiveis() {
  const supabase = await createClient();

  const { data, error } = await listPessoasDisponiveis(supabase);

  if (error) return [];

  return data || [];
}
