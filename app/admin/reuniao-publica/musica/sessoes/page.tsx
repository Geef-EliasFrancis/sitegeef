import Link from "next/link";
import { Suspense } from "react";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { AdminPageTitleAdd } from '@/components/admin/admin-page-title-add';
import { EncerrarMusicasSessoesButton } from "@/components/admin/encerrar-musicas-sessoes-button";
import { SessoesList } from "@/components/admin/musicas/sessoes-list";
import { encerrarTodasMusicaSessoesAction } from "../actions";
import { getMusicasResumo, listMusicaSessoes } from "@/lib/musicas";

export const metadata = {
  title: "Sessões e controle - Admin GEEF",
};

async function SessoesContent() {
  const [sessoes, musicasResumo] = await Promise.all([listMusicaSessoes(), getMusicasResumo()]);
  const sessoesAtivas = sessoes.filter((sessao) => sessao.ativo);
  const sessoesAtivasLabel = sessoesAtivas.length === 1 ? "1 sessão ativa" : `${sessoesAtivas.length} sessões ativas`;

  return (
    <div className="area-page">
      <AdminPageTitleAdd title="Sessões e controle" href="/admin/reuniao-publica/musica/sessoes/novo" label="Adicionar sessão" />

      <section className="area-section">
        <div className="stat-grid">
          <div className="stat-card">
            <span>Sessões criadas</span>
            <strong>{sessoes.length}</strong>
          </div>
          <div className="stat-card">
            <span>Ativas</span>
            <strong>{sessoes.filter((s) => s.ativo).length}</strong>
          </div>
          <div className="stat-card">
            <span>Modo exibição</span>
            <strong>{sessoes.filter((s) => s.modo === "exibicao").length}</strong>
          </div>
          <div className="stat-card">
            <span>Modo catálogo</span>
            <strong>{sessoes.filter((s) => s.modo === "catalogo").length}</strong>
          </div>
        </div>
        <div
          className="admin-card"
          style={{
            marginTop: "1rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Encerramento em lote</h2>
            <p style={{ margin: "0.35rem 0 0", color: "var(--text-muted)" }}>
              {sessoesAtivasLabel} serão encerradas de uma vez.
            </p>
          </div>
          <EncerrarMusicasSessoesButton
            action={encerrarTodasMusicaSessoesAction}
            disabled={sessoesAtivas.length === 0}
            count={sessoesAtivas.length}
          />
        </div>
      </section>

      <section className="area-section">
        <h2 style={{ margin: '0 0 1rem' }}>Sessões ativas</h2>

        <div className="admin-card table-surface">
          <div className="area-section-title">
            <p>Clique em uma sessão para editar, abrir o controle ou a exibição pública.</p>
          </div>

          {sessoes.length === 0 ? (
            <div className="area-empty">
              <p>Nenhuma sessão criada ainda.</p>
            </div>
          ) : (
            <SessoesList initialSessoes={sessoes} musicas={musicasResumo} />
          )}
        </div>
      </section>
    </div>
  );
}

export default function SessoesPage() {
  return (
    <AdminModuleGate
      permission="pode_publicar"
      profiles={["diretoria", "secretaria", "comunicacao"]}
      redirectPath="/admin/reuniao-publica/musica/sessoes"
      title="Sessões"
    >
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>}>
        <SessoesContent />
      </Suspense>
    </AdminModuleGate>
  );
}
