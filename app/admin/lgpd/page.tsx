import Link from "next/link";
import { loadLgpdAdminData } from "@/lib/lgpd/admin";

export const metadata = {
  title: "LGPD Central - Admin GEEF",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminLgpdPage() {
  const { registros, solicitacoes, notificacoes, eventos, consentimentos } = await loadLgpdAdminData();

  const openRequests = solicitacoes.filter((item) => item.status === "aberta" || item.status === "em_andamento");
  const acceptedCookies = registros.filter((item) => item.categoria === "cookies" && item.status === "aceito").length;
  const marketingOptIns = registros.filter((item) => item.categoria === "marketing" && item.status === "aceito").length;
  const privacyReads = registros.filter((item) => item.categoria === "privacidade").length;
  const severityCounts = registros.reduce<Record<string, number>>((acc, item) => {
    const severity = typeof item.escopo?.severity === "string" ? item.escopo.severity : "info";
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});
  const categorySeverity = registros.reduce<Record<string, string>>((acc, item) => {
    if (!acc[item.categoria] && typeof item.escopo?.severity === "string") {
      acc[item.categoria] = item.escopo.severity;
    }

    return acc;
  }, {});

  const groupedByCategory = Object.values(
    registros.reduce<Record<string, { category: string; total: number; accepted: number; rejected: number; latest: string }>>(
      (acc, item) => {
        const current =
          acc[item.categoria] ??
          {
            category: item.categoria,
            total: 0,
            accepted: 0,
            rejected: 0,
            latest: item.created_at,
          };

        current.total += 1;
        if (item.status === "aceito") current.accepted += 1;
        if (item.status === "recusado") current.rejected += 1;
        if (new Date(item.created_at).getTime() > new Date(current.latest).getTime()) {
          current.latest = item.created_at;
        }
        acc[item.categoria] = current;
        return acc;
      },
      {}
    )
  ).sort((a, b) => b.total - a.total);

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="area-subtitle">LGPD</p>
            <h1 className="area-hero-title">Central LGPD</h1>
            <p className="area-subtitle">
              Visão unificada de cookies, consentimentos, fila do titular, notificações e trilha técnica.
            </p>
          </div>
        </div>

        <div className="area-summary-grid">
          <div className="area-summary-card">
            <strong>{registros.length}</strong>
            <span>Registros LGPD</span>
          </div>
          <div className="area-summary-card">
            <strong>{openRequests.length}</strong>
            <span>Pedidos abertos</span>
          </div>
          <div className="area-summary-card">
            <strong>{acceptedCookies}</strong>
            <span>Consentimentos de cookies</span>
          </div>
          <div className="area-summary-card">
            <strong>{marketingOptIns}</strong>
            <span>Opt-ins de marketing</span>
          </div>
          <div className="area-summary-card">
            <strong>{privacyReads}</strong>
            <span>Ciências de privacidade</span>
          </div>
          <div className="area-summary-card">
            <strong>{eventos.length}</strong>
            <span>Eventos de auditoria</span>
          </div>
        </div>

        <div className="area-summary-grid mt-1">
          {(["info", "low", "medium", "high", "critical"] as const).map((severity) => (
            <div key={severity} className="area-summary-card">
              <strong>{severityCounts[severity] || 0}</strong>
              <span>LGPD {severity}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="area-section">
        <h2 className="area-section-title">Preferências</h2>
        <div className="admin-card">
          <div className="module-grid grid-auto-220">
            {groupedByCategory.length === 0 ? (
              <div className="area-empty">Nenhum registro LGPD encontrado.</div>
            ) : (
              groupedByCategory.map((item) => (
                <div key={item.category} className="area-panel-item">
                  <strong>{item.category}</strong>
                  <p className="mt-035">
                    Total: {item.total} <br />
                    Aceitos: {item.accepted} <br />
                    Recusados: {item.rejected} <br />
                    Severidade: {categorySeverity[item.category] || "info"} <br />
                    Último: {formatDate(item.latest)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="area-section">
        <h2 className="area-section-title">Fila operacional</h2>
        <div className="table-surface">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Titular</th>
                <th>Status</th>
                <th>Prazo</th>
                <th>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.length === 0 ? (
                <tr>
                  <td colSpan={5}>Nenhum pedido registrado.</td>
                </tr>
              ) : (
                solicitacoes.map((item) => (
                  <tr key={item.id}>
                    <td>{item.request_type}</td>
                    <td>{item.titular_nome || item.titular_email || "—"}</td>
                    <td>
                      <span className="inline-status inline-status-warning">{item.status}</span>
                    </td>
                    <td>{formatDate(item.prazo_resposta)}</td>
                    <td>{formatDate(item.updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="area-section">
        <h2 className="area-section-title">Consentimentos e ciência</h2>
        <div className="table-surface">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Finalidade</th>
                <th>Pessoa</th>
                <th>Base legal</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {consentimentos.length === 0 ? (
                <tr>
                  <td colSpan={5}>Nenhum consentimento encontrado.</td>
                </tr>
              ) : (
                consentimentos.map((item) => (
                  <tr key={item.id}>
                    <td>{item.finalidade}</td>
                    <td>{item.pessoas?.nome || "—"}</td>
                    <td>{item.base_legal || "—"}</td>
                    <td>{item.status}</td>
                    <td>{formatDate(item.data_consentimento)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="area-section">
        <h2 className="area-section-title">Notificações e auditoria</h2>
        <div className="module-grid grid-auto-300">
          <div className="admin-card">
            <strong>Notificações LGPD</strong>
            <div className="area-panel-grid mt-075">
              {notificacoes.length === 0 ? (
                <div className="area-empty">Sem notificações recentes.</div>
              ) : (
                notificacoes.map((item) => (
                  <div key={item.id} className="area-panel-item">
                    <strong>{item.titulo}</strong>
                    <p>{item.status} · {formatDate(item.criado_em)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="admin-card">
            <strong>Eventos técnicos</strong>
            <div className="area-panel-grid mt-075">
              {eventos.length === 0 ? (
                <div className="area-empty">Sem eventos LGPD.</div>
              ) : (
                eventos.map((item) => (
                  <div key={item.id} className="area-panel-item">
                    <strong>{item.source}</strong>
                    <p>{item.level} · {item.message}</p>
                    <p className="mt-035">{formatDate(item.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
