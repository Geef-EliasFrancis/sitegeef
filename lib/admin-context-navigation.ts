import type { AdminShellArea } from "@/lib/admin-shell-navigation";

export type AdminContextItem = { label: string; href: string; activePath?: string };

export function isAdminContextItemActive(item: AdminContextItem, pathname: string, searchParams: { get(name: string): string | null }) {
  if (pathname === "/admin/pessoas/allowlist" || pathname.startsWith("/admin/pessoas/allowlist/")) {
    return item.label === "Allowlist";
  }

  if (pathname === "/admin/pessoas/relatorio" || pathname.startsWith("/admin/pessoas/relatorio/")) {
    return item.label === "Relatório";
  }

  const isFuncoesPath = pathname === "/admin/funcoes" || pathname.startsWith("/admin/funcoes/") || pathname === "/admin/pessoas/funcoes" || pathname.startsWith("/admin/pessoas/funcoes/");
  if (isFuncoesPath) {
    const isTemasPath = pathname === "/admin/funcoes/temas" || pathname.startsWith("/admin/funcoes/temas/");
    return item.label === (isTemasPath ? "Temas" : "Funções");
  }

  const itemPath = item.activePath ?? item.href.split("?")[0];
  const isPathActive = item.label === "Início" && !item.activePath
    ? pathname === itemPath
    : pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  if (!isPathActive) return false;
  if (item.label === "Prece") return searchParams.get("categoria") === "prece";
  if (item.label === "Palestra") return !searchParams.get("categoria");
  return true;
}

export const contextMenus: Partial<Record<AdminShellArea, readonly AdminContextItem[]>> = {
  perfil: [{ label: "Início", href: "/admin/perfil" }, { label: "Minha área", href: "/minha-area" }],
  "reuniao-publica": [
    { label: "Início", href: "/admin/reuniao-publica" }, { label: "Avisos", href: "/admin/reuniao-publica/avisos" },
    { label: "Reunião", href: "/admin/reuniao-publica/reuniao" }, { label: "Música", href: "/admin/reuniao-publica/musica/inicio", activePath: "/admin/reuniao-publica/musica" },
    { label: "Leitura", href: "/admin/reuniao-publica/leitura" }, { label: "Palestra", href: "/admin/reuniao-publica/palestra" }, { label: "Prece", href: "/admin/reuniao-publica/prece" },
  ],
  geef: [
    { label: "Início", href: "/admin/geef" }, { label: "Instituição", href: "/admin/geef/instituicao" },
    { label: "Identidade visual", href: "/admin/instituicao/identidade-visual" }, { label: "Descritivo", href: "/admin/instituicao/descritivo" },
    { label: "Missão e valores", href: "/admin/instituicao/missao-valores" }, { label: "Documentos", href: "/admin/instituicao/documentos" },
    { label: "Contatos", href: "/admin/instituicao/contatos" }, { label: "Dados", href: "/admin/geef/dados" }, { label: "Endereço", href: "/admin/geef/endereco" },
    { label: "Agenda", href: "/admin/geef/agenda" }, { label: "Departamentos", href: "/admin/geef/departamentos" }, { label: "Contas", href: "/admin/geef/contas" },
  ],
  pessoas: [
    { label: "Início", href: "/admin/pessoas/inicio" }, { label: "Pessoas", href: "/admin/pessoas" },
    { label: "Funções", href: "/admin/pessoas/funcoes" }, { label: "Allowlist", href: "/admin/pessoas/allowlist" }, { label: "Usuários", href: "/admin/usuarios" }, { label: "Temas", href: "/admin/funcoes/temas" }, { label: "Relatório", href: "/admin/pessoas/relatorio" },
  ],
  governanca: [
    { label: "Início", href: "/admin/governanca" }, { label: "Diretorias", href: "/admin/governanca/diretorias" },
    { label: "Cargos", href: "/admin/governanca/cargos" }, { label: "Assembleias", href: "/admin/governanca/assembleias" }, { label: "Documentos", href: "/admin/governanca/documentos" },
  ],
  documentos: [
    { label: "Início", href: "/admin/documentos" }, { label: "Modelos", href: "/admin/documentos" }, { label: "Pedidos", href: "/admin/documentos/pedidos" },
    { label: "Termos", href: "/admin/documentos/termos" }, { label: "Consentimentos", href: "/admin/documentos/consentimentos" },
    { label: "Voluntariado", href: "/admin/documentos/voluntariado" }, { label: "Auditoria", href: "/admin/documentos/auditoria" }, { label: "LGPD", href: "/admin/lgpd" },
  ],
  operacao: [
    { label: "Início", href: "/admin/operacao" }, { label: "Escalas", href: "/admin/operacao/escalas" }, { label: "Atendimento", href: "/admin/operacao/atendimento" },
    { label: "Recepção", href: "/admin/atendimento/recepcao" }, { label: "Fraterno", href: "/admin/atendimento/fraterno" }, { label: "Evangelho no lar", href: "/admin/atendimento/evangelhos-lar" },
    { label: "Irradiação", href: "/admin/atendimento/irradiacao" }, { label: "Biblioteca", href: "/admin/operacao/biblioteca" }, { label: "Empréstimos", href: "/admin/biblioteca/emprestimos" },
    { label: "Livraria", href: "/admin/operacao/livraria" }, { label: "Comunicação", href: "/admin/operacao/comunicacao" }, { label: "Estudos", href: "/admin/operacao/estudos" },
    { label: "Cursos", href: "/admin/estudos/cursos" }, { label: "Turmas", href: "/admin/estudos/turmas" }, { label: "Evangelização", href: "/admin/operacao/evangelizacao" },
    { label: "Crianças", href: "/admin/evangelizacao/criancas" }, { label: "Financeiro", href: "/admin/operacao/financeiro" }, { label: "Plano de contas", href: "/admin/financeiro/plano-contas" },
    { label: "Lançamentos", href: "/admin/financeiro/lancamentos" }, { label: "DRE", href: "/admin/financeiro/dre" }, { label: "Patrimônio", href: "/admin/operacao/patrimonio" },
    { label: "Planejamento", href: "/admin/operacao/planejamento" }, { label: "Notificações", href: "/admin/operacao/notificacoes" }, { label: "Relatórios", href: "/admin/operacao/relatorios" },
    { label: "APSE", href: "/admin/operacao/apse" }, { label: "Famílias", href: "/admin/apse/familias" }, { label: "Campanhas", href: "/admin/apse/campanhas" },
    { label: "Atendimentos APSE", href: "/admin/apse/atendimentos" }, { label: "Mediunidade", href: "/admin/operacao/mediunidade" }, { label: "Reuniões virtuais", href: "/admin/operacao/reunioes-virtuais" },
  ],
  sistema: [
    { label: "Início", href: "/admin/sistema" }, { label: "Observabilidade", href: "/admin/sistema/observabilidade" },
    { label: "Erros", href: "/admin/observability?tab=erros" }, { label: "Supabase", href: "/admin/observability?tab=supabase" }, { label: "LGPD", href: "/admin/observability?tab=lgpd" },
    { label: "Fila", href: "/admin/observability?tab=fila" }, { label: "Migrações", href: "/admin/sistema/migrations" }, { label: "Idiomas", href: "/admin/sistema/idiomas" }, { label: "Fix Usuários", href: "/admin/sistema/fix-usuarios" },
  ],
};
