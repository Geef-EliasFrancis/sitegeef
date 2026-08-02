"use client";

import { useRef } from "react";
import { IconTrash } from "@/components/icons";
import { deleteMusicaAction } from "@/app/admin/reuniao-publica/musica/actions";

type DeleteMusicaButtonProps = {
  musicaId: string;
  musicaTitulo: string;
  iconOnly?: boolean;
};

export function DeleteMusicaButton({ musicaId, musicaTitulo, iconOnly }: DeleteMusicaButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleOpenDialog = () => {
    dialogRef.current?.showModal();
  };

  const handleCloseDialog = () => {
    dialogRef.current?.close();
  };

  const handleConfirmDelete = () => {
    const formData = new FormData();
    formData.set("id", musicaId);
    deleteMusicaAction(formData);
  };

  return (
    <>
      <button
        type="button"
        className={iconOnly ? "admin-btn admin-btn-secondary" : "profile-form-btn profile-form-btn-secondary profile-form-btn-danger"}
        onClick={handleOpenDialog}
        title={iconOnly ? "Excluir música" : undefined}
        aria-label={iconOnly ? "Excluir música" : undefined}
      >
        {iconOnly ? <IconTrash size={18} /> : "Excluir música"}
      </button>

      <dialog ref={dialogRef} className="delete-dialog">
        <div className="delete-dialog-content">
          <div>
            <h2 className="delete-dialog-title">Excluir música?</h2>
            <p className="delete-dialog-message">
              Tem certeza que deseja remover <strong>{musicaTitulo}</strong>? Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="delete-dialog-actions">
            <button
              type="button"
              className="profile-form-btn profile-form-btn-secondary"
              onClick={handleCloseDialog}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="profile-form-btn profile-form-btn-secondary profile-form-btn-danger"
              onClick={handleConfirmDelete}
            >
              Excluir definitivamente
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
