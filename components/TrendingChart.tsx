
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ProductMention } from '../types';

interface TrendingChartProps {
  products: ProductMention[];
  onProductClick: (product: ProductMention) => void;
}

const TrendingChart: React.FC<TrendingChartProps> = ({ products, onProductClick }) => {
  const chartData = products
    .sort((a, b) => b.mentionsThisWeek - a.mentionsThisWeek)
    .slice(0, 10)
    .map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 10) + '...' : p.name,
      mentions: p.mentionsThisWeek,
      fullName: p.name,
      original: p
    }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] group/chart">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-black text-slate-900">Current Volume by SKU</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Hover bars to see verified weekly counts</p>
        </div>
        <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded tracking-widest uppercase">Weekly Data</span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart 
          data={chartData} 
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          onClick={(data) => {
            if (data && data.activePayload && data.activePayload[0]) {
              onProductClick(data.activePayload[0].payload.original);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload.original;
                return (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <p className="text-xs font-black text-white mb-0.5 uppercase tracking-tight">{data.name}</p>
                    <p className="text-[10px] text-red-400 font-bold mb-3">{data.flavorVariant || 'Standard'}</p>
                    <div className="flex justify-between items-center gap-8 border-t border-slate-800 pt-2">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Weekly Mentions</span>
                        <span className="text-sm font-black text-white">{data.mentionsThisWeek.toLocaleString()}</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="mentions" 
            radius={[6, 6, 0, 0]} 
            className="cursor-pointer transition-all"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#E31837' : '#e2e8f0'} className="hover:fill-red-400 transition-colors" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendingChart;
