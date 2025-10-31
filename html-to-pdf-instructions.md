# Conversão HTML para PDF no n8n

Este documento explica como converter os documentos HTML decodificados para PDF antes de enviar ao Google Drive.

## 🎯 Problema

Os documentos base64 estão em formato HTML e precisam ser convertidos para PDF antes do upload no Google Drive.

## 💡 Soluções Disponíveis

### **Opção 1: Usar HTTP Request + API Externa (Recomendado)**

Use uma API de conversão HTML para PDF. Exemplo com API gratuita:

#### API: html2pdf.app (Gratuita)

```
Workflow no n8n:
1. Code Node: decode-base64-documents.js (decodifica documentos)
2. HTTP Request Node (para cada documento):
   - URL: https://api.html2pdf.app/v1/generate
   - Method: POST
   - Body Type: JSON
   - Body Content:
     {
       "html": "{{ $json.htmlContent }}",
       "format": "A4",
       "printBackground": true
     }
3. Google Drive Upload Node
```

#### Outras APIs de conversão:
- **PDF.co** - https://pdf.co (tem plano gratuito)
- **ConvertAPI** - https://www.convertapi.com (250 conversões grátis/mês)
- **CloudConvert** - https://cloudconvert.com (25 conversões grátis/dia)

### **Opção 2: Usar n8n Community Node**

Instale nodes da comunidade:

```bash
# No n8n, vá em Settings > Community Nodes
# Procure e instale: n8n-nodes-html-to-pdf
```

### **Opção 3: Usar Docker com Puppeteer (Avançado)**

Se você tem controle do servidor n8n, pode instalar dependências:

```javascript
// Requer instalação de puppeteer no container do n8n
const puppeteer = require('puppeteer');

async function htmlToPdf(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent);

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });

  await browser.close();
  return pdfBuffer;
}
```

### **Opção 4: Salvar como HTML e visualizar no Drive (Temporário)**

Se por enquanto você quiser apenas testar, pode:
1. Salvar os arquivos como `.html` no Google Drive
2. O Google Drive permite visualizar HTML diretamente no navegador
3. Depois implementar a conversão para PDF

## 🔧 Workflow Recomendado

```
┌─────────────────────────────────────────┐
│  1. Manual Trigger / Schedule Trigger   │
└────────────────┬────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────┐
│  2. Read Binary File (analise doc.txt)  │
│     ou Code Node com JSON já carregado   │
└────────────────┬────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────┐
│  3. Code Node: decode-base64-documents   │
│     Output: Array de documentos          │
└────────────────┬────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────┐
│  4. Split In Batches (processar 1 por 1)│
└────────────────┬────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────┐
│  5. HTTP Request: HTML to PDF API       │
│     (ou Community Node)                  │
└────────────────┬────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────┐
│  6. Google Drive: Upload File           │
│     - Parent Folder ID: (sua pasta)      │
│     - File Name: {{ $json.nomeArquivo }} │
└─────────────────────────────────────────┘
```

## 📝 Exemplo de Código para HTTP Request

Se usar HTTP Request para converter HTML para PDF:

```javascript
// Code Node ANTES do HTTP Request
// Prepara o HTML decodificado

const items = $input.all();
const preparedItems = [];

for (const item of items) {
  const htmlBuffer = Buffer.from(item.binary.data.data, 'base64');
  const htmlContent = htmlBuffer.toString('utf-8');

  preparedItems.push({
    json: {
      ...item.json,
      htmlContent: htmlContent,
      // Adiciona configurações para o PDF
      pdfOptions: {
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size:10px; text-align:center; width:100%;">
          Processo: ${item.json.numeroCNJ}
        </div>`,
        footerTemplate: `<div style="font-size:10px; text-align:center; width:100%;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>`
      }
    }
  });
}

return preparedItems;
```

## ⚙️ Configuração do Google Drive Node

Após a conversão para PDF:

```
Node: Google Drive Upload
- Authentication: Google OAuth2
- Resource: File
- Operation: Upload
- Binary Property: data (onde está o PDF)
- File Name: {{ $json.nomeArquivo.replace('.html', '.pdf') }}
- Parent Folder: [ID da sua pasta no Drive]
- Convert to Google Doc: false (manter como PDF)
```

## 🚨 Dicas Importantes

1. **Limite de Conversões**: Verifique os limites das APIs gratuitas
2. **Timeout**: Configure timeouts maiores para documentos grandes
3. **Retry**: Adicione retry logic para falhas temporárias
4. **Batch Processing**: Processe em lotes para não sobrecarregar
5. **Logs**: Mantenha logs dos sucessos e falhas

## 🔍 Troubleshooting

### Erro: "Buffer is not defined"
- Solução: Use `Buffer.from()` ao invés de `new Buffer()`

### Erro: "Cannot read property 'data' of undefined"
- Solução: Verifique se o campo `binary.data` existe antes de acessar

### HTML não renderiza corretamente
- Verifique se todas as referências CSS/JS estão inline ou acessíveis
- Use `printBackground: true` nas opções do PDF

### Google Drive não aceita o arquivo
- Verifique se o mimeType está correto: `application/pdf`
- Certifique-se de que o buffer está em base64 correto
