import Link from "next/link";
import { IconEdit, IconPlus } from "@/components/icons";
import { checkPermission } from "@/lib/auth/permissions";
import { listReuniaoPublicaAvisos } from "@/lib/reuniao-publica/avisos";

export const metadata = {
  title: "Avisos da reunião - Admin GEEF",
};

function statusLabel(status?: string | null) {
  if (status === "publicado") return "Publicado";
  if (status === "revisao") return "Em revisão";
  if (status === "aprovado") return "Aprovado";
  return "Rascunho";
}

function statusClass(status?: string | null) {
  if (status === "publicado") return "inline-status inline-status-success";
  if (status === "revisao" || status === "aprovado") return "inline-status inline-status-primary";
  return "inline-status inline-status-neutral";
}

export default async function AvisosPage() {
  const [avisos, canPublish] = await Promise.all([
    listReuniaoPublicaAvisos(),
    checkPermission("pode_publicar"),
  ]);
  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <h1 className="area-hero-title">Avisos da reunião</h1>
          </div>
          {canPublish && <Link
              href="/admin/reuniao-publica/avisos/novo"
              className="admin-btn admin-btn-primary admin-icon-action"
              aria-label="Adicionar aviso"
              title="Adicionar aviso"
            >
              <IconPlus size={20} />
            </Link>}
        </div>
      </section>

      <section className="area-section">
        <div className="avisos-catalog-heading">
          <h2>Avisos da reunião</h2>
          <span>{avisos.length} avisos</span>
        </div>

        <div className="admin-card table-surface avisos-catalog-surface">
          <table className="admin-table avisos-catalog-table">
            <thead>
              <tr>
                <th>Aviso</th>
                <th>Quando</th>
                <th>Status</th>
                <th>Origem</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {avisos.map((aviso) => (
                  <tr key={aviso.id}>
                    <td>
                      <strong>{aviso.titulo}</strong>
                      {aviso.conteudo && <p className="text-sm-muted">{aviso.conteudo.slice(0, 110)}</p>}
                    </td>
                    <td>{aviso.quando || "—"}</td>
                    <td><span className={statusClass(aviso.status)}>{statusLabel(aviso.status)}</span></td>
                    <td>{aviso.origem === "agenda" ? "Agenda" : "Reunião"}</td>
                    <td>
                      {aviso.origem === "agenda" ? (
                        <span className="text-sm-muted">Fixo</span>
                      ) : (
                        <Link
                          href={`/admin/reuniao-publica/avisos/${aviso.id}`}
                          className="admin-btn admin-btn-small admin-icon-action"
                          aria-label={`Editar ${aviso.titulo}`}
                          title={`Editar ${aviso.titulo}`}
                        >
                          <IconEdit size={16} />
                        </Link>
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
