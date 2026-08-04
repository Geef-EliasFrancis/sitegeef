import Link from 'next/link';
import { getTurmas } from '../actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Turmas - Admin GEEF',
};

type EvangelizacaoTurmaItem = {
  id: string;
  nome: string;
  faixa_etaria?: string | null;
  horario?: string | null;
  sala?: string | null;
  capacidade?: number | null;
  status?: string | null;
};

async function TurmasContent() {
  const turmas = await getTurmas();
  const turmaList = turmas as EvangelizacaoTurmaItem[];

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Turmas de Evangelização" href="/admin/evangelizacao/turmas/nova" label="Adicionar turma" />

      <section className="area-section">
        <div className="table-surface">
          {turmaList.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Faixa etária</th>
                  <th>Horário</th>
                  <th>Sala</th>
                  <th>Capacidade</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {turmaList.map((turma) => (
                  <tr key={turma.id}>
                    <td><strong>{turma.nome}</strong></td>
                    <td>{turma.faixa_etaria}</td>
                    <td>{turma.horario}</td>
                    <td className="text-sm-muted">{turma.sala}</td>
                    <td className="table-cell-center"><strong>{turma.capacidade}</strong></td>
                    <td>
                      <span className={turma.status === 'ativa' ? 'inline-status inline-status-success' : 'inline-status inline-status-neutral'}>
                        {turma.status === 'ativa' ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/evangelizacao/turmas/${turma.id}`} className="profile-form-btn profile-form-btn-secondary">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="area-empty">Nenhuma turma cadastrada.</div>
          )}
        </div>
      </section>
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
