import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type PersistedAviso = {
  id: string;
  titulo: string;
  conteudo: string | null;
  quando: string | null;
  status: "publicado" | "rascunho";
  ordem: number;
  publicado_em: string | null;
  criado_em: string;
  atualizado_em: string;
};

const fields = "id, titulo, conteudo, quando, status, ordem, publicado_em, criado_em, atualizado_em";

export async function listPersistedAvisos(publishedOnly = false): Promise<PersistedAviso[]> {
  try {
    const supabase = createServiceRoleClient();
    let query = supabase.from("reuniao_publica_avisos").select(fields).order("ordem", { ascending: true }).order("criado_em", { ascending: false });
    if (publishedOnly) query = query.eq("status", "publicado");
    const { data, error } = await query;
    return error ? [] : ((data ?? []) as PersistedAviso[]);
  } catch {
    return [];
  }
}

export async function getPersistedAvisoById(id: string): Promise<PersistedAviso | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from("reuniao_publica_avisos").select(fields).eq("id", id).maybeSingle();
    return error || !data ? null : (data as PersistedAviso);
  } catch {
    return null;
  }
}

export type SavePersistedAvisoInput = {
  id?: string;
  titulo: string;
  conteudo: string;
  quando: string | null;
  status: "publicado" | "rascunho";
  ordem: number;
};

export async function savePersistedAviso(input: SavePersistedAvisoInput) {
  try {
    const supabase = createServiceRoleClient();
    const payload = {
      titulo: input.titulo,
      conteudo: input.conteudo || null,
      quando: input.quando,
      status: input.status,
      ordem: input.ordem,
      publicado_em: input.status === "publicado" ? new Date().toISOString() : null,
      atualizado_em: new Date().toISOString(),
    };
    const query = input.id
      ? supabase.from("reuniao_publica_avisos").update(payload).eq("id", input.id).select("id").single()
      : supabase.from("reuniao_publica_avisos").insert(payload).select("id").single();
    const { data, error } = await query;
    return error || !data ? { success: false as const, id: input.id ?? null } : { success: true as const, id: data.id as string };
  } catch {
    return { success: false as const, id: input.id ?? null };
  }
}

export async function deletePersistedAviso(id: string) {
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("reuniao_publica_avisos").delete().eq("id", id);
    return { success: !error };
  } catch {
    return { success: false };
  }
}
