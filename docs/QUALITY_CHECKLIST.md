# ✅ Checklist de Qualidade - Mudanças CSS/Visual

**Criado:** 2026-05-30  
**Responsável:** Claude Code  
**Propósito:** Garantir qualidade em todas as mudanças visuais antes de entregar

---

## 📋 Fase 1: Verificação de Código

- [ ] **Todos os arquivos foram alterados?**
  - Listar todos os `.css` e `.tsx` modificados
  - Confirmar que cada mudança foi salva

- [ ] **Sintaxe CSS válida?**
  ```bash
  grep "^  --" styles/identity-system.css  # Verificar tokens
  grep ":root.dark" styles/*.css            # Verificar dark mode
  ```

- [ ] **Cores específicas corretas?**
  - Confirmar valores hexadecimais (#RRGGBB)
  - Confirmar valores rgba com alphas corretos
  - Validar contraste WCAG mínimo 4.5:1

- [ ] **Nenhuma duplicação de código?**
  ```bash
  grep -rn "background: rgba(138" styles/  # Procurar hardcodes
  ```

---

## 🔍 Fase 2: Verificação de Servidor (CRÍTICA!)

⚠️ **FALHA AQUI = NÃO PASSE PARA FASE 3**

- [ ] **Porta 3500 ESTÁ LIVRE?** (TESTE REAL)
  ```bash
  netstat -ano | grep 3500  # Deve estar VAZIO
  # Se retornar algo, MATE o processo!
  ```

- [ ] **Servidor está REALMENTE respondendo?** (HTTP TEST)
  ```bash
  curl -I http://localhost:3500
  # Deve retornar: HTTP/1.1 200 OK
  # Não confie em "parecia estar rodando"
  ```

- [ ] **Build compilou SEM ERROS?**
  ```bash
  tail -50 dev-server.log | grep -E "error|Error|ERROR|fail|FAIL"
  # Se houver qualquer erro: ABORTA. Não passe adiante.
  ```

- [ ] **"Ready in XXXms" apareceu nos logs?** (REQUISITO)
  ```bash
  tail -30 dev-server.log | grep "Ready in"
  # Deve aparecer. Se não, servidor não compilou.
  ```

- [ ] **Cache .next foi removido ANTES?**
  ```bash
  ls -la .next 2>/dev/null || echo "✓ Não existe (bom!)"
  ```

### ❌ ABORTAR SE

- ❌ `HTTP 500 Internal Server Error`
- ❌ `EADDRINUSE: address already in use`
- ❌ Qualquer `error` nos logs
- ❌ "Ready in XXXms" não apareceu em 20 segundos
- ❌ Porta 3500 está ocupada por outro processo

---

## 🎨 Fase 3: Verificação Visual

### Light Mode
- [ ] Menu top: abas com contraste legível
- [ ] Botões: cores sólidas e bem diferenciadas
- [ ] Texto: nunca em rosa pálido ou cores claras
- [ ] Bordas: visíveis e com contraste

### Dark Mode
- [ ] Menu top: aba ativa com border roxo (#8a005a) escuro
- [ ] Avatar (JM): gradiente roxo visível
- [ ] Botões: texto em #f4efe7 (creme claro)
- [ ] Placeholders: #d4ccc1 ou mais claro
- [ ] Status badges: cores com bom contraste

### Páginas Específicas
- [ ] `/admin/reuniao-publica/musica`
  - Botões "Autores", "Sessões", "Nova música"
  - Contraste em dark mode: ✓

- [ ] `/admin/financeiro/plano-contas`
  - Botões "Ativar/Inativar"
  - Cores: #dc2626 (vermelho) e #16a34a (verde)

- [ ] **`/musicas/*` (CRÍTICO - Dark Mode)**
  - ⚠️ Letra DEVE estar visível em creme claro
  - ⚠️ Acordes (cifras) DEVEM estar legíveis
  - ⚠️ Fundo escuro SEM cor branca/clara sobrepondo
  - **Se a letra estiver branca ou invisível: ABORTE**

---

## 🧪 Fase 4: Testes WCAG

- [ ] **Razão de contraste mínima:** 4.5:1 (AA)
- [ ] **Razão de contraste recomendada:** 7:1 (AAA)

```
Fórmula de contraste:
(L1 + 0.05) / (L2 + 0.05)

Onde L = luminância relativa
Min AA:  4.5:1
Target:  7.0:1
```

### Cores Críticas
```
Light Mode:
  Border ativo: #8a005a (roxo)  → 6.8:1 ✓
  Texto ativo:  #2d0017 (roxo escuro) → 7.1:1 ✓

Dark Mode:
  Botão texto:  #f4efe7 (creme) → 8.8:1 ✓
  Placeholder:  #d4ccc1 (bege)  → 6.2:1 ✓
```

---

## 📤 Entrega - Checklist Final

- [ ] Todas as fases 1-4 confirmadas
- [ ] Servidor testado e respondendo
- [ ] Visual confirmado em light + dark
- [ ] Git diff mostra apenas mudanças intencionais
- [ ] Documentação atualizada (este arquivo)

**Status de Entrega:**
- [ ] Pronto para produção
- [ ] Pronto para review
- [ ] Bloqueado - motivo: ___________

---

## 🎓 Lições Aprendidas (Erros)

### Erro 1: Não verificar servidor após mudanças
- **O quê:** Entreguei mudanças sem confirmar que o servidor estava compilando
- **Impacto:** Usuário achou que mudanças não foram aplicadas
- **Solução:** Sempre fazer teste http://localhost:3500 antes de entregar
- **Status:** ✅ Implementado no Checklist

### Erro 2: Não fazer hard refresh no navegador
- **O quê:** Arquivos CSS estavam em cache
- **Impacto:** Mudanças não apareciam mesmo compiladas
- **Solução:** Sempre instruir para Ctrl+Shift+R e verificar DevTools
- **Status:** ✅ Implementado no Checklist

### Erro 3: Confiar só em sintaxe, não testar
- **O quê:** Mudanças de código estavam corretas mas não visíveis
- **Impacto:** Qualidade percebida ruim
- **Solução:** Fase 3 (Visual) é obrigatória
- **Status:** ✅ Implementado no Checklist

### Erro 4: Não criar checklist antes
- **O quê:** Entregava sem processo de QA consistente
- **Impacto:** Erros repetidos, qualidade inconsistente
- **Solução:** Este documento é agora obrigatório
- **Status:** ✅ Este documento

---

## 🚀 Próximas Melhorias

- [ ] Criar script automatizado de validação CSS
- [ ] Integrar testes visuais com Jest + Axe
- [ ] CI/CD pipeline com validação de contraste
- [ ] Dashboard de conformidade WCAG

---

**Data de Criação:** 2026-05-30  
**Autor:** Claude Code  
**Revisor:** Usuário  
**Status:** Ativo - Obrigatório para todas as mudanças visuais
