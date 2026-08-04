import Link from "next/link";
import { Suspense } from "react";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { IconEdit, IconTrash, IconSearch } from "@/components/icons";
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';
import { deleteMusicaAutorAction } from "./actions";
import { listMusicaAutores } from "@/lib/musicas";

export const metadata = {
  title: "Autores - Admin GEEF",
};

type PageProps = {
  searchParams?: Promise<{ search?: string; excluido?: string }>;
};

async function AutoresContent({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const search = typeof params.search === "string" ? params.search : "";

  const autores = await listMusicaAutores(search);

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Autores" href="/admin/reuniao-publica/musica/autores/novo" label="Adicionar autor" />

      {params.excluido === "1" && (
        <div style={{ padding: "1rem", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "0.5rem", marginBottom: "1rem" }}>
          <p style={{ margin: 0, color: "#16a34a", fontSize: "0.95rem" }}>✓ Autor excluído com sucesso!</p>
        </div>
      )}

      <section className="area-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem" }}>
          <form method="GET" style={{ flex: 1, display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              name="search"
              placeholder="Buscar autor..."
              defaultValue={search}
              className="profile-form-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="admin-btn admin-btn-secondary" title="Buscar">
              <IconSearch size={18} />
            </button>
          </form>
        </div>

        <div className="admin-card table-surface">
          {autores.length === 0 ? (
            <div className="area-empty">
              <p>{search ? "Nenhum autor encontrado." : "Nenhum autor cadastrado ainda."}</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {autores.map((autor) => (
                  <tr key={autor.id}>
                    <td>{autor.nome}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Link
                          href={`/admin/reuniao-publica/musica/autores/novo?id=${autor.id}`}
                          className="admin-btn admin-btn-small"
                          title="Editar"
                        >
                          <IconEdit size={16} />
                        </Link>
                        <form action={deleteMusicaAutorAction} style={{ display: "inline" }}>
                          <input type="hidden" name="id" value={autor.id} />
                          <button
                            type="submit"
                            className="admin-btn admin-btn-small"
                            style={{ color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.25)" }}
                            title="Excluir"
                          >
                            <IconTrash size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AutoresPage(props: PageProps) {
  return (
    <AdminModuleGate
      permission="pode_publicar"
      profiles={["diretoria", "secretaria", "comunicacao"]}
      redirectPath="/admin/reuniao-publica/musica/autores"
      title="Autores"
    >
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>}>
        <AutoresContent {...props} />
      </Suspense>
    </AdminModuleGate>
  );
}
