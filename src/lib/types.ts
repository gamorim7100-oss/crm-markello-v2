// ============================================
// CRM Markello BETA V2.0 — Type Definitions
// ============================================

export type ProductType = 'Imóvel' | 'Veículo' | 'Pesados' | 'Serviços';

export type LeadStatus =
  | 'Prospecção'
  | 'Simulação'
  | 'Proposta'
  | 'Fechamento'
  | 'Pós-Venda';

export type LeadSource =
  | 'TikTok'
  | 'Instagram'
  | 'Prospecção'
  | 'Ligação'
  | 'WhatsApp'
  | 'Indicação'
  | 'Outro';

export type LeadTemperature = 'Quente' | 'Morno' | 'Frio';

export type MeetingStatus = 'Agendada' | 'Realizada' | 'Cancelada';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  monthly_goal: number;
  created_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  temperature: LeadTemperature;
  notes: string | null;
  product_type: ProductType;
  credit_value: number;
  status: LeadStatus;
  order_index: number;
  created_at: string;
}

export interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  temperature: LeadTemperature;
  notes: string;
  product_type: ProductType;
  credit_value: number;
  status: LeadStatus;
}

export interface Meeting {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  description: string | null;
  meeting_date: string; // YYYY-MM-DD
  start_time: string;   // HH:MM
  end_time: string;     // HH:MM
  location: string | null;
  status: MeetingStatus;
  created_at: string;
  // Joined field
  lead?: Lead | null;
}

export interface MeetingFormData {
  lead_id: string | null;
  title: string;
  description: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  location: string;
  status: MeetingStatus;
}

export const LEAD_STATUSES: LeadStatus[] = [
  'Prospecção',
  'Simulação',
  'Proposta',
  'Fechamento',
  'Pós-Venda',
];

export const PRODUCT_TYPES: ProductType[] = [
  'Imóvel',
  'Veículo',
  'Pesados',
  'Serviços',
];

export const LEAD_SOURCES: LeadSource[] = [
  'TikTok',
  'Instagram',
  'Prospecção',
  'Ligação',
  'WhatsApp',
  'Indicação',
  'Outro',
];

export const LEAD_TEMPERATURES: LeadTemperature[] = [
  'Quente',
  'Morno',
  'Frio',
];

export const MEETING_STATUSES: MeetingStatus[] = [
  'Agendada',
  'Realizada',
  'Cancelada',
];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  'Prospecção': 'hsl(217, 91%, 60%)',
  'Simulação': 'hsl(262, 83%, 58%)',
  'Proposta': 'hsl(45, 93%, 58%)',
  'Fechamento': 'hsl(142, 76%, 45%)',
  'Pós-Venda': 'hsl(190, 90%, 50%)',
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  'Prospecção': '🔍 Prospecção',
  'Simulação': '📊 Simulação',
  'Proposta': '📝 Proposta',
  'Fechamento': '🤝 Fechamento',
  'Pós-Venda': '⭐ Pós-Venda',
};

export const PRODUCT_BADGES: Record<ProductType, { color: string; emoji: string }> = {
  'Imóvel': { color: 'hsl(217, 91%, 60%)', emoji: '🏠' },
  'Veículo': { color: 'hsl(142, 76%, 45%)', emoji: '🚗' },
  'Pesados': { color: 'hsl(45, 93%, 58%)', emoji: '🚛' },
  'Serviços': { color: 'hsl(262, 83%, 58%)', emoji: '🔧' },
};

export const SOURCE_ICONS: Record<LeadSource, string> = {
  'TikTok': '🎵',
  'Instagram': '📸',
  'Prospecção': '🔍',
  'Ligação': '📞',
  'WhatsApp': '💬',
  'Indicação': '🤝',
  'Outro': '📋',
};

export const TEMPERATURE_CONFIG: Record<LeadTemperature, { color: string; emoji: string }> = {
  'Quente': { color: 'hsl(0, 84%, 60%)', emoji: '🔥' },
  'Morno': { color: 'hsl(45, 93%, 58%)', emoji: '☀️' },
  'Frio': { color: 'hsl(210, 79%, 58%)', emoji: '❄️' },
};
