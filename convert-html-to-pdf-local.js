/**
 * n8n Code Node - Converter HTML para PDF usando Puppeteer (LOCAL)
 *
 * ⚠️ ATENÇÃO: Este código requer Puppeteer instalado no container do n8n!
 *
 * COMO INSTALAR PUPPETEER NO N8N:
 *
 * Se você usa Docker:
 * 1. Entre no container: docker exec -it n8n /bin/sh
 * 2. Instale: npm install puppeteer
 * 3. Se der erro de dependências, instale:
 *    apk add chromium chromium-chromedriver
 *
 * Se você usa n8n Cloud ou self-hosted sem acesso ao container:
 * - Esta solução NÃO vai funcionar ❌
 * - Use a API externa ou envie HTML direto
 *
 * VANTAGENS:
 * - Grátis (sem API externa)
 * - Sem limites
 * - Controle total da conversão
 * - PDFs de alta qualidade
 *
 * DESVANTAGENS:
 * - Precisa instalar Puppeteer
 * - Consome mais memória/CPU
 * - Mais lento que APIs especializadas
 */

// Tenta importar puppeteer
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  throw new Error(
    '❌ Puppeteer não está instalado!\n\n' +
    'Para usar conversão local, instale o Puppeteer:\n' +
    '1. Acesse o container do n8n\n' +
    '2. Execute: npm install puppeteer\n\n' +
    'OU use uma das alternativas:\n' +
    '- upload-html-directly.js (envia HTML direto)\n' +
    '- prepare-html-for-pdf-conversion.js (usa API externa)'
  );
}

const items = $input.all();
const documentosConvertidos = [];

// Configuração do Puppeteer
const puppeteerConfig = {
  headless: 'new', // Usa o novo modo headless
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ],
  // Se você instalou chromium via apk, descomente:
  // executablePath: '/usr/bin/chromium-browser'
};

// Inicia o navegador UMA VEZ (melhor performance)
let browser;
try {
  browser = await puppeteer.launch(puppeteerConfig);
  console.log('✓ Navegador Chromium iniciado');
} catch (error) {
  throw new Error(`Erro ao iniciar Chromium: ${error.message}`);
}

// Processa cada documento
for (let i = 0; i < items.length; i++) {
  const item = items[i];

  try {
    console.log(`\n[${i + 1}/${items.length}] Processando: ${item.json.nomeArquivo}`);

    // Extrai o HTML
    const base64Content = item.binary.data.data;
    const htmlBuffer = Buffer.from(base64Content, 'base64');
    const htmlContent = htmlBuffer.toString('utf-8');

    // Cria nova página
    const page = await browser.newPage();

    // Configura viewport para A4
    await page.setViewport({
      width: 794,  // A4 width em pixels (210mm)
      height: 1123 // A4 height em pixels (297mm)
    });

    // Carrega o HTML
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0', // Espera carregar tudo
      timeout: 30000
    });

    // Configurações do PDF
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; padding: 5px; border-bottom: 1px solid #ccc;">
          <strong>Processo: ${item.json.numeroCNJ}</strong> - Evento: ${item.json.eventoNumero}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; padding: 5px; border-top: 1px solid #ccc;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span> -
          Gerado em: ${new Date().toLocaleDateString('pt-BR')}
        </div>
      `,
      preferCSSPageSize: false
    };

    // Gera o PDF
    const pdfBuffer = await page.pdf(pdfOptions);

    // Fecha a página
    await page.close();

    // Nome do arquivo PDF
    const nomeArquivoPDF = item.json.nomeArquivo.replace(/\.html$/i, '.pdf');

    // Converte para base64
    const pdfBase64 = pdfBuffer.toString('base64');

    // Prepara para o Google Drive
    documentosConvertidos.push({
      json: {
        numeroCNJ: item.json.numeroCNJ,
        eventoNumero: item.json.eventoNumero,
        nomeArquivo: nomeArquivoPDF,
        nomeDocumentoOriginal: item.json.nomeDocumentoOriginal,
        tamanhoBytes: pdfBuffer.length,
        tamanhoMB: (pdfBuffer.length / 1024 / 1024).toFixed(2),
        dataProcessamento: new Date().toISOString(),
        tipo: 'PDF (Puppeteer local)'
      },
      binary: {
        data: {
          data: pdfBase64,
          mimeType: 'application/pdf',
          fileName: nomeArquivoPDF,
          fileExtension: 'pdf'
        }
      }
    });

    console.log(`✓ PDF gerado: ${nomeArquivoPDF} (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);

  } catch (error) {
    console.error(`✗ Erro ao converter ${item.json.nomeArquivo}:`, error.message);

    // Adiciona item com erro para não perder o tracking
    documentosConvertidos.push({
      json: {
        ...item.json,
        erro: true,
        mensagemErro: error.message,
        tipo: 'Erro na conversão'
      }
    });
  }
}

// Fecha o navegador
if (browser) {
  await browser.close();
  console.log('\n✓ Navegador fechado');
}

console.log(`\n=== RESUMO DA CONVERSÃO ===`);
console.log(`Total processados: ${items.length}`);
console.log(`Sucesso: ${documentosConvertidos.filter(d => !d.json.erro).length}`);
console.log(`Erros: ${documentosConvertidos.filter(d => d.json.erro).length}`);

return documentosConvertidos;
