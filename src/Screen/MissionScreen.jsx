
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert, Animated, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { getMissionTips, verifyMissionCompletion } from '../../services/aiservice';
import { getUserProfile, addXP } from '../../services/userService';
import { notifyXPEarned, notifyLevelUp } from '../../services/notificationService';
import { completeMission } from '../../services/missionService';
import { T } from '../theme';

export default function MissionScreen({ navigation, route }) {
  const { mission = {} } = route.params || {};
  const auth = getAuth();
  const userId = (auth.currentUser && !auth.currentUser.isAnonymous) ? auth.currentUser.uid : null;

  const isMounted   = useRef(true);
  const xpUpdated   = useRef(false);
  const levelAnim   = useRef(new Animated.Value(0)).current;

  const [showLevelUp, setShowLevelUp]   = useState(false);
  const [xpPopup, setXpPopup]           = useState(null);
  const [aiTip, setAiTip]               = useState('');
  const [tipsLoading, setTipsLoading]   = useState(true);
  const [beforeImage, setBeforeImage]   = useState(null);
  const [afterImage, setAfterImage]     = useState(null);
  const [userProfile, setUserProfile]   = useState({ xp: 0, level: 1, badge: 'Beginner' });
  const [steps, setSteps]               = useState(
    (mission.steps || ['Read mission briefing', 'Complete eco action', 'Take proof photo', 'Submit mission'])
      .map((text, i) => ({ id: i+1, text, done: false }))
  );
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying]       = useState(false);

  const allDone = steps.every(s => s.done);

  useEffect(() => () => { isMounted.current = false; }, []);

  useEffect(() => {
    if (!userId) { Alert.alert('Not Logged In', 'Please log in.', [{ text: 'OK', onPress: () => navigation.replace('LoginScreen') }]); return; }
    getUserProfile(userId).then(d => { if (d && isMounted.current) setUserProfile(d); }).catch(() => {});
    getMissionTips(mission.title, mission.category)
      .then(d => { if (isMounted.current && d?.tips) setAiTip(d.tips); })
      .catch(() => {})
      .finally(() => { if (isMounted.current) setTipsLoading(false); });
  }, [userId]);

  const triggerLevelUp = () => {
    levelAnim.setValue(0);
    Animated.spring(levelAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
    setTimeout(() => { if (isMounted.current) setShowLevelUp(false); }, 3000);
  };

  const capturePhoto = async (type) => {
    if (verifyResult?.verified) { Alert.alert('Already Verified!', 'Mission already complete.'); return; }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission Denied', 'Camera permission required!'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.5, base64: true });
    if (!result.canceled && result.assets?.length > 0) {
      type === 'before' ? setBeforeImage(result.assets[0].base64) : setAfterImage(result.assets[0].base64);
    }
  };

  const handleVerify = async () => {
    if (!allDone || !beforeImage || !afterImage) { Alert.alert('Incomplete', 'Complete all steps and take both photos first.'); return; }
    setVerifying(true);
    try {
      const result = await verifyMissionCompletion(mission.title, steps, beforeImage, afterImage);
      if (!isMounted.current) return;
      setVerifyResult(result);
      if (result?.verified && result?.xpBonus > 0 && !xpUpdated.current) {
        xpUpdated.current = true;
        const updated = await addXP(userId, result.xpBonus);
        if (updated && isMounted.current) {
          const prevLevel = userProfile.level;
          setUserProfile(updated);
          setXpPopup(result.xpBonus);
          setTimeout(() => { if (isMounted.current) setXpPopup(null); }, 2500);
          if (updated.level > prevLevel) { setShowLevelUp(true); triggerLevelUp(); notifyLevelUp(userId, updated.level, updated.badge); }
          notifyXPEarned(userId, result.xpBonus, mission.title || 'Eco Mission');
          if (mission?.id) completeMission(userId, mission.id, result.xpBonus);
          navigation.setParams({ xpUpdated: true, leaderboardRefresh: Date.now() });
        }
      }
    } catch(e) {
      setVerifyResult({ verified: false, message: 'AI verification failed. Please try again.', xpBonus: 0 });
    } finally { if (isMounted.current) setVerifying(false); }
  };

  const doneCount = steps.filter(s => s.done).length;

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* XP POPUP */}
      {xpPopup && (
        <View style={s.xpPopup}>
          <Text style={s.xpPopupTxt}>+{xpPopup} XP earned!</Text>
        </View>
      )}
      {showLevelUp && (
        <Animated.View style={[s.levelPopup, { opacity: levelAnim }]}>
          <Text style={s.levelPopupTxt}>Level Up!</Text>
        </Animated.View>
      )}

      {/* HEADER */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>
        <View style={s.profilePill}>
          <Text style={s.profilePillTxt}>{userProfile.xp} XP · {userProfile.badge}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={s.hero}>
          <View style={s.heroEmoji}>
            <Text style={{ fontSize: 60 }}>{mission.emoji || '🌱'}</Text>
          </View>
          <Text style={s.heroTitle}>{mission.title || 'Eco Mission'}</Text>
          <Text style={s.heroDesc}>{mission.desc || 'Complete this eco mission to earn XP!'}</Text>
          <View style={s.heroChips}>
            <View style={s.chip}><Text style={s.chipTxt}>{mission.category || 'Eco'}</Text></View>
            <View style={s.chip}><Text style={s.chipTxt}>{mission.difficulty || 'Easy'}</Text></View>
            <View style={[s.chip, { backgroundColor: T.orange + '20', borderColor: T.orange }]}>
              <Text style={[s.chipTxt, { color: T.orange }]}>+{mission.xp || 10} XP</Text>
            </View>
          </View>
        </View>

        {/* AI TIP */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={{ fontSize: 18 }}>💡</Text>
            <Text style={s.cardTitle}>Eco Tip</Text>
          </View>
          {tipsLoading
            ? <ActivityIndicator color={T.accent} size="small" />
            : <Text style={s.tipTxt}>{aiTip || 'Follow eco-friendly practices for this mission.'}</Text>}
        </View>

        {/* STEPS */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={{ fontSize: 18 }}>📋</Text>
            <Text style={s.cardTitle}>Checklist ({doneCount}/{steps.length})</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${(doneCount / steps.length) * 100}%` }]} />
          </View>
          {steps.map(step => (
            <TouchableOpacity
              key={step.id}
              style={[s.step, step.done && s.stepDoneRow]}
              onPress={() => { if (!verifyResult) setSteps(prev => prev.map(st => st.id === step.id ? { ...st, done: !st.done } : st)); }}
            >
              <View style={[s.checkbox, step.done && s.checkboxDone]}>
                {step.done && <Text style={{ color: T.white, fontSize: 12, fontWeight: '900' }}>✓</Text>}
              </View>
              <Text style={[s.stepTxt, step.done && s.stepTxtDone]}>{step.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PHOTOS */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={{ fontSize: 18 }}>📸</Text>
            <Text style={s.cardTitle}>Before & After Photos</Text>
          </View>
          <Text style={s.cardSub}>Take photos to verify your mission</Text>
          <View style={s.photoRow}>
            <TouchableOpacity style={[s.photoBox, beforeImage && s.photoBoxDone]} onPress={() => capturePhoto('before')}>
              {beforeImage
                ? <Image source={{ uri: `data:image/jpeg;base64,${beforeImage}` }} style={s.preview} />
                : <><Text style={{ fontSize: 28 }}>📷</Text><Text style={s.photoLabel}>Before</Text></>}
            </TouchableOpacity>
            <TouchableOpacity style={[s.photoBox, afterImage && s.photoBoxDone]} onPress={() => capturePhoto('after')}>
              {afterImage
                ? <Image source={{ uri: `data:image/jpeg;base64,${afterImage}` }} style={s.preview} />
                : <><Text style={{ fontSize: 28 }}>📷</Text><Text style={s.photoLabel}>After</Text></>}
            </TouchableOpacity>
          </View>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[s.submitBtn, (!allDone || !beforeImage || !afterImage || verifying) && s.submitBtnDisabled]}
          onPress={handleVerify}
          disabled={!allDone || !beforeImage || !afterImage || verifying}
        >
          {verifying
            ? <ActivityIndicator color={T.white} />
            : <Text style={s.submitTxt}>Submit Mission</Text>}
        </TouchableOpacity>

        {/* RESULT */}
        {verifyResult && (
          <View style={[s.result, { borderColor: verifyResult.verified ? T.success : T.danger }]}>
            <Text style={s.resultTitle}>{verifyResult.verified ? 'Mission Complete!' : 'Not Verified'}</Text>
            <Text style={s.resultMsg}>{verifyResult.message}</Text>
            {verifyResult.xpBonus > 0 && <Text style={s.rewardTxt}>+{verifyResult.xpBonus} XP Earned!</Text>}
            <TouchableOpacity style={s.resetBtn} onPress={() => {
              setSteps(prev => prev.map(st => ({ ...st, done: false }))); setVerifyResult(null);
              setBeforeImage(null); setAfterImage(null); xpUpdated.current = false;
              navigation.navigate('Home');
            }}>
              <Text style={s.resetTxt}>Try Another Mission</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: T.bg },
  topBar:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12, gap: 10 },
  backBtn:           { paddingVertical: 9, paddingHorizontal: 16, borderRadius: 14, backgroundColor: T.white, borderWidth: 1.5, borderColor: T.border },
  backTxt:           { color: T.text, fontWeight: '700', fontSize: 14 },
  profilePill:       { flex: 1, backgroundColor: T.white, borderRadius: 14, paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1.5, borderColor: T.border },
  profilePillTxt:    { color: T.textSub, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  xpPopup:           { position: 'absolute', top: 110, alignSelf: 'center', width: '100%', alignItems: 'center', zIndex: 999 },
  xpPopupTxt:        { color: T.white, fontSize: 16, fontWeight: '900', backgroundColor: T.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, overflow: 'hidden' },
  levelPopup:        { position: 'absolute', top: 160, alignSelf: 'center', width: '100%', alignItems: 'center', zIndex: 999 },
  levelPopupTxt:     { color: T.white, fontSize: 16, fontWeight: '900', backgroundColor: T.orange, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, overflow: 'hidden' },
  hero:              { padding: 24, alignItems: 'center' },
  heroEmoji:         { width: 110, height: 110, backgroundColor: T.white, borderRadius: 55, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: T.accent, marginBottom: 16, shadowColor: T.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4 },
  heroTitle:         { fontSize: 24, color: T.text, fontWeight: '900', textAlign: 'center' },
  heroDesc:          { color: T.textSub, marginTop: 8, textAlign: 'center', lineHeight: 22, fontSize: 14 },
  heroChips:         { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  chip:              { backgroundColor: T.white, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5, borderColor: T.border },
  chipTxt:           { color: T.textSub, fontSize: 12, fontWeight: '700' },
  card:              { marginHorizontal: 20, marginBottom: 14, padding: 18, backgroundColor: T.white, borderRadius: 22, borderWidth: 1.5, borderColor: T.border, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  cardHeader:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle:         { color: T.text, fontWeight: '800', fontSize: 16 },
  cardSub:           { color: T.textMut, fontSize: 12, marginBottom: 14 },
  tipTxt:            { color: T.textSub, lineHeight: 22, fontSize: 14 },
  progressBg:        { height: 8, backgroundColor: T.bg, borderRadius: 4, overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: T.border },
  progressFill:      { height: 8, backgroundColor: T.accent, borderRadius: 4 },
  step:              { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  stepDoneRow:       { opacity: 0.65 },
  checkbox:          { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: T.border, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg },
  checkboxDone:      { backgroundColor: T.accent, borderColor: T.accent },
  stepTxt:           { color: T.text, flex: 1, fontSize: 14, fontWeight: '600' },
  stepTxtDone:       { color: T.textMut, textDecorationLine: 'line-through' },
  photoRow:          { flexDirection: 'row', gap: 12 },
  photoBox:          { flex: 1, height: 130, backgroundColor: T.bg, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: T.border, borderStyle: 'dashed' },
  photoBoxDone:      { borderColor: T.accent, borderStyle: 'solid' },
  photoLabel:        { color: T.textMut, fontSize: 12, marginTop: 6, fontWeight: '600' },
  preview:           { width: '100%', height: '100%', borderRadius: 14 },
  submitBtn:         { backgroundColor: T.accent, marginHorizontal: 20, marginTop: 10, padding: 16, borderRadius: 20, alignItems: 'center', shadowColor: T.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  submitBtnDisabled: { opacity: 0.4 },
  submitTxt:         { color: T.white, fontWeight: '800', fontSize: 16 },
  result:            { marginHorizontal: 20, backgroundColor: T.white, borderRadius: 22, padding: 20, marginTop: 10, borderWidth: 2 },
  resultTitle:       { color: T.text, fontSize: 18, fontWeight: '900', marginBottom: 8 },
  resultMsg:         { color: T.textSub, lineHeight: 22, fontSize: 14 },
  rewardTxt:         { color: T.accent, marginTop: 12, fontWeight: '800', fontSize: 16 },
  resetBtn:          { marginTop: 14, padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: T.accent, alignItems: 'center' },
  resetTxt:          { color: T.accent, fontWeight: '700', fontSize: 14 },
});



