# ✅ Deploy Automático - Guia Completo

## Status: Totalmente Configurado

O site GEEF agora tem deploy **100% automático** com 3 estágios de validação e retry.

---

## 🔄 Fluxo Completo

```
git push origin main
    ↓
[GITHUB ACTIONS - STAGE 1: VALIDAÇÃO]
├─ Checkout código
├─ Setup Node.js 22
├─ Instalar dependências (npm ci)
├─ Criar .env.local com variáveis públicas Supabase
├─ Lint check (npm run agent:lint)
├─ Build projeto (npm run build)
└─ Upload logs se falhar
    ↓
[GITHUB ACTIONS - STAGE 2: PRÉ-DEPLOY]
├─ Build novamente (verificação)
├─ Validar .next/standalone/
├─ Retry automático até 3x se falhar
└─ Upload logs de cada tentativa
    ↓
[GITHUB ACTIONS - STAGE 3: DEPLOY]
├─ Setup SSH
├─ Conectar ao VPS (204.216.166.12)
├─ Executar deploy.sh
│  ├─ Pull do código
│  ├─ Criar .env.local
│  ├─ npm ci
│  ├─ npm build (com validação)
│  ├─ PM2 delete sitegeef
│  ├─ PM2 start npm -- run start:standalone
│  ├─ PM2 startup (auto-restart após reboot)
│  ├─ PM2 save
│  └─ Health check (curl http://localhost:3500)
├─ Retry automático até 3x se falhar
└─ Upload logs de cada tentativa
    ↓
✅ Site atualizado em https://www.geef.com.br
```

---

## 📋 Pré-requisitos Implementados

### GitHub Secrets (✅ Configurados)
```
GEEF_VPS_HOST = 204.216.166.12
GEEF_VPS_USER = ubuntu
GEEF_VPS_PATH = /home/ubuntu/sitegeef
GEEF_VPS_SSH_KEY = [chave privada RSA]
GEEF_SUPABASE_SERVICE_ROLE_KEY = [chave do Supabase]
```

### Variáveis de Ambiente (✅ Configuradas)

**No GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
- `NEXT_PUBLIC_SITE_URL` = https://www.geef.com.br
- `NEXT_PUBLIC_SUPABASE_URL` = https://nycgpokqlmrfzegjlrwa.supabase.co
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = [chave pública]
- `SUPABASE_SERVICE_ROLE_KEY` = [do secret GEEF_SUPABASE_SERVICE_ROLE_KEY]

**No VPS** (via `deploy.sh`):
- Mesmas variáveis criadas em `.env.local` antes do build

### VPS Setup (✅ Pronto)
- ✅ SSH key autorizada em `~/.ssh/authorized_keys`
- ✅ PM2 instalado globalmente
- ✅ `deploy.sh` com permissão de execução
- ✅ PM2 configurado para auto-startup no reboot

---

## 🚀 Como Funciona Agora

### 1. Developer faz push
```bash
git push origin main
```

### 2. GitHub Actions executa automaticamente
- **Validação**: Verifica se o código compila
- **Pré-Deploy**: Confirma artefatos
- **Deploy**: Envia para VPS e reinicia a app

### 3. No VPS, o `deploy.sh`:
1. **Pull** do código mais recente
2. **Cria `.env.local`** com credenciais
3. **Instala** dependências (npm ci)
4. **Builda** aplicação (npm run build)
5. **Valida** se `.next/standalone/` foi criado
6. **Para** processo antigo (pm2 delete)
7. **Inicia** nova versão com PM2
8. **Configura** auto-startup para após reboot
9. **Verifica** se app está respondendo (health check)
10. **Reporta** status final

### 4. Auto-recovery
- Se qualquer estágio falhar, o workflow **retenta até 3x**
- Logs são salvos como artefatos para debug
- Se tudo falhar, você recebe notificação no GitHub Actions

---

## ✨ Melhorias Recentes

### Deploy Script (`deploy.sh`)
- ✅ Validação de build (verifica `.next/standalone`)
- ✅ Limpeza correta (pm2 delete antes de pm2 start)
- ✅ Delays entre operações (sleep 2-3s) para estabilidade
- ✅ PM2 auto-startup com systemd (`pm2 startup`)
- ✅ Salva configuração PM2 (`pm2 save`)
- ✅ Health check melhorado (verifica HTTP 200/301/302)
- ✅ Mensagens helpful ao final

### Workflow (`.github/workflows/deploy.yml`)
- ✅ 3 estágios independentes
- ✅ Retry automático (até 3 tentativas por estágio)
- ✅ Cria `.env.local` antes do build
- ✅ Environment variables corretas
- ✅ Upload de logs para debugging

### Configuração Supabase (`supabase/config.toml`)
- ✅ Removida sintaxe inválida de `[functions]`
- ✅ Função de notificações continua operacional

---

## 📊 Monitoramento

### Ver logs do deploy
```bash
# No seu computador:
# GitHub Actions → https://github.com/Geef-EliasFrancis/sitegeef/actions

# No VPS via SSH:
pm2 logs sitegeef          # Logs em tempo real
pm2 logs sitegeef -n 100   # Últimas 100 linhas
pm2 monit                  # Monitor em tempo real
```

### Status da aplicação
```bash
# No VPS:
pm2 status                 # Status de todos processos
pm2 describe sitegeef      # Detalhes do sitegeef
curl http://localhost:3500 # Verificar se está respondendo
```

---

## 🔍 Troubleshooting

### Se o deploy falhar

1. **Verificar logs no GitHub**
   - Vá para Actions → último run
   - Clique no estágio que falhou
   - Abra o step específico para ver erro
   - Download `build-logs` ou `deploy-logs` artefatos

2. **Verificar aplicação no VPS**
   ```bash
   ssh -i .secrets/ssh/oracle_geef/vps_geef/ssh-key-geefvps-2026-05-09.key ubuntu@204.216.166.12
   
   # No VPS:
   cd /home/ubuntu/sitegeef
   pm2 logs sitegeef --lines 50
   pm2 status
   ```

3. **Problemas comuns**
   - ❌ `NEXT_PUBLIC_SUPABASE_URL não definido`: verificar secret `GEEF_SUPABASE_SERVICE_ROLE_KEY`
   - ❌ `.next/standalone não existe`: build falhou, ver build-logs
   - ❌ Porta 3500 já em uso: `pm2 kill` e tentar novamente
   - ❌ PM2 não inicia: SSH no VPS e `npm install -g pm2` se necessário

---

## 🔐 Segurança

✅ **Implementado:**
- SSH keys em GitHub Secrets (não em git)
- Chave privada nunca é loggada
- Timeout nas conexões SSH (10s)
- StrictHostKeyChecking ativado
- Logs são deletados após 7 dias

⚠️ **Atenção:**
- Variáveis públicas (`NEXT_PUBLIC_*`) são visíveis no código
- Service role key é privada, mantém segura!
- Não commitar `.env` ou `.env.local`

---

## 📈 Performance

**Tempo esperado:**
- Estágio 1 (Validação): 2-3 min
- Estágio 2 (Pré-Deploy): 1-2 min
- Estágio 3 (Deploy): 2-3 min
- **Total: 5-8 minutos** até site atualizado

---

## ✅ Checklist de Verificação

- [x] GitHub Secrets configurados (GEEF_VPS_*)
- [x] Workflow com 3 estágios + retry
- [x] Variáveis de ambiente no workflow
- [x] `deploy.sh` com validações
- [x] PM2 instalado no VPS
- [x] PM2 auto-startup configurado
- [x] `.env.local` criado dinamicamente
- [x] Health check implementado
- [x] Supabase config.toml válido
- [x] Logs salvos como artefatos

---

## 🎯 Próximos Passos Opcionais

- [ ] Configurar Slack/Email notificações no GitHub
- [ ] Blue-green deployment (2 versões paralelas)
- [ ] Rollback automático se health check falhar
- [ ] Monitoring com Grafana/DataDog
- [ ] Alertas automáticos para falhas

---

**Última atualização**: 2026-05-16  
**Status**: ✅ Totalmente operacional
