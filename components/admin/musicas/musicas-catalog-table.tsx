"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconEdit, IconExternalLink, IconPlus, IconSearch, IconX } from "@/components/icons";
import type { Musica } from "@/lib/musicas";
import { getStatusLabel } from "@/lib/musicas";
import { MusicaExibicaoPublicaButton } from "./musica-exibicao-publica-button";

type MusicasCatalogTableProps = {
  musicas: Musica[];
  musicaAtivaId?: string | null;
  initialQuery?: string;
  isSaved?: boolean;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function musicaMatchesSearch(musica: Musica, search: string) {
  const normalizedSearch = normalizeText(search);
  if (!normalizedSearch) {
    return true;
  }

  const searchBlob = normalizeText(
    [
      musica.titulo,
      musica.autor,
      musica.tom ?? "",
      musica.versao ?? "",
      musica.observacoes ?? "",
      ...musica.partes.flatMap((parte) => [parte.titulo, parte.conteudo, parte.cifra ?? ""]),
    ]
      .filter(Boolean)
      .join(" "),
  );

  return searchBlob.includes(normalizedSearch);
}

export function MusicasCatalogTable({
  musicas,
  musicaAtivaId = null,
  initialQuery = "",
  isSaved = false,
}: MusicasCatalogTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchText, setSearchText] = useState(initialQuery);
  const [searchOpen, setSearchOpen] = useState(Boolean(initialQuery.trim()));
  const deferredSearchText = useDeferredValue(searchText);

  const filteredMusicas = useMemo(
    () => musicas.filter((musica) => musicaMatchesSearch(musica, deferredSearchText)),
    [deferredSearchText, musicas],
  );

  useEffect(() => {
    setSearchText(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText("");
  };

  useEffect(() => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    updateTimerRef.current = setTimeout(() => {
      const normalizedSearch = searchText.trim();
      const currentSearch = searchParams.get("q") ?? "";

      if (normalizedSearch === currentSearch) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (normalizedSearch) {
        params.set("q", normalizedSearch);
      } else {
        params.delete("q");
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }, 250);

    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [pathname, router, searchParams, searchText]);

  return (
    <div className="area-page">
      <div className="admin-page-header admin-page-header--music-catalog">
        <div className="admin-page-header-copy">
          {!searchOpen ? (
            <div className="admin-page-title-row">
              <h1 className="admin-page-title">Músicas</h1>
              <span className="music-catalog-count-pill">{musicas.length} cadastradas</span>
              <button
                type="button"
                className="music-catalog-search-toggle"
                onClick={() => setSearchOpen(true)}
                aria-label="Abrir busca de músicas"
                aria-expanded="false"
                aria-controls="musicas-admin-search-mobile"
                title="Buscar músicas"
              >
                <IconSearch size={17} />
              </button>
            </div>
          ) : (
            <div className="music-catalog-mobile-search" role="search">
              <label className="sr-only" htmlFor="musicas-admin-search-mobile">
                Buscar músicas
              </label>
              <input
                ref={searchInputRef}
                id="musicas-admin-search-mobile"
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Buscar música..."
                aria-label="Buscar músicas"
              />
              <button
                type="button"
                className="music-catalog-search-close"
                onClick={closeSearch}
                aria-label="Fechar busca de músicas"
                title="Fechar busca"
              >
                <IconX size={17} />
              </button>
            </div>
          )}
        </div>

        <div className="admin-search-bar admin-search-bar--catalog" role="search">
          <label className="sr-only" htmlFor="musicas-admin-search">
            Buscar músicas
          </label>
          <input
            ref={searchInputRef}
            id="musicas-admin-search"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Buscar por autor, título ou letra..."
            aria-label="Buscar músicas"
          />
        </div>

        <Link
          href="/admin/reuniao-publica/musicas/nova"
          className="admin-btn admin-btn-primary flex-center-gap music-catalog-create"
          aria-label="Adicionar música"
          title="Adicionar música"
        >
          <IconPlus size={18} />
          <span className="music-catalog-create-label">Nova música</span>
        </Link>
      </div>

      {isSaved && (
        <section className="area-section">
          <div className="admin-save-banner success">
            <p>✓ Música salva com sucesso!</p>
          </div>
        </section>
      )}

      <section className="area-section">
        <div className="admin-card table-surface musica-catalog-surface">
          <div className="area-section-title flex-space-between">
            <h2>Catálogo</h2>
            <span className="table-cell-text-muted">
              {filteredMusicas.length} {filteredMusicas.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          {filteredMusicas.length === 0 ? (
            <div className="area-empty">
              <p>Nenhuma música encontrada.</p>
              {searchText.trim() && (
                <p className="table-cell-text-small">
                  Tente outro termo de busca.
                </p>
              )}
            </div>
          ) : (
            <table className="admin-table musica-catalog-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Tom</th>
                  <th>Exibição pública</th>
                  <th>Status</th>
                  <th className="table-align-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMusicas.map((musica) => (
                  <tr key={musica.id}>
                    <td className="table-cell-bold">{musica.titulo}</td>
                    <td>{musica.autor}</td>
                    <td>{musica.tom || "—"}</td>
                    <td>
                      <MusicaExibicaoPublicaButton musicaId={musica.id} isAtiva={musica.id === musicaAtivaId} />
                    </td>
                    <td>
                      <span className={`inline-status inline-status--${musica.status}`}>
                        {getStatusLabel(musica.status)}
                      </span>
                    </td>
                    <td className="table-align-right">
                      <div className="flex-end-gap">
                        <Link href={`/admin/reuniao-publica/musicas/${musica.id}`} className="admin-btn admin-btn-small music-catalog-row-action" aria-label={`Editar ${musica.titulo}`} title={`Editar ${musica.titulo}`}>
                          <IconEdit size={15} />
                          <span>Editar</span>
                        </Link>
                        <Link href={`/musicas/${musica.slug}`} className="admin-btn admin-btn-small music-catalog-row-action" target="_blank" rel="noreferrer" aria-label={`Ler ${musica.titulo}`} title={`Ler ${musica.titulo}`}>
                          <IconExternalLink size={15} />
                          <span>Ler</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
