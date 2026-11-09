import React, { useState } from 'react';
import {
  RotateCcw,
  Power,
  Camera,
  Maximize2,
  Terminal,
  ShieldCheck,
  Cpu,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  ChevronLeft,
  Circle,
  Smartphone,
  Wifi,
  Battery,
  Lock,
  User,
  Phone,
  Key,
} from 'lucide-react';
import { EmulatorDevice, Language } from '../types';
import { translations } from '../utils/translations';

interface EmulatorScreenProps {
  device: EmulatorDevice;
  lang: Language;
  broadcastActive: boolean;
  onTapScreen?: (deviceId: string, x: number, y: number) => void;
  onTogglePower: (deviceId: string) => void;
  onRestart: (deviceId: string) => void;
  onOpenAdbShell: (deviceId: string) => void;
  onRunWorkflowOnDevice: (deviceId: string) => void;
  onStopWorkflowOnDevice: (deviceId: string) => void;
  onScreenViewChange?: (deviceId: string, screen: EmulatorDevice['screenState']['activeScreen']) => void;
}

export const EmulatorScreen: React.FC<EmulatorScreenProps> = ({
  device,
  lang,
  broadcastActive,
  onTapScreen,
  onTogglePower,
  onRestart,
  onOpenAdbShell,
  onRunWorkflowOnDevice,
  onStopWorkflowOnDevice,
  onScreenViewChange,
}) => {
  const t = translations[lang];
  const [tapRipple, setTapRipple] = useState<{ x: number; y: number } | null>(null);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (device.status !== 'connected') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1080);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 2400);

    setTapRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setTapRipple(null), 500);

    if (onTapScreen) {
      onTapScreen(device.id, x, y);
    }
  };

  const handleTakeScreenshot = () => {
    setIsScreenshotting(true);
    setTimeout(() => {
      setIsScreenshotting(false);
      setScreenshotPreview(
        `Captured ${device.name} at ${new Date().toLocaleTimeString()} (1080x2400)`
      );
      setTimeout(() => setScreenshotPreview(null), 3000);
    }, 600);
  };

  const isConnected = device.status === 'connected';
  const isStarting = device.status === 'starting';

  return (
    <div
      className={`flex flex-col bg-slate-900 border ${
        device.isMaster
          ? 'border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
          : 'border-slate-800'
      } rounded-xl overflow-hidden transition-all duration-200`}
    >
      {/* Emulator Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone
            className={`w-3.5 h-3.5 shrink-0 ${
              isConnected ? 'text-emerald-400' : isStarting ? 'text-amber-400 animate-spin' : 'text-slate-500'
            }`}
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-200 truncate">{device.name}</span>
              {device.isMaster && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded">
                  MASTER
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono truncate">
              ADB: {device.adbSerial} · {device.model.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Device Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onRunWorkflowOnDevice(device.id)}
            disabled={!isConnected}
            title={lang === 'bn' ? 'অটোমেশন চালান' : 'Run Automation'}
            className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onStopWorkflowOnDevice(device.id)}
            disabled={!isConnected}
            title={lang === 'bn' ? 'টাস্ক থামান' : 'Halt Task'}
            className="p-1 text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleTakeScreenshot}
            disabled={!isConnected}
            title={lang === 'bn' ? 'স্ক্রিনশট নিন' : 'Take Screenshot'}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors disabled:opacity-30"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onOpenAdbShell(device.id)}
            disabled={!isConnected}
            title="ADB Shell"
            className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-30"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRestart(device.id)}
            disabled={!isConnected}
            title={t.restartEmulator}
            className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onTogglePower(device.id)}
            title={isConnected ? t.stopEmulator : t.startEmulator}
            className={`p-1 rounded transition-colors ${
              isConnected
                ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
                : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen View Mode Switcher */}
      {isConnected && (
        <div className="flex items-center justify-between px-2.5 py-1 bg-slate-950/60 border-b border-slate-800/80 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[10px]">Screen:</span>
            <button
              onClick={() => onScreenViewChange?.(device.id, 'target_app')}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                device.screenState.activeScreen === 'target_app'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              App Workflow
            </button>
            <button
              onClick={() => onScreenViewChange?.(device.id, 'otp_screen')}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                device.screenState.activeScreen === 'otp_screen'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OTP Verification
            </button>
            <button
              onClick={() => onScreenViewChange?.(device.id, 'captcha_challenge')}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                device.screenState.activeScreen === 'captcha_challenge'
                  ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CAPTCHA
            </button>
            <button
              onClick={() => onScreenViewChange?.(device.id, 'home')}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                device.screenState.activeScreen === 'home'
                  ? 'bg-slate-700 text-slate-200 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Home OS
            </button>
          </div>
          {device.proxyCountry && (
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              {device.proxyCountry}
            </span>
          )}
        </div>
      )}

      {/* Screen Interactive Viewport Container */}
      <div className="relative aspect-[9/16] bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
        {isConnected ? (
          <>
            {/* Android Status Bar */}
            <div className="flex items-center justify-between px-3 py-1 bg-black/70 text-[10px] text-slate-300 font-mono tracking-tight shrink-0 z-10">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-semibold text-emerald-400">5G LTE</span>
                <Wifi className="w-3 h-3 text-slate-300" />
                <div className="flex items-center gap-1">
                  <span>{device.batteryLevel}%</span>
                  <Battery className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>
            </div>

            {/* Simulated Live Screen Contents */}
            <div
              onClick={handleScreenClick}
              className="relative flex-1 bg-slate-900/90 flex flex-col p-3 overflow-hidden cursor-crosshair group"
            >
              {/* Click Ripple Indicator */}
              {tapRipple && (
                <div
                  className="absolute w-8 h-8 rounded-full border-2 border-cyan-400 bg-cyan-400/30 animate-ping pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: tapRipple.x, top: tapRipple.y }}
                />
              )}

              {/* Master Mirror Overlay Badge */}
              {broadcastActive && device.isMaster && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-cyan-500/90 text-slate-950 font-bold text-[9px] rounded uppercase shadow tracking-wider pointer-events-none animate-pulse">
                  Broadcasting Master
                </div>
              )}

              {/* View 1: Target App Registration Form - Facebook Registration URL */}
              {device.screenState.activeScreen === 'target_app' && (
                <div className="flex flex-col h-full justify-between py-0.5">
                  <div className="space-y-1.5">
                    {/* Facebook Header & URL bar */}
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-black text-xs">
                            f
                          </div>
                          <span className="text-[11px] font-bold text-[#1877F2] tracking-tight">
                            facebook
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800">
                          AUTO-INJECT
                        </span>
                      </div>
                      <div className="px-1.5 py-0.5 bg-slate-900 rounded text-[9px] font-mono text-slate-400 truncate flex items-center gap-1">
                        <span className="text-emerald-400">🔒</span>
                        <span>https://www.facebook.com/reg/?entry_point=login</span>
                      </div>
                    </div>

                    {/* Step indicator */}
                    <div className="p-1 bg-slate-950/90 rounded border border-slate-800 text-[9px] flex items-center justify-between">
                      <span className="text-slate-400 truncate">
                        {device.screenState.currentStepDesc || 'Form Automation Ready'}
                      </span>
                      <span className="text-cyan-300 font-mono text-[9px] shrink-0">Age 25-30</span>
                    </div>

                    {/* Facebook Registration Form fields */}
                    <div className="space-y-1">
                      {/* Name Split: First Name & Surname */}
                      <div className="grid grid-cols-2 gap-1">
                        <div className="bg-slate-950/90 rounded border border-slate-800 p-1">
                          <label className="text-[8px] text-slate-400 block">First name</label>
                          <div className="text-[11px] font-semibold text-slate-100 truncate">
                            {device.screenState.formInputs?.firstName ||
                              device.screenState.formInputs?.name?.split(' ')[0] ||
                              'First name'}
                          </div>
                        </div>
                        <div className="bg-slate-950/90 rounded border border-slate-800 p-1">
                          <label className="text-[8px] text-slate-400 block">Surname</label>
                          <div className="text-[11px] font-semibold text-slate-100 truncate">
                            {device.screenState.formInputs?.lastName ||
                              device.screenState.formInputs?.name?.split(' ').slice(1).join(' ') ||
                              'Surname'}
                          </div>
                        </div>
                      </div>

                      {/* Date of Birth (Age 25-30) */}
                      <div className="bg-slate-950/90 rounded border border-slate-800 p-1">
                        <div className="flex items-center justify-between text-[8px] text-slate-400 mb-0.5">
                          <span>Date of birth</span>
                          <span className="text-cyan-400 font-mono">
                            {device.screenState.formInputs?.age || 27} yrs (25-30)
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-200">
                          <div className="bg-slate-900 px-1 py-0.5 rounded text-center border border-slate-800">
                            {device.screenState.formInputs?.birthDay || 14}
                          </div>
                          <div className="bg-slate-900 px-1 py-0.5 rounded text-center border border-slate-800">
                            {device.screenState.formInputs?.birthMonth || 'Apr'}
                          </div>
                          <div className="bg-slate-900 px-1 py-0.5 rounded text-center border border-slate-800">
                            {device.screenState.formInputs?.birthYear || 1999}
                          </div>
                        </div>
                      </div>

                      {/* Gender Selector */}
                      <div className="bg-slate-950/90 rounded border border-slate-800 p-1">
                        <span className="text-[8px] text-slate-400 block mb-0.5">Gender</span>
                        <div className="grid grid-cols-2 gap-1 text-[9px]">
                          <div
                            className={`px-1.5 py-0.5 rounded border text-center font-medium ${
                              device.screenState.formInputs?.gender === 'female'
                                ? 'bg-[#1877F2]/20 border-[#1877F2] text-cyan-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            Female
                          </div>
                          <div
                            className={`px-1.5 py-0.5 rounded border text-center font-medium ${
                              device.screenState.formInputs?.gender !== 'female'
                                ? 'bg-[#1877F2]/20 border-[#1877F2] text-cyan-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            Male ✓
                          </div>
                        </div>
                      </div>

                      {/* Mobile Number from Virtual SMS API */}
                      <div className="bg-slate-950/90 rounded border border-slate-800 p-1">
                        <label className="text-[8px] text-slate-400 block">
                          Mobile number (SMS API)
                        </label>
                        <div className="text-[11px] font-mono font-medium text-emerald-300 truncate">
                          {device.screenState.formInputs?.phone || '+1 415 892 1456'}
                        </div>
                      </div>

                      {/* Password */}
                      <div className="bg-slate-950/90 rounded border border-slate-800 p-1">
                        <label className="text-[8px] text-slate-400 block">New password</label>
                        <div className="text-[11px] font-mono text-slate-200 truncate">
                          {device.screenState.formInputs?.password ? '••••••••••••' : 'Password#2026!'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onScreenViewChange?.(device.id, 'otp_screen');
                      }}
                      className="w-full py-1.5 bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-xs rounded shadow transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Sign Up on Facebook</span>
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Facebook SMS Confirmation Screen */}
              {device.screenState.activeScreen === 'otp_screen' && (
                <div className="flex flex-col h-full justify-between py-2 text-center">
                  <div className="space-y-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                      f
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">
                        Enter Facebook Confirmation Code
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        We sent an SMS with code to{' '}
                        <span className="text-emerald-400 font-mono">
                          {device.screenState.formInputs?.phone || '+1 415 982 1456'}
                        </span>
                      </p>
                    </div>

                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="text-[9px] text-slate-400 uppercase font-mono">
                        Facebook SMS Code
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-slate-400">FB -</span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4].map((idx) => {
                            const code = device.screenState.formInputs?.otp || '59281';
                            return (
                              <div
                                key={idx}
                                className="w-6 h-8 rounded bg-slate-900 border border-[#1877F2]/60 flex items-center justify-center text-xs font-mono font-bold text-cyan-300"
                              >
                                {code[idx] || '·'}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      SMS Poller: <span className="text-emerald-400 font-medium">FB-Code Auto-Filled</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScreenViewChange?.(device.id, 'captcha_challenge');
                    }}
                    className="w-full py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs rounded transition-colors"
                  >
                    Confirm & Proceed
                  </button>
                </div>
              )}

              {/* View 3: CAPTCHA Challenge */}
              {device.screenState.activeScreen === 'captcha_challenge' && (
                <div className="flex flex-col h-full justify-between py-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <span className="text-xs font-semibold text-slate-200">
                        Security Verification
                      </span>
                      <span className="text-[9px] text-emerald-400">Anti-Bot AI</span>
                    </div>

                    <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 space-y-2">
                      <div className="h-20 bg-gradient-to-tr from-slate-850 via-slate-800 to-slate-900 rounded relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px]" />
                        <div className="w-9 h-9 rounded bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-cyan-200 font-mono text-xs">
                          PUZZLE
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded p-1.5 border border-slate-800">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>Slide to Complete</span>
                          <span className="text-emerald-400 font-mono">100% Solved</span>
                        </div>
                        <div className="h-4 bg-slate-950 rounded-full relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-full bg-emerald-500/30 rounded-full" />
                          <div className="absolute right-0 top-0 bottom-0 w-4 bg-emerald-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScreenViewChange?.(device.id, 'target_app');
                    }}
                    className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded transition-colors"
                  >
                    Human Challenge Verified
                  </button>
                </div>
              )}

              {/* View 4: Standard Android OS Home */}
              {device.screenState.activeScreen === 'home' && (
                <div className="flex flex-col h-full justify-between py-2">
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[
                      { name: 'App Workflow', icon: '🚀', color: 'bg-cyan-600' },
                      { name: 'Chrome', icon: '🌐', color: 'bg-amber-600' },
                      { name: 'Settings', icon: '⚙️', color: 'bg-slate-700' },
                      { name: 'Play Store', icon: '🛍️', color: 'bg-emerald-600' },
                      { name: 'ProxyDroid', icon: '🛡️', color: 'bg-indigo-600' },
                      { name: 'Device ID', icon: '📱', color: 'bg-purple-600' },
                      { name: 'SMS Hub', icon: '💬', color: 'bg-rose-600' },
                      { name: 'Files', icon: '📁', color: 'bg-blue-600' },
                    ].map((app, i) => (
                      <div
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (app.name === 'App Workflow') {
                            onScreenViewChange?.(device.id, 'target_app');
                          }
                        }}
                        className="flex flex-col items-center gap-1 cursor-pointer group"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl ${app.color} flex items-center justify-center text-sm shadow group-hover:scale-105 transition-transform`}
                        >
                          {app.icon}
                        </div>
                        <span className="text-[9px] text-slate-300 text-center truncate max-w-full">
                          {app.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2 bg-slate-950/80 rounded border border-slate-800 text-[10px] text-slate-400">
                    <div>Model: {device.model}</div>
                    <div className="font-mono text-cyan-400">IP: {device.ipAddress}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Virtual Android Soft-key Navigation Bar */}
            <div className="flex items-center justify-around py-1 bg-black text-slate-400 border-t border-slate-900 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScreenViewChange?.(device.id, 'home');
                }}
                className="p-1 hover:text-white transition-colors"
                title="Back (◀)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScreenViewChange?.(device.id, 'home');
                }}
                className="p-1 hover:text-white transition-colors"
                title="Home (●)"
              >
                <Circle className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScreenViewChange?.(device.id, 'target_app');
                }}
                className="p-1 hover:text-white transition-colors"
                title="Recents (■)"
              >
                <Square className="w-3 h-3" />
              </button>
            </div>
          </>
        ) : (
          /* Disconnected / Off State Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <Smartphone className="w-10 h-10 text-slate-700 mb-2" />
            <span className="text-xs font-semibold text-slate-400">
              {isStarting ? t.rebooting : t.deviceDisconnected}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">
              Port: {device.port} · {device.adbSerial}
            </p>
            <button
              onClick={() => onTogglePower(device.id)}
              className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
            >
              {t.startEmulator}
            </button>
          </div>
        )}

        {/* Screenshot capture popup preview */}
        {screenshotPreview && (
          <div className="absolute inset-x-2 top-2 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-[10px] p-2 rounded shadow-lg z-20 animate-fade-in">
            {screenshotPreview}
          </div>
        )}
      </div>

      {/* Hardware Telemetry Bar */}
      <div className="grid grid-cols-3 gap-1 px-3 py-1.5 bg-slate-950 text-[10px] font-mono border-t border-slate-800 text-slate-400">
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>CPU: {device.cpuUsage}%</span>
        </div>
        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-emerald-400" />
          <span>RAM: {device.ramUsage}G</span>
        </div>
        <div className="text-right truncate">
          <span className="text-slate-300">{device.proxyIp ? device.proxyIp.split(':')[0] : 'Direct'}</span>
        </div>
      </div>
    </div>
  );
};
