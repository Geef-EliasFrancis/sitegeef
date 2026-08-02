import { unstable_cache } from "next/cache";
import { recordSupabaseFailureEvent } from "@/lib/observability";
import { loadUserAreaIdentity } from "@/lib/areas/user-area-identity-repository";
import { loadUserAreaOperations } from "@/lib/areas/user-area-operations-repository";
import { loadUserAreaCompliance } from "@/lib/areas/user-area-compliance-repository";

type UserAreaData = {
  perfil: UserAreaProfile | null;
  usuario: UserAreaUsuario | null;
  pessoa: UserAreaPessoa | null;
  siteRole: string | null;
  hasAdminAccess: boolean;
  emprestimos: unknown[];
  reservas: unknown[];
  movimentosLivraria: unknown[];
  escalas: unknown[];
  voluntariados: unknown[];
  consentimentos: unknown[];
  pedidosTitular: unknown[];
};

type UserAreaRecord = Record<string, unknown>;

type UserAreaProfile = UserAreaRecord;

type UserAreaUsuario = {
  perfil?: string | null;
  pessoa_id?: string | null;
  pode_biblioteca?: boolean | null;
  pode_livraria?: boolean | null;
  pode_escalas?: boolean | null;
} & UserAreaRecord;

type UserAreaPessoa = {
  nome?: string | null;
  cpf?: string | null;
  telefone?: string | null;
  status?: string | null;
  email?: string | null;
} & UserAreaRecord;

async function logUserAreaFallback(
  operation: string,
  table: string,
  error: unknown,
  fallback: "null" | "empty_list" | "empty_object",
  payload: Record<string, unknown> = {}
) {
  if (!error) {
    return;
  }

  await recordSupabaseFailureEvent({
    source: "user-area/load",
    operation,
    table,
    error,
    fallback,
    payload,
  });
}

function getQueryError(result: unknown) {
  if (!result || typeof result !== "object") {
    return null;
  }

  return (result as { error?: unknown }).error ?? null;
}

export async function loadUserArea(userId: string): Promise<UserAreaData> {
  const identity = await loadUserAreaIdentity(userId);
  const { supabase, siteRole, perfilResult, usuarioResult } = identity;

  await Promise.all([
    logUserAreaFallback("load profile", "profiles", perfilResult.error, "null", { userId }),
    logUserAreaFallback("load usuario_sistema", "usuarios_sistema", usuarioResult.error, "null", { userId }),
  ]);

  const perfil = perfilResult.data ?? null;
  const usuario = usuarioResult.data ?? null;
  const hasAdminAccess = siteRole === "administrador" || usuario?.perfil === "administrador";
  const pessoaId = usuario?.pessoa_id ?? null;

  if (!pessoaId) {
    return {
      perfil,
      usuario,
      pessoa: null,
      siteRole,
      hasAdminAccess,
      emprestimos: [],
      reservas: [],
      movimentosLivraria: [],
      escalas: [],
      voluntariados: [],
      consentimentos: [],
      pedidosTitular: [],
    };
  }

  const pessoaResult = await supabase.from("pessoas").select("*").eq("id", pessoaId).single();
  const [emprestimosResult, reservasResult, movimentosResult, escalasResult] = await loadUserAreaOperations(supabase, pessoaId, {
    biblioteca: usuario?.pode_biblioteca,
    livraria: usuario?.pode_livraria,
    escalas: usuario?.pode_escalas,
  });
  const [voluntariosResult, consentimentosResult, pedidosResult] = await loadUserAreaCompliance(supabase, pessoaId);

  await Promise.all([
    logUserAreaFallback("load pessoa", "pessoas", getQueryError(pessoaResult), "null", { userId, pessoaId }),
    logUserAreaFallback("load emprestimos", "emprestimos", getQueryError(emprestimosResult), "empty_list", { userId, pessoaId }),
    logUserAreaFallback("load reservas", "reservas", getQueryError(reservasResult), "empty_list", { userId, pessoaId }),
    logUserAreaFallback("load movimentos_livraria", "movimentos_livraria", getQueryError(movimentosResult), "empty_list", { userId, pessoaId }),
    logUserAreaFallback("load escalas", "escala_funcoes", getQueryError(escalasResult), "empty_list", { userId, pessoaId }),
    logUserAreaFallback("load servicos_voluntarios", "servicos_voluntarios", getQueryError(voluntariosResult), "empty_list", { userId, pessoaId }),
    logUserAreaFallback("load consentimentos_lgpd", "consentimentos_lgpd", getQueryError(consentimentosResult), "empty_list", { userId, pessoaId }),
    logUserAreaFallback("load lgpd_solicitacoes", "lgpd_solicitacoes", getQueryError(pedidosResult), "empty_list", { userId, pessoaId }),
  ]);

  return {
    perfil,
    usuario,
    pessoa: pessoaResult.data ?? null,
    siteRole,
    hasAdminAccess,
    emprestimos: emprestimosResult.data ?? [],
    reservas: reservasResult.data ?? [],
    movimentosLivraria: movimentosResult.data ?? [],
    escalas: escalasResult.data ?? [],
    voluntariados: voluntariosResult.data ?? [],
    consentimentos: consentimentosResult.data ?? [],
    pedidosTitular: pedidosResult.data ?? [],
  };
}

export const getCachedUserArea = unstable_cache(loadUserArea, ["user-area"], {
  revalidate: 120,
  tags: ["user-area"],
});

export type { UserAreaData };
