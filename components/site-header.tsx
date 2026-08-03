"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
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
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const primaryLinks = getLocalizedNavItems(locale).filter((item) => item.primary);
  const navGroups = [
    {
      key: "quem-somos",
      href: "/quem-somos",
      label: "Quem somos",
      shortLabel: "Quem somos",
      icon: "⌂",
      description: "Conheça a história, a identidade e os compromissos do GEEF.",
      links: primaryLinks.filter((item) => item.href === "/quem-somos").concat([
        { href: "/institucional", label: "Credibilidade e filiações" },
        { href: "/identidade-visual", label: "Identidade visual" },
      ]),
    },
    {
      key: "oferecemos",
      href: "/atividades",
      label: "O que oferecemos",
      shortLabel: "Oferecemos",
      icon: "✦",
      description: "Atividades, acolhimento, estudos e formação para a comunidade.",
      links: primaryLinks.filter((item) => ["/atividades", "/evangelizacao", "/atendimento-fraterno"].includes(item.href)).concat([
        { href: "/estudos", label: "Estudos" },
      ]),
    },
    {
      key: "reuniao-publica",
      href: "/reuniao-publica",
      label: "Reunião pública",
      shortLabel: "Reunião",
      icon: "♫",
      description: "Acompanhe a programação, as músicas e as escalas da casa.",
      links: [
        { href: "/reuniao-publica/programacao", label: "Programação" },
        { href: "/reuniao-publica/musicas", label: "Músicas" },
        { href: "/reuniao-publica/live", label: "Ao vivo" },
        { href: "/reuniao-publica/leitura", label: "Leituras" },
        { href: "/escalas", label: "Escalas" },
      ],
    },
    {
      key: "biblioteca",
      href: "/biblioteca",
      label: "Biblioteca e conteúdos",
      shortLabel: "Biblioteca",
      icon: "▦",
      description: "Materiais para leitura, estudo e acompanhamento da Doutrina Espírita.",
      links: [
        { href: "/biblioteca/leitor", label: "Área do leitor" },
        { href: "/biblioteca/livros", label: "Livros" },
      ],
    },
    {
      key: "participe",
      href: "/participe",
      label: "Participe",
      shortLabel: "Participe",
      icon: "●",
      description: "Encontre a casa, conheça as formas de apoio e fale conosco.",
      links: [
        { href: "/doacoes", label: "Doações" },
        { href: "/contato", label: "Contato" },
      ],
    },
  ];
  const musicLinks = [
    { href: "/reuniao-publica", label: "Voltar" },
    { href: "/reuniao-publica/musicas", label: "Músicas" },
    { href: "/reuniao-publica/musicas/passes", label: "Passes" },
  ];
  const isMusicPath = pathname === "/reuniao-publica/musicas" || pathname.startsWith("/reuniao-publica/musicas/") || pathname === "/musicas" || pathname.startsWith("/musicas/");
  const routeGroup = navGroups.find((group) => pathname === group.href)
    ?? navGroups.find((group) => group.links.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)));
  const activeGroupKey = openGroup ?? routeGroup?.key ?? null;
  const activeGroup = navGroups.find((group) => group.key === activeGroupKey) ?? routeGroup;
  const contextLinks = isMusicPath ? musicLinks : activeGroup?.links ?? [];
  const contextTitle = isMusicPath ? "Músicas" : activeGroup?.label;
  const isContextLinkActive = (href: string) => {
    if (isMusicPath && href === "/reuniao-publica") return false;
    if (isMusicPath && (href === "/reuniao-publica/musicas" || href === "/musicas")) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setOpenGroup(routeGroup?.key ?? null);
  }, [routeGroup?.key]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  function selectGroup(group: (typeof navGroups)[number]) {
    setOpenGroup(group.key);
    router.push(group.href);
  }

  return (
    <header className="site-header">
      <div className="site-header-row">
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

      <Tabs.Root
        className="site-nav-tabs"
        value={activeGroupKey ?? undefined}
        onValueChange={setOpenGroup}
        orientation="horizontal"
      >
        <Tabs.List asChild>
          <nav className="site-nav-primary" aria-label="Navegação principal">
            <Link href="/" className="site-nav-home-btn" aria-label="Home">
              HOME
            </Link>
            {navGroups.map((group) => (
              <div key={group.key} className={`site-nav-group${activeGroupKey === group.key ? " is-active" : ""}`}>
                <Tabs.Trigger asChild value={group.key}>
                  <button
                    type="button"
                    className="site-nav-group-trigger"
                    aria-label={group.label}
                    data-route={group.href}
                    onClick={() => selectGroup(group)}
                  >
                    <span className="site-nav-group-label-full">{group.label}</span>
                    <span className="site-nav-group-label-short" aria-hidden="true">{group.shortLabel}</span>
                  </button>
                </Tabs.Trigger>
              </div>
            ))}
            <Link href="/contato" className="site-nav-contact-btn" aria-label="Contato">
              Contato
            </Link>
          </nav>
        </Tabs.List>
      </Tabs.Root>

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
              <button type="button" className="site-mobile-nav-group-trigger" onClick={() => selectGroup(group)} aria-expanded={openGroup === group.key}>
                {group.label}
              </button>
              {openGroup === group.key && group.links.map((item) => (
                <Link key={`${group.key}-mobile-${item.href}`} href={item.href} className={`site-nav-dropdown-item${isContextLinkActive(item.href) ? " is-active" : ""}`} aria-current={isContextLinkActive(item.href) ? "page" : undefined} target={"openInNewTab" in item && item.openInNewTab ? "_blank" : undefined} rel={"openInNewTab" in item && item.openInNewTab ? "noopener noreferrer" : undefined} onClick={() => setMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          <Link href="/" className="site-nav-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/contato" className="site-nav-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
            Contato
          </Link>
        </nav>
      )}

      <SiteHeaderActions
        locale={locale}
        userEmail={userEmail}
        nomeCompleto={nomeCompleto}
        avatarUrl={avatarUrl}
        hasAdminAccess={hasAdminAccess}
      />
      </div>

      {activeGroup && pathname !== "/" && !mobileMenuOpen && (
        <section className={`site-context-navigation${isMusicPath ? " site-context-navigation--music" : ""}`} aria-label={`Opções de ${contextTitle}`}>
          <div className="site-context-navigation-copy">
            <strong>{contextTitle}</strong>
            <p>{isMusicPath ? "Catálogo e exibição pública das músicas." : activeGroup.description}</p>
          </div>
          <nav className="site-context-navigation-links">
            {contextLinks.map((item) => (
              <Link key={`context-${activeGroup.key}-${item.href}`} href={item.href} className={`site-context-navigation-link${isContextLinkActive(item.href) ? " is-active" : ""}`} aria-current={isContextLinkActive(item.href) ? "page" : undefined} target={"openInNewTab" in item && item.openInNewTab ? "_blank" : undefined} rel={"openInNewTab" in item && item.openInNewTab ? "noopener noreferrer" : undefined} onClick={() => setOpenGroup(null)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </section>
      )}
    </header>
  );
}
