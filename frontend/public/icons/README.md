# Ícones PWA para Lifty

## Ícones Necessários

Os seguintes ícones precisam ser criados para o PWA funcionar completamente:

### Ícones Android/Web (purpose: any)
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

### Ícone Maskable (purpose: maskable)
- `icon-maskable-512x512.png` (com padding de 10% para safe zone)

### Ícones Apple
- `apple-touch-icon-120x120.png`
- `apple-touch-icon-180x180.png`

### Favicon
- `favicon.ico` (colocar na raiz do diretório `public/`, não em `icons/`)

## Como Gerar os Ícones

### Opção 1: Usando ferramenta online (Recomendado)

1. Crie um logo master em 1024x1024px com:
   - Fundo: #0f172a (azul-escuro - theme_color do Lifty)
   - Símbolo/Letra: Branco ou cor clara
   - Design: Simples e reconhecível (ex: letra "L" estilizada, halteres, etc.)

2. Acesse: https://realfavicongenerator.net/

3. Faça upload do logo master

4. Configure as opções:
   - iOS: Usar o logo sem alterações
   - Android Chrome: Usar o logo sem alterações
   - Mask icon: Adicionar padding de 10%

5. Baixe o pacote gerado

6. Extraia os arquivos para este diretório (`frontend/public/icons/`)

### Opção 2: Usando CLI (pwa-asset-generator)

```bash
# Instalar a ferramenta
npm install -g pwa-asset-generator

# Gerar ícones (execute na raiz do projeto)
pwa-asset-generator logo-master.png frontend/public/icons --padding "10%" --background "#0f172a"
```

### Opção 3: Criar manualmente

Se você tiver um designer gráfico ou quiser criar os ícones manualmente:

1. Crie um design master em 1024x1024px
2. Exporte para os tamanhos listados acima
3. Para o ícone maskable, adicione 10% de padding em todos os lados
4. Salve todos os arquivos neste diretório

## Verificação

Após adicionar os ícones, verifique:

1. Todos os arquivos listados acima existem
2. Os ícones carregam sem erro 404 no Chrome DevTools → Application → Manifest
3. O PWA passa no teste de "Installable" no Lighthouse

## Design Sugerido

Para um design simples e profissional:

- **Fundo**: #0f172a (azul-escuro, theme do Lifty)
- **Símbolo**: Letra "L" em fonte bold, branca (#ffffff)
- **Estilo**: Minimalista, moderno
- **Alternativa**: Ícone de halteres estilizado em branco sobre fundo escuro

## Notas Importantes

- O ícone maskable deve ter padding de 10% para a "safe zone" (Android Adaptive Icons)
- Todos os ícones devem ser PNG com fundo opaco (não use transparência)
- O favicon.ico deve ser colocado em `frontend/public/favicon.ico` (não neste diretório)
