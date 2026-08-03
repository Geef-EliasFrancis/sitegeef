"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Musica, MusicaSessao } from "@/lib/musicas";
import { setMusicaAtualAction } from "@/app/musicas/controle/[codigo]/actions";

type MusicaControlRemoteProps = {
  codigo: string;
  initialSessao: MusicaSessao;
  musicas: Musica[];
};

export function MusicaControlRemote({ codigo, initialSessao, musicas }: MusicaControlRemoteProps) {
  const [sessao, setSessao] = useState(initialSessao);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const filteredMusicas = musicas.filter(
    (m) =>
      m.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.autor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDisplayPopup = useCallback(() => {
    if (typeof window === "undefined") return;

    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    popupRef.current = window.open(
      "/reuniao-publica/musicas/exibir?popup=1",
      "geef-musica-exibicao",
      "popup=yes,width=1280,height=720"
    );
  }, []);

  const handleSelectMusica = useCallback(
    async (musicaId: string) => {
      if (musicaId === sessao.musica_id) {
        return;
      }

      setLoading(true);
      try {
        const newSessao = await setMusicaAtualAction(codigo, musicaId);
        setSessao(newSessao);
      } catch (error) {
        console.error("Erro ao selecionar música:", error);
      } finally {
        setLoading(false);
      }
    },
    [codigo, sessao.musica_id]
  );

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const response = await fetch(`/api/musicas/sessoes/${encodeURIComponent(codigo)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { sessao: MusicaSessao };
        if (!cancelled) {
          setSessao(data.sessao);
          if (!data.sessao.ativo) {
            window.clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar sessão:", error);
      }
    }

    const intervalId = window.setInterval(refresh, 3000);
    refresh();

    return () => {
      cancelled = true;
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [codigo]);

  return (
    <div className="musica-control-remote-page">
      <div className="musica-control-remote-header">
        <div className="musica-control-remote-toolbar">
          <h1 className="musica-control-remote-title">Controle de Sessão</h1>
          <button
            type="button"
            onClick={openDisplayPopup}
            className="musica-control-remote-open-display"
          >
            Abrir exibição
          </button>
        </div>
        <input
          type="search"
          placeholder="Buscar música..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="musica-control-remote-search"
        />
      </div>

      <div className="musica-control-remote-grid">
        {filteredMusicas.length === 0 ? (
          <div className="musica-control-remote-empty">
            <p className="musica-control-remote-empty-text">Nenhuma música encontrada</p>
          </div>
        ) : (
          filteredMusicas.map((musica) => {
            const isActive = musica.id === sessao.musica_id;

            return (
              <button
                key={musica.id}
                onClick={() => handleSelectMusica(musica.id)}
                disabled={loading}
                className={`musica-control-remote-card ${isActive ? "is-active" : ""} ${loading ? "is-loading" : ""}`}
                data-active={isActive}
              >
                <h2 className="musica-control-remote-card-title">
                  {musica.titulo}
                </h2>
                <p className="musica-control-remote-card-author">
                  {musica.autor}
                </p>
                {musica.tom && (
                  <p className="musica-control-remote-card-tone">
                    Tom: {musica.tom}
                  </p>
                )}
                {isActive && (
                  <div className="musica-control-remote-card-status">
                    ✓ Exibindo agora
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
