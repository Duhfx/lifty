/**
 * Script para converter ícones SVG para PNG
 * Execute: node scripts/convert-icons-to-png.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertSVGtoPNG(svgPath, pngPath, size) {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);

    console.log(`✓ Convertido: ${path.basename(pngPath)}`);

    // Deletar o SVG após conversão
    fs.unlinkSync(svgPath);
  } catch (error) {
    console.error(`✗ Erro ao converter ${path.basename(svgPath)}:`, error.message);
  }
}

async function main() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');

  console.log('Convertendo ícones SVG para PNG...\n');

  // Ícones principais
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  for (const size of sizes) {
    const filename = `icon-${size}x${size}`;
    const svgPath = path.join(iconsDir, `${filename}.svg`);
    const pngPath = path.join(iconsDir, `${filename}.png`);

    if (fs.existsSync(svgPath)) {
      await convertSVGtoPNG(svgPath, pngPath, size);
    }
  }

  // Ícone maskable
  const maskableSvg = path.join(iconsDir, 'icon-maskable-512x512.svg');
  const maskablePng = path.join(iconsDir, 'icon-maskable-512x512.png');
  if (fs.existsSync(maskableSvg)) {
    await convertSVGtoPNG(maskableSvg, maskablePng, 512);
  }

  // Ícones Apple
  const appleSizes = [120, 180];
  for (const size of appleSizes) {
    const filename = `apple-touch-icon-${size}x${size}`;
    const svgPath = path.join(iconsDir, `${filename}.svg`);
    const pngPath = path.join(iconsDir, `${filename}.png`);

    if (fs.existsSync(svgPath)) {
      await convertSVGtoPNG(svgPath, pngPath, size);
    }
  }

  console.log('\n✅ Conversão concluída!');
  console.log('   Todos os ícones PNG foram gerados.');
  console.log('\n⚠️  NOTA: Estes são ícones placeholder para desenvolvimento/teste.');
  console.log('   Para produção, crie ícones profissionais usando:');
  console.log('   - https://realfavicongenerator.net/');
  console.log('   - Veja public/icons/README.md para mais detalhes.\n');
}

main().catch(console.error);
