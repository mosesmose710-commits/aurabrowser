import React, { useState } from 'react';
import { Puzzle, ShieldCheck, ToggleLeft, ToggleRight, Check, Sparkles } from 'lucide-react';
import { BrowserExtension } from '../../types/browser';

interface ExtensionsPageProps {
  extensions: BrowserExtension[];
  onToggleExtension: (id: string) => void;
}

export const ExtensionsPage: React.FC<ExtensionsPageProps> = ({
  extensions,
  onToggleExtension,
}) => {
  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center p-6 select-text">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Puzzle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Extensions & Add-ons</h1>
            <p className="text-xs text-slate-400">
              Manage installed adblockers, scripts, and productivity tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {extensions.map((ext) => (
            <div
              key={ext.id}
              className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ext.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{ext.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>v{ext.version}</span>
                        <span>·</span>
                        <span>{ext.author}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleExtension(ext.id)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {ext.enabled ? (
                      <ToggleRight className="w-8 h-8 text-indigo-400 fill-indigo-400/20" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {ext.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                {ext.stats ? (
                  <span className="text-[11px] font-mono text-emerald-400">{ext.stats}</span>
                ) : (
                  <span className="text-[11px] text-slate-500">Standard privileges</span>
                )}
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    ext.enabled
                      ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/50'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {ext.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
