import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Alert, Animated, Image
} from 'react-native';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { getMissionTips, verifyMissionCompletion } from '../../services/aiservice';
import { getUserProfile, addXP } from '../../services/userService';
import { notifyXPEarned, notifyLevelUp } from '../../services/notificationService';
import { completeMission } from '../../services/missionService';
import { T } from '../theme';

const CAT_COLOR = {
  'All':           '#5BAD3E',
  'Carbon Garden': '#5BAD3E',
  'Clean Karachi': '#4AABDB',
  'Water Mission': '#4AABDB',
  'Heritage Quest':'#F9A825',
  'Air Watch':     '#9B7FD4',
};

// ── SVG Icons — same as HomeScreen ───────────────────────────────────────────
function MissionIcon({ civic_issue, color = '#5BAD3E', size = 36 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" };
  switch (civic_issue) {
    case 'waste':
    case 'home_cleanliness':
      return (
        <Svg {...p}>
          <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M19 6l-1 14H6L5 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M9 6V4h6v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'drainage':
    case 'water_conservation':
      return (
        <Svg {...p}>
          <Path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color + '22'}/>
          <Path d="M8 15c0 2.2 1.8 4 4 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'greening':
    case 'awareness':
      return (
        <Svg {...p}>
          <Line x1="12" y1="22" x2="12" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M12 11C12 11 7 9 5 5c4 0 7 2 7 6z" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
          <Path d="M12 15C12 15 17 13 19 9c-4 0-7 2-7 6z" fill={color + 'AA'} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        </Svg>
      );
    case 'recycling':
      return (
        <Svg {...p}>
          <Path d="M12 2l2.5 4H9.5L12 2z" fill={color}/>
          <Path d="M19.5 17l-2.5-4-2.5 4h5z" fill={color}/>
          <Path d="M4.5 17l2.5-4 2.5 4h-5z" fill={color + '99'}/>
          <Path d="M12 6C15.3 6 18 8.7 18 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M18 12C18 15.3 15.3 18 12 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Path d="M12 18C8.7 18 6 15.3 6 12C6 8.7 8.7 6 12 6" stroke={color + '99'} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'heat_island':
    case 'energy_saving':
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="4" fill={color + '33'} stroke={color} strokeWidth="2"/>
          <Line x1="12" y1="2"  x2="12" y2="4"  stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="12" y1="20" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="2"  y1="12" x2="4"  y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="20" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="4.93" y1="4.93" x2="6.34" y2="6.34" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="17.66" y1="17.66" x2="19.07" y2="19.07" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="4.93" y1="19.07" x2="6.34" y2="17.66" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="17.66" y1="6.34" x2="19.07" y2="4.93" stroke={color} strokeWidth="2" strokeLinecap="round"/>
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

function MissionIconHero({ civic_issue, category }) {
  const color = CAT_COLOR[category] || '#5BAD3E';
  return (
    <View style={[s.heroIconBox, { backgroundColor: color + '15', borderColor: color + '55' }]}>
      <MissionIcon civic_issue={civic_issue} color={color} size={56} />
    </View>
  );
}

export default function MissionScreen({ navigation, route }) {
  // ✅ tipPromise comes pre-fetched from HomeScreen
  const { mission = {}, tipPromise } = route.params || {};
  const auth = getAuth();
  const userId = (auth.currentUser && !auth.currentUser.isAnonymous) ? auth.currentUser.uid : null;

  const isMounted  = useRef(true);
  const xpUpdated  = useRef(false);
  const levelAnim  = useRef(new Animated.Value(0)).current;

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpPopup, setXpPopup]         = useState(null);
  const [aiTip, setAiTip]             = useState('');
  const [tipsLoading, setTipsLoading] = useState(true);
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage]   = useState(null);
  const [userProfile, setUserProfile] = useState({ xp: 0, level: 1, badge: 'Beginner' });
  const [steps, setSteps]             = useState(
    (mission.steps || ['Read mission briefing', 'Complete eco action', 'Take proof photo', 'Submit mission'])
      .map((text, i) => ({ id: i + 1, text, done: false }))
  );
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying]       = useState(false);

  const allDone      = steps.every(s => s.done);
  const doneCount    = steps.filter(s => s.done).length;
  const missionColor = CAT_COLOR[mission.category] || '#5BAD3E';

  // Theme object for Navbar
  const theme = {
    accent: T.accent || '#5BAD3E',
    textMut: T.textMut || '#888888'
  };

  useEffect(() => () => { isMounted.current = false; }, []);

  useEffect(() => {
    if (!userId) {
      Alert.alert('Not Logged In', 'Please log in.', [{ text: 'OK', onPress: () => navigation.replace('LoginScreen') }]);
      return;
    }

    getUserProfile(userId)
      .then(d => { if (d && isMounted.current) setUserProfile(d); })
      .catch(() => {});

    // ✅ Use pre-fetched tipPromise from HomeScreen if available, else fresh fetch
    const tipsCall = tipPromise || getMissionTips(mission.title, mission.category);
    tipsCall
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
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets?.length > 0) {
      type === 'before' ? setBeforeImage(result.assets[0].base64) : setAfterImage(result.assets[0].base64);
    }
  };

  const handleVerify = async () => {
    if (!allDone || !beforeImage || !afterImage) {
      Alert.alert('Incomplete', 'Complete all steps and take both photos first.');
      return;
    }
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
          if (updated.level > prevLevel) {
            setShowLevelUp(true);
            triggerLevelUp();
            notifyLevelUp(userId, updated.level, updated.badge);
          }
          notifyXPEarned(userId, result.xpBonus, mission.title || 'Eco Mission');
          if (mission?.id) completeMission(userId, mission.id, result.xpBonus);
          navigation.setParams({ xpUpdated: true, leaderboardRefresh: Date.now() });
        }
      }
    } catch (e) {
      setVerifyResult({ verified: false, message: 'AI verification failed. Please try again.', xpBonus: 0 });
    } finally {
      if (isMounted.current) setVerifying(false);
    }
  };

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
          <Text style={s.levelPopupTxt}>⚡ Level Up!</Text>
        </Animated.View>
      )}

      {/* HEADER */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('Home')}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={T.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
          <Text style={s.backTxt}>Back</Text>
        </TouchableOpacity>
        <View style={s.profilePill}>
          <Text style={s.profilePillTxt}>{userProfile.xp} XP · {userProfile.badge}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO — SVG icon instead of emoji */}
        <View style={s.hero}>
          <MissionIconHero civic_issue={mission.civic_issue || 'waste'} category={mission.category} />
          <Text style={s.heroTitle}>{mission.title || 'Eco Mission'}</Text>
          <Text style={s.heroDesc}>{mission.desc || 'Complete this eco mission to earn XP!'}</Text>
          <View style={s.heroChips}>
            <View style={[s.chip, { backgroundColor: missionColor + '18', borderColor: missionColor + '55' }]}>
              <MissionIcon civic_issue={mission.civic_issue} color={missionColor} size={13} />
              <Text style={[s.chipTxt, { color: missionColor }]}>{mission.category || 'Eco'}</Text>
            </View>
            <View style={s.chip}>
              <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  stroke={T.textMut} strokeWidth="2" strokeLinejoin="round"/>
              </Svg>
              <Text style={s.chipTxt}>{mission.difficulty || 'Easy'}</Text>
            </View>
            <View style={[s.chip, { backgroundColor: '#FF980018', borderColor: '#FF980055' }]}>
              <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={T.orange} strokeWidth="2" strokeLinejoin="round"/>
              </Svg>
              <Text style={[s.chipTxt, { color: T.orange }]}>+{mission.xp || 10} XP</Text>
            </View>
            <View style={[s.chip, {
              backgroundColor: mission.indoor ? '#F9A82518' : '#5BAD3E18',
              borderColor: mission.indoor ? '#F9A82555' : '#5BAD3E55'
            }]}>
              <Text style={[s.chipTxt, { color: mission.indoor ? '#F9A825' : '#5BAD3E' }]}>
                {mission.indoor ? '🏠 Indoor' : '🌿 Outdoor'}
              </Text>
            </View>
          </View>
        </View>

        {/* ECO TIP */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconBox, { backgroundColor: '#FF980018', borderColor: '#FF980055' }]}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke={T.orange} strokeWidth="2"/>
                <Path d="M12 16v-4M12 8h.01" stroke={T.orange} strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            </View>
            <Text style={s.cardTitle}>Eco Tip</Text>
          </View>
          {tipsLoading
            ? <ActivityIndicator color={T.accent} size="small" />
            : <Text style={s.tipTxt}>{aiTip || 'Follow eco-friendly practices for this mission.'}</Text>}
        </View>

        {/* CHECKLIST */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconBox, { backgroundColor: missionColor + '18', borderColor: missionColor + '55' }]}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="3" width="18" height="18" rx="3" stroke={missionColor} strokeWidth="2"/>
                <Path d="M8 12l3 3 5-5" stroke={missionColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>
            <Text style={s.cardTitle}>Checklist ({doneCount}/{steps.length})</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${(doneCount / steps.length) * 100}%`, backgroundColor: missionColor }]} />
          </View>
          {steps.map(step => (
            <TouchableOpacity
              key={step.id}
              style={[s.step, step.done && s.stepDoneRow]}
              onPress={() => {
                if (!verifyResult)
                  setSteps(prev => prev.map(st => st.id === step.id ? { ...st, done: !st.done } : st));
              }}
            >
              <View style={[s.checkbox, step.done && { backgroundColor: missionColor, borderColor: missionColor }]}>
                {step.done && (
                  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <Path d="M5 13l4 4L19 7" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                )}
              </View>
              <Text style={[s.stepTxt, step.done && s.stepTxtDone]}>{step.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BEFORE & AFTER PHOTOS */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconBox, { backgroundColor: '#9B7FD418', borderColor: '#9B7FD455' }]}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                  stroke="#9B7FD4" strokeWidth="2" strokeLinejoin="round"/>
                <Circle cx="12" cy="13" r="4" stroke="#9B7FD4" strokeWidth="2"/>
              </Svg>
            </View>
            <Text style={s.cardTitle}>Before & After Photos</Text>
          </View>
          <Text style={s.cardSub}>Take photos to verify your mission</Text>
          <View style={s.photoRow}>
            <TouchableOpacity
              style={[s.photoBox, beforeImage && { borderColor: missionColor, borderStyle: 'solid' }]}
              onPress={() => capturePhoto('before')}
            >
              {beforeImage ? (
                <Image source={{ uri: `data:image/jpeg;base64,${beforeImage}` }} style={s.preview} />
              ) : (
                <>
                  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                      stroke={T.textMut} strokeWidth="1.8" strokeLinejoin="round"/>
                    <Circle cx="12" cy="13" r="4" stroke={T.textMut} strokeWidth="1.8"/>
                  </Svg>
                  <Text style={s.photoLabel}>Before</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.photoBox, afterImage && { borderColor: missionColor, borderStyle: 'solid' }]}
              onPress={() => capturePhoto('after')}
            >
              {afterImage ? (
                <Image source={{ uri: `data:image/jpeg;base64,${afterImage}` }} style={s.preview} />
              ) : (
                <>
                  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                      stroke={T.textMut} strokeWidth="1.8" strokeLinejoin="round"/>
                    <Circle cx="12" cy="13" r="4" stroke={T.textMut} strokeWidth="1.8"/>
                    <Path d="M12 10v6M9 13h6" stroke={T.textMut} strokeWidth="1.8" strokeLinecap="round"/>
                  </Svg>
                  <Text style={s.photoLabel}>After</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[s.submitBtn, { backgroundColor: missionColor },
            (!allDone || !beforeImage || !afterImage || verifying) && s.submitBtnDisabled]}
          onPress={handleVerify}
          disabled={!allDone || !beforeImage || !afterImage || verifying}
        >
          {verifying ? (
            <ActivityIndicator color={T.white} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  fill={T.white + '33'} stroke={T.white} strokeWidth="2" strokeLinejoin="round"/>
                <Path d="M9 12l2 2 4-4" stroke={T.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={s.submitTxt}>Submit Mission</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* RESULT */}
        {verifyResult && (
          <View style={[s.result, { borderColor: verifyResult.verified ? T.accent : '#EF5350' }]}>
            <View style={s.resultHeader}>
              <View style={[s.resultIconBox, {
                backgroundColor: verifyResult.verified ? '#5BAD3E18' : '#EF535018',
                borderColor: verifyResult.verified ? '#5BAD3E55' : '#EF535055',
              }]}>
                {verifyResult.verified ? (
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                      fill="#5BAD3E33" stroke="#5BAD3E" strokeWidth="2" strokeLinejoin="round"/>
                    <Path d="M9 12l2 2 4-4" stroke="#5BAD3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                ) : (
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#EF5350" strokeWidth="2"/>
                    <Path d="M15 9l-6 6M9 9l6 6" stroke="#EF5350" strokeWidth="2" strokeLinecap="round"/>
                  </Svg>
                )}
              </View>
              <Text style={[s.resultTitle, { color: verifyResult.verified ? T.accent : '#EF5350' }]}>
                {verifyResult.verified ? 'Mission Complete! 🎉' : 'Not Verified'}
              </Text>
            </View>
            <Text style={s.resultMsg}>{verifyResult.message}</Text>
            {verifyResult.xpBonus > 0 && (
              <View style={s.rewardRow}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={T.orange} strokeWidth="2" strokeLinejoin="round"/>
                </Svg>
                <Text style={s.rewardTxt}>+{verifyResult.xpBonus} XP Earned!</Text>
              </View>
            )}
            <TouchableOpacity
              style={[s.resetBtn, { borderColor: missionColor }]}
              onPress={() => {
                setSteps(prev => prev.map(st => ({ ...st, done: false })));
                setVerifyResult(null);
                setBeforeImage(null);
                setAfterImage(null);
                xpUpdated.current = false;
                navigation.navigate('Home');
              }}
            >
              <Text style={[s.resetTxt, { color: missionColor }]}>Try Another Mission</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>

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
          // Setting active state true if it's Quests/Missions tab
          const active = n.sc === 'QuestList' || n.sc === 'Home' ? (n.sc === 'QuestList') : false;
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
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: T.bg },
  topBar:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12, gap: 10 },
  backBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 14, backgroundColor: T.white, borderWidth: 1.5, borderColor: T.border },
  backTxt:         { color: T.text, fontWeight: '700', fontSize: 14 },
  profilePill:     { flex: 1, backgroundColor: T.white, borderRadius: 14, paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1.5, borderColor: T.border },
  profilePillTxt:  { color: T.textSub, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  xpPopup:         { position: 'absolute', top: 110, alignSelf: 'center', width: '100%', alignItems: 'center', zIndex: 999 },
  xpPopupTxt:      { color: T.white, fontSize: 16, fontWeight: '900', backgroundColor: T.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, overflow: 'hidden' },
  levelPopup:      { position: 'absolute', top: 160, alignSelf: 'center', width: '100%', alignItems: 'center', zIndex: 999 },
  levelPopupTxt:   { color: T.white, fontSize: 16, fontWeight: '900', backgroundColor: T.orange, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, overflow: 'hidden' },
  hero:            { padding: 24, alignItems: 'center' },
  heroIconBox:     { width: 120, height: 120, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 20, elevation: 2 },
  heroTitle:       { fontSize: 24, color: T.text, fontWeight: '900', textAlign: 'center' },
  heroDesc:        { color: T.textSub, marginTop: 8, textAlign: 'center', lineHeight: 22, fontSize: 14 },
  heroChips:       { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  chip:            { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.white, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: T.border },
  chipTxt:         { color: T.textSub, fontSize: 12, fontWeight: '700' },
  card:            { marginHorizontal: 20, marginBottom: 14, padding: 18, backgroundColor: T.white, borderRadius: 22, borderWidth: 1.5, borderColor: T.border, elevation: 2 },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardIconBox:     { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  cardTitle:       { color: T.text, fontWeight: '800', fontSize: 16 },
  cardSub:         { color: T.textMut, fontSize: 12, marginBottom: 14 },
  tipTxt:          { color: T.textSub, lineHeight: 22, fontSize: 14 },
  progressBg:      { height: 8, backgroundColor: T.bg, borderRadius: 4, overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: T.border },
  progressFill:    { height: 8, borderRadius: 4 },
  step:            { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  stepDoneRow:     { opacity: 0.65 },
  checkbox:        { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: T.border, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg },
  stepTxt:         { color: T.text, flex: 1, fontSize: 14, fontWeight: '600' },
  stepTxtDone:     { color: T.textMut, textDecorationLine: 'line-through' },
  photoRow:        { flexDirection: 'row', gap: 12 },
  photoBox:        { flex: 1, height: 130, backgroundColor: T.bg, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: T.border, borderStyle: 'dashed' },
  photoLabel:      { color: T.textMut, fontSize: 12, marginTop: 6, fontWeight: '600' },
  preview:         { width: '100%', height: '100%', borderRadius: 14 },
  submitBtn:       { marginHorizontal: 20, marginTop: 10, padding: 16, borderRadius: 20, alignItems: 'center', elevation: 4 },
  submitBtnDisabled: { opacity: 0.4 },
  submitTxt:       { color: T.white, fontWeight: '800', fontSize: 16 },
  result:          { marginHorizontal: 20, backgroundColor: T.white, borderRadius: 22, padding: 20, marginTop: 10, borderWidth: 2 },
  resultHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  resultIconBox:   { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  resultTitle:     { fontSize: 18, fontWeight: '900' },
  resultMsg:       { color: T.textSub, lineHeight: 22, fontSize: 14 },
  rewardRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  rewardTxt:       { color: T.orange, fontWeight: '800', fontSize: 16 },
  resetBtn:        { marginTop: 14, padding: 14, borderRadius: 16, borderWidth: 1.5, alignItems: 'center' },
  resetTxt:        { fontWeight: '700', fontSize: 14 },
  
  // New Navbar Styles
  navBar:          { flexDirection: 'row', backgroundColor: T.white, borderTopWidth: 1.5, borderTopColor: T.border, paddingVertical: 10, justifyContent: 'space-around', alignItems: 'center' },
  navItem:         { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navIconWrap:     { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginBottom: 4 },
  navLabel:        { fontSize: 12, fontWeight: '600' }
});