# Regras de Refatoração — Governança do Projeto GEEF ERP

## ⚠️ Princípio Fundamental

**Nenhuma redução de funcionalidades, campos de dados ou opções será aceita sem:**
1. Justificativa técnica clara e documentada
2. Autorização explícita do responsável do projeto
3. Plano de migração para dados existentes
4. Atualização de documentação

---

## Proibições

### ❌ Remover campos de banco de dados
- Não remover colunas da tabela sem plano de migração
- Não simplificar tipos de dados (ex: `text` → `varchar(100)`)
- Não consolidar múltiplas colunas em uma sem rastreabilidade

### ❌ Reduzir opções de seleção
- Não remover valores de `enum` ou `select` sem migração de dados
- Não simplificar campos de escolha (ex: enum com 10 opções → 3)
- Não mudar a semântica de valores existentes

### ❌ Refatorar sem documentação
- Não simplificar interfaces sem deixar registrado "por quê"
- Não consolidar formulários sem explicar a mudança
- Não remover features sem nota em HANDOFF.md ou commit message

### ❌ Simplificar UX sem consenso
- Não remover abas, menus ou seções sem aprovação
- Não mover dados para "expandir depois" sem data/responsável
- Não criar "placeholders" que aguardam implementação

---

## ✅ Como fazer refatorações seguras

### 1. Antes de começar
```
- Documentar estado atual (screenshot, schema, lista de fields)
- Avaliar impacto em dados existentes
- Listar todas as features que serão afetadas
- Obter aprovação por escrito
```

### 2. Ao fazer a mudança
```
- Criar migration SQL para dados existentes
- Manter compatibilidade (não quebrar APIs ou routes)
- Adicionar nota em commit message explicando "por quê"
- Atualizar HANDOFF.md com contexto
```

### 3. Depois da refatoração
```
- Testar migração em dados reais
- Verificar se features antigas continuam funcionando
- Validar que nenhuma informação foi perdida
- Atualizar documentação (README, CLAUDE.md, etc)
```

---

## Exemplo: Refatoração feita errado ❌

```
Versão anterior: Instituição tinha uploads de logo + estatuto
Refatoração: "Vamos simplificar para apenas texto"
Resultado: Logo e estatuto desaparecem, sem aviso

❌ Nenhuma justificativa
❌ Nenhuma migração
❌ Nenhuma autorização
❌ Features perdidas silenciosamente
```

---

## Exemplo: Refatoração feita certo ✅

```
Proposta: "Consolidar múltiplos campos de logo em um"

1. Documentar:
   - Campos atuais: logo_url, logo_com_fundo_url
   - Motivo: Reduzir complexity, automatizar geração com fundo

2. Planejar migração:
   - Criar coluna nova: logo_variants (JSON)
   - Copiar dados antigos para novo formato
   - Manter colunas antigas por 3 versões (deprecation period)

3. Implementar com segurança:
   - Migration SQL que preserva dados
   - Tests validando equivalência
   - Commit message explicando por quê e como

4. Documentar:
   - HANDOFF.md: "Logo consolidation em v2.3"
   - CLAUDE.md: Novo padrão
   - Migration guide para usuários
```

---

## Verificação de Segurança (Checklist)

Antes de fazer refatoração estrutural, responda:

- [ ] Posso listar todas as features que vão mudar?
- [ ] Tenho justificativa técnica clara (performance, segurança, DX)?
- [ ] Existe plano de migração para dados existentes?
- [ ] Consegui autorização do responsável?
- [ ] Atualizei documentação?
- [ ] Testei com dados reais?
- [ ] Deixei nota clara em commit message + HANDOFF.md?

**Se alguma resposta for "não", não faça a refatoração ainda.**

---

## Para Claude Code / Assistentes IA

Ao trabalhar neste projeto:

1. **Sempre pergunte antes de simplificar:**
   ```
   "Vejo que há 8 campos aqui. Devo consolidar em 3?"
   → STOP. Pergunte ao usuário primeiro.
   ```

2. **Mantenha tudo que existe:**
   ```
   Se há `logo_url` e `logo_com_fundo_url`, ambos devem estar no formulário.
   Não remova um porque "parece redundante".
   ```

3. **Documente mudanças estruturais:**
   ```
   Ao refatorar componentes ou rotas, adicione contexto:
   - Por quê está mudando?
   - O que muda para o usuário?
   - Há impacto em dados?
   ```

4. **Teste com dados reais:**
   ```
   Não assuma que funciona com dados de exemplo.
   Considere: dados legados, edge cases, migrações.
   ```

---

## Contato / Escalação

Dúvidas sobre se uma refatoração é permitida?

1. Verificar CLAUDE.md e este arquivo
2. Consultar HANDOFF.md para contexto histórico
3. Questionar o responsável do projeto antes de executar

**Melhor pedir permissão 10 vezes do que quebrar features uma vez.**
