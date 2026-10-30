import React, { useState, useEffect } from 'react';
import {
  Flame,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Search,
  BookOpen,
} from 'lucide-react';

interface HNStory {
  objectID: string;
  title: string;
  url?: string;
  points: number;
  author: string;
  num_comments: number;
  created_at: string;
}

interface HackerNewsPageProps {
  onNavigate: (url: string) => void;
  onOpenNewTab: (url: string) => void;
  onReaderMode?: (url: string) => void;
}

export const HackerNewsPage: React.FC<HackerNewsPageProps> = ({
  onNavigate,
  onOpenNewTab,
  onReaderMode,
}) => {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'front_page' | 'show_hn' | 'ask_hn'>('front_page');
  const [searchFilter, setSearchFilter] = useState('');

  const loadStories = async (tag: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://hn.algolia.com/api/v1/search?tags=${tag}&hitsPerPage=30`);
      const data = await res.json();
      setStories(data.hits || []);
    } catch (err) {
      console.error('HN fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories(filter);
  }, [filter]);

  const filteredStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center select-text">
      {/* Top Bar */}
      <div className="w-full border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-orange-600 text-white font-bold flex items-center justify-center text-xs">
              Y
            </span>
            <span className="font-bold text-slate-100 tracking-tight text-sm">Hacker News</span>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilter('front_page')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filter === 'front_page' ? 'bg-orange-950/60 text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Top Stories
              </button>
              <button
                onClick={() => setFilter('show_hn')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filter === 'show_hn' ? 'bg-orange-950/60 text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Show HN
              </button>
              <button
                onClick={() => setFilter('ask_hn')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filter === 'ask_hn' ? 'bg-orange-950/60 text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ask HN
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter stories..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-orange-500"
              />
            </div>
            <button
              onClick={() => loadStories(filter)}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stories List */}
      <div className="w-full max-w-4xl px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse space-y-2 p-3 bg-slate-900/40 rounded-xl">
                <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
                <div className="h-3 w-1/3 bg-slate-850 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="space-y-2.5">
            {filteredStories.map((story, idx) => {
              const storyUrl = story.url || `https://news.ycombinator.com/item?id=${story.objectID}`;
              const domain = story.url
                ? (() => {
                    try {
                      return new URL(story.url).hostname.replace('www.', '');
                    } catch {
                      return 'item';
                    }
                  })()
                : 'news.ycombinator.com';

              return (
                <div
                  key={story.objectID}
                  className="p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl transition-all flex items-start gap-3.5 group"
                >
                  {/* Rank */}
                  <span className="text-xs font-mono text-slate-500 tabular-nums w-6 shrink-0 pt-0.5">
                    {idx + 1}.
                  </span>

                  {/* Story Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        onClick={() => onNavigate(storyUrl)}
                        className="text-sm font-semibold text-slate-100 group-hover:text-orange-400 cursor-pointer transition-colors"
                      >
                        {story.title}
                      </span>
                      {story.url && (
                        <span className="text-[11px] font-mono text-slate-500">({domain})</span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                      <span className="text-orange-400 font-mono font-medium">
                        {story.points || 0} points
                      </span>
                      <span>·</span>
                      <span>by {story.author}</span>
                      <span>·</span>
                      <button
                        onClick={() =>
                          onNavigate(`https://news.ycombinator.com/item?id=${story.objectID}`)
                        }
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{story.num_comments || 0} comments</span>
                      </button>

                      {story.url && onReaderMode && (
                        <>
                          <span>·</span>
                          <button
                            onClick={() => onReaderMode(storyUrl)}
                            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Reader Mode</span>
                          </button>
                        </>
                      )}

                      <span>·</span>
                      <button
                        onClick={() => onOpenNewTab(storyUrl)}
                        className="flex items-center gap-1 hover:text-slate-200 transition-colors text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>New tab</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-sm">
            No stories matching your filter.
          </div>
        )}
      </div>
    </div>
  );
};
