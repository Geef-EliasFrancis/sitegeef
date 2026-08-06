import { type ContentPage } from "@/lib/site-data";
import { type Locale } from "@/lib/multilingual";
import Link from "next/link";
import { IconMusic } from "@/components/icons";
import { BookIcon, GroupIcon, HeartIcon, MailIcon } from "@/components/site-icons";
import { EvangelhoLarGuide } from "@/components/evangelho-lar-guide";

type ContentPageViewProps = {
  page: ContentPage;
  locale: Locale;
  slug: string;
  compactHero?: boolean;
  sequenceDiagram?: boolean;
};

function ProgramacaoStepIcon({ label }: { label: string }) {
  if (label.startsWith("Música")) return <IconMusic size={20} />;
  if (label.startsWith("Avisos")) return <MailIcon />;
  if (label.startsWith("Leitura")) return <BookIcon />;
  if (label.startsWith("Prece")) return <HeartIcon />;
  if (label.startsWith("Palestra")) return <GroupIcon />;
  if (label.startsWith("Passe")) return <HeartIcon />;
  return <GroupIcon />;
}

export function ContentPageView({ page, locale, slug, compactHero = false, sequenceDiagram = false }: Readonly<ContentPageViewProps>) {
  const isAgenda = slug === "agenda";

  return (
    <main className={`content-page${isAgenda ? " content-page--compact" : ""}`}>
      <section className="content-hero">
        <div className="content-hero-body">
          <div className="content-copy">
            <div className="content-copy-heading">
              <h1>{page.title}</h1>
              {slug === "evangelho-no-lar" && <Link className="content-hero-action" href="/evangelho-no-lar/guia">{locale === "en" ? "Let's do it together" : "Vamos fazer juntos"} <span aria-hidden="true">→</span></Link>}
            </div>
            <div className="content-copy-body">
              <p className="content-summary">{page.summary}</p>
              {!compactHero && <p className="content-intro">{page.intro}</p>}
            </div>
          </div>
        </div>
      </section>

      {slug === "evangelho-no-lar" ? <EvangelhoLarGuide locale={locale} /> : <section className="content-grid" aria-label={locale === "en" ? `Sections of ${page.title}` : `Seções de ${page.title}`}>
        {page.sections.map((section, sectionIndex) => (
          <article key={section.heading} className={`content-card${sequenceDiagram && sectionIndex === 0 ? " content-card--sequence" : ""}`}>
            <h2>{section.heading}</h2>
            <p>{section.text}</p>
            {section.bullets ? (sequenceDiagram && sectionIndex === 0 ? (
              <ol className="programacao-sequence" aria-label={locale === "en" ? "Meeting sequence" : "Sequência da reunião"}>
                {section.bullets.map((bullet, index) => (
                  <li key={bullet}>
                    <span className="programacao-sequence-marker" aria-hidden="true">
                      <span className="programacao-sequence-number">{index + 1}</span>
                      <span className="programacao-sequence-icon"><ProgramacaoStepIcon label={bullet} /></span>
                    </span>
                    <span className="programacao-sequence-label">{bullet}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )) : null}
          </article>
        ))}
      </section>}
    </main>
  );
}
