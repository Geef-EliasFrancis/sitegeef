"use client";

import { useEffect, useRef, useState } from "react";
import type { MusicaPasse } from "@/lib/musica-passes";

export function MusicaPassesPlayer({ items }: { items: MusicaPasse[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const current = items[index];

  useEffect(() => { setIndex(0); }, [items]);
  if (!current) return <p className="area-empty">Nenhum áudio disponível.</p>;

  return <div className="musica-passes-player">
    <p className="musica-passes-current">{current.titulo}</p>
    <audio ref={audioRef} controls autoPlay onEnded={() => setIndex((value) => (value + 1) % items.length)} src={current.audio_url} />
    <p className="musica-passes-count">{index + 1} de {items.length}</p>
  </div>;
}
