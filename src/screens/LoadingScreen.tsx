import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const LoadingScreen: React.FC = () => {
  return (
    <LinearGradient
      colors={['#1a237e', '#3949ab', '#5c6bc0']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000}
          style={styles.logoContainer}
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>SDMMJ</Text>
            <Text style={styles.logoSubtext}>TRACKER</Text>
          </View>
        </Animatable.View>

        {/* Loading indicator */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000} 
          delay={500}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </Animatable.View>

        {/* Version info */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000} 
          delay={1000}
          style={styles.versionContainer}
        >
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animatable.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#fff',
    letterSpacing: 3,
    marginTop: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 15,
    fontWeight: '500',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default LoadingScreen;