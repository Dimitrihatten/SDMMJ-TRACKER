import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

import { PushNotificationData } from '@types/index';
import { notificationService } from '@services/notificationService';

interface NotificationState {
  isEnabled: boolean;
  token: string | null;
  hasPermission: boolean;
  notifications: PushNotificationData[];
  unreadCount: number;
}

interface NotificationContextType {
  state: NotificationState;
  requestPermission: () => Promise<boolean>;
  updateToken: (token: string) => void;
  markAsRead: (notificationId?: string) => void;
  clearAll: () => void;
  sendLocalNotification: (data: PushNotificationData) => void;
}

const initialState: NotificationState = {
  isEnabled: false,
  token: null,
  hasPermission: false,
  notifications: [],
  unreadCount: 0,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotificationState>(initialState);

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      // For iOS
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          setState(prev => ({ ...prev, hasPermission: true, isEnabled: true }));
          return true;
        }
      }

      // For Android
      if (Platform.OS === 'android') {
        const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        const enabled = result === RESULTS.GRANTED;

        if (enabled) {
          setState(prev => ({ ...prev, hasPermission: true, isEnabled: true }));
          return true;
        }
      }

      setState(prev => ({ ...prev, hasPermission: false, isEnabled: false }));
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Update FCM token
  const updateToken = (token: string) => {
    setState(prev => ({ ...prev, token }));
    // Send token to your backend
    notificationService.updateDeviceToken(token);
  };

  // Mark notifications as read
  const markAsRead = (notificationId?: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif => 
        notificationId ? 
          (notif.data?.id === notificationId ? { ...notif, read: true } : notif) :
          { ...notif, read: true }
      ),
      unreadCount: notificationId ? 
        Math.max(0, prev.unreadCount - 1) : 
        0
    }));
  };

  // Clear all notifications
  const clearAll = () => {
    setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0,
    }));
  };

  // Send local notification
  const sendLocalNotification = (data: PushNotificationData) => {
    notificationService.showLocalNotification(data);
    
    // Add to local state
    setState(prev => ({
      ...prev,
      notifications: [data, ...prev.notifications],
      unreadCount: prev.unreadCount + 1,
    }));
  };

  // Handle foreground messages
  const handleForegroundMessage = (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('Foreground message received:', message);
    
    const notificationData: PushNotificationData = {
      title: message.notification?.title || 'New Update',
      body: message.notification?.body || 'You have a new notification',
      data: message.data as any,
    };

    // Show notification in foreground
    sendLocalNotification(notificationData);

    // Show alert for important notifications
    if (message.data?.type === 'delivery_alert') {
      Alert.alert(
        notificationData.title,
        notificationData.body,
        [
          { text: 'OK' },
          { 
            text: 'View', 
            onPress: () => {
              // Navigate to specific screen based on notification data
              // This would be handled by your navigation service
            }
          }
        ]
      );
    }
  };

  // Handle background messages
  const handleBackgroundMessage = (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('Background message received:', message);
    
    const notificationData: PushNotificationData = {
      title: message.notification?.title || 'New Update',
      body: message.notification?.body || 'You have a new notification',
      data: message.data as any,
    };

    // Add to local state when app becomes active
    setState(prev => ({
      ...prev,
      notifications: [notificationData, ...prev.notifications],
      unreadCount: prev.unreadCount + 1,
    }));
  };

  // Initialize notification services
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Check initial permission status
        const authStatus = await messaging().hasPermission();
        const hasPermission = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        setState(prev => ({ 
          ...prev, 
          hasPermission, 
          isEnabled: hasPermission 
        }));

        if (hasPermission) {
          // Get FCM token
          const token = await messaging().getToken();
          if (token) {
            updateToken(token);
          }
        }

        // Listen for token refresh
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
          updateToken(token);
        });

        // Listen for foreground messages
        const unsubscribeForeground = messaging().onMessage(handleForegroundMessage);

        // Listen for background messages (when app is backgrounded but not killed)
        messaging().setBackgroundMessageHandler(handleBackgroundMessage);

        // Handle notification opened app (when app was killed)
        messaging()
          .getInitialNotification()
          .then(remoteMessage => {
            if (remoteMessage) {
              console.log('Notification caused app to open from quit state:', remoteMessage);
              handleBackgroundMessage(remoteMessage);
            }
          });

        // Handle notification opened app (when app was backgrounded)
        const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('Notification caused app to open from background state:', remoteMessage);
          handleBackgroundMessage(remoteMessage);
        });

        return () => {
          unsubscribeTokenRefresh();
          unsubscribeForeground();
          unsubscribeNotificationOpened();
        };
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  const contextValue: NotificationContextType = {
    state,
    requestPermission,
    updateToken,
    markAsRead,
    clearAll,
    sendLocalNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};