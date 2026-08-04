import Link from 'next/link';
import { getAssembleias } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Assembleias - Admin GEEF',
};

type AssembleiaItem = {
  id: string;
  tipo?: string | null;
  data: string;
  pauta?: string | null;
  status?: string | null;
};

async function AssembleiasContent() {
  const assembleias = await getAssembleias();
  const assembleiaList = assembleias as AssembleiaItem[];

  const getTipoLabel = (tipo?: string | null) => {
    switch (tipo) {
      case 'AGO':
        return '📊 AGO';
      case 'AGE':
        return '📋 AGE';
      case 'reuniao_diretoria':
        return '👔 Reunião Diretoria';
      case 'reuniao_departamento':
        return '🏢 Reunião Departamento';
      default:
        return tipo || '—';
    }
  };

  return (
    <div>
      <AdminPageTitleAdd title="Assembleias" href="/admin/governanca/assembleias/nova" label="Adicionar assembleia" />

      <div className="admin-card">
        {assembleiaList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Pauta</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {assembleiaList.map((assembleia) => (
                  <tr key={assembleia.id}>
                    <td><strong>{getTipoLabel(assembleia.tipo)}</strong></td>
                    <td><strong className="text-sm-500">{new Date(assembleia.data).toLocaleDateString('pt-BR')}</strong></td>
                    <td className="text-sm-muted table-cell-truncate">
                      {assembleia.pauta ? assembleia.pauta.substring(0, 50) + '...' : '—'}
                    </td>
                    <td>
                      <span className={assembleia.status === 'rascunho' ? 'inline-status inline-status-neutral' : 'inline-status inline-status-success'}>
                        {assembleia.status === 'rascunho' ? '📝 Rascunho' : '✓ Finalizada'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/governanca/assembleias/${assembleia.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center-muted">Nenhuma assembleia registrada.</p>
        )}
      </div>
    </div>
  );
}

export default function AssembleiasPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <AssembleiasContent />
    </Suspense>
  );
}
