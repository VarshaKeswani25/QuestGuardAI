import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar,
} from 'react-native';

type NavigationProp = {
  navigate: (screen: string) => void;
  push: (screen: string) => void;
  back: () => void;
};

const CHILDREN_DATA = {
  Alex: {
    avatar: '🦁',
    age: 12,
    level: 5,
    xp: 680,
    xpMax: 1000,
    coins: 245,
    streak: 7,
    questsDone: 24,
    questsPending: 3,
    questsLocked: 2,
    totalXpEarned: 3480,
    badges: ['🏆', '📚', '🔥', '🎯'],
    weeklyXp: [120, 200, 80, 350, 150, 180, 0],
    categories: [
      { name: 'Education', done: 10, emoji: '📚', color: '#00D4FF' },
      { name: 'Health', done: 6, emoji: '🏃', color: '#4ADE80' },
      { name: 'Character', done: 4, emoji: '🤝', color: '#A78BFA' },
      { name: 'Creativity', done: 2, emoji: '🎨', color: '#FBBF24' },
      { name: 'Environment', done: 2, emoji: '🌱', color: '#22C55E' },
    ],
    recentQuests: [
      { title: 'Math Master', status: 'completed', xp: 150, emoji: '🔢', time: '2 hrs ago' },
      { title: 'Helping Hand', status: 'completed', xp: 120, emoji: '🤝', time: 'Yesterday' },
      { title: 'Reading Champion', status: 'active', xp: 200, emoji: '📚', time: 'In progress' },
      { title: 'Creative Artist', status: 'pending', xp: 180, emoji: '🎨', time: 'Awaiting approval' },
    ],
  },
  Sara: {
    avatar: '🦊',
    age: 9,
    level: 3,
    xp: 320,
    xpMax: 600,
    coins: 110,
    streak: 4,
    questsDone: 11,
    questsPending: 1,
    questsLocked: 4,
    totalXpEarned: 1650,
    badges: ['📚', '🔥'],
    weeklyXp: [60, 100, 0, 180, 90, 0, 0],
    categories: [
      { name: 'Education', done: 5, emoji: '📚', color: '#00D4FF' },
      { name: 'Health', done: 3, emoji: '🏃', color: '#4ADE80' },
      { name: 'Habits', done: 2, emoji: '🧹', color: '#38BDF8' },
      { name: 'Character', done: 1, emoji: '🤝', color: '#A78BFA' },
    ],
    recentQuests: [
      { title: 'Bookworm', status: 'completed', xp: 80, emoji: '📚', time: '1 day ago' },
      { title: 'Plant a Seed', status: 'active', xp: 200, emoji: '🌱', time: 'In progress' },
      { title: 'Fitness Champion', status: 'pending', xp: 160, emoji: '💪', time: 'Awaiting approval' },
    ],
  },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type ChildKey = 'Alex' | 'Sara';

export default function ParentQuestTrackerScreen({ navigation }: { navigation: NavigationProp }) {
  const [selectedChild, setSelectedChild] = useState<ChildKey>('Alex');
  const child = CHILDREN_DATA[selectedChild];
  const maxXp = Math.max(...child.weeklyXp, 1);

  const getStatusColor = (status: string) => {
    if (status === 'completed') return '#4ADE80';
    if (status === 'active') return '#00D4FF';
    if (status === 'pending') return '#FF6B35';
    return '#5A7A9A';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'completed') return '✅ Done';
    if (status === 'active') return '⚡ Active';
    if (status === 'pending') return '⏳ Pending';
    return '🔒 Locked';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Progress Tracker</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Child Selector */}
        <View style={styles.childSelector}>
          {(Object.keys(CHILDREN_DATA) as ChildKey[]).map((name) => {
            const c = CHILDREN_DATA[name];
            return (
              <TouchableOpacity
                key={name}
                style={[styles.childTab, selectedChild === name && styles.childTabActive]}
                onPress={() => setSelectedChild(name)}
              >
                <Text style={styles.childTabAvatar}>{c.avatar}</Text>
                <Text style={[styles.childTabName, selectedChild === name && styles.childTabNameActive]}>{name}</Text>
                <Text style={styles.childTabLevel}>Lvl {c.level}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Profile Summary */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <Text style={styles.profileAvatar}>{child.avatar}</Text>
          </View>
          <View style={styles.profileRight}>
            <Text style={styles.profileName}>{selectedChild}</Text>
            <Text style={styles.profileMeta}>Age {child.age} · ⚔️ Level {child.level}</Text>
            <View style={styles.xpBarWrap}>
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, { width: `${(child.xp / child.xpMax) * 100}%` }]} />
              </View>
              <Text style={styles.xpText}>{child.xp}/{child.xpMax} XP</Text>
            </View>
            <View style={styles.streakRow}>
              <Text style={styles.streakText}>🔥 {child.streak} day streak!</Text>
              <Text style={styles.totalXp}>⚡ {child.totalXpEarned.toLocaleString()} total XP</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {[
            { emoji: '✅', label: 'Completed', value: child.questsDone.toString(), color: '#4ADE80' },
            { emoji: '⏳', label: 'Pending', value: child.questsPending.toString(), color: '#FF6B35' },
            { emoji: '🔒', label: 'Locked', value: child.questsLocked.toString(), color: '#8899AA' },
            { emoji: '🪙', label: 'Coins', value: child.coins.toString(), color: '#FBBF24' },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color + '44' }]}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly XP Chart */}
        <Text style={styles.sectionTitle}>📈 Weekly XP Earned</Text>
        <View style={styles.chartCard}>
          <View style={styles.chart}>
            {child.weeklyXp.map((xp, idx) => (
              <View key={idx} style={styles.barWrap}>
                <Text style={styles.barXpLabel}>{xp > 0 ? xp : ''}</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(xp / maxXp) * 100}%`,
                        backgroundColor: xp > 0 ? '#FF6B35' : '#1E3A5F',
                        minHeight: xp > 0 ? 6 : 0,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barDay}>{DAYS[idx]}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chartTotal}>
            <Text style={styles.chartTotalLabel}>This week total</Text>
            <Text style={styles.chartTotalValue}>⚡ {child.weeklyXp.reduce((a, b) => a + b, 0)} XP</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>📂 Quest Categories</Text>
        <View style={styles.categoriesList}>
          {child.categories.map((cat) => {
            const pct = Math.round((cat.done / child.questsDone) * 100);
            return (
              <View key={cat.name} style={styles.categoryRow}>
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <View style={styles.catInfo}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={[styles.catCount, { color: cat.color }]}>{cat.done} quests · {pct}%</Text>
                  </View>
                  <View style={styles.catBarBg}>
                    <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>🏅 Earned Badges</Text>
        <View style={styles.badgesRow}>
          {child.badges.map((b, i) => (
            <View key={i} style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>{b}</Text>
            </View>
          ))}
          <View style={styles.badgeLocked}>
            <Text style={styles.badgeEmoji}>🔒</Text>
          </View>
          <View style={styles.badgeLocked}>
            <Text style={styles.badgeEmoji}>🔒</Text>
          </View>
        </View>

        {/* Recent Quests */}
        <Text style={styles.sectionTitle}>🕐 Recent Quests</Text>
        <View style={styles.questList}>
          {child.recentQuests.map((q, i) => (
            <View key={i} style={styles.questItem}>
              <View style={styles.questEmojiBox}>
                <Text style={{ fontSize: 22 }}>{q.emoji}</Text>
              </View>
              <View style={styles.questInfo}>
                <Text style={styles.questTitle}>{q.title}</Text>
                <Text style={styles.questTime}>{q.time}</Text>
              </View>
              <View style={styles.questRight}>
                <View style={[styles.questStatusBadge, { backgroundColor: getStatusColor(q.status) + '22', borderColor: getStatusColor(q.status) + '66' }]}>
                  <Text style={[styles.questStatusText, { color: getStatusColor(q.status) }]}>{getStatusLabel(q.status)}</Text>
                </View>
                <Text style={styles.questXp}>⚡ {q.xp}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Parent Note */}
        <View style={styles.parentNoteCard}>
          <Text style={styles.parentNoteTitle}>💬 Send Encouragement</Text>
          <Text style={styles.parentNoteSub}>Let {selectedChild} know you're proud of them!</Text>
          <View style={styles.quickMessages}>
            {['Great job! 🌟', 'Keep it up! 💪', 'So proud! ❤️', 'Amazing work! 🎉'].map((msg) => (
              <TouchableOpacity key={msg} style={styles.quickMsg}>
                <Text style={styles.quickMsgText}>{msg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('ParentDashboard')}>
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('ParentQuestApproval')}>
          <Text style={styles.navEmoji}>✅</Text>
          <Text style={styles.navLabel}>Quests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('ParentMap')}>
          <Text style={styles.navEmoji}>📍</Text>
          <Text style={styles.navLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navEmoji}>📊</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Progress</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1E3A5F', borderRadius: 10 },
  backBtnText: { color: '#00D4FF', fontWeight: '700', fontSize: 14 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  childSelector: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  childTab: { flex: 1, backgroundColor: '#1A2C3D', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#2A4A6A' },
  childTabActive: { borderColor: '#00D4FF', backgroundColor: '#1A3050' },
  childTabAvatar: { fontSize: 32, marginBottom: 6 },
  childTabName: { color: '#8899AA', fontWeight: '800', fontSize: 16 },
  childTabNameActive: { color: '#FFFFFF' },
  childTabLevel: { color: '#FF6B35', fontSize: 12, fontWeight: '700', marginTop: 3 },
  profileCard: { flexDirection: 'row', backgroundColor: '#1A2C3D', marginHorizontal: 20, borderRadius: 18, padding: 16, gap: 14, borderWidth: 1, borderColor: '#2A4A6A', marginBottom: 16, alignItems: 'center' },
  profileLeft: {},
  profileAvatar: { fontSize: 56 },
  profileRight: { flex: 1 },
  profileName: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  profileMeta: { color: '#8899AA', fontSize: 13, marginTop: 2, marginBottom: 8 },
  xpBarWrap: {},
  xpBarBg: { height: 10, backgroundColor: '#0D1B2A', borderRadius: 5, overflow: 'hidden', marginBottom: 5 },
  xpBarFill: { height: '100%', backgroundColor: '#FF6B35', borderRadius: 5 },
  xpText: { color: '#FF6B35', fontSize: 12, fontWeight: '700' },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  streakText: { color: '#FB7185', fontSize: 12, fontWeight: '700' },
  totalXp: { color: '#FF6B35', fontSize: 12, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1A2C3D', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 2 },
  statEmoji: { fontSize: 20, marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#8899AA', fontSize: 10, marginTop: 2, fontWeight: '600' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginHorizontal: 20, marginBottom: 12, marginTop: 4 },
  chartCard: { backgroundColor: '#1A2C3D', marginHorizontal: 20, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#2A4A6A', marginBottom: 20 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6 },
  barWrap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barXpLabel: { color: '#FF6B35', fontSize: 9, fontWeight: '700', marginBottom: 3, minHeight: 12 },
  barContainer: { width: '100%', height: 80, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 5 },
  barDay: { color: '#5A7A9A', fontSize: 10, marginTop: 5, fontWeight: '600' },
  chartTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2A4A6A' },
  chartTotalLabel: { color: '#8899AA', fontSize: 13 },
  chartTotalValue: { color: '#FF6B35', fontWeight: '800', fontSize: 14 },
  categoriesList: { marginHorizontal: 20, gap: 12, marginBottom: 20 },
  categoryRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  catEmoji: { fontSize: 24, width: 30, textAlign: 'center' },
  catInfo: { flex: 1 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  catName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  catCount: { fontSize: 12, fontWeight: '700' },
  catBarBg: { height: 8, backgroundColor: '#0D1B2A', borderRadius: 4, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 4 },
  badgesRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  badgeItem: { width: 58, height: 58, backgroundColor: '#1A2C3D', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FBBF2455' },
  badgeLocked: { width: 58, height: 58, backgroundColor: '#1A2C3D', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2A4A6A', opacity: 0.4 },
  badgeEmoji: { fontSize: 28 },
  questList: { marginHorizontal: 20, gap: 8, marginBottom: 20 },
  questItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2C3D', borderRadius: 14, padding: 12, gap: 10, borderWidth: 1, borderColor: '#2A4A6A' },
  questEmojiBox: { width: 44, height: 44, backgroundColor: '#0D1B2A', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  questInfo: { flex: 1 },
  questTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  questTime: { color: '#5A7A9A', fontSize: 11, marginTop: 2 },
  questRight: { alignItems: 'flex-end', gap: 4 },
  questStatusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  questStatusText: { fontSize: 11, fontWeight: '700' },
  questXp: { color: '#FF6B35', fontSize: 12, fontWeight: '700' },
  parentNoteCard: { backgroundColor: '#1A2C3D', marginHorizontal: 20, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#00D4FF33', marginBottom: 10 },
  parentNoteTitle: { color: '#00D4FF', fontWeight: '900', fontSize: 16, marginBottom: 4 },
  parentNoteSub: { color: '#8899AA', fontSize: 13, marginBottom: 12 },
  quickMessages: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickMsg: { backgroundColor: '#0D1B2A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#00D4FF44' },
  quickMsgText: { color: '#00D4FF', fontSize: 13, fontWeight: '600' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1A2C3D', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2A4A6A', position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navEmoji: { fontSize: 22 },
  navLabel: { color: '#5A7A9A', fontSize: 11, marginTop: 2, fontWeight: '600' },
  navActive: { color: '#00D4FF' },
});