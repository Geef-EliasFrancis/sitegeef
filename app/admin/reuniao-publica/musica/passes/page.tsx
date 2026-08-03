import Link from "next/link";
import { revalidatePath } from "next/cache";
import { IconArrowLeft, IconPlus, IconTrash } from "@/components/icons";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { deleteMusicaPasse, listAdminMusicaPasses, saveMusicaPasse } from "@/lib/musica-passes";

export const metadata = { title: "Passes - Músicas - Admin GEEF" };

async function addPasse(formData: FormData) {
  "use server";
  const titulo = String(formData.get("titulo") || "").trim();
  const audioUrl = String(formData.get("audio_url") || "").trim();
  if (titulo && audioUrl) await saveMusicaPasse({ titulo, audio_url: audioUrl, ordem: Number(formData.get("ordem") || 0), ativo: true });
  revalidatePath("/admin/reuniao-publica/musica/passes");
}

export default async function MusicaPassesAdminPage() {
  const items = await listAdminMusicaPasses();
  return <AdminModuleGate permission="pode_publicar" profiles={["diretoria", "secretaria", "comunicacao"]} redirectPath="/admin/reuniao-publica/musica/passes" title="Passes">
    <div className="area-page"><div className="admin-page-header"><div><span className="admin-dashboard-kicker">Músicas</span><h1 className="admin-page-title">Passes</h1></div><Link href="/admin/reuniao-publica/musica/catalogo" className="admin-btn admin-btn-secondary" title="Voltar"><IconArrowLeft size={18} /></Link></div>
      <section className="area-section"><div className="admin-card table-surface"><form action={addPasse} className="musica-passes-admin-form"><input name="titulo" className="profile-form-input" placeholder="Título do áudio" required /><input name="audio_url" type="url" className="profile-form-input" placeholder="URL do áudio" required /><input name="ordem" type="number" min="0" className="profile-form-input" placeholder="Ordem" /><button className="admin-btn admin-btn-primary" title="Adicionar áudio"><IconPlus size={18} /></button></form></div></section>
      <section className="area-section"><div className="admin-card table-surface"><table className="admin-table"><thead><tr><th>Áudio</th><th>Ordem</th><th>Ações</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.titulo}</strong><br /><small>{item.audio_url}</small></td><td>{item.ordem}</td><td><form action={async () => { "use server"; await deleteMusicaPasse(item.id); revalidatePath("/admin/reuniao-publica/musica/passes"); }}><button className="admin-btn admin-btn-small" title="Excluir"><IconTrash size={16} /></button></form></td></tr>)}</tbody></table></div></section>
    </div>
  </AdminModuleGate>;
}
