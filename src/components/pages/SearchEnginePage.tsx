import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Globe,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

interface InstantAnswer {
  title: string;
  description: string;
  source: string;
  url: string;
  image?: string | null;
}

interface SearchEnginePageProps {
  initialQuery?: string;
  onNavigate: (url: string) => void;
  onOpenNewTab: (url: string) => void;
  onOpenVideoAd?: () => void;
}

export const SearchEnginePage: React.FC<SearchEnginePageProps> = ({
  initialQuery = 'WebAssembly',
  onNavigate,
  onOpenNewTab,
  onOpenVideoAd,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'all' | 'wiki' | 'hn'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [instantAnswer, setInstantAnswer] = useState<InstantAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setInstantAnswer(data.instantAnswer || null);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      setSearchTime(Math.round(performance.now() - start));
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const filteredResults = results.filter((item) => {
    if (activeFilter === 'wiki') return item.source === 'Wikipedia';
    if (activeFilter === 'hn') return item.source === 'Hacker News';
    return true;
  });

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center select-text">
      {/* Search Header Bar */}
      <div className="w-full border-b border-slate-800 bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div
            onClick={() => onNavigate('browser://newtab')}
            className="flex items-center gap-1.5 cursor-pointer text-indigo-400 font-bold tracking-tight text-sm shrink-0"
          >
            <span>🦆</span>
            <span className="hidden sm:inline text-slate-200">AuraSearch</span>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl relative">
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the web..."
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 outline-none text-xs sm:text-sm font-normal"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-slate-400 hover:text-slate-200 p-1 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Filter Navigation */}
        <div className="max-w-4xl mx-auto flex items-center gap-4 mt-2.5 pt-1 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`pb-1 font-medium transition-colors border-b-2 ${
              activeFilter === 'all'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveFilter('wiki')}
            className={`pb-1 font-medium transition-colors border-b-2 ${
              activeFilter === 'wiki'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Wikipedia Articles
          </button>
          <button
            onClick={() => setActiveFilter('hn')}
            className={`pb-1 font-medium transition-colors border-b-2 ${
              activeFilter === 'hn'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Hacker News
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl px-4 py-6">
        {/* Results Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-2 border-b border-slate-900 font-mono">
          <span>
            {loading ? 'Searching...' : `Found ${filteredResults.length} results`}
          </span>
          {!loading && searchTime > 0 && <span>({searchTime} ms)</span>}
        </div>


        {/* Instant Answer / Knowledge Panel */}
        {instantAnswer && activeFilter === 'all' && (
          <div className="mb-6 p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-5 items-start">
            {instantAnswer.image && (
              <img
                src={instantAnswer.image}
                alt={instantAnswer.title}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-slate-700 shrink-0 bg-slate-800"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Instant Answer
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">{instantAnswer.source}</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{instantAnswer.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                {instantAnswer.description}
              </p>
              {instantAnswer.url && (
                <button
                  onClick={() => onNavigate(instantAnswer.url)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search Results List */}
        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-3 w-48 bg-slate-800 rounded"></div>
                <div className="h-5 w-3/4 bg-slate-800 rounded"></div>
                <div className="h-4 w-full bg-slate-850 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-6">
            {filteredResults.map((item, idx) => (
              <div
                key={idx}
                className="group p-3 rounded-xl hover:bg-slate-900/60 border border-transparent hover:border-slate-800/80 transition-all"
              >
                {/* Domain & URL */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                    {item.url}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    {item.source}
                  </span>
                </div>

                {/* Title (Clickable) */}
                <h3
                  onClick={() => onNavigate(item.url)}
                  className="text-base font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:underline cursor-pointer transition-colors mb-1.5"
                >
                  {item.title}
                </h3>

                {/* Snippet */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2">
                  {item.snippet}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <button
                    onClick={() => onNavigate(item.url)}
                    className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Open in page</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onOpenNewTab(item.url)}
                    className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">No results found for "{query}".</p>
            <p className="text-xs text-slate-600 mt-1">Try searching for generic terms like "Linux", "SpaceX", or "React".</p>
          </div>
        )}
      </div>
    </div>
  );
};
