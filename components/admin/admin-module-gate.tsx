import { redirect } from 'next/navigation';
import { getUserPermissions, type PermissionFlag } from '@/lib/auth/permissions';
import { AccessDenied } from '@/components/admin/access-denied';

type AdminModuleGateProps = {
  children: React.ReactNode;
  permission?: PermissionFlag;
  allowedPermissions?: PermissionFlag[];
  profiles?: string[];
  adminOnly?: boolean;
  redirectPath: string;
  title: string;
  message?: string;
};

export async function AdminModuleGate({
  children,
  permission,
  allowedPermissions,
  profiles,
  adminOnly = false,
  redirectPath,
  title,
  message = 'Acesso negado',
}: AdminModuleGateProps) {
  const permissions = await getUserPermissions();

  if (!permissions) {
    redirect(`/login?next=${encodeURIComponent(redirectPath)}`);
  }

  if (permissions.perfil === 'administrador') {
    return children;
  }

  if (adminOnly) {
    return <AccessDenied title={title} message={message} />;
  }

  if (profiles?.length && profiles.includes(permissions.perfil)) {
    return children;
  }

  if ((permission && permissions[permission]) || allowedPermissions?.some((item) => permissions[item])) {
    return children;
  }

  return <AccessDenied title={title} message={message} />;
}
