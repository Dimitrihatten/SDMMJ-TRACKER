// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  email: string;
}

// Tracking Item Types
export interface TrackingItem {
  id: string;
  title: string;
  description?: string;
  trackingNumber: string;
  status: TrackingStatus;
  category: TrackingCategory;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  location?: string;
  userId: string;
  statusHistory: StatusUpdate[];
  notes?: string;
}

export type TrackingStatus = 
  | 'pending'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed'
  | 'cancelled'
  | 'returned';

export type TrackingCategory = 
  | 'package'
  | 'document'
  | 'shipment'
  | 'order'
  | 'other';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface StatusUpdate {
  id: string;
  status: TrackingStatus;
  location?: string;
  description?: string;
  timestamp: string;
  isSystemGenerated: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrackingListResponse extends PaginatedResponse<TrackingItem> {}

// Navigation Types
export type RootStackParamList = {
  SplashScreen: undefined;
  AuthStack: undefined;
  MainTabs: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tracking: undefined;
  AddItem: { item?: TrackingItem };
  Profile: undefined;
};

export type TrackingStackParamList = {
  TrackingList: undefined;
  TrackingDetail: { itemId: string };
  AddTracking: { item?: TrackingItem };
  EditTracking: { item: TrackingItem };
};

// Form Types
export interface TrackingItemForm {
  title: string;
  description?: string;
  trackingNumber: string;
  category: TrackingCategory;
  priority: Priority;
  estimatedDelivery?: string;
  notes?: string;
}

// Filter and Search Types
export interface TrackingFilters {
  status?: TrackingStatus[];
  category?: TrackingCategory[];
  priority?: Priority[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Settings Types
export interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    statusUpdates: boolean;
    deliveryAlerts: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultCategory: TrackingCategory;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
}

// Notification Types
export interface PushNotificationData {
  title: string;
  body: string;
  data?: {
    type: 'status_update' | 'delivery_alert' | 'general';
    itemId?: string;
    [key: string]: any;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Stats and Analytics Types
export interface DashboardStats {
  totalItems: number;
  activeItems: number;
  deliveredItems: number;
  delayedItems: number;
  recentUpdates: StatusUpdate[];
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};