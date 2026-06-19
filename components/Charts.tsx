
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { UserStats } from '../types';

interface ChartsProps {
  stats: UserStats;
  variant?: 'compact' | 'full';
}

const Charts: React.FC<ChartsProps> = ({ stats, variant = 'full' }) => {
  const pieData = [
    { name: 'Выполнено', value: stats.completed, color: '#10b981' },
    { name: 'В работе', value: stats.pending, color: '#f59e0b' },
    { name: 'Просрочено', value: stats.failed, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  const chartHeight = variant === 'compact' ? 'h-44' : 'h-72';
  const pieInner = variant === 'compact' ? 42 : 58;
  const pieOuter = variant === 'compact' ? 58 : 82;

  if (pieData.length === 0) {
    pieData.push({ name: 'Нет данных', value: 1, color: '#e2e8f0' });
  }

  const barChart = (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-base font-semibold mb-3 text-slate-800">Активность за неделю</h3>
      <div className={chartHeight}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.weeklyProgress} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={28} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f8fafc' }}
              formatter={(value: number) => [`${value} задач`, 'Выполнено']}
            />
            <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={variant === 'compact' ? 28 : 48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const pieChart = (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-base font-semibold mb-3 text-slate-800">Распределение задач</h3>
      <div className={`${chartHeight} flex flex-col items-center justify-center`}>
        <ResponsiveContainer width="100%" height="70%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={pieInner}
              outerRadius={pieOuter}
              paddingAngle={4}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {[
            { name: 'Выполнено', value: stats.completed, color: '#10b981' },
            { name: 'В работе', value: stats.pending, color: '#f59e0b' },
            { name: 'Просрочено', value: stats.failed, color: '#ef4444' },
          ].map((d) => (
            <div key={d.name} className="flex items-center text-xs text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: d.color }} />
              {d.name}: <span className="font-bold ml-1">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        {barChart}
        {pieChart}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {barChart}
      {pieChart}
    </div>
  );
};

export default Charts;
