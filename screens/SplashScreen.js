// screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Dimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#052e16" />

      {/* Decorative bg blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      {/* SZABIST badge */}
      <Animated.View style={[styles.badge, { opacity: fade }]}>
        <Text style={styles.badgeText}>🎓  SZABIST · CSC4101 · AI Project</Text>
      </Animated.View>

      {/* Earth hero animation */}
      <Animated.View style={[styles.earthWrap, { transform: [{ scale }] }]}>
        <View style={styles.earthOuter}>
          <View style={styles.earthInner}>
            <Text style={styles.earthEmoji}>🌍</Text>
          </View>
        </View>
        {/* Orbiting icons */}
        {[
          { emoji: '🌱', style: { top: -18, right: 18 } },
          { emoji: '♻️', style: { bottom: -4, left: 8 } },
          { emoji: '💧', style: { top: 28, left: -20 } },
          { emoji: '⚡', style: { bottom: 18, right: -18 } },
        ].map((o, i) => (
          <View key={i} style={[styles.orbitDot, o.style]}>
            <Text style={styles.orbitEmoji}>{o.emoji}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Text block */}
      <Animated.View style={[styles.textBlock, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={styles.appName}>EcoGuardian</Text>
        <Text style={styles.tagline}>Karachi's Young{'\n'}Environmental Heroes</Text>
        <View style={styles.pillRow}>
          {['🤖 AI-Powered', '🔒 COPPA Safe', '🏙️ Karachi'].map((p) => (
            <View key={p} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.btnArea, { opacity: fade }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>🚀  Begin My Mission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.ghostBtnText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: fade }]}>
        🔒 COPPA 2025 · Ages 8–15 · Parental consent required · No biometric data stored
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#052e16',
    alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 50, paddingHorizontal: 28, overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(74,222,128,0.07)',
  },
  blob2: {
    position: 'absolute', bottom: 40, left: -100,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(74,222,128,0.05)',
  },
  blob3: {
    position: 'absolute', top: height * 0.38, right: -50,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(250,204,21,0.05)',
  },
  badge: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  badgeText: { color: '#86efac', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },

  earthWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  earthOuter: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  earthInner: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(74,222,128,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  earthEmoji: { fontSize: 70 },
  orbitDot: {
    position: 'absolute', width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#14532d',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 5, elevation: 5,
  },
  orbitEmoji: { fontSize: 18 },

  textBlock: { alignItems: 'center', width: '100%' },
  appName: {
    fontSize: 46, fontWeight: '900', color: '#fff',
    letterSpacing: -1.5, textAlign: 'center',
  },
  tagline: {
    fontSize: 18, fontWeight: '600', color: '#86efac',
    textAlign: 'center', marginTop: 8, lineHeight: 26,
  },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  pill: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  pillText: { color: '#86efac', fontSize: 11, fontWeight: '700' },

  btnArea: { width: '100%', gap: 10 },
  primaryBtn: {
    backgroundColor: '#4ade80', paddingVertical: 17, borderRadius: 32, alignItems: 'center',
    shadowColor: '#4ade80', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  primaryBtnText: { color: '#052e16', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  ghostBtn: {
    paddingVertical: 14, borderRadius: 32, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.3)',
  },
  ghostBtnText: { color: '#86efac', fontSize: 14, fontWeight: '600' },

  footer: {
    color: 'rgba(255,255,255,0.25)', fontSize: 10,
    textAlign: 'center', lineHeight: 15,
  },
});