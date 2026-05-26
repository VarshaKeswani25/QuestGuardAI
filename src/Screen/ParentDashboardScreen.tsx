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

const CHILDREN = [
  {
    id: '1', name: 'Alex', age: 12, avatar: '🦁', level: 5,
    xp: 680, xpMax: 1000, coins: 245, streak: 7,
    questsDone: 24, questsPending: 3,
    status: 'online', lastSeen: 'Just now',
    location: 'Home 🏠',
  },
  {
    id: '2', name: 'Sara', age: 9, avatar: '🦊', level: 3,
    xp: 320, xpMax: 600, coins: 110, streak: 4,
    questsDone: 11, questsPending: 1,
    status: 'offline', lastSeen: '2 hours ago',
    location: 'School 🏫',
  },
];

const PENDING_QUESTS = [
  { id: '1', child: 'Alex', childAvatar: '🦁', title: 'Creative Artist', emoji: '🎨', xp: 180, coins: 35, submitted: '1 hour ago', category: 'Creativity' },
  { id: '2', child: 'Alex', childAvatar: '🦁', title: 'Science Explorer', emoji: '🔬', xp: 250, coins: 50, submitted: '3 hours ago', category: 'Education' },
  { id: '3', child: 'Sara', childAvatar: '🦊', title: 'Fitness Champion', emoji: '💪', xp: 160, coins: 30, submitted: 'Yesterday', category: 'Health' },
];

const RECENT_ACTIVITY = [
  { id: '1', child: 'Alex', avatar: '🦁', action: 'completed Math Master', xp: '+150 XP', time: '2 hrs ago', emoji: '🔢', type: 'complete' },
  { id: '2', child: 'Sara', avatar: '🦊', action: 'earned Bookworm badge', xp: '🏅 Badge', time: '5 hrs ago', emoji: '📚', type: 'badge' },
  { id: '3', child: 'Alex', avatar: '🦁', action: 'leveled up to Level 5!', xp: '⚡ Level Up', time: 'Yesterday', emoji: '🎉', type: 'levelup' },
  { id: '4', child: 'Sara', avatar: '🦊', action: 'started Plant a Seed quest', xp: 'In Progress', time: 'Yesterday', emoji: '🌱', type: 'start' },
];

export default function ParentDashboardScreen({ navigation }: { navigation: NavigationProp }) {
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0]);

  const totalPending = PENDING_QUESTS.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>Welcome back 👋</Text>
            <Text style={styles.headerName}>Parent Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.push('ParentNotifications')}>
            <Text style={styles.notifEmoji}>🔔</Text>
            {totalPending > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{totalPending}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          {[
            { emoji: '👶', label: 'Children', value: CHILDREN.length.toString(), color: '#00D4FF' },
            { emoji: '⏳', label: 'Pending', value: totalPending.toString(), color: '#FF6B35' },
            { emoji: '✅', label: 'Completed', value: '35', color: '#4ADE80' },
            { emoji: '🪙', label: 'Total Coins', value: '355', color: '#FBBF24' },
          ].map((s) => (
            <View key={s.label} style={[styles.summaryCard, { borderColor: s.color + '55' }]}>
              <Text style={styles.summaryEmoji}>{s.emoji}</Text>
              <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Children Selector */}
        <Text style={styles.sectionTitle}>👶 Your Children</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll} contentContainerStyle={styles.childScrollContent}>
          {CHILDREN.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[styles.childCard, selectedChild.id === child.id && styles.childCardSelected]}
              onPress={() => setSelectedChild(child)}
            >
              <View style={styles.childAvatarWrap}>
                <Text style={styles.childAvatar}>{child.avatar}</Text>
                <View style={[styles.statusDot, { backgroundColor: child.status === 'online' ? '#4ADE80' : '#5A7A9A' }]} />
              </View>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childAge}>Age {child.age}</Text>
              <Text style={styles.childLevel}>⚔️ Level {child.level}</Text>
              <Text style={styles.childLocation}>{child.location}</Text>
            </TouchableOpacity>
          ))}

          {/* Add Child Button */}
          <TouchableOpacity style={styles.addChildCard}>
            <Text style={styles.addChildIcon}>➕</Text>
            <Text style={styles.addChildText}>Add Child</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Selected Child Detail */}
        <View style={styles.childDetailCard}>
          <View style={styles.childDetailHeader}>
            <Text style={styles.childDetailAvatar}>{selectedChild.avatar}</Text>
            <View style={styles.childDetailInfo}>
              <Text style={styles.childDetailName}>{selectedChild.name}</Text>
              <Text style={styles.childDetailMeta}>Age {selectedChild.age} · Level {selectedChild.level} · {selectedChild.location}</Text>
              <View style={[styles.onlineBadge, { backgroundColor: selectedChild.status === 'online' ? '#4ADE8022' : '#5A7A9A22' }]}>
                <View style={[styles.onlineDot, { backgroundColor: selectedChild.status === 'online' ? '#4ADE80' : '#5A7A9A' }]} />
                <Text style={[styles.onlineText, { color: selectedChild.status === 'online' ? '#4ADE80' : '#5A7A9A' }]}>
                  {selectedChild.status === 'online' ? 'Online now' : `Last seen ${selectedChild.lastSeen}`}
                </Text>
              </View>
            </View>
          </View>

          {/* XP Bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>Progress to Level {selectedChild.level + 1}</Text>
              <Text style={styles.xpAmount}>{selectedChild.xp} / {selectedChild.xpMax} XP</Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${(selectedChild.xp / selectedChild.xpMax) * 100}%` }]} />
            </View>
          </View>

          {/* Child Stats Grid */}
          <View style={styles.childStats}>
            {[
              { emoji: '✅', label: 'Quests Done', value: selectedChild.questsDone.toString(), color: '#4ADE80' },
              { emoji: '⏳', label: 'Pending', value: selectedChild.questsPending.toString(), color: '#FF6B35' },
              { emoji: '🪙', label: 'Coins', value: selectedChild.coins.toString(), color: '#FBBF24' },
              { emoji: '🔥', label: 'Streak', value: `${selectedChild.streak}d`, color: '#FB7185' },
            ].map((s) => (
              <View key={s.label} style={[styles.childStatCard, { borderColor: s.color + '44' }]}>
                <Text style={styles.childStatEmoji}>{s.emoji}</Text>
                <Text style={[styles.childStatValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.childStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.push('ParentMap')}>
              <Text style={styles.actionBtnEmoji}>📍</Text>
              <Text style={styles.actionBtnText}>Live Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOrange]} onPress={() => navigation.push('ParentQuestApproval')}>
              <Text style={styles.actionBtnEmoji}>✅</Text>
              <Text style={styles.actionBtnText}>Approve Quests</Text>
              {selectedChild.questsPending > 0 && (
                <View style={styles.actionBadge}><Text style={styles.actionBadgeText}>{selectedChild.questsPending}</Text></View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Approvals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⏳ Pending Approvals</Text>
          <TouchableOpacity onPress={() => navigation.push('ParentQuestApproval')}>
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pendingScroll}>
          {PENDING_QUESTS.map((q) => (
            <View key={q.id} style={styles.pendingCard}>
              <View style={styles.pendingTop}>
                <Text style={styles.pendingEmoji}>{q.emoji}</Text>
                <View style={styles.pendingChildChip}>
                  <Text style={styles.pendingChildAvatar}>{q.childAvatar}</Text>
                  <Text style={styles.pendingChildName}>{q.child}</Text>
                </View>
              </View>
              <Text style={styles.pendingTitle}>{q.title}</Text>
              <Text style={styles.pendingCategory}>{q.category}</Text>
              <Text style={styles.pendingTime}>Submitted {q.submitted}</Text>
              <View style={styles.pendingRewards}>
                <Text style={styles.pendingXp}>⚡ {q.xp} XP</Text>
                <Text style={styles.pendingCoins}>🪙 {q.coins}</Text>
              </View>
              <View style={styles.pendingBtns}>
                <TouchableOpacity style={styles.approveBtn}>
                  <Text style={styles.approveBtnText}>✅ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn}>
                  <Text style={styles.rejectBtnText}>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>🕐 Recent Activity</Text>
        <View style={styles.activityList}>
          {RECENT_ACTIVITY.map((a) => (
            <View key={a.id} style={styles.activityItem}>
              <View style={styles.activityEmojiBox}>
                <Text style={styles.activityEmoji}>{a.emoji}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  <Text style={styles.activityChild}>{a.child}</Text>
                  {' '}{a.action}
                </Text>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
              <Text style={[styles.activityXp, { color: a.type === 'complete' ? '#4ADE80' : a.type === 'levelup' ? '#FF6B35' : '#FBBF24' }]}>
                {a.xp}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick Settings */}
        <Text style={styles.sectionTitle}>⚙️ Parental Controls</Text>
        <View style={styles.controlsCard}>
          {[
            { emoji: '🕐', label: 'Screen Time Limits', sub: 'Max 2 hours/day', action: 'Edit' },
            { emoji: '🔒', label: 'Quest Difficulty Lock', sub: 'Hard quests need approval', action: 'Manage' },
            { emoji: '📍', label: 'Location Tracking', sub: 'Always on', action: 'Settings' },
            { emoji: '💬', label: 'Parent Messages', sub: 'Send encouragement', action: 'Message' },
          ].map((c) => (
            <View key={c.label} style={styles.controlItem}>
              <Text style={styles.controlEmoji}>{c.emoji}</Text>
              <View style={styles.controlInfo}>
                <Text style={styles.controlLabel}>{c.label}</Text>
                <Text style={styles.controlSub}>{c.sub}</Text>
              </View>
              <TouchableOpacity style={styles.controlAction}>
                <Text style={styles.controlActionText}>{c.action}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('ParentQuestApproval')}>
          <Text style={styles.navEmoji}>✅</Text>
          <Text style={styles.navLabel}>Quests</Text>
          {totalPending > 0 && <View style={styles.navBadge}><Text style={styles.navBadgeText}>{totalPending}</Text></View>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('ParentMap')}>
          <Text style={styles.navEmoji}>📍</Text>
          <Text style={styles.navLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('ParentQuestTracker')}>
          <Text style={styles.navEmoji}>📊</Text>
          <Text style={styles.navLabel}>Progress</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerGreeting: { color: '#8899AA', fontSize: 14, fontWeight: '600' },
  headerName: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  notifBtn: { width: 46, height: 46, backgroundColor: '#1E3A5F', borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#00D4FF', position: 'relative' },
  notifEmoji: { fontSize: 20 },
  notifBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF6B35', borderRadius: 8, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: '#1A2C3D', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 2 },
  summaryEmoji: { fontSize: 20, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '900' },
  summaryLabel: { color: '#8899AA', fontSize: 10, marginTop: 2, fontWeight: '600' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginHorizontal: 20, marginBottom: 12, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 },
  seeAllText: { color: '#00D4FF', fontSize: 13, fontWeight: '700' },
  childScroll: { marginBottom: 16 },
  childScrollContent: { paddingHorizontal: 20, gap: 12 },
  childCard: { backgroundColor: '#1A2C3D', borderRadius: 18, padding: 16, alignItems: 'center', minWidth: 120, borderWidth: 2, borderColor: '#2A4A6A' },
  childCardSelected: { borderColor: '#00D4FF', backgroundColor: '#1A3050' },
  childAvatarWrap: { position: 'relative', marginBottom: 8 },
  childAvatar: { fontSize: 40 },
  statusDot: { position: 'absolute', bottom: 0, right: -2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#0D1B2A' },
  childName: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  childAge: { color: '#8899AA', fontSize: 12, marginTop: 2 },
  childLevel: { color: '#FF6B35', fontSize: 12, fontWeight: '700', marginTop: 3 },
  childLocation: { color: '#5A7A9A', fontSize: 11, marginTop: 4 },
  addChildCard: { backgroundColor: '#1A2C3D', borderRadius: 18, padding: 16, alignItems: 'center', minWidth: 100, borderWidth: 2, borderColor: '#2A4A6A', borderStyle: 'dashed', justifyContent: 'center' },
  addChildIcon: { fontSize: 30, marginBottom: 6 },
  addChildText: { color: '#5A7A9A', fontSize: 13, fontWeight: '700' },
  childDetailCard: { backgroundColor: '#1A2C3D', marginHorizontal: 20, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#00D4FF33', marginBottom: 20 },
  childDetailHeader: { flexDirection: 'row', gap: 14, marginBottom: 14, alignItems: 'center' },
  childDetailAvatar: { fontSize: 52 },
  childDetailInfo: { flex: 1 },
  childDetailName: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  childDetailMeta: { color: '#8899AA', fontSize: 13, marginTop: 3 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 6, alignSelf: 'flex-start' },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineText: { fontSize: 12, fontWeight: '700' },
  xpSection: { marginBottom: 14 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  xpLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  xpAmount: { color: '#FF6B35', fontSize: 13, fontWeight: '800' },
  xpBarBg: { height: 10, backgroundColor: '#0D1B2A', borderRadius: 5, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#FF6B35', borderRadius: 5 },
  childStats: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  childStatCard: { flex: 1, backgroundColor: '#0D1B2A', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 2 },
  childStatEmoji: { fontSize: 18, marginBottom: 4 },
  childStatValue: { fontSize: 17, fontWeight: '900' },
  childStatLabel: { color: '#8899AA', fontSize: 10, marginTop: 2 },
  actionBtns: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, backgroundColor: '#0D1B2A', borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 2, borderColor: '#00D4FF', flexDirection: 'row', justifyContent: 'center', gap: 6, position: 'relative' },
  actionBtnOrange: { borderColor: '#FF6B35' },
  actionBtnEmoji: { fontSize: 16 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  actionBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FF6B35', borderRadius: 8, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  actionBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  pendingScroll: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  pendingCard: { backgroundColor: '#1A2C3D', borderRadius: 18, padding: 16, width: 200, borderWidth: 1, borderColor: '#FF6B3533' },
  pendingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pendingEmoji: { fontSize: 32 },
  pendingChildChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0D1B2A', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  pendingChildAvatar: { fontSize: 14 },
  pendingChildName: { color: '#8899AA', fontSize: 12, fontWeight: '700' },
  pendingTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, marginBottom: 3 },
  pendingCategory: { color: '#00D4FF', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  pendingTime: { color: '#5A7A9A', fontSize: 11, marginBottom: 8 },
  pendingRewards: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  pendingXp: { color: '#FF6B35', fontWeight: '700', fontSize: 12 },
  pendingCoins: { color: '#FBBF24', fontWeight: '700', fontSize: 12 },
  pendingBtns: { flexDirection: 'row', gap: 8 },
  approveBtn: { flex: 1, backgroundColor: '#4ADE8022', borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#4ADE80' },
  approveBtnText: { color: '#4ADE80', fontWeight: '700', fontSize: 13 },
  rejectBtn: { backgroundColor: '#FB718522', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: '#FB7185' },
  rejectBtnText: { fontSize: 14 },
  activityList: { marginHorizontal: 20, gap: 10, marginBottom: 20 },
  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2C3D', borderRadius: 14, padding: 12, gap: 10, borderWidth: 1, borderColor: '#2A4A6A' },
  activityEmojiBox: { width: 40, height: 40, backgroundColor: '#0D1B2A', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activityEmoji: { fontSize: 20 },
  activityInfo: { flex: 1 },
  activityText: { color: '#CCDDEE', fontSize: 13 },
  activityChild: { color: '#FFFFFF', fontWeight: '800' },
  activityTime: { color: '#5A7A9A', fontSize: 11, marginTop: 2 },
  activityXp: { fontSize: 12, fontWeight: '800' },
  controlsCard: { backgroundColor: '#1A2C3D', marginHorizontal: 20, borderRadius: 18, borderWidth: 1, borderColor: '#2A4A6A', overflow: 'hidden', marginBottom: 10 },
  controlItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#2A4A6A' },
  controlEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  controlInfo: { flex: 1 },
  controlLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  controlSub: { color: '#5A7A9A', fontSize: 12, marginTop: 2 },
  controlAction: { backgroundColor: '#00D4FF22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#00D4FF44' },
  controlActionText: { color: '#00D4FF', fontSize: 12, fontWeight: '700' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1A2C3D', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2A4A6A', position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4, position: 'relative' },
  navEmoji: { fontSize: 22 },
  navLabel: { color: '#5A7A9A', fontSize: 11, marginTop: 2, fontWeight: '600' },
  navActive: { color: '#00D4FF' },
  navBadge: { position: 'absolute', top: 0, right: '20%', backgroundColor: '#FF6B35', borderRadius: 7, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  navBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
});