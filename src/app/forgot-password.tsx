import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('screen');

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleNextBtn = () => {
    if (step === 1 && email) {
      setStep(2);
    } else if (step === 2 && otp.length === 6) {
      setStep(3);
    } else if (step === 3 && password && password === confirmPassword) {
      // Logic to actually reset password
      router.replace('/'); 
    }
  };

  const getTitle = () => {
    if (step === 1) return 'Forgot Password';
    if (step === 2) return 'Verify OTP';
    return 'Reset Password';
  };

  const getSubtitle = () => {
    if (step === 1) return 'Enter your email to receive an OTP';
    if (step === 2) return `We sent a code to ${email || 'your email'}`;
    return 'Enter your new password below';
  };

  const getButtonText = () => {
    if (step === 1) return 'Send OTP';
    if (step === 2) return 'Verify OTP';
    return 'Save new password';
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

            {step === 1 && (
              <Animated.View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </Animated.View>
            )}

            {step === 2 && (
              <Animated.View style={styles.otpWrapper}>
                <View style={styles.otpContainer}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <View key={i} style={[styles.otpBox, otp.length === i && styles.otpBoxActive]}>
                      <Text style={styles.otpText}>{otp[i] || ''}</Text>
                    </View>
                  ))}
                  <TextInput
                    style={styles.hiddenOtpInput}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                  />
                </View>
              </Animated.View>
            )}

            {step === 3 && (
              <Animated.View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </Animated.View>
            )}

            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleNextBtn}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.buttonContainer}
              >
                <LinearGradient
                  colors={['#9536f6', '#7c2ed7']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{getButtonText()}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.signupText}>Log in</Text>
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
    marginBottom: 30,
    position: 'relative',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  otpBox: {
    width: 45,
    height: 56,
    borderRadius: 12,
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
    fontSize: 24,
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
    marginTop: 30,
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
});