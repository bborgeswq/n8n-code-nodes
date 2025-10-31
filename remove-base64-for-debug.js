/**
 * n8n Code Node - Remover Base64 para Análise
 *
 * Este código remove os campos base64 dos documentos para facilitar
 * a visualização e debug da estrutura de dados no n8n.
 *
 * Útil para:
 * - Ver a estrutura dos processos sem poluição visual
 * - Debug de campos e metadados
 * - Validar se os dados estão corretos
 * - Economizar memória durante testes
 *
 * INPUT: JSON do arquivo "analise doc base64.txt"
 * OUTPUT: Mesmo JSON mas SEM os campos "conteudo_base64"
 */

// Pega todos os itens do input
const inputData = $input.all();

// Array para armazenar os processos sem base64
const processosSemBase64 = [];

// Processa cada item
for (const item of inputData) {
  const processo = item.json;

  // Cria uma cópia do processo
  const processoLimpo = JSON.parse(JSON.stringify(processo));

  // Remove base64 de todos os documentos
  if (processoLimpo.prazos && Array.isArray(processoLimpo.prazos)) {
    for (const prazo of processoLimpo.prazos) {
      if (prazo.evento_referenciado && prazo.evento_referenciado.documentos) {
        for (const doc of prazo.evento_referenciado.documentos) {
          // Remove o base64 mas mantém informação de que existia
          if (doc.conteudo_base64) {
            const tamanhoBase64 = doc.conteudo_base64.length;
            delete doc.conteudo_base64;

            // Adiciona informação sobre o base64 que foi removido
            doc._base64_info = {
              removido: true,
              tamanho_original: tamanhoBase64,
              tamanho_kb: (tamanhoBase64 / 1024).toFixed(2)
            };
          }
        }
      }
    }
  }

  // Adiciona ao array de saída
  processosSemBase64.push({
    json: processoLimpo
  });
}

// Log de resumo
console.log(`\n=== DADOS LIMPOS ===`);
console.log(`Total de processos: ${processosSemBase64.length}`);

// Conta total de documentos
let totalDocs = 0;
for (const item of processosSemBase64) {
  const processo = item.json;
  if (processo.prazos) {
    for (const prazo of processo.prazos) {
      if (prazo.evento_referenciado?.documentos) {
        totalDocs += prazo.evento_referenciado.documentos.length;
      }
    }
  }
}

console.log(`Total de documentos: ${totalDocs}`);
console.log(`\n✓ Campos base64 removidos para melhor visualização`);

return processosSemBase64;
