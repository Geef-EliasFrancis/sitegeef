import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type PublicLibraryBook = {
  id: string;
  titulo: string;
  autor: string | null;
  editora: string | null;
  categoria: string | null;
  sinopse: string | null;
  capa_url: string | null;
  publico: string | null;
  exemplares: Array<{ id: string; situacao: string | null }>;
};

async function loadPublicLibraryBooks() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("obras")
    .select("id, titulo, autor, editora, categoria, sinopse, capa_url, publico, exemplares(id, situacao)")
    .eq("ativo", true)
    .order("titulo");

  if (error) return [];
  return (data ?? []) as PublicLibraryBook[];
}

const getCachedPublicLibraryBooks = unstable_cache(loadPublicLibraryBooks, ["public-library-books"], {
  revalidate: 60,
  tags: ["public-library-books"],
});

export async function listPublicLibraryBooks(search?: string) {
  const books = await getCachedPublicLibraryBooks();
  const normalizedSearch = search?.trim().toLocaleLowerCase("pt-BR");

  if (!normalizedSearch) return books;

  return books.filter((book) => [book.titulo, book.autor, book.categoria].some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedSearch)));
}

export function countAvailableLibraryCopies(book: PublicLibraryBook) {
  return book.exemplares.filter((exemplar) => exemplar.situacao === "disponivel").length;
}
