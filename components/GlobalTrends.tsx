
import React from 'react';
import { GlobalFoodTrend } from '../types';

interface GlobalTrendsProps {
  trends: GlobalFoodTrend[];
}

const GlobalTrends: React.FC<GlobalTrendsProps> = ({ trends }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-visible relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-black text-slate-900">Global Food Velocity</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">r/food & #foodtok Leaders</p>
        </div>
        <div className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded tracking-tighter uppercase">Industry Watch</div>
      </div>
      <div className="space-y-5 flex-1">
        {trends.map((trend, idx) => (
          <div key={idx} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group cursor-default relative">
            
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-0 z-[60] pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-2">
                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800 whitespace-nowrap min-w-[180px]">
                    <div className="text-[9px] font-black uppercase text-blue-400 mb-1 tracking-widest">Industry Pulse</div>
                    <div className="text-xs font-black">{trend.name}</div>
                    <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800 pt-2 font-bold leading-tight max-w-[160px] whitespace-normal">
                        Source: {trend.platform === 'TikTok' ? '#foodtok' : 'r/food'}<br/>
                        {trend.description}
                    </div>
                </div>
                {/* Arrow */}
                <div className="w-3 h-3 bg-slate-900 rotate-45 absolute top-4 -right-1.5 border-r border-t border-slate-800"></div>
            </div>

            <div className={`mt-1 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                trend.platform === 'TikTok' ? 'bg-black text-white' : 'bg-orange-500 text-white'
            }`}>
              {trend.platform === 'TikTok' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-.98V15.5c0 1.5-.54 3.04-1.6 4.15-1.55 1.76-4.3 2.14-6.32 1.07-2.3-1.13-3.15-4.14-1.92-6.35 1.03-1.98 3.55-2.84 5.56-1.98.24.1.47.23.68.39V8.04c-1.33-.24-2.7-.22-4.02.11-3.37.81-5.32 4.49-4.34 7.78.8 2.8 3.6 4.7 6.46 4.41 3.51-.23 6.07-3.46 5.65-6.93-.01-.06-.01-.13-.02-.19V.02z"/></svg>
              ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485.452.453 1.185.453 1.638 0 .452-.453.452-1.185 0-1.638C3.87 17.564 3 14.887 3 12c0-4.963 4.037-9 9-9s9 4.037 9 9c0 2.887-.87 5.564-2.153 6.847-.452.453-.452 1.185 0 1.638.453.453 1.186.453 1.638 0C22.657 18.314 24 15.314 24 12c0-6.627-5.373-12-12-12zM12 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-1.5 5v7h3v-7h-3z"/></svg>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h4 className="text-xs font-black text-slate-800 truncate pr-2 group-hover:text-blue-600 transition-colors">{trend.name}</h4>
                <span className="text-[10px] font-black text-slate-400 shrink-0">{trend.volumeLabel}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                {trend.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
          Aggregated from 14M+ active daily discussions
        </p>
      </div>
    </div>
  );
};

export default GlobalTrends;
