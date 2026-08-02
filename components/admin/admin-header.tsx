'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAdminShellArea } from '@/components/admin/use-admin-shell-area';
import { AdminUserMenu } from '@/components/admin/admin-user-menu';
import type { Locale } from '@/lib/multilingual';
import type { AdminShellArea } from '@/components/admin/use-admin-shell-area';

const shellIcons: Record<AdminShellArea, string> = {
  painel: '⌂',
  perfil: '◉',
  geef: '✦',
  pessoas: '♙',
  'reuniao-publica': '♫',
  governanca: '◇',
  documentos: '▤',
  operacao: '⚙',
  sistema: '◌',
};

const contextMenus: Partial<Record<AdminShellArea, readonly { label: string; href: string }[]>> = {
  painel: [
    { label: 'Início', href: '/admin/painel' },
  ],
  perfil: [
    { label: 'Início', href: '/admin/perfil' },
    { label: 'Minha área', href: '/minha-area' },
  ],
  'reuniao-publica': [
    { label: 'Avisos', href: '/admin/reuniao-publica/avisos' },
    { label: 'Música', href: '/admin/reuniao-publica/musica' },
    { label: 'Leitura', href: '/admin/reuniao-publica/leitura' },
    { label: 'Palestra', href: '/admin/reuniao-publica/palestra' },
    { label: 'Prece', href: '/admin/reuniao-publica/prece' },
  ],
  geef: [
    { label: 'Início', href: '/admin/geef' },
    { label: 'Instituição', href: '/admin/geef/instituicao' },
    { label: 'Dados', href: '/admin/geef/dados' },
    { label: 'Endereço', href: '/admin/geef/endereco' },
    { label: 'Agenda', href: '/admin/geef/agenda' },
    { label: 'Departamentos', href: '/admin/geef/departamentos' },
    { label: 'Contas', href: '/admin/geef/contas' },
  ],
  pessoas: [
    { label: 'Início', href: '/admin/pessoas/inicio' },
    { label: 'Pessoas', href: '/admin/pessoas/pessoas' },
    { label: 'Funções', href: '/admin/pessoas/funcoes' },
  ],
  governanca: [
    { label: 'Início', href: '/admin/governanca' },
    { label: 'Diretorias', href: '/admin/governanca/diretorias' },
    { label: 'Cargos', href: '/admin/governanca/cargos' },
    { label: 'Assembleias', href: '/admin/governanca/assembleias' },
    { label: 'Documentos', href: '/admin/governanca/documentos' },
  ],
  documentos: [
    { label: 'Início', href: '/admin/documentos' },
    { label: 'Modelos', href: '/admin/documentos' },
    { label: 'Pedidos', href: '/admin/documentos/pedidos' },
    { label: 'Consentimentos', href: '/admin/documentos/consentimentos' },
    { label: 'Auditoria', href: '/admin/documentos/auditoria' },
    { label: 'LGPD', href: '/admin/lgpd' },
  ],
  operacao: [
    { label: 'Início', href: '/admin/operacao' },
    { label: 'Escalas', href: '/admin/operacao/escalas' },
    { label: 'Atendimento', href: '/admin/operacao/atendimento' },
    { label: 'Biblioteca', href: '/admin/operacao/biblioteca' },
    { label: 'Livraria', href: '/admin/operacao/livraria' },
    { label: 'Comunicação', href: '/admin/operacao/comunicacao' },
    { label: 'Estudos', href: '/admin/operacao/estudos' },
    { label: 'Evangelização', href: '/admin/operacao/evangelizacao' },
    { label: 'Financeiro', href: '/admin/operacao/financeiro' },
    { label: 'Patrimônio', href: '/admin/operacao/patrimonio' },
    { label: 'Planejamento', href: '/admin/operacao/planejamento' },
    { label: 'Notificações', href: '/admin/operacao/notificacoes' },
    { label: 'Relatórios', href: '/admin/operacao/relatorios' },
    { label: 'Mediunidade', href: '/admin/operacao/mediunidade' },
    { label: 'APSE', href: '/admin/operacao/apse' },
    { label: 'Reuniões virtuais', href: '/admin/operacao/reunioes-virtuais' },
  ],
  sistema: [
    { label: 'Início', href: '/admin/sistema' },
    { label: 'Observabilidade', href: '/admin/sistema/observabilidade' },
    { label: 'Migrações', href: '/admin/sistema/migrations' },
    { label: 'Idiomas', href: '/admin/sistema/idiomas' },
    { label: 'Fix Usuários', href: '/admin/sistema/fix-usuarios' },
  ],
};

interface AdminHeaderProps {
  locale: Locale;
  user: {
    email?: string;
    fullName?: string;
  };
}

export function AdminHeader({ locale, user }: AdminHeaderProps) {
  const displayName = user.fullName || user.email || 'Usuário';
  const { area, topAreas, routes } = useAdminShellArea();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contextMenuItems = contextMenus[area];

  return (
    <div className="admin-header-shell">
      <header className="admin-header">
        <Link href="/admin/painel" className="admin-brand">
          <Image
            className="admin-brand-logo"
            src="/brand/logo-oficial-transparent.png"
            alt="GEEF"
            width={360}
            height={156}
            priority
          />
        </Link>

        <div className="admin-header-middle">
          <div className="admin-shell-tabs" aria-label="Seções do painel">
            {topAreas.map((item) => (
              <Link
                key={item.key}
                href={routes[item.key]}
                className={`admin-shell-tab ${area === item.key ? 'active' : ''}`}
                aria-current={area === item.key ? 'page' : undefined}
                aria-label={`${item.label}: ${item.note}`}
                title={`${item.label}: ${item.note}`}
              >
                <span className="admin-shell-tab-icon" aria-hidden="true">{shellIcons[item.key]}</span>
                <span className="admin-shell-tab-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-header-right">
          <AdminUserMenu locale={locale} email={user.email} fullName={displayName} />
        </div>
      </header>

      {contextMenuItems && (
        <nav className="admin-context-menu" aria-label="Menu de contexto da reunião pública">
          {contextMenuItems.map((item) => {
            const itemPath = item.href.split('?')[0];
            const isPathActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`);
            const isPrece = item.label === 'Prece';
            const isPalestra = item.label === 'Palestra';
            const isActive = isPathActive && (!isPrece && !isPalestra || (isPrece ? searchParams.get('categoria') === 'prece' : !searchParams.get('categoria')));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`admin-context-menu-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
