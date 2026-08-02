"use client";

import { useCallback } from "react";
import { IconArrowLeft, IconArrowRight, IconMaximize } from "@/components/icons";
import { ReuniaoPublicaSlide } from "@/components/reuniao-publica-slide";
import { useReuniaoPublicaNavigation } from "@/hooks/use-reuniao-publica-navigation";
import { REUNIAO_PUBLICA_SLIDES } from "@/lib/reuniao-publica-presentation";

type Aviso = {
  id: string;
  titulo: string;
  conteudo?: string | null;
};

type PresentationProps = {
  avisos: Aviso[];
};

export function ReuniaoPublicaPresentation({ avisos }: PresentationProps) {
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void document.documentElement.requestFullscreen?.();
  }, []);

  const { slideIndex, goToSlide } = useReuniaoPublicaNavigation(REUNIAO_PUBLICA_SLIDES.length, toggleFullscreen);

  const slide = REUNIAO_PUBLICA_SLIDES[slideIndex];

  return (
    <main className="reuniao-publica-presentation" aria-label="Apresentação da reunião pública">
      <div className="reuniao-publica-slide" aria-live="polite">
        <ReuniaoPublicaSlide slideId={slide.id} avisos={avisos} />
      </div>

      <div className="reuniao-publica-controls" aria-label="Controles da apresentação">
        <button type="button" onClick={() => goToSlide(slideIndex - 1)} disabled={slideIndex === 0} aria-label="Página anterior" title="Página anterior">
          <IconArrowLeft size={20} />
        </button>
        <span>{slideIndex + 1} / {REUNIAO_PUBLICA_SLIDES.length} · {slide.label}</span>
        <button type="button" onClick={() => goToSlide(slideIndex + 1)} disabled={slideIndex === REUNIAO_PUBLICA_SLIDES.length - 1} aria-label="Próxima página" title="Próxima página">
          <IconArrowRight size={20} />
        </button>
        <button type="button" onClick={toggleFullscreen} aria-label="Alternar tela cheia" title="Tela cheia (F)">
          <IconMaximize size={18} />
        </button>
      </div>
    </main>
  );
}
