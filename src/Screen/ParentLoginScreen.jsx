import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';
import { T } from '../theme';

// Firebase imports (As per your Dashboard integration)
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// ─── SVG Illustration ──────────────────────────────────────────
function ParentChildIllustration() {
  return (
    <Svg width="110" height="110" viewBox="0 0 110 110">
      <Circle cx="38" cy="28" r="14" fill="#FBBF24" />
      <Ellipse cx="38" cy="62" rx="18" ry="22" fill="#00D4FF" />
      <Path d="M20 55 Q10 65 14 75" stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <Circle cx="72" cy="52" r="10" fill="#FB7185" />
      <Ellipse cx="72" cy="74" rx="11" ry="14" fill="#A78BFA" />
      <Path d="M55 42 C55 39 52 37 52 40 C52 43 55 46 55 46 C55 46 58 43 58 40 C58 37 55 39 55 42Z" fill="#FB7185"/>
    </Svg>
  );
}

export default function ParentLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Custom states for handling successful signup alert popup flow
  const [showWelcome, setShowWelcome] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const auth = getAuth(); // Firebase Auth instance initialized

  const handleSubmit = async () => {
    // 1. Validation Check
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in your email and password.');
      return;
    }
    if (isSignUp && !name.trim()) {
      Alert.alert('Missing Field', 'Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // ─── SIGN UP LOGIC ───────────────────────────────────────
        const currentSignUpName = name.trim();
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // Update Firebase profile with user's full name
        await updateProfile(userCredential.user, {
          displayName: currentSignUpName
        });

        // Freeze the name in state and trigger welcome modal popup sequence
        setRegisteredName(currentSignUpName);
        setLoading(false);
        
        setTimeout(() => {
          setShowWelcome(true);
        }, 100);

      } else {
        // ─── LOGIN LOGIC ─────────────────────────────────────────
        await signInWithEmailAndPassword(auth, email.trim(), password);
        
        // Successfully authenticated, navigate to dashboard
        navigation.replace('ParentDashboard');
      }
    } catch (error) {
      console.log("Auth Error: ", error.message);
      
      // Clear or user-friendly error messages
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }

      Alert.alert('Authentication Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = () => {
    Alert.alert('Reset Password', 'Password reset link sent to your email.');
  };

  const closeWelcomeAndProceed = () => {
    setShowWelcome(false);
    // Clear registration specific fields smoothly
    setName('');
    // Switch navigation context back to Login mode 
    setIsSignUp(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}><ParentChildIllustration /></View>
            <Text style={styles.appTitle}>Parent Portal</Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, !isSignUp && styles.activeTab]} onPress={() => setIsSignUp(false)}>
              <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, isSignUp && styles.activeTab]} onPress={() => setIsSignUp(true)}>
              <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isSignUp ? 'Create New Account' : 'Welcome Back'}</Text>

            {isSignUp && (
              <>
                <Text style={styles.label}>Your Full Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor={T.textMut} />
              </>
            )}

            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="parent@example.com" placeholderTextColor={T.textMut} />
            
            <Text style={styles.label}>Password</Text>
            <View style={styles.pwRow}>
              <TextInput 
                style={[styles.input, { flex: 1, marginTop: 0, borderWidth: 0, backgroundColor: 'transparent' }]} 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={!showPw} 
                autoCapitalize="none"
                placeholder="••••••••"
                placeholderTextColor={T.textMut}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(!showPw)}>
                <Svg width="22" height="22" viewBox="0 0 24 24" stroke={T.textSub} strokeWidth="2" fill="none">
                  {showPw ? (
                    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  ) : (
                    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                  )}
                </Svg>
              </TouchableOpacity>
            </View>

            {!isSignUp && (
              <TouchableOpacity style={styles.forgotBtn} onPress={handleForgot}>
                <Text style={styles.forgotTxt}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color={T.white} /> : <Text style={styles.submitBtnText}>{isSignUp ? 'Create Account' : 'Enter Dashboard'}</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.childLoginLink} onPress={() => navigation.goBack()}>
            <Text style={styles.childLoginText}>Login as Child instead</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── SUCCESS POPUP MODAL COMPONENT FOR PARENTS ─── */}
      <Modal transparent={true} visible={showWelcome} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.welcomeCard}>
            <View style={styles.badgeWrapper}>
              <Text style={{ fontSize: 40 }}>🔑</Text>
            </View>
            <Text style={styles.welcomeTitle}>Account Created!</Text>
            <Text style={styles.welcomeSubtitle}>Welcome, {registeredName || 'Parent'}!</Text>
            <Text style={styles.welcomeDescription}>
              Your parent supervisor account has been setup successfully. Please sign in now with your login details to access the dashboard and monitor tracking metrics.
            </Text>
            <TouchableOpacity style={styles.proceedBtn} onPress={closeWelcomeAndProceed}>
              <Text style={styles.proceedBtnTxt}>Proceed to Login →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scrollContent: { padding: 22, paddingBottom: 40 },
  backBtn: { marginTop: 10, marginBottom: 10, padding: 10, backgroundColor: T.white, borderRadius: 10, alignSelf: 'flex-start', borderWidth: 1.5, borderColor: T.border },
  backBtnText: { color: T.accent, fontWeight: '700' },
  header: { alignItems: 'center', paddingVertical: 20 },
  iconContainer: { width: 110, height: 110, backgroundColor: T.white, borderRadius: 55, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: T.accent },
  appTitle: { fontSize: 24, fontWeight: '900', color: T.text, marginTop: 15 },
  tabContainer: { flexDirection: 'row', backgroundColor: T.white, borderRadius: 16, padding: 4, marginBottom: 16, borderWidth: 1.5, borderColor: T.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: T.accent },
  tabText: { color: T.textMut, fontWeight: '700' },
  activeTabText: { color: T.white, fontWeight: '800' },
  card: { backgroundColor: T.white, borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: T.border },
  cardTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '700', color: T.textSub, marginTop: 10 },
  input: { backgroundColor: T.bg, borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1.5, borderColor: T.border, marginTop: 5, color: T.text },
  pwRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, backgroundColor: T.bg, borderRadius: 14, borderWidth: 1.5, borderColor: T.border },
  eyeBtn: { padding: 12, backgroundColor: 'transparent' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 10 },
  forgotTxt: { color: T.accent, fontWeight: '700', fontSize: 13 },
  submitBtn: { backgroundColor: T.accent, borderRadius: 16, padding: 15, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: T.white, fontSize: 16, fontWeight: '800' },
  childLoginLink: { alignItems: 'center', marginTop: 20 },
  childLoginText: { color: T.orange, fontSize: 14, fontWeight: '700' },

  // Native Modal Style Block Matrix
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcomeCard: { backgroundColor: T.white, borderRadius: 28, padding: 24, width: '100%', alignItems: 'center', borderWidth: 2, borderColor: T.border, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  badgeWrapper: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: '#FDE68A' },
  welcomeTitle: { fontSize: 24, fontWeight: '900', color: T.text, marginBottom: 4 },
  welcomeSubtitle: { fontSize: 16, fontWeight: '700', color: T.accent, textAlign: 'center', marginBottom: 12 },
  welcomeDescription: { fontSize: 14, color: T.textSub, textAlign: 'center', lineHeight: 20, paddingHorizontal: 6, marginBottom: 22 },
  proceedBtn: { backgroundColor: T.accent, borderRadius: 16, paddingVertical: 14, width: '100%', alignItems: 'center' },
  proceedBtnTxt: { color: T.white, fontSize: 16, fontWeight: '800' }
});