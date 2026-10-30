import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  CloudSun,
  Flame,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  Gamepad2,
  Code2,
  Sparkles,
  ArrowRight,
  Heart,
  DollarSign,
  Wallet,
  Megaphone,
  Play,
} from 'lucide-react';
import { BrowserSettings } from '../../types/browser';
import mosesExactPhoto from '../../assets/images/moses_exact_portrait_1791100364867.jpg';
import { OrdionQuickChat } from '../ordion/OrdionQuickChat';

interface NewTabPageProps {
  onNavigate: (url: string) => void;
  onOpenNewTab: (url: string) => void;
  settings: BrowserSettings;
  onOpenOrdionPanel?: () => void;
}

const DEFAULT_SPEED_DIALS = [
  { id: '1', title: 'DuckDuckGo', url: 'browser://search', icon: '🦆', color: 'bg-amber-950/40 text-amber-300' },
  { id: '2', title: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Portal:Current_events', icon: '🌐', color: 'bg-slate-800 text-slate-200' },
  { id: '3', title: 'Hacker News', url: 'browser://hackernews', icon: '🟧', color: 'bg-orange-950/40 text-orange-400' },
  { id: '4', title: 'GitHub', url: 'https://github.com', icon: '🐙', color: 'bg-slate-800 text-purple-300' },
  { id: '5', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '📚', color: 'bg-blue-950/40 text-blue-300' },
  { id: '6', title: 'Arcade Games', url: 'browser://arcade', icon: '🕹️', color: 'bg-emerald-950/40 text-emerald-300' },
  { id: '7', title: 'Dev Scratchpad', url: 'browser://scratchpad', icon: '⚡', color: 'bg-indigo-950/40 text-indigo-300' },
  { id: '8', title: 'DevDocs', url: 'https://devdocs.io', icon: '📖', color: 'bg-teal-950/40 text-teal-300' },
];

export const NewTabPage: React.FC<NewTabPageProps> = ({
  onNavigate,
  onOpenNewTab,
  settings,
  onOpenOrdionPanel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [engine, setEngine] = useState<'duckduckgo' | 'wikipedia' | 'google' | 'ordion'>((settings.searchEngine as any) || 'duckduckgo');
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [quickNotes, setQuickNotes] = useState(() => localStorage.getItem('aura_quick_notes') || '');
  const [trendingStories, setTrendingStories] = useState<any[]>([]);
  const [speedDials, setSpeedDials] = useState(DEFAULT_SPEED_DIALS);
  const [showAddDial, setShowAddDial] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch trending stories
  useEffect(() => {
    fetch('/api/hackernews')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTrendingStories(data.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if (q.startsWith('http://') || q.startsWith('https://')) {
      onNavigate(q);
      return;
    }

    if (q.includes('.') && !q.includes(' ') && !q.endsWith('.')) {
      onNavigate(`https://${q}`);
      return;
    }

    if (engine === 'ordion') {
      onNavigate(`browser://ordion?q=${encodeURIComponent(q)}`);
      return;
    }

    if (engine === 'wikipedia') {
      onNavigate(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`);
    } else {
      onNavigate(`browser://search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleNoteChange = (text: string) => {
    setQuickNotes(text);
    localStorage.setItem('aura_quick_notes', text);
  };

  const handleAddDial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    const url = newUrl.startsWith('http') || newUrl.startsWith('browser://') ? newUrl : `https://${newUrl}`;
    const newEntry = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url,
      icon: '🌐',
      color: 'bg-slate-800 text-slate-200',
    };
    setSpeedDials([...speedDials, newEntry]);
    setNewTitle('');
    setNewUrl('');
    setShowAddDial(false);
  };

  const removeDial = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeedDials(speedDials.filter((d) => d.id !== id));
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center px-4 py-8 sm:py-12 select-text">
      {/* Top Header Widget */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
            <img
              src={mosesExactPhoto}
              onError={(e) => {
                e.currentTarget.src = "/moses_profile.jpg";
              }}
              alt="Moses - Founder & Engineer"
              className="w-5 h-5 rounded-full object-cover object-top border border-indigo-400/40"
            />
            <span className="font-bold text-indigo-400 tracking-wider text-xs uppercase font-mono">
              MOSESTECH
            </span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span>21°C · Clear Sky</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono tabular-nums text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{dateStr}</span>
            <span className="text-slate-600">·</span>
            <span className="font-semibold text-slate-100">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Main Hero: WELCOME TO XENON */}
      <div className="flex flex-col items-center text-center my-3">
        <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2 uppercase">
          WELCOME TO <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">XENON</span>
        </div>
        <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-slate-300 my-1 tabular-nums">
          {timeStr}
        </div>
        <p className="text-xs sm:text-sm text-slate-400 tracking-wide mt-1">
          Next-generation web browser · Where do you want to explore today?
        </p>
      </div>

      {/* Omnibox / Big Search Input */}
      <div className="w-full max-w-2xl my-6">
        <form onSubmit={handleSearch} className="relative group">
          <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl shadow-black/40 backdrop-blur-md px-4 py-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search DuckDuckGo or type a web address..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base outline-none font-normal"
              autoFocus
            />

            {/* Engine Picker */}
            <div className="flex items-center gap-1 ml-2 pl-3 border-l border-slate-700 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setEngine('duckduckgo')}
                className={`px-2 py-1 rounded transition-colors ${
                  engine === 'duckduckgo' ? 'bg-indigo-600/30 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Search via DuckDuckGo"
              >
                DDG
              </button>
              <button
                type="button"
                onClick={() => setEngine('wikipedia')}
                className={`px-2 py-1 rounded transition-colors ${
                  engine === 'wikipedia' ? 'bg-indigo-600/30 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Search Wikipedia"
              >
                Wiki
              </button>
              <button
                type="button"
                onClick={() => setEngine('ordion')}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  engine === 'ordion' ? 'bg-sky-600/40 text-sky-300 font-semibold ring-1 ring-sky-400/40' : 'text-slate-400 hover:text-sky-300'
                }`}
                title="Ask Ordion Fast & Hybrid AI"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Ordion AI</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Search Suggestions */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400 flex-wrap">
          <span className="text-slate-500">Popular:</span>
          {['TypeScript 5', 'James Webb Telescope', 'Next.js 15', 'Quantum Computing', 'WebAssembly'].map((tag) => (
            <button
              key={tag}
              onClick={() => onNavigate(`browser://search?q=${encodeURIComponent(tag)}`)}
              className="text-slate-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Write a Message to Ordion AI - In-Page Interactive Quick Chat */}
      <div className="w-full max-w-2xl mb-6">
        <OrdionQuickChat
          onOpenFullPanel={onOpenOrdionPanel}
          onOpenScratchpad={(code) => {
            localStorage.setItem('aura_scratchpad_code', code);
            onNavigate('browser://scratchpad');
          }}
        />
      </div>

      {/* Creator Profile Showcase: Moses with Exact Photo & Family Info */}
      <div className="w-full max-w-2xl mb-8 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center gap-5 text-left">
        <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden shrink-0 border-2 border-indigo-500/40 shadow-xl bg-slate-950">
          <img
            src={mosesExactPhoto}
            onError={(e) => {
              e.currentTarget.src = "/moses_profile.jpg";
            }}
            alt="Moses (Felix Mokaya)"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute bottom-1 inset-x-1 bg-slate-950/90 backdrop-blur-xs text-[9px] font-mono text-center text-sky-400 py-0.5 rounded border border-sky-500/20">
            MOSES · FOUNDER
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h3 className="text-base font-extrabold text-white">Moses (Felix Mokaya)</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
              CREATOR & ENGINEER
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Visionary engineer of <strong>XENON Browser</strong> and Ordion Hybrid AI. Building high-speed, ad-free, intelligent software.
          </p>

          {/* Genuine Family Facts Badge */}
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-indigo-500/25 space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Family Information:</span>
            <div className="text-[11px] text-slate-300 flex flex-wrap gap-x-3 gap-y-0.5 font-mono">
              <span>Brothers: <strong className="text-white">Felix & Ibrahim</strong></span>
              <span>·</span>
              <span>Sister: <strong className="text-rose-300">Dinah</strong></span>
              <span>·</span>
              <span>Parents: <strong className="text-white">John & Peris</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Speed Dial Grid */}
      <div className="w-full max-w-3xl my-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Speed Dial & Quick Access
          </span>
          <button
            onClick={() => setShowAddDial(!showAddDial)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shortcut</span>
          </button>
        </div>

        {/* Add Shortcut Form Modal/Inline */}
        {showAddDial && (
          <form onSubmit={handleAddDial} className="mb-4 p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-3">
            <input
              type="text"
              placeholder="Title (e.g. Stack Overflow)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="URL (e.g. stackoverflow.com)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAddDial(false)}
              className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {speedDials.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.url)}
              className="group relative flex items-center gap-3 p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${item.color}`}>
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {item.url.replace('https://', '').replace('browser://', '')}
                </div>
              </div>
              <button
                onClick={(e) => removeDial(item.id, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                title="Remove"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Live Headlines & Scratchpad Notepad */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-8">
        {/* Trending Tech News Feed */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Trending on Hacker News
              </h3>
            </div>
            <button
              onClick={() => onNavigate('browser://hackernews')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>Full Feed</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {trendingStories.length > 0 ? (
              trendingStories.map((story, idx) => (
                <div
                  key={story.objectID || idx}
                  onClick={() => onNavigate(story.url || `https://news.ycombinator.com/item?id=${story.objectID}`)}
                  className="group flex items-start gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  <span className="text-xs font-mono text-slate-500 mt-0.5 tabular-nums">0{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {story.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{story.points || 0} pts</span>
                      <span>·</span>
                      <span>{story.num_comments || 0} comments</span>
                      {story.url && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[120px]">
                            {new URL(story.url).hostname.replace('www.', '')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">Loading live stories...</div>
            )}
          </div>
        </div>

        {/* Quick Scratchpad / Sticky Notes */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Quick Scratchpad
              </h3>
            </div>
            <button
              onClick={() => onNavigate('browser://scratchpad')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>Code Sandbox</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Temporary notes or code snippets saved automatically to this browser session.
          </p>
          <textarea
            value={quickNotes}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Paste links, jot down quick ideas, or save reference commands..."
            className="w-full flex-1 min-h-[140px] bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-200 font-mono resize-none outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Internal Browser Navigation Links */}
      <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-900">
        <button onClick={() => onNavigate('browser://history')} className="hover:text-slate-300 transition-colors">
          History
        </button>
        <span>·</span>
        <button onClick={() => onNavigate('browser://bookmarks')} className="hover:text-slate-300 transition-colors">
          Bookmarks
        </button>
        <span>·</span>
        <button onClick={() => onNavigate('browser://downloads')} className="hover:text-slate-300 transition-colors">
          Downloads
        </button>
        <span>·</span>
        <button onClick={() => onNavigate('browser://extensions')} className="hover:text-slate-300 transition-colors">
          Extensions
        </button>
        <span>·</span>
        <button onClick={() => onNavigate('browser://arcade')} className="hover:text-slate-300 transition-colors">
          Arcade
        </button>
        <span>·</span>
        <button onClick={() => onNavigate('browser://settings')} className="hover:text-slate-300 transition-colors">
          Settings
        </button>
      </div>
    </div>
  );
};
