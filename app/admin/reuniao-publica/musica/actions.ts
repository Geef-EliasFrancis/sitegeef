"use server";

import { redirect } from "next/navigation";
import {
  createMusicaSessao,
  deleteMusica,
  deleteMusicaSessao,
  saveMusicaExibicaoPublica,
  normalizePartes,
  patchMusicaSessao,
  listMusicaSessoes,
  saveMusica,
  saveMusicaSessao,
} from "@/lib/musicas";
import { invalidateMusicasCache } from "@/lib/admin/cache";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key).trim();
  return value || null;
}

export async function saveMusicaAction(formData: FormData) {
  const id = readOptionalString(formData, "id") ?? undefined;
  const titulo = readString(formData, "titulo").trim();
  const autor = readOptionalString(formData, "autor") ?? "";
  const tom = readOptionalString(formData, "tom");
  const versao = readOptionalString(formData, "versao");
  const status = readString(formData, "status").trim() as "ativa" | "rascunho" | "inativa";
  const observacoes = readOptionalString(formData, "observacoes");
  const youtube_url = readOptionalString(formData, "youtube_url");
  const audio_url = readOptionalString(formData, "audio_url");
  const partesRaw = readString(formData, "partes_json");

  if (!titulo) {
    redirect("/admin/reuniao-publica/musica/nova?erro=preencha-titulo");
  }

  let partes = normalizePartes([]);
  try {
    partes = normalizePartes(JSON.parse(partesRaw || "[]"));
  } catch {
    partes = [];
  }

  const musica = await saveMusica({
    id,
    titulo,
    autor,
    tom,
    versao,
    status: status === "rascunho" || status === "inativa" ? status : "ativa",
    observacoes,
    youtube_url,
    audio_url,
    partes,
  });

  invalidateMusicasCache();
  redirect("/admin/reuniao-publica/musica/catalogo?salvo=1");
}

export async function deleteMusicaAction(formData: FormData) {
  const id = readOptionalString(formData, "id");
  if (!id) {
    redirect("/admin/reuniao-publica/musica/catalogo?erro=musica-sem-id");
  }

  await deleteMusica(id);
  invalidateMusicasCache();
  redirect("/admin/reuniao-publica/musica/catalogo?excluida=1");
}

export async function saveMusicaSessaoAction(formData: FormData) {
  const codigo = readString(formData, "codigo_pareamento").trim();
  const nomeTela = readOptionalString(formData, "nome_tela");
  const musicaId = readOptionalString(formData, "musica_id");
  const modo = readString(formData, "modo").trim() as "exibicao" | "catalogo";
  const ativo = readString(formData, "ativo") === "on" || readString(formData, "ativo") === "true";

  if (!codigo) {
    redirect("/admin/reuniao-publica/musica/sessoes?erro=codigo-pareamento");
  }

  await saveMusicaSessao({
    codigo_pareamento: codigo,
    nome_tela: nomeTela,
    musica_id: musicaId || null,
    modo: modo === "catalogo" ? "catalogo" : "exibicao",
    ativo,
    ultimo_acesso_em: new Date().toISOString(),
  });

  invalidateMusicasCache();
  redirect(`/admin/reuniao-publica/musica/sessoes?codigo=${encodeURIComponent(codigo.toUpperCase())}&salvo=1`);
}

export async function createMusicaSessaoAction() {
  const sessao = await createMusicaSessao();
  invalidateMusicasCache();
  redirect(`/admin/reuniao-publica/musica/sessoes?codigo=${encodeURIComponent(sessao.codigo_pareamento)}&nova=1`);
}

export async function setMusicaExibicaoPublicaAction(musicaId: string) {
  if (!musicaId || typeof musicaId !== "string") {
    throw new Error("Música inválida");
  }

  const sessao = await saveMusicaExibicaoPublica(musicaId);

  if (!sessao) {
    throw new Error("Música não encontrada");
  }

  invalidateMusicasCache();
  return sessao;
}

export async function setMusicaSessaoAtivaAction(codigo: string, ativo: boolean) {
  if (!codigo || typeof codigo !== "string") {
    throw new Error("Código de pareamento inválido");
  }

  const sessao = await patchMusicaSessao(codigo, {
    ativo,
    ultimo_acesso_em: new Date().toISOString(),
  });

  if (!sessao) {
    throw new Error("Sessão não encontrada");
  }

  invalidateMusicasCache();
  return sessao;
}

export async function encerrarTodasMusicaSessoesAction() {
  const sessoes = await listMusicaSessoes();
  const ativas = sessoes.filter((sessao) => sessao.ativo);

  if (ativas.length === 0) {
    redirect("/admin/reuniao-publica/musica/sessoes?encerradas=0");
  }

  await Promise.all(
    ativas.map((sessao) =>
      patchMusicaSessao(sessao.codigo_pareamento, {
        ativo: false,
        ultimo_acesso_em: new Date().toISOString(),
      }),
    ),
  );

  invalidateMusicasCache();
  redirect(`/admin/reuniao-publica/musica/sessoes?encerradas=${ativas.length}`);
}

export async function deleteMusicaSessaoAction(codigo: string) {
  if (!codigo || typeof codigo !== "string") {
    throw new Error("Código de pareamento inválido");
  }

  const sessoes = await listMusicaSessoes();
  const sessao = sessoes.find((s) => s.codigo_pareamento === codigo.trim().toUpperCase());

  if (!sessao) {
    throw new Error("Sessão não encontrada");
  }

  await deleteMusicaSessao(codigo);
  invalidateMusicasCache();
}
