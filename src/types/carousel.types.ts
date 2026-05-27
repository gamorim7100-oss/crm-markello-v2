// ============================================================
// Tipos e interfaces para o Gerador de Carrossel
// ============================================================

/** Tipo de fonte da URL fornecida pelo usuário */
export type SourceType = 'news' | 'video';

/** Um slide individual do carrossel */
export interface CarouselSlide {
  slide_number: number;
  title: string;
  content: string;
  image_suggestion: string;
  image_url?: string;
  is_generating_image?: boolean;
}

/** Resposta completa gerada pela LLM */
export interface CarouselData {
  carousel_title: string;
  slides: CarouselSlide[];
}

/** Estado da requisição de geração */
export type GenerationStatus = 'idle' | 'extracting' | 'generating' | 'done' | 'error';

/** Payload enviado para o serviço de geração */
export interface GenerateCarouselPayload {
  url: string;
  sourceType: SourceType;
  slideCount: number;
}
