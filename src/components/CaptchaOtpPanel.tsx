import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import { CaptchaSettings, Language } from '../types';
import { translations } from '../utils/translations';
import { generateMockOtp } from '../utils/generators';

interface CaptchaOtpPanelProps {
  captchaSettings: CaptchaSettings;
  lang: Language;
  onUpdateCaptchaSettings: (settings: CaptchaSettings) => void;
  onLogActivity: (level: 'info' | 'success' | 'warn' | 'error', message: string) => void;
}

export const CaptchaOtpPanel: React.FC<CaptchaOtpPanelProps> = ({
  captchaSettings,
  lang,
  onUpdateCaptchaSettings,
  onLogActivity,
}) => {
  const t = translations[lang];

  // Local settings
  const [settings, setSettings] = useState<CaptchaSettings>(captchaSettings);

  // OTP Simulator State
  const [testOtp, setTestOtp] = useState<string>('729104');
  const [inputOtp, setInputOtp] = useState<string>('');
  const [otpVerifyResult, setOtpVerifyResult] = useState<'success' | 'failed' | null>(null);
  const [isOtpSending, setIsOtpSending] = useState(false);

  // Interactive CAPTCHA Test State
  const [sliderPosition, setSliderPosition] = useState<number>(0);
  const targetPuzzlePosition = 75; // 75%
  const [captchaStatus, setCaptchaStatus] = useState<'idle' | 'solving' | 'solved' | 'failed'>('idle');

  const handleSendTestOtp = () => {
    setIsOtpSending(true);
    setOtpVerifyResult(null);
    setTimeout(() => {
      const code = generateMockOtp();
      setTestOtp(code);
      setInputOtp('');
      setIsOtpSending(false);
      onLogActivity('info', `Mock OTP Dispatcher: Code [${code}] delivered to test listener`);
    }, 500);
  };

  const handleVerifyOtp = () => {
    if (inputOtp.trim() === testOtp) {
      setOtpVerifyResult('success');
      onLogActivity('success', `OTP Verification passed! Code ${inputOtp} verified.`);
    } else {
      setOtpVerifyResult('failed');
      onLogActivity('error', `OTP Verification failed! Input [${inputOtp}] does not match.`);
    }
  };

  const handleRunAutoCaptchaSolve = () => {
    setCaptchaStatus('solving');
    setSliderPosition(15);
    onLogActivity('info', `Anti-Captcha AI Solver engaged. Analyzing image challenge matrix...`);

    setTimeout(() => {
      setSliderPosition(targetPuzzlePosition);
      setCaptchaStatus('solved');
      onLogActivity('success', `CAPTCHA challenge successfully solved in ${(settings.solveDelayMs / 1000).toFixed(1)}s! Token verified.`);
    }, settings.solveDelayMs);
  };

  const handleSliderDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderPosition(val);
    if (Math.abs(val - targetPuzzlePosition) <= 4) {
      setCaptchaStatus('solved');
      onLogActivity('success', `Manual slider puzzle aligned at ${val}%! Challenge passed.`);
    } else if (val > 10) {
      setCaptchaStatus('idle');
    }
  };

  const handleResetChallenge = () => {
    setSliderPosition(0);
    setCaptchaStatus('idle');
  };

  return (
    <div className="space-y-6">
      {/* CAPTCHA Solver Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">{t.captchaTitle}</h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono">
            Anti-Bot Bypass Engine: ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-xs text-slate-400 font-medium">{t.captchaMode}</label>
            <select
              value={settings.mode}
              onChange={(e) => {
                const updated = { ...settings, mode: e.target.value as any };
                setSettings(updated);
                onUpdateCaptchaSettings(updated);
              }}
              className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="auto_solver">Smart Auto-Solver (Zero Latency)</option>
              <option value="interactive_test">Interactive Sandbox Challenge</option>
              <option value="2captcha_api">2Captcha API Token</option>
              <option value="anticaptcha_api">Anti-Captcha High-Speed Gateway</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between">
              <label className="text-xs text-slate-400 font-medium">{t.solveDelay}</label>
              <span className="text-xs font-mono text-cyan-400">
                {(settings.solveDelayMs / 1000).toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={300}
              max={4000}
              step={100}
              value={settings.solveDelayMs}
              onChange={(e) => {
                const updated = { ...settings, solveDelayMs: Number(e.target.value) };
                setSettings(updated);
                onUpdateCaptchaSettings(updated);
              }}
              className="mt-2 w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.3s (Instant)</span>
              <span>2.0s (Normal)</span>
              <span>4.0s (Stealth)</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Solver API Key (Optional)</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => {
                const updated = { ...settings, apiKey: e.target.value };
                setSettings(updated);
                onUpdateCaptchaSettings(updated);
              }}
              placeholder="e.g. 2cap_b82941098..."
              className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 2-Column: Test CAPTCHA Simulator & OTP Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: CAPTCHA Test Interactive Sandbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'টেস্ট ক্যাপচা চ্যালেঞ্জ মোড' : 'CAPTCHA Challenge Sandbox'}</span>
              </h3>
              <button
                onClick={handleResetChallenge}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Interactive Puzzle Visual Box */}
            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="relative h-44 rounded-lg bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 overflow-hidden border border-slate-800">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

                {/* Target Puzzle Slot */}
                <div
                  className="absolute top-12 w-12 h-12 rounded border-2 border-dashed border-cyan-400/80 bg-cyan-950/40 flex items-center justify-center text-[10px] font-mono text-cyan-300 font-bold"
                  style={{ left: `${targetPuzzlePosition}%` }}
                >
                  TARGET
                </div>

                {/* Draggable Puzzle Piece */}
                <div
                  className={`absolute top-12 w-12 h-12 rounded bg-cyan-500 border border-white shadow-xl shadow-cyan-500/30 flex items-center justify-center text-xs font-bold text-slate-950 transition-all ${
                    captchaStatus === 'solved' ? 'bg-emerald-400 border-emerald-200 ring-4 ring-emerald-500/30' : ''
                  }`}
                  style={{ left: `${sliderPosition}%` }}
                >
                  {captchaStatus === 'solved' ? <Check className="w-5 h-5 text-slate-950 stroke-[3]" /> : '🧩'}
                </div>

                {/* Status Overlay */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Position: {sliderPosition}%</span>
                  {captchaStatus === 'solved' ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Solved & Passed
                    </span>
                  ) : captchaStatus === 'solving' ? (
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" /> Auto Solving...
                    </span>
                  ) : (
                    <span className="text-amber-400">Slide to Target</span>
                  )}
                </div>
              </div>

              {/* Slider Control */}
              <div className="mt-4">
                <input
                  type="range"
                  min={0}
                  max={88}
                  value={sliderPosition}
                  onChange={handleSliderDrag}
                  className="w-full accent-cyan-400 cursor-ew-resize"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {lang === 'bn' ? 'অটো-সলভ টেস্ট করুন' : 'Test automated bypass'}
            </span>
            <button
              onClick={handleRunAutoCaptchaSolve}
              disabled={captchaStatus === 'solving'}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t.testCaptchaChallenge}</span>
            </button>
          </div>
        </div>

        {/* Right: Mock OTP Verification Console */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>{t.otpTestingConsole}</span>
              </h3>
              <button
                onClick={handleSendTestOtp}
                disabled={isOtpSending}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span>{t.sendTestOtp}</span>
              </button>
            </div>

            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">Generated Mock OTP:</span>
                  <span className="text-xl font-mono font-bold text-amber-300 tracking-widest mt-0.5 block">
                    {testOtp}
                  </span>
                </div>
                <button
                  onClick={() => setInputOtp(testOtp)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded font-medium border border-slate-700"
                >
                  Auto-Fill Code
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  {lang === 'bn' ? 'যাচাইকরণ কোড ইনপুট' : 'Verification Code Input'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono tracking-widest text-center focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    {t.verifyOtp}
                  </button>
                </div>
              </div>

              {/* Result Badge */}
              {otpVerifyResult && (
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    otpVerifyResult === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {otpVerifyResult === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>
                    {otpVerifyResult === 'success'
                      ? 'Status 200 OK: OTP Verified Successfully!'
                      : 'Error 400: OTP Mismatch or Expired token.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Validation Timeout: 300 seconds</span>
            <span className="font-mono text-emerald-400">Success Rate: 99.4%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
