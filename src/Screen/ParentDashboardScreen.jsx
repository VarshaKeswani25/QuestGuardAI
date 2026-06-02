
// src/Screen/ParentDashboardScreen.jsx
// THEME UPDATED: Fully converted to utilize dynamic Cute Kids Light Theme (T) matching ParentLoginScreen
// FUNCTIONALITY MAINTAINED: Seamlessly integrates with Firebase auth, linking, and mission services.

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { linkChildToParent, getLinkedChildren } from '../../services/linkingService';
import { getPendingMissions } from '../../services/missionService';
import { logOut } from '../../services/authService';
import { T } from '../theme'; // Global dynamic theme token integrated

// ─── PREMIUM FLAT UI ICONS WITH DYNAMIC THEME COLORS ───────────────────────
const PremiumIcon = ({ type, color = T.accent, size = 40 }) => {
  const boxStyle = [styles.iconBox, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '15', borderColor: color }];
  
  if (type === 'child-avatar') {
    return (
      <View style={[boxStyle, { marginBottom: 8, borderWidth: 1.5 }]}>
        <View style={[styles.avatarDot, { backgroundColor: color }]} />
        <View style={[styles.avatarBase, { backgroundColor: color }]} />
      </View>
    );
  }
  if (type === 'no-child') {
    return (
      <View style={[boxStyle, { width: 70, height: 70, borderRadius: 35, marginBottom: 16, borderWidth: 2 }]}>
        <View style={[styles.avatarDot, { width: 16, height: 16, backgroundColor: color }]} />
        <View style={[styles.avatarBase, { width: 32, height: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: color }]} />
      </View>
    );
  }
  if (type === 'xp') {
    return (
      <View style={boxStyle}><Text style={[styles.premiumIconChar, { color: color, fontSize: 16 }]}>⚡</Text></View>
    );
  }
  if (type === 'mission') {
    return (
      <View style={[boxStyle, { borderRadius: 10, borderWidth: 1.5, backgroundColor: color + '15' }]}>
        <View style={styles.shieldContainer}>
          <Text style={[styles.checkMark, { color: color, fontSize: 16, fontWeight: '900' }]}>✓</Text>
        </View>
      </View>
    );
  }
  if (type === 'level') {
    return (
      <View style={[boxStyle, { borderRadius: 10, borderWidth: 1.5, padding: 4, justifyContent: 'flex-end' }]}>
        <Text style={{ fontSize: 8, position: 'absolute', top: 2, right: 4, color: color }}>⭐</Text>
        <View style={styles.chartBarRow}>
          <View style={[styles.chartBar, { height: '40%', backgroundColor: color }]} />
          <View style={[styles.chartBar, { height: '70%', backgroundColor: color }]} />
          <View style={[styles.chartBar, { height: '100%', backgroundColor: color }]} />
        </View>
      </View>
    );
  }
  if (type === 'streak') {
    return (
      <View style={boxStyle}><Text style={[styles.premiumIconChar, { color: color, fontSize: 16 }]}>🔥</Text></View>
    );
  }
  if (type === 'map') {
    return (
      <View style={[boxStyle, { borderRadius: 10, borderWidth: 1.5, overflow: 'hidden' }]}>
        <View style={styles.mapInternalTrack}>
          <View style={[styles.mapLine, { borderColor: color + '40' }]} />
          <View style={[styles.mapPinDot, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function ParentDashboardScreen({ navigation }) {
  const auth = getAuth();
  const parentUid = auth.currentUser?.uid;

  const [children, setChildren] = useState([]);
  const [pendingMissions, setPendingMissions] = useState([]);
  const [linkCode, setLinkCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    if (!parentUid) { navigation.replace('ParentLogin'); return; }
    loadData();
  }, [parentUid]);

  const loadData = async () => {
    setLoading(true);
    try {
      const kids = await getLinkedChildren(parentUid);
      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChild(kids[0]);
        const allPending = [];
        for (const kid of kids) {
          const missions = await getPendingMissions(kid.childUid);
          missions.forEach(m => allPending.push({ ...m, childName: kid.name, childUid: kid.childUid }));
        }
        setPendingMissions(allPending);
      }
    } catch (error) {
      console.log("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async () => {
    if (!linkCode.trim()) {
      Alert.alert('Enter Code', 'Please enter your child\'s link code.');
      return;
    }
    setLinking(true);
    const parentName = auth.currentUser?.email?.split('@')[0] || 'Parent';
    const result = await linkChildToParent(parentUid, parentName, linkCode.trim());
    setLinking(false);
    if (result.success) {
      Alert.alert('✅ Linked!', `${result.childName} has been connected to your account.`);
      setLinkCode('');
      loadData();
    } else {
      Alert.alert('Link Failed', result.error);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigation.replace('ParentLogin');
  };

  // Uses theme accent mixed with complimentary kid-friendly visual tones
  const CHILD_COLORS = [T.accent, '#3B82F6', T.orange, '#7B1FA2', '#C2185B'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.title}>Parent Dashboard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.push('Notifications')}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {pendingMissions.length > 0 && (
                <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{pendingMissions.length}</Text></View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Link Child Panel */}
        <View style={styles.linkCard}>
          <Text style={styles.linkTitle}>🔗 Connect a Child's Account</Text>
          <Text style={styles.linkSub}>Enter the unique link code shown in your child's profile screen to link dashboards.</Text>
          <View style={styles.linkRow}>
            <TextInput
              style={styles.linkInput}
              placeholder="e.g. ZK-4F9A"
              placeholderTextColor={T.textMut}
              value={linkCode}
              onChangeText={setLinkCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.linkBtn, linking && { opacity: 0.6 }]}
              onPress={handleLinkChild}
              disabled={linking}
            >
              {linking ? <ActivityIndicator color={T.white} size="small" /> : <Text style={styles.linkBtnText}>Link Account</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={T.accent} />
            <Text style={styles.loadingText}>Syncing dynamic data...</Text>
          </View>
        ) : children.length === 0 ? (
          <View style={styles.noChildCard}>
            <PremiumIcon type="no-child" color={T.textMut} />
            <Text style={styles.noChildTitle}>No Children Connected</Text>
            <Text style={styles.noChildSub}>Link your child's profile using the code input above to monitor real-time eco quests, levels, and statistics.</Text>
          </View>
        ) : (
          <>
            {/* Connected Children List Section */}
            <Text style={styles.sectionTitle}>👶 Connected Children</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll} contentContainerStyle={{ paddingRight: 20 }}>
              {children.map((child, i) => {
                const childColor = CHILD_COLORS[i % CHILD_COLORS.length];
                const isActive = selectedChild?.childUid === child.childUid;
                return (
                  <TouchableOpacity
                    key={child.childUid}
                    style={[styles.childCard, isActive && [styles.childCardActive, { borderColor: childColor }]]}
                    onPress={() => setSelectedChild(child)}
                  >
                    <PremiumIcon type="child-avatar" color={childColor} size={44} />
                    <Text style={styles.childName} numberOfLines={1}>{child.name}</Text>
                    <Text style={[styles.childLevel, { color: childColor }]}>Level {child.level}</Text>
                    
                    <View style={[styles.inlineBadge, { backgroundColor: childColor + '15' }]}>
                      <Text style={[styles.inlineBadgeTxt, { color: childColor }]}>⚡ {child.xp} XP</Text>
                    </View>
                    
                    <Text style={styles.childMeta}>🔥 {child.streak || 0}d streak</Text>
                    <Text style={styles.childMeta}>✓ {child.completedMissions || 0} quests</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selected Child Data Panels */}
            {selectedChild && (
              <>
                <Text style={styles.sectionTitle}>📊 Detailed Stats: {selectedChild.name}</Text>
                <View style={styles.statsGrid}>
                  {[
                    { label: 'Total XP', value: `${selectedChild.xp} XP`, type: 'xp', color: T.orange },
                    { label: 'Current Level', value: `Lvl ${selectedChild.level}`, type: 'level', color: T.accent },
                    { label: 'Quests Cleared', value: selectedChild.completedMissions || 0, type: 'mission', color: '#1565C0' },
                    { label: 'Active Streak', value: `${selectedChild.streak || 0} Days`, type: 'streak', color: '#C62828' },
                  ].map(s => (
                    <View key={s.label} style={[styles.statCard, { borderColor: T.border }]}>
                      <PremiumIcon type={s.type} color={s.color} size={36} />
                      <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                      <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Awaiting Approvals Grid */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>⏳ Awaiting Approval</Text>
              {pendingMissions.length > 0 && (
                <TouchableOpacity onPress={() => navigation.push('ParentQuestApproval')}>
                  <Text style={styles.seeAllText}>Review All →</Text>
                </TouchableOpacity>
              )}
            </View>

            {pendingMissions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>✨ Perfect! All submissions have been approved.</Text>
              </View>
            ) : (
              pendingMissions.slice(0, 3).map(m => (
                <View key={m.id} style={styles.pendingCard}>
                  <PremiumIcon type="mission" color={T.orange} size={34} />
                  <View style={styles.pendingInfo}>
                    <Text style={styles.pendingTitle}>{m.title}</Text>
                    <Text style={styles.pendingChild}>Submitted by {m.childName}</Text>
                  </View>
                  <View style={styles.xpTag}><Text style={styles.xpTagTxt}>+{m.xp} XP</Text></View>
                </View>
              ))
            )}
          </>
        )}

        {/* Action Widgets */}
        <Text style={styles.sectionTitle}>Dashboard Shortcuts</Text>
        <View style={styles.actionsGrid}>
          {[
            { type: 'mission', color: T.accent, label: 'Approve Quests', screen: 'ParentQuestApproval' },
            { type: 'map', color: T.orange, label: 'Live Map Tracking', screen: 'ParentMap' },
            { type: 'level', color: '#7B1FA2', label: 'Track Progress', screen: 'ParentQuestTrack' },
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => navigation.push(a.screen)}>
              <PremiumIcon type={a.type} color={a.color} size={38} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg }, 
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  greeting: { color: T.textSub, fontSize: 13, fontWeight: '600' },
  title: { color: T.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifBtn: { width: 40, height: 40, backgroundColor: T.white, borderOpacity: 1, borderWidth: 1.5, borderColor: T.border, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifBadge: { position: 'absolute', top: -1, right: -1, backgroundColor: '#D32F2F', borderRadius: 9, width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: T.bg },
  notifBadgeText: { color: T.white, fontSize: 9, fontWeight: '800' },
  logoutBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: T.white, borderRadius: 12, borderWidth: 1.5, borderColor: T.border },
  logoutText: { color: T.accent, fontSize: 12, fontWeight: '700' },
  
  linkCard: { backgroundColor: T.white, marginHorizontal: 20, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1.5, borderColor: T.border, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  linkTitle: { color: T.accent, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  linkSub: { color: T.textSub, fontSize: 12, marginBottom: 14, lineHeight: 18 },
  linkRow: { flexDirection: 'row', gap: 10 },
  linkInput: { flex: 1, backgroundColor: T.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: T.text, borderWidth: 1.5, borderColor: T.border, fontSize: 15, fontWeight: '700', letterSpacing: 1.5 },
  linkBtn: { backgroundColor: T.accent, borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  linkBtnText: { color: T.white, fontWeight: '800', fontSize: 13 },
  
  center: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { color: T.textMut, marginTop: 12, fontSize: 13 },
  
  noChildCard: { backgroundColor: T.white, marginHorizontal: 20, borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1.5, borderColor: T.border, marginBottom: 16 },
  noChildTitle: { color: T.text, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  noChildSub: { color: T.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
  
  sectionTitle: { color: T.text, fontSize: 16, fontWeight: '800', marginHorizontal: 20, marginTop: 18, marginBottom: 12, letterSpacing: -0.2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 },
  seeAllText: { color: T.accent, fontSize: 13, fontWeight: '700' },
  
  childScroll: { paddingLeft: 20, marginBottom: 4 },
  childCard: { backgroundColor: T.white, borderRadius: 18, padding: 16, marginRight: 12, width: 152, borderWidth: 1.5, borderColor: T.border, alignItems: 'center' },
  childCardActive: { backgroundColor: T.white, borderWidth: 2.5 },
  childName: { color: T.text, fontSize: 15, fontWeight: '800', marginTop: 4 },
  childLevel: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  inlineBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8 },
  inlineBadgeTxt: { fontSize: 11, fontWeight: '800' },
  childMeta: { color: T.textSub, fontSize: 11, marginTop: 4, fontWeight: '600' },
  
  iconBox: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  avatarDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 3 },
  avatarBase: { width: 20, height: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  premiumIconChar: { fontWeight: 'bold' },
  shieldContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  checkMark: { textAlign: 'center' },
  chartBarRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3, width: '70%', height: '55%' },
  chartBar: { width: 5, borderRadius: 2 },
  mapInternalTrack: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  mapLine: { width: '80%', height: 2, borderWidth: 1, borderStyle: 'dashed', position: 'absolute' },
  mapPinDot: { width: 8, height: 8, borderRadius: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  statCard: { width: '48%', backgroundColor: T.white, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5 },
  statValue: { fontSize: 20, fontWeight: '900', marginTop: 10 },
  statLabel: { color: T.textSub, fontSize: 11, marginTop: 2, fontWeight: '600' },
  
  pendingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, marginHorizontal: 20, borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: T.border, gap: 12 },
  pendingInfo: { flex: 1 },
  pendingTitle: { color: T.text, fontSize: 14, fontWeight: '700' },
  pendingChild: { color: T.textSub, fontSize: 12, marginTop: 2 },
  xpTag: { backgroundColor: T.orange + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  xpTagTxt: { color: T.orange, fontSize: 12, fontWeight: '800' },
  
  emptyCard: { backgroundColor: T.white, marginHorizontal: 20, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: T.border, marginBottom: 8 },
  emptyText: { color: T.accent, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  
  actionsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  actionCard: { flex: 1, backgroundColor: T.white, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: T.border, shadowColor: T.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  actionLabel: { color: T.text, fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 10 },
});





