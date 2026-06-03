// screens/child/HomeScreen.js
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, RefreshControl, Animated, Easing
} from 'react-native';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import { generateMissions, getMissionTips } from '../../services/aiservice';
import { getUserProfile, getLeaderboard } from '../../services/userService';
import { syncMissionsToFirestore } from '../../services/missionService';
import { registerForPushNotifications } from '../../services/notificationService';
import { getAuth } from 'firebase/auth';
import { T } from '../theme';

const theme = {
  bg:        T?.bg      || '#F5F7F4',
  white:     T?.white   || '#FFFFFF',
  text:      T?.text    || '#1A1A1A',
  textSub:   T?.textSub || '#333333',
  textMut:   T?.textMut || '#666666',
  accent:    T?.accent  || '#5BAD3E',
  border:    T?.border  || '#E0E0E0',
  orange:    T?.orange  || '#FF9800',
  purple:    T?.purple  || '#9B7FD4',
  shadow:    T?.shadow  || '#000000',
};

const CATEGORIES = ['All', 'Carbon Garden', 'Clean Karachi', 'Water Mission', 'Heritage Quest', 'Air Watch'];
const CAT_COLOR  = {
  'All':            '#5BAD3E',
  'Carbon Garden': '#5BAD3E',
  'Clean Karachi': '#4AABDB',
  'Water Mission': '#4AABDB',
  'Heritage Quest':'#F9A825',
  'Air Watch':     '#9B7FD4',
};

function MissionIcon({ civic_issue, color = '#5BAD3E', size = 26 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" };
  switch (civic_issue) {
    case 'waste':
    case 'home_cleanliness':
      return (
        <Svg {...p}>
          <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M19 6l-1 14H6L5 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M9 6V4h6v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'drainage':
    case 'water_conservation':
      return (
        <Svg {...p}>
          <Path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color + '22'}/>
          <Path d="M8 15c0 2.2 1.8 4 4 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'greening':
    case 'awareness':
      return (
        <Svg {...p}>
          <Line x1="12" y1="22" x2="12" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M12 11C12 11 7 9 5 5c4 0 7 2 7 6z" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
          <Path d="M12 15C12 15 17 13 19 9c-4 0-7 2-7 6z" fill={color + 'AA'} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        </Svg>
      );
    case 'recycling':
      return (
        <Svg {...p}>
          <Path d="M12 2l2.5 4H9.5L12 2z" fill={color}/>
          <Path d="M19.5 17l-2.5-4-2.5 4h5z" fill={color}/>
          <Path d="M4.5 17l2.5-4 2.5 4h-5z" fill={color + '99'}/>
          <Path d="M12 6C15.3 6 18 8.7 18 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M18 12C18 15.3 15.3 18 12 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M12 18C8.7 18 6 15.3 6 12C6 8.7 8.7 6 12 6" stroke={color + '99'} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'heat_island':
    case 'energy_saving':
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="4" fill={color + '33'} stroke={color} strokeWidth="2"/>
          <Line x1="12" y1="22" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="12" y1="4"  x2="12" y2="2"  stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="2"  y1="12" x2="4"  y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="20" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="4.93" y1="4.93" x2="6.34" y2="6.34" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="17.66" y1="17.66" x2="19.07" y2="19.07" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="4.93" y1="19.07" x2="6.34" y2="17.66" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="17.66" y1="6.34" x2="19.07" y2="4.93" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    default:
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill={color + '22'}/>
          <Path d="M12 8v4l3 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
  }
}

function MissionIconBox({ civic_issue, color = '#5BAD3E' }) {
  return (
    <View style={[s.iconBox, { backgroundColor: color + '15', borderColor: color + '55' }]}>
      <MissionIcon civic_issue={civic_issue} color={color} size={26} />
    </View>
  );
}

export default function HomeScreen({ navigation, route }) {
  const auth = getAuth();
  const userId = (auth.currentUser && !auth.currentUser.isAnonymous) ? auth.currentUser.uid : null;

  const [missions, setMissions]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [activeCategory, setCategory]   = useState('All');
  const [agentStatus, setAgentStatus]   = useState('Finding eco missions for you...');
  const [leaderboard, setLeaderboard]   = useState([]);
  const [indoorMode, setIndoorMode]     = useState(false);
  const [indoorReason, setIndoorReason] = useState('');
  const [userProfile, setUserProfile]   = useState({ xp: 0, level: 1, badge: 'Beginner', streak: 0, completedMissions: 0, age: 12 });

  const tipCache       = useRef({});
  const isMounted      = useRef(true);
  const prevLevel      = useRef(1);
  const hasFetchedOnce = useRef(false);

  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!loading) return;

    // Smooth Infinite Rotation Loop
    const rotate = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotate.start();

    return () => {
      rotate.stop();
    };
  }, [loading]);

  const rotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const d = await getUserProfile(userId);
      if (!d || !isMounted.current) return;
      setUserProfile({
        xp: d.xp || 0, level: d.level || 1, badge: d.badge || 'Beginner',
        streak: d.streak || 0, completedMissions: d.completedMissions || 0,
        age: d.age || 12,
      });
      prevLevel.current = d.level || 1;
    } catch(e) {}
  }, [userId]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const d = await getLeaderboard();
      if (isMounted.current) setLeaderboard(d || []);
    } catch(e) {}
  }, []);

  const preFetchTips = useCallback((missionsList) => {
    missionsList.forEach(m => {
      if (!tipCache.current[m.id]) {
        tipCache.current[m.id] = getMissionTips(m.title, m.category);
      }
    });
  }, []);

  const fetchMissions = useCallback(async (isRefresh = false) => {
    if (!userId) return;
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setAgentStatus('Finding eco missions for you...');
      const timeout = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 35000));
      const result  = await Promise.race([generateMissions(userProfile.age || 12, []), timeout]);
      if (!result || !Array.isArray(result.missions) || result.missions.length === 0)
        throw new Error('Invalid response');
      if (isMounted.current) {
        setMissions(result.missions);
        const isIndoor = result.mode === 'indoor';
        setIndoorMode(isIndoor);
        setIndoorReason(result.weather?.indoor_reason || '');
        setAgentStatus(`${result.missions.length} missions ready!`);
        syncMissionsToFirestore(userId, result.missions);
        preFetchTips(result.missions);
      }
    } catch(e) {
      if (isMounted.current) {
        const fallback = [
          { id: 'f1', title: 'Clean your surroundings', civic_issue: 'waste',           category: 'Clean Karachi', difficulty: 'Easy',   xp: 50, desc: 'Pick up litter around your home or school.' },
          { id: 'f2', title: 'Plant a seed today',       civic_issue: 'greening',            category: 'Carbon Garden', difficulty: 'Easy',   xp: 50, desc: 'Plant any seed and water it daily.' },
          { id: 'f3', title: 'Save water for 1 day',     civic_issue: 'water_conservation', category: 'Water Mission', difficulty: 'Medium', xp: 75, desc: 'Turn off taps when not in use all day.' },
        ];
        setMissions(fallback);
        setIndoorMode(false);
        setAgentStatus('Offline missions loaded');
        preFetchTips(fallback);
      }
    } finally {
      if (isMounted.current) { setLoading(false); setRefreshing(false); }
    }
  }, [userId, userProfile.age]);

  useEffect(() => {
    if (!userId) return;
    if (!hasFetchedOnce.current) {
      hasFetchedOnce.current = true;
      fetchMissions();
      registerForPushNotifications(userId);
    }
    loadProfile();
    loadLeaderboard();
  }, [userId]);

  useFocusEffect(useCallback(() => {
    if (!userId) return;
    loadProfile();
    loadLeaderboard();
    if (route?.params?.xpUpdated) {
      loadProfile();
      navigation.setParams?.({ xpUpdated: false });
    }
  }, [userId, route?.params?.xpUpdated]));

  const filtered = useMemo(() =>
    activeCategory === 'All' ? missions : missions.filter(m => m.category === activeCategory),
    [missions, activeCategory]
  );

  const progress = Math.min((userProfile.completedMissions / 4) * 100, 100);

  // COMPLETELY CLEAN LOADER VIEW - ONLY 3 BIG GREEN DOTS IN THE CENTER
  if (loading && missions.length === 0) return (
    <View style={[s.loadingWrap, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />
      
      <View style={s.loadingCenter}>
        {/* 3 EXTRA LARGE GREEN DOTS IN PERFECT SYMMETRY */}
        <Animated.View style={[s.orbitContainer, { transform: [{ rotate: rotateInterpolate }] }]}>
          <View style={[s.bigDot, s.dot1Position]} />
          <View style={[s.bigDot, s.dot2Position]} />
          <View style={[s.bigDot, s.dot3Position]} />
        </Animated.View>
      </View>
    </View>
  );

  // MAIN CONTENT VIEW
  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />

      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hello there!</Text>
          <Text style={s.heroName}>Young Guardian</Text>
          <View style={[s.badgePill, { backgroundColor: theme.accent + '20' }]}>
            <Text style={[s.badgeTxt, { color: theme.accent }]}>{userProfile.badge}</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={[s.streakCard, { backgroundColor: theme.white, borderColor: theme.border }]}>
            <Text style={[s.streakNum, { color: theme.orange }]}>{userProfile.streak}</Text>
            <Text style={[s.streakLabel, { color: theme.textMut }]}>streak</Text>
          </View>
          <TouchableOpacity
            style={[s.notifBtn, { backgroundColor: theme.white, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={theme.textSub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={theme.textSub} strokeWidth="2" strokeLinecap="round"/>
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* PROGRESS CARD */}
      <View style={[s.progressCard, { backgroundColor: theme.white, borderColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[s.progressTitle, { color: theme.text }]}>Today's Goal</Text>
          <Text style={[s.progressSub, { color: theme.textMut }]}>{userProfile.completedMissions} of 4 missions done</Text>
          <View style={[s.progressBg, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: theme.accent }]} />
          </View>
        </View>
        <View style={[s.xpCircle, { backgroundColor: theme.accent }]}>
          <Text style={s.xpCircleNum}>{userProfile.xp}</Text>
          <Text style={s.xpCircleLabel}>XP</Text>
          <Text style={s.xpCircleLvl}>Lv.{userProfile.level}</Text>
        </View>
      </View>

      {/* AI STATUS CHIP */}
      <View style={[s.agentChip, { backgroundColor: theme.white, borderColor: theme.border }]}>
        <View style={[s.agentDot, { backgroundColor: theme.accent }]} />
        <Text style={[s.agentChipTxt, { color: theme.textSub }]}>{agentStatus}</Text>
      </View>

      {/* INDOOR BANNER */}
      {indoorMode && (
        <View style={s.indoorBanner}>
          <View style={s.indoorIconBox}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#856404" strokeWidth="2" strokeLinejoin="round"/>
              <Polyline points="9 22 9 12 15 12 15 22" stroke="#856404" strokeWidth="2" strokeLinejoin="round"/>
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.indoorTitle}>Indoor Missions Active</Text>
            <Text style={s.indoorSub}>{indoorReason || 'Weather not suitable for outdoor'}</Text>
          </View>
        </View>
      )}

      {/* CATEGORY TABS */}
      <View style={{ height: 48, marginBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.catChip, { backgroundColor: theme.white, borderColor: theme.border },
                activeCategory === cat && { backgroundColor: CAT_COLOR[cat], borderColor: CAT_COLOR[cat] }]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[s.catTxt, { color: theme.textMut }, activeCategory === cat && { color: '#FFF' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* MISSIONS LIST */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { fetchMissions(true); loadProfile(); }}
            tintColor={theme.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.secTitle, { color: theme.textSub }]}>{filtered.length} Missions Available</Text>

        {filtered.map(m => {
          const col = CAT_COLOR[m.category] || theme.accent;
          return (
            <TouchableOpacity
              key={m.id}
              style={[s.missionCard, { backgroundColor: theme.white, borderColor: theme.border }]}
              onPress={() => {
                const tipPromise = tipCache.current[m.id] || getMissionTips(m.title, m.category);
                navigation.navigate('MissionDetail', { mission: m, tipPromise });
              }}
              activeOpacity={0.82}
            >
              <MissionIconBox civic_issue={m.civic_issue} color={col} />
              <View style={{ flex: 1 }}>
                <Text style={[s.missionTitle, { color: theme.text }]}>{m.title}</Text>
                <Text style={[s.missionMeta, { color: theme.textMut }]}>{m.category}  ·  {m.difficulty || 'Easy'}</Text>
                {m.desc ? <Text style={[s.missionDesc, { color: theme.textMut }]} numberOfLines={1}>{m.desc}</Text> : null}
              </View>
              <View style={[s.xpBadge, { backgroundColor: col + '15', borderColor: col + '44' }]}>
                <Text style={[s.xpBadgeNum, { color: col }]}>+{m.xp}</Text>
                <Text style={[s.xpBadgeLbl, { color: col }]}>XP</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* LEADERBOARD */}
        <View style={[s.lbCard, { backgroundColor: theme.white, borderColor: theme.border }]}>
          <Text style={[s.lbTitle, { color: theme.text }]}>Top Eco Heroes</Text>
          {leaderboard.length === 0
            ? <Text style={[s.lbEmpty, { color: theme.textMut }]}>No heroes yet — be the first!</Text>
            : leaderboard.map((u, i) => (
              <View key={i} style={s.lbRow}>
                <Text style={[s.lbName, { color: theme.textSub, marginLeft: 4 }]}>{u.badge || 'Eco Guardian'}</Text>
                <Text style={[s.lbXP, { color: theme.orange }]}>{u.xp} XP</Text>
              </View>
            ))
          }
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={[s.nav, { backgroundColor: theme.white, borderTopColor: theme.border }]}>
        {[
          {
            l: 'Home', sc: 'Home',
            icon: (active) => (
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
                <Polyline points="9 22 9 12 15 12 15 22"
                  stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
              </Svg>
            )
          },
          {
            l: 'Quests', sc: 'QuestList',
            icon: (active) => (
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
                <Polyline points="14 2 14 8 20 8"
                  stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
                <Path d="M9 13h6M9 17h4"
                  stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            )
          },
          {
            l: 'Profile', sc: 'ChildProfile',
            icon: (active) => (
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="4"
                  stroke={active ? theme.accent : theme.textMut} strokeWidth="2"/>
                <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                  stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            )
          },
          {
            l: 'Alerts', sc: 'Notifications',
            icon: (active) => (
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
                <Path d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinecap="round"/>
                </Svg>
            )
          },
        ].map(n => {
          const active = n.sc === 'Home';
          return (
            <TouchableOpacity key={n.l} style={s.navItem} onPress={() => navigation.navigate(n.sc)}>
              <View style={[s.navIconWrap, active && { backgroundColor: theme.accent + '20' }]}>
                {n.icon(active)}
              </View>
              <Text style={[s.navLabel, { color: theme.textMut }, active && { color: theme.accent, fontWeight: '800' }]}>{n.l}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  // Ultra Minimal Loader Layout
  loadingWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingCenter:    { alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  
  // Center Orbit Container (Perfectly Balanced for Large Dots)
  orbitContainer:   { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  bigDot:           { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#5BAD3E' }, 
  dot1Position:     { top: 0, left: 31 },
  dot2Position:     { bottom: 4, left: 2 },
  dot3Position:     { bottom: 4, right: 2 },
  
  // Home Screen Styles (Original layout safety)
  container:        { flex: 1, backgroundColor: '#F5F7F4' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14 },
  greeting:         { fontSize: 13, fontWeight: '600' },
  heroName:         { fontSize: 24, fontWeight: '900' },
  badgePill:        { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  badgeTxt:         { fontSize: 12, fontWeight: '700' },
  headerRight:      { flexDirection: 'row', gap: 10, alignItems: 'center' },
  streakCard:       { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', borderWidth: 1.5 },
  streakNum:        { fontSize: 16, fontWeight: '900' },
  streakLabel:      { fontSize: 9, fontWeight: '600' },
  notifBtn:         { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  progressCard:     { marginHorizontal: 20, borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1.5, elevation: 3 },
  progressTitle:    { fontWeight: '800', fontSize: 16 },
  progressSub:      { fontSize: 12, marginTop: 2, marginBottom: 10 },
  progressBg:       { height: 10, borderRadius: 5, width: '90%', overflow: 'hidden', borderWidth: 1 },
  progressFill:     { height: 10, borderRadius: 5 },
  xpCircle:         { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginLeft: 14 },
  xpCircleNum:      { color: '#FFF', fontSize: 18, fontWeight: '900' },
  xpCircleLabel:    { color: '#FFF', fontSize: 10, fontWeight: '700', marginTop: -2 },
  xpCircleLvl:      { color: '#FFFFFFCC', fontSize: 10, fontWeight: '600' },
  agentChip:        { marginHorizontal: 20, marginBottom: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 8 },
  agentDot:         { width: 8, height: 8, borderRadius: 4 },
  agentChipTxt:     { fontSize: 12, fontWeight: '600', flex: 1 },
  indoorBanner:     { marginHorizontal: 20, marginBottom: 8, backgroundColor: '#FFF3CD', borderRadius: 14, padding: 12, borderWidth: 1.5, borderColor: '#FFD700', flexDirection: 'row', alignItems: 'center', gap: 10 },
  indoorIconBox:    { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFE69C', alignItems: 'center', justifyContent: 'center' },
  indoorTitle:      { color: '#856404', fontWeight: '800', fontSize: 13 },
  indoorSub:        { color: '#856404', fontSize: 11, marginTop: 1 },
  catChip:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5 },
  catTxt:           { fontSize: 12, fontWeight: '700' },
  secTitle:         { fontSize: 14, fontWeight: '700', marginTop: 4, marginBottom: 10 },
  missionCard:      { borderRadius: 20, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, gap: 12, elevation: 2 },
  iconBox:          { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  missionTitle:     { fontWeight: '800', fontSize: 15 },
  missionMeta:      { fontSize: 11, marginTop: 2 },
  missionDesc:      { fontSize: 12, marginTop: 3 },
  xpBadge:          { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, minWidth: 52 },
  xpBadgeNum:       { fontWeight: '900', fontSize: 15 },
  xpBadgeLbl:       { fontSize: 10, fontWeight: '700', marginTop: -1 },
  lbCard:           { borderRadius: 22, padding: 18, marginTop: 10, marginBottom: 20, borderWidth: 1.5 },
  lbTitle:          { fontSize: 17, fontWeight: '900', marginBottom: 14 },
  lbRow:            { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  lbName:           { flex: 1, fontWeight: '600', fontSize: 14 },
  lbXP:             { fontWeight: '800', fontSize: 14 },
  lbEmpty:          { textAlign: 'center', marginTop: 8, fontSize: 14 },
  nav:              { flexDirection: 'row', paddingVertical: 10, borderTopWidth: 1.5, position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem:          { flex: 1, alignItems: 'center', paddingVertical: 2 },
  navIconWrap:      { width: 40, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navLabel:         { fontSize: 10, marginTop: 2, fontWeight: '600' },
});