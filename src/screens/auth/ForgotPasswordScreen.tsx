import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '@contexts/AuthContext';
import { ResetPasswordData, AuthStackParamList } from '@types/index';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      await resetPassword(data);
      setIsEmailSent(true);
      Alert.alert(
        'Email Sent',
        'If an account with that email exists, we\'ve sent you password reset instructions.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert(
        'Reset Failed',
        error.message || 'An error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={['#1a237e', '#3949ab', '#5c6bc0']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <Icon name="lock-reset" size={60} color="#fff" />
            </View>
            <Text style={styles.welcomeText}>Reset Password</Text>
            <Text style={styles.subtitleText}>
              {isEmailSent 
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive reset instructions'
              }
            </Text>
          </Animatable.View>

          {/* Form */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={1000}
            delay={500}
            style={styles.formContainer}
          >
            {!isEmailSent ? (
              <>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.email && styles.inputError,
                        ]}
                        placeholder="Email Address"
                        placeholderTextColor="#999"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    )}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}

                {/* Reset Button */}
                <TouchableOpacity
                  style={[styles.resetButton, isLoading && styles.disabledButton]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#ff6b35', '#f7931e']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.resetButtonText}>
                      {isLoading ? 'Sending...' : 'Send Reset Email'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.successContainer}>
                <Icon name="check-circle" size={80} color="#4caf50" />
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successText}>
                  We've sent password reset instructions to your email address. 
                  Please check your inbox and follow the instructions to reset your password.
                </Text>
                <Text style={styles.noteText}>
                  Didn't receive the email? Check your spam folder or try again.
                </Text>
              </View>
            )}

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: -10,
    top: 0,
    padding: 10,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#ff4757',
  },
  errorText: {
    color: '#ff4757',
    fontSize: 14,
    marginBottom: 12,
    marginLeft: 4,
  },
  resetButton: {
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#1a237e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;