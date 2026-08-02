import Image from "next/image";
import Link from "next/link";
import { IconMusic } from "@/components/icons";

type Aviso = { id: string; titulo: string; conteudo?: string | null };

export function ReuniaoPublicaSlide({ slideId, avisos }: { slideId: string; avisos: Aviso[] }) {
  if (slideId === "abertura") {
    return <div className="reuniao-publica-opening"><Image src="/brand/logo-oficial-transparent.png" alt="GEEF" width={540} height={234} priority /><p>Grupo de Estudos Espíritas Elias Francis</p></div>;
  }

  if (slideId === "musicas") {
    return <div className="reuniao-publica-content"><span className="reuniao-publica-kicker">Reunião pública</span><h1>Músicas ao vivo</h1><p>Abra a playlist pública para acompanhar as músicas selecionadas.</p><Link href="/musicas/exibir" target="_blank" rel="noreferrer" className="reuniao-publica-primary-action"><IconMusic size={22} /> Abrir músicas ao vivo</Link></div>;
  }

  if (slideId === "inicio") {
    return <div className="reuniao-publica-content"><span className="reuniao-publica-kicker">Reunião pública</span><h1>Início da reunião</h1><p>Seja bem-vindo. Use as setas ou o controle para avançar a apresentação.</p></div>;
  }

  return <div className="reuniao-publica-content reuniao-publica-content--wide"><span className="reuniao-publica-kicker">Reunião pública</span><h1>Avisos da reunião</h1>{avisos.length > 0 ? <div className="reuniao-publica-notices">{avisos.map((aviso) => <article key={aviso.id} className="reuniao-publica-notice"><h2>{aviso.titulo}</h2>{aviso.conteudo && <p>{aviso.conteudo}</p>}</article>)}</div> : <p>Nenhum aviso publicado para esta reunião.</p>}</div>;
}
