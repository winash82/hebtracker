
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProductMention, AnalysisStatus, HistoricalProduct, GlobalFoodTrend, GroundingSource, AnalysisLogic, DateRangePreset, Region } from './types';
import { analyzeBrandTrends } from './services/geminiService';
import { Icons } from './constants';
import StatsCards from './components/StatsCards';
import TrendingChart from './components/TrendingChart';
import ProductTable from './components/ProductTable';
import HistoricalLeaders from './components/HistoricalLeaders';
import GlobalTrends from './components/GlobalTrends';
import ProductDetailModal from './components/ProductDetailModal';
import SourceFeed from './components/SourceFeed';

const CACHE_KEY = 'heb_intel_cache_v2';

const App: React.FC = () => {
  const [products, setProducts] = useState<ProductMention[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalProduct[]>([]);
  const [globalTrends, setGlobalTrends] = useState<GlobalFoodTrend[]>([]);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductMention | null>(null);
  const [logic, setLogic] = useState<AnalysisLogic>('breakout');
  const [dateRange, setDateRange] = useState<DateRangePreset>('7d');
  const [region, setRegion] = useState<Region>('all');
  const [confidence, setConfidence] = useState<number>(0);
  const isInitialMount = useRef(true);

  // Load from Cache on Mount (Region-specific cache check)
  useEffect(() => {
    const cached = localStorage.getItem(`${CACHE_KEY}_${region}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProducts(parsed.products);
        setHistoricalData(parsed.historicalData);
        setGlobalTrends(parsed.globalTrends);
        setGroundingSources(parsed.groundingSources);
        setConfidence(parsed.confidence);
        setLastUpdated(parsed.lastUpdated);
      } catch (e) {
        console.error("Cache corrupted", e);
      }
    } else {
      // Clear current data if no cache for this region and not currently fetching
      if (status !== AnalysisStatus.SCRAPING) {
        setProducts([]);
        setHistoricalData([]);
        setGlobalTrends([]);
        setGroundingSources([]);
      }
    }
  }, [region]);

  const fetchTrends = useCallback(async () => {
    try {
      setStatus(AnalysisStatus.SCRAPING);
      const data = await analyzeBrandTrends(logic, dateRange, region);
      
      const updateTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setProducts(data.products);
      setHistoricalData(data.historicalTop5);
      setGlobalTrends(data.globalTrends);
      setGroundingSources(data.groundingSources);
      setConfidence(data.scanConfidence);
      setLastUpdated(updateTime);
      
      localStorage.setItem(`${CACHE_KEY}_${region}`, JSON.stringify({
        products: data.products,
        historicalData: data.historicalTop5,
        globalTrends: data.globalTrends,
        groundingSources: data.groundingSources,
        confidence: data.scanConfidence,
        lastUpdated: updateTime
      }));

      setStatus(AnalysisStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  }, [logic, dateRange, region]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchTrends(); // Initial fetch on mount
      return;
    }
    fetchTrends();
  }, [logic, dateRange, region, fetchTrends]);

  const limitedProducts = products.filter(p => p.isLimitedRelease).slice(0, 5);
  const coreProducts = products.filter(p => !p.isLimitedRelease).slice(0, 6);

  const logicInfo = {
    breakout: { 
      label: "Breakout", 
      desc: "Early signals (24-48h window). Best for identifying viral sparks before they peak.",
      profile: "Sensitivity: High • Noise: Moderate"
    },
    strict: { 
      label: "Strict", 
      desc: "Verified 10+ mention minimum. Cross-platform validation required for inclusion.",
      profile: "Sensitivity: Moderate • Noise: Zero"
    }
  };

  const regions: { id: Region; label: string }[] = [
    { id: 'all', label: 'All Texas' },
    { id: 'austin', label: 'Austin' },
    { id: 'dallas', label: 'Dallas' },
    { id: 'houston', label: 'Houston' },
    { id: 'san_antonio', label: 'San Antonio' }
  ];

  const isRefreshing = status === AnalysisStatus.SCRAPING && (products.length > 0 || globalTrends.length > 0);
  const isInitialLoading = status === AnalysisStatus.SCRAPING && products.length === 0 && globalTrends.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] overflow-hidden bg-slate-100">
          <div className="h-full bg-red-600 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
        </div>
      )}

      <ProductDetailModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <div className="flex flex-col select-none cursor-default">
                <span className="text-2xl font-black italic text-red-600 tracking-tighter leading-none">H-E-B</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
              
              {/* Region Tabs */}
              <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
                {regions.map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => setRegion(reg.id)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      region === reg.id 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                {(['breakout', 'strict'] as AnalysisLogic[]).map((type) => (
                  <div key={type} className="relative group/logic">
                    <button
                      onClick={() => setLogic(type)}
                      className={`px-3 py-1 rounded-md transition-all relative z-10 ${
                        logic === type ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest">
                        {logicInfo[type].label}
                      </div>
                    </button>

                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-4 bg-slate-900 text-white rounded-xl shadow-2xl opacity-0 invisible group-hover/logic:opacity-100 group-hover/logic:visible transition-all z-[100] border border-slate-800">
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">
                        {logicInfo[type].label} Profile
                      </div>
                      <div className="text-[11px] font-medium leading-relaxed text-slate-300 mb-2">
                        {logicInfo[type].desc}
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-[9px] font-black uppercase text-slate-500 tracking-tighter">
                        {logicInfo[type].profile}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 -mb-1.5 border-l border-t border-slate-800"></div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={fetchTrends}
                disabled={status === AnalysisStatus.SCRAPING}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all transform active:scale-95 ${
                  status === AnalysisStatus.SCRAPING 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                }`}
              >
                {status === AnalysisStatus.SCRAPING ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-300 border-t-slate-600" />
                ) : <Icons.Refresh />}
                {status === AnalysisStatus.SCRAPING ? 'Syncing...' : 'Rescan'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Region Scroll */}
      <div className="lg:hidden bg-white border-b border-slate-100 px-4 py-3 overflow-x-auto no-scrollbar flex gap-2">
        {regions.map((reg) => (
          <button
            key={reg.id}
            onClick={() => setRegion(reg.id)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              region === reg.id 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'bg-slate-50 text-slate-500 border border-slate-200'
            }`}
          >
            {reg.label}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-red-600 mb-6"></div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Syncing {regions.find(r => r.id === region)?.label} Intelligence...</h2>
            <p className="mt-2 text-slate-400 text-sm font-semibold">Establishing node connections for localized analysis.</p>
          </div>
        ) : (
          <div className={`${isRefreshing ? 'opacity-70 pointer-events-none' : ''} transition-opacity duration-300`}>
            {products.length > 0 && <StatsCards products={products} />}
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              <div className="lg:col-span-6">
                <TrendingChart products={products} onProductClick={setSelectedProduct} />
              </div>
              <div className="lg:col-span-3">
                <HistoricalLeaders data={historicalData} />
              </div>
              <div className="lg:col-span-3">
                <GlobalTrends trends={globalTrends} />
              </div>
            </div>

            {/* Analysis Controls Row */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Icons.Search />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lookback Window & Scope</h4>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">Focusing on {regions.find(r => r.id === region)?.label} signals</p>
                </div>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['7d', '14d', '30d'] as DateRangePreset[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-6 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                      dateRange === range 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '14d' ? '14 Days' : '30 Days'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              <SourceFeed sources={groundingSources} />

              <ProductTable 
                products={limitedProducts} 
                title="Viral Breakouts"
                subtitle={`High-velocity ${dateRange === '7d' ? '7-day' : dateRange === '14d' ? '14-day' : '30-day'} signals in ${regions.find(r => r.id === region)?.label}`}
                badgeText="VELOCITY"
                badgeColor="bg-amber-50 text-amber-600 border-amber-100"
                displayMode="viral"
                onProductClick={setSelectedProduct}
              />

              <ProductTable 
                products={coreProducts} 
                title="Stable Baseline"
                subtitle="Consistent engagement volume"
                badgeText="STABILITY"
                badgeColor="bg-blue-50 text-blue-600 border-blue-100"
                displayMode="core"
                onProductClick={setSelectedProduct}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <span className="text-2xl font-black italic text-red-600 tracking-tighter mb-2 block">H-E-B Intelligence</span>
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-40">Persistent Hub v10.0 • Region-Aware Node Sync</p>
        </div>
      </footer>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
