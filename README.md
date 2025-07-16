# SDMMJ Tracker - Mobile App

A comprehensive React Native mobile application for tracking packages, shipments, and items with real-time updates, push notifications, and modern UI design.

## 🚀 Features

- **User Authentication**: Secure login, registration, and password reset
- **Real-time Tracking**: Track multiple items with live status updates
- **Push Notifications**: Firebase-powered notifications for status changes
- **Modern UI**: Clean, responsive design with animations
- **Cross-platform**: iOS and Android support
- **Offline Support**: Cached data for offline viewing
- **Search & Filter**: Advanced filtering and search capabilities
- **Dashboard Analytics**: Overview of tracking statistics

## 📱 Screenshots

[Add screenshots here when available]

## 🏗️ Architecture

### Project Structure
```
src/
├── contexts/           # React contexts for global state
│   ├── AuthContext.tsx # Authentication state management
│   └── NotificationContext.tsx # Notification management
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx # Main navigation setup
├── screens/           # Screen components
│   ├── auth/          # Authentication screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   ├── main/          # Main app screens
│   │   ├── DashboardScreen.tsx
│   │   ├── TrackingScreen.tsx
│   │   ├── AddItemScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── LoadingScreen.tsx
├── services/          # API and external services
│   ├── apiService.ts  # Backend API communication
│   └── notificationService.ts # Push notification handling
├── types/             # TypeScript type definitions
│   └── index.ts
└── utils/             # Utility functions and helpers
```

### Key Technologies

- **React Native 0.72+**: Core framework
- **TypeScript**: Type safety and better development experience
- **React Navigation 6**: Navigation and routing
- **React Hook Form**: Form validation and management
- **Firebase**: Push notifications and authentication
- **Axios**: HTTP client for API requests
- **AsyncStorage**: Local data persistence
- **React Native Keychain**: Secure credential storage
- **React Native Vector Icons**: Icon library
- **React Native Linear Gradient**: Beautiful gradients
- **React Native Animatable**: Smooth animations

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 16+ and npm/yarn
- React Native CLI or Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)
- Java Development Kit (JDK) 11+

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/sdmmj-tracker-mobile.git
cd sdmmj-tracker-mobile

# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
API_BASE_URL=https://api.sdmmjtracker.com
API_TIMEOUT=10000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_APP_ID=your-app-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789

# App Configuration
APP_VERSION=1.0.0
ENVIRONMENT=development
```

### 3. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and Cloud Messaging
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Place files in their respective platform directories:
   - Android: `android/app/google-services.json`
   - iOS: `ios/GoogleService-Info.plist`

### 4. Backend API Configuration

Update the API base URL in `src/services/apiService.ts`:

```typescript
const API_CONFIG = {
  BASE_URL: 'https://your-api-domain.com', // Replace with your API URL
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};
```

### 5. Icon and Asset Setup

The app uses vector icons. Ensure icons are properly linked:

```bash
# For React Native 0.60+, icons should auto-link
# If issues occur, manually link:
npx react-native link react-native-vector-icons
```

## 🚀 Running the App

### Development Mode

```bash
# Start Metro bundler
npm start

# Run on Android (ensure emulator/device is connected)
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on specific device
npx react-native run-android --deviceId=DEVICE_ID
npx react-native run-ios --simulator="iPhone 14"
```

### Building for Production

#### Android

```bash
# Generate signed APK
npm run build:android

# Generate AAB bundle for Play Store
cd android
./gradlew bundleRelease
```

#### iOS

```bash
# Build for iOS
npm run build:ios

# Or use Xcode for more control
open ios/SDMMJTracker.xcworkspace
```

## 🔧 Configuration

### API Integration

The app communicates with a backend API. Key endpoints expected:

```typescript
// Authentication
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/reset-password
GET  /auth/verify
PUT  /auth/profile

// Tracking
GET    /tracking              # Get all tracking items
GET    /tracking/:id          # Get specific item
POST   /tracking              # Create new item
PUT    /tracking/:id          # Update item
DELETE /tracking/:id          # Delete item
POST   /tracking/track        # Track by number
POST   /tracking/:id/refresh  # Refresh item status

// Dashboard
GET /dashboard/stats          # Get dashboard statistics
GET /dashboard/recent         # Get recent items

// Notifications
POST /notifications/device-token  # Update FCM token
GET  /notifications               # Get notifications
PUT  /notifications/:id/read      # Mark as read
```

### Push Notifications

The app supports Firebase Cloud Messaging (FCM) for push notifications:

1. **Status Updates**: When tracking status changes
2. **Delivery Alerts**: When items are delivered
3. **General Notifications**: App updates and announcements

### Customization

#### Colors and Theming

Update colors in screen styles or create a theme file:

```typescript
// Example color scheme
const colors = {
  primary: '#1a237e',
  secondary: '#3949ab',
  accent: '#ff6b35',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
};
```

#### App Icon and Splash Screen

1. Replace icons in `assets/` directory
2. Update `app.json` configuration
3. Regenerate platform-specific icons:

```bash
# Use tools like app-icon or manually replace:
# Android: android/app/src/main/res/mipmap-*/
# iOS: ios/SDMMJTracker/Images.xcassets/AppIcon.appiconset/
```

## 🔐 Security Considerations

### Secure Storage
- Authentication tokens stored in React Native Keychain
- Sensitive data encrypted before local storage
- Automatic token refresh and validation

### API Security
- JWT token-based authentication
- Request/response interceptors for token management
- Automatic logout on token expiration

### Data Privacy
- User data encrypted in transit (HTTPS)
- Local data minimization
- Secure logout clears all stored data

## 🐛 Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Clear cache and restart
npx react-native start --reset-cache
```

#### Android Build Issues
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

#### iOS Build Issues
```bash
# Clean iOS build
cd ios
xcodebuild clean
pod install
cd ..
npm run ios
```

#### Icon/Font Issues
```bash
# Re-link native dependencies
npx react-native unlink react-native-vector-icons
npx react-native link react-native-vector-icons
```

### Performance Optimization

1. **Enable Hermes** (JavaScript engine):
   - Android: Already enabled in `android/app/build.gradle`
   - iOS: Enable in `ios/Podfile`

2. **Reduce Bundle Size**:
   - Use ProGuard for Android
   - Enable code splitting where possible

3. **Memory Management**:
   - Implement proper cleanup in useEffect hooks
   - Use FlatList for large data sets
   - Optimize images and assets

## 📱 Platform-Specific Notes

### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 33 (Android 13)
- Supports Android 5.0+

### iOS
- Minimum iOS Version: 11.0
- Supports iPhone 6s and newer
- iPad support included

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write unit tests for utility functions
- Test on both iOS and Android platforms
- Update README for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in this repository
- Email: support@sdmmjtracker.com
- Documentation: [docs.sdmmjtracker.com](https://docs.sdmmjtracker.com)

## 🚀 Deployment

### App Store (iOS)
1. Build archive in Xcode
2. Upload to App Store Connect
3. Submit for review

### Google Play Store (Android)
1. Generate signed AAB
2. Upload to Google Play Console
3. Submit for review

### Over-the-Air Updates
Consider implementing CodePush for instant updates without app store approval.

---

Built with ❤️ for the SDMMJ Tracker community