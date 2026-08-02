import Link from "next/link";
import { getPublicacoes } from "@/app/admin/comunicacao/actions";
import { IconEdit, IconPlus } from "@/components/icons";

export const metadata = {
  title: "Avisos - Reunião pública - Admin GEEF",
};

type Aviso = {
  id: string;
  titulo: string;
  tipo?: string | null;
  conteudo?: string | null;
  status?: string | null;
  autor?: { nome?: string | null } | null;
  publicado_em?: string | null;
  criado_em: string;
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
  const publicacoes = (await getPublicacoes()) as Aviso[];
  const avisos = publicacoes.filter((publicacao) => publicacao.tipo === "aviso");
  return (
    <div className="area-page">
      <section className="area-hero">
        <div className="area-hero-top">
          <div>
            <h1 className="area-hero-title">Avisos</h1>
          </div>
          <Link
            href="/admin/comunicacao/nova-publicacao?tipo=aviso"
            className="admin-btn admin-btn-primary admin-icon-action"
            aria-label="Adicionar aviso"
            title="Adicionar aviso"
          >
            <IconPlus size={20} />
          </Link>
        </div>
      </section>

      <section className="area-section">
        <div className="avisos-catalog-heading">
          <h2>Catálogo</h2>
          <span>{avisos.length} avisos</span>
        </div>

        <div className="admin-card table-surface avisos-catalog-surface">
          <table className="admin-table avisos-catalog-table">
            <thead>
              <tr>
                <th>Aviso</th>
                <th>Autor</th>
                <th>Status</th>
                <th>Data</th>
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
                    <td>{aviso.autor?.nome || "—"}</td>
                    <td><span className={statusClass(aviso.status)}>{statusLabel(aviso.status)}</span></td>
                    <td className="text-sm-muted">
                      {new Date(aviso.publicado_em || aviso.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <Link
                        href={`/admin/comunicacao/${aviso.id}`}
                        className="admin-btn admin-btn-small admin-icon-action"
                        aria-label={`Editar ${aviso.titulo}`}
                        title={`Editar ${aviso.titulo}`}
                      >
                        <IconEdit size={16} />
                      </Link>
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
