import Link from "next/link";
import { getCursos, getTurmas } from "./actions";
import { Suspense } from "react";

export const metadata = {
  title: "Estudos - Admin GEEF",
};

type CursoItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  ativo?: boolean | null;
};

type TurmaItem = {
  status?: string | null;
};

async function EstudosContent() {
  const cursos = await getCursos();
  const turmas = await getTurmas();
  const cursoList = cursos as CursoItem[];
  const turmaList = turmas as TurmaItem[];
  const turmasAtivas = turmaList.filter((t) => t.status === "em_andamento");

  const cards = [
    { label: "Cursos ativos", value: cursoList.filter((c) => c.ativo).length },
    { label: "Turmas em andamento", value: turmasAtivas.length },
    { label: "Total de turmas", value: turmaList.length },
  ];

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="area-subtitle">Estudos</p>
            <h1 className="area-hero-title">Estudos Doutrinários</h1>
          </div>
        </div>
        <p className="area-subtitle">Gestão de cursos e turmas de estudo.</p>
      </section>

      <section className="area-section">
        <div className="stat-grid">
          {cards.map((item) => (
            <div key={item.label} className="stat-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="area-section">
        <div className="area-section-title">
          <h2>Cursos disponíveis</h2>
          <p>Cards de acesso rápido para cada curso.</p>
        </div>
        <div className="table-surface">
          {cursoList.length > 0 ? (
            <div className="module-grid grid-auto-300">
              {cursoList.map((curso) => (
                <Link
                  key={curso.id}
                  href={`/admin/estudos/cursos/${curso.id}`}
                  className="module-card"
                >
                  <p className="module-title">{curso.nome}</p>
                  <p>{curso.descricao || "Sem descrição"}</p>
                  <span className={`inline-status ${curso.ativo ? "inline-status-success" : "inline-status-neutral"} mt-075`}>
                    {curso.ativo ? "✓ Ativo" : "✕ Inativo"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="area-empty">Nenhum curso cadastrado.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function EstudosPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <EstudosContent />
    </Suspense>
  );
}
