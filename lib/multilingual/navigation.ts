import { navItems, type NavItem } from "@/lib/site-data";
import type { Locale } from "./constants";

export function getLocalizedNavItems(locale: Locale): NavItem[] {
  return navItems.map((item) => ({
    ...item,
    label: locale === "en" && item.labelEn ? item.labelEn : item.label,
  }));
}

export function getInstitutionalNavItems(locale: Locale): NavItem[] {
  const localized = getLocalizedNavItems(locale);
  const byHref = new Map(localized.map((item) => [item.href, item]));
  const orderedHrefs = [
    "/reuniao-publica/escalas",
    "/institucional",
    "/identidade-visual",
    "/ao-vivo",
    "/estudos",
    "/reuniao-publica/musicas",
    "/doacoes",
    "/lgpd",
    "/cookies",
  ];

  return orderedHrefs.map((href) => byHref.get(href)).filter((item): item is NavItem => Boolean(item));
}
