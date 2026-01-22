import { Product, Category, Order, Address, User, SystemSettings, CartItem } from '../types';
import { DUMMY_PRODUCTS, DUMMY_ORDERS, CATEGORIES } from '../constants';

// Storage Keys
const KEYS = {
  PRODUCTS: 'products_v1',
  CATEGORIES: 'categories_v1',
  ORDERS: 'orders_v1',
  USERS: 'users',
  ADDRESSES: 'addresses_v1',
  SETTINGS: 'systemSettings_v3',
  CART: 'cart',
  FAVORITES: 'favorites',
  RECENTLY_VIEWED: 'recentlyViewedIds',
  CURRENT_USER: 'currentUser',
  CURRENT_SCREEN: 'currentScreen',
  THEME: 'theme',
  LANG: 'lang',
  NOTIFICATIONS: 'notificationsEnabled',
  SOUNDS: 'soundsEnabled'
};

// Default Data (Fallback)
const DEFAULTS = {
  PRODUCTS: DUMMY_PRODUCTS,
  CATEGORIES: CATEGORIES,
  ORDERS: DUMMY_ORDERS,
  SETTINGS: {
    isStoreOpen: true,
    maintenanceMode: false,
    deliveryCharge: 50,
    minOrderAmount: 100,
    aiAssistantEnabled: true,
    broadcastMessage: "",
    storeName: "বিসমিল্লাহ সুপার মার্কেট",
    storeSlogan: "তাজা ও বিশুদ্ধ পণ্যের আস্থার প্রতীক",
    storeLogo: "https://raw.githubusercontent.com/BismillahSupermarket/Assets/main/logo.png",
    supportPhone: "01978501415",
    globalDiscountEnabled: false,
    globalDiscountPercentage: 10,
    autoSyncEnabled: true,
    lastSyncTimestamp: new Date().toISOString()
  }
};

export const storage = {
  // Initialize Persistent Storage (Native-like behavior)
  init: async (): Promise<boolean> => {
    if (typeof navigator === 'undefined') return false;
    
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
          const result = await navigator.storage.persist();
          console.log(`Storage Persistence Request: ${result ? 'GRANTED' : 'DENIED'}`);
          return result;
        }
        return isPersisted;
      } catch (e) {
        console.warn("Storage persistence check failed", e);
        return false;
      }
    }
    return false;
  },

  // Check Storage Usage
  getEstimate: async () => {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
      try {
        return await navigator.storage.estimate();
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Generic Load
  load: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}`, error);
      return defaultValue;
    }
  },

  // Generic Save
  save: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}`, error);
      // Handle quota exceeded
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        alert('মোবাইলের মেমোরি ফুল! অ্যাপের কিছু ডাটা ক্লিয়ার করুন অথবা ব্যাকআপ নিন।');
      }
    }
  },

  // Specific Loaders
  getProducts: () => storage.load<Product[]>(KEYS.PRODUCTS, DEFAULTS.PRODUCTS),
  getCategories: () => storage.load<Category[]>(KEYS.CATEGORIES, DEFAULTS.CATEGORIES),
  getOrders: () => storage.load<Order[]>(KEYS.ORDERS, DEFAULTS.ORDERS),
  getUsers: () => storage.load<User[]>(KEYS.USERS, []),
  getSettings: () => storage.load<SystemSettings>(KEYS.SETTINGS, DEFAULTS.SETTINGS as SystemSettings),
  
  // Backup Functionality (The "Soldier" feature)
  createBackup: () => {
    if (typeof window === 'undefined') return;
    
    const backupData = {
      timestamp: new Date().toISOString(),
      deviceInfo: navigator.userAgent,
      version: '1.0',
      data: {
        products: localStorage.getItem(KEYS.PRODUCTS),
        categories: localStorage.getItem(KEYS.CATEGORIES),
        orders: localStorage.getItem(KEYS.ORDERS),
        users: localStorage.getItem(KEYS.USERS),
        addresses: localStorage.getItem(KEYS.ADDRESSES),
        settings: localStorage.getItem(KEYS.SETTINGS),
      }
    };
    
    // Create Blob
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Trigger Download to Device Storage
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bismillah_Supermarket_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Restore Functionality
  restoreBackup: async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (json.data) {
            if (json.data.products) localStorage.setItem(KEYS.PRODUCTS, json.data.products);
            if (json.data.categories) localStorage.setItem(KEYS.CATEGORIES, json.data.categories);
            if (json.data.orders) localStorage.setItem(KEYS.ORDERS, json.data.orders);
            if (json.data.users) localStorage.setItem(KEYS.USERS, json.data.users);
            if (json.data.addresses) localStorage.setItem(KEYS.ADDRESSES, json.data.addresses);
            if (json.data.settings) localStorage.setItem(KEYS.SETTINGS, json.data.settings);
            resolve(true);
          } else {
            reject('Invalid backup file');
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }
};

export default storage;