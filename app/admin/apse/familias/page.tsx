import Link from 'next/link';
import { getFamilias } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Famílias Assistidas - Admin GEEF',
};

export const dynamic = 'force-dynamic';

type FamiliaItem = {
  id: string;
  responsavel?: { nome?: string | null } | null;
  endereco?: string | null;
  membros?: number | null;
  situacao?: string | null;
  status?: string | null;
};

async function FamiliasContent() {
  const familias = (await getFamilias()) as FamiliaItem[];

  return (
    <div>
      <AdminPageTitleAdd title="Famílias Assistidas" href="/admin/apse/familias/nova" />

      <div className="admin-card">
        {familias.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Responsável</th>
                  <th>Endereço</th>
                  <th>Membros</th>
                  <th>Situação</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {familias.map((familia) => (
                  <tr key={familia.id}>
                    <td className="text-sm-500">{familia.responsavel?.nome}</td>
                    <td className="text-sm-muted">{familia.endereco || '—'}</td>
                    <td className="text-center-muted">{familia.membros}</td>
                    <td className="text-sm-muted">{familia.situacao || '—'}</td>
                    <td>
                      <span className={familia.status === 'ativa' ? 'inline-status inline-status-success' : 'inline-status inline-status-neutral'}>
                        {familia.status === 'ativa' ? '✓ Ativa' : '✕ Inativa'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/apse/familias/${familia.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center-muted">Nenhuma família cadastrada.</p>
        )}
      </div>
    </div>
  );
}

export default function FamiliasPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <FamiliasContent />
    </Suspense>
  );
}
