"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MusicaDisplayRouteSync() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isMusicDisplayRoute = pathname.startsWith("/reuniao-publica/musicas/exibir") || pathname.startsWith("/musicas/exibir");
    const isMeetingDisplayRoute = pathname === "/reuniao-publica/live";

    if (isMusicDisplayRoute) {
      root.classList.add("musica-display-route");
      body.classList.add("musica-display-route");
    } else {
      root.classList.remove("musica-display-route");
      body.classList.remove("musica-display-route");
    }

    if (isMeetingDisplayRoute) {
      root.classList.add("reuniao-publica-display-route");
      body.classList.add("reuniao-publica-display-route");
    } else {
      root.classList.remove("reuniao-publica-display-route");
      body.classList.remove("reuniao-publica-display-route");
    }

    return () => {
      root.classList.remove("musica-display-route");
      body.classList.remove("musica-display-route");
      root.classList.remove("reuniao-publica-display-route");
      body.classList.remove("reuniao-publica-display-route");
    };
  }, [pathname]);

  return null;
}
