import { ReuniaoPublicaPresentation } from "@/components/reuniao-publica-presentation";
import { listReuniaoPublicaAvisos } from "@/lib/reuniao-publica/avisos";

export const metadata = {
  title: "Ao vivo - Reunião pública - GEEF",
  description: "Apresentação ao vivo da reunião pública do GEEF.",
};

export const dynamic = "force-dynamic";

export default async function ReuniaoPublicaPage() {
  const avisos = (await listReuniaoPublicaAvisos(true)).map(({ id, titulo, conteudo }) => ({ id, titulo, conteudo }));

  return <ReuniaoPublicaPresentation avisos={avisos} />;
}
