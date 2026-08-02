"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconArrowLeft, IconArrowRight, IconMaximize, IconMusic } from "@/components/icons";

type Aviso = {
  id: string;
  titulo: string;
  conteudo?: string | null;
};

type PresentationProps = {
  avisos: Aviso[];
};

export function ReuniaoPublicaPresentation({ avisos }: PresentationProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = useMemo(() => [
    { id: "abertura", label: "Abertura" },
    { id: "musicas", label: "Músicas ao vivo" },
    { id: "inicio", label: "Início da reunião" },
    { id: "avisos", label: "Avisos da reunião" },
  ], []);

  function goToSlide(index: number) {
    setSlideIndex(Math.min(Math.max(index, 0), slides.length - 1));
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void document.documentElement.requestFullscreen?.();
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (["ArrowRight", "PageDown", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        setSlideIndex((current) => Math.min(current + 1, slides.length - 1));
      } else if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) {
        event.preventDefault();
        setSlideIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === "Home") {
        event.preventDefault();
        setSlideIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setSlideIndex(slides.length - 1);
      } else if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  const slide = slides[slideIndex];

  return (
    <main className="reuniao-publica-presentation" aria-label="Apresentação da reunião pública">
      <div className="reuniao-publica-slide" aria-live="polite">
        {slide.id === "abertura" && (
          <div className="reuniao-publica-opening">
            <Image src="/brand/logo-oficial-transparent.png" alt="GEEF" width={540} height={234} priority />
            <p>Grupo de Estudos Espíritas Elias Francis</p>
          </div>
        )}

        {slide.id === "musicas" && (
          <div className="reuniao-publica-content">
            <span className="reuniao-publica-kicker">Reunião pública</span>
            <h1>Músicas ao vivo</h1>
            <p>Abra a playlist pública para acompanhar as músicas selecionadas.</p>
            <Link href="/musicas/exibir" target="_blank" rel="noreferrer" className="reuniao-publica-primary-action">
              <IconMusic size={22} /> Abrir músicas ao vivo
            </Link>
          </div>
        )}

        {slide.id === "inicio" && (
          <div className="reuniao-publica-content">
            <span className="reuniao-publica-kicker">Reunião pública</span>
            <h1>Início da reunião</h1>
            <p>Seja bem-vindo. Use as setas ou o controle para avançar a apresentação.</p>
          </div>
        )}

        {slide.id === "avisos" && (
          <div className="reuniao-publica-content reuniao-publica-content--wide">
            <span className="reuniao-publica-kicker">Reunião pública</span>
            <h1>Avisos da reunião</h1>
            {avisos.length > 0 ? (
              <div className="reuniao-publica-notices">
                {avisos.map((aviso) => (
                  <article key={aviso.id} className="reuniao-publica-notice">
                    <h2>{aviso.titulo}</h2>
                    {aviso.conteudo && <p>{aviso.conteudo}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <p>Nenhum aviso publicado para esta reunião.</p>
            )}
          </div>
        )}
      </div>

      <div className="reuniao-publica-controls" aria-label="Controles da apresentação">
        <button type="button" onClick={() => goToSlide(slideIndex - 1)} disabled={slideIndex === 0} aria-label="Página anterior" title="Página anterior">
          <IconArrowLeft size={20} />
        </button>
        <span>{slideIndex + 1} / {slides.length} · {slide.label}</span>
        <button type="button" onClick={() => goToSlide(slideIndex + 1)} disabled={slideIndex === slides.length - 1} aria-label="Próxima página" title="Próxima página">
          <IconArrowRight size={20} />
        </button>
        <button type="button" onClick={toggleFullscreen} aria-label="Alternar tela cheia" title="Tela cheia (F)">
          <IconMaximize size={18} />
        </button>
      </div>
    </main>
  );
}
