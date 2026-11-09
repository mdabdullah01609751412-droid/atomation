import { AccountProfile, GoogleSheetsConfig } from '../types';

const STORAGE_KEY_PROFILES = 'masterpc_profiles_v1';
const STORAGE_KEY_SHEETS = 'masterpc_sheets_cfg_v1';
const STORAGE_KEY_PROXIES = 'masterpc_proxies_v1';

export function loadStoredProfiles(): AccountProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load profiles from localStorage', e);
  }
  // Return initial seed records
  return [
    {
      id: 'acc-1',
      testId: 'TEST-982145-12',
      firstName: 'Tanvir',
      lastName: 'Hossain',
      fullName: 'Tanvir Hossain',
      gender: 'male',
      age: 27,
      country: 'Bangladesh',
      phone: '+8801712948301',
      password: 'Hossain#2026!k',
      email: 'tanvir.hossain492@gmail.com',
      proxyUsed: '103.151.125.10:8080',
      emulatorId: 'emu-1',
      status: 'successful',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      syncedToSheets: true,
    },
    {
      id: 'acc-2',
      testId: 'TEST-741295-88',
      firstName: 'Sadia',
      lastName: 'Islam',
      fullName: 'Sadia Islam',
      gender: 'female',
      age: 26,
      country: 'Bangladesh',
      phone: '+8801823901923',
      password: 'Islam#Sadia!29',
      email: 'sadia.islam812@gmail.com',
      proxyUsed: '194.26.29.110:8080',
      emulatorId: 'emu-2',
      status: 'successful',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      syncedToSheets: true,
    },
    {
      id: 'acc-3',
      testId: 'TEST-512039-44',
      firstName: 'Alexander',
      lastName: 'Miller',
      fullName: 'Alexander Miller',
      gender: 'male',
      age: 29,
      country: 'United States',
      phone: '+14158923019',
      password: 'Miller#99!Pass',
      email: 'alex.miller77@gmail.com',
      proxyUsed: '185.193.65.42:3128',
      emulatorId: 'emu-3',
      status: 'failed',
      errorReason: 'SMS OTP Timeout (Exceeded 300s window)',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      syncedToSheets: false,
    },
  ];
}

export function saveStoredProfiles(profiles: AccountProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles to localStorage', e);
  }
}

export function loadGoogleSheetsConfig(): GoogleSheetsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHEETS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load sheets config', e);
  }
  return {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    successTabName: 'Successful Accounts',
    failedTabName: 'Failed Accounts',
    adminEmail: 'mdabdullah01609751412@gmail.com',
    autoSync: true,
    totalSyncedCount: 2,
    lastSyncTime: new Date(Date.now() - 3600000).toLocaleTimeString(),
  };
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_SHEETS, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save sheets config', e);
  }
}

/**
 * Check for duplicate phone numbers or names
 */
export function findDuplicates(profiles: AccountProfile[]): {
  duplicatePhoneCount: number;
  duplicateNameCount: number;
  duplicateIds: string[];
} {
  const phoneMap = new Map<string, string[]>();
  const nameMap = new Map<string, string[]>();

  profiles.forEach((p) => {
    if (p.phone && p.phone.trim().length > 3) {
      const existing = phoneMap.get(p.phone) || [];
      existing.push(p.id);
      phoneMap.set(p.phone, existing);
    }
    if (p.fullName && p.fullName.trim().length > 0) {
      const existing = nameMap.get(p.fullName.toLowerCase()) || [];
      existing.push(p.id);
      nameMap.set(p.fullName.toLowerCase(), existing);
    }
  });

  const duplicateIdsSet = new Set<string>();
  let duplicatePhoneCount = 0;
  let duplicateNameCount = 0;

  phoneMap.forEach((ids) => {
    if (ids.length > 1) {
      duplicatePhoneCount += ids.length - 1;
      ids.slice(1).forEach((id) => duplicateIdsSet.add(id));
    }
  });

  nameMap.forEach((ids) => {
    if (ids.length > 1) {
      duplicateNameCount += ids.length - 1;
      ids.slice(1).forEach((id) => duplicateIdsSet.add(id));
    }
  });

  return {
    duplicatePhoneCount,
    duplicateNameCount,
    duplicateIds: Array.from(duplicateIdsSet),
  };
}

/**
 * Export data to CSV
 */
export function exportToCsv(profiles: AccountProfile[], filename = 'emulator_accounts_export.csv'): void {
  const headers = [
    'Test ID',
    'Full Name',
    'Gender',
    'Age',
    'Country',
    'Phone Number',
    'Password',
    'Email Address',
    'Proxy IP',
    'Emulator ID',
    'Status',
    'Error Reason',
    'Created At',
  ];

  const rows = profiles.map((p) => [
    p.testId,
    `"${p.fullName}"`,
    p.gender,
    p.age,
    `"${p.country}"`,
    `"${p.phone}"`,
    `"${p.password}"`,
    `"${p.email}"`,
    `"${p.proxyUsed}"`,
    p.emulatorId,
    p.status.toUpperCase(),
    `"${p.errorReason || 'None'}"`,
    `"${new Date(p.createdAt).toLocaleString()}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export complete database as JSON Backup
 */
export function exportDatabaseBackup(profiles: AccountProfile[], config: GoogleSheetsConfig): void {
  const data = {
    app: 'Master PC Multi-Emulator Automation Panel',
    version: '3.2.0',
    exportedAt: new Date().toISOString(),
    config,
    profiles,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `masterpc_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
