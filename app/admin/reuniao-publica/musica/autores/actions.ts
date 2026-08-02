"use server";

import { redirect } from "next/navigation";
import { listMusicaAutores, saveMusicaAutor, deleteMusicaAutor } from "@/lib/musicas";
import { invalidateMusicasCache } from "@/lib/admin/cache";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key).trim();
  return value || null;
}

export async function saveMusicaAutorAction(formData: FormData) {
  const id = readOptionalString(formData, "id") ?? undefined;
  const nome = readString(formData, "nome").trim();

  if (!nome) {
    redirect("/admin/reuniao-publica/musica/autores/novo?erro=preencha-nome");
  }

  const autor = await saveMusicaAutor({ id, nome });

  invalidateMusicasCache();
  redirect(
    `/admin/reuniao-publica/musica/autores/novo?id=${autor?.id ?? id ?? ""}&salvo=1`
  );
}

export async function deleteMusicaAutorAction(formData: FormData) {
  const id = readOptionalString(formData, "id");
  if (!id) {
    redirect("/admin/reuniao-publica/musica/autores?erro=autor-sem-id");
  }

  await deleteMusicaAutor(id);
  invalidateMusicasCache();
  redirect("/admin/reuniao-publica/musica/autores?excluido=1");
}
