import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ApiResponse,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  User,
  TrackingItem,
  TrackingItemForm,
  TrackingListResponse,
  DashboardStats,
  TrackingFilters,
  UserSettings,
} from '@types/index';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://api.sdmmjtracker.com', // Replace with your actual API URL
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const { response, config } = error;
    
    console.error(`API Error: ${response?.status} ${config?.url}`, error.message);
    
    // Handle token expiration
    if (response?.status === 401) {
      try {
        await AsyncStorage.removeItem('@token');
        await AsyncStorage.removeItem('@user');
        // Redirect to login - this would typically trigger a navigation event
        console.log('Token expired, redirecting to login');
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
    
    // Retry logic for network errors
    if (!response && config && !config.metadata?.retryCount) {
      config.metadata = { retryCount: 1 };
      return apiClient.request(config);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleApiResponse = <T>(response: AxiosResponse): ApiResponse<T> => {
  return {
    success: true,
    data: response.data,
    message: response.data?.message,
  };
};

// Helper function to handle API errors
const handleApiError = (error: any): ApiResponse => {
  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      error: error.response.data?.message || error.response.data?.error || 'Server error',
      message: error.response.data?.message,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  } else {
    // Something else happened
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

// Authentication API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return handleApiResponse<{ user: User; token: string }>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  register: async (data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await apiClient.post('/auth/register', data);
      return handleApiResponse<{ user: User; token: string }>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/auth/logout');
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  verifyToken: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get('/auth/verify');
      return handleApiResponse<User>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return handleApiResponse<User>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Tracking API
export const trackingAPI = {
  getItems: async (filters?: TrackingFilters, page = 1, limit = 20): Promise<ApiResponse<TrackingListResponse>> => {
    try {
      const params = {
        page,
        limit,
        ...filters,
      };
      const response = await apiClient.get('/tracking', { params });
      return handleApiResponse<TrackingListResponse>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getItem: async (id: string): Promise<ApiResponse<TrackingItem>> => {
    try {
      const response = await apiClient.get(`/tracking/${id}`);
      return handleApiResponse<TrackingItem>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  createItem: async (data: TrackingItemForm): Promise<ApiResponse<TrackingItem>> => {
    try {
      const response = await apiClient.post('/tracking', data);
      return handleApiResponse<TrackingItem>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateItem: async (id: string, data: Partial<TrackingItemForm>): Promise<ApiResponse<TrackingItem>> => {
    try {
      const response = await apiClient.put(`/tracking/${id}`, data);
      return handleApiResponse<TrackingItem>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteItem: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/tracking/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  trackItem: async (trackingNumber: string): Promise<ApiResponse<TrackingItem>> => {
    try {
      const response = await apiClient.post('/tracking/track', { trackingNumber });
      return handleApiResponse<TrackingItem>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  refreshItem: async (id: string): Promise<ApiResponse<TrackingItem>> => {
    try {
      const response = await apiClient.post(`/tracking/${id}/refresh`);
      return handleApiResponse<TrackingItem>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return handleApiResponse<DashboardStats>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRecentItems: async (limit = 10): Promise<ApiResponse<TrackingItem[]>> => {
    try {
      const response = await apiClient.get('/dashboard/recent', { params: { limit } });
      return handleApiResponse<TrackingItem[]>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Settings API
export const settingsAPI = {
  getSettings: async (): Promise<ApiResponse<UserSettings>> => {
    try {
      const response = await apiClient.get('/settings');
      return handleApiResponse<UserSettings>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateSettings: async (settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> => {
    try {
      const response = await apiClient.put('/settings', settings);
      return handleApiResponse<UserSettings>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Notification API
export const notificationAPI = {
  updateDeviceToken: async (token: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/notifications/device-token', { token });
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getNotifications: async (page = 1, limit = 20): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get('/notifications', { params: { page, limit } });
      return handleApiResponse<any[]>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  markNotificationRead: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Setup function to initialize interceptors
export const setupInterceptors = () => {
  console.log('API interceptors initialized');
};

// Export the configured axios instance for custom requests
export { apiClient };

// Export default API object
export default {
  auth: authAPI,
  tracking: trackingAPI,
  dashboard: dashboardAPI,
  settings: settingsAPI,
  notifications: notificationAPI,
};