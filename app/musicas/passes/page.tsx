import { MusicaPassesPlayer } from "@/components/musicas/musica-passes-player";
import { listMusicaPasses } from "@/lib/musica-passes";

export const metadata = { title: "Músicas para passe espiritual - GEEF" };

export default async function MusicaPassesPage() {
  const passes = await listMusicaPasses();

  return (
    <main className="public-page public-page--compact">
      <section className="content-hero public-hero-shell">
        <div className="musica-catalog-header">
          <div className="musica-toolbar">
            <div className="musica-toolbar-title">
              <h1>Músicas para passe espiritual</h1>
            </div>
          </div>
          <MusicaPassesPlayer items={passes} />
        </div>
      </section>
    </main>
  );
}
