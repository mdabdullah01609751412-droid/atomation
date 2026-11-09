import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  lang: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running standalone as an installed APK / PWA, don't show prompt
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowGuide(true);
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
        title="Install on Android Phone"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">
          {lang === 'bn' ? 'মোবাইলে ইনস্টল' : 'Install on Android'}
        </span>
      </button>

      {/* Android / iOS Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  {lang === 'bn' ? 'অ্যান্ড্রয়েড মোবাইলে অ্যাপ ইনস্টল' : 'Install on Android Phone'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {lang === 'bn' ? 'যেকোনো স্মার্টফোনে অ্যাপের মতো চালান' : 'Run like a native app on any phone'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 py-2">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0">
                  ১
                </span>
                <p className="text-slate-300">
                  মোবাইলের ক্রোম (Chrome) ব্রাউজারের উপরে ডানদিকের <strong>থ্রি-ডট মেনু (⋮)</strong> চাপুন।
                </p>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0">
                  ২
                </span>
                <p className="text-slate-300">
                  <strong>&quot;Install app&quot;</strong> বা <strong>&quot;Add to Home screen&quot;</strong> অপশনে ট্যাপ করুন।
                </p>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0">
                  ৩
                </span>
                <p className="text-slate-300">
                  আপনার মোবাইলের হোম স্ক্রিনে <strong>MasterPC</strong> অ্যাপ আইকন তৈরি হয়ে যাবে!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
            >
              {lang === 'bn' ? 'ঠিক আছে' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
