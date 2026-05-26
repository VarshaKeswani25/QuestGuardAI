import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar,
} from 'react-native';

type NavigationProp = {
  navigate: (screen: string) => void;
  push: (screen: string) => void;
  back: () => void;
};

export default function ParentLoginScreen({ navigation }: { navigation: NavigationProp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [childCode, setChildCode] = useState('');

  const handleSubmit = () => {
    navigation.push('ParentDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>👨‍👩‍👧</Text>
            </View>
            <Text style={styles.appTitle}>Parent Portal</Text>
            <Text style={styles.appSubtitle}>Monitor & Guide Your Child's Journey</Text>
          </View>

          {/* Features Row */}
          <View style={styles.featuresRow}>
            {[
              { emoji: '📍', label: 'Track Location' },
              { emoji: '✅', label: 'Approve Quests' },
              { emoji: '📊', label: 'View Progress' },
            ].map((f) => (
              <View key={f.label} style={styles.featureChip}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Tab Toggle */}
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, !isSignUp && styles.activeTab]} onPress={() => setIsSignUp(false)}>
              <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, isSignUp && styles.activeTab]} onPress={() => setIsSignUp(true)}>
              <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isSignUp ? '🚀 Setup Parent Account' : '🔐 Welcome Back, Parent!'}
            </Text>

            {isSignUp && (
              <>
                <Text style={styles.label}>Your Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ahmed Khan"
                  placeholderTextColor="#5A7A9A"
                  value={name}
                  onChangeText={setName}
                />
              </>
            )}

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="parent@email.com"
              placeholderTextColor="#5A7A9A"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#5A7A9A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {isSignUp && (
              <>
                <Text style={styles.label}>Child's Link Code (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ALEX-2024"
                  placeholderTextColor="#5A7A9A"
                  autoCapitalize="characters"
                  value={childCode}
                  onChangeText={setChildCode}
                />
                <Text style={styles.hintText}>💡 Ask your child for their link code to connect accounts</Text>
              </>
            )}

            {!isSignUp && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>
                {isSignUp ? '✨ Create Parent Account' : '🛡️ Enter Dashboard'}
              </Text>
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

          {/* Switch */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{isSignUp ? 'Already a parent? ' : "New here? "}</Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.switchLink}>{isSignUp ? 'Login' : 'Create Account'}</Text>
            </TouchableOpacity>
          </View>

          {/* Child login link */}
          <TouchableOpacity style={styles.childLoginLink} onPress={() => navigation.back()}>
            <Text style={styles.childLoginText}>👦 Login as Child instead</Text>
          </TouchableOpacity>

          <Text style={styles.secureNote}>🔒 256-bit encrypted · COPPA compliant · Safe for families</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginTop: 16, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: '#1E3A5F', borderRadius: 10, alignSelf: 'flex-start' },
  backBtnText: { color: '#00D4FF', fontWeight: '700', fontSize: 14 },
  header: { alignItems: 'center', paddingVertical: 24 },
  iconContainer: { width: 100, height: 100, backgroundColor: '#1E3A5F', borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#00D4FF', marginBottom: 14 },
  iconEmoji: { fontSize: 48 },
  appTitle: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  appSubtitle: { fontSize: 14, color: '#00D4FF', marginTop: 6, fontWeight: '600', textAlign: 'center' },
  featuresRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  featureChip: { backgroundColor: '#1A2C3D', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2A4A6A' },
  featureEmoji: { fontSize: 18, marginBottom: 3 },
  featureLabel: { color: '#8899AA', fontSize: 11, fontWeight: '600' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1E3A5F', borderRadius: 14, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#00D4FF' },
  tabText: { color: '#8899AA', fontWeight: '700', fontSize: 15 },
  activeTabText: { color: '#0D1B2A' },
  card: { backgroundColor: '#1A2C3D', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#2A4A6A' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#00D4FF', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#0D1B2A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#FFFFFF', borderWidth: 2, borderColor: '#2A4A6A' },
  hintText: { color: '#5A7A9A', fontSize: 12, marginTop: 6, lineHeight: 17 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { color: '#00D4FF', fontSize: 14, fontWeight: '600' },
  submitBtn: { backgroundColor: '#00D4FF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#0D1B2A', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: '#2A4A6A' },
  orText: { color: '#8899AA', fontWeight: '600', fontSize: 14 },
  googleBtn: { backgroundColor: '#0D1B2A', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: '#2A4A6A' },
  googleBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchText: { color: '#8899AA', fontSize: 15 },
  switchLink: { color: '#00D4FF', fontSize: 15, fontWeight: '800' },
  childLoginLink: { alignItems: 'center', marginTop: 14, paddingVertical: 10 },
  childLoginText: { color: '#FF6B35', fontSize: 14, fontWeight: '700' },
  secureNote: { color: '#5A7A9A', fontSize: 11, textAlign: 'center', marginTop: 16 },
});