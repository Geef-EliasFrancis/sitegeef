import { Suspense } from "react";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { MusicasCatalogTable } from "@/components/admin/musicas/musicas-catalog-table";
import { getMusicaExibicaoPublicaAtual, listMusicas } from "@/lib/musicas";

export const metadata = {
  title: "Músicas - Reunião pública - Admin GEEF",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ q?: string; salvo?: string }>;
};

async function MusicasContent({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q : "";
  const isSaved = params.salvo === "1";

  const [musicas, exibicaoAtual] = await Promise.all([listMusicas(), getMusicaExibicaoPublicaAtual()]);

  return (
    <MusicasCatalogTable
      musicas={musicas}
      musicaAtivaId={exibicaoAtual?.musica?.id ?? null}
      initialQuery={q}
      isSaved={isSaved}
    />
  );
}

export default function MusicasPage(props: PageProps) {
  return (
    <AdminModuleGate
      permission="pode_publicar"
      profiles={["diretoria", "secretaria", "comunicacao"]}
      redirectPath="/admin/reuniao-publica/musica"
      title="Músicas"
    >
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>}>
        <MusicasContent {...props} />
      </Suspense>
    </AdminModuleGate>
  );
}
