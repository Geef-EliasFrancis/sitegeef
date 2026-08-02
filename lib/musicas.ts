import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { fetchMusicasBase } from "@/lib/musicas-repository";

export type MusicaParteTipo = "estrofe" | "verso" | "refrao" | "ponte" | "intro" | "cifra";
export type MusicaSessaoModo = "exibicao" | "catalogo";

export const MUSICA_EXIBICAO_PUBLICA_CODIGO = "EXIBICAO_PUBLICA";

export type MusicaParte = {
  id?: string;
  ordem: number;
  tipo: MusicaParteTipo;
  titulo: string;
  conteudo: string;
  cifra?: string;
  destaque: boolean;
};

export type Musica = {
  id: string;
  slug: string;
  titulo: string;
  autor: string;
  tom: string | null;
  versao: string | null;
  status: "ativa" | "rascunho" | "inativa";
  observacoes: string | null;
  youtube_url: string | null;
  audio_url: string | null;
  criado_em: string;
  atualizado_em: string;
  partes: MusicaParte[];
};

export type MusicaSessao = {
  id: string;
  codigo_pareamento: string;
  nome_tela: string | null;
  musica_id: string | null;
  modo: MusicaSessaoModo;
  ativo: boolean;
  ultimo_acesso_em: string | null;
  criado_em: string;
  atualizado_em: string;
};

export const MUSICA_SESSAO_INATIVIDADE_MS = 60 * 60 * 1000;

export type MusicaCreditoTipo = "autor" | "versao";

export type MusicaCredito = {
  id: string;
  tipo: MusicaCreditoTipo;
  nome: string;
  criado_em: string;
  atualizado_em: string;
};

export type MusicaResumo = {
  id: string;
  slug: string;
  titulo: string;
  autor: string;
  tom: string | null;
  versao: string | null;
  status: Musica["status"];
  observacoes: string | null;
  youtube_url: string | null;
  audio_url: string | null;
  criado_em: string;
  atualizado_em: string;
};

type MusicaParteRow = Omit<MusicaParte, "destaque"> & { destaque?: boolean };

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function isTituloSameasTipo(titulo: string, tipoLabel: string): boolean {
  return normalizeText(titulo) === normalizeText(tipoLabel);
}

export function slugifyMusica(title: string, suffix?: string) {
  const base = normalizeText(title)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "musica";

  return suffix ? `${base}-${suffix}` : base;
}

export function generatePairingCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ativa: "Ativa",
    rascunho: "Rascunho",
    inativa: "Inativa",
  };
  return labels[status] || "Desconhecido";
}

export function parsePartesFromText(texto: string): MusicaParte[] {
  if (!texto || typeof texto !== "string") {
    return [];
  }

  const regex = /^\s*===\s*([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)*)\s*===/gmi;
  const partes: MusicaParte[] = [];
  let match;

  const matches: Array<{ tipo: string; indice: number; fim: number }> = [];
  while ((match = regex.exec(texto)) !== null) {
    const tipo = normalizeText(match[1]).replace(/\s+/g, "");
    matches.push({
      tipo,
      indice: match.index,
      fim: match.index + match[0].length,
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const matchAtual = matches[i];
    const proximoMatch = matches[i + 1];

    const inicioConteudo = matchAtual.fim;
    const fimConteudo = proximoMatch ? proximoMatch.indice : texto.length;
    const conteudo = texto.substring(inicioConteudo, fimConteudo).trim();

    if (!conteudo) {
      continue;
    }

    const tipo: MusicaParteTipo =
      matchAtual.tipo === "verso" ||
      matchAtual.tipo === "estrofe" ||
      matchAtual.tipo === "refrao" ||
      matchAtual.tipo === "ponte" ||
      matchAtual.tipo === "intro" ||
      matchAtual.tipo === "cifra"
        ? (matchAtual.tipo as MusicaParteTipo)
        : "estrofe";

    const tipoLabelMap: Record<string, string> = {
      verso: "Verso",
      estrofe: "Estrofe",
      refrao: "Refrão",
      ponte: "Ponte",
      intro: "Introdução",
      cifra: "Cifra",
    };
    const tipoLabel = tipoLabelMap[matchAtual.tipo] ?? "Estrofe";
    partes.push({
      ordem: partes.length + 1,
      tipo,
      titulo: tipoLabel,
      conteudo,
      destaque: false,
    });
  }

  return partes;
}

export function normalizePartes(partes: unknown): MusicaParte[] {
  if (!Array.isArray(partes)) {
    return [];
  }

  const normalizadas = partes
    .map((parte, index) => {
      if (!parte || typeof parte !== "object") {
        return null;
      }

      const item = parte as Partial<MusicaParteRow>;
      const conteudo = typeof item.conteudo === "string" ? item.conteudo.trim() : "";
      if (!conteudo) {
        return null;
      }

      const tipo: MusicaParteTipo =
        item.tipo === "refrao" ||
        item.tipo === "ponte" ||
        item.tipo === "intro" ||
        item.tipo === "cifra"
          ? item.tipo
          : "estrofe";

      return {
        id: typeof item.id === "string" ? item.id : undefined,
        ordem: Number.isFinite(item.ordem) ? Number(item.ordem) : index + 1,
        tipo,
        titulo: typeof item.titulo === "string" ? item.titulo.trim() : "",
        conteudo,
        cifra: typeof item.cifra === "string" && item.cifra.trim() ? item.cifra.trim() : undefined,
        destaque: item.destaque === true,
      } satisfies MusicaParte;
    })
    .filter(Boolean) as MusicaParte[];

  return normalizadas
    .sort((a, b) => a.ordem - b.ordem)
    .map((item, index) => ({
      ...item,
      ordem: index + 1,
    })) as MusicaParte[];
}

export function formatParteTipoLabel(tipo: MusicaParteTipo) {
  switch (tipo) {
    case "verso":
      return "Verso";
    case "refrao":
      return "Refrão";
    case "ponte":
      return "Ponte";
    case "intro":
      return "Introdução";
    case "cifra":
      return "Cifra";
    default:
      return "Estrofe";
  }
}

function buildSearchBlob(musica: Pick<Musica, "titulo" | "autor" | "tom" | "versao" | "observacoes" | "partes">) {
  return normalizeText(
    [
      musica.titulo,
      musica.autor,
      musica.tom ?? "",
      musica.versao ?? "",
      musica.observacoes ?? "",
      ...musica.partes.flatMap((parte) => [parte.titulo, parte.conteudo, parte.cifra ?? ""]),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function getMusicaSessaoMomentoReferencia(sessao: Pick<MusicaSessao, "criado_em" | "ultimo_acesso_em">) {
  const momento = sessao.ultimo_acesso_em ?? sessao.criado_em;
  const parsed = Date.parse(momento);
  return Number.isFinite(parsed) ? parsed : Date.parse(sessao.criado_em);
}

export function musicaSessaoExpirouPorInatividade(
  sessao: Pick<MusicaSessao, "ativo" | "criado_em" | "ultimo_acesso_em">,
  referencia = new Date(),
) {
  if (!sessao.ativo) {
    return false;
  }

  const momentoReferencia = getMusicaSessaoMomentoReferencia(sessao);
  return referencia.getTime() - momentoReferencia >= MUSICA_SESSAO_INATIVIDADE_MS;
}

async function encerrarMusicaSessaoSeExpirada(sessao: MusicaSessao) {
  if (!musicaSessaoExpirouPorInatividade(sessao)) {
    return sessao;
  }

  const encerrada = await patchMusicaSessao(sessao.codigo_pareamento, { ativo: false });
  return encerrada ?? { ...sessao, ativo: false };
}

export function musicaMatchesSearch(musica: Pick<Musica, "titulo" | "autor" | "tom" | "versao" | "observacoes" | "partes">, search: string) {
  const normalizedSearch = normalizeText(search);
  if (!normalizedSearch) {
    return true;
  }

  return buildSearchBlob(musica).includes(normalizedSearch);
}

export async function listMusicas(search = "") {
  const musicas = await fetchMusicasBase();
  return musicas.filter((musica) => musicaMatchesSearch(musica, search));
}

export async function listPublicMusicas(search = "") {
  const musicas = await fetchMusicasBase();
  return musicas.filter((musica) => musica.status === "ativa" && musicaMatchesSearch(musica, search));
}

export async function getMusicaBySlug(slug: string) {
  const musicas = await fetchMusicasBase();
  return musicas.find((musica) => musica.slug === slug) ?? null;
}

export async function getMusicaById(id: string) {
  const musicas = await fetchMusicasBase();
  return musicas.find((musica) => musica.id === id) ?? null;
}

export async function getMusicasResumo() {
  const musicas = await fetchMusicasBase();
  return musicas.map(({ partes: _partes, ...rest }) => rest);
}

export async function getMusicaSessaoByCodigo(codigo: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("musica_sessoes")
    .select("id, codigo_pareamento, nome_tela, musica_id, modo, ativo, ultimo_acesso_em, criado_em, atualizado_em")
    .eq("codigo_pareamento", codigo)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return encerrarMusicaSessaoSeExpirada(data as MusicaSessao);
}

export async function getMusicaSessaoComMusica(codigo: string) {
  const sessao = await getMusicaSessaoByCodigo(codigo);
  if (!sessao) {
    return null;
  }

  const musica = sessao.musica_id ? await getMusicaById(sessao.musica_id) : null;
  return { sessao, musica };
}

export async function getMusicaExibicaoAtual() {
  const sessoes = await listMusicaSessoes();
  const sessaoAtiva = sessoes.find((sessao) => sessao.ativo) ?? null;

  if (!sessaoAtiva) {
    return null;
  }

  const musica = sessaoAtiva.musica_id ? await getMusicaById(sessaoAtiva.musica_id) : null;
  return {
    sessao: sessaoAtiva,
    musica,
  };
}

export async function getMusicaExibicaoPublicaAtual() {
  const sessao = await getMusicaSessaoComMusica(MUSICA_EXIBICAO_PUBLICA_CODIGO);

  if (sessao?.sessao.ativo && sessao.musica) {
    return sessao;
  }

  return null;
}

export async function saveMusicaExibicaoPublica(musicaId: string) {
  const musica = await getMusicaById(musicaId);

  if (!musica) {
    return null;
  }

  return saveMusicaSessao({
    codigo_pareamento: MUSICA_EXIBICAO_PUBLICA_CODIGO,
    nome_tela: "Exibição pública",
    musica_id: musica.id,
    modo: "exibicao",
    ativo: true,
    ultimo_acesso_em: new Date().toISOString(),
  });
}

export async function listMusicaSessoes() {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("musica_sessoes")
    .select("id, codigo_pareamento, nome_tela, musica_id, modo, ativo, ultimo_acesso_em, criado_em, atualizado_em")
    .order("atualizado_em", { ascending: false });

  if (error) {
    return [];
  }

  const sessoes = (data ?? []) as MusicaSessao[];
  const expiradas = sessoes.filter((sessao) => musicaSessaoExpirouPorInatividade(sessao));

  if (expiradas.length === 0) {
    return sessoes;
  }

  await Promise.all(
    expiradas.map((sessao) =>
      patchMusicaSessao(sessao.codigo_pareamento, {
        ativo: false,
      }),
    ),
  );

  const expiradasPorCodigo = new Set(expiradas.map((sessao) => sessao.codigo_pareamento));
  return sessoes.map((sessao) =>
    expiradasPorCodigo.has(sessao.codigo_pareamento)
      ? {
          ...sessao,
          ativo: false,
        }
      : sessao,
  );
}

export type SaveMusicaInput = {
  id?: string;
  titulo: string;
  autor: string;
  tom?: string | null;
  versao?: string | null;
  status?: Musica["status"];
  observacoes?: string | null;
  youtube_url?: string | null;
  audio_url?: string | null;
  partes: MusicaParte[];
};

export async function saveMusica(input: SaveMusicaInput) {
  const supabase = createServiceRoleClient();
  const musicaId = input.id ?? crypto.randomUUID();

  const existing = await supabase.from("musicas").select("id, slug").eq("id", musicaId).maybeSingle();
  const slug = existing.data?.slug ?? slugifyMusica(input.titulo, musicaId.slice(0, 8));

  const musicaPayload = {
    id: musicaId,
    slug,
    titulo: input.titulo.trim(),
    autor: input.autor.trim(),
    tom: input.tom?.trim() || null,
    versao: input.versao?.trim() || null,
    status: input.status ?? "ativa",
    observacoes: input.observacoes?.trim() || null,
    youtube_url: input.youtube_url?.trim() || null,
    audio_url: input.audio_url?.trim() || null,
  };

  if (existing.data) {
    const { error } = await supabase.from("musicas").update(musicaPayload).eq("id", musicaId);
    if (error) {
      throw error;
    }
  } else {
    const { error } = await supabase.from("musicas").insert([musicaPayload]);
    if (error) {
      throw error;
    }
  }

  await supabase.from("musica_partes").delete().eq("musica_id", musicaId);

  if (input.partes.length > 0) {
    const partesPayload = input.partes.map((parte) => ({
      musica_id: musicaId,
      ordem: parte.ordem,
      tipo: parte.tipo,
      titulo: parte.titulo || null,
      conteudo: parte.conteudo,
      cifra: parte.cifra || null,
      destaque: parte.destaque,
    }));

    const { error } = await supabase.from("musica_partes").insert(partesPayload);
    if (error) {
      throw error;
    }
  }

  return getMusicaById(musicaId);
}

export async function deleteMusica(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("musicas").delete().eq("id", id);
  if (error) {
    throw error;
  }
}

export type SaveMusicaSessaoInput = {
  codigo_pareamento: string;
  nome_tela?: string | null;
  musica_id?: string | null;
  modo?: MusicaSessaoModo;
  ativo?: boolean;
  ultimo_acesso_em?: string | null;
};

export async function saveMusicaSessao(input: SaveMusicaSessaoInput) {
  const supabase = createServiceRoleClient();
  const codigo = input.codigo_pareamento.trim().toUpperCase();

  const payload = {
    codigo_pareamento: codigo,
    nome_tela: input.nome_tela?.trim() || null,
    musica_id: input.musica_id || null,
    modo: input.modo ?? "exibicao",
    ativo: input.ativo ?? true,
    ultimo_acesso_em: input.ultimo_acesso_em ?? null,
  };

  const { data, error } = await supabase
    .from("musica_sessoes")
    .upsert([payload], { onConflict: "codigo_pareamento" })
    .select("id, codigo_pareamento, nome_tela, musica_id, modo, ativo, ultimo_acesso_em, criado_em, atualizado_em")
    .single();

  if (error) {
    throw error;
  }

  return data as MusicaSessao;
}

export async function createMusicaSessao(input: Partial<SaveMusicaSessaoInput> = {}) {
  const codigo = (input.codigo_pareamento?.trim() || generatePairingCode()).toUpperCase();
  return saveMusicaSessao({
    codigo_pareamento: codigo,
    nome_tela: input.nome_tela ?? null,
    musica_id: input.musica_id ?? null,
    modo: input.modo ?? "exibicao",
    ativo: input.ativo ?? true,
    ultimo_acesso_em: input.ultimo_acesso_em ?? null,
  });
}

export async function patchMusicaSessao(
  codigo_pareamento: string,
  patch: Partial<Pick<MusicaSessao, "nome_tela" | "musica_id" | "modo" | "ativo" | "ultimo_acesso_em">>,
) {
  const supabase = createServiceRoleClient();
  const codigo = codigo_pareamento.trim().toUpperCase();

  const payload: Record<string, unknown> = {};

  if (patch.nome_tela !== undefined) {
    payload.nome_tela = patch.nome_tela?.trim() || null;
  }
  if (patch.musica_id !== undefined) {
    payload.musica_id = patch.musica_id || null;
  }
  if (patch.modo !== undefined) {
    payload.modo = patch.modo;
  }
  if (patch.ativo !== undefined) {
    payload.ativo = patch.ativo;
  }
  if (patch.ultimo_acesso_em !== undefined) {
    payload.ultimo_acesso_em = patch.ultimo_acesso_em;
  }

  const { data, error } = await supabase
    .from("musica_sessoes")
    .update(payload)
    .eq("codigo_pareamento", codigo)
    .select("id, codigo_pareamento, nome_tela, musica_id, modo, ativo, ultimo_acesso_em, criado_em, atualizado_em")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as MusicaSessao | null;
}

export async function touchMusicaSessao(codigo_pareamento: string) {
  return patchMusicaSessao(codigo_pareamento, { ultimo_acesso_em: new Date().toISOString() });
}

export async function deleteMusicaSessao(codigo_pareamento: string) {
  const supabase = createServiceRoleClient();
  const codigo = codigo_pareamento.trim().toUpperCase();

  const { error } = await supabase.from("musica_sessoes").delete().eq("codigo_pareamento", codigo);

  if (error) {
    throw error;
  }
}

export type MusicaAutor = Omit<MusicaCredito, "tipo">;
export type MusicaVersao = Omit<MusicaCredito, "tipo">;

function stripCreditoTipo(credito: MusicaCredito | null): Omit<MusicaCredito, "tipo"> | null {
  if (!credito) {
    return null;
  }

  const { tipo: _tipo, ...rest } = credito;
  return rest;
}

async function listMusicaCreditos(tipo: MusicaCreditoTipo, search = "") {
  const supabase = createServiceRoleClient();

  let query = supabase
    .from("musica_creditos")
    .select("id, tipo, nome, criado_em, atualizado_em")
    .eq("tipo", tipo)
    .order("nome", { ascending: true });

  if (search.trim()) {
    query = query.ilike("nome", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return (data ?? []) as MusicaCredito[];
}

export async function listMusicaAutores(search = "") {
  const creditos = await listMusicaCreditos("autor", search);
  return creditos.map((credito) => stripCreditoTipo(credito) as MusicaAutor);
}

async function getMusicaCreditoById(tipo: MusicaCreditoTipo, id: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("musica_creditos")
    .select("id, tipo, nome, criado_em, atualizado_em")
    .eq("tipo", tipo)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data ?? null) as MusicaCredito | null;
}

export async function getMusicaAutorById(id: string) {
  const credito = await getMusicaCreditoById("autor", id);
  return stripCreditoTipo(credito) as MusicaAutor | null;
}

export type SaveMusicaCreditoInput = {
  id?: string;
  tipo: MusicaCreditoTipo;
  nome: string;
};

async function saveMusicaCredito(input: SaveMusicaCreditoInput) {
  const supabase = createServiceRoleClient();
  const creditoId = input.id ?? crypto.randomUUID();

  const payload = {
    id: creditoId,
    tipo: input.tipo,
    nome: input.nome.trim(),
  };

  const existing = await supabase.from("musica_creditos").select("id").eq("id", creditoId).maybeSingle();

  if (existing.data) {
    const { error } = await supabase.from("musica_creditos").update(payload).eq("id", creditoId);
    if (error) {
      throw error;
    }
  } else {
    const { error } = await supabase.from("musica_creditos").insert([payload]);
    if (error) {
      throw error;
    }
  }

  return getMusicaCreditoById(input.tipo, creditoId);
}

export async function saveMusicaAutor(input: Omit<SaveMusicaCreditoInput, "tipo">) {
  const credito = await saveMusicaCredito({ ...input, tipo: "autor" });
  return stripCreditoTipo(credito) as MusicaAutor | null;
}

export async function deleteMusicaAutor(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("musica_creditos").delete().eq("id", id).eq("tipo", "autor");
  if (error) {
    throw error;
  }
}

export async function listMusicaVersoes(search = "") {
  const creditos = await listMusicaCreditos("versao", search);
  return creditos.map((credito) => stripCreditoTipo(credito) as MusicaVersao);
}

export async function getMusicaVersaoById(id: string) {
  const credito = await getMusicaCreditoById("versao", id);
  return stripCreditoTipo(credito) as MusicaVersao | null;
}

export type SaveMusicaVersaoInput = {
  id?: string;
  nome: string;
};

export async function saveMusicaVersao(input: SaveMusicaVersaoInput) {
  const credito = await saveMusicaCredito({ ...input, tipo: "versao" });
  return stripCreditoTipo(credito) as MusicaVersao | null;
}

export async function deleteMusicaVersao(id: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("musica_creditos").delete().eq("id", id).eq("tipo", "versao");
  if (error) {
    throw error;
  }
}
