import Link from "next/link";
import { redirect } from "next/navigation";
import { IconArrowLeft } from "@/components/icons";
import { saveMusicaVersao, getMusicaVersaoById } from "@/lib/musicas";
import { invalidateMusicasCache } from "@/lib/admin/cache";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Nova versão - Admin GEEF",
};

type PageProps = {
  searchParams?: Promise<{ id?: string }>;
};

async function handleSave(formData: FormData) {
  "use server";

  const nome = formData.get("nome");
  const id = formData.get("id");

  if (typeof nome !== "string" || !nome.trim()) {
    redirect("/admin/reuniao-publica/musica/versoes/novo?erro=nome-obrigatorio");
  }

  await saveMusicaVersao({
    id: typeof id === "string" && id ? id : undefined,
    nome: nome.trim(),
  });

  invalidateMusicasCache();
  revalidatePath("/admin/reuniao-publica/musica/versoes");
  redirect("/admin/reuniao-publica/musica/versoes");
}

export default async function NovaVersaoPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const versaoId = params.id;
  const versao = versaoId ? await getMusicaVersaoById(versaoId) : null;
  const isEdit = !!versao;

  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Músicas</span>
          <h1 className="admin-page-title">{isEdit ? "Editar versão" : "Nova versão"}</h1>
        </div>
        <Link href="/admin/reuniao-publica/musica/versoes" className="admin-btn admin-btn-secondary" title="Voltar">
          <IconArrowLeft size={18} />
        </Link>
      </div>

      <section className="area-section">
        <div className="admin-card table-surface">
          <form action={handleSave} className="musica-form">
            {versao && <input type="hidden" name="id" value={versao.id} />}

            <div className="module-grid">
              <label className="profile-form-field" style={{ gridColumn: "1/-1" }}>
                <span>Nome da versão</span>
                <input
                  className="profile-form-input"
                  name="nome"
                  defaultValue={versao?.nome ?? ""}
                  placeholder="Ex.: versão de Elizabeth Lacerda"
                  required
                />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "2rem" }}>
              <button type="submit" className="profile-form-btn profile-form-btn-primary">
                {isEdit ? "Salvar alterações" : "Criar versão"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
