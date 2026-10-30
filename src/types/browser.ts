export type BrowserInternalScheme =
  | 'browser://newtab'
  | 'browser://search'
  | 'browser://hackernews'
  | 'browser://arcade'
  | 'browser://history'
  | 'browser://bookmarks'
  | 'browser://downloads'
  | 'browser://extensions'
  | 'browser://settings'
  | 'browser://scratchpad'
  | 'browser://devtools';

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  history: string[];
  historyIndex: number;
  pinned: boolean;
  isMuted: boolean;
  zoom: number; // 0.5 to 2.0 (1 = 100%)
  readerMode: boolean;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  searchQuery?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  folder?: string;
  dateAdded: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  timestamp: number;
}

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  size: string;
  progress: number; // 0 to 100
  status: 'downloading' | 'completed' | 'paused' | 'failed';
  date: number;
}

export interface BrowserExtension {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
  icon: string;
  badge?: string;
  stats?: string;
}

export interface NetworkLog {
  id: string;
  timestamp: string;
  url: string;
  method: string;
  status: number;
  type: string;
  size: string;
  timeMs: number;
}

export interface ConsoleLog {
  id: string;
  timestamp: string;
  type: 'log' | 'info' | 'warn' | 'error';
  content: string;
}

export interface BrowserSettings {
  theme: 'dark' | 'light' | 'slate' | 'cyber';
  accentColor: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  searchEngine: 'duckduckgo' | 'wikipedia' | 'google';
  tabLayout: 'horizontal' | 'vertical';
  newTabWallpaper: 'gradient' | 'minimal' | 'cosmic' | 'sunset' | 'grid';
  shieldEnabled: boolean;
  trackersBlockedCount: number;
  httpsOnly: boolean;
  hardwareAcceleration: boolean;
  readerFont: 'sans' | 'serif' | 'mono';
  readerFontSize: number;
}
