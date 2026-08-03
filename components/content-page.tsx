import { type ContentPage } from "@/lib/site-data";
import { type Locale } from "@/lib/multilingual";

type ContentPageViewProps = {
  page: ContentPage;
  locale: Locale;
  slug: string;
  showBrandKicker?: boolean;
};

export function ContentPageView({ page, locale, slug, showBrandKicker = true }: Readonly<ContentPageViewProps>) {
  const isAgenda = slug === "agenda";

  return (
    <main className={`content-page${isAgenda ? " content-page--compact" : ""}`}>
      <section className="content-hero">
        {showBrandKicker && (
          <div className="content-hero-top">
            <div className="content-kicker">
              <p className="eyebrow">GEEF</p>
              <span className="content-badge-text">
                {locale === "en" ? "Grupo Espírita Elias Francis" : "Grupo Espírita Elias Francis"}
              </span>
            </div>
          </div>
        )}

        <div className="content-hero-body">
          <div className="content-copy">
            <h1>{page.title}</h1>
            <div className="content-copy-body">
              <p className="content-summary">{page.summary}</p>
              <p className="content-intro">{page.intro}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid" aria-label={locale === "en" ? `Sections of ${page.title}` : `Seções de ${page.title}`}>
        {page.sections.map((section) => (
          <article key={section.heading} className="content-card">
            <h2>{section.heading}</h2>
            <p>{section.text}</p>
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
