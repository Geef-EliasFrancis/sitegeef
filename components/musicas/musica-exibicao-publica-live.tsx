"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const response = await fetch(pollUrl, { cache: "no-store" });
        if (!response.ok || cancelled) return;

        const nextData = (await response.json()) as SessaoResponse;
        setData((current) => {
          const currentSession = current?.sessao;
          const nextSession = nextData.sessao;
          const sameSessionState =
            currentSession?.codigo_pareamento === nextSession?.codigo_pareamento &&
            currentSession?.musica_id === nextSession?.musica_id &&
            currentSession?.ativo === nextSession?.ativo &&
            current?.musica?.id === nextData.musica?.id;

          return sameSessionState ? current : nextData;
        });
      } catch {
        // A projeção continua estática se a atualização periódica falhar.
      }
    }

    const intervalId = window.setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [pollUrl]);

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
      displayDensity="full"
      readerDensity="full"
      showBranding={false}
      showLiveAction={false}
    />
  );
}
