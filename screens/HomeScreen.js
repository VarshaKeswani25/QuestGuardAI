// screens/HomeScreen.js
// AI-POWERED: Missions are generated dynamically by Claude (Anthropic API)
// Agent: Mission Generator — creates age-appropriate eco missions for Karachi children

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { generateMissions } from '../services/aiservice';

const CATEGORIES = ['All', 'Carbon Garden', 'Clean Karachi', 'Water Mission', 'Heritage Quest', 'Air Watch'];

const DIFF_COLORS = { Easy: '#4ade80', Medium: '#fbbf24', Hard: '#f87171' };
const TAG_COLORS  = { Daily: '#fcd34d', Weekly: '#93c5fd', Special: '#c4b5fd' };

export default function HomeScreen({ navigation }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [agentStatus, setAgentStatus] = useState('Initializing AI agent...');

  // ── AI Agent: generate missions on mount ──────────────────────
  const fetchMissions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setAgentStatus('Agent reasoning about Karachi eco-challenges...');
      await new Promise(r => setTimeout(r, 600)); // visual pause for agentic feel

      setAgentStatus('Generating personalized missions...');
      const data = await generateMissions(12, []);

      setMissions(data);
      setAgentStatus('Missions ready!');
    } catch (e) {
      setError(e.message);
      setAgentStatus('Agent failed to connect');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMissions(); }, [fetchMissions]);

  const filtered = activeCategory === 'All'
    ? missions
    : missions.filter(m => m.category === activeCategory);

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#052e16" />
        <View style={styles.agentLoader}>
          <Text style={styles.agentLoaderEmoji}>🤖</Text>
          <ActivityIndicator size="large" color="#4ade80" style={{ marginVertical: 16 }} />
          <Text style={styles.agentLoaderText}>{agentStatus}</Text>
          <Text style={styles.agentLoaderSub}>Agentic AI is reasoning about Karachi's{'\n'}environmental challenges for you...</Text>
        </View>
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#052e16" />
        <View style={styles.errorBox}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>AI Agent Offline</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <Text style={styles.errorHint}>Add your API key to .env:{'\n'}EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMissions()}>
            <Text style={styles.retryText}>🔄  Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#052e16" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Asalam-o-Alaikum! 👋</Text>
          <Text style={styles.heroName}>Young Guardian</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>⚡ 320 XP</Text>
        </View>
      </View>

      {/* Progress Banner */}
      <View style={styles.progressBanner}>
        <View style={styles.progressLeft}>
          <Text style={styles.progressTitle}>Today's Goal</Text>
          <Text style={styles.progressSub}>2 of 4 missions done</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>
        <View style={styles.progressRight}>
          <Text style={{ fontSize: 38 }}>🏆</Text>
          <Text style={styles.levelText}>Level 4</Text>
        </View>
      </View>

      {/* AI agent status chip */}
      <View style={styles.agentChip}>
        <Text style={styles.agentChipText}>🤖 AI generated {missions.length} missions for Karachi</Text>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.catScroll} contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mission list */}
      <ScrollView
        style={styles.missionList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMissions(true)}
            tintColor="#4ade80"
            title="AI regenerating missions..."
            titleColor="#86efac"
          />
        }
      >
        <Text style={styles.sectionTitle}>
          {activeCategory === 'All' ? 'All Missions' : activeCategory}
          <Text style={styles.sectionCount}> ({filtered.length})</Text>
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No missions in this category yet.{'\n'}Pull down to regenerate!</Text>
          </View>
        ) : (
          filtered.map((mission) => (
            <TouchableOpacity
              key={mission.id}
              style={styles.missionCard}
              onPress={() => navigation.navigate('MissionDetail', { mission })}
              activeOpacity={0.88}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <Text style={styles.missionEmoji}>{mission.emoji}</Text>
                </View>
                <View style={styles.missionInfo}>
                  <View style={styles.topRow}>
                    <Text style={styles.missionTitle} numberOfLines={1}>{mission.title}</Text>
                    <View style={[styles.tagPill, { backgroundColor: (TAG_COLORS[mission.tag] || '#ccc') + '22' }]}>
                      <Text style={[styles.tagText, { color: TAG_COLORS[mission.tag] || '#ccc' }]}>
                        {mission.tag}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.catLabel}>{mission.category}</Text>
                  <View style={styles.metaRow}>
                    <Text style={[styles.diffText, { color: DIFF_COLORS[mission.difficulty] || '#ccc' }]}>
                      ● {mission.difficulty}
                    </Text>
                    <Text style={styles.xpReward}>+{mission.xp} XP</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home' },
          { icon: '🗺️', label: 'Missions' },
          { icon: '🏅', label: 'Badges' },
          { icon: '👤', label: 'Profile' },
        ].map(item => (
          <TouchableOpacity key={item.label} style={styles.navItem}>
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#052e16' },

  // Loading
  loadingContainer: {
    flex: 1, backgroundColor: '#052e16',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  agentLoader: { alignItems: 'center' },
  agentLoaderEmoji: { fontSize: 60 },
  agentLoaderText: { color: '#4ade80', fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  agentLoaderSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Error
  errorBox: { alignItems: 'center', backgroundColor: '#14532d', borderRadius: 20, padding: 28, width: '100%' },
  errorEmoji: { fontSize: 44, marginBottom: 12 },
  errorTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  errorMsg: { color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  errorHint: { color: '#86efac', fontSize: 11, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  retryBtn: {
    backgroundColor: '#4ade80', paddingHorizontal: 32, paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: { color: '#052e16', fontWeight: '800', fontSize: 15 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 14,
  },
  greeting: { color: '#86efac', fontSize: 13, fontWeight: '600' },
  heroName: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  xpBadge: {
    backgroundColor: 'rgba(250,204,21,0.15)',
    borderWidth: 1, borderColor: 'rgba(250,204,21,0.3)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  xpText: { color: '#fcd34d', fontWeight: '800', fontSize: 14 },

  // Progress
  progressBanner: {
    marginHorizontal: 20, backgroundColor: '#14532d', borderRadius: 20,
    padding: 18, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.18)',
  },
  progressLeft: { flex: 1 },
  progressTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  progressSub: { color: '#86efac', fontSize: 12, marginTop: 2, marginBottom: 10 },
  progressBg: { height: 8, backgroundColor: 'rgba(74,222,128,0.15)', borderRadius: 4, width: '90%' },
  progressFill: { height: 8, backgroundColor: '#4ade80', borderRadius: 4 },
  progressRight: { alignItems: 'center', marginLeft: 16 },
  levelText: { color: '#fcd34d', fontWeight: '800', fontSize: 12, marginTop: 4 },

  // Agent chip
  agentChip: {
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.15)',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14,
  },
  agentChipText: { color: '#86efac', fontSize: 11, fontWeight: '700' },

  // Categories
  catScroll: { maxHeight: 46, marginBottom: 6 },
  catContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  catChipActive: { backgroundColor: '#4ade80', borderColor: '#4ade80' },
  catText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  catTextActive: { color: '#052e16', fontWeight: '800' },

  // Mission list
  missionList: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 10, marginBottom: 14, letterSpacing: -0.3 },
  sectionCount: { color: '#86efac', fontWeight: '600' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  // Mission card
  missionCard: {
    backgroundColor: '#14532d', borderRadius: 18, padding: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.12)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(74,222,128,0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  missionEmoji: { fontSize: 26 },
  missionInfo: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  missionTitle: { color: '#fff', fontWeight: '700', fontSize: 15, flex: 1 },
  tagPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 8 },
  tagText: { fontSize: 10, fontWeight: '700' },
  catLabel: { color: '#86efac', fontSize: 11, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  diffText: { fontSize: 12, fontWeight: '600' },
  xpReward: { color: '#fcd34d', fontSize: 12, fontWeight: '700' },
  arrow: { color: '#4ade80', fontSize: 26, marginLeft: 8 },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row', backgroundColor: '#021a0d',
    paddingVertical: 10, paddingHorizontal: 10,
    justifyContent: 'space-around',
    borderTopWidth: 1, borderTopColor: 'rgba(74,222,128,0.12)',
  },
  navItem: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12 },
  navIcon: { fontSize: 22 },
  navLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 3, fontWeight: '600' },
});