# 📊 Relatório de Estimativa de Custos da API Gemini

Este documento apresenta a especificação, as tabelas de preços oficiais do Google AI e a metodologia de cálculo de custos para as operações de Inteligência Artificial implementadas no **Portal do Professor - Gestão Acadêmica**.

---

## 1. 🧮 Fórmula Oficial de Cálculo de Custo

Para cada requisição realizada à API do Google Gemini, o custo é computado individualmente com base no consumo real de tokens (informado pelo objeto `usageMetadata` retornado pela API) e nos preços oficiais vigentes por milhão de tokens (1.000.000 tokens):

$$\text{Custo}_{\text{chamada}} = \left( \frac{\text{tokens\_input}}{1.000.000} \times \text{preço\_input} \right) + \left( \frac{\text{tokens\_output}}{1.000.000} \times \text{preço\_output} \right)$$

### Somatório da Sessão:
$$\text{Custo Total da Sessão} = \sum_{i=1}^{N} \text{Custo}_{\text{chamada } i}$$

$$\text{Total Tokens de Input} = \sum_{i=1}^{N} \text{tokens\_input}_i$$

$$\text{Total Tokens de Output} = \sum_{i=1}^{N} \text{tokens\_output}_i$$

---

## 2. 📋 Tabela Oficial de Preços (Google Gemini API)

Abaixo estão os valores de referência da tabela oficial de preços para a API Google Gemini (valores em Dólares Americanos - USD):

| Modelo | Preço Input (até 128k tokens) | Preço Output (inclui reasoning/thinking) | Preço Input (> 128k tokens) | Preço Output (> 128k tokens) | Observações |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **gemini-3.7-flash** *(Padrão da Aplicação)* | **$0.15** / 1M tokens ($0.00015 / 1k) | **$0.60** / 1M tokens ($0.00060 / 1k) | $0.30 / 1M tokens | $1.20 / 1M tokens | Alta velocidade, raciocínio avançado, excelente custo-benefício |
| **gemini-2.5-flash** / **gemini-flash-latest** | **$0.15** / 1M tokens | **$0.60** / 1M tokens | $0.30 / 1M tokens | $1.20 / 1M tokens | Otimizado para tarefas em tempo real |
| **gemini-3.1-flash-lite** | **$0.075** / 1M tokens | **$0.30** / 1M tokens | $0.15 / 1M tokens | $0.60 / 1M tokens | Ultra econômico para tarefas diretas |
| **gemini-3.1-pro-preview** | **$1.25** / 1M tokens | **$5.00** / 1M tokens | $2.50 / 1M tokens | $10.00 / 1M tokens | Modelo para raciocínio complexo profundo |

> **Nota sobre Caching de Contexto**: Requisições com cache de contexto ativo possuem desconto de 50% a 75% no preço de input.

---

## 3. 🏷️ Free Tier vs. Paid Tier (Cálculo Hipotético)

- **No Plano Gratuito (Free Tier)**: O Google AI Studio fornece cotas gratuitas para desenvolvimento (ex: até 15 RPM / 1 milhão TPM conforme o modelo). Nenhuma cobrança financeira real é debitada do cartão.
- **Cálculo Hipotético**: Em cumprimento às diretrizes do projeto, **todas as chamadas efetuadas na aplicação calculam o custo hipotético como se estivessem rodando no plano pago (Pay-as-you-go)**. Isso permite que a instituição de ensino ou o docente dimensione com exatidão a volumetria de custos para produção em larga escala.

---

## 4. 🔍 Como a Aplicação Extrai e Registra os Metadados

No servidor backend (`server.ts`), ao executar chamadas via `@google/genai`:

```typescript
const response = await ai.models.generateContent({
  model: "gemini-3.7-flash",
  contents: prompt,
  config: { ... }
});

// Extração do consumo de tokens informado pelo Gemini:
const inputTokens = response.usageMetadata?.promptTokenCount || 0;
const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
const totalTokens = response.usageMetadata?.totalTokenCount || (inputTokens + outputTokens);

// Preços para gemini-3.7-flash (USD por 1 milhão de tokens):
const PRICE_INPUT_PER_M = 0.15;
const PRICE_OUTPUT_PER_M = 0.60;

const costInput = (inputTokens / 1_000_000) * PRICE_INPUT_PER_M;
const costOutput = (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_M;
const callCost = costInput + costOutput;
```

A resposta retornada ao cliente inclui:
```json
{
  "text": "...",
  "usage": {
    "model": "gemini-3.7-flash",
    "inputTokens": 450,
    "outputTokens": 280,
    "totalTokens": 730,
    "inputPricePerMillion": 0.15,
    "outputPricePerMillion": 0.60,
    "costUSD": 0.0002355,
    "costBRL": 0.001366
  }
}
```

---

## 5. 💡 Recursos com Inteligência Artificial no Portal do Professor

1. **Avaliação Inteligente da Turma (Diagnóstico Pedagógico)**:
   - Analisa médias, taxas de frequência, desvio de notas e participação dos alunos para produzir um parecer pedagógico com planos de ação e recomendações personalizadas.
   - *Consumo médio*: ~600 tokens input, ~400 tokens output $\rightarrow$ **~$0.00033 USD (~R$ 0,0019)**.

2. **Assistente de Notificações e Comunicados**:
   - Redige comunicados formais, avisos de provas e avisos de recuperação com tom ajustável (Incentivador, Formal, Urgente, Construtivo).
   - *Consumo médio*: ~350 tokens input, ~250 tokens output $\rightarrow$ **~$0.00020 USD (~R$ 0,0012)**.

3. **Gerador de Materiais e Exercícios de Aula**:
   - Cria resumos teóricos, roteiros de aula, listas de exercícios resolvidos e propostas de trabalhos práticos para qualquer tópico cadastrado.
   - *Consumo médio*: ~500 tokens input, ~550 tokens output $\rightarrow$ **~$0.00041 USD (~R$ 0,0024)**.

4. **Painel de Auditoria de Custos em Tempo Real**:
   - Localizado no cabeçalho e na aba dedicada do sistema, exibindo histórico detalhado de todas as chamadas da sessão, total de tokens consumidos, custos em USD e BRL, e simulador de custos de volumetria acadêmica.

---

## 6. 📈 Exemplo Prático de Acúmulo de Sessão

Suponha uma sessão de trabalho de um professor realizando:
- 3 diagnósticos de turmas (3 x 1.000 tokens = 3.000 tokens)
- 4 comunicados gerados para alunos (4 x 600 tokens = 2.400 tokens)
- 2 listas de exercícios elaboradas (2 x 1.200 tokens = 2.400 tokens)

**Total da sessão**: 7.800 tokens.  
**Custo total estimado**: **$0.0028 USD** (Aproximadamente **R$ 0,016** para todo o expediente).
