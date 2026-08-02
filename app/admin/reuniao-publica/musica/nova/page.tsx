import Link from "next/link";
import { IconArrowLeft } from "@/components/icons";
import { MusicaEditorForm } from "@/components/admin/musicas/musica-editor-form";
import { saveMusicaAction } from "../actions";
import { listMusicaAutores, listMusicaVersoes } from "@/lib/musicas";

export const metadata = {
  title: "Nova música - Admin GEEF",
};

export default async function NovaMusicaPage() {
  const [autores, versoes] = await Promise.all([listMusicaAutores(), listMusicaVersoes()]);

  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Músicas</span>
          <h1 className="admin-page-title">Nova música</h1>
        </div>
        <Link href="/admin/reuniao-publica/musica/catalogo" className="admin-btn admin-btn-secondary" title="Voltar">
          <IconArrowLeft size={18} />
        </Link>
      </div>

      <section className="area-section">
        <div className="admin-card table-surface">
          <form action={saveMusicaAction} style={{ display: "contents" }}>
            <div className="area-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 0 }}>
              <h2>Detalhes da música</h2>
              <button type="submit" className="admin-btn admin-btn-primary">
                Criar música
              </button>
            </div>

            <div style={{ padding: "1.5rem 0 0" }}>
              <MusicaEditorForm autores={autores} versoes={versoes} />
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
