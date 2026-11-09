import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Mail,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Send,
  Zap,
} from 'lucide-react';
import { AccountProfile, GoogleSheetsConfig, Language } from '../types';
import { translations } from '../utils/translations';

interface GoogleSheetsPanelProps {
  config: GoogleSheetsConfig;
  profiles: AccountProfile[];
  lang: Language;
  onUpdateConfig: (config: GoogleSheetsConfig) => void;
  onTriggerSync: () => void;
}

export const GoogleSheetsPanel: React.FC<GoogleSheetsPanelProps> = ({
  config,
  profiles,
  lang,
  onUpdateConfig,
  onTriggerSync,
}) => {
  const t = translations[lang];
  const [localConfig, setLocalConfig] = useState<GoogleSheetsConfig>(config);
  const [activeTabPreview, setActiveTabPreview] = useState<'success' | 'failed'>('success');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const successfulProfiles = profiles.filter((p) => p.status === 'successful');
  const failedProfiles = profiles.filter((p) => p.status === 'failed');

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    setTimeout(() => {
      onTriggerSync();
      setIsSyncing(false);
      setSyncFeedback(
        `${successfulProfiles.length} Successful & ${failedProfiles.length} Failed records synchronized to Google Sheets!`
      );
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 800);
  };

  const handleSaveConfig = () => {
    onUpdateConfig(localConfig);
    setSyncFeedback('Google Sheets configuration saved successfully!');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">{t.sheetsTitle}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn'
                ? 'গুগল শিটসে সফল ও ব্যর্থ অ্যাকাউন্টের ডাটা রিয়েল-টাইমে বা ১-ক্লিকে সিঙ্ক করুন'
                : 'Automated two-way report delivery to Google Sheets with dedicated Success and Failed tabs'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={config.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <span>{t.openInGoogleSheets}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-600/20 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{t.syncNowBtn}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {syncFeedback && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 font-medium">{t.sheetsUrl}</label>
            <input
              type="text"
              value={localConfig.sheetUrl}
              onChange={(e) => {
                const url = e.target.value;
                const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
                const spreadsheetId = match ? match[1] : localConfig.spreadsheetId;
                setLocalConfig({ ...localConfig, sheetUrl: url, spreadsheetId });
              }}
              className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">{t.adminEmail}</label>
            <div className="relative mt-1">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="email"
                value={localConfig.adminEmail}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, adminEmail: e.target.value })
                }
                className="pl-8 pr-3 py-2 w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                placeholder="mdabdullah01609751412@gmail.com"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div>
            <label className="text-xs text-slate-400 font-medium">Successful Tab Name</label>
            <input
              type="text"
              value={localConfig.successTabName}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, successTabName: e.target.value })
              }
              className="mt-1 w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Failed Tab Name</label>
            <input
              type="text"
              value={localConfig.failedTabName}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, failedTabName: e.target.value })
              }
              className="mt-1 w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-5">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localConfig.autoSync}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, autoSync: e.target.checked })
                }
                className="rounded accent-emerald-500"
              />
              <span>{t.autoSyncToggle}</span>
            </label>
            <button
              onClick={handleSaveConfig}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded border border-slate-700 font-semibold"
            >
              Save Config
            </button>
          </div>
        </div>
      </div>

      {/* Live Google Sheets Spreadsheet Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Google Sheets Tabular View Preview</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live representation of the connected Google Spreadsheet tabs
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTabPreview('success')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition-colors ${
                activeTabPreview === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {config.successTabName} ({successfulProfiles.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTabPreview('failed')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition-colors ${
                activeTabPreview === 'failed'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {config.failedTabName} ({failedProfiles.length})
              </span>
            </button>
          </div>
        </div>

        {/* Spreadsheet Grid Simulation */}
        <div className="mt-4 overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3 border-r border-slate-800/80 w-12 text-center text-slate-500">
                  #
                </th>
                <th className="py-2 px-3 border-r border-slate-800/80">A: Test_ID</th>
                <th className="py-2 px-3 border-r border-slate-800/80">B: Full_Name</th>
                <th className="py-2 px-3 border-r border-slate-800/80">C: Age (25-30)</th>
                <th className="py-2 px-3 border-r border-slate-800/80">D: Phone_Number</th>
                <th className="py-2 px-3 border-r border-slate-800/80">E: Password</th>
                <th className="py-2 px-3 border-r border-slate-800/80">F: Proxy_IP</th>
                <th className="py-2 px-3 border-r border-slate-800/80">G: Emulator</th>
                <th className="py-2 px-3">
                  {activeTabPreview === 'success' ? 'H: Verification_Status' : 'H: Failure_Reason'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {(activeTabPreview === 'success' ? successfulProfiles : failedProfiles).length ===
              0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No rows currently in this tab
                  </td>
                </tr>
              ) : (
                (activeTabPreview === 'success' ? successfulProfiles : failedProfiles).map(
                  (p, idx) => (
                    <tr
                      key={p.id}
                      className={
                        activeTabPreview === 'success'
                          ? 'hover:bg-emerald-950/20'
                          : 'hover:bg-rose-950/20'
                      }
                    >
                      <td className="py-2.5 px-3 border-r border-slate-800/80 text-center text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/80 text-cyan-300">
                        {p.testId}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/80 text-slate-200">
                        {p.fullName}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/80 text-slate-300">
                        {p.age}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/80 text-emerald-400">
                        {p.phone || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/80 text-slate-400">
                        ••••••••••••
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/80 text-slate-400">
                        {p.proxyUsed}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/80 text-slate-400">
                        {p.emulatorId}
                      </td>
                      <td className="py-2.5 px-3">
                        {activeTabPreview === 'success' ? (
                          <span className="text-emerald-400 font-semibold">VERIFIED_ACTIVE</span>
                        ) : (
                          <span className="text-rose-400">{p.errorReason || 'Timeout'}</span>
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
