"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconPlus } from "@/components/icons";

export function MusicaPassesUploadForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [titulo, setTitulo] = useState("");
  const [hasAudio, setHasAudio] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canSubmit = !pending && Boolean(titulo.trim()) && hasAudio;

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  function showToast(message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(""), 3200);
  }

  function getButtonHint() {
    if (pending) return "Enviando o áudio...";
    if (!titulo.trim() && !hasAudio) return "Digite o título e selecione um MP3 para ativar.";
    if (!titulo.trim()) return "Digite o título do áudio para ativar.";
    if (!hasAudio) return "Selecione um arquivo MP3 para ativar.";
    return "Clique para adicionar o áudio.";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError("");
    showToast("Enviando o áudio...");

    try {
      const response = await fetch("/api/admin/musica-passes", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        const message = result.error || "Não foi possível enviar o áudio.";
        setError(message);
        showToast(message);
        return;
      }

      form.reset();
      setTitulo("");
      setHasAudio(false);
      showToast("Áudio adicionado com sucesso.");
      router.refresh();
    } catch {
      const message = "Não foi possível conectar ao servidor.";
      setError(message);
      showToast(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="musica-passes-admin-form">
      <input
        name="titulo"
        className="profile-form-input"
        placeholder="Título do áudio"
        value={titulo}
        onChange={(event) => setTitulo(event.currentTarget.value)}
        required
      />
      <label className="musica-passes-file-field">
        <span>Selecionar MP3</span>
        <input
          name="audio"
          type="file"
          accept="audio/mpeg,.mp3"
          onChange={(event) => setHasAudio(Boolean(event.currentTarget.files?.length))}
          required
        />
      </label>
      <span className="musica-passes-upload-action" onMouseEnter={() => showToast(getButtonHint())}>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          title="Adicionar áudio"
          disabled={!canSubmit}
          onFocus={() => showToast(getButtonHint())}
        >
          <IconPlus size={18} />
        </button>
        {toast ? <span className="musica-passes-upload-toast" role="status" aria-live="polite">{toast}</span> : null}
      </span>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  );
}
