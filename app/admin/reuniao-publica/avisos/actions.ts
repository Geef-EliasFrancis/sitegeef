"use server";

import { redirect } from "next/navigation";
import { checkModuleAccess } from "@/lib/auth/permissions";
import { invalidateReuniaoPublicaAvisosCache } from "@/lib/admin/cache";
import { deletePersistedAviso, savePersistedAviso } from "@/lib/reuniao-publica/avisos-repository";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveAvisoReuniaoAction(formData: FormData) {
  if (!await checkModuleAccess("pode_publicar", ["diretoria", "secretaria", "comunicacao"])) {
    redirect("/admin/reuniao-publica/avisos?erro=sem-permissao");
  }
  const id = readString(formData, "id") || undefined;
  const titulo = readString(formData, "titulo");
  const status = readString(formData, "status") === "publicado" ? "publicado" : "rascunho";
  const ordem = Number.parseInt(readString(formData, "ordem") || "0", 10) || 0;

  if (!titulo) {
    redirect(`/admin/reuniao-publica/avisos${id ? `/${id}` : "/novo"}?erro=titulo-obrigatorio`);
  }

  const result = await savePersistedAviso({
    id,
    titulo,
    conteudo: readString(formData, "conteudo"),
    quando: readString(formData, "quando") || null,
    status,
    ordem,
  });

  if (!result.success) {
    redirect(`/admin/reuniao-publica/avisos${id ? `/${id}` : "/novo"}?erro=salvar`);
  }

  invalidateReuniaoPublicaAvisosCache();
  redirect(`/admin/reuniao-publica/avisos?salvo=1`);
}

export async function deleteAvisoReuniaoAction(formData: FormData) {
  if (!await checkModuleAccess("pode_publicar", ["diretoria", "secretaria", "comunicacao"])) {
    redirect("/admin/reuniao-publica/avisos?erro=sem-permissao");
  }
  const id = readString(formData, "id");
  if (!id) redirect("/admin/reuniao-publica/avisos?erro=id");
  const result = await deletePersistedAviso(id);
  if (!result.success) redirect(`/admin/reuniao-publica/avisos/${id}?erro=excluir`);
  invalidateReuniaoPublicaAvisosCache();
  redirect("/admin/reuniao-publica/avisos?excluido=1");
}
