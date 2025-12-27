
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

  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
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
              <th className="px-8 py-4">Social Context</th>
              <th 
                className="px-8 py-4 text-center cursor-pointer hover:text-red-600 transition-colors group/sort"
              >
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
                  
                  <div className="group/info relative cursor-help">
                    <svg className="w-3 h-3 text-slate-300 hover:text-slate-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-[70] normal-case tracking-normal text-[10px] font-medium leading-relaxed">
                      {displayMode === 'viral' ? (
                        <>
                          <span className="font-black text-red-400 block mb-1">VELOCITY SCORE</span>
                          Calculated as (Current Weekly Mentions / 120-Day Average). A score above 1.0 indicates the product is gaining significant breakout momentum.
                        </>
                      ) : (
                        <>
                          <span className="font-black text-blue-400 block mb-1">SOCIAL VOLUME</span>
                          The total unique mentions, tags, and discussions detected across Reddit, TikTok, and forums within the last 7 days.
                        </>
                      )}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                    </div>
                  </div>
                </div>
              </th>
              <th className="px-8 py-4">Sentiment</th>
              <th className="px-8 py-4 text-right">Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {sortedProducts.map((product) => (
              <tr 
                key={product.id} 
                className="hover:bg-slate-50 transition-all group cursor-pointer"
                onClick={() => onProductClick?.(product)}
              >
                <td className="px-8 py-5 min-w-[240px] relative">
                  <div className="absolute left-8 -top-14 z-[60] pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-y-2">
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800 whitespace-nowrap min-w-[220px]">
                      <div className="text-[10px] font-black uppercase text-red-500 mb-1 tracking-widest">Verified Label</div>
                      <div className="text-sm font-black">{product.name}</div>
                      {product.flavorVariant && (
                        <div className="text-xs text-slate-300 font-bold mt-1 bg-white/10 px-2 py-0.5 rounded-md inline-block">Variant: {product.flavorVariant}</div>
                      )}
                      <div className="text-[9px] text-slate-500 font-black mt-2 border-t border-slate-800 pt-2 uppercase tracking-widest flex justify-between">
                        <span>{product.category}</span>
                        <span>{product.topPlatform}</span>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-slate-900 rotate-45 absolute -bottom-1.5 left-6 border-r border-b border-slate-800"></div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-black text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                      {product.name}
                    </div>
                    {product.sources?.[0] && (
                      <a 
                        href={product.sources[0].uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded uppercase tracking-tighter transition-colors border border-blue-100"
                        title="Open source thread in new tab"
                      >
                        Source
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-red-500 font-bold mt-0.5 group-hover:bg-red-50 inline-block px-1 rounded transition-colors truncate max-w-[180px]">
                    {product.flavorVariant || 'Standard SKU'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-tighter">{product.category}</div>
                </td>
                <td className="px-8 py-5 max-w-md">
                  <p className="text-slate-600 leading-relaxed text-xs font-medium italic group-hover:text-slate-900 transition-colors line-clamp-2">
                    {product.whyTrending}
                  </p>
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
                <td className="px-8 py-5 text-right">
                  <div className="flex flex-col items-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    {product.sources.slice(0, 2).map((src, i) => (
                      <a 
                        key={i} 
                        href={src.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-bold text-blue-600 hover:text-red-600 hover:underline flex items-center gap-1 transition-colors"
                      >
                        <span className="truncate max-w-[120px]">{src.title}</span>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </a>
                    ))}
                    <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest bg-slate-100 px-1 py-0.5 rounded italic">{product.topPlatform} Verification</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
