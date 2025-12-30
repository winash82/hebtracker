
import React from 'react';
import { ProductMention } from '../types';

interface StatsCardsProps {
  products: ProductMention[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ products }) => {
  const totalMentions = products.reduce((acc, p) => acc + p.mentionsThisWeek, 0);
  const topProduct = [...products].sort((a, b) => b.trendingScore - a.trendingScore)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Total Mentions Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
        <p className="text-sm font-medium text-slate-500 mb-1">Weekly Mentions Volume</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-slate-900">{totalMentions.toLocaleString()}</h3>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
            Social Signal Active
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Aggregated across r/HEB, TikTok, and localized Texas nodes</p>
      </div>
      
      {/* Top Viral Product Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative group overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-red-100 transition-colors"></div>
        
        <div className="relative z-10">
          <p className="text-sm font-medium text-slate-500 mb-1">Top Viral Product</p>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-red-600 truncate max-w-[70%]">
              {topProduct?.name || 'Scanning...'}
            </h3>
            {topProduct && (
              <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded italic">
                #{topProduct.trendingScore.toFixed(1)}x Velocity
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-bold mt-1">
            {topProduct ? `${topProduct.flavorVariant || 'Standard Release'} • ${topProduct.topPlatform} Origin` : 'Calculating breakout velocity...'}
          </p>
        </div>

        {/* Tooltip for Top Viral Product */}
        {topProduct && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 bg-slate-900 text-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] border border-slate-800">
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 italic">Viral Leaderboard #1</div>
            <div className="text-sm font-black mb-1">{topProduct.name}</div>
            <div className="text-xs text-slate-300 font-bold mb-2">{topProduct.flavorVariant || 'Standard Release'}</div>
            <div className="text-[10px] text-slate-400 leading-relaxed font-medium mb-3 border-t border-slate-800 pt-2 italic">
              "{topProduct.whyTrending}"
            </div>
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-slate-500">
              <span>{topProduct.category}</span>
              <span className="text-white bg-red-600 px-1.5 py-0.5 rounded">{topProduct.trendingScore.toFixed(1)}x Velocity</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 -mt-1.5"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCards;
