import React, { useEffect } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const buttonScale = useSharedValue(1);

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Deep Rich Gradient */}
      <LinearGradient
        colors={['#130525', '#330548', '#151540']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Background Decorative Circles */}
      <View style={[styles.circle, styles.circleOne]} />
      <View style={[styles.circle, styles.circleTwo]} />

      <Animated.View style={[styles.cardWrapper, animatedStyle]}>
        {/* Glassmorphism Effect */}
        <BlurView intensity={Platform.OS === 'android' ? 60 : 70} tint="dark" style={styles.blurContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              keyboardAppearance="dark"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              keyboardAppearance="dark"
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={['#8a2be2', '#ec4899']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Log In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </Animated.View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.6,
  },
  circleOne: {
    width: 300,
    height: 300,
    backgroundColor: '#8a2be2',
    top: -50,
    left: -100,
    filter: [{ blur: 60 }],
  },
  circleTwo: {
    width: 250,
    height: 250,
    backgroundColor: '#ec4899',
    bottom: 50,
    right: -50,
    filter: [{ blur: 50 }],
  },
  cardWrapper: {
    width: width * 0.88,
    maxWidth: 420,
    borderRadius: 24,
    ...(Platform.OS === 'android' ? { overflow: 'hidden' } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    }),
    elevation: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  blurContainer: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...(Platform.OS === 'android' && { overflow: 'hidden' }),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 36,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#ec4899',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    ...(Platform.OS !== 'android' && {
      shadowColor: '#ec4899',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
    }),
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
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
  },
  footerText: {
    color: '#cbd5e1',
    fontSize: 15,
  },
  signupText: {
    color: '#ec4899',
    fontSize: 15,
    fontWeight: '700',
  },
});
