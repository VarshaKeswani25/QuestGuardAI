import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, StatusBar, TextInput,
} from 'react-native';

type NavigationProp = {
  navigate: (screen: string) => void;
  push: (screen: string) => void;
  back: () => void;
};

type QuestStatus = 'pending' | 'approved' | 'rejected';

type Quest = {
  id: string;
  child: string;
  childAvatar: string;
  childAge: number;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  coins: number;
  submitted: string;
  category: string;
  difficulty: string;
  color: string;
  status: QuestStatus;
  progress?: string;
};

const INITIAL_QUESTS: Quest[] = [
  { id: '1', child: 'Alex', childAvatar: '🦁', childAge: 12, title: 'Creative Artist', description: 'Draw or paint something amazing and submit a photo!', emoji: '🎨', xp: 180, coins: 35, submitted: '1 hour ago', category: 'Creativity', difficulty: 'Medium', color: '#FBBF24', status: 'pending', progress: 'Submitted artwork photo' },
  { id: '2', child: 'Alex', childAvatar: '🦁', childAge: 12, title: 'Science Explorer', description: 'Watch a science video and write 5 interesting facts.', emoji: '🔬', xp: 250, coins: 50, submitted: '3 hours ago', category: 'Education', difficulty: 'Hard', color: '#FB7185', status: 'pending', progress: 'Notes submitted' },
  { id: '3', child: 'Sara', childAvatar: '🦊', childAge: 9, title: 'Fitness Champion', description: 'Complete a full exercise routine — jumping jacks, pushups & stretching!', emoji: '💪', xp: 160, coins: 30, submitted: 'Yesterday', category: 'Health', difficulty: 'Medium', color: '#F97316', status: 'pending', progress: '30 min workout done' },
  { id: '4', child: 'Alex', childAvatar: '🦁', childAge: 12, title: 'Math Master', description: 'Complete 10 math problems correctly.', emoji: '🔢', xp: 150, coins: 30, submitted: '2 days ago', category: 'Education', difficulty: 'Easy', color: '#FF6B35', status: 'approved' },
  { id: '5', child: 'Sara', childAvatar: '🦊', childAge: 9, title: 'Room Cleaner', description: 'Clean your room completely.', emoji: '🧹', xp: 110, coins: 20, submitted: '3 days ago', category: 'Habits', difficulty: 'Easy', color: '#38BDF8', status: 'approved' },
  { id: '6', child: 'Alex', childAvatar: '🦁', childAge: 12, title: 'Recycle Star', description: 'Recycle 5 items today.', emoji: '♻️', xp: 130, coins: 25, submitted: '4 days ago', category: 'Environment', difficulty: 'Easy', color: '#4ADE80', status: 'rejected' },
];

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];
const CHILDREN_FILTER = ['All Kids', 'Alex 🦁', 'Sara 🦊'];

function getDiffColor(d: string) {
  if (d === 'Easy') return { bg: '#4ADE8022', text: '#4ADE80', border: '#4ADE8044' };
  if (d === 'Medium') return { bg: '#FBBF2422', text: '#FBBF24', border: '#FBBF2444' };
  return { bg: '#FB718522', text: '#FB7185', border: '#FB718544' };
}

export default function ParentQuestApprovalScreen({ navigation }: { navigation: NavigationProp }) {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [childFilter, setChildFilter] = useState('All Kids');
  const [feedbackNote, setFeedbackNote] = useState<{ [key: string]: string }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setQuests((prev) => prev.map((q) => q.id === id ? { ...q, status: 'approved' as QuestStatus } : q));
  };

  const handleReject = (id: string) => {
    setQuests((prev) => prev.map((q) => q.id === id ? { ...q, status: 'rejected' as QuestStatus } : q));
  };

  const filtered = quests.filter((q) => {
    const statusMatch = activeFilter === 'All' || q.status === activeFilter.toLowerCase();
    const childMatch = childFilter === 'All Kids' || q.child === childFilter.split(' ')[0];
    return statusMatch && childMatch;
  });

  const pendingCount = quests.filter((q) => q.status === 'pending').length;

  const renderQuest = ({ item }: { item: Quest }) => {
    const isExpanded = expandedId === item.id;
    const diff = getDiffColor(item.difficulty);

    return (
      <TouchableOpacity
        style={[styles.questCard, { borderColor: item.status === 'pending' ? '#FF6B3555' : item.status === 'approved' ? '#4ADE8033' : '#FB718533' }]}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.85}
      >
        {/* Status strip */}
        <View style={[styles.statusStrip, {
          backgroundColor: item.status === 'pending' ? '#FF6B35' : item.status === 'approved' ? '#4ADE80' : '#FB7185'
        }]} />

        <View style={styles.questMain}>
          {/* Top Row */}
          <View style={styles.questTop}>
            <View style={[styles.emojiBox, { backgroundColor: item.color + '22', borderColor: item.color }]}>
              <Text style={styles.questEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.questMeta}>
              <View style={styles.questTitleRow}>
                <Text style={styles.questTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, {
                  backgroundColor: item.status === 'pending' ? '#FF6B3522' : item.status === 'approved' ? '#4ADE8022' : '#FB718522',
                  borderColor: item.status === 'pending' ? '#FF6B35' : item.status === 'approved' ? '#4ADE80' : '#FB7185',
                }]}>
                  <Text style={[styles.statusBadgeText, {
                    color: item.status === 'pending' ? '#FF6B35' : item.status === 'approved' ? '#4ADE80' : '#FB7185',
                  }]}>
                    {item.status === 'pending' ? '⏳ Pending' : item.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                  </Text>
                </View>
              </View>

              {/* Child Chip */}
              <View style={styles.childChip}>
                <Text style={styles.childChipAvatar}>{item.childAvatar}</Text>
                <Text style={styles.childChipName}>{item.child}</Text>
                <Text style={styles.childChipAge}>· Age {item.childAge}</Text>
              </View>

              <View style={styles.tagsRow}>
                <View style={[styles.diffTag, { backgroundColor: diff.bg, borderColor: diff.border }]}>
                  <Text style={[styles.diffTagText, { color: diff.text }]}>{item.difficulty}</Text>
                </View>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{item.category}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Rewards + Time */}
          <View style={styles.rewardsRow}>
            <Text style={styles.rewardXp}>⚡ {item.xp} XP</Text>
            <Text style={styles.rewardCoins}>🪙 {item.coins} coins</Text>
            <Text style={styles.submittedTime}>🕐 {item.submitted}</Text>
          </View>

          {/* Expanded */}
          {isExpanded && (
            <View style={styles.expandedSection}>
              <View style={styles.divider} />

              <Text style={styles.descLabel}>📋 Quest Description</Text>
              <Text style={styles.descText}>{item.description}</Text>

              {item.progress && (
                <>
                  <Text style={styles.descLabel}>📸 Child's Submission</Text>
                  <View style={styles.progressBox}>
                    <Text style={styles.progressText}>✅ {item.progress}</Text>
                  </View>
                </>
              )}

              {item.status === 'pending' && (
                <>
                  <Text style={styles.descLabel}>💬 Feedback Note (Optional)</Text>
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Write a note to your child..."
                    placeholderTextColor="#5A7A9A"
                    value={feedbackNote[item.id] || ''}
                    onChangeText={(t) => setFeedbackNote((prev) => ({ ...prev, [item.id]: t }))}
                    multiline
                    numberOfLines={2}
                  />

                  <View style={styles.actionBtns}>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                      <Text style={styles.rejectBtnText}>❌ Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                      <Text style={styles.approveBtnText}>✅ Approve Quest</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {item.status !== 'pending' && (
                <TouchableOpacity style={styles.undoBtn} onPress={() => setQuests((prev) => prev.map((q) => q.id === item.id ? { ...q, status: 'pending' as QuestStatus } : q))}>
                  <Text style={styles.undoBtnText}>↩️ Undo Decision</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={styles.tapHint}>{isExpanded ? '▲ Tap to collapse' : '▼ Tap to review'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Quest Approvals</Text>
          {pendingCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Pending', value: quests.filter(q => q.status === 'pending').length, color: '#FF6B35', emoji: '⏳' },
          { label: 'Approved', value: quests.filter(q => q.status === 'approved').length, color: '#4ADE80', emoji: '✅' },
          { label: 'Rejected', value: quests.filter(q => q.status === 'rejected').length, color: '#FB7185', emoji: '❌' },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryCard, { borderColor: s.color + '55' }]}>
            <Text style={styles.summaryEmoji}>{s.emoji}</Text>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Child Filter */}
      <View style={styles.childFilterRow}>
        {CHILDREN_FILTER.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.childFilterBtn, childFilter === c && styles.childFilterActive]}
            onPress={() => setChildFilter(c)}
          >
            <Text style={[styles.childFilterText, childFilter === c && styles.childFilterActiveText]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Filter */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.activeFilter]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>All clear!</Text>
          <Text style={styles.emptyText}>No quests in this category right now.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderQuest}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1E3A5F', borderRadius: 10 },
  backBtnText: { color: '#00D4FF', fontWeight: '700', fontSize: 14 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  headerBadge: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  headerBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: '#1A2C3D', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 2 },
  summaryEmoji: { fontSize: 20, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: '#8899AA', fontSize: 11, marginTop: 2, fontWeight: '600' },
  childFilterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  childFilterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1E3A5F' },
  childFilterActive: { backgroundColor: '#1A3050', borderWidth: 1, borderColor: '#00D4FF' },
  childFilterText: { color: '#8899AA', fontSize: 13, fontWeight: '700' },
  childFilterActiveText: { color: '#00D4FF' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 14 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E3A5F' },
  activeFilter: { backgroundColor: '#FF6B35' },
  filterText: { color: '#8899AA', fontSize: 13, fontWeight: '700' },
  activeFilterText: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  questCard: { backgroundColor: '#1A2C3D', borderRadius: 18, borderWidth: 1, overflow: 'hidden', flexDirection: 'row' },
  statusStrip: { width: 5 },
  questMain: { flex: 1, padding: 14 },
  questTop: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  emojiBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, flexShrink: 0 },
  questEmoji: { fontSize: 26 },
  questMeta: { flex: 1 },
  questTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 5 },
  questTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', flex: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, flexShrink: 0 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  childChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0D1B2A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 5 },
  childChipAvatar: { fontSize: 14 },
  childChipName: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  childChipAge: { color: '#8899AA', fontSize: 12 },
  tagsRow: { flexDirection: 'row', gap: 6 },
  diffTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  diffTagText: { fontSize: 11, fontWeight: '700' },
  categoryTag: { backgroundColor: '#1E3A5F', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  categoryTagText: { color: '#00D4FF', fontSize: 11, fontWeight: '600' },
  rewardsRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 6 },
  rewardXp: { color: '#FF6B35', fontWeight: '700', fontSize: 12 },
  rewardCoins: { color: '#FBBF24', fontWeight: '700', fontSize: 12 },
  submittedTime: { color: '#5A7A9A', fontSize: 11, marginLeft: 'auto' },
  tapHint: { color: '#3A5A7A', fontSize: 11, marginTop: 4, textAlign: 'center' },
  expandedSection: { marginTop: 4 },
  divider: { height: 1, backgroundColor: '#2A4A6A', marginVertical: 12 },
  descLabel: { color: '#00D4FF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  descText: { color: '#8899AA', fontSize: 13, lineHeight: 19, marginBottom: 12 },
  progressBox: { backgroundColor: '#4ADE8011', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#4ADE8033', marginBottom: 12 },
  progressText: { color: '#4ADE80', fontSize: 13, fontWeight: '600' },
  feedbackInput: { backgroundColor: '#0D1B2A', borderRadius: 10, padding: 12, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2A4A6A', marginBottom: 12, minHeight: 60, textAlignVertical: 'top' },
  actionBtns: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, backgroundColor: '#FB718522', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FB7185' },
  rejectBtnText: { color: '#FB7185', fontWeight: '700', fontSize: 14 },
  approveBtn: { flex: 2, backgroundColor: '#4ADE8022', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#4ADE80' },
  approveBtnText: { color: '#4ADE80', fontWeight: '800', fontSize: 14 },
  undoBtn: { backgroundColor: '#1E3A5F', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2A4A6A' },
  undoBtnText: { color: '#8899AA', fontWeight: '700', fontSize: 13 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  emptyText: { color: '#8899AA', fontSize: 14, textAlign: 'center' },
});