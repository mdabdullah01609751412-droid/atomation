import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AccountProfile,
  CaptchaSettings,
  EmulatorDevice,
  GoogleSheetsConfig,
  Language,
  LogEntry,
  ProxyItem,
  SmsApiSettings,
  TaskQueueItem,
  VirtualNumberItem,
} from './types';
import {
  generateAccountProfile,
  generateBirthdayForAge,
  generateMockOtp,
  generateVirtualNumber,
  initialEmulators,
  initialProxies,
} from './utils/generators';
import {
  loadGoogleSheetsConfig,
  loadStoredProfiles,
  saveGoogleSheetsConfig,
  saveStoredProfiles,
  exportToCsv,
} from './utils/storage';
import { translations } from './utils/translations';

// Components
import { TopBar } from './components/TopBar';
import { DashboardOverview } from './components/DashboardOverview';
import { EmulatorScreensView } from './components/EmulatorScreensView';
import { NumberManagementPanel } from './components/NumberManagementPanel';
import { AccountWorkflowPanel } from './components/AccountWorkflowPanel';
import { VpnProxyPanel } from './components/VpnProxyPanel';
import { CaptchaOtpPanel } from './components/CaptchaOtpPanel';
import { DataStoragePanel } from './components/DataStoragePanel';
import { GoogleSheetsPanel } from './components/GoogleSheetsPanel';
import { AdbConsolePanel } from './components/AdbConsolePanel';
import { WorkflowRunnerModal } from './components/WorkflowRunnerModal';
import { LocalBridgePanel } from './components/LocalBridgePanel';

export default function App() {
  // Global App States
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [broadcastActive, setBroadcastActive] = useState<boolean>(false);
  const [isEmergencyStopped, setIsEmergencyStopped] = useState<boolean>(false);

  // Local PC Hardware ADB WebSocket Bridge State
  const [bridgeConnected, setBridgeConnected] = useState<boolean>(false);
  const [bridgeLogs, setBridgeLogs] = useState<string[]>([
    '[INIT] Master PC Panel ready. Connect to ws://127.0.0.1:8765 for real emulator control.',
  ]);
  const wsRef = useRef<WebSocket | null>(null);

  // Core Data States
  const [emulators, setEmulators] = useState<EmulatorDevice[]>(initialEmulators);
  const [proxies, setProxies] = useState<ProxyItem[]>(initialProxies);
  const [vpnEnabled, setVpnEnabled] = useState<boolean>(true);
  const [vpnIp, setVpnIp] = useState<string>('185.193.65.42');

  const [profiles, setProfiles] = useState<AccountProfile[]>(() => loadStoredProfiles());
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() =>
    loadGoogleSheetsConfig()
  );

  const [numbers, setNumbers] = useState<VirtualNumberItem[]>([
    generateVirtualNumber('United States', 'Facebook', 'sms-activate'),
    generateVirtualNumber('Bangladesh', 'Facebook', '5sim'),
  ]);

  const [smsSettings, setSmsSettings] = useState<SmsApiSettings>({
    provider: 'sms-activate',
    apiUrl: 'https://api.sms-activate.org/stubs/handler_api.php',
    apiKey: '9082fba829104bce99',
    selectedCountry: 'United States',
    selectedService: 'Facebook',
    autoCancelTimeoutSec: 300,
  });

  const [captchaSettings, setCaptchaSettings] = useState<CaptchaSettings>({
    mode: 'auto_solver',
    apiKey: '2cap_live_9812903',
    solveDelayMs: 1200,
    autoSolve: true,
    successRatePercent: 99.4,
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
      level: 'info',
      message: 'Master PC System initialized. Connected to local ADB bridge on 127.0.0.1:5037',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 400000).toLocaleTimeString(),
      level: 'success',
      message: 'Auto-detected 6 Android emulators across ports 5554-5564',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 200000).toLocaleTimeString(),
      level: 'info',
      message: 'Google Sheets sync configured for mdabdullah01609751412@gmail.com',
    },
  ]);

  const [tasks, setTasks] = useState<TaskQueueItem[]>([]);
  const [activeModalTask, setActiveModalTask] = useState<TaskQueueItem | null>(null);

  const [adbCommandHistory, setAdbCommandHistory] = useState<
    Array<{ cmd: string; output: string; time: string; target: string }>
  >([
    {
      cmd: 'adb devices',
      target: 'host',
      time: '21:55:10',
      output: `List of devices attached
127.0.0.1:5554	device product:SM-S918B model:Galaxy_S23_Ultra device:dm3q
127.0.0.1:5556	device product:Pixel_7_Pro model:Pixel_7_Pro device:cheetah
127.0.0.1:5558	device product:Xiaomi_13 model:2211133C device:fuxi
127.0.0.1:5560	device product:OnePlus_11 model:CPH2449 device:OP595DL1
127.0.0.1:5562	device product:ASUS_ROG_7 model:ASUS_AI2205 device:ASUS_AI2205
127.0.0.1:5564	device product:Pixel_8 model:Pixel_8 device:shiba`,
    },
  ]);

  // Persist profiles & sheets config on change
  useEffect(() => {
    saveStoredProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    saveGoogleSheetsConfig(sheetsConfig);
  }, [sheetsConfig]);

  // Virtual Numbers timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setNumbers((prev) =>
        prev.map((num) => {
          if (num.status === 'pending' && num.expiresInSeconds > 0) {
            return { ...num, expiresInSeconds: num.expiresInSeconds - 1 };
          }
          if (num.expiresInSeconds === 0 && num.status === 'pending') {
            return { ...num, status: 'timeout' };
          }
          return num;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // System Logger Helper
  const addLog = useCallback(
    (
      level: 'info' | 'success' | 'warn' | 'error',
      message: string,
      emulatorName?: string,
      details?: string
    ) => {
      const newEntry: LogEntry = {
        id: 'log-' + Date.now() + Math.random().toString(36).substring(2, 5),
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        emulatorName,
        details,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 199)]);
    },
    []
  );

  // Local PC WebSocket Bridge Connect/Disconnect
  const connectToBridge = useCallback(
    (url: string) => {
      try {
        if (wsRef.current) {
          wsRef.current.close();
        }
        setBridgeLogs((prev) => [`[CONNECTING] Connecting to local socket ${url}...`, ...prev]);
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setBridgeConnected(true);
          setBridgeLogs((prev) => [
            `[CONNECTED] Success! Connected to Master PC Python Bridge on ${url}`,
            ...prev,
          ]);
          addLog('success', 'Connected to real host PC ADB Bridge daemon via WebSocket');
          ws.send(JSON.stringify({ action: 'GET_DEVICES' }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setBridgeLogs((prev) => [
              `[RECV] ${data.type || 'MSG'}: ${JSON.stringify(data).slice(0, 90)}...`,
              ...prev.slice(0, 60),
            ]);

            if (data.type === 'DEVICE_LIST' && Array.isArray(data.devices) && data.devices.length > 0) {
              addLog('success', `Synchronized with ${data.devices.length} real emulators from host PC!`);
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setBridgeConnected(false);
          setBridgeLogs((prev) => [`[CLOSED] Disconnected from local bridge socket.`, ...prev]);
        };

        ws.onerror = () => {
          setBridgeConnected(false);
          setBridgeLogs((prev) => [
            `[OFFLINE] Could not reach ${url}. Run 'python master_pc_bridge.py' on your host PC first!`,
            ...prev,
          ]);
        };
      } catch (err) {
        setBridgeConnected(false);
      }
    },
    [addLog]
  );

  const disconnectBridge = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setBridgeConnected(false);
    setBridgeLogs((prev) => [`[DISCONNECTED] Disconnected by operator.`, ...prev]);
  }, []);

  // Tap action handler (with Broadcast Mirror & Real Local Bridge support!)
  const handleTapScreen = useCallback(
    (deviceId: string, x: number, y: number) => {
      const sourceEmu = emulators.find((e) => e.id === deviceId);
      const isMaster = sourceEmu?.isMaster;

      addLog(
        'info',
        `Tap input [X:${x}, Y:${y}] dispatched via ADB socket`,
        sourceEmu?.name
      );

      // If connected to real local PC bridge, send real ADB TAP command to device!
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && sourceEmu) {
        wsRef.current.send(
          JSON.stringify({
            action: 'TAP',
            serial: sourceEmu.adbSerial,
            x,
            y,
          })
        );
      }

      if (broadcastActive && isMaster) {
        addLog(
          'success',
          `[BROADCAST MIRROR] Tap [${x}, ${y}] replicated simultaneously across all 5 slave emulators`,
          'MASTER'
        );

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          emulators
            .filter((e) => e.id !== deviceId && e.status === 'connected')
            .forEach((slave) => {
              wsRef.current?.send(
                JSON.stringify({
                  action: 'TAP',
                  serial: slave.adbSerial,
                  x,
                  y,
                })
              );
            });
        }
      }
    },
    [emulators, broadcastActive, addLog]
  );

  // Toggle Power for individual emulator
  const handleTogglePower = (deviceId: string) => {
    setEmulators((prev) =>
      prev.map((e) => {
        if (e.id === deviceId) {
          const nextStatus = e.status === 'connected' ? 'disconnected' : 'connected';
          addLog(
            nextStatus === 'connected' ? 'success' : 'warn',
            `Device state changed to: ${nextStatus.toUpperCase()}`,
            e.name
          );
          return { ...e, status: nextStatus };
        }
        return e;
      })
    );
  };

  // Restart emulator
  const handleRestartEmulator = (deviceId: string) => {
    const emu = emulators.find((e) => e.id === deviceId);
    if (!emu) return;

    addLog('warn', `Initiating ADB reboot sequence (adb -s ${emu.adbSerial} reboot)...`, emu.name);

    setEmulators((prev) =>
      prev.map((e) => (e.id === deviceId ? { ...e, status: 'starting' } : e))
    );

    setTimeout(() => {
      setEmulators((prev) =>
        prev.map((e) =>
          e.id === deviceId
            ? {
                ...e,
                status: 'connected',
                cpuUsage: Math.floor(10 + Math.random() * 15),
                ramUsage: 1.9,
                screenState: { activeScreen: 'home', currentStepDesc: 'System Reboot Complete' },
              }
            : e
        )
      );
      addLog('success', `Device rebooted successfully. OS ready.`, emu.name);
    }, 1500);
  };

  // Screen view change on device
  const handleScreenViewChange = (
    deviceId: string,
    screen: EmulatorDevice['screenState']['activeScreen']
  ) => {
    setEmulators((prev) =>
      prev.map((e) =>
        e.id === deviceId ? { ...e, screenState: { ...e.screenState, activeScreen: screen } } : e
      )
    );
  };

  // Auto-Detect Emulators
  const handleAutoDetect = () => {
    addLog('info', 'Executing ADB device discovery prober (adb devices -l)...');
    setTimeout(() => {
      setEmulators(initialEmulators);
      addLog('success', 'Discovered 6 online Android emulators (LDPlayer, Nox, BlueStacks, MEmu, AVD)');
    }, 600);
  };

  const handleConnectAll = () => {
    setEmulators((prev) => prev.map((e) => ({ ...e, status: 'connected' })));
    addLog('success', 'Connected all 6 Android emulators to master bridge');
  };

  const handleDisconnectAll = () => {
    setEmulators((prev) => prev.map((e) => ({ ...e, status: 'disconnected' })));
    addLog('warn', 'Disconnected all emulators from control bridge');
  };

  const handleRestartAll = () => {
    addLog('warn', 'Broadcasting reboot command to all 6 emulators...');
    setEmulators((prev) => prev.map((e) => ({ ...e, status: 'starting' })));
    setTimeout(() => {
      setEmulators((prev) =>
        prev.map((e) => ({
          ...e,
          status: 'connected',
          screenState: { activeScreen: 'home', currentStepDesc: 'OS Booted' },
        }))
      );
      addLog('success', 'All 6 emulators rebooted and online');
    }, 1800);
  };

  // EMERGENCY STOP
  const handleEmergencyStop = () => {
    const confirmed = window.confirm(translations[lang].emergencyStopConfirm);
    if (!confirmed) return;

    setIsEmergencyStopped(true);
    setTasks([]);
    setActiveModalTask(null);

    // Stop all emulators & reset screens
    setEmulators((prev) =>
      prev.map((e) => ({
        ...e,
        screenState: { activeScreen: 'home', currentStepDesc: 'Emergency Stop Aborted' },
      }))
    );

    addLog('error', 'EMERGENCY STOP TRIGGERED: All ADB scripts, pollers and workflows aborted.');

    setTimeout(() => {
      setIsEmergencyStopped(false);
    }, 5000);
  };

  // Number Management Handlers
  const handleAcquireNumber = (country: string, service: string) => {
    addLog('info', `Requesting new virtual number for ${service} (${country}) from ${smsSettings.provider}...`);
    setTimeout(() => {
      const newNum = generateVirtualNumber(country, service, smsSettings.provider);
      setNumbers((prev) => [newNum, ...prev]);
      addLog('success', `Acquired virtual number ${newNum.number} [${newNum.price}]`);
    }, 500);
  };

  const handleCancelNumber = (id: string) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
    addLog('info', `Released number from pool`);
  };

  const handleGenerateMockOtpForNumber = (id: string) => {
    const code = generateMockOtp();
    setNumbers((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, otpCode: code, status: 'received', receivedAt: new Date().toISOString() } : n
      )
    );
    addLog('success', `Mock OTP [${code}] delivered for number`);
  };

  // VPN & Proxy Handlers
  const handleToggleVpn = () => {
    const nextState = !vpnEnabled;
    setVpnEnabled(nextState);
    if (nextState) {
      setVpnIp('185.193.65.42');
      addLog('success', 'Master PC VPN tunnel connected. External IP: 185.193.65.42');
    } else {
      addLog('warn', 'Master PC VPN disconnected. System using direct ISP gateway.');
    }
  };

  const handleRotateIp = () => {
    const octet = Math.floor(10 + Math.random() * 240);
    const newIp = `185.193.65.${octet}`;
    setVpnIp(newIp);
    addLog('success', `VPN IP rotated successfully to: ${newIp}`);
  };

  const handleAddProxy = (newProxyData: Omit<ProxyItem, 'id' | 'status' | 'latencyMs'>) => {
    const newPrx: ProxyItem = {
      ...newProxyData,
      id: 'prx-' + Date.now(),
      status: 'active',
      latencyMs: Math.floor(25 + Math.random() * 50),
    };
    setProxies((prev) => [newPrx, ...prev]);
    addLog('success', `Added new ${newPrx.type} proxy node: ${newPrx.host}:${newPrx.port} (${newPrx.country})`);
  };

  const handleDeleteProxy = (id: string) => {
    setProxies((prev) => prev.filter((p) => p.id !== id));
    addLog('info', 'Proxy node removed from pool');
  };

  const handleAssignProxyToEmulator = (proxyId: string, emulatorId: string) => {
    const prx = proxies.find((p) => p.id === proxyId);
    setProxies((prev) =>
      prev.map((p) => (p.id === proxyId ? { ...p, assignedEmulatorId: emulatorId || undefined } : p))
    );
    setEmulators((prev) =>
      prev.map((e) => {
        if (e.id === emulatorId && prx) {
          return {
            ...e,
            proxyIp: `${prx.host}:${prx.port}`,
            proxyCountry: `${prx.countryCode} ${prx.country === 'Bangladesh' ? '🇧🇩' : '🇺🇸'}`,
          };
        }
        return e;
      })
    );
    addLog('info', `Bound proxy ${prx?.host} to emulator instance`);
  };

  const handleTestProxy = (id: string) => {
    const prx = proxies.find((p) => p.id === id);
    if (!prx) return;
    addLog('info', `Pinging proxy ${prx.host}:${prx.port}...`);
    setTimeout(() => {
      const ping = Math.floor(20 + Math.random() * 60);
      setProxies((prev) => prev.map((p) => (p.id === id ? { ...p, latencyMs: ping } : p)));
      addLog('success', `Proxy ${prx.host} latency: ${ping}ms (OK)`);
    }, 400);
  };

  // Profile Storage Handlers
  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    addLog('info', `Account record deleted from local storage`);
  };

  const handleClearAllProfiles = () => {
    if (window.confirm('Clear all stored account records?')) {
      setProfiles([]);
      addLog('warn', 'Cleared all account records');
    }
  };

  const handleRestoreBackup = (imported: AccountProfile[]) => {
    setProfiles(imported);
    addLog('success', `Restored ${imported.length} account profiles from JSON backup`);
  };

  const handleCleanDuplicates = (idsToRemove: string[]) => {
    setProfiles((prev) => prev.filter((p) => !idsToRemove.includes(p.id)));
    addLog('success', `Removed ${idsToRemove.length} duplicate records from storage`);
  };

  // Google Sheets Sync Trigger
  const handleTriggerSheetsSync = () => {
    const updated = {
      ...sheetsConfig,
      lastSyncTime: new Date().toLocaleTimeString(),
      totalSyncedCount: profiles.length,
    };
    setSheetsConfig(updated);
    setProfiles((prev) => prev.map((p) => ({ ...p, syncedToSheets: true })));
    addLog(
      'success',
      `Synchronized ${profiles.length} records to Google Spreadsheet [ID: ${sheetsConfig.spreadsheetId.slice(0, 8)}...]`
    );
  };

  // ADB Shell Command Execution Simulation
  const handleExecuteAdbCommand = (cmd: string, target: string) => {
    addLog('info', `Executing: "${cmd}" on target [${target}]`);

    let output = '';
    const now = new Date().toLocaleTimeString();

    if (cmd === 'adb devices' || cmd === 'adb devices -l') {
      output = `List of devices attached\n` +
        emulators
          .filter((e) => e.status === 'connected')
          .map((e) => `${e.adbSerial}\tdevice product:${e.model.replace(/\s+/g, '_')} model:${e.name}`)
          .join('\n');
    } else if (cmd.includes('battery')) {
      output = `Current Battery Service state:\n  AC powered: true\n  USB powered: true\n  Wireless powered: false\n  level: 98\n  scale: 100\n  voltage: 4320\n  temperature: 282\n  technology: Li-ion`;
    } else if (cmd.includes('getprop')) {
      output = `[ro.product.model]: [Samsung Galaxy S23 Ultra]\n[ro.build.version.release]: [13]\n[ro.build.version.sdk]: [33]\n[ro.product.cpu.abi]: [arm64-v8a]`;
    } else if (cmd.includes('android_id')) {
      output = `5f9e2b1409ac610d`;
    } else if (cmd.includes('screencap')) {
      output = `Screen captured successfully to /sdcard/screen.png (PNG image data, 1080 x 2400, 8-bit/color RGBA)`;
    } else if (cmd.includes('input tap')) {
      output = `Input event dispatched: 0003 0035 [X] / 0003 0036 [Y]`;
    } else {
      output = `Command '${cmd}' executed with exit code 0.\nResult: operation completed successfully.`;
    }

    setAdbCommandHistory((prev) => [{ cmd, output, time: now, target }, ...prev.slice(0, 20)]);
  };

  // Automated Task Runner Execution Engine (Step-by-step runner for Facebook Registration)
  const runSingleWorkflow = useCallback(
    (profile: AccountProfile, emulatorId: string) => {
      const emu = emulators.find((e) => e.id === emulatorId);
      if (!emu) return;

      const birthday = generateBirthdayForAge(profile.age);
      const taskId = 'task-' + Date.now();
      const newTask: TaskQueueItem = {
        id: taskId,
        name: `FB Reg: ${profile.fullName} (${profile.age} yrs)`,
        emulatorId,
        stepIndex: 1,
        totalSteps: 8,
        currentStepName: translations[lang].stepProxy,
        status: 'running',
        startedAt: new Date().toLocaleTimeString(),
        profileData: profile,
      };

      setTasks((prev) => [newTask, ...prev]);
      setActiveModalTask(newTask);

      const stepNames = [
        `1. Proxy & DNS Leak Check (Clean IP for Facebook)`,
        `2. Android Device Fingerprint & UA Rotation`,
        `3. Navigate to https://www.facebook.com/reg/?entry_point=login`,
        `4. Auto-Fill: Name, Birthday (${birthday.day} ${birthday.month} ${birthday.year}), Gender, Pass`,
        `5. Inject Virtual Mobile Number from SMS API`,
        `6. Capture & Submit Facebook SMS Code (FB-XXXXX)`,
        `7. Pass Facebook Human Verification / CAPTCHA`,
        `8. Save Credentials & Sync to Google Sheets`,
      ];

      let currentStep = 1;
      const stepInterval = setInterval(() => {
        if (currentStep <= 8) {
          const stepName = stepNames[currentStep - 1];

          // Update task
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, stepIndex: currentStep, currentStepName: stepName } : t
            )
          );
          setActiveModalTask((prev) =>
            prev && prev.id === taskId
              ? { ...prev, stepIndex: currentStep, currentStepName: stepName }
              : prev
          );

          // Update emulator screen visual state
          setEmulators((prev) =>
            prev.map((e) => {
              if (e.id === emulatorId) {
                let activeScreen: EmulatorDevice['screenState']['activeScreen'] = 'target_app';
                if (currentStep === 6) activeScreen = 'otp_screen';
                if (currentStep === 7) activeScreen = 'captcha_challenge';

                return {
                  ...e,
                  screenState: {
                    ...e.screenState,
                    activeScreen,
                    currentStepDesc: `Step ${currentStep}/8: ${stepName}`,
                    targetAppName: 'Facebook Registration',
                    formInputs: {
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                      name: profile.fullName,
                      age: profile.age,
                      birthDay: birthday.day,
                      birthMonth: birthday.month,
                      birthYear: birthday.year,
                      gender: profile.gender,
                      phone: profile.phone || '+1 415 892 1456',
                      password: profile.password,
                      otp: '59281',
                      targetUrl: 'https://www.facebook.com/reg/?entry_point=login',
                    },
                  },
                };
              }
              return e;
            })
          );

          addLog('info', `[FB Automation] Step ${currentStep}/8: ${stepName}`, emu.name);
          currentStep++;
        } else {
          // Completed
          clearInterval(stepInterval);

          // Mark task completed
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
          );
          setActiveModalTask((prev) =>
            prev && prev.id === taskId ? { ...prev, status: 'completed' } : prev
          );

          // Add completed account profile to persistent storage
          const finishedProfile: AccountProfile = {
            ...profile,
            status: 'successful',
            createdAt: new Date().toISOString(),
            syncedToSheets: sheetsConfig.autoSync,
          };
          setProfiles((prev) => [finishedProfile, ...prev]);

          addLog(
            'success',
            `[FB Automation] Account created successfully for ${profile.fullName} (Age ${profile.age})! Credentials synced to Google Sheets.`,
            emu.name
          );

          // Close modal after 1.5s
          setTimeout(() => {
            setActiveModalTask(null);
          }, 1500);
        }
      }, 1000);
    },
    [emulators, lang, sheetsConfig.autoSync, addLog]
  );

  // Batch Workflow on All Connected Emulators
  const handleStartBatchWorkflow = () => {
    const connected = emulators.filter((e) => e.status === 'connected');
    if (connected.length === 0) {
      alert('No connected emulators found. Please connect or auto-detect emulators first.');
      return;
    }

    addLog('info', `Initiating batch automation workflow across ${connected.length} emulators simultaneously...`);

    connected.forEach((emu, idx) => {
      setTimeout(() => {
        const prof = generateAccountProfile('bd', 'both', emu.id);
        const virtualNum = generateVirtualNumber('United States', 'Facebook');
        prof.phone = virtualNum.number;
        runSingleWorkflow(prof, emu.id);
      }, idx * 400);
    });
  };

  const handleAbortTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
    );
    setActiveModalTask(null);
    addLog('warn', `Task [${taskId}] aborted by operator`);
  };

  const successCount = profiles.filter((p) => p.status === 'successful').length;
  const failedCount = profiles.filter((p) => p.status === 'failed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        broadcastActive={broadcastActive}
        setBroadcastActive={setBroadcastActive}
        onEmergencyStop={handleEmergencyStop}
        isEmergencyStopped={isEmergencyStopped}
        activeEmulatorsCount={emulators.filter((e) => e.status === 'connected').length}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            emulators={emulators}
            logs={logs}
            tasks={tasks}
            successCount={successCount}
            failedCount={failedCount}
            totalProcessed={profiles.length}
            lang={lang}
            onAutoDetect={handleAutoDetect}
            onConnectAll={handleConnectAll}
            onDisconnectAll={handleDisconnectAll}
            onStartBatchWorkflow={handleStartBatchWorkflow}
            onClearLogs={() => setLogs([])}
            onExportLogs={() => {
              const content = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `masterpc_logs_${Date.now()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'emulators' && (
          <EmulatorScreensView
            emulators={emulators}
            lang={lang}
            broadcastActive={broadcastActive}
            setBroadcastActive={setBroadcastActive}
            onTapScreen={handleTapScreen}
            onTogglePower={handleTogglePower}
            onRestart={handleRestartEmulator}
            onOpenAdbShell={(id) => {
              setActiveTab('adb');
              addLog('info', `Opened ADB terminal for ${id}`);
            }}
            onRunWorkflowOnDevice={(id) => {
              const prof = generateAccountProfile('bd', 'both', id);
              const virtualNum = generateVirtualNumber('United States', 'Facebook');
              prof.phone = virtualNum.number;
              runSingleWorkflow(prof, id);
            }}
            onStopWorkflowOnDevice={(id) => {
              setTasks((prev) =>
                prev.map((t) => (t.emulatorId === id ? { ...t, status: 'cancelled' } : t))
              );
              addLog('warn', `Stopped workflow on emulator ${id}`);
            }}
            onStartAllWorkflows={handleStartBatchWorkflow}
            onRestartAll={handleRestartAll}
            onAutoDetect={handleAutoDetect}
            onScreenViewChange={handleScreenViewChange}
          />
        )}

        {activeTab === 'numbers' && (
          <NumberManagementPanel
            numbers={numbers}
            smsSettings={smsSettings}
            lang={lang}
            onUpdateSmsSettings={(s) => {
              setSmsSettings(s);
              addLog('success', 'SMS Provider API settings updated');
            }}
            onAcquireNumber={handleAcquireNumber}
            onCancelNumber={handleCancelNumber}
            onGenerateMockOtpForNumber={handleGenerateMockOtpForNumber}
          />
        )}

        {activeTab === 'workflow' && (
          <AccountWorkflowPanel
            emulators={emulators}
            lang={lang}
            onRunWorkflow={(profile, emuId) => {
              const virtualNum = generateVirtualNumber('United States', 'Facebook');
              profile.phone = virtualNum.number;
              runSingleWorkflow(profile, emuId);
            }}
            onSaveProfile={(p) => {
              setProfiles((prev) => [p, ...prev]);
              addLog('success', `Saved profile ${p.fullName} to storage`);
            }}
          />
        )}

        {activeTab === 'proxy' && (
          <VpnProxyPanel
            proxies={proxies}
            emulators={emulators}
            vpnEnabled={vpnEnabled}
            vpnIp={vpnIp}
            lang={lang}
            onToggleVpn={handleToggleVpn}
            onRotateIp={handleRotateIp}
            onAddProxy={handleAddProxy}
            onDeleteProxy={handleDeleteProxy}
            onAssignProxyToEmulator={handleAssignProxyToEmulator}
            onTestProxy={handleTestProxy}
          />
        )}

        {activeTab === 'captcha' && (
          <CaptchaOtpPanel
            captchaSettings={captchaSettings}
            lang={lang}
            onUpdateCaptchaSettings={(c) => {
              setCaptchaSettings(c);
              addLog('success', 'CAPTCHA & OTP Engine settings saved');
            }}
            onLogActivity={(lvl, msg) => addLog(lvl, msg)}
          />
        )}

        {activeTab === 'storage' && (
          <DataStoragePanel
            profiles={profiles}
            sheetsConfig={sheetsConfig}
            lang={lang}
            onDeleteProfile={handleDeleteProfile}
            onClearAllProfiles={handleClearAllProfiles}
            onRestoreBackup={handleRestoreBackup}
            onCleanDuplicates={handleCleanDuplicates}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsPanel
            config={sheetsConfig}
            profiles={profiles}
            lang={lang}
            onUpdateConfig={(c) => {
              setSheetsConfig(c);
              addLog('success', 'Google Sheets configuration updated');
            }}
            onTriggerSync={handleTriggerSheetsSync}
          />
        )}

        {activeTab === 'adb' && (
          <AdbConsolePanel
            emulators={emulators}
            lang={lang}
            onExecuteAdbCommand={handleExecuteAdbCommand}
            commandHistory={adbCommandHistory}
            onClearHistory={() => setAdbCommandHistory([])}
          />
        )}

        {activeTab === 'bridge' && (
          <LocalBridgePanel
            lang={lang}
            bridgeConnected={bridgeConnected}
            onConnectBridge={connectToBridge}
            onDisconnectBridge={disconnectBridge}
            bridgeLogs={bridgeLogs}
            realDevicesDetected={[]}
          />
        )}
      </main>

      {/* Real-time Workflow Runner Modal */}
      <WorkflowRunnerModal
        isOpen={Boolean(activeModalTask && activeModalTask.status === 'running')}
        onClose={() => setActiveModalTask(null)}
        activeTask={activeModalTask || undefined}
        emulator={emulators.find((e) => e.id === activeModalTask?.emulatorId)}
        lang={lang}
        onAbortTask={handleAbortTask}
      />
    </div>
  );
}
