import Link from "next/link";
import { Suspense } from "react";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { IconArrowLeft, IconPlus, IconEdit, IconTrash } from "@/components/icons";
import { listMusicaVersoes, deleteMusicaVersao } from "@/lib/musicas";
import { invalidateMusicasCache } from "@/lib/admin/cache";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Versões de músicas - Admin GEEF",
};

async function VersoesContent() {
  const versoes = await listMusicaVersoes();

  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Músicas</span>
          <h1 className="admin-page-title">Versões</h1>
        </div>
        <Link href="/admin/reuniao-publica/musica/catalogo" className="admin-btn admin-btn-secondary" title="Voltar">
          <IconArrowLeft size={18} />
        </Link>
      </div>

      <section className="area-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Versões cadastradas</h2>
          <Link href="/admin/reuniao-publica/musica/versoes/novo" className="admin-btn admin-btn-primary" title="Nova versão">
            <IconPlus size={18} />
          </Link>
        </div>

        <div className="admin-card table-surface">
          {versoes.length === 0 ? (
            <div className="area-empty">
              <p>Nenhuma versão cadastrada.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Versão</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {versoes.map((versao) => (
                  <tr key={versao.id}>
                    <td>{versao.nome}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Link
                          href={`/admin/reuniao-publica/musica/versoes/novo?id=${versao.id}`}
                          className="admin-btn admin-btn-small"
                          title="Editar"
                        >
                          <IconEdit size={16} />
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteMusicaVersao(versao.id);
                            invalidateMusicasCache();
                            revalidatePath("/admin/reuniao-publica/musica/versoes");
                          }}
                          style={{ display: "inline" }}
                        >
                          <input type="hidden" name="id" value={versao.id} />
                          <button
                            type="submit"
                            className="admin-btn admin-btn-small"
                            style={{ color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.25)" }}
                            title="Excluir"
                          >
                            <IconTrash size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default function VersoesPage() {
  return (
    <AdminModuleGate
      permission="pode_publicar"
      profiles={["diretoria", "secretaria", "comunicacao"]}
      redirectPath="/admin/reuniao-publica/musica/versoes"
      title="Versões"
    >
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>}>
        <VersoesContent />
      </Suspense>
    </AdminModuleGate>
  );
}
