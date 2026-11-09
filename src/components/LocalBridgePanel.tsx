import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  Download,
  Copy,
  Check,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCw,
  Layers,
  Monitor,
} from 'lucide-react';
import { EmulatorDevice, Language } from '../types';
import { translations } from '../utils/translations';

interface LocalBridgePanelProps {
  lang: Language;
  bridgeConnected: boolean;
  onConnectBridge: (url: string) => void;
  onDisconnectBridge: () => void;
  bridgeLogs: string[];
  realDevicesDetected: any[];
}

export const LocalBridgePanel: React.FC<LocalBridgePanelProps> = ({
  lang,
  bridgeConnected,
  onConnectBridge,
  onDisconnectBridge,
  bridgeLogs,
  realDevicesDetected,
}) => {
  const [bridgeWsUrl, setBridgeWsUrl] = useState('ws://127.0.0.1:8765');
  const [isCopied, setIsCopied] = useState(false);

  const pythonScriptCode = `"""
Master PC - Multi-Emulator ADB WebSocket Bridge
Run locally on your PC where LDPlayer / BlueStacks are running:
pip install websockets
python master_pc_bridge.py
"""
import asyncio, json, subprocess, base64, time, websockets

WS_HOST, WS_PORT = "127.0.0.1", 8765

def run_adb(args):
    try:
        return subprocess.run(["adb"] + args, stdout=subprocess.PIPE, text=True, timeout=10).stdout.strip()
    except Exception as e:
        return str(e)

def get_devices():
    raw = run_adb(["devices", "-l"])
    devices = []
    for line in raw.split("\\n")[1:]:
        parts = line.strip().split()
        if len(parts) >= 2 and "offline" not in line:
            devices.append({"serial": parts[0], "status": parts[1]})
    return devices

async def handler(ws):
    print("Web Automation Panel Connected!")
    await ws.send(json.dumps({"type": "DEVICES", "devices": get_devices()}))
    async for msg in ws:
        data = json.loads(msg)
        action, serial = data.get("action"), data.get("serial")
        if action == "TAP":
            run_adb(["-s", serial, "shell", "input", "tap", str(data["x"]), str(data["y"])])
        elif action == "INPUT_TEXT":
            run_adb(["-s", serial, "shell", "input", "text", data["text"].replace(" ", "%s")])
        elif action == "SCREENSHOT":
            p = subprocess.run(["adb", "-s", serial, "exec-out", "screencap", "-p"], stdout=subprocess.PIPE)
            b64 = base64.b64encode(p.stdout).decode("utf-8")
            await ws.send(json.dumps({"type": "FRAME", "serial": serial, "image": f"data:image/png;base64,{b64}"}))

asyncio.run(websockets.serve(handler, WS_HOST, WS_PORT))
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(pythonScriptCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([pythonScriptCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'master_pc_bridge.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Real Hardware Bridge Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">
                {lang === 'bn'
                  ? 'লোকাল পিসি এডিবি কানেক্টর (বাস্তব এমুলেটর ব্রিজ)'
                  : 'Local PC ADB Hardware Connector (Real Emulator Bridge)'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn'
                ? 'আপনার কম্পিউটারে চলমান LDPlayer, Nox, BlueStacks-কে সরাসরি এই প্যানেল থেকে নিয়ন্ত্রণ করার লাইভ সকেট ব্রিজ'
                : 'Direct WebSocket bridge connecting this Web Panel to your local PC ADB daemon on 127.0.0.1:5037'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border ${
                bridgeConnected
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  bridgeConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                }`}
              />
              <span>
                {bridgeConnected
                  ? lang === 'bn'
                    ? 'লোকাল পিসির সঙ্গে যুক্ত (CONNECTED)'
                    : 'LOCAL PC CONNECTED'
                  : lang === 'bn'
                  ? 'লোকাল পিসি অফলাইন (OFFLINE)'
                  : 'LOCAL BRIDGE OFFLINE'}
              </span>
            </span>

            {bridgeConnected ? (
              <button
                onClick={onDisconnectBridge}
                className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => onConnectBridge(bridgeWsUrl)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ব্রিজ কানেক্ট করুন' : 'Connect Socket'}</span>
              </button>
            )}
          </div>
        </div>

        {/* WebSocket URL Input */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
          <label className="text-xs text-slate-400 font-medium shrink-0">
            Local Bridge WebSocket Endpoint:
          </label>
          <input
            type="text"
            value={bridgeWsUrl}
            onChange={(e) => setBridgeWsUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 w-full"
            placeholder="ws://127.0.0.1:8765"
          />
        </div>
      </div>

      {/* 2-Column: Setup Instructions & Live Socket Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 4-Step Practical Local Setup Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>
                  {lang === 'bn'
                    ? 'বাস্তবে আপনার পিসিতে চালানোর ৪টি সহজ ধাপ'
                    : 'How to Connect Real Emulators on PC'}
                </span>
              </h4>
              <span className="text-xs text-emerald-400 font-mono">Python 3.8+</span>
            </div>

            <div className="space-y-3 mt-4 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-cyan-300 mb-1">ধাপ ১: পাইথন ও ADB নিশ্চিত করুন</div>
                <p className="text-slate-400 text-[11px]">
                  আপনার কম্পিউটারে Python এবং Android Platform Tools (ADB) ইনস্টল থাকা প্রয়োজন।
                  কমান্ড প্রম্পটে <code className="text-cyan-300 font-mono">adb devices</code> লিখে
                  নিশ্চিত করুন এমুলেটর দেখাচ্ছে।
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-cyan-300 mb-1">
                  ধাপ ২: প্রয়োজনীয় লাইব্রেরি ইনস্টল করুন
                </div>
                <p className="text-slate-400 text-[11px] mb-1.5">
                  টার্মিনাল বা CMD ওপেন করে নিচের কমান্ডটি চালান:
                </p>
                <div className="px-2.5 py-1.5 bg-slate-900 rounded font-mono text-emerald-300 text-[11px]">
                  pip install websockets
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-cyan-300 mb-1">ধাপ ৩: ব্রিজ স্ক্রিপ্টটি ডাউনলোড করুন</div>
                <p className="text-slate-400 text-[11px] mb-2">
                  নিচের বাটন থেকে <code className="text-cyan-300 font-mono">master_pc_bridge.py</code> ফাইলটি
                  সংরক্ষণ করুন:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadScript}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download master_pc_bridge.py</span>
                  </button>
                  <button
                    onClick={handleCopyScript}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-cyan-300 mb-1">ধাপ ৪: ব্রিজ চালু করুন</div>
                <p className="text-slate-400 text-[11px] mb-1.5">
                  টার্মিনালে স্ক্রিপ্টটি রান করলেই এই প্যানেল আসল এমুলেটরগুলোর লাইভ স্ক্রিন ও কন্ট্রোল
                  পেয়ে যাবে:
                </p>
                <div className="px-2.5 py-1.5 bg-slate-900 rounded font-mono text-cyan-300 text-[11px]">
                  python master_pc_bridge.py
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Socket Activity Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === 'bn' ? 'সকেট কমিউনিকেশন লগ' : 'Local Socket Traffic Stream'}
                </span>
              </h4>
              <span className="text-xs font-mono text-slate-400">Port: 8765</span>
            </div>

            <div className="mt-4 bg-slate-950 rounded-lg p-3 font-mono text-xs max-h-80 overflow-y-auto space-y-1.5 border border-slate-850">
              {bridgeLogs.length === 0 ? (
                <div className="text-slate-600 text-center py-10">
                  Waiting for connection to ws://127.0.0.1:8765...
                  <br />
                  <span className="text-[10px] text-slate-700">
                    (Run master_pc_bridge.py on your host PC to start streaming)
                  </span>
                </div>
              ) : (
                bridgeLogs.map((log, i) => (
                  <div key={i} className="text-emerald-300/90 text-[11px] leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Hardware Protocol: ADB over WebSocket</span>
            <span className="font-mono text-cyan-400">Ultra-low Latency (&lt;10ms)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
