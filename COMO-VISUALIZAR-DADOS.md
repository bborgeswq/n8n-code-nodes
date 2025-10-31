# 🔍 Como Visualizar os Dados Sem Base64

## 🎯 Problema

Quando você abre o JSON com base64 no n8n, fica assim:

```json
{
  "nome": "EMAIL1.html",
  "conteudo_base64": "PGh0bWw+PGhlYWQ+PHRpdGxlPjI5IC0gRU1BSUwxPC90aXRsZT4gICAg..."
  // ← 20.000+ caracteres poluindo a visualização! 😵
}
```

Impossível de visualizar a estrutura dos dados!

## ✅ Solução

Use o Code Node `remove-base64-for-debug.js` para limpar a visualização:

```json
{
  "nome": "EMAIL1.html",
  "tipo": "text/html",
  "tamanho_bytes": 15631,
  "tamanho_mb": "0.01",
  "_base64_info": {
    "removido": true,
    "tamanho_original": 20841,
    "tamanho_kb": "20.35"
  }
  // ← Muito mais fácil de ver! 😊
}
```

---

## 🚀 Como Usar

### Workflow para Debug/Visualização:

```
Manual Trigger
  ↓
[Cole seu JSON aqui]
  ↓
Code Node: remove-base64-for-debug.js
  ↓
[Visualize o output limpo!]
```

### Passo a Passo:

1. **Crie um workflow simples:**
   - Manual Trigger
   - Code Node

2. **No Code Node:**
   - Cole o conteúdo de `remove-base64-for-debug.js`
   - No input, cole seus dados com base64

3. **Execute:**
   - Clique em "Execute Node"
   - Veja o output limpo e organizado!

---

## 📊 Antes vs Depois

### ❌ ANTES (com base64):

```json
{
  "numero_cnj": "5002898-16.2024.8.21.0060",
  "prazos": [{
    "evento_referenciado": {
      "documentos": [{
        "nome": "EMAIL1.html",
        "conteudo_base64": "PGh0bWw+PGhlYWQ+PHRpdGxlPjI5IC0gRU1BSUwxPC90aXRsZT4gICAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcHQiIHNyYz0iL3J1eGl0YWdlbnRqc19JQ0E3TlFWZnFydXhfMTAzMjUyNTEwMTcxMjA3NTAuanMiIGRhdGEtZHRjb25maWc9InJpZD1SSURfLTEwNzY5Njc5NnxycGlkPS0xMDAwMTQ3NDM5fGRvbWFpbj10anJzLmp1cy5icnxyZXBvcnRVcmw9L3JiX2JmOTUxNTJuc2h8YXBwPWFmZWM3MmYwYmYxNGEwNDJ8c3NjPTF8b3dhc3A9MXxmZWF0dXJlSGFzaD1JQ0E3TlFWZnFydXh8bXNsPTE1MzYwMHxzcnNyPTEwMDB8cmRudD0xfHV4cmdjZT0xfGN1Yz1uMmlnazRwaXxzcm1zPTIsMCwwLHxtZWw9MTAwMDAwfGV4cHc9MXxkcHZjPTF8bGFzdE1vZGlmaWNhdGlvbj0xNzYxODcwMzA0MjU4fHBvc3RmaXg9bjJpZ2s0cGl8dHA9NTAwLDUwLDB8c3JiYnY9MnxhZ2VudFVyaT0vcnV4aXRhZ2VudGpzX0lDQTdOUVZmcXJ1eF8xMDMyNTI1MTAxNzEyMDc1MC5qcyI+PC9zY3JpcHQ+PGxpbmsgcmVsPSJzdHlsZXNoZWV0IiBjaGFyc2V0PSJ1dGYtOCIgaHJlZj0iY3NzL2Rpc3QvYnVuZGxlLWJzNC5jc3M/OS4xNy40LTIuNDEuMyI+CiAgICA..."
        // ← 20.000+ caracteres!! 😵
      }]
    }
  }]
}
```

### ✅ DEPOIS (sem base64):

```json
{
  "numero_cnj": "5002898-16.2024.8.21.0060",
  "partes": [
    { "texto": "MARTINS ATACADO...", "tipo": "autor" },
    { "texto": "MARTINS ATACADO...", "tipo": "réu" },
    { "texto": "JOAO ANTONIO...", "tipo": "perito" }
  ],
  "total_prazos": 1,
  "prazos": [{
    "evento_prazo_amarelo": {
      "numero": 30,
      "texto": "30 28/10/2025 17:20:27...",
      "referencia_evento": 29
    },
    "evento_referenciado": {
      "numero": 29,
      "texto": "29 28/10/2025 17:19:40 Juntada de peças...",
      "documentos": [{
        "nome": "EMAIL1.html",
        "tipo": "text/html",
        "tamanho_bytes": 15631,
        "tamanho_mb": "0.01",
        "_base64_info": {
          "removido": true,
          "tamanho_original": 20841,
          "tamanho_kb": "20.35"
        }
      }]
    }
  }]
}
```

Muito melhor! 🎉

---

## 💡 Quando Usar

### ✅ Use para:
- 🔍 **Visualizar a estrutura** dos dados
- 🐛 **Debug** - Ver se os campos estão corretos
- 📊 **Análise** - Entender quantos processos/documentos tem
- 🧪 **Testar** - Validar se o JSON está no formato esperado

### ❌ NÃO use para:
- 📤 Upload no Drive (precisa do base64!)
- 🔄 Conversão para PDF (precisa do base64!)
- 💾 Processar documentos (precisa do base64!)

---

## 🎨 Workflow Completo com Debug

Para visualizar E processar:

```
Manual Trigger
  ↓
  ├─→ Code: remove-base64-for-debug.js
  │     ↓
  │   [Visualiza estrutura limpa] 👀
  │
  └─→ Code: decode-base64-documents.js
        ↓
      Code: upload-html-directly.js
        ↓
      Google Drive Upload
```

Assim você pode:
1. Ver os dados limpos em uma branch
2. Processar normalmente em outra branch

---

## 📋 Output do Code Node

O código retorna o mesmo JSON, mas:

```javascript
// ANTES:
{
  "conteudo_base64": "PGh0bWw+..." // ← 20KB de string
}

// DEPOIS:
{
  "_base64_info": {
    "removido": true,
    "tamanho_original": 20841,
    "tamanho_kb": "20.35"
  }
}
```

Você ainda sabe que o base64 existia e qual era o tamanho!

---

## 🔧 Código Completo

Arquivo: `remove-base64-for-debug.js`

Funcionalidades:
- ✅ Remove campos `conteudo_base64`
- ✅ Mantém toda a estrutura original
- ✅ Adiciona `_base64_info` com metadados
- ✅ Mostra resumo no console (total processos/docs)
- ✅ Retorna JSON limpo para visualização

---

## 🚀 Exemplo Prático

### Input (seus dados originais):

```json
[{
  "numero_cnj": "5002898-16.2024.8.21.0060",
  "prazos": [{
    "evento_referenciado": {
      "documentos": [{
        "nome": "EMAIL1.html",
        "conteudo_base64": "PGh0bWw+...[20000 chars]..."
      }]
    }
  }]
}]
```

### Output (dados limpos):

```json
[{
  "numero_cnj": "5002898-16.2024.8.21.0060",
  "prazos": [{
    "evento_referenciado": {
      "documentos": [{
        "nome": "EMAIL1.html",
        "tipo": "text/html",
        "tamanho_bytes": 15631,
        "_base64_info": {
          "removido": true,
          "tamanho_kb": "20.35"
        }
      }]
    }
  }]
}]
```

---

## 🎯 TL;DR

1. Copie `remove-base64-for-debug.js`
2. Cole em um Code Node
3. Execute com seus dados
4. Visualize tudo limpo e organizado! ✨

**Perfeito para debug e análise dos dados!** 🔍

---

**Alguma dúvida?** Este código é só para visualização, ele não altera seus dados originais! 😊
