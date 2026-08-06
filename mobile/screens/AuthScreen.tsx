import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'

// The app's front door: nobody browses without an account.
export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const friendly = (m: string) =>
    m.includes('Invalid login credentials')
      ? 'Incorrect email or password.'
      : m.includes('already registered')
        ? 'This email is already registered — sign in instead.'
        : m

  const submit = async () => {
    if (!email.trim() || !password) {
      setMessage('Enter your email and password.')
      return
    }
    setBusy(true)
    setMessage(null)
    const fn =
      mode === 'in'
        ? supabase.auth.signInWithPassword({ email: email.trim(), password })
        : supabase.auth.signUp({ email: email.trim(), password })
    const { error } = await fn
    if (error) setMessage(friendly(error.message))
    setBusy(false)
  }

  const google = async () => {
    setGoogleBusy(true)
    setMessage(null)
    // PKCE: supabase-js creates the verifier + URL; the browser handles
    // Google; the alinoor://auth deep link brings the session back.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'alinoor://auth', skipBrowserRedirect: true },
    })
    if (error) setMessage(error.message)
    else if (data.url) Linking.openURL(data.url)
    setGoogleBusy(false)
  }

  return (
    <KeyboardAvoidingView
      style={s.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled">
        {/* Identity */}
        <Text style={s.micro}>LIVE MINDFULLY · WRITE THOUGHTFULLY</Text>
        <Text style={s.wordmark}>alinoor</Text>
        <Text style={s.handTop}>in the light</Text>
        <Text style={s.tagline}>
          Prayers anchor the hours. Tasks find their places.{'\n'}Essays fill
          the quiet in between.
        </Text>

        {/* Auth card */}
        <View style={s.card}>
          <TouchableOpacity
            style={s.googleBtn}
            disabled={googleBusy || busy}
            onPress={google}>
            {googleBusy ? (
              <ActivityIndicator color={T.ink2} />
            ) : (
              <View style={s.googleRow}>
                <Text style={s.gBlue}>G</Text>
                <Text style={s.googleText}>  Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.divider} />
            <Text style={s.dividerText}>OR</Text>
            <View style={s.divider} />
          </View>

          <Text style={s.label}>EMAIL</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor={T.faint}
          />
          <Text style={s.label}>PASSWORD</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            placeholderTextColor={T.faint}
            onSubmitEditing={submit}
          />

          <TouchableOpacity
            style={s.primary}
            onPress={submit}
            disabled={busy || googleBusy}>
            {busy ? (
              <ActivityIndicator color={T.bg} />
            ) : (
              <Text style={s.primaryText}>
                {mode === 'in' ? 'Sign in' : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'in' ? 'up' : 'in')
              setMessage(null)
            }}
            style={s.switchBtn}>
            <Text style={s.switchText}>
              {mode === 'in'
                ? 'No account yet? Create one'
                : 'Have an account? Sign in'}
            </Text>
          </TouchableOpacity>

          {message && <Text style={s.message}>{message}</Text>}
        </View>

        <Text style={s.hand}>nūr — light, the kind you read by</Text>
        <Text style={s.footer}>© 2026 AliNoor</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 30,
  },
  micro: {
    fontSize: 10,
    letterSpacing: 2,
    color: T.mute,
    textAlign: 'center',
  },
  wordmark: {
    fontSize: 56,
    fontWeight: '700',
    color: T.ink,
    letterSpacing: -2,
    textAlign: 'center',
    marginTop: 14,
  },
  handTop: {
    fontSize: 17,
    fontStyle: 'italic',
    color: T.ember,
    textAlign: 'center',
    marginTop: 2,
  },
  tagline: {
    fontSize: 13.5,
    lineHeight: 21,
    color: T.ink3,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 26,
  },
  card: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 18,
    padding: 22,
    elevation: 2,
    shadowColor: '#14120f',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  googleBtn: {
    borderWidth: 1,
    borderColor: T.lineStrong,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: T.panel,
  },
  googleRow: { flexDirection: 'row', alignItems: 'center' },
  gBlue: { color: '#4285F4', fontSize: 17, fontWeight: '800' },
  googleText: { color: T.ink, fontSize: 15, fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  divider: { flex: 1, height: 1, backgroundColor: T.line },
  dividerText: { fontSize: 10, letterSpacing: 1.6, color: T.faint },
  label: { fontSize: 10, letterSpacing: 1.4, color: T.mute, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: T.ink,
    marginBottom: 14,
    backgroundColor: T.panel,
  },
  primary: {
    backgroundColor: T.ink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  primaryText: { color: T.bg, fontWeight: '700', fontSize: 15 },
  switchBtn: { marginTop: 14, alignItems: 'center' },
  switchText: { color: T.ink3, fontSize: 13 },
  message: {
    marginTop: 12,
    textAlign: 'center',
    color: T.ember,
    fontSize: 13,
  },
  hand: {
    fontSize: 18,
    fontStyle: 'italic',
    color: T.mute,
    textAlign: 'center',
    marginTop: 28,
    transform: [{ rotate: '-1deg' }],
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: T.faint,
    marginTop: 16,
  },
})
