import Link from "next/link";
import { loadLgpdAdminData } from "@/lib/lgpd/admin";
import { getOpsEventStats, listOpsEvents, type OpsEventLevel } from "@/lib/observability";

export const metadata = {
  title: "Observabilidade - Admin GEEF",
};

type SearchParams = Record<string, string | string[] | undefined>;
type ObservabilityTab = "geral" | "erros" | "supabase" | "lgpd" | "fila";

function resolveLevel(level?: string): OpsEventLevel | "all" {
  if (level === "debug" || level === "info" || level === "warn" || level === "error") {
    return level;
  }

  return "all";
}

function resolveTab(tab?: string): ObservabilityTab {
  if (tab === "erros" || tab === "supabase" || tab === "lgpd" || tab === "fila") {
    return tab;
  }

  return "geral";
}

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

function buildTabHref(baseParams: URLSearchParams, tab: ObservabilityTab) {
  const params = new URLSearchParams(baseParams);
  if (tab === "geral") {
    params.delete("tab");
  } else {
    params.set("tab", tab);
  }

  const query = params.toString();
  return query ? `/admin/observability?${query}` : "/admin/observability";
}

function isSupabaseEvent(event: { source: string; message: string; payload: Record<string, unknown> }) {
  const source = event.source.toLowerCase();
  const message = event.message.toLowerCase();
  return source.includes("supabase") || message.includes("supabase") || Boolean(event.payload.operation);
}

async function ObservabilityContent({ searchParams }: { searchParams: SearchParams }) {
  const tab = resolveTab(typeof searchParams.tab === "string" ? searchParams.tab : undefined);
  const level = resolveLevel(typeof searchParams.level === "string" ? searchParams.level : undefined);
  const source = typeof searchParams.source === "string" ? searchParams.source.trim() : undefined;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : undefined;

  const [opsEvents, lgpdData] = await Promise.all([
    listOpsEvents({
      limit: 120,
      level,
      source,
      query: q,
    }),
    loadLgpdAdminData(),
  ]);

  const stats = await getOpsEventStats(opsEvents);
  const recentOps = opsEvents.slice(0, 12);
  const supabaseEvents = opsEvents.filter(isSupabaseEvent).slice(0, 12);
  const lgpdSeverityCounts = lgpdData.registros.reduce<Record<string, number>>((acc, item) => {
    const severity = typeof item.escopo?.severity === "string" ? item.escopo.severity : "info";
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});
  const pendingRequests = lgpdData.solicitacoes.filter((item) => item.status === "aberta" || item.status === "em_andamento");
  const baseParams = new URLSearchParams();
  if (typeof searchParams.level === "string" && searchParams.level.trim()) baseParams.set("level", searchParams.level);
  if (typeof searchParams.source === "string" && searchParams.source.trim()) baseParams.set("source", searchParams.source);
  if (typeof searchParams.q === "string" && searchParams.q.trim()) baseParams.set("q", searchParams.q);

  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <p className="area-subtitle">Observabilidade</p>
            <h1 className="area-hero-title">Central de Observabilidade</h1>
            <p className="area-subtitle">
              Erros, falhas silenciosas do Supabase, fila operacional e trilha LGPD num ponto único.
            </p>
          </div>
        </div>

        <div className="area-summary-grid">
          <div className="area-summary-card">
            <strong>{stats.total}</strong>
            <span>Eventos exibidos</span>
          </div>
          <div className="area-summary-card">
            <strong>{stats.last24h}</strong>
            <span>Últimas 24h</span>
          </div>
          <div className="area-summary-card">
            <strong>{stats.errors}</strong>
            <span>Erros</span>
          </div>
          <div className="area-summary-card">
            <strong>{stats.sources}</strong>
            <span>Fontes distintas</span>
          </div>
          <div className="area-summary-card">
            <strong>{lgpdData.registros.length}</strong>
            <span>Registros LGPD</span>
          </div>
          <div className="area-summary-card">
            <strong>{pendingRequests.length}</strong>
            <span>Pedidos abertos</span>
          </div>
        </div>

      </section>

      {tab === "geral" && (
        <>
          <section className="area-section">
            <div className="area-section-title">
              <h2>Resumo recente</h2>
              <p>Últimos incidentes e trilha LGPD condensados.</p>
            </div>
            <div className="module-grid grid-auto-300">
              <div className="admin-card">
                <strong>Eventos recentes</strong>
                <div className="area-panel-grid mt-075">
                  {recentOps.length === 0 ? (
                    <div className="area-empty">Nenhum evento encontrado.</div>
                  ) : (
                    recentOps.slice(0, 4).map((event) => (
                      <div key={event.id} className="area-panel-item">
                        <strong>{event.message}</strong>
                        <p>{formatDate(event.created_at)} · {event.source}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="admin-card">
                <strong>LGPD por severidade</strong>
                <div className="area-summary-grid mt-075">
                  {(["info", "low", "medium", "high", "critical"] as const).map((severity) => (
                    <div key={severity} className="area-summary-card">
                      <strong>{lgpdSeverityCounts[severity] || 0}</strong>
                      <span>{severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {tab === "erros" && (
        <>
          <section className="area-section">
            <div className="area-section-title">
              <h2>Filtros</h2>
              <p>Refine a lista por nível, origem ou texto da mensagem.</p>
            </div>
            <div className="table-surface">
              <form method="get" className="module-grid">
                <input type="hidden" name="tab" value="erros" />
                <label className="profile-form-field">
                  <span>Nível</span>
                  <select name="level" defaultValue={level} className="profile-form-input">
                    <option value="all">Todos</option>
                    <option value="error">Erro</option>
                    <option value="warn">Aviso</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </label>

                <label className="profile-form-field">
                  <span>Fonte</span>
                  <input name="source" defaultValue={source || ""} className="profile-form-input" placeholder="app/error, api/..." />
                </label>

                <label className="profile-form-field">
                  <span>Busca</span>
                  <input name="q" defaultValue={q || ""} className="profile-form-input" placeholder="texto da mensagem" />
                </label>

                <div className="area-panel-item align-start">
                  <button type="submit" className="profile-form-btn profile-form-btn-primary">Filtrar</button>
                  <Link href="/admin/observability?tab=erros" className="profile-form-btn profile-form-btn-secondary">Limpar</Link>
                </div>
              </form>
            </div>
          </section>

          <section className="area-section">
            <div className="area-section-title">
              <h2>Últimos incidentes</h2>
              <p>Clique para revisar o payload completo.</p>
            </div>
            <div className="table-surface">
              {recentOps.length === 0 ? (
                <div className="area-empty">Nenhum evento encontrado com os filtros atuais.</div>
              ) : (
                <div className="area-panel-grid">
                  {recentOps.map((event) => (
                    <article key={event.id} className="area-panel-item">
                      <div className="area-hero-top align-start">
                        <div>
                          <h3 className="module-title">{event.message}</h3>
                          <p className="area-subtitle">
                            {formatDate(event.created_at)} · {event.source}
                          </p>
                        </div>
                        <div className="tag-list">
                          <span className="tag">{event.level}</span>
                          <span className="tag">{event.event_type}</span>
                        </div>
                      </div>

                      <details>
                        <summary className="details-summary">Ver detalhes técnicos</summary>
                        <pre className="details-box">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </details>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {tab === "supabase" && (
        <>
          <section className="area-section">
            <div className="area-section-title">
              <h2>Falhas silenciosas do Supabase</h2>
              <p>Eventos com fallback ou operação sensível ao adapter.</p>
            </div>
            <div className="table-surface">
              {supabaseEvents.length === 0 ? (
                <div className="area-empty">Nenhum evento Supabase encontrado.</div>
              ) : (
                <div className="area-panel-grid">
                  {supabaseEvents.map((event) => (
                    <article key={event.id} className="area-panel-item">
                      <div className="area-hero-top align-start">
                        <div>
                          <h3 className="module-title">{event.message}</h3>
                          <p className="area-subtitle">
                            {formatDate(event.created_at)} · {event.source}
                          </p>
                        </div>
                        <div className="tag-list">
                          <span className="tag">{event.level}</span>
                          <span className="tag">{event.event_type}</span>
                        </div>
                      </div>
                      <p className="area-subtitle mt-035">
                        Operação: {String(event.payload.operation || "—")}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {tab === "lgpd" && (
        <>
          <section className="area-section">
            <div className="area-section-title">
              <h2>LGPD por severidade</h2>
              <p>Classificação embutida na observabilidade sem mudar o schema.</p>
            </div>
            <div className="area-summary-grid">
              {(["info", "low", "medium", "high", "critical"] as const).map((severity) => (
                <div key={severity} className="area-summary-card">
                  <strong>{lgpdSeverityCounts[severity] || 0}</strong>
                  <span>{severity}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="area-section">
            <div className="area-section-title">
              <h2>Preferências</h2>
              <p>Resumo por categoria para leitura rápida.</p>
            </div>
            <div className="admin-card">
              <div className="module-grid grid-auto-220">
                {Object.values(
                  lgpdData.registros.reduce<Record<string, { category: string; total: number; accepted: number; rejected: number; latest: string }>>(
                    (acc, item) => {
                      const current =
                        acc[item.categoria] ?? {
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
                    {},
                  ),
                )
                  .sort((a, b) => b.total - a.total)
                  .map((item) => (
                    <div key={item.category} className="area-panel-item">
                      <strong>{item.category}</strong>
                      <p className="mt-035">
                        Total: {item.total} <br />
                        Aceitos: {item.accepted} <br />
                        Recusados: {item.rejected} <br />
                        Último: {formatDate(item.latest)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </>
      )}

      {tab === "fila" && (
        <>
          <section className="area-section">
            <div className="area-section-title">
              <h2>Fila operacional</h2>
              <p>Pedidos do titular que ainda exigem tratamento.</p>
            </div>
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
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5}>Nenhum pedido aberto.</td>
                    </tr>
                  ) : (
                    pendingRequests.map((item) => (
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
            <div className="area-section-title">
              <h2>Notificações</h2>
              <p>Entregas fora da interface e pendências de triagem.</p>
            </div>
            <div className="module-grid grid-auto-300">
              <div className="admin-card">
                <strong>Notificações LGPD</strong>
                <div className="area-panel-grid mt-075">
                  {lgpdData.notificacoes.length === 0 ? (
                    <div className="area-empty">Sem notificações recentes.</div>
                  ) : (
                    lgpdData.notificacoes.map((item) => (
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
                  {lgpdData.eventos.length === 0 ? (
                    <div className="area-empty">Sem eventos LGPD.</div>
                  ) : (
                    lgpdData.eventos.map((item) => (
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
        </>
      )}
    </div>
  );
}

export default async function ObservabilityPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;

  return <ObservabilityContent searchParams={resolvedSearchParams} />;
}
