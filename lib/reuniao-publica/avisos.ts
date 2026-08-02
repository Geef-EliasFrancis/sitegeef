import { schedule } from "@/lib/site-data";

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

export function mergeAvisosComAgenda(
  publicacoes: Array<{
    id: string;
    titulo: string;
    conteudo?: string | null;
    status?: string | null;
    autor?: { nome?: string | null } | string | null;
    publicado_em?: string | null;
  }>,
) {
  const avisos = getAgendaAvisos();
  const titulos = new Set(avisos.map((aviso) => aviso.titulo.trim().toLocaleLowerCase("pt-BR")));

  for (const publicacao of publicacoes) {
    const chave = publicacao.titulo.trim().toLocaleLowerCase("pt-BR");
    if (titulos.has(chave)) continue;

    avisos.push({
      id: publicacao.id,
      titulo: publicacao.titulo,
      conteudo: publicacao.conteudo || "",
      status: publicacao.status === "publicado" ? "publicado" : "rascunho",
      origem: "reuniao",
      autor: typeof publicacao.autor === "string" ? publicacao.autor : publicacao.autor?.nome,
      publicadoEm: publicacao.publicado_em,
    });
    titulos.add(chave);
  }

  return avisos;
}
