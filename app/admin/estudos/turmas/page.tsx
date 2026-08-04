import Link from 'next/link';
import { getTurmas } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Turmas - Admin GEEF',
};

type TurmaListItem = {
  id: string;
  curso?: { nome?: string | null } | null;
  facilitador?: { nome?: string | null } | null;
  horario?: string | null;
  data_inicio: string;
  data_fim: string;
  status?: string | null;
};

async function TurmasContent() {
  const turmas = await getTurmas();
  const turmaList = turmas as TurmaListItem[];

  return (
    <div>
      <AdminPageTitleAdd title="Turmas de Estudo" href="/admin/estudos/turmas/nova" label="Adicionar turma" />

      <div className="admin-card">
        {turmaList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Facilitador</th>
                  <th>Horário</th>
                  <th>Período</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {turmaList.map((turma) => (
                  <tr key={turma.id}>
                    <td>
                      <strong>{turma.curso?.nome}</strong>
                    </td>
                    <td className="text-sm-muted">{turma.facilitador?.nome}</td>
                    <td className="text-sm-muted">{turma.horario}</td>
                    <td className="text-sm-muted">
                      {new Date(turma.data_inicio).toLocaleDateString('pt-BR')} a {new Date(turma.data_fim).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <span className={turma.status === 'em_andamento' ? 'inline-status inline-status-success' : 'inline-status inline-status-neutral'}>
                        {turma.status === 'em_andamento' ? '▶ Em andamento' : '✓ Finalizada'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/estudos/turmas/${turma.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center-muted">Nenhuma turma cadastrada.</p>
        )}
      </div>
    </div>
  );
}

export default function TurmasPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <TurmasContent />
    </Suspense>
  );
}
