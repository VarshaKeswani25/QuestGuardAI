// screens/child/QuestListScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';
import { getAuth } from 'firebase/auth';
import { getUserMissions } from '../../services/missionService';
import { T } from '../theme';

const theme = {
  bg:      T?.bg      || '#F5F7F4',
  white:   T?.white   || '#FFFFFF',
  text:    T?.text    || '#1A1A1A',
  textSub: T?.textSub || '#333333',
  textMut: T?.textMut || '#666666',
  accent:  T?.accent  || '#5BAD3E',
  border:  T?.border  || '#E0E0E0',
  orange:  T?.orange  || '#FF9800',
  success: T?.success || '#4CAF50',
  warn:    T?.warn    || '#FFC107',
};

const FILTERS = ['All', 'active', 'completed'];
const FILTER_LABELS = { All: 'All', active: 'Active', completed: 'Done' };
const CAT_COLORS = { 'Carbon Garden': '#5BAD3E', 'Clean Karachi': '#4AABDB', 'Water Mission': '#4AABDB', 'Heritage Quest': '#F9A825', 'Air Watch': '#9B7FD4' };

// ─── DYNAMIC MISSION SVG COMPONENT ─────────────────────────────────
function MissionVectorIcon({ category, color = '#5BAD3E', size = 26 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" };
  switch (category) {
    case 'Clean Karachi':
      return (
        <Svg {...p}>
          <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M19 6l-1 14H6L5 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M9 6V4h6v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'Water Mission':
      return (
        <Svg {...p}>
          <Path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color + '22'}/>
          <Path d="M8 15c0 2.2 1.8 4 4 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'Carbon Garden':
      return (
        <Svg {...p}>
          <Line x1="12" y1="22" x2="12" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M12 11C12 11 7 9 5 5c4 0 7 2 7 6z" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
          <Path d="M12 15C12 15 17 13 19 9c-4 0-7 2-7 6z" fill={color + 'AA'} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        </Svg>
      );
    case 'Air Watch':
      return (
        <Svg {...p}>
          <Path d="M5 12h14M17 9l3 3-3 3M3 10h10M11 7l3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'Heritage Quest':
      return (
        <Svg {...p}>
          <Path d="M4 22V10l8-6 8 6v12H4z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
          <Path d="M9 22v-8h6v8" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
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
    const color = CAT_COLORS[item.category] || theme.accent;
    const done  = item.status === 'completed';
    return (
      <TouchableOpacity
        style={[s.card, done && s.cardDone]}
        onPress={() => navigation.push('MissionDetail', {
          mission: { ...item, steps: item.steps || ['Read mission briefing', 'Complete eco action', 'Take proof photo', 'Submit mission'], desc: item.desc || item.description || 'Complete this eco mission!' }
        })}
        activeOpacity={0.85}
      >
        <View style={[s.emojiBox, { backgroundColor: color + '12', borderColor: color + '33' }]}>
          <MissionVectorIcon category={item.category} color={color} size={28} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{item.title}</Text>
          <Text style={s.cardDesc} numberOfLines={2}>{item.desc || item.description || ''}</Text>
          <View style={s.chips}>
            <View style={[s.chip, { backgroundColor: color + '15' }]}>
              <Text style={[s.chipTxt, { color }]}>{item.category}</Text>
            </View>
            <View style={s.chip}>
              <Text style={s.chipTxt}>{item.difficulty || 'Easy'}</Text>
            </View>
          </View>
        </View>
        <View style={s.rightCol}>
          <View style={[s.xpBadge, { backgroundColor: theme.orange + '15' }]}>
            <Text style={s.xpTxt}>+{item.xp}</Text>
            <Text style={s.xpSub}>XP</Text>
          </View>
          <Text style={[s.statusDot, { color: done ? theme.success : theme.orange }]}>{done ? '✓ Done' : 'Active'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />

      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.headerTitle}>My Quests</Text>
        <TouchableOpacity style={s.profileBtn} onPress={() => navigation.push('ChildProfile')}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="8" r="4" stroke={theme.textSub} strokeWidth="2"/>
            <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={theme.textSub} strokeWidth="2" strokeLinecap="round"/>
          </Svg>
        </TouchableOpacity>
      </View>

      {/* FILTER BUTTONS ROW */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.filterBtn, filter === f && s.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterTxt, filter === f && s.filterActiveTxt]}>{FILTER_LABELS[f]}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.refreshBtn} onPress={loadMissions}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" stroke={theme.textSub} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </TouchableOpacity>
      </View>

      {/* LIST CONTENT CONTAINER */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.accent} />
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
              <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="9" stroke={theme.textMut} strokeWidth="2" strokeDasharray="4 4"/>
                <Path d="M12 8v8M8 12h8" stroke={theme.textMut} strokeWidth="2" strokeLinecap="round"/>
              </Svg>
              <Text style={s.emptyTitle}>{missions.length === 0 ? 'No Quests Yet' : `No ${FILTER_LABELS[filter]} Quests`}</Text>
              <Text style={s.emptySub}>{missions.length === 0 ? 'Go to Home to generate missions!' : 'Try a different filter.'}</Text>
              <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={s.homeBtnTxt}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* BOTTOM NAV BAR */}
      <View style={s.nav}>
        {[
          {
            l: 'Home', sc: 'Home',
            icon: (active) => (
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
                <Polyline points="9 22 9 12 15 12 15 22" stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
              </Svg>
            )
          },
          {
            l: 'Quests', sc: 'QuestList',
            icon: (active) => (
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
                <Polyline points="14 2 14 8 20 8" stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
                <Path d="M9 13h6M9 17h4" stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            )
          },
          {
            l: 'Profile', sc: 'ChildProfile',
            icon: (active) => (
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="4" stroke={active ? theme.accent : theme.textMut} strokeWidth="2"/>
                <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            )
          },
          {
            l: 'Alerts', sc: 'Notifications',
            icon: (active) => (
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinejoin="round"/>
                <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={active ? theme.accent : theme.textMut} strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            )
          }
        ].map(n => {
          const active = n.sc === 'QuestList';
          return (
            <TouchableOpacity key={n.l} style={s.navItem} onPress={() => navigation.navigate(n.sc)}>
              <View style={[s.navIconWrap, active && s.navIconActive]}>
                {n.icon(active)}
              </View>
              <Text style={[s.navLabel, active && s.navLabelActive]}>{n.l}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: theme.bg },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle:    { color: theme.text, fontSize: 24, fontWeight: '900' },
  profileBtn:     { width: 42, height: 42, backgroundColor: theme.white, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: theme.border },
  filterRow:      { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12, alignItems: 'center' },
  filterBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.white, borderWidth: 1.5, borderColor: theme.border },
  filterActive:   { backgroundColor: theme.accent, borderColor: theme.accent },
  filterTxt:      { color: theme.textMut, fontSize: 13, fontWeight: '700' },
  filterActiveTxt:{ color: theme.white },
  refreshBtn:     { marginLeft: 'auto', width: 40, height: 40, backgroundColor: theme.white, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: theme.border },
  listContent:    { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  card:           { backgroundColor: theme.white, borderRadius: 20, padding: 14, borderWidth: 1.5, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardDone:       { opacity: 0.65, borderColor: theme.success + '55' },
  emojiBox:       { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  cardTitle:      { color: theme.text, fontSize: 15, fontWeight: '800' },
  cardDesc:       { color: theme.textMut, fontSize: 12, marginTop: 3, lineHeight: 17 },
  chips:          { flexDirection: 'row', gap: 6, marginTop: 7, flexWrap: 'wrap' },
  chip:           { backgroundColor: theme.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  chipTxt:        { color: theme.textMut, fontSize: 11, fontWeight: '700' },
  rightCol:       { alignItems: 'center', gap: 6, marginLeft: 'auto' },
  xpBadge:        { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center' },
  xpTxt:          { color: theme.orange, fontSize: 14, fontWeight: '900' },
  xpSub:          { color: theme.orange, fontSize: 9, fontWeight: '700' },
  statusDot:      { fontSize: 11, fontWeight: '700' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 30 },
  loadingTxt:     { color: theme.textMut, fontSize: 14, marginTop: 12 },
  emptyTitle:     { color: theme.text, fontSize: 20, fontWeight: '900', marginTop: 16, textAlign: 'center' },
  emptySub:       { color: theme.textMut, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  homeBtn:        { marginTop: 20, backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  homeBtnTxt:     { color: theme.white, fontWeight: '800', fontSize: 15 },
  nav:            { flexDirection: 'row', backgroundColor: theme.white, paddingVertical: 10, borderTopWidth: 1.5, borderTopColor: theme.border, position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem:        { flex: 1, alignItems: 'center', paddingVertical: 2 },
  navIconWrap:    { width: 40, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navIconActive:  { backgroundColor: theme.accent + '20' },
  navLabel:       { color: theme.textMut, fontSize: 10, marginTop: 2, fontWeight: '600' },
  navLabelActive: { color: theme.accent, fontWeight: '800' },
});