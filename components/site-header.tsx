"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site-data";
import { getLocalizedNavItems, type Locale } from "@/lib/multilingual";
import { SiteHeaderActions } from "@/components/site-header-actions";

type SiteHeaderProps = {
  locale: Locale;
  userEmail: string | null;
  nomeCompleto: string | null;
  avatarUrl: string | null;
  hasAdminAccess: boolean;
};

export function SiteHeader({
  locale,
  userEmail,
  nomeCompleto,
  avatarUrl,
  hasAdminAccess,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const primaryLinks = getLocalizedNavItems(locale).filter((item) => item.primary);
  const navGroups = [
    {
      key: "quem-somos",
      label: "Quem somos",
      description: "Conheça a história, a identidade e os compromissos do GEEF.",
      links: primaryLinks.filter((item) => item.href === "/quem-somos").concat([
        { href: "/institucional", label: "Credibilidade e filiações" },
        { href: "/identidade-visual", label: "Identidade visual" },
      ]),
    },
    {
      key: "oferecemos",
      label: "O que oferecemos",
      description: "Atividades, acolhimento, estudos e formação para a comunidade.",
      links: primaryLinks.filter((item) => ["/agenda", "/atividades", "/evangelizacao", "/atendimento-fraterno"].includes(item.href)).concat([
        { href: "/estudos", label: "Estudos" },
      ]),
    },
    {
      key: "reuniao-publica",
      label: "Reunião pública",
      description: "Acompanhe a programação, as músicas e as escalas da casa.",
      links: [
        { href: "/agenda", label: "Programação" },
        { href: "/musicas", label: "Músicas" },
        { href: "/leitor", label: "Leituras" },
        { href: "/musicas/exibir", label: "Ao vivo" },
        { href: "/escalas", label: "Escalas" },
      ],
    },
    {
      key: "biblioteca",
      label: "Biblioteca e conteúdos",
      description: "Materiais para leitura, estudo e acompanhamento da Doutrina Espírita.",
      links: [
        { href: "/leitor", label: "Área do leitor" },
        { href: "/musicas", label: "Catálogo de músicas" },
        { href: "/estudos", label: "Estudos" },
      ],
    },
    {
      key: "participe",
      label: "Participe",
      description: "Encontre a casa, acompanhe a agenda e fale conosco.",
      links: [
        { href: "/agenda", label: "Agenda pública" },
        { href: "/doacoes", label: "Doações" },
        { href: "/contato", label: "Contato" },
      ],
    },
  ];

  return (
    <header className="site-header">
      <Link href="/" className="site-header-brand" aria-label={site.name}>
        <span className="site-header-brand-logo">
          <Image
            src="/brand/logo-oficial-transparent.png"
            alt="GEEF - Grupo de Estudos Espíritas de Franquia"
            width={360}
            height={156}
            decoding="async"
            priority
          />
        </span>
      </Link>

      <nav className="site-nav-primary" aria-label="Navegação principal">
        {navGroups.map((group) => (
          <div key={group.key} className="site-nav-group">
            <button
              type="button"
              className="site-nav-group-trigger"
              aria-expanded={openGroup === group.key}
              onClick={() => setOpenGroup(openGroup === group.key ? null : group.key)}
            >
              {group.label}<span aria-hidden="true">⌄</span>
            </button>
            {openGroup === group.key && (
              <div className="site-nav-group-dropdown">
                <p>{group.description}</p>
                {group.links.map((item) => (
                  <Link key={`${group.key}-${item.href}`} href={item.href} className="site-nav-dropdown-item" onClick={() => setOpenGroup(null)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <button
        type="button"
        className="site-mobile-menu-toggle"
        aria-expanded={mobileMenuOpen}
        aria-controls="site-mobile-navigation"
        aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{mobileMenuOpen ? "×" : "☰"}</span>
        <span className="site-mobile-menu-toggle-label">Menu</span>
      </button>

      {mobileMenuOpen && (
        <nav id="site-mobile-navigation" className="site-mobile-navigation" aria-label="Navegação mobile">
          {navGroups.map((group) => (
            <div key={group.key} className="site-mobile-nav-group">
              <button type="button" className="site-mobile-nav-group-trigger" onClick={() => setOpenGroup(openGroup === group.key ? null : group.key)} aria-expanded={openGroup === group.key}>
                {group.label}<span aria-hidden="true">{openGroup === group.key ? "−" : "+"}</span>
              </button>
              {openGroup === group.key && group.links.map((item) => (
                <Link key={`${group.key}-mobile-${item.href}`} href={item.href} className="site-nav-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      )}

      <SiteHeaderActions
        locale={locale}
        userEmail={userEmail}
        nomeCompleto={nomeCompleto}
        avatarUrl={avatarUrl}
        hasAdminAccess={hasAdminAccess}
      />
    </header>
  );
}
