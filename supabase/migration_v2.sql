-- ============================================
-- CRM Markello V2.0 — MIGRAÇÃO
-- Cole e execute este SQL no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar novas colunas na tabela leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Prospecção'
    CHECK (source IN ('TikTok', 'Instagram', 'Prospecção', 'Ligação', 'WhatsApp', 'Indicação', 'Outro'));

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS temperature TEXT DEFAULT 'Morno'
    CHECK (temperature IN ('Quente', 'Morno', 'Frio'));

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Criar tabela de reuniões
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'Agendada' CHECK (status IN ('Agendada', 'Realizada', 'Cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS para meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own meetings" ON public.meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own meetings" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own meetings" ON public.meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own meetings" ON public.meetings
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_user_date ON public.meetings (user_id, meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_lead ON public.meetings (lead_id);
