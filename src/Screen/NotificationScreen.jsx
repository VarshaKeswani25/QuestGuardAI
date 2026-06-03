import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { getAuth } from 'firebase/auth';
import { getUserNotifications, markNotificationRead } from '../../services/notificationService';
import { T } from '../theme';

const TYPE_CFG = {
  xp_earned:       { emoji: '⚡', color: T.warn    },
  quest_approved: { emoji: '✅', color: T.success  },
  quest_rejected: { emoji: '❌', color: T.danger   },
  level_up:        { emoji: '🏆', color: T.purple   },
  general:        { emoji: '🔔', color: T.blue     },
};

const EMPTY = [{ id: 'e1', title: 'Welcome to QuestGuard!', body: 'Complete your first eco mission to earn XP.', type: 'general', read: false, createdAt: Date.now() - 60000 }];

const timeAgo = (ts) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function NotificationScreen({ navigation }) {
  const userId = getAuth().currentUser?.uid;
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme configuration for the Navigation Bar
  const theme = {
    accent: T.accent || '#5BAD3E',
    textMut: T.textMut || '#888888'
  };

  useEffect(() => {
    if (!userId) { navigation.replace('LoginScreen'); return; }
    getUserNotifications(userId)
      .then(d => setNotifs(d.length > 0 ? d : EMPTY))
      .catch(() => setNotifs(EMPTY))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleRead = async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (userId) markNotificationRead(userId, id).catch(() => {});
  };

  const unread = notifs.filter(n => !n.read).length;

  const renderItem = ({ item }) => {
    const cfg = TYPE_CFG[item.type] || TYPE_CFG.general;
    return (
      <TouchableOpacity style={[s.card, !item.read && s.cardUnread]} onPress={() => handleRead(item.id)} activeOpacity={0.85}>
        <View style={[s.iconBox, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '55' }]}>
          <Text style={{ fontSize: 20 }}>{cfg.emoji}</Text>
        </View>
        <View style={s.cardContent}>
          <Text style={[s.cardTitle, !item.read && { color: T.text }]}>{item.title}</Text>
          <Text style={s.cardBody}>{item.body}</Text>
          <Text style={s.cardTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        {!item.read && <View style={[s.dot, { backgroundColor: cfg.color }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        {unread > 0 && <View style={s.badge}><Text style={s.badgeTxt}>{unread}</Text></View>}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={T.accent} /><Text style={s.loadingTxt}>Loading...</Text></View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={unread > 0 ? (
            <TouchableOpacity style={s.markAll} onPress={async () => { for (const n of notifs.filter(x => !x.read)) await handleRead(n.id); }}>
              <Text style={s.markAllTxt}>Mark all as read</Text>
            </TouchableOpacity>
          ) : null}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={{ fontSize: 48 }}>🔔</Text>
              <Text style={s.emptyTxt}>No notifications yet</Text>
              <Text style={s.emptySub}>Complete missions to get alerts!</Text>
            </View>
          }
        />
      )}

      {/* ── INTEGRATED BOTTOM NAVIGATION BAR ──────────────────────────────── */}
      <View style={s.navBar}>
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
          // Setting active state true if it's the Notifications screen
          const active = n.sc === 'Notifications';
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: T.bg },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 },
  backBtn:     { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: T.white, borderRadius: 12, borderWidth: 1.5, borderColor: T.border },
  backTxt:     { color: T.accent, fontWeight: '700', fontSize: 14 },
  headerTitle: { flex: 1, color: T.text, fontSize: 22, fontWeight: '900' },
  badge:       { backgroundColor: T.orange, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt:    { color: T.white, fontSize: 13, fontWeight: '800' },
  list:        { paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1 },
  markAll:     { alignSelf: 'flex-end', marginBottom: 12, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: T.white, borderRadius: 12, borderWidth: 1.5, borderColor: T.border },
  markAllTxt:  { color: T.accent, fontSize: 13, fontWeight: '700' },
  card:        { flexDirection: 'row', backgroundColor: T.white, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: T.border, alignItems: 'center', gap: 12 },
  cardUnread:  { borderColor: T.accent + '55', backgroundColor: T.accent + '08' },
  iconBox:     { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  cardContent: { flex: 1 },
  cardTitle:   { color: T.textSub, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  cardBody:    { color: T.textMut, fontSize: 13, lineHeight: 18 },
  cardTime:    { color: T.textMut, fontSize: 11, marginTop: 4 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingTxt:  { color: T.textMut, marginTop: 12, fontSize: 14 },
  emptyTxt:    { color: T.text, fontSize: 18, fontWeight: '800', marginTop: 16 },
  emptySub:    { color: T.textMut, fontSize: 14, marginTop: 6 },

  // New Navbar Styles
  navBar:      { flexDirection: 'row', backgroundColor: T.white, borderTopWidth: 1.5, borderTopColor: T.border, paddingVertical: 10, justifyContent: 'space-around', alignItems: 'center' },
  navItem:     { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navIconWrap: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginBottom: 4 },
  navLabel:    { fontSize: 12, fontWeight: '600' }
});s