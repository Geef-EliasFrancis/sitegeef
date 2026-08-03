import { MusicaPassesPlayer } from "@/components/musicas/musica-passes-player";
import { listMusicaPasses } from "@/lib/musica-passes";

export const metadata = { title: "Passes - Músicas GEEF" };

export default async function MusicaPassesPage() {
  return <main className="public-page public-page--compact"><section className="content-hero public-hero-shell"><div className="musica-catalog-header"><div className="musica-toolbar"><div className="musica-toolbar-title"><h1>Passes</h1></div></div><MusicaPassesPlayer items={await listMusicaPasses()} /></div></section></main>;
}
