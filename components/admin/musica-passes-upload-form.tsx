"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconPlus } from "@/components/icons";

export function MusicaPassesUploadForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [titulo, setTitulo] = useState("");
  const [hasAudio, setHasAudio] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/musica-passes", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error || "Não foi possível enviar o áudio.");
        return;
      }

      form.reset();
      setTitulo("");
      setHasAudio(false);
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor.");
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
      <button
        type="submit"
        className="admin-btn admin-btn-primary"
        title="Adicionar áudio"
        disabled={pending || !titulo.trim() || !hasAudio}
      >
        <IconPlus size={18} />
      </button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  );
}
