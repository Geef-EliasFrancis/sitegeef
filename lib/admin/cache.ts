import { revalidatePath, revalidateTag } from "next/cache";

export const ADMIN_DASHBOARD_CACHE_TAG = "admin-dashboard";
export const ADMIN_BIBLIOTECA_CACHE_TAG = "admin-biblioteca";
export const ADMIN_DOCUMENTOS_CACHE_TAG = "admin-documentos";
export const ADMIN_APSE_FAMILIAS_CACHE_TAG = "admin-apse-familias";
export const ADMIN_APSE_CAMPANHAS_CACHE_TAG = "admin-apse-campanhas";
export const ADMIN_APSE_ATENDIMENTOS_CACHE_TAG = "admin-apse-atendimentos";
export const ADMIN_APSE_PESSOAS_CACHE_TAG = "admin-apse-pessoas";
export const ADMIN_ATENDIMENTO_RECEPCAO_CACHE_TAG = "admin-atendimento-recepcao";
export const ADMIN_ATENDIMENTO_FRATERNO_CACHE_TAG = "admin-atendimento-fraterno";
export const ADMIN_ATENDIMENTO_EVANGELHOS_LAR_CACHE_TAG = "admin-atendimento-evangelhos-lar";
export const ADMIN_ATENDIMENTO_IRRADIACAO_CACHE_TAG = "admin-atendimento-irradiacao";
export const ADMIN_ATENDIMENTO_PESSOAS_CACHE_TAG = "admin-atendimento-pessoas";
export const MUSICAS_CACHE_TAG = "musicas";

export function invalidateAdminDashboardCache() {
  revalidateTag(ADMIN_DASHBOARD_CACHE_TAG);
  revalidatePath("/admin");
}

export function invalidateAdminBibliotecaCache() {
  revalidateTag(ADMIN_BIBLIOTECA_CACHE_TAG);
  revalidateTag("public-library-books");
  revalidatePath("/admin/biblioteca");
  revalidatePath("/biblioteca/livros");
  revalidatePath("/admin/biblioteca/emprestimos");
  revalidatePath("/admin/biblioteca/reservas");
}

export function invalidateAdminDocumentosCache() {
  revalidateTag(ADMIN_DOCUMENTOS_CACHE_TAG);
  revalidatePath("/admin/documentos");
  revalidatePath("/admin/documentos/pedidos");
  revalidatePath("/admin/documentos/termos");
  revalidatePath("/admin/documentos/consentimentos");
  revalidatePath("/admin/documentos/voluntariado");
}

export function invalidateAdminApseCache() {
  revalidateTag(ADMIN_APSE_FAMILIAS_CACHE_TAG);
  revalidateTag(ADMIN_APSE_CAMPANHAS_CACHE_TAG);
  revalidateTag(ADMIN_APSE_ATENDIMENTOS_CACHE_TAG);
  revalidateTag(ADMIN_APSE_PESSOAS_CACHE_TAG);
  revalidatePath("/admin/apse");
  revalidatePath("/admin/apse/familias");
  revalidatePath("/admin/apse/campanhas");
  revalidatePath("/admin/apse/atendimentos");
}

export function invalidateAdminAtendimentoCache() {
  revalidateTag(ADMIN_ATENDIMENTO_RECEPCAO_CACHE_TAG);
  revalidateTag(ADMIN_ATENDIMENTO_FRATERNO_CACHE_TAG);
  revalidateTag(ADMIN_ATENDIMENTO_EVANGELHOS_LAR_CACHE_TAG);
  revalidateTag(ADMIN_ATENDIMENTO_IRRADIACAO_CACHE_TAG);
  revalidateTag(ADMIN_ATENDIMENTO_PESSOAS_CACHE_TAG);
  revalidatePath("/admin/atendimento");
  revalidatePath("/admin/atendimento/recepcao");
  revalidatePath("/admin/atendimento/fraterno");
  revalidatePath("/admin/atendimento/evangelhos-lar");
  revalidatePath("/admin/atendimento/irradiacao");
}

export function invalidateMusicasCache() {
  revalidateTag(MUSICAS_CACHE_TAG);
  revalidatePath("/reuniao-publica/musicas");
  revalidatePath("/reuniao-publica/musicas/[slug]");
  revalidatePath("/reuniao-publica/musicas/exibir");
  revalidatePath("/reuniao-publica/musicas/controle");
  revalidatePath("/admin/reuniao-publica");
  revalidatePath("/admin/reuniao-publica/musica/inicio");
  revalidatePath("/admin/reuniao-publica/musica/catalogo");
  revalidatePath("/admin/reuniao-publica/musica/sessoes");
}

export function invalidateReuniaoPublicaAvisosCache() {
  revalidatePath("/admin/reuniao-publica/avisos");
  revalidatePath("/reuniao-publica/live");
}
