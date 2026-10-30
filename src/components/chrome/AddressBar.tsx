import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Star,
  BookOpen,
  Share2,
  Shield,
  Download,
  Terminal,
  MoreVertical,
  Check,
  Search,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  QrCode,
  Globe,
  Sparkles,
  Heart,
  Play,
} from 'lucide-react';
import { Bookmark, DownloadItem, Tab } from '../../types/browser';
import { SSLCertificateModal } from './SSLCertificateModal';

interface AddressBarProps {
  currentTab: Tab;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onToggleReaderMode: () => void;
  onToggleDevTools: () => void;
  isDevToolsOpen: boolean;
  activeDownloadsCount: number;
  onOpenDownloads: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenBookmarks: () => void;
  onOpenExtensions: () => void;
  onOpenArcade: () => void;
  onChangeDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onChangeZoom: (delta: number) => void;
  onNewIncognitoTab: () => void;
  onToggleFullscreen: () => void;
  shieldBlockedCount: number;
  onShowIntro?: () => void;
  onToggleOrdion?: () => void;
  isOrdionOpen?: boolean;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  currentTab,
  onNavigate,
  onBack,
  onForward,
  onReload,
  onHome,
  isBookmarked,
  onToggleBookmark,
  onToggleReaderMode,
  onToggleDevTools,
  isDevToolsOpen,
  activeDownloadsCount,
  onOpenDownloads,
  onOpenSettings,
  onOpenHistory,
  onOpenBookmarks,
  onOpenExtensions,
  onOpenArcade,
  onChangeDeviceMode,
  onChangeZoom,
  onNewIncognitoTab,
  onToggleFullscreen,
  shieldBlockedCount,
  onShowIntro,
  onToggleOrdion,
  isOrdionOpen = false,
}) => {
  const [inputValue, setInputValue] = useState(currentTab.url);
  const [isFocused, setIsFocused] = useState(false);
  const [showSSLModal, setShowSSLModal] = useState(false);
  const [showShieldPopover, setShowShieldPopover] = useState(false);
  const [showMenuPopover, setShowMenuPopover] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(currentTab.url);
  }, [currentTab.url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    inputRef.current?.blur();
    setIsFocused(false);

    // If starts with internal scheme or standard url
    if (query.startsWith('browser://') || query.startsWith('http://') || query.startsWith('https://')) {
      onNavigate(query);
      return;
    }

    // Check if it's a domain name (e.g. "github.com", "news.ycombinator.com", "localhost:3000")
    if (
      (query.includes('.') && !query.includes(' ') && !query.endsWith('.')) ||
      query.startsWith('localhost')
    ) {
      onNavigate(`https://${query}`);
      return;
    }

    // Otherwise treat as search query
    onNavigate(`browser://search?q=${encodeURIComponent(query)}`);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentTab.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Evaluate simple math in address bar
  const mathResult = (() => {
    if (!inputValue || !isFocused) return null;
    const clean = inputValue.trim();
    if (/^[0-9+\-*/^().\s]+$/.test(clean) && /[+\-*/]/.test(clean)) {
      try {
        const val = eval(clean);
        if (typeof val === 'number' && !isNaN(val)) return val;
      } catch {}
    }
    return null;
  })();

  return (
    <div className="h-11 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between gap-2 shrink-0 select-none z-20 relative">
      {/* Navigation History Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onBack}
          disabled={!currentTab.canGoBack}
          className={`p-1.5 rounded-lg transition-colors ${
            currentTab.canGoBack
              ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Back (Alt+Left)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onForward}
          disabled={!currentTab.canGoForward}
          className={`p-1.5 rounded-lg transition-colors ${
            currentTab.canGoForward
              ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Forward (Alt+Right)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onReload}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Reload Page (⌘R)"
        >
          <RotateCw className={`w-3.5 h-3.5 ${currentTab.isLoading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        <button
          onClick={onHome}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Open New Tab Home"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Omnibox (Address & Search Bar) */}
      <div className="flex-1 max-w-3xl relative">
        <form onSubmit={handleSubmit} className="w-full">
          <div
            className={`flex items-center h-8 px-2.5 rounded-xl border transition-all ${
              isFocused
                ? 'bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Security Indicator */}
            <button
              type="button"
              onClick={() => setShowSSLModal(true)}
              className="mr-2 text-emerald-400 hover:text-emerald-300 p-0.5 rounded transition-colors shrink-0"
              title="View Security & Certificate Info"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            {/* URL Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                setTimeout(() => inputRef.current?.select(), 10);
              }}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search or enter web address"
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none font-mono"
            />

            {/* Quick in-Omnibox Actions */}
            <div className="flex items-center gap-1 shrink-0 ml-1 text-slate-400">
              {/* Zoom indicator if zoomed */}
              {currentTab.zoom !== 1 && (
                <button
                  type="button"
                  onClick={() => onChangeZoom(0)} // Reset zoom
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-slate-700"
                  title="Reset Zoom"
                >
                  {Math.round(currentTab.zoom * 100)}%
                </button>
              )}

              {/* Reader Mode Toggle */}
              {!currentTab.url.startsWith('browser://') && (
                <button
                  type="button"
                  onClick={onToggleReaderMode}
                  className={`p-1 rounded transition-colors ${
                    currentTab.readerMode
                      ? 'text-indigo-400 bg-indigo-950/60'
                      : 'hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={currentTab.readerMode ? 'Exit Reader Mode' : 'Toggle Reader Mode'}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Bookmark Star Toggle */}
              <button
                type="button"
                onClick={onToggleBookmark}
                className={`p-1 rounded transition-colors ${
                  isBookmarked
                    ? 'text-amber-400 fill-amber-400'
                    : 'hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this Tab'}
              >
                <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              {/* Copy URL */}
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-1 rounded hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Copy Page URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </form>

        {/* Omnibox Autocomplete Dropdown */}
        {isFocused && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800 text-xs">
            {/* Direct math calculation answer */}
            {mathResult !== null && (
              <div
                onMouseDown={() => {
                  setInputValue(String(mathResult));
                  onNavigate(`browser://search?q=${encodeURIComponent(String(mathResult))}`);
                }}
                className="p-2.5 hover:bg-slate-850 flex items-center justify-between cursor-pointer text-indigo-300"
              >
                <span className="font-mono">{inputValue} =</span>
                <span className="font-bold text-sm font-mono text-emerald-400">{mathResult}</span>
              </div>
            )}

            {/* Search Suggestion */}
            {inputValue && (
              <div
                onMouseDown={() => onNavigate(`browser://search?q=${encodeURIComponent(inputValue)}`)}
                className="p-2.5 hover:bg-slate-850 flex items-center gap-2.5 cursor-pointer text-slate-200"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span>Search DuckDuckGo for "<strong className="text-white">{inputValue}</strong>"</span>
              </div>
            )}

            {/* Ask Ordion AI Suggestion */}
            {inputValue && (
              <div
                onMouseDown={() => {
                  let q = inputValue;
                  if (q.startsWith('@ordion ') || q.startsWith('!ai ') || q.startsWith('@ai ')) {
                    q = q.replace(/^(@ordion|!ai|@ai)\s+/, '');
                  }
                  onNavigate(`browser://ordion?q=${encodeURIComponent(q)}`);
                }}
                className="p-2.5 hover:bg-slate-850 flex items-center justify-between cursor-pointer text-sky-300 bg-sky-950/20"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">Ask Ordion AI: "<strong className="text-white">{inputValue}</strong>"</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0 ml-2">
                  Fast Hybrid
                </span>
              </div>
            )}

            {/* Wikipedia Direct Suggestion */}
            {inputValue && !inputValue.startsWith('browser://') && (
              <div
                onMouseDown={() => onNavigate(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(inputValue)}`)}
                className="p-2.5 hover:bg-slate-850 flex items-center gap-2.5 cursor-pointer text-slate-300"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Search Wikipedia for "{inputValue}"</span>
              </div>
            )}

            {/* Quick Internal Browser Shortcuts */}
            <div className="p-2 bg-slate-950/60 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
              <span className="text-slate-500 font-semibold">Shortcuts:</span>
              <button
                onMouseDown={() => onNavigate('browser://ordion')}
                className="text-sky-400 font-bold hover:text-sky-300 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                Ordion AI
              </button>
              <span>·</span>
              <button
                onMouseDown={() => onNavigate('browser://newtab')}
                className="hover:text-indigo-300 hover:underline"
              >
                New Tab
              </button>
              <span>·</span>
              <button
                onMouseDown={() => onNavigate('browser://scratchpad')}
                className="hover:text-indigo-300 hover:underline"
              >
                Dev Scratchpad
              </button>
              <span>·</span>
              <button
                onMouseDown={() => onNavigate('browser://hackernews')}
                className="hover:text-indigo-300 hover:underline"
              >
                Hacker News
              </button>
              <span>·</span>
              <button
                onMouseDown={() => onNavigate('browser://arcade')}
                className="hover:text-indigo-300 hover:underline"
              >
                Arcade
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Browser Toolbar Right Actions */}
      <div className="flex items-center gap-1 shrink-0 text-slate-300">
        {/* AdShield Blocker Button */}
        <div className="relative">
          <button
            onClick={() => setShowShieldPopover(!showShieldPopover)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-emerald-400 transition-colors"
            title="Aura Privacy Shield"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono tabular-nums">{shieldBlockedCount}</span>
          </button>

          {/* Shield Popover */}
          {showShieldPopover && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Aura Shield Active</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                  ON
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                Intrusive ads, telemetry pixels, and tracking cookies blocked on this domain.
              </p>
              <div className="p-2.5 bg-slate-950 rounded-lg flex items-center justify-between font-mono">
                <span className="text-slate-400">Trackers Blocked:</span>
                <span className="font-bold text-emerald-400">{shieldBlockedCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Viewport Device Mode Toggle (Desktop / Tablet / Mobile) */}
        <div className="flex items-center bg-slate-800/60 rounded-lg p-0.5 text-slate-400">
          <button
            onClick={() => onChangeDeviceMode('desktop')}
            className={`p-1 rounded ${currentTab.deviceMode === 'desktop' ? 'bg-slate-700 text-white' : 'hover:text-slate-200'}`}
            title="Desktop Mode (100%)"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeDeviceMode('tablet')}
            className={`p-1 rounded ${currentTab.deviceMode === 'tablet' ? 'bg-slate-700 text-white' : 'hover:text-slate-200'}`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeDeviceMode('mobile')}
            className={`p-1 rounded ${currentTab.deviceMode === 'mobile' ? 'bg-slate-700 text-white' : 'hover:text-slate-200'}`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Downloads Button */}
        <button
          onClick={onOpenDownloads}
          className="relative p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          title="Downloads Manager"
        >
          <Download className="w-3.5 h-3.5" />
          {activeDownloadsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          )}
        </button>



        {/* Ordion AI Toggle Button */}
        <button
          onClick={onToggleOrdion}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-semibold ${
            isOrdionOpen
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 ring-1 ring-sky-400'
              : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:border-sky-400/50'
          }`}
          title="Toggle Ordion Hybrid AI (Alt+O)"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
          <span className="font-bold">Ordion</span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-500/20 hidden md:inline">
            AI
          </span>
        </button>

        {/* DevTools Toggle Button */}
        <button
          onClick={onToggleDevTools}
          className={`p-1.5 rounded-lg transition-colors ${
            isDevToolsOpen
              ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
          title="Toggle DevTools (F12)"
        >
          <Terminal className="w-3.5 h-3.5" />
        </button>

        {/* More Options / Hamburger Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenuPopover(!showMenuPopover)}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            title="Customize and control Aura"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showMenuPopover && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  onNewIncognitoTab();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between text-slate-200"
              >
                <span>New Incognito Window</span>
                <span className="text-[10px] text-slate-500 font-mono">⌘⇧N</span>
              </button>

              <div className="my-1 border-t border-slate-800" />

              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  onOpenHistory();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200"
              >
                History
              </button>
              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  onOpenBookmarks();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200"
              >
                Bookmarks
              </button>
              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  onOpenDownloads();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200"
              >
                Downloads
              </button>
              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  onOpenExtensions();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200"
              >
                Extensions
              </button>
              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  onOpenArcade();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200"
              >
                Arcade Games
              </button>

              <div className="my-1 border-t border-slate-800" />

              {/* Zoom Controls */}
              <div className="px-3 py-1.5 flex items-center justify-between text-slate-300">
                <span>Zoom</span>
                <div className="flex items-center gap-1 font-mono">
                  <button
                    onClick={() => onChangeZoom(-0.1)}
                    className="p-1 hover:bg-slate-800 rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] px-1">{Math.round(currentTab.zoom * 100)}%</span>
                  <button
                    onClick={() => onChangeZoom(0.1)}
                    className="p-1 hover:bg-slate-800 rounded"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  onToggleFullscreen();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between text-slate-200"
              >
                <span>Fullscreen</span>
                <Maximize2 className="w-3 h-3 text-slate-500" />
              </button>

              <div className="my-1 border-t border-slate-800" />

              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  onOpenSettings();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200"
              >
                Settings
              </button>



              {onShowIntro && (
                <button
                  onClick={() => {
                    setShowMenuPopover(false);
                    onShowIntro();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-950/40 text-indigo-300 font-semibold flex items-center justify-between"
                >
                  <span>Welcome Intro</span>
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SSL Certificate Inspector Modal */}
      <SSLCertificateModal
        url={currentTab.url}
        isOpen={showSSLModal}
        onClose={() => setShowSSLModal(false)}
      />
    </div>
  );
};
