import Link from "next/link";
import { getObras } from "./actions";
import { Suspense } from "react";
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: "Biblioteca - Admin GEEF",
};

type ObraItem = {
  id: string;
  titulo: string;
  autor?: string | null;
  categoria?: string | null;
  publico?: string | null;
  exemplares?: Array<unknown> | null;
};

type BibliotecaSearchParams = {
  page?: string;
  search?: string;
};

async function BibliotecaList({ searchParams }: { searchParams: BibliotecaSearchParams }) {
  const page = Number.parseInt(searchParams.page || "1", 10);
  const search = searchParams.search || "";

  const { obras, total, pageSize } = await getObras(page, search);
  const obraList = obras as ObraItem[];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Biblioteca" href="/admin/biblioteca/nova-obra" label="Adicionar obra" />

      <section className="area-section">
        <div className="table-surface library-filter-surface">
          <form method="get" className="module-grid align-start">
            <label className="profile-form-field library-search-field">
              <span>Buscar por título ou autor</span>
              <input type="text" name="search" placeholder="Buscar por título ou autor..." defaultValue={search} className="profile-form-input" />
            </label>
            <div className="area-panel-item">
              {search ? <Link href="/admin/biblioteca" className="profile-form-btn profile-form-btn-secondary">Limpar</Link> : null}
            </div>
          </form>
        </div>
      </section>

      <section className="area-section">
        <div className="table-surface">
          {obraList.length === 0 ? (
            <div className="area-empty">
              <p>{search ? "Nenhuma obra encontrada." : "Nenhuma obra cadastrada."}</p>
              <Link href="/admin/biblioteca/nova-obra" className="profile-form-btn profile-form-btn-primary">
                Adicionar primeira obra
              </Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Categoria</th>
                  <th>Público</th>
                  <th>Exemplares</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {obraList.map((obra) => (
                  <tr key={obra.id}>
                    <td><strong>{obra.titulo}</strong></td>
                    <td className="text-sm-muted">{obra.autor || "—"}</td>
                    <td>
                      {obra.categoria ? <span className="tag">{obra.categoria}</span> : "—"}
                    </td>
                    <td>
                      <span className="inline-status inline-status-success">
                        {obra.publico}
                      </span>
                    </td>
                    <td className="table-cell-center"><strong>{obra.exemplares?.length || 0}</strong></td>
                    <td>
                      <Link href={`/admin/biblioteca/${obra.id}`} className="profile-form-btn profile-form-btn-secondary">
                        Editar
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
        <div className="page-pagination">
          {page > 1 && (
            <Link href={`/admin/biblioteca?page=${page - 1}${search ? `&search=${search}` : ""}`} className="profile-form-btn profile-form-btn-secondary">
              Anterior
            </Link>
          )}
          <span className="page-pagination-label">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/admin/biblioteca?page=${page + 1}${search ? `&search=${search}` : ""}`} className="profile-form-btn profile-form-btn-secondary">
              Próxima
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

type BibliotecaPageParams = {
  page?: string;
  search?: string;
};

export default async function BibliotecaPage({ searchParams }: { searchParams: Promise<BibliotecaPageParams> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <BibliotecaList searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
