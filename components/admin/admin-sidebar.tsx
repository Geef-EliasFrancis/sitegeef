'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAdminShellArea } from '@/components/admin/use-admin-shell-area';

type AdminSidebarProps = {
  usuarioSistema?: {
    perfil?: string;
    pode_escalas?: boolean;
    pode_biblioteca?: boolean;
    pode_livraria?: boolean;
    pode_financeiro?: boolean;
    pode_pessoas?: boolean;
    pode_publicar?: boolean;
    pode_mediunidade?: boolean;
    pode_atendimento?: boolean;
    pode_apse?: boolean;
  };
};

export function AdminSidebar({ usuarioSistema }: AdminSidebarProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? '';
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdministrador = usuarioSistema?.perfil === 'administrador';
  const currentPerfil = usuarioSistema?.perfil ?? '';
  const { area } = useAdminShellArea();
  const showUserArea = area === 'pessoas' || area === 'perfil';
  const showDocumentsArea = area === 'documentos';
  const showSystemArea = area === 'sistema';
  const showDashboardArea = area === 'painel';
  const showReuniaoPublicaArea = area === 'reuniao-publica';

  const canAccess = (flag: keyof NonNullable<AdminSidebarProps['usuarioSistema']>) => {
    if (isAdministrador) {
      return true;
    }

    return usuarioSistema?.[flag] === true;
  };

  const canAccessModule = (
    flag?: keyof NonNullable<AdminSidebarProps['usuarioSistema']>,
    profiles: string[] = [],
  ) => {
    if (isAdministrador) {
      return true;
    }

    if (flag && usuarioSistema?.[flag] === true) {
      return true;
    }

    return profiles.includes(currentPerfil);
  };

  const showGeefArea = area === 'geef';

  useEffect(() => {
    // Load expanded groups from localStorage
    const saved = localStorage.getItem('admin-sidebar-expanded');
    if (!saved) {
      return;
    }

    try {
      setExpandedGroups(JSON.parse(saved));
    } catch (error) {
      console.warn('Falha ao ler estado do menu lateral:', error);
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleGroup = (groupName: string) => {
    const newState = { ...expandedGroups, [groupName]: !expandedGroups[groupName] };
    setExpandedGroups(newState);
    localStorage.setItem('admin-sidebar-expanded', JSON.stringify(newState));
  };

  const isActive = (href: string) => currentPath.startsWith(href);

  const NavGroup = ({
    name,
    title,
    collapsible = false,
    children,
  }: {
    name?: string;
    title?: string;
    collapsible?: boolean;
    children: React.ReactNode;
  }) => {
    const isExpanded = name ? expandedGroups[name] !== false : true;

    return (
      <div className="admin-nav-section">
        {title && collapsible && (
          <button
            type="button"
            onClick={() => name && toggleGroup(name)}
            className="admin-nav-title admin-nav-title-button"
            aria-expanded={isExpanded}
          >
            <span>{title}</span>
            <span className="admin-nav-title-arrow">{isExpanded ? '▼' : '▶'}</span>
          </button>
        )}
        {title && !collapsible && <h3 className="admin-nav-title">{title}</h3>}
        {isExpanded && <div className="admin-nav-group-items">{children}</div>}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        className="admin-mobile-nav-toggle"
        aria-expanded={mobileOpen}
        aria-controls="admin-navigation"
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? 'Fechar menu' : 'Abrir menu'}
      </button>
    <aside id="admin-navigation" className={`admin-sidebar ${mobileOpen ? 'is-mobile-open' : ''}`}>
      <nav className="admin-nav">
        {/* Dashboard */}
        {showDashboardArea && (
          <div className="admin-nav-section">
            <Link
              href="/admin/painel"
              className={`admin-nav-item ${isActive('/admin/painel') ? 'active' : ''}`}
            >
              <span aria-label="Painel de controle (dashboard)">📊</span> Painel
            </Link>
          </div>
        )}

        {/* Instituição (GEEF) */}
        {showGeefArea && canAccessModule('pode_pessoas', ['diretoria', 'secretaria']) && (
          <NavGroup name="instituicao" title="Instituição" collapsible>
            <Link
              href="/admin/instituicao/identificacao"
              className={`admin-nav-item ${isActive('/admin/instituicao/identificacao') ? 'active' : ''}`}
            >
              📌 Identificação
            </Link>
            <Link
              href="/admin/instituicao/identidade-visual"
              className={`admin-nav-item ${isActive('/admin/instituicao/identidade-visual') ? 'active' : ''}`}
            >
              🎨 Identidade Visual
            </Link>
            <Link
              href="/admin/instituicao/endereco"
              className={`admin-nav-item ${isActive('/admin/instituicao/endereco') ? 'active' : ''}`}
            >
              📍 Endereço
            </Link>
            <Link
              href="/admin/instituicao/descritivo"
              className={`admin-nav-item ${isActive('/admin/instituicao/descritivo') ? 'active' : ''}`}
            >
              📝 Descritivo
            </Link>
            <Link
              href="/admin/instituicao/missao-valores"
              className={`admin-nav-item ${isActive('/admin/instituicao/missao-valores') ? 'active' : ''}`}
            >
              ✨ Missão e Valores
            </Link>
            <Link
              href="/admin/instituicao/documentos"
              className={`admin-nav-item ${isActive('/admin/instituicao/documentos') ? 'active' : ''}`}
            >
              📄 Documentos
            </Link>
            <Link
              href="/admin/instituicao/contatos"
              className={`admin-nav-item ${isActive('/admin/instituicao/contatos') ? 'active' : ''}`}
            >
              📞 Contatos
            </Link>
            <Link
              href="/admin/instituicao/contas"
              className={`admin-nav-item ${isActive('/admin/instituicao/contas') ? 'active' : ''}`}
            >
              <span aria-label="Contas e gestão bancária">💰</span> Contas Bancárias
            </Link>
          </NavGroup>
        )}

        {/* Reunião pública */}
        {showReuniaoPublicaArea && canAccessModule('pode_publicar', ['comunicacao', 'secretaria']) && (
          <>
            <div className="admin-nav-section">
              <h3 className="admin-nav-title">Reunião pública</h3>
            </div>

            <NavGroup name="reuniao-publica-avisos" title="Avisos e reunião" collapsible>
              <Link
                href="/admin/reuniao-publica"
                className={`admin-nav-item ${isActive('/admin/reuniao-publica') && !isActive('/admin/reuniao-publica/musicas') ? 'active' : ''}`}
              >
                Avisos
              </Link>
              <Link
                href="/admin/reuniao-publica/reuniao"
                className={`admin-nav-item ${isActive('/admin/reuniao-publica/reuniao') ? 'active' : ''}`}
              >
                Reuniões
              </Link>
            </NavGroup>

            <NavGroup name="reuniao-publica-musicas" title="Músicas" collapsible>
              <Link
                href="/admin/reuniao-publica/musicas"
                className={`admin-nav-item ${isActive('/admin/reuniao-publica/musicas') ? 'active' : ''}`}
              >
                Lista de músicas
              </Link>
              <Link
                href="/admin/reuniao-publica/musicas/autores"
                className={`admin-nav-item ${isActive('/admin/reuniao-publica/musicas/autores') ? 'active' : ''}`}
              >
                Autores
              </Link>
            </NavGroup>

            <NavGroup name="reuniao-publica-sessoes" title="Sessões" collapsible>
              <Link
                href="/admin/reuniao-publica/musicas/sessoes"
                className={`admin-nav-item ${isActive('/admin/reuniao-publica/musicas/sessoes') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                href="/musicas/controle"
                className={`admin-nav-item ${isActive('/musicas/controle') ? 'active' : ''}`}
              >
                Controle
              </Link>
              <Link
                href="/musicas/exibir"
                className={`admin-nav-item ${isActive('/musicas/exibir') ? 'active' : ''}`}
              >
                Exibição pública
              </Link>
            </NavGroup>
          </>
        )}

        {/* Governança */}
        {showGeefArea && canAccessModule('pode_pessoas', ['diretoria', 'secretaria']) && (
          <NavGroup name="governanca-geef" title="Governança" collapsible>
            <Link
              href="/admin/governanca"
              className={`admin-nav-item ${isActive('/admin/governanca') ? 'active' : ''}`}
            >
              🏢 Diretorias e Cargos
            </Link>
            <Link
              href="/admin/governanca/assembleias"
              className={`admin-nav-item ${isActive('/admin/governanca/assembleias') ? 'active' : ''}`}
            >
              📋 Assembleias e Atas
            </Link>
          </NavGroup>
        )}

        {/* Documentos */}
        {showGeefArea && canAccessModule('pode_publicar', ['comunicacao', 'secretaria']) && (
          <NavGroup name="documentos-geef" title="Documentos" collapsible>
            <Link
              href="/admin/documentos"
              className={`admin-nav-item ${isActive('/admin/documentos') ? 'active' : ''}`}
            >
              📄 Documentos / LGPD
            </Link>
            <Link
              href="/admin/lgpd"
              className={`admin-nav-item ${isActive('/admin/lgpd') ? 'active' : ''}`}
            >
              🛡️ Central LGPD
            </Link>
            <Link
              href="/admin/documentos/pedidos"
              className={`admin-nav-item ${isActive('/admin/documentos/pedidos') ? 'active' : ''}`}
            >
              📮 Pedidos do Titular
            </Link>
            <Link
              href="/admin/documentos/auditoria"
              className={`admin-nav-item ${isActive('/admin/documentos/auditoria') ? 'active' : ''}`}
            >
              🧭 Auditoria LGPD
            </Link>
          </NavGroup>
        )}

        {/* Tarefeiros */}
        {showUserArea && canAccess('pode_pessoas') && (
          <NavGroup name="pessoas" title="Tarefeiros" collapsible>
            <Link
              href="/admin/pessoas"
              className={`admin-nav-item ${isActive('/admin/pessoas') ? 'active' : ''}`}
            >
              👥 Cadastro
            </Link>
            <Link
              href="/admin/usuarios"
              className={`admin-nav-item ${isActive('/admin/usuarios') ? 'active' : ''}`}
            >
              🔑 Usuários e Permissões
            </Link>
            <Link
              href="/admin/perfil"
              className={`admin-nav-item ${isActive('/admin/perfil') ? 'active' : ''}`}
            >
              👤 Meu perfil
            </Link>
            <Link
              href="/minha-area"
              className={`admin-nav-item ${isActive('/minha-area') ? 'active' : ''}`}
            >
              🧭 Minha área
            </Link>
          </NavGroup>
        )}

        {/* Departamentos */}
        {showUserArea && canAccessModule('pode_pessoas', ['diretoria', 'secretaria']) && (
          <div className="admin-nav-section">
            <Link
              href="/admin/departamentos"
              className={`admin-nav-item ${isActive('/admin/departamentos') ? 'active' : ''}`}
            >
              🗂️ Departamentos
            </Link>
          </div>
        )}

        {showDocumentsArea && canAccessModule('pode_publicar', ['comunicacao', 'secretaria']) && (
          <div className="admin-nav-section">
            <Link
              href="/admin/documentos"
              className={`admin-nav-item ${isActive('/admin/documentos') ? 'active' : ''}`}
            >
              📄 Documentos / LGPD
            </Link>
            <Link
              href="/admin/lgpd"
              className={`admin-nav-item ${isActive('/admin/lgpd') ? 'active' : ''}`}
            >
              🛡️ Central LGPD
            </Link>
            <Link
              href="/admin/documentos/pedidos"
              className={`admin-nav-item ${isActive('/admin/documentos/pedidos') ? 'active' : ''}`}
            >
              📮 Pedidos do Titular
            </Link>
            <Link
              href="/admin/documentos/auditoria"
              className={`admin-nav-item ${isActive('/admin/documentos/auditoria') ? 'active' : ''}`}
            >
              🧭 Auditoria LGPD
            </Link>
          </div>
        )}

        {/* Observabilidade */}
        {showSystemArea && isAdministrador && (
          <div className="admin-nav-section">
            <Link
              href="/admin/sistema"
              className={`admin-nav-item ${isActive('/admin/sistema') ? 'active' : ''}`}
            >
              🧭 Sistema
            </Link>
            <Link
              href="/admin/migrations"
              className={`admin-nav-item ${isActive('/admin/migrations') ? 'active' : ''}`}
            >
              🧱 Migrations
            </Link>
            <Link
              href="/admin/fix-usuarios"
              className={`admin-nav-item ${isActive('/admin/fix-usuarios') ? 'active' : ''}`}
            >
              🔧 Fix Usuários
            </Link>
          </div>
        )}

        {/* Site */}
        {showDashboardArea && (
          <div className="admin-nav-section">
            <h3 className="admin-nav-title">Site</h3>
            <Link href="/escalas" target="_blank" rel="noopener noreferrer" className="admin-nav-item">
              👁️ Escalas Públicas →
            </Link>
            <Link href="/leitor" target="_blank" rel="noopener noreferrer" className="admin-nav-item">
              <span aria-label="Área do leitor e catálogo de músicas">📖</span> Área do Leitor →
            </Link>
            <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-item">
              🏠 Home →
            </Link>
          </div>
        )}
      </nav>
    </aside>
    </>
  );
}
