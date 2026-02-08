
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CreditCard } from 'lucide-react';

interface ExpensePieChartProps {
  data: Array<{ category: string; amount: number }>;
}

const COLORS = [
  'hsl(var(--primary))',
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#3b82f6', // blue
];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.category,
    value: item.amount
  }));

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-rose-500" />
            Expense Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">Allocation by category</p>
        </div>
      </div>
      <div className="h-[300px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpensePieChart;
