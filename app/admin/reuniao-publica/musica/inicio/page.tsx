import { Suspense } from "react";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { getMusicaExibicaoPublicaAtual, listMusicas } from "@/lib/musicas";

export const metadata = {
  title: "Início - Músicas - Admin GEEF",
};

export const dynamic = "force-dynamic";

async function MusicaInicioContent() {
  const [musicas, exibicaoAtual] = await Promise.all([listMusicas(), getMusicaExibicaoPublicaAtual()]);
  const ativas = musicas.filter((musica) => musica.status === "ativa").length;
  const autores = new Set(musicas.map((musica) => musica.autor.trim()).filter(Boolean)).size;
  const comLetra = musicas.filter((musica) => musica.partes.length > 0).length;

  return (
    <div className="area-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-dashboard-kicker">Músicas</span>
          <h1 className="admin-page-title">Início</h1>
          <p className="admin-page-subtitle">Visão geral do catálogo e da exibição pública.</p>
        </div>
      </div>

      <section className="area-section">
        <div className="stat-grid">
          <div className="stat-card"><span>Músicas cadastradas</span><strong>{musicas.length}</strong></div>
          <div className="stat-card"><span>Músicas ativas</span><strong>{ativas}</strong></div>
          <div className="stat-card"><span>Autores</span><strong>{autores}</strong></div>
          <div className="stat-card"><span>Com letra</span><strong>{comLetra}</strong></div>
        </div>
      </section>

      <section className="admin-card music-module-summary">
        <span className="admin-dashboard-kicker">Exibição pública</span>
        <h2>{exibicaoAtual?.musica?.titulo ?? "Nenhuma música em exibição"}</h2>
        <p>{exibicaoAtual?.musica?.autor ?? "Selecione uma música no catálogo para iniciar a reunião."}</p>
      </section>
    </div>
  );
}

export default function MusicaInicioPage() {
  return (
    <AdminModuleGate
      permission="pode_publicar"
      profiles={["diretoria", "secretaria", "comunicacao"]}
      redirectPath="/admin/reuniao-publica/musica/inicio"
      title="Músicas"
    >
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>}>
        <MusicaInicioContent />
      </Suspense>
    </AdminModuleGate>
  );
}
