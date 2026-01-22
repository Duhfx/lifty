/**
 * Script para gerar ícones placeholder do PWA
 * Execute: node scripts/generate-placeholder-icons.js
 *
 * NOTA: Estes são ícones placeholder simples para desenvolvimento/teste.
 * Para produção, use ícones profissionais conforme instruções em public/icons/README.md
 */

const fs = require('fs');
const path = require('path');

// Criar SVG do ícone
function createIconSVG(size, isMaskable = false) {
  const padding = isMaskable ? size * 0.1 : 0;
  const contentSize = size - (padding * 2);
  const fontSize = contentSize * 0.5;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0f172a"/>
  <text
    x="50%"
    y="50%"
    font-family="Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central">L</text>
</svg>`;
}

// Converter SVG para PNG usando canvas (simulado - na verdade só salva SVG por enquanto)
async function generateIcon(size, filename, isMaskable = false) {
  const svg = createIconSVG(size, isMaskable);
  const outputPath = path.join(__dirname, '..', 'public', 'icons', filename);

  // Como não temos canvas no Node.js puro, vamos salvar como SVG temporariamente
  // O usuário pode converter manualmente ou usar a ferramenta online
  const svgPath = outputPath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, svg);

  console.log(`✓ Gerado: ${filename.replace('.png', '.svg')} (converter para PNG manualmente)`);
}

async function main() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');

  // Criar diretório se não existir
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Gerando ícones placeholder do PWA...\n');

  // Ícones principais
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  for (const size of sizes) {
    await generateIcon(size, `icon-${size}x${size}.png`);
  }

  // Ícone maskable
  await generateIcon(512, 'icon-maskable-512x512.png', true);

  // Ícones Apple
  await generateIcon(120, 'apple-touch-icon-120x120.png');
  await generateIcon(180, 'apple-touch-icon-180x180.png');

  console.log('\n✅ Ícones SVG placeholder gerados!');
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   Estes são arquivos SVG placeholder para desenvolvimento.');
  console.log('   Para produção, você precisa:');
  console.log('   1. Converter os SVGs para PNG usando uma ferramenta como:');
  console.log('      - https://cloudconvert.com/svg-to-png');
  console.log('      - Inkscape, GIMP, ou outro editor de imagens');
  console.log('   2. Ou usar https://realfavicongenerator.net/ para gerar ícones profissionais');
  console.log('\n   Veja public/icons/README.md para instruções completas.\n');
}

main().catch(console.error);
