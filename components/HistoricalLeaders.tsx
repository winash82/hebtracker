
import React from 'react';
import { HistoricalProduct } from '../types';

interface HistoricalLeadersProps {
  data: HistoricalProduct[];
}

const HistoricalLeaders: React.FC<HistoricalLeadersProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full relative overflow-visible">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-black text-slate-900">120-Day Champions</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ranked by Total Volume</p>
        </div>
        <div className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded tracking-tighter uppercase">Historical Context</div>
      </div>
      <div className="space-y-6 flex-1">
        {data.slice(0, 5).map((item, idx) => (
          <div key={idx} className="relative pl-12 group cursor-default">
            {/* Tooltip */}
            <div className="absolute left-full ml-4 top-0 z-[60] pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-x-2">
                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800 whitespace-nowrap min-w-[180px]">
                    <div className="text-[9px] font-black uppercase text-red-500 mb-1 tracking-widest">Brand Equity Rank</div>
                    <div className="text-xs font-black">{item.name}</div>
                    <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800 pt-2 font-bold leading-tight max-w-[160px] whitespace-normal">
                        {item.rankReason}
                    </div>
                </div>
                {/* Arrow */}
                <div className="w-3 h-3 bg-slate-900 rotate-45 absolute top-4 -left-1.5 border-l border-b border-slate-800"></div>
            </div>

            <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border ${
              idx === 0 ? 'bg-red-600 border-red-500 text-white' : 
              idx === 1 ? 'bg-slate-800 border-slate-700 text-white' :
              'bg-white border-slate-200 text-slate-400'
            }`}>
              {idx + 1}
            </div>
            <div className="min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-red-600 transition-colors">
                  {item.name}
                </h4>
                <div className="text-right ml-2">
                  <span className="block text-xs font-black text-slate-900">{item.totalMentionVolume.toLocaleString()}</span>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Total SKU Mentions</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-1.5">{item.category}</p>
              <p className="text-[10px] text-slate-500 leading-tight line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                "{item.rankReason}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricalLeaders;
