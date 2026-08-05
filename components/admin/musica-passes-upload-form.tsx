"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus } from "@/components/icons";

export function MusicaPassesUploadForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/musica-passes", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error || "Não foi possível enviar o áudio.");
        return;
      }

      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="musica-passes-admin-form">
      <input name="titulo" className="profile-form-input" placeholder="Título do áudio" required />
      <label className="musica-passes-file-field">
        <span>Selecionar MP3</span>
        <input name="audio" type="file" accept="audio/mpeg,.mp3" required />
      </label>
      <button type="submit" className="admin-btn admin-btn-primary" title="Adicionar áudio" disabled={pending}>
        <IconPlus size={18} />
      </button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  );
}
