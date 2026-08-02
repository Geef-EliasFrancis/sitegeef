import { schedule } from "@/lib/site-data";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type ReuniaoPublicaAviso = {
  id: string;
  titulo: string;
  conteudo: string;
  quando?: string | null;
  status: "publicado" | "rascunho";
  origem: "agenda" | "reuniao";
  autor?: string | null;
  publicadoEm?: string | null;
};

type PersistedAviso = {
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

export function getAgendaAvisos(): ReuniaoPublicaAviso[] {
  return schedule.map((item, index) => ({
    id: `agenda-${index + 1}`,
    titulo: item.title,
    conteudo: item.description,
    quando: item.when,
    status: "publicado",
    origem: "agenda",
    autor: "Agenda",
  }));
}

async function listPersistedAvisos(publishedOnly = false) {
  try {
    const supabase = createServiceRoleClient();
    let query = supabase
      .from("reuniao_publica_avisos")
      .select("id, titulo, conteudo, quando, status, ordem, publicado_em, criado_em, atualizado_em")
      .order("ordem", { ascending: true })
      .order("criado_em", { ascending: false });

    if (publishedOnly) query = query.eq("status", "publicado");

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as PersistedAviso[];
  } catch {
    return [];
  }
}

export async function listReuniaoPublicaAvisos(publishedOnly = false) {
  const avisos = await listPersistedAvisos(publishedOnly);
  const avisosDeAgenda = getAgendaAvisos();
  const titulos = new Set(avisosDeAgenda.map((aviso) => aviso.titulo.trim().toLocaleLowerCase("pt-BR")));

  for (const aviso of avisos) {
    const chave = aviso.titulo.trim().toLocaleLowerCase("pt-BR");
    if (titulos.has(chave)) continue;

    avisosDeAgenda.push({
      id: aviso.id,
      titulo: aviso.titulo,
      conteudo: aviso.conteudo || "",
      quando: aviso.quando,
      status: aviso.status,
      origem: "reuniao",
      publicadoEm: aviso.publicado_em,
    });
    titulos.add(chave);
  }

  return avisosDeAgenda;
}

export async function getReuniaoPublicaAvisoById(id: string) {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("reuniao_publica_avisos")
      .select("id, titulo, conteudo, quando, status, ordem, publicado_em, criado_em, atualizado_em")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as PersistedAviso;
  } catch {
    return null;
  }
}

export async function saveReuniaoPublicaAviso(input: {
  id?: string;
  titulo: string;
  conteudo: string;
  quando: string | null;
  status: "publicado" | "rascunho";
  ordem: number;
}) {
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
  if (error || !data) return { success: false as const, id: input.id ?? null };
  return { success: true as const, id: data.id as string };
}

export async function deleteReuniaoPublicaAviso(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("reuniao_publica_avisos").delete().eq("id", id);
  return { success: !error };
}

export function mergeAvisosComAgenda(
  publicacoes: Array<{
    id: string;
    titulo: string;
    conteudo?: string | null;
    status?: string | null;
    autor?: { nome?: string | null } | string | null;
    publicado_em?: string | null;
  }>,
) {
  const avisos = getAgendaAvisos();
  const titulos = new Set(avisos.map((aviso) => aviso.titulo.trim().toLocaleLowerCase("pt-BR")));

  for (const publicacao of publicacoes) {
    const chave = publicacao.titulo.trim().toLocaleLowerCase("pt-BR");
    if (titulos.has(chave)) continue;

    avisos.push({
      id: publicacao.id,
      titulo: publicacao.titulo,
      conteudo: publicacao.conteudo || "",
      status: publicacao.status === "publicado" ? "publicado" : "rascunho",
      origem: "reuniao",
      autor: typeof publicacao.autor === "string" ? publicacao.autor : publicacao.autor?.nome,
      publicadoEm: publicacao.publicado_em,
    });
    titulos.add(chave);
  }

  return avisos;
}
