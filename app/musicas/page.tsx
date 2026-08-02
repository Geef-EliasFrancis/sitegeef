import type { Metadata } from "next";
import { MusicasCatalog } from "@/components/musicas/musicas-catalog";
import { getMusicaExibicaoPublicaAtual, listPublicMusicas } from "@/lib/musicas";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Músicas - GEEF",
    description: "Catálogo de músicas do GEEF com busca por autor, título e trecho da letra.",
  };
}

export default async function MusicasPage() {
  const [musicas, exibicaoPublica] = await Promise.all([
    listPublicMusicas(),
    getMusicaExibicaoPublicaAtual(),
  ]);

  return (
    <main className="public-page public-page--animated public-page--compact">
      <section className="content-hero public-hero-shell">
        <div className="musica-catalog-header">
          <MusicasCatalog musicas={musicas} activeMusicaId={exibicaoPublica?.musica?.id ?? null} />
        </div>
      </section>

      <section className="public-showcase">
        {/* Conteúdo renderizado pelo MusicasCatalog */}
      </section>
    </main>
  );
}
