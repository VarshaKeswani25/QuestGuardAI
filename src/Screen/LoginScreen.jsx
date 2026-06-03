import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { db } from '../../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { loginWithEmail, registerWithEmail, resetPassword } from '../../services/authService';
import { saveChildLinkCode } from '../../services/linkingService';
import { T } from '../theme';

// ─── CUTE ECO WARRIOR SHIELD VECTOR ILLUSTRATION ───────────────────
function EcoShieldIllustration({ color = '#10B981' }) {
  return (
    <Svg width="90" height="90" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill={`${color}15`} />
      <Path 
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
        fill={color} 
        stroke={T.white} 
        strokeWidth="1.5" 
        strokeLinejoin="round" />
      <Path 
        d="M12 6c-2.5 0-4.5 2-4.5 4.5 0 2.5 4.5 6.5 4.5 6.5s4.5-4 4.5-6.5C16.5 8 14.5 6 12 6z" 
        fill={T.white} />
      <Circle cx="12" cy="9.5" r="1.5" fill={color} />
    </Svg>
  );
}

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [age, setAge]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  
  // Custom states for handling fixed signup tracking
  const [showWelcome, setShowWelcome] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter email and password.'); 
      return;
    }
    
    setLoading(true);
    
    if (isLogin) {
      const r = await loginWithEmail(email.trim(), password);
      setLoading(false);
      if (r.success) {
        navigation.replace('Home');
      } else {
        Alert.alert('Login Failed', r.error);
      }
    } else {
      if (!name.trim()) { 
        setLoading(false); 
        Alert.alert('Missing Fields', 'Enter your name.'); 
        return; 
      }
      
      const currentSignUpName = name.trim();
      const r = await registerWithEmail(email.trim(), password, currentSignUpName, age);
      
      if (r.success) {
        // Save placeholder user profile config safely inside firestore database
        await setDoc(doc(db, 'users', r.user.uid), {
          name: r.name, age: parseInt(r.age) || 0, xp: 0, level: 1,
          badge: 'Beginner', streak: 0, completedMissions: 0,
          lastCompletedDate: '', createdAt: Date.now(), role: 'child',
        }, { merge: true });
        
        await saveChildLinkCode(r.user.uid, r.name);
        
        // Freezing state variables to bypass asynchronous input drops
        setRegisteredName(currentSignUpName);
        setLoading(false);
        
        // Explicitly open modal popup before redirecting to login view
        setTimeout(() => {
          setShowWelcome(true);
        }, 100);
        
      } else { 
        setLoading(false); 
        Alert.alert('Registration Failed', r.error); 
      }
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) { Alert.alert('Enter Email', 'Enter your email first.'); return; }
    const r = await resetPassword(email.trim());
    if (r.success) Alert.alert('Email Sent', 'Check your inbox!');
    else Alert.alert('Error', r.error);
  };

  const closeWelcomeAndProceed = () => {
    setShowWelcome(false);
    // Clear registration fields cleanly
    setName('');
    setAge('');
    // Switch navigation mode back to Login phase instead of Home redirection
    setIsLogin(true);
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={s.blobTop} />
          <Text style={s.deco1}>🌿</Text>
          <Text style={s.deco2}>🍃</Text>

          <View style={s.header}>
            <View style={s.logoBox}>
              <Text style={{ fontSize: 44 }}>🛡️</Text>
            </View>
            <Text style={s.title}>QuestGuard</Text>
            <Text style={s.subtitle}>Your eco adventure awaits!</Text>
          </View>

          <View style={s.tabs}>
            <TouchableOpacity style={[s.tab, isLogin && s.tabActive]} onPress={() => setIsLogin(true)}>
              <Text style={[s.tabTxt, isLogin && s.tabTxtActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tab, !isLogin && s.tabActive]} onPress={() => setIsLogin(false)}>
              <Text style={[s.tabTxt, !isLogin && s.tabTxtActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>{isLogin ? 'Welcome back!' : 'Join the mission!'}</Text>

            {!isLogin && (
              <>
                <Text style={s.label}>Your Name</Text>
                <TextInput style={s.input} placeholder="e.g. Ali Hassan" placeholderTextColor={T.textMut} value={name} onChangeText={setName} />
                <Text style={s.label}>Age</Text>
                <TextInput style={s.input} placeholder="Your age" placeholderTextColor={T.textMut} keyboardType="numeric" value={age} onChangeText={setAge} />
              </>
            )}

            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} placeholder="your@email.com" placeholderTextColor={T.textMut} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

            <Text style={s.label}>Password</Text>
            <View style={s.pwRow}>
              <TextInput 
                style={[s.input, { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]} 
                placeholder="Enter password" 
                placeholderTextColor={T.textMut} 
                secureTextEntry={!showPw} 
                value={password} 
                onChangeText={setPassword} 
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPw(!showPw)}>
                <Svg width="22" height="22" viewBox="0 0 24 24" stroke={T.textSub} strokeWidth="2" fill="none">
                  {showPw ? (
                    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  ) : (
                    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                  )}
                </Svg>
              </TouchableOpacity>
            </View>

            {isLogin && (
              <TouchableOpacity style={s.forgot} onPress={handleForgot}>
                <Text style={s.forgotTxt}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color={T.white} /> : <Text style={s.submitTxt}>{isLogin ? 'Sign In' : 'Create Account'}</Text>}
            </TouchableOpacity>
          </View>

          <View style={s.switchRow}>
            <Text style={s.switchTxt}>{isLogin ? "Don't have an account? " : 'Already have an account? '}</Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}><Text style={s.switchLink}>{isLogin ? 'Sign Up' : 'Login'}</Text></TouchableOpacity>
          </View>

          <View style={s.divRow}><View style={s.divLine} /><Text style={s.divTxt}>parents</Text><View style={s.divLine} /></View>
          
          <TouchableOpacity style={s.parentBtn} onPress={() => navigation.push('ParentLogin')}>
            <Svg width="22" height="22" viewBox="0 0 24 24">
              <Circle cx="12" cy="8" r="4" stroke={T.textSub} strokeWidth="2" fill="none"/>
              <Path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke={T.textSub} strokeWidth="2" fill="none"/>
            </Svg>
            <Text style={s.parentTxt}>Parent Dashboard</Text>
          </TouchableOpacity>

          <Text style={s.footer}>Safe for ages 7–16 · Protected by parents</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── FIXED POPUP POSITIONING WORKFLOW LAYER ─── */}
      <Modal transparent={true} visible={showWelcome} animationType="fade" onRequestClose={() => {}}>
        <View style={s.modalOverlay}>
          <View style={s.welcomeCard}>
            <View style={s.vectorWrapper}>
              <EcoShieldIllustration color={T.accent} />
            </View>
            <Text style={s.welcomeTitle}>Account Created!</Text>
            <Text style={s.welcomeSubtitle}>Welcome to QuestGuard, Eco-Warrior {registeredName || 'Hero'}!</Text>
            <Text style={s.welcomeDescription}>
              Your profiling is successful. Please log in with your email and password now to start your adventure, complete environmental objectives, and unlock rewards!
            </Text>
            <TouchableOpacity style={s.startBtn} onPress={closeWelcomeAndProceed}>
              <Text style={s.startBtnTxt}>Proceed to Login →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: T.bg },
  scroll:      { paddingHorizontal: 22, paddingBottom: 40 },
  blobTop:     { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: '#C8E6A0', opacity: 0.45 },
  deco1:       { position: 'absolute', top: 30, left: 10, fontSize: 36, opacity: 0.4 },
  deco2:       { position: 'absolute', top: 80, right: 14, fontSize: 28, opacity: 0.4 },
  header:      { alignItems: 'center', paddingTop: 48, paddingBottom: 28 },
  logoBox:     { width: 84, height: 84, backgroundColor: T.white, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: T.accent, marginBottom: 14, elevation: 6 },
  title:       { fontSize: 28, fontWeight: '900', color: T.text },
  subtitle:    { fontSize: 14, color: T.textSub, marginTop: 4, fontWeight: '600' },
  tabs:        { flexDirection: 'row', backgroundColor: T.white, borderRadius: 16, padding: 4, marginBottom: 20, borderWidth: 1.5, borderColor: T.border },
  tab:         { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive:   { backgroundColor: T.accent },
  tabTxt:      { color: T.textMut, fontWeight: '700', fontSize: 14 },
  tabTxtActive:{ color: T.white, fontWeight: '800' },
  card:        { backgroundColor: T.white, borderRadius: 24, padding: 22, borderWidth: 1.5, borderColor: T.border, elevation: 4 },
  cardTitle:   { fontSize: 20, fontWeight: '800', color: T.text, marginBottom: 18, textAlign: 'center' },
  label:       { fontSize: 13, fontWeight: '700', color: T.textSub, marginBottom: 6, marginTop: 10 },
  input:       { backgroundColor: T.bg, borderRadius: 14, borderWidth: 1.5, borderColor: T.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: T.text, marginBottom: 2 },
  pwRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: T.bg, borderRadius: 14, borderWidth: 1.5, borderColor: T.border, marginBottom: 2 },
  eyeBtn:      { padding: 12, justifyContent: 'center', alignItems: 'center' },
  forgot:      { alignSelf: 'flex-end', marginBottom: 16, marginTop: 6 },
  forgotTxt:   { color: T.accent, fontSize: 13, fontWeight: '700' },
  submitBtn:   { backgroundColor: T.accent, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
  submitTxt:   { color: T.white, fontSize: 16, fontWeight: '800' },
  switchRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: 18, alignItems: 'center' },
  switchTxt:   { color: T.textSub, fontSize: 14 },
  switchLink:  { color: T.accent, fontWeight: '800', fontSize: 14 },
  divRow:      { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 10 },
  divLine:     { flex: 1, height: 1, backgroundColor: T.border },
  divTxt:      { color: T.textMut, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  parentBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: T.white, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, borderWidth: 1.5, borderColor: T.border, gap: 10, marginBottom: 16 },
  parentTxt:   { flex: 1, color: T.textSub, fontWeight: '700', fontSize: 14 },
  footer:      { color: T.textMut, fontSize: 12, textAlign: 'center', marginTop: 4 },

  // Welcome Modal Layout Matrix
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcomeCard: { backgroundColor: T.white, borderRadius: 28, padding: 24, width: '100%', alignItems: 'center', borderWidth: 2, borderColor: T.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  vectorWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: '#A7F3D0' },
  welcomeTitle: { fontSize: 24, fontWeight: '900', color: T.text, marginBottom: 6 },
  welcomeSubtitle: { fontSize: 15, fontWeight: '700', color: T.accent, textAlign: 'center', marginBottom: 12 },
  welcomeDescription: { fontSize: 13, color: T.textSub, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8, marginBottom: 20 },
  startBtn: { backgroundColor: T.accent, borderRadius: 16, paddingVertical: 14, width: '100%', alignItems: 'center' },
  startBtnTxt: { color: T.white, fontSize: 16, fontWeight: '800' }
});