import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { getUserMissions } from '../../services/missionService';
import { T } from '../theme';

const FILTERS = ['All', 'active', 'completed'];
const FILTER_LABELS = { All: 'All', active: 'Active', completed: 'Done' };
const CAT_COLORS = { 'Carbon Garden': '#5BAD3E', 'Clean Karachi': '#4AABDB', 'Water Mission': '#4AABDB', 'Heritage Quest': '#F9A825', 'Air Watch': '#9B7FD4' };

export default function QuestListScreen({ navigation }) {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const [missions, setMissions]   = useState([]);
  const [filter, setFilter]       = useState('All');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!userId) { navigation.replace('LoginScreen'); return; }
    loadMissions();
  }, [userId]);

  const loadMissions = async () => {
    setLoading(true);
    try {
      const data = await getUserMissions(userId);
      const seen = new Set();
      const unique = data.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMissions(unique);
    } catch(e) { setMissions([]); }
    setLoading(false);
  };

  const filtered = missions.filter(m => filter === 'All' || m.status === filter);

  const renderItem = ({ item }) => {
    const color = CAT_COLORS[item.category] || T.accent;
    const done  = item.status === 'completed';
    return (
      <TouchableOpacity
        style={[s.card, done && s.cardDone]}
        onPress={() => navigation.push('MissionDetail', {
          mission: { ...item, steps: item.steps || ['Read mission briefing', 'Complete eco action', 'Take proof photo', 'Submit mission'], desc: item.desc || item.description || 'Complete this eco mission!' }
        })}
        activeOpacity={0.85}
      >
        <View style={[s.emojiBox, { backgroundColor: color + '18', borderColor: color + '55' }]}>
          <Text style={{ fontSize: 28 }}>{item.emoji || '🌱'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{item.title}</Text>
          <Text style={s.cardDesc}>{item.desc || item.description || ''}</Text>
          <View style={s.chips}>
            <View style={[s.chip, { backgroundColor: color + '18' }]}>
              <Text style={[s.chipTxt, { color }]}>{item.category}</Text>
            </View>
            <View style={s.chip}>
              <Text style={s.chipTxt}>{item.difficulty || 'Easy'}</Text>
            </View>
          </View>
        </View>
        <View style={s.rightCol}>
          <View style={[s.xpBadge, { backgroundColor: T.orange + '18' }]}>
            <Text style={s.xpTxt}>+{item.xp}</Text>
            <Text style={s.xpSub}>XP</Text>
          </View>
          <Text style={[s.statusDot, { color: done ? T.success : T.warn }]}>{done ? '✓ Done' : 'Active'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      <View style={s.header}>
        <Text style={s.headerTitle}>My Quests</Text>
        <TouchableOpacity style={s.profileBtn} onPress={() => navigation.push('ChildProfile')}>
          <Text style={{ fontSize: 18 }}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.filterBtn, filter === f && s.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterTxt, filter === f && s.filterActiveTxt]}>{FILTER_LABELS[f]}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.refreshBtn} onPress={loadMissions}>
          <Text style={{ fontSize: 15 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={T.accent} />
          <Text style={s.loadingTxt}>Loading quests...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={{ fontSize: 48 }}>🌱</Text>
              <Text style={s.emptyTitle}>{missions.length === 0 ? 'No Quests Yet' : `No ${FILTER_LABELS[filter]} Quests`}</Text>
              <Text style={s.emptySub}>{missions.length === 0 ? 'Go to Home to generate missions!' : 'Try a different filter.'}</Text>
              <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={s.homeBtnTxt}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <View style={s.nav}>
        {[{ e: '🏠', l: 'Home', sc: 'Home' }, { e: '🗺️', l: 'Quests', sc: 'QuestList' }, { e: '👤', l: 'Profile', sc: 'ChildProfile' }, { e: '🔔', l: 'Alerts', sc: 'Notifications' }].map(n => (
          <TouchableOpacity key={n.l} style={s.navItem} onPress={() => navigation.navigate(n.sc)}>
            <View style={[s.navIconWrap, n.sc === 'QuestList' && s.navIconActive]}>
              <Text style={{ fontSize: 20 }}>{n.e}</Text>
            </View>
            <Text style={[s.navLabel, n.sc === 'QuestList' && s.navLabelActive]}>{n.l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: T.bg },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle:    { color: T.text, fontSize: 24, fontWeight: '900' },
  profileBtn:     { width: 42, height: 42, backgroundColor: T.white, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: T.border },
  filterRow:      { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12, alignItems: 'center' },
  filterBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: T.white, borderWidth: 1.5, borderColor: T.border },
  filterActive:   { backgroundColor: T.accent, borderColor: T.accent },
  filterTxt:      { color: T.textMut, fontSize: 13, fontWeight: '700' },
  filterActiveTxt:{ color: T.white },
  refreshBtn:     { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: T.white, borderRadius: 16, borderWidth: 1.5, borderColor: T.border },
  listContent:    { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  card:           { backgroundColor: T.white, borderRadius: 20, padding: 14, borderWidth: 1.5, borderColor: T.border, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  cardDone:       { opacity: 0.7, borderColor: T.success + '55' },
  emojiBox:       { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  cardTitle:      { color: T.text, fontSize: 15, fontWeight: '800' },
  cardDesc:       { color: T.textMut, fontSize: 12, marginTop: 3, lineHeight: 17 },
  chips:          { flexDirection: 'row', gap: 6, marginTop: 7, flexWrap: 'wrap' },
  chip:           { backgroundColor: T.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  chipTxt:        { color: T.textMut, fontSize: 11, fontWeight: '700' },
  rightCol:       { alignItems: 'center', gap: 6 },
  xpBadge:        { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center' },
  xpTxt:          { color: T.orange, fontSize: 14, fontWeight: '900' },
  xpSub:          { color: T.orange, fontSize: 9, fontWeight: '700' },
  statusDot:      { fontSize: 11, fontWeight: '700' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 30 },
  loadingTxt:     { color: T.textMut, fontSize: 14, marginTop: 12 },
  emptyTitle:     { color: T.text, fontSize: 20, fontWeight: '900', marginTop: 16, textAlign: 'center' },
  emptySub:       { color: T.textMut, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  homeBtn:        { marginTop: 20, backgroundColor: T.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  homeBtnTxt:     { color: T.white, fontWeight: '800', fontSize: 15 },
  nav:            { flexDirection: 'row', backgroundColor: T.white, paddingVertical: 10, borderTopWidth: 1.5, borderTopColor: T.border, position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem:        { flex: 1, alignItems: 'center', paddingVertical: 2 },
  navIconWrap:    { width: 40, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navIconActive:  { backgroundColor: T.accent + '20' },
  navLabel:       { color: T.textMut, fontSize: 10, marginTop: 2, fontWeight: '600' },
  navLabelActive: { color: T.accent, fontWeight: '800' },
});







