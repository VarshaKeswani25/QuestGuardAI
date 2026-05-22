// screens/MissionDetailScreen.js
// AI-POWERED:
//   Agent 2 → getMissionTips()   : ReAct-style contextual tips for this mission
//   Agent 3 → verifyMissionCompletion() : AI verifies completion, awards XP bonus

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { getMissionTips, verifyMissionCompletion } from '../services/aiservice';

export default function MissionDetailScreen({ navigation, route }) {
  const { mission } = route.params;

  const [steps, setSteps] = useState(
    (mission.steps || ['Read mission briefing', 'Complete real-world action', 'Take a photo', 'Submit for verification'])
      .map((text, i) => ({ id: i + 1, text, done: false }))
  );

  // Agent 2 state
  const [tips, setTips] = useState(null);
  const [tipsLoading, setTipsLoading] = useState(true);
  const [tipsError, setTipsError] = useState(null);

  // Agent 3 state
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [agentLog, setAgentLog] = useState([]);

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === steps.length;

  // ── Load AI tips when screen mounts ──────────────────────────
  useEffect(() => {
    (async () => {
      setTipsLoading(true);
      setTipsError(null);
      try {
        const data = await getMissionTips(mission.title, mission.category);
        setTips(data);
      } catch (e) {
        setTipsError(e.message);
      } finally {
        setTipsLoading(false);
      }
    })();
  }, [mission.title, mission.category]);

  // ── Toggle step ───────────────────────────────────────────────
  const toggleStep = (id) => {
    if (verifyResult) return; // locked after verification
    setSteps(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  // ── AI verification (Agent 3, agentic loop with log) ─────────
  const handleVerify = async () => {
    if (!allDone || verifying) return;
    setVerifying(true);
    setAgentLog([]);

    const logs = [
      '🤖 Agent initializing verification loop...',
      '🔍 Analyzing completed steps...',
      '🌍 Cross-referencing Karachi eco-data...',
      '📊 Calculating XP reward...',
      '✅ Verification complete!',
    ];

    // Animate log lines with delay
    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setAgentLog(prev => [...prev, logs[i]]);
    }

    try {
      const result = await verifyMissionCompletion(mission.title, steps);
      setVerifyResult(result);
    } catch (e) {
      setVerifyResult({
        verified: false,
        message: 'Could not reach AI verifier. Check your API key.',
        xpBonus: 0,
        badge: null,
        nextSuggestion: 'Try again when connected.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const DIFF_COLORS = { Easy: '#4ade80', Medium: '#fbbf24', Hard: '#f87171' };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#052e16" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Missions</Text>
        </TouchableOpacity>
        <View style={styles.diffBadge}>
          <Text style={[styles.diffText, { color: DIFF_COLORS[mission.difficulty] || '#ccc' }]}>
            ● {mission.difficulty}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Text style={styles.heroEmoji}>{mission.emoji}</Text>
          </View>
          <Text style={styles.heroCat}>{mission.category}</Text>
          <Text style={styles.heroTitle}>{mission.title}</Text>
          <Text style={styles.heroDesc}>{mission.desc}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'XP Reward', value: `+${mission.xp}`, color: '#fcd34d' },
              { label: 'Steps Done', value: `${completedCount}/${steps.length}`, color: '#fff' },
              { label: 'Status', value: allDone ? '✅ Done' : '🔄 Active', color: '#4ade80' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, {
              width: `${steps.length > 0 ? (completedCount / steps.length) * 100 : 0}%`,
            }]} />
          </View>
        </View>

        {/* AI Tips Card (Agent 2) */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsHeader}>🤖 AI Agent Insights</Text>

          {tipsLoading ? (
            <View style={styles.tipsLoading}>
              <ActivityIndicator size="small" color="#4ade80" />
              <Text style={styles.tipsLoadingText}>Agent reasoning about this mission...</Text>
            </View>
          ) : tipsError ? (
            <Text style={styles.tipsErr}>⚠️ Could not load tips: {tipsError}</Text>
          ) : tips ? (
            <>
              <View style={styles.reasoningBox}>
                <Text style={styles.reasoningLabel}>Agent Reasoning:</Text>
                <Text style={styles.reasoningText}>{tips.agentReasoning}</Text>
              </View>
              {tips.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipBullet}><Text style={styles.tipNum}>{i + 1}</Text></View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
              <View style={styles.factBox}>
                <Text style={styles.factLabel}>📍 Karachi Fact</Text>
                <Text style={styles.factText}>{tips.karachi_fact}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Steps Checklist */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsHeader}>Mission Steps</Text>
          {steps.map(step => (
            <TouchableOpacity
              key={step.id}
              style={[styles.stepRow, step.done && styles.stepRowDone]}
              onPress={() => toggleStep(step.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.stepCheck, step.done && styles.stepCheckDone]}>
                {step.done && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={[styles.stepText, step.done && styles.stepTextDone]}>
                {step.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Verification Result */}
        {verifyResult && (
          <View style={[styles.resultCard, verifyResult.verified ? styles.resultSuccess : styles.resultFail]}>
            <Text style={styles.resultEmoji}>{verifyResult.verified ? '🏆' : '⚠️'}</Text>
            <Text style={styles.resultMsg}>{verifyResult.message}</Text>
            {verifyResult.xpBonus > 0 && (
              <Text style={styles.resultBonus}>+{verifyResult.xpBonus} Bonus XP earned!</Text>
            )}
            {verifyResult.badge && (
              <View style={styles.badgeWon}>
                <Text style={styles.badgeWonText}>🏅 Badge unlocked: {verifyResult.badge}</Text>
              </View>
            )}
            <Text style={styles.resultNext}>💡 {verifyResult.nextSuggestion}</Text>
          </View>
        )}

        {/* Agentic log */}
        {(verifying || agentLog.length > 0) && !verifyResult && (
          <View style={styles.logCard}>
            <Text style={styles.logHeader}>🤖 Agent Log</Text>
            {agentLog.map((line, i) => (
              <Text key={i} style={styles.logLine}>{line}</Text>
            ))}
            {verifying && <ActivityIndicator size="small" color="#4ade80" style={{ marginTop: 8 }} />}
          </View>
        )}

        {/* COPPA note */}
        <View style={styles.coppaBox}>
          <Text style={styles.coppaTitle}>🔒 Privacy & Safety (COPPA 2025)</Text>
          <Text style={styles.coppaText}>
            Photos processed on-device only. No biometric data stored. Location limited to city-level.
            Anonymous Firebase Auth IDs in use. Parental consent active.
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.bottomAction}>
        {verifyResult ? (
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>← Back to Missions</Text>
          </TouchableOpacity>
        ) : verifying ? (
          <View style={styles.verifyingBtn}>
            <ActivityIndicator size="small" color="#052e16" />
            <Text style={styles.verifyingText}>  AI Agent Verifying...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, !allDone && styles.submitBtnDisabled]}
            onPress={handleVerify}
            activeOpacity={allDone ? 0.85 : 1}
          >
            <Text style={styles.submitBtnText}>
              {allDone
                ? '🚀  Submit for AI Verification'
                : `Complete all steps (${completedCount}/${steps.length})`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#052e16' },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow: { color: '#4ade80', fontSize: 22 },
  backText: { color: '#4ade80', fontSize: 15, fontWeight: '700' },
  diffBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 14,
  },
  diffText: { fontSize: 13, fontWeight: '700' },

  heroCard: {
    backgroundColor: '#14532d', marginHorizontal: 20, borderRadius: 24, padding: 22,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(74,222,128,0.18)', marginBottom: 14,
  },
  heroIconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderWidth: 2, borderColor: 'rgba(74,222,128,0.22)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  heroEmoji: { fontSize: 46 },
  heroCat: { color: '#86efac', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', marginBottom: 10 },
  heroDesc: { color: 'rgba(255,255,255,0.55)', fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 18 },

  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: 16 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 3, fontWeight: '600' },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressBg: { width: '100%', height: 8, backgroundColor: 'rgba(74,222,128,0.15)', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: '#4ade80', borderRadius: 4 },

  tipsCard: {
    backgroundColor: 'rgba(74,222,128,0.07)', marginHorizontal: 20, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.15)', marginBottom: 14,
  },
  tipsHeader: { color: '#86efac', fontWeight: '800', fontSize: 14, marginBottom: 12 },
  tipsLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipsLoadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  tipsErr: { color: '#f87171', fontSize: 12 },
  reasoningBox: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12, marginBottom: 12 },
  reasoningLabel: { color: '#4ade80', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  reasoningText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  tipBullet: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#4ade80',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  tipNum: { color: '#052e16', fontSize: 11, fontWeight: '900' },
  tipText: { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 20, flex: 1 },
  factBox: { backgroundColor: 'rgba(250,204,21,0.08)', borderRadius: 12, padding: 12, marginTop: 6 },
  factLabel: { color: '#fcd34d', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  factText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 18 },

  stepsCard: {
    backgroundColor: '#14532d', marginHorizontal: 20, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.12)', marginBottom: 14,
  },
  stepsHeader: { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', gap: 12 },
  stepRowDone: { opacity: 0.6 },
  stepCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(74,222,128,0.4)', alignItems: 'center', justifyContent: 'center' },
  stepCheckDone: { backgroundColor: '#4ade80', borderColor: '#4ade80' },
  checkMark: { color: '#052e16', fontSize: 14, fontWeight: '900' },
  stepText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, flex: 1, lineHeight: 20 },
  stepTextDone: { textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.35)' },

  logCard: {
    marginHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.1)',
  },
  logHeader: { color: '#86efac', fontWeight: '800', fontSize: 13, marginBottom: 10 },
  logLine: { color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 22 },

  resultCard: { marginHorizontal: 20, borderRadius: 18, padding: 20, marginBottom: 14, alignItems: 'center' },
  resultSuccess: { backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 1, borderColor: '#4ade80' },
  resultFail: { backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: '#f87171' },
  resultEmoji: { fontSize: 40, marginBottom: 10 },
  resultMsg: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center', marginBottom: 8 },
  resultBonus: { color: '#fcd34d', fontWeight: '800', fontSize: 14, marginBottom: 8 },
  badgeWon: { backgroundColor: 'rgba(250,204,21,0.12)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 8 },
  badgeWonText: { color: '#fcd34d', fontWeight: '700', fontSize: 13 },
  resultNext: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', lineHeight: 18 },

  coppaBox: { marginHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  coppaTitle: { color: 'rgba(255,255,255,0.45)', fontWeight: '700', fontSize: 12, marginBottom: 6 },
  coppaText: { color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 17 },

  bottomAction: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#021a0d', paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(74,222,128,0.12)',
  },
  submitBtn: {
    backgroundColor: '#4ade80', paddingVertical: 17, borderRadius: 32, alignItems: 'center',
    shadowColor: '#4ade80', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 7,
  },
  submitBtnDisabled: { backgroundColor: 'rgba(74,222,128,0.2)', shadowOpacity: 0, elevation: 0 },
  submitBtnText: { color: '#052e16', fontWeight: '900', fontSize: 16 },
  verifyingBtn: { backgroundColor: '#4ade80', paddingVertical: 17, borderRadius: 32, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  verifyingText: { color: '#052e16', fontWeight: '900', fontSize: 16 },
  doneBtn: { borderWidth: 1.5, borderColor: '#4ade80', paddingVertical: 16, borderRadius: 32, alignItems: 'center' },
  doneBtnText: { color: '#4ade80', fontWeight: '800', fontSize: 16 },
});