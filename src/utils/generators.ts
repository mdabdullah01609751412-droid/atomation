import { AccountProfile, EmulatorDevice, ProxyItem, VirtualNumberItem } from '../types';

// Authentic Bangladeshi & International names
export const bangladeshiMaleFirst = [
  'Tanvir', 'Shakib', 'Mahmud', 'Arif', 'Rakib', 'Habib', 'Sabbir', 'Nayeem', 
  'Kamrul', 'Hasan', 'Fahim', 'Mehedi', 'Rashed', 'Imran', 'Tamim', 'Riad'
];
export const bangladeshiFemaleFirst = [
  'Nusrat', 'Sadia', 'Fatima', 'Tanjila', 'Sabrina', 'Farhana', 'Ritu', 'Ayesha', 
  'Jannat', 'Sumaiya', 'Tasnim', 'Mim', 'Sharmin', 'Nabila', 'Afroza', 'Monira'
];
export const bangladeshiLastNames = [
  'Hossain', 'Ahmed', 'Islam', 'Rahman', 'Chowdhury', 'Khan', 'Sarker', 'Alam', 
  'Uddin', 'Mahmood', 'Hasan', 'Miah', 'Ali', 'Bhuiyan', 'Sheikh', 'Akter'
];

export const westernMaleFirst = [
  'James', 'Alexander', 'Ethan', 'Oliver', 'Lucas', 'Liam', 'Benjamin', 'Noah', 
  'Daniel', 'Henry', 'Mason', 'Sebastian', 'David', 'Jack', 'Julian', 'Logan'
];
export const westernFemaleFirst = [
  'Emma', 'Sophia', 'Olivia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 
  'Harper', 'Evelyn', 'Abigail', 'Emily', 'Ella', 'Grace', 'Chloe', 'Scarlett'
];
export const westernLastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'
];

/**
 * Generate age strictly between 25 and 30 years
 */
export function generateAge25to30(): number {
  return Math.floor(Math.random() * (30 - 25 + 1)) + 25;
}

/**
 * Generate password with uppercase, lowercase, numbers, and symbols
 */
export function generateSecurePassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*';

  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += symbols[Math.floor(Math.random() * symbols.length)];

  const allChars = upper + lower + digits + symbols;
  for (let i = 4; i < length; i++) {
    pwd += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle characters
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Generate realistic account profile
 */
export function generateAccountProfile(
  origin: 'bd' | 'western' = 'bd',
  genderPref: 'male' | 'female' | 'both' = 'both',
  emulatorId = 'emu-1'
): AccountProfile {
  const gender: 'male' | 'female' =
    genderPref === 'both' ? (Math.random() > 0.5 ? 'male' : 'female') : genderPref;

  let first = '';
  let last = '';

  if (origin === 'bd') {
    const list = gender === 'male' ? bangladeshiMaleFirst : bangladeshiFemaleFirst;
    first = list[Math.floor(Math.random() * list.length)];
    last = bangladeshiLastNames[Math.floor(Math.random() * bangladeshiLastNames.length)];
  } else {
    const list = gender === 'male' ? westernMaleFirst : westernFemaleFirst;
    first = list[Math.floor(Math.random() * list.length)];
    last = westernLastNames[Math.floor(Math.random() * westernLastNames.length)];
  }

  const fullName = `${first} ${last}`;
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${randomSuffix}@gmail.com`;
  const age = generateAge25to30();
  const password = generateSecurePassword(12);

  const testId = `TEST-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;

  return {
    id: 'acc-' + Math.random().toString(36).substring(2, 9),
    testId,
    firstName: first,
    lastName: last,
    fullName,
    gender,
    age,
    country: origin === 'bd' ? 'Bangladesh' : 'United States',
    phone: '',
    password,
    email,
    proxyUsed: '194.26.29.110:8080',
    emulatorId,
    status: 'successful',
    createdAt: new Date().toISOString(),
    syncedToSheets: false,
  };
}

/**
 * Generate virtual number with real looking international prefixes
 */
export function generateVirtualNumber(
  country = 'United States',
  service = 'WhatsApp',
  provider: 'sms-activate' | '5sim' | 'onlinesim' | 'textverified' | 'custom' = 'sms-activate'
): VirtualNumberItem {
  const id = 'num-' + Math.random().toString(36).substring(2, 9);
  let prefix = '+1';
  let flag = '🇺🇸';
  let countryCode = 'US';
  let price = '$0.35';

  if (country === 'Bangladesh') {
    prefix = '+8801';
    flag = '🇧🇩';
    countryCode = 'BD';
    price = '৳ 35';
  } else if (country === 'United Kingdom') {
    prefix = '+447';
    flag = '🇬🇧';
    countryCode = 'GB';
    price = '£0.40';
  } else if (country === 'India') {
    prefix = '+919';
    flag = '🇮🇳';
    countryCode = 'IN';
    price = '₹ 25';
  } else if (country === 'Germany') {
    prefix = '+4915';
    flag = '🇩🇪';
    countryCode = 'DE';
    price = '€0.45';
  }

  const remainingDigits = Math.floor(10000000 + Math.random() * 90000000);
  const number = `${prefix}${remainingDigits}`;

  return {
    id,
    number,
    country,
    countryCode,
    flag,
    provider,
    service,
    price,
    status: 'pending',
    expiresInSeconds: 300, // 5 minutes standard timeout
  };
}

/**
 * Generate 6-digit OTP code
 */
export function generateMockOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate Birthday for given age strictly in range 25-30
 */
export function generateBirthdayForAge(age: number): {
  day: number;
  month: string;
  monthIndex: number;
  year: number;
} {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mIndex = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  const year = 2026 - age; // e.g. age 27 in 2026 -> 1999
  return { day, month: months[mIndex], monthIndex: mIndex + 1, year };
}

/**
 * Initial set of Emulators (Supports 1, 2, 5, 6 active emulators)
 */
export const initialEmulators: EmulatorDevice[] = [
  {
    id: 'emu-1',
    name: 'LDPlayer-01 [Master]',
    adbSerial: '127.0.0.1:5554',
    port: 5554,
    status: 'connected',
    model: 'Samsung Galaxy S23 Ultra (SM-S918B)',
    androidVersion: 'Android 13 (API 33)',
    ipAddress: '192.168.1.101',
    proxyIp: '185.193.65.42:3128',
    proxyCountry: 'US 🇺🇸',
    batteryLevel: 98,
    cpuUsage: 14,
    ramUsage: 2.1,
    screenState: {
      activeScreen: 'target_app',
      currentStepDesc: 'Loaded: https://www.facebook.com/reg/?entry_point=login',
      targetAppName: 'Facebook Registration',
      formInputs: {
        firstName: 'Tanvir',
        lastName: 'Hossain',
        name: 'Tanvir Hossain',
        age: 27,
        birthDay: 14,
        birthMonth: 'Apr',
        birthYear: 1999,
        gender: 'male',
        phone: '+14159821456',
        password: 'Password#2026',
        targetUrl: 'https://www.facebook.com/reg/?entry_point=login',
      },
    },
    isMaster: true,
  },
  {
    id: 'emu-2',
    name: 'LDPlayer-02',
    adbSerial: '127.0.0.1:5556',
    port: 5556,
    status: 'connected',
    model: 'Google Pixel 7 Pro',
    androidVersion: 'Android 13 (API 33)',
    ipAddress: '192.168.1.102',
    proxyIp: '194.26.29.110:8080',
    proxyCountry: 'GB 🇬🇧',
    batteryLevel: 92,
    cpuUsage: 19,
    ramUsage: 2.4,
    screenState: {
      activeScreen: 'target_app',
      currentStepDesc: 'Awaiting Next Instruction',
      targetAppName: 'App Registration Workflow',
    },
    isMaster: false,
  },
  {
    id: 'emu-3',
    name: 'NoxPlayer-01',
    adbSerial: '127.0.0.1:5558',
    port: 5558,
    status: 'connected',
    model: 'Xiaomi 13 Pro',
    androidVersion: 'Android 12 (API 31)',
    ipAddress: '192.168.1.103',
    proxyIp: '45.142.122.88:9050',
    proxyCountry: 'DE 🇩🇪',
    batteryLevel: 88,
    cpuUsage: 22,
    ramUsage: 2.3,
    screenState: {
      activeScreen: 'home',
      currentStepDesc: 'Device Idle',
    },
    isMaster: false,
  },
  {
    id: 'emu-4',
    name: 'BlueStacks-01',
    adbSerial: '127.0.0.1:5560',
    port: 5560,
    status: 'connected',
    model: 'OnePlus 11 5G',
    androidVersion: 'Android 12 (API 32)',
    ipAddress: '192.168.1.104',
    proxyIp: '103.151.125.10:8080',
    proxyCountry: 'BD 🇧🇩',
    batteryLevel: 95,
    cpuUsage: 16,
    ramUsage: 2.2,
    screenState: {
      activeScreen: 'target_app',
      currentStepDesc: 'Account Provisioned',
    },
    isMaster: false,
  },
  {
    id: 'emu-5',
    name: 'MEmu-01',
    adbSerial: '127.0.0.1:5562',
    port: 5562,
    status: 'connected',
    model: 'ASUS ROG Phone 7',
    androidVersion: 'Android 13 (API 33)',
    ipAddress: '192.168.1.105',
    proxyIp: '185.220.101.5:443',
    proxyCountry: 'NL 🇳🇱',
    batteryLevel: 84,
    cpuUsage: 11,
    ramUsage: 1.9,
    screenState: {
      activeScreen: 'home',
      currentStepDesc: 'Standby Mode',
    },
    isMaster: false,
  },
  {
    id: 'emu-6',
    name: 'Android-AVD-01',
    adbSerial: '127.0.0.1:5564',
    port: 5564,
    status: 'connected',
    model: 'Google Pixel 8',
    androidVersion: 'Android 14 (API 34)',
    ipAddress: '192.168.1.106',
    proxyIp: '198.54.117.200:80',
    proxyCountry: 'US 🇺🇸',
    batteryLevel: 100,
    cpuUsage: 18,
    ramUsage: 2.5,
    screenState: {
      activeScreen: 'target_app',
      currentStepDesc: 'Awaiting Task Batch',
    },
    isMaster: false,
  },
];

/**
 * Initial Proxies
 */
export const initialProxies: ProxyItem[] = [
  {
    id: 'prx-1',
    type: 'SOCKS5',
    host: '185.193.65.42',
    port: 3128,
    ip: '185.193.65.42',
    country: 'United States',
    countryCode: 'US',
    latencyMs: 42,
    status: 'active',
    assignedEmulatorId: 'emu-1',
  },
  {
    id: 'prx-2',
    type: 'HTTP',
    host: '194.26.29.110',
    port: 8080,
    ip: '194.26.29.110',
    country: 'United Kingdom',
    countryCode: 'GB',
    latencyMs: 65,
    status: 'active',
    assignedEmulatorId: 'emu-2',
  },
  {
    id: 'prx-3',
    type: 'SOCKS5',
    host: '45.142.122.88',
    port: 9050,
    ip: '45.142.122.88',
    country: 'Germany',
    countryCode: 'DE',
    latencyMs: 78,
    status: 'active',
    assignedEmulatorId: 'emu-3',
  },
  {
    id: 'prx-4',
    type: 'HTTP',
    host: '103.151.125.10',
    port: 8080,
    ip: '103.151.125.10',
    country: 'Bangladesh',
    countryCode: 'BD',
    latencyMs: 28,
    status: 'active',
    assignedEmulatorId: 'emu-4',
  },
  {
    id: 'prx-5',
    type: 'HTTPS',
    host: '185.220.101.5',
    port: 443,
    ip: '185.220.101.5',
    country: 'Netherlands',
    countryCode: 'NL',
    latencyMs: 51,
    status: 'active',
    assignedEmulatorId: 'emu-5',
  },
  {
    id: 'prx-6',
    type: 'SOCKS5',
    host: '198.54.117.200',
    port: 1080,
    ip: '198.54.117.200',
    country: 'United States',
    countryCode: 'US',
    latencyMs: 88,
    status: 'active',
    assignedEmulatorId: 'emu-6',
  },
];
