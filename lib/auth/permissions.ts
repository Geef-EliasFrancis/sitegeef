import { createClient } from '@/lib/supabase/server';

export type PermissionFlag =
  | 'pode_escalas'
  | 'pode_biblioteca'
  | 'pode_livraria'
  | 'pode_financeiro'
  | 'pode_pessoas'
  | 'pode_publicar'
  | 'pode_mediunidade'
  | 'pode_atendimento'
  | 'pode_apse';

export async function getUserPermissions() {
  const supabase = await createClient();
  let user = null;

  try {
    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
  } catch (_error) {
    return null;
  }

  if (!user) {
    return null;
  }

  try {
    const { data: usuarioSistema } = await supabase
      .from('usuarios_sistema')
      .select('id, pessoa_id, perfil, pode_escalas, pode_biblioteca, pode_livraria, pode_financeiro, pode_pessoas, pode_publicar, pode_mediunidade, pode_atendimento, pode_apse')
      .eq('id', user.id)
      .maybeSingle();

    if (usuarioSistema) {
      return usuarioSistema;
    }
  } catch (error) {
    void error;
  }

  const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;
  const siteRole = typeof appMetadata.site_role === 'string' ? appMetadata.site_role : null;

  return {
    id: user.id,
    pessoa_id: null,
    perfil: siteRole ?? 'publico',
    pode_escalas: appMetadata.pode_escalas === true,
    pode_biblioteca: appMetadata.pode_biblioteca === true,
    pode_livraria: appMetadata.pode_livraria === true,
    pode_financeiro: appMetadata.pode_financeiro === true,
    pode_pessoas: appMetadata.pode_pessoas === true,
    pode_publicar: appMetadata.pode_publicar === true,
    pode_mediunidade: appMetadata.pode_mediunidade === true,
    pode_atendimento: appMetadata.pode_atendimento === true,
    pode_apse: appMetadata.pode_apse === true,
  };
}

export async function requirePermission(permission: PermissionFlag, _redirectPath = '/admin') {
  const permissions = await getUserPermissions();

  if (!permissions || !permissions[permission]) {
    throw new Error(`Access denied: ${permission} required`);
  }

  return permissions;
}

export async function checkPermission(permission: PermissionFlag): Promise<boolean> {
  const permissions = await getUserPermissions();
  return permissions ? permissions[permission] === true : false;
}

export async function checkModuleAccess(permission: PermissionFlag, profiles: string[] = []): Promise<boolean> {
  const permissions = await getUserPermissions();
  if (!permissions) return false;
  if (permissions.perfil === 'administrador') return true;
  return profiles.includes(permissions.perfil) || permissions[permission] === true;
}
