import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  Trash2,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { AccountProfile, GoogleSheetsConfig, Language } from '../types';
import { translations } from '../utils/translations';
import { exportDatabaseBackup, exportToCsv, findDuplicates } from '../utils/storage';

interface DataStoragePanelProps {
  profiles: AccountProfile[];
  sheetsConfig: GoogleSheetsConfig;
  lang: Language;
  onDeleteProfile: (id: string) => void;
  onClearAllProfiles: () => void;
  onRestoreBackup: (importedProfiles: AccountProfile[]) => void;
  onCleanDuplicates: (idsToRemove: string[]) => void;
}

export const DataStoragePanel: React.FC<DataStoragePanelProps> = ({
  profiles,
  sheetsConfig,
  lang,
  onDeleteProfile,
  onClearAllProfiles,
  onRestoreBackup,
  onCleanDuplicates,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filterStatus, setFilterStatus] = useState<'all' | 'successful' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const duplicateInfo = findDuplicates(profiles);

  const filteredProfiles = profiles.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.testId.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.profiles)) {
          onRestoreBackup(parsed.profiles);
        } else if (Array.isArray(parsed)) {
          onRestoreBackup(parsed);
        }
      } catch (err) {
        alert('Invalid JSON backup file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Storage Overview & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">{t.storageTitle}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn'
                ? 'অনুমোদিত টেস্ট আইডি, পাসওয়ার্ড, ফোন নম্বর এবং সম্পূর্ণ হিস্ট্রি সংরক্ষণ'
                : 'Local persistent SQLite/IndexedDB encrypted storage for automation outputs'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToCsv(profiles)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.exportCsv}</span>
            </button>

            <button
              onClick={() => exportDatabaseBackup(profiles, sheetsConfig)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.backupDatabase}</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.restoreDatabase}</span>
            </button>
          </div>
        </div>

        {/* Duplicate Detection Alert Box */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle
              className={`w-4 h-4 ${
                duplicateInfo.duplicateIds.length > 0 ? 'text-amber-400' : 'text-slate-500'
              }`}
            />
            <span className="text-xs text-slate-300">
              {duplicateInfo.duplicateIds.length > 0
                ? `${t.duplicatesFound}: ${duplicateInfo.duplicatePhoneCount} Phone / ${duplicateInfo.duplicateNameCount} Name matches`
                : t.noDuplicates}
            </span>
          </div>

          {duplicateInfo.duplicateIds.length > 0 && (
            <button
              onClick={() => onCleanDuplicates(duplicateInfo.duplicateIds)}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors"
            >
              {t.cleanDuplicates} ({duplicateInfo.duplicateIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Records Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          {/* Segmented Filter */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filterStatus === 'all'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records ({profiles.length})
            </button>
            <button
              onClick={() => setFilterStatus('successful')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filterStatus === 'successful'
                  ? 'bg-slate-800 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Successful ({profiles.filter((p) => p.status === 'successful').length})
            </button>
            <button
              onClick={() => setFilterStatus('failed')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filterStatus === 'failed'
                  ? 'bg-slate-800 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Failed ({profiles.filter((p) => p.status === 'failed').length})
            </button>
          </div>

          {/* Search & Password Visibility */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, ID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
              />
            </div>

            <button
              onClick={() => setShowPasswords(!showPasswords)}
              title={showPasswords ? t.hidePassword : t.showPassword}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 transition-colors"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Stored Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Test ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Age (25-30)</th>
                <th className="py-2.5 px-3">Phone Number</th>
                <th className="py-2.5 px-3">Password</th>
                <th className="py-2.5 px-3">Assigned Node</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No matching records found
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-cyan-300">{p.testId}</td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      <div>{p.fullName}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.email}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">{p.age} yrs</td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span>{p.phone || 'N/A'}</span>
                        {p.phone && (
                          <button
                            onClick={() => handleCopy(p.phone, `ph-${p.id}`)}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            {copiedId === `ph-${p.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {showPasswords ? p.password : '••••••••••••'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {p.emulatorId}
                    </td>
                    <td className="py-3 px-3">
                      {p.status === 'successful' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          SUCCESS
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium"
                          title={p.errorReason}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteProfile(p.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
