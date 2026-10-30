import React, { useState, useEffect } from 'react';
import { ArrowRight, Compass, Shield, Terminal, Zap, Sparkles, CheckCircle2, Code2, ExternalLink, Heart, Smartphone } from 'lucide-react';
import mosesExactPhoto from '../assets/images/moses_exact_portrait_1791100364867.jpg';

interface WelcomeIntroProps {
  onStart: () => void;
  onDismissForever?: () => void;
  onOpenSupport?: () => void;
}

export const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ onStart, onOpenSupport }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  const handleEnter = () => {
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl select-none px-4 py-6 text-slate-100 overflow-y-auto">
      {/* Background ambient glow and grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.22),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Main Container Card */}
      <div
        className={`relative z-10 max-w-2xl w-full text-center transition-all duration-700 transform my-auto ${
          mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
        }`}
      >
        {/* Brand Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold tracking-widest uppercase mb-4 shadow-sm shadow-blue-500/10">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>MOSESTECH ECOSYSTEM</span>
        </div>

        {/* Hero Photo Card of Moses - Exactly Maintaining Image & Face */}
        <div className="relative mx-auto w-full max-w-xl mb-6 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 rounded-3xl blur-md opacity-45 group-hover:opacity-65 transition duration-500" />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden flex flex-col sm:flex-row items-center gap-5 text-left">
            {/* Image Container with Exact Photo */}
            <div className="relative w-44 h-56 sm:w-48 sm:h-60 rounded-xl overflow-hidden shrink-0 border-2 border-blue-500/40 bg-slate-950 shadow-xl">
              <img
                src={mosesExactPhoto}
                onError={(e) => {
                  e.currentTarget.src = "/moses_profile.jpg";
                }}
                alt="Moses - Programmer & Founder at Mosestech"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-2 left-2 bg-slate-950/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-sky-400 border border-sky-500/30 flex items-center gap-1.5 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>&lt;/&gt; PROGRAMMER</span>
              </div>
            </div>

            {/* Profile & Tech Bio info exactly reflecting the photo */}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  Lead Software Engineer
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">Founder</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Moses
              </h3>
              <p className="text-xs text-slate-300 italic mb-2.5 font-medium">
                "Not just writing code, but building my future."
              </p>

              {/* Technologies from photo */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-slate-300 mb-3">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 font-semibold">
                  Python
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                  JavaScript
                </span>
                <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-300 font-semibold">
                  HTML5
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 font-semibold">
                  CSS3
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                  SQL
                </span>
              </div>

              {/* Belief statement and Moses Genuine Family info */}
              <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-sky-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Better Code · Bigger Dreams</span>
                </div>
                <div className="text-[10px] text-slate-300 font-mono pt-1 border-t border-slate-800/80">
                  <span>Brothers: <strong>Felix, Ibrahim</strong> · Sister: <strong className="text-rose-300">Dinah</strong> · Parents: <strong>John, Peris</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Big Intro Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-none">
          WELCOME TO <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">MOSESTECH THEORY</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6 font-normal leading-relaxed">
          Next-generation intelligent web browser engineered by Moses. Equipped with Ordion AI co-pilot, high-speed engine, and zero ads.
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-left">
          <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Compass className="w-3.5 h-3.5 text-sky-400 mb-1" />
            <div className="text-xs font-semibold text-white">Ultra Fast</div>
            <div className="text-[10px] text-slate-400">High-Speed Engine</div>
          </div>

          <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-amber-400 mb-1" />
            <div className="text-xs font-semibold text-white">Ordion AI</div>
            <div className="text-[10px] text-slate-400">Hybrid Co-Pilot</div>
          </div>

          <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Terminal className="w-3.5 h-3.5 text-emerald-400 mb-1" />
            <div className="text-xs font-semibold text-white">DevTools</div>
            <div className="text-[10px] text-slate-400">Console & Scratchpad</div>
          </div>

          <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Shield className="w-3.5 h-3.5 text-blue-400 mb-1" />
            <div className="text-xs font-semibold text-white">100% Ad-Free</div>
            <div className="text-[10px] text-slate-400">Pure Clean Web</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleEnter}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Launch XENON Browser</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* System Specs Footer */}
        <div className="mt-6 pt-3 border-t border-slate-900/80 text-[11px] font-mono text-slate-500 flex items-center justify-center gap-4">
          <span>XENON OS v3.0</span>
          <span>·</span>
          <span>ONLINE</span>
          <span>·</span>
          <span>PRESS ENTER TO START</span>
        </div>
      </div>
    </div>
  );
};
