// screens/parent/ParentMapScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { db } from '../../services/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore'; 
import { getLinkedChildren } from '../../services/linkingService';
import { T } from '../theme';

export default function ParentMapScreen({ navigation }) {
  const auth = getAuth();
  const parentUid = auth.currentUser?.uid;
  const [location, setLocation]             = useState(null);
  const [permissionGranted, setPermission]  = useState(false);
  const [trackingEnabled, setTracking]      = useState(false);
  const [loading, setLoading]               = useState(true);
  const [children, setChildren]             = useState([]);
  const [childLocations, setChildLocations] = useState({});
  const watchRef = useRef(null);

  useEffect(() => {
    requestLocationPermission(); loadChildren();
    return () => { if (watchRef.current) watchRef.current.remove(); };
  }, []);

  const requestLocationPermission = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setPermission(true);
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords);
    } else {
      Alert.alert('Location Permission Required', 'Please enable location access in Settings.', [{ text: 'OK' }]);
    }
    setLoading(false);
  };

  const loadChildren = async () => {
    if (!parentUid) return;
    const kids = await getLinkedChildren(parentUid);
    setChildren(kids);
    const locs = {};
    for (const kid of kids) {
      try {
        const locSnap = await getDocs(collection(db, 'users', kid.childUid, 'locations'));
        if (!locSnap.empty) locs[kid.childUid] = locSnap.docs[locSnap.docs.length - 1].data();
      } catch(e) {}
    }
    setChildLocations(locs);
  };

  const startTracking = async () => {
    if (!permissionGranted) { await requestLocationPermission(); return; }
    setTracking(true);
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 20 },
      async (loc) => {
        const coords = loc.coords; setLocation(coords);
        if (parentUid) await setDoc(doc(db, 'parents', parentUid, 'location', 'current'), { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy, updatedAt: Date.now() });
      }
    );
  };

  const stopTracking = () => {
    if (watchRef.current) { watchRef.current.remove(); watchRef.current = null; }
    setTracking(false);
  };

  const openInMaps = (lat, lng, label) => {
    Alert.alert(`📍 ${label}`, `${lat.toFixed(5)}, ${lng.toFixed(5)}\n\nOpen in Google Maps?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Maps', onPress: () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`) },
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Live Map</Text>
        <TouchableOpacity style={[s.trackBtn, { borderColor: trackingEnabled ? T.success : T.border }]} onPress={trackingEnabled ? stopTracking : startTracking}>
          <View style={[s.trackDot, { backgroundColor: trackingEnabled ? T.success : T.textMut }]} />
          <Text style={[s.trackTxt, { color: trackingEnabled ? T.success : T.textMut }]}>{trackingEnabled ? 'LIVE' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {!permissionGranted && (
          <View style={s.permBanner}>
            <Text style={s.permTitle}>Location Access Required</Text>
            <Text style={s.permSub}>Enable location permission in Settings to track children's locations.</Text>
            <TouchableOpacity style={s.permBtn} onPress={requestLocationPermission}>
              <Text style={s.permBtnTxt}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={s.secTitle}>My Location (Parent)</Text>
        {loading ? (
          <View style={s.loadingCard}>
            <ActivityIndicator color={T.accent} />
            <Text style={s.loadingTxt}>Getting GPS location...</Text>
          </View>
        ) : location ? (
          <TouchableOpacity style={s.locationCard} onPress={() => openInMaps(location.latitude, location.longitude, 'My Location')}>
            <View style={s.iconBadge}>
              <Text style={{ fontSize: 22 }}>👤</Text>
            </View>
            <View style={s.locInfo}>
              <Text style={s.locName}>You</Text>
              <Text style={s.locCoords}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
              <Text style={s.locAcc}>Accuracy: ±{Math.round(location.accuracy || 0)}m</Text>
            </View>
            <View style={s.liveTag}><Text style={s.liveTagTxt}>Live</Text></View>
          </TouchableOpacity>
        ) : (
          <View style={s.noLocCard}>
            <Text style={s.noLocTxt}>Location unavailable — enable GPS in Settings</Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.trackingBtn, { backgroundColor: trackingEnabled ? T.danger + '12' : T.success + '12', borderColor: trackingEnabled ? T.danger + '55' : T.success + '55' }]}
          onPress={trackingEnabled ? stopTracking : startTracking}
        >
          <Text style={[s.trackingBtnTxt, { color: trackingEnabled ? T.danger : T.success }]}>
            {trackingEnabled ? 'Stop Live Tracking' : 'Start Live Tracking'}
          </Text>
        </TouchableOpacity>

        <Text style={s.secTitle}>Children's Last Location</Text>
        {children.length === 0 ? (
          <View style={s.noChildCard}>
            <Text style={{ fontSize: 44, marginBottom: 10 }}>🔗</Text>
            <Text style={s.noChildTitle}>No Children Linked</Text>
            <Text style={s.noChildSub}>Enter your child's link code in Parent Dashboard.</Text>
            <TouchableOpacity style={s.linkBtn} onPress={() => navigation.navigate('ParentDashboard')}>
              <Text style={s.linkBtnTxt}>Link a Child</Text>
            </TouchableOpacity>
          </View>
        ) : children.map((child) => {
          const loc = childLocations[child.childUid];
          return (
            <TouchableOpacity key={child.childUid} style={s.locationCard} onPress={() => loc && openInMaps(loc.latitude, loc.longitude, child.name)}>
              <View style={s.iconBadge}>
                <Text style={{ fontSize: 22 }}>🦁</Text>
              </View>
              <View style={s.locInfo}>
                <Text style={s.locName}>{child.name}</Text>
                {loc ? (
                  <>
                    <Text style={s.locCoords}>{loc.latitude?.toFixed(5)}, {loc.longitude?.toFixed(5)}</Text>
                    <Text style={s.locAcc}>Updated: {new Date(loc.updatedAt).toLocaleTimeString()}</Text>
                  </>
                ) : <Text style={s.locAcc}>No location data yet</Text>}
              </View>
              {loc ? (
                <View style={s.liveTag}><Text style={s.liveTagTxt}>View</Text></View>
              ) : (
                <View style={[s.liveTag, { borderColor: T.border }]}><Text style={[s.liveTagTxt, { color: T.textMut }]}>—</Text></View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>How GPS Tracking Works</Text>
          <Text style={s.infoTxt}>
            1. Child opens QuestGuard app{'\n'}
            2. Their location is saved when they complete missions{'\n'}
            3. Parent sees last known location here{'\n'}
            4. Tap any location card to open Google Maps
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: T.bg },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 10 },
  backBtn:         { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: T.white, borderRadius: 12, borderWidth: 1.5, borderColor: T.border },
  backTxt:         { color: T.accent, fontWeight: '700', fontSize: 14 },
  headerTitle:     { flex: 1, color: T.text, fontSize: 20, fontWeight: '900' },
  trackBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: T.white, borderRadius: 20, borderWidth: 1.5 },
  trackDot:        { width: 8, height: 8, borderRadius: 4 },
  trackTxt:        { fontSize: 12, fontWeight: '800' },
  permBanner:      { backgroundColor: T.white, marginHorizontal: 20, marginBottom: 16, borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: T.orange + '55' },
  permTitle:       { color: T.orange, fontWeight: '800', fontSize: 15, marginBottom: 6 },
  permSub:         { color: T.textMut, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  permBtn:         { backgroundColor: T.orange, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  permBtnTxt:      { color: T.white, fontWeight: '800', fontSize: 14 },
  secTitle:        { paddingHorizontal: 20, marginBottom: 10, marginTop: 16, color: T.text, fontSize: 17, fontWeight: '900' },
  loadingCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.white, marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: T.border },
  loadingTxt:      { color: T.textMut, fontSize: 14 },
  locationCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, marginHorizontal: 20, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: T.border, gap: 12, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  iconBadge:       { width: 46, height: 46, borderRadius: 14, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.border },
  locInfo:         { flex: 1 },
  locName:         { color: T.text, fontSize: 16, fontWeight: '800' },
  locCoords:       { color: T.blue, fontSize: 12, marginTop: 3 },
  locAcc:          { color: T.textMut, fontSize: 11, marginTop: 2 },
  liveTag:         { borderWidth: 1.5, borderColor: T.success, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  liveTagTxt:      { color: T.success, fontSize: 12, fontWeight: '700' },
  noLocCard:       { backgroundColor: T.white, marginHorizontal: 20, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: T.orange + '44', marginBottom: 10 },
  noLocTxt:        { color: T.orange, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  trackingBtn:     { marginHorizontal: 20, borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, marginTop: 4, marginBottom: 4 },
  trackingBtnTxt:  { fontSize: 15, fontWeight: '800' },
  noChildCard:     { backgroundColor: T.white, marginHorizontal: 20, borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1.5, borderColor: T.border },
  noChildTitle:    { color: T.text, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  noChildSub:      { color: T.textMut, fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  linkBtn:         { backgroundColor: T.accent + '18', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1.5, borderColor: T.accent },
  linkBtnTxt:      { color: T.accent, fontWeight: '800', fontSize: 14 },
  infoCard:        { backgroundColor: T.white, marginHorizontal: 20, marginTop: 16, borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: T.border },
  infoTitle:       { color: T.text, fontWeight: '800', fontSize: 14, marginBottom: 8 },
  infoTxt:         { color: T.textMut, fontSize: 13, lineHeight: 20 },
});