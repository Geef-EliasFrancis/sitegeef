"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Musica } from "@/lib/musicas";
import { musicaMatchesSearch } from "@/lib/musicas";
import { IconExternalLink, IconSearch, IconX } from "@/components/icons";
import { MusicaCatalogLiveButton } from "@/components/musicas/musica-catalog-live-button";

type MusicasCatalogProps = {
  musicas: Musica[];
  activeMusicaId?: string | null;
};

export function MusicasCatalog({ musicas, activeMusicaId = null }: MusicasCatalogProps) {
  const [searchText, setSearchText] = useState("");

  const filtered = useMemo(() => {
    return musicas.filter((m) => !searchText || musicaMatchesSearch(m, searchText));
  }, [musicas, searchText]);

  const isEmpty = filtered.length === 0;

  return (
    <>
      <div className="musica-toolbar">
        <div className="musica-toolbar-title">
          <h1>Músicas</h1>
        </div>

        <div className="musica-toolbar-filters">
          <div className="musica-toolbar-search-wrap">
            <IconSearch size={16} />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar título, autor ou trecho..."
              className="musica-toolbar-search-input"
              aria-label="Buscar músicas"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="musica-toolbar-search-clear"
                aria-label="Limpar busca"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          <div className="musica-toolbar-count">
            {filtered.length} {filtered.length === 1 ? "música" : "músicas"}
          </div>
        </div>

        <div className="musica-toolbar-actions musica-toolbar-actions--catalog">
          <Link
            href="/reuniao-publica/musicas/exibir"
            className="button button-primary musica-toolbar-live-btn"
            aria-label="Abrir exibição ao vivo"
            title="Abrir exibição ao vivo"
          >
            <IconExternalLink size={16} />
            <span>Ao vivo</span>
          </Link>
        </div>
      </div>

      <div className="musica-catalog-grid">
        {isEmpty ? (
          <article className="content-card">
            <h2>Nenhuma música encontrada</h2>
            <p>Tente ajustar o termo de busca.</p>
          </article>
        ) : (
          filtered.map((musica) => {
            return (
              <article
                key={musica.id}
                className="musica-catalog-card musica-catalog-card--compact"
              >
                <div className="musica-catalog-summary-row">
                  <p
                    className="musica-catalog-line"
                    title={`${musica.autor} • ${musica.titulo}`}
                  >
                    <Link
                      href={`/reuniao-publica/musicas/${musica.slug}`}
                      className="musica-catalog-title-inline musica-catalog-title-link"
                      aria-label={`Abrir ${musica.titulo}`}
                      title={`Abrir ${musica.titulo}`}
                    >
                      {musica.titulo}
                    </Link>
                  </p>

                  <div className="musica-catalog-actions">
                    <MusicaCatalogLiveButton musicaId={musica.id} isAtiva={musica.id === activeMusicaId} />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </>
  );
}
