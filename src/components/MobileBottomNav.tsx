import React from 'react';
import {
  LayoutDashboard,
  Monitor,
  PhoneCall,
  UserCheck,
  FileSpreadsheet,
  Menu,
  Shield,
  KeyRound,
  Database,
  Terminal,
  Cpu,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  onOpenMoreMenu: () => void;
  activeEmulatorsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  lang,
  onOpenMoreMenu,
  activeEmulatorsCount,
}) => {
  const t = translations[lang];

  const primaryItems = [
    { id: 'dashboard', label: lang === 'bn' ? 'হোম' : 'Home', icon: LayoutDashboard },
    { id: 'emulators', label: lang === 'bn' ? 'স্ক্রিন' : 'Screens', icon: Monitor, badge: activeEmulatorsCount },
    { id: 'numbers', label: lang === 'bn' ? 'নাম্বার' : 'Number', icon: PhoneCall },
    { id: 'workflow', label: lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account', icon: UserCheck },
    { id: 'sheets', label: lang === 'bn' ? 'শিটস' : 'Sheets', icon: FileSpreadsheet },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 select-none">
      <div className="flex items-center justify-around">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 relative transition-all min-w-[56px] ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-cyan-400' : 'text-slate-400'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-cyan-500 text-slate-950 font-bold text-[9px] rounded-full font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'text-cyan-300 font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Drawer Button */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center py-1 px-2 relative transition-all min-w-[56px] ${
            ['proxy', 'captcha', 'storage', 'adb', 'bridge'].includes(activeTab)
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {lang === 'bn' ? 'আরও' : 'More'}
          </span>
        </button>
      </div>
    </nav>
  );
};
