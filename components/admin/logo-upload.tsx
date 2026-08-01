'use client';

import { useState, useRef } from 'react';
import { uploadLogoAction } from '@/app/admin/instituicao/actions';
import { LgpdNotice } from '@/components/lgpd/lgpd-notice';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange?: (url: string) => void;
}

export function LogoUpload({ currentLogo, onLogoChange }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentLogo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo maior que 5MB');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsLoading(true);
    setError(undefined);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadLogoAction(formData);

      if (result.success && result.url) {
        onLogoChange?.(result.url);
      } else {
        setError(result.error || 'Erro ao fazer upload');
        setPreview(currentLogo);
      }
    } catch (err) {
      setError('Erro ao fazer upload');
      setPreview(currentLogo);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    setPreview(undefined);
    onLogoChange?.('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="logo-upload-container">
      <LgpdNotice
        title="Upload de imagem"
        text="A imagem enviada será usada apenas no cadastro da instituição e ficará disponível para edição administrativa."
        policyHref="/privacidade"
        policyLabel="Ler política"
        contactHref="/lgpd"
        contactLabel="Canal LGPD"
        className="lgpd-upload-notice"
      />

      <div className="logo-upload-preview">
        {preview ? (
          <img src={preview} alt="Logo preview" />
        ) : (
          <span className="logo-upload-empty">Nenhuma logo</span>
        )}
      </div>

      {error && <div className="logo-upload-error">{error}</div>}

      <div className="logo-upload-actions">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="logo-upload-btn logo-upload-btn-primary"
        >
          {isLoading ? 'Enviando...' : preview ? 'Trocar logo' : 'Fazer upload'}
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="logo-upload-btn logo-upload-btn-danger"
          >
            Remover
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="logo-upload-input"
      />
    </div>
  );
}
