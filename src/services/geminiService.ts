import { GeminiUsageMetadata } from '../types';

export interface EvaluateClassResponse {
  success: boolean;
  data: {
    summary: string;
    strengths: string[];
    attentionPoints: string[];
    pedagogicalActionPlan: string;
    suggestedInterventions?: Array<{
      topic: string;
      action: string;
      targetGroup: string;
    }>;
  };
  usage: GeminiUsageMetadata;
  error?: string;
}

export interface DraftNotificationResponse {
  success: boolean;
  data: {
    title: string;
    content: string;
    recommendedChannel?: string;
    urgencyLevel?: string;
  };
  usage: GeminiUsageMetadata;
  error?: string;
}

export interface GenerateMaterialResponse {
  success: boolean;
  data: {
    title: string;
    unitCategory: string;
    summary: string;
    contentMarkdown: string;
    estimatedStudyTimeMinutes?: number;
    suggestedTags?: string[];
  };
  usage: GeminiUsageMetadata;
  error?: string;
}

export interface PedagogicalAssistantResponse {
  success: boolean;
  answer: string;
  usage: GeminiUsageMetadata;
  error?: string;
}

export async function evaluateClassWithGemini(params: {
  className: string;
  course: string;
  studentCount: number;
  attendanceAverage: string;
  gradeAverage: string;
  distribution: any;
  qualitativeNotes?: string;
}): Promise<EvaluateClassResponse> {
  const response = await fetch('/api/gemini/evaluate-class', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro na chamada do Gemini (${response.status})`);
  }
  return response.json();
}

export async function draftNotificationWithGemini(params: {
  topic: string;
  category: string;
  targetAudience: string;
  tone: string;
  keyPoints: string;
}): Promise<DraftNotificationResponse> {
  const response = await fetch('/api/gemini/draft-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro na chamada do Gemini (${response.status})`);
  }
  return response.json();
}

export async function generateMaterialWithGemini(params: {
  subject: string;
  topicName: string;
  materialType: string;
  difficulty: string;
  targetClass: string;
}): Promise<GenerateMaterialResponse> {
  const response = await fetch('/api/gemini/generate-material', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro na chamada do Gemini (${response.status})`);
  }
  return response.json();
}

export async function askPedagogicalAssistant(params: {
  question: string;
  context?: any;
}): Promise<PedagogicalAssistantResponse> {
  const response = await fetch('/api/gemini/pedagogical-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro na chamada do Gemini (${response.status})`);
  }
  return response.json();
}
