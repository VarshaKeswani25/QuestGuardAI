import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type SplashScreenProps = {
  onFinish?: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const shieldScale = useRef(new Animated.Value(0)).current;
  const shieldOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const star1Opacity = useRef(new Animated.Value(0)).current;
  const star2Opacity = useRef(new Animated.Value(0)).current;
  const star3Opacity = useRef(new Animated.Value(0)).current;
  const loaderWidth = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      // Step 1: Shield pops in
      Animated.parallel([
        Animated.spring(shieldScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(shieldOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // Step 2: Title
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // Step 3: Subtitle + Stars
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.stagger(150, [
          Animated.timing(star1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(star2Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(star3Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ]),

      // Step 4: Loader fills
      Animated.timing(loaderWidth, {
        toValue: width - 80,
        duration: 1500,
        useNativeDriver: false,
      }),

      // Step 5: Fade out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animation.start(() => {
      // Animation khatam hone ke baad onFinish call karo
      if (onFinish) onFinish();
    });

    // Cleanup
    return () => animation.stop();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* Background decorations */}
      <View style={styles.bgDot1} />
      <View style={styles.bgDot2} />
      <View style={styles.bgDot3} />

      {/* Main content */}
      <View style={styles.content}>

        <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />

        {/* Shield */}
        <Animated.View style={[
          styles.shieldContainer,
          { opacity: shieldOpacity, transform: [{ scale: shieldScale }] }
        ]}>
          <Text style={styles.shieldEmoji}>🛡️</Text>
        </Animated.View>

        {/* Stars */}
        <View style={styles.starsRow}>
          <Animated.Text style={[styles.star, { opacity: star1Opacity }]}>⭐</Animated.Text>
          <Animated.Text style={[styles.star, { opacity: star2Opacity }]}>🌟</Animated.Text>
          <Animated.Text style={[styles.star, { opacity: star3Opacity }]}>⭐</Animated.Text>
        </View>

        {/* Title */}
        <Animated.Text style={[
          styles.appTitle,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] }
        ]}>
          QuestGuard AI
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.appSubtitle, { opacity: subtitleOpacity }]}>
          Your Adventure Awaits! 🚀
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
          SAFE • FUN • REWARDING
        </Animated.Text>

        <Animated.View style={[styles.ageBadge, { opacity: subtitleOpacity }]}>
          <Text style={styles.ageBadgeText}>🔒 For Ages 7–16</Text>
        </Animated.View>
      </View>

      {/* Loader at bottom */}
      <View style={styles.loaderSection}>
        <Text style={styles.loadingText}>Loading your quests...</Text>
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderFill, { width: loaderWidth }]} />
        </View>
        <Text style={styles.poweredBy}>Powered by QuestGuard AI</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  bgDot1: {
    position: 'absolute', top: 80, right: 30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#FF6B3508', borderWidth: 1, borderColor: '#FF6B3520',
  },
  bgDot2: {
    position: 'absolute', top: 200, left: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#00D4FF06', borderWidth: 1, borderColor: '#00D4FF15',
  },
  bgDot3: {
    position: 'absolute', bottom: 150, right: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#A78BFA08', borderWidth: 1, borderColor: '#A78BFA15',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  glowCircle: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#00D4FF08',
    borderWidth: 1, borderColor: '#00D4FF20',
    top: -20,
  },
  shieldContainer: {
    width: 130, height: 130,
    backgroundColor: '#1E3A5F',
    borderRadius: 65,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 20, elevation: 20,
    marginBottom: 8,
  },
  shieldEmoji: { fontSize: 64 },
  starsRow: { flexDirection: 'row', gap: 12, marginVertical: 4 },
  star: { fontSize: 22 },
  appTitle: {
    fontSize: 38, fontWeight: '900',
    color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 18, color: '#00D4FF',
    fontWeight: '700', textAlign: 'center',
  },
  tagline: {
    fontSize: 12, color: '#5A7A9A',
    fontWeight: '600', letterSpacing: 2, marginTop: 4,
  },
  ageBadge: {
    backgroundColor: '#1A2C3D', borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 8,
    borderWidth: 1, borderColor: '#2A4A6A', marginTop: 8,
  },
  ageBadgeText: { color: '#8899AA', fontSize: 13, fontWeight: '600' },
  loaderSection: {
    width: '100%', alignItems: 'center',
    paddingHorizontal: 40, gap: 10,
  },
  loadingText: { color: '#5A7A9A', fontSize: 13, fontWeight: '600' },
  loaderTrack: {
    width: '100%', height: 6,
    backgroundColor: '#1A2C3D', borderRadius: 3,
    overflow: 'hidden', borderWidth: 1, borderColor: '#2A4A6A',
  },
  loaderFill: { height: '100%', backgroundColor: '#FF6B35', borderRadius: 3 },
  poweredBy: { color: '#2A4A6A', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
});