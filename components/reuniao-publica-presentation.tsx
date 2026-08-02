"use client";

import { useEffect, useMemo, useState } from "react";
import { IconArrowLeft, IconArrowRight, IconMaximize } from "@/components/icons";
import { ReuniaoPublicaSlide } from "@/components/reuniao-publica-slide";

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
        <ReuniaoPublicaSlide slideId={slide.id} avisos={avisos} />
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
