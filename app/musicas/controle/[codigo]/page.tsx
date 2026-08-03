import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminModuleGate } from "@/components/admin/admin-module-gate";
import { getMusicaSessaoByCodigo, listPublicMusicas } from "@/lib/musicas";
import { MusicaControlRemote } from "@/components/musicas/musica-control-remote";

type PageProps = {
  params: Promise<{ codigo: string }>;
};

export const metadata = {
  title: "Controle de Sessão - GEEF",
  description: "Interface de controle remoto para gerenciar a reprodução de músicas.",
};

async function ControlContent({ codigo }: { codigo: string }) {
  const [sessao, musicas] = await Promise.all([getMusicaSessaoByCodigo(codigo), listPublicMusicas()]);

  if (!sessao) {
    notFound();
  }

  return <MusicaControlRemote codigo={codigo} initialSessao={sessao} musicas={musicas} />;
}

export default async function MusicaControlPage({ params }: PageProps) {
  const { codigo } = await params;

  return (
    <AdminModuleGate
      permission="pode_publicar"
      profiles={["diretoria", "comunicacao", "secretaria"]}
      redirectPath={`/reuniao-publica/musicas/controle/${codigo}`}
      title="Controle de sessão"
    >
      <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Carregando sessão...</div>}>
        <ControlContent codigo={codigo} />
      </Suspense>
    </AdminModuleGate>
  );
}
