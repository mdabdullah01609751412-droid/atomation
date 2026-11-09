import React from 'react';
import {
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Shield,
  Smartphone,
  User,
  Phone,
  Lock,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { AccountProfile, EmulatorDevice, Language, TaskQueueItem } from '../types';
import { translations } from '../utils/translations';

interface WorkflowRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTask?: TaskQueueItem;
  emulator?: EmulatorDevice;
  lang: Language;
  onAbortTask: (taskId: string) => void;
}

export const WorkflowRunnerModal: React.FC<WorkflowRunnerModalProps> = ({
  isOpen,
  onClose,
  activeTask,
  emulator,
  lang,
  onAbortTask,
}) => {
  if (!isOpen || !activeTask) return null;

  const t = translations[lang];

  const steps = [
    { num: 1, name: t.stepProxy, icon: Shield },
    { num: 2, name: t.stepSpoof, icon: Smartphone },
    { num: 3, name: t.stepLaunch, icon: Play },
    { num: 4, name: t.stepFill, icon: User },
    { num: 5, name: t.stepPhone, icon: Phone },
    { num: 6, name: t.stepOtp, icon: Lock },
    { num: 7, name: t.stepCaptcha, icon: Sparkles },
    { num: 8, name: t.stepSync, icon: FileSpreadsheet },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">{activeTask.name}</h3>
              <span className="px-1.5 py-0.2 rounded bg-[#1877F2]/20 text-[#1877F2] font-mono text-[10px] font-bold border border-[#1877F2]/30">
                FACEBOOK REG
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Running on <span className="text-cyan-300 font-semibold">{emulator?.name || activeTask.emulatorId}</span> · {emulator?.adbSerial}
            </p>
            <div className="text-[10px] font-mono text-cyan-400 mt-0.5 truncate">
              https://www.facebook.com/reg/?entry_point=login
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">
              Step {activeTask.stepIndex} of {activeTask.totalSteps}:
            </span>
            <span className="text-cyan-300 font-bold">
              {Math.round((activeTask.stepIndex / activeTask.totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(activeTask.stepIndex / activeTask.totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Items List */}
        <div className="mt-5 space-y-2 max-h-64 overflow-y-auto pr-1">
          {steps.map((s) => {
            const isCompleted = activeTask.stepIndex > s.num;
            const isCurrent = activeTask.stepIndex === s.num;
            const Icon = s.icon;

            return (
              <div
                key={s.num}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                    : isCompleted
                    ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                    : 'bg-slate-950/20 border-slate-850 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : s.num}
                  </div>
                  <span className="font-medium">{s.name}</span>
                </div>

                {isCurrent && (
                  <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" /> In Progress
                  </span>
                )}
                {isCompleted && (
                  <span className="text-emerald-400 text-[11px] font-mono">Completed</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onAbortTask(activeTask.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/80 transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'bn' ? 'টাস্ক বাতিল করুন' : 'Abort Task'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            {lang === 'bn' ? 'ব্যাকগ্রাউন্ডে চালান' : 'Run in Background'}
          </button>
        </div>
      </div>
    </div>
  );
};
