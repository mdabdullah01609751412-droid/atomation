import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Trash2,
  Copy,
  Check,
  Smartphone,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { EmulatorDevice, Language } from '../types';
import { translations } from '../utils/translations';

interface AdbConsolePanelProps {
  emulators: EmulatorDevice[];
  lang: Language;
  onExecuteAdbCommand: (cmd: string, targetId: string) => void;
  commandHistory: Array<{ cmd: string; output: string; time: string; target: string }>;
  onClearHistory: () => void;
}

export const AdbConsolePanel: React.FC<AdbConsolePanelProps> = ({
  emulators,
  lang,
  onExecuteAdbCommand,
  commandHistory,
  onClearHistory,
}) => {
  const t = translations[lang];
  const [command, setCommand] = useState('');
  const [targetId, setTargetId] = useState<string>('all');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    onExecuteAdbCommand(command.trim(), targetId);
    setCommand('');
  };

  const handleQuickCommand = (cmd: string) => {
    onExecuteAdbCommand(cmd, targetId);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const quickButtons = [
    { label: 'adb devices -l', cmd: 'adb devices -l' },
    { label: 'Battery Status', cmd: 'adb shell dumpsys battery' },
    { label: 'Get Model & Props', cmd: 'adb shell getprop ro.product.model' },
    { label: 'Android ID Check', cmd: 'adb shell settings get secure android_id' },
    { label: 'List Running Packages', cmd: 'adb shell pm list packages -3' },
    { label: 'Press Home Button', cmd: 'adb shell input keyevent 3' },
    { label: 'Press Back Button', cmd: 'adb shell input keyevent 4' },
    { label: 'Take Screencap', cmd: 'adb shell screencap -p /sdcard/screen.png' },
  ];

  return (
    <div className="space-y-6">
      {/* Console Header & Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">{t.adbTitle}</h3>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            ADB Socket Server: 127.0.0.1:5037 (READY)
          </span>
        </div>

        {/* Quick Command Action Chips */}
        <div className="mt-4">
          <span className="text-xs text-slate-400 font-medium block mb-2">{t.quickCommands}:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => handleQuickCommand(btn.cmd)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded border border-slate-800 hover:border-slate-700 transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Command Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
          {/* Target Emulator Picker */}
          <div className="w-full sm:w-48 shrink-0">
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Broadcast All ({emulators.length})</option>
              {emulators.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.adbSerial})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder={t.adbCommandPlaceholder}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-300 font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.executeCmd}</span>
          </button>
        </form>
      </div>

      {/* Terminal Output Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-200">Standard Output (stdout/stderr)</h3>
          </div>
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Output</span>
          </button>
        </div>

        <div className="mt-4 bg-slate-950 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto space-y-3 border border-slate-850">
          {commandHistory.length === 0 ? (
            <div className="text-slate-600 text-center py-8">
              No ADB commands executed yet. Select a quick action above or type an adb command.
            </div>
          ) : (
            commandHistory.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-semibold">{item.target} $</span>
                    <span className="text-slate-200 font-semibold">{item.cmd}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{item.time}</span>
                    <button
                      onClick={() => handleCopy(item.output, idx)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <pre className="p-2 bg-slate-900/90 rounded border border-slate-800/80 text-emerald-300/90 whitespace-pre-wrap leading-relaxed text-[11px]">
                  {item.output}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
