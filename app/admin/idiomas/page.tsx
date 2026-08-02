import { getMultilingualCopy } from "@/lib/multilingual/client";

export const metadata = {
  title: "Idiomas - Admin GEEF",
};

export default function AdminIdiomasPage() {
  const copy = getMultilingualCopy("pt");

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="area-subtitle">Multilíngua</p>
            <h1 className="area-hero-title">{copy.adminLanguages.title}</h1>
            <p className="area-subtitle">{copy.adminLanguages.lead}</p>
          </div>
        </div>

        <div className="area-summary-grid">
          <div className="area-summary-card">
            <strong>PT / EN</strong>
            <span>{copy.adminLanguages.defaultLanguage}</span>
          </div>
          <div className="area-summary-card">
            <strong>Cookie</strong>
            <span>{copy.adminLanguages.persistence}</span>
          </div>
          <div className="area-summary-card">
            <strong>Escopo</strong>
            <span>{copy.adminLanguages.scope}</span>
          </div>
        </div>
      </section>

      <section className="area-section">
        <h2 className="area-section-title">Cobertura atual</h2>
        <div className="admin-card">
          <div className="module-grid grid-auto-300">
            <div className="area-panel-item">
              <strong>{copy.adminLanguages.publicShell}</strong>
              <p className="mt-035">{copy.adminLanguages.publicPages}</p>
            </div>
            <div className="area-panel-item">
              <strong>Persistência</strong>
              <p className="mt-035">{copy.adminLanguages.persistence}</p>
            </div>
            <div className="area-panel-item">
              <strong>Próximos passos</strong>
              <p className="mt-035">{copy.adminLanguages.nextSteps}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
