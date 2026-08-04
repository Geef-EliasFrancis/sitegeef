import Link from "next/link";
import { getPublicacoes } from "./actions";
import { Suspense } from "react";
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';

export const metadata = {
  title: "Comunicação - Admin GEEF",
};

type PublicacaoListItem = {
  id: string;
  titulo: string;
  tipo?: string | null;
  status?: string | null;
  autor?: { nome?: string | null } | null;
  publicado_em?: string | null;
  criado_em: string;
};

async function ComunicacaoContent() {
  const publicacoes = await getPublicacoes();
  const publicacaoList = publicacoes as PublicacaoListItem[];
  const publicadas = publicacaoList.filter((p) => p.status === "publicado");
  const rascunhos = publicacaoList.filter((p) => p.status === "rascunho");

  const cards = [
    { label: "Publicadas", value: publicadas.length },
    { label: "Rascunhos", value: rascunhos.length },
    { label: "Total", value: publicacaoList.length },
  ];

  const getStatusClass = (status?: string | null) => {
    if (status === "rascunho") return "inline-status inline-status-neutral";
    if (status === "revisao") return "inline-status inline-status-primary";
    if (status === "aprovado") return "inline-status inline-status-info";
    return "inline-status inline-status-success";
  };

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Comunicação" href="/admin/comunicacao/nova-publicacao" label="Adicionar publicação" />

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
          <h2>Publicações recentes</h2>
          <p>Visão geral do conteúdo já cadastrado.</p>
        </div>
        <div className="table-surface">
          {publicacaoList.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Autor</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {publicacaoList.map((publicacao) => (
                  <tr key={publicacao.id}>
                    <td>
                      <strong>{publicacao.titulo}</strong>
                    </td>
                    <td>{publicacao.tipo || "—"}</td>
                    <td>{publicacao.autor?.nome || "—"}</td>
                    <td>
                      <span className={getStatusClass(publicacao.status)}>
                        {publicacao.status}
                      </span>
                    </td>
                    <td className="text-sm-muted">
                      {publicacao.publicado_em
                        ? new Date(publicacao.publicado_em).toLocaleDateString("pt-BR")
                        : new Date(publicacao.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <Link href={`/admin/comunicacao/${publicacao.id}`} className="profile-form-btn profile-form-btn-secondary">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="area-empty">Nenhuma publicação cadastrada.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ComunicacaoPage() {
  return (
    <Suspense fallback={<div className="suspense-center">Carregando...</div>}>
      <ComunicacaoContent />
    </Suspense>
  );
}
