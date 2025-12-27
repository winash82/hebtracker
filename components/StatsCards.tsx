
import React from 'react';
import { ProductMention } from '../types';

interface StatsCardsProps {
  products: ProductMention[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ products }) => {
  const totalMentions = products.reduce((acc, p) => acc + p.mentionsThisWeek, 0);
  const avgTrending = products.length > 0 
    ? (products.reduce((acc, p) => acc + p.trendingScore, 0) / products.length).toFixed(1)
    : 0;
  
  const topProduct = products.sort((a, b) => b.trendingScore - a.trendingScore)[0];
  const sentimentPos = products.filter(p => p.sentiment === 'positive').length;
  const sentimentRatio = products.length > 0 ? Math.round((sentimentPos / products.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500 mb-1">Weekly Mentions</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900">{totalMentions}</h3>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+12%</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500 mb-1">Avg Trending Index</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900">{avgTrending}x</h3>
          <span className="text-xs font-semibold text-slate-400">vs 120d avg</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500 mb-1">Positive Sentiment</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900">{sentimentRatio}%</h3>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-green-500" style={{ width: `${sentimentRatio}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative group">
        <p className="text-sm font-medium text-slate-500 mb-1">Top Viral Product</p>
        <h3 className="text-lg font-bold text-red-600 truncate">{topProduct?.name || 'N/A'}</h3>
        <p className="text-xs text-slate-500">{topProduct?.topPlatform || ''} Hot Topic</p>

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
