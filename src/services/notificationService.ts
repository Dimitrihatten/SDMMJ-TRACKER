import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PushNotificationData } from '@types/index';
import { notificationAPI } from './apiService';

// Configure local notifications
const configureLocalNotifications = () => {
  PushNotification.configure({
    // Called when a notification is opened
    onNotification: function (notification) {
      console.log('Local notification received:', notification);
      
      // Handle notification tap
      if (notification.userInteraction) {
        // User tapped on notification
        handleNotificationTap(notification);
      }
    },

    // Android specific configuration
    requestPermissions: Platform.OS === 'ios',
    
    // Channel configuration for Android
    channelId: 'sdmmj-tracker-channel',
    channelName: 'SDMMJ Tracker Notifications',
    channelDescription: 'Notifications for tracking updates and alerts',
    
    // Sound and vibration
    playSound: true,
    soundName: 'default',
    vibrate: true,
    vibration: 300,
  });

  // Create notification channel for Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'sdmmj-tracker-channel',
        channelName: 'SDMMJ Tracker Notifications',
        channelDescription: 'Notifications for tracking updates and alerts',
        playSound: true,
        soundName: 'default',
        importance: 4, // High importance
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }
};

// Handle notification tap
const handleNotificationTap = (notification: any) => {
  const { data } = notification;
  
  if (data?.type && data?.itemId) {
    // Navigate to specific screen based on notification type
    switch (data.type) {
      case 'status_update':
      case 'delivery_alert':
        // Navigate to tracking detail screen
        // This would be handled by your navigation service
        console.log(`Navigate to tracking item: ${data.itemId}`);
        break;
      case 'general':
        // Navigate to dashboard or notifications screen
        console.log('Navigate to dashboard');
        break;
      default:
        console.log('Unknown notification type');
    }
  }
};

// Show local notification
const showLocalNotification = (data: PushNotificationData) => {
  const { title, body, data: notificationData } = data;
  
  PushNotification.localNotification({
    channelId: 'sdmmj-tracker-channel',
    title,
    message: body,
    playSound: true,
    soundName: 'default',
    vibrate: true,
    vibration: 300,
    
    // Custom data
    userInfo: notificationData,
    
    // Android specific
    largeIcon: 'ic_launcher',
    smallIcon: 'ic_notification',
    bigText: body,
    subText: 'SDMMJ Tracker',
    
    // iOS specific
    alertAction: 'view',
    category: notificationData?.type || 'general',
    
    // Auto cancel after tap
    autoCancel: true,
    
    // Show when app is in foreground
    ignoreInForeground: false,
  });
};

// Schedule local notification
const scheduleLocalNotification = (
  data: PushNotificationData,
  scheduleDate: Date
) => {
  const { title, body, data: notificationData } = data;
  
  PushNotification.localNotificationSchedule({
    channelId: 'sdmmj-tracker-channel',
    title,
    message: body,
    date: scheduleDate,
    
    // Custom data
    userInfo: notificationData,
    
    // Android specific
    largeIcon: 'ic_launcher',
    smallIcon: 'ic_notification',
    bigText: body,
    subText: 'SDMMJ Tracker',
    
    // iOS specific
    alertAction: 'view',
    category: notificationData?.type || 'general',
  });
};

// Cancel all local notifications
const cancelAllLocalNotifications = () => {
  PushNotification.cancelAllLocalNotifications();
};

// Cancel notification by ID
const cancelLocalNotification = (id: string) => {
  PushNotification.cancelLocalNotifications({ id });
};

// Get scheduled notifications
const getScheduledNotifications = (): Promise<any[]> => {
  return new Promise((resolve) => {
    PushNotification.getScheduledLocalNotifications((notifications) => {
      resolve(notifications);
    });
  });
};

// Update device token on server
const updateDeviceToken = async (token: string) => {
  try {
    await notificationAPI.updateDeviceToken(token);
    console.log('Device token updated on server');
  } catch (error) {
    console.error('Failed to update device token on server:', error);
  }
};

// Request notification permissions
const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      });
      
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } else {
      // Android - permissions are handled in the manifest and at runtime
      return true;
    }
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Check notification permissions
const checkNotificationPermissions = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().hasPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
           authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
};

// Get FCM token
const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Subscribe to FCM topic
const subscribeToTopic = async (topic: string) => {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
  }
};

// Unsubscribe from FCM topic
const unsubscribeFromTopic = async (topic: string) => {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`Error unsubscribing from topic ${topic}:`, error);
  }
};

// Initialize notification services
export const initializeNotifications = async () => {
  try {
    console.log('Initializing notification services...');
    
    // Configure local notifications
    configureLocalNotifications();
    
    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    
    if (hasPermission) {
      // Get and update FCM token
      const token = await getFCMToken();
      if (token) {
        await updateDeviceToken(token);
      }
      
      // Subscribe to general notifications topic
      await subscribeToTopic('general_notifications');
      
      console.log('Notification services initialized successfully');
    } else {
      console.log('Notification permissions not granted');
    }
  } catch (error) {
    console.error('Error initializing notification services:', error);
  }
};

// Notification service object
export const notificationService = {
  // Local notifications
  showLocalNotification,
  scheduleLocalNotification,
  cancelAllLocalNotifications,
  cancelLocalNotification,
  getScheduledNotifications,
  
  // Permissions
  requestNotificationPermissions,
  checkNotificationPermissions,
  
  // FCM
  getFCMToken,
  updateDeviceToken,
  subscribeToTopic,
  unsubscribeFromTopic,
  
  // Utility
  handleNotificationTap,
};

// Pre-defined notification templates
export const notificationTemplates = {
  statusUpdate: (itemTitle: string, status: string, itemId: string): PushNotificationData => ({
    title: 'Status Update',
    body: `${itemTitle} is now ${status}`,
    data: {
      type: 'status_update',
      itemId,
    },
  }),
  
  deliveryAlert: (itemTitle: string, itemId: string): PushNotificationData => ({
    title: 'Delivery Alert',
    body: `${itemTitle} has been delivered!`,
    data: {
      type: 'delivery_alert',
      itemId,
    },
  }),
  
  delayedItem: (itemTitle: string, itemId: string): PushNotificationData => ({
    title: 'Shipment Delayed',
    body: `${itemTitle} has been delayed. Check for updates.`,
    data: {
      type: 'status_update',
      itemId,
    },
  }),
  
  generalUpdate: (message: string): PushNotificationData => ({
    title: 'SDMMJ Tracker',
    body: message,
    data: {
      type: 'general',
    },
  }),
};

export default notificationService;