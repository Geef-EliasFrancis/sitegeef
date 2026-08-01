"use client";

import { useRef, useState } from "react";
import { uploadBrandAssetAction } from "@/app/admin/instituicao/actions";

type BrandAssetSlot = "logo_url" | "logo_com_fundo_url";

type BrandAssetUploadProps = {
  title: string;
  description: string;
  fieldName: BrandAssetSlot;
  currentAsset: string;
};

export function BrandAssetUpload({ title, description, fieldName, currentAsset }: BrandAssetUploadProps) {
  const [preview, setPreview] = useState<string>(currentAsset || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo maior que 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview((e.target?.result as string) || currentAsset || "");
    };
    reader.readAsDataURL(file);

    setIsLoading(true);
    setError(undefined);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slot", fieldName);
      formData.append("field_name", fieldName);

      const result = await uploadBrandAssetAction(formData);

      if (result.success && result.url) {
        setPreview(result.url);
      } else {
        setError(result.error || "Erro ao fazer upload");
        setPreview(currentAsset || "");
      }
    } catch {
      setError("Erro ao fazer upload");
      setPreview(currentAsset || "");
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    setPreview("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="brand-asset-upload">
      <div className="brand-asset-upload-head">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <div className="brand-asset-preview">
        {preview ? (
          <img src={preview} alt={title} />
        ) : (
          <span className="brand-asset-empty">Nenhuma imagem enviada</span>
        )}
      </div>

      <input type="hidden" name={fieldName} value={preview} />

      {error && <div className="brand-asset-error">{error}</div>}

      <div className="brand-asset-actions">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="brand-asset-btn brand-asset-btn-primary"
        >
          {isLoading ? "Enviando..." : preview ? "Trocar imagem" : "Enviar imagem"}
        </button>
        {preview ? (
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="brand-asset-btn"
          >
            Limpar
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="brand-asset-hidden"
      />
    </div>
  );
}
