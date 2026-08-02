import { AdminModuleGate } from '@/components/admin/admin-module-gate';

export const metadata = {
  title: 'Reunião pública - Admin GEEF',
};

export default function ReuniaoPublicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminModuleGate
      permission="pode_publicar"
      profiles={['diretoria', 'secretaria', 'comunicacao']}
      redirectPath="/admin/reuniao-publica"
      title="Reunião pública"
    >
      {children}
    </AdminModuleGate>
  );
}
