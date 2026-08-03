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
import { AdminShellTabs } from '@/components/admin/admin-shell-tabs';

interface AdminHeaderProps {
  locale: Locale;
  user: {
    email?: string;
    fullName?: string;
    avatarUrl?: string;
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
          <AdminShellTabs items={topAreas} activeKey={area} routes={routes} />
        </div>

        <div className="admin-header-right">
          <AdminUserMenu locale={locale} email={user.email} fullName={displayName} avatarUrl={user.avatarUrl} />
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
