# Plano de Implementação: PWA Install Hint & Deep Linking

## Resumo Executivo

Implementar duas features críticas para o PWA Lifty:
1. **Install Prompts**: Banners/hints ensinando a instalar o PWA no mobile
2. **Deep Linking**: Links do WhatsApp abrem direto no PWA instalado (não no browser)

**Preferências do usuário:**
- iOS: Banner no topo (não bloqueia conteúdo)
- Timing: Aparecer após 5 segundos de visualização
- Implementação: Tudo junto em uma entrega

## Contexto

### Infraestrutura Atual
- **InstallPrompt existente**: `frontend/components/InstallPrompt.tsx` - já funciona no dashboard
- **Share page**: `frontend/app/share/[token]/page.tsx` - ponto crítico de entrada de novos usuários
- **PWA completo**: manifest.json, service worker (Workbox), ícones, caching configurado
- **Deployment**: Vercel (frontend), domain via `FRONTEND_URL` env var

### Gaps Identificados
1. Nenhum install prompt na share page (onde usuários chegam via WhatsApp)
2. iOS Safari não tem guia de instalação (Safari não suporta `beforeinstallprompt`)
3. Sem configuração de deep linking (arquivos `.well-known` ausentes)
4. Links externos abrem no browser, não no PWA instalado

## Implementação

### Fase 1: Install Prompts (80% do valor)

#### 1.1 Criar Componente iOS Install Banner

**Novo arquivo**: `frontend/components/IOSInstallBanner.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detectar iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone ||
                        window.matchMedia('(display-mode: standalone)').matches;

    if (!isIOS || isStandalone) {
      return;
    }

    // Verificar cooldown (7 dias)
    const dismissedUntil = localStorage.getItem('ios-install-dismissed-until');
    const now = Date.now();

    if (dismissedUntil && now < parseInt(dismissedUntil)) {
      return;
    }

    // Mostrar após 5 segundos
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    const sevenDaysFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('ios-install-dismissed-until', sevenDaysFromNow.toString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 shadow-lg animate-slide-down">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 text-sm">
          <Share size={18} className="shrink-0" />
          <span>
            Instale o app: toque em <Share size={14} className="inline mx-0.5" /> e depois em
            <span className="font-bold mx-1">Adicionar à Tela Inicial</span>
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
```

**Design**:
- Banner fixo no topo, fundo preto (slate-900), texto branco
- Ícone de compartilhar + instrução em português
- Botão X para fechar, salva cooldown de 7 dias
- Animação de slide down suave
- Não bloqueia conteúdo (fica por cima, mas é fino)

#### 1.2 Atualizar InstallPrompt para Contextos

**Modificar**: `frontend/components/InstallPrompt.tsx`

**Mudanças**:
1. Adicionar prop `context: 'dashboard' | 'share'`
2. Adicionar delay de 5 segundos para context='share'
3. Mudar de dismissal permanente para cooldown de 7 dias
4. Mensagens diferentes por contexto

**Alterações específicas**:

```typescript
interface InstallPromptProps {
  context?: 'dashboard' | 'share';
}

export function InstallPrompt({ context = 'dashboard' }: InstallPromptProps) {
  // ... código existente ...

  useEffect(() => {
    // ... código existente de beforeinstallprompt ...

    // ADICIONAR: Delay de 5 segundos se context='share'
    if (context === 'share') {
      const timer = setTimeout(() => {
        // Verificar condições e mostrar prompt
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [context]);

  const handleDismiss = () => {
    // MUDAR de: localStorage.setItem('pwa-install-dismissed', 'true')
    // PARA: 7 dias de cooldown
    const sevenDaysFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-dismissed-until', sevenDaysFromNow.toString());
    setShowPrompt(false);
  };

  // ATUALIZAR mensagens
  const getMessage = () => {
    if (context === 'share') {
      return 'Instale o Lifty para importar este programa e acompanhar seus treinos';
    }
    return 'Instalar Lifty'; // mensagem atual do dashboard
  };
}
```

**Linha específica a modificar**: ~linha 15-40 (lógica de detecção)

#### 1.3 Adicionar Prompts na Share Page

**Modificar**: `frontend/app/share/[token]/page.tsx`

**Adicionar imports** (linha ~17):
```typescript
import { InstallPrompt } from '@/components/InstallPrompt';
import { IOSInstallBanner } from '@/components/IOSInstallBanner';
```

**Adicionar componentes no JSX** (linha ~250, antes de `</main>`):
```typescript
                {/* Install Prompts */}
                <InstallPrompt context="share" />
                <IOSInstallBanner />
            </main>
        </div>
```

#### 1.4 Atualizar Dashboard com Context

**Modificar**: `frontend/app/dashboard/page.tsx`

**Linha 108** (onde InstallPrompt já é usado):
```typescript
<InstallPrompt context="dashboard" />
```

### Fase 2: Deep Linking (20% do valor, 100% da complexidade)

#### 2.1 Criar Android Asset Links

**Novo arquivo**: `frontend/public/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "web",
    "site": "https://lifty-rust.vercel.app"
  }
}]
```

**IMPORTANTE**: Substituir `lifty-rust.vercel.app` pelo domínio real de produção.

#### 2.2 Criar iOS Universal Links

**Novo arquivo**: `frontend/public/.well-known/apple-app-site-association` (SEM extensão .json)

```json
{
  "applinks": {
    "apps": [],
    "details": []
  },
  "webcredentials": {
    "apps": []
  }
}
```

**Nota**: Para PWAs puros (sem wrapper nativo), este arquivo é mínimo. Se no futuro usar Capacitor/TWA, adicionar team IDs e bundle identifiers.

#### 2.3 Atualizar Manifest.json

**Modificar**: `frontend/public/manifest.json`

**Adicionar** após linha 11 (`"orientation": "portrait"`):
```json
  "handle_links": "preferred",
```

**Resultado esperado**:
```json
{
  "name": "Lifty - Controle de Treinos",
  "short_name": "Lifty",
  "start_url": "/dashboard",
  "display": "standalone",
  "scope": "/",
  "orientation": "portrait",
  "handle_links": "preferred",
  "theme_color": "#0f172a",
  ...
}
```

#### 2.4 Criar Vercel Configuration

**Novo arquivo**: `vercel.json` (na raiz do projeto frontend)

```json
{
  "headers": [
    {
      "source": "/.well-known/apple-app-site-association",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    },
    {
      "source": "/.well-known/assetlinks.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

**Propósito**: Garantir que os arquivos `.well-known` sejam servidos com Content-Type correto para validação de deep linking.

#### 2.5 Adicionar Animação Slide Down (CSS)

**Modificar**: `frontend/app/globals.css`

**Adicionar** no final do arquivo:
```css
@keyframes slide-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}
```

## Arquivos Críticos

### Novos Arquivos (4)
1. `frontend/components/IOSInstallBanner.tsx` - Banner iOS no topo
2. `frontend/public/.well-known/assetlinks.json` - Android deep linking
3. `frontend/public/.well-known/apple-app-site-association` - iOS deep linking
4. `frontend/vercel.json` - Headers para .well-known

### Arquivos Modificados (5)
1. `frontend/components/InstallPrompt.tsx` - Adicionar context prop + delay + cooldown
2. `frontend/app/share/[token]/page.tsx` - Adicionar prompts (2 linhas import + 2 linhas JSX)
3. `frontend/app/dashboard/page.tsx` - Adicionar context="dashboard" (1 linha)
4. `frontend/public/manifest.json` - Adicionar handle_links (1 linha)
5. `frontend/app/globals.css` - Adicionar animação slide-down

## Verificação & Testes

### 1. Testes Locais (Dev)

**Prompt Android (Chrome DevTools):**
```bash
1. Abrir Chrome DevTools → Application → Manifest
2. Verificar "Update on reload" está marcado
3. Navegar para http://localhost:3000/share/[test-token] em modo anônimo
4. Aguardar 5 segundos
5. Verificar se InstallPrompt aparece na base
6. Clicar "Instalar" → prompt nativo deve aparecer
7. Dispensar → aguardar 7 dias ou limpar localStorage para testar novamente
```

**Prompt iOS (Safari no iPhone real):**
```bash
1. Abrir Safari no iPhone (não funciona em simulador)
2. Navegar para http://[IP-LOCAL]:3000/share/[test-token]
3. Aguardar 5 segundos
4. Verificar se IOSInstallBanner aparece no topo
5. Seguir instruções manualmente: Share → Add to Home Screen
6. Abrir PWA instalado → banners não devem aparecer
```

### 2. Testes de Produção

**Verificar arquivos .well-known acessíveis:**
```bash
curl -I https://lifty-rust.vercel.app/.well-known/assetlinks.json
# Esperar: HTTP/2 200, Content-Type: application/json

curl -I https://lifty-rust.vercel.app/.well-known/apple-app-site-association
# Esperar: HTTP/2 200, Content-Type: application/json
```

**Validar Android Asset Links:**
- Tool: https://developers.google.com/digital-asset-links/tools/generator
- Input: Domain + assetlinks.json content
- Esperar: "Valid" status

**Validar iOS Universal Links:**
- Tool: https://getuniversal.link/
- Input: Domain
- Esperar: Valid AASA file detected

### 3. Teste End-to-End Deep Linking

**Android (Chrome):**
```bash
1. Instalar PWA do Chrome (via prompt ou manual)
2. Enviar link via WhatsApp: https://lifty-rust.vercel.app/share/[token]
3. Clicar link no WhatsApp
4. ESPERADO: Abre direto no PWA instalado (não no Chrome browser)
5. FALLBACK: Se não instalado, abre no browser com install prompt
```

**iOS (Safari):**
```bash
1. Instalar PWA do Safari (Add to Home Screen)
2. Enviar link via iMessage: https://lifty-rust.vercel.app/share/[token]
3. Clicar link no iMessage
4. ESPERADO: Pode abrir no Safari primeiro, depois redirecionar para PWA
5. NOTA: iOS deep linking para PWA é menos confiável que Android
```

### 4. Matriz de Teste

| Plataforma | Browser | PWA Instalado? | Ação | Resultado Esperado |
|------------|---------|----------------|------|--------------------|
| Android | Chrome | Não | Abrir share link | Browser + InstallPrompt após 5s |
| Android | Chrome | Sim | Abrir share link | Abre direto no PWA |
| iOS | Safari | Não | Abrir share link | Safari + IOSInstallBanner após 5s |
| iOS | Safari | Sim | Abrir share link | Safari → pode redirecionar para PWA |
| Desktop | Chrome | Não | Abrir share link | Browser + InstallPrompt após 5s |

## Configuração de Ambiente

### Variáveis de Ambiente a Verificar

**Backend (`backend/.env`):**
```bash
FRONTEND_URL=https://lifty-rust.vercel.app  # SEM /login no final!
```

**Frontend (`frontend/.env.local`):**
```bash
NEXT_PUBLIC_API_URL=https://[backend-url]/api
```

### Deploy Checklist

1. ✅ Commit todos os arquivos novos e modificados
2. ✅ Verificar que `FRONTEND_URL` no backend NÃO tem `/login`
3. ✅ Deploy do frontend (Vercel auto-deploy)
4. ✅ Aguardar build completar
5. ✅ Testar `.well-known` files acessíveis (curl)
6. ✅ Validar assetlinks.json e AASA com tools online
7. ✅ Aguardar 24-48h para Android Digital Asset Links validar (cache)
8. ✅ Testar install prompts em dispositivos reais
9. ✅ Testar deep linking com WhatsApp real

## Limitações Conhecidas

### iOS
- Safari não suporta `beforeinstallprompt` (por isso criamos IOSInstallBanner)
- Deep linking em PWAs iOS é menos confiável que Android
- Universal Links podem levar horas para propagar (cache iOS)
- Apenas Safari pode instalar PWAs (Chrome/Firefox iOS não podem)

### Android
- Digital Asset Links validation pode levar 24-48 horas após deploy
- Funciona bem apenas no Chrome/Edge
- Outros browsers Android (Firefox, Opera) podem não suportar

### Geral
- localStorage em modo privado pode falhar (wrap em try-catch se necessário)
- Deep linking REQUER HTTPS (não funciona em localhost)
- Cooldown de 7 dias é fixo (pode ser ajustado depois baseado em métricas)

## Rollback

Se algo der errado:

1. **Install Prompts**:
   - Remover imports de `share/[token]/page.tsx`
   - Comportamento volta ao anterior (só dashboard tem prompt)
   - Sem perda de dados

2. **Deep Linking**:
   - Deletar `frontend/public/.well-known/` folder
   - Deletar/reverter `vercel.json`
   - Reverter `manifest.json` (remover `handle_links`)
   - Links voltam a abrir no browser (comportamento original)

```bash
# Rollback rápido
git checkout HEAD -- frontend/public/manifest.json
rm -rf frontend/public/.well-known
rm frontend/vercel.json
git push
```

## Métricas de Sucesso

**Curto prazo (1 semana):**
- Install prompt impression rate > 80% (dos elegíveis)
- Install click-through rate > 10% (Android)
- iOS banner não causa rejeição/bounces

**Médio prazo (1 mês):**
- Taxa de instalação de PWA aumenta 20%
- 50% dos links de share no Android abrem no PWA (para usuários com PWA instalado)
- Taxa de importação de programas compartilhados aumenta 15%

**Longo prazo (3 meses):**
- Crescimento viral: share links geram 30% dos novos usuários
- Retenção D7 de usuários via share aumenta 25%
- Deep linking funciona em 70%+ dos casos Android

## Próximos Passos (Pós-Implementação)

1. **Analytics**: Adicionar tracking de eventos (prompt shown, dismissed, installed)
2. **A/B Testing**: Testar diferentes mensagens e timings
3. **Otimização**: Ajustar delay de 5s baseado em engagement real
4. **Share Target API**: Permitir compartilhar para dentro do Lifty PWA
5. **Badging API**: Mostrar contador de notificações no ícone do app

---

## Resumo de Comandos

```bash
# Criar estrutura de diretórios
mkdir -p frontend/public/.well-known

# Criar arquivos (via editor ou Write tool)
# - frontend/components/IOSInstallBanner.tsx
# - frontend/public/.well-known/assetlinks.json
# - frontend/public/.well-known/apple-app-site-association
# - frontend/vercel.json

# Modificar arquivos existentes
# - frontend/components/InstallPrompt.tsx
# - frontend/app/share/[token]/page.tsx
# - frontend/app/dashboard/page.tsx
# - frontend/public/manifest.json
# - frontend/app/globals.css

# Build e teste local
cd frontend
npm run build
npm run start

# Deploy (Vercel auto-deploy ao push)
git add .
git commit -m "feat: add PWA install prompts and deep linking"
git push origin main

# Verificar deploy
curl -I https://lifty-rust.vercel.app/.well-known/assetlinks.json
curl -I https://lifty-rust.vercel.app/.well-known/apple-app-site-association
```

---

**Estimativa de tempo**: 2-3 horas de implementação + 1 hora de testes locais + 24-48h de validação Android
