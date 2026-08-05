import { revalidatePath } from "next/cache";
import { IconTrash } from "@/components/icons";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { getUserPermissions } from "@/lib/auth/permissions";
import { deleteMusicaPasse, listAdminMusicaPasses, moveMusicaPasse } from "@/lib/musica-passes";
import { MusicaPassesUploadForm } from "@/components/admin/musica-passes-upload-form";

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

export default async function MusicaPassesAdminPage() {
  const items = await listAdminMusicaPasses();
  return <AdminModuleGate permission="pode_publicar" profiles={["diretoria", "secretaria", "comunicacao"]} redirectPath="/admin/reuniao-publica/musica/passes" title="Passes">
    <div className="area-page"><div className="admin-page-header"><h1 className="admin-page-title">Passes</h1></div>
      <section className="area-section"><div className="admin-card table-surface"><MusicaPassesUploadForm /></div></section>
      <section className="area-section"><div className="admin-card table-surface"><table className="admin-table"><thead><tr><th>Nome</th><th>Tipo</th><th>Ordem</th><th>Ações</th></tr></thead><tbody>{items.map((item, index) => <tr key={item.id}><td><strong>{item.titulo}</strong></td><td><span className="musica-passes-file-type">MP3</span></td><td>{item.ordem + 1}</td><td><div className="musica-passes-order-actions"><form action={async () => { "use server"; await requireMusicaPassesAccess(); await moveMusicaPasse(item.id, "up"); revalidatePath("/admin/reuniao-publica/musica/passes"); }}><button className="admin-btn admin-btn-small" title="Subir" aria-label={`Subir ${item.titulo}`} disabled={index === 0}>↑</button></form><form action={async () => { "use server"; await requireMusicaPassesAccess(); await moveMusicaPasse(item.id, "down"); revalidatePath("/admin/reuniao-publica/musica/passes"); }}><button className="admin-btn admin-btn-small" title="Descer" aria-label={`Descer ${item.titulo}`} disabled={index === items.length - 1}>↓</button></form><form action={async () => { "use server"; await requireMusicaPassesAccess(); await deleteMusicaPasse(item.id); revalidatePath("/admin/reuniao-publica/musica/passes"); }}><button className="admin-btn admin-btn-small" title="Excluir"><IconTrash size={16} /></button></form></div></td></tr>)}</tbody></table></div></section>
    </div>
  </AdminModuleGate>;
}
