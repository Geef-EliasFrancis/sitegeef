import Link from "next/link";
import { IconArrowLeft, IconSave } from "@/components/icons";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { saveAvisoReuniaoAction } from "../actions";

export const metadata = { title: "Novo aviso da reunião - Admin GEEF" };

export default function NovoAvisoPage() {
  return <AdminModuleGate permission="pode_publicar" redirectPath="/admin/reuniao-publica/avisos/novo" title="Novo aviso da reunião">
    <div className="area-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Reunião pública</span>
          <h1 className="admin-page-title">Novo aviso</h1>
        </div>
        <Link href="/admin/reuniao-publica/avisos" className="admin-btn admin-btn-secondary" title="Voltar">
          <IconArrowLeft size={18} />
        </Link>
      </div>
      <section className="area-section">
        <div className="admin-card form-panel-centered-lg">
          <form action={saveAvisoReuniaoAction} className="admin-form-grid">
            <label className="admin-form-group"><span>Título</span><input name="titulo" required className="profile-form-input" /></label>
            <label className="admin-form-group"><span>Quando</span><input name="quando" className="profile-form-input" placeholder="Ex.: Quintas-feiras, 19h00" /></label>
            <label className="admin-form-group"><span>Conteúdo</span><textarea name="conteudo" className="profile-form-input" rows={5} /></label>
            <div className="grid-auto-300">
              <label className="admin-form-group"><span>Status</span><select name="status" defaultValue="rascunho" className="profile-form-input"><option value="rascunho">Rascunho</option><option value="publicado">Publicado</option></select></label>
              <label className="admin-form-group"><span>Ordem</span><input name="ordem" type="number" defaultValue="0" className="profile-form-input" /></label>
            </div>
            <div className="form-actions-row"><button type="submit" className="admin-btn admin-btn-primary"><IconSave size={17} /> Salvar aviso</button></div>
          </form>
        </div>
      </section>
    </div>
  </AdminModuleGate>;
}
