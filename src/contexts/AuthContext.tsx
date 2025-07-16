import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import { 
  AuthState, 
  User, 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData 
} from '@types/index';
import { authAPI } from '@services/apiService';

// Define action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string | null };

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    default:
      return state;
  }
};

// Context interface
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  USER: '@user',
  TOKEN: '@token',
} as const;

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Store token securely
  const storeToken = async (token: string) => {
    try {
      await Keychain.setInternetCredentials('auth_token', 'user', token);
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  };

  // Get stored token
  const getStoredToken = async (): Promise<string | null> => {
    try {
      const credentials = await Keychain.getInternetCredentials('auth_token');
      if (credentials) {
        return credentials.password;
      }
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  };

  // Remove stored token
  const removeStoredToken = async () => {
    try {
      await Keychain.resetInternetCredentials('auth_token');
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error removing stored token:', error);
    }
  };

  // Store user data
  const storeUser = async (user: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  };

  // Get stored user
  const getStoredUser = async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  };

  // Remove stored user
  const removeStoredUser = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error removing stored user:', error);
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        await storeToken(token);
        await storeUser(user);
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authAPI.register(data);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        await storeToken(token);
        await storeUser(user);
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if token exists
      if (state.token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local data
      await removeStoredToken();
      await removeStoredUser();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Reset password function
  const resetPassword = async (data: ResetPasswordData) => {
    try {
      const response = await authAPI.resetPassword(data);
      
      if (!response.success) {
        throw new Error(response.error || 'Password reset failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.success && response.data) {
        const updatedUser = response.data;
        await storeUser(updatedUser);
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      throw error;
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [storedToken, storedUser] = await Promise.all([
        getStoredToken(),
        getStoredUser(),
      ]);

      if (storedToken && storedUser) {
        // Verify token with server
        try {
          const response = await authAPI.verifyToken();
          
          if (response.success) {
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { user: storedUser, token: storedToken } 
            });
          } else {
            // Token is invalid, clear storage
            await removeStoredToken();
            await removeStoredUser();
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          // Network error, use cached data
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user: storedUser, token: storedToken } 
          });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Initialize auth state on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};