
import React from 'react';
import { ProductMention } from '../types';
import { Icons } from '../constants';

interface ProductDetailModalProps {
  product: ProductMention | null;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const calculateReliability = (p: ProductMention) => {
    const base = p.confidenceScore || 70;
    const evidenceBonus = (p.evidenceCount || 1) * 5;
    return Math.min(100, base + evidenceBonus);
  };

  const reliability = calculateReliability(product);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-slate-900 text-[10px] font-black text-white px-1.5 py-0.5 rounded tracking-tighter uppercase italic">Social Consensus Verified</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">{product.name}</h2>
            {product.flavorVariant && <p className="text-red-600 font-bold text-lg mt-1 tracking-tight">{product.flavorVariant}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="p-8">
          <div className="mb-8 p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Evidence Density</h4>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black">{reliability}%</span>
                  <div>
                    <p className="text-sm font-bold">Consensus Score</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Cross-platform validation</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Source Nodes</p>
                <p className="text-sm font-bold">{product.evidenceCount || 1} Independent Mentions</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Viral Context</h4>
              <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                "{product.whyTrending}"
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Social Vol</p>
                <p className="text-xl font-black text-slate-800">{product.mentionsThisWeek}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Evidence Path</p>
                <p className="text-[10px] font-black text-red-600 leading-tight">{product.evidenceSummary || 'Multi-Node'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Sources</h4>
            <div className="grid grid-cols-1 gap-2">
              {product.sources.map((src, i) => (
                <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-all group">
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-red-700 truncate">{src.title}</span>
                  <Icons.Search />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
