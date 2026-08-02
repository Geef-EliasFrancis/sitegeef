import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { withTimeout } from '@/lib/admin/safe-supabase';
import { AdminHeader } from '@/components/admin/admin-header';
import { NotificationFlashBridge } from '@/components/notification-flash-bridge';
import { getRequestLocale } from '@/lib/multilingual/server';
import '@/styles/admin.css';

export const metadata = {
  title: 'Admin - GEEF',
  description: 'Painel administrativo para gestão de escalas',
};

export const dynamic = 'force-dynamic';

type AdminAuthUser = {
  id: string;
  email: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: {
    full_name?: string;
    name?: string;
  } | null;
};

type AdminAuthResult = {
  data: {
    user: AdminAuthUser | null;
  };
  error: unknown | null;
};

type UsuarioSistemaRow = {
  perfil: string;
  pode_mediunidade: boolean;
  pode_escalas: boolean;
  pode_biblioteca: boolean;
  pode_livraria: boolean;
  pode_financeiro: boolean;
  pode_pessoas: boolean;
  pode_publicar: boolean;
  pode_atendimento: boolean;
  pode_apse: boolean;
};

type UsuarioSistemaResult = {
  data: UsuarioSistemaRow | null;
  error: unknown | null;
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  const supabase = await createClient();
  let user: AdminAuthUser | null = null;

  try {
    const authResult = await withTimeout(
      supabase.auth.getUser() as PromiseLike<AdminAuthResult>,
      4500,
      { data: { user: null }, error: null },
    );
    user = authResult.data.user;
  } catch (error) {
    console.error('Falha ao obter usuário autenticado no AdminLayout:', error);
    redirect('/login?next=/admin');
  }

  if (!user) {
    redirect('/login?next=/admin');
  }

  const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;
  const isAdminViaAuth = appMetadata.site_role === 'administrador';

  // Verificar se o usuário tem acesso ao admin
  let usuarioSistema = null;

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('usuarios_sistema')
        .select('perfil, pode_mediunidade, pode_escalas, pode_biblioteca, pode_livraria, pode_financeiro, pode_pessoas, pode_publicar, pode_atendimento, pode_apse')
        .eq('id', user.id)
        .maybeSingle() as PromiseLike<UsuarioSistemaResult>,
      4500,
      { data: null, error: null },
    );

    if (!error) {
      usuarioSistema = data;
    }
  } catch (error) {
    usuarioSistema = null;
  }

  if (!usuarioSistema && !isAdminViaAuth) {
    return (
      <div className="admin-access-denied">
        <div className="admin-access-denied-content">
          <h1>Acesso Negado</h1>
          <p className="text-center-muted">
            Você não tem permissão para acessar o painel administrativo.
          </p>
          <Link href="/" className="text-primary">
            Voltar para home
          </Link>
        </div>
      </div>
    );
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email ||
    'Usuário';

  return (
    <div className="admin-layout">
      <Suspense fallback={null}>
        <NotificationFlashBridge />
      </Suspense>
      <AdminHeader
        locale={locale}
        user={{ email: user.email ?? undefined, fullName: displayName }}
      />
      <div className="admin-container">
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
