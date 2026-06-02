import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, RefreshControl, Animated
} from 'react-native';
import { generateMissions } from '../../services/aiservice';
import { getUserProfile, getLeaderboard } from '../../services/userService';
import { syncMissionsToFirestore } from '../../services/missionService';
import { registerForPushNotifications } from '../../services/notificationService';
import { getAuth } from 'firebase/auth';
import { T } from '../theme';

const CATEGORIES = ['All', 'Carbon Garden', 'Clean Karachi', 'Water Mission', 'Heritage Quest', 'Air Watch'];
const CAT_EMOJI  = { 'All':'🌍','Carbon Garden':'🌿','Clean Karachi':'🧹','Water Mission':'💧','Heritage Quest':'🏛️','Air Watch':'💨' };

// 🔥 CRASH FIX: Bahar seedha T.accent lagane se crash ho raha tha. Isko safe hex color de diya hai.
const CAT_COLOR  = { 
  'All': '#5BAD3E', 
  'Carbon Garden':'#5BAD3E',
  'Clean Karachi':'#4AABDB',
  'Water Mission':'#4AABDB',
  'Heritage Quest':'#F9A825',
  'Air Watch':'#9B7FD4' 
};

export default function HomeScreen({ navigation, route }) {
  const auth = getAuth();
  const userId = (auth.currentUser && !auth.currentUser.isAnonymous) ? auth.currentUser.uid : null;

  const [missions, setMissions]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [activeCategory, setCategory] = useState('All');
  const [agentStatus, setAgentStatus] = useState('Finding eco missions for you...');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userProfile, setUserProfile] = useState({ xp: 0, level: 1, badge: 'Beginner', streak: 0, completedMissions: 0 });
  const isMounted = useRef(true);
  const prevLevel = useRef(1);

  // --- ANIMATED DOTS LOGIC FOR LOADING SCREEN ---
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!loading) return;

    const createDotAnimation = (dot, delay) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]);
    };

    const pulse = Animated.loop(
      Animated.parallel([
        createDotAnimation(dot1, 0),
        createDotAnimation(dot2, 200),
        createDotAnimation(dot3, 400),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [loading, dot1, dot2, dot3]);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const d = await getUserProfile(userId);
      if (!d || !isMounted.current) return;
      setUserProfile({ xp: d.xp||0, level: d.level||1, badge: d.badge||'Beginner', streak: d.streak||0, completedMissions: d.completedMissions||0 });
      prevLevel.current = d.level || 1;
    } catch(e) {}
  }, [userId]);

  const loadLeaderboard = useCallback(async () => {
    try { const d = await getLeaderboard(); if (isMounted.current) setLeaderboard(d||[]); } catch(e) {}
  }, []);

  const fetchMissions = useCallback(async (isRefresh = false) => {
    if (!userId) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setAgentStatus('Finding eco missions for you...');
      const timeout = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 15000));
      const data = await Promise.race([generateMissions(12, []), timeout]);
      if (!Array.isArray(data)) throw new Error('Invalid response');
      if (isMounted.current) {
        setMissions(data);
        setAgentStatus(`${data.length} missions ready!`);
        syncMissionsToFirestore(userId, data);
      }
    } catch(e) {
      if (isMounted.current) {
        setMissions([
          { id: 'f1', title: 'Clean your surroundings', emoji: '🧹', category: 'Clean Karachi', difficulty: 'Easy', xp: 10, tag: 'Daily', desc: 'Pick up litter around your home or school.' },
          { id: 'f2', title: 'Plant a seed today', emoji: '🌱', category: 'Carbon Garden', difficulty: 'Easy', xp: 15, tag: 'Daily', desc: 'Plant any seed and water it regularly.' },
          { id: 'f3', title: 'Save water for 1 day', emoji: '💧', category: 'Water Mission', difficulty: 'Easy', xp: 12, tag: 'Daily', desc: 'Turn off taps when not in use.' },
        ]);
        setAgentStatus('Offline missions loaded');
      }
    } finally { if (isMounted.current) { setLoading(false); setRefreshing(false); } }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchMissions(); registerForPushNotifications(userId); loadProfile(); loadLeaderboard();
  }, [userId, fetchMissions, loadProfile, loadLeaderboard]);

  useFocusEffect(useCallback(() => {
    if (!userId) return;
    loadProfile(); loadLeaderboard();
    if (route?.params?.xpUpdated) { loadProfile(); navigation.setParams?.({ xpUpdated: false }); }
  }, [userId, route?.params?.xpUpdated, loadProfile, loadLeaderboard, navigation]));

  const filtered = useMemo(() =>
    activeCategory === 'All' ? missions : missions.filter(m => m.category === activeCategory),
    [missions, activeCategory]
  );

  const progress = Math.min((userProfile.completedMissions / 4) * 100, 100);

  if (loading && missions.length === 0) return (
    <View style={s.newLoadingWrap}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3FBEF" />
      
      <View style={s.topRightCircle} />
      <View style={s.midLeftCircle} />
      <Text style={s.topLeftLeaves}>🌿</Text>

      <View style={s.centerContent}>
        <View style={s.globeContainer}>
          <Text style={{ fontSize: 56 }}>🌍</Text>
        </View>
        <Text style={s.newAgentTxt}>{agentStatus}</Text>
      </View>

      <View style={s.loadingFooter}>
        <Text style={{ fontSize: 42 }}>🌳</Text>
        <View style={s.dotsContainer}>
          <Animated.View style={[s.loadingDot, { opacity: dot1, transform: [{ scale: dot1.interpolate({ inputRange: [0.3, 1], outputRange: [0.9, 1.15] }) }] }]} />
          <Animated.View style={[s.loadingDot, { opacity: dot2, transform: [{ scale: dot2.interpolate({ inputRange: [0.3, 1], outputRange: [0.9, 1.15] }) }] }]} />
          <Animated.View style={[s.loadingDot, { opacity: dot3, transform: [{ scale: dot3.interpolate({ inputRange: [0.3, 1], outputRange: [0.9, 1.15] }) }] }]} />
        </View>
        <Text style={{ fontSize: 42 }}>🌲</Text>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T?.bg || '#F5F7F4'} />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.greeting}>Hello there!</Text>
          <Text style={s.heroName}>Young Guardian</Text>
          <View style={s.badgePill}>
            <Text style={s.badgeTxt}>{userProfile.badge}</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={s.streakCard}>
            <Text style={{ fontSize: 20 }}>🔥</Text>
            <Text style={s.streakNum}>{userProfile.streak}</Text>
            <Text style={s.streakLabel}>day streak</Text>
          </View>
          <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PROGRESS CARD */}
      <View style={s.progressCard}>
        <View style={{ flex: 1 }}>
          <Text style={s.progressTitle}>Today's Goal</Text>
          <Text style={s.progressSub}>{userProfile.completedMissions} of 4 missions done</Text>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <View style={s.xpCircle}>
          <Text style={s.xpCircleNum}>{userProfile.xp}</Text>
          <Text style={s.xpCircleLabel}>XP</Text>
          <Text style={s.xpCircleLvl}>Lv.{userProfile.level}</Text>
        </View>
      </View>

      {/* AI STATUS */}
      <View style={s.agentChip}>
        <View style={s.agentDot} />
        <Text style={s.agentChipTxt}>{agentStatus}</Text>
      </View>

      {/* CATEGORIES */}
      <View style={s.catScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.catChip, activeCategory === cat && { backgroundColor: CAT_COLOR[cat] || '#5BAD3E', borderColor: CAT_COLOR[cat] || '#5BAD3E' }]}
              onPress={() => setCategory(cat)}
            >
              <Text style={{ fontSize: 14 }}>{CAT_EMOJI[cat]}</Text>
              <Text style={[s.catTxt, activeCategory === cat && s.catTxtActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* MISSIONS */}
      <ScrollView
        style={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { fetchMissions(true); loadProfile(); }} tintColor={CAT_COLOR['All']} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.secTitle}>{filtered.length} Missions Available</Text>

        {filtered.map(m => (
          <TouchableOpacity
            key={m.id}
            style={s.missionCard}
            onPress={() => navigation.navigate('MissionDetail', { mission: m })}
            activeOpacity={0.85}
          >
            <View style={[s.missionEmoji, { backgroundColor: (CAT_COLOR[m.category] || '#5BAD3E') + '18' }]}>
              <Text style={{ fontSize: 30 }}>{m.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.missionTitle}>{m.title}</Text>
              <Text style={s.missionCat}>{m.category}  ·  {m.difficulty || 'Easy'}</Text>
              {m.desc ? <Text style={s.missionDesc} numberOfLines={1}>{m.desc}</Text> : null}
            </View>
            <View style={[s.xpBadge, { backgroundColor: (CAT_COLOR[m.category] || '#5BAD3E') + '18' }]}>
              <Text style={[s.xpBadgeTxt, { color: CAT_COLOR[m.category] || '#5BAD3E' }]}>+{m.xp}</Text>
              <Text style={[s.xpBadgeSub, { color: CAT_COLOR[m.category] || '#5BAD3E' }]}>XP</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* LEADERBOARD */}
        <View style={s.lbCard}>
          <Text style={s.lbTitle}>Top Eco Heroes</Text>
          {leaderboard.length === 0
            ? <Text style={s.lbEmpty}>No heroes yet — be the first!</Text>
            : leaderboard.map((u, i) => (
              <View key={i} style={s.lbRow}>
                <Text style={s.lbRank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</Text>
                <Text style={s.lbName}>{u.badge || 'Eco Guardian'}</Text>
                <Text style={s.lbXP}>{u.xp} XP</Text>
              </View>
            ))}
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={s.nav}>
        {[
          { emoji: '🏠', label: 'Home', screen: 'Home' },
          { emoji: '🗺️', label: 'Quests', screen: 'QuestList' },
          { emoji: '👤', label: 'Profile', screen: 'ChildProfile' },
          { emoji: '🔔', label: 'Alerts', screen: 'Notifications' },
        ].map(n => (
          <TouchableOpacity key={n.label} style={s.navItem} onPress={() => navigation.navigate(n.screen)}>
            <View style={[s.navIconWrap, n.screen === 'Home' && s.navIconActive]}>
              <Text style={{ fontSize: 20 }}>{n.emoji}</Text>
            </View>
            <Text style={[s.navLabel, n.screen === 'Home' && s.navLabelActive]}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: T?.bg || '#F5F7F4' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14 },
  headerLeft:    { flex: 1 },
  headerRight:   { flexDirection: 'row', gap: 10, alignItems: 'center' },
  greeting:      { color: T?.textMut || '#666', fontSize: 13, fontWeight: '600' },
  heroName:      { color: T?.text || '#1A1A1A', fontSize: 24, fontWeight: '900' },
  badgePill:     { backgroundColor: (T?.accent || '#5BAD3E') + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  badgeTxt:      { color: T?.accent || '#5BAD3E', fontSize: 12, fontWeight: '700' },
  streakCard:    { backgroundColor: T?.white || '#FFF', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1.5, borderColor: T?.border || '#E0E0E0' },
  streakNum:     { color: T?.orange || '#FF9800', fontSize: 16, fontWeight: '900' },
  streakLabel:   { color: T?.textMut || '#666', fontSize: 9, fontWeight: '600' },
  notifBtn:      { width: 40, height: 40, backgroundColor: T?.white || '#FFF', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: T?.border || '#E0E0E0' },
  progressCard:  { marginHorizontal: 20, backgroundColor: T?.white || '#FFF', borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1.5, borderColor: T?.border || '#E0E0E0', shadowColor: T?.shadow || '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  progressTitle: { color: T?.text || '#1A1A1A', fontWeight: '800', fontSize: 16 },
  progressSub:   { color: T?.textMut || '#666', fontSize: 12, marginTop: 2, marginBottom: 10 },
  progressBg:    { height: 10, backgroundColor: T?.bg || '#F5F7F4', borderRadius: 5, width: '90%', overflow: 'hidden', borderWidth: 1, borderColor: T?.border || '#E0E0E0' },
  progressFill:  { height: 10, backgroundColor: T?.accent || '#5BAD3E', borderRadius: 5 },
  xpCircle:      { width: 72, height: 72, borderRadius: 36, backgroundColor: T?.accent || '#5BAD3E', alignItems: 'center', justifyContent: 'center', marginLeft: 14 },
  xpCircleNum:   { color: T?.white || '#FFF', fontSize: 18, fontWeight: '900' },
  xpCircleLabel: { color: T?.white || '#FFF', fontSize: 10, fontWeight: '700', marginTop: -2 },
  xpCircleLvl:   { color: (T?.white || '#FFF') + 'CC', fontSize: 10, fontWeight: '600' },
  agentChip:     { marginHorizontal: 20, marginBottom: 10, backgroundColor: T?.white || '#FFF', borderWidth: 1.5, borderColor: T?.border || '#E0E0E0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  agentDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: T?.accent || '#5BAD3E' },
  agentChipTxt:  { color: T?.textSub || '#333', fontSize: 12, fontWeight: '600', flex: 1 },
  catScrollContainer: { height: 48, marginBottom: 8 },
  catChip:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: T?.white || '#FFF', borderWidth: 1.5, borderColor: T?.border || '#E0E0E0' },
  catTxt:        { color: T?.textMut || '#666', fontSize: 12, fontWeight: '700' },
  catTxtActive:  { color: T?.white || '#FFF', fontWeight: '800' },
  list:          { flex: 1, paddingHorizontal: 20 },
  secTitle:      { color: T?.textSub || '#333', fontSize: 14, fontWeight: '700', marginTop: 4, marginBottom: 10 },
  missionCard:   { backgroundColor: T?.white || '#FFF', borderRadius: 20, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: T?.border || '#E0E0E0', gap: 12, shadowColor: T?.shadow || '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  missionEmoji:  { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  missionTitle:  { color: T?.text || '#1A1A1A', fontWeight: '800', fontSize: 15 },
  missionCat:    { color: T?.textMut || '#666', fontSize: 11, marginTop: 2 },
  missionDesc:   { color: T?.textMut || '#666', fontSize: 12, marginTop: 3 },
  xpBadge:       { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center' },
  xpBadgeTxt:    { fontWeight: '900', fontSize: 15 },
  xpBadgeSub:    { fontSize: 10, fontWeight: '700' },
  lbCard:        { backgroundColor: T?.white || '#FFF', marginTop: 10, marginBottom: 20, borderRadius: 22, padding: 18, borderWidth: 1.5, borderColor: T?.border || '#E0E0E0' },
  lbTitle:       { color: T?.text || '#1A1A1A', fontSize: 17, fontWeight: '900', marginBottom: 14 },
  lbRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  lbRank:        { fontSize: 20, width: 36 },
  lbName:        { flex: 1, color: T?.textSub || '#333', fontWeight: '600', fontSize: 14 },
  lbXP:          { color: T?.orange || '#FF9800', fontWeight: '800', fontSize: 14 },
  lbEmpty:       { color: T?.textMut || '#666', textAlign: 'center', marginTop: 8, fontSize: 14 },
  nav:           { flexDirection: 'row', backgroundColor: T?.white || '#FFF', paddingVertical: 10, borderTopWidth: 1.5, borderTopColor: T?.border || '#E0E0E0' },
  navItem:       { flex: 1, alignItems: 'center', paddingVertical: 2 },
  navIconWrap:   { width: 40, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: (T?.accent || '#5BAD3E') + '20' },
  navLabel:      { color: T?.textMut || '#666', fontSize: 10, marginTop: 2, fontWeight: '600' },
  navLabelActive:{ color: T?.accent || '#5BAD3E', fontWeight: '800' },

  // --- PREMIUM DESIGNED LOADING SCREEN STYLES ---
  newLoadingWrap: {
    flex: 1,
    backgroundColor: '#F3FBEF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    position: 'relative',
    overflow: 'hidden',
  },
  topRightCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DDF0D5',
    opacity: 0.8,
  },
  midLeftCircle: {
    position: 'absolute',
    top: '25%',
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#E4F4DC',
    opacity: 0.7,
  },
  topLeftLeaves: {
    position: 'absolute',
    top: 100,
    left: 24,
    fontSize: 28,
    opacity: 0.8,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  globeContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7BC65E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  newAgentTxt: {
    color: '#497A34',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingFooter: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  loadingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#5BAD3E',
  },
});