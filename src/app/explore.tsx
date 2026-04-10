import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('screen');

export default function ExploreScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // If they provided a name during signup, display it. Otherwise show email.
        setUserName(user.user_metadata?.full_name || user.email);
      } else {
        router.replace('/');
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#9536f6" />
      </View>
    );
  }

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

      <View style={styles.content}>
        <View style={styles.cardContainer}>
          <Text style={styles.title}>Welcome Home!</Text>
          
          <View style={styles.profileContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {userName ? userName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={styles.nameText}>{userName}</Text>
            <Text style={styles.subtitle}>You are successfully logged securely into your new Supabase backend!</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/add-clothing')}
            style={[styles.buttonContainer, { shadowColor: '#208AEF', marginBottom: 15 }]}
          >
            <LinearGradient
              colors={['#7620ef', '#b15eff']} /* Blue gradient for Add Clothing */
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Add Clothing Item</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSignOut}
            style={[styles.buttonContainer, { shadowColor: '#ef4444' }]}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']} /* Red gradient for logout */
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Log Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: width * 0.9,
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 32,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 22,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#9536f6',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#9536f6',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
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
});
