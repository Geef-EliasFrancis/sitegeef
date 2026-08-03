import type { Metadata } from "next";
import { listReuniaoPublicaAvisos } from "@/lib/reuniao-publica/avisos";

export const metadata: Metadata = {
  title: "Avisos da reunião pública | GEEF",
  description: "Comunicados e orientações da reunião pública do GEEF.",
};

export default async function ReuniaoPublicaAvisosPage() {
  const avisos = await listReuniaoPublicaAvisos(true);

  return (
    <main className="content-page content-page--compact public-page public-page--animated reuniao-publica-avisos-page">
      <section className="content-hero reuniao-publica-avisos-hero">
        <div className="content-hero-body">
          <div className="content-copy">
            <h1>Avisos</h1>
            <div className="content-copy-body">
              <p className="content-summary">Comunicados da reunião pública.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid reuniao-publica-avisos-list" aria-label="Avisos da reunião pública">
        {avisos.length === 0 ? (
          <article className="content-card reuniao-publica-aviso-item"><h2>Nenhum aviso</h2><p>Não há comunicados publicados no momento.</p></article>
        ) : avisos.map((aviso) => (
          <article key={aviso.id} className="content-card reuniao-publica-aviso-item">
            <div className="content-card-heading-row">
              <h2>{aviso.titulo}</h2>
              {aviso.quando && <span className="content-badge-text">{aviso.quando}</span>}
            </div>
            <p>{aviso.conteudo}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
