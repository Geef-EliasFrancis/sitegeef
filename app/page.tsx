import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarIcon, GroupIcon, HeartIcon, MailIcon, ShieldIcon } from "@/components/site-icons";
import { getMultilingualCopy } from "@/lib/multilingual";
import { getRequestLocale } from "@/lib/multilingual/server";
import { normalizeInternalPath } from "@/lib/security";
import { getPublicContactDataStatic } from "@/lib/site-contact-public";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getMultilingualCopy(locale);

  return {
    title: `GEEF | ${copy.home.title}`,
    description: copy.home.lead,
  };
}

type HomePageProps = {
  searchParams?: Promise<{
    code?: string;
    next?: string;
  }>;
};

const iconMap = {
  group: GroupIcon,
  calendar: CalendarIcon,
  heart: HeartIcon,
  mail: MailIcon,
  privacy: ShieldIcon,
};

export default async function Home({ searchParams }: HomePageProps) {
  const locale = await getRequestLocale();
  const copy = getMultilingualCopy(locale);
  const resolvedSearchParams = await searchParams;
  const authCode = resolvedSearchParams?.code;
  const contact = getPublicContactDataStatic();

  if (authCode) {
    const nextUrl = normalizeInternalPath(resolvedSearchParams?.next, "/minha-area");
    const search = new URLSearchParams({
      code: authCode,
      next: nextUrl,
    });

    redirect(`/auth/callback?${search.toString()}`);
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <h1>{copy.home.title}</h1>
          <p className="hero-motto">
            <span>{copy.home.motto.text}</span>
            <em>{copy.home.motto.attribution}</em>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="feature-grid">
          {copy.home.quickLinks.map((card) => {
            const Icon = iconMap[card.icon];
            return (
              <Link key={card.href} href={card.href} className="feature-card">
                <div className="feature-card-top">
                  <Icon className="feature-icon" />
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="contact-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{locale === "en" ? "Contact" : "Contato"}</p>
            <h2 id="contact-title">{copy.home.contactTitle}</h2>
          </div>
        </div>

        <div className="contact-grid">
          <article className="contact-card">
            <h3>{locale === "en" ? "Address" : "Endereço"}</h3>
            <p>{contact.address.value}</p>
          </article>
          <article className="contact-card">
            <h3>{locale === "en" ? "Connections" : "Conexões"}</h3>
            <ul className="contact-list">
              <li>
                <a href={contact.email?.href || `mailto:${contact.email?.value || ""}`}>{contact.email?.value || "E-mail institucional"}</a>
              </li>
              <li>
                <a href={contact.phone?.href || `tel:${contact.phone?.value?.replace(/[^\d+]/g, "") || ""}`}>{contact.phone?.value || "Telefone institucional"}</a>
              </li>
              <li>
                <Link href="/contato">Ver canais oficiais</Link>
              </li>
              {contact.socials.slice(0, 3).map((social) => (
                <li key={social.href}>
                  <a href={social.href} target="_blank" rel="noreferrer">
                    {social.label}: {social.display}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
