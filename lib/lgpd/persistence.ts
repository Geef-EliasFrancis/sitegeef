import { headers } from "next/headers";
import { insertLgpdRecord } from "@/lib/lgpd/persistence-repository";
import { LGPD_VERSIONS, type LgpdCategoria, type LgpdStatus } from "./constants";

export type LgpdEventInput = {
  categoria: LgpdCategoria;
  acao: string;
  status?: LgpdStatus;
  versao?: string;
  escopo?: Record<string, unknown>;
  severity?: LgpdSeverity;
  userId?: string | null;
  pessoaId?: string | null;
  origem?: string | null;
  canal?: string | null;
  expiresAt?: string | null;
  consentidoEm?: string | null;
  revogadoEm?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  referer?: string | null;
};

export type LgpdSeverity = "info" | "low" | "medium" | "high" | "critical";

function resolveSeverity(input: LgpdEventInput) {
  if (input.severity) {
    return input.severity;
  }

  if (input.escopo && typeof input.escopo.severity === "string") {
    return input.escopo.severity as LgpdSeverity;
  }

  if (input.categoria === "crianca" || input.categoria === "sensivel" || input.categoria === "upload" || input.categoria === "checkout" || input.categoria === "finalidade_nova") {
    return "high";
  }

  if (input.categoria === "marketing" || input.categoria === "whatsapp") {
    return "medium";
  }

  if (input.status === "revogado" || input.status === "recusado") {
    return "medium";
  }

  if (input.categoria === "login") {
    return "low";
  }

  return "info";
}

export function getLgpdVersion(categoria: LgpdCategoria) {
  if (categoria === "cookies") {
    return LGPD_VERSIONS.cookies;
  }

  if (categoria === "termos_uso") {
    return LGPD_VERSIONS.terms;
  }

  return LGPD_VERSIONS.privacy;
}

export async function getLgpdRequestMeta() {
  const requestHeaders = await headers();

  return {
    ip: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: requestHeaders.get("user-agent"),
    referer: requestHeaders.get("referer"),
  };
}

export async function recordLgpdEvent(input: LgpdEventInput) {
  const now = new Date().toISOString();
  const severity = resolveSeverity(input);
  const escopo = {
    ...(input.escopo ?? {}),
    severity,
  };

  const { data, error } = await insertLgpdRecord({
      user_id: input.userId ?? null,
      pessoa_id: input.pessoaId ?? null,
      categoria: input.categoria,
      acao: input.acao,
      status: input.status ?? "registrado",
      versao: input.versao ?? getLgpdVersion(input.categoria),
      escopo,
      origem: input.origem ?? null,
      canal: input.canal ?? "web",
      ip: input.ip ?? null,
      user_agent: input.userAgent ?? null,
      referer: input.referer ?? null,
      consentido_em: input.consentidoEm ?? now,
      revogado_em: input.revogadoEm ?? null,
      expires_at: input.expiresAt ?? null,
      updated_at: now,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id as string };
}

export async function recordLgpdEvents(inputs: LgpdEventInput[]) {
  for (const input of inputs) {
    const result = await recordLgpdEvent(input);
    if (!result.success) {
      return result;
    }
  }

  return { success: true };
}
