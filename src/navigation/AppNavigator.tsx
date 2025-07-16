import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '@contexts/AuthContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '@types/index';

// Import screens
import LoadingScreen from '@screens/LoadingScreen';

// Auth screens
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';

// Main screens
import DashboardScreen from '@screens/main/DashboardScreen';
import TrackingScreen from '@screens/main/TrackingScreen';
import AddItemScreen from '@screens/main/AddItemScreen';
import ProfileScreen from '@screens/main/ProfileScreen';
import TrackingDetailScreen from '@screens/main/TrackingDetailScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack Navigator
const AuthStackNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Tracking':
              iconName = 'track-changes';
              break;
            case 'AddItem':
              iconName = 'add-circle';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1a237e',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#1a237e',
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <MainTab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />
      <MainTab.Screen 
        name="Tracking" 
        component={TrackingScreen}
        options={{
          title: 'My Tracking',
          tabBarLabel: 'Tracking',
        }}
      />
      <MainTab.Screen 
        name="AddItem" 
        component={AddItemScreen}
        options={{
          title: 'Add Item',
          tabBarLabel: 'Add',
          tabBarIconStyle: { 
            backgroundColor: '#1a237e', 
            borderRadius: 25,
            padding: 5,
          },
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </MainTab.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { state } = useAuth();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      {state.isLoading ? (
        // Show loading screen while checking auth state
        <RootStack.Screen name="SplashScreen" component={LoadingScreen} />
      ) : state.isAuthenticated ? (
        // User is authenticated, show main app
        <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
      ) : (
        // User is not authenticated, show auth stack
        <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default AppNavigator;