import React from 'react';
import { Settings, Moon, Shield, Search, Layout, Check, Palette, Database } from 'lucide-react';
import { BrowserSettings } from '../../types/browser';

interface SettingsPageProps {
  settings: BrowserSettings;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
  onClearBrowserData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onClearBrowserData,
}) => {
  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center p-6 select-text">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Browser Settings</h1>
            <p className="text-xs text-slate-400">Customize Aura Browser appearance, privacy, and defaults</p>
          </div>
        </div>

        {/* Tab Layout Preference */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Layout className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Tab Layout Style</h2>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Choose between traditional top horizontal tabs or modern Arc/Zen style vertical sidebar tabs.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              onClick={() => onUpdateSettings({ tabLayout: 'horizontal' })}
              className={`p-3 rounded-xl border text-left transition-all ${
                settings.tabLayout === 'horizontal'
                  ? 'border-indigo-500 bg-indigo-950/20 text-white ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-semibold mb-1">Horizontal Tabs</div>
              <div className="text-[11px] text-slate-500">Classic top browser tab strip</div>
            </button>
            <button
              onClick={() => onUpdateSettings({ tabLayout: 'vertical' })}
              className={`p-3 rounded-xl border text-left transition-all ${
                settings.tabLayout === 'vertical'
                  ? 'border-indigo-500 bg-indigo-950/20 text-white ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-semibold mb-1">Vertical Tabs</div>
              <div className="text-[11px] text-slate-500">Sleek sidebar navigation tabs</div>
            </button>
          </div>
        </div>

        {/* Default Search Engine */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Default Search Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            The search engine queried when entering terms into the address bar omnibox.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            {(['duckduckgo', 'wikipedia', 'google'] as const).map((eng) => (
              <button
                key={eng}
                onClick={() => onUpdateSettings({ searchEngine: eng })}
                className={`p-2.5 rounded-xl border text-center capitalize transition-all ${
                  settings.searchEngine === eng
                    ? 'border-indigo-500 bg-indigo-950/30 text-white font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs">{eng}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Security Shield */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Aura Shield & Privacy</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Built-in protection against cross-site trackers, coin miners, and ad telemetry scripts.
          </p>
          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
            <div>
              <div className="text-xs font-medium text-slate-200">Trackers & Ad Blocker</div>
              <div className="text-[11px] text-slate-500">
                Currently blocked: {settings.trackersBlockedCount} trackers
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.shieldEnabled}
              onChange={(e) => onUpdateSettings({ shieldEnabled: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-medium text-slate-200">Always Require HTTPS</div>
              <div className="text-[11px] text-slate-500">
                Automatically upgrades unencrypted HTTP connections to HTTPS
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.httpsOnly}
              onChange={(e) => onUpdateSettings({ httpsOnly: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Clear Browsing Data */}
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-semibold text-white">Clear Browsing Data</h2>
            </div>
            <p className="text-xs text-slate-400">
              Clear browsing history, cache, download history, and temporary cookies.
            </p>
          </div>
          <button
            onClick={onClearBrowserData}
            className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-semibold rounded-lg transition-colors shrink-0 ml-4"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
};
