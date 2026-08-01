# 🚀 Workflow de Deploy em 3 Estágios

Novo fluxo de CI/CD com validação automática, retry e deploy inteligente.

## 📊 Estágios do Workflow

### **Estágio 1: VALIDAÇÃO** ✅
Executa quando você faz `git push origin main`

```
├─ Checkout do código
├─ Setup Node.js 22
├─ Install dependências (npm ci)
├─ Lint check (agent:lint)
├─ Build projeto (npm run build)
└─ Upload logs se falhar
```

**Se falhar:**
- ❌ Workflow para
- 📋 Build logs salvos como artefato
- 🔍 Você pode baixar e debugar

**Se passar:**
- ✅ Continua para Estágio 2

---

### **Estágio 2: PRÉ-DEPLOY** 🔧
Verificações adicionais com retry automático (até 3 tentativas)

```
├─ Build novamente (verificação)
├─ Validar artefatos (.next/)
├─ Retry automático se falhar
└─ Retry com delay de 10s
```

**Se falhar 3x:**
- ❌ Workflow para
- 📋 Logs disponíveis para debug

**Se passar:**
- ✅ Continua para Estágio 3

---

### **Estágio 3: DEPLOY** 🚀
Deploy ao VPS com retry automático (até 3 tentativas)

```
├─ Setup SSH
├─ Connect ao VPS (204.216.166.12)
├─ Pull código: git pull
├─ Install: npm ci
├─ Build: npm run build
├─ Restart: pm2 restart sitegeef
├─ Health check
└─ Retry automático se falhar
```

**Se falhar:**
- ⚠️ Tenta novamente (com delay de 15s)
- 📋 Logs de cada tentativa salvos

**Se passar:**
- ✅ SUCESSO!
- 🌐 geef.com.br atualizado

---

## 📈 Fluxo Completo

```
git push origin main
    ↓
[ESTÁGIO 1: VALIDAÇÃO]
  ├─ Build e lint
  ├─ Se erro → PARA + Logs
  └─ Se OK → Continua
    ↓
[ESTÁGIO 2: PRÉ-DEPLOY]
  ├─ Verificação adicional
  ├─ Retry até 3x se falhar
  ├─ Se erro após 3x → PARA + Logs
  └─ Se OK → Continua
    ↓
[ESTÁGIO 3: DEPLOY]
  ├─ SSH no VPS
  ├─ Pull + Build + Restart
  ├─ Retry até 3x se falhar
  ├─ Se erro após 3x → PARA + Logs
  └─ Se OK → SUCESSO!
    ↓
✅ NOTIFICAÇÃO FINAL
```

---

## 🔧 Configuração Necessária

### GitHub Secrets (Settings → Secrets → Actions)

| Secret | Valor | Exemplo |
|--------|-------|---------|
| `GEEF_VPS_HOST` | IP do servidor | `204.216.166.12` |
| `GEEF_VPS_USER` | Usuário SSH | `ubuntu` |
| `GEEF_VPS_PATH` | Caminho do projeto | `/home/ubuntu/sitegeef` |
| `GEEF_VPS_SSH_KEY` | Chave privada RSA | `-----BEGIN RSA...` |

### VPS Setup

```bash
# No servidor (ssh ubuntu@204.216.166.12)

# 1. Garantir permissão de execução
chmod +x /home/ubuntu/sitegeef/deploy.sh

# 2. Instalar PM2 (se não tiver)
npm install -g pm2

# 3. Configurar SSH key
mkdir -p ~/.ssh
# Cole a chave pública em ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## 📋 Monitorar Workflow

### No GitHub:
1. Vá para: **Actions** → **Build, Validate & Deploy**
2. Clique no último run
3. Veja o progresso dos 3 estágios

### Ver Logs:
- Clique em cada step para expandir
- Download de artefatos (build-logs, deploy-logs)

### Ver Status Atual:
```bash
# SSH no VPS
pm2 status
pm2 logs sitegeef
```

---

## 🛠️ Troubleshooting

### Estágio 1 falha (Build Error)

```
❌ npm run build failed
```

**Solução:**
1. Download artefato `build-logs`
2. Verifique o erro
3. Corrija localmente
4. `git push` novamente

### Estágio 2 falha (Pre-Deploy)

```
❌ Build artifacts verification failed
```

**Solução:**
- Mesmo do Estágio 1
- Retry automático já tentou 3x

### Estágio 3 falha (Deploy)

```
❌ SSH connection failed
```

**Causas possíveis:**
- SSH key incorreta
- Host SSH_KNOWN_HOSTS inválido
- VPS down

**Solução:**
```bash
# Teste SSH manualmente
ssh -i ~/.ssh/geef-deploy ubuntu@204.216.166.12

# Verifique se PM2 está rodando
pm2 list

# Verifique espaço em disco
df -h
```

### Deploy OK mas site não atualiza

```bash
# No VPS, verifique logs
pm2 logs sitegeef -n 100

# Restart manual
pm2 restart sitegeef
```

---

## ✨ Dicas

### Forçar rebuild local antes de push
```bash
npm run build  # Valida localmente antes de push
git push origin main
```

### Cancelar workflow em execução
- GitHub Actions → Workflow → Cancel run

### Rollback manual
```bash
# No VPS
cd /home/ubuntu/sitegeef
git reset --hard HEAD~1  # Volta 1 commit
bash deploy.sh
```

---

## 📊 Métricas

**Tempo esperado:**
- Estágio 1: ~2-3 min (build)
- Estágio 2: ~1-2 min (verificação)
- Estágio 3: ~2-3 min (deploy + restart)
- **Total: ~5-8 min** até site atualizado

---

## 🔒 Segurança

✅ **Boas práticas implementadas:**
- SSH keys em GitHub Secrets (não em git)
- Timeout nas conexões SSH
- Logs deletados após 7 dias
- StrictHostKeyChecking para segurança

⚠️ **Nunca:**
- Commitar secrets no repositório
- Usar mesma SSH key para vários projetos
- Expor logs com informações sensíveis

