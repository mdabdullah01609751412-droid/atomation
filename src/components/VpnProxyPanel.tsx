import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Radio,
  Plus,
  RotateCw,
  Activity,
  CheckCircle2,
  Trash2,
  Zap,
} from 'lucide-react';
import { EmulatorDevice, Language, ProxyItem } from '../types';
import { translations } from '../utils/translations';

interface VpnProxyPanelProps {
  proxies: ProxyItem[];
  emulators: EmulatorDevice[];
  vpnEnabled: boolean;
  vpnIp: string;
  lang: Language;
  onToggleVpn: () => void;
  onRotateIp: () => void;
  onAddProxy: (proxy: Omit<ProxyItem, 'id' | 'status' | 'latencyMs'>) => void;
  onDeleteProxy: (id: string) => void;
  onAssignProxyToEmulator: (proxyId: string, emulatorId: string) => void;
  onTestProxy: (id: string) => void;
}

export const VpnProxyPanel: React.FC<VpnProxyPanelProps> = ({
  proxies,
  emulators,
  vpnEnabled,
  vpnIp,
  lang,
  onToggleVpn,
  onRotateIp,
  onAddProxy,
  onDeleteProxy,
  onAssignProxyToEmulator,
  onTestProxy,
}) => {
  const t = translations[lang];

  // New Proxy Form state
  const [newType, setNewType] = useState<'HTTP' | 'HTTPS' | 'SOCKS5'>('SOCKS5');
  const [newHost, setNewHost] = useState('');
  const [newPort, setNewPort] = useState('1080');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [newCountryCode, setNewCountryCode] = useState('US');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHost || !newPort) return;

    onAddProxy({
      type: newType,
      host: newHost.trim(),
      port: parseInt(newPort, 10),
      username: newUsername.trim() || undefined,
      password: newPassword.trim() || undefined,
      ip: newHost.trim(),
      country: newCountry,
      countryCode: newCountryCode,
    });

    setNewHost('');
    setNewPort('1080');
    setNewUsername('');
    setNewPassword('');
  };

  return (
    <div className="space-y-6">
      {/* VPN Master Switch Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">{t.proxyTitle}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn'
                ? 'হোস্ট পিসির গ্লোবাল ভিপিএন টানেল এবং প্রতিটি এমুলেটরের জন্য আলাদা প্রক্সি রাউটিং'
                : 'Host system VPN tunnel and per-emulator dedicated SOCKS5/HTTP proxy binding'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRotateIp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{t.rotateIp}</span>
            </button>

            {/* VPN Toggle */}
            <button
              onClick={onToggleVpn}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                vpnEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-600/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${vpnEnabled ? 'animate-pulse' : ''}`} />
              <span>
                {t.vpnToggle}: {vpnEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
              </span>
            </button>
          </div>
        </div>

        {/* Live Network Telemetry Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{t.currentVpnIp}</span>
            <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5 block truncate">
              {vpnEnabled ? vpnIp : '103.151.125.10 (Local)'}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{t.ispName}</span>
            <span className="text-sm font-semibold text-slate-200 mt-0.5 block truncate">
              {vpnEnabled ? 'Cloudflare Warp Business' : 'Link3 Technologies Ltd.'}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{t.webrtcLeak}</span>
            <span className="text-xs font-medium text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.protected}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Active Proxy Pool</span>
            <span className="text-sm font-mono font-bold text-purple-300 mt-0.5 block">
              {proxies.length} Proxies (100% Live)
            </span>
          </div>
        </div>
      </div>

      {/* Add New Proxy Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800 mb-3">
          {t.addProxyBtn}
        </h4>

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="SOCKS5">SOCKS5</option>
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="text-[11px] text-slate-400 block mb-1">{t.proxyHost}</label>
            <input
              type="text"
              placeholder="e.g. 194.26.29.110"
              value={newHost}
              onChange={(e) => setNewHost(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">{t.proxyPort}</label>
            <input
              type="number"
              placeholder="1080"
              value={newPort}
              onChange={(e) => setNewPort(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Country</label>
            <select
              value={newCountry}
              onChange={(e) => {
                setNewCountry(e.target.value);
                setNewCountryCode(e.target.value === 'Bangladesh' ? 'BD' : 'US');
              }}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="United States">United States 🇺🇸</option>
              <option value="Bangladesh">Bangladesh 🇧🇩</option>
              <option value="United Kingdom">United Kingdom 🇬🇧</option>
              <option value="Germany">Germany 🇩🇪</option>
              <option value="Netherlands">Netherlands 🇳🇱</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'যুক্ত করুন' : 'Add Proxy'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Proxy List & Per-Emulator Binding */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{t.proxyList}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'প্রতিটি এমুলেটরে নির্ধারিত আইপি অ্যাসাইন করা হয় যাতে কোনো ব্যান না আসে'
                : 'Bind isolated proxy IPs to specific emulator instances to prevent fingerprint overlap'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{proxies.length} Nodes</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Proxy Server Address</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">{t.proxyLatency}</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Bound Emulator</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {proxies.map((prx) => (
                <tr key={prx.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] font-bold">
                      {prx.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {prx.host}:{prx.port}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {prx.country} ({prx.countryCode})
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    <span
                      className={
                        prx.latencyMs < 50
                          ? 'text-emerald-400'
                          : prx.latencyMs < 100
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {prx.latencyMs}ms
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Live
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={prx.assignedEmulatorId || ''}
                      onChange={(e) => onAssignProxyToEmulator(prx.id, e.target.value)}
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="">(None / Shared)</option>
                      {emulators.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onTestProxy(prx.id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] border border-slate-700"
                      >
                        Ping
                      </button>
                      <button
                        onClick={() => onDeleteProxy(prx.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                        title="Remove proxy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
