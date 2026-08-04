"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from "@/app/login/actions";
import { LgpdFormNotice } from "@/components/lgpd/lgpd-form-notice";
import type { Locale } from "@/lib/multilingual/client";

type LoginFormProps = {
  nextUrl?: string;
  locale?: Locale;
  initialError?: string;
};

export function LoginForm({ nextUrl = "/minha-area", locale = "pt", initialError }: LoginFormProps) {
  const searchParams = useSearchParams();
  const resolvedNextUrl = searchParams?.get("next") || nextUrl;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [termosUso, setTermosUso] = useState(false);
  const [politicaPrivacidade, setPoliticaPrivacidade] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState(false);
  const [marketingWhatsApp, setMarketingWhatsApp] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signInWithEmail(email, password, resolvedNextUrl);
        if (result?.error) {
          setError(result.error);
        }
      } else {
        if (!nomeCompleto.trim()) {
          setError(locale === "en" ? "Full name is required" : "Nome completo é obrigatório");
          return;
        }
        if (!termosUso || !politicaPrivacidade) {
          setError(locale === "en" ? "Accept the terms and privacy notice to continue." : "Marque os termos e a ciência da privacidade para continuar.");
          return;
        }
        const result = await signUpWithEmail(email, password, nomeCompleto, {
          termosUso,
          politicaPrivacidade,
          marketingEmail,
          marketingWhatsApp,
        });
        if (result?.error) {
          setError(result.error);
        } else {
          setError(null);
          setEmail("");
          setPassword("");
          setNomeCompleto("");
          setTermosUso(false);
          setPoliticaPrivacidade(false);
          setMarketingEmail(false);
          setMarketingWhatsApp(false);
          alert(locale === "en" ? "Account created! Check your email to confirm." : "Cadastro realizado! Verifique seu email para confirmar.");
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError(locale === "en" ? "Request processing error" : "Erro ao processar requisição");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
      setError(null);
      setLoading(true);
    try {
      await signInWithGoogle(resolvedNextUrl);
    } catch (err) {
      setError(locale === "en" ? "Error connecting with Google" : "Erro ao conectar com Google");
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <LgpdFormNotice
        locale={locale}
        text={locale === "en"
          ? "We use your data for access, account confirmation and security records such as IP and login attempts."
          : "Usamos seus dados para acesso, confirmação de conta e registros de segurança como IP e tentativas de login."}
      />

      <div className="login-tabs">
        <button
          className={`login-tab ${isLogin ? "active" : ""}`}
          onClick={() => {
            setIsLogin(true);
            setError(null);
          }}
        >
          {locale === "en" ? "Sign in" : "Entrar"}
        </button>
        <button
          className={`login-tab ${!isLogin ? "active" : ""}`}
          onClick={() => {
            setIsLogin(false);
            setError(null);
          }}
        >
          {locale === "en" ? "Sign up" : "Cadastro"}
        </button>
      </div>

      <form onSubmit={handleEmailAuth} className="login-form">
        {error && (
          <div className="login-error">
            <p>{error}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">{locale === "en" ? "Email" : "Email"}</label>
          <input
            id="email"
            type="email"
            placeholder={locale === "en" ? "you@email.com" : "seu@email.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="nomeCompleto">{locale === "en" ? "Full name" : "Nome completo"}</label>
            <input
              id="nomeCompleto"
              type="text"
              placeholder={locale === "en" ? "Your full name" : "Seu nome completo"}
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {!isLogin && (
          <div className="lgpd-consent-stack">
            <label className="lgpd-consent-check">
              <input
                type="checkbox"
                checked={termosUso}
                onChange={(event) => setTermosUso(event.target.checked)}
                disabled={loading}
              />
              <span>{locale === "en" ? "I have read and accept the Terms of Use." : "Li e aceito os Termos de Uso."}</span>
            </label>
            <label className="lgpd-consent-check">
              <input
                type="checkbox"
                checked={politicaPrivacidade}
                onChange={(event) => setPoliticaPrivacidade(event.target.checked)}
                disabled={loading}
              />
              <span>{locale === "en" ? "I acknowledge the Privacy Policy." : "Declaro ciência da Política de Privacidade."}</span>
            </label>
            <label className="lgpd-consent-check">
              <input
                type="checkbox"
                checked={marketingEmail}
                onChange={(event) => setMarketingEmail(event.target.checked)}
                disabled={loading}
              />
              <span>{locale === "en" ? "I want to receive communications by email." : "Quero receber comunicações por e-mail."}</span>
            </label>
            <label className="lgpd-consent-check">
              <input
                type="checkbox"
                checked={marketingWhatsApp}
                onChange={(event) => setMarketingWhatsApp(event.target.checked)}
                disabled={loading}
              />
              <span>{locale === "en" ? "I want to receive communications by WhatsApp." : "Quero receber comunicações por WhatsApp."}</span>
            </label>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">{locale === "en" ? "Password" : "Senha"}</label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={locale === "en" ? "••••••••" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              title={locale === "en" ? (showPassword ? "Hide password" : "Show password") : showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="login-actions-row">
          <button
            type="submit"
            className="button button-primary login-submit"
            disabled={loading}
          >
            {loading
              ? (locale === "en" ? "Processing..." : "Processando...")
              : isLogin
                ? (locale === "en" ? "Sign in" : "Entrar")
                : (locale === "en" ? "Create account" : "Cadastrar")}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="google-signin-btn login-google"
            disabled={loading}
            title={locale === "en" ? "Sign in with Google" : "Entrar com Google"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0)">
                <path d="M23.745 12.27c0-.79-.1-1.54-.257-2.27H12v4.51h6.236c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.586c2.09-1.93 3.29-4.74 3.29-8.09z" fill="#4285F4"/>
                <path d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 24 12 24z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 4.47 2.18 8.93l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </g>
            </svg>
            <span>{loading ? (locale === "en" ? "Connecting..." : "Conectando...") : "Google"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
