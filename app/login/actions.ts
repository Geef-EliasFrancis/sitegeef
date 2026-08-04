"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin } from "@/lib/security";
import { invalidateUserAreaCache } from "@/lib/areas/invalidate-user-area";
import { recordLgpdEvents } from "@/lib/lgpd/persistence";
import { LGPD_VERSIONS } from "@/lib/lgpd/constants";
import { recordActionFailureEvent, recordSupabaseFailureEvent } from "@/lib/observability";
import { isEmailAllowlisted, normalizeAllowlistEmail } from "@/lib/auth/allowlist";

async function getRequestHeadersOrigin() {
  const requestHeaders = await headers();
  return getAppOrigin(requestHeaders);
}

export async function signInWithEmail(email: string, password: string, nextUrl = "/minha-area") {
  const supabase = await createClient();
  const normalizedEmail = normalizeAllowlistEmail(email);

  if (!(await isEmailAllowlisted(normalizedEmail))) {
    return { error: "Este email não está autorizado para acessar o GEEF." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    await recordActionFailureEvent({
      source: "auth/signin",
      action: "signInWithEmail",
      message: "Falha ao autenticar usuário por email.",
      error,
      level: "warn",
      payload: { emailDomain: normalizedEmail.split("@")[1] ?? null },
    });
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(nextUrl);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  nomeCompleto: string,
  consentimentos?: {
    termosUso: boolean;
    politicaPrivacidade: boolean;
    marketingEmail?: boolean;
    marketingWhatsApp?: boolean;
  }
) {
  const supabase = await createClient();
  const normalizedEmail = normalizeAllowlistEmail(email);
  const normalizedName = nomeCompleto.trim().slice(0, 120);

  if (!consentimentos?.termosUso || !consentimentos?.politicaPrivacidade) {
    return { error: "É necessário aceitar os Termos de Uso e a Política de Privacidade." };
  }

  if (!(await isEmailAllowlisted(normalizedEmail))) {
    return { error: "Este email não está autorizado para criar uma conta no GEEF." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: normalizedName,
      },
    },
  });

  if (error) {
    await recordActionFailureEvent({
      source: "auth/signup",
      action: "signUpWithEmail",
      message: "Falha ao criar conta por email.",
      error,
      payload: { emailDomain: normalizedEmail.split("@")[1] ?? null },
    });
    return { error: error.message };
  }

  if (data.user) {
    const { error: usersError } = await supabase
      .from("usuarios_sistema")
      .insert({
        id: data.user.id,
        perfil: "publico",
        pode_escalas: false,
        pode_biblioteca: false,
        pode_livraria: false,
        pode_financeiro: false,
        pode_pessoas: false,
        pode_publicar: false,
        pode_mediunidade: false,
        pode_atendimento: false,
        pode_apse: false,
      });

    if (usersError) {
      await recordSupabaseFailureEvent({
        source: "auth/signup",
        operation: "insert usuarios_sistema",
        table: "usuarios_sistema",
        error: usersError,
        fallback: "null",
        level: "warn",
        payload: { userId: data.user.id },
      });
    }

    if (consentimentos?.termosUso || consentimentos?.politicaPrivacidade || consentimentos?.marketingEmail || consentimentos?.marketingWhatsApp) {
      await recordLgpdEvents(
        [
          consentimentos?.termosUso
            ? {
                categoria: "termos_uso",
                acao: "aceitar_termos",
                status: "aceito",
                versao: LGPD_VERSIONS.terms,
                origem: "auth/signup",
                canal: "web",
                userId: data.user.id,
                escopo: { signup: true },
              }
            : null,
          consentimentos?.politicaPrivacidade
            ? {
                categoria: "privacidade",
                acao: "ciencia_privacidade",
                status: "ciencia",
                versao: LGPD_VERSIONS.privacy,
                origem: "auth/signup",
                canal: "web",
                userId: data.user.id,
                escopo: { signup: true },
              }
            : null,
          consentimentos?.marketingEmail
            ? {
                categoria: "marketing",
                acao: "opt_in_email",
                status: "aceito",
                versao: LGPD_VERSIONS.privacy,
                origem: "auth/signup",
                canal: "web",
                userId: data.user.id,
                escopo: { channel: "email" },
              }
            : null,
          consentimentos?.marketingWhatsApp
            ? {
                categoria: "whatsapp",
                acao: "opt_in_whatsapp",
                status: "aceito",
                versao: LGPD_VERSIONS.privacy,
                origem: "auth/signup",
                canal: "web",
                userId: data.user.id,
                escopo: { channel: "whatsapp" },
              }
            : null,
        ].filter(Boolean) as Parameters<typeof recordLgpdEvents>[0]
      );
    }
  }

  return { success: true };
}

export async function signInWithGoogle(nextUrl = "/minha-area") {
  const supabase = await createClient();
  const appOrigin = await getRequestHeadersOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appOrigin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
    },
  });

  if (error) {
    await recordActionFailureEvent({
      source: "auth/google",
      action: "signInWithGoogle",
      message: "Falha ao iniciar login com Google.",
      error,
    });
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/painel", "layout");
    revalidatePath("/minha-area", "layout");
    revalidatePath("/perfil", "layout");
    redirect("/");
  } catch (error) {
    await recordActionFailureEvent({
      source: "auth/logout",
      action: "signOut",
      message: "Falha ao encerrar a sessão.",
      error,
    });
    redirect("/");
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const nomeCompleto = formData.get("nome_completo") as string;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: nomeCompleto,
    },
  });

  if (authError) {
    await recordActionFailureEvent({
      source: "auth/profile",
      action: "updateProfile",
      message: "Falha ao atualizar dados do perfil no provedor de autenticação.",
      error: authError,
    });
    throw new Error(authError.message);
  }

  // Also update profiles table if it exists
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      nome_completo: nomeCompleto,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    await recordSupabaseFailureEvent({
      source: "auth/profile",
      operation: "update profiles",
      table: "profiles",
      error: profileError,
      fallback: "null",
      level: "warn",
      payload: { userId: user.id },
    });
    // Don't throw - this is not critical if profiles table doesn't exist yet
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  invalidateUserAreaCache();
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("avatar") as File;

  if (!file) {
    throw new Error("Nenhum arquivo selecionado");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  const fileName = `${user.id}/avatar-${Date.now()}`;

  const { error: uploadError, data: uploadData } = await supabase.storage
    .from("avatares")
    .upload(fileName, file, {
      upsert: true,
    });

  if (uploadError) {
    await recordActionFailureEvent({
      source: "auth/avatar",
      action: "uploadAvatar",
      message: "Falha no upload do avatar.",
      error: uploadError,
      payload: {
        status: (uploadError as any).status,
        statusCode: (uploadError as any).statusCode,
      },
    });
    throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from("avatares")
    .getPublicUrl(fileName);

  // Update user metadata with avatar URL
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      avatar_url: data.publicUrl,
    },
  });

  if (authError) {
    await recordActionFailureEvent({
      source: "auth/avatar",
      action: "uploadAvatar",
      message: "Falha ao atualizar o avatar no provedor de autenticação.",
      error: authError,
    });
    throw new Error(authError.message);
  }

  // Also update profiles table if it exists
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: data.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    await recordSupabaseFailureEvent({
      source: "auth/avatar",
      operation: "update profiles avatar_url",
      table: "profiles",
      error: profileError,
      fallback: "null",
      level: "warn",
      payload: { userId: user.id },
    });
    // Don't throw - this is not critical if profiles table doesn't exist
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  invalidateUserAreaCache();
}
