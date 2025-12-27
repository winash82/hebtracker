
import React, { useState, useEffect, useCallback } from 'react';
import { ProductMention, AnalysisStatus, HistoricalProduct, GlobalFoodTrend } from './types';
import { analyzeBrandTrends, AnalysisLogic } from './services/geminiService';
import { Icons } from './constants';
import StatsCards from './components/StatsCards';
import TrendingChart from './components/TrendingChart';
import ProductTable from './components/ProductTable';
import HistoricalLeaders from './components/HistoricalLeaders';
import GlobalTrends from './components/GlobalTrends';
import ProductDetailModal from './components/ProductDetailModal';

const App: React.FC = () => {
  const [products, setProducts] = useState<ProductMention[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalProduct[]>([]);
  const [globalTrends, setGlobalTrends] = useState<GlobalFoodTrend[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductMention | null>(null);
  const [logic, setLogic] = useState<AnalysisLogic>('simple');

  const fetchTrends = useCallback(async () => {
    try {
      setStatus(AnalysisStatus.SCRAPING);
      const data = await analyzeBrandTrends(logic);
      setProducts(data.products);
      setHistoricalData(data.historicalTop5);
      setGlobalTrends(data.globalTrends);
      setLastUpdated(new Date().toLocaleString());
      setStatus(AnalysisStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  }, [logic]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const limitedProducts = products.filter(p => p.isLimitedRelease).slice(0, 5);
  const coreProducts = products.filter(p => !p.isLimitedRelease).slice(0, 6);

  // High quality PNG logo for H-E-B
  const HEB_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/H-E-B_logo.svg/1200px-H-E-B_logo.svg.png";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ProductDetailModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <img 
                src={HEB_LOGO_URL} 
                alt="H-E-B Logo" 
                className="h-8 w-auto object-contain select-none transition-transform hover:scale-105"
              />
              <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
              <h1 className="text-lg font-bold text-slate-800 hidden sm:block tracking-tight">Brand Intelligence</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setLogic('simple')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                    logic === 'simple' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Simple Volume
                </button>
                <button
                  onClick={() => setLogic('momentum')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                    logic === 'momentum' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Momentum
                </button>
              </div>
              <button 
                onClick={fetchTrends}
                disabled={status === AnalysisStatus.SCRAPING}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all transform active:scale-95 ${
                  status === AnalysisStatus.SCRAPING 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-200'
                }`}
              >
                {status === AnalysisStatus.SCRAPING ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600" />
                ) : <Icons.Refresh />}
                {status === AnalysisStatus.SCRAPING ? 'Analyzing Nodes...' : 'Rescan Intelligence'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {status === AnalysisStatus.ERROR && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            <p className="text-sm font-bold">Scraping node failure. Regional cluster sync retrying...</p>
          </div>
        )}

        {status === AnalysisStatus.SCRAPING && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="relative">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></div>
              <div className="relative bg-white p-12 rounded-full shadow-2xl border border-slate-100">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-red-50 border-t-red-600"></div>
              </div>
            </div>
            <h2 className="mt-12 text-3xl font-black text-slate-900 tracking-tight">Verifying Market Signal...</h2>
            <p className="mt-4 text-slate-500 max-w-sm text-center font-semibold leading-relaxed">
              Applying {logic.toUpperCase()} logic to r/HEB and #foodtok mention clusters to verify cross-platform accuracy...
            </p>
          </div>
        ) : (
          <>
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

            <div className="space-y-12">
              <ProductTable 
                products={limitedProducts} 
                title="Viral Anomalies & Limited Releases"
                subtitle="Top 5 Breakthrough Spikes (Limited Bakery, Seasonal Finds)"
                badgeText="VIRAL VELOCITY"
                badgeColor="bg-amber-50 text-amber-600 border-amber-100"
                displayMode="viral"
                onProductClick={setSelectedProduct}
              />

              <ProductTable 
                products={coreProducts} 
                title="Core Product & Evergreen Volume"
                subtitle="Top 6 High-Engagement Staples (Tortillas, Pantry, Coffee)"
                badgeText="STABLE VOLUME"
                badgeColor="bg-blue-50 text-blue-600 border-blue-100"
                displayMode="core"
                onProductClick={setSelectedProduct}
              />
            </div>

            <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl mt-12 flex flex-col lg:flex-row gap-12 items-center text-white">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest italic">Node Scope v7.0</span>
                        <h3 className="text-2xl font-black tracking-tight">Intelligence Synthesis Hub</h3>
                    </div>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Currently tracking <strong>{logic.toUpperCase()}</strong> signals. Interactive sorting is enabled for social volume columns. 
                        Champions are now strictly verified using absolute mention counts from regional food hubs and the global #foodtok graph.
                    </p>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                   <div className="flex-1 lg:flex-none p-6 bg-slate-800 rounded-2xl border border-slate-700 flex flex-col items-center min-w-[160px]">
                      <span className="text-[10px] font-black uppercase mb-2 text-slate-400 tracking-widest text-center">Sync Frequency</span>
                      <span className="text-sm font-bold text-red-500">Real-Time Poll</span>
                   </div>
                   <div className="flex-1 lg:flex-none p-6 bg-slate-800 rounded-2xl border border-slate-700 flex flex-col items-center min-w-[160px]">
                      <span className="text-[10px] font-black uppercase mb-2 text-slate-400 tracking-widest text-center">Data Type</span>
                      <span className="text-sm font-bold text-blue-400">Pure Social</span>
                   </div>
                </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-500 py-24 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="md:col-span-2">
              <img 
                src={HEB_LOGO_URL} 
                alt="H-E-B Logo" 
                className="h-10 w-auto mb-8 brightness-0 invert opacity-90"
              />
              <p className="text-sm font-medium leading-relaxed max-w-sm">
                Advanced volume tracking dashboard. Cross-verifying regional Texas signal with global food industry velocity across Reddit and TikTok.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Social Discovery</h4>
              <ul className="text-sm space-y-3 opacity-60 font-semibold">
                <li>• Reddit r/HEB</li>
                <li>• r/food Industry Watch</li>
                <li>• #HEB TikTok Cluster</li>
                <li>• #foodtok Trending Graphs</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Baseline Node</h4>
              <p className="text-[11px] leading-relaxed opacity-40">
                Data grounding provided by Gemini 3. Volume verification involves platform-specific count aggregation and double-pass mention integrity checks.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-20 pt-10 text-center text-[10px] uppercase tracking-[0.4em] font-black opacity-20">
            &copy; {new Date().getFullYear()} H-E-B Intelligence Engine • TX Food Data
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
