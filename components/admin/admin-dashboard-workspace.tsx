"use client";

import Link from "next/link";
import { getNomeMes, getProximaQuinta, formatarDataLonga } from "@/lib/escalas/datas";
import { useAdminShellArea } from "@/components/admin/use-admin-shell-area";
import type { AdminDashboardSummary } from "@/lib/admin/dashboard";

type AdminDashboardWorkspaceProps = {
  summary: AdminDashboardSummary;
};

function SectionCard({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="admin-card admin-dashboard-panel admin-area-panel">
      <div className="admin-section-heading">
        <span className="admin-dashboard-kicker">{title}</span>
        <p>{description}</p>
      </div>

      <div className="admin-dashboard-actions">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="admin-btn admin-btn-secondary">
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardWorkspace({ summary }: AdminDashboardWorkspaceProps) {
  const { area } = useAdminShellArea();
  const {
    totalPessoas,
    totalFuncoes,
    totalTemas,
    totalEscalasPublicadas,
    escalaMesAtual,
    mesAtual,
    anoAtual,
  } = summary;

  const proximaQuinta = getProximaQuinta();
  const summaryCards = [
    { label: "Tarefeiros ativos", value: totalPessoas },
    { label: "Funções", value: totalFuncoes },
    { label: "Temas doutrinários", value: totalTemas },
    { label: "Escalas publicadas", value: totalEscalasPublicadas },
  ];

  if (area === "perfil") {
    return (
      <div className="admin-dashboard-page">
        <section className="admin-page-header admin-card admin-page-header--hero">
          <div className="admin-page-header-copy">
            <span className="admin-dashboard-kicker">Perfil</span>
            <h1 className="admin-page-title">Conta e acesso</h1>
            <p className="admin-page-subtitle">
              Ajustes pessoais, sessão ativa e atalho para a área interna.
            </p>
          </div>

          <div className="admin-actions">
            <Link href="/admin/perfil" className="admin-btn admin-btn-primary">👤 Meu perfil</Link>
            <Link href="/minha-area" className="admin-btn admin-btn-secondary">🧭 Minha área</Link>
          </div>
        </section>

        <div className="admin-dashboard-hero">
          <SectionCard
            title="Sessão"
            description="Use esta visão para revisar seus dados públicos e sair quando terminar."
            actions={[
              { href: "/admin/perfil", label: "Abrir perfil" },
              { href: "/logout", label: "Encerrar sessão" },
            ]}
          />
          <div className="admin-card admin-dashboard-panel admin-subtle-card">
            <span className="admin-inline-pill">Atalhos</span>
            <div className="admin-card-grid admin-metric-grid">
              <div className="admin-card admin-stat-card">
                <p className="admin-stat-value">2</p>
                <p className="admin-stat-label">Rotas principais</p>
              </div>
              <div className="admin-card admin-stat-card">
                <p className="admin-stat-value">1</p>
                <p className="admin-stat-label">Sessão ativa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (area === "geef") {
    return (
      <div className="admin-dashboard-page">
        <section className="admin-page-header admin-card admin-page-header--hero">
          <div className="admin-page-header-copy">
            <span className="admin-dashboard-kicker">Geef</span>
            <h1 className="admin-page-title">Gestão da instituição</h1>
            <p className="admin-page-subtitle">
              Identificação, estrutura, identidade visual, documentos e cadastros-base da casa.
            </p>
          </div>

        </section>

        <div className="admin-dashboard-hero">
          <SectionCard
            title="Estrutura institucional"
            description="Abra os cadastros que mantêm a base organizacional da casa."
            actions={[
              { href: "/admin/instituicao/documentos", label: "Documentos" },
            ]}
          />

          <div className="admin-card admin-dashboard-panel admin-subtle-card">
            <span className="admin-inline-pill">Visão rápida</span>
            <div className="admin-card-grid admin-metric-grid">
              {summaryCards.map((card) => (
                <div key={card.label} className="admin-card admin-stat-card">
                  <p className="admin-stat-value">{card.value}</p>
                  <p className="admin-stat-label">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (area === "reuniao-publica") {
    return (
      <div className="admin-dashboard-page">
        <section className="admin-page-header admin-card admin-page-header--hero">
          <div className="admin-page-header-copy">
            <span className="admin-dashboard-kicker">Reunião pública</span>
            <h1 className="admin-page-title">Avisos, reunião e músicas</h1>
            <p className="admin-page-subtitle">
              Organize avisos, reuniões e a exibição pública das músicas com controle ao vivo.
            </p>
          </div>

          <div className="admin-actions">
            <Link href="/admin/reuniao-publica" className="admin-btn admin-btn-primary">📣 Avisos</Link>
            <Link href="/admin/reuniao-publica/musicas" className="admin-btn admin-btn-secondary">🎵 Músicas</Link>
          </div>
        </section>

        <div className="admin-dashboard-hero">
          <SectionCard
            title="Controle ao vivo"
            description="Use este espaço para acessar o catálogo, ajustar a tela pública e alterar a música exibida."
            actions={[
              { href: "/admin/reuniao-publica/musicas", label: "Músicas" },
              { href: "/admin/reuniao-publica/musicas/sessoes", label: "Sessões" },
              { href: "/musicas/exibir", label: "Exibição pública" },
            ]}
          />

          <div className="admin-card admin-dashboard-panel admin-subtle-card">
            <span className="admin-inline-pill">Operação rápida</span>
            <div className="admin-card-grid admin-metric-grid">
              <div className="admin-card admin-stat-card">
                <p className="admin-stat-value">16:9</p>
                <p className="admin-stat-label">Formato de tela</p>
              </div>
              <div className="admin-card admin-stat-card">
                <p className="admin-stat-value">1</p>
                <p className="admin-stat-label">Tela vinculada por vez</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (area === "pessoas") {
    return (
      <div className="admin-dashboard-page">
        <section className="admin-page-header admin-card admin-page-header--hero">
          <div className="admin-page-header-copy">
            <span className="admin-dashboard-kicker">Tarefeiros</span>
            <h1 className="admin-page-title">Cadastro e vínculo</h1>
            <p className="admin-page-subtitle">Tudo que depende de cadastro de tarefeiro, usuário e estrutura interna.</p>
          </div>
          <div className="admin-actions">
            <Link href="/admin/usuarios" className="admin-btn admin-btn-secondary">🔑 Usuários</Link>
          </div>
        </section>

        <div className="admin-dashboard-hero">
          <SectionCard
            title="Cadastro central"
            description="Abra a base de tarefeiros, vínculos e departamentos."
            actions={[
              { href: "/admin/usuarios", label: "Usuários e permissões" },
            ]}
          />
          <div className="admin-card admin-dashboard-panel admin-subtle-card">
            <span className="admin-inline-pill">Resumo</span>
            <div className="admin-card-grid admin-metric-grid">
              {summaryCards.map((card) => (
                <div key={card.label} className="admin-card admin-stat-card">
                  <p className="admin-stat-value">{card.value}</p>
                  <p className="admin-stat-label">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (area === "governanca") {
    return (
      <div className="admin-dashboard-page">
        <section className="admin-page-header admin-card admin-page-header--hero">
          <div className="admin-page-header-copy">
            <span className="admin-dashboard-kicker">Governança</span>
            <h1 className="admin-page-title">Gestão e direção</h1>
            <p className="admin-page-subtitle">Diretorias, cargos, assembleias e documentos institucionais.</p>
          </div>
          <div className="admin-actions">
            <Link href="/admin/governanca" className="admin-btn admin-btn-primary">🏛️ Abrir governança</Link>
            <Link href="/admin/governanca/documentos" className="admin-btn admin-btn-secondary">📚 Documentos</Link>
          </div>
        </section>

        <div className="admin-dashboard-hero">
          <SectionCard
            title="Estrutura institucional"
            description="Abra as áreas que formam a governança."
            actions={[
              { href: "/admin/governanca/diretorias", label: "Diretorias" },
              { href: "/admin/governanca/cargos", label: "Cargos" },
              { href: "/admin/governanca/assembleias", label: "Assembleias" },
              { href: "/admin/governanca/documentos", label: "Documentos" },
            ]}
          />
          <div className="admin-card admin-dashboard-panel admin-subtle-card">
            <span className="admin-inline-pill">Leitura rápida</span>
            <p className="admin-page-subtitle">Use a barra superior para trocar de área e a lateral para entrar nas telas de detalhe.</p>
          </div>
        </div>
      </div>
    );
  }

  if (area === "documentos") {
    return (
      <div className="admin-dashboard-page">
        <section className="admin-page-header admin-card admin-page-header--hero">
          <div className="admin-page-header-copy">
            <span className="admin-dashboard-kicker">Documentos</span>
            <h1 className="admin-page-title">LGPD e registros</h1>
            <p className="admin-page-subtitle">Modelos, pedidos do titular, consentimentos e leitura online da governança.</p>
          </div>
          <div className="admin-actions">
            <Link href="/admin/documentos" className="admin-btn admin-btn-primary">📄 Abrir documentos</Link>
            <Link href="/admin/governanca/documentos" className="admin-btn admin-btn-secondary">📚 Governança</Link>
          </div>
        </section>

        <div className="admin-dashboard-hero">
          <SectionCard
            title="LGPD"
            description="Abra a estrutura de documentos e auditoria."
            actions={[
              { href: "/admin/documentos", label: "Modelos" },
              { href: "/admin/documentos/pedidos", label: "Pedidos" },
              { href: "/admin/documentos/consentimentos", label: "Consentimentos" },
              { href: "/admin/documentos/auditoria", label: "Auditoria" },
            ]}
          />
          <div className="admin-card admin-dashboard-panel admin-subtle-card">
            <span className="admin-inline-pill">Documentos vivos</span>
            <p className="admin-page-subtitle">
              A leitura institucional já nasce como conteúdo online, com exportação e impressão como ações secundárias.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (area === "sistema") {
    return (
      <div className="admin-dashboard-page">
        <section className="admin-page-header admin-card admin-page-header--hero">
          <div className="admin-page-header-copy">
            <span className="admin-dashboard-kicker">Sistema</span>
            <h1 className="admin-page-title">Saúde e suporte</h1>
            <p className="admin-page-subtitle">Observabilidade, migrações, idiomas e usuários problemáticos.</p>
          </div>
        </section>

        <div className="admin-dashboard-hero">
          <SectionCard
            title="Suporte operacional"
            description="Use o menu contextual acima para acessar manutenção, diagnósticos e configurações do sistema."
            actions={[]}
          />
          <div className="admin-card admin-dashboard-panel admin-subtle-card">
            <span className="admin-inline-pill">Status</span>
            <p className="admin-page-subtitle">Quando essa aba estiver ativa, a lateral deve mostrar só o suporte e as ferramentas do sistema.</p>
          </div>
        </div>
      </div>
    );
  }

  if (area === "operacao") {
    return (
      <div className="admin-dashboard-page">
        <section className="admin-page-header admin-card admin-page-header--hero">
          <div className="admin-page-header-copy">
            <span className="admin-dashboard-kicker">Operação</span>
            <h1 className="admin-page-title">Rotinas do dia a dia</h1>
            <p className="admin-page-subtitle">Escalas, biblioteca, livraria, atendimento e comunicação.</p>
          </div>
          <div className="admin-actions">
            <Link href="/admin/operacao" className="admin-btn admin-btn-primary">📅 Abrir operação</Link>
            <Link href="/admin/biblioteca" className="admin-btn admin-btn-secondary">📚 Biblioteca</Link>
          </div>
        </section>

        <div className="admin-dashboard-hero">
          <SectionCard
            title="Atalhos operacionais"
            description="Abra o que precisa sem poluir a tela com blocos repetidos."
            actions={[
              { href: "/admin/escalas", label: "Escalas" },
              { href: "/admin/biblioteca", label: "Biblioteca" },
              { href: "/admin/livraria", label: "Livraria" },
              { href: "/admin/comunicacao", label: "Comunicação" },
            ]}
          />
          <div className="admin-card admin-dashboard-panel admin-subtle-card">
            <span className="admin-inline-pill">Resumo</span>
            <div className="admin-card-grid admin-metric-grid">
              <div className="admin-card admin-stat-card">
                <p className="admin-stat-value">{getNomeMes(mesAtual)}</p>
                <p className="admin-stat-label">Mês atual</p>
              </div>
              <div className="admin-card admin-stat-card">
                <p className="admin-stat-value">{formatarDataLonga(proximaQuinta)}</p>
                <p className="admin-stat-label">Próxima reunião</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page admin-dashboard-page--panel">
      <section className="admin-page-header admin-card admin-page-header--hero">
        <div className="admin-page-header-copy">
          <h1 className="admin-page-title">Dashboard</h1>
        </div>
      </section>

      <section className="admin-dashboard-compact-grid">
        {summaryCards.map((card) => (
          <div key={card.label} className="admin-card admin-dashboard-mini-card">
            <p className="admin-stat-value">{card.value}</p>
            <p className="admin-stat-label">{card.label}</p>
          </div>
        ))}

        <div className="admin-card admin-dashboard-mini-card admin-dashboard-mini-card-wide">
          <span className="admin-inline-pill">Mês atual</span>
          <strong>{getNomeMes(mesAtual)} / {anoAtual}</strong>
          <p className="admin-page-subtitle">Leitura rápida da operação sem atalhos de criação.</p>
        </div>

        <div className="admin-card admin-dashboard-mini-card admin-dashboard-mini-card-wide">
          <span className="admin-inline-pill">Próxima reunião</span>
          <strong>{formatarDataLonga(proximaQuinta)}</strong>
          <p className="admin-page-subtitle">Apenas a informação essencial para o dia.</p>
        </div>

        <div className="admin-card admin-dashboard-mini-card admin-dashboard-mini-card-wide">
          <span className="admin-inline-pill">Escala do mês</span>
          {escalaMesAtual ? (
            <>
              <strong>
                {escalaMesAtual.status === 'publicada'
                  ? 'Publicada'
                  : escalaMesAtual.status === 'revisada'
                    ? 'Em revisão'
                    : 'Rascunho'}
              </strong>
              <p className="admin-page-subtitle">
                {escalaMesAtual.status === 'publicada'
                  ? 'A escala atual já está visível.'
                  : 'A escala atual ainda precisa de atenção.'}
              </p>
            </>
          ) : (
            <>
              <strong>Sem escala</strong>
              <p className="admin-page-subtitle">Nenhuma escala criada para este mês.</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
