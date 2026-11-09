import React from 'react';
import {
  X,
  Shield,
  KeyRound,
  Database,
  Terminal,
  Cpu,
  Smartphone,
  AlertOctagon,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  onEmergencyStop: () => void;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  lang,
  onEmergencyStop,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const menuSections = [
    { id: 'proxy', label: t.navProxy, desc: 'VPN & SOCKS5 Proxy Manager', icon: Shield },
    { id: 'captcha', label: t.navCaptcha, desc: 'Mock OTP & CAPTCHA Solver Engine', icon: KeyRound },
    { id: 'storage', label: t.navStorage, desc: 'Accounts Database, CSV & JSON Backup', icon: Database },
    { id: 'adb', label: t.navAdb, desc: 'Master ADB Shell Terminal & Macros', icon: Terminal },
    { id: 'bridge', label: lang === 'bn' ? 'লোকাল ব্রিজ (PC)' : 'Local PC Bridge (Hardware)', desc: 'Connect to real emulators via WebSocket', icon: Cpu },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">
              {lang === 'bn' ? 'সকল টুলস ও কনফিগারেশন' : 'All Tools & Settings'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="divide-y divide-slate-800/80 my-3">
          {menuSections.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full py-3 px-2 flex items-center gap-3 text-left transition-colors rounded-xl ${
                  isActive ? 'bg-slate-800 text-cyan-300' : 'text-slate-200 hover:bg-slate-850'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-[11px] text-slate-400 truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Emergency Stop */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              onEmergencyStop();
            }}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{t.emergencyStop} (EMERGENCY HALT)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
