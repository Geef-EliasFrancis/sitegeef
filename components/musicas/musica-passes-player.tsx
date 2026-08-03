"use client";

import { useEffect, useState } from "react";
import type { MusicaPasse } from "@/lib/musica-passes";

export function MusicaPassesPlayer({ items }: { items: MusicaPasse[] }) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  useEffect(() => { setIndex(0); }, [items]);
  if (!current) {
    return (
      <div className="musica-passes-player musica-passes-player--empty">
        <p className="musica-passes-current">Player de passes</p>
        <audio controls preload="metadata" aria-label="Player de passes vazio" />
        <p className="musica-passes-count">Nenhum áudio cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="musica-passes-player">
      <p className="musica-passes-current">{current.titulo}</p>
      <audio
        key={current.id}
        controls
        preload="metadata"
        aria-label={`Tocar ${current.titulo}`}
        onEnded={() => setIndex((value) => (value + 1) % items.length)}
        src={current.audio_url}
      />
      {items.length > 1 ? <p className="musica-passes-count">Faixa {index + 1} de {items.length}</p> : null}
    </div>
  );
}
