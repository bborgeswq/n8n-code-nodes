/**
 * n8n Code Node - Decodificar documentos base64 de processos jurídicos
 *
 * Este código processa o output do scraping de processos e:
 * 1. Decodifica os documentos em base64
 * 2. Prepara os dados para upload no Google Drive
 * 3. Mantém o vínculo entre documento e processo (numero_cnj)
 *
 * INPUT: JSON com array de processos (pode vir de $input.all() ou $json)
 * OUTPUT: Array de documentos prontos para upload, cada um com:
 *   - binary: conteúdo do arquivo em buffer
 *   - fileName: nome do arquivo
 *   - mimeType: tipo MIME do arquivo
 *   - numeroCNJ: número do processo
 *   - eventoNumero: número do evento
 *   - nomeDocumento: nome original do documento
 */

// Pega todos os itens do input
const inputData = $input.all();

// Array para armazenar todos os documentos processados
const documentosParaUpload = [];

// Processa cada item do input
for (const item of inputData) {
  const processo = item.json;

  // Valida se tem numero_cnj
  if (!processo.numero_cnj) {
    console.log('Processo sem numero_cnj, pulando...');
    continue;
  }

  const numeroCNJ = processo.numero_cnj;

  // Verifica se tem prazos
  if (!processo.prazos || processo.prazos.length === 0) {
    console.log(`Processo ${numeroCNJ} não tem prazos, pulando...`);
    continue;
  }

  // Itera sobre cada prazo do processo
  for (const prazo of processo.prazos) {
    // Verifica se o prazo tem evento referenciado com documentos
    if (!prazo.evento_referenciado || !prazo.evento_referenciado.documentos) {
      continue;
    }

    const eventoNumero = prazo.evento_referenciado.numero;
    const documentos = prazo.evento_referenciado.documentos;

    // Processa cada documento do evento
    for (let i = 0; i < documentos.length; i++) {
      const doc = documentos[i];

      // Valida se tem conteúdo base64
      if (!doc.conteudo_base64) {
        console.log(`Documento ${doc.nome} sem conteúdo base64, pulando...`);
        continue;
      }

      try {
        // Decodifica o base64 para Buffer
        const base64Content = doc.conteudo_base64;
        const buffer = Buffer.from(base64Content, 'base64');

        // Extrai o nome do arquivo sem extensão e a extensão
        const nomeOriginal = doc.nome || `documento_${i + 1}.html`;
        const nomeArquivoSemExtensao = nomeOriginal.replace(/\.[^/.]+$/, '');
        const extensaoOriginal = nomeOriginal.split('.').pop();

        // Cria nome único para o arquivo incluindo o numero_cnj e evento
        // Formato: numeroCNJ_evento_nomeArquivo.extensao
        const numeroCNJLimpo = numeroCNJ.replace(/[\/\-\.]/g, '_');
        const nomeArquivoFinal = `${numeroCNJLimpo}_evento${eventoNumero}_${nomeArquivoSemExtensao}.${extensaoOriginal}`;

        // Prepara o objeto para o Google Drive
        // IMPORTANTE: O n8n espera que arquivos binários estejam em 'binary'
        const documentoProcessado = {
          json: {
            // Metadados do documento
            numeroCNJ: numeroCNJ,
            eventoNumero: eventoNumero,
            nomeDocumentoOriginal: nomeOriginal,
            nomeArquivo: nomeArquivoFinal,
            mimeType: doc.tipo || 'text/html',
            tamanhoBytes: doc.tamanho_bytes,
            tamanhoMB: doc.tamanho_mb,
            // Informações adicionais do processo
            totalPrazos: processo.total_prazos,
            // Data de processamento
            dataProcessamento: new Date().toISOString()
          },
          binary: {
            // O Google Drive Node do n8n espera o arquivo em 'data'
            data: {
              data: buffer.toString('base64'),
              mimeType: doc.tipo || 'text/html',
              fileName: nomeArquivoFinal,
              fileExtension: extensaoOriginal
            }
          }
        };

        documentosParaUpload.push(documentoProcessado);

        console.log(`✓ Documento processado: ${nomeArquivoFinal} (${doc.tamanho_mb})`);

      } catch (error) {
        console.error(`Erro ao processar documento ${doc.nome}:`, error.message);
        // Continua processando os outros documentos mesmo se um falhar
        continue;
      }
    }
  }
}

// Log de resumo
console.log(`\n=== RESUMO DO PROCESSAMENTO ===`);
console.log(`Total de processos analisados: ${inputData.length}`);
console.log(`Total de documentos decodificados: ${documentosParaUpload.length}`);

// Verifica se encontrou documentos
if (documentosParaUpload.length === 0) {
  console.log('\n⚠️ ATENÇÃO: Nenhum documento foi encontrado para processar!');
  return [];
}

// Retorna os documentos processados
// Cada item será processado individualmente pelo próximo nó
return documentosParaUpload;
