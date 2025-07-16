import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';

import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeNotifications } from './src/services/notificationService';
import { setupInterceptors } from './src/services/apiService';

// Ignore specific warnings for development
LogBox.ignoreLogs(['Warning: ...']);

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize notification services
        await initializeNotifications();
        
        // Setup API interceptors
        setupInterceptors();
        
        // Hide splash screen
        setTimeout(() => {
          SplashScreen.hide();
          setIsInitialized(true);
        }, 2000);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return null; // Splash screen is showing
  }

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#1a237e" 
        translucent={false}
      />
      <AuthProvider>
        <NotificationProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;