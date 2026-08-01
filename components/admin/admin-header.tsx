'use client';

import Link from 'next/link';
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

const contextMenuItems = [
  { label: 'Avisos', href: '/admin/reuniao-publica' },
  { label: 'Música', href: '/admin/reuniao-publica/musicas' },
  { label: 'Leitura', href: '/leitor' },
  { label: 'Palestra', href: '/admin/funcoes/temas' },
  { label: 'Prece', href: '/admin/funcoes/temas?categoria=prece' },
] as const;

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

  return (
    <div className="admin-header-shell">
      <header className="admin-header">
        <Link href="/admin/painel" className="admin-brand">
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

      {area === 'reuniao-publica' && (
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
