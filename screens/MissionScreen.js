// screens/MissionDetailScreen.js
// ─────────────────────────────────────────────
// EcoGuardian AI System (Mission Screen)
// CSC4101 · SZABIST University Project
//
// 🤖 Agent 2 → getMissionTips()
// 🤖 Agent 3 → verifyMissionCompletion()
// 💰 XP SYSTEM → addXP() Firestore update
// 👤 PROFILE SYSTEM → get updated profile after XP
// ✅ BUG FIXED VERSION
// ─────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';

import { getAuth } from "firebase/auth";
import {
  getMissionTips,
  verifyMissionCompletion
} from '../services/aiservice';

// BUG 2 FIX: use addXP from userService (single source of truth)
import { getUserProfile, addXP } from '../services/userService';

export default function MissionDetailScreen({ navigation, route }) {

  const { mission = {} } = route.params || {};
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const isMounted = useRef(true);
  const xpUpdated = useRef(false);

  const levelAnim = useRef(new Animated.Value(0)).current;

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpPopup, setXpPopup] = useState(null);

  // ISSUE 5 FIX: state for AI tips
  const [aiTip, setAiTip] = useState('');
  const [tipsLoading, setTipsLoading] = useState(true);

  const [userProfile, setUserProfile] = useState({
    xp: 0,
    level: 1,
    badge: "Beginner 🌱"
  });

  const [steps, setSteps] = useState(
    (mission.steps || [
      'Read mission briefing',
      'Complete eco action',
      'Take proof photo',
      'Submit mission'
    ]).map((text, index) => ({
      id: index + 1,
      text,
      done: false
    }))
  );

  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const allDone = steps.every(step => step.done);

  // ─────────────────────────────
  // SAFE MOUNT
  // ─────────────────────────────
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ─────────────────────────────
  // PROFILE LOAD
  // ─────────────────────────────
  const loadUserProfile = async () => {
    try {
      const data = await getUserProfile(userId);
      if (data && isMounted.current) setUserProfile(data);
    } catch (e) {
      console.log("PROFILE ERROR:", e.message);
    }
  };

  // ─────────────────────────────
  // LEVEL UP ANIMATION
  // ─────────────────────────────
  const triggerLevelUpAnimation = () => {
    levelAnim.setValue(0);

    Animated.spring(levelAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true
    }).start();

    setTimeout(() => {
      if (isMounted.current) setShowLevelUp(false);
    }, 2000);
  };

  // ─────────────────────────────
  // ISSUE 5 FIX: AI TIPS — fetch + display
  // ─────────────────────────────
  const loadAITips = async () => {
    try {
      setTipsLoading(true);
      const data = await getMissionTips(mission.title, mission.category);
      if (isMounted.current && data?.tips) {
        setAiTip(data.tips);
      }
    } catch (e) {
      console.log("TIPS ERROR:", e.message);
    } finally {
      if (isMounted.current) setTipsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadUserProfile();
    loadAITips();
  }, [userId, mission?.id]);

  // ─────────────────────────────
  // STEP TOGGLE
  // ─────────────────────────────
  const toggleStep = (id) => {
    if (verifyResult) return;

    setSteps(prev =>
      prev.map(step =>
        step.id === id ? { ...step, done: !step.done } : step
      )
    );
  };

  // ─────────────────────────────
  // ISSUE 8 FIX: Reset button works
  // ─────────────────────────────
  const resetMission = () => {
    setSteps(prev => prev.map(step => ({ ...step, done: false })));
    setVerifyResult(null);
    xpUpdated.current = false;
    setXpPopup(null);
    setShowLevelUp(false);
  };

  // ─────────────────────────────
  // BUG 2 FIX: VERIFY + XP via addXP only
  // ─────────────────────────────
  const handleVerify = async () => {

    if (!allDone || verifying) {
      Alert.alert("Incomplete Mission", "Complete all steps first.");
      return;
    }

    setVerifying(true);

    try {

      const result = await verifyMissionCompletion(
        mission.title,
        steps
      );

      if (!isMounted.current) return;

      setVerifyResult(result);

      if (result?.xpBonus > 0 && !xpUpdated.current) {

        xpUpdated.current = true;

        // BUG 2 FIX: use addXP() — single correct XP logic
        const updatedProfile = await addXP(userId, result.xpBonus);

        if (updatedProfile && isMounted.current) {

          const prevLevel = userProfile.level;
          setUserProfile(updatedProfile);

          // 🎉 XP POPUP
          setXpPopup(result.xpBonus);
          setTimeout(() => {
            if (isMounted.current) setXpPopup(null);
          }, 2000);

          // 🏆 LEVEL UP ANIMATION
          if (updatedProfile.level > prevLevel) {
            setShowLevelUp(true);
            triggerLevelUpAnimation();
          }

          // 🔄 HOME REFRESH SIGNAL
          navigation.setParams({
            xpUpdated: true,
            leaderboardRefresh: Date.now()
          });
        }
      }

    } catch (e) {
      setVerifyResult({
        verified: false,
        message: "Verification failed",
        xpBonus: 0
      });

    } finally {
      if (isMounted.current) setVerifying(false);
    }
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#052e16" />

      <ScrollView>

        {/* XP POPUP */}
        {xpPopup && (
          <View style={styles.xpPopup}>
            <Text style={styles.xpPopupText}>
              +{xpPopup} XP 🎉
            </Text>
          </View>
        )}

        {/* LEVEL UP ANIMATION */}
        {showLevelUp && (
          <Animated.View
            style={[
              styles.levelPopup,
              {
                opacity: levelAnim,
                transform: [
                  {
                    scale: levelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.levelPopupText}>
              🏆 LEVEL UP!
            </Text>
          </Animated.View>
        )}

        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.missionEmoji}>{mission.emoji}</Text>
          <Text style={styles.title}>{mission.title}</Text>
          <Text style={styles.desc}>{mission.desc}</Text>
        </View>

        {/* PROFILE */}
        <View style={styles.profileCard}>
          <Text style={styles.profileXP}>⚡ {userProfile.xp} XP</Text>
          <Text style={styles.profileBadge}>{userProfile.badge}</Text>
        </View>

        {/* ISSUE 5 FIX: AI TIPS CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤖 AI Eco Tip</Text>
          {tipsLoading ? (
            <ActivityIndicator color="#4ade80" size="small" />
          ) : (
            <Text style={styles.tipText}>{aiTip || 'Follow eco-friendly practices for this mission.'}</Text>
          )}
        </View>

        {/* STEPS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mission Steps</Text>

          {steps.map(step => (
            <TouchableOpacity
              key={step.id}
              onPress={() => toggleStep(step.id)}
              style={styles.step}
            >
              <Text style={{ color: step.done ? '#4ade80' : '#fff' }}>
                {step.done ? "✅" : "⬜"} {step.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* VERIFY */}
        <TouchableOpacity
          style={[styles.btn, !allDone && { opacity: 0.4 }]}
          onPress={handleVerify}
          disabled={!allDone || verifying}
        >
          {verifying ? (
            <ActivityIndicator color="#052e16" />
          ) : (
            <Text style={styles.btnText}>🚀 Submit Mission</Text>
          )}
        </TouchableOpacity>

        {/* RESULT */}
        {verifyResult && (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>
              {verifyResult.verified ? "✅ Verified!" : "❌ Failed"}
            </Text>

            <Text style={styles.resultMsg}>
              {verifyResult.message}
            </Text>

            {verifyResult.xpBonus > 0 && (
              <Text style={styles.rewardText}>
                +{verifyResult.xpBonus} XP Earned
              </Text>
            )}

            {/* ISSUE 8 FIX: Reset button visible after result */}
            <TouchableOpacity style={styles.resetBtn} onPress={resetMission}>
              <Text style={styles.resetText}>🔄 Try Another Mission</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────
// 🎨 STYLES
// ─────────────────────────────
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#052e16'
  },

  hero: {
    padding: 24,
    alignItems: 'center'
  },

  missionEmoji: {
    fontSize: 60,
    marginBottom: 10
  },

  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center'
  },

  desc: {
    color: '#d1d5db',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22
  },

  profileCard: {
    marginHorizontal: 20,
    backgroundColor: '#14532d',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  profileXP: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800'
  },

  profileBadge: {
    color: '#fcd34d',
    marginTop: 4,
    fontWeight: '700'
  },

  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    backgroundColor: '#14532d',
    borderRadius: 18,
  },

  cardTitle: {
    color: '#fff',
    marginBottom: 14,
    fontWeight: '800',
    fontSize: 16
  },

  tipText: {
    color: '#d1d5db',
    lineHeight: 22
  },

  step: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)'
  },

  btn: {
    backgroundColor: '#4ade80',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center'
  },

  btnText: {
    color: '#052e16',
    fontWeight: '800',
    fontSize: 16
  },

  resetBtn: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4ade80',
    alignItems: 'center'
  },

  resetText: {
    color: '#4ade80',
    fontWeight: '700'
  },

  result: {
    marginHorizontal: 20,
    backgroundColor: '#14532d',
    borderRadius: 18,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)'
  },

  resultTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8
  },

  resultMsg: {
    color: '#d1d5db',
    lineHeight: 22
  },

  rewardText: {
    color: '#4ade80',
    marginTop: 12,
    fontWeight: '800',
    fontSize: 16
  },

  xpPopup: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#4ade80',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    zIndex: 999,
    elevation: 10,
  },

  xpPopupText: {
    color: '#052e16',
    fontSize: 18,
    fontWeight: '900'
  },

  levelPopup: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    backgroundColor: '#fcd34d',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    zIndex: 999,
    elevation: 10,
  },

  levelPopupText: {
    color: '#052e16',
    fontSize: 18,
    fontWeight: '900'
  }

});
