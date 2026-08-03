"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconExternalLink, IconSearch, IconX } from "@/components/icons";

type MusicasToolbarProps = {
  initialQuery: string;
};

export function MusicasToolbar({ initialQuery }: MusicasToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(Boolean(initialQuery.trim()));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [searchOpen]);

  return (
    <div className="musica-toolbar">
      <div className="musica-toolbar-title">
        <h1>Músicas</h1>
      </div>

      <div className="musica-toolbar-actions">
        {searchOpen ? (
          <form action="/reuniao-publica/musicas" method="get" className="musica-toolbar-search" role="search">
            <label className="sr-only" htmlFor="musicas-search">
              Buscar músicas
            </label>
            <input
              ref={inputRef}
              id="musicas-search"
              name="q"
              type="search"
              defaultValue={initialQuery}
              placeholder="Autor, título ou trecho"
            />
            <button type="submit" className="button button-primary musica-icon-button" aria-label="Buscar músicas" title="Buscar músicas">
              <IconSearch size={18} />
            </button>
            <button
              type="button"
              className="button button-secondary musica-icon-button"
              onClick={() => setSearchOpen(false)}
              aria-label="Fechar busca"
              title="Fechar busca"
            >
              <IconX size={18} />
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="button button-secondary musica-icon-button"
            onClick={() => setSearchOpen(true)}
            aria-label="Abrir busca"
            title="Abrir busca"
          >
            <IconSearch size={18} />
          </button>
        )}

        <Link
          href="/reuniao-publica/musicas/exibir"
          className="button button-secondary musica-icon-button"
          aria-label="Abrir painel de exibição"
          title="Abrir painel de exibição"
        >
          <IconExternalLink size={18} />
        </Link>
      </div>
    </div>
  );
}
