
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
import { T } from '../theme'; // Make sure your theme file exists

// ─── VECTOR ICON COMPONENT ──────────────────────────────────────────
const VectorIcon = ({ type, color = T.accent, size = 24 }) => {
  const boxStyle = [styles.iconBox, { width: size, height: size, borderRadius: size / 4, backgroundColor: color + '15', borderColor: color }];
  
  if (type === 'back') return <View style={[boxStyle, { width: 32, height: 32, borderRadius: 8, borderWidth: 1 }]}><View style={[styles.arrowHead, { borderColor: color }]} /></View>;
  if (type === 'analytics') return <View style={[boxStyle, { borderWidth: 1.5, padding: 3, justifyContent: 'flex-end' }]}><View style={styles.chartBarRow}><View style={[styles.chartBar, { height: '50%', backgroundColor: color }]} /><View style={[styles.chartBar, { height: '90%', backgroundColor: color }]} /><View style={[styles.chartBar, { height: '70%', backgroundColor: color }]} /></View></View>;
  if (type === 'child-avatar') return <View style={[boxStyle, { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5 }]}><View style={[styles.avatarDot, { backgroundColor: color }]} /><View style={[styles.avatarBase, { backgroundColor: color }]} /></View>;
  if (type === 'environment') return <View style={[boxStyle, { borderRadius: size / 2, borderWidth: 1.5 }]}><View style={[styles.leafShape, { backgroundColor: color }]} /></View>;
  if (type === 'star') return <View style={[boxStyle, { borderRadius: 6, borderWidth: 1 }]}><View style={[styles.starInner, { backgroundColor: color }]} /></View>;
  return <View style={boxStyle} />;
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ParentQuestTrackerScreen({ navigation, route }) {
  // ─── DYNAMIC DATA MANAGEMENT ─────────────────────────────────────
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch: In real app, replace with Firebase onSnapshot
    const incomingData = route?.params?.selectedChildData;
    
    if (incomingData) {
      setData(incomingData);
      setLoading(false);
    } else {
      // Default state agar data na aaye
      setData({
        name: "Eco Explorer",
        level: 1, xp: 0, xpMax: 100, streak: 0, totalXpEarned: 0,
        questsDone: 0, questsPending: 0, coins: 0,
        weeklyXp: [0, 0, 0, 0, 0, 0, 0],
        categories: [{ name: 'Eco Literacy', done: 0, color: T.accent }],
        recentQuests: []
      });
      setLoading(false);
    }
  }, [route?.params?.selectedChildData]);

  if (loading || !data) return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: T.bg }}>
      <ActivityIndicator size="large" color={T.accent} />
    </View>
  );

  const maxXp = Math.max(...data.weeklyXp, 1);
  const getStatusColor = (s) => (s === 'completed' ? T.accent : s === 'pending' ? T.orange : '#3B82F6');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <VectorIcon type="back" color={T.accent} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Progress Tracker</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusBanner}><Text style={styles.statusBannerText}>🟢 Data Feed Active</Text></View>

        {/* Profile */}
        <View style={styles.profileCard}>
          <VectorIcon type="child-avatar" color={T.accent} size={56} />
          <View style={styles.profileRight}>
            <Text style={styles.profileName}>{data.name}</Text>
            <Text style={styles.profileMeta}>Level {data.level} • {data.streak} Day Streak</Text>
            <View style={styles.xpBarBg}><View style={[styles.xpBarFill, { width: `${(data.xp/data.xpMax)*100}%` }]} /></View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[ {l: 'Done', v: data.questsDone, c: T.accent}, {l: 'Pending', v: data.questsPending, c: T.orange}, {l: 'Coins', v: data.coins, c: '#1565C0'} ].map(s => (
            <View key={s.l} style={[styles.statCard, {borderColor: T.border}]}><Text style={[styles.statValue, {color: s.c}]}>{s.v}</Text><Text style={styles.statLabel}>{s.l}</Text></View>
          ))}
        </View>

        {/* Quests List */}
        <Text style={styles.sectionTitle}>Recent Updates</Text>
        <View style={styles.questContainer}>
          {data.recentQuests.length === 0 ? (
            <View style={styles.emptyQuestState}><Text style={styles.emptyQuestSub}>No recent activity found.</Text></View>
          ) : (
            data.recentQuests.map((q, i) => (
              <View key={i} style={styles.questItem}>
                <VectorIcon type="environment" color={getStatusColor(q.status)} size={36} />
                <View style={styles.questInfo}><Text style={styles.questTitle}>{q.title}</Text></View>
                <Text style={styles.questXp}>⚡ {q.xp}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, backgroundColor: T.white, borderRadius: 10, borderWidth: 1, borderColor: T.border },
  backBtnText: { color: T.accent, fontWeight: '700' },
  headerTitle: { color: T.text, fontSize: 18, fontWeight: '900' },
  statusBanner: { backgroundColor: T.white, marginHorizontal: 20, padding: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  statusBannerText: { color: T.textSub, fontSize: 11, fontWeight: '700' },
  profileCard: { flexDirection: 'row', backgroundColor: T.white, margin: 20, borderRadius: 18, padding: 18, gap: 14, alignItems: 'center', borderWidth: 1.5, borderColor: T.border },
  profileRight: { flex: 1 },
  profileName: { color: T.text, fontSize: 20, fontWeight: '900' },
  profileMeta: { color: T.textSub, fontSize: 12 },
  xpBarBg: { height: 8, backgroundColor: T.bg, borderRadius: 4, marginTop: 8 },
  xpBarFill: { height: '100%', backgroundColor: T.accent, borderRadius: 4 },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  statCard: { flex: 1, backgroundColor: T.white, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { color: T.textSub, fontSize: 10 },
  sectionTitle: { color: T.text, fontSize: 15, fontWeight: '800', margin: 20, marginBottom: 5 },
  questContainer: { marginHorizontal: 20 },
  emptyQuestState: { backgroundColor: T.white, padding: 24, alignItems: 'center', borderRadius: 18, borderWidth: 1.5, borderColor: T.border, borderStyle: 'dashed' },
  questItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, borderRadius: 14, padding: 12, gap: 10, borderWidth: 1.5, borderColor: T.border, marginBottom: 8 },
  questInfo: { flex: 1 },
  questTitle: { color: T.text, fontSize: 13, fontWeight: '700' },
  questXp: { color: T.accent, fontWeight: '700' },
  iconBox: { alignItems: 'center', justifyContent: 'center' },
  chartBarRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: '100%', height: '100%' },
  chartBar: { flex: 1, borderRadius: 1 },
  avatarDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  avatarBase: { width: 18, height: 9, borderTopLeftRadius: 9, borderTopRightRadius: 9 },
  leafShape: { width: '50%', height: '70%', borderTopLeftRadius: 10, borderBottomRightRadius: 10 },
  starInner: { width: '40%', height: '40%', transform: [{ rotate: '45deg' }] },
  arrowHead: { width: 8, height: 8, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }], marginLeft: 2 }
});











