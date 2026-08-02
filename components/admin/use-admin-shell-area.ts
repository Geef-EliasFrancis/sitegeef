"use client";

import { usePathname } from "next/navigation";

export type AdminShellArea =
  | "painel"
  | "perfil"
  | "geef"
  | "pessoas"
  | "reuniao-publica"
  | "governanca"
  | "documentos"
  | "operacao"
  | "sistema";

export type AdminShellAreaItem = {
  key: AdminShellArea;
  label: string;
  note: string;
};

export const ADMIN_SHELL_AREAS: AdminShellAreaItem[] = [
  { key: "painel", label: "Painel", note: "Resumo" },
  { key: "perfil", label: "Perfil", note: "Conta e acesso" },
  { key: "geef", label: "Geef", note: "Gestão da instituição" },
  { key: "pessoas", label: "Tarefeiros", note: "Cadastro e vínculo" },
  { key: "reuniao-publica", label: "Reunião pública", note: "Avisos, reunião e músicas" },
  { key: "governanca", label: "Governança", note: "Gestão e direção" },
  { key: "documentos", label: "Documentos", note: "LGPD e registros" },
  { key: "operacao", label: "Operação", note: "Rotinas do dia a dia" },
  { key: "sistema", label: "Sistema", note: "Saúde e suporte" },
];

export const ADMIN_SHELL_TOP_AREAS: AdminShellAreaItem[] = ADMIN_SHELL_AREAS.filter(
  (item) => item.key !== "perfil",
);

export const ADMIN_SHELL_ROUTES: Record<AdminShellArea, string> = {
  painel: "/admin/painel",
  perfil: "/admin/perfil",
  geef: "/admin/geef",
  pessoas: "/admin/pessoas",
  "reuniao-publica": "/admin/reuniao-publica",
  governanca: "/admin/governanca",
  documentos: "/admin/documentos",
  operacao: "/admin/operacao",
  sistema: "/admin/sistema",
};

const OPERACAO_PREFIXES = [
  "/admin/operacao",
  "/admin/atendimento",
  "/admin/biblioteca",
  "/admin/livraria",
  "/admin/apse",
  "/admin/comunicacao",
  "/admin/escalas",
  "/admin/evangelizacao",
  "/admin/juventude",
  "/admin/estudos",
  "/admin/financeiro",
  "/admin/patrimonio",
  "/admin/reunioes-virtuais",
  "/admin/planejamento",
  "/admin/notificacoes",
  "/admin/relatorios",
  "/admin/mediunidade",
];

const SISTEMA_PREFIXES = [
  "/admin/observability",
  "/admin/migrations",
  "/admin/idiomas",
  "/admin/fix-usuarios",
  "/admin/sistema",
];

function normalizePathname(pathname?: string | null) {
  if (!pathname) {
    return "";
  }

  return pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
}

function matchesAnyPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export function getAdminShellAreaFromPath(pathname?: string | null): AdminShellArea {
  const normalizedPath = normalizePathname(pathname);

  if (!normalizedPath) {
    return "painel";
  }

  if (normalizedPath === "/admin" || normalizedPath.startsWith("/admin/painel")) {
    return "painel";
  }

  if (
    normalizedPath.startsWith("/admin/perfil") ||
    normalizedPath.startsWith("/perfil") ||
    normalizedPath.startsWith("/minha-area")
  ) {
    return "perfil";
  }

  if (
    normalizedPath.startsWith("/admin/reuniao-publica") ||
    normalizedPath.startsWith("/admin/instituicao/musicas")
  ) {
    return "reuniao-publica";
  }
  if (
    normalizedPath.startsWith("/admin/geef") ||
    normalizedPath.startsWith("/admin/instituicao") ||
    normalizedPath.startsWith("/admin/departamentos")
  ) {
    return "geef";
  }
  if (normalizedPath.startsWith("/admin/governanca")) return "governanca";
  if (normalizedPath.startsWith("/admin/documentos") || normalizedPath.startsWith("/admin/lgpd")) return "documentos";
  if (
    normalizedPath.startsWith("/admin/pessoas") ||
    normalizedPath.startsWith("/admin/usuarios") ||
    normalizedPath.startsWith("/admin/funcoes")
  ) {
    return "pessoas";
  }
  if (matchesAnyPrefix(normalizedPath, OPERACAO_PREFIXES)) {
    return "operacao";
  }
  if (matchesAnyPrefix(normalizedPath, SISTEMA_PREFIXES)) {
    return "sistema";
  }

  return "painel";
}

export function useAdminShellArea() {
  const pathname = usePathname();
  const area = getAdminShellAreaFromPath(pathname);

  return { area, areas: ADMIN_SHELL_AREAS, topAreas: ADMIN_SHELL_TOP_AREAS, routes: ADMIN_SHELL_ROUTES };
}
