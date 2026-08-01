"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getMultilingualCopy, type Locale } from "@/lib/multilingual/client";
import { LanguageSwitcher } from "@/components/multilingual/language-switcher";
import { useTheme } from "@/hooks/useTheme";
import { MoonIcon, SunIcon } from "@/components/site-icons";

type UserMenuProps = {
  locale: Locale;
  userEmail?: string | null;
  nomeCompleto?: string | null;
  avatarUrl?: string | null;
  hasAdminAccess?: boolean;
};

export function UserMenu({
  locale,
  userEmail,
  nomeCompleto,
  avatarUrl,
  hasAdminAccess,
}: UserMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const copy = getMultilingualCopy(locale);
  const normalizedEmail = userEmail?.trim().toLowerCase() || null;
  const isAdminByEmail =
    normalizedEmail === "contatogeef@gmail.com" ||
    normalizedEmail === "app.jmr@gmail.com";
  const canAccessAdmin = Boolean(hasAdminAccess || isAdminByEmail);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  if (!userEmail) {
    return (
      <div ref={menuRef} className="site-header-user">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="site-header-user-btn"
          title={copy.header.account}
          aria-label={copy.header.account}
          aria-expanded={menuOpen}
        >
          <div className="site-header-user-initial">👤</div>
        </button>

        {menuOpen && (
          <div className="site-header-user-dropdown">
            <div className="site-header-user-info site-header-user-info-compact">
              <div className="site-header-user-details">
                <strong>{copy.header.account}</strong>
                <span>
                  {locale === "en" ? "Sign in or create access" : "Entrar ou criar acesso"}
                </span>
              </div>
            </div>

            <nav className="site-header-user-nav">
              <Link
                href="/login?next=/minha-area&popup=1"
                className="site-header-user-item"
                onClick={() => setMenuOpen(false)}
              >
                <span>🔐</span> {copy.header.enter}
              </Link>
              <Link
                href="/login?next=/minha-area&popup=1"
                className="site-header-user-item"
                onClick={() => setMenuOpen(false)}
              >
                <span>📝</span> {copy.header.createAccount}
              </Link>
              <Link
                href="/privacidade"
                className="site-header-user-item"
                onClick={() => setMenuOpen(false)}
              >
                <span>🛡️</span> {copy.header.privacy}
              </Link>
              <div className="site-header-user-controls">
                <div className="site-header-user-controls-label">Idioma e tema</div>
                <div className="site-header-user-controls-row">
                  <LanguageSwitcher
                    locale={locale}
                    onLocaleChange={() => setMenuOpen(false)}
                  />
                  <button
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
            </nav>
          </div>
        )}
      </div>
    );
  }

  // Authenticated
  return (
    <div ref={menuRef} className="site-header-user">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="site-header-user-btn"
        title={locale === "en" ? "User menu" : "Menu de usuário"}
        aria-label={locale === "en" ? "User menu" : "Menu de usuário"}
        aria-expanded={menuOpen}
      >
        {avatarUrl && !avatarLoadFailed ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={44}
            height={44}
            className="site-header-user-avatar"
            unoptimized
            onError={() => setAvatarLoadFailed(true)}
          />
        ) : (
          <div className="site-header-user-initial">👤</div>
        )}
      </button>

      {menuOpen && (
        <div className="site-header-user-dropdown">
          <div className="site-header-user-info site-header-user-info-compact">
            {avatarUrl && !avatarLoadFailed ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={48}
                height={48}
                className="site-header-user-avatar-lg"
                unoptimized
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <div className="site-header-user-initial-lg">👤</div>
            )}
            <div className="site-header-user-details">
              <strong>{nomeCompleto || (locale === "en" ? "User" : "Usuário")}</strong>
              <span>{userEmail}</span>
            </div>
          </div>

          <nav className="site-header-user-nav">
            {canAccessAdmin && (
              <Link
                href="/admin/painel"
                className="site-header-user-item"
                onClick={() => setMenuOpen(false)}
              >
                <span>🛠️</span> {copy.header.adminPanel}
              </Link>
            )}
            <Link
              href="/perfil"
              className="site-header-user-item"
              onClick={() => setMenuOpen(false)}
            >
              <span>👤</span> {copy.header.myProfile}
            </Link>
            <Link
              href="/minha-area"
              className="site-header-user-item"
              onClick={() => setMenuOpen(false)}
            >
              <span>📋</span> {copy.header.myArea}
            </Link>

            <div className="site-header-user-controls">
              <div className="site-header-user-controls-label">Idioma e tema</div>
              <div className="site-header-user-controls-row">
                <LanguageSwitcher
                  locale={locale}
                  onLocaleChange={() => setMenuOpen(false)}
                />
                <button
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
            <Link href="/logout" className="site-header-user-logout">
              <span>🚪</span> {copy.header.signOut}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
