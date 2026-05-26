import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar, Dimensions,
} from 'react-native';

type NavigationProp = {
  navigate: (screen: string) => void;
  push: (screen: string) => void;
  back: () => void;
};

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 320;

// Static location pins for the mock map
const LOCATION_PINS = [
  { id: '1', child: 'Alex', avatar: '🦁', x: width * 0.42, y: 140, label: 'Home 🏠', color: '#00D4FF', isActive: true },
  { id: '2', child: 'Sara', avatar: '🦊', x: width * 0.65, y: 100, label: 'School 🏫', color: '#FF6B35', isActive: false },
];

const SAFE_ZONES = [
  { id: '1', name: 'Home', emoji: '🏠', address: '123 Main Street', radius: '200m', status: 'active', child: 'Both' },
  { id: '2', name: 'School', emoji: '🏫', address: 'Bright Future Academy', radius: '300m', status: 'active', child: 'Both' },
  { id: '3', name: 'Grandma\'s House', emoji: '👵', address: '45 Oak Avenue', radius: '150m', status: 'active', child: 'Both' },
  { id: '4', name: 'Park', emoji: '🌳', address: 'City Central Park', radius: '500m', status: 'inactive', child: 'Alex' },
];

const LOCATION_HISTORY = [
  { id: '1', child: 'Alex', avatar: '🦁', place: 'Home', time: 'Now', emoji: '🏠', color: '#4ADE80' },
  { id: '2', child: 'Alex', avatar: '🦁', place: 'School', time: '3:15 PM', emoji: '🏫', color: '#00D4FF' },
  { id: '3', child: 'Alex', avatar: '🦁', place: 'Park', time: '1:30 PM', emoji: '🌳', color: '#FBBF24' },
  { id: '4', child: 'Sara', avatar: '🦊', place: 'School', time: 'Now', emoji: '🏫', color: '#4ADE80' },
  { id: '5', child: 'Sara', avatar: '🦊', place: 'Home', time: '8:00 AM', emoji: '🏠', color: '#00D4FF' },
];

const CHILDREN = ['All', 'Alex 🦁', 'Sara 🦊'];

export default function ParentMapScreen({ navigation }: { navigation: NavigationProp }) {
  const [selectedChild, setSelectedChild] = useState('All');
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📍 Live Map</Text>
        <TouchableOpacity
          style={[styles.trackingToggle, { borderColor: trackingEnabled ? '#4ADE80' : '#FB7185' }]}
          onPress={() => setTrackingEnabled(!trackingEnabled)}
        >
          <View style={[styles.trackingDot, { backgroundColor: trackingEnabled ? '#4ADE80' : '#FB7185' }]} />
          <Text style={[styles.trackingText, { color: trackingEnabled ? '#4ADE80' : '#FB7185' }]}>
            {trackingEnabled ? 'Live' : 'Off'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Child Filter */}
        <View style={styles.childFilter}>
          {CHILDREN.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.childFilterBtn, selectedChild === c && styles.childFilterActive]}
              onPress={() => setSelectedChild(c)}
            >
              <Text style={[styles.childFilterText, selectedChild === c && styles.childFilterActiveText]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Cards */}
        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { borderColor: '#00D4FF44' }]}>
            <Text style={styles.statusAvatar}>🦁</Text>
            <View style={styles.statusInfo}>
              <Text style={styles.statusName}>Alex</Text>
              <View style={styles.statusOnlineRow}>
                <View style={[styles.statusDot, { backgroundColor: '#4ADE80' }]} />
                <Text style={styles.statusPlace}>Home 🏠</Text>
              </View>
              <Text style={styles.statusTime}>Updated just now</Text>
            </View>
            <View style={[styles.statusSafe, { backgroundColor: '#4ADE8022', borderColor: '#4ADE8055' }]}>
              <Text style={styles.statusSafeText}>✅ Safe</Text>
            </View>
          </View>

          <View style={[styles.statusCard, { borderColor: '#FF6B3544' }]}>
            <Text style={styles.statusAvatar}>🦊</Text>
            <View style={styles.statusInfo}>
              <Text style={styles.statusName}>Sara</Text>
              <View style={styles.statusOnlineRow}>
                <View style={[styles.statusDot, { backgroundColor: '#FBBF24' }]} />
                <Text style={styles.statusPlace}>School 🏫</Text>
              </View>
              <Text style={styles.statusTime}>Updated 5 min ago</Text>
            </View>
            <View style={[styles.statusSafe, { backgroundColor: '#4ADE8022', borderColor: '#4ADE8055' }]}>
              <Text style={styles.statusSafeText}>✅ Safe</Text>
            </View>
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>🗺️ Live Locations</Text>
            <TouchableOpacity
              style={[styles.safeZoneToggle, { backgroundColor: showSafeZones ? '#00D4FF22' : '#1E3A5F' }]}
              onPress={() => setShowSafeZones(!showSafeZones)}
            >
              <Text style={[styles.safeZoneToggleText, { color: showSafeZones ? '#00D4FF' : '#8899AA' }]}>
                🔵 Safe Zones
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mock Map */}
          <View style={styles.mockMap}>
            {/* Map grid lines */}
            <View style={styles.gridLines}>
              {[0.25, 0.5, 0.75].map((p) => (
                <View key={p} style={[styles.gridH, { top: MAP_HEIGHT * p }]} />
              ))}
              {[0.25, 0.5, 0.75].map((p) => (
                <View key={p} style={[styles.gridV, { left: (width - 40) * p }]} />
              ))}
            </View>

            {/* Streets simulation */}
            <View style={[styles.street, { top: MAP_HEIGHT * 0.45, left: 0, right: 0, height: 8 }]} />
            <View style={[styles.street, { top: 0, bottom: 0, left: (width - 40) * 0.38, width: 8 }]} />
            <View style={[styles.street, { top: MAP_HEIGHT * 0.65, left: (width - 40) * 0.5, right: 0, height: 5 }]} />

            {/* Neighborhood blocks */}
            <View style={[styles.block, { top: 30, left: 20, width: 80, height: 55, backgroundColor: '#1E3A5F55' }]} />
            <View style={[styles.block, { top: 30, left: 140, width: 100, height: 55, backgroundColor: '#1E3A5F55' }]} />
            <View style={[styles.block, { top: 180, left: 20, width: 70, height: 60, backgroundColor: '#1E3A5F55' }]} />
            <View style={[styles.block, { top: 200, left: 160, width: 90, height: 50, backgroundColor: '#1E3A5F55' }]} />

            {/* Park */}
            <View style={[styles.block, { top: 60, right: 20, width: 60, height: 80, backgroundColor: '#4ADE8015', borderColor: '#4ADE8033', borderWidth: 1 }]}>
              <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 20 }}>🌳</Text>
            </View>

            {/* Safe zones (circles) */}
            {showSafeZones && (
              <>
                <View style={[styles.safeCircle, { top: 100, left: width * 0.3, width: 100, height: 100, borderRadius: 50, borderColor: '#00D4FF44' }]} />
                <View style={[styles.safeCircle, { top: 60, left: width * 0.52, width: 80, height: 80, borderRadius: 40, borderColor: '#FF6B3544' }]} />
              </>
            )}

            {/* Location Pins */}
            {LOCATION_PINS.map((pin) => (
              <TouchableOpacity
                key={pin.id}
                style={[styles.pin, { left: pin.x - 22, top: pin.y - 44 }]}
                onPress={() => setSelectedPin(selectedPin === pin.id ? null : pin.id)}
              >
                <View style={[styles.pinBubble, { backgroundColor: pin.color + '22', borderColor: pin.color }]}>
                  <Text style={styles.pinAvatar}>{pin.avatar}</Text>
                </View>
                <View style={[styles.pinTail, { backgroundColor: pin.color }]} />
                {selectedPin === pin.id && (
                  <View style={styles.pinPopup}>
                    <Text style={styles.pinPopupName}>{pin.child}</Text>
                    <Text style={styles.pinPopupLocation}>{pin.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Map Labels */}
            <Text style={[styles.mapLabel, { top: 50, left: 28 }]}>Residential</Text>
            <Text style={[styles.mapLabel, { top: 50, left: 148 }]}>Commercial</Text>
            <Text style={[styles.mapLabel, { top: 195, left: 28 }]}>Park Area</Text>
            <Text style={[styles.mapLabel, { top: 215, left: 170 }]}>School Zone</Text>

            {/* Compass */}
            <View style={styles.compass}>
              <Text style={styles.compassText}>N↑</Text>
            </View>

            {/* Live indicator */}
            {trackingEnabled && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControlBtn}>
              <Text style={styles.mapControlText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlBtn}>
              <Text style={styles.mapControlText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlBtn}>
              <Text style={styles.mapControlText}>🎯</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safe Zones */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔵 Safe Zones</Text>
          <TouchableOpacity style={styles.addZoneBtn}>
            <Text style={styles.addZoneBtnText}>+ Add Zone</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.safeZonesList}>
          {SAFE_ZONES.map((zone) => (
            <View key={zone.id} style={[styles.safeZoneCard, { opacity: zone.status === 'inactive' ? 0.5 : 1 }]}>
              <View style={styles.safeZoneEmoji}>
                <Text style={{ fontSize: 26 }}>{zone.emoji}</Text>
              </View>
              <View style={styles.safeZoneInfo}>
                <Text style={styles.safeZoneName}>{zone.name}</Text>
                <Text style={styles.safeZoneAddress}>{zone.address}</Text>
                <View style={styles.safeZoneMeta}>
                  <Text style={styles.safeZoneRadius}>📏 {zone.radius} radius</Text>
                  <Text style={styles.safeZoneChild}>👶 {zone.child}</Text>
                </View>
              </View>
              <View style={[styles.safeZoneStatus, { backgroundColor: zone.status === 'active' ? '#4ADE8022' : '#5A7A9A22', borderColor: zone.status === 'active' ? '#4ADE80' : '#5A7A9A' }]}>
                <Text style={[styles.safeZoneStatusText, { color: zone.status === 'active' ? '#4ADE80' : '#5A7A9A' }]}>
                  {zone.status === 'active' ? '🟢 On' : '⚫ Off'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Location History */}
        <Text style={styles.sectionTitle}>🕐 Today's Movement</Text>
        <View style={styles.historyList}>
          {LOCATION_HISTORY.map((h, idx) => (
            <View key={h.id} style={styles.historyItem}>
              <View style={styles.historyTimeline}>
                <View style={[styles.historyDot, { backgroundColor: h.color }]} />
                {idx < LOCATION_HISTORY.length - 1 && <View style={styles.historyLine} />}
              </View>
              <View style={styles.historyContent}>
                <View style={styles.historyTop}>
                  <Text style={styles.historyAvatar}>{h.avatar}</Text>
                  <Text style={styles.historyChild}>{h.child}</Text>
                  <Text style={styles.historyPlace}>{h.emoji} {h.place}</Text>
                  <Text style={styles.historyTime}>{h.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* SOS Alert Setting */}
        <View style={styles.sosCard}>
          <View style={styles.sosLeft}>
            <Text style={styles.sosEmoji}>🚨</Text>
            <View>
              <Text style={styles.sosTitle}>Emergency SOS</Text>
              <Text style={styles.sosSub}>Child can send SOS to notify you instantly</Text>
            </View>
          </View>
          <View style={styles.sosEnabled}>
            <Text style={styles.sosEnabledText}>✅ Enabled</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#1E3A5F', borderRadius: 10 },
  backBtnText: { color: '#00D4FF', fontWeight: '700', fontSize: 14 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  trackingToggle: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#1A2C3D', borderRadius: 20, borderWidth: 2 },
  trackingDot: { width: 8, height: 8, borderRadius: 4 },
  trackingText: { fontSize: 13, fontWeight: '800' },
  childFilter: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  childFilterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E3A5F' },
  childFilterActive: { backgroundColor: '#1A3050', borderWidth: 1, borderColor: '#00D4FF' },
  childFilterText: { color: '#8899AA', fontSize: 13, fontWeight: '700' },
  childFilterActiveText: { color: '#00D4FF' },
  statusRow: { paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  statusCard: { flexDirection: 'row', backgroundColor: '#1A2C3D', borderRadius: 16, padding: 14, gap: 12, alignItems: 'center', borderWidth: 1, marginBottom: 8 },
  statusAvatar: { fontSize: 36 },
  statusInfo: { flex: 1 },
  statusName: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  statusOnlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusPlace: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  statusTime: { color: '#5A7A9A', fontSize: 11, marginTop: 2 },
  statusSafe: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  statusSafeText: { color: '#4ADE80', fontSize: 12, fontWeight: '700' },
  mapContainer: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#2A4A6A', marginBottom: 20 },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A2C3D', paddingHorizontal: 14, paddingVertical: 10 },
  mapTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  safeZoneToggle: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  safeZoneToggleText: { fontSize: 12, fontWeight: '700' },
  mockMap: { height: MAP_HEIGHT, backgroundColor: '#0F2335', position: 'relative', overflow: 'hidden' },
  gridLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#1A3A5522' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#1A3A5522' },
  street: { position: 'absolute', backgroundColor: '#1E3A5F66' },
  block: { position: 'absolute', borderRadius: 6 },
  safeCircle: { position: 'absolute', borderWidth: 2, backgroundColor: '#00D4FF08' },
  pin: { position: 'absolute', alignItems: 'center' },
  pinBubble: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pinAvatar: { fontSize: 24 },
  pinTail: { width: 3, height: 10, borderRadius: 2 },
  pinPopup: { position: 'absolute', bottom: 60, backgroundColor: '#1A2C3D', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#2A4A6A', minWidth: 80, alignItems: 'center' },
  pinPopupName: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  pinPopupLocation: { color: '#8899AA', fontSize: 11 },
  mapLabel: { position: 'absolute', color: '#5A7A9A', fontSize: 9, fontWeight: '600' },
  compass: { position: 'absolute', top: 10, right: 10, backgroundColor: '#1A2C3D', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A4A6A' },
  compassText: { color: '#00D4FF', fontSize: 11, fontWeight: '800' },
  liveIndicator: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0D1B2A', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#4ADE8044' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  liveText: { color: '#4ADE80', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  mapControls: { position: 'absolute', right: 10, bottom: 10, gap: 6 },
  mapControlBtn: { width: 32, height: 32, backgroundColor: '#1A2C3D', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A4A6A' },
  mapControlText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginHorizontal: 20, marginBottom: 12, marginTop: 4 },
  addZoneBtn: { backgroundColor: '#00D4FF22', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#00D4FF55' },
  addZoneBtnText: { color: '#00D4FF', fontSize: 13, fontWeight: '700' },
  safeZonesList: { marginHorizontal: 20, gap: 8, marginBottom: 20 },
  safeZoneCard: { flexDirection: 'row', backgroundColor: '#1A2C3D', borderRadius: 14, padding: 14, gap: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2A4A6A' },
  safeZoneEmoji: { width: 48, height: 48, backgroundColor: '#0D1B2A', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  safeZoneInfo: { flex: 1 },
  safeZoneName: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  safeZoneAddress: { color: '#8899AA', fontSize: 12, marginTop: 2 },
  safeZoneMeta: { flexDirection: 'row', gap: 10, marginTop: 4 },
  safeZoneRadius: { color: '#5A7A9A', fontSize: 11 },
  safeZoneChild: { color: '#5A7A9A', fontSize: 11 },
  safeZoneStatus: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  safeZoneStatusText: { fontSize: 12, fontWeight: '700' },
  historyList: { marginHorizontal: 20, marginBottom: 20 },
  historyItem: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  historyTimeline: { alignItems: 'center', width: 16 },
  historyDot: { width: 12, height: 12, borderRadius: 6, marginTop: 10 },
  historyLine: { flex: 1, width: 2, backgroundColor: '#2A4A6A', marginTop: 2 },
  historyContent: { flex: 1, backgroundColor: '#1A2C3D', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: '#2A4A6A' },
  historyTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyAvatar: { fontSize: 18 },
  historyChild: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  historyPlace: { color: '#8899AA', fontSize: 13, flex: 1 },
  historyTime: { color: '#5A7A9A', fontSize: 12 },
  sosCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A1A1A', marginHorizontal: 20, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#FF6B3544' },
  sosLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sosEmoji: { fontSize: 32 },
  sosTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  sosSub: { color: '#8899AA', fontSize: 12, marginTop: 2 },
  sosEnabled: { backgroundColor: '#4ADE8022', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#4ADE8055' },
  sosEnabledText: { color: '#4ADE80', fontSize: 12, fontWeight: '700' },
});