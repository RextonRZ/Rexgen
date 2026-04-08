import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('screen');

export default function SignupScreen() {
  const [step, setStep] = useState(1); // 1 = Registration, 2 = OTP Verification, 3 = Profile Setup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); // Added inline error message
  
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const buttonScale = useSharedValue(1);
  const router = useRouter();

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 100 });
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

  const onSignUp = async () => {
    setErrorMsg('');
    if (step === 1) {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
      if (!email || !password) {
        setErrorMsg('Please enter all details');
        return;
      }

      setLoading(true);
      
      // Attempt signup
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
      } else {
        if (data?.session) {
          Alert.alert('Success', 'Account created successfully!');
          router.push('/');
        } else {
          // No session means they need to verify email
          setStep(2);
        }
      }
    } else if (step === 2) {
      if (otp.length < 8) {
        setErrorMsg('Please enter the 8-digit code');
        return;
      }

      setLoading(true);
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
      } else {
        setStep(3); // Proceed to profile setup after verifying OTP
      }
    } else if (step === 3) {
      if (!name || !birthday) {
        setErrorMsg('Please enter your name and birthday');
        return;
      }

      setLoading(true);
      // Supabase has built-in user metadata, so we can save their profile directly
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name, birthday: birthday },
      });
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/explore'); // Or wherever your main app screen is
      }
    }
  };

  const getTitle = () => {
    if (step === 1) return 'Create Account';
    if (step === 2) return 'Verify Email';
    return 'Almost there!';
  };

  const getSubtitle = () => {
    if (step === 1) return 'Join us and start your journey';
    if (step === 2) return `We've sent a code to ${email}`;
    return 'Tell us a bit about yourself';
  };

  const getButtonText = () => {
    if (step === 1) return 'Sign Up';
    if (step === 2) return 'Verify Account';
    return 'Complete Profile';
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
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>

            {errorMsg ? (
              <Text style={{ color: '#ef4444', textAlign: 'center', marginBottom: 15, fontWeight: '600' }}>
                {errorMsg}
              </Text>
            ) : null}

            {step === 1 && (
              <>
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

                <View style={styles.inputContainer}>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, { flex: 1, borderWidth: 0 }]}
                      placeholder="Confirm password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {step === 2 && (
              <View style={styles.otpWrapper}>
                <Text style={styles.otpLabel}>Enter 8-digit OTP</Text>
                <View style={styles.otpContainer}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <View key={i} style={[styles.otpBox, otp.length === i && styles.otpBoxActive]}>
                      <Text style={styles.otpText}>{otp[i] || ''}</Text>
                    </View>
                  ))}
                  <TextInput
                    style={styles.hiddenOtpInput}
                    keyboardType="number-pad"
                    maxLength={8}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                  />
                </View>
              </View>
            )}

            {step === 3 && (
              <>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Birthday (YYYY-MM-DD)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numbers-and-punctuation"
                    value={birthday}
                    onChangeText={setBirthday}
                  />
                </View>
              </>
            )}

            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onSignUp}
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
                    <Text style={styles.buttonText}>{getButtonText()}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {step === 1 && (
              <>
                <View style={styles.separatorContainer}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>or</Text>
                  <View style={styles.separatorLine} />
                </View>

                <TouchableOpacity style={styles.googleButton}>
                  <Image
                    source={{ uri: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' }}
                    style={styles.googleLogo}
                  />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                {step === 1 ? 'Already have an account? ' : step === 2 ? 'Change your mind? ' : ''}
              </Text>
              {step !== 3 && (
                <TouchableOpacity onPress={() => step === 1 ? router.push('/') : setStep(1)}>
                  <Text style={styles.signupText}>{step === 1 ? 'Log in' : 'Go back'}</Text>
                </TouchableOpacity>
              )}
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
  otpWrapper: {
    marginBottom: 20,
    position: 'relative',
  },
  otpLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  otpBox: {
    width: 36,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {
    borderColor: '#9536f6',
    borderWidth: 2,
  },
  otpText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  hiddenOtpInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  buttonContainer: {
    borderRadius: 12,
    marginTop: 10,
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
