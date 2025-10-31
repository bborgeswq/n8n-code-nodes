# 🚀 Guia Rápido - 5 Minutos para Começar

## 📝 Pré-requisitos

- [ ] n8n instalado e rodando
- [ ] Conta Google (para Drive)
- [ ] Conta em serviço de conversão PDF (PDF.co, CloudConvert, etc.)
- [ ] Arquivo JSON com processos e documentos base64

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Prepare seus dados (1 min)

Seu JSON deve ter esta estrutura:

```json
[
  {
    "numero_cnj": "5002898-16.2024.8.21.0060",
    "prazos": [
      {
        "evento_referenciado": {
          "numero": 29,
          "documentos": [
            {
              "nome": "documento.html",
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

### 2️⃣ Crie o Workflow no n8n (2 min)

**Opção A: Importar workflow pronto**
1. Abra n8n
2. Clique em "Import from File"
3. Selecione `exemplo-teste-workflow.json`
4. Pronto! Agora é só configurar as credenciais

**Opção B: Criar manualmente**
1. Adicione nodes nesta ordem:
   ```
   Manual Trigger → Code → Code → HTTP Request → Google Drive
   ```
2. No primeiro Code Node, cole `decode-base64-documents.js`
3. No segundo Code Node, cole `prepare-html-for-pdf-conversion.js`

### 3️⃣ Configure as APIs (2 min)

#### PDF.co (Recomendado para testes)

1. Acesse: https://pdf.co/
2. Crie conta gratuita
3. Copie sua API Key
4. No n8n, em "HTTP Request":
   - URL: `https://api.pdf.co/v1/pdf/convert/from/html`
   - Header: `x-api-key: SUA_API_KEY`

#### Google Drive

1. No n8n, clique em "Google Drive" node
2. Clique em "Create New Credential"
3. Siga o fluxo OAuth2 do Google
4. Autorize o acesso
5. Pronto!

## 🧪 Teste Rápido

### Dados de teste mínimos:

Cole isso no Manual Trigger:

```json
[
  {
    "numero_cnj": "TESTE-001",
    "total_prazos": 1,
    "prazos": [
      {
        "evento_referenciado": {
          "numero": 1,
          "documentos": [
            {
              "nome": "teste.html",
              "tipo": "text/html",
              "tamanho_bytes": 50,
              "tamanho_mb": "0.01",
              "conteudo_base64": "PGh0bWw+PGhlYWQ+PC9oZWFkPjxib2R5PjxoMT5UZXN0ZTwvaDE+PC9ib2R5PjwvaHRtbD4="
            }
          ]
        }
      }
    ]
  }
]
```

Clique em "Execute Workflow" e veja a mágica acontecer! ✨

## 📊 Checklist de Validação

Após executar, verifique:

- [ ] ✅ Code Node 1 retornou itens decodificados
- [ ] ✅ Code Node 2 preparou HTML para conversão
- [ ] ✅ HTTP Request retornou status 200
- [ ] ✅ PDF foi criado com sucesso
- [ ] ✅ Arquivo apareceu no Google Drive

## 🐛 Problemas Comuns

### ❌ "Buffer is not defined"
```javascript
// ERRADO
new Buffer(data)

// CERTO
Buffer.from(data, 'base64')
```

### ❌ "API Error 401"
- Verifique se a API key está correta
- Teste a API no Postman primeiro

### ❌ "Google Drive authentication failed"
- Refaça a autenticação OAuth2
- Verifique se tem permissões na pasta

### ❌ "No documents found"
- Verifique se o JSON tem a estrutura correta
- Verifique os logs do primeiro Code Node
- Certifique-se que `conteudo_base64` existe

## 📚 Próximos Passos

1. ✅ Teste funcionando? Ótimo!
2. 📖 Leia o `README.md` completo
3. ⚙️ Configure conversão em lote
4. 📁 Organize pastas no Drive por ano/processo
5. 🔄 Configure execução automática (Schedule Trigger)

## 💡 Dicas Pro

### Processar múltiplos processos

Use "Split In Batches" para não sobrecarregar:
```
Batch Size: 5
Reset: true
```

### Retry automático

Configure no HTTP Request:
```javascript
Options → Retry On Fail
Max Tries: 3
Wait Between Tries: 2000ms
```

### Organização no Drive

Crie estrutura de pastas:
```
Processos/
  └── 2024/
      └── Outubro/
          └── processo_123.pdf
```

## 🎯 Checklist Completo

### Antes de começar:
- [ ] n8n rodando
- [ ] API key da conversão PDF
- [ ] Google Drive conectado
- [ ] JSON com processos preparado

### Durante setup:
- [ ] Workflow importado ou criado
- [ ] Code nodes configurados
- [ ] HTTP Request com API key
- [ ] Google Drive com OAuth2

### Teste inicial:
- [ ] Teste com 1 documento pequeno
- [ ] Verificar logs de cada node
- [ ] Confirmar PDF no Drive
- [ ] Validar metadados

### Produção:
- [ ] Testar com múltiplos documentos
- [ ] Configurar retry
- [ ] Configurar error handling
- [ ] Documentar seu workflow

## 📞 Ajuda Rápida

**Erro no Code Node?**
→ Verifique estrutura do JSON de entrada

**API não responde?**
→ Teste no Postman: https://www.postman.com/

**Upload falha?**
→ Verifique permissões da pasta no Drive

**Tudo funcionando?**
→ Ótimo! Leia o README.md para otimizações

## 🎉 Pronto!

Se chegou até aqui e está funcionando, parabéns! 🎊

Agora você tem um sistema automatizado para processar documentos de processos jurídicos!

---

**Dúvidas?** Consulte:
1. `README.md` - Documentação completa
2. `html-to-pdf-instructions.md` - Opções de conversão
3. Logs do n8n - Sempre verifique os logs!

**Contribua!**
Melhorou algo? Compartilhe com a comunidade! 💙
