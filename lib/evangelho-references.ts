export type EvangelhoReference = {
  chapter: number;
  chapterLabel: string;
  chapterTitle: string;
  item: number;
  reference: string;
  title: string;
  purpose: string;
};

type ChapterDefinition = {
  chapter: number;
  title: string;
  itemCount: number;
};

const chapters: ChapterDefinition[] = [
  { chapter: 1, title: "Não vim destruir a lei", itemCount: 11 },
  { chapter: 2, title: "Meu Reino não é deste mundo", itemCount: 8 },
  { chapter: 3, title: "Há muitas moradas na casa de meu Pai", itemCount: 19 },
  { chapter: 4, title: "Ninguém poderá ver o Reino de Deus se não nascer de novo", itemCount: 26 },
  { chapter: 5, title: "Bem-aventurados os aflitos", itemCount: 31 },
  { chapter: 6, title: "O Cristo consolador", itemCount: 8 },
  { chapter: 7, title: "Bem-aventurados os pobres de espírito", itemCount: 13 },
  { chapter: 8, title: "Bem-aventurados os que têm puro o coração", itemCount: 21 },
  { chapter: 9, title: "Bem-aventurados os que são brandos e pacíficos", itemCount: 10 },
  { chapter: 10, title: "Bem-aventurados os que são misericordiosos", itemCount: 21 },
  { chapter: 11, title: "Amar o próximo como a si mesmo", itemCount: 15 },
  { chapter: 12, title: "Amai os vossos inimigos", itemCount: 16 },
  { chapter: 13, title: "Não saiba a vossa mão esquerda o que dê a vossa mão direita", itemCount: 20 },
  { chapter: 14, title: "Honrai a vosso pai e a vossa mãe", itemCount: 9 },
  { chapter: 15, title: "Fora da caridade não há salvação", itemCount: 10 },
  { chapter: 16, title: "Não se pode servir a Deus e a Mamon", itemCount: 15 },
  { chapter: 17, title: "Sede perfeitos", itemCount: 11 },
  { chapter: 18, title: "Muitos os chamados, poucos os escolhidos", itemCount: 16 },
  { chapter: 19, title: "A fé transporta montanhas", itemCount: 12 },
  { chapter: 20, title: "Trabalhadores da última hora", itemCount: 5 },
  { chapter: 21, title: "Haverá falsos cristos e falsos profetas", itemCount: 11 },
  { chapter: 22, title: "Não separeis o que Deus juntou", itemCount: 5 },
  { chapter: 23, title: "Moral estranha", itemCount: 18 },
  { chapter: 24, title: "Não ponhais a candeia debaixo do alqueire", itemCount: 19 },
  { chapter: 25, title: "Buscai e achareis", itemCount: 11 },
  { chapter: 26, title: "Dai gratuitamente o que gratuitamente recebestes", itemCount: 10 },
  { chapter: 27, title: "Pedi e obtereis", itemCount: 23 },
  { chapter: 28, title: "Coletânea de preces espíritas", itemCount: 84 },
];

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII"];

export const evangelhoReferences: EvangelhoReference[] = chapters.flatMap((chapter) => Array.from({ length: chapter.itemCount }, (_, index) => {
  const item = index + 1;
  const chapterLabel = `Capítulo ${romanNumerals[chapter.chapter - 1]}`;
  return {
    chapter: chapter.chapter,
    chapterLabel,
    chapterTitle: chapter.title,
    item,
    reference: `${chapterLabel} · item ${item}`,
    title: chapter.title,
    purpose: `Leia o item ${item} no seu exemplar e conversem brevemente sobre o ensino moral e uma forma possível de vivenciá-lo nesta semana.`,
  };
}));

export const EVANGELHO_REFERENCE_COUNT = evangelhoReferences.length;

export const EVANGELHO_REFERENCE_SOURCE = "https://www.febnet.org.br/wp-content/uploads/2014/05/O-evangelho-segundo-o-espiritismo.pdf";
