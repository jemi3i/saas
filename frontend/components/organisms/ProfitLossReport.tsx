
import React from 'react';
import { formatCurrency } from '../../lib/utils';

interface ProfitLossData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ProfitLossReportProps {
  data: ProfitLossData[];
}

const ProfitLossReport: React.FC<ProfitLossReportProps> = ({ data }) => {
  const totals = data.reduce((acc, curr) => ({
    revenue: acc.revenue + curr.revenue,
    expenses: acc.expenses + curr.expenses,
    profit: acc.profit + curr.profit,
  }), { revenue: 0, expenses: 0, profit: 0 });

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">Month</th>
              <th className="h-12 px-4 text-right font-medium text-muted-foreground">Revenue</th>
              <th className="h-12 px-4 text-right font-medium text-muted-foreground">Expenses</th>
              <th className="h-12 px-4 text-right font-medium text-muted-foreground">Net Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row) => (
              <tr key={row.month} className="hover:bg-muted/50 transition-colors">
                <td className="p-4 font-medium">{row.month}</td>
                <td className="p-4 text-right text-emerald-500 font-medium">{formatCurrency(row.revenue)}</td>
                <td className="p-4 text-right text-rose-500 font-medium">{formatCurrency(row.expenses)}</td>
                <td className={`p-4 text-right font-bold ${row.profit >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                  {formatCurrency(row.profit)}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                  No financial data available for the selected period.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-muted/50 font-bold border-t">
            <tr>
              <td className="p-4">TOTALS</td>
              <td className="p-4 text-right text-emerald-600">{formatCurrency(totals.revenue)}</td>
              <td className="p-4 text-right text-rose-600">{formatCurrency(totals.expenses)}</td>
              <td className={`p-4 text-right ${totals.profit >= 0 ? 'text-primary' : 'text-rose-700'}`}>
                {formatCurrency(totals.profit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-4">
        {data.map((row) => (
          <div key={row.month} className="rounded-xl border bg-card p-4 space-y-3">
             <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-bold">{row.month}</h4>
                <span className={`text-sm font-bold ${row.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {formatCurrency(row.profit)} Profit
                </span>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Revenue</p>
                   <p className="text-sm font-semibold text-emerald-500">{formatCurrency(row.revenue)}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expenses</p>
                   <p className="text-sm font-semibold text-rose-500">{formatCurrency(row.expenses)}</p>
                </div>
             </div>
          </div>
        ))}
        {data.length > 0 && (
          <div className="rounded-xl bg-primary text-primary-foreground p-6 shadow-lg shadow-primary/20">
             <h4 className="font-bold text-xs uppercase tracking-widest mb-4 opacity-80">Period Totals</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-sm">Total Revenue</span>
                   <span className="font-bold">{formatCurrency(totals.revenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm">Total Expenses</span>
                   <span className="font-bold">{formatCurrency(totals.expenses)}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-lg">
                   <span className="font-medium">Net Profit</span>
                   <span className="font-black">{formatCurrency(totals.profit)}</span>
                </div>
             </div>
          </div>
        )}
        {data.length === 0 && (
           <div className="p-12 text-center border rounded-xl border-dashed bg-muted/20 text-muted-foreground">
              No data for selected period.
           </div>
        )}
      </div>
    </div>
  );
};

export default ProfitLossReport;
