"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/site-icons";
import { clearUserData } from "@/hooks/useUserPersistence";
import { useTheme } from "@/hooks/useTheme";
import { getMultilingualCopy, MULTILINGUAL_COOKIE_NAME, type Locale } from "@/lib/multilingual/client";
import { ADMIN_USER_LOGOUT_LINK, ADMIN_USER_MENU_LINKS } from "@/lib/admin-user-navigation";

type AdminUserMenuProps = {
  locale: Locale;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
};

function getInitials(value?: string) {
  if (!value) {
    return "GE";
  }

  const parts = value.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join("");
  return (initials || value.slice(0, 2)).toUpperCase();
}

export function AdminUserMenu({ locale, email, fullName, avatarUrl }: AdminUserMenuProps) {
  const [open, setOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(locale);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const copy = getMultilingualCopy(locale);
  const displayName = fullName || email || "Usuário";
  const initials = getInitials(displayName);
  const nextLocale = currentLocale === "pt" ? "en" : "pt";

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleLocaleToggle = () => {
    document.cookie = `${MULTILINGUAL_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;

    try {
      localStorage.setItem(MULTILINGUAL_COOKIE_NAME, nextLocale);
    } catch {
      // Cookie already persists the selected locale.
    }

    setCurrentLocale(nextLocale);
    setOpen(false);
    window.location.reload();
  };

  return (
    <div ref={menuRef} className="admin-user-menu">
      <button
        type="button"
        className="admin-user-menu-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Menu do usuário"
      >
        {avatarUrl && !avatarLoadFailed ? (
          <Image src={avatarUrl} alt="Avatar" width={44} height={44} className="admin-user-menu-avatar admin-user-menu-avatar-image" unoptimized onError={() => setAvatarLoadFailed(true)} />
        ) : (
          <span className="admin-user-menu-avatar">{initials}</span>
        )}
      </button>

      {open && (
        <div className="admin-user-menu-popover">
          <div className="admin-user-menu-info">
            <strong>{displayName}</strong>
            <span>{email}</span>
          </div>

          <nav className="admin-user-menu-nav">
            {ADMIN_USER_MENU_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="admin-user-menu-item" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}

            <div className="admin-user-menu-controls">
              <div className="admin-user-menu-controls-label">Idioma e tema</div>
              <div className="admin-user-menu-controls-row">
                <button
                  type="button"
                  onClick={handleLocaleToggle}
                  className="site-icon-toggle site-icon-toggle--locale"
                  title={`${copy.header.language}: ${currentLocale === "pt" ? copy.header.english : copy.header.portuguese}`}
                  aria-label={`${copy.header.language}: ${currentLocale === "pt" ? copy.header.english : copy.header.portuguese}`}
                >
                  <span aria-hidden="true">🌐</span>
                  <span className="site-icon-toggle-text">{currentLocale.toUpperCase()}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="site-icon-toggle"
                  title={theme === "light" ? copy.header.themeLight : copy.header.themeDark}
                  aria-label={theme === "light" ? copy.header.themeLight : copy.header.themeDark}
                >
                  {theme === "light" ? (
                    <MoonIcon className="site-icon-toggle-svg" />
                  ) : (
                    <SunIcon className="site-icon-toggle-svg" />
                  )}
                </button>
              </div>
            </div>

            <Link
              href={ADMIN_USER_LOGOUT_LINK.href}
              className="admin-user-menu-item admin-user-menu-item-logout"
              onClick={() => {
                clearUserData();
                setOpen(false);
              }}
            >
              {ADMIN_USER_LOGOUT_LINK.label}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
