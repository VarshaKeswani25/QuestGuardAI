import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';

type NavigationProp = {
  navigate: (screen: string) => void;
  push: (screen: string) => void;
  back: () => void;
};

export default function LoginScreen({ navigation }: { navigation: NavigationProp }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = () => {
    navigation.push('QuestList');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <View style={styles.shieldIcon}>
              <Text style={styles.shieldEmoji}>🛡️</Text>
            </View>
            <Text style={styles.appTitle}>QuestGuard AI</Text>
            <Text style={styles.appSubtitle}>Your Adventure Awaits!</Text>
          </View>

          <View style={styles.starsRow}>
            {['⭐', '🌟', '⭐', '🌟', '⭐'].map((s, i) => (
              <Text key={i} style={styles.star}>{s}</Text>
            ))}
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, isLogin && styles.activeTab]} onPress={() => setIsLogin(true)}>
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, !isLogin && styles.activeTab]} onPress={() => setIsLogin(false)}>
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isLogin ? '👋 Welcome Back, Hero!' : '🚀 Join the Adventure!'}</Text>

            {!isLogin && (
              <>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#aaa"
                  value={name}
                  onChangeText={setName}
                />
                <Text style={styles.label}>Your Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="How old are you?"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </>
            )}

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {isLogin && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>{isLogin ? '🎮 Start Playing!' : '✨ Create Account!'}</Text>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.googleBtn}>
              <Text style={styles.googleBtnText}>🔵 Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{isLogin ? "Don't have an account? " : 'Already a hero? '}</Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchLink}>{isLogin ? 'Sign Up' : 'Login'}</Text>
            </TouchableOpacity>
          </View>

          {/* Parent Login Button — NEW */}
          <View style={styles.parentSection}>
            <View style={styles.parentDivider}>
              <View style={styles.parentDividerLine} />
              <Text style={styles.parentDividerText}>Are you a parent?</Text>
              <View style={styles.parentDividerLine} />
            </View>
            <TouchableOpacity style={styles.parentLoginBtn} onPress={() => navigation.push('ParentLogin')}>
              <Text style={styles.parentLoginBtnText}>👨‍👩‍👧 Parent Dashboard →</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.ageNote}>🔒 Safe for ages 7–16 • Protected by parents</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 10 },
  shieldIcon: {
    width: 90, height: 90, backgroundColor: '#1E3A5F', borderRadius: 45,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: '#00D4FF',
  },
  shieldEmoji: { fontSize: 44 },
  appTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1, textAlign: 'center' },
  appSubtitle: { fontSize: 16, color: '#00D4FF', marginTop: 4, fontWeight: '600', textAlign: 'center' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10, gap: 8 },
  star: { fontSize: 18 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1E3A5F', borderRadius: 14, padding: 4, marginVertical: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#FF6B35' },
  tabText: { color: '#8899AA', fontWeight: '700', fontSize: 16 },
  activeTabText: { color: '#FFFFFF' },
  card: { backgroundColor: '#1A2C3D', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#2A4A6A' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#00D4FF', marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#0D1B2A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#FFFFFF', borderWidth: 2, borderColor: '#2A4A6A' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
  submitBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: '#2A4A6A' },
  orText: { color: '#8899AA', fontWeight: '600', fontSize: 14 },
  googleBtn: { backgroundColor: '#0D1B2A', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: '#2A4A6A' },
  googleBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchText: { color: '#8899AA', fontSize: 15 },
  switchLink: { color: '#00D4FF', fontSize: 15, fontWeight: '800' },
  // Parent Section — NEW
  parentSection: { marginTop: 24 },
  parentDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  parentDividerLine: { flex: 1, height: 1, backgroundColor: '#2A4A6A' },
  parentDividerText: { color: '#5A7A9A', fontSize: 13, fontWeight: '600' },
  parentLoginBtn: { backgroundColor: '#1A2C3D', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: '#00D4FF44' },
  parentLoginBtnText: { color: '#00D4FF', fontSize: 16, fontWeight: '800' },
  ageNote: { color: '#5A7A9A', fontSize: 12, textAlign: 'center', marginTop: 16 },
});