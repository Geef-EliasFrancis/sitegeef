import Link from "next/link";
import { Suspense } from "react";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { IconArrowLeft, IconSave } from "@/components/icons";
import { saveMusicaAutorAction } from "../actions";
import { getMusicaAutorById } from "@/lib/musicas";

export const metadata = {
  title: "Novo autor - Admin GEEF",
};

type PageProps = {
  searchParams?: Promise<{ id?: string; salvo?: string }>;
};

async function NovoAutorContent({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const autorId = typeof params.id === "string" ? params.id : "";

  const autor = autorId ? await getMusicaAutorById(autorId) : null;
  const isEditing = !!autorId && !!autor;
  const isSaved = params.salvo === "1";

  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Músicas</span>
          <h1 className="admin-page-title">{isEditing ? "Editar autor" : "Novo autor"}</h1>
        </div>
        <Link href="/admin/reuniao-publica/musica/autores" className="admin-btn admin-btn-secondary" title="Voltar">
          <IconArrowLeft size={18} />
        </Link>
      </div>

      {isSaved && (
        <div style={{ padding: "1rem", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "0.5rem", marginBottom: "1rem" }}>
          <p style={{ margin: 0, color: "#16a34a", fontSize: "0.95rem" }}>✓ Autor salvo com sucesso!</p>
        </div>
      )}

      <section className="area-section">
        <div className="admin-card" style={{ maxWidth: "500px" }}>
          <div className="area-section-title">
            <h2>{isEditing ? "Editar autor" : "Criar novo autor"}</h2>
            <p>{isEditing ? "Modifique os dados do autor." : "Adicione um novo compositor ou autor de músicas."}</p>
          </div>

          <form action={saveMusicaAutorAction} style={{ display: "grid", gap: "1rem" }}>
            {isEditing && <input type="hidden" name="id" value={autor?.id ?? ""} />}

            <label className="profile-form-field">
              <span>Nome do autor</span>
              <input
                className="profile-form-input"
                name="nome"
                defaultValue={autor?.nome ?? ""}
                placeholder="Ex.: João da Silva"
                required
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button type="submit" className="profile-form-btn profile-form-btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconSave size={16} />
                {isEditing ? "Salvar alterações" : "Criar autor"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function NovoAutorPage(props: PageProps) {
  return (
    <AdminModuleGate
      permission="pode_publicar"
      profiles={["diretoria", "secretaria", "comunicacao"]}
      redirectPath="/admin/reuniao-publica/musica/autores"
      title="Novo autor"
    >
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>}>
        <NovoAutorContent {...props} />
      </Suspense>
    </AdminModuleGate>
  );
}
