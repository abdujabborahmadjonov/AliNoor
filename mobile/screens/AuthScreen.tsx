import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { T } from '../lib/theme'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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
    if (error) {
      setMessage(
        error.message.includes('Invalid login credentials')
          ? 'Incorrect email or password.'
          : error.message,
      )
    } else if (mode === 'up') {
      setMessage('Account created — you are in.')
    }
    setBusy(false)
  }

  return (
    <KeyboardAvoidingView
      style={s.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <Text style={s.brandRow}>
          <Text style={s.brand}>alinoor</Text>
          <Text style={s.hand}>  in the light</Text>
        </Text>
        <Text style={s.title}>
          {mode === 'in' ? 'Welcome back' : 'Create account'}
        </Text>

        <Text style={s.label}>EMAIL</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={T.faint}
        />
        <Text style={s.label}>PASSWORD</Text>
        <TextInput
          style={s.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={T.faint}
        />

        <TouchableOpacity style={s.primary} onPress={submit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={T.bg} />
          ) : (
            <Text style={s.primaryText}>
              {mode === 'in' ? 'Sign in' : 'Sign up'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode(mode === 'in' ? 'up' : 'in')}
          style={s.switchBtn}>
          <Text style={s.switchText}>
            {mode === 'in'
              ? 'No account yet? Sign up'
              : 'Have an account? Sign in'}
          </Text>
        </TouchableOpacity>

        {message && <Text style={s.message}>{message}</Text>}
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.bg, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 14,
    padding: 24,
  },
  brandRow: { textAlign: 'center', marginBottom: 18 },
  brand: { fontSize: 22, fontWeight: '700', color: T.ink },
  hand: { fontSize: 15, fontStyle: 'italic', color: T.ember },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: T.ink,
    textAlign: 'center',
    marginBottom: 22,
  },
  label: { fontSize: 10, letterSpacing: 1.4, color: T.mute, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: T.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: T.ink,
    marginBottom: 16,
    backgroundColor: T.panel,
  },
  primary: {
    backgroundColor: T.ink,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryText: { color: T.bg, fontWeight: '600', fontSize: 15 },
  switchBtn: { marginTop: 16, alignItems: 'center' },
  switchText: { color: T.ink3, fontSize: 13 },
  message: { marginTop: 14, textAlign: 'center', color: T.ink3, fontSize: 13 },
})
