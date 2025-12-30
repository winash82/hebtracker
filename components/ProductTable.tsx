
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
    const sourceBonus = (p.sources?.length || 0) * 4;
    return Math.min(100, base + sourceBonus);
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
              <th className="px-8 py-4">Social Context & Sources</th>
              <th className="px-8 py-4 text-center cursor-pointer hover:text-red-600 transition-colors group/sort">
                <div className="flex items-center justify-center gap-1.5 relative">
                  <div 
                    className="flex items-center gap-1"
                    onClick={() => toggleSort(displayMode === 'viral' ? 'trendingScore' : 'mentionsThisWeek')}
                  >
                    {displayMode === 'viral' ? 'Velocity Score' : 'Social Volume'}
                    <span className={`opacity-50 group-hover/sort:opacity-100 ${sortConfig.key === (displayMode === 'viral' ? 'trendingScore' : 'mentionsThisWeek') ? 'opacity-100' : ''}`}>
                      {sortConfig.direction === 'desc' ? '↓' : '↑'}
                    </span>
                  </div>
                </div>
              </th>
              <th className="px-8 py-4">Sentiment</th>
              <th className="px-8 py-4 text-right">Verification</th>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-black text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                        {product.name}
                      </div>
                    </div>
                    <div className="text-xs text-red-500 font-bold mt-0.5 group-hover:bg-red-50 inline-block px-1 rounded transition-colors truncate max-w-[180px]">
                      {product.flavorVariant || 'Standard SKU'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">{product.category}</div>
                  </td>
                  <td className="px-8 py-5 max-w-md">
                    <p className="text-slate-600 leading-relaxed text-xs font-medium italic mb-2 line-clamp-2">
                      "{product.whyTrending}"
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sources.slice(0, 3).map((src, i) => (
                        <a 
                          key={i} 
                          href={src.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[9px] font-black text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all uppercase tracking-tighter"
                        >
                          Node {i+1} ↗
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {displayMode === 'viral' ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className={`font-black text-base ${product.trendingScore > 1.2 ? 'text-green-600' : 'text-slate-900'}`}>
                            {product.trendingScore.toFixed(1)}x
                          </span>
                          {product.trendingScore > 1.0 ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
                        </div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest whitespace-nowrap">Growth Ratio</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-black text-lg text-slate-900 group-hover:text-red-600 transition-colors">
                          {product.mentionsThisWeek.toLocaleString()}
                        </span>
                        <div className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">Weekly Total</div>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                      product.sentiment === 'positive' ? 'bg-green-50 text-green-700 border-green-100' :
                      product.sentiment === 'negative' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {product.sentiment}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right relative overflow-visible">
                    <div className="flex flex-col items-end gap-2 group/rel">
                      <div className="flex items-center gap-2 relative">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reliability</p>
                          <p className={`text-sm font-black ${reliability > 85 ? 'text-green-600' : reliability > 70 ? 'text-amber-600' : 'text-slate-600'}`}>
                            {reliability}%
                          </p>
                        </div>
                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${reliability > 85 ? 'bg-green-500' : reliability > 70 ? 'bg-amber-500' : 'bg-slate-400'}`} 
                            style={{ width: `${reliability}%` }}
                          />
                        </div>

                        {/* Standardized Table Tooltip: Centered Above Parent */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-slate-900 text-white rounded-xl shadow-2xl opacity-0 invisible group-hover/rel:opacity-100 group-hover/rel:visible transition-all z-[150] text-left pointer-events-none transform group-hover/rel:-translate-y-1">
                          <p className="text-[10px] font-black uppercase text-blue-400 mb-2 tracking-widest">Confidence Metrics</p>
                          <div className="text-[10px] font-medium space-y-1.5">
                            <div className="flex justify-between">
                              <span className="opacity-60">Base Confidence:</span>
                              <span className="font-bold">{product.confidenceScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-60">Source Evidence:</span>
                              <span className="font-bold">+{product.sources.length * 4}%</span>
                            </div>
                            <div className="border-t border-slate-800 pt-1.5 mt-1.5 flex justify-between font-black text-white">
                              <span>Aggregate:</span>
                              <span>{reliability}%</span>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r border-b border-slate-800"></div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">{product.topPlatform} Origin</span>
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
