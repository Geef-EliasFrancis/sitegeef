import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconSave, IconTrash } from "@/components/icons";
import { deleteAvisoReuniaoAction, saveAvisoReuniaoAction } from "../actions";
import { getPersistedAvisoById } from "@/lib/reuniao-publica/avisos-repository";

export const metadata = { title: "Editar aviso da reunião - Admin GEEF" };

export default async function EditarAvisoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const aviso = await getPersistedAvisoById(id);
  if (!aviso) notFound();

  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div><span className="admin-dashboard-kicker">Reunião pública</span><h1 className="admin-page-title">Editar aviso</h1></div>
        <Link href="/admin/reuniao-publica/avisos" className="admin-btn admin-btn-secondary" title="Voltar"><IconArrowLeft size={18} /></Link>
      </div>
      <section className="area-section">
        <div className="admin-card form-panel-centered-lg">
          <form action={saveAvisoReuniaoAction} className="admin-form-grid">
            <input type="hidden" name="id" value={aviso.id} />
            <label className="admin-form-group"><span>Título</span><input name="titulo" required defaultValue={aviso.titulo} className="profile-form-input" /></label>
            <label className="admin-form-group"><span>Quando</span><input name="quando" defaultValue={aviso.quando ?? ""} className="profile-form-input" /></label>
            <label className="admin-form-group"><span>Conteúdo</span><textarea name="conteudo" defaultValue={aviso.conteudo ?? ""} className="profile-form-input" rows={5} /></label>
            <div className="grid-auto-300">
              <label className="admin-form-group"><span>Status</span><select name="status" defaultValue={aviso.status} className="profile-form-input"><option value="rascunho">Rascunho</option><option value="publicado">Publicado</option></select></label>
              <label className="admin-form-group"><span>Ordem</span><input name="ordem" type="number" defaultValue={aviso.ordem} className="profile-form-input" /></label>
            </div>
            <div className="form-actions-row"><button type="submit" className="admin-btn admin-btn-primary"><IconSave size={17} /> Salvar aviso</button></div>
          </form>
          <form action={deleteAvisoReuniaoAction} className="form-actions-row mt-075"><input type="hidden" name="id" value={aviso.id} /><button type="submit" className="admin-btn admin-btn-danger"><IconTrash size={17} /> Excluir aviso</button></form>
        </div>
      </section>
    </div>
  );
}
