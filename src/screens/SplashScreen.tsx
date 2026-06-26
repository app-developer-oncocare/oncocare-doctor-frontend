import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { getToken, getUser } from '../services/api';


export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      // Show splash for 2.2 seconds then navigate
      await new Promise(resolve => setTimeout(resolve, 2200));
      try {
        const token = await getToken();
        const user = await getUser();
        if (token && user) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      } catch {
        navigation.replace('Login');
      }
    };
    checkAuthAndNavigate();
  }, []);

  return (
    <View style={styles.container}>
      {/* OncoCare Logo Block */}
      <View style={styles.logoRow}>
        {/* Teal rounded-square with medical cross */}
        <View style={styles.iconBox}>
          {/* Cross vertical */}
          <View style={styles.crossVertical} />
          {/* Cross horizontal */}
          <View style={styles.crossHorizontal} />
          {/* Decorative curve accent */}
          <View style={styles.curveAccent} />
        </View>

        {/* Brand text */}
        <View style={styles.brandText}>
          <Text style={styles.brandName}>ONCOCARE</Text>
          <Text style={styles.brandTagline}>CARE FOR CURE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f6f8',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : undefined,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 58,
    height: 58,
    backgroundColor: '#2a8a8a',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // Slight rotation to match the leaf/drop shape
    transform: [{ rotate: '-8deg' }],
  },
  crossVertical: {
    position: 'absolute',
    width: 8,
    height: 30,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 30,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  curveAccent: {
    position: 'absolute',
    bottom: 6,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(200, 220, 180, 0.55)',
  },
  brandText: {
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a3a3a',
    letterSpacing: 2.5,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '500',
    color: '#5a8a8a',
    letterSpacing: 3.5,
    marginTop: 2,
  },
});
