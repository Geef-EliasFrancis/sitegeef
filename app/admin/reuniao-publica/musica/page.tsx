import { redirect } from "next/navigation";

export const metadata = {
  title: "Músicas - Admin GEEF",
};

export default function MusicaPage() {
  redirect("/admin/reuniao-publica/musica/inicio");
}
