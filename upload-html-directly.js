/**
 * n8n Code Node - Preparar HTML para upload direto no Google Drive
 *
 * Esta versão SIMPLIFICADA pula a conversão para PDF e envia
 * os documentos HTML diretamente para o Google Drive.
 *
 * VANTAGENS:
 * - Não precisa de API externa (grátis!)
 * - Muito mais rápido
 * - Sem limites de conversão
 *
 * DESVANTAGENS:
 * - Arquivo fica como .html (não PDF)
 * - Visualização depende do navegador
 * - Sem paginação fixa
 *
 * Use este código DEPOIS do decode-base64-documents.js
 * e ANTES do Google Drive Upload
 */

const items = $input.all();
const documentosParaDrive = [];

for (const item of items) {
  try {
    // Pega o HTML decodificado
    const base64Content = item.binary.data.data;
    const htmlBuffer = Buffer.from(base64Content, 'base64');
    const htmlContent = htmlBuffer.toString('utf-8');

    // Adiciona metadados no próprio HTML (opcional mas útil)
    const htmlComMetadados = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="processo" content="${item.json.numeroCNJ}">
    <meta name="evento" content="${item.json.eventoNumero}">
    <meta name="data-processamento" content="${new Date().toISOString()}">
    <title>${item.json.nomeDocumentoOriginal} - Processo ${item.json.numeroCNJ}</title>
    <style>
        /* Adiciona estilo para impressão se alguém quiser imprimir depois */
        @media print {
            @page {
                margin: 2cm;
            }
            body {
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.5;
            }
        }
        /* Adiciona banner de informação no topo */
        .info-banner {
            background: #f0f0f0;
            border: 1px solid #ccc;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .info-banner h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .info-banner p {
            margin: 5px 0;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="info-banner">
        <h3>📋 Informações do Documento</h3>
        <p><strong>Processo CNJ:</strong> ${item.json.numeroCNJ}</p>
        <p><strong>Evento:</strong> ${item.json.eventoNumero}</p>
        <p><strong>Documento:</strong> ${item.json.nomeDocumentoOriginal}</p>
        <p><strong>Processado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
    </div>
    <hr>
    ${htmlContent}
</body>
</html>
    `.trim();

    // Converte de volta para base64
    const htmlComMetadadosBase64 = Buffer.from(htmlComMetadados, 'utf-8').toString('base64');

    // Prepara para o Google Drive
    documentosParaDrive.push({
      json: {
        // Metadados
        numeroCNJ: item.json.numeroCNJ,
        eventoNumero: item.json.eventoNumero,
        nomeArquivo: item.json.nomeArquivo, // mantém .html
        nomeDocumentoOriginal: item.json.nomeDocumentoOriginal,
        tamanhoBytes: Buffer.from(htmlComMetadados, 'utf-8').length,
        dataProcessamento: new Date().toISOString(),
        tipo: 'HTML (direto)'
      },
      binary: {
        data: {
          data: htmlComMetadadosBase64,
          mimeType: 'text/html',
          fileName: item.json.nomeArquivo,
          fileExtension: 'html'
        }
      }
    });

    console.log(`✓ HTML preparado para Drive: ${item.json.nomeArquivo}`);

  } catch (error) {
    console.error(`Erro ao preparar ${item.json.nomeArquivo}:`, error.message);
    continue;
  }
}

console.log(`\n=== DOCUMENTOS PREPARADOS ===`);
console.log(`Total: ${documentosParaDrive.length} arquivos HTML prontos para upload`);
console.log(`\n💡 Estes arquivos serão enviados como HTML.`);
console.log(`   O Google Drive permite visualizar HTML diretamente no navegador!`);

return documentosParaDrive;
