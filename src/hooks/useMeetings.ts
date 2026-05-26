import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Meeting, MeetingFormData } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('meetings')
      .select('*, lead:leads(id, name, phone)')
      .eq('user_id', user.id)
      .order('meeting_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (!error && data) {
      setMeetings(data as Meeting[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const addMeeting = async (formData: MeetingFormData): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Usuário não autenticado' };

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        ...formData,
        lead_id: formData.lead_id || null,
        user_id: user.id,
      })
      .select('*, lead:leads(id, name, phone)')
      .single();

    if (error) return { error: error.message };
    if (data) setMeetings((prev) => [...prev, data as Meeting]);
    return { error: null };
  };

  const updateMeeting = async (
    id: string,
    updates: Partial<MeetingFormData>
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id);

    if (error) return { error: error.message };

    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    return { error: null };
  };

  const deleteMeeting = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (error) return { error: error.message };
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    return { error: null };
  };

  // Computed values
  const todayMeetings = meetings.filter(
    (m) => m.meeting_date === new Date().toISOString().split('T')[0] && m.status === 'Agendada'
  );

  const upcomingMeetings = meetings.filter(
    (m) => m.meeting_date >= new Date().toISOString().split('T')[0] && m.status === 'Agendada'
  );

  const totalMeetings = meetings.length;
  const completedMeetings = meetings.filter((m) => m.status === 'Realizada').length;

  return {
    meetings,
    loading,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    fetchMeetings,
    todayMeetings,
    upcomingMeetings,
    totalMeetings,
    completedMeetings,
  };
}
