-- ============================================
-- CRM Markello BETA V2.0 — Supabase Schema
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- Tabela de perfis (sincronizada com auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  monthly_goal NUMERIC DEFAULT 500000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para criar perfil automaticamente ao signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabela de leads (V2 — com origem, temperatura, notas)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source TEXT DEFAULT 'Prospecção' CHECK (source IN ('TikTok', 'Instagram', 'Prospecção', 'Ligação', 'WhatsApp', 'Indicação', 'Outro')),
  temperature TEXT DEFAULT 'Morno' CHECK (temperature IN ('Quente', 'Morno', 'Frio')),
  notes TEXT,
  product_type TEXT CHECK (product_type IN ('Imóvel', 'Veículo', 'Pesados', 'Serviços')),
  credit_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Prospecção' CHECK (status IN ('Prospecção', 'Simulação', 'Proposta', 'Fechamento', 'Pós-Venda')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de reuniões (Agenda)
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

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies para leads
CREATE POLICY "Users view own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para meetings
CREATE POLICY "Users view own meetings" ON public.meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own meetings" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own meetings" ON public.meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own meetings" ON public.meetings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Indexes para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON public.leads (user_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_user_order ON public.leads (user_id, order_index);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at);
CREATE INDEX IF NOT EXISTS idx_meetings_user_date ON public.meetings (user_id, meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_lead ON public.meetings (lead_id);
