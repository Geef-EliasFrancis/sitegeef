"use client";

import { useEffect, useRef, useState } from "react";
import type { MusicaPasse } from "@/lib/musica-passes";

type RepeatMode = "off" | "one" | "all";

const WAVEFORM = [24, 38, 18, 48, 29, 61, 35, 52, 27, 72, 43, 31, 67, 39, 56, 23, 47, 74, 34, 58, 28, 45, 64, 36, 52, 26, 69, 42, 55, 30, 63, 40, 71, 33, 49, 25, 59, 76, 37, 53, 29, 62, 45, 68, 31, 50, 23, 57, 73, 35, 48, 27, 64, 41, 55, 30, 70, 38, 52, 24, 61, 44, 67, 32, 49, 26, 58, 75, 36, 53, 29, 63, 42, 69];

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function MusicaPassesPlayer({ items }: { items: MusicaPasse[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const continuePlaylistRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("all");
  const current = items[index];
  const hasItems = items.length > 0;

  const chooseNextIndex = () => {
    if (items.length < 2 || !shuffle) return (index + 1) % items.length;
    let next = index;
    while (next === index) next = Math.floor(Math.random() * items.length);
    return next;
  };

  const changeTrack = (nextIndex: number, autoplay = false) => {
    continuePlaylistRef.current = autoplay;
    setIndex(nextIndex);
    setCurrentTime(0);
  };

  const playNext = () => changeTrack(chooseNextIndex(), true);

  const playPrevious = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    changeTrack((index - 1 + items.length) % items.length, true);
  };

  const togglePlay = () => {
    if (!audioRef.current || !current) return;
    if (audioRef.current.paused) {
      continuePlaylistRef.current = true;
      void audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((mode) => mode === "all" ? "one" : mode === "one" ? "off" : "all");
  };

  const handleEnded = () => {
    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play();
      }
      return;
    }

    if (repeatMode === "off" && index === items.length - 1) {
      continuePlaylistRef.current = false;
      setIsPlaying(false);
      return;
    }

    playNext();
  };

  useEffect(() => {
    setIndex(0);
    setIsPlaying(false);
    continuePlaylistRef.current = false;
  }, [items]);

  useEffect(() => {
    if (!audioRef.current || !current) return;
    audioRef.current.load();
    if (continuePlaylistRef.current) {
      void audioRef.current.play().catch(() => {
        continuePlaylistRef.current = false;
        setIsPlaying(false);
      });
    }
  }, [current?.id]);

  const repeatLabel = repeatMode === "all" ? "Repetir todas as músicas" : repeatMode === "one" ? "Repetir esta música" : "Repetição desligada";

  return (
    <div className="musica-passes-playlist">
      <div className={`musica-passes-player${hasItems ? "" : " musica-passes-player--empty"}`}>
        <div className="musica-passes-player-heading">
          <p className="musica-passes-current">{current?.titulo ?? "Nenhum áudio selecionado"}</p>
          <span className="musica-passes-count">{hasItems ? `${index + 1} de ${items.length}` : "Vazio"}</span>
        </div>

        <div className="musica-passes-waveform" aria-hidden="true">
          {WAVEFORM.map((height, barIndex) => <span key={barIndex} style={{ height: `${height}%` }} />)}
        </div>

        <div className="musica-passes-progress-row">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (audioRef.current) audioRef.current.currentTime = value;
              setCurrentTime(value);
            }}
            disabled={!hasItems || !duration}
            aria-label="Progresso do áudio"
          />
          <span>{formatTime(duration)}</span>
        </div>

        <audio
          ref={audioRef}
          className="musica-passes-audio"
          preload="auto"
          aria-hidden="true"
          src={current?.audio_url}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => { continuePlaylistRef.current = true; setIsPlaying(true); }}
          onPause={(event) => { if (!event.currentTarget.ended) continuePlaylistRef.current = false; setIsPlaying(false); }}
          onEnded={hasItems ? handleEnded : undefined}
        />

        <div className="musica-passes-controls" aria-label="Controles da playlist">
          <button type="button" className={`musica-passes-control${shuffle ? " is-active" : ""}`} onClick={() => setShuffle((value) => !value)} disabled={!hasItems} aria-label="Aleatório" title="Aleatório">⤨</button>
          <button type="button" className="musica-passes-control" onClick={playPrevious} disabled={!hasItems} aria-label="Faixa anterior" title="Faixa anterior">◀</button>
          <button type="button" className="musica-passes-control musica-passes-control--play" onClick={togglePlay} disabled={!hasItems} aria-label={isPlaying ? "Parar" : "Reproduzir"} title={isPlaying ? "Parar" : "Reproduzir"}>{isPlaying ? "■" : "▶"}</button>
          <button type="button" className="musica-passes-control" onClick={playNext} disabled={!hasItems} aria-label="Próxima faixa" title="Próxima faixa">▶</button>
          <button type="button" className={`musica-passes-control${repeatMode !== "off" ? " is-active" : ""}`} onClick={toggleRepeat} disabled={!hasItems} aria-label={repeatLabel} title={repeatLabel}>{repeatMode === "one" ? "↻¹" : "↻"}</button>
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
            onClick={() => changeTrack(itemIndex, isPlaying)}
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
