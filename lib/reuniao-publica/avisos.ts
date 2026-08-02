import { schedule } from "@/lib/site-data";
import { listPersistedAvisos } from "@/lib/reuniao-publica/avisos-repository";

export type ReuniaoPublicaAviso = {
  id: string;
  titulo: string;
  conteudo: string;
  quando?: string | null;
  status: "publicado" | "rascunho";
  origem: "agenda" | "reuniao";
  autor?: string | null;
  publicadoEm?: string | null;
};

function normalizeTitulo(titulo: string) {
  return titulo.trim().toLocaleLowerCase("pt-BR");
}

export function getAgendaAvisos(): ReuniaoPublicaAviso[] {
  return schedule.map((item, index) => ({
    id: `agenda-${index + 1}`,
    titulo: item.title,
    conteudo: item.description,
    quando: item.when,
    status: "publicado",
    origem: "agenda",
    autor: "Agenda",
  }));
}

export async function listReuniaoPublicaAvisos(publishedOnly = false) {
  const avisos = await listPersistedAvisos(publishedOnly);
  const avisosDeAgenda = getAgendaAvisos();
  const titulos = new Set(avisosDeAgenda.map((aviso) => normalizeTitulo(aviso.titulo)));

  for (const aviso of avisos) {
    const chave = normalizeTitulo(aviso.titulo);
    if (titulos.has(chave)) continue;

    avisosDeAgenda.push({
      id: aviso.id,
      titulo: aviso.titulo,
      conteudo: aviso.conteudo || "",
      quando: aviso.quando,
      status: aviso.status,
      origem: "reuniao",
      publicadoEm: aviso.publicado_em,
    });
    titulos.add(chave);
  }

  return avisosDeAgenda;
}
