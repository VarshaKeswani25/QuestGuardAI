
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Dimensions } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { T } from '../theme';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const logoScale  = useRef(new Animated.Value(0)).current;
  const logoOp     = useRef(new Animated.Value(0)).current;
  const titleOp    = useRef(new Animated.Value(0)).current;
  const titleY     = useRef(new Animated.Value(20)).current;
  const subOp      = useRef(new Animated.Value(0)).current;
  const screenOp   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOp,   { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleY,  { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(subOp,    { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(screenOp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        navigation.replace(user && !user.isAnonymous ? 'Home' : 'LoginScreen');
      });
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOp }]}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      {/* Trees decoration */}
      <Text style={styles.treeLeft}>🌳</Text>
      <Text style={styles.treeRight}>🌲</Text>
      <Text style={styles.bush}>🌿</Text>

      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, { opacity: logoOp, transform: [{ scale: logoScale }] }]}>
          <Text style={styles.logoEmoji}>🛡️</Text>
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: titleOp, transform: [{ translateY: titleY }] }]}>
          QuestGuard
        </Animated.Text>
        <Animated.Text style={[styles.titleSub, { opacity: titleOp }]}>
          Eco Adventure
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subOp }]}>
          Fun missions for young heroes!
        </Animated.Text>

        <Animated.View style={[styles.badge, { opacity: subOp }]}>
          <Text style={styles.badgeText}>Safe for ages 7–16</Text>
        </Animated.View>
      </View>

      {/* ✅ DOTS HATA DIYE — sirf loading text */}
      <View style={styles.loaderWrap}>
        <Text style={styles.loadingTxt}>Getting your quests ready...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60 },
  blob1:       { position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: '#C8E6A0', opacity: 0.5 },
  blob2:       { position: 'absolute', top: 160, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: '#B2DFDB', opacity: 0.4 },
  blob3:       { position: 'absolute', bottom: 100, right: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: '#FFF9C4', opacity: 0.6 },
  treeLeft:    { position: 'absolute', bottom: 80, left: 20, fontSize: 64, opacity: 0.7 },
  treeRight:   { position: 'absolute', bottom: 70, right: 16, fontSize: 56, opacity: 0.7 },
  bush:        { position: 'absolute', top: 60, left: 24, fontSize: 40, opacity: 0.5 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoWrap:    { width: 120, height: 120, backgroundColor: T.white, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: T.accent, marginBottom: 12, shadowColor: T.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 },
  logoEmoji:   { fontSize: 60 },
  title:       { fontSize: 36, fontWeight: '900', color: T.text, letterSpacing: 0.5 },
  titleSub:    { fontSize: 18, fontWeight: '700', color: T.accent, marginTop: -4 },
  subtitle:    { fontSize: 15, color: T.textSub, fontWeight: '600', marginTop: 8 },
  badge:       { backgroundColor: T.white, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, borderWidth: 1.5, borderColor: T.border, marginTop: 14 },
  badgeText:   { color: T.textSub, fontSize: 13, fontWeight: '700' },
  loaderWrap:  { alignItems: 'center' },
  loadingTxt:  { color: T.textMut, fontSize: 14, fontWeight: '600' },
});

