import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Reunião pública - GEEF",
  description: "Início da reunião pública do GEEF.",
};

export default function ReuniaoPublicaPage() {
  return (
    <main className="reuniao-publica-home">
      <section className="reuniao-publica-home-card">
        <Image
          src="/brand/logo-oficial-transparent.png"
          alt="GEEF"
          width={300}
          height={130}
          priority
        />
        <div>
          <span className="reuniao-publica-kicker">Reunião pública</span>
          <h1>Início</h1>
          <p>Organize a apresentação, os avisos e as músicas da reunião.</p>
        </div>
        <Link href="/reuniao-publica/live" className="reuniao-publica-primary-action">
          Abrir ao vivo
        </Link>
      </section>
    </main>
  );
}
