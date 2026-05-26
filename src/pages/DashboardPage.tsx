import { useLeads } from '@/hooks/useLeads';
import { useMeetings } from '@/hooks/useMeetings';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { MonthlyGoal } from '@/components/dashboard/MonthlyGoal';
import { LeadsChart } from '@/components/dashboard/LeadsChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { formatCurrencyCompact } from '@/lib/utils';
import { CircleDollarSign, Users, CalendarCheck, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { totalCreditValue, activeLeads, conversionRate, totalSold, soldByCategory, leadsByCategory, leads, loading } = useLeads();
  const { totalMeetings, completedMeetings } = useMeetings();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-secondary/50 rounded-md animate-pulse" />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-secondary/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Olá, {profile?.name?.split(' ')[0] || 'Corretor'} 👋
        </h1>
        <p className="text-muted-foreground">Aqui está o resumo das suas vendas de consórcio hoje.</p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total em Negociação"
          value={formatCurrencyCompact(totalCreditValue)}
          description="Valor total do funil"
          icon={CircleDollarSign}
        />

        <KpiCard
          title="Leads Ativos"
          value={activeLeads.toString()}
          description="Contatos no funil"
          icon={Users}
        />

        <KpiCard
          title="Total Vendido"
          value={formatCurrencyCompact(totalSold)}
          description="Fechamento + Pós-Venda"
          icon={TrendingUp}
        />

        <KpiCard
          title="Taxa de Conversão"
          value={`${conversionRate.toFixed(1)}%`}
          description="Fechados / Total"
          icon={Activity}
        />

        <KpiCard
          title="Reuniões"
          value={`${completedMeetings}/${totalMeetings}`}
          description="Realizadas / Total"
          icon={CalendarCheck}
        />

        <MonthlyGoal currentValue={totalSold} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <LeadsChart leads={leads} />
        <CategoryChart soldByCategory={soldByCategory} leadsByCategory={leadsByCategory} />
      </div>
    </div>
  );
}
