import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ArrowLeft,
  Type,
  AlignLeft,
  Clock,
  ExternalLink,
  Share2,
  Check,
} from 'lucide-react';

interface ReaderModePageProps {
  url: string;
  onExit: () => void;
  onNavigate: (url: string) => void;
}

interface ArticleData {
  title: string;
  author?: string;
  siteName?: string;
  leadImage?: string | null;
  paragraphs: string[];
  wordCount: number;
  readingTimeMinutes: number;
  url: string;
}

export const ReaderModePage: React.FC<ReaderModePageProps> = ({ url, onExit, onNavigate }) => {
  const [data, setData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/read?url=${encodeURIComponent(url)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not parse article for reader mode');
        return res.json();
      })
      .then((article) => {
        setData(article);
      })
      .catch((err) => {
        setError(err.message || 'Failed to extract article content');
      })
      .finally(() => setLoading(false));
  }, [url]);

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themeClasses = {
    dark: 'bg-slate-950 text-slate-100 selection:bg-indigo-900 selection:text-white',
    sepia: 'bg-[#fbf0d9] text-[#433422] selection:bg-[#ecd2aa] selection:text-[#2b1f13]',
    light: 'bg-white text-slate-900 selection:bg-slate-200 selection:text-slate-900',
  };

  const fontClasses = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
  };

  return (
    <div className={`w-full h-full overflow-y-auto flex flex-col items-center select-text transition-colors duration-200 ${themeClasses[theme]}`}>
      {/* Reader Controls Toolbar */}
      <div className="w-full sticky top-0 z-20 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Reader</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-xs opacity-75">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Clean Reader View</span>
          </div>
        </div>

        {/* Reader Customizer */}
        <div className="flex items-center gap-3">
          {/* Font Family Selector */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2 py-1 rounded font-serif ${fontFamily === 'serif' ? 'bg-black/15 dark:bg-white/20 font-bold' : 'opacity-70'}`}
            >
              Serif
            </button>
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2 py-1 rounded font-sans ${fontFamily === 'sans' ? 'bg-black/15 dark:bg-white/20 font-bold' : 'opacity-70'}`}
            >
              Sans
            </button>
            <button
              onClick={() => setFontFamily('mono')}
              className={`px-2 py-1 rounded font-mono ${fontFamily === 'mono' ? 'bg-black/15 dark:bg-white/20 font-bold' : 'opacity-70'}`}
            >
              Mono
            </button>
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-2 py-1 font-bold opacity-75 hover:opacity-100"
              title="Smaller font"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 2))}
              className="px-2 py-1 font-bold opacity-75 hover:opacity-100"
              title="Larger font"
            >
              A+
            </button>
          </div>

          {/* Theme Toggles */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setTheme('dark')}
              className={`w-6 h-6 rounded-full bg-slate-900 border ${theme === 'dark' ? 'ring-2 ring-indigo-500' : 'border-slate-700'}`}
              title="Dark"
            />
            <button
              onClick={() => setTheme('sepia')}
              className={`w-6 h-6 rounded-full bg-[#fbf0d9] border ${theme === 'sepia' ? 'ring-2 ring-amber-700' : 'border-amber-300'}`}
              title="Sepia"
            />
            <button
              onClick={() => setTheme('light')}
              className={`w-6 h-6 rounded-full bg-white border ${theme === 'light' ? 'ring-2 ring-indigo-500' : 'border-slate-300'}`}
              title="Light"
            />
          </div>

          <button
            onClick={copyUrl}
            className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <div className="w-full max-w-2xl px-6 py-10 flex-1">
        {loading ? (
          <div className="space-y-6 animate-pulse py-12">
            <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/3"></div>
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-5/6"></div>
              <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-4/5"></div>
            </div>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <h2 className="text-xl font-bold mb-2">Could Not Parse Article</h2>
            <p className="text-sm opacity-75 mb-4">{error}</p>
            <button
              onClick={onExit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Return to Standard Page
            </button>
          </div>
        ) : data ? (
          <article className={fontClasses[fontFamily]}>
            {/* Metadata Header */}
            <div className="mb-8 pb-6 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs opacity-75 mb-3">
                <span>{data.siteName || new URL(url).hostname}</span>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{data.readingTimeMinutes} min read</span>
                </div>
                <span>·</span>
                <span>{data.wordCount} words</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4 text-balance">
                {data.title}
              </h1>

              {data.author && (
                <div className="text-sm opacity-80 font-medium">
                  By {data.author}
                </div>
              )}
            </div>

            {/* Lead Image */}
            {data.leadImage && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={data.leadImage}
                  alt={data.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[420px] object-cover"
                />
              </div>
            )}

            {/* Article Paragraphs */}
            <div
              className="space-y-6 leading-relaxed"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
            >
              {data.paragraphs.map((p, idx) => (
                <p key={idx} className="tracking-normal">
                  {p}
                </p>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/10 text-xs opacity-60 flex items-center justify-between">
              <span>Read in Aura Browser Reader Mode</span>
              <button
                onClick={onExit}
                className="hover:underline flex items-center gap-1 font-medium"
              >
                <span>View original at {new URL(url).hostname}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
};
