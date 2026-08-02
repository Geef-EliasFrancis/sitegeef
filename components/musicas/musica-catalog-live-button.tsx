"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setMusicaExibicaoPublicaAction } from "@/app/admin/reuniao-publica/musica/actions";
import { IconBroadcast, IconExternalLink } from "@/components/icons";
import { showToast } from "@/components/ui/toast-notification";

type MusicaCatalogLiveButtonProps = {
  musicaId: string;
  isAtiva: boolean;
};

export function MusicaCatalogLiveButton({ musicaId, isAtiva }: MusicaCatalogLiveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (loading || isAtiva) {
      return;
    }

    setLoading(true);
    try {
      await setMusicaExibicaoPublicaAction(musicaId);
      showToast({
        variant: "success",
        message: "Música enviada para a exibição pública",
      });
      router.push("/musicas/exibir");
      router.refresh();
    } catch (error) {
      showToast({
        variant: "error",
        message: error instanceof Error ? error.message : "Não foi possível enviar a música para o ao vivo",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAtiva) {
    return (
      <Link
        href="/musicas/exibir"
        className="button button-secondary musica-catalog-live-button musica-catalog-live-button--active"
        aria-label="Abrir exibição pública"
        title="Abrir exibição pública"
      >
        <IconExternalLink size={14} />
        <span>Ao vivo</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleActivate}
      disabled={loading}
      className="button button-secondary musica-catalog-live-button"
      aria-label="Enviar para ao vivo"
      title="Enviar para ao vivo"
    >
      <IconBroadcast size={14} />
      <span>{loading ? "Enviando..." : "Ao vivo"}</span>
    </button>
  );
}
