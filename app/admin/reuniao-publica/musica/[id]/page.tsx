import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconSave } from "@/components/icons";
import { DeleteMusicaButton } from "@/components/admin/musicas/delete-musica-button";
import { MusicaEditorForm } from "@/components/admin/musicas/musica-editor-form";
import { getMusicaById, listMusicaAutores, listMusicaVersoes } from "@/lib/musicas";
import { saveMusicaAction } from "../actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ salvo?: string }>;
};

export const metadata = {
  title: "Editar música - Admin GEEF",
};

export default async function EditarMusicaPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const params_data = (await searchParams) ?? {};
  const isSaved = params_data.salvo === "1";
  const [musica, autores, versoes] = await Promise.all([getMusicaById(id), listMusicaAutores(), listMusicaVersoes()]);

  if (!musica) {
    notFound();
  }

  return (
    <form action={saveMusicaAction} style={{ display: "contents" }}>
      <div className="area-page">
        <div className="admin-page-header">
          <div>
            <span className="admin-dashboard-kicker">Músicas</span>
            <h1 className="admin-page-title">Editar música</h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              title="Salvar alterações"
              aria-label="Salvar alterações"
            >
              <IconSave size={18} />
            </button>
            <DeleteMusicaButton musicaId={musica.id} musicaTitulo={musica.titulo} iconOnly />
            <Link href="/admin/reuniao-publica/musica/catalogo" className="admin-btn admin-btn-secondary" title="Voltar" aria-label="Voltar">
              <IconArrowLeft size={18} />
            </Link>
          </div>
        </div>

        {isSaved && (
          <div style={{ padding: "1rem", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "0.5rem", marginBottom: "1rem" }}>
            <p style={{ margin: 0, color: "#16a34a", fontSize: "0.95rem" }}>✓ Música salva com sucesso!</p>
          </div>
        )}

        <section className="area-section">
          <div className="admin-card table-surface">
            <div className="area-section-title" style={{ paddingBottom: 0 }}>
              <div>
                <h2>{musica.titulo}</h2>
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>por {musica.autor}</p>
              </div>
            </div>

            <div style={{ padding: "1.5rem 0 0" }}>
              <MusicaEditorForm musica={musica} autores={autores} versoes={versoes} />
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
