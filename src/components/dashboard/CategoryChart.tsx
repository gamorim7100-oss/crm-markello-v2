import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PRODUCT_BADGES } from '@/lib/types';
import { formatCurrencyCompact } from '@/lib/utils';

interface CategoryChartProps {
  soldByCategory: Record<string, number>;
  leadsByCategory: Record<string, number>;
}

export function CategoryChart({ soldByCategory, leadsByCategory }: CategoryChartProps) {
  const data = Object.entries(soldByCategory).map(([name, value]) => ({
    name,
    value,
    leads: leadsByCategory[name] || 0,
    color: PRODUCT_BADGES[name as keyof typeof PRODUCT_BADGES]?.color || 'hsl(217, 91%, 60%)',
    emoji: PRODUCT_BADGES[name as keyof typeof PRODUCT_BADGES]?.emoji || '',
  }));

  return (
    <Card className="backdrop-blur-xl bg-card/60 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">Vendas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(215, 20%, 25%)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              tickFormatter={(value: any) => formatCurrencyCompact(Number(value))}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(222, 30%, 12%)', borderColor: 'hsl(215, 20%, 18%)', borderRadius: '8px' }}
              itemStyle={{ color: 'hsl(210, 40%, 98%)' }}
              labelStyle={{ color: 'hsl(215, 20%, 65%)', marginBottom: '4px' }}
              formatter={(value: any) => [formatCurrencyCompact(Number(value)), 'Vendido']}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
