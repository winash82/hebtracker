
import React, { useState, useMemo } from 'react';
import { ProductMention } from '../types';
import { Icons } from '../constants';

interface ProductTableProps {
  products: ProductMention[];
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor?: string;
  displayMode: 'viral' | 'core';
  onProductClick?: (product: ProductMention) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, title, subtitle, badgeText, badgeColor = "bg-red-50 text-red-600 border-red-100", displayMode, onProductClick }) => {
  const [sortConfig, setSortConfig] = useState<{ key: 'mentionsThisWeek' | 'trendingScore', direction: 'asc' | 'desc' }>({
    key: displayMode === 'viral' ? 'trendingScore' : 'mentionsThisWeek',
    direction: 'desc'
  });

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortConfig]);

  const toggleSort = (key: 'mentionsThisWeek' | 'trendingScore') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const calculateReliability = (p: ProductMention) => {
    const base = p.confidenceScore || 70;
    const evidenceBonus = (p.evidenceCount || 1) * 5;
    return Math.min(100, base + evidenceBonus);
  };

  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible mb-8">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h3 className="font-black text-slate-900 text-lg">{title}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-[10px] font-black border px-3 py-1 rounded-full uppercase tracking-widest ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">
              <th className="px-8 py-4">Product Identity</th>
              <th className="px-8 py-4">Social Consensus</th>
              <th className="px-8 py-4 text-center">Velocity</th>
              <th className="px-8 py-4">Sentiment</th>
              <th className="px-8 py-4 text-right">Evidence Reliability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {sortedProducts.map((product) => {
              const reliability = calculateReliability(product);
              return (
                <tr 
                  key={product.id} 
                  className="hover:bg-slate-50 transition-all group cursor-pointer overflow-visible"
                  onClick={() => onProductClick?.(product)}
                >
                  <td className="px-8 py-5 min-w-[220px] relative">
                    <div className="font-black text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                      {product.name}
                    </div>
                    <div className="text-xs text-red-500 font-bold mt-0.5">{product.flavorVariant || 'Standard Release'}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">{product.category}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md w-fit uppercase">
                        {product.evidenceSummary || 'Social Pulse Detected'}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(Math.min(5, product.evidenceCount || 1))].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-black text-base text-slate-900">
                        {displayMode === 'viral' ? `${product.trendingScore.toFixed(1)}x` : product.mentionsThisWeek}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                        {displayMode === 'viral' ? 'Growth' : 'Mentions'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                      product.sentiment === 'positive' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {product.sentiment}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right relative overflow-visible">
                    <div className="flex flex-col items-end gap-1 group/rel">
                      <div className="flex items-center gap-2 relative">
                        <span className={`text-sm font-black ${reliability > 85 ? 'text-green-600' : 'text-amber-600'}`}>
                          {reliability}%
                        </span>
                        <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${reliability > 85 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${reliability}%` }} />
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full right-0 mb-3 w-48 p-4 bg-slate-900 text-white rounded-xl shadow-2xl opacity-0 invisible group-hover/rel:opacity-100 group-hover/rel:visible transition-all z-[150] text-left pointer-events-none transform group-hover/rel:-translate-y-1">
                          <p className="text-[9px] font-black text-blue-400 uppercase mb-2">Cross-Reference Data</p>
                          <div className="text-[10px] space-y-1">
                            <div className="flex justify-between"><span>Sources:</span> <b>{product.evidenceCount || 1} Nodes</b></div>
                            <div className="flex justify-between"><span>Freshness:</span> <b>High</b></div>
                            <div className="border-t border-slate-800 pt-1 mt-1 font-black">Consensus Met</div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase italic">{product.topPlatform}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
