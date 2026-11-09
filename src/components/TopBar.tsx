import React from 'react';
import {
  Monitor,
  PhoneCall,
  UserCheck,
  Shield,
  KeyRound,
  Database,
  FileSpreadsheet,
  Terminal,
  AlertOctagon,
  Radio,
  Layers,
  LayoutDashboard,
  Globe,
  Cpu,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  broadcastActive: boolean;
  setBroadcastActive: (active: boolean) => void;
  onEmergencyStop: () => void;
  isEmergencyStopped: boolean;
  activeEmulatorsCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  broadcastActive,
  setBroadcastActive,
  onEmergencyStop,
  isEmergencyStopped,
  activeEmulatorsCount,
}) => {
  const t = translations[lang];

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'emulators', label: t.navEmulators, icon: Monitor, badge: activeEmulatorsCount },
    { id: 'numbers', label: t.navNumbers, icon: PhoneCall },
    { id: 'workflow', label: t.navWorkflow, icon: UserCheck },
    { id: 'proxy', label: t.navProxy, icon: Shield },
    { id: 'captcha', label: t.navCaptcha, icon: KeyRound },
    { id: 'storage', label: t.navStorage, icon: Database },
    { id: 'sheets', label: t.navSheets, icon: FileSpreadsheet },
    { id: 'adb', label: t.navAdb, icon: Terminal },
    { id: 'bridge', label: lang === 'bn' ? 'লোকাল ব্রিজ (PC)' : 'Local Bridge (PC)', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Top Banner / Emergency Alert if active */}
      {isEmergencyStopped && (
        <div className="bg-rose-950/90 border-b border-rose-500/50 px-4 py-1.5 text-center text-xs font-semibold text-rose-200 flex items-center justify-center gap-2 animate-pulse">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>{t.emergencyStopped}</span>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                {t.appTitle}
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                PRO v3.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean buttons) */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Master Broadcast Toggle */}
          <button
            onClick={() => setBroadcastActive(!broadcastActive)}
            title={t.broadcastActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              broadcastActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${broadcastActive ? 'animate-pulse text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">{t.broadcastMode}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setLang('bn')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                lang === 'bn' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                lang === 'en' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* EMERGENCY STOP BUTTON */}
          <button
            onClick={onEmergencyStop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-600/30 transition-all uppercase tracking-wider shrink-0"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{t.emergencyStop}</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Scroll */}
      <div className="xl:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-800/80 bg-slate-950/60 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
