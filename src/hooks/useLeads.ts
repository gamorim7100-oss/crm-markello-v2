import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead, LeadFormData, LeadStatus } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    if (!error && data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const addLead = async (formData: LeadFormData): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Usuário não autenticado' };

    // Get the max order_index for this status
    const sameStatusLeads = leads.filter((l) => l.status === formData.status);
    const maxOrder = sameStatusLeads.length > 0
      ? Math.max(...sameStatusLeads.map((l) => l.order_index))
      : -1;

    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...formData,
        user_id: user.id,
        order_index: maxOrder + 1,
      })
      .select()
      .single();

    if (error) return { error: error.message };
    if (data) setLeads((prev) => [...prev, data as Lead]);
    return { error: null };
  };

  const updateLead = async (
    id: string,
    updates: Partial<LeadFormData>
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id);

    if (error) return { error: error.message };

    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead))
    );
    return { error: null };
  };

  const deleteLead = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) return { error: error.message };
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    return { error: null };
  };

  const moveLeadToStatus = async (
    leadId: string,
    newStatus: LeadStatus,
    newOrderIndex: number
  ) => {
    // Optimistic update
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, status: newStatus, order_index: newOrderIndex }
          : lead
      )
    );

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus, order_index: newOrderIndex })
      .eq('id', leadId);

    if (error) {
      // Revert on error
      fetchLeads();
    }
  };

  const reorderLeads = async (
    updatedLeads: { id: string; order_index: number; status: LeadStatus }[]
  ) => {
    // Optimistic update
    setLeads((prev) => {
      const updated = [...prev];
      for (const u of updatedLeads) {
        const idx = updated.findIndex((l) => l.id === u.id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], order_index: u.order_index, status: u.status };
        }
      }
      return updated;
    });

    // Batch update in Supabase
    const promises = updatedLeads.map((u) =>
      supabase
        .from('leads')
        .update({ order_index: u.order_index, status: u.status })
        .eq('id', u.id)
    );

    const results = await Promise.all(promises);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      fetchLeads(); // Revert
    }
  };

  // Computed values for KPIs
  const totalCreditValue = leads.reduce((sum, l) => sum + Number(l.credit_value), 0);
  const activeLeads = leads.length;
  const closedLeads = leads.filter((l) => l.status === 'Fechamento').length;
  const conversionRate = activeLeads > 0 ? (closedLeads / activeLeads) * 100 : 0;
  const totalSold = leads
    .filter((l) => l.status === 'Fechamento' || l.status === 'Pós-Venda')
    .reduce((sum, l) => sum + Number(l.credit_value), 0);

  // By category
  const soldByCategory = {
    'Imóvel': leads.filter(l => (l.status === 'Fechamento' || l.status === 'Pós-Venda') && l.product_type === 'Imóvel').reduce((s, l) => s + Number(l.credit_value), 0),
    'Veículo': leads.filter(l => (l.status === 'Fechamento' || l.status === 'Pós-Venda') && l.product_type === 'Veículo').reduce((s, l) => s + Number(l.credit_value), 0),
    'Pesados': leads.filter(l => (l.status === 'Fechamento' || l.status === 'Pós-Venda') && l.product_type === 'Pesados').reduce((s, l) => s + Number(l.credit_value), 0),
    'Serviços': leads.filter(l => (l.status === 'Fechamento' || l.status === 'Pós-Venda') && l.product_type === 'Serviços').reduce((s, l) => s + Number(l.credit_value), 0),
  };

  // Leads count by category
  const leadsByCategory = {
    'Imóvel': leads.filter(l => l.product_type === 'Imóvel').length,
    'Veículo': leads.filter(l => l.product_type === 'Veículo').length,
    'Pesados': leads.filter(l => l.product_type === 'Pesados').length,
    'Serviços': leads.filter(l => l.product_type === 'Serviços').length,
  };

  const leadsByStatus = (status: LeadStatus) =>
    leads
      .filter((l) => l.status === status)
      .sort((a, b) => a.order_index - b.order_index);

  return {
    leads,
    loading,
    addLead,
    updateLead,
    deleteLead,
    moveLeadToStatus,
    reorderLeads,
    fetchLeads,
    totalCreditValue,
    activeLeads,
    conversionRate,
    totalSold,
    soldByCategory,
    leadsByCategory,
    leadsByStatus,
  };
}
