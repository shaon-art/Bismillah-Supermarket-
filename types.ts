
export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  unit: string;
  stock: number;
  description: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  address?: string;
  avatar?: string;
  isAdmin: boolean;
}

export interface SystemSettings {
  isStoreOpen: boolean;
  maintenanceMode: boolean;
  deliveryCharge: number;
  minOrderAmount: number;
  aiAssistantEnabled: boolean;
  broadcastMessage: string;
  // Branding Fields
  storeName: string;
  storeSlogan: string;
  storeLogo: string;
  supportPhone: string;
  // Global Offer Fields
  globalDiscountEnabled: boolean;
  globalDiscountPercentage: number;
  // Sync Fields
  autoSyncEnabled: boolean;
  lastSyncTimestamp: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

export type PaymentMethod = 'COD' | 'BKASH' | 'NAGAD';

export interface Address {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  details: string;
  isDefault: boolean;
}

export interface OrderItemSummary {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  itemsCount: number;
  items: OrderItemSummary[];
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    phone?: string;
    trxId?: string;
  };
  deliveryAddress?: Address;
}

export interface TrackingStep {
  title: string;
  description: string;
  time: string;
  isCompleted: boolean;
  isActive: boolean;
  icon: string;
}

export type Screen = 'AUTH' | 'HOME' | 'CATEGORIES' | 'CART' | 'PROFILE' | 'GUIDE' | 'PRODUCT_DETAIL' | 'ORDERS' | 'TRACKING' | 'SETTINGS' | 'COUPONS' | 'ADDRESS_LIST' | 'MESSAGES' | 'PRODUCT_MANAGEMENT' | 'USER_MANAGEMENT' | 'ADMIN_CONTROL' | 'CATEGORY_MANAGEMENT';
