# Build PWA - Instruções Importantes

## ⚠️ IMPORTANTE: Usar Webpack para Builds de Produção

O `@ducanh2912/next-pwa` **NÃO é compatível com Turbopack** (padrão no Next.js 16).

Para gerar o service worker corretamente, você **DEVE** usar webpack no build de produção.

## Comandos de Build

### Build Local (para testar PWA):
```bash
cd frontend
npx next build --webpack
npm run start
```

### Build para Deploy (Vercel/outros):

**Opção 1 - Via package.json (Recomendado)**

Adicione no `package.json`:
```json
{
  "scripts": {
    "build": "next build --webpack",
    "build:turbo": "next build"
  }
}
```

Então:
```bash
npm run build
```

**Opção 2 - Variável de Ambiente Vercel**

Se estiver usando Vercel, adicione nas configurações do projeto:
- **Environment Variable**: `VERCEL_TURBO_BUILD_ONLY_NODE_MODULES` = `0`

Ou adicione no arquivo `vercel.json`:
```json
{
  "buildCommand": "next build --webpack"
}
```

## Verificação do Service Worker

Após o build com webpack, verifique se foram gerados:

```bash
ls frontend/public/sw.js
ls frontend/public/workbox-*.js
```

Você deve ver:
- `sw.js` - Service worker principal
- `workbox-[hash].js` - Biblioteca Workbox

## Testando Localmente

1. Build com webpack:
   ```bash
   npx next build --webpack
   ```

2. Iniciar servidor de produção:
   ```bash
   npm run start
   ```

3. Abrir Chrome DevTools:
   - Aba **Application** → **Service Workers**
   - Verificar que SW está registrado e ativo

4. Testar instalação:
   - Chrome mostrará ícone de instalação na barra de endereços
   - Ou use **Application** → **Manifest** para testar

## Lighthouse PWA Audit

Para verificar pontuação PWA:

```bash
# Via CLI
npx lighthouse http://localhost:3000 --view --preset=pwa

# Ou via Chrome DevTools → Lighthouse → PWA
```

Meta: **100/100** score

## Deploy na Vercel

### Configuração Automática

Crie `vercel.json` na raiz do projeto:

```json
{
  "buildCommand": "cd frontend && next build --webpack",
  "devCommand": "cd frontend && next dev",
  "installCommand": "cd frontend && npm install",
  "framework": null
}
```

### Via Dashboard Vercel

1. Vá em **Settings** → **General**
2. **Build & Development Settings**:
   - **Framework Preset**: Next.js
   - **Build Command**: `cd frontend && next build --webpack`
   - **Output Directory**: `frontend/.next`
   - **Install Command**: `cd frontend && npm install`

## Troubleshooting

### Service Worker não está sendo gerado

**Problema**: Arquivos `sw.js` e `workbox-*.js` não aparecem em `public/`

**Solução**: Você provavelmente usou Turbopack. Use:
```bash
npx next build --webpack
```

### "This site cannot be installed"

**Problema**: PWA não mostra opção de instalação

**Causas comuns**:
1. Service worker não foi registrado (veja acima)
2. Manifest.json tem erro (verifique no DevTools → Application → Manifest)
3. Ícones não foram encontrados (erro 404 nos ícones)
4. Site não está em HTTPS (exceto localhost)

**Verificar**:
```bash
# Verificar se ícones existem
ls frontend/public/icons/*.png

# Verificar manifest
cat frontend/public/manifest.json
```

### Lighthouse mostra "Service worker does not successfully serve the manifest's start_url"

**Solução**: Isso pode acontecer se:
- Service worker não está cacheando a rota `/dashboard` corretamente
- Verifique se o service worker está ativo no DevTools
- Limpe o cache e teste novamente

### PWA funciona local mas não em produção

**Causas**:
1. **Build foi feito com Turbopack** - Use `--webpack`
2. **HTTPS não configurado** - Vercel configura automaticamente
3. **Cache antigo** - Limpe cache do navegador e do SW

## Estratégias de Cache Implementadas

O service worker usa as seguintes estratégias:

| Tipo | Padrão | Cache Name | Expiração |
|------|--------|------------|-----------|
| APIs Supabase | Network First | supabase-api | 24h |
| APIs Backend | Network First | backend-api | 24h |
| Assets (JS/CSS) | Cache First | static-assets | 1 ano |
| Imagens | Cache First | image-cache | 30 dias |
| Páginas | Network First | pages-cache | 24h |

## Modo Desenvolvimento vs Produção

- **Development** (`npm run dev`): PWA **desabilitado** para não interferir no hot reload
- **Production** (`npm run start`): PWA **habilitado** com service worker ativo

## Limpando Cache do Service Worker

Para testar atualizações do SW localmente:

1. Chrome DevTools → Application → Service Workers
2. Clicar em **Unregister**
3. Application → Clear storage → **Clear site data**
4. Recarregar a página

Ou via código (adicionar temporariamente):
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

## Comandos Úteis de Build

```bash
# Build com webpack (gera PWA)
npx next build --webpack

# Build com Turbopack (NÃO gera PWA)
npx next build --turbopack

# Build padrão (usa Turbopack no Next.js 16)
npm run build

# Servidor de produção local
npm run start

# Desenvolvimento (PWA desabilitado)
npm run dev

# Limpar build anterior
rm -rf .next

# Verificar se SW foi gerado
ls public/sw.js public/workbox-*.js
```

## Checklist de Deploy

- [ ] Build feito com `--webpack`
- [ ] Arquivos `sw.js` e `workbox-*.js` existem em `public/`
- [ ] Manifest.json válido (sem erros no DevTools)
- [ ] Todos os ícones PNG existem em `public/icons/`
- [ ] Site acessível via HTTPS (Vercel faz automaticamente)
- [ ] Service worker registra no DevTools → Application
- [ ] Lighthouse PWA score = 100/100
- [ ] Botão "Instalar" aparece no navegador
- [ ] App abre em modo standalone após instalação
- [ ] Funciona offline (testar com DevTools → Network → Offline)

## Referências

- [Next PWA Docs](https://github.com/DuCanhGH/next-pwa)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest Reference](https://developer.mozilla.org/en-US/docs/Web/Manifest)
