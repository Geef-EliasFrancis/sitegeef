import Link from "next/link";
import { Suspense } from "react";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { IconArrowLeft, IconSave, IconPlus } from "@/components/icons";
import { saveMusicaSessaoAction, createMusicaSessaoAction } from "../../actions";
import { getMusicasResumo, listMusicaSessoes } from "@/lib/musicas";

export const metadata = {
  title: "Nova sessão - Admin GEEF",
};

type PageProps = {
  searchParams?: Promise<{ codigo?: string; nova?: string; salvo?: string; musica_id?: string }>;
};

async function NovoSessaoContent({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const selectedCodigo = typeof params.codigo === "string" ? params.codigo.toUpperCase() : "";
  const selectedMusicId = typeof params.musica_id === "string" ? params.musica_id : "";

  const [sessoes, musicasResumo] = await Promise.all([listMusicaSessoes(), getMusicasResumo()]);
  const currentSession = selectedCodigo ? sessoes.find((sessao) => sessao.codigo_pareamento === selectedCodigo) ?? null : null;
  const selectedSongId = currentSession?.musica_id ?? selectedMusicId;

  const isEditing = !!selectedCodigo && !!currentSession;
  const isNew = params.nova === "1" || (params.salvo === "1" && selectedCodigo);

  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Músicas</span>
          <h1 className="admin-page-title">{isEditing ? "Editar sessão" : "Nova sessão"}</h1>
        </div>
        <Link href="/admin/reuniao-publica/musica/sessoes" className="admin-btn admin-btn-secondary" title="Voltar">
          <IconArrowLeft size={18} />
        </Link>
      </div>

      {isNew && <div style={{ padding: "1rem", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "0.5rem", marginBottom: "1rem" }}>
        <p style={{ margin: 0, color: "#16a34a", fontSize: "0.95rem" }}>✓ Sessão salva com sucesso!</p>
      </div>}

      <section className="area-section">
        <div className="admin-card" style={{ maxWidth: "500px" }}>
          <div className="area-section-title">
            <h2>{isEditing ? "Editar sessão" : "Criar nova sessão"}</h2>
            <p>{isEditing ? "Modifique os dados da sessão." : "Crie uma tela de exibição ou cole um código existente para editar."}</p>
          </div>

          <form action={saveMusicaSessaoAction} style={{ display: "grid", gap: "1rem" }}>
            <label className="profile-form-field">
              <span>Código da tela</span>
              <input
                className="profile-form-input"
                name="codigo_pareamento"
                defaultValue={currentSession?.codigo_pareamento ?? selectedCodigo}
                placeholder="Ex.: A7K3P9 (ou deixe em branco para gerar)"
              />
            </label>

            <label className="profile-form-field">
              <span>Nome da tela</span>
              <input
                className="profile-form-input"
                name="nome_tela"
                defaultValue={currentSession?.nome_tela ?? ""}
                placeholder="Ex.: Nave principal"
              />
            </label>

            <label className="profile-form-field">
              <span>Música</span>
              <select className="profile-form-input" name="musica_id" defaultValue={selectedSongId}>
                <option value="">Nenhuma selecionada</option>
                {musicasResumo.map((musica) => (
                  <option key={musica.id} value={musica.id}>
                    {musica.titulo} — {musica.autor}
                  </option>
                ))}
              </select>
            </label>

            <label className="profile-form-field">
              <span>Modo</span>
              <select className="profile-form-input" name="modo" defaultValue={currentSession?.modo ?? "exibicao"}>
                <option value="exibicao">Exibição (apresentação)</option>
                <option value="catalogo">Catálogo (selecionar música)</option>
              </select>
            </label>

            <label
              className="profile-form-field"
              style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: "0.5rem" }}
            >
              <input type="checkbox" name="ativo" defaultChecked={currentSession?.ativo ?? true} />
              <span>Sessão ativa</span>
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button type="submit" className="profile-form-btn profile-form-btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconSave size={16} />
                {isEditing ? "Salvar alterações" : "Salvar sessão"}
              </button>
            </div>
          </form>

          {!isEditing && (
            <form action={createMusicaSessaoAction} style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-medium)" }}>
              <button type="submit" className="profile-form-btn profile-form-btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconPlus size={16} />
                Gerar nova sessão
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default function NovoSessaoPage(props: PageProps) {
  return (
    <AdminModuleGate
      permission="pode_publicar"
      profiles={["diretoria", "secretaria", "comunicacao"]}
      redirectPath="/admin/reuniao-publica/musica/sessoes"
      title="Nova sessão"
    >
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>}>
        <NovoSessaoContent {...props} />
      </Suspense>
    </AdminModuleGate>
  );
}
