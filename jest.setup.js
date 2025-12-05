// jest.setup.js
// Полифилл для Buffer (нужен для tokenService)
global.Buffer = global.Buffer || require('buffer').Buffer;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = {};
  return {
    setItem: jest.fn((key, value) => {
      return new Promise((resolve) => {
        storage[key] = value;
        resolve();
      });
    }),
    getItem: jest.fn((key) => {
      return new Promise((resolve) => {
        resolve(storage[key] || null);
      });
    }),
    removeItem: jest.fn((key) => {
      return new Promise((resolve) => {
        delete storage[key];
        resolve();
      });
    }),
    clear: jest.fn(() => {
      return new Promise((resolve) => {
        Object.keys(storage).forEach(key => delete storage[key]);
        resolve();
      });
    }),
    getAllKeys: jest.fn(() => {
      return new Promise((resolve) => {
        resolve(Object.keys(storage));
      });
    }),
    multiGet: jest.fn((keys) => {
      return new Promise((resolve) => {
        resolve(keys.map(key => [key, storage[key] || null]));
      });
    }),
    multiSet: jest.fn((pairs) => {
      return new Promise((resolve) => {
        pairs.forEach(([key, value]) => {
          storage[key] = value;
        });
        resolve();
      });
    }),
    multiRemove: jest.fn((keys) => {
      return new Promise((resolve) => {
        keys.forEach(key => delete storage[key]);
        resolve();
      });
    }),
  };
});

// Mock Expo SQLite (для всех тестов, кроме database.test.ts)
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    runAsync: jest.fn(() => Promise.resolve()),
    getAllAsync: jest.fn(() => Promise.resolve([])),
    execAsync: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock Expo Crypto
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn((algorithm, data) => {
    // Простой мок хэша для тестов
    return Promise.resolve(
      Array.from(data)
        .map(char => char.charCodeAt(0).toString(16))
        .join('')
        .substring(0, 64)
    );
  }),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
}));

// Mock Expo SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock console methods to avoid noise in tests (опционально)
// Раскомментируйте если нужно подавить вывод в тестах
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Set __DEV__ to true for tests
global.__DEV__ = true;

