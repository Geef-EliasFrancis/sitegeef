import { getPublicacoes } from "@/app/admin/comunicacao/actions";
import { ReuniaoPublicaPresentation } from "@/components/reuniao-publica-presentation";

export const metadata = {
  title: "Ao vivo - Reunião pública - GEEF",
  description: "Apresentação ao vivo da reunião pública do GEEF.",
};

export const dynamic = "force-dynamic";

type Aviso = {
  id: string;
  titulo: string;
  conteudo?: string | null;
};

export default async function ReuniaoPublicaPage() {
  const publicacoes = (await getPublicacoes("publicado")) as Array<Aviso & { tipo?: string | null }>;
  const avisos = publicacoes
    .filter((publicacao) => publicacao.tipo === "aviso")
    .map(({ id, titulo, conteudo }) => ({ id, titulo, conteudo }));

  return <ReuniaoPublicaPresentation avisos={avisos} />;
}
