import { site } from "@/lib/site-data";
import type { PublicContactData, PublicChannelLink } from "@/lib/site-contact";
import { normalizeHandle, normalizePhoneLink, normalizeWebsite } from "@/lib/site-contact-formatters";

function collectSocials(): PublicChannelLink[] {
  return [
    site.instagram
      ? {
          label: "Instagram",
          href: `https://instagram.com/${normalizeHandle(site.instagram)}`,
          display: site.instagram,
        }
      : null,
    site.facebook
      ? {
          label: "Facebook",
          href: `https://facebook.com/${normalizeHandle(site.facebook)}`,
          display: site.facebook,
        }
      : null,
    site.youtube
      ? {
          label: "YouTube",
          href: normalizeWebsite(site.youtube),
          display: site.youtube.replace(/^https?:\/\//i, ""),
        }
      : null,
  ].filter(Boolean) as PublicChannelLink[];
}

export function getPublicContactDataStatic(): PublicContactData {
  return {
    institutionName: site.name,
    institutionShortName: site.shortName,
    intro: "Encontre aqui os canais de contato da casa, de forma simples e direta.",
    address: {
      title: "Endereço oficial",
      value: site.address,
      note: "Mapa da casa",
    },
    phone: {
      title: "Telefone e WhatsApp",
      value: site.phone,
      href: normalizePhoneLink(site.phone),
    },
    email: {
      title: "E-mail oficial",
      value: site.email,
      href: `mailto:${site.email}`,
    },
    socials: collectSocials(),
    cards: [
      { title: "Endereço oficial", value: site.address, note: "Mapa da casa" },
      { title: "Telefone e WhatsApp", value: site.phone, href: normalizePhoneLink(site.phone), note: "Contato direto" },
      { title: "E-mail oficial", value: site.email, href: `mailto:${site.email}`, note: "Resposta por e-mail" },
    ],
  };
}
