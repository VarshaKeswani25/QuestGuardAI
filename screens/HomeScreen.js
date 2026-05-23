// screens/HomeScreen.js
// ✅ BUG FIXED VERSION

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';

import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { generateMissions } from '../services/aiservice';
import { getUserProfile, getLeaderboard } from '../services/userService';
import { getAuth } from "firebase/auth";

const CATEGORIES = [
  'All',
  'Carbon Garden',
  'Clean Karachi',
  'Water Mission',
  'Heritage Quest',
  'Air Watch'
];

export default function HomeScreen({ navigation, route }) {

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [agentStatus, setAgentStatus] = useState('Initializing AI agent...');
  const [leaderboard, setLeaderboard] = useState([]);

  const [userProfile, setUserProfile] = useState({
    xp: 0,
    level: 1,
    badge: "Beginner 🌱",
    streak: 0,
    completedMissions: 0
  });

  const [showLevelUp, setShowLevelUp] = useState(false);

  const isMounted = useRef(true);
  const prevLevelRef = useRef(1);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ─────────────────────────────
  // PROFILE
  // ─────────────────────────────
  const loadUserProfile = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getUserProfile(userId);
      if (!data || !isMounted.current) return;

      const newLevel = data.level || 1;

      setUserProfile({
        xp: data.xp || 0,
        level: newLevel,
        badge: data.badge || "Beginner 🌱",
        streak: data.streak || 0,
        completedMissions: data.completedMissions || 0
      });

      if (newLevel > prevLevelRef.current) {
        setShowLevelUp(true);
        setTimeout(() => {
          if (isMounted.current) setShowLevelUp(false);
        }, 2000);
      }

      prevLevelRef.current = newLevel;

    } catch (e) {
      console.log("Profile Error:", e.message);
    }
  }, [userId]);

  // ─────────────────────────────
  // ISSUE 6 FIX: remove redundant JS sort
  // Firestore already returns ordered by xp desc
  // ─────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await getLeaderboard();
      if (!isMounted.current) return;
      setLeaderboard(data || []);
    } catch (e) {
      console.log("Leaderboard Error:", e.message);
    }
  }, []);

  // ─────────────────────────────
  // AI MISSIONS
  // ─────────────────────────────
  const fetchMissions = useCallback(async (isRefresh = false) => {
    if (!userId) return;

    let timeoutId;

    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      setAgentStatus('AI analyzing Karachi environment...');

      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("AI timeout")), 15000);
      });

      setAgentStatus('Generating missions...');

      const aiCall = generateMissions(12, []);
      const data = await Promise.race([aiCall, timeout]);

      clearTimeout(timeoutId);

      if (!Array.isArray(data)) throw new Error("Invalid AI response");

      if (isMounted.current) {
        setMissions(data);
        setAgentStatus('Missions ready!');
      }

    } catch (e) {
      console.log("Mission Error:", e.message);

      if (isMounted.current) {
        setMissions([
          {
            id: "1",
            title: "Clean your surroundings",
            emoji: "🧹",
            category: "Clean Karachi",
            difficulty: "Easy",
            xp: 10,
            tag: "Daily"
          }
        ]);
        setAgentStatus('Offline missions loaded');
        setError(e.message);
      }

    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [userId]);

  // ─────────────────────────────
  // INIT
  // ─────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!userId) return;
      await fetchMissions();
      await loadUserProfile();
      await loadLeaderboard();
    };
    init();
  }, [userId]);

  // ─────────────────────────────
  // LIVE REFRESH
  // ─────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      loadUserProfile();
      loadLeaderboard();

      if (route?.params?.xpUpdated) {
        loadUserProfile();
        loadLeaderboard();
        navigation.setParams?.({ xpUpdated: false });
      }

      if (route?.params?.leaderboardRefresh) {
        loadLeaderboard();
      }

    }, [userId, route?.params?.xpUpdated, route?.params?.leaderboardRefresh])
  );

  // ─────────────────────────────
  // FILTER
  // ─────────────────────────────
  const filtered = useMemo(() => {
    return activeCategory === 'All'
      ? missions
      : missions.filter(m => m.category === activeCategory);
  }, [missions, activeCategory]);

  const completedToday = userProfile?.completedMissions || 0;
  const totalGoal = 4;

  const progressWidth = `${Math.min(
    totalGoal ? (completedToday / totalGoal) * 100 : 0,
    100
  )}%`;

  // ─────────────────────────────
  // LOADING UI
  // ─────────────────────────────
  if (loading && missions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#052e16" />
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.agentLoaderText}>{agentStatus}</Text>
      </View>
    );
  }

  if (error && missions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>AI Error</Text>
        <TouchableOpacity onPress={() => fetchMissions()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#052e16" />

      {/* LEVEL UP */}
      {showLevelUp && (
        <View style={styles.levelPopup}>
          <Text style={styles.levelPopupText}>🏆 LEVEL UP!</Text>
        </View>
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Asalam-o-Alaikum! 👋</Text>
          <Text style={styles.heroName}>Young Guardian</Text>
          <Text style={styles.badgeText}>{userProfile?.badge}</Text>
        </View>

        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>
            🔥 {userProfile?.streak || 0} Day Streak
          </Text>
        </View>
      </View>

      {/* PROGRESS */}
      <View style={styles.progressBanner}>
        <View style={styles.progressLeft}>
          <Text style={styles.progressTitle}>Today's Goal</Text>
          <Text style={styles.progressSub}>
            {completedToday} of {totalGoal} missions done
          </Text>

          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>

        <View style={styles.progressRight}>
          <Text style={{ fontSize: 38 }}>🏆</Text>
          <Text style={styles.levelText}>Level {userProfile?.level}</Text>
          <Text style={styles.totalXP}>⚡ {userProfile?.xp} XP</Text>
        </View>
      </View>

      {/* AI CHIP */}
      <View style={styles.agentChip}>
        <Text style={styles.agentChipText}>
          🤖 AI generated {missions.length} missions for Karachi
        </Text>
      </View>

      {/* CATEGORIES */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catChip,
              activeCategory === cat && styles.catChipActive
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[
              styles.catText,
              activeCategory === cat && styles.catTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MISSIONS */}
      <ScrollView
        style={styles.missionList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              fetchMissions(true);
              loadUserProfile();
              loadLeaderboard();
            }}
          />
        }
      >

        <Text style={styles.sectionTitle}>
          {activeCategory} ({filtered.length})
        </Text>

        {filtered.map(mission => (
          <TouchableOpacity
            key={mission.id}
            style={styles.missionCard}
            onPress={() => navigation.navigate('MissionDetail', { mission })}
          >
            <Text style={{ fontSize: 26 }}>{mission.emoji}</Text>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.catLabel}>{mission.category}</Text>
            </View>

            <Text style={styles.xpReward}>+{mission.xp} XP</Text>
          </TouchableOpacity>
        ))}

        {/* ISSUE 4 FIX: show real badge instead of hardcoded "Guardian" */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>🏆 Top Eco Guardians</Text>

          {leaderboard.length === 0 ? (
            <Text style={styles.emptyLeaderboard}>No guardians yet — be the first! 🌱</Text>
          ) : (
            leaderboard.map((user, i) => (
              <View key={i} style={styles.leaderboardRow}>
                <Text style={styles.rankText}>#{i + 1}</Text>
                <Text style={{ flex: 1, color: '#86efac', fontWeight: '600' }}>
                  {user.badge || 'Eco Guardian'}
                </Text>
                <Text style={styles.leaderboardXP}>⚡ {user.xp}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 90 }} />

      </ScrollView>

    </View>
  );
}

// ─────────────────────────────
// 🎨 STYLES
// ─────────────────────────────
const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#052e16' },

  loadingContainer: {
    flex: 1, backgroundColor: '#052e16',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },

  agentLoaderText: {
    color: '#4ade80', fontSize: 16, fontWeight: '700',
    textAlign: 'center', marginTop: 12,
  },

  errorTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },

  retryText: { color: '#4ade80', fontWeight: '800', fontSize: 15 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 14,
  },

  greeting: { color: '#86efac', fontSize: 13, fontWeight: '600' },

  heroName: { color: '#fff', fontSize: 26, fontWeight: '900' },

  badgeText: { color: '#fcd34d', marginTop: 4, fontSize: 12, fontWeight: '700' },

  xpBadge: {
    backgroundColor: 'rgba(250,204,21,0.15)',
    borderWidth: 1, borderColor: 'rgba(250,204,21,0.3)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },

  xpText: { color: '#fcd34d', fontWeight: '800', fontSize: 14 },

  progressBanner: {
    marginHorizontal: 20, backgroundColor: '#14532d', borderRadius: 20,
    padding: 18, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.18)',
  },

  progressLeft: { flex: 1 },

  progressTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },

  progressSub: { color: '#86efac', fontSize: 12, marginTop: 2, marginBottom: 10 },

  progressBg: {
    height: 8, backgroundColor: 'rgba(74,222,128,0.15)',
    borderRadius: 4, width: '90%',
  },

  progressFill: { height: 8, backgroundColor: '#4ade80', borderRadius: 4 },

  progressRight: { alignItems: 'center', marginLeft: 16 },

  levelText: { color: '#fcd34d', fontWeight: '800', fontSize: 12, marginTop: 4 },

  totalXP: { color: '#fff', fontSize: 11, marginTop: 2 },

  agentChip: {
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.15)',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14,
  },

  agentChipText: { color: '#86efac', fontSize: 11, fontWeight: '700' },

  catScroll: { maxHeight: 46, marginBottom: 6 },

  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },

  catChipActive: { backgroundColor: '#4ade80', borderColor: '#4ade80' },

  catText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },

  catTextActive: { color: '#052e16', fontWeight: '800' },

  missionList: { flex: 1, paddingHorizontal: 20 },

  sectionTitle: {
    color: '#fff', fontSize: 18, fontWeight: '800',
    marginTop: 10, marginBottom: 14,
  },

  missionCard: {
    backgroundColor: '#14532d', borderRadius: 18, padding: 14,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
  },

  missionTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },

  catLabel: { color: '#86efac', fontSize: 11, marginTop: 2 },

  xpReward: { color: '#fcd34d', fontSize: 12, fontWeight: '700' },

  leaderboardCard: {
    backgroundColor: '#14532d', marginTop: 10, marginBottom: 20,
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.12)',
  },

  leaderboardTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 14 },

  leaderboardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },

  rankText: { color: '#fcd34d', fontWeight: '800', width: 40 },

  leaderboardXP: { color: '#fcd34d', fontWeight: '800' },

  emptyLeaderboard: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 10 },

  levelPopup: {
    position: 'absolute', top: 60, alignSelf: 'center',
    backgroundColor: '#fcd34d', paddingHorizontal: 24,
    paddingVertical: 14, borderRadius: 20, zIndex: 999, elevation: 10,
  },

  levelPopupText: { color: '#052e16', fontSize: 18, fontWeight: '900' },
});
