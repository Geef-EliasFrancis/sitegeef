"use client";

import { useEffect, useState } from "react";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
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
    const supabase = createSupabaseClient();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, 3000);

    async function refresh() {
      try {
        const response = await fetch(pollUrl, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled && response.status === 404) {
            setData(null);
          }
          return;
        }

        const nextData = (await response.json()) as SessaoResponse;
        if (!cancelled) {
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
        }
      } catch (error) {
        console.error("Erro ao atualizar exibição pública:", error);
      }
    }

    const channel = supabase
      .channel("musica-exibicao-publica-reader")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "musica_sessoes",
          filter: "codigo_pareamento=eq.EXIBICAO_PUBLICA",
        },
        () => {
          void refresh();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void refresh();
        }
      });

    void refresh();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      void supabase.removeChannel(channel);
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
      readerDensity="full"
      showBranding={false}
      showLiveAction={false}
    />
  );
}
