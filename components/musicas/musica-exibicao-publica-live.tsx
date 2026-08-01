"use client";

import { useState } from "react";
import type { Musica, MusicaSessao } from "@/lib/musicas";
import { MusicaReader } from "./musica-reader";

type MusicaExibicaoPublicaLiveProps = {
  logoSrc: string;
  initialSessao: MusicaSessao | null;
  initialMusica: Musica | null;
  pollUrl?: string;
};

type SessaoResponse = {
  sessao: MusicaSessao | null;
  musica: Musica | null;
};

export function MusicaExibicaoPublicaLive({
  logoSrc,
  initialSessao,
  initialMusica,
  pollUrl = "/api/musicas/exibicao",
}: MusicaExibicaoPublicaLiveProps) {
  const [data, setData] = useState<SessaoResponse | null>(
    initialSessao ? { sessao: initialSessao, musica: initialMusica } : null,
  );

  const sessao = data?.sessao ?? null;
  const musica = data?.musica ?? null;

  if (!sessao || !sessao.ativo || !musica) {
    return (
      <main className="musica-page public-page--animated">
        <section className="content-hero public-hero-shell">
          <div className="musica-reader-header musica-reader-header--compact">
            <div className="musica-reader-title-only">
              <p className="eyebrow">Exibição pública</p>
              <h1>Nenhuma música ativa</h1>
              <p className="musica-hero-subtitle">
                A música marcada como ao vivo no admin aparece aqui automaticamente.
              </p>
            </div>

            <div className="musica-reader-actions">
              <span className="musica-code-pill">Ao vivo</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <MusicaReader
      musica={musica}
      logoSrc={logoSrc}
      mode="exibicao"
      readerDensity="full"
      showBranding={false}
      showLiveAction={false}
    />
  );
}
