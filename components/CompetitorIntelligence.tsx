
import React, { useState } from 'react';
import { ProductMention, RetailerBrand } from '../types';

interface CompetitorIntelligenceProps {
  competitorProducts: ProductMention[];
  onProductClick: (product: ProductMention) => void;
}

const CompetitorIntelligence: React.FC<CompetitorIntelligenceProps> = ({ competitorProducts, onProductClick }) => {
  const [activeRetailer, setActiveRetailer] = useState<RetailerBrand>('Costco');

  const retailers: { id: RetailerBrand; label: string; color: string; bg: string }[] = [
    { id: 'Costco', label: 'Costco', color: 'text-blue-600', bg: 'bg-blue-600' },
    { id: 'Trader Joes', label: "Trader Joe's", color: 'text-red-700', bg: 'bg-red-700' },
    { id: 'Walmart', label: 'Walmart', color: 'text-sky-500', bg: 'bg-sky-500' }
  ];

  const filtered = competitorProducts.filter(p => p.retailer === activeRetailer);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-black text-slate-900 text-lg">Market Rival Intelligence</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Benchmarking Private Label Performance</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {retailers.map((ret) => (
            <button
              key={ret.id}
              onClick={() => setActiveRetailer(ret.id)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                activeRetailer === ret.id 
                ? `${ret.bg} text-white shadow-sm` 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {ret.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {filtered.length > 0 ? filtered.map((product) => (
          <div 
            key={product.id} 
            onClick={() => onProductClick(product)}
            className="p-6 hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                activeRetailer === 'Costco' ? 'border-blue-100 text-blue-600 bg-blue-50' :
                activeRetailer === 'Trader Joes' ? 'border-red-100 text-red-700 bg-red-50' :
                'border-sky-100 text-sky-600 bg-sky-50'
              }`}>
                {product.category}
              </span>
              <span className="text-[10px] font-black text-green-600">{product.trendingScore.toFixed(1)}x Vol</span>
            </div>
            <h4 className="font-black text-slate-900 group-hover:text-slate-600 leading-tight mb-1">{product.name}</h4>
            <p className="text-[11px] text-slate-500 font-bold italic mb-4 line-clamp-2">"{product.whyTrending}"</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
               <div className="flex gap-1">
                  {[...Array(Math.min(3, product.evidenceCount || 1))].map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${retailers.find(r => r.id === activeRetailer)?.bg}`}></div>
                  ))}
               </div>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Verified Node Consensus</span>
            </div>
          </div>
        )) : (
          <div className="col-span-4 py-12 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning {activeRetailer} localized signals...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorIntelligence;
