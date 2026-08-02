import { useCallback, useEffect, useState } from "react";

export function useReuniaoPublicaNavigation(totalSlides: number, onFullscreen: () => void) {
  const [slideIndex, setSlideIndex] = useState(0);
  const goToSlide = useCallback((index: number) => setSlideIndex(Math.min(Math.max(index, 0), totalSlides - 1)), [totalSlides]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (["ArrowRight", "PageDown", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        setSlideIndex((current) => Math.min(current + 1, totalSlides - 1));
      } else if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) {
        event.preventDefault();
        setSlideIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === "Home") {
        event.preventDefault();
        setSlideIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setSlideIndex(totalSlides - 1);
      } else if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        onFullscreen();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onFullscreen, totalSlides]);

  return { slideIndex, goToSlide };
}
