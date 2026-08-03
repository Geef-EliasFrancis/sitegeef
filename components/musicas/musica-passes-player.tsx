"use client";

import { useEffect, useRef, useState } from "react";
import type { MusicaPasse } from "@/lib/musica-passes";

export function MusicaPassesPlayer({ items }: { items: MusicaPasse[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const continuePlaylistRef = useRef(false);
  const [index, setIndex] = useState(0);
  const current = items[index];
  const hasItems = items.length > 0;

  const selectPrevious = () => setIndex((value) => (value - 1 + items.length) % items.length);
  const selectNext = () => setIndex((value) => (value + 1) % items.length);

  const advancePlaylist = () => {
    continuePlaylistRef.current = true;
    selectNext();
  };

  useEffect(() => { setIndex(0); }, [items]);

  useEffect(() => {
    if (!continuePlaylistRef.current || !audioRef.current) return;
    void audioRef.current.play().catch(() => {
      continuePlaylistRef.current = false;
    });
  }, [current?.id]);

  return (
    <div className="musica-passes-playlist">
      <div className={`musica-passes-player${hasItems ? "" : " musica-passes-player--empty"}`}>
        <div className="musica-passes-player-heading">
          <p className="musica-passes-current">{current?.titulo ?? "Nenhum áudio selecionado"}</p>
          <span className="musica-passes-count">{hasItems ? `${index + 1} de ${items.length}` : "Vazio"}</span>
        </div>
        <audio
          ref={audioRef}
          key={current?.id ?? "empty"}
          controls
          preload="auto"
          aria-label={current ? `Tocar ${current.titulo}` : "Player de passes vazio"}
          onPlay={() => { continuePlaylistRef.current = true; }}
          onPause={(event) => { if (!event.currentTarget.ended) continuePlaylistRef.current = false; }}
          onEnded={hasItems ? advancePlaylist : undefined}
          src={current?.audio_url}
        />
        <div className="musica-passes-controls" aria-label="Controles da playlist">
          <button type="button" className="musica-passes-control" onClick={selectPrevious} disabled={!hasItems} aria-label="Faixa anterior" title="Faixa anterior">←</button>
          <button type="button" className="musica-passes-control musica-passes-control--primary" onClick={advancePlaylist} disabled={!hasItems} aria-label="Próxima faixa" title="Próxima faixa">→</button>
        </div>
        {!hasItems ? <p className="musica-passes-empty-copy">Nenhum áudio cadastrado ainda.</p> : null}
      </div>

      <div className="musica-passes-list" aria-label="Playlist ativa">
        <div className="musica-passes-list-heading">
          <h2>Playlist ativa</h2>
          <span>{items.length} {items.length === 1 ? "áudio" : "áudios"}</span>
        </div>
        {hasItems ? items.map((item, itemIndex) => (
          <button
            type="button"
            key={item.id}
            className={`musica-passes-track${itemIndex === index ? " musica-passes-track--active" : ""}`}
            onClick={() => setIndex(itemIndex)}
            aria-current={itemIndex === index ? "true" : undefined}
          >
            <span className="musica-passes-track-number">{String(itemIndex + 1).padStart(2, "0")}</span>
            <span className="musica-passes-track-title">{item.titulo}</span>
            <span className="musica-passes-track-action">{itemIndex === index ? "Tocando" : "Ouvir"}</span>
          </button>
        )) : <p className="musica-passes-list-empty">A playlist aparecerá aqui quando houver áudios ativos.</p>}
      </div>
    </div>
  );
}
