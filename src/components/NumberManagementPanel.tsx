import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Key,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  RefreshCw,
  Plus,
  Zap,
  Save,
  Check,
} from 'lucide-react';
import { Language, SmsApiSettings, VirtualNumberItem } from '../types';
import { translations } from '../utils/translations';
import { generateMockOtp, generateVirtualNumber } from '../utils/generators';

interface NumberManagementPanelProps {
  numbers: VirtualNumberItem[];
  smsSettings: SmsApiSettings;
  lang: Language;
  onUpdateSmsSettings: (settings: SmsApiSettings) => void;
  onAcquireNumber: (country: string, service: string) => void;
  onCancelNumber: (id: string) => void;
  onGenerateMockOtpForNumber: (id: string) => void;
}

export const NumberManagementPanel: React.FC<NumberManagementPanelProps> = ({
  numbers,
  smsSettings,
  lang,
  onUpdateSmsSettings,
  onAcquireNumber,
  onCancelNumber,
  onGenerateMockOtpForNumber,
}) => {
  const t = translations[lang];
  const [localSettings, setLocalSettings] = useState<SmsApiSettings>(smsSettings);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const countries = [
    { name: 'United States', code: 'US', flag: '🇺🇸' },
    { name: 'Bangladesh', code: 'BD', flag: '🇧🇩' },
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
    { name: 'India', code: 'IN', flag: '🇮🇳' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  ];

  const services = [
    'Facebook',
    'WhatsApp',
    'Telegram',
    'Google / Gmail',
    'TikTok',
    'Twitter / X',
    'Custom App',
  ];

  const handleSaveSettings = () => {
    onUpdateSmsSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* API Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">{t.smsServiceTitle}</h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            API Gateway Connected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-xs text-slate-400 font-medium">{t.smsProvider}</label>
            <select
              value={localSettings.provider}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, provider: e.target.value as any })
              }
              className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="sms-activate">SMS-Activate.org API v2</option>
              <option value="5sim">5SIM.net Live Gateway</option>
              <option value="onlinesim">OnlineSim.io REST API</option>
              <option value="textverified">TextVerified Webhook</option>
              <option value="custom">Custom SMS API / Webhook</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">{t.apiUrl}</label>
            <input
              type="text"
              value={localSettings.apiUrl}
              onChange={(e) => setLocalSettings({ ...localSettings, apiUrl: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              placeholder="https://api.sms-activate.org/stubs/handler_api.php"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">{t.apiKey}</label>
            <input
              type="password"
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              placeholder="Enter provider API token..."
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {lang === 'bn'
              ? 'ব্যালেন্স ও রেট লিমিট স্বয়ংক্রিয়ভাবে হ্যান্ডেল করা হয়'
              : 'Auto-fallback enabled: if API times out, fallback mock generator can assist tests'}
          </span>
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? (lang === 'bn' ? 'সংরক্ষিত!' : 'Saved!') : lang === 'bn' ? 'সেটিংস সংরক্ষণ' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Number Procurement & Live Pool */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{t.activeNumbers}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'এপিআই থেকে প্রাপ্ত নম্বর ও লাইভ ওটিপি রিসিভার প্যানেল'
                : 'Acquired virtual phone numbers with live SMS polling and instant OTP capture'}
            </p>
          </div>

          {/* Quick Buy Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={localSettings.selectedCountry}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, selectedCountry: e.target.value })
              }
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>

            <select
              value={localSettings.selectedService}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, selectedService: e.target.value })
              }
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                onAcquireNumber(localSettings.selectedCountry, localSettings.selectedService)
              }
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg shadow transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.buyNumberBtn}</span>
            </button>
          </div>
        </div>

        {/* Numbers Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">{t.phoneNumber}</th>
                <th className="py-2.5 px-3">{t.country}</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">{t.remainingTime}</th>
                <th className="py-2.5 px-3">{t.otpReceived}</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {numbers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {lang === 'bn'
                      ? 'বর্তমানে কোনো সক্রিয় নম্বর নেই। উপরে "নতুন নাম্বার সংগ্রহ করুন" বাটনে ক্লিক করুন।'
                      : 'No active numbers in pool. Click "Acquire New Number" to order from API.'}
                  </td>
                </tr>
              ) : (
                numbers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-cyan-300">
                      <div className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.number}</span>
                        <button
                          onClick={() => handleCopy(item.number, `num-${item.id}`)}
                          className="text-slate-500 hover:text-slate-300"
                          title="Copy phone"
                        >
                          {copiedId === `num-${item.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.country}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {item.service}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 uppercase font-mono text-[10px]">
                      {item.provider} ({item.price})
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.expiresInSeconds}s</span>
                    </td>
                    <td className="py-3 px-3">
                      {item.otpCode ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs rounded">
                            {item.otpCode}
                          </span>
                          <button
                            onClick={() => handleCopy(item.otpCode!, `otp-${item.id}`)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                            title="Copy OTP"
                          >
                            {copiedId === `otp-${item.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>{t.waitingOtp}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!item.otpCode && (
                          <button
                            onClick={() => onGenerateMockOtpForNumber(item.id)}
                            className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-medium text-[11px] border border-amber-500/30 flex items-center gap-1"
                            title="Simulate SMS reception"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Mock OTP</span>
                          </button>
                        )}
                        <button
                          onClick={() => onCancelNumber(item.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded text-[11px] border border-slate-700 hover:border-rose-800"
                        >
                          {t.cancelNumber}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
