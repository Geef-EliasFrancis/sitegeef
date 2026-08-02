import { Suspense } from "react";
import { getMusicasResumo, listMusicaSessoes, listMusicaAutores } from "@/lib/musicas";

export const metadata = {
  title: "Reunião pública - Admin GEEF",
};

async function ReuniaoPublicaContent() {
  const [musicasResumo, sessoes, autores] = await Promise.all([
    getMusicasResumo(),
    listMusicaSessoes(),
    listMusicaAutores(),
  ]);

  const sessoesAtivas = sessoes.filter((s) => s.ativo);
  const musicasAtivas = musicasResumo.filter((m) => m.status === "ativa");

  const autoresUnicos = autores.length;

  return (
    <div className="area-page">
      <section className="area-hero" style={{ paddingBottom: "1.5rem" }}>
        <div className="area-hero-top">
          <div>
            <h1 className="area-hero-title" style={{ fontSize: "2rem" }}>
              Reunião pública
            </h1>
          </div>
        </div>
      </section>

      <section className="area-section">
        <div className="stat-grid">
          <div className="stat-card">
            <span>Músicas cadastradas</span>
            <strong>{musicasResumo.length}</strong>
            <small style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              {musicasAtivas.length} ativas
            </small>
          </div>
          <div className="stat-card">
            <span>Autores únicos</span>
            <strong>{autoresUnicos}</strong>
            <small style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              no catálogo
            </small>
          </div>
          <div className="stat-card">
            <span>Telas ativas</span>
            <strong>{sessoesAtivas.length}</strong>
            <small style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              de {sessoes.length} total
            </small>
          </div>
          <div className="stat-card">
            <span>Taxa de cobertura</span>
            <strong>
              {musicasResumo.length > 0
                ? Math.round((musicasAtivas.length / musicasResumo.length) * 100)
                : 0}%
            </strong>
            <small style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              de músicas prontas
            </small>
          </div>
        </div>
      </section>

    </div>
  );
}

export default function ReuniaoPublicaPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>}>
      <ReuniaoPublicaContent />
    </Suspense>
  );
}
