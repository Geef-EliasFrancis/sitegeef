import Link from "next/link";
import { getPessoas } from "./actions";
import { Suspense } from "react";
import { IconPlus } from '@/components/icons';

export const metadata = {
  title: "Pessoas - Admin GEEF",
};

async function PessoasList({ searchParams }: { searchParams: { page?: string; search?: string } }) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";

  const { pessoas, total, pageSize } = await getPessoas(page, search);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="area-page">
      <div className="admin-page-header admin-page-header--title-add">
        <h1 className="admin-page-title">Pessoas</h1>
        <div className="admin-actions">
          <Link href="/admin/pessoas/nova" className="admin-btn admin-btn-primary admin-page-add-button" aria-label="Adicionar pessoa" title="Adicionar pessoa">
            <IconPlus size={20} />
          </Link>
        </div>
      </div>

      <section className="area-section">
        <div className="admin-card">
          <form method="GET" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1fr) auto auto", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
                Buscar por nome, email ou telefone
              </label>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Digite para filtrar..."
                className="profile-form-input"
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-secondary">
              🔍 Buscar
            </button>
            {search ? (
              <Link href="/admin/pessoas" className="admin-btn admin-btn-secondary">
                ❌ Limpar
              </Link>
            ) : (
              <span />
            )}
          </form>
        </div>
      </section>

      <section className="area-section">
        <div className="admin-card table-surface">
          {pessoas.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
                <p>Nenhuma pessoa encontrada.</p>
              <Link href="/admin/pessoas/nova" className="admin-btn admin-btn-primary" style={{ marginTop: "1rem" }}>
                ➕ Criar primeira pessoa
              </Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Vínculos</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {pessoas.map((pessoa: any) => (
                  <tr key={pessoa.id}>
                    <td style={{ fontWeight: 600 }}>{pessoa.nome}</td>
                    <td style={{ fontSize: "0.9rem", color: "var(--muted)" }}>{pessoa.email || "—"}</td>
                    <td style={{ fontSize: "0.9rem" }}>{pessoa.telefone || "—"}</td>
                    <td>
                      <span
                        className="inline-status"
                        style={{
                          backgroundColor:
                            pessoa.status === "ativo"
                              ? "rgba(99, 213, 31, 0.14)"
                              : pessoa.status === "inativo"
                                ? "rgba(158, 158, 158, 0.14)"
                                : pessoa.status === "falecido"
                                  ? "rgba(200, 0, 0, 0.12)"
                                  : "rgba(255, 193, 7, 0.14)",
                          color:
                            pessoa.status === "ativo"
                              ? "#2d6a14"
                              : pessoa.status === "inativo"
                                ? "var(--muted)"
                                : pessoa.status === "falecido"
                                  ? "#b91c1c"
                                  : "#b45309",
                        }}
                      >
                        {pessoa.status === "ativo"
                          ? "✅ Ativo"
                          : pessoa.status === "inativo"
                            ? "⏸️ Inativo"
                            : pessoa.status === "falecido"
                              ? "†️ Falecido"
                              : "⏳ Afastado"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {pessoa.pessoa_vinculos && pessoa.pessoa_vinculos.length > 0 ? (
                        <div className="tag-list">
                          {pessoa.pessoa_vinculos.slice(0, 2).map((v: any) => (
                            <span key={v.vinculo} className="tag">
                              {v.vinculo}
                            </span>
                          ))}
                          {pessoa.pessoa_vinculos.length > 2 && (
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                              +{pessoa.pessoa_vinculos.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/pessoas/${pessoa.id}`} className="admin-btn admin-btn-small">
                        ✏️ Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
          {page > 1 && (
            <Link href={`/admin/pessoas?page=${page - 1}${search ? `&search=${search}` : ""}`} className="admin-btn admin-btn-secondary">
              ← Anterior
            </Link>
          )}
          <span style={{ padding: "0.6rem 1.2rem", alignSelf: "center", fontWeight: 600 }}>
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/admin/pessoas?page=${page + 1}${search ? `&search=${search}` : ""}`} className="admin-btn admin-btn-secondary">
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function PessoasPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>}>
      <PessoasList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
