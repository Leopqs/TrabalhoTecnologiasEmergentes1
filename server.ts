import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const PRICE_INPUT_PER_M = 0.15; // USD per 1M prompt tokens for gemini-3.7-flash
const PRICE_OUTPUT_PER_M = 0.60; // USD per 1M candidate tokens for gemini-3.7-flash
const DEFAULT_BRL_RATE = 5.80;

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function calculateCost(promptTokens: number, candidateTokens: number, brlRate: number = DEFAULT_BRL_RATE) {
  const costInputUSD = (promptTokens / 1_000_000) * PRICE_INPUT_PER_M;
  const costOutputUSD = (candidateTokens / 1_000_000) * PRICE_OUTPUT_PER_M;
  const totalCostUSD = costInputUSD + costOutputUSD;
  const totalCostBRL = totalCostUSD * brlRate;

  return {
    promptTokens,
    candidateTokens,
    totalTokens: promptTokens + candidateTokens,
    inputPricePerMillion: PRICE_INPUT_PER_M,
    outputPricePerMillion: PRICE_OUTPUT_PER_M,
    costUSD: totalCostUSD,
    costBRL: totalCostBRL,
  };
}

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Endpoint: AI Class Performance Diagnostic & Evaluation
app.post("/api/gemini/evaluate-class", async (req, res) => {
  try {
    const { className, course, studentCount, attendanceAverage, gradeAverage, distribution, qualitativeNotes } = req.body;

    const prompt = `Você é um consultor pedagógico universitário sênior especialista em avaliação institucional e metodologias ativas de ensino.
Analise os dados acadêmicos da turma abaixo e gere um parecer pedagógico estruturado em formato JSON rigoroso.

DADOS DA TURMA:
- Disciplina: ${className || "Engenharia de Software"}
- Curso: ${course || "Computação"}
- Quantidade de Alunos: ${studentCount || 35}
- Taxa Média de Frequência: ${attendanceAverage || "82%"}
- Média Geral de Notas da Turma: ${gradeAverage || "7.4 / 10.0"}
- Distribuição de Desempenho: ${JSON.stringify(distribution || {})}
- Observações Qualitativas do Professor: "${qualitativeNotes || "Alunos participativos nos projetos práticos, mas demonstraram dificuldade na interpretação de requisitos e nas entregas teóricas pontuais."}"

Gere uma resposta exclusivamente em JSON com a seguinte estrutura:
{
  "summary": "Resumo analítico do diagnóstico geral da turma (2 a 3 parágrafos claros e construtivos)",
  "strengths": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3"],
  "attentionPoints": ["Ponto de atenção ou vulnerabilidade 1", "Ponto de atenção 2", "Ponto de atenção 3"],
  "pedagogicalActionPlan": "Plano de intervenção pedagógica sugerido em tópicos estruturados (metodologias ativas, revisão direcionada, nivelamento e engajamento)",
  "suggestedInterventions": [
    {
      "topic": "Nome da intervenção",
      "action": "Descrição prática da atividade ou dinâmica recomendada",
      "targetGroup": "Toda a turma" ou "Alunos em recuperação"
    }
  ]
}`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const rawText = response.text || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = { summary: rawText, strengths: [], attentionPoints: [], pedagogicalActionPlan: rawText };
    }

    const promptTokens = response.usageMetadata?.promptTokenCount || 450;
    const candidatesTokens = response.usageMetadata?.candidatesTokenCount || 380;
    const costData = calculateCost(promptTokens, candidatesTokens);

    res.json({
      success: true,
      data: parsedData,
      usage: {
        model: "gemini-3.7-flash",
        promptTokenCount: promptTokens,
        candidatesTokenCount: candidatesTokens,
        totalTokenCount: promptTokens + candidatesTokens,
        ...costData,
        timestamp: new Date().toISOString(),
        operationType: "Diagnóstico Pedagógico da Turma",
        summaryTitle: `Avaliação IA: ${className || "Turma"}`,
      },
    });
  } catch (error: any) {
    console.error("Error evaluating class with Gemini:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Erro ao processar diagnóstico com Gemini.",
    });
  }
});

// 2. Endpoint: AI Notification & Announcement Drafter
app.post("/api/gemini/draft-notification", async (req, res) => {
  try {
    const { topic, category, targetAudience, tone, keyPoints } = req.body;

    const prompt = `Você é um redator de comunicações acadêmicas para professores universitários e de ensino superior.
Crie um comunicado/notificação oficial, claro e acolhedor para os estudantes.

DETALHES:
- Assunto/Objetivo: ${topic || "Aviso sobre entrega de trabalho e prova"}
- Categoria: ${category || "aviso"} (opções: aviso, urgente, prova, material, institucional)
- Público Alvo: ${targetAudience || "Turma de Engenharia de Software"}
- Tom de Voz: ${tone || "Claro, incentivador e profissional"}
- Pontos Chave a Mencionar: ${keyPoints || "Data limite na sexta-feira, envio via portal, dúvidas no horário de monitoria"}

Retorne APENAS um JSON com o seguinte formato:
{
  "title": "Título chamativo e formal do comunicado",
  "content": "Corpo completo da mensagem formatado com quebras de linha e emojis educados adequados",
  "recommendedChannel": "Portal Acadêmico / Email Institucional",
  "urgencyLevel": "Normal" ou "Alta" ou "Baixa"
}`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const rawText = response.text || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = { title: topic, content: rawText };
    }

    const promptTokens = response.usageMetadata?.promptTokenCount || 320;
    const candidatesTokens = response.usageMetadata?.candidatesTokenCount || 220;
    const costData = calculateCost(promptTokens, candidatesTokens);

    res.json({
      success: true,
      data: parsedData,
      usage: {
        model: "gemini-3.7-flash",
        promptTokenCount: promptTokens,
        candidatesTokenCount: candidatesTokens,
        totalTokenCount: promptTokens + candidatesTokens,
        ...costData,
        timestamp: new Date().toISOString(),
        operationType: "Redação de Notificação com IA",
        summaryTitle: `Comunicado: ${topic || "Aviso"}`,
      },
    });
  } catch (error: any) {
    console.error("Error drafting notification with Gemini:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Erro ao redigir notificação com Gemini.",
    });
  }
});

// 3. Endpoint: AI Lesson Material & Exercise Generator
app.post("/api/gemini/generate-material", async (req, res) => {
  try {
    const { subject, topicName, materialType, difficulty, targetClass } = req.body;

    const prompt = `Você é um professor e autor de material didático universitário.
Gere um conteúdo de apoio educacional de alta qualidade para a aula.

PARÂMETROS:
- Disciplina: ${subject || "Engenharia de Software"}
- Turma: ${targetClass || "3º Semestre"}
- Tópico/Unidade: ${topicName || "Padrões de Projeto (Design Patterns - Factory e Singleton)"}
- Tipo de Material: ${materialType || "Lista de Exercícios Práticos com Gabarito"} (opções: Resumo Teórico, Roteiro de Aula Prática, Lista de Exercícios, Estudo de Caso)
- Nível de Dificuldade: ${difficulty || "Intermediário"}

Retorne APENAS um JSON no seguinte formato:
{
  "title": "Título completo do material",
  "unitCategory": "Ex: Unidade 2 - Arquitetura de Software",
  "summary": "Breve sinopse do conteúdo (1 parágrafo)",
  "contentMarkdown": "Texto completo do material estruturado em Markdown com seções, exemplos de código/conceitos, questões ou roteiro didático passo a passo",
  "estimatedStudyTimeMinutes": 45,
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const rawText = response.text || "{}";
    let parsedData = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = { title: topicName, contentMarkdown: rawText, summary: topicName };
    }

    const promptTokens = response.usageMetadata?.promptTokenCount || 480;
    const candidatesTokens = response.usageMetadata?.candidatesTokenCount || 520;
    const costData = calculateCost(promptTokens, candidatesTokens);

    res.json({
      success: true,
      data: parsedData,
      usage: {
        model: "gemini-3.7-flash",
        promptTokenCount: promptTokens,
        candidatesTokenCount: candidatesTokens,
        totalTokenCount: promptTokens + candidatesTokens,
        ...costData,
        timestamp: new Date().toISOString(),
        operationType: "Geração de Material Didático",
        summaryTitle: `Material: ${topicName || "Aula"}`,
      },
    });
  } catch (error: any) {
    console.error("Error generating material with Gemini:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Erro ao gerar material com Gemini.",
    });
  }
});

// 4. Endpoint: AI Pedagogical Assistant & Q&A
app.post("/api/gemini/pedagogical-assistant", async (req, res) => {
  try {
    const { question, context } = req.body;

    const prompt = `Você é o Assistente Pedagógico com IA do Portal do Professor.
Seu papel é ajudar o docente em tarefas como:
- Estratégias para lidar com turmas desmotivadas ou com alto índice de faltas
- Sugestão de critérios de rubricas de avaliação
- Dicas para otimização de horário de atendimento
- Ideias de dinâmicas para aulas teóricas e práticas
- Elaboração de questões dissertativas e de múltipla escolha com distratores

Pergunta do professor: "${question}"
Contexto adicional: ${JSON.stringify(context || {})}

Responda em tom profissional, encorajador e altamente prático, em Português do Brasil com formatação Markdown clara.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const answer = response.text || "Sem resposta gerada.";
    const promptTokens = response.usageMetadata?.promptTokenCount || 310;
    const candidatesTokens = response.usageMetadata?.candidatesTokenCount || 340;
    const costData = calculateCost(promptTokens, candidatesTokens);

    res.json({
      success: true,
      answer,
      usage: {
        model: "gemini-3.7-flash",
        promptTokenCount: promptTokens,
        candidatesTokenCount: candidatesTokens,
        totalTokenCount: promptTokens + candidatesTokens,
        ...costData,
        timestamp: new Date().toISOString(),
        operationType: "Assistente Pedagógico IA",
        summaryTitle: question.slice(0, 40) + "...",
      },
    });
  } catch (error: any) {
    console.error("Error in pedagogical assistant with Gemini:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Erro no Assistente Pedagógico.",
    });
  }
});

// Server bootstrap with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Portal do Professor server running on http://localhost:${PORT}`);
  });
}

startServer();
