# Guia de Testes — GEEF ERP Sistema

**Servidor Local:** `http://localhost:3500`
**Status:** ✅ Operacional

---

## 1️⃣ Iniciar Servidor Local

```bash
npm run dev
# Servidor inicia na porta 3500
```

**Verificar se está rodando:**
```bash
curl http://localhost:3500/
# Deve retornar a página home com status 200
```

---

## 2️⃣ Acessar Funcionalidades Públicas

### Home Page
```
http://localhost:3500/
```
Elementos visíveis:
- Logo GEEF
- Menu de navegação
- Links para seções públicas

### Escalas Públicas
```
http://localhost:3500/escalas
```
- Visualizar escalas do mês/ano
- Filtrar por mês
- Ver detalhes de reuniões

### Área do Leitor
```
http://localhost:3500/leitor
```
- Consultar empréstimos
- Renovar livros
- Ver histórico

### Página Institucional
```
http://localhost:3500/institucional
```
- Informações sobre GEEF
- Filiações e credibilidade

---

## 3️⃣ Testar Admin Panel (Requer Autenticação)

### Opção A: Usar Supabase Real

1. **Criar usuário de teste no Supabase:**
   - Ir para: `https://supabase.com` → Dashboard
   - Projeto: `nycgpokqlmrfzegjlrwa`
   - Authentication → Users
   - Criar novo usuário com email: `teste@geef.local`

2. **Acessar login:**
   ```
   http://localhost:3500/login
   ```

3. **Fazer login com teste@geef.local**

4. **Acessar admin:**
   ```
   http://localhost:3500/admin
   ```

### Opção B: Usar Token JWT (Desenvolvimento)

Se tiver token JWT válido, pode injetar via localStorage:

```javascript
// No console do navegador
localStorage.setItem('sb-nycgpokqlmrfzegjlrwa-auth-token', 
  JSON.stringify({
    access_token: 'seu_token_aqui',
    refresh_token: 'refresh_token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600
  })
);
window.location.href = '/admin';
```

---

## 4️⃣ Testar Módulos Admin

### Dashboard
```
http://localhost:3500/admin
```
✅ Confirmações visualizáveis:
- Cards de estatísticas
- Sidebar com 29 módulos
- Header com usuário

### Escalas (Operação)
```
http://localhost:3500/admin/escalas
```
- Montar nova escala
- Ver escalas existentes
- Editar funções/temas

### Pessoas
```
http://localhost:3500/admin/pessoas
```
- Listar pessoas ativas
- Criar nova pessoa
- Editar dados pessoais

### Relatórios
```
http://localhost:3500/admin/relatorios
```
- Visualizar estatísticas
- DRE financeiro
- Links para relatórios por módulo

### Notificações
```
http://localhost:3500/admin/notificacoes
```
- Listar notificações recebidas
- Marcar como lida
- Deletar notificação

### Módulo Restrito (Mediunidade)
```
http://localhost:3500/admin/mediunidade
```
⚠️ Requer: `pode_mediunidade = true` na tabela `usuarios_sistema`

---

## 5️⃣ Testar Funcionalidades de Design

### Responsividade
Abrir DevTools (F12) e testar em diferentes resoluções:
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

### Temas & Cores
Verificar consistência:
- ✅ Cores principais (#3b82f6, #ef4444, #22c55e)
- ✅ Espaçamento (padding, margin)
- ✅ Typography (fonts, sizes)

---

## 6️⃣ Testar RLS (Row-Level Security)

### Preparar usuários com diferentes permissões:

```sql
-- Usuário com pode_mediunidade
UPDATE usuarios_sistema 
SET pode_mediunidade = true 
WHERE id = 'uuid-usuario-1';

-- Usuário com pode_atendimento
UPDATE usuarios_sistema 
SET pode_atendimento = true 
WHERE id = 'uuid-usuario-2';

-- Usuário sem permissões
UPDATE usuarios_sistema 
SET pode_mediunidade = false, pode_atendimento = false 
WHERE id = 'uuid-usuario-3';
```

### Testes esperados:
- ✅ Usuário com `pode_mediunidade` acessa `/admin/mediunidade`
- ❌ Usuário sem permissão vê "Acesso Negado"
- ✅ RLS impede acesso aos dados nas queries ao banco

---

## 7️⃣ Testar Edge Functions (Notificações)

### Criar notificação manualmente:

```typescript
// No console do browser (após fazer login)
fetch('/api/admin/notificacoes/criar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pessoa_id: 'uuid-da-pessoa',
    titulo: 'Teste de Notificação',
    mensagem: 'Esta é uma notificação de teste',
    tipo: 'info',
    canal: 'interno'
  })
});
```

### Verificar envio de email:
1. Configurar `RESEND_API_KEY` em Supabase secrets
2. Invocar Edge Function:
```bash
curl -X POST http://localhost:3500/api/notificacoes/enviar \
  -H "Authorization: Bearer seu-token"
```

---

## 8️⃣ Testar Relatórios em PDF

### Acessar página de relatórios:
```
http://localhost:3500/admin/relatorios
```

### Exportar DRE:
1. Navegar para Relatórios → Links para DRE
2. Clicar em "Exportar PDF" ou usar Print (Ctrl+P)
3. Selecionar "Salvar como PDF"

---

## 9️⃣ Checklist de Testes

### Rotas Públicas
- [ ] Home page carrega
- [ ] Menu de navegação funciona
- [ ] Escalas públicas carregam
- [ ] Área do leitor acessível
- [ ] Página institucional exibe info

### Autenticação
- [ ] Login funciona com email válido
- [ ] Redirecionamento para /admin após login
- [ ] Logout limpa sessão
- [ ] Protected routes redirecionam corretamente

### Admin Panel
- [ ] Dashboard exibe estatísticas
- [ ] Sidebar mostra 29 módulos
- [ ] Navegação entre módulos funciona
- [ ] Formulários renderizam corretamente
- [ ] Tabelas exibem dados

### Funcionalidades Avançadas
- [ ] Módulos restritos validam permissões
- [ ] RLS impede acesso não autorizado
- [ ] Notificações criadas aparecem no painel
- [ ] Relatórios exportam em PDF
- [ ] Permissões granulares funcionam

### Design & UX
- [ ] Responsive em desktop/tablet/mobile
- [ ] Cores e espaçamento consistentes
- [ ] Componentes acessíveis
- [ ] Carregamento suave (Suspense)
- [ ] Mensagens de erro claras

---

## 🐛 Reportar Problemas

Se encontrar erro durante testes:

1. **Verificar logs do servidor:**
```bash
npm run dev 2>&1 | tee debug.log
```

2. **Verificar console do navegador:** F12 → Console
3. **Verificar rede:** F12 → Network

4. **Criar issue:**
```markdown
## Problema
[Descrição do erro]

## Passos para reproduzir
1. ...
2. ...
3. ...

## Resultado esperado
[O que deveria acontecer]

## Resultado atual
[O que está acontecendo]

## Logs
[Colar logs relevantes]
```

---

## 📞 Suporte

- **Documentação:** Ler `TESTING_REPORT.md`
- **Código:** Ver comentários em `app/admin/**`
- **Database:** Acessar Supabase Dashboard

---

**Status Atual:** ✅ Sistema operacional, pronto para testes completos

**Última atualização:** 16 de maio de 2026
