# 📄 Processamento de Documentos Base64 de Processos Jurídicos

Este projeto contém código e instruções para processar documentos em base64 extraídos de processos jurídicos, convertê-los para PDF e fazer upload no Google Drive usando n8n.

## 🎯 Objetivo

Transformar documentos HTML em base64 (obtidos via scraping) em arquivos PDF organizados no Google Drive, mantendo vínculo com seus respectivos processos.

## 📋 Arquivos do Projeto

### Códigos n8n (Code Nodes)

1. **`decode-base64-documents.js`** ⭐
   - Decodifica documentos base64
   - Prepara metadados
   - Cria estrutura para upload
   - **Use este primeiro!**

2. **`prepare-html-for-pdf-conversion.js`**
   - Limpa o HTML
   - Prepara configurações de PDF
   - Adiciona cabeçalho e rodapé
   - **Use depois do decode-base64-documents.js**

### Documentação

3. **`html-to-pdf-instructions.md`**
   - Guia completo de conversão HTML→PDF
   - Várias opções de APIs
   - Troubleshooting

4. **`http-request-convert-to-pdf.json`**
   - Exemplos de configuração HTTP Request
   - 3 APIs diferentes de conversão
   - Pronto para importar no n8n

## 🚀 Como Usar

### Passo 1: Setup Inicial no n8n

1. Crie um novo workflow no n8n
2. Adicione os nodes na seguinte ordem:
   ```
   Manual Trigger → Code Node → Code Node → HTTP Request → Google Drive
   ```

### Passo 2: Configurar o Code Node 1 (Decodificar)

1. Cole o conteúdo de **`decode-base64-documents.js`**
2. Configure o input com seus dados JSON
3. Teste a execução

```javascript
// O node espera receber:
[
  {
    "numero_cnj": "5002898-16.2024.8.21.0060",
    "prazos": [
      {
        "evento_referenciado": {
          "numero": 29,
          "documentos": [
            {
              "nome": "EMAIL1.html",
              "tipo": "text/html",
              "conteudo_base64": "PGh0bWw+..."
            }
          ]
        }
      }
    ]
  }
]
```

### Passo 3: Configurar o Code Node 2 (Preparar PDF)

1. Cole o conteúdo de **`prepare-html-for-pdf-conversion.js`**
2. Este node recebe o output do Node 1
3. Prepara o HTML limpo e configurações do PDF

### Passo 4: Configurar HTTP Request (Conversão)

**Opção A: PDF.co (Recomendado para teste)**

1. Crie conta gratuita em https://pdf.co
2. Obtenha sua API key
3. Configure o HTTP Request:

```
Method: POST
URL: https://api.pdf.co/v1/pdf/convert/from/html
Headers:
  - x-api-key: SUA_API_KEY
  - Content-Type: application/json
Body:
{
  "html": "{{ $json.htmlContent }}",
  "name": "{{ $json.nomeArquivoPDF }}",
  "margins": "20px",
  "paperSize": "A4",
  "orientation": "Portrait",
  "printBackground": true
}
```

**Opção B: CloudConvert**

- Plano gratuito: 25 conversões/dia
- Mais rápido e confiável
- Veja detalhes em `html-to-pdf-instructions.md`

### Passo 5: Configurar Google Drive Upload

1. Adicione o node "Google Drive"
2. Configure autenticação OAuth2
3. Settings:
   ```
   Resource: File
   Operation: Upload
   Binary Property: data
   File Name: {{ $json.nomeArquivoPDF }}
   Parent Folder: [ID da sua pasta]
   Convert: false (manter como PDF)
   ```

## 📊 Fluxo Completo

```
┌──────────────────────┐
│  1. Manual Trigger   │
│  ou Schedule Trigger │
└──────────┬───────────┘
           │
           v
┌──────────────────────────────────┐
│  2. Code Node:                   │
│     decode-base64-documents.js   │
│  ┌────────────────────────────┐  │
│  │ • Decodifica base64        │  │
│  │ • Valida estrutura         │  │
│  │ • Cria metadados           │  │
│  └────────────────────────────┘  │
└──────────┬───────────────────────┘
           │
           v
┌───────────────────────────────────────┐
│  3. Code Node:                        │
│     prepare-html-for-pdf-conversion   │
│  ┌─────────────────────────────────┐  │
│  │ • Limpa HTML                    │  │
│  │ • Remove scripts                │  │
│  │ • Configura PDF                 │  │
│  └─────────────────────────────────┘  │
└──────────┬────────────────────────────┘
           │
           v
┌────────────────────────────────────┐
│  4. Split In Batches              │
│     (processar 1 documento/vez)    │
└──────────┬─────────────────────────┘
           │
           v
┌────────────────────────────────┐
│  5. HTTP Request: HTML→PDF     │
│  ┌──────────────────────────┐  │
│  │ • Chama API conversão    │  │
│  │ • Gera PDF               │  │
│  │ • Retorna buffer         │  │
│  └──────────────────────────┘  │
└──────────┬─────────────────────┘
           │
           v
┌──────────────────────────────┐
│  6. Google Drive Upload      │
│  ┌────────────────────────┐  │
│  │ • Upload PDF           │  │
│  │ • Organiza por pasta   │  │
│  │ • Mantém metadados     │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

## 🔧 Estrutura dos Dados

### Input (JSON original)

```json
{
  "numero_cnj": "5002898-16.2024.8.21.0060",
  "partes": [...],
  "total_prazos": 1,
  "prazos": [
    {
      "evento_referenciado": {
        "numero": 29,
        "texto": "29 28/10/2025...",
        "documentos": [
          {
            "nome": "EMAIL1.html",
            "tipo": "text/html",
            "tamanho_bytes": 15631,
            "tamanho_mb": "0.01",
            "conteudo_base64": "PGh0bWw+PGhlYWQ+..."
          }
        ]
      }
    }
  ]
}
```

### Output (após decodificação)

```json
{
  "json": {
    "numeroCNJ": "5002898-16.2024.8.21.0060",
    "eventoNumero": 29,
    "nomeDocumentoOriginal": "EMAIL1.html",
    "nomeArquivo": "5002898_16_2024_8_21_0060_evento29_EMAIL1.html",
    "nomeArquivoPDF": "5002898_16_2024_8_21_0060_evento29_EMAIL1.pdf",
    "mimeType": "text/html",
    "tamanhoBytes": 15631,
    "tamanhoMB": "0.01",
    "htmlContent": "<html><head>...</head><body>...</body></html>",
    "dataProcessamento": "2025-10-31T19:30:00.000Z"
  },
  "binary": {
    "data": {
      "data": "base64_content_here",
      "mimeType": "application/pdf",
      "fileName": "5002898_16_2024_8_21_0060_evento29_EMAIL1.pdf"
    }
  }
}
```

## ⚙️ Configurações Importantes

### APIs de Conversão (escolha uma)

| API | Limite Gratuito | Velocidade | Qualidade |
|-----|----------------|------------|-----------|
| **PDF.co** | 300 req/mês | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **CloudConvert** | 25/dia | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **YakPDF** | 100/mês | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **ConvertAPI** | 250/mês | ⭐⭐⭐ | ⭐⭐⭐⭐ |

### Organização no Google Drive

Recomendado criar esta estrutura:

```
📁 Processos/
  📁 2024/
    📄 5002898_16_2024_8_21_0060_evento29_EMAIL1.pdf
    📄 5002898_16_2024_8_21_0060_evento30_OFIC1.pdf
  📁 2025/
    📄 5000827_02_2025_8_21_0094_evento33_OFIC1.pdf
```

## 🐛 Troubleshooting

### Problema: "Buffer is not defined"
**Solução**: Use `Buffer.from()` ao invés de `new Buffer()`

### Problema: Documentos não aparecem
**Solução**:
- Verifique se o JSON tem a estrutura correta
- Verifique logs do Code Node
- Teste com um processo por vez

### Problema: Conversão PDF falha
**Solução**:
- Verifique API key
- Teste a API manualmente (Postman/Insomnia)
- Verifique limites da API
- Aumente o timeout do HTTP Request

### Problema: Upload no Drive falha
**Solução**:
- Re-autentique o Google OAuth2
- Verifique permissões da pasta
- Verifique se o ID da pasta está correto
- Tente com arquivos menores primeiro

## 📊 Exemplo de Teste

### Dados de Teste (Cole no Manual Trigger)

```json
[
  {
    "numero_cnj": "TESTE-123",
    "total_prazos": 1,
    "prazos": [
      {
        "evento_referenciado": {
          "numero": 1,
          "documentos": [
            {
              "nome": "teste.html",
              "tipo": "text/html",
              "tamanho_bytes": 100,
              "tamanho_mb": "0.01",
              "conteudo_base64": "PGh0bWw+PGhlYWQ+PHRpdGxlPlRlc3RlPC90aXRsZT48L2hlYWQ+PGJvZHk+PGgxPkRvY3VtZW50byBkZSBUZXN0ZTwvaDE+PHA+RXN0ZSDDqSB1bSB0ZXN0ZSBkZSBjb252ZXJzw6NvIEhUTUwtPlBERi48L3A+PC9ib2R5PjwvaHRtbD4="
            }
          ]
        }
      }
    ]
  }
]
```

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs de cada node
2. Consulte `html-to-pdf-instructions.md`
3. Teste cada etapa separadamente
4. Verifique a documentação da API usada

## 🔐 Segurança

⚠️ **IMPORTANTE**:
- NUNCA commit API keys no código
- Use variáveis de ambiente do n8n
- Configure credentials corretamente
- Mantenha backups dos workflows

## 📝 Licença

Código livre para uso em projetos pessoais e comerciais.

---

**Criado para processar documentos de processos jurídicos com n8n** 🚀
