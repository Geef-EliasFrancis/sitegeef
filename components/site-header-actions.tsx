"use client";

import { type Locale } from "@/lib/multilingual/client";
import { UserMenu } from "@/components/user-menu";

type SiteHeaderActionsProps = {
  locale: Locale;
  userEmail: string | null;
  nomeCompleto: string | null;
  avatarUrl: string | null;
  hasAdminAccess: boolean;
};

export function SiteHeaderActions({
  locale,
  userEmail,
  nomeCompleto,
  avatarUrl,
  hasAdminAccess,
}: SiteHeaderActionsProps) {
  return (
    <div className="site-header-right">
      <UserMenu
        locale={locale}
        userEmail={userEmail}
        nomeCompleto={nomeCompleto}
        avatarUrl={avatarUrl}
        hasAdminAccess={hasAdminAccess}
      />
    </div>
  );
}
