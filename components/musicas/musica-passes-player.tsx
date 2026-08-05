"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MusicaPasse } from "@/lib/musica-passes";

type RepeatMode = "off" | "one" | "all";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function MusicaPassesPlayer({ items }: { items: MusicaPasse[] }) {
  const primaryAudioRef = useRef<HTMLAudioElement>(null);
  const secondaryAudioRef = useRef<HTMLAudioElement>(null);
  const audioRefs = useMemo(() => [primaryAudioRef, secondaryAudioRef] as const, []);
  const activeSlotRef = useRef<0 | 1>(0);
  const transitionRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextIndexRef = useRef<number | null>(null);
  const continuePlaylistRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [slotTracks, setSlotTracks] = useState<[number | null, number | null]>([0, null]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("all");
  const [volume, setVolume] = useState(0.8);
  const current = items[index];
  const hasItems = items.length > 0;
  const audioRef = audioRefs[activeSlot];

  const clearTransition = () => {
    if (transitionTimerRef.current) {
      clearInterval(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    transitionRef.current = false;
    nextIndexRef.current = null;
  };

  const pauseAllAudio = () => {
    clearTransition();
    audioRefs.forEach((ref, slot) => {
      const audio = ref.current;
      if (!audio) return;
      audio.pause();
      audio.volume = 1;
      if (slot !== activeSlotRef.current) audio.currentTime = 0;
    });
    continuePlaylistRef.current = false;
    setIsPlaying(false);
  };

  const chooseNextIndex = () => {
    if (items.length < 2 || !shuffle) return (index + 1) % items.length;
    let next = index;
    while (next === index) next = Math.floor(Math.random() * items.length);
    return next;
  };

  const changeTrack = (nextIndex: number, autoplay = false) => {
    pauseAllAudio();
    const nextSlot = activeSlotRef.current === 0 ? 1 : 0;
    activeSlotRef.current = nextSlot;
    setActiveSlot(nextSlot);
    setSlotTracks((tracks) => {
      const nextTracks: [number | null, number | null] = [...tracks];
      nextTracks[nextSlot] = nextIndex;
      nextTracks[nextSlot === 0 ? 1 : 0] = null;
      return nextTracks;
    });
    continuePlaylistRef.current = autoplay;
    setIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
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
    const playingAudio = audioRefs.find((ref) => ref.current && !ref.current.paused && !ref.current.ended)?.current;
    if (playingAudio) {
      pauseAllAudio();
      return;
    }
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
    if (transitionRef.current) return;

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
    audioRefs.forEach((ref) => ref.current?.pause());
    clearTransition();
    activeSlotRef.current = 0;
    setIndex(0);
    setActiveSlot(0);
    setSlotTracks([0, null]);
    setIsPlaying(false);
    continuePlaylistRef.current = false;
  }, [audioRefs, items]);

  useEffect(() => {
    const audio = audioRefs[activeSlot].current;
    if (!audio || !current) return;
    audio.volume = 1;
    audio.load();
    if (continuePlaylistRef.current) {
      void audio.play().catch(() => {
        continuePlaylistRef.current = false;
        setIsPlaying(false);
      });
    }
  }, [activeSlot, audioRef, audioRefs, current, current?.id]);

  useEffect(() => {
    const stopPlayback = () => {
      clearTransition();
      continuePlaylistRef.current = false;
      audioRefs.forEach((ref) => {
        const audio = ref.current;
        if (!audio) return;
        audio.pause();
        audio.volume = 1;
        audio.currentTime = 0;
      });
    };

    window.addEventListener("pagehide", stopPlayback);
    return () => {
      window.removeEventListener("pagehide", stopPlayback);
      stopPlayback();
    };
  }, [audioRefs]);

  const startTransition = (nextSlot: 0 | 1) => {
    if (transitionRef.current || nextIndexRef.current === null) return;
    const outgoing = audioRefs[activeSlotRef.current].current;
    const incoming = audioRefs[nextSlot].current;
    const nextIndex = nextIndexRef.current;
    if (!outgoing || !incoming || nextSlot === activeSlotRef.current) return;

    transitionRef.current = true;
    incoming.volume = 0;
    void incoming.play().catch(() => {
      clearTransition();
      playNext();
    });

    const startedAt = Date.now();
    const fadeDuration = 1200;
    transitionTimerRef.current = setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / fadeDuration);
      outgoing.volume = 1 - progress;
      incoming.volume = progress;

      if (progress < 1) return;
      if (transitionTimerRef.current) clearInterval(transitionTimerRef.current);
      transitionTimerRef.current = null;
      outgoing.pause();
      outgoing.currentTime = 0;
      activeSlotRef.current = nextSlot;
      setActiveSlot(nextSlot);
      setIndex(nextIndex);
      setCurrentTime(incoming.currentTime);
      setDuration(Number.isFinite(incoming.duration) ? incoming.duration : 0);
      transitionRef.current = false;
      nextIndexRef.current = null;
    }, 50);
  };

  const handleTimeUpdate = (slot: 0 | 1, event: React.SyntheticEvent<HTMLAudioElement>) => {
    if (slot !== activeSlotRef.current) return;
    const audio = event.currentTarget;
    setCurrentTime(audio.currentTime);

    if (repeatMode === "one" || transitionRef.current || !isPlaying || !Number.isFinite(audio.duration)) return;
    const remaining = audio.duration - audio.currentTime;
    if (remaining > 3 || nextIndexRef.current !== null) return;

    const nextIndex = chooseNextIndex();
    if (repeatMode === "off" && index === items.length - 1) return;
    const nextSlot = slot === 0 ? 1 : 0;
    nextIndexRef.current = nextIndex;
    setSlotTracks((tracks) => {
      const nextTracks: [number | null, number | null] = [...tracks];
      nextTracks[nextSlot] = nextIndex;
      return nextTracks;
    });

    const incoming = audioRefs[nextSlot].current;
    if (incoming?.readyState && incoming.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startTransition(nextSlot);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioRef, volume]);

  const repeatLabel = repeatMode === "all" ? "Repetir todas as músicas" : repeatMode === "one" ? "Repetir esta música" : "Repetição desligada";

  return (
    <div className="musica-passes-playlist">
      <div className={`musica-passes-player${hasItems ? "" : " musica-passes-player--empty"}`}>
        <div className="musica-passes-player-heading">
          <p className="musica-passes-current">{current?.titulo ?? "Nenhum áudio selecionado"}</p>
          <span className="musica-passes-count">{hasItems ? `${index + 1} de ${items.length}` : "Vazio"}</span>
        </div>

        <div className={`musica-passes-spiritual${isPlaying ? " is-playing" : ""}`} aria-label={isPlaying ? "Livro espiritual reproduzindo" : "Livro espiritual pausado"} role="img">
          <span className="musica-passes-spiritual-halo" />
          <span className="musica-passes-spiritual-particle musica-passes-spiritual-particle--one" />
          <span className="musica-passes-spiritual-particle musica-passes-spiritual-particle--two" />
          <span className="musica-passes-spiritual-particle musica-passes-spiritual-particle--three" />
          <span className="musica-passes-spiritual-book"><span /><span /></span>
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

        {audioRefs.map((ref, slot) => {
          const slotIndex = slotTracks[slot];
          return (
            <audio
              key={slot}
              ref={ref}
              className="musica-passes-audio"
              preload="auto"
              aria-hidden="true"
              src={slotIndex === null ? undefined : items[slotIndex]?.audio_url}
              onLoadedMetadata={(event) => {
                if (slot === activeSlotRef.current) setDuration(event.currentTarget.duration);
              }}
              onCanPlay={() => {
                if (transitionRef.current && slot !== activeSlotRef.current) startTransition(slot as 0 | 1);
              }}
              onTimeUpdate={(event) => handleTimeUpdate(slot as 0 | 1, event)}
              onPlay={() => { if (slot === activeSlotRef.current) { continuePlaylistRef.current = true; setIsPlaying(true); } }}
              onPause={(event) => { if (slot === activeSlotRef.current && !transitionRef.current && !event.currentTarget.ended) continuePlaylistRef.current = false; if (slot === activeSlotRef.current && !transitionRef.current) setIsPlaying(false); }}
              onEnded={hasItems && slot === activeSlotRef.current ? handleEnded : undefined}
            />
          );
        })}

        <div className="musica-passes-controls" aria-label="Controles da playlist">
          <button type="button" className={`musica-passes-control${shuffle ? " is-active" : ""}`} onClick={() => setShuffle((value) => !value)} disabled={!hasItems} aria-label="Aleatório" title="Aleatório">⤨</button>
          <button type="button" className="musica-passes-control" onClick={playPrevious} disabled={!hasItems} aria-label="Faixa anterior" title="Faixa anterior">◀</button>
          <button type="button" className="musica-passes-control musica-passes-control--play" onClick={togglePlay} disabled={!hasItems} aria-label={isPlaying ? "Parar" : "Reproduzir"} title={isPlaying ? "Parar" : "Reproduzir"}>{isPlaying ? "■" : "▶"}</button>
          <button type="button" className="musica-passes-control" onClick={playNext} disabled={!hasItems} aria-label="Próxima faixa" title="Próxima faixa">▶</button>
          <button type="button" className={`musica-passes-control${repeatMode !== "off" ? " is-active" : ""}`} onClick={toggleRepeat} disabled={!hasItems} aria-label={repeatLabel} title={repeatLabel}>{repeatMode === "one" ? "↻¹" : "↻"}</button>
          <label className="musica-passes-volume" title={`Volume ${Math.round(volume * 100)}%`}>
            <span aria-hidden="true">{volume === 0 ? "🔇" : "🔊"}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              disabled={!hasItems}
              aria-label={`Volume ${Math.round(volume * 100)}%`}
            />
            <span className="musica-passes-volume-value">{Math.round(volume * 100)}%</span>
          </label>
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
