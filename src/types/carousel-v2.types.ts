// ============================================================
// carousel-v2.types.ts
// Multi-template carousel type system
// ============================================================

/** The 5 strategic template types */
export type TemplateType =
  | 'TUTORIAL'
  | 'MYTH_BUSTER'
  | 'CASE_STUDY'
  | 'CURATION'
  | 'MANIFESTO';

/** Slide role within a carousel */
export type SlideType = 'COVER' | 'CONTENT' | 'TRANSITION' | 'CTA';

/** Source type for AI generation */
export type SourceType = 'news' | 'video';

/** Generation status state */
export type GenerationStatus = 'idle' | 'extracting' | 'generating' | 'done' | 'error';


/** Global design settings applied to all slides */
export interface GlobalSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  handle: string;
  aspectRatio: '4:5'; // always 1080x1350px
}

/** A single slide payload */
export interface SlideV2 {
  slideIndex: number;
  type: SlideType;
  title?: string;
  subtitle?: string;
  bodyText?: string;
  imageUrl?: string;
  iconType?: string;
  /** For MANIFESTO: text is cut off with '...' to force swipe */
  isCliffhanger?: boolean;
  /** For TUTORIAL: step number watermark */
  stepNumber?: number;
  /** For MYTH_BUSTER: which half (myth=false | truth=true) */
  isTruth?: boolean;
  /** For CASE_STUDY: metric to highlight */
  metric?: string;
  /** For CURATION: tool/item name */
  itemName?: string;
}

/** Full carousel document V2 */
export interface CarouselV2 {
  carouselId: string;
  templateType: TemplateType;
  globalSettings: GlobalSettings;
  slides: SlideV2[];
}

// ─── Template meta (for the selector UI) ─────────────────────

export interface TemplateMeta {
  type: TemplateType;
  label: string;
  description: string;
  focus: string;
  icon: string;
  slideCount: number;
  color: string;
  gradient: string;
}

export const TEMPLATE_LIBRARY: TemplateMeta[] = [
  {
    type: 'TUTORIAL',
    label: 'Tutorial',
    description: 'Passo a passo numerado com marca d\'água gigante',
    focus: '🔖 Foco em Saves',
    icon: '📋',
    slideCount: 10,
    color: '#3b82f6',
    gradient: 'from-blue-600 to-blue-400',
  },
  {
    type: 'MYTH_BUSTER',
    label: 'Myth Buster',
    description: 'Mito vs Verdade com alto contraste e impacto visual',
    focus: '🔁 Foco em Shares',
    icon: '⚡',
    slideCount: 10,
    color: '#ef4444',
    gradient: 'from-red-600 to-rose-400',
  },
  {
    type: 'CASE_STUDY',
    label: 'Case Study',
    description: 'Resultado quantificável + jornada do cliente',
    focus: '💰 Foco em Conversão',
    icon: '📈',
    slideCount: 10,
    color: '#8b5cf6',
    gradient: 'from-violet-600 to-purple-400',
  },
  {
    type: 'CURATION',
    label: 'Curadoria',
    description: 'Lista de ferramentas ou recursos com tipografia bold',
    focus: '🚀 Foco em Viralidade',
    icon: '🗂️',
    slideCount: 10,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-yellow-400',
  },
  {
    type: 'MANIFESTO',
    label: 'Manifesto',
    description: 'Frases impactantes fragmentadas estilo thread',
    focus: '🔄 Foco em Retenção',
    icon: '✍️',
    slideCount: 8,
    color: '#10b981',
    gradient: 'from-emerald-600 to-teal-400',
  },
];

// ─── Default slide builders per template ─────────────────────

export function buildDefaultSlides(templateType: TemplateType): SlideV2[] {
  switch (templateType) {
    case 'TUTORIAL':
      return [
        { slideIndex: 0, type: 'COVER', title: 'O Guia Definitivo de [Tema]', subtitle: 'Aprenda do zero em 8 passos simples', stepNumber: 0 },
        { slideIndex: 1, type: 'CONTENT', title: 'Passo 1', bodyText: 'Descrição da ação', stepNumber: 1 },
        { slideIndex: 2, type: 'CONTENT', title: 'Passo 2', bodyText: 'Descrição da ação', stepNumber: 2 },
        { slideIndex: 3, type: 'CONTENT', title: 'Passo 3', bodyText: 'Descrição da ação', stepNumber: 3 },
        { slideIndex: 4, type: 'CONTENT', title: 'Passo 4', bodyText: 'Descrição da ação', stepNumber: 4 },
        { slideIndex: 5, type: 'CONTENT', title: 'Passo 5', bodyText: 'Descrição da ação', stepNumber: 5 },
        { slideIndex: 6, type: 'CONTENT', title: 'Passo 6', bodyText: 'Descrição da ação', stepNumber: 6 },
        { slideIndex: 7, type: 'CONTENT', title: 'Passo 7', bodyText: 'Descrição da ação', stepNumber: 7 },
        { slideIndex: 8, type: 'TRANSITION', title: '✅ Checklist Final', bodyText: '• Item 1\n• Item 2\n• Item 3\n• Item 4', stepNumber: 0 },
        { slideIndex: 9, type: 'CTA', title: '💾 Salve para não perder!', bodyText: 'Compartilhe com quem precisa aprender isso', stepNumber: 0 },
      ];
    case 'MYTH_BUSTER':
      return [
        { slideIndex: 0, type: 'COVER', title: '"[Mito polêmico que todo mundo acredita]"', isTruth: false },
        { slideIndex: 1, type: 'CONTENT', title: 'A dor que isso causa', bodyText: 'Descreva a consequência negativa de acreditar no mito', isTruth: false },
        { slideIndex: 2, type: 'TRANSITION', title: '⚡ A Verdade é...', subtitle: 'Prepare-se para mudar sua perspectiva', isTruth: true },
        { slideIndex: 3, type: 'CONTENT', title: 'Argumento 1', bodyText: 'Detalhe o primeiro ponto da verdade', isTruth: true },
        { slideIndex: 4, type: 'CONTENT', title: 'Argumento 2', bodyText: 'Detalhe o segundo ponto da verdade', isTruth: true },
        { slideIndex: 5, type: 'CONTENT', title: 'Argumento 3', bodyText: 'Detalhe o terceiro ponto da verdade', isTruth: true },
        { slideIndex: 6, type: 'CONTENT', title: 'Argumento 4', bodyText: 'Detalhe o quarto ponto da verdade', isTruth: true },
        { slideIndex: 7, type: 'CONTENT', title: 'Argumento 5', bodyText: 'Detalhe o quinto ponto da verdade', isTruth: true },
        { slideIndex: 8, type: 'TRANSITION', title: '🎯 Conclusão', bodyText: 'Resumo poderoso da revelação', isTruth: true },
        { slideIndex: 9, type: 'CTA', title: '🔁 Compartilhe com quem precisa ouvir isso!', bodyText: 'Marque alguém que ainda acredita nesse mito', isTruth: true },
      ];
    case 'CASE_STUDY':
      return [
        { slideIndex: 0, type: 'COVER', title: 'Como [Cliente] alcançou [Resultado]', metric: '+X% em Y dias' },
        { slideIndex: 1, type: 'CONTENT', title: '🔴 O Problema', bodyText: 'Descreva o cenário inicial e o problema enfrentado' },
        { slideIndex: 2, type: 'CONTENT', title: '🔍 Diagnóstico', bodyText: 'O que identificamos como causa raiz' },
        { slideIndex: 3, type: 'CONTENT', title: '🛠️ A Ferramenta', bodyText: 'Qual solução/metodologia foi aplicada' },
        { slideIndex: 4, type: 'CONTENT', title: '⚙️ Execução', bodyText: 'Como implementamos passo a passo' },
        { slideIndex: 5, type: 'CONTENT', title: '📊 Resultados', bodyText: 'Dados e métricas conquistados', metric: '' },
        { slideIndex: 6, type: 'CONTENT', title: '📈 Impacto', bodyText: 'O que mudou na vida/negócio do cliente' },
        { slideIndex: 7, type: 'TRANSITION', title: '💬 O que o cliente disse:', bodyText: '"Depoimento real do cliente aqui"' },
        { slideIndex: 8, type: 'CONTENT', title: '🎯 Lição aprendida', bodyText: 'Princípio replicável extraído do case' },
        { slideIndex: 9, type: 'CTA', title: '🔗 Link na bio', bodyText: 'Quer resultados como esse? Fale comigo agora', metric: '' },
      ];
    case 'CURATION':
      return [
        { slideIndex: 0, type: 'COVER', title: '10 [Ferramentas/Recursos] que vão mudar seu [resultado]', subtitle: 'A lista definitiva de 2025' },
        { slideIndex: 1, type: 'CONTENT', itemName: 'Ferramenta 1', title: 'Para que serve', bodyText: 'Benefício principal e como usar', iconType: '🔧' },
        { slideIndex: 2, type: 'CONTENT', itemName: 'Ferramenta 2', title: 'Para que serve', bodyText: 'Benefício principal e como usar', iconType: '⚡' },
        { slideIndex: 3, type: 'CONTENT', itemName: 'Ferramenta 3', title: 'Para que serve', bodyText: 'Benefício principal e como usar', iconType: '🚀' },
        { slideIndex: 4, type: 'CONTENT', itemName: 'Ferramenta 4', title: 'Para que serve', bodyText: 'Benefício principal e como usar', iconType: '💡' },
        { slideIndex: 5, type: 'CONTENT', itemName: 'Ferramenta 5', title: 'Para que serve', bodyText: 'Benefício principal e como usar', iconType: '🎯' },
        { slideIndex: 6, type: 'CONTENT', itemName: 'Ferramenta 6', title: 'Para que serve', bodyText: 'Benefício principal e como usar', iconType: '📊' },
        { slideIndex: 7, type: 'CONTENT', itemName: 'Ferramenta 7', title: 'Para que serve', bodyText: 'Benefício principal e como usar', iconType: '🌟' },
        { slideIndex: 8, type: 'TRANSITION', itemName: '🏆 Bônus', title: 'A ferramenta secreta mais poderosa', bodyText: 'Revele o item bônus especial aqui', iconType: '🎁' },
        { slideIndex: 9, type: 'CTA', title: '💬 Qual é a sua favorita?', bodyText: 'Comente aqui embaixo → Salve para consultar depois' },
      ];
    case 'MANIFESTO':
      return [
        { slideIndex: 0, type: 'COVER', title: 'Existe um problema que ninguém está falando...', isCliffhanger: true },
        { slideIndex: 1, type: 'CONTENT', title: '', bodyText: 'A maioria das pessoas acredita que o sucesso depende de esforço.', isCliffhanger: true },
        { slideIndex: 2, type: 'CONTENT', title: '', bodyText: 'Mas o que ninguém te conta é que esforço sem sistema...', isCliffhanger: true },
        { slideIndex: 3, type: 'CONTENT', title: '', bodyText: '...é como remar contra a maré. Você se cansa e não sai do lugar.', isCliffhanger: true },
        { slideIndex: 4, type: 'CONTENT', title: '', bodyText: 'O segredo está em uma única mudança de perspectiva:', isCliffhanger: true },
        { slideIndex: 5, type: 'CONTENT', title: '', bodyText: '[Insira sua grande revelação ou princípio central aqui]', isCliffhanger: false },
        { slideIndex: 6, type: 'TRANSITION', title: 'A pergunta que vai mudar tudo:', bodyText: '[Insira pergunta provocadora que conecta com o CTA]', isCliffhanger: false },
        { slideIndex: 7, type: 'CTA', title: 'Siga para mais conteúdo assim.', bodyText: 'Ative o sininho para não perder o próximo.', isCliffhanger: false },
      ];
    default:
      return [];
  }
}
