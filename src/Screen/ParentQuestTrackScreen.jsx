// screens/parent/ParentQuestTrackerScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import { T } from '../theme'; // Theme validation object

const theme = {
  bg:      T?.bg      || '#F5F7F4',
  white:   T?.white   || '#FFFFFF',
  text:    T?.text    || '#1A1A1A',
  textSub: T?.textSub || '#333333',
  accent:  T?.accent  || '#5BAD3E',
  border:  T?.border  || '#E0E0E0',
  orange:  T?.orange  || '#FF9800',
};

// ─── REUSABLE SVG MISSION COMPONENT ──────────────────────────────────
function QuestIcon({ civic_issue, color = '#5BAD3E', size = 26 }) {
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
    default:
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill={color + '22'}/>
          <Path d="M12 8v4l3 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
  }
}

export default function ParentQuestTrackerScreen({ navigation, route }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const incomingData = route?.params?.selectedChildData;
    if (incomingData) {
      setData(incomingData);
      setLoading(false);
    } else {
      // Default Fallback Dataset
      setData({
        name: "Eco Explorer",
        level: 1, xp: 45, xpMax: 100, streak: 3, totalXpEarned: 120,
        questsDone: 4, questsPending: 2, coins: 15,
        weeklyXp: [10, 20, 0, 40, 15, 0, 0],
        categories: [{ name: 'Eco Literacy', done: 2, color: theme.accent }],
        recentQuests: [
          { title: "Plant your first seed", civic_issue: "greening", xp: 50, status: "completed" },
          { title: "Fix leaky taps at home", civic_issue: "water_conservation", xp: 75, status: "pending" }
        ]
      });
      setLoading(false);
    }
  }, [route?.params?.selectedChildData]);

  if (loading || !data) return (
    <View style={styles.loadingCenter}>
      <ActivityIndicator size="large" color={theme.accent} />
    </View>
  );

  const getStatusColor = (s) => (s === 'completed' ? theme.accent : s === 'pending' ? theme.orange : '#3B82F6');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Tracker</Text>
        <View style={{ width: 65 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusBanner}>
          <Text style={styles.statusBannerText}>🟢 Live Child Data Feed Active</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="8" r="4" stroke={theme.accent} strokeWidth="2"/>
              <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={theme.accent} strokeWidth="2" strokeLinecap="round"/>
            </Svg>
          </View>
          <View style={styles.profileRight}>
            <Text style={styles.profileName}>{data.name}</Text>
            <Text style={styles.profileMeta}>Level {data.level} • {data.streak} Day Streak</Text>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${Math.min((data.xp / data.xpMax) * 100, 100)}%` }]} />
            </View>
          </View>
        </View>

        {/* STATS COUNTERS */}
        <View style={styles.statsGrid}>
          {[ 
            { l: 'Done', v: data.questsDone, c: theme.accent }, 
            { l: 'Pending', v: data.questsPending, c: theme.orange }, 
            { l: 'Coins', v: data.coins, c: '#1565C0' } 
          ].map(s => (
            <View key={s.l} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.c }]}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* RECENT ACTIONS / UPDATES */}
        <Text style={styles.sectionTitle}>Recent Updates</Text>
        <View style={styles.questContainer}>
          {data.recentQuests.length === 0 ? (
            <View style={styles.emptyQuestState}>
              <Text style={styles.emptyQuestSub}>No activity tracked for this timeline.</Text>
            </View>
          ) : (
            data.recentQuests.map((q, i) => {
              const currentStatusColor = getStatusColor(q.status);
              return (
                <View key={i} style={styles.questItem}>
                  <View style={[styles.iconWrapper, { backgroundColor: currentStatusColor + '15', borderColor: currentStatusColor + '35' }]}>
                    <QuestIcon civic_issue={q.civic_issue} color={currentStatusColor} size={22} />
                  </View>
                  <View style={styles.questInfo}>
                    <Text style={styles.questTitle} numberOfLines={1}>{q.title}</Text>
                    <Text style={[styles.questStatusMeta, { color: currentStatusColor }]}>
                      {q.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.questXp}>⚡ {q.xp} XP</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: theme.white, borderRadius: 10, borderWidth: 1, borderColor: theme.border },
  backBtnText: { color: theme.accent, fontWeight: '700', fontSize: 13 },
  headerTitle: { color: theme.text, fontSize: 18, fontWeight: '900' },
  statusBanner: { backgroundColor: theme.white, marginHorizontal: 20, padding: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  statusBannerText: { color: theme.textSub, fontSize: 11, fontWeight: '700' },
  profileCard: { flexDirection: 'row', backgroundColor: theme.white, margin: 20, borderRadius: 18, padding: 18, gap: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.accent + '15', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.accent + '33' },
  profileRight: { flex: 1 },
  profileName: { color: theme.text, fontSize: 19, fontWeight: '900' },
  profileMeta: { color: 'gray', fontSize: 12, marginTop: 2 },
  xpBarBg: { height: 7, backgroundColor: theme.bg, borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 4 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  statCard: { flex: 1, backgroundColor: theme.white, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { color: 'gray', fontSize: 11, marginTop: 2, fontWeight: '600' },
  sectionTitle: { color: theme.text, fontSize: 16, fontWeight: '800', marginHorizontal: 20, marginTop: 25, marginBottom: 10 },
  questContainer: { marginHorizontal: 20, marginBottom: 30 },
  emptyQuestState: { backgroundColor: theme.white, padding: 30, alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed' },
  emptyQuestSub: { color: 'gray', fontSize: 13 },
  questItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderRadius: 14, padding: 12, gap: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 10 },
  iconWrapper: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  questInfo: { flex: 1 },
  questTitle: { color: theme.text, fontSize: 14, fontWeight: '700' },
  questStatusMeta: { fontSize: 10, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
  questXp: { color: theme.accent, fontWeight: '800', fontSize: 13 }
});