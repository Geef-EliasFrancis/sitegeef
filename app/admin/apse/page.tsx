import Link from "next/link";
import { getFamilias, getCampanhas, getAtendimentos } from "./actions";
import { Suspense } from "react";

export const metadata = {
  title: "APSE - Admin GEEF",
};

type FamiliaItem = {
  status?: string | null;
};

type CampanhaItem = {
  id: string;
  nome: string;
  descricao?: string | null;
  meta?: string | number | null;
  status?: string | null;
};

async function ApseContent() {
  const familias = await getFamilias();
  const campanhas = await getCampanhas();
  const atendimentos = await getAtendimentos();
  const familiaList = familias as FamiliaItem[];
  const campanhaList = campanhas as CampanhaItem[];
  const campanhasAtivas = campanhaList.filter((c) => c.status === "planejada" || c.status === "em_execucao");

  const cards = [
    { label: "Famílias ativas", value: familiaList.filter((f) => f.status === "ativa").length },
    { label: "Campanhas ativas", value: campanhasAtivas.length },
    { label: "Atendimentos", value: atendimentos.length },
  ];

  const getStatusClass = (status?: string | null) => {
    if (status === "planejada") return "inline-status inline-status-primary";
    return "inline-status inline-status-info";
  };

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="area-subtitle">APSE</p>
            <h1 className="area-hero-title">Assistência Social</h1>
          </div>
        </div>
        <p className="area-subtitle">Gestão de famílias assistidas, campanhas e atendimentos.</p>
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
          <h2>Campanhas ativas</h2>
          <p>Campanhas em planejamento ou andamento.</p>
        </div>
        <div className="table-surface">
          {campanhasAtivas.length > 0 ? (
            <div className="module-grid grid-auto-300">
              {campanhasAtivas.map((campanha) => (
                <Link
                  key={campanha.id}
                  href={`/admin/apse/campanhas/${campanha.id}`}
                  className="module-card"
                >
                  <p className="module-title">{campanha.nome}</p>
                  <p>{campanha.descricao || "Sem descrição"}</p>
                  {campanha.meta && (
                    <p className="text-sm-muted mt-035">
                      Meta: {campanha.meta}
                    </p>
                  )}
                  <span className={`${getStatusClass(campanha.status)} mt-075`}>
                    {campanha.status === "planejada" ? "📋 Planejada" : "▶ Em execução"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="area-empty">Nenhuma campanha ativa.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ApsePage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <ApseContent />
    </Suspense>
  );
}
