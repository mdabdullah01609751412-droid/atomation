export type Language = 'bn' | 'en';

export type EmulatorStatus = 'connected' | 'disconnected' | 'starting' | 'error' | 'stopped';

export interface EmulatorDevice {
  id: string; // e.g. "emu-1"
  name: string; // e.g. "LDPlayer-1" or "BlueStacks-1"
  adbSerial: string; // e.g. "127.0.0.1:5554"
  port: number; // 5554
  status: EmulatorStatus;
  model: string; // "Samsung Galaxy S23 Ultra"
  androidVersion: string; // "Android 13"
  ipAddress: string; // "192.168.1.105"
  proxyIp?: string;
  proxyCountry?: string;
  batteryLevel: number; // 85%
  cpuUsage: number; // 12%
  ramUsage: number; // 1.8 GB / 4 GB
  screenState: {
    activeScreen: 'home' | 'browser' | 'target_app' | 'captcha_challenge' | 'otp_screen' | 'settings';
    currentStepDesc?: string;
    targetAppName?: string;
    formInputs?: {
      firstName?: string;
      lastName?: string;
      name?: string;
      age?: number;
      birthDay?: number;
      birthMonth?: string;
      birthYear?: number;
      gender?: 'male' | 'female';
      phone?: string;
      email?: string;
      password?: string;
      otp?: string;
      targetUrl?: string;
    };
    captchaCompleted?: boolean;
    otpStatus?: 'waiting' | 'received' | 'verified' | 'failed';
  };
  currentTaskId?: string;
  isMaster?: boolean;
}

export type SmsProviderType = 'sms-activate' | '5sim' | 'onlinesim' | 'textverified' | 'custom';

export interface VirtualNumberItem {
  id: string;
  number: string;
  country: string;
  countryCode: string;
  flag: string;
  provider: SmsProviderType;
  service: string; // "WhatsApp", "Telegram", "Google", "Facebook"
  price: string;
  status: 'pending' | 'received' | 'timeout' | 'cancelled';
  otpCode?: string;
  receivedAt?: string;
  expiresInSeconds: number;
}

export interface AccountProfile {
  id: string;
  testId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: 'male' | 'female';
  age: number; // 25-30
  country: string;
  phone: string;
  password: string;
  email: string;
  proxyUsed: string;
  emulatorId: string;
  status: 'successful' | 'failed';
  errorReason?: string;
  createdAt: string;
  syncedToSheets: boolean;
}

export interface ProxyItem {
  id: string;
  type: 'HTTP' | 'HTTPS' | 'SOCKS5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  ip: string;
  country: string;
  countryCode: string;
  latencyMs: number;
  status: 'active' | 'dead' | 'checking';
  assignedEmulatorId?: string;
}

export interface GoogleSheetsConfig {
  sheetUrl: string;
  spreadsheetId: string;
  successTabName: string;
  failedTabName: string;
  adminEmail: string;
  autoSync: boolean;
  webhookUrl?: string;
  lastSyncTime?: string;
  totalSyncedCount: number;
}

export interface SmsApiSettings {
  provider: SmsProviderType;
  apiUrl: string;
  apiKey: string;
  selectedCountry: string;
  selectedService: string;
  autoCancelTimeoutSec: number;
}

export interface CaptchaSettings {
  mode: 'interactive_test' | 'auto_solver' | '2captcha_api' | 'anticaptcha_api';
  apiKey: string;
  solveDelayMs: number;
  autoSolve: boolean;
  successRatePercent: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  emulatorId?: string;
  emulatorName?: string;
  message: string;
  details?: string;
}

export interface TaskQueueItem {
  id: string;
  name: string;
  emulatorId: string;
  stepIndex: number;
  totalSteps: number;
  currentStepName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: string;
  profileData?: Partial<AccountProfile>;
  error?: string;
}

export interface AutomationSettings {
  loopCount: number;
  intervalMinutes: number;
  concurrentEmulators: number;
  autoRestartFrozen: boolean;
  emergencyStop: boolean;
  broadcastMirror: boolean; // Master touches mirror to all emulators
}
