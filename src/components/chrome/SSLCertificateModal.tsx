import React from 'react';
import { Lock, ShieldCheck, X, Key, Globe, CheckCircle2 } from 'lucide-react';

interface SSLCertificateModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SSLCertificateModal: React.FC<SSLCertificateModalProps> = ({ url, isOpen, onClose }) => {
  if (!isOpen) return null;

  const domain = (() => {
    try {
      if (url.startsWith('browser://')) return 'Aura Internal Browser System';
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  const isInternal = url.startsWith('browser://');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-text">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Connection is Secure</h3>
              <p className="text-[11px] text-slate-400">{domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Details */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-300">Valid Digital Certificate</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isInternal
                  ? 'Internal browser scheme with end-to-end sandbox isolation and zero external telemetry.'
                  : 'Your information (passwords, credit card numbers, personal data) is private when sent to this site.'}
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-3">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Common Name:</span>
              <span className="font-mono text-slate-200">{domain}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Issuer:</span>
              <span className="text-slate-200">
                {isInternal ? 'Aura Root Authority' : 'GlobalSign TLS CA / Let’s Encrypt'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Protocol:</span>
              <span className="font-mono text-emerald-400">TLS 1.3 / HTTP/2</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Cipher Suite:</span>
              <span className="font-mono text-slate-300">AES_256_GCM (256-bit Key)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Cookie Privacy:</span>
              <span className="text-slate-200">Strict SameSite & HttpOnly Enforced</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
