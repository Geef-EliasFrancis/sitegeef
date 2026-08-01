"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { Musica, MusicaSessao } from "@/lib/musicas";

type MusicaDisplayLiveProps = {
  codigo?: string;
  pollUrl?: string;
  logoSrc: string;
  initialSessao: MusicaSessao | null;
  initialMusica: Musica | null;
  showPairingInfo?: boolean;
};

type SessaoResponse = {
  sessao: MusicaSessao | null;
  musica: Musica | null;
};

export function MusicaDisplayLive({
  codigo,
  pollUrl,
  logoSrc,
  initialSessao,
  initialMusica,
  showPairingInfo = true,
}: MusicaDisplayLiveProps) {
  const [data, setData] = useState<SessaoResponse | null>(
    initialSessao ? { sessao: initialSessao, musica: initialMusica } : null,
  );

  useEffect(() => {
    let cancelled = false;
    const intervalId = window.setInterval(() => {
      void refresh();
    }, 3000);
    const endpoint =
      pollUrl ?? (codigo ? `/api/musicas/sessoes/${encodeURIComponent(codigo)}` : "/api/musicas/exibicao");
    const supabase = createSupabaseClient();

    async function refresh() {
      try {
        const response = await fetch(endpoint, {
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
          setData(nextData);
          if (!nextData.sessao?.ativo && intervalId !== undefined) {
            window.clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar sessão:", error);
      }
    }

    const channel = supabase
      .channel("musica-exibicao-publica")
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
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      void supabase.removeChannel(channel);
    };
  }, [codigo, pollUrl]);

  const sessao = data?.sessao ?? null;
  const musica = data?.musica ?? null;

  // Estado: Sessão inativa
  if (!sessao || !sessao.ativo) {
    if (!showPairingInfo) {
      return (
        <main className="musica-display-shell musica-display-shell--idle">
          <div className="musica-display-idle-card">
            <img src={logoSrc} alt="Logo GEEF" className="musica-display-logo" />
            <p className="eyebrow">Exibição pública</p>
            <h1>Nenhuma música ativa</h1>
            <p>A seleção feita no controle aparece aqui sem precisar recarregar a página.</p>
          </div>
        </main>
      );
    }

    return (
      <main className="musica-display-shell musica-display-shell--idle">
        <div className="musica-display-idle-card">
          <img src={logoSrc} alt="Logo GEEF" className="musica-display-logo" />
          <p className="eyebrow">Exibição desativada</p>
          <h1>Sessão {codigo ?? "sem código"}</h1>
          <p>Ative a tela novamente na área interna para continuar a apresentação.</p>
        </div>
      </main>
    );
  }

  // Estado: Pareamento (ativo, sem música)
  if (!musica) {
    if (!showPairingInfo) {
      return (
        <main className="musica-display-shell musica-display-shell--idle">
          <div className="musica-display-idle-card">
            <img src={logoSrc} alt="Logo GEEF" className="musica-display-logo" />
            <p className="eyebrow">Exibição pública</p>
            <h1>Aguardando seleção</h1>
            <p>Abra o controle interno e escolha uma música para atualizar esta tela.</p>
          </div>
        </main>
      );
    }

    const controlUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/musicas/controle/${codigo}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(controlUrl)}`;

    return (
      <main className="musica-display-pairing">
        <img src={logoSrc} alt="Logo GEEF" className="musica-display-pairing-logo" />

        <div className="musica-display-pairing-content">
          <p className="musica-display-pairing-label">Código de acesso</p>
          <div className="musica-display-pairing-code">{codigo}</div>

          <div className="musica-display-pairing-qr">
            <img src={qrUrl} alt={`QR Code: ${controlUrl}`} />
            <p className="musica-display-pairing-url">{controlUrl}</p>
          </div>

          <p className="musica-display-pairing-instruction">
            Escaneie o QR code ou acesse a URL no seu dispositivo para controlar a apresentação
          </p>
        </div>
      </main>
    );
  }

  // Estado: Exibindo música em 16:9
  const estrofes = musica.partes.filter((p) => p.tipo === "estrofe" || p.tipo === "ponte" || p.tipo === "intro");
  const refraoDestacado = musica.partes.find((p) => p.tipo === "refrao");

  let estrofeCount = 0;
  const fitScale = estrofes.length <= 4 ? 1 : estrofes.length <= 6 ? 0.86 : estrofes.length <= 8 ? 0.72 : 0.6;

  return (
    <main
      className="musica-display-screen musica-display-screen--live"
      style={{ "--display-fit-scale": fitScale } as CSSProperties}
    >
      {/* Header */}
      <div className="musica-display-header-16x9">
        <div className="musica-display-header-title">
          <h1>{musica.titulo}</h1>
          <p className="musica-display-header-subtitle">
            {musica.autor}
            {musica.tom ? ` • Tom ${musica.tom}` : ""}
            {musica.versao ? ` • ${musica.versao}` : ""}
          </p>
        </div>

        <img src={logoSrc} alt="Logo GEEF" className="musica-display-header-logo" />

        {refraoDestacado && (
          <div className="musica-display-chorus-pill">
            <p className="musica-display-chorus-pill-label">Refrão</p>
            <p className="musica-display-chorus-text">♪ {refraoDestacado.conteudo.split("\n")[0]}</p>
          </div>
        )}
      </div>

      {/* Body com estrofes em 2 colunas */}
      <div className="musica-display-body-16x9">
        {estrofes.map((parte) => {
          if (parte.tipo === "estrofe") {
            estrofeCount++;
          }

          return (
            <div key={parte.id ?? `${musica.id}-${parte.ordem}`} className="musica-display-verse-16x9">
              <div className="musica-display-verse-num">{estrofeCount}</div>
              <div className="musica-display-verse-content">
                <pre>{parte.conteudo}</pre>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
