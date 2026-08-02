"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setMusicaExibicaoPublicaAction } from "@/app/admin/reuniao-publica/musica/actions";
import { IconBroadcast, IconExternalLink } from "@/components/icons";
import { showToast } from "@/components/ui/toast-notification";

type MusicaExibicaoPublicaButtonProps = {
  musicaId: string;
  isAtiva: boolean;
};

export function MusicaExibicaoPublicaButton({ musicaId, isAtiva }: MusicaExibicaoPublicaButtonProps) {
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
        className="inline-status inline-status-success musica-public-toggle-badge musica-public-toggle-link"
        aria-label="Abrir exibição pública"
        title="Abrir exibição pública"
      >
        <span>Ao vivo</span>
        <IconExternalLink size={12} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleActivate}
      disabled={loading}
      className="button button-secondary musica-reader-live-button musica-reader-live-button--icon-only"
      aria-label="Jogar ao vivo"
      title="Jogar ao vivo"
    >
      <IconBroadcast size={15} />
    </button>
  );
}
