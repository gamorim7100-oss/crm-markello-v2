// ============================================================
// carouselService.ts
// AI Extraction & Generation for Carousel V2
// ============================================================

import type { SourceType, TemplateType, SlideV2 } from '@/types/carousel-v2.types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const JINA_READER_BASE = 'https://r.jina.ai/';
const EXTRACTION_TIMEOUT_MS = 20000;
const GENERATION_TIMEOUT_MS = 40000;

// ─────────────────────────────────────────────────────────────
// Extraction
// ─────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

async function extractContentFromUrl(url: string): Promise<string> {
  const jinaUrl = `${JINA_READER_BASE}${url}`;
  let response: Response;
  try {
    response = await fetchWithTimeout(jinaUrl, { headers: { Accept: 'text/plain', 'X-Return-Format': 'text' } }, EXTRACTION_TIMEOUT_MS);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('A extração demorou muito. Tente um link diferente.');
    throw new Error('Não foi possível acessar a URL. Verifique a conexão.');
  }

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new Error('Este site bloqueou o acesso.');
    if (response.status === 404) throw new Error('URL não encontrada (404).');
    throw new Error(`Erro ${response.status} ao extrair URL.`);
  }

  const text = await response.text();
  if (!text || text.trim().length < 100) throw new Error('Conteúdo muito curto.');
  return text.slice(0, 12000);
}

export async function extractContent(url: string, sourceType: SourceType): Promise<string> {
  const isYT = isYouTubeUrl(url);
  if (sourceType === 'video' && !isYT) throw new Error('Use apenas links do YouTube para vídeos.');
  return await extractContentFromUrl(url);
}

// ─────────────────────────────────────────────────────────────
// AI Generation per Template
// ─────────────────────────────────────────────────────────────

function getSystemPromptForTemplate(templateType: TemplateType): string {
  const baseInstructions = `Você é um copywriter genial especializado em Instagram viral.
Seu objetivo é transformar o conteúdo fornecido em um carrossel magnético e altamente engajante.
Você deve retornar APENAS um JSON válido contendo um array de objetos chamado "slides".
Cada slide DEVE conter: "type", "title", "bodyText". O array representa os slides ordenados.
As regras de "type" permitidos são: COVER, CONTENT, TRANSITION, CTA.
Mantenha o texto ultra curto, direto e de altíssimo impacto. Sem blocos densos de texto. O idioma deve ser Português do Brasil.`;

  let specificInstructions = '';

  switch (templateType) {
    case 'TUTORIAL':
      specificInstructions = `ESTRUTURA TUTORIAL (Aprox. 7 a 9 slides):
- Slide 1 (type: COVER): "title" deve ser uma promessa forte, ex: "O Guia Definitivo de [X]". "subtitle" (opcional) detalhando a promessa. "stepNumber": 0
- Slides 2 até N-2 (type: CONTENT): "title" ex:"Passo 1", "bodyText" ultra focado na ação. DEVE incluir a propriedade "stepNumber" (1, 2, 3...).
- Slide N-1 (type: TRANSITION): "title" ex:"✅ Checklist Rápido", "bodyText" um bullet-point dos passos. "stepNumber": 0
- Slide N (type: CTA): "title" ex:"💾 Salve este guia", "bodyText" chamando para salvar/compartilhar. "stepNumber": 0`;
      break;

    case 'MYTH_BUSTER':
      specificInstructions = `ESTRUTURA MYTH BUSTER (Aprox. 6 a 8 slides):
- Slide 1 (type: COVER): "title" deve ser a crença comum/mito aspeada. DEVE ter "isTruth": false
- Slide 2 (type: CONTENT): "title" ex:"Por que você acredita nisso?", "bodyText" explicando o viés. DEVE ter "isTruth": false
- Slide 3 (type: TRANSITION): "title" ex:"⚡ A Verdade Crua", "bodyText" ou "subtitle" preparando o terreno. DEVE ter "isTruth": true
- Slides 4 até N-2 (type: CONTENT): "title" com o argumento central, "bodyText" com a quebra da objeção. DEVE ter "isTruth": true
- Slide N-1 (type: TRANSITION): "title" ex:"Conclusão", "bodyText" resumindo a revelação. DEVE ter "isTruth": true
- Slide N (type: CTA): "title" apelativo para compartilhamento, "bodyText" pedindo para compartilhar para ajudar outros. DEVE ter "isTruth": true`;
      break;

    case 'CASE_STUDY':
      specificInstructions = `ESTRUTURA CASE STUDY (Aprox. 6 a 8 slides):
- Slide 1 (type: COVER): "title" como o cliente/situação alcançou algo impossível. DEVE ter "metric" (string, ex: "+300% de crescimento").
- Slide 2 (type: CONTENT): "title" ex:"🔴 O Ponto de Partida", "bodyText" explicando a dor.
- Slide 3 (type: CONTENT): "title" ex:"🔍 O Diagnóstico", "bodyText" o que foi percebido.
- Slides intermediários (type: CONTENT): "title" com os passos da solução, "bodyText" com a execução. Podem incluir "metric" se relevante.
- Slide N-1 (type: TRANSITION): "title" ex:"A Grande Lição", "bodyText" princípio replicável.
- Slide N (type: CTA): "title" focado em conversão ou inbox (ex:"Quer resultados assim?"), "bodyText" pedindo clique no link da bio. "metric": ""`;
      break;

    case 'CURATION':
      specificInstructions = `ESTRUTURA CURADORIA/LISTA (Aprox. 6 a 9 slides):
- Slide 1 (type: COVER): "title" focado em uma lista (ex: "7 Ferramentas que mudam o jogo"), "subtitle" o benefício final.
- Slides 2 a N-2 (type: CONTENT): DEVE ter "itemName" (nome da ferramenta/conceito). "title" como o benefício, "bodyText" curta descrição. Opcional "iconType" (emoji).
- Slide N-1 (type: TRANSITION): "itemName" ex:"🏆 Bônus", "title" a dica de ouro, "bodyText" o segredo. "iconType": "🎁"
- Slide N (type: CTA): "title" ex:"Faltou alguma?", "bodyText" estimulando comentários e saves.`;
      break;

    case 'MANIFESTO':
      specificInstructions = `ESTRUTURA MANIFESTO/THREAD (Aprox. 7 a 10 slides):
- Slides não possuem "title", apenas "bodyText". O texto DEVE ter no máximo 10 palavras por slide para gerar curiosidade!
- Slide 1 (type: COVER): "bodyText" uma frase polemica que abre um loop aberto. DEVE ter "isCliffhanger": true
- Slides intermediários (type: CONTENT): "bodyText" com continuação fluida. Todos com "isCliffhanger": true. O ÚLTIMO slide de conteúdo tem "isCliffhanger": false.
- Slide N-1 (type: TRANSITION): "title" ex:"A grande pergunta:", "bodyText" questionamento final reflexivo. "isCliffhanger": false
- Slide N (type: CTA): "title" leve, ex:"Siga para evoluir", "bodyText" reforçando o movimento. "isCliffhanger": false
(O uso do campo title é restrito ao Transition e CTA, no cover/content foque apenas no bodyText).`;
      break;
  }

  return `${baseInstructions}\n\n${specificInstructions}\n\nO JSON final deve ter esta exata estrutura:\n{ "slides": [ { ... propriedades baseadas nas regras acima ... } ] }`;
}

export async function generateCarouselV2(extractedContent: string, sourceUrl: string, templateType: TemplateType): Promise<SlideV2[]> {
  if (!OPENAI_API_KEY) throw new Error('API Key ausente no .env.local');

  const userMessage = `URL fonte: ${sourceUrl}\nConteúdo Extraído:\n${extractedContent}`;
  const requestBody = {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: getSystemPromptForTemplate(templateType) },
      { role: 'user', content: userMessage },
    ],
  };

  const response = await fetchWithTimeout(OPENAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify(requestBody),
  }, GENERATION_TIMEOUT_MS).catch(e => {
    if (e.name === 'AbortError') throw new Error('A IA demorou muito. Tente novamente.');
    throw new Error('Erro de conexão com a IA.');
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('API Key inválida.');
    if (response.status === 429) throw new Error('Limite de uso da OpenAI atingido.');
    throw new Error(`Erro da IA (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('IA retornou vazio.');

  let parsed: { slides: SlideV2[] };
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error('IA retornou um JSON inválido.');
  }

  if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error('Carrossel gerado não contém slides válidos.');
  }

  // Sanitize indices
  return parsed.slides.map((s, idx) => ({ ...s, slideIndex: idx }));
}

export async function generateCarouselV2FromUrl(
  url: string,
  sourceType: SourceType,
  templateType: TemplateType,
  onStatusChange?: (status: string) => void
): Promise<SlideV2[]> {
  onStatusChange?.('Extraindo conteúdo da URL...');
  const content = await extractContent(url, sourceType);

  onStatusChange?.('Gerando conteúdo estruturado com IA...');
  const slides = await generateCarouselV2(content, url, templateType);

  return slides;
}

// ─────────────────────────────────────────────────────────────
// (Opcional) DALL-E / GPT-Image 2 para fundos - mantido por segurança
// ─────────────────────────────────────────────────────────────
export async function generateImageForSlide(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error('Chave da API OpenAI não configurada.');
  const enhancedPrompt = `A high quality, aesthetic background image for an Instagram carousel slide. No text in the image. Style: Modern, clean, minimal. Concept: ${prompt}`;
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-image-2', prompt: enhancedPrompt, n: 1, size: '1024x1024' }),
    });
    if (!response.ok) throw new Error('Erro ao gerar imagem.');
    const data = await response.json();
    if (data.data?.[0]?.url) return data.data[0].url;
    if (data.data?.[0]?.b64_json) return `data:image/png;base64,${data.data[0].b64_json}`;
    throw new Error('Resposta de imagem inválida.');
  } catch (error: any) {
    throw new Error(error.message || 'Falha ao gerar imagem.');
  }
}
