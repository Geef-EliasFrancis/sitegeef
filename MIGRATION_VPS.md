# 🔄 Guia de Migração entre VPS

**Documento criado para evitar regressão.** Siga este guia ao trocar de VPS.

## ⚠️ Mudanças Críticas Documentadas

### De: Oracle Cloud (204.216.166.12) ❌
### Para: Hetzner/Novo Provedor (78.142.242.236) ✅

**Data da migração**: 2026-05-16

---

## 📋 Checklist de Migração

### Antes de desligar o VPS antigo

- [ ] Novo VPS criado e configurado
- [ ] Node.js 22 instalado
- [ ] Docker instalado
- [ ] SSH key testada
- [ ] DNS atualizado apontando para novo IP

### Atualizar Documentação

- [ ] `DEPLOY.md` — Novo IP e fluxo GitHub Actions
- [ ] `DEPLOY_AUTOMATION.md` — Fluxo principal de CI/CD
- [ ] `README.md` — Se houver referência a VPS antigo
- [ ] `docs/archive/legacy/baseinicial.md` — Referência histórica de VPS

### Atualizar Configurações

- [ ] **Cloudflare DNS**: Novo IP do VPS
- [ ] **GitHub Secrets** (se usar GitHub Actions):
  - `GEEF_VPS_HOST` = novo IP
  - `GEEF_VPS_USER` = novo usuário
  - `GEEF_VPS_PATH` = novo caminho

### Testar novo VPS

- [ ] SSH conecta e funciona
- [ ] Docker funciona
- [ ] Primeiro deploy bem-sucedido
- [ ] Site acessível em https://www.geef.com.br
- [ ] Health check passa

### Desligar VPS antigo

- [ ] Confirmar que novo VPS está estável (24h+)
- [ ] Fazer backup de dados importantes (se houver)
- [ ] Desligar instância antiga
- [ ] Aguardar 24h antes de deletar

---

## 🔍 Como Identificar Qual VPS está em uso

### Verificar DNS atual

```bash
nslookup www.geef.com.br
# ou
dig www.geef.com.br
```

**Resultado deve mostrar o IP do VPS ativo.**

### Verificar via curl

```bash
curl -v https://www.geef.com.br 2>&1 | grep "Connected to"
```

---

## 🚨 Erros Comuns a Evitar

### ❌ Erro 1: Esquecer de atualizar DNS

**Sintoma**: Site fica offline ou aponta para VPS antigo  
**Solução**: Sempre atualizar DNS ANTES de fazer deploy no novo VPS

### ❌ Erro 2: Cloudflare Tunnel apontando para VPS antigo

**Sintoma**: Erro 1033 do Cloudflare  
**Solução**: 
- Remover configuração de Cloudflare Tunnel
- Usar DNS direto (tipo `A`) para novo IP
- Não usar CNAME para Cloudflare Tunnel

### ❌ Erro 3: Variáveis de ambiente não configuradas

**Sintoma**: Build falha ou site retorna erro 500  
**Solução**: Adicionar todas as variáveis ANTES de fazer deploy

### ❌ Erro 4: Dockerfile não existe

**Sintoma**: GitHub Actions não consegue fazer build  
**Solução**: Commit do Dockerfile deve estar no repositório

### ❌ Erro 5: Remover GitHub Actions sem testar o novo fluxo

**Sintoma**: Não consegue fazer deploy quando o workflow principal é removido  
**Solução**: Testar o fluxo completo ANTES de remover GitHub Actions

---

## 📝 Documentação por VPS

### Oracle Cloud (204.216.166.12) - ANTIGO

```
Status: ❌ OFFLINE (desde 2026-05-16)
Motivo: Instância de teste, problemas de estabilidade
Deploy: GitHub Actions + SSH
```

### Hetzner/Novo (78.142.242.236) - ATIVO

```
Status: ✅ ATIVO
Provedor: Hetzner (ou similar)
Deploy: GitHub Actions + SSH + Docker
DNS: Apontado direto (sem Cloudflare Tunnel)
```

---

## 🔄 Próxima Migração (Se necessário)

Ao migrar para outro VPS:

1. **ANTES de fazer qualquer mudança:**
   - Ler este documento inteiro
   - Preparar novo VPS
   - Testar SSH
   - Testar DNS

2. **Fazer mudanças na ordem:**
   - Configurar novo VPS
   - Atualizar DNS
   - Rodar deploy via GitHub Actions
   - Testar site
   - Atualizar documentação
   - Desligar VPS antigo

3. **Documentar a mudança:**
   - Atualizar este arquivo
   - Atualizar `DEPLOY.md`
   - Atualizar IP em qualquer referência
   - Fazer commit com mensagem clara

---

## 📚 Documentos Relacionados

- `DEPLOY.md` — Setup e troubleshooting
- `DEPLOY_AUTOMATION.md` — Workflow de CI/CD (se usar GitHub Actions)
- `README.md` — Informações gerais do projeto

---

**Última atualização**: 2026-05-16  
**Próxima revisão recomendada**: Ao migrar para novo VPS
