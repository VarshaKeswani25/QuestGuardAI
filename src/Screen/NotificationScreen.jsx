
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { getUserNotifications, markNotificationRead } from '../../services/notificationService';
import { T } from '../theme';

const TYPE_CFG = {
  xp_earned:      { emoji: '⚡', color: T.warn    },
  quest_approved: { emoji: '✅', color: T.success  },
  quest_rejected: { emoji: '❌', color: T.danger   },
  level_up:       { emoji: '🏆', color: T.purple   },
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
    <SafeAreaView style={s.container}>
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
  list:        { paddingHorizontal: 20, paddingBottom: 40 },
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
});



