import React, { useState } from 'react';
import {
  Monitor,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Search,
  Activity,
  Cpu,
  HardDrive,
  Trash2,
  Download,
  Terminal,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { EmulatorDevice, Language, LogEntry, TaskQueueItem } from '../types';
import { translations } from '../utils/translations';

interface DashboardOverviewProps {
  emulators: EmulatorDevice[];
  logs: LogEntry[];
  tasks: TaskQueueItem[];
  successCount: number;
  failedCount: number;
  totalProcessed: number;
  lang: Language;
  onAutoDetect: () => void;
  onConnectAll: () => void;
  onDisconnectAll: () => void;
  onStartBatchWorkflow: () => void;
  onClearLogs: () => void;
  onExportLogs: () => void;
  onSwitchTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  emulators,
  logs,
  tasks,
  successCount,
  failedCount,
  totalProcessed,
  lang,
  onAutoDetect,
  onConnectAll,
  onDisconnectAll,
  onStartBatchWorkflow,
  onClearLogs,
  onExportLogs,
  onSwitchTab,
}) => {
  const t = translations[lang];
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'success' | 'warn' | 'error'>('all');
  const [searchLog, setSearchLog] = useState('');

  const connectedEmulators = emulators.filter((e) => e.status === 'connected');
  const successRate = totalProcessed > 0 ? Math.round((successCount / totalProcessed) * 100) : 100;

  const filteredLogs = logs.filter((log) => {
    if (logFilter !== 'all' && log.level !== logFilter) return false;
    if (searchLog.trim() && !log.message.toLowerCase().includes(searchLog.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{lang === 'bn' ? 'মাস্টার অটোমেশন কমান্ড হাব' : 'Master Automation Command Hub'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'হোস্ট কম্পিউটারের সমস্ত চালু এমুলেটর সরাসরি এডিবি পোর্টের মাধ্যমে সংযুক্ত ও পরিচালিত'
              : 'Direct connection to all host Android emulators via native ADB socket bridge'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAutoDetect}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{t.autoDetectEmulators}</span>
          </button>
          <button
            onClick={onConnectAll}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            {t.connectAll}
          </button>
          <button
            onClick={onStartBatchWorkflow}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.startBatchWorkflow}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Emulators */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">{t.totalEmulators}</span>
            <Monitor className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {emulators.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              {connectedEmulators.length} {lang === 'bn' ? 'সক্রিয়' : 'Online'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Processed */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">{t.processedAccounts}</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {totalProcessed}
            </span>
            <span className="text-xs text-slate-400">Total Run</span>
          </div>
        </div>

        {/* Card 3: Success Count */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">{t.successCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {successCount}
            </span>
            <span className="text-xs text-emerald-400/80">Completed</span>
          </div>
        </div>

        {/* Card 4: Failed Count */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">{t.failedCount}</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-400">
              {failedCount}
            </span>
            <span className="text-xs text-rose-400/80">Errors</span>
          </div>
        </div>

        {/* Card 5: Success Rate */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">{t.successRate}</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-300">
              {successRate}%
            </span>
            <span className="text-xs text-slate-400">Efficiency</span>
          </div>
        </div>

        {/* Card 6: Active Tasks in Queue */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs">{t.activeTasks}</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-purple-300">
              {tasks.filter((t) => t.status === 'running').length}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {tasks.length} in queue
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Emulator Live Summary & Running Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Emulator Devices Quick Status (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'সংযুক্ত এমুলেটর তালিকা' : 'Connected Emulators'}</span>
              </h3>
              <button
                onClick={() => onSwitchTab('emulators')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>{lang === 'bn' ? 'সব স্ক্রিন দেখুন' : 'View Screens'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/80 mt-2">
              {emulators.slice(0, 5).map((emu) => (
                <div key={emu.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 truncate">{emu.name}</span>
                      {emu.isMaster && (
                        <span className="text-[9px] px-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded font-mono">
                          M
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {emu.adbSerial} · {emu.proxyCountry || 'No Proxy'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-[10px] font-mono text-slate-400">
                      <div>CPU {emu.cpuUsage}%</div>
                      <div>RAM {emu.ramUsage}G</div>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        emu.status === 'connected' ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>ADB Bridge Status:</span>
            <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Daemon Running (v1.0.41)
            </span>
          </div>
        </div>

        {/* Right Column: Active Task Queue (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>{lang === 'bn' ? 'স্মার্ট টাস্ক কিউ ও এক্সিকিউশন' : 'Smart Task Queue'}</span>
              </h3>
              <button
                onClick={() => onSwitchTab('workflow')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>{lang === 'bn' ? 'ওয়ার্কফ্লো কনফিগার' : 'Configure Workflow'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 mt-3 max-h-[220px] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  {lang === 'bn'
                    ? 'কোনো টাস্ক চলমান নেই। "একযোগে অটোমেশন শুরু করুন" বাটনে ক্লিক করুন।'
                    : 'No active tasks queued. Click "Start Batch Workflow" to initiate automated tasks.'}
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate">{task.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          [{task.emulatorId}]
                        </span>
                      </div>
                      <div className="text-[11px] text-cyan-300 mt-0.5 truncate">
                        Step {task.stepIndex}/{task.totalSteps}: {task.currentStepName}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Step Progress Bar */}
                      <div className="w-20 hidden sm:block">
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                            style={{ width: `${(task.stepIndex / task.totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono ${
                          task.status === 'running'
                            ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                            : task.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : task.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Auto Recovery: Enabled (Auto-restart on freeze)</span>
            <span className="font-mono text-cyan-400">Concurrency: 6 Threads</span>
          </div>
        </div>
      </div>

      {/* Real-time Activity Terminal Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">{t.recentActivity}</h3>
            <span className="text-xs text-slate-500 font-mono">({filteredLogs.length} events)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2 py-0.5 rounded capitalize text-[11px] transition-colors ${
                    logFilter === lvl
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder="Filter logs..."
                className="pl-7 pr-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 w-32 sm:w-40"
              />
            </div>

            <button
              onClick={onClearLogs}
              title={t.clearLogs}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onExportLogs}
              title={t.exportLogs}
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Window Box */}
        <div className="mt-3 bg-slate-950 rounded-lg p-3 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5 border border-slate-850">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-6">No matching log records found</div>
          ) : (
            filteredLogs.map((log) => {
              let colorClass = 'text-slate-300';
              let badgeColor = 'text-blue-400';
              if (log.level === 'success') {
                colorClass = 'text-emerald-300';
                badgeColor = 'text-emerald-400';
              } else if (log.level === 'warn') {
                colorClass = 'text-amber-300';
                badgeColor = 'text-amber-400';
              } else if (log.level === 'error') {
                colorClass = 'text-rose-400';
                badgeColor = 'text-rose-400';
              }

              return (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed text-[11px]">
                  <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className={`uppercase font-bold shrink-0 ${badgeColor}`}>
                    [{log.level}]
                  </span>
                  {log.emulatorName && (
                    <span className="text-cyan-400 shrink-0">@{log.emulatorName}:</span>
                  )}
                  <span className={colorClass}>{log.message}</span>
                  {log.details && <span className="text-slate-500 shrink-0">({log.details})</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
