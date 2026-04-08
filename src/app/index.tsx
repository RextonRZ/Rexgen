import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('screen');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const buttonScale = useSharedValue(1);
  const router = useRouter();

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 100 });

    // FIX: Force close any lingering Chrome Custom Tabs when a deep link brings the app back to the front!
    // This stops the browser from getting stuck "loading" in the background after successful login.
    const sub = Linking.addEventListener('url', () => {
      if (Platform.OS === 'android') {
        WebBrowser.dismissBrowser();
      }
    });

    return () => sub.remove();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const onSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    setLoading(false);
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/explore'); // Or wherever you want them to go
    }
  };

const onSignInWithGoogle = async () => {
    setLoading(true);
    try {
      // By using an empty string for the path, Expo generates a URL that
      // points to your root (index.tsx) safely without crashing the router.
      const redirectTo = makeRedirectUri({
        path: '', 
      });

      console.log("👉 ADD THIS EXACT URL TO SUPABASE:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account', // Forces Google to show the account picker every time!
          },
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        // Appending a random timestamp prevents Android from reusing the old, stuck Chrome Custom Tab!
        // This guarantees a completely fresh loading page every time you press "Continue with Google".
        const uniqueUrl = `${data.url}&_t=${Date.now()}`;
        
        const result = await WebBrowser.openAuthSessionAsync(uniqueUrl, redirectTo);
        
        // Force the browser to close immediately after returning, so it doesn't hang in the background
        if (Platform.OS === 'ios') {
          WebBrowser.dismissBrowser();
        } else {
          WebBrowser.dismissBrowser(); 
        }

        if (result.type === 'success' && result.url) {
             // Change the Supabase hash (#) to a question mark (?) so it can be parsed safely
             let urlToParse = result.url.replace('#', '?');

             const parsedUrl = Linking.parse(urlToParse);
             const params = parsedUrl.queryParams || {};
             
             const accessToken = params['access_token'] as string;
             const refreshToken = params['refresh_token'] as string;

             if (accessToken && refreshToken) {
               await supabase.auth.setSession({
                 access_token: accessToken,
                 refresh_token: refreshToken,
               });
               router.push('/explore');
             } else {
                const sessionCheck = await supabase.auth.getSession();
                if (sessionCheck.data.session) {
                  router.push('/explore');
                } else {
                  setErrorMsg('Failed to grab tokens.');
                }
             }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Background Deep Rich Gradient */}
      <LinearGradient
        colors={['#ffffffff', '#fbf3ffff', '#ededffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.backgroundGradient, { height: screenHeight }]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={{ flex: 1 }} />
          <Animated.View style={[styles.cardContainer, animatedStyle]}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>

            {errorMsg ? (
              <Text style={{ color: '#ef4444', textAlign: 'center', marginBottom: 15, fontWeight: '600' }}>
                {errorMsg}
              </Text>
            ) : null}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.forgotPassword}>
              <Link href="/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onSignIn}
                disabled={loading}
                style={styles.buttonContainer}
              >
                <LinearGradient
                  colors={loading ? ['#a855f7', '#a855f7'] : ['#9536f6', '#7c2ed7']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Log In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or</Text>
              <View style={styles.separatorLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={onSignInWithGoogle}>
              <Image
                source={{ uri: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' }}
                style={styles.googleLogo}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupText}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 0,
    backgroundColor: '#ffffff',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardContainer: {
    width: width * 1.00,
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    padding: 32,
    paddingBottom: 40,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 36,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  eyeIcon: {
    padding: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#000000',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#9536f6',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonContainer: {
    borderRadius: 12,
    marginTop: -10,
    overflow: 'hidden',
    shadowColor: '#9536f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerContainer: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 15,
  },
  signupText: {
    color: '#9536f6',
    fontSize: 15,
    fontWeight: '800',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  separatorText: {
    paddingHorizontal: 12,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#dadce0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
