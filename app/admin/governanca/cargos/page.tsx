import Link from 'next/link';
import { getCargos } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Cargos - Admin GEEF',
};

type CargoItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  nivel?: string | null;
};

async function CargosContent() {
  const cargos = await getCargos();
  const cargoList = cargos as CargoItem[];

  return (
    <div>
      <AdminPageTitleAdd title="Cargos" href="/admin/governanca/cargos/novo" label="Adicionar cargo" />

      <div className="admin-card">
        {cargoList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Nível</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {cargoList.map((cargo) => (
                  <tr key={cargo.id}>
                    <td>
                      <strong>
                      {cargo.nome}
                      </strong>
                    </td>
                    <td className="text-sm-muted">
                      {cargo.descricao || '—'}
                    </td>
                    <td className="text-sm-muted">
                      {cargo.nivel ? (cargo.nivel === 'estrategico' ? '🎯 Estratégico' : cargo.nivel === 'operacional' ? '⚙️ Operacional' : '📋 Coordenação') : '—'}
                    </td>
                    <td>
                      <Link href={`/admin/governanca/cargos/${cargo.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center-muted">Nenhum cargo cadastrado.</p>
        )}
      </div>
    </div>
  );
}

export default function CargosPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <CargosContent />
    </Suspense>
  );
}
