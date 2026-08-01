'use client';

import Link from 'next/link';
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

  return (
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
  );
}
