import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: 'small' | 'large';
}

export default function OncoCareLogo({ size = 'small' }: LogoProps) {
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, isLarge ? styles.containerLarge : styles.containerSmall]}>
      {/* Dynamic Leaf-Cross Icon */}
      <View style={[styles.leafIcon, isLarge ? styles.iconLarge : styles.iconSmall]}>
        {/* Cross Vertical Bar */}
        <View style={[styles.crossVertical, isLarge ? styles.vLarge : styles.vSmall]} />
        {/* Cross Horizontal Bar */}
        <View style={[styles.crossHorizontal, isLarge ? styles.hLarge : styles.hSmall]} />
        {/* Curved Swoosh Accent */}
        <View style={[styles.swoosh, isLarge ? styles.swooshLarge : styles.swooshSmall]} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.logoText, isLarge ? styles.textLarge : styles.textSmall]}>
          ONCOCARE
        </Text>
        <Text style={[styles.subText, isLarge ? styles.subLarge : styles.subSmall]}>
          CARE FOR CURE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLarge: {
    gap: 16,
  },
  containerSmall: {
    gap: 8,
  },
  leafIcon: {
    backgroundColor: '#007c7c', // Deep Teal
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#007c7c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  iconLarge: {
    width: 90,
    height: 90,
    borderTopLeftRadius: 45,
    borderBottomRightRadius: 45,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  iconSmall: {
    width: 36,
    height: 36,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  crossVertical: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    borderRadius: 2,
  },
  vLarge: {
    width: 14,
    height: 48,
  },
  vSmall: {
    width: 5,
    height: 18,
  },
  crossHorizontal: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    borderRadius: 2,
  },
  hLarge: {
    width: 48,
    height: 14,
  },
  hSmall: {
    width: 18,
    height: 5,
  },
  swoosh: {
    position: 'absolute',
    borderColor: '#007c7c',
    borderStyle: 'solid',
    transform: [{ rotate: '45deg' }],
  },
  swooshLarge: {
    width: 54,
    height: 54,
    borderWidth: 4,
    borderRadius: 27,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#a7f3d0', // Emerald tint
    borderLeftColor: '#a7f3d0',
  },
  swooshSmall: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 10,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#a7f3d0',
    borderLeftColor: '#a7f3d0',
  },
  textContainer: {
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '800',
    color: '#475569', // Slate Gray
    letterSpacing: 0.5,
  },
  textLarge: {
    fontSize: 34,
  },
  textSmall: {
    fontSize: 16,
  },
  subText: {
    color: '#008b8b', // Teal Accent
    fontWeight: '500',
    letterSpacing: 3,
  },
  subLarge: {
    fontSize: 12,
    marginTop: 4,
  },
  subSmall: {
    fontSize: 6,
    letterSpacing: 1.5,
    marginTop: 1,
  },
});
