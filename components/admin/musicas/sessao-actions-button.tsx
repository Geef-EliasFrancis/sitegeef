"use client";

import { useState } from "react";
import { IconPower, IconTrash, IconExternalLink, IconEdit } from "@/components/icons";
import Link from "next/link";
import type { MusicaSessao } from "@/lib/musicas";
import { setMusicaSessaoAtivaAction, deleteMusicaSessaoAction } from "@/app/admin/reuniao-publica/musica/actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { showToast } from "@/components/ui/toast-notification";

type SessaoActionsButtonProps = {
  sessao: MusicaSessao;
  onUpdate?: (sessao: MusicaSessao) => void;
  onDelete?: (codigo: string) => void;
};

export function SessaoActionsButton({ sessao: initialSessao, onUpdate, onDelete }: SessaoActionsButtonProps) {
  const [sessao, setSessao] = useState(initialSessao);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      const result = await setMusicaSessaoAtivaAction(sessao.codigo_pareamento, !sessao.ativo);
      setSessao(result);
      onUpdate?.(result);
      showToast({
        variant: "success",
        message: result.ativo ? "Sessão reativada" : "Sessão encerrada",
      });
    } catch (err) {
      showToast({
        variant: "error",
        message: err instanceof Error ? err.message : "Erro ao atualizar sessão",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteMusicaSessaoAction(sessao.codigo_pareamento);
      onDelete?.(sessao.codigo_pareamento);
      setDeleteConfirmOpen(false);
      showToast({
        variant: "success",
        message: "Sessão excluída com sucesso",
      });
    } catch (err) {
      showToast({
        variant: "error",
        message: err instanceof Error ? err.message : "Erro ao excluir sessão",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex-end-gap">
      <Link
        href={`/admin/reuniao-publica/musica/sessoes/novo?codigo=${sessao.codigo_pareamento}`}
        className="admin-btn admin-btn-small"
        title="Editar"
      >
        <IconEdit size={16} />
      </Link>
      <Link
        href="/musicas/controle"
        className="admin-btn admin-btn-small"
        target="_blank"
        rel="noreferrer"
        title="Controle ao vivo"
      >
        <IconExternalLink size={16} />
      </Link>
      <Link
        href="/musicas/exibir"
        className="admin-btn admin-btn-small"
        target="_blank"
        rel="noreferrer"
        title="Abrir exibição pública"
      >
        <IconExternalLink size={16} />
      </Link>
      <button
        onClick={handleToggleStatus}
        disabled={loading}
        className="admin-btn admin-btn-small admin-btn-danger"
        title={sessao.ativo ? "Encerrar sessão" : "Reativar sessão"}
      >
        <IconPower size={16} />
      </button>
      <button
        onClick={() => setDeleteConfirmOpen(true)}
        disabled={loading}
        className="admin-btn admin-btn-small admin-btn-danger"
        title="Excluir sessão"
      >
        <IconTrash size={16} />
      </button>

      <ConfirmModal
        title="Excluir sessão"
        message={`Tem certeza que deseja excluir a sessão ${sessao.codigo_pareamento}?`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isOpen={deleteConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
