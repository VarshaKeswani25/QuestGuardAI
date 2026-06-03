import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle, Ellipse, Polyline } from 'react-native-svg'; // Polyline ko add kiya nav bar icons k liye
import { getAuth } from 'firebase/auth';
import { getLinkedChildren } from '../../services/linkingService';
import { getPendingMissions, parentApproveMission } from '../../services/missionService';
import { notifyQuestApproved, saveNotification } from '../../services/notificationService';
import { T } from '../theme';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function LeafQuestIcon() {
  return (
    <Svg width="36" height="36" viewBox="0 0 36 36">
      <Rect x="3" y="3" width="30" height="30" rx="8" fill="#E8F5D0" stroke={T.border} strokeWidth="1.5"/>
      <Path d="M18 8 C18 8 26 12 26 19 C26 24 22 27 18 27 C14 27 10 24 10 19 C10 12 18 8 18 8Z" fill={T.accent} opacity="0.85"/>
      <Path d="M18 27 L18 20" stroke={T.accent2} strokeWidth="2" strokeLinecap="round"/>
      <Path d="M18 20 C16 17 13 16 13 16" stroke={T.accent2} strokeWidth="1.5" strokeLinecap="round"/>
    </Svg>
  );
}

function ApproveCheckIcon() {
  return (
    <Svg width="34" height="34" viewBox="0 0 34 34">
      <Path d="M17 3 L28 8 L28 17 C28 24 23 30 17 32 C11 30 6 24 6 17 L6 8 Z" fill={T.success} opacity="0.9"/>
      <Path d="M11 17 L15 22 L23 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

function RejectXIcon() {
  return (
    <Svg width="34" height="34" viewBox="0 0 34 34">
      <Circle cx="17" cy="17" r="13" fill={T.danger} opacity="0.85"/>
      <Path d="M12 12 L22 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      <Path d="M22 12 L12 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </Svg>
  );
}

function LinkIcon() {
  return (
    <Svg width="52" height="52" viewBox="0 0 52 52">
      <Circle cx="26" cy="26" r="22" fill="#E8F5D0" stroke={T.border} strokeWidth="2"/>
      <Path d="M20 26 C20 22 23 19 27 19 L33 19 C37 19 40 22 40 26 C40 30 37 33 33 33 L31 33" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <Path d="M32 26 C32 30 29 33 25 33 L19 33 C15 33 12 30 12 26 C12 22 15 19 19 19 L21 19" stroke={T.accent2} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </Svg>
  );
}

function CelebrationIcon() {
  return (
    <Svg width="52" height="52" viewBox="0 0 52 52">
      <Circle cx="26" cy="26" r="22" fill="#FFF9C4" stroke={T.warn} strokeWidth="2"/>
      <Path d="M16 36 L20 24 L30 20 L26 32 Z" fill={T.warn} opacity="0.85"/>
      <Path d="M30 16 L28 20" stroke={T.orange} strokeWidth="2" strokeLinecap="round"/>
      <Path d="M36 20 L32 22" stroke={T.orange} strokeWidth="2" strokeLinecap="round"/>
      <Path d="M34 28 L30 28" stroke={T.orange} strokeWidth="2" strokeLinecap="round"/>
      <Circle cx="22" cy="18" r="2" fill={T.pink}/>
      <Circle cx="34" cy="14" r="1.5" fill={T.blue}/>
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ParentQuestApproval({ navigation }) {
  const auth = getAuth();
  const parentUid = auth.currentUser?.uid;
  const [children, setChildren]           = useState([]);
  const [quests, setQuests]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedChild, setSelectedChild] = useState('all');

  // Yeh check karne k liye ke kon si screen active hai (is screen ka naam 'QuestList' assume kiya hai)
  const currentScreen = 'QuestList'; 

  useEffect(() => {
    if (!parentUid) { navigation.replace('ParentLogin'); return; }
    loadData();
  }, [parentUid]);

  const loadData = async () => {
    setLoading(true);
    const kids = await getLinkedChildren(parentUid);
    setChildren(kids);
    const allMissions = [];
    for (const kid of kids) {
      const missions = await getPendingMissions(kid.childUid);
      missions.forEach(m => allMissions.push({ ...m, childName: kid.name, childUid: kid.childUid, status: m.status || 'completed' }));
    }
    setQuests(allMissions);
    setLoading(false);
  };

  const handleApprove = async (quest) => {
    setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, status: 'approved' } : q));
    const result = await parentApproveMission(parentUid, quest.childUid, quest.id, true);
    if (result.success) {
      await notifyQuestApproved(quest.childUid, quest.title);
      Alert.alert('Approved!', `${quest.title} approved for ${quest.childName}. They will earn ${quest.xp} XP!`);
    } else {
      Alert.alert('Error', 'Could not save approval. Please try again.');
      setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, status: 'completed' } : q));
    }
  };

  const handleReject = async (quest) => {
    setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, status: 'rejected' } : q));
    const result = await parentApproveMission(parentUid, quest.childUid, quest.id, false);
    if (result.success) {
      await saveNotification(quest.childUid, {
        title: 'Quest Not Approved',
        body: `Your parent reviewed "${quest.title}". Please try again.`,
        type: 'quest_rejected',
        data: { questTitle: quest.title },
      });
    }
  };

  const filtered = selectedChild === 'all' ? quests : quests.filter(q => q.childUid === selectedChild);
  const pending  = filtered.filter(q => q.status === 'completed');
  const reviewed = filtered.filter(q => q.status === 'approved' || q.status === 'rejected');

  // Navigation Items Array
  const navItems = [
    { 
      l: 'Home', sc: 'Home',
      icon: (active) => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" 
            stroke={active ? T.accent : T.textMut} strokeWidth="2" strokeLinejoin="round"/>
          <Polyline points="9 22 9 12 15 12 15 22" 
            stroke={active ? T.accent : T.textMut} strokeWidth="2" strokeLinejoin="round"/>
        </Svg>
      )
    },
    { 
      l: 'Quests', sc: 'QuestList',
      icon: (active) => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" 
            stroke={active ? T.accent : T.textMut} strokeWidth="2" strokeLinejoin="round"/>
          <Polyline points="14 2 14 8 20 8" 
            stroke={active ? T.accent : T.textMut} strokeWidth="2" strokeLinejoin="round"/>
          <Path d="M9 13h6M9 17h4" 
            stroke={active ? T.accent : T.textMut} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      )
    },
    { 
      l: 'Profile', sc: 'ChildProfile',
      icon: (active) => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="8" r="4" 
            stroke={active ? T.accent : T.textMut} strokeWidth="2"/>
          <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" 
            stroke={active ? T.accent : T.textMut} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      )
    },
    { 
      l: 'Alerts', sc: 'Notifications',
      icon: (active) => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" 
            stroke={active ? T.accent : T.textMut} strokeWidth="2" strokeLinejoin="round"/>
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" 
            stroke={active ? T.accent : T.textMut} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      )
    },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Quest Approvals</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={loadData}>
          <Text style={{ fontSize: 16 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {children.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          <TouchableOpacity style={[s.filterChip, selectedChild === 'all' && s.filterActive]} onPress={() => setSelectedChild('all')}>
            <Text style={[s.filterTxt, selectedChild === 'all' && s.filterActiveTxt]}>All Children</Text>
          </TouchableOpacity>
          {children.map(c => (
            <TouchableOpacity key={c.childUid} style={[s.filterChip, selectedChild === c.childUid && s.filterActive]} onPress={() => setSelectedChild(c.childUid)}>
              <Text style={[s.filterTxt, selectedChild === c.childUid && s.filterActiveTxt]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={T.accent} />
          <Text style={s.loadingTxt}>Loading missions...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

          {/* No children linked */}
          {children.length === 0 && (
            <View style={s.emptyCard}>
              <LinkIcon />
              <Text style={s.emptyTitle}>No Children Linked</Text>
              <Text style={s.emptySub}>Link your child's account from Parent Dashboard first.</Text>
              <TouchableOpacity style={s.goBtn} onPress={() => navigation.navigate('ParentDashboard')}>
                <Text style={s.goBtnTxt}>Go to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <>
              <Text style={s.secTitle}>Waiting for Review ({pending.length})</Text>
              {pending.map(quest => (
                <View key={quest.id} style={s.questCard}>
                  <View style={s.questTop}>
                    <View style={s.questIconBox}>
                      <LeafQuestIcon />
                    </View>
                    <View style={s.questInfo}>
                      <Text style={s.questTitle}>{quest.title}</Text>
                      <Text style={s.questChild}>by {quest.childName}</Text>
                      <Text style={s.questXP}>{quest.xp} XP reward</Text>
                    </View>
                  </View>
                  <View style={s.btnRow}>
                    <TouchableOpacity style={s.rejectBtn} onPress={() => handleReject(quest)}>
                      <View style={s.btnInner}>
                        <RejectXIcon />
                        <Text style={s.rejectTxt}>Reject</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.approveBtn} onPress={() => handleApprove(quest)}>
                      <View style={s.btnInner}>
                        <ApproveCheckIcon />
                        <Text style={s.approveTxt}>Approve</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Reviewed */}
          {reviewed.length > 0 && (
            <>
              <Text style={s.secTitle}>Already Reviewed</Text>
              {reviewed.map(quest => (
                <View key={quest.id} style={[s.questCard, { opacity: 0.75 }]}>
                  <View style={s.questTop}>
                    <View style={s.questIconBox}>
                      <LeafQuestIcon />
                    </View>
                    <View style={s.questInfo}>
                      <Text style={s.questTitle}>{quest.title}</Text>
                      <Text style={s.questChild}>by {quest.childName}</Text>
                    </View>
                    <View style={[s.statusBadge, {
                      backgroundColor: quest.status === 'approved' ? T.success + '18' : T.danger + '18',
                      borderColor: quest.status === 'approved' ? T.success : T.danger
                    }]}>
                      <Text style={[s.statusTxt, { color: quest.status === 'approved' ? T.success : T.danger }]}>
                        {quest.status === 'approved' ? 'Approved' : 'Rejected'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* All caught up */}
          {children.length > 0 && pending.length === 0 && reviewed.length === 0 && (
            <View style={s.emptyCard}>
              <CelebrationIcon />
              <Text style={s.emptyTitle}>All caught up!</Text>
              <Text style={s.emptySub}>No missions pending review.</Text>
            </View>
          )}

        </ScrollView>
      )}

      {/* ─── Integrated Bottom Navigation Bar ────────────────────────────── */}
      <View style={s.navBar}>
        {navItems.map(n => {
          const isActive = n.sc === currentScreen;
          return (
            <TouchableOpacity key={n.l} style={s.navItem} onPress={() => navigation.navigate(n.sc)}>
              <View style={[s.navIconWrap, isActive && { backgroundColor: T.accent + '20' }]}>
                {n.icon(isActive)}
              </View>
              <Text style={[s.navLabel, { color: T.textMut }, isActive && { color: T.accent, fontWeight: '800' }]}>
                {n.l}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: T.bg },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 10 },
  backBtn:        { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: T.white, borderRadius: 12, borderWidth: 1.5, borderColor: T.border },
  backTxt:        { color: T.accent, fontWeight: '700', fontSize: 14 },
  headerTitle:    { flex: 1, color: T.text, fontSize: 20, fontWeight: '900' },
  refreshBtn:     { padding: 8 },
  filterScroll:   { maxHeight: 46, marginBottom: 10 },
  filterChip:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: T.white, borderWidth: 1.5, borderColor: T.border },
  filterActive:   { backgroundColor: T.accent, borderColor: T.accent },
  filterTxt:      { color: T.textMut, fontSize: 13, fontWeight: '700' },
  filterActiveTxt:{ color: T.white },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingTxt:     { color: T.textMut, marginTop: 12, fontSize: 14 },
  secTitle:       { color: T.text, fontSize: 16, fontWeight: '900', marginHorizontal: 20, marginTop: 16, marginBottom: 10 },
  questCard:      { backgroundColor: T.white, marginHorizontal: 20, borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: T.border, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  questTop:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  questIconBox:   { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  questInfo:      { flex: 1 },
  questTitle:     { color: T.text, fontSize: 15, fontWeight: '800' },
  questChild:     { color: T.textMut, fontSize: 12, marginTop: 2 },
  questXP:        { color: T.warn, fontSize: 12, fontWeight: '700', marginTop: 3 },
  btnRow:         { flexDirection: 'row', gap: 10 },
  btnInner:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rejectBtn:      { flex: 1, backgroundColor: T.danger + '12', borderRadius: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: T.danger + '55' },
  rejectTxt:      { color: T.danger, fontWeight: '800', fontSize: 14 },
  approveBtn:     { flex: 1, backgroundColor: T.success + '12', borderRadius: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: T.success + '55' },
  approveTxt:     { color: T.success, fontWeight: '800', fontSize: 14 },
  statusBadge:    { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1.5 },
  statusTxt:      { fontSize: 12, fontWeight: '700' },
  emptyCard:      { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 30 },
  emptyTitle:     { color: T.text, fontSize: 20, fontWeight: '900', marginTop: 12, marginBottom: 8 },
  emptySub:       { color: T.textMut, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  goBtn:          { backgroundColor: T.accent + '18', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, borderWidth: 1.5, borderColor: T.accent },
  goBtnTxt:       { color: T.accent, fontWeight: '800', fontSize: 14 },
  
  // Nav Bar Custom Styles
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: T.white,
    paddingVertical: 10,
    borderTopWidth: 1.5,
    borderColor: T.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIconWrap: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});