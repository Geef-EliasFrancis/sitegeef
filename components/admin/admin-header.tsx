'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAdminShellArea } from '@/components/admin/use-admin-shell-area';
import { AdminUserMenu } from '@/components/admin/admin-user-menu';
import { AdminContextMenu } from '@/components/admin/admin-context-menu';
import type { Locale } from '@/lib/multilingual';
import { musicContextMenuItems } from '@/lib/admin-music-navigation';
import { contextMenus } from '@/lib/admin-context-navigation';

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
  const isMusicContext = area === 'reuniao-publica' && pathname.startsWith('/admin/reuniao-publica/musica');

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
        <AdminContextMenu items={contextMenuItems} pathname={pathname} searchParams={searchParams} label={`Menu de contexto de ${area}`} />
      )}
      {isMusicContext && (
        <AdminContextMenu items={musicContextMenuItems} pathname={pathname} searchParams={searchParams} nested label="Submenu de músicas" />
      )}
    </div>
  );
}
