/**
 * n8n Code Node - Preparar HTML para conversão em PDF
 *
 * Este código prepara os documentos HTML decodificados para serem
 * convertidos em PDF por uma API ou serviço externo.
 *
 * Use este código DEPOIS do decode-base64-documents.js
 * e ANTES de chamar uma API de conversão HTML→PDF
 */

const items = $input.all();
const preparedForConversion = [];

for (const item of items) {
  try {
    // Extrai o buffer do documento
    const base64Content = item.binary.data.data;
    const htmlBuffer = Buffer.from(base64Content, 'base64');
    const htmlContent = htmlBuffer.toString('utf-8');

    // Limpa o HTML para melhor conversão em PDF
    // Remove scripts que podem causar problemas na conversão
    const htmlLimpo = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/onclick\s*=\s*["'][^"']*["']/gi, '')
      .replace(/onload\s*=\s*["'][^"']*["']/gi, '');

    // Prepara o documento para conversão
    const documentoPreparado = {
      json: {
        // Mantém todos os metadados originais
        ...item.json,

        // Adiciona o HTML limpo pronto para conversão
        htmlContent: htmlLimpo,

        // Nome do arquivo PDF (substitui .html por .pdf)
        nomeArquivoPDF: item.json.nomeArquivo.replace(/\.html$/i, '.pdf'),

        // Configurações de conversão PDF (compatível com a maioria das APIs)
        pdfConfig: {
          // Formato da página
          format: 'A4',

          // Orientação
          orientation: 'portrait', // ou 'landscape'

          // Margens (em mm)
          margin: {
            top: 20,
            right: 15,
            bottom: 20,
            left: 15
          },

          // Renderizar fundo colorido
          printBackground: true,

          // Preferir CSS para quebras de página
          preferCSSPageSize: false,

          // Cabeçalho personalizado
          displayHeaderFooter: true,
          headerTemplate: `
            <div style="font-size:9px; text-align:center; width:100%; padding:5px; border-bottom:1px solid #ccc;">
              <strong>Processo: ${item.json.numeroCNJ}</strong> - Evento: ${item.json.eventoNumero}
            </div>
          `,

          // Rodapé personalizado
          footerTemplate: `
            <div style="font-size:9px; text-align:center; width:100%; padding:5px; border-top:1px solid #ccc;">
              Página <span class="pageNumber"></span> de <span class="totalPages"></span> -
              Gerado em: ${new Date().toLocaleDateString('pt-BR')}
            </div>
          `
        }
      }
    };

    preparedForConversion.push(documentoPreparado);
    console.log(`✓ HTML preparado para conversão: ${item.json.nomeArquivo}`);

  } catch (error) {
    console.error(`Erro ao preparar ${item.json.nomeArquivo}:`, error.message);
    // Adiciona item com erro para tracking
    preparedForConversion.push({
      json: {
        ...item.json,
        erro: true,
        mensagemErro: error.message
      }
    });
  }
}

console.log(`\n=== HTML PREPARADO ===`);
console.log(`Total de documentos preparados: ${preparedForConversion.length}`);

return preparedForConversion;
