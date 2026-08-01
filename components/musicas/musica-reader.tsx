"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Musica } from "@/lib/musicas";
import { formatParteTipoLabel, isTituloSameasTipo } from "@/lib/musicas";
import { IconArrowLeft, IconPrinter } from "@/components/icons";
import { MusicaExibicaoPublicaButton } from "@/components/musicas/musica-exibicao-publica-button";
import { getMusicaDisplayConfig, getMusicaDisplayScale } from "@/lib/musica-display-config";

function isChordLine(line: string): boolean {
  if (!line || !line.trim()) return false;
  const tokens = line.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const chordPattern = /^[A-G][#b]?(m|M|maj|min|dim|aug|sus[24]?|add[0-9]?|[0-9]+|°|ø)*$/;
  return tokens.every((token) => chordPattern.test(token));
}

function CifraLineRenderer({ text, hideChords }: { text: string; hideChords: boolean }) {
  const lines = text.split("\n");

  if (hideChords) {
    // Renderizar só as linhas de letra (sem acordes)
    return (
      <div className="musica-cifra-inline">
        {lines.map((line, idx) => {
          if (isChordLine(line)) return null;
          if (!line.trim()) {
            return <div key={idx} className="musica-lyric-spacer" />;
          }
          return (
            <pre key={idx} className="musica-lyric-row">
              {line}
            </pre>
          );
        })}
      </div>
    );
  }

  // Renderizar com acordes acima das letras
  return (
    <div className="musica-cifra-inline">
      {lines.map((line, idx) => {
        if (isChordLine(line)) {
          return (
            <pre key={idx} className="musica-chord-row">
              {line}
            </pre>
          );
        }
        if (!line.trim()) {
          return <div key={idx} className="musica-lyric-spacer" />;
        }
        return (
          <pre key={idx} className="musica-lyric-row">
            {line}
          </pre>
        );
      })}
    </div>
  );
}

function getLyricsMarginClass(marginTop: number) {
  if (marginTop <= 0.23) return "musica-reader-lyrics--mt-xxs";
  if (marginTop <= 0.32) return "musica-reader-lyrics--mt-xs";
  if (marginTop <= 0.45) return "musica-reader-lyrics--mt-sm";
  if (marginTop <= 0.58) return "musica-reader-lyrics--mt-md";
  return "musica-reader-lyrics--mt-lg";
}

type MusicaReaderProps = {
  musica: Musica;
  logoSrc: string;
  displayCode?: string | null;
  mode?: "publico" | "exibicao";
  displayDensity?: "standard" | "full";
  readerDensity?: "standard" | "full";
  showBackLink?: boolean;
  showBranding?: boolean;
  showLiveAction?: boolean;
  isExibicaoPublicaAtiva?: boolean;
};

export function MusicaReader({
  musica,
  logoSrc,
  displayCode,
  mode = "publico",
  displayDensity = "standard",
  readerDensity = "standard",
  showBackLink = true,
  showBranding = true,
  showLiveAction = true,
  isExibicaoPublicaAtiva = false,
}: MusicaReaderProps) {
  const isDisplay = mode === "exibicao";
  const displayScreenRef = useRef<HTMLElement | null>(null);
  const publicLyricsPanelRef = useRef<HTMLElement | null>(null);
  const [viewMode, setViewMode] = useState<"letra" | "cifra">("letra");
  const [pipExpanded, setPipExpanded] = useState(false);
  const [pipHidden, setPipHidden] = useState(true);
  const [viewport, setViewport] = useState(() => ({
    width: 1366,
    height: 768,
  }));

  const partesComCifra = musica.partes.filter((p) => p.cifra);
  const hasInlineChords = musica.partes.some((p) =>
    p.conteudo.split("\n").some(isChordLine)
  );
  const mostrarCifra = viewMode === "cifra";
  const podeAlternarCifra = partesComCifra.length > 0 || hasInlineChords;

  const hasMedia = musica.youtube_url || musica.audio_url;
  const partesVisiveis = musica.partes.filter((parte) => !mostrarCifra || parte.cifra);
  const readerMetrics = useMemo(() => {
    const totalLines = partesVisiveis.reduce((sum, parte) => sum + parte.conteudo.split("\n").length, 0);
    const totalChars = partesVisiveis.reduce((sum, parte) => sum + parte.conteudo.length, 0);
    const isCompact = totalLines > 14 || totalChars > 700 || partesVisiveis.length > 5;
    const isDense = totalLines > 24 || totalChars > 1100 || partesVisiveis.length > 7;
    const maxColumnsByWidth = Math.min(6, Math.max(2, Math.floor((viewport.width - 40) / 210)));

    let columns;
    if (viewport.width < 960) {
      columns = 1;
    } else if (isDense) {
      columns = Math.min(maxColumnsByWidth, viewport.width >= 1500 ? 6 : viewport.width >= 1200 ? 5 : 4);
    } else if (isCompact) {
      columns = Math.min(maxColumnsByWidth, viewport.width >= 1300 ? 4 : 3);
    } else {
      columns = Math.min(maxColumnsByWidth, 2);
    }

    const columnWidth = columns >= 6 ? 11.5 : columns === 5 ? 13 : columns === 4 ? 15.5 : columns === 3 ? 17.5 : 19;
    const columnGap = columns >= 6 ? 0.35 : columns === 5 ? 0.5 : columns === 4 ? 0.65 : columns === 3 ? 0.85 : 1;
    const lyricsMarginTop = columns >= 6 ? 0.22 : columns === 5 ? 0.3 : columns === 4 ? 0.4 : columns === 3 ? 0.5 : 0.65;
    const lyricsPanelPadding =
      columns >= 6
        ? "0.45rem 0.65rem 0.75rem"
        : columns === 5
          ? "0.55rem 0.75rem 0.8rem"
          : columns === 4
            ? "0.65rem 0.85rem 0.9rem"
            : columns === 3
              ? "0.75rem 0.9rem 0.95rem"
              : "0.85rem 1rem 1rem";
    const partePad = columns >= 6 ? 0.35 : columns === 5 ? 0.45 : columns === 4 ? 0.55 : columns === 3 ? 0.7 : 0.9;
    const labelSize = columns >= 6 ? 0.55 : columns === 5 ? 0.58 : columns === 4 ? 0.62 : columns === 3 ? 0.66 : 0.72;
    const titleSize = columns >= 6 ? 0.8 : columns === 5 ? 0.86 : columns === 4 ? 0.92 : columns === 3 ? 1.0 : 1.05;
    const textSize = columns >= 6 ? 0.72 : columns === 5 ? 0.76 : columns === 4 ? 0.82 : columns === 3 ? 0.88 : 0.96;
    const lineHeight = columns >= 6 ? 1.16 : columns === 5 ? 1.22 : columns === 4 ? 1.34 : columns === 3 ? 1.48 : 1.62;
    const lyricSpacer = columns >= 6 ? 0.08 : columns === 5 ? 0.12 : columns === 4 ? 0.2 : columns === 3 ? 0.3 : 0.5;

    return {
      columns,
      columnWidth,
      columnGap,
      lyricsMarginTop,
      lyricsPanelPadding,
      partePad,
      labelSize,
      titleSize,
      textSize,
      lineHeight,
      lyricSpacer,
    };
  }, [partesVisiveis, viewport.width]);
  const publicReaderMetrics = useMemo(() => {
    if (readerDensity !== "full") {
      return readerMetrics;
    }

    return {
      ...readerMetrics,
      columnWidth: readerMetrics.columnWidth + 2.25,
      columnGap: Math.max(0.28, readerMetrics.columnGap - 0.12),
      lyricsMarginTop: Math.max(0.2, readerMetrics.lyricsMarginTop - 0.12),
      lyricsPanelPadding: "0.95rem 1.1rem 1.15rem",
      partePad: readerMetrics.partePad + 0.1,
      labelSize: readerMetrics.labelSize + 0.1,
      titleSize: readerMetrics.titleSize + 0.15,
      textSize: readerMetrics.textSize + 0.18,
      lineHeight: readerMetrics.lineHeight + 0.12,
      lyricSpacer: Math.max(0.16, readerMetrics.lyricSpacer - 0.08),
    };
  }, [readerDensity, readerMetrics]);
  const displayMetrics = useMemo(() => {
    const isFullDisplay = displayDensity === "full";
    const totalLines = partesVisiveis.reduce((sum, parte) => sum + parte.conteudo.split("\n").length, 0);
    const totalChars = partesVisiveis.reduce((sum, parte) => sum + parte.conteudo.length, 0);
    const density = totalLines * 24 + totalChars / 22 + partesVisiveis.length * 72;
    const heightFactor = Math.min(1, viewport.height / 900);
    const widthFactor = Math.min(1, viewport.width / 1600);
    const densityFactor = density > 1200 ? 0.9 : density > 900 ? 0.95 : density > 650 ? 0.98 : 1;
    const minimumScale = viewport.height < 450 ? 0.36 : viewport.height < 650 ? 0.68 : 0.88;
    const scale = Math.max(minimumScale, Math.min(1, heightFactor * widthFactor * densityFactor + 0.15));
    const maxColumnsByWidth = isFullDisplay
      ? Math.min(4, Math.max(2, Math.floor((viewport.width - 80) / 300)))
      : Math.min(4, Math.max(2, Math.floor((viewport.width - 80) / 280)));

    // Para músicas curtas: force mais colunas para melhor legibilidade
    let columns;
    if (viewport.width < 600) {
      columns = 1;
    } else if (viewport.width < 980 && viewport.width > viewport.height) {
      columns = 3;
    } else if (totalLines <= 16) {
      // Música muito curta: prefira 3-4 colunas
      columns = Math.min(maxColumnsByWidth, 4);
    } else if (totalLines <= 30) {
      // Música curta: prefira 2-3 colunas
      columns = Math.min(maxColumnsByWidth, 3);
    } else if (totalLines <= 45) {
      // Música média: prefira 3 colunas
      columns = Math.min(maxColumnsByWidth, 3);
    } else {
      // Música muito longa (>45 linhas): force 4 colunas
      columns = Math.min(maxColumnsByWidth, 4);
    }

    if (isFullDisplay) {
      columns = Math.min(columns, 3);
      if (partesVisiveis.length <= 4) {
        columns = Math.min(columns, 2);
      }
    }

    const bodyGap = isFullDisplay
      ? columns >= 4
        ? 0.36
        : columns === 3
          ? 0.5
          : scale < 0.85
            ? 0.62
            : scale < 0.92
              ? 0.72
              : 0.82
      : columns >= 4
        ? 0.48
        : columns === 3
          ? 0.58
          : scale < 0.85
            ? 0.7
            : scale < 0.92
              ? 0.8
              : 0.9;
    const headerPaddingY = isFullDisplay
      ? scale < 0.85
        ? 0.74
        : scale < 0.92
          ? 0.92
          : 1.05
      : scale < 0.85
        ? 0.82
        : scale < 0.92
          ? 1
          : 1.2;
    const headerPaddingX = isFullDisplay
      ? scale < 0.85
        ? 0.68
        : scale < 0.92
          ? 0.9
          : 1.08
      : scale < 0.85
        ? 0.75
        : scale < 0.92
          ? 1
          : 1.25;
    const titleSize = 1.7;
    const subtitleSize = 1;
    const logoWidth = isFullDisplay
      ? columns >= 4
        ? 68
        : columns === 3
          ? 84
          : scale < 0.85
            ? 82
            : scale < 0.92
              ? 90
              : 102
      : columns >= 4
        ? 62
        : columns === 3
          ? 78
          : scale < 0.85
            ? 76
            : scale < 0.92
              ? 86
              : 96;
    const bodyPaddingTop = isFullDisplay
      ? columns >= 4
        ? 0.25
        : columns === 3
          ? 0.45
          : scale < 0.85
            ? 0.5
            : scale < 0.92
              ? 0.7
              : 0.95
      : columns >= 4
        ? 0.45
        : columns === 3
          ? 0.7
          : scale < 0.85
            ? 0.65
            : scale < 0.92
              ? 0.9
              : 1.15;
    const versePad = isFullDisplay
      ? columns >= 4
        ? 0.7
        : columns === 3
          ? 0.92
          : scale < 0.85
            ? 0.92
            : scale < 0.92
              ? 1.05
              : 1.15
      : columns >= 4
        ? 0.58
        : columns === 3
          ? 0.85
          : scale < 0.85
            ? 0.8
            : scale < 0.92
              ? 0.92
              : 1.02;
    const verseTitle = isFullDisplay
      ? columns >= 4
        ? 1.02
        : columns === 3
          ? 1.16
          : scale < 0.85
            ? 1.08
            : scale < 0.92
              ? 1.14
              : 1.22
      : columns >= 4
        ? 0.9
        : columns === 3
          ? 1.08
          : scale < 0.85
            ? 0.98
            : scale < 0.92
              ? 1.04
              : 1.15;
    const verseText = isFullDisplay
      ? columns >= 4
        ? 1.06
        : columns === 3
          ? 1.16
          : scale < 0.85
            ? 1.1
            : scale < 0.92
              ? 1.18
              : 1.28
      : columns >= 4
        ? 0.9
        : columns === 3
          ? 1.08
          : scale < 0.85
            ? 0.92
            : scale < 0.92
              ? 1
              : 1.08;
    const verseMinHeight =
      totalLines <= 14
        ? isFullDisplay
          ? 9.6
          : 8.8
        : totalLines <= 20
          ? isFullDisplay
            ? 8.8
            : 8
          : totalLines <= 30
            ? isFullDisplay
              ? 7.8
              : 7.1
            : totalLines <= 42
              ? isFullDisplay
                ? 6.8
                : 6.4
              : isFullDisplay
                ? 6
                : 5.8;

    const displayConfig = getMusicaDisplayConfig(musica.titulo);

    return {
      scale,
      columns: displayConfig.columns ?? columns,
      rows: Math.max(1, Math.ceil(partesVisiveis.length / (displayConfig.columns ?? columns))),
      bodyGap,
      headerPaddingY,
      headerPaddingX,
      titleSize,
      subtitleSize,
      logoWidth,
      bodyPaddingTop,
      versePad,
      verseTitle,
      verseText,
      verseMinHeight,
    };
  }, [displayDensity, musica.titulo, partesVisiveis, viewport.height, viewport.width]);
  const displayColumns = useMemo(() => {
    const columns = Math.max(1, displayMetrics.columns);
    const perColumn = Math.ceil(partesVisiveis.length / columns);
    return Array.from({ length: columns }, (_, columnIndex) =>
      partesVisiveis.slice(columnIndex * perColumn, (columnIndex + 1) * perColumn),
    );
  }, [displayMetrics.columns, partesVisiveis]);

  useEffect(() => {
    const el = displayScreenRef.current;
    if (!isDisplay || !el) {
      return;
    }

    const properties: Record<string, string> = {
      "--display-scale": String(getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)),
      "--display-fit-scale": String(getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)),
      "--display-columns": String(displayMetrics.columns),
      "--display-rows": String(displayMetrics.rows),
      "--display-body-gap": `${displayMetrics.bodyGap * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-header-pad-y": `${displayMetrics.headerPaddingY * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-header-pad-x": `${displayMetrics.headerPaddingX * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-body-pad-x": `${displayMetrics.headerPaddingX * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-title-size": `${displayMetrics.titleSize * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-subtitle-size": `${displayMetrics.subtitleSize * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-logo-width": `${displayMetrics.logoWidth * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}px`,
      "--display-body-pad-top": `${displayMetrics.bodyPaddingTop * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-verse-pad": `${displayMetrics.versePad * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-verse-title": `${displayMetrics.verseTitle * (displayDensity === "full" ? 1.25 : 1) * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-verse-text": `${displayMetrics.verseText * (displayDensity === "full" ? 1.45 : 1) * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
      "--display-verse-min-height": `${displayMetrics.verseMinHeight * getMusicaDisplayScale(musica.titulo, viewport.width, displayMetrics.scale)}rem`,
    };

    Object.entries(properties).forEach(([property, value]) => {
      el.style.setProperty(property, value);
    });
  }, [displayMetrics, isDisplay]);

  useEffect(() => {
    const el = publicLyricsPanelRef.current;
    if (isDisplay || !el) {
      return;
    }

    const properties: Record<string, string> = {
      "--reader-lyrics-panel-padding": publicReaderMetrics.lyricsPanelPadding,
      "--reader-column-width": `${publicReaderMetrics.columnWidth}rem`,
      "--reader-column-gap": `${publicReaderMetrics.columnGap}rem`,
      "--reader-parte-padding": `${publicReaderMetrics.partePad}rem`,
      "--reader-label-size": `${publicReaderMetrics.labelSize}rem`,
      "--reader-title-size": `${publicReaderMetrics.titleSize}rem`,
      "--reader-text-size": `${publicReaderMetrics.textSize}rem`,
      "--reader-line-height": String(publicReaderMetrics.lineHeight),
      "--reader-lyric-spacer": `${publicReaderMetrics.lyricSpacer}rem`,
    };

    Object.entries(properties).forEach(([property, value]) => {
      el.style.setProperty(property, value);
    });

    return () => {
      Object.keys(properties).forEach((property) => {
        el.style.removeProperty(property);
      });
    };
  }, [isDisplay, publicReaderMetrics]);

  useEffect(() => {
    if (isDisplay) {
      document.body.classList.add("musica-display-route");
      return () => {
        document.body.classList.remove("musica-display-route");
      };
    }
    document.body.classList.remove("musica-display-route");
  }, [musica.id, isDisplay]);

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [musica.id]);

  if (isDisplay) {
    return (
      <main
        ref={displayScreenRef}
        className={`musica-display-screen musica-display-screen--reader musica-display-screen--live ${getMusicaDisplayConfig(musica.titulo).fillRows ? "is-fill-rows" : ""}`}
      >
        <div className="musica-display-command-bar" role="toolbar" aria-label="Comandos da exibição">
          <Link
            href="/musicas"
            className="musica-display-command-button"
            aria-label="Voltar ao catálogo"
            title="Voltar ao catálogo"
          >
            <IconArrowLeft size={16} />
          </Link>
          <button
            type="button"
            className="musica-display-command-button"
            onClick={() => window.print()}
            aria-label="Imprimir música"
            title="Imprimir música"
          >
            <IconPrinter size={16} />
          </button>
          {hasMedia ? (
            <button
              type="button"
              className="musica-display-command-button"
              onClick={() => setPipHidden((hidden) => !hidden)}
              aria-label={pipHidden ? "Mostrar vídeo" : "Ocultar vídeo"}
              title={pipHidden ? "Mostrar vídeo" : "Ocultar vídeo"}
            >
              <span aria-hidden="true">{pipHidden ? "▶" : "■"}</span>
            </button>
          ) : null}
          {podeAlternarCifra ? (
            <button
              type="button"
              className="musica-display-command-button"
              onClick={() => setViewMode(viewMode === "letra" ? "cifra" : "letra")}
              aria-label={`Exibir ${viewMode === "letra" ? "cifra" : "letra"}`}
              title={`Exibir ${viewMode === "letra" ? "cifra" : "letra"}`}
            >
              <span aria-hidden="true">🎼</span>
            </button>
          ) : null}
        </div>

        <div className="musica-display-header-16x9">
          <div className="musica-display-header-title">
            <h1>{musica.titulo}</h1>
            <p className="musica-display-header-subtitle">
              {musica.autor}
              {musica.tom ? ` • Tom ${musica.tom}` : ""}
              {musica.versao ? ` • ${musica.versao}` : ""}
            </p>
          </div>

          <div className="musica-display-header-logo-wrap">
            <img src={logoSrc} alt="Logo GEEF" className="musica-display-header-logo" />
          </div>

        </div>

        <div className="musica-display-body-16x9">
          {displayColumns.map((column, columnIndex) => (
            <div className="musica-display-column" key={`${musica.id}-column-${columnIndex}`}>
              {column.map((parte, localIndex) => {
                const index = columnIndex * Math.ceil(partesVisiveis.length / displayMetrics.columns) + localIndex;
                const tipoLabel = formatParteTipoLabel(parte.tipo);

                return (
                  <div
                    key={parte.id ?? `${musica.id}-${index}`}
                    className={`musica-display-verse-16x9 musica-display-verse-16x9--reader ${parte.destaque ? "is-highlighted" : ""}`}
                  >
                    <div className="musica-display-verse-num" aria-hidden="true">{index + 1}</div>
                    <div className="musica-display-verse-content musica-display-verse-content--reader">
                      {parte.titulo && !isTituloSameasTipo(parte.titulo, tipoLabel) ? (
                        <h2 className="musica-display-verse-title">{parte.titulo}</h2>
                      ) : null}
                      <pre className="musica-display-verse-text">
                        {mostrarCifra ? parte.cifra : parte.conteudo}
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {hasMedia && !pipHidden ? (
          <div className="musica-display-video-overlay" role="dialog" aria-label="Vídeo da música">
            {musica.youtube_url ? (
              <iframe
                src={musica.youtube_url.replace("watch?v=", "embed/")}
                title="Vídeo da música"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <audio controls autoPlay>
                <source src={musica.audio_url ?? undefined} type="audio/mpeg" />
                Seu navegador não suporta reprodução de áudio.
              </audio>
            )}
          </div>
        ) : null}
      </main>
    );
  }

  return (
    <main className={`musica-page ${isDisplay ? "musica-page--display" : ""}`}>
      <section className="musica-hero public-hero-shell">
        <div className={`musica-reader-header ${showBranding ? "" : "musica-reader-header--compact"}`}>
          {showBranding ? (
            <div className="musica-brand-block">
              <div className="musica-brand-logo">
                <Image src={logoSrc} alt="Logo GEEF" width={190} height={76} priority />
              </div>
              <div>
                <p className="eyebrow">Institucional</p>
                <h1>{musica.titulo}</h1>
                <p className="musica-hero-subtitle">
                  {musica.autor}
                  {musica.tom ? ` • Tom ${musica.tom}` : ""}
                  {musica.versao ? ` • ${musica.versao}` : ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="musica-reader-title-only">
              <h1>{musica.titulo}</h1>
              <p className="musica-hero-subtitle">
                {musica.autor}
                {musica.tom || musica.versao ? " •" : ""}
                {musica.tom ? ` Tom ${musica.tom}` : ""}
                {musica.versao ? ` • ${musica.versao}` : ""}
              </p>
            </div>
          )}

          <div className="musica-reader-actions">
            {displayCode && !isDisplay ? <span className="musica-code-pill">Pareamento {displayCode}</span> : null}
            {showBackLink ? (
              <Link href="/musicas" className="button button-secondary musica-icon-button" aria-label="Voltar ao catálogo" title="Voltar ao catálogo">
                <IconArrowLeft size={18} />
              </Link>
            ) : null}
            {!isDisplay ? (
              <button
                onClick={() => window.print()}
                className="button button-secondary musica-icon-button"
                aria-label="Imprimir música"
                title="Imprimir música"
              >
                <IconPrinter size={18} />
              </button>
            ) : null}
            {!isDisplay && hasMedia ? (
              <button
                type="button"
                onClick={() => setPipHidden((hidden) => !hidden)}
                className="button button-secondary musica-icon-button"
                aria-label={pipHidden ? "Exibir clipe" : "Ocultar clipe"}
                title={pipHidden ? "Exibir clipe" : "Ocultar clipe"}
              >
                {pipHidden ? "▶" : "■"}
              </button>
            ) : null}
            {!isDisplay && showLiveAction ? (
              <MusicaExibicaoPublicaButton musicaId={musica.id} isAtiva={isExibicaoPublicaAtiva} />
            ) : null}
            {!isDisplay && podeAlternarCifra ? (
              <button
                onClick={() => setViewMode(viewMode === "letra" ? "cifra" : "letra")}
                className="button button-secondary musica-icon-button"
                aria-label={`Exibir ${viewMode === "letra" ? "cifra" : "letra"}`}
                title={`Exibir ${viewMode === "letra" ? "cifra" : "letra"}`}
              >
                🎼
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {!isDisplay && (
        <>
          <section className={`musica-reader-lyrics ${getLyricsMarginClass(publicReaderMetrics.lyricsMarginTop)}`}>
            <article
              ref={publicLyricsPanelRef}
              className="musica-reader-panel musica-reader-panel--lyrics musica-reader-panel--lyrics-full"
            >
              <div className="musica-letra-blocos">
                {partesVisiveis.map((parte, index) => {
                  return (
                    <section
                      key={parte.id ?? `${musica.id}-${index}`}
                      className={`musica-parte-musical ${parte.destaque ? "is-highlighted" : ""}`}
                    >
                      {parte.titulo && !isTituloSameasTipo(parte.titulo, formatParteTipoLabel(parte.tipo)) && (
                        <h3 className="musica-parte-title">{parte.titulo}</h3>
                      )}
                      {mostrarCifra && parte.cifra ? (
                        <pre className="musica-parte-text musica-parte-text--compact">
                          {parte.cifra}
                        </pre>
                      ) : (
                        <CifraLineRenderer text={parte.conteudo} hideChords={mostrarCifra} />
                      )}
                    </section>
                  );
                })}
              </div>
            </article>
          </section>
          {hasMedia && (
            <>
              {/* PiP Widget */}
              <div
                className={`musica-pip-widget ${pipHidden ? "is-hidden" : ""} ${pipExpanded ? "is-expanded" : ""}`}
              >
                <div className="musica-pip-content">
                  {musica.youtube_url && (
                    <iframe
                      width="100%"
                      height="100%"
                      src={musica.youtube_url.replace("watch?v=", "embed/")}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                  {!musica.youtube_url && musica.audio_url && (
                    <audio controls>
                      <source src={musica.audio_url} type="audio/mpeg" />
                      Seu navegador não suporta reprodução de áudio.
                    </audio>
                  )}
                </div>
                <div className="musica-pip-controls">
                  <button
                    onClick={() => setPipExpanded(true)}
                    className="musica-pip-btn"
                    aria-label="Expandir vídeo"
                    title="Expandir"
                  >
                    ⛶
                  </button>
                  <button
                    onClick={() => setPipHidden(true)}
                    className="musica-pip-btn"
                    aria-label="Minimizar vídeo"
                    title="Minimizar"
                  >
                    −
                  </button>
                </div>
              </div>

              {/* Modal expandida */}
              {pipExpanded && (
                <dialog
                  className="musica-pip-modal"
                  open
                  onClick={() => setPipExpanded(false)}
                >
                  <div className="musica-pip-modal-content" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setPipExpanded(false)}
                      className="musica-pip-modal-close"
                      aria-label="Fechar"
                    >
                      ✕
                    </button>
                    <div className="musica-pip-modal-frame">
                      {musica.youtube_url && (
                        <iframe
                          width="100%"
                          height="100%"
                          src={musica.youtube_url.replace("watch?v=", "embed/")}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                      {!musica.youtube_url && musica.audio_url && (
                        <audio controls>
                          <source src={musica.audio_url} type="audio/mpeg" />
                          Seu navegador não suporta reprodução de áudio.
                        </audio>
                      )}
                    </div>
                  </div>
                </dialog>
              )}
            </>
          )}
        </>
      )}

      <style jsx>{`
        @media print {
          .musica-hero-actions,
          .musica-reader-panel--summary,
          .musica-reader-panel--media {
            display: none;
          }
          .musica-reader-top-grid {
            display: block;
          }
          .musica-reader-panel {
            max-width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
