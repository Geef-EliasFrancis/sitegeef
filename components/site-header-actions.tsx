"use client";

import Link from "next/link";
import { getMultilingualCopy, type Locale } from "@/lib/multilingual/client";
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
  const copy = getMultilingualCopy(locale);

  return (
    <div className="site-header-right">
      <Link href="/contato" className="site-nav-contact-btn">
        <span>{copy.header.contact}</span>
      </Link>

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
