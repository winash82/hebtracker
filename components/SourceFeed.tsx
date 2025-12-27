
import React from 'react';
import { GroundingSource } from '../types';

interface SourceFeedProps {
  sources: GroundingSource[];
}

const SourceFeed: React.FC<SourceFeedProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-black text-slate-900">Intelligence Discovery Feed</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Verified Scrape Sources for Selected Region</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Geographic Grounding Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sources.slice(0, 12).map((source, idx) => (
          <a 
            key={idx}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-3 rounded-xl border border-slate-50 hover:border-red-100 hover:bg-red-50 transition-all"
          >
            <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-red-600 transition-colors">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-700 truncate group-hover:text-red-700">{source.title}</p>
              <p className="text-[10px] text-slate-400 truncate font-medium mt-0.5">{new URL(source.uri).hostname}</p>
            </div>
          </a>
        ))}
      </div>
      
      {sources.length > 12 && (
        <p className="mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
          + {sources.length - 12} additional local discovery nodes processed in this sync
        </p>
      )}
    </div>
  );
};

export default SourceFeed;
