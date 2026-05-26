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

const BADGES = [
  { id: '1', emoji: '🏆', title: 'Top Scorer', earned: true },
  { id: '2', emoji: '📚', title: 'Bookworm', earned: true },
  { id: '3', emoji: '🔥', title: '7-Day Streak', earned: true },
  { id: '4', emoji: '🎯', title: 'Sharpshooter', earned: true },
  { id: '5', emoji: '💪', title: 'Fitness Star', earned: false },
  { id: '6', emoji: '🌟', title: 'Legend', earned: false },
];

const STATS = [
  { label: 'Quests Done', value: '24', emoji: '✅', color: '#4ADE80' },
  { label: 'Total XP', value: '3,480', emoji: '⚡', color: '#FF6B35' },
  { label: 'Coins', value: '245', emoji: '🪙', color: '#FBBF24' },
  { label: 'Day Streak', value: '7', emoji: '🔥', color: '#FB7185' },
];

const HISTORY = [
  { id: '1', title: 'Math Master completed', time: '2 hours ago', xp: '+150 XP', emoji: '🔢' },
  { id: '2', title: 'Helping Hand completed', time: 'Yesterday', xp: '+120 XP', emoji: '🤝' },
  { id: '3', title: 'Reading 20min done', time: '2 days ago', xp: '+50 XP', emoji: '📚' },
  { id: '4', title: 'Exercise Hero done', time: '3 days ago', xp: '+100 XP', emoji: '🏃' },
];

const AVATAR_OPTIONS = ['🦁', '🐯', '🦊', '🐺', '🦅', '🐉'];

export default function ChildProfileScreen({ navigation }: { navigation: NavigationProp }) {
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.profileHero}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => setShowAvatarPicker(!showAvatarPicker)}>
            <Text style={styles.avatarEmoji}>{selectedAvatar}</Text>
            <View style={styles.editAvatarBadge}><Text style={styles.editAvatarText}>✏️</Text></View>
          </TouchableOpacity>

          {showAvatarPicker && (
            <View style={styles.avatarPicker}>
              <Text style={styles.avatarPickerTitle}>Choose your avatar!</Text>
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.avatarOption, selectedAvatar === a && styles.avatarOptionSelected]}
                    onPress={() => { setSelectedAvatar(a); setShowAvatarPicker(false); }}
                  >
                    <Text style={styles.avatarOptionEmoji}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.profileName}>Alex the Hero</Text>
          <Text style={styles.profileAge}>Age 12 · Level 5 Explorer</Text>
          <View style={styles.levelBadge}><Text style={styles.levelBadgeText}>⚔️ LEVEL 5</Text></View>
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Progress to Level 6</Text>
            <Text style={styles.xpAmount}>680 / 1000 XP</Text>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: '68%' }]} />
          </View>
          <Text style={styles.xpRemaining}>320 XP more to level up! 🚀</Text>
        </View>

        <Text style={styles.sectionTitle}>📊 My Stats</Text>
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color }]}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>🏅 Badges Earned</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((b) => (
            <View key={b.id} style={[styles.badgeCard, !b.earned && styles.badgeLocked]}>
              <Text style={styles.badgeEmoji}>{b.earned ? b.emoji : '🔒'}</Text>
              <Text style={[styles.badgeTitle, !b.earned && styles.badgeLockedText]}>{b.title}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>🕐 Recent Activity</Text>
        <View style={styles.historyList}>
          {HISTORY.map((h) => (
            <View key={h.id} style={styles.historyItem}>
              <View style={styles.historyEmojiBox}><Text style={styles.historyEmoji}>{h.emoji}</Text></View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{h.title}</Text>
                <Text style={styles.historyTime}>{h.time}</Text>
              </View>
              <Text style={styles.historyXp}>{h.xp}</Text>
            </View>
          ))}
        </View>

        <View style={styles.parentCard}>
          <Text style={styles.parentCardTitle}>👨‍👩‍👧 Parent Account Linked</Text>
          <Text style={styles.parentCardSub}>Your parent can see your progress and approve quests.</Text>
          <TouchableOpacity style={styles.parentBtn}>
            <Text style={styles.parentBtnText}>View Parent Dashboard →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('QuestList')}>
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={styles.navLabel}>Quests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navEmoji}>👤</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('Notifications')}>
          <Text style={styles.navEmoji}>🔔</Text>
          <Text style={styles.navLabel}>Alerts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1E3A5F', borderRadius: 10 },
  backBtnText: { color: '#00D4FF', fontWeight: '700', fontSize: 14 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  profileHero: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarEmoji: { fontSize: 80, textAlign: 'center' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: -5, backgroundColor: '#FF6B35', borderRadius: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  editAvatarText: { fontSize: 14 },
  avatarPicker: { backgroundColor: '#1A2C3D', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A4A6A', width: '100%' },
  avatarPickerTitle: { color: '#00D4FF', fontWeight: '800', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  avatarOption: { width: 54, height: 54, backgroundColor: '#0D1B2A', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2A4A6A' },
  avatarOptionSelected: { borderColor: '#FF6B35', backgroundColor: '#FF6B3522' },
  avatarOptionEmoji: { fontSize: 28 },
  profileName: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  profileAge: { color: '#8899AA', fontSize: 15, marginTop: 4 },
  levelBadge: { backgroundColor: '#FF6B35', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginTop: 10 },
  levelBadgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  xpCard: { backgroundColor: '#1A2C3D', marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#2A4A6A' },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  xpAmount: { color: '#FF6B35', fontWeight: '800', fontSize: 14 },
  xpBarBg: { height: 12, backgroundColor: '#0D1B2A', borderRadius: 6, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#FF6B35', borderRadius: 6 },
  xpRemaining: { color: '#8899AA', fontSize: 12, marginTop: 6, textAlign: 'center' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginHorizontal: 20, marginBottom: 12, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statCard: { width: '47%', backgroundColor: '#1A2C3D', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2 },
  statEmoji: { fontSize: 28, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#8899AA', fontSize: 12, marginTop: 2, fontWeight: '600' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  badgeCard: { width: '30%', backgroundColor: '#1A2C3D', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2A4A6A' },
  badgeLocked: { opacity: 0.4 },
  badgeEmoji: { fontSize: 30, marginBottom: 6 },
  badgeTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  badgeLockedText: { color: '#5A7A9A' },
  historyList: { marginHorizontal: 20, gap: 10, marginBottom: 20 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2C3D', borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: '#2A4A6A' },
  historyEmojiBox: { width: 44, height: 44, backgroundColor: '#0D1B2A', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  historyEmoji: { fontSize: 22 },
  historyInfo: { flex: 1 },
  historyTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  historyTime: { color: '#5A7A9A', fontSize: 12, marginTop: 2 },
  historyXp: { color: '#4ADE80', fontWeight: '800', fontSize: 13 },
  parentCard: { backgroundColor: '#1A2C3D', marginHorizontal: 20, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#00D4FF44', marginBottom: 10 },
  parentCardTitle: { color: '#00D4FF', fontWeight: '900', fontSize: 16, marginBottom: 6 },
  parentCardSub: { color: '#8899AA', fontSize: 13, marginBottom: 12 },
  parentBtn: { backgroundColor: '#00D4FF22', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#00D4FF55' },
  parentBtnText: { color: '#00D4FF', fontWeight: '700', fontSize: 13 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1A2C3D', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2A4A6A', position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navEmoji: { fontSize: 22 },
  navLabel: { color: '#5A7A9A', fontSize: 11, marginTop: 2, fontWeight: '600' },
  navActive: { color: '#FF6B35' },
});