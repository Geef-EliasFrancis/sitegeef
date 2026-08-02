import { listContatoMensagens } from "@/lib/contato-mensagens-repository";

export type ContatoMensagem = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
  pagina_origem: string | null;
  canal: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
  respondido_em: string | null;
  referer: string | null;
};

export async function loadContatoMensagensAdmin() {
  try {
    const { data, error } = await listContatoMensagens();

    if (error) {
      return [];
    }

    return (data ?? []) as ContatoMensagem[];
  } catch {
    return [];
  }
}
