/**
 * Script para gerar favicon.ico a partir do ícone 192x192
 * Execute: node scripts/generate-favicon.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateFavicon() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const publicDir = path.join(__dirname, '..', 'public');
  const icon192Path = path.join(iconsDir, 'icon-192x192.png');
  const faviconPath = path.join(publicDir, 'favicon.ico');

  console.log('Gerando favicon.ico...\n');

  try {
    // Ler o ícone 192x192
    const iconBuffer = fs.readFileSync(icon192Path);

    // Converter para 32x32 (tamanho padrão de favicon)
    const favicon32 = await sharp(iconBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();

    // Salvar como PNG (navegadores modernos aceitam PNG como favicon)
    // Para um .ico real, seria necessária uma biblioteca específica
    fs.writeFileSync(faviconPath.replace('.ico', '.png'), favicon32);

    console.log('✓ Gerado: favicon.png (32x32)');
    console.log('\n⚠️  NOTA: Foi gerado um favicon.png');
    console.log('   Para um favicon.ico real, use:');
    console.log('   - https://realfavicongenerator.net/');
    console.log('   - https://www.favicon-generator.org/');
    console.log('\n   Navegadores modernos aceitam PNG, mas ICO é mais compatível.\n');

  } catch (error) {
    console.error('✗ Erro ao gerar favicon:', error.message);
  }
}

generateFavicon().catch(console.error);
