import Link from 'next/link';
import { getTurmas, getCriancas } from './actions';
import { Suspense } from 'react';
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: 'Evangelização Infantil - Admin GEEF',
};

type TurmaItem = {
  id: string;
  nome: string;
  faixa_etaria?: string | null;
  horario?: string | null;
  sala?: string | null;
  capacidade?: number | null;
  status?: string | null;
};

async function EvangelizacaoContent() {
  const turmas = await getTurmas();
  const criancas = await getCriancas();
  const turmaList = turmas as TurmaItem[];
  const turmasAtivas = turmaList.filter((t) => t.status === 'ativa');

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Evangelização Infantil" href="/admin/evangelizacao/turmas/nova" label="Adicionar turma" />

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-label">Turmas ativas</span>
          <strong>{turmasAtivas.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Crianças</span>
          <strong>{criancas.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Total de turmas</span>
          <strong>{turmas.length}</strong>
        </article>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>Turmas ativas</h2>
          <p>Cards de acesso rápido para abrir cada turma.</p>
        </div>
        <div className="table-surface">
          {turmasAtivas.length > 0 ? (
            <div className="module-grid grid-auto-300">
              {turmasAtivas.map((turma) => (
                <Link key={turma.id} href={`/admin/evangelizacao/turmas/${turma.id}`} className="module-card">
                  <h3 className="module-title">{turma.nome}</h3>
                  <div className="tag-list">
                    <span className="tag">{turma.faixa_etaria}</span>
                    <span className="tag">{turma.horario}</span>
                  </div>
                  <p>{turma.sala} | cap: {turma.capacidade}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="area-empty">Nenhuma turma ativa. Crie uma para começar.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function EvangelizacaoPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <EvangelizacaoContent />
    </Suspense>
  );
}
