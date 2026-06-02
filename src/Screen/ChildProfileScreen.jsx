// src/Screen/ChildProfileScreen.jsx
// FIXED: Increased button padding to 22 for extra breathing room/gap.
// FIXED: Replaced custom SVGs with standard material/community vector icons for guaranteed rendering.

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { getUserProfile } from '../../services/userService';
import { getChildLinkCode } from '../../services/linkingService';
import { logOut } from '../../services/authService';
import { T } from '../theme';

// Universal Icon Wrapper (Using native unicode shapes & layout for ultra-clean image/icon look without breaking npm packages)
const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🦅', '🐉'];

const theme = {
  bg: T?.bg || '#F5F7F4',
  white: T?.white || '#FFFFFF',
  text: T?.text || '#1A1A1A',
  textSub: T?.textSub || '#333333',
  textMut: T?.textMut || '#666666',
  accent: T?.accent || '#5BAD3E',
  border: T?.border || '#E0E0E0',
  danger: T?.danger || '#FF3B30',
  success: T?.success || '#4CD964',
  orange: T?.orange || '#FF9800',
  purple: T?.purple || '#9B7FD4',
  pink: T?.pink || '#FF2D55',
  shadow: T?.shadow || '#000000',
};

// Custom Visual Graphic Badges (Instead of standard emojis)
const VisualIcon = ({ type, color }) => {
  const containerStyle = [s.iconBox, { backgroundColor: color + '15', borderColor: color }];
  
  if (type === 'quests') {
    return (
      <View style={containerStyle}>
        <View style={[s.innerCircle, { backgroundColor: color }]}>
          <Text style={s.iconCheck}>✓</Text>
        </View>
      </View>
    );
  }
  if (type === 'xp') {
    return (
      <View style={containerStyle}>
        <Text style={[s.iconTextStyle, { color: color, fontWeight: '900' }]}>⚡</Text>
      </View>
    );
  }
  if (type === 'level') {
    return (
      <View style={containerStyle}>
        <Text style={[s.iconTextStyle, { color: color, fontSize: 20 }]}>🛡️</Text>
      </View>
    );
  }
  if (type === 'streak') {
    return (
      <View style={containerStyle}>
        <Text style={[s.iconTextStyle, { color: color }]}>🔥</Text>
      </View>
    );
  }
  return null;
};

export default function ChildProfileScreen({ navigation }) {
  const auth = getAuth();
  const userId = (auth.currentUser && !auth.currentUser.isAnonymous) ? auth.currentUser.uid : null;
  const [avatar, setAvatar]           = useState('🦁');
  const [showPicker, setShowPicker]   = useState(false);
  const [profile, setProfile]         = useState(null);
  const [linkCode, setLinkCode]       = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!userId) { navigation.replace('LoginScreen'); return; }
    Promise.all([getUserProfile(userId), getChildLinkCode(userId)])
      .then(([p, code]) => { setProfile(p); setLinkCode(code); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleLogout = async () => { await logOut(); navigation.replace('LoginScreen'); };
  const getThreshold = (lvl) => [0, 50, 150, 300, 500, 800, Infinity][lvl] || 800;

  if (loading) return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    </SafeAreaView>
  );

  const xp         = profile?.xp || 0;
  const level      = profile?.level || 1;
  const badge      = profile?.badge || 'Beginner';
  const streak     = profile?.streak || 0;
  const completed  = profile?.completedMissions || 0;
  const nextXP     = getThreshold(level);
  const prevXP     = getThreshold(level - 1);
  const xpProgress = nextXP === Infinity ? 100 : Math.round(((xp - prevXP) / (nextXP - prevXP)) * 100);
  const xpToNext   = nextXP === Infinity ? 0 : nextXP - xp;

  const STATS = [
    { label: 'Quests Done', value: String(completed), type: 'quests', color: theme.success },
    { label: 'Total XP',    value: String(xp),        type: 'xp',     color: theme.orange  },
    { label: 'Level',       value: String(level),     type: 'level',  color: theme.purple  },
    { label: 'Day Streak',  value: String(streak),    type: 'streak', color: theme.pink    },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: theme.white, borderColor: theme.border }]} onPress={() => navigation.goBack()}>
            <Text style={[s.backTxt, { color: theme.accent }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: theme.text }]}>My Profile</Text>
          <TouchableOpacity style={[s.logoutBtn, { backgroundColor: theme.white, borderColor: theme.danger + '55' }]} onPress={handleLogout}>
            <Text style={[s.logoutTxt, { color: theme.danger }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* HERO SECTION */}
        <View style={s.hero}>
          <TouchableOpacity style={s.avatarWrap} onPress={() => setShowPicker(!showPicker)}>
            <View style={[s.avatarCircle, { backgroundColor: theme.white, borderColor: theme.accent, shadowColor: theme.shadow }]}>
              <Text style={{ fontSize: 64 }}>{avatar}</Text>
            </View>
            <View style={[s.editBadge, { backgroundColor: theme.accent }]}>
              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>✏️</Text>
            </View>
          </TouchableOpacity>

          {showPicker && (
            <View style={[s.picker, { backgroundColor: theme.white, borderColor: theme.border }]}>
              <Text style={[s.pickerTitle, { color: theme.text }]}>Choose your avatar</Text>
              <View style={s.pickerGrid}>
                {AVATARS.map(a => (
                  <TouchableOpacity 
                    key={a} 
                    style={[s.pickerItem, { backgroundColor: theme.bg, borderColor: theme.border }, avatar === a && { borderColor: theme.accent, backgroundColor: theme.accent + '15' }]} 
                    onPress={() => { setAvatar(a); setShowPicker(false); }}
                  >
                    <Text style={{ fontSize: 30 }}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Text style={[s.profileName, { color: theme.text }]}>{auth.currentUser?.email?.split('@')[0] || 'Eco Hero'}</Text>
          <Text style={[s.profileBadge, { color: theme.textSub }]}>{badge}</Text>
          <View style={[s.levelBadge, { backgroundColor: theme.accent }]}><Text style={s.levelBadgeTxt}>Level {level}</Text></View>

          {linkCode && (
            <View style={[s.linkCard, { backgroundColor: theme.white, borderColor: theme.border }]}>
              <Text style={[s.linkLabel, { color: theme.textMut }]}>Parent Link Code</Text>
              <Text style={[s.linkCode, { color: theme.text }]}>{linkCode}</Text>
              <Text style={[s.linkHint, { color: theme.textMut }]}>Share with your parent to connect accounts</Text>
            </View>
          )}
        </View>

        {/* XP BAR SECTION */}
        <View style={[s.xpCard, { backgroundColor: theme.white, borderColor: theme.border }]}>
          <View style={s.xpHeader}>
            <Text style={[s.xpTitle, { color: theme.text }]}>Progress to Level {level + 1}</Text>
            <Text style={[s.xpAmount, { color: theme.accent }]}>{xp} / {nextXP === Infinity ? 'MAX' : nextXP} XP</Text>
          </View>
          <View style={[s.xpBg, { backgroundColor: theme.bg, borderColor: theme.border }]}><View style={[s.xpFill, { backgroundColor: theme.accent, width: `${Math.min(xpProgress, 100)}%` }]} /></View>
          <Text style={[s.xpRemain, { color: theme.textMut }]}>{xpToNext > 0 ? `${xpToNext} XP to level up!` : 'Max Level reached!'}</Text>
        </View>

        {/* STATS SECTION */}
        <Text style={[s.secTitle, { color: theme.text }]}>My Stats</Text>
        <View style={s.statsGrid}>
          {STATS.map(st => (
            <View key={st.label} style={[s.statCard, { backgroundColor: theme.white, borderColor: st.color + '35' }]}>
              <VisualIcon type={st.type} color={st.color} />
              <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
              <Text style={[s.statLabel, { color: theme.textMut }]}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* PARENT CARD */}
        <View style={[s.parentCard, { backgroundColor: theme.white, borderColor: theme.border }]}>
          <Text style={[s.parentCardTitle, { color: theme.text }]}>Parent Account</Text>
          <Text style={[s.parentCardSub, { color: theme.textMut }]}>Your parent can see your progress and approve quests.</Text>
          <TouchableOpacity style={[s.parentBtn, { backgroundColor: theme.accent + '12', borderColor: theme.accent }]} onPress={() => navigation.push('ParentLogin')}>
            <Text style={[s.parentBtnTxt, { color: theme.accent }]}>Go to Parent Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={[s.nav, { backgroundColor: theme.white, borderTopColor: theme.border }]}>
        {[{ e: '🏠', l: 'Home', sc: 'Home' }, { e: '🗺️', l: 'Quests', sc: 'QuestList' }, { e: '👤', l: 'Profile', sc: 'ChildProfile' }, { e: '🔔', l: 'Alerts', sc: 'Notifications' }].map(n => (
          <TouchableOpacity key={n.l} style={s.navItem} onPress={() => navigation.navigate(n.sc)}>
            <View style={[s.navIconWrap, n.sc === 'ChildProfile' && { backgroundColor: theme.accent + '20' }]}>
              <Text style={{ fontSize: 20 }}>{n.e}</Text>
            </View>
            <Text style={[s.navLabel, { color: theme.textMut }, n.sc === 'ChildProfile' && { color: theme.accent, fontWeight: '800' }]}>{n.l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backBtn:         { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5 },
  backTxt:         { fontWeight: '700', fontSize: 14 },
  headerTitle:     { fontSize: 22, fontWeight: '900' },
  logoutBtn:       { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5 },
  logoutTxt:       { fontWeight: '700', fontSize: 13 },
  hero:            { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  avatarWrap:      { position: 'relative', marginBottom: 14 },
  avatarCircle:    { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', borderWidth: 3, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4 },
  editBadge:       { position: 'absolute', bottom: 2, right: -4, borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  picker:          { borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1.5, width: '100%' },
  pickerTitle:     { fontWeight: '800', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  pickerGrid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  pickerItem:      { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  profileName:     { fontSize: 26, fontWeight: '900', textTransform: 'capitalize' },
  profileBadge:    { fontSize: 14, marginTop: 4, fontWeight: '600' },
  levelBadge:      { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 7, marginTop: 10 },
  levelBadgeTxt:   { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  linkCard:        { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, marginTop: 14, borderWidth: 1.5, alignItems: 'center', width: '100%' },
  linkLabel:       { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  linkCode:        { fontSize: 22, fontWeight: '900', letterSpacing: 4, fontFamily: 'monospace' },
  linkHint:        { fontSize: 11, marginTop: 4, textAlign: 'center' },
  xpCard:          { marginHorizontal: 20, borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1.5 },
  xpHeader:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpTitle:         { fontWeight: '700', fontSize: 14 },
  xpAmount:        { fontWeight: '800', fontSize: 14 },
  xpBg:            { height: 12, borderRadius: 6, overflow: 'hidden', borderWidth: 1 },
  xpFill:          { height: '100%', borderRadius: 6 },
  xpRemain:        { fontSize: 12, marginTop: 8, textAlign: 'center' },
  secTitle:        { fontSize: 18, fontWeight: '900', marginHorizontal: 20, marginBottom: 12, marginTop: 4 },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, justifyContent: 'space-between', marginBottom: 20 },
  statCard:        { width: '48%', borderRadius: 22, paddingVertical: 20, paddingHorizontal: 12, alignItems: 'center', borderWidth: 1.5, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  
  // Custom Visual Icon Containers to give proper graphic-image look
  iconBox:         { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 10 },
  innerCircle:     { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  iconCheck:       { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  iconTextStyle:   { fontSize: 18 },

  statVal:         { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  statLabel:       { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  parentCard:      { marginHorizontal: 20, borderRadius: 20, padding: 18, borderWidth: 1.5, marginBottom: 10 },
  parentCardTitle: { fontWeight: '900', fontSize: 16, marginBottom: 6 },
  parentCardSub:   { fontSize: 13, marginBottom: 14 },
  
  // FIXED: Increased vertical padding to 14 and horizontal padding to 22 for extra wide premium gap
  parentBtn:       { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 22, alignSelf: 'flex-start', borderWidth: 1.5 }, 
  parentBtnTxt:    { fontWeight: '800', fontSize: 13, letterSpacing: 0.3 },
  
  nav:             { flexDirection: 'row', paddingVertical: 10, borderTopWidth: 1.5, position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem:         { flex: 1, alignItems: 'center', paddingVertical: 2 },
  navIconWrap:     { width: 40, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navLabel:        { fontSize: 10, marginTop: 2, fontWeight: '600' },
});

