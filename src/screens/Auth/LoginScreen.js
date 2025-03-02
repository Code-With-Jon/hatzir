import { auth } from '../../config/firebase';

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, googleLogin, appleLogin, registerForPushNotifications } from '../../redux/slices/authSlice';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../theme/colors';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
    }
  }, [error]);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId: '861494268063-h7p3r4tnqqdcgqe2ma6e0dfv7pilu7v0.apps.googleusercontent.com',
      iosClientId: '372676417589-1ugh97dvbq2vsfj77cugfsovuv5di2jq.apps.googleusercontent.com',
      offlineAccess: true,
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const userCredential = await dispatch(loginUser({ email, password })).unwrap();
      if (userCredential?.uid) {
        dispatch(registerForPushNotifications(userCredential.uid));
      }
    } catch (error) {
      // Error is handled by the useEffect above
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo;
      
      const userCredential = await dispatch(googleLogin(idToken)).unwrap();
      if (userCredential?.uid) {
        dispatch(registerForPushNotifications(userCredential.uid));
      } else {
        console.log('Google login successful but no uid available for push notifications');
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Operation in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available');
      } else {
        Alert.alert('Google Login Error', error.message);
      }
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const userCredential = await dispatch(appleLogin(credential)).unwrap();
      if (userCredential?.uid) {
        try {
          await dispatch(registerForPushNotifications(userCredential.uid));
        } catch (pushError) {
          console.log('Failed to register push notifications:', pushError);
          // Continue with login even if push registration fails
        }
      } else {
        console.log('Apple login successful but no uid available for push notifications');
      }
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        return;
      }
      console.error('Apple Login Error:', error);
      Alert.alert('Apple Login Error', error.message || 'Failed to login with Apple');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for instructions to reset your password'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send password reset email'
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.icon} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Login to your account
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="mail-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                enablesReturnKeyAutomatically={true}
                returnKeyType="next"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                enablesReturnKeyAutomatically={true}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.textSecondary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.buttonText} />
              ) : (
                <Text style={[styles.loginButtonText, { color: theme.buttonText }]}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Ionicons name="logo-google" size={20} color={theme.icon} />
              <Text style={[styles.googleButtonText, { color: theme.text }]}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <>
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR</Text>
                  <View style={styles.divider} />
                </View>

                <TouchableOpacity
                  style={styles.appleButton}
                  onPress={handleAppleLogin}
                >
                  <Ionicons name="logo-apple" size={20} color={theme.buttonText} />
                  <Text style={[styles.appleButtonText, { color: theme.buttonText }]}>
                    Continue with Apple
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: theme.text }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
    width: '100%',
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    width: '100%',
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    width: '100%',
    padding: 0,
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#e91e63',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#e91e63',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '600',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    height: 56,
  },
  appleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default LoginScreen; 