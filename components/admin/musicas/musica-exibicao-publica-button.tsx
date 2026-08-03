"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setMusicaExibicaoPublicaAction } from "@/app/admin/reuniao-publica/musica/actions";
import { IconBroadcast } from "@/components/icons";
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
        message: "Exibição pública atualizada",
      });
      router.refresh();
    } catch (error) {
      showToast({
        variant: "error",
        message: error instanceof Error ? error.message : "Não foi possível atualizar a exibição pública",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAtiva) {
    return (
      <Link
        href="/reuniao-publica/musicas/exibir"
        className="inline-status inline-status-success musica-public-toggle-badge musica-public-toggle-link"
        aria-label="Abrir exibição pública"
        title="Abrir exibição pública"
      >
        <IconBroadcast className="musica-public-live-icon" size={15} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleActivate}
      disabled={loading}
      className="admin-btn admin-btn-small musica-public-toggle-button"
      aria-label={loading ? "Ativando exibição pública" : "Tornar música ao vivo"}
      title={loading ? "Ativando exibição pública" : "Tornar música ao vivo"}
    >
      <IconBroadcast className="musica-public-live-icon" size={15} />
      <span>{loading ? "Ativando..." : "Tornar ao vivo"}</span>
    </button>
  );
}
