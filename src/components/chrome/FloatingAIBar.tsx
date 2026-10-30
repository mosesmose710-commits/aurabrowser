import React from 'react';
import { Sparkles, Bot, Mic } from 'lucide-react';

interface FloatingAIBarProps {
  onOpenOrdion: () => void;
  isOrdionOpen: boolean;
}

export const FloatingAIBar: React.FC<FloatingAIBarProps> = ({
  onOpenOrdion,
  isOrdionOpen,
}) => {
  if (isOrdionOpen) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl transition-all hover:border-slate-600 hover:scale-[1.01]">
      {/* Quick Ask Ordion Button */}
      <button
        onClick={onOpenOrdion}
        className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs group cursor-pointer"
        title="Open Ordion Hybrid AI (Alt+O)"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-400 p-[1px] shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-sky-400 group-hover:rotate-12 transition-transform" />
          </div>
        </div>
        <span className="font-medium">Message Ordion AI...</span>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
          /
        </span>
      </button>
    </div>
  );
};
