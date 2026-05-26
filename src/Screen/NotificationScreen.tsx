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

const NOTIFICATIONS = [
  { id: '1', type: 'quest_approved', title: 'Quest Approved! 🎉', message: 'Your parent approved "Math Master" quest. Go earn those XP points!', time: '10 minutes ago', read: false, emoji: '✅', color: '#4ADE80' },
  { id: '2', type: 'reward', title: 'Coins Earned! 🪙', message: 'You earned 30 coins for completing "Helping Hand". Keep it up!', time: '2 hours ago', read: false, emoji: '🪙', color: '#FBBF24' },
  { id: '3', type: 'level_up', title: 'Level Up Alert! ⚡', message: "You are 320 XP away from reaching Level 6. You're so close!", time: '3 hours ago', read: false, emoji: '⚡', color: '#FF6B35' },
  { id: '4', type: 'parent_message', title: 'Message from Parent 👨‍👩‍👧', message: 'Great job on your reading quest! Keep up the amazing work!', time: 'Yesterday', read: true, emoji: '💬', color: '#00D4FF' },
  { id: '5', type: 'streak', title: '🔥 7-Day Streak!', message: 'You have completed quests for 7 days in a row. You earned the Streak Badge!', time: 'Yesterday', read: true, emoji: '🔥', color: '#FB7185' },
  { id: '6', type: 'new_quest', title: 'New Quest Available! 🗺️', message: '"Science Explorer" quest has been unlocked. Are you ready for the challenge?', time: '2 days ago', read: true, emoji: '🗺️', color: '#A78BFA' },
  { id: '7', type: 'quest_pending', title: 'Quest Waiting Approval ⏳', message: 'You submitted "Creative Artist". Waiting for parent approval.', time: '2 days ago', read: true, emoji: '⏳', color: '#8899AA' },
  { id: '8', type: 'badge', title: 'Badge Unlocked! 🏅', message: 'You earned the "Bookworm" badge for reading consistently this week!', time: '3 days ago', read: true, emoji: '🏅', color: '#FBBF24' },
];

const FILTERS = ['All', 'Unread', 'Quests', 'Rewards'];

export default function NotificationScreen({ navigation }: { navigation: NavigationProp }) {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('All');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.read;
    if (activeFilter === 'Quests') return ['quest_approved', 'quest_pending', 'new_quest'].includes(n.type);
    if (activeFilter === 'Rewards') return ['reward', 'badge', 'level_up', 'streak'].includes(n.type);
    return true;
  });

  const renderNotification = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.read && styles.unreadCard]}
      onPress={() => markRead(item.id)}
      activeOpacity={0.8}
    >
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: item.color }]} />}
      <View style={[styles.iconBox, { backgroundColor: item.color + '22', borderColor: item.color }]}>
        <Text style={styles.iconEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifTopRow}>
          <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]}>{item.title}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        <Text style={styles.notifMessage}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifications{unreadCount > 0 && <Text style={styles.unreadBadge}> ({unreadCount})</Text>}
        </Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAllText}>Read All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        {[
          { emoji: '🔔', value: unreadCount, label: 'Unread', color: '#FF6B35' },
          { emoji: '✅', value: notifications.filter(n => n.type === 'quest_approved').length, label: 'Approved', color: '#4ADE80' },
          { emoji: '🪙', value: notifications.filter(n => n.type === 'reward').length, label: 'Rewards', color: '#FBBF24' },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryCard, { borderColor: s.color }]}>
            <Text style={styles.summaryEmoji}>{s.emoji}</Text>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterBtn, activeFilter === f && styles.activeFilter]} onPress={() => setActiveFilter(f)}>
            <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>No notifications here. Keep doing your quests!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('QuestList')}>
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={styles.navLabel}>Quests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.push('ChildProfile')}>
          <Text style={styles.navEmoji}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navEmoji}>🔔</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Alerts</Text>
          {unreadCount > 0 && (
            <View style={styles.navBadge}><Text style={styles.navBadgeText}>{unreadCount}</Text></View>
          )}
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
  unreadBadge: { color: '#FF6B35' },
  markAllText: { color: '#00D4FF', fontSize: 13, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 14 },
  summaryCard: { flex: 1, backgroundColor: '#1A2C3D', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 2 },
  summaryEmoji: { fontSize: 22, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: '#8899AA', fontSize: 11, marginTop: 2, fontWeight: '600' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E3A5F' },
  activeFilter: { backgroundColor: '#FF6B35' },
  filterText: { color: '#8899AA', fontSize: 13, fontWeight: '700' },
  activeFilterText: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  notifCard: { flexDirection: 'row', backgroundColor: '#1A2C3D', borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: '#2A4A6A', alignItems: 'flex-start', position: 'relative' },
  unreadCard: { borderColor: '#3A5A7A', backgroundColor: '#1E3040' },
  unreadDot: { position: 'absolute', top: 14, right: 14, width: 10, height: 10, borderRadius: 5 },
  iconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, flexShrink: 0 },
  iconEmoji: { fontSize: 24 },
  notifContent: { flex: 1 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 },
  notifTitle: { color: '#CCDDEE', fontSize: 14, fontWeight: '700', flex: 1 },
  unreadTitle: { color: '#FFFFFF', fontWeight: '900' },
  notifTime: { color: '#5A7A9A', fontSize: 11, flexShrink: 0 },
  notifMessage: { color: '#8899AA', fontSize: 13, lineHeight: 18 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 80 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  emptyText: { color: '#8899AA', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1A2C3D', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2A4A6A', position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4, position: 'relative' },
  navEmoji: { fontSize: 22 },
  navLabel: { color: '#5A7A9A', fontSize: 11, marginTop: 2, fontWeight: '600' },
  navActive: { color: '#FF6B35' },
  navBadge: { position: 'absolute', top: 0, right: '25%', backgroundColor: '#FF6B35', borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  navBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
});