import { revalidatePath } from "next/cache";
import { IconPlus, IconTrash } from "@/components/icons";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { getUserPermissions } from "@/lib/auth/permissions";
import { deleteMusicaPasse, listAdminMusicaPasses, moveMusicaPasse, saveMusicaPasse } from "@/lib/musica-passes";
import { removeMusicaPasseAudio, uploadMusicaPasseAudio } from "@/lib/musica-passes-storage";

export const metadata = { title: "Passes - Músicas - Admin GEEF" };

const PASSES_PROFILES = ["diretoria", "secretaria", "comunicacao"];

async function requireMusicaPassesAccess() {
  const permissions = await getUserPermissions();
  const allowed = permissions && (
    permissions.perfil === "administrador" ||
    PASSES_PROFILES.includes(permissions.perfil) ||
    permissions.pode_publicar
  );

  if (!allowed) throw new Error("Access denied: publicação de passes necessária");
}

async function addPasse(formData: FormData) {
  "use server";
  await requireMusicaPassesAccess();
  const titulo = String(formData.get("titulo") || "").trim();
  const audio = formData.get("audio");
  if (titulo && audio instanceof File && audio.size > 0) {
    const uploaded = await uploadMusicaPasseAudio(audio);
    if (!uploaded.success || !uploaded.url) return;

    try {
      await saveMusicaPasse({ titulo, audio_url: uploaded.url, ativo: true });
    } catch (error) {
      await removeMusicaPasseAudio(uploaded.url);
      throw error;
    }
  }
  revalidatePath("/admin/reuniao-publica/musica/passes");
}

export default async function MusicaPassesAdminPage() {
  const items = await listAdminMusicaPasses();
  return <AdminModuleGate permission="pode_publicar" profiles={["diretoria", "secretaria", "comunicacao"]} redirectPath="/admin/reuniao-publica/musica/passes" title="Passes">
    <div className="area-page"><div className="admin-page-header"><h1 className="admin-page-title">Passes</h1></div>
      <section className="area-section"><div className="admin-card table-surface"><form action={addPasse} className="musica-passes-admin-form"><input name="titulo" className="profile-form-input" placeholder="Título do áudio" required /><label className="musica-passes-file-field"><span>Selecionar MP3</span><input name="audio" type="file" accept="audio/mpeg,.mp3" required /></label><button className="admin-btn admin-btn-primary" title="Adicionar áudio"><IconPlus size={18} /></button></form></div></section>
      <section className="area-section"><div className="admin-card table-surface"><table className="admin-table"><thead><tr><th>Nome</th><th>Tipo</th><th>Ordem</th><th>Ações</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.id}><td><strong>{item.titulo}</strong></td><td><span className="musica-passes-file-type">MP3</span></td><td>{item.ordem + 1}</td><td><div className="musica-passes-order-actions"><form action={async () => { "use server"; await requireMusicaPassesAccess(); await moveMusicaPasse(item.id, "up"); revalidatePath("/admin/reuniao-publica/musica/passes"); }}><button className="admin-btn admin-btn-small" title="Subir" aria-label={`Subir ${item.titulo}`} disabled={index === 0}>↑</button></form><form action={async () => { "use server"; await requireMusicaPassesAccess(); await moveMusicaPasse(item.id, "down"); revalidatePath("/admin/reuniao-publica/musica/passes"); }}><button className="admin-btn admin-btn-small" title="Descer" aria-label={`Descer ${item.titulo}`} disabled={index === items.length - 1}>↓</button></form><form action={async () => { "use server"; await requireMusicaPassesAccess(); await deleteMusicaPasse(item.id); revalidatePath("/admin/reuniao-publica/musica/passes"); }}><button className="admin-btn admin-btn-small" title="Excluir"><IconTrash size={16} /></button></form></div></td></tr>)}</tbody></table></div></section>
    </div>
  </AdminModuleGate>;
}
