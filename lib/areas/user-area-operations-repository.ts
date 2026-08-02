import type { SupabaseClient } from "@supabase/supabase-js";

export async function loadUserAreaOperations(
  supabase: SupabaseClient,
  pessoaId: string,
  access: { biblioteca?: boolean | null; livraria?: boolean | null; escalas?: boolean | null },
) {
  return Promise.all([
    access.biblioteca ? supabase.from("emprestimos").select("id, data_retirada, prazo_devolucao, status, exemplares (codigo, obra:obras (titulo, autor))").eq("pessoa_id", pessoaId).eq("status", "em_aberto").order("prazo_devolucao", { ascending: true }) : Promise.resolve({ data: [] as unknown[] }),
    access.biblioteca ? supabase.from("reservas").select("id, posicao_fila, criado_em, obras (titulo, autor)").eq("pessoa_id", pessoaId).eq("status", "aguardando").order("posicao_fila", { ascending: true }) : Promise.resolve({ data: [] as unknown[] }),
    access.livraria ? supabase.from("movimentos_livraria").select("id, tipo, quantidade, valor_total, criado_em, produtos_livraria (titulo, autor)").eq("pessoa_id", pessoaId).order("criado_em", { ascending: false }).limit(10) : Promise.resolve({ data: [] as unknown[] }),
    access.escalas ? supabase.from("escala_funcoes").select("id, observacao, reunioes (data, escala:escalas_mensais (mes, ano)), funcoes (nome)").eq("pessoa_id", pessoaId).order("reunioes(data)", { ascending: false }).limit(10) : Promise.resolve({ data: [] as unknown[] }),
  ]);
}
