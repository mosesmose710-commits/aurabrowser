import React, { useState } from 'react';
import { Download, CheckCircle2, Clock, Trash2, FileCode, Play, Pause, ExternalLink } from 'lucide-react';
import { DownloadItem } from '../../types/browser';

interface DownloadsPageProps {
  downloads: DownloadItem[];
  onClearDownloads: () => void;
  onSimulateDownload: () => void;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({
  downloads,
  onClearDownloads,
  onSimulateDownload,
}) => {
  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center p-6 select-text">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Downloads</h1>
              <p className="text-xs text-slate-400">Files downloaded through Aura Browser</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Simulate Download</span>
            </button>
            {downloads.length > 0 && (
              <button
                onClick={onClearDownloads}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear List</span>
              </button>
            )}
          </div>
        </div>

        {downloads.length > 0 ? (
          <div className="space-y-3">
            {downloads.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {item.filename}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{item.size}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'completed'
                          ? 'bg-emerald-500'
                          : item.status === 'paused'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-sm">{item.url}</span>
                    <span className="capitalize font-medium text-slate-400">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">
            <Download className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">No downloads yet.</p>
            <p className="text-xs text-slate-600 mt-1">
              Downloaded files will show their download progress here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
