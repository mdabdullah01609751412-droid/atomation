import React, { useState } from 'react';
import {
  UserCheck,
  User,
  Lock,
  Calendar,
  Sparkles,
  Play,
  RotateCw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sliders,
  Send,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AccountProfile, EmulatorDevice, Language } from '../types';
import { translations } from '../utils/translations';
import {
  generateAccountProfile,
  generateAge25to30,
  generateSecurePassword,
} from '../utils/generators';

interface AccountWorkflowPanelProps {
  emulators: EmulatorDevice[];
  lang: Language;
  onRunWorkflow: (profile: AccountProfile, emulatorId: string) => void;
  onSaveProfile: (profile: AccountProfile) => void;
}

export const AccountWorkflowPanel: React.FC<AccountWorkflowPanelProps> = ({
  emulators,
  lang,
  onRunWorkflow,
  onSaveProfile,
}) => {
  const t = translations[lang];

  // Generator settings
  const [origin, setOrigin] = useState<'bd' | 'western'>('bd');
  const [genderPref, setGenderPref] = useState<'both' | 'male' | 'female'>('both');
  const [ageRange, setAgeRange] = useState<number>(27); // default 27 (within 25-30)
  const [passwordRule, setPasswordRule] = useState<string>('Complex (A-Z, a-z, 0-9, !@#$)');
  const [passwordLength, setPasswordLength] = useState<number>(12);
  const [targetEmulatorId, setTargetEmulatorId] = useState<string>(
    emulators[0]?.id || 'emu-1'
  );

  // Generated profiles in preview
  const [previewProfiles, setPreviewProfiles] = useState<AccountProfile[]>(() => [
    generateAccountProfile('bd', 'both', emulators[0]?.id || 'emu-1'),
    generateAccountProfile('bd', 'both', emulators[1]?.id || 'emu-2'),
    generateAccountProfile('western', 'both', emulators[2]?.id || 'emu-3'),
  ]);

  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateBatch = (count: number) => {
    const list: AccountProfile[] = [];
    for (let i = 0; i < count; i++) {
      const p = generateAccountProfile(origin, genderPref, targetEmulatorId);
      p.age = ageRange; // enforce chosen 25-30 age
      p.password = generateSecurePassword(passwordLength);
      list.push(p);
    }
    setPreviewProfiles(list);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const workflowSteps = [
    {
      num: 1,
      title: t.stepProxy,
      desc: lang === 'bn' ? 'প্রক্সি আইপি ও ডিএনএস লিক চেক' : 'Verify proxy IP and DNS leak status',
      icon: Shield,
    },
    {
      num: 2,
      title: t.stepSpoof,
      desc: lang === 'bn' ? 'অ্যান্ড্রয়েড আইডি ও ম্যাক রেন্ডমাইজেশন' : 'Generate unique Android ID & device fingerprint',
      icon: Smartphone,
    },
    {
      num: 3,
      title: t.stepLaunch,
      desc: lang === 'bn' ? 'টার্গেট প্যাকেজ ওপেন' : 'Launch target app via ADB am start',
      icon: Play,
    },
    {
      num: 4,
      title: t.stepFill,
      desc: lang === 'bn' ? 'ফর্ম ফিলিং (বয়স ২৫-৩০)' : 'Inject randomized profile info into inputs',
      icon: User,
    },
    {
      num: 5,
      title: t.stepPhone,
      desc: lang === 'bn' ? 'ভার্চুয়াল নম্বর ইনপুট' : 'Procure and paste virtual phone number',
      icon: Send,
    },
    {
      num: 6,
      title: t.stepOtp,
      desc: lang === 'bn' ? 'ওটিপি ক্যাপচার ও অটো-টাইপ' : 'Receive SMS OTP via poller and auto-fill',
      icon: Lock,
    },
    {
      num: 7,
      title: t.stepCaptcha,
      desc: lang === 'bn' ? 'ইন্টারেক্টিভ বা অটো সলভার' : 'Pass security challenge or turnstile',
      icon: Sparkles,
    },
    {
      num: 8,
      title: t.stepSync,
      desc: lang === 'bn' ? 'গুগল শিটসে সফল বা ব্যর্থ রেকর্ড' : 'Push results to designated Google Sheet tab',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Generator Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        {/* Target Automation URL Banner */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-base shrink-0 shadow">
              f
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">
                  {lang === 'bn' ? 'টার্গেট অটোমেশন ইউআরএল' : 'Target Automation URL'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ACTIVE PRESET
                </span>
              </div>
              <div className="text-xs font-mono text-cyan-300 mt-0.5 select-all">
                https://www.facebook.com/reg/?entry_point=login
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Fields Mapped: Firstname · Surname · Birthday (25-30) · Gender · Phone · Pass</span>
          </div>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">{t.workflowTitle}</h3>
          </div>
          <span className="text-xs text-cyan-400 font-mono">
            {lang === 'bn' ? 'বয়স কঠোরভাবে ২৫–৩০ বছরের মধ্যে সীমাবদ্ধ' : 'Age strictly 25–30 years'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* Origin */}
          <div>
            <label className="text-xs text-slate-400 font-medium">{t.nameLanguage}</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value as any)}
              className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="bd">{t.bangladeshiNames}</option>
              <option value="western">{t.westernNames}</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs text-slate-400 font-medium">{t.gender}</label>
            <select
              value={genderPref}
              onChange={(e) => setGenderPref(e.target.value as any)}
              className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="both">{t.genderBoth}</option>
              <option value="male">{t.genderMale}</option>
              <option value="female">{t.genderFemale}</option>
            </select>
          </div>

          {/* Age Slider (25 to 30 strictly) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 font-medium">{t.ageRange}</label>
              <span className="text-xs font-mono font-bold text-cyan-400">{ageRange} Years</span>
            </div>
            <input
              type="range"
              min={25}
              max={30}
              step={1}
              value={ageRange}
              onChange={(e) => setAgeRange(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>25 yrs</span>
              <span>27 yrs</span>
              <span>30 yrs</span>
            </div>
          </div>

          {/* Target Emulator Assignment */}
          <div>
            <label className="text-xs text-slate-400 font-medium">
              {lang === 'bn' ? 'টার্গেট এমুলেটর' : 'Target Emulator'}
            </label>
            <select
              value={targetEmulatorId}
              onChange={(e) => setTargetEmulatorId(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {emulators.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.adbSerial})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Generation Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{lang === 'bn' ? 'দ্রুত তৈরি করুন:' : 'Generate:'}</span>
            <button
              onClick={() => handleGenerateBatch(1)}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded border border-slate-800 transition-colors"
            >
              +1 Profile
            </button>
            <button
              onClick={() => handleGenerateBatch(5)}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded border border-slate-800 transition-colors"
            >
              +5 Profiles
            </button>
            <button
              onClick={() => handleGenerateBatch(10)}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs rounded border border-slate-800 transition-colors"
            >
              +10 Profiles
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 transition-colors"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? t.hidePassword : t.showPassword}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Profiles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{t.generatedProfiles}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'এখান থেকে যেকোনো প্রোফাইল সরাসরি টেস্ট এনভায়রনমেন্টে অটো-রান করা যাবে'
                : 'Preview generated test identity profiles ready for automation execution'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{previewProfiles.length} items</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2 px-3">Test ID</th>
                <th className="py-2 px-3">Full Name</th>
                <th className="py-2 px-3">Gender</th>
                <th className="py-2 px-3">Age (25-30)</th>
                <th className="py-2 px-3">Password</th>
                <th className="py-2 px-3">Assigned Emu</th>
                <th className="py-2 px-3 text-right">Execute</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {previewProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-cyan-400">{p.testId}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span>{p.fullName}</span>
                      <button
                        onClick={() => handleCopy(p.fullName, `fn-${p.id}`)}
                        className="text-slate-500 hover:text-slate-300"
                        title="Copy name"
                      >
                        {copiedId === `fn-${p.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 capitalize text-slate-300">{p.gender}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">{p.age} yrs</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {showPasswords ? p.password : '••••••••••••'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                    {targetEmulatorId}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onRunWorkflow(p, targetEmulatorId)}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded transition-colors inline-flex items-center gap-1 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{lang === 'bn' ? 'অটো-রান' : 'Auto-Run'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Workflow Steps Timeline (Section 4 & 10) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-100">{t.workflowStepsTitle}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'প্রতিটি এমুলেটরে স্বয়ংক্রিয়ভাবে ধাপ ১ থেকে ধাপ ৮ পর্যন্ত সম্পন্ন হয়'
              : 'End-to-end automated sequence triggered on each connected emulator'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      STEP {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
