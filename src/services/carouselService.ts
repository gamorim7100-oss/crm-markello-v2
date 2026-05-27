// ============================================================
// carouselService.ts
// Responsável por:
// 1. Extrair conteúdo via Jina Reader (notícia ou vídeo)
// 2. Chamar a OpenAI com o system prompt estruturado
// 3. Retornar CarouselData tipado
// ============================================================

import type { CarouselData, SourceType } from '@/types/carousel.types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const JINA_READER_BASE = 'https://r.jina.ai/';
const EXTRACTION_TIMEOUT_MS = 20000;
const GENERATION_TIMEOUT_MS = 40000;

// ─────────────────────────────────────────────────────────────
// Utilitários
// ─────────────────────────────────────────────────────────────

/** Fetch com timeout controlado */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Valida se a string é uma URL válida */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Detecta se a URL é do YouTube */
function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes('youtube.com') ||
      parsed.hostname.includes('youtu.be')
    );
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Etapa 1: Extração de conteúdo
// ─────────────────────────────────────────────────────────────

/**
 * Extrai o conteúdo textual de uma URL usando o Jina Reader.
 * Funciona para notícias e para páginas do YouTube (extrai a descrição
 * e metadados visíveis na página).
 */
async function extractContentFromUrl(url: string): Promise<string> {
  const jinaUrl = `${JINA_READER_BASE}${url}`;

  let response: Response;

  try {
    response = await fetchWithTimeout(
      jinaUrl,
      {
        headers: {
          Accept: 'text/plain',
          'X-Return-Format': 'text',
        },
      },
      EXTRACTION_TIMEOUT_MS
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'A extração do conteúdo demorou muito. Tente um link diferente ou cole o texto manualmente.'
      );
    }
    throw new Error(
      'Não foi possível acessar a URL. Verifique sua conexão ou tente outro link.'
    );
  }

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      throw new Error(
        'Este site bloqueou o acesso automático. Tente colar o texto manualmente.'
      );
    }
    if (response.status === 404) {
      throw new Error('URL não encontrada (404). Verifique o link e tente novamente.');
    }
    throw new Error(
      `Não foi possível ler este link (erro ${response.status}). Tente outro.`
    );
  }

  const text = await response.text();

  if (!text || text.trim().length < 100) {
    throw new Error(
      'O conteúdo extraído é muito curto para gerar um carrossel. Tente um link com mais texto.'
    );
  }

  // Limita a 12.000 caracteres para não estouro de tokens
  return text.slice(0, 12000);
}

/**
 * Ponto de entrada principal para extração.
 * Suporta notícias e vídeos do YouTube.
 */
export async function extractContent(url: string, sourceType: SourceType): Promise<string> {
  const isYT = isYouTubeUrl(url);

  if (sourceType === 'video' && !isYT) {
    throw new Error(
      'Para vídeos, use apenas links do YouTube por enquanto. O suporte a outras plataformas está em desenvolvimento.'
    );
  }

  const content = await extractContentFromUrl(url);
  return content;
}

// ─────────────────────────────────────────────────────────────
// Etapa 2: Geração com LLM (OpenAI gpt-4o-mini)
// ─────────────────────────────────────────────────────────────

function getSystemPrompt(slideCount: number): string {
  return `Você é um copywriter especialista em marketing digital e criação de conteúdo para Instagram.
Sua tarefa é transformar o texto fornecido em um carrossel de Instagram profissional.

REGRAS OBRIGATÓRIAS:
- Gere EXATAMENTE ${slideCount} slides.
- O conteúdo deve ser em PORTUGUÊS BRASILEIRO
- Cada slide deve ser conciso e impactante (máximo 3-4 linhas de texto)
- Use linguagem direta, dinâmica e engajante
- Nunca use jargões ou termos muito técnicos sem explicação

ESTRUTURA DOS SLIDES:
- Slide 1 (HOOK): Título chamativo e provocativo que prende a atenção. Deve gerar curiosidade imediata.
- Slides intermediários: Desenvolva o problema e entregue o valor de forma mastigada.
- Último Slide (CTA): Call to Action claro. Ex: "Salve esse carrossel", "Compartilhe", "Siga".

SAÍDA: Retorne APENAS um JSON válido, sem texto adicional.
O JSON deve seguir EXATAMENTE este formato:
{
  "carousel_title": "Título descritivo do carrossel",
  "slides": [
    {
      "slide_number": 1,
      "title": "Título do slide",
      "content": "Corpo do texto do slide",
      "image_suggestion": "Prompt descritivo em inglês para o DALL-E gerar o fundo. Ex: 'A bright abstract geometric background with neon colors', 'A calm minimal office desk with a laptop'"
    }
  ]
}`;
}

/**
 * Envia o conteúdo extraído para a OpenAI e retorna CarouselData tipado.
 */
export async function generateCarousel(
  extractedContent: string,
  sourceUrl: string,
  slideCount: number
): Promise<CarouselData> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      'Chave da API OpenAI não configurada. Adicione VITE_OPENAI_API_KEY ao .env.local'
    );
  }

  const userMessage = `URL de origem: ${sourceUrl}\n\nConteúdo extraído:\n\n${extractedContent}`;

  const requestBody = {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: getSystemPrompt(slideCount) },
      { role: 'user', content: userMessage },
    ],
  };

  let response: Response;

  try {
    response = await fetchWithTimeout(
      OPENAI_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      },
      GENERATION_TIMEOUT_MS
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'A IA demorou muito para responder. Tente novamente em alguns instantes.'
      );
    }
    throw new Error(
      'Erro ao conectar à API de IA. Verifique sua conexão e tente novamente.'
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Chave da API inválida. Verifique sua VITE_OPENAI_API_KEY.');
    }
    if (response.status === 429) {
      throw new Error(
        'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.'
      );
    }
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Erro na API de IA (${response.status}): ${errorBody || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  const rawContent: string = data?.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('A IA retornou uma resposta vazia. Tente novamente.');
  }

  let parsed: CarouselData;
  try {
    parsed = JSON.parse(rawContent) as CarouselData;
  } catch {
    throw new Error('A IA retornou um formato inválido. Tente regenerar.');
  }

  // Validação mínima da estrutura
  if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error('O carrossel gerado não contém slides. Tente novamente.');
  }

  return parsed;
}

// ─────────────────────────────────────────────────────────────
// Pipeline completo: extração → geração
// ─────────────────────────────────────────────────────────────

export async function generateCarouselFromUrl(
  url: string,
  sourceType: SourceType,
  slideCount: number,
  onStatusChange?: (status: string) => void
): Promise<CarouselData> {
  onStatusChange?.('Extraindo conteúdo da URL...');
  const content = await extractContent(url, sourceType);

  onStatusChange?.('Gerando carrossel com IA...');
  const carousel = await generateCarousel(content, url, slideCount);

  return carousel;
}

// ─────────────────────────────────────────────────────────────
// Etapa 3: Geração de Imagem com DALL-E 3
// ─────────────────────────────────────────────────────────────

/**
 * Gera uma imagem usando DALL-E 3 com base na sugestão de imagem da IA.
 */
export async function generateImageForSlide(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('Chave da API OpenAI não configurada.');
  }

  const enhancedPrompt = `A high quality, aesthetic background image for an Instagram carousel slide. No text in the image. Style: Modern, clean, minimal. Concept: ${prompt}`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const apiError = errorData?.error?.message || `Erro na geração de imagem (${response.status})`;
      throw new Error(apiError);
    }

    const data = await response.json();
    if (data.data && data.data[0] && data.data[0].url) {
      return data.data[0].url;
    }
    throw new Error('Formato de resposta de imagem inválido.');
  } catch (error: any) {
    console.error('Erro DALL-E:', error);
    // Repassa a mensagem original se existir, senão usa a genérica
    throw new Error(error.message || 'Não foi possível gerar a imagem no momento.');
  }
}
