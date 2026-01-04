
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TrendCard from './components/TrendCard';
import DetailView from './components/DetailView';
import { TrendCategory, TrendItem, UserPersona } from './types';
import { fetchTrends } from './services/gemini';
import * as Icons from 'lucide-react';

const COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 hours

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory>(TrendCategory.ALL);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Persona State
  const [userPersona, setUserPersona] = useState<UserPersona>(() => {
    try {
      const saved = localStorage.getItem('marketpulse_persona');
      return (saved as UserPersona) || 'General';
    } catch {
      return 'General';
    }
  });

  // Timer State
  const [nextUpdate, setNextUpdate] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Persistence State
  const [savedTrends, setSavedTrends] = useState<TrendItem[]>(() => {
    try {
      const saved = localStorage.getItem('marketpulse_saved_trends');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load saved trends", e);
      return [];
    }
  });

  const [readLaterTrends, setReadLaterTrends] = useState<TrendItem[]>(() => {
    try {
      const saved = localStorage.getItem('marketpulse_read_later');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load read later trends", e);
      return [];
    }
  });

  // Filter States
  const [minImpact, setMinImpact] = useState<number>(0);
  const [sentimentFilter, setSentimentFilter] = useState<string>('All');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('marketpulse_saved_trends', JSON.stringify(savedTrends));
  }, [savedTrends]);

  useEffect(() => {
    localStorage.setItem('marketpulse_read_later', JSON.stringify(readLaterTrends));
  }, [readLaterTrends]);
  
  useEffect(() => {
    localStorage.setItem('marketpulse_persona', userPersona);
  }, [userPersona]);

  // Timer Logic
  useEffect(() => {
    if (!nextUpdate) {
      setTimeRemaining("");
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = nextUpdate - now;

      if (diff <= 0) {
        setNextUpdate(null);
        setTimeRemaining("");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer(); // Run immediately
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextUpdate]);

  const toggleSaveTrend = (trend: TrendItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setSavedTrends(prev => {
      const exists = prev.find(t => t.id === trend.id);
      if (exists) {
        return prev.filter(t => t.id !== trend.id);
      } else {
        return [...prev, trend];
      }
    });
  };

  const toggleReadLater = (trend: TrendItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setReadLaterTrends(prev => {
      const exists = prev.find(t => t.id === trend.id);
      if (exists) {
        return prev.filter(t => t.id !== trend.id);
      } else {
        return [...prev, trend];
      }
    });
  };

  const loadTrends = async (category: TrendCategory, forceRefresh = false) => {
    // Reset timer state initially
    setNextUpdate(null);

    // 1. Handle Local Lists (No API calls, No Timer)
    if (category === TrendCategory.SAVED) {
      setTrends(savedTrends);
      setLoading(false);
      return;
    }

    if (category === TrendCategory.READ_LATER) {
      setTrends(readLaterTrends);
      setLoading(false);
      return;
    }

    // 2. Handle Network Categories with Caching
    // Use v2 key to ensure we don't show old 3-trend caches
    const cacheKey = `marketpulse_cache_v2_${category}_${userPersona}`;
    let hasStaleData = false;
    
    try {
      const cachedRaw = localStorage.getItem(cacheKey);

      if (cachedRaw) {
        const cachedData = JSON.parse(cachedRaw);
        // IMMEDIATE: Show cached data regardless of age to feel "instant"
        setTrends(cachedData.trends);
        hasStaleData = true;

        const age = Date.now() - cachedData.timestamp;
        
        // If fresh and not forcing refresh, we are done.
        if (age < COOLDOWN_MS && !forceRefresh) {
          setNextUpdate(cachedData.timestamp + COOLDOWN_MS);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Cache read error", e);
    }

    // 3. Fetch Fresh Data (Background or Foreground)
    
    // Only show full loading screen if we have absolutely nothing to show
    if (!hasStaleData) {
       setTrends([]); 
       setLoading(true);
    } else {
      // If we have stale data, set loading true to show spinner in header, but user still sees content
      setLoading(true);
    }
    
    let query = `Digital Marketing Trends for ${category}`;
    if (category === TrendCategory.ALL) {
      query = "Digital Marketing Trends";
    }
      
    const items = await fetchTrends(query, userPersona);
    
    // Save to Cache if successful
    if (items.length > 0) {
      const now = Date.now();
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: now,
        trends: items
      }));
      setNextUpdate(now + COOLDOWN_MS);
      setTrends(items);
    } else if (hasStaleData) {
      // If fetch failed but we had stale data, just keep stale data
      console.log("Fetch failed, keeping stale data");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadTrends(selectedCategory);
  }, [selectedCategory, userPersona]); // Reload when category OR persona changes

  // Ensure lists update immediately when items are removed in their respective views
  useEffect(() => {
    if (selectedCategory === TrendCategory.SAVED) {
      setTrends(savedTrends);
    }
  }, [savedTrends, selectedCategory]);

  useEffect(() => {
    if (selectedCategory === TrendCategory.READ_LATER) {
      setTrends(readLaterTrends);
    }
  }, [readLaterTrends, selectedCategory]);

  // Apply filters
  const filteredTrends = trends.filter(trend => {
    const matchesSentiment = sentimentFilter === 'All' || trend.sentiment === sentimentFilter;
    const matchesImpact = trend.impactScore >= minImpact;
    return matchesSentiment && matchesImpact;
  });

  const getSubheaderText = () => {
    if (selectedCategory === TrendCategory.SAVED) return `${savedTrends.length} items saved`;
    if (selectedCategory === TrendCategory.READ_LATER) return `${readLaterTrends.length} items to read`;
    
    if (loading && trends.length > 0) return "Updating trends...";
    if (nextUpdate) return "Trends up to date";
    if (loading) return "Fetching trends...";
    return 'Ready to update';
  };

  const isNetworkCategory = selectedCategory !== TrendCategory.SAVED && selectedCategory !== TrendCategory.READ_LATER;

  // Render logic: Show grid if we have trends, OR if we have trends and are loading (background refresh)
  // Only show full loading screen if loading is true AND no trends exist.
  const showLoadingScreen = loading && trends.length === 0;

  return (
    <div className="flex h-screen bg-transparent text-slate-100 font-sans">
      <Sidebar 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        userPersona={userPersona}
        onSelectPersona={setUserPersona}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header - Glass */}
        <header className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/30 backdrop-blur-xl z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Icons.Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                {selectedCategory === TrendCategory.ALL ? 'What\'s Trending?' : `${selectedCategory}`}
              </h1>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <span>{getSubheaderText()}</span>
                {/* Show spinner if loading, even if we have trends (background refresh) */}
                {loading && <Icons.Loader2 size={12} className="animate-spin text-indigo-300" />}
                {!loading && isNetworkCategory && (
                  <span className="text-indigo-300/80 text-xs px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                    Targeted for: {userPersona}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {isNetworkCategory && (
            <div className="flex items-center">
              {nextUpdate && timeRemaining && !loading ? (
                <div className="flex items-center gap-3 px-4 py-2 bg-black/20 border border-white/5 rounded-xl text-sm font-medium text-slate-300 select-none shadow-inner backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-indigo-300 animate-pulse">
                    <Icons.Hourglass size={16} />
                    <span className="font-mono font-bold tracking-widest">{timeRemaining}</span>
                  </div>
                  <span className="hidden sm:inline text-xs text-slate-500 border-l border-white/10 pl-3">Next update</span>
                </div>
              ) : (
                <button 
                  onClick={() => loadTrends(selectedCategory, true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/80 hover:bg-indigo-500/90 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 active:scale-95 border border-indigo-400/20 backdrop-blur-sm"
                >
                  <Icons.RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">{loading ? 'Updating...' : 'Find Fresh Trends'}</span>
                </button>
              )}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {showLoadingScreen ? (
             <div className="flex flex-col items-center justify-center h-full min-h-[50vh] animate-in fade-in duration-500">
               <div className="relative mb-8">
                 <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                 <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex items-center justify-center">
                   <Icons.Bot size={48} className="text-indigo-300 drop-shadow-lg" />
                   <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1.5 border border-slate-700">
                      <Icons.Loader2 size={20} className="text-emerald-400 animate-spin" />
                   </div>
                 </div>
               </div>

               <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Analyzing the Market</h2>
               <p className="text-slate-300 max-w-sm text-center mb-8">
                 Curating insights specifically for a <span className="text-indigo-300 font-semibold">{userPersona}</span> perspective...
               </p>

               <div className="flex gap-2">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
               </div>
             </div>
          ) : trends.length > 0 ? (
            <>
              {/* Filter Controls - Glass */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-300 font-medium flex items-center gap-2">
                    <Icons.Filter size={16} className="text-indigo-300" />
                    Sentiment:
                  </label>
                  <select
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                    className="bg-black/20 border border-white/10 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none backdrop-blur-sm"
                  >
                    <option value="All" className="bg-slate-900">All Types</option>
                    <option value="Positive" className="bg-slate-900">Good News (Positive)</option>
                    <option value="Mixed" className="bg-slate-900">Debated (Mixed)</option>
                    <option value="Neutral" className="bg-slate-900">Neutral</option>
                  </select>
                </div>

                <div className="hidden sm:block w-px bg-white/10 mx-2"></div>

                <div className="flex items-center gap-3 flex-1">
                  <label className="text-sm text-slate-300 font-medium flex items-center gap-2 whitespace-nowrap">
                    <Icons.BarChart2 size={16} className="text-indigo-300" />
                    Min Relevance: <span className="text-indigo-300 w-8 font-bold">{minImpact}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={minImpact}
                    onChange={(e) => setMinImpact(parseInt(e.target.value))}
                    className="w-full sm:w-48 h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="text-xs text-slate-400 flex items-center ml-auto bg-black/20 px-3 py-1 rounded-full border border-white/5">
                   Showing {filteredTrends.length} of {trends.length}
                </div>
              </div>

              {/* Results Grid */}
              <div className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                {filteredTrends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrends.map((trend) => (
                      <TrendCard 
                        key={trend.id} 
                        trend={trend} 
                        onClick={setSelectedTrend}
                        isSaved={savedTrends.some(t => t.id === trend.id)}
                        onToggleSave={toggleSaveTrend}
                        isReadLater={readLaterTrends.some(t => t.id === trend.id)}
                        onToggleReadLater={toggleReadLater}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="p-6 rounded-full bg-white/5 border border-white/5 mb-4 backdrop-blur-sm">
                      <Icons.FilterX size={48} className="opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-slate-300">No trends match your filters.</p>
                    <button 
                      onClick={() => { setMinImpact(0); setSentimentFilter('All'); }}
                      className="mt-2 text-indigo-300 hover:text-indigo-200 underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="p-8 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-2xl">
                {selectedCategory === TrendCategory.SAVED ? (
                  <Icons.Bookmark size={48} className="opacity-70 text-indigo-300" />
                ) : selectedCategory === TrendCategory.READ_LATER ? (
                  <Icons.Clock size={48} className="opacity-70 text-indigo-300" />
                ) : (
                  <Icons.Search size={48} className="opacity-70 text-indigo-300" />
                )}
              </div>
              
              {selectedCategory === TrendCategory.SAVED ? (
                <>
                   <p className="text-xl font-semibold text-white mb-2">No saved trends yet.</p>
                   <p className="text-sm text-slate-400">Bookmark interesting trends to see them here.</p>
                </>
              ) : selectedCategory === TrendCategory.READ_LATER ? (
                <>
                   <p className="text-xl font-semibold text-white mb-2">No trends in reading list.</p>
                   <p className="text-sm text-slate-400">Mark trends as "Read Later" to access them quickly.</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-semibold text-white mb-2">Looking for trends...</p>
                  <p className="text-sm text-slate-400 mb-4 text-center max-w-xs">Viewing as: <span className="text-indigo-300 font-bold">{userPersona}</span></p>
                  <button 
                    onClick={() => loadTrends(selectedCategory, true)}
                    className="text-indigo-300 hover:text-indigo-200 underline"
                  >
                    Try refreshing
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Footer attribution */}
          <div className="mt-16 text-center text-slate-500/60 text-xs pb-4 font-medium">
            Powered by AI (Gemini) • Information is generated for educational purposes.
          </div>
        </div>
      </main>

      {/* Detail Slide-over */}
      {selectedTrend && (
        <DetailView 
          trend={selectedTrend} 
          onClose={() => setSelectedTrend(null)} 
          isSaved={selectedTrend ? savedTrends.some(t => t.id === selectedTrend.id) : false}
          onToggleSave={toggleSaveTrend}
          isReadLater={selectedTrend ? readLaterTrends.some(t => t.id === selectedTrend.id) : false}
          onToggleReadLater={toggleReadLater}
        />
      )}
    </div>
  );
};

export default App;
