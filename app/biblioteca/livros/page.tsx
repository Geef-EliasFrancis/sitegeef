import type { Metadata } from "next";
import Link from "next/link";
import { countAvailableLibraryCopies, listPublicLibraryBooks } from "@/lib/biblioteca/public-biblioteca";

export const metadata: Metadata = {
  title: "Livros | Biblioteca GEEF",
  description: "Consulte os livros disponíveis no acervo da biblioteca do GEEF.",
};

type SearchParams = { busca?: string };

export default async function BibliotecaLivrosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { busca = "" } = await searchParams;
  const books = await listPublicLibraryBooks(busca);

  return (
    <main className="public-page public-page--animated biblioteca-books-page">
      <section className="content-hero biblioteca-books-hero">
        <div className="content-hero-body">
          <div className="content-copy">
            <p className="eyebrow">Biblioteca</p>
            <h1>Livros</h1>
            <div className="content-copy-body">
              <p className="content-summary">Conheça o acervo disponível no GEEF.</p>
            </div>
          </div>
          <Link href="/biblioteca/leitor" className="button button-secondary biblioteca-books-reader-link">Área do leitor</Link>
        </div>
      </section>

      <section className="biblioteca-books-catalog" aria-labelledby="biblioteca-books-title">
        <div className="biblioteca-books-section-heading">
          <div>
            <h2 id="biblioteca-books-title">Acervo</h2>
            <p>{books.length} {books.length === 1 ? "livro encontrado" : "livros encontrados"}</p>
          </div>
          <form method="get" className="biblioteca-books-search" role="search">
            <label htmlFor="biblioteca-books-search-input">Buscar por título, autor ou categoria</label>
            <div>
              <input id="biblioteca-books-search-input" name="busca" defaultValue={busca} placeholder="Buscar livros..." />
              <button type="submit" className="button button-primary">Buscar</button>
            </div>
          </form>
        </div>

        {books.length === 0 ? (
          <div className="biblioteca-books-empty">
            <h2>{busca ? "Nenhum livro encontrado" : "Nenhum livro cadastrado"}</h2>
            <p>{busca ? "Tente outro título, autor ou categoria." : "O catálogo será exibido assim que houver obras cadastradas no acervo."}</p>
          </div>
        ) : (
          <div className="biblioteca-books-grid">
            {books.map((book) => {
              const available = countAvailableLibraryCopies(book);
              return (
                <article key={book.id} className="biblioteca-book-card">
                  <div className="biblioteca-book-card-header">
                    <h3>{book.titulo}</h3>
                    <span className={`biblioteca-book-status${available ? " is-available" : ""}`}>{available ? `${available} disponível${available === 1 ? "" : "eis"}` : "Indisponível"}</span>
                  </div>
                  {book.autor && <p className="biblioteca-book-author">{book.autor}</p>}
                  <div className="biblioteca-book-meta">
                    {book.categoria && <span>{book.categoria}</span>}
                    {book.publico && <span>{book.publico}</span>}
                  </div>
                  {book.sinopse && <p className="biblioteca-book-summary">{book.sinopse}</p>}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
