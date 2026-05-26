import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';

type NavigationProp = {
  navigate: (screen: string) => void;
  push: (screen: string) => void;
  back: () => void;
};

const QUESTS = [
  { id: '1', title: 'Math Master', description: 'Complete 10 math problems and earn coins!', xp: 150, coins: 30, emoji: '🔢', category: 'Education', difficulty: 'Easy', status: 'active', progress: 6, total: 10, color: '#FF6B35' },
  { id: '2', title: 'Reading Champion', description: 'Read for 20 minutes every day this week.', xp: 200, coins: 40, emoji: '📚', category: 'Habits', difficulty: 'Medium', status: 'active', progress: 3, total: 7, color: '#00D4FF' },
  { id: '3', title: 'Helping Hand', description: 'Help someone at home 5 times this week.', xp: 120, coins: 25, emoji: '🤝', category: 'Character', difficulty: 'Easy', status: 'completed', progress: 5, total: 5, color: '#4ADE80' },
  { id: '4', title: 'Exercise Hero', description: 'Do 30 minutes of physical activity today.', xp: 100, coins: 20, emoji: '🏃', category: 'Health', difficulty: 'Easy', status: 'active', progress: 0, total: 1, color: '#A78BFA' },
  { id: '5', title: 'Creative Artist', description: 'Draw or paint something amazing!', xp: 180, coins: 35, emoji: '🎨', category: 'Creativity', difficulty: 'Medium', status: 'locked', progress: 0, total: 1, color: '#FBBF24' },
  { id: '6', title: 'Science Explorer', description: 'Watch a science video and write 5 facts.', xp: 250, coins: 50, emoji: '🔬', category: 'Education', difficulty: 'Hard', status: 'locked', progress: 0, total: 1, color: '#FB7185' },

  // Naye Quests
  { id: '7', title: 'Recycle Star', description: 'Recycle 5 items today — plastic, paper, or glass!', xp: 130, coins: 25, emoji: '♻️', category: 'Environment', difficulty: 'Easy', status: 'active', progress: 2, total: 5, color: '#4ADE80' },
  { id: '8', title: 'Plant a Seed', description: 'Plant a seed or sapling and water it every day this week.', xp: 200, coins: 40, emoji: '🌱', category: 'Environment', difficulty: 'Medium', status: 'active', progress: 1, total: 7, color: '#22C55E' },
  { id: '9', title: 'Fitness Champion', description: 'Complete a full exercise routine — jumping jacks, pushups & stretching!', xp: 160, coins: 30, emoji: '💪', category: 'Health', difficulty: 'Medium', status: 'active', progress: 0, total: 1, color: '#F97316' },
  { id: '10', title: 'Garbage Collector', description: 'Pick up 10 pieces of garbage from your street or park.', xp: 180, coins: 35, emoji: '🗑️', category: 'Environment', difficulty: 'Easy', status: 'active', progress: 0, total: 10, color: '#A3E635' },
  { id: '11', title: 'Room Cleaner', description: 'Clean your room completely — bed, floor, and desk!', xp: 110, coins: 20, emoji: '🧹', category: 'Habits', difficulty: 'Easy', status: 'active', progress: 0, total: 1, color: '#38BDF8' },
];

const FILTERS = ['All', 'Active', 'Completed', 'Locked'];

function getDiffColor(d: string) {
  if (d === 'Easy') return '#4ADE8044';
  if (d === 'Medium') return '#FBBF2444';
  return '#FB718544';
}

export default function QuestListScreen({ navigation }: { navigation: NavigationProp }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = QUESTS.filter((q) => {
    if (activeFilter === 'All') return true;
    return q.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const renderQuest = ({ item }: any) => {
    const progressPct = (item.progress / item.total) * 100;
    const isLocked = item.status === 'locked';
    const isCompleted = item.status === 'completed';

    return (
      <TouchableOpacity
        style={[styles.questCard, isLocked && styles.lockedCard]}
        onPress={() => !isLocked && navigation.push('ChildProfile')}
        activeOpacity={isLocked ? 1 : 0.8}
      >
        <View style={styles.questTop}>
          <View style={[styles.emojiBox, { backgroundColor: item.color + '22', borderColor: item.color }]}>
            <Text style={styles.questEmoji}>{isLocked ? '🔒' : item.emoji}</Text>
          </View>
          <View style={styles.questInfo}>
            <View style={styles.questTitleRow}>
              <Text style={[styles.questTitle, isLocked && styles.lockedText]}>{item.title}</Text>
              {isCompleted && <Text style={styles.completedBadge}>✅ Done</Text>}
              {isLocked && <Text style={styles.lockedBadge}>🔒 Locked</Text>}
            </View>
            <Text style={[styles.questDesc, isLocked && styles.lockedText]}>{item.description}</Text>
          </View>
        </View>

        {!isLocked && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: isCompleted ? '#4ADE80' : item.color }]} />
            </View>
            <Text style={styles.progressText}>{item.progress}/{item.total}</Text>
          </View>
        )}

        <View style={styles.rewardsRow}>
          <View style={styles.rewardBadge}><Text style={styles.rewardText}>⚡ {item.xp} XP</Text></View>
          <View style={styles.rewardBadge}><Text style={styles.rewardText}>🪙 {item.coins}</Text></View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDiffColor(item.difficulty) }]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
          <View style={styles.categoryBadge}><Text style={styles.categoryText}>{item.category}</Text></View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Ready to level up? 🚀</Text>
          <Text style={styles.headerTitle}>Your Quests</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.push('ChildProfile')}>
          <Text style={styles.profileBtnText}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.xpCard}>
        <View style={styles.xpLeft}>
          <Text style={styles.xpLabel}>Level 5 Hero</Text>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: '68%' }]} />
          </View>
          <Text style={styles.xpSub}>680 / 1000 XP to Level 6</Text>
        </View>
        <View style={styles.xpRight}>
          <Text style={styles.coinsText}>🪙 245</Text>
          <Text style={styles.coinsLabel}>Coins</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.activeFilter]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderQuest}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Quests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('ChildProfile')}>
          <Text style={styles.navEmoji}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
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
  headerGreeting: { color: '#8899AA', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  profileBtn: { width: 48, height: 48, backgroundColor: '#1E3A5F', borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#00D4FF' },
  profileBtnText: { fontSize: 22 },
  xpCard: { flexDirection: 'row', backgroundColor: '#1A2C3D', marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A4A6A', alignItems: 'center' },
  xpLeft: { flex: 1 },
  xpLabel: { color: '#00D4FF', fontSize: 14, fontWeight: '800', marginBottom: 6 },
  xpBarBg: { height: 10, backgroundColor: '#0D1B2A', borderRadius: 5, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#FF6B35', borderRadius: 5 },
  xpSub: { color: '#5A7A9A', fontSize: 11, marginTop: 4 },
  xpRight: { alignItems: 'center', marginLeft: 16 },
  coinsText: { color: '#FBBF24', fontSize: 22, fontWeight: '900' },
  coinsLabel: { color: '#5A7A9A', fontSize: 11 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E3A5F' },
  activeFilter: { backgroundColor: '#FF6B35' },
  filterText: { color: '#8899AA', fontSize: 13, fontWeight: '700' },
  activeFilterText: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 20, paddingBottom: 90, gap: 12 },
  questCard: { backgroundColor: '#1A2C3D', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#2A4A6A' },
  lockedCard: { opacity: 0.5 },
  questTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  emojiBox: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  questEmoji: { fontSize: 28 },
  questInfo: { flex: 1 },
  questTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  questTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  questDesc: { color: '#8899AA', fontSize: 13, marginTop: 4, lineHeight: 18 },
  lockedText: { color: '#5A7A9A' },
  completedBadge: { fontSize: 12, color: '#4ADE80', fontWeight: '700' },
  lockedBadge: { fontSize: 12, color: '#8899AA', fontWeight: '700' },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#0D1B2A', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressText: { color: '#8899AA', fontSize: 12, fontWeight: '700', minWidth: 30 },
  rewardsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  rewardBadge: { backgroundColor: '#0D1B2A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  rewardText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  difficultyBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  difficultyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  categoryBadge: { backgroundColor: '#1E3A5F', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  categoryText: { color: '#00D4FF', fontSize: 12, fontWeight: '700' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1A2C3D', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2A4A6A' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navEmoji: { fontSize: 22 },
  navLabel: { color: '#5A7A9A', fontSize: 11, marginTop: 2, fontWeight: '600' },
  navActive: { color: '#FF6B35' },
});