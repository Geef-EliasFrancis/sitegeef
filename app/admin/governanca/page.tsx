import { getDiretorias, getCargos, getCargoOcupacoes, getAssembleias } from "./actions";
import { Suspense } from "react";

export const metadata = {
  title: "Governança - Admin GEEF",
};

type DiretoriaItem = {
  id: string;
  nome: string;
  status?: string | null;
};

type CargoOcupacaoItem = {
  id: string;
  diretoria_id?: string | null;
  status?: string | null;
  data_inicio?: string | null;
  pessoa?: { nome?: string | null } | null;
  cargo?: { nome?: string | null } | null;
};

async function GovernancaContent() {
  const diretorias = await getDiretorias();
  const cargos = await getCargos();
  const ocupacoes = await getCargoOcupacoes();
  const assembleias = await getAssembleias();
  const diretoriaList = diretorias as DiretoriaItem[];
  const ocupacaoList = ocupacoes as CargoOcupacaoItem[];
  const diretoriaAtiva = diretoriaList.find((d) => d.status === "ativa");

  const cards = [
    { label: "Diretorias", value: diretoriaList.length },
    { label: "Cargos cadastrados", value: cargos.length },
    { label: "Pessoas em cargo", value: ocupacaoList.filter((o) => o.status === "ativo").length },
    { label: "Assembleias", value: assembleias.length },
  ];

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="area-subtitle">Governança</p>
            <h1 className="area-hero-title">Governança</h1>
          </div>
        </div>
        <p className="area-subtitle">Gestão de diretorias, cargos e assembleias.</p>
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

      {diretoriaAtiva && (
        <section className="area-section">
          <div className="table-surface">
            <div className="area-section-title">
              <h2>Diretoria ativa: {diretoriaAtiva.nome}</h2>
              <p>Composição atual e ocupações em vigor.</p>
            </div>

            {ocupacaoList.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pessoa</th>
                    <th>Cargo</th>
                    <th>Data de início</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ocupacaoList
                    .filter((o) => o.diretoria_id === diretoriaAtiva.id && o.status === "ativo")
                    .map((ocupacao) => (
                      <tr key={ocupacao.id}>
                        <td>
                          <strong>{ocupacao.pessoa?.nome}</strong>
                        </td>
                        <td>{ocupacao.cargo?.nome}</td>
                        <td className="text-sm-muted">
                          {ocupacao.data_inicio ? new Date(ocupacao.data_inicio).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td><span className="inline-status inline-status-success">Ativo</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="area-empty">Nenhuma pessoa em cargo nesta diretoria.</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default function GovernancaPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <GovernancaContent />
    </Suspense>
  );
}
