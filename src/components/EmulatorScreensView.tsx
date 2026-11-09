import React, { useState } from 'react';
import {
  Monitor,
  Grid,
  Square,
  Play,
  RotateCcw,
  Radio,
  Plus,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { EmulatorDevice, Language } from '../types';
import { translations } from '../utils/translations';
import { EmulatorScreen } from './EmulatorScreen';

interface EmulatorScreensViewProps {
  emulators: EmulatorDevice[];
  lang: Language;
  broadcastActive: boolean;
  setBroadcastActive: (active: boolean) => void;
  onTapScreen: (deviceId: string, x: number, y: number) => void;
  onTogglePower: (deviceId: string) => void;
  onRestart: (deviceId: string) => void;
  onOpenAdbShell: (deviceId: string) => void;
  onRunWorkflowOnDevice: (deviceId: string) => void;
  onStopWorkflowOnDevice: (deviceId: string) => void;
  onStartAllWorkflows: () => void;
  onRestartAll: () => void;
  onAutoDetect: () => void;
  onScreenViewChange: (deviceId: string, screen: EmulatorDevice['screenState']['activeScreen']) => void;
}

export const EmulatorScreensView: React.FC<EmulatorScreensViewProps> = ({
  emulators,
  lang,
  broadcastActive,
  setBroadcastActive,
  onTapScreen,
  onTogglePower,
  onRestart,
  onOpenAdbShell,
  onRunWorkflowOnDevice,
  onStopWorkflowOnDevice,
  onStartAllWorkflows,
  onRestartAll,
  onAutoDetect,
  onScreenViewChange,
}) => {
  const t = translations[lang];
  const [gridLayout, setGridLayout] = useState<'1' | '2' | '4' | '6'>('6');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<string>('all');

  // Filter emulators based on grid setting or selection
  const visibleEmulators =
    selectedDeviceFilter === 'all'
      ? emulators.slice(
          0,
          gridLayout === '1' ? 1 : gridLayout === '2' ? 2 : gridLayout === '4' ? 4 : 6
        )
      : emulators.filter((e) => e.id === selectedDeviceFilter);

  return (
    <div className="space-y-4">
      {/* Control Header & Grid Layout Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Grid Layout Selector */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-500 px-2">Grid:</span>
            <button
              onClick={() => setGridLayout('1')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                gridLayout === '1' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setGridLayout('2')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                gridLayout === '2' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setGridLayout('4')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                gridLayout === '4' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4
            </button>
            <button
              onClick={() => setGridLayout('6')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                gridLayout === '6' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              6
            </button>
          </div>

          {/* Filter by specific device */}
          <select
            value={selectedDeviceFilter}
            onChange={(e) => setSelectedDeviceFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">
              {lang === 'bn' ? 'সব এমুলেটর প্রদর্শন' : 'All Emulators'} ({emulators.length})
            </option>
            {emulators.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.adbSerial})
              </option>
            ))}
          </select>
        </div>

        {/* Global Batch Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Master Broadcast Button */}
          <button
            onClick={() => setBroadcastActive(!broadcastActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              broadcastActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow shadow-cyan-500/20'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${broadcastActive ? 'animate-pulse text-cyan-400' : ''}`} />
            <span>{t.broadcastMode}</span>
          </button>

          <button
            onClick={onRestartAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-amber-300 text-xs font-semibold rounded-lg border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সব রিস্টার্ট' : 'Restart All'}</span>
          </button>

          <button
            onClick={onStartAllWorkflows}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.startBatchWorkflow}</span>
          </button>
        </div>
      </div>

      {/* Broadcast Mode Helper Tip */}
      {broadcastActive && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>
              <strong>{lang === 'bn' ? 'ব্রডকাস্ট মোড সক্রিয়:' : 'Broadcast Active:'}</strong>{' '}
              {t.broadcastActive}
            </span>
          </div>
          <span className="text-[11px] font-mono bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/30">
            {visibleEmulators.length} Targets Synced
          </span>
        </div>
      )}

      {/* Grid of Interactive Emulator Screens */}
      <div
        className={`grid gap-4 ${
          gridLayout === '1'
            ? 'grid-cols-1 max-w-md mx-auto'
            : gridLayout === '2'
            ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
            : gridLayout === '4'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
        }`}
      >
        {visibleEmulators.map((device) => (
          <EmulatorScreen
            key={device.id}
            device={device}
            lang={lang}
            broadcastActive={broadcastActive}
            onTapScreen={onTapScreen}
            onTogglePower={onTogglePower}
            onRestart={onRestart}
            onOpenAdbShell={onOpenAdbShell}
            onRunWorkflowOnDevice={onRunWorkflowOnDevice}
            onStopWorkflowOnDevice={onStopWorkflowOnDevice}
            onScreenViewChange={onScreenViewChange}
          />
        ))}
      </div>
    </div>
  );
};
